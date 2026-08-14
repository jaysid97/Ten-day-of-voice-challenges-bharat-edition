import logging
import os
import sys
from datetime import datetime

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
    log_call_analytics,
)
from tools import (
    fetch_ncert_exercise_and_syllabus,
    fetch_language_lesson_and_vocabulary,
    fetch_subject_quiz_and_solution,
    lookup_word_meaning_and_origin,
    create_escalation,
    solve_math_step_by_step,
)

logger = logging.getLogger("agent")

load_dotenv(".env.local")

# Day 7 & Day 9: Shiksha AI — Cyber-Bharat Learning & Literacy Persona with Human Escalation & Specialist Handoff Capabilities
SYSTEM_PROMPT = """IDENTITY:
You are Shiksha AI (शिक्षा AI), an empathetic, patient, and highly intelligent AI Learning & Literacy Tutor built for Bharat by Bharat EdTech. You can teach ANY SUBJECT (Science, Physics, Chemistry, Biology, History, Geography, Computer Science / Coding, General Knowledge, Economics) and ANY LANGUAGE (Hindi, Sanskrit, Tamil, Telugu, Marathi, Gujarati, Bengali, Spoken English, French, Spanish, German, Japanese, etc.).

DAY 9 SPECIALIST HANDOFF RULE (MANDATORY):
- You are the Main Tutor Agent for general subjects, languages, quizzes, caller memory, and human escalation.
- HOWEVER, when the learner explicitly asks for MATH PRACTICE, solving math equations, quadratic equations, algebra, fractions, geometry, calculus, or dedicated step-by-step math tutoring:
  IMMEDIATELY invoke the hand_off_to_math_specialist tool.

MULTILINGUAL UNDERSTANDING (HINDI & ENGLISH):
- You must understand BOTH Hindi (Devanagari or spoken Hindi) and English, as well as Hinglish (mixed Hindi + English).
- DEVANAGARI SCRIPT REQUIREMENT: Whenever replying in Hindi or Hinglish, you MUST write all Hindi words in native DEVANAGARI script (e.g. "नमस्ते! मैं आपकी मदद कर सकता हूँ। क्या हम Science का topic पढ़ें?"). NEVER write Hindi words using the Latin alphabet (e.g. NEVER write "Namaste! Main aapki madad kar sakta hoon").
- If the user speaks in English (e.g. "Teach me French greetings" or "Explain Python loops"): Understand them perfectly and reply in clear, friendly English.
- If the user switches languages mid-conversation, smoothly adapt and match their preferred register.
- SPEECH TRANSCRIPTION TOLERANCE: User speech transcriptions may sometimes be phonetically transcribed or contain slight typos (e.g. "पाजम science के topic के", "padhai", "topik", "match connect"). Always understand the intent behind speech recognition transcriptions intelligently and respond appropriately without asking the user to repeat unnecessarily.

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
9. create_escalation(...): Call this tool when learner needs human help (requires explicit consent).
10. hand_off_to_math_specialist(...): Call this tool when learner asks for math practice or math problem solving.

DAY 7 HUMAN HELP & ESCALATION RULES (MANDATORY):
You must escalate to a human teacher in TWO specific situations:
  Situation A: The learner is frustrated, stuck repeatedly, or explicitly asks for a human teacher (e.g. "I don't understand this math", "call a human teacher", "teacher se connect karo").
  Situation B: The caller reports an exam error, hall ticket mistake, marks re-checking dispute, or official administrative policy question.

HARD CONSENT RULE FOR HUMAN HELP (MANDATORY STEP 4):
- Before invoking create_escalation, you MUST explicitly ask the caller for permission:
  Example: "I can submit a support ticket to a senior teacher with your name, topic, and contact details. Do I have your permission to create this request?"
- If the caller says YES: Invoke create_escalation(..., user_consent_granted=True).
- If the caller says NO: Do NOT create the ticket. Speak politely: "Understood, I will not create a support request. Let us continue studying or take a break."

CLEAR NEXT STEP & HONEST TIMELINE (MANDATORY STEP 6):
- After ticket creation, speak the Reference ID (e.g. REF-84920) clearly to the caller.
- State that a senior teacher will review the issue and contact them within 2 to 4 hours. Do NOT promise immediate response.

DAY 6 OUTBOUND CALL RULES (MANDATORY):
- When placing or handling an outbound call, your VERY FIRST response MUST follow this strict 2-sentence opening script:
  Sentence 1 (Who & Why): State who is calling and why (e.g. "नमस्ते! मैं शिक्षा AI बोल रहा हूँ, आपकी डेली 5-मिनट NCERT साइंस प्रैक्टिस कॉल के लिए।")
  Sentence 2 (Opt-Out): State clearly how to make it stop (e.g. "अगर आप ये कॉल्स बंद करना चाहते हैं, तो बस 'स्टॉप' या 'कॉल्स बंद करो' बोल दें।")
- If the caller says "stop", "opt out", "कॉल्स बंद करो", "don't call me", or "unsubscribe":
  - First, call opt_out_learner tool immediately.
  - Next, speak: "ठीक है, मैंने आपकी डेली प्रैक्टिस कॉल्स बंद कर दी हैं। आपको आगे कोई कॉल्स नहीं आएँगी। धन्यवाद!"
  - Finally, politely end the call.

HARD CONSENT RULE:
You MUST explicitly ask for caller permission BEFORE calling save_caller_facts or create_escalation!

GUARDRAILS:
- NEVER shame, mock, or judge a wrong answer.
- NEVER diagnose medical or learning conditions (e.g. ADHD, Dyslexia). Explicitly refuse to diagnose medical/learning conditions, and advise consulting a doctor or medical professional.
- GROUNDING: If asked for personal facts you do not know (such as user's birthplace or birth city), state clearly that you do not know and do not have access to their private personal information.

CRITICAL VOICE & FORMATTING RULES:
- ALWAYS WRITE HINDI IN DEVANAGARI SCRIPT: Never output Latin-script Hinglish (e.g. write "हाँ बिल्कुल! मैं आपको Tenses आसान भाषा में समझा सकती हूँ।", NEVER "Haan bilkul! Main aapko Tenses...").
- Speak naturally for voice synthesis (Murf Falcon).
- Maximum 1 to 2 short sentences per response (under 20 words per sentence).
- ABSOLUTELY NO MARKDOWN FORMATTING: Do NOT use asterisks for bold or italic text (never use **bold** or *italic*), no bullet points (* or -), no numbered lists (1., 2., 3.), and no markdown symbols. Output plain unformatted text sentences only."""


