# Day 6 Guide — Make Outbound Calls & Telephony Integration (#VoiceForBharat)

This guide provides complete documentation, architecture specs, testing procedures, video recording steps, and submission instructions for **Day 6: Make Outbound Calls** featuring **Shiksha AI (शिक्षा AI)** (Learning & Literacy Track).

---

## 1. Summary of Day 6 Implementation & Enhancements

- **Agent Name**: Shiksha AI (शिक्षा AI) — AI Learning & Literacy Tutor for Bharat
- **Track**: Learning & Literacy (EdTech - Bharat Edition)
- **Outbound Use Case (Step 1)**: **Scheduled Daily Practice & Study Call** (Automated daily practice session for returning learners like Ramesh/Priya at a chosen time for NCERT Math, Science, and Spoken English).
- **Telephony Integration (Step 2 & 3)**:
  - LiveKit SIP API (`CreateSIPParticipantRequest`) and Twilio SIP Trunking support.
  - Python Outbound Call Dispatcher script (`src/outbound_call.py`) supporting CLI triggering, token generation, and room metadata.
- **Mandated Spoken Opening Script (Step 4 - CRITICAL)**:
  - The first two sentences MUST state **who is calling**, **why**, and **how to make it stop / opt out**:
    - **Sentence 1 (Who & Why)**: *"नमस्ते Ramesh जी! मैं शिक्षा AI बोल रहा हूँ, आपकी डेली 5-मिनट NCERT साइंस प्रैक्टिस कॉल के लिए।"* / *"Hello Ramesh! This is Shiksha AI calling for your scheduled daily NCERT practice session."*
    - **Sentence 2 (How to Stop / Opt-Out)**: *"अगर आप ये कॉल्स बंद करना चाहते हैं, तो बस 'स्टॉप' या 'कॉल्स बंद करो' बोल दें।"* / *"If you wish to stop receiving these daily practice calls, just say 'stop' or 'opt out' at any time."*
    - **Sentence 3 (Value Delivery)**: *"आज हम NCERT Class 10 Biology Photosynthesis रिवाइज करेंगे। क्या आप शुरू करने के लिए तैयार हैं?"*
- **Outcome Handling & Retry Rules (Advanced Optional Feature)**:
  - `ANSWERED`: Call connected, delivered opening script, conducted practice session.
  - `NO_ANSWER`: Call unanswered after 30s. System logs `NO_ANSWER` in SQLite database `agent_memory.db` and schedules Retry 1 after 15 minutes (Max 3 retries).
  - `BUSY`: Call line busy / declined. System logs `BUSY` and schedules Retry 1 after 5 minutes (Max 3 retries).
  - `VOICEMAIL`: Answering machine detected. Agent drops concise spoken audio message: *"नमस्ते! मैं शिक्षा AI बोल रहा हूँ, आपकी NCERT प्रैक्टिस कॉल के लिए। फ्री होने पर कनेक्ट करें या STOP कहें। धन्यवाद!"*, then disconnects cleanly.
  - `OPT_OUT`: Learner says "stop", "opt out", "कॉल्स बंद करो", or "unsubscribe". Agent calls `opt_out_learner` tool, sets `opt_out = 1` in SQLite database, cancels future scheduled calls, confirms aloud, and ends session cleanly.
- **Frontend UI & Avatar Enhancements**:
  - **Day 6 Outbound Call HUD**: Added Day 6 Outbound Telephony Control Panel with active call badge (`📞 OUTBOUND SIP & RETRY ENGINE ACTIVE`), mandated 2-sentence opening script display box, and preset outcome scenario triggers.

---

## 2. Day 6 Verification Matrix

| Step / Requirement | Implementation Detail | Status |
| :--- | :--- | :--- |
| **Step 1: Track Outbound Use Case** | Daily scheduled practice & study call for Learning & Literacy track (NCERT Science/Math) | ✅ Complete |
| **Step 2: Telephony Integration** | LiveKit SIP API & Python Outbound Dispatcher script (`src/outbound_call.py`) | ✅ Complete |
| **Step 3: Complete Interaction** | Agent calls target number, delivers practice session, and responds in real-time | ✅ Complete |
| **Step 4: Mandated Opening Script** | First 2 sentences state Who is calling, Why, and How to Opt-Out (*"Namaste! This is Shiksha AI... say 'stop' to opt out"*) | ✅ Complete |
| **Step 5: Record Demonstration Video** | 30–60s video recording of outbound call ringing and 2-sentence opening script playing out | ✅ Ready |
| **Step 6: LinkedIn Post** | Share video on LinkedIn mentioning Murf Falcon TTS (55ms), #VoiceForBharat, and tag @Murf AI | ✅ Template Ready |
| **Step 7: Form Submission** | Submit LinkedIn post link, name, and email on official submission form | ✅ Instructions Included |
| **Advanced: Outcome Handling** | Handles `ANSWERED`, `NO_ANSWER` (15m retry), `BUSY` (5m retry), `VOICEMAIL` (message drop), and `OPT_OUT` (DB status) | ✅ Complete |

