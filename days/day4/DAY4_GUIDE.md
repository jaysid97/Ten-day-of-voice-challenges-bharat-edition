# Day 4 Guide — Give Your Agent a Memory That Lasts (#VoiceForBharat)

This guide provides complete documentation and testing procedures for **Day 4: Persistent Memory with SQLite, Function Calling Tools, Consent Rules, and Returning Caller Greetings** for **Shiksha AI (शिक्षा AI)** (Learning & Literacy Track).

---

## 1. Summary of Day 4 Implementation

- **Agent Name**: Shiksha AI (शिक्षा AI) — AI Learning & Literacy Tutor for Bharat
- **Track**: Learning & Literacy (Bharat Edition)
- **Database (Step 1 & 2)**: Embedded SQLite (`agent_memory.db`) with `user_profiles` table storing:
  - `user_id`: Unique identifier (e.g. `"ramesh"`)
  - `name`: Caller's name (e.g. `"Ramesh"`)
  - `language_preference`: Language register (e.g. `"Hindi / Devanagari"`)
  - `facts`: JSON payload containing 4 track-specific learning facts:
    - `current_level`: e.g. `"Class 8 Math"`
    - `topics_covered`: e.g. `"Fractions & Decimals"`
    - `struggles`: e.g. `"Multiplying negative numbers"`
    - `target_goal`: e.g. `"Pass CBSE Board Exam"`
  - `last_interaction`: ISO 8601 timestamp
- **Function Tools (Step 3)**: LLM invokes Python tools via `@llm.function_tool`:
  1. `lookup_caller(user_id_or_name)`: Reads caller history from SQLite.
  2. `save_caller_facts(user_id_or_name, name, language_preference, current_level, topics_covered, struggles, target_goal)`: Saves facts into SQLite.
  3. `forget_caller(user_id_or_name)`: Advanced "forget me" tool to wipe data from SQLite upon request.
- **Hard Consent Rule (Step 5)**: The agent MUST explicitly ask permission before saving data (*"क्या मैं आपका लर्निंग डेटा और टॉपिक्स सेव कर लूँ?"*). If caller says "No", data is dropped.
- **Returning Caller Greeting (Step 4)**: Automatically greets returning callers by name and references their previous study topic (*"नमस्ते रमेश जी! पिछली बार हमने Fractions & Decimals पढ़ा था..."*).
- **Multilocale & Native Script**: Deepgram STT (`nova-3` language `"multi"`), Murf Falcon TTS (`Anisha` voice), and system prompt enforcing Devanagari Hindi (नमस्ते) script instead of romanized text.

---

## 2. Verification Matrix

| Requirement | Implementation Detail | Status |
| :--- | :--- | :--- |
| **SQLite Database** | Embedded SQLite database file (`agent_memory.db`) with schema `user_profiles` | ✅ Complete |
| **Track Facts (Learning & Literacy)** | `current_level`, `topics_covered`, `struggles`, `target_goal` | ✅ Complete |
| **Function Tools (Not Prompt)** | LLM executes `lookup_caller`, `save_caller_facts`, `forget_caller` tools | ✅ Complete |
| **Explicit Consent** | Agent asks *"Kya main aapka learning topic save kar loon?"* before calling `save_caller_facts` | ✅ Complete |
| **Returning Caller Greeting** | Automatically loads returning profile on call start and greets by name | ✅ Complete |
| **Multilocale & Native Script** | Deepgram `nova-3` multi, Murf Falcon `Anisha`, Devanagari Hindi | ✅ Complete |
| **Advanced: "Forget Me" Tool** | `forget_caller` tool deletes user record from database when user asks to be forgotten | ✅ Complete |

---

## 3. How to Run & Test the 2-Call Flow

### Step 1: Start the Voice Agent
From PowerShell, run the application starter script:
```powershell
.\start_app.ps1
```
Or start the backend manually:
```powershell
cd backend
uv run python src/agent.py dev
```

