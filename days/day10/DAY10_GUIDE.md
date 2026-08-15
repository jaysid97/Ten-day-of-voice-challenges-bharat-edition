# Day 10 Guide — Share Your Voice Agent Journey (#VoiceForBharat)

This guide provides complete documentation, architectural breakdown, blog post guidelines, LinkedIn templates, and submission instructions for **Day 10: Share Your Voice Agent Journey** featuring **Shiksha AI (शिक्षा AI)** for the **Learning & Literacy Track** (EdTech - Bharat Edition).

---

## 1. Summary of Day 10 Implementation & Achievements

- **Track**: Learning & Literacy (EdTech - VoiceForBharat Edition)
- **Agent Name**: `Shiksha AI (शिक्षा AI)` & `MathsPracticeSpecialist (गणित विशेषज्ञ AI)`
- **Core Technology Stack**:
  - **TTS**: Murf Falcon Streaming TTS (Ultra-low 55ms latency, authentic Indian voice synthesis)
  - **STT**: Deepgram Nova-3 Multi-Language STT (Real-time English, Devanagari Hindi, and code-mixed Hinglish recognition)
  - **LLM**: Google Gemini (Empathetic reasoning, guardrail compliance, tool invocation)
  - **Transport**: LiveKit Agents (WebRTC real-time voice & SIP telephony integration)
  - **Database**: SQLite (`agent_memory.db`) for learner memory, call logs, human escalation tickets, and call analytics.
- **Blog Post Format**: Combination of **Project Story** and **Step-by-Step Builder Guide**.
- **Public Repository**: [jaysid97/Ten-day-of-voice-challenges-bharat-edition](https://github.com/jaysid97/Ten-day-of-voice-challenges-bharat-edition)

---

## 2. Full System Architecture Diagram

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

---

## 3. Day 10 Verification & Feature Checklist

| Step / Requirement | Feature & Implementation Detail | Status |
| :--- | :--- | :---: |
| **Step 1: Choose Format** | Combined Project Story + Step-by-Step Builder Guide | ✅ Complete |
| **Step 2: Agent Intro** | Introduced **Shiksha AI** (EdTech Track for Bharat, solving tuition cost, language barrier & fear of shaming) | ✅ Complete |
| **Step 3: Key Features** | Covered Murf Falcon TTS, Guardrails, Smart Classroom UI (5 States), Memory & Consent, Domain Tools, Outbound SIP, Human Escalation, Analytics Dashboard, and Specialist Handoff | ✅ Complete |
| **Step 4: Real Challenges** | Detailed 3 major engineering hurdles: Code-mixed latency, Multi-agent state sync, and Voice PII & hard consent enforcement | ✅ Complete |
| **Step 5: Reader Guide** | Clear breakdown of STT, LLM, TTS, Transport; Step-by-step setup, `.env.local` security, testing guide, and public repo link | ✅ Complete |
| **Step 6: Build Evidence** | Mermaid architecture diagram, 5 key code snippets, and Pytest verification results | ✅ Complete |
| **Step 7: Blog Article** | Complete ready-to-publish Markdown article saved in [`DAY10_BLOG_POST.md`](../../DAY10_BLOG_POST.md) | ✅ Complete |
| **Step 8: LinkedIn Post** | Professional LinkedIn template highlighting Murf Falcon TTS, #VoiceForBharat, and @Murf AI tag | ✅ Complete |
| **Step 9: Submission Ready** | Submission links prepared for Discord Google Form submission | ✅ Complete |

---

## 4. Key Engineering Lessons & Hard Problems Solved

### Challenge 1: Code-Mixed Speech Recognition & Latency Tuning
- **Problem**: Indian learners naturally code-switch between English, Hindi, and regional terms (Hinglish). Standard single-language STTs suffered high error rates on Devanagari/Latin script transitions, while multi-lingual LLM responses often introduced output delays.
- **Solution**: Paired **Deepgram Nova-3 Multi-Language STT** with **Murf Falcon Streaming TTS**. Murf Falcon's ultra-low **55ms streaming latency** allows instantaneous speech synthesis as soon as LLM tokens emerge, rendering multi-lingual voice conversations fluid and natural.

### Challenge 2: Context Retention Across Multi-Agent Handoffs
- **Problem**: Transferring a session from `Shiksha AI` to `MathsPracticeSpecialist` initially caused the new agent to lose prior conversation context, requiring learners to re-explain their math problems.
- **Solution**: Leveraged LiveKit's `session.update_agent(specialist)` which natively retains `session.history`. The specialist agent immediately inspects the shared history to resume problem-solving seamlessly without asking repetitive questions.

### Challenge 3: Voice Privacy, Hard Consent & PII Scrubbing
- **Problem**: Automated voice agents risking unauthorized data storage or exposing caller details (OTPs, bank accounts, Aadhaar numbers) when creating human escalation tickets.
- **Solution**: Implemented a **Hard Consent Rule** where the LLM explicitly asks permission aloud before invoking memory or escalation tools. Added an automated regex PII scrubber (`sanitize_summary`) in `src/db.py` to redact sensitive patterns prior to SQLite insertion or Discord webhook broadcasting.

---

## 5. Ready-to-Publish Blog Post & LinkedIn Share

- **Full Markdown Blog Article**: Saved locally in [`DAY10_BLOG_POST.md`](../../DAY10_BLOG_POST.md)
- **LinkedIn Post**: Included in Section 6 below and in the Blog Post.

---

## 6. LinkedIn Share Template (#VoiceForBharat)

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
[INSERT YOUR BLOG POST URL HERE]

💻 Inspect the open-source code on GitHub:
https://github.com/jaysid97/Ten-day-of-voice-challenges-bharat-edition

A huge thank you to @Murf AI for organizing the 10 Days of Voice Agents — VoiceForBharat Edition! 🚀

#VoiceForBharat #MurfAI #VoiceAI #EdTech #ArtificialIntelligence #LiveKit #Python #NextJS #WebRTC #BuildInPublic #BharatAI
```

---

## 7. Final Submission Checklist

1. ✍️ Copy the text from [`DAY10_BLOG_POST.md`](../../DAY10_BLOG_POST.md) and publish it on [DEV Community](https://dev.to/), [Hashnode](https://hashnode.com/), or [Medium](https://medium.com/).
2. 🔗 Copy the published blog post URL.
3. 💼 Post on **LinkedIn** using the template above, embedding your blog link and GitHub repository link.
4. 📝 Submit your LinkedIn post link in the official Google Form on Discord!
