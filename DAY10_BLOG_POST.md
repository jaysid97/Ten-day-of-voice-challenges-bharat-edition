# How I Built a Real-Time Multilingual AI Voice Tutor for Bharat (And Solved the 55ms Latency Problem)

> **10 Days of Voice AI Challenge — VoiceForBharat Edition**  
> *Author: Jay | Track: Learning & Literacy (EdTech)*  
> *Open-Source Repository: [github.com/jaysid97/Ten-day-of-voice-challenges-bharat-edition](https://github.com/jaysid97/Ten-day-of-voice-challenges-bharat-edition)*

---

When you build a traditional text chatbot, a 1.5-second API delay feels completely normal. But in **conversational voice AI**, a 1.5-second delay feels like an uncomfortable eternity. 

Now imagine building a voice tutor for students across India — where learners naturally flip mid-sentence between English, Hindi, and regional terms (*"Bhaiya, is quadratic equation ko solve karne ka simple trick kya hai?"*). Suddenly, latency isn't just a performance metric. **Latency is the entire user experience.**

Over the last 10 days, as part of the **#VoiceForBharat AI Challenge**, I built **Shiksha AI (शिक्षा AI)** — an empathetic, multilingual voice tutor powered by **Murf Falcon TTS**, **LiveKit Agents**, **Deepgram Nova-3**, and **Google Gemini**.

In this article, I want to break down how I built it, the architecture decisions behind sub-100ms voice responses, the hardest bugs I ran into, and how you can run the entire open-source setup yourself in under two minutes.

---

## 🎯 The Core Problem: Why Voice AI for Bharat?

Quality 1-on-1 tutoring in India is expensive, geographically unequal, and often intimidating. Students in Tier 2, Tier 3, and rural towns face four massive hurdles:

1. **The Cost Barrier**: Private home tutors cost thousands of rupees per month, making personalized guidance inaccessible for low-income households.
2. **The Language & Code-Mixing Barrier**: Most educational apps force students into formal English, whereas Indian kids think and speak in **Hinglish** (a blend of Hindi and English).
3. **The "Fear of Shaming"**: Students frequently hesitate to ask "stupid questions" in crowded classrooms for fear of being ridiculed by peers or teachers.
4. **Keyboard Friction**: Try typing `2x² + 5x + 3 = 0` or asking about photosynthesis on a small smartphone screen — it's awkward and slow.

Voice changes everything. By giving students a patient, non-judgmental voice tutor that speaks their language, understands their accent, and responds instantly, we can democratize personalized learning.

---

## 🏗️ System Architecture: How Audio Moves in Real Time

A real-time voice agent is a continuous, bi-directional pipeline. Audio flows from the student's microphone, gets transcribed into text, passes through an LLM for reasoning and tool execution, and is streamed back as high-quality speech.

```mermaid
flowchart TD
    User[🎙️ Learner / Voice Caller / Outbound SIP] -->|Audio Stream via WebRTC or SIP| STT[Deepgram STT Nova-3 Multi]
    STT -->|Text Transcript| LLM[Google Gemini LLM]
    
    subgraph Agent & Multi-Agent Domain Layer
        LLM <-->|Active Session Agent| MainAgent[Shiksha AI Main Tutor]
        LLM <-->|Handoff via session.update_agent| Specialist[MathsPracticeSpecialist Agent]
    end

    subgraph Memory, Tools & Safety Layer
        MainAgent <-->|Learner Facts & Consent| SQLiteMemory[(SQLite: agent_memory.db)]
        MainAgent <-->|Live Syllabus / Concepts| WikiAPI[Wikipedia Educational REST API]
        MainAgent <-->|Dictionary & Phonetics| DictAPI[Free Dictionary REST API]
        MainAgent <-->|PII Scrub & Webhook| Escalation[Human Support Engine / Discord]
        Specialist <-->|Step-by-Step Math Solver| MathTool[solve_math_step_by_step Tool]
    end

    subgraph Telephony & Analytics Layer
        MainAgent <-->|2-Sentence Opening & Retry Rules| Outbound[src/outbound_call.py]
        MainAgent -->|Teardown Metrics| Analytics[SQLite call_analytics Table]
    end
    
    LLM -->|Spoken Response Text| TTS[Murf Falcon Streaming TTS]
    TTS -->|High-Quality Audio (55ms)| Transport[LiveKit Agent Transport]
    Transport -->|Audio Output| Speaker[🔊 Learner Hears Shiksha AI]

    style User fill:#1E293B,stroke:#38BDF8,color:#fff
    style STT fill:#064E3B,stroke:#10B981,color:#fff
    style LLM fill:#1E1B4B,stroke:#818CF8,color:#fff
    style MainAgent fill:#431407,stroke:#F97316,color:#fff
    style Specialist fill:#365314,stroke:#84CC16,color:#fff
    style SQLiteMemory fill:#78350F,stroke:#F59E0B,color:#fff
    style Outbound fill:#831843,stroke:#F43F5E,color:#fff
    style WikiAPI fill:#0284C7,stroke:#38BDF8,color:#fff
    style DictAPI fill:#4C1D95,stroke:#C084FC,color:#fff
    style Escalation fill:#701A75,stroke:#F43F5E,color:#fff
    style Analytics fill:#1E3A8A,stroke:#60A5FA,color:#fff
    style TTS fill:#065F46,stroke:#34D399,color:#fff
    style Transport fill:#1E293B,stroke:#F59E0B,color:#fff
    style Speaker fill:#1E293B,stroke:#10B981,color:#fff
```

### The Tech Stack
* **TTS (Text-to-Speech)**: **Murf Falcon TTS** — Delivering ultra-low **55ms streaming latency** with authentic Indian voice synthesis and flawless pronunciation of Hindi and English terms.
* **STT (Speech-to-Text)**: **Deepgram Nova-3 Multi-Language** — Handling real-time speech recognition across English, Hindi (Devanagari script), and Hinglish.
* **LLM Engine**: **Google Gemini 1.5 Flash** — Providing empathetic reasoning, guardrail compliance, and zero-shot function execution.
* **Real-Time Transport**: **LiveKit Agents** — Orchestrating WebRTC audio streaming, VAD (Voice Activity Detection), and SIP telephony.
* **Database**: **SQLite (`agent_memory.db`)** — Storing learner memory, call logs, human escalation tickets, and analytics.

---

## 💡 The 4 Engineering Breakthroughs in Shiksha AI

### 1. Achieving 55ms Latency with Murf Falcon TTS
Traditional TTS engines wait for the LLM to generate an entire paragraph before synthesizing audio. This introduces a 1.5 to 2.5 second delay — killing the natural flow of conversation.

Using **Murf Falcon's streaming API**, as soon as Gemini outputs the first few tokens, Murf Falcon immediately synthesizes and streams raw PCM audio frames over WebRTC. The total time from the student stopping their speech to hearing the first spoken word dropped to under **100ms**.

### 2. Persistent Learner Memory with "Hard Consent"
Shiksha AI remembers returning students (*"Welcome back Ramesh! Last time we revised Class 10 Biology Photosynthesis..."*). But storing voice conversation data without explicit consent is a major privacy violation.

I built a **Hard Consent Rule**: The LLM is strictly instructed to ask aloud (*"Should I remember your grade level and weak topics for next time?"*) before invoking `save_caller_facts`. If the student says "No", zero records are saved to SQLite.

### 3. Outbound SIP Telephony & Mandatory Opening Script
Not every student in India has a high-speed laptop or desktop. To reach students on feature phones, I integrated LiveKit SIP and Twilio (`src/outbound_call.py`) to trigger automated outbound revision calls.

Every outbound call strictly enforces a 2-sentence compliance opening:
1. **Who & Why**: *"Namaste Ramesh ji! I am Shiksha AI calling for your daily 5-minute NCERT Science practice call."*
2. **Opt-Out Notice**: *"If you want to stop receiving these calls, just say 'stop' or 'opt out'."*
3. **Retry Logic**: Automatically categorizes call outcomes (`ANSWERED`, `BUSY`, `NO_ANSWER`, `VOICEMAIL`, `OPT_OUT`) and reschedules missed calls.

### 4. Multi-Agent Handoff to `MathsPracticeSpecialist`
Prompting a single LLM agent to handle general subjects, languages, quizzes, guardrails, *and* step-by-step calculus causes prompt pollution and degrades reasoning quality.

Instead, I built a **Multi-Agent Handoff Architecture**:
* **Main Tutor (`Shiksha AI`)**: Handles general queries, history, biology, and language lessons.
* When a student asks for complex math help (*"Help me solve 2x² + 5x + 3 = 0"*), `Shiksha AI` calls the `hand_off_to_math_specialist` tool.
* The session updates dynamically via `session.update_agent(math_specialist)` while retaining the full `session.history` array.
* The **Maths Practice Specialist AI** takes over seamlessly, greets the student, and uses the `solve_math_step_by_step` tool without asking the student to re-explain the problem!

---

## 🛠️ The Hardest Bugs I Had to Solve

### Bug #1: The Hinglish Code-Switching Latency Trap
* **The Problem**: Standard STTs frequently misheard English technical terms mixed into Hindi sentences (e.g. transcribing "quadratic equation" as random Devanagari noise). If the STT output garbage, the LLM took extra time trying to make sense of it, spiking latency past 1.5 seconds.
* **The Fix**: Paired Deepgram Nova-3's `multi` language model with Murf Falcon TTS. Deepgram correctly captures mixed Devanagari and Latin script text, and Murf Falcon streams the output audio within 55ms, keeping the conversation instantaneous.

### Bug #2: Context Wipeout During Agent Handoffs
* **The Problem**: On the first iteration of `session.update_agent()`, the newly active `MathsPracticeSpecialist` agent wiped out the conversation buffer, responding with a generic *"Hello, how can I help you?"* right after the main agent had already promised to solve the quadratic equation.
* **The Fix**: Passed the active `session.history` array into the specialist agent's initialization parameters. The specialist immediately scans the existing transcript context and jumps straight into the step-by-step solution.

### Bug #3: Voice PII Scrubbing on Human Escalations
* **The Problem**: When a student gets repeatedly stuck on a concept or has an exam dispute, `Shiksha AI` escalates the issue to a human teacher via a **Discord Webhook** and SQLite ticket. However, students occasionally blurt out phone numbers, OTPs, or Aadhaar numbers during voice calls.
* **The Fix**: Implemented a backend regex sanitizer (`sanitize_summary` in `src/db.py`) that scrubs passwords, 6-digit OTPs, and 12-digit Aadhaar patterns from the transcript summary *before* creating the database record or sending the Discord alert card.

---

## 💻 Code Breakdown: Core Implementation Snippets

### 1. Initializing Murf Falcon TTS in LiveKit (`src/agent.py`)
```python
from livekit.plugins import murf, deepgram, google
from livekit.agents import AgentSession

# Setup Murf Falcon Streaming TTS (55ms latency with authentic Indian accent)
tts_engine = murf.TTS(
    api_key=os.getenv("MURF_API_KEY"),
    voice="en-IN-falcon-female",
    style="conversational",
)

session = AgentSession(
    stt=deepgram.STT(model="nova-3-multi"),
    llm=google.LLM(model="gemini-1.5-flash"),
    tts=tts_engine,
)
```

### 2. Human Escalation with PII Scrubbing (`src/tools.py`)
```python
@llm.function_tool
async def create_escalation(
    caller_name: str,
    phone_number: str,
    issue_category: str,
    summary: str,
    user_consent_given: bool
) -> str:
    """Escalates complex issues to human teachers after explicit consent."""
    if not user_consent_given:
        return "ERROR: Consent was not provided by caller. Ticket creation aborted."
    
    # Redact sensitive PII before storing
    clean_summary = sanitize_summary(summary)
    
    ticket_id = save_human_escalation_ticket(
        caller_name=caller_name,
        phone_number=phone_number,
        category=issue_category,
        summary=clean_summary
    )
    
    # Trigger Discord Webhook Notification asynchronously
    await send_discord_escalation_alert(ticket_id, caller_name, clean_summary)
    
    return f"SUCCESS: Escalation logged (Ref ID: {ticket_id}). Teacher will call back in 2-4 hours."
```

### 3. Specialist Agent Handoff Tool (`src/agent.py`)
```python
@llm.function_tool
async def hand_off_to_math_specialist(session: AgentSession) -> str:
    """Transfers the live voice session to the Maths Practice Specialist AI."""
    # Spoken announcement to the learner
    await session.say("I am transferring you to our Maths Practice Specialist AI now!")
    
    # Update session agent while preserving session.history context
    math_specialist = MathsPracticeSpecialist()
    await session.update_agent(math_specialist)
    
    return "SUCCESS: Handed off conversation to MathsPracticeSpecialist."
```

---

## 🧪 Testing & Verification

To verify that all 10 days of features remain stable, I wrote automated Pytest suites covering guardrail compliance, tool invocations, outbound telephony status handling, human escalation ticket creation, analytics logging, and handoff transitions:

```bash
cd backend
python -m pytest tests/
```

```text
============================= 32 passed in 55.35s =============================
tests/test_agent.py            ... (3/3 passed)
tests/test_day2_guardrails.py   .... (4/4 passed)
tests/test_day5_tools.py        ...... (6/6 passed)
tests/test_day6_outbound.py     ..... (5/5 passed)
tests/test_day7_escalation.py   ...... (6/6 passed)
tests/test_day8_analytics.py    .... (4/4 passed)
tests/test_day9_handoff.py      .... (4/4 passed)
```

---

## 🚀 Quickstart: Run Shiksha AI in 2 Minutes

Want to test or inspect the codebase yourself? Follow these simple steps:

### 1. Clone the Repository
```bash
git clone https://github.com/jaysid97/Ten-day-of-voice-challenges-bharat-edition.git
cd Ten-day-of-voice-challenges-bharat-edition
```

### 2. Configure Environment Keys
Copy `.env.example` to `murf-livekit-starter/backend/.env.local`:
```env
LIVEKIT_URL=wss://your-livekit-project.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
MURF_API_KEY=your_murf_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key
GOOGLE_API_KEY=your_google_gemini_api_key
```

### 3. Launch the Application
* **Windows (PowerShell)**:
  ```powershell
  .\start_app.ps1
  ```
* **macOS / Linux (Bash)**:
  ```bash
  chmod +x start_app.sh
  ./start_app.sh
  ```

Open `http://localhost:3000` in your browser, click **"Start Conversation"**, grant mic permissions, and start talking to Shiksha AI!

---

## 🔮 What's Next for Shiksha AI?

1. **Offline Voice Caching**: Caching common NCERT definitions directly on mobile devices to support learners in rural areas with poor 3G/4G connectivity.
2. **South Indian Language Expansion**: Extending native voice models to Tamil, Telugu, Kannada, and Malayalam.
3. **Multi-Modal Interactive Whiteboard**: Rendering real-time math diagrams and geometric shapes alongside Murf Falcon voice explanations.

---

## 🔗 Project Links & Credits

* 💻 **Open-Source Codebase**: [github.com/jaysid97/Ten-day-of-voice-challenges-bharat-edition](https://github.com/jaysid97/Ten-day-of-voice-challenges-bharat-edition)
* 🎙️ **TTS Provider**: [Murf Falcon TTS (55ms Latency)](https://murf.ai/)
* 📦 **Transport Engine**: [LiveKit Agents](https://livekit.io/)

---

### 💼 LinkedIn Share Template (#VoiceForBharat)

```text
🎉 Day 10 of 10 Days of Voice Agents: Sharing My Voice AI Journey! 🎙️🇮🇳 #VoiceForBharat

Over the past 10 days, I built Shiksha AI (शिक्षा AI) — a Human-Type AI Voice Tutor designed for learners across Bharat (EdTech Track)!

What started as a simple real-time voice pipeline evolved into an enterprise-grade voice agent featuring:
✨ Ultra-fast 55ms Indian Voice synthesis powered by Murf Falcon TTS
🧠 Persistent Learner Memory & Hard Consent Rules (SQLite DB)
🛠️ Live Domain Tools (NCERT Wikipedia REST API & Dictionary Integration)
📞 Outbound Telephony & Mandatory 2-Sentence Opening Scripts (LiveKit SIP & Twilio)
🚨 Human Escalation Engine with PII Scrubbing & Discord Webhooks
📊 Real-Time Call Analytics Dashboard (/analytics)
🧮 Multi-Agent Specialist Handoffs (MathsPracticeSpecialist AI)

The highlight of this journey was building with Murf Falcon TTS — hands down the fastest, most natural-sounding Text-to-Speech API for Indian accents and multilingual speech!

📖 Read my complete step-by-step guide & architecture breakdown:
https://dev.to/jaysid97/how-i-built-a-real-time-multilingual-ai-voice-tutor-for-bharat-and-solved-the-55ms-latency-problem-1epc

💻 Inspect the open-source code on GitHub:
https://github.com/jaysid97/Ten-day-of-voice-challenges-bharat-edition

A huge thank you to @Murf AI for organizing the 10 Days of Voice Agents — VoiceForBharat Edition! 🚀

#VoiceForBharat #MurfAI #VoiceAI #EdTech #ArtificialIntelligence #LiveKit #Python #NextJS #WebRTC #BuildInPublic #BharatAI
```

---

*Thanks for reading! If you're building real-time voice applications or experimenting with LiveKit and Murf AI, drop a comment or reach out — I'd love to swap notes!*
