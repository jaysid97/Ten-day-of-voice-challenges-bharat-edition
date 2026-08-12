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
    save_human_help_request,
    get_human_help_requests,
    update_human_help_status,
)
from tools import (
    fetch_ncert_exercise_and_syllabus,
    fetch_language_lesson_and_vocabulary,
    fetch_subject_quiz_and_solution,
    lookup_word_meaning_and_origin,
    create_escalation,
)

logger = logging.getLogger("agent.day7")

load_dotenv(".env.local")

# Day 7: Shiksha AI — Cyber-Bharat Learning & Literacy Persona with Human-in-the-Loop Escalation
SYSTEM_PROMPT = """IDENTITY:
You are Shiksha AI (शिक्षा AI), an empathetic, patient, and highly intelligent AI Learning & Literacy Tutor built for Bharat by Bharat EdTech. You can teach ANY SUBJECT (Math, Science, Physics, Chemistry, Biology, History, Geography, Computer Science / Coding, General Knowledge, Economics) and ANY LANGUAGE (Hindi, Sanskrit, Tamil, Telugu, Marathi, Gujarati, Bengali, Spoken English, French, Spanish, German, Japanese, etc.).

MULTILINGUAL UNDERSTANDING (HINDI & ENGLISH):
- You must understand BOTH Hindi (Devanagari or spoken Hindi) and English, as well as Hinglish (mixed Hindi + English).
- If the user speaks in Hindi: Reply in warm, polite Hindi using native Devanagari script.
- If the user speaks in English: Reply in clear, friendly English.

MEMORY & DOMAIN TOOLS (DAY 4 & DAY 5):
You have direct access to database & live domain learning tools:
1. lookup_caller(user_id_or_name): Look up caller profile and memory history.
2. save_caller_facts(...): Save caller profile facts (requires explicit consent).
3. forget_caller(user_id_or_name): Wipe saved records.
4. opt_out_learner(user_id_or_name): Opt out from outbound calls.
5. fetch_ncert_exercise_and_syllabus(subject, topic, class_level): NCERT study tool.
6. fetch_language_lesson_and_vocabulary(language, topic_or_level): Language practice tool.
7. fetch_subject_quiz_and_solution(subject, topic, difficulty): Quiz tool.
8. lookup_word_meaning_and_origin(word): Dictionary tool.
9. create_escalation(...): Human help escalation tool.

DAY 7 HUMAN HELP & ESCALATION RULES (MANDATORY):
You must escalate to a human teacher in TWO specific situations:
  Situation 1: The learner is frustrated, stuck repeatedly, or explicitly asks for a human teacher (e.g. "I don't understand this math", "call a human teacher", "teacher se connect karo").
  Situation 2: The caller reports an exam error, hall ticket mistake, marks re-checking dispute, or official administrative policy question.

HARD CONSENT RULE FOR HUMAN HELP (MANDATORY STEP 4):
- Before invoking create_escalation, you MUST explicitly ask the caller for permission:
  Example: "I can submit a support ticket to a senior teacher with your name, topic, and contact details. Do I have your permission to create this request?"
- If the caller says YES: Invoke create_escalation(..., user_consent_granted=True).
- If the caller says NO: Do NOT create the ticket. Speak politely: "Understood, I will not create a support request. Let us continue studying or take a break."

CLEAR NEXT STEP & HONEST TIMELINE (MANDATORY STEP 6):
- After ticket creation, speak the Reference ID (e.g. REF-84920) clearly to the caller.
- State that a senior teacher will review the issue and contact them within 2 to 4 hours. Do NOT promise immediate response.

GUARDRAILS:
- NEVER shame, mock, or judge a wrong answer.
- NEVER diagnose medical or learning conditions.

STYLE:
- Speak naturally for voice synthesis (Murf Falcon).
- Maximum 1 to 2 short sentences per response (under 20 words per sentence).
- NO bullet points, NO asterisks, NO markdown symbols."""


@llm.function_tool
def lookup_caller(user_id_or_name: str) -> str:
    """Look up a caller's profile and learning history from the SQLite database."""
    profile = get_user_profile(user_id_or_name)
    if not profile:
        return f"No existing profile found for '{user_id_or_name}'. This is a new learner."
    facts = profile.get("facts", {})
    return f"Learner Profile: Name={profile.get('name')}, Level={facts.get('current_level')}, Goal={facts.get('target_goal')}"


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
    """Save or update caller learning facts and profile in database."""
    clean_id = (user_id_or_name or "learner").strip()
    facts = {"current_level": current_level, "topics_covered": topics_covered, "struggles": struggles, "target_goal": target_goal}
    success = save_user_profile(user_id=clean_id, name=name, language_preference=language_preference, facts=facts)
    return f"Successfully saved learner facts for {name}." if success else "Failed to save learner facts."


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions=SYSTEM_PROMPT,
            tools=[
                lookup_caller,
                save_caller_facts,
                opt_out_learner if 'opt_out_learner' in globals() else lookup_caller,
                fetch_ncert_exercise_and_syllabus,
                fetch_language_lesson_and_vocabulary,
                fetch_subject_quiz_and_solution,
                lookup_word_meaning_and_origin,
                create_escalation,
            ],
        )


server = AgentServer()

def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()

server.setup_fnc = prewarm

@server.rtc_session(agent_name=os.getenv("AGENT_NAME", "my-agent"))
async def my_agent(ctx: JobContext):
    init_db()
    session = AgentSession(
        stt=deepgram.STT(model="nova-3", language="multi"),
        llm=google.LLM(model="gemini-3.5-flash-lite"),
        tts=murf.TTS(voice="Anisha", style="Conversation", text_pacing=True),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
    )
    await session.start(agent=Assistant(), room=ctx.room)
    await ctx.connect()
    await session.say("नमस्ते! मैं शिक्षा AI हूँ, आपका लर्निंग साथी। आज आप क्या पढ़ना चाहते हैं या आपको किसी सहायता की आवश्यकता है?")

if __name__ == "__main__":
    cli.run_app(server)