### Step 2: Call 1 — First-Time Learner & Consent Save
1. Open your browser at `http://localhost:3000`.
2. Click **Start Voice Session**.
3. **Agent Greets**: *"नमस्ते! मैं शिक्षा AI हूँ, आपका पर्सनल लर्निंग साथी। आपका नाम क्या है और आज हम कौन सा टॉपिक स्टडी करें?"*
4. **You Say**: *"मेरा नाम रमेश है, मैं Class 8 का मैथ फ्रैक्शंस पढ़ना चाहता हूँ।"*
5. **Agent Responds**: Briefly answers and asks for permission:
   *"रमेश जी, क्या मैं आपका Class 8 Math लर्निंग डेटा सेव कर लूँ ताकि अगली बार हम यहाँ से कंटिन्यू कर सकें?"*
6. **You Say**: *"हाँ, सेव कर लो।"*
7. **Agent Responds**: Calls `save_caller_facts` and confirms: *"धन्यवाद रमेश जी! मैंने आपकी डिटेल्स सेव कर ली हैं।"*
8. Click **END CALL** at the bottom.

### Step 3: Call 2 — Returning Learner Recognition
1. Click **Start Voice Session** again (or refresh page).
2. **Agent Automatically Recognizes You**:
   *"नमस्ते रमेश जी! शिक्षा AI में आपका स्वागत है। पिछली बार हमने Class 8 Math fractions पढ़ा था। आज आगे का टॉपिक पढ़ें या कोई प्रश्न है?"*
3. Notice how the agent greeted you by name without you having to introduce yourself again!

### Step 4: (Optional) Testing the "Forget Me" Feature
1. In the active session, say: *"मेरा डेटा डिलीट कर दो"* or *"Forget me"*.
2. **Agent Calls `forget_caller("ramesh")`**: *"रमेश जी, आपका सारा डेटा डेटाबेस से डिलीट कर दिया गया है।"*
3. If you disconnect and start Call 3, the agent treats you as a brand new caller again!

---

## 4. Recording Your Day 4 Demo Video

Record a 45–60 second screen video showing both calls back-to-back:
1. **Part 1 (Call 1)**: Show yourself introducing your name and topic → Agent asking consent → You saying "Yes" → Agent confirming save → End Call.
2. **Part 2 (Call 2)**: Click Start Voice Session again → Show agent immediately greeting you by name and referencing your previous topic.

---

## 5. LinkedIn Post Description Template

Copy & paste this template when sharing your Day 4 video on LinkedIn:

```text
🧠 Day 4 of 10 Days of Voice Challenge — Giving My Agent a Memory That Lasts! 🎙️💾

Today, I added persistent database memory, function calling tools, and explicit user consent to my voice agent!

Introducing **Shiksha AI** 📚✨ — an empathetic AI Learning & Literacy Companion built for Bharat (#VoiceForBharat).

Key Day 4 capabilities built today:
1️⃣ **SQLite Database Integration**: Storing caller identity, preferred language, current level, topics covered, and repeated mistakes.
2. **LLM Function Tools**: Agent autonomously calls `lookup_caller`, `save_caller_facts`, and `forget_caller` tools.
3️⃣ **Strict Consent Enforcement**: The agent ALWAYS asks permission before saving any data. If the user says "No", nothing is stored.
4️⃣ **Returning Caller Greetings**: Greet returning learners by name and seamlessly pick up from their previous study lesson!
5️⃣ **Multilocale & Native Devanagari Script**: Clean Hindi responses written in Devanagari script (नमस्ते).

Powered by the ultra-fast Murf Falcon TTS API, LiveKit Agents, Deepgram Nova-3, and Gemini! ⚡

#VoiceForBharat @Murf AI #VoiceAI #BuildInPublic #AI #GenerativeAI #EdTech #LiveKit #Bharat #SQLite #Python
```

---

## 6. Day 4 Submission Checklist

- [x] SQLite database implemented (`db.py` / `agent_memory.db`)
- [x] Track facts saved for caller (`current_level`, `topics_covered`, `struggles`, `target_goal`)
- [x] Agent reads/writes data via LLM function calling tools (`@llm.function_tool`)
- [x] Agent asks permission before saving data (Consent rule enforced)
- [x] Returning caller greeted by name and continued from last topic
- [x] Native Devanagari Hindi script used in prompt
- [ ] Recorded 2-call demo video (New caller vs Returning caller)
- [ ] Posted video on LinkedIn tagging @Murf AI with #VoiceForBharat
- [ ] Submitted post link via Discord form
