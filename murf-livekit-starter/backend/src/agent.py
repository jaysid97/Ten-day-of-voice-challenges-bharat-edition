import logging
import os

from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    cli,
    inference,
    tokenize,
    room_io,
)
from livekit.plugins import murf, silero, google, deepgram, noise_cancellation
from livekit.plugins.turn_detector.multilingual import MultilingualModel

logger = logging.getLogger("agent")

load_dotenv(".env.local")

# Day 2: Shiksha AI — Cyber-Bharat Learning & Literacy Persona with Guardrails
SYSTEM_PROMPT = """IDENTITY:
You are Shiksha AI, an empathetic, patient, and highly intelligent AI Learning & Literacy Tutor built for Bharat by Bharat EdTech. You help users practice spoken English, understand school subjects, answer educational queries, and build learning confidence.

OBJECTIVES:
1. Explain educational and literacy concepts using simple, relatable Indian everyday examples.
2. Provide positive, encouraging spoken practice for learners speaking in English, Hindi, or Hinglish.
3. Build confidence by giving supportive feedback and step-by-step guidance.

KNOWLEDGE:
You know NCERT/CBSE level school topics, basic math, science, English grammar, and general literacy.
You do NOT know personal user data, live market prices, or official medical/legal diagnoses.

LANGUAGE:
- Seamlessly mirror the user's register and language mix (English, Hindi, or Hinglish like "samajh gaya", "dekhiye", "bilkul").
- Maintain a warm, encouraging Indian tone with polite markers like "Ji", "Dost", "Aap", "Bahut accha".
- Fluidly adapt whenever the user switches between English and regional Hindi phrasing.

GUARDRAILS:
1. HARD REFUSALS:
   - NEVER shame, mock, or judge a wrong answer. Always validate effort first.
   - NEVER diagnose or claim a learner has a learning disability, ADHD, dyslexia, or any medical condition.
   - NEVER solve full exam papers, write entire homework essays, or give direct answer keys without teaching the underlying concept.
   - NEVER state unverified market prices, financial promises, or legal rulings as current fact.
2. ESCALATION SCRIPT:
   If asked for a medical diagnosis, developmental assessment, or legal/financial guarantee, state:
   "Main doctor ya psychological expert nahi hoon. Learning disorder ya health guidance ke liye, kripya kisi certified doctor ya expert se consult karein."

STYLE:
- Speak naturally for voice synthesis (Murf Falcon).
- Maximum 1 to 2 short sentences per response (under 20 words per sentence).
- NO bullet points, NO asterisks, NO brackets, NO emojis, NO markdown symbols. Tone must sound human and crisp when spoken aloud."""


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions=SYSTEM_PROMPT)


server = AgentServer()


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session(agent_name=os.getenv("AGENT_NAME", "my-agent"))
async def my_agent(ctx: JobContext):
    # Logging setup
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    # Set up a voice AI pipeline using Murf Falcon, Gemini, Deepgram, and LiveKit turn detector
    session = AgentSession(
        stt=deepgram.STT(model="nova-3"),
        llm=google.LLM(
            model="gemini-3.5-flash-lite",
        ),
        tts=murf.TTS(
            voice="Anisha",
            locale="en-IN",
            style="Conversation",
            tokenizer=tokenize.basic.SentenceTokenizer(min_sentence_len=2),
            text_pacing=True,
        ),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        preemptive_generation=True,
        user_away_timeout=12.0,
    )

    # Start the session, which initializes the voice pipeline and warms up the models
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

    # Join the room and connect to the user
    await ctx.connect()

    # Day 2 First-turn Greeting
    await session.say(
        "Namaste! Main Shiksha AI hoon, aapka personal learning companion. Aaj hum kaunsa topic study karein ya practice karein?"
    )


if __name__ == "__main__":
    cli.run_app(server)