---

## 3. How to Run & Test Day 6 Features

### Step 1: Run Pytest Automated Suite
Run the Day 6 pytest suite to verify opening script structure, SQLite outcome logging, opt-out preferences, and retry delay logic:
```powershell
cd murf-livekit-starter/backend
& "d:\ten day voice agent bharat edition\murf-livekit-starter\backend\.venv\Scripts\python.exe" -m pytest tests/test_day6_outbound.py
```

### Step 2: Test Outbound Call Dispatcher via CLI
Trigger an outbound practice call simulation from PowerShell:
```powershell
cd murf-livekit-starter/backend
& "d:\ten day voice agent bharat edition\murf-livekit-starter\backend\.venv\Scripts\python.exe" src/outbound_call.py --name "Ramesh" --topic "NCERT Class 10 Science Photosynthesis" --outcome "ANSWERED"
```

To test Opt-Out behavior:
```powershell
& "d:\ten day voice agent bharat edition\murf-livekit-starter\backend\.venv\Scripts\python.exe" src/outbound_call.py --user_id "ramesh" --opt_out
```

To view Outbound Call History log:
```powershell
& "d:\ten day voice agent bharat edition\murf-livekit-starter\backend\.venv\Scripts\python.exe" src/outbound_call.py --history
```

### Step 3: Interactive Voice Testing in Web App
1. Run application starter:
   ```powershell
   .\start_app.ps1
   ```
2. Open **`http://localhost:3000`** in your browser.
3. Click **📞 Day 6 Outbound Calls** tab on the Welcome View.
4. Review the **Mandated 2-Sentence Opening Script** highlight box.
5. Click **Start Voice Session** and hear Shiksha AI deliver the opening script aloud via Murf Falcon TTS!

---

## 4. Recording Your Day 5 / Day 6 Demo Video

Record a short 30–60 second screen/phone video demonstrating Day 6:
1. **Phone Ringing & Call Opening**: Show the phone ringing / call connecting and agent speaking the mandated 2-sentence opening (*"Namaste! I am Shiksha AI calling for your daily NCERT practice... say 'stop' to opt out"*).
2. **Practice Session & Opt-Out**: Demonstrate a quick practice question or say *"Stop calls"* to show the agent executing the `opt_out_learner` tool and hanging up cleanly.

---

## 5. LinkedIn Post Template (#VoiceForBharat)

Copy & paste this template when sharing your Day 6 video on LinkedIn:

```text
🚀 Day 6 of #10DaysOfVoiceAgents — Outbound Automated Practice Calls with Telephony Integration! 📞🎙️

Today for #VoiceForBharat, I upgraded Shiksha AI (शिक्षा AI) — our Human-Type AI Voice Tutor for Bharat (Learning & Literacy Track) — to place OUTBOUND calls!

Making outbound calls is fundamentally different from inbound because the user didn't initiate the call. Following Step 4 guidelines, Shiksha AI opens every outbound call with a strict 2-sentence intro stating:
1️⃣ WHO is calling: "Namaste Ramesh! I am Shiksha AI..."
2️⃣ WHY: "...calling for your scheduled 5-minute NCERT daily practice session."
3️⃣ HOW TO STOP (Opt-Out): "If you wish to stop receiving these practice calls, just say 'stop' or 'opt out'."

✨ Key Day 6 Features Built:
• LiveKit SIP & Twilio Outbound Dispatching
• Mandated 2-Sentence Opening Script (Who, Why, Opt-Out)
• SQLite Opt-Out Preference Management (`opt_out_learner` tool)
• Advanced Outcome Handling & Retry Rules: ANSWERED, NO_ANSWER (15m retry), BUSY (5m retry), VOICEMAIL (spoken audio drop), and OPT_OUT

Powered by Murf Falcon — the fastest streaming TTS API (55ms latency) — delivering natural Hindi & English speech!

Special thanks to Murf AI for this challenge!

#VoiceForBharat #VoiceAI #EdTech #MurfAI #LiveKit #ArtificialIntelligence #Python #NextJS #GenerativeAI #BharatTech
```

---

## 6. Submission Steps

1. Post your demo video on LinkedIn with the template above (make sure to tag **@Murf AI** and use hashtag **#VoiceForBharat**).
2. Copy your published LinkedIn post URL.
3. Open the official 10 Days of Voice Agents Submission Form.
4. Submit your **Name**, **Email**, and **LinkedIn Post URL**.
