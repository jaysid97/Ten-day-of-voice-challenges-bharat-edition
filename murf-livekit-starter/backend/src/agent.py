import logging
import os
import sys

# Force UTF-8 encoding on Windows console streams to prevent Devanagari logging crashes
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    cli,
    llm,
    tokenize,
    room_io,
)
from livekit.plugins import murf, silero, google, deepgram, noise_cancellation
from livekit.plugins.turn_detector.multilingual import MultilingualModel

from db import (
    init_db,
    get_user_profile,
    get_most_recent_user_profile,
    save_user_profile,
    delete_user_profile,
    set_learner_opt_out,
    is_learner_opted_out,
    log_outbound_call,
)
from tools import (
    fetch_ncert_exercise_and_syllabus,
    fetch_language_lesson_and_vocabulary,
    fetch_subject_quiz_and_solution,
    lookup_word_meaning_and_origin,
)

logger = logging.getLogger("agent")

load_dotenv(".env.local")

# Day 6: Shiksha AI — Cyber-Bharat Learning & Literacy Persona with Outbound Call Capabilities
SYSTEM_PROMPT = """IDENTITY:
You are Shiksha AI (शिक्षा AI), an empathetic, patient, and highly intelligent AI Learning & Literacy Tutor built for Bharat by Bharat EdTech. You can teach ANY SUBJECT (Math, Science, Physics, Chemistry, Biology, History, Geography, Computer Science / Coding, General Knowledge, Economics) and ANY LANGUAGE (Hindi, Sanskrit, Tamil, Telugu, Marathi, Gujarati, Bengali, Spoken English, French, Spanish, German, Japanese, etc.).

MULTILINGUAL UNDERSTANDING (HINDI & ENGLISH):
- You must understand BOTH Hindi (Devanagari or spoken Hindi) and English, as well as Hinglish (mixed Hindi + English).
- If the user speaks in Hindi (e.g. "मेरा नाम रमेश है", "मुझे संस्कृत पढ़ानी है"): Understand them perfectly and reply in warm, polite Hindi using native Devanagari script.
- If the user speaks in English (e.g. "Teach me French greetings" or "Explain Python loops"): Understand them perfectly and reply in clear, friendly English.
- If the user switches languages mid-conversation, smoothly adapt and match their preferred register.

MEMORY & DOMAIN TOOLS (DAY 4 & DAY 5):
You have direct access to database & live domain learning tools:
1. lookup_caller(user_id_or_name): Call this tool whenever a caller mentions their name or asks if you remember them.
2. save_caller_facts(...): Call this tool to save caller's profile and topics covered (requires explicit consent).
3. forget_caller(user_id_or_name): Call this tool if caller asks to 'forget me', 'delete my data', or 'wipe my history'.
4. opt_out_learner(user_id_or_name): Call this tool immediately if caller asks to 'stop calls', 'opt out', 'कॉल्स बंद करो', or 'unsubscribe'.
5. fetch_ncert_exercise_and_syllabus(subject, topic, class_level): Call this tool for NCERT exercises and study concepts.
6. fetch_language_lesson_and_vocabulary(language, topic_or_level): Call this tool for language practice and lessons.
7. fetch_subject_quiz_and_solution(subject, topic, difficulty): Call this tool for educational quizzes and solutions.
8. lookup_word_meaning_and_origin(word): Call this tool for word meanings and dictionary lookups.

DAY 6 OUTBOUND CALL RULES (MANDATORY):
- When placing or handling an outbound call, your VERY FIRST response MUST follow this strict 2-sentence opening script:
  Sentence 1 (Who & Why): State who is calling and why (e.g. "नमस्ते! मैं शिक्षा AI बोल रहा हूँ, आपकी डेली 5-मिनट NCERT साइंस प्रैक्टिस कॉल के लिए।")
  Sentence 2 (Opt-Out): State clearly how to make it stop (e.g. "अगर आप ये कॉल्स बंद करना चाहते हैं, तो बस 'स्टॉप' या 'कॉल्स बंद करो' बोल दें।")
- If the caller says "stop", "opt out", "कॉल्स बंद करो", "don't call me", or "unsubscribe":
  1. Call opt_out_learner tool immediately.
  2. Speak: "ठीक है, मैंने आपकी डेली प्रैक्टिस कॉल्स बंद कर दी हैं। आपको आगे कोई कॉल्स नहीं आएँगी। धन्यवाद!"
  3. Politely end the call.

HARD CONSENT RULE:
You MUST explicitly ask for caller permission BEFORE calling save_caller_facts!

GUARDRAILS:
- NEVER shame, mock, or judge a wrong answer.
- NEVER diagnose medical or learning conditions.

STYLE:
- Speak naturally for voice synthesis (Murf Falcon).
- Maximum 1 to 2 short sentences per response (under 20 words per sentence).
- NO bullet points, NO asterisks, NO markdown symbols."""