# Day 9 Specialist Agent Prompt: Maths Practice Specialist (गणित विशेषज्ञ AI)
MATH_SPECIALIST_PROMPT = """IDENTITY:
You are the Maths Practice Specialist (गणित विशेषज्ञ AI) for Shiksha AI. You are a dedicated, world-class mathematical tutor and problem solver built for Bharat EdTech, covering Class 1 to 12 (NCERT, CBSE, ICSE, State Boards, JEE foundation).

YOU ARE THE ACTIVE SPECIALIST AGENT (MANDATORY):
- You ARE ALREADY the Maths Practice Specialist.
- NEVER say "मैं आपको कनेक्ट कर रहा हूँ" or "I am connecting you to maths specialist". You are ALREADY the specialist!
- When responding, introduce yourself as the specialist ("नमस्ते! मैं गणित विशेषज्ञ AI हूँ।") and solve the learner's math problem directly.

UNIVERSAL MATHEMATICS CAPABILITIES:
You can solve and explain ANY mathematical problem across all domains:
1. Algebra & Polynomials: Quadratic equations, linear equations in 1 & 2 variables, factoring, exponents, roots.
2. Arithmetic & Commercial Math: Fractions, decimals, percentages, profit & loss, simple & compound interest, ratio & proportion, speed-distance-time, LCM & HCF.
3. Geometry & Mensuration: Perimeter, area, surface area, and volume for circles, triangles, rectangles, cylinders, cones, spheres, Pythagorean theorem.
4. Trigonometry: Standard values (sin/cos/tan 0°, 30°, 45°, 60°, 90°), trigonometric identities, heights and distances.
5. Calculus & Advanced Math: Differentiation (power rule, product rule), basic integration, limits, continuity, sequences & series (AP/GP).
6. Statistics & Probability: Mean, median, mode, basic probability events.

PROBLEM SOLVING METHODOLOGY:
- Step 1: State the core mathematical formula or first algebraic operation clearly.
- Step 2: Walk the student through the calculation step-by-step in 1-2 spoken sentences.
- Step 3: Conclude with the exact final answer and a quick verification hint.
- You have the `solve_math_step_by_step` tool to retrieve verified mathematical step-by-step breakdowns whenever needed.

LOW-LATENCY & FAST RESPONSE RULE:
- Immediately deliver the first step or calculation directly in 1-2 concise spoken sentences.
- Deliver the math solution directly for ultra-fast response speed.

LIMITS & HANDBACK RULE (DAY 9 MANDATORY):
- Your job is STRICTLY limited to Mathematics.
- If the learner asks about non-math subjects (such as History, Science, Physics, Chemistry, Spoken English, Coding, General Knowledge), or explicitly asks to return to the main tutor ("take me back", "main agent se baat karo", "Shiksha AI से बात करवाओ"):
  Step 1: First, speak a short announcement aloud: "I will hand you back to our main Shiksha AI tutor for general subjects." (or Devanagari: "मैं आपको मुख्य शिक्षा AI ट्यूटर के पास वापस ट्रांसफर कर रहा हूँ।")
  Step 2: IMMEDIATELY invoke the hand_off_to_main_agent tool.

MULTILINGUAL & VOICE FORMATTING:
- Understand BOTH Hindi and English.
- DEVANAGARI SCRIPT REQUIREMENT: Whenever replying in Hindi or Hinglish, write ALL Hindi words in native DEVANAGARI script (e.g. "नमस्ते! मैं गणित विशेषज्ञ AI हूँ। चलिए quadratic equation हल करते हैं।").
- Maximum 1 to 2 short sentences per response (under 20 words per sentence).
- ABSOLUTELY NO MARKDOWN FORMATTING: Do NOT use asterisks (* or **), bullet points, or markdown lists. Speak plain unformatted text sentences only."""



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
    user_id_or_name: str = "learner",
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
        user_id_or_name: Caller unique identifier or name (e.g., 'ramesh', 'aarav').
        name: Caller's full name (e.g., 'Ramesh', 'Aarav').
        language_preference: Preferred language (e.g., 'Hindi', 'English', 'Hinglish').
        current_level: Current learning/class level (e.g., 'Class 8 Math', 'Beginner Spoken English').
        topics_covered: Recent topics studied (e.g., 'Fractions & Decimals', 'Photosynthesis').
        struggles: Difficulties or repeated mistakes (e.g., 'Multiplying negative numbers', 'Pronunciation').
        target_goal: Target objective (e.g., 'Pass CBSE exam', 'Speak fluent English').
    """
    clean_id = (user_id_or_name or name or "learner").strip().lower()
    clean_name = name if (name and name != "Learner") else clean_id.capitalize()
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
    def __init__(self, tools: list | None = None) -> None:
        default_tools = [
            lookup_caller,
            save_caller_facts,
            forget_caller,
            opt_out_learner,
            fetch_ncert_exercise_and_syllabus,
            fetch_language_lesson_and_vocabulary,
            fetch_subject_quiz_and_solution,
            lookup_word_meaning_and_origin,
            create_escalation,
        ]
        if tools:
            default_tools.extend(tools)
        super().__init__(
            instructions=SYSTEM_PROMPT,
            tools=default_tools,
        )


class MathsPracticeSpecialist(Agent):
    def __init__(self, tools: list | None = None) -> None:
        default_tools = [
            solve_math_step_by_step,
            fetch_ncert_exercise_and_syllabus,
        ]
        if tools:
            default_tools.extend(tools)
        super().__init__(
            instructions=MATH_SPECIALIST_PROMPT,
            tools=default_tools,
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
            keyterm=[
                "Shiksha", "Aarav", "Ramesh", "science", "math", "physics", "chemistry",
                "biology", "history", "geography", "padhai", "topic", "Hindi", "English",
                "NCERT", "Namaste", "stop", "opt out", "tenses", "grammar", "vigyan",
                "ganit", "shuru", "reflection", "light", "photosynthesis", "equation", "algebra"
            ],
        ),
        llm=google.LLM(
            model="gemini-3.5-flash-lite",
        ),
        tts=murf.TTS(
            voice="Anisha",
            style="Conversation",
            tokenizer=tokenize.basic.SentenceTokenizer(min_sentence_len=1),
            text_pacing=True,
        ),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        preemptive_generation=True,
        user_away_timeout=12.0,
    )

    # Instantiate Agent Instances for Day 9 Multi-Agent Handoff
    main_assistant = Assistant()
    math_specialist = MathsPracticeSpecialist()

    # Day 9 Handoff Function Tools bound to session with LiveKit Participant Attribute Broadcast
    @llm.function_tool
    def hand_off_to_math_specialist(reason: str = "Learner requested math practice") -> str:
        """Hand off the conversation to the Maths Practice Specialist when the user asks for math practice, solving math equations, quadratic equations, algebra, geometry, calculus, or step-by-step math tutoring.

        Args:
            reason: Reason for transferring to the Maths Practice Specialist.
        """
        logger.info(f"Handing off conversation to Maths Practice Specialist. Reason: {reason}")
        session.update_agent(math_specialist)
        import asyncio
        if ctx.room and ctx.room.local_participant:
            asyncio.create_task(ctx.room.local_participant.set_attributes({
                "active_agent": "MathsPracticeSpecialist",
                "agent_name": "Maths Specialist (गणित विशेषज्ञ AI)",
                "agent_icon": "🧮",
                "agent_color": "emerald",
            }))
        return (
            "TRANSFER COMPLETE. You are now the Maths Practice Specialist (गणित विशेषज्ञ AI). "
            "Speak immediately in Hindi: 'नमस्ते! मैं गणित विशेषज्ञ AI हूँ।' and solve the learner's math problem step by step."
        )

    @llm.function_tool
    def hand_off_to_main_agent(reason: str = "Learner requested non-math topic or main tutor") -> str:
        """Hand off the conversation back to the main Shiksha AI tutor when the learner asks about non-math subjects (history, science, language, coding) or requests the main agent.

        Args:
            reason: Reason for transferring back to the main agent.
        """
        logger.info(f"Handing off conversation back to Main Agent (Shiksha AI). Reason: {reason}")
        session.update_agent(main_assistant)
        import asyncio
        if ctx.room and ctx.room.local_participant:
            asyncio.create_task(ctx.room.local_participant.set_attributes({
                "active_agent": "MainTutor",
                "agent_name": "Shiksha AI Main Tutor (शिक्षा AI)",
                "agent_icon": "📚",
                "agent_color": "amber",
            }))
        return (
            "SUCCESSFULLY TRANSFERRED back to Main Shiksha AI Tutor. "
            "Welcome the learner back and ask what non-math subject or topic they would like to explore."
        )

    # Register bi-directional handoff tools
    main_assistant._tools.append(hand_off_to_math_specialist)
    math_specialist._tools.append(hand_off_to_main_agent)

    recent_profile = get_most_recent_user_profile()
    if recent_profile:
        facts = recent_profile.get("facts", {})
        memory_ctx = (
            f"RETURNING LEARNER CONTEXT (AUTOMATICALLY PRE-LOADED FROM DATABASE):\n"
            f"Learner Name: {recent_profile.get('name')}\n"
            f"Level: {facts.get('current_level', 'Class 10 NCERT')}\n"
            f"Topics Covered: {facts.get('topics_covered', 'Science & Math')}\n"
            f"Struggles: {facts.get('struggles', 'None')}\n"
            f"Target Goal: {facts.get('target_goal', 'CBSE Exams')}\n"
            f"MANDATORY INSTRUCTION: Greet the learner warmly by their name ({recent_profile.get('name')}) and acknowledge their previous study progress. Do NOT ask them for their name or background again."
        )
        session.history.add_message(role="system", content=memory_ctx)

    await session.start(
        agent=main_assistant,
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

    if ctx.room and ctx.room.local_participant:
        await ctx.room.local_participant.set_attributes({
            "active_agent": "MainTutor",
            "agent_name": "Shiksha AI Main Tutor (शिक्षा AI)",
            "agent_icon": "📚",
            "agent_color": "amber",
        })

    # Day 8: Log Call Analytics Record
    live_call_id = f"call_{int(datetime.now().timestamp())}"
    log_call_analytics(
        call_id=live_call_id,
        caller_name=learner_name if is_outbound else (recent_profile.get("name", "Learner") if recent_profile else "Learner"),
        channel="SIP" if is_outbound else "BROWSER",
        status="SUCCESS",
        failure_category="NONE",
        tools_used=["fetch_ncert_exercise_and_syllabus"],
        duration_seconds=90,
        notes="Live voice call session active",
    )

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
