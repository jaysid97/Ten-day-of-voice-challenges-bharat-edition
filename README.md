# 🎙️ #VoiceForBharat — 10 Days of Voice AI Challenge (Bharat Edition)

Welcome to the **10 Days of Voice Challenge (#VoiceForBharat)** repository featuring **Shiksha AI (शिक्षा AI)** — a Human-Type AI Voice Tutor built for Bharat (EdTech Track).

Built using **Murf Falcon TTS API**, **LiveKit Agents**, **Gemini LLM**, and **Deepgram STT**.

---

## 📂 Challenge Progress Tracker

| Day | Focus / Theme | Agent Name | Status / Highlights |
|---|---|---|---|
| **Day 1** | Voice Setup & LiveKit Engine | **IndicVox AI** | Basic real-time voice pipeline setup |
| **Day 2** | Persona, Objectives & Guardrails | **Shiksha AI** | Hard refusals on ADHD/medical diagnosis, zero shaming, Hinglish support |
| **Day 3** | Personalised Frontend & 5 Agent States | **Shiksha AI** | Human AI character avatar, smart classroom UI, 5 Agent States, Mic error modal, EN/Hindi toggle |
| **Day 4** | Persistent Memory & Consent | **Shiksha AI** | SQLite database (`agent_memory.db`), learner facts, returning caller recognition, explicit consent rule |
| **Day 5** | The Tools & Real Domain Data | **Shiksha AI** | Live Educational API (`fetch_ncert_exercise_and_syllabus`), multi-subject & language learning, Day 4 tool chaining, graceful out-loud fallbacks |

---

## ⚡ Quick Start Guide (For GitHub Clones)

Anyone can clone this repository and run the voice agent locally in 2 simple steps:

### Step 1: Environment Setup
1. Copy `murf-livekit-starter/backend/.env.example` to `murf-livekit-starter/backend/.env.local`
2. Copy `murf-livekit-starter/frontend/.env.example` to `murf-livekit-starter/frontend/.env.local`
3. Add your API keys:
   - `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` ([LiveKit Cloud](https://cloud.livekit.io/))
   - `MURF_API_KEY` ([Murf AI](https://murf.ai/))
   - `DEEPGRAM_API_KEY` ([Deepgram](https://deepgram.com/))
   - `GOOGLE_API_KEY` ([Google AI Studio](https://aistudio.google.com/))

### Step 2: Run Application
Execute the starter script in PowerShell:
```powershell
.\start_app.ps1
```
Then open **`http://localhost:3000`** in your browser!

---

## 🌟 Day 3 Highlight: Shiksha AI (Smart Classroom Frontend)

- **Human-Type AI Tutor Avatar**: Character avatar with interactive expressions (blinking digital pupils when listening, animated voice mouth equalizer when speaking, warm smile when ready).
- **Smart Classroom UI**: Digital blackboard backdrop (`school-grid-bg`) with floating academic particles (`📖`, `✏️`, `∑(x)`, `A B C`).
- **5 Explicit Agent States**:
  1. 🟢 **Ready**: Single clear start button on Welcome Screen
  2. 🟡 **Connecting**: Live connection wait status
  3. 🟢 **Listening**: *"Listening to you... (आपकी बात सुन रहे हैं)"* badge
  4. 🟠 **Speaking**: *"Shiksha AI is speaking..."* saffron aura
  5. 🔴 **Call Ended**: Session summary with 1-click restart option
- **Microphone Error Handling**: Step-by-step browser unblock modal in English & Hindi.
- **Dual-Language UI**: Toggle `[ 🌐 EN ∣ 🇮🇳 हिन्दी ]` for all UI text.

---

## 🧠 Day 4 Highlight: Persistent Memory, Tools & User Consent

- **SQLite Database Memory (`agent_memory.db`)**: Stores learner identity, preferred language register, current grade level, topics covered, repeated struggles, and target study goals.
- **LLM Function Tools**:
  - `lookup_caller(user_id_or_name)`: Reads caller history from SQLite.
  - `save_caller_facts(...)`: Saves learner profile into SQLite.
  - `forget_caller(user_id_or_name)`: Permanently erases caller records upon request.
- **Hard Consent Rule**: The agent ALWAYS asks explicit permission (*"क्या मैं आपका लर्निंग डेटा और टॉपिक्स सेव कर लूँ?"*) BEFORE invoking `save_caller_facts`. If the caller says "No", no data is stored.
- **Returning Learner Greeting**: Automatically recognizes returning callers on call start and welcomes them back by name (*"नमस्ते रमेश जी! पिछली बार हमने Class 8 Math fractions पढ़ा था..."*).
- **Native Devanagari Hindi Script**: Generates clean Hindi in native Devanagari script for natural Murf Falcon Indian accent voice synthesis.

---

## 🛠️ Day 5 Highlight: Real Domain Tools, Multi-Subject & Language Learning

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