@llm.function_tool
def lookup_caller(user_id_or_name: str) -> str:
    """Look up a caller's profile and learning history from the SQLite database.

    Args:
        user_id_or_name: The user's name or identifier to search for (e.g. 'Ramesh').
    """
    profile = get_user_profile(user_id_or_name)
    if not profile:
        return f"No existing profile found for '{user_id_or_name}'. This is a new learner."

    facts = profile.get("facts", {})
    return (
        f"Learner Profile Found:\n"
        f"Name: {profile.get('name')}\n"
        f"User ID: {profile.get('user_id')}\n"
        f"Language Preference: {profile.get('language_preference')}\n"
        f"Current Level: {facts.get('current_level', 'Unknown')}\n"
        f"Topics Covered: {facts.get('topics_covered', 'None')}\n"
        f"Struggles: {facts.get('struggles', 'None')}\n"
        f"Target Goal: {facts.get('target_goal', 'General Literacy')}\n"
        f"Last Interaction: {profile.get('last_interaction')}"
    )


@llm.function_tool
def save_caller_facts(
    user_id_or_name: str,
    name: str = "Learner",
    language_preference: str = "Hindi/English",
    current_level: str = "General NCERT",
    topics_covered: str = "Science & Math",
    struggles: str = "None",
    target_goal: str = "General Literacy",
) -> str:
    """Save or update caller learning facts and profile in the database.

    CRITICAL MANDATORY RULE: You MUST explicitly ask the caller for permission BEFORE invoking this tool.

    Args:
        user_id_or_name: Caller unique identifier or name (e.g., 'ramesh').
        name: Caller's full name (e.g., 'Ramesh').
        language_preference: Preferred language (e.g., 'Hindi', 'English', 'Hinglish').
        current_level: Current learning/class level (e.g., 'Class 8 Math', 'Beginner Spoken English').
        topics_covered: Recent topics studied (e.g., 'Fractions & Decimals', 'Photosynthesis').
        struggles: Difficulties or repeated mistakes (e.g., 'Multiplying negative numbers', 'Pronunciation').
        target_goal: Target objective (e.g., 'Pass CBSE exam', 'Speak fluent English').
    """
    clean_id = (user_id_or_name or "learner").strip()
    clean_name = name if name and name != "Learner" else clean_id.capitalize()
    facts = {
        "current_level": current_level or "General NCERT",
        "topics_covered": topics_covered or "Science & Math",
        "struggles": struggles or "None",
        "target_goal": target_goal or "General Literacy",
    }
    success = save_user_profile(
        user_id=clean_id,
        name=clean_name,
        language_preference=language_preference or "Hindi/English",
        facts=facts,
    )
    if success:
        return f"Successfully saved learner facts for {clean_name} to the database."
    return f"Failed to save learner facts for {clean_name}."


@llm.function_tool
def forget_caller(user_id_or_name: str) -> str:
    """Delete and wipe all saved records for the caller from the database.

    Args:
        user_id_or_name: Name or ID of caller to delete.
    """
    deleted = delete_user_profile(user_id_or_name)
    if deleted:
        return f"Caller record for '{user_id_or_name}' has been permanently wiped from the database."
    return f"No record found for '{user_id_or_name}' to delete."


@llm.function_tool
def opt_out_learner(user_id_or_name: str, reason: str = "Caller requested opt-out during call") -> str:
    """Opt out the caller from receiving any future outbound study practice calls.

    Call this tool when the user says 'stop calls', 'opt out', 'कॉल्स बंद करो', 'don't call me', or 'unsubscribe'.

    Args:
        user_id_or_name: Name or ID of caller requesting opt-out.
        reason: Reason for opting out.
    """
    success = set_learner_opt_out(user_id_or_name, opt_out=True, reason=reason)
    if success:
        return f"Successfully opted out '{user_id_or_name}'. No future outbound calls will be placed to this learner."
    return f"Failed to record opt-out preference for '{user_id_or_name}'."


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions=SYSTEM_PROMPT,
            tools=[
                lookup_caller,
                save_caller_facts,
                forget_caller,
                opt_out_learner,
                fetch_ncert_exercise_and_syllabus,
                fetch_language_lesson_and_vocabulary,
                fetch_subject_quiz_and_solution,
                lookup_word_meaning_and_origin,
            ],
        )


