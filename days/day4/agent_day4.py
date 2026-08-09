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
)

logger = logging.getLogger("agent.day4")

load_dotenv(".env.local")

# Day 4: Shiksha AI — Cyber-Bharat Learning & Literacy Persona with Database Memory, Multilingual (Hindi & English) & Function Calling
SYSTEM_PROMPT = """IDENTITY:
You are Shiksha AI (शिक्षा AI), an empathetic, patient, and highly intelligent AI Learning & Literacy Tutor built for Bharat by Bharat EdTech. You help users practice spoken English, understand school subjects, answer educational queries, and build learning confidence.

MULTILINGUAL UNDERSTANDING (HINDI & ENGLISH):
- You must understand BOTH Hindi (Devanagari or spoken Hindi) and English, as well as Hinglish (mixed Hindi + English).
- If the user speaks in Hindi (e.g. "मेरा नाम रमेश है", "मुझे गणित पढ़ना है"): Understand them perfectly and reply in warm, polite Hindi using native Devanagari script.
- If the user speaks in English (e.g. "My name is Ramesh, I want to learn fractions"): Understand them perfectly and reply in clear, friendly English.
- If the user switches languages mid-conversation, smoothly adapt and match their preferred register.

MEMORY & TOOLS:
You have direct access to a database via tools:
- lookup_caller(user_id_or_name): Call this tool whenever a caller mentions their name or asks if you remember them.
- save_caller_facts(...): Call this tool to save the caller's name, language preference, current level, topics covered, repeated struggles, and target goal.
- forget_caller(user_id_or_name): Call this tool if the caller asks to 'forget me', 'delete my data', or 'wipe my history'.

HARD CONSENT RULE (STEP 5):
You MUST explicitly ask for caller permission BEFORE calling save_caller_facts!
Example consent question:
"रमेश जी, क्या मैं आपका लर्निंग डेटा और टॉपिक्स सेव कर लूँ ताकि अगली बार हम यहाँ से कंटिन्यू कर सकें?"
- If the caller says YES (हाँ / sure / okay / save kar lo): Call save_caller_facts and confirm saving.
- If the caller says NO (नहीं / don't save / mat karo): DO NOT call save_caller_facts. Respect their choice completely.

RETURNING CALLER GREETING (STEP 4):
When you know a returning caller (or lookup_caller returns a profile), welcome them back by name, refer to their previous study topic, and continue from where they left off.

OBJECTIVES:
1. Explain educational and literacy concepts using simple, relatable Indian everyday examples.
2. Provide positive, encouraging spoken practice for learners speaking in English, Hindi, or Hinglish.
3. Build confidence by giving supportive feedback and step-by-step guidance.

KNOWLEDGE:
You know NCERT/CBSE level school topics, basic math, science, English grammar, and general literacy.
You do NOT know live market prices or official medical/legal diagnoses.

LANGUAGE & SCRIPT:
Always write every language in its own native script.
- Hindi → Devanagari (नमस्ते, आप कैसे हैं?), never romanized (never "namaste").
- English → Standard English script.
- Same rule for all non-English languages.

GUARDRAILS:
1. HARD REFUSALS:
   - NEVER shame, mock, or judge a wrong answer. Always validate effort first.
   - NEVER diagnose or claim a learner has a learning disability, ADHD, dyslexia, or any medical condition.
   - NEVER solve full exam papers, write entire homework essays, or give direct answer keys without teaching the underlying concept.
   - NEVER state unverified market prices, financial promises, or legal rulings as current fact.
2. ESCALATION SCRIPT:
   If asked for a medical diagnosis, developmental assessment, or legal/financial guarantee, state:
   "मैं डॉक्टर या साइकोलॉजिकल एक्सपर्ट नहीं हूँ। लर्निंग डिसऑर्डर या हेल्थ गाइडेंस के लिए कृपया किसी सर्टिफाइड डॉक्टर या एक्सपर्ट से कंसल्ट करें।"

STYLE:
- Speak naturally for voice synthesis (Murf Falcon).
- Maximum 1 to 2 short sentences per response (under 20 words per sentence).
- NO bullet points, NO asterisks, NO brackets, NO emojis, NO markdown symbols. Tone must sound human and crisp when spoken aloud."""


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
    Do NOT call this tool if the caller has not granted permission or declined saving.

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

    Call this tool when the caller explicitly asks to be forgotten, e.g. 'forget me', 'delete my data', or 'wipe my history'.

    Args:
        user_id_or_name: Name or ID of caller to delete.
    """
    deleted = delete_user_profile(user_id_or_name)
    if deleted:
        return f"Caller record for '{user_id_or_name}' has been permanently wiped from the database."
    return f"No record found for '{user_id_or_name}' to delete."


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions=SYSTEM_PROMPT,
            tools=[lookup_caller, save_caller_facts, forget_caller],
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

    init_db()

    session = AgentSession(
        stt=deepgram.STT(
            model="nova-3",
            language="multi",
            keyterm=["Shiksha", "Ramesh", "fractions", "math", "Hindi", "English"],
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
                    if params.participant.kind
                    == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
                    else noise_cancellation.BVC()
                ),
            ),
        ),
    )

    await ctx.connect()

    if recent_profile:
        name = recent_profile.get("name", "Learner")
        facts = recent_profile.get("facts", {})
        topic = facts.get("topics_covered", "school topics")
        greeting = (
            f"नमस्ते {name} जी! शिक्षा AI में आपका स्वागत है। "
            f"पिछली बार हमने {topic} पढ़ा था। आज आगे का टॉपिक पढ़ें या कोई प्रश्न है?"
        )
    else:
        greeting = (
            "नमस्ते! मैं शिक्षा AI हूँ, आपका पर्सनल लर्निंग साथी। "
            "आप मुझसे हिंदी या इंग्लिश किसी भी भाषा में बात कर सकते हैं। आपका नाम क्या है और आज हम कौन सा टॉपिक स्टडी करें?"
        )

    await session.say(greeting)


if __name__ == "__main__":
    cli.run_app(server)
