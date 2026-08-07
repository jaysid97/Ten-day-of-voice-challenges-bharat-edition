# Day 2 Submission & Recording Guide — 10 Days of Voice Challenge (#VoiceForBharat)

This guide provides everything you need for **Day 2: Persona, Job & Limits**.

---

## 1. Summary of Day 2 Agent Setup
- **Agent Name**: Shiksha AI (Learning & Literacy Companion for Bharat)
- **Voice Engine**: Murf Falcon TTS (`Anisha`, `en-IN`, Conversation Style)
- **Brain (LLM)**: Gemini (`gemini-3.5-flash-lite`)
- **Speech Recognizer**: Deepgram Nova-3

---

## 2. 3-Part Video Recording Script

Record a short screen recording (30 to 60 seconds) showing your browser UI connected to the LiveKit voice agent. Demonstrating these 3 distinct moments:

### Scene 1: First-Turn Greeting
- **Action**: Connect to the agent via `start_app.ps1` (or frontend UI).
- **What happens**: The agent speaks automatically upon connection.
- **Agent Output**: *"Namaste! Main Shiksha AI hoon, aapka personal learning companion. Aaj hum kaunsa topic study karein ya practice karein?"*

### Scene 2: Code-Mixed (Hinglish) Exchange
- **User Says**: *"Mera English grammar thoda weak hai ji, kya aap mujhe past tense simple Hinglish mein samjha sakte ho?"*
- **Agent Output**: *"Bilkul dost! Past tense ka matlab hai jo kaam ho chuka hai. Jaise I studied yesterday, yani maine kal padhai ki thi."*

### Scene 3: Guardrail Refusal & Escalation
- **User Says**: *"Mera 8 saal ka beta padhai pe focus nahi kar pata, kya usko ADHD hai?"*
- **Agent Output**: *"Main doctor ya psychological expert nahi hoon. Learning disorder ya health guidance ke liye, kripya kisi certified doctor ya expert se consult karein."*

---

## 3. LinkedIn Post Description Template

Copy & paste this template when posting your video on LinkedIn:

```text
🚀 Day 2 of 10 Days of Voice Challenge — Giving My Voice Agent a Persona, Job & Guardrails! 🎙️

Yesterday my agent learned to speak. Today, it became someone with a clear mission and strict boundaries!

Introducing **Shiksha AI** 📚✨ — an empathetic Learning & Literacy Companion built for Bharat to help students practice spoken English, clarify concepts, and build learning confidence.

Key features built today:
1️⃣ **Defined Call Objectives**: Tailored learning, concept breakdown using Indian analogies, and supportive feedback.
2️⃣ **Code-Mixed Language Support**: Fluidly mirrors Hinglish (Hindi + English) registers naturally.
3️⃣ **Strict Guardrails**: Hard refusal to diagnose learning/medical conditions (e.g., ADHD/Dyslexia) with an automatic escalation script, and zero shaming of wrong answers!

Built using the ultra-fast Murf Falcon TTS API with LiveKit and Gemini! ⚡

#VoiceForBharat @Murf AI #VoiceAI #BuildInPublic #AI #GenerativeAI #EdTech #LiveKit #Bharat
```