server = AgentServer()


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session(agent_name=os.getenv("AGENT_NAME", "my-agent"))
async def my_agent(ctx: JobContext):
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    # Initialize SQLite DB with Day 6 Schema
    init_db()

    # Determine if session is an outbound call or SIP call
    import json
    metadata_obj = {}
    if ctx.room.metadata:
        try:
            metadata_obj = json.loads(ctx.room.metadata)
        except Exception:
            metadata_obj = {}

    is_outbound = (
        metadata_obj.get("is_outbound", False)
        or ctx.room.name.startswith("outbound_")
        or "outbound" in ctx.room.name.lower()
    )
    user_id = metadata_obj.get("user_id", "ramesh")
    learner_name = metadata_obj.get("name", "Ramesh")
    phone_number = metadata_obj.get("phone_number", "+919876543210")
    topic = metadata_obj.get("topic", "NCERT Class 10 Science Photosynthesis")
    outcome_sim = metadata_obj.get("outcome_sim", "ANSWERED").upper()

    # Set up voice AI pipeline using Murf Falcon, Gemini, Deepgram Multilingual, LiveKit turn detector
    session = AgentSession(
        stt=deepgram.STT(
            model="nova-3",
            language="multi",
            keyterm=["Shiksha", "Ramesh", "fractions", "math", "Hindi", "English", "stop", "opt out"],
        ),
        llm=google.LLM(
            model="gemini-3.5-flash-lite",
        ),
        tts=murf.TTS(
            voice="Anisha",
            style="Conversation",
            tokenizer=tokenize.basic.SentenceTokenizer(min_sentence_len=2),
            text_pacing=True,
        ),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        preemptive_generation=True,
        user_away_timeout=12.0,
    )

    recent_profile = get_most_recent_user_profile()

    await session.start(
        agent=Assistant(),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: (
                    noise_cancellation.BVCTelephony()
                    if params.participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
                    else noise_cancellation.BVC()
                ),
            ),
        ),
    )

    await ctx.connect()

    # Day 6 Outbound Call Logic & Mandatory Opening Script
    if is_outbound:
        call_id = f"call_{int(datetime.now().timestamp())}"
        
        # Check if learner has opted out
        if is_learner_opted_out(user_id):
            logger.info(f"Outbound call blocked for {user_id} — learner opted out.")
            log_outbound_call(call_id, user_id, phone_number, topic, "OPT_OUT", notes="Blocked by prior opt-out preference")
            await session.say(f"Learner {learner_name} has opted out of outbound calls. Disconnecting.")
            return

        if outcome_sim == "VOICEMAIL":
            log_outbound_call(call_id, user_id, phone_number, topic, "VOICEMAIL", notes="Left spoken voicemail message drop")
            voicemail_msg = (
                f"नमस्ते {learner_name} जी! मैं शिक्षा AI बोल रहा हूँ, आपकी NCERT {topic} प्रैक्टिस कॉल के लिए। "
                "जब आप फ्री हों, ऐप खोलें या वापस कनेक्ट करें। कॉल्स बंद करने के लिए STOP कहें। धन्यवाद!"
            )
            await session.say(voicemail_msg)
            return

        if outcome_sim == "NO_ANSWER":
            log_outbound_call(call_id, user_id, phone_number, topic, "NO_ANSWER", notes="Call unanswered after 30s ring")
            await session.say("Outbound call status: NO ANSWER. Retry scheduled in 15 minutes.")
            return

        if outcome_sim == "BUSY":
            log_outbound_call(call_id, user_id, phone_number, topic, "BUSY", notes="Line busy or rejected")
            await session.say("Outbound call status: BUSY. Retry scheduled in 5 minutes.")
            return

        # Default Outcome: ANSWERED (Day 6 Mandatory 2-Sentence Opening Script)
        log_outbound_call(call_id, user_id, phone_number, topic, "ANSWERED", notes="Call connected & completed successfully")
        
        # Mandatory Day 6 Opening Script:
        # Sentence 1: Who is calling & Why
        # Sentence 2: How to make it stop / Opt-Out
        # Sentence 3: Value delivery / Daily practice prompt
        outbound_opening = (
            f"नमस्ते {learner_name} जी! मैं शिक्षा AI बोल रहा हूँ, आपकी डेली 5-मिनट NCERT प्रैक्टिस कॉल के लिए। "
            f"अगर आप ये कॉल्स बंद करना चाहते हैं, तो बस 'स्टॉप' या 'कॉल्स बंद करो' बोल दें। "
            f"आज हम {topic} रिवाइज करेंगे। क्या आप शुरू करने के लिए तैयार हैं?"
        )
        await session.say(outbound_opening)

    else:
        # Standard Inbound Call Greeting
        if recent_profile:
            name = recent_profile.get("name", "Learner")
            facts = recent_profile.get("facts", {})
            saved_topic = facts.get("topics_covered", "school topics")
            greeting = (
                f"नमस्ते {name} जी! शिक्षा AI में आपका स्वागत है। "
                f"पिछली बार हमने {saved_topic} पढ़ा था। आज आगे का टॉपिक पढ़ें या कोई प्रश्न है?"
            )
        else:
            greeting = (
                "नमस्ते! मैं शिक्षा AI हूँ, आपका पर्सनल लर्निंग साथी। "
                "आप मुझसे हिंदी या इंग्लिश किसी भी भाषा में बात कर सकते हैं। आपका नाम क्या है और आज हम कौन सा टॉपिक स्टडी करें?"
            )
        await session.say(greeting)


if __name__ == "__main__":
    cli.run_app(server)



if __name__ == "__main__":
    cli.run_app(server)
