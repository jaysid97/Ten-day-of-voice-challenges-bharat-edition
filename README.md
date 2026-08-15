# 🎙️ #VoiceForBharat — 10 Days of Voice AI Challenge (Bharat Edition)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) 
[![Murf Falcon](https://img.shields.io/badge/TTS-Murf%20Falcon%20(55ms)-6366F1)](https://murf.ai/api/docs/text-to-speech/streaming) 
[![LiveKit](https://img.shields.io/badge/Transport-LiveKit%20Agents-002cf2)](https://docs.livekit.io) 
[![Deepgram](https://img.shields.io/badge/STT-Deepgram%20Nova--3%20Multi-13EF95)](https://deepgram.com) 
[![Gemini LLM](https://img.shields.io/badge/LLM-Google%20Gemini-4285F4)](https://aistudio.google.com/) 
[![SQLite](https://img.shields.io/badge/Database-SQLite%20(Persistent%20Memory)-003B57)](https://www.sqlite.org/)

Welcome to the **10 Days of Voice AI Challenge (#VoiceForBharat)** repository featuring **Shiksha AI (शिक्षा AI)** — a Human-Type AI Voice Tutor built for Bharat (EdTech Track).

**Shiksha AI** is an empathetic, patient, and multi-subject AI voice tutor that speaks fluent English, Hindi (native Devanagari script), and Hinglish. It features persistent SQLite learner memory, explicit caller consent rules, live REST API domain tools for multi-subject and language learning, memory tool chaining, and graceful out-loud failure fallbacks.

---

## 📂 10 Days Challenge Progress Tracker

| Day | Focus / Theme | Agent Name | Guide & Highlights | Status |
|---|---|---|---|:---:|
| **Day 1** | Voice Setup & LiveKit Engine | **IndicVox AI** | Real-time audio pipeline with Murf Falcon TTS & LiveKit | ✅ Completed |
| **Day 2** | Persona, Objectives & Guardrails | **Shiksha AI** | Hard refusals on ADHD/medical diagnosis, zero shaming, Hinglish support | ✅ Completed |
| **Day 3** | Smart Classroom UI & 5 States | **Shiksha AI** | Human character avatar, 5 Agent States, Mic unblock modal, EN/Hindi toggle | ✅ Completed |
| **Day 4** | Persistent Memory & Consent | **Shiksha AI** | SQLite database (`agent_memory.db`), learner facts, returning caller recognition, explicit consent rule | ✅ Completed |
| **Day 5** | Domain Tools & Multi-Subject Engine | **Shiksha AI** | [DAY5_GUIDE.md](./DAY5_GUIDE.md): Live Educational API, multi-subject & language learning, Day 4 tool chaining, graceful out-loud fallbacks | ✅ Completed |
| **Day 6** | Outbound Calls & Telephony | **Shiksha AI** | [DAY6_GUIDE.md](./DAY6_GUIDE.md): LiveKit SIP/Twilio outbound dispatch, 2-sentence opening script (Who, Why, Opt-Out), SQLite call log, outcome & retry rules | ✅ Completed |
| **Day 7** | Know When to Ask for Human Help | **Shiksha AI** | [DAY7_GUIDE.md](./DAY7_GUIDE.md): Human escalation tool (`create_escalation`), hard consent rule, PII scrubbing, SQLite & Discord Webhook tickets, live admin dashboard | ✅ Completed |
| **Day 8** | Track Performance & Call Analytics | **Shiksha AI** | [DAY8_GUIDE.md](./DAY8_GUIDE.md): Call metrics, SQLite `call_analytics` schema, real-time `/analytics` dashboard, failure category breakdown & automated tests | ✅ Completed |
| **Day 9** | Hand Off to a Specialist Agent | **MathsPracticeSpecialist** | [DAY9_GUIDE.md](./days/day9/DAY9_GUIDE.md): Multi-agent session handoff (`session.update_agent`), shared history context, bi-directional handback, universal step-by-step math solver tool | ✅ Completed |
| **Day 10** | Share Your Voice Agent Journey | **Shiksha AI** | [DAY10_GUIDE.md](./days/day10/DAY10_GUIDE.md) & [DAY10_BLOG_POST.md](./DAY10_BLOG_POST.md): Published blog post, architecture breakdown, engineering challenges, quick start guide & LinkedIn share | ✅ Completed |

---

## 🏗️ Architecture & Data Pipeline

```mermaid
flowchart TD
    User[🎙️ Learner / Outbound Caller] -->|Audio Stream / SIP| STT[Deepgram STT Nova-3 Multi]
    STT -->|Text Transcript| LLM[Google Gemini LLM]
    
    subgraph Memory, Outbound & Domain Tools Layer
        LLM <-->|DB Lookup / Save / Opt-Out| SQLite[(SQLite DB: agent_memory.db)]
        LLM <-->|Outbound Dispatch / Retry Engine| OutboundScript[src/outbound_call.py]
        LLM <-->|Live Concept Fetch| WikiAPI[Wikipedia Educational REST API]
        LLM <-->|Live Dictionary Lookup| DictAPI[Free Dictionary REST API]
        WikiAPI -->|Timeout / Fallback| OfflineNCERT[Offline NCERT Curriculum Dataset]
    end
    
    LLM -->|Mandated 2-Sentence Opening / Spoken Response| TTS[Murf Falcon Streaming TTS]
    TTS -->|High-Quality Audio| Transport[LiveKit Agent WebRTC / SIP Transport]
    Transport -->|Audio Output| Speaker[🔊 Learner Hears Shiksha AI]

    style User fill:#1E293B,stroke:#38BDF8,color:#fff
    style STT fill:#064E3B,stroke:#10B981,color:#fff
    style LLM fill:#1E1B4B,stroke:#818CF8,color:#fff
    style SQLite fill:#78350F,stroke:#F59E0B,color:#fff
    style OutboundScript fill:#831843,stroke:#F43F5E,color:#fff
    style WikiAPI fill:#0284C7,stroke:#38BDF8,color:#fff
    style DictAPI fill:#4C1D95,stroke:#C084FC,color:#fff
    style OfflineNCERT fill:#881337,stroke:#F43F5E,color:#fff
    style TTS fill:#065F46,stroke:#34D399,color:#fff
    style Transport fill:#1E293B,stroke:#F59E0B,color:#fff
    style Speaker fill:#1E293B,stroke:#10B981,color:#fff
```

---

## ⚡ Quick Start Guide (Run Locally in 2 Minutes)

### Step 1: Environment Setup
1. Copy `murf-livekit-starter/backend/.env.example` to `murf-livekit-starter/backend/.env.local`
2. Copy `murf-livekit-starter/frontend/.env.example` to `murf-livekit-starter/frontend/.env.local`
3. Add your API keys in `backend/.env.local`:
   - `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` ([LiveKit Cloud](https://cloud.livekit.io/))
   - `MURF_API_KEY` ([Murf AI](https://murf.ai/))
   - `DEEPGRAM_API_KEY` ([Deepgram](https://deepgram.com/))
   - `GOOGLE_API_KEY` ([Google AI Studio](https://aistudio.google.com/))

### Step 2: Run Application
- **Windows (PowerShell)**:
  ```powershell
  .\start_app.ps1
  ```
- **macOS / Linux (Bash)**:
  ```bash
  chmod +x start_app.sh
  ./start_app.sh
  ```
Open **`http://localhost:3000`** in your browser!

---

## 🌟 Key Features Highlighted by Day

### 📞 Day 6 Highlight: Make Outbound Calls & Telephony Integration
- **Outbound Use Case**: Scheduled Daily NCERT Practice Call for Learning & Literacy track (Science, Math, Spoken English).
- **Mandated 2-Sentence Opening Script (Step 4)**:
  1. *Who is calling & Why*: *"नमस्ते Ramesh जी! मैं शिक्षा AI बोल रहा हूँ, आपकी डेली 5-मिनट NCERT साइंस प्रैक्टिस कॉल के लिए।"*
  2. *How to Opt Out*: *"अगर आप ये कॉल्स बंद करना चाहते हैं, तो बस 'स्टॉप' या 'कॉल्स बंद करो' बोल दें।"*
  3. *Value Delivery*: *"आज हम NCERT Class 10 Biology Photosynthesis रिवाइज करेंगे। क्या आप शुरू करने के लिए तैयार हैं?"*
- **Telephony & Dispatcher Script (`src/outbound_call.py`)**: LiveKit SIP API and Twilio integration launcher with CLI parameters (`--to`, `--name`, `--topic`, `--outcome`).
- **Advanced Outcome Handling & Retry Rules**:
  - `ANSWERED`: Completed interaction.
  - `NO_ANSWER`: Schedules Retry 1 after 15 minutes (Max 3 retries).
  - `BUSY`: Schedules Retry 1 after 5 minutes (Max 3 retries).
  - `VOICEMAIL`: Drops spoken audio message drop ("This is Shiksha AI with your practice call..."), then hangs up.
  - `OPT_OUT`: Persists opt-out preference to SQLite database `agent_memory.db` (`opt_out = 1`) and blocks future dispatches.

### 🚨 Day 7 Highlight: Know When to Ask for Human Help & Escalations
- **Step 1 (2 Escalation Reasons)**:
  1. *Frustrated Learner / Teacher Request*: Learner is upset, stuck repeatedly on a concept (calculus/fractions), or explicitly asks to talk to a human teacher.
  2. *Exam, Certificate & Administrative Policy Dispute*: Official CBSE hall ticket errors, marks re-checking disputes, or fee/scholarship issues requiring human authority.
- **Step 2 & 3 (Human Help Tool & PII Sanitization)**:
  - `@llm.function_tool create_escalation(...)` in `src/tools.py`.
  - Automatic PII scrubbing (`sanitize_summary` in `src/db.py`) redacts passwords, OTPs, PINs, bank accounts, and Aadhaar numbers before saving/dispatching.
- **Step 4 (Hard Consent Rule)**:
  - Agent explicitly asks for permission (*"I can submit a support ticket to a senior teacher with your name, topic, and contact number. Do I have your permission to share these details and create the ticket?"*) BEFORE invoking `create_escalation`. If user denies consent, ticket creation is aborted.
- **Step 5 (Send Request Somewhere Real)**:
  - **SQLite Database**: Table `human_help_requests` stores all structured tickets with reference IDs.
  - **Discord Webhook**: Sends formatted markdown Embed Cards to Discord (`DISCORD_WEBHOOK_URL`) with urgency colors.
  - **Next.js Admin Dashboard**: Live escalation requests center tab with real-time status filtering (`ALL`, `OPEN`, `IN_PROGRESS`, `RESOLVED`) and single-click action buttons.
- **Step 6 (Clear Next Step & Reference ID)**:
  - Agent speaks generated Reference ID aloud (e.g., `REF-84920`) and states honest timeline: *"A senior teacher will review your request and contact you within 2 to 4 hours."*
- **Advanced Features**:
  - Duplicate request prevention (updates existing open ticket for identical caller/category).
  - Urgency level classification (`low`, `medium`, `high`, `emergency`).
  - Interactive status update lifecycle controls (`OPEN` -> `IN_PROGRESS` -> `RESOLVED`).

---

## 🌟 Key Features Highlighted by Day

### 🌟 Day 3 Highlight: Smart Classroom UI & 5 Agent States
- **Human-Type AI Tutor Avatar**: Interactive avatar with smooth skin tones, blinking pupils, animated voice mouth equalizer, and ambient aura lighting.
- **5 Explicit Agent States**:
  1. 🟢 **Ready**: Single clear start button on Welcome Screen
  2. 🟡 **Connecting**: Live connection wait status
  3. 🟢 **Listening**: *"Listening to you... (आपकी बात सुन रहे हैं)"* badge
  4. 🟠 **Speaking**: *"Shiksha AI is speaking..."* saffron aura
  5. 🔴 **Call Ended**: Session summary with 1-click restart option
- **Microphone Error Handling**: Step-by-step browser unblock modal in English & Hindi.
- **Dual-Language UI**: Toggle `[ 🌐 EN ∣ 🇮🇳 हिन्दी ]` for all UI text.

### 🧠 Day 4 Highlight: Persistent Memory, Tools & User Consent
- **SQLite Database Memory (`agent_memory.db`)**: Stores learner identity, preferred language register, current grade level, topics covered, repeated struggles, and target study goals.
- **LLM Function Tools**:
  - `lookup_caller(user_id_or_name)`: Reads caller history from SQLite.
  - `save_caller_facts(...)`: Saves learner profile into SQLite.
  - `forget_caller(user_id_or_name)`: Permanently erases caller records upon request.
- **Hard Consent Rule**: The agent ALWAYS asks explicit permission (*"क्या मैं आपका लर्निंग डेटा और टॉपिक्स सेव कर लूँ?"*) BEFORE invoking `save_caller_facts`. If the caller says "No", no data is stored.
- **Returning Learner Greeting**: Automatically recognizes returning callers on call start and welcomes them back by name (*"नमस्ते रमेश जी! पिछली बार हमने Class 8 Math fractions पढ़ा था..."*).

### 🛠️ Day 5 Highlight: Real Domain Tools, Multi-Subject & Language Learning
- **Real Domain Tools (`src/tools.py`)**:
  - `fetch_ncert_exercise_and_syllabus`: Connects to live Wikipedia REST API to fetch concept summaries and practice questions for any subject.
  - `fetch_language_lesson_and_vocabulary`: Teaches lessons, script guides, greetings, and spoken practice exercises for ANY language.
  - `fetch_subject_quiz_and_solution`: Generates educational practice quizzes with step-by-step solutions.
  - `lookup_word_meaning_and_origin`: Queries live dictionary API for definitions, phonetics, and origins.
- **Multi-Subject & Multi-Language Support**:
  - **Subjects**: Mathematics, Physics, Chemistry, Biology, History, Geography, Civics, Economics, Computer Science / Coding, General Knowledge, Literature.
  - **Languages**: Hindi, Sanskrit, Tamil, Telugu, Marathi, Gujarati, Bengali, Punjabi, Kannada, Malayalam, Spoken English, French, Spanish, German, Japanese.
- **Day 4 + Day 5 Memory Tool Chaining**: Automatically inspects saved grade/language level from Day 4 SQLite memory if omitted by the user (e.g. asking for *"exercise on Light"* auto-retrieves *"Class 10 Science"*).
- **Graceful Out-Loud Failure Path**: Catches HTTP timeouts/network errors and explicitly speaks the failure state aloud (*"The live network connection timed out, but here is the official NCERT offline curriculum..."*) with zero silence or hallucinations.
- **Timestamped Attribution**: All returned data is timestamped (*"Sourced live as of today (2026-08-10)"*).
- **Smoother Character Skin & UI HUD**: Redesigned tutor avatar with silky warm skin gradients, cheek blush, eye highlights, and a live Multi-Subject HUD status header in the script layout.

### 📊 Day 8 Highlight: Real-Time Call Analytics & Performance Dashboard
- **Key Call Metrics Engine**: Tracks Total Calls, Success Rate (%), Failure Categories, Tool Frequencies, and Call Duration.
- **SQLite Persistence**: Schema `call_analytics` logs metrics directly during session teardown.
- **Failure Taxonomy**: Categorizes failures (`STT_SPEECH_RECOGNITION_ERROR`, `NETWORK_API_TIMEOUT`, `LLM_GUARDRAIL_REFUSAL`, `LEARNER_DISCONNECTED`).
- **Interactive Next.js Dashboard (`/analytics`)**: Real-time KPI cards, failure distribution progress bars, history table with 3s polling, and single-click call simulation controls.

---

## 📁 Repository Directory Structure

```text
ten-day-voice-agent-bharat-edition/
├── DAY1_GUIDE.md            # Day 1 Setup Guide
├── DAY2_GUIDE.md            # Day 2 Persona & Guardrails Guide
├── DAY3_GUIDE.md            # Day 3 Frontend & 5 Agent States Guide
├── days/
│   └── day9/
│       └── DAY9_GUIDE.md        # Day 9 Specialist Agent Handoff Guide
├── DAY4_GUIDE.md            # Day 4 SQLite Memory & Consent Guide
├── DAY5_GUIDE.md            # Day 5 Real Domain Tools & Multi-Subject Guide
├── DAY6_GUIDE.md            # Day 6 Outbound Calls & Telephony Guide
├── DAY7_GUIDE.md            # Day 7 Know When to Ask for Human Help Guide
├── DAY8_GUIDE.md            # Day 8 Real-Time Call Analytics & Performance Dashboard Guide
├── README.md                # Main Repository Readme
├── start_app.ps1            # Windows Application Starter Script
├── start_app.sh             # Linux/macOS Application Starter Script
├── backend -> murf-livekit-starter/backend (Symlink)
├── frontend -> murf-livekit-starter/frontend (Symlink)
└── murf-livekit-starter/
    ├── backend/             # LiveKit Python Agent Backend
    │   ├── src/
    │   │   ├── agent.py     # Main Shiksha AI Agent & Maths Practice Specialist
    │   │   ├── tools.py     # Day 5 Domain Tools, Day 9 Universal Step-by-Step Math Solver
    │   │   ├── db.py        # SQLite Memory, Outbound Logs, Escalations & Analytics DB
    │   │   └── outbound_call.py # Day 6 SIP/Twilio Outbound Dispatcher Script
    │   └── tests/
    │       ├── test_day5_tools.py      # Pytest Suite for Day 5 Domain Tools
    │       ├── test_day6_outbound.py   # Pytest Suite for Day 6 Outbound Telephony
    │       ├── test_day7_escalation.py # Pytest Suite for Day 7 Human Escalations
    │       ├── test_day8_analytics.py  # Pytest Suite for Day 8 Call Analytics
    │       └── test_day9_handoff.py    # Pytest Suite for Day 9 Multi-Agent Handoff
    └── frontend/            # Next.js 15 Smart Classroom Web App
        ├── app/             # App Router Pages, Token, Escalation & Analytics API Endpoints
        └── components/
            ├── app/
            │   ├── human-ai-tutor.tsx  # Dynamic Avatar & Floating Math HUD
            │   └── welcome-view.tsx    # Day 9 Specialist Agent Handoff HUD
            └── agents-ui/
                ├── agent-state-header.tsx    # Dynamic Active Agent & Handoff Badges
                └── agent-chat-transcript.tsx # Smart Classroom HUD & Math Speech Bubbles
```

---

## 🧪 Running Automated Unit Tests

To run the automated pytest unit test suites across all challenge days:
```powershell
cd backend
& "d:\ten day voice agent bharat edition\backend\.venv\Scripts\python.exe" -m pytest tests/test_day9_handoff.py tests/test_day8_analytics.py tests/test_day7_escalation.py tests/test_day6_outbound.py tests/test_day5_tools.py
```

---

## 🧮 Day 9 Highlight: Hand Off to a Specialist Agent
- **Track**: Learning & Literacy (EdTech - Bharat Edition)
- **Main Agent**: `Shiksha AI (शिक्षा AI)` — AI Learning Tutor for general subjects, languages, quizzes, and caller memory.
- **Specialist Agent**: `MathsPracticeSpecialist (गणित विशेषज्ञ AI)` — Dedicated Maths Practice Specialist.
- **Bi-Directional Handoff**: `hand_off_to_math_specialist` and `hand_off_to_main_agent` dynamically update active session agent via `session.update_agent()`.
- **Zero Context Loss**: Preserves full `session.history` across agent transitions.
- **Universal Math Solver Tool (`solve_math_step_by_step`)**: Step-by-step solver covering algebra, quadratic equations, linear equations, fractions, geometry, trigonometry, calculus, percentages, and arithmetic.
- **Real-Time HUD Sync**: Participant attributes broadcast (`active_agent`) triggers dynamic badges, toast alerts, floating math symbols (`√x`, `ax²+bx+c`, `π`), and emerald speech bubbles.

---

## ✍️ Day 10 Highlight: Share Your Voice Agent Journey
- **Blog Article**: Complete, ready-to-publish post available in [`DAY10_BLOG_POST.md`](./DAY10_BLOG_POST.md).
- **Challenge Guide**: Complete Day 10 documentation available in [`DAY10_GUIDE.md`](./days/day10/DAY10_GUIDE.md).
- **Key Coverage**:
  - **The Vision**: Problem statement for Indian learners (tuition cost, language barrier, shaming fear, friction of text interfaces).
  - **Feature Highlights**: Murf Falcon 55ms streaming TTS, guardrails, 5 UI states, persistent SQLite memory & consent, domain APIs, outbound SIP calls, human escalation with PII scrubbing, `/analytics` dashboard, and multi-agent handoffs.
  - **Engineering Lessons**: Code-mixed speech latency tuning, multi-agent context retention (`session.history`), and voice PII scrubbing & explicit consent enforcement.
  - **Builder's Guide**: Architectural breakdown, `.env.local` security, 2-minute quickstart guide, public repository link, and production code snippets.
  - **LinkedIn Post**: Published share post with `#VoiceForBharat` and `@Murf AI` handle tagging.

---

## 📄 License & Credits

Built with ❤️ for **#VoiceForBharat** — 10 Days of Voice Challenge by [Murf AI](https://murf.ai/).  
Licensed under the [MIT License](LICENSE).
