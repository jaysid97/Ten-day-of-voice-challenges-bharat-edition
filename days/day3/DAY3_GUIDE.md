# Day 3 Submission & Personalisation Guide — 10 Days of Voice Challenge (#VoiceForBharat)

This guide provides everything you need for **Day 3: Personalise Your Agent's Frontend**.

---

## 1. Summary of Day 3 Frontend Personalisation

- **Agent Name**: Shiksha AI (शिक्षा AI) — Learning & Literacy Companion for Bharat
- **Track**: EdTech & Literacy (Bharat Edition)
- **UI Aesthetic**: Cyber-Saffron (`#FF9933`), Electric Cyan (`#38BDF8`), and Deep Cyber Space Indigo with glassmorphism, responsive mobile layout, and NCERT Emblem badge.
- **Voice Engine**: Murf Falcon TTS (`Anisha`, `en-IN`, Conversation Style)
- **Brain (LLM)**: Gemini (`gemini-3.5-flash-lite`)

---

## 2. Verification of the 5 Agent States & Features

| State / Feature | Visual Indicator in Frontend UI | Description |
| :--- | :--- | :--- |
| **State 1: Ready** | `🟢 State 1: Agent Ready (तैयार)` + Glowing `[ 🎙️ Start Voice Session ]` Button | Agent has not started yet; 1 clear start button on Welcome Screen |
| **State 2: Connecting** | `🟡 Connecting... Please wait (जोड़ रहे हैं...)` Pulsing Sky Badge | Agent is joining the LiveKit room & warming up models |
| **State 3: Listening** | `🟢 🎤 Listening to you... (आपकी बात सुन रहे हैं)` Glowing Emerald Ring | Agent is actively listening to user speech via Deepgram Nova-3 |
| **State 4: Speaking** | `🟠 🔊 Shiksha AI is speaking... (Shiksha AI बोल रही है)` Saffron Aura | Agent is speaking via sub-300ms Murf Falcon TTS |
| **State 5: Call Ended** | `🔴 Call Ended (कॉन्वर्सेशन समाप्त)` Banner + `[ 🔄 Start Again / New Lesson ]` Button | Conversation is over; clear option to restart a new lesson |
| **Speaker Indication** | Active top state header badge + Murf Aura Waveform | Clear visual badge indicating who is currently speaking |
| **Mic Permission Handling** | `MicrophoneErrorModal` (🎙️❌ Mic Access Denied) | Modal with step-by-step browser permission fix in EN & HI |
| **Advanced Features** | Dual Language Toggle (`🌐 EN` / `🇮🇳 हिन्दी`) & Live Transcript Drawer | Real-time spoken text transcript + instant language switcher |

---

## 3. How to Run & Test the Complete Flow

1. Run the starter application script from PowerShell:
   ```powershell
   .\start_app.ps1
   ```
2. Open your browser at `http://localhost:3000`.
3. Verify **State 1 (Ready)**: Check the Welcome Screen, track badges, and the primary "Start Voice Session" button.
4. Click **Start Voice Session**: Watch **State 2 (Connecting)** appear with "Connecting... Please wait".
5. Observe **State 3 (Listening)** when you speak, and **State 4 (Speaking)** when Shiksha AI responds.
6. Click the toggle transcript icon to view the **Live Transcript**.
7. Click **END CALL** at the bottom: Verify **State 5 (Call Ended)** banner appears with the **"Start Again"** button.
8. (Optional) Block microphone access in your browser settings to verify the **Microphone Permission Error Modal**.

---

## 4. LinkedIn Post Description Template

Copy & paste this template when posting your Day 3 video on LinkedIn:

```text
🚀 Day 3 of 10 Days of Voice Challenge — Personalising My Agent's Frontend & 5 Agent States! 🎙️💻

Today, I designed and built a personalized, high-performance web frontend for my voice agent!

Introducing **Shiksha AI** 📚✨ — an empathetic AI Learning & Literacy Companion built for Bharat (EdTech Track).

Key features implemented on Day 3:
1️⃣ **5 Explicit Agent States**:
   • 🟢 Ready — 1 clear primary start button
   • 🟡 Connecting — Live wait status while joining the room
   • 🟢 Listening — "Listening to you... (आपकी बात सुन रहे हैं)"
   • 🟠 Speaking — "Shiksha AI is speaking... (Shiksha AI बोल रही है)"
   • 🔴 Call Ended — Dedicated session summary & "Start Again" button
2️⃣ **Speaker Indication & Audio Visualiser**: Dynamic aura waveform and real-time badges showing who is speaking.
33️ **Microphone Permission Handling**: Graceful error modal with step-by-step browser unblock guide in English & Hindi.
4️⃣ **Live Transcript & Dual-Language UI**: Real-time spoken transcript drawer + EN/Hindi UI toggle.

Powered by the ultra-fast Murf Falcon TTS API, LiveKit, Deepgram Nova-3, and Gemini! ⚡

#VoiceForBharat @Murf AI #VoiceAI #BuildInPublic #AI #GenerativeAI #EdTech #LiveKit #Bharat #FrontEndDev
```

---

## 5. Submission Checklist

- [x] Personalised frontend matching EdTech track (Shiksha AI)
- [x] Clear visual indicators for all 5 Agent States (Ready, Connecting, Listening, Speaking, Call Ended)
- [x] Speaker indication & live audio visualizer
- [x] Helpful microphone permission error modal
- [x] Complete conversation flow tested (Load → Connect → Talk → End → Restart)
- [ ] Screen recording video created showing the full flow
- [ ] Posted on LinkedIn tagging @Murf AI with hashtag #VoiceForBharat
- [ ] Form submitted on Discord
