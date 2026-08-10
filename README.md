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
| **Day 5** | The Tools & Real Domain Data | **Shiksha AI** | Live Educational API (`fetch_ncert_exercise_and_syllabus`), Day 4 tool chaining, graceful out-loud fallbacks |

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
