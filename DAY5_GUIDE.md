# Day 5 Guide — Domain Tools, Multi-Subject & Language Learning, Real Data & Graceful Out-Loud Fallbacks (#VoiceForBharat)

This guide provides complete documentation, architecture specs, testing procedures, video recording steps, and submission instructions for **Day 5: The Tools** for **Shiksha AI (शिक्षा AI)** (Learning & Literacy Track).

---

## 1. Summary of Day 5 Implementation & Enhancements

- **Agent Name**: Shiksha AI (शिक्षा AI) — AI Learning & Literacy Tutor for Bharat
- **Track**: Learning & Literacy (EdTech - Bharat Edition)
- **Multi-Subject & Multi-Language Capabilities**:
  - **Subjects Supported**: Mathematics, Physics, Chemistry, Biology, History, Geography, Civics, Economics, Computer Science / Coding, General Knowledge, Literature, etc.
  - **Languages Supported**: Hindi, Sanskrit, Tamil, Telugu, Marathi, Gujarati, Bengali, Punjabi, Kannada, Malayalam, Spoken English, French, Spanish, German, Japanese, etc.
- **Domain Tools Implemented (`src/tools.py`)**:
  1. `fetch_ncert_exercise_and_syllabus(subject, topic, class_level, user_id_or_name)`:
     - **Live Data Source**: Queries live Wikipedia Educational REST API (`https://en.wikipedia.org/api/rest_v1/page/summary/`) for real concept summaries and educational facts for ANY subject.
     - **Tool Chaining (Advanced)**: If `class_level` is omitted by the user, the tool automatically looks up the learner's saved grade level from Day 4 SQLite memory (`get_most_recent_user_profile()`) without re-asking!
     - **Timestamp & Attribution**: Returns timestamped data (*"Sourced live as of today, Aug 10, 2026"*).
     - **Graceful Failure Path (Step 4)**: Catches HTTP timeouts, API failures, or offline network states and returns a natural spoken failure message (*"The live network connection timed out, but here is the official NCERT offline curriculum..."*) accompanied by local NCERT curriculum practice problems.
  2. `fetch_language_lesson_and_vocabulary(language, topic_or_level, user_id_or_name)`:
     - Fetches language learning lessons, script guides, vocabulary lists, greetings, and spoken practice exercises for ANY language.
  3. `fetch_subject_quiz_and_solution(subject, topic, difficulty)`:
     - Generates educational practice quizzes and step-by-step solutions for any subject.
  4. `lookup_word_meaning_and_origin(word)`:
     - Queries live dictionary API (`https://api.dictionaryapi.dev/api/v2/entries/en/`) for word definitions, phonetics, and origins, with graceful out-loud failure fallback.
- **Frontend UI & Avatar Enhancements**:
  - **Smoother Character Skin**: Upgraded `HumanAITutor` SVG with silky warm skin gradients (`#FFF0E5` -> `#F9D7C2` -> `#E5AB8B`), subtle cheek blush (`#FF7A85`), specular eye catchlights, anti-aliased glasses frame, and graduation cap.
  - **Day 5 Multi-Subject HUD & Script Layout**: Added a Day 5 Live Tools status header in `AgentChatTranscript` with pills for Math, Science, Coding, Hindi, Sanskrit, and Foreign Languages.

---

## 2. Day 5 Verification Matrix

| Step / Requirement | Implementation Detail | Status |
| :--- | :--- | :--- |
| **Step 1: Domain Tool Selection** | `fetch_ncert_exercise_and_syllabus`, `fetch_language_lesson_and_vocabulary`, `fetch_subject_quiz_and_solution`, `lookup_word_meaning_and_origin` | ✅ Complete |
| **Step 2: Real Data & Dataset** | Connects to live REST APIs with fallback local NCERT curriculum & language dataset | ✅ Complete |
| **Step 3: Tool Description** | Explicit docstrings guiding LLM on when and how to call tools | ✅ Complete |
| **Step 4: Graceful Out-Loud Failure** | Spoken notification when API times out (*"Live server timed out..."*) + offline curriculum data | ✅ Complete |
| **Step 5: Timestamp / Date Attribution** | Returns data timestamped *"Sourced live as of today (2026-08-10)"* | ✅ Complete |
| **Step 6: Successful Agent Query** | Agent calls tools automatically when asked for practice problems, languages, or study topics | ✅ Complete |
| **Advanced: Tool Chaining** | Automatically reads caller's saved grade/language level from Day 4 SQLite profile if omitted | ✅ Complete |
| **Multilocale & UI Design** | STT `nova-3 multi`, Murf `Anisha`, smooth avatar skin rendering, multi-subject HUD layout | ✅ Complete |

---

## 3. How to Run & Test Day 5 Features

### Step 1: Run Backend & Frontend
Start the application from PowerShell:
```powershell
.\start_app.ps1
```
Or start the agent backend directly:
```powershell
cd murf-livekit-starter/backend
uv run python src/agent.py dev
```

### Step 2: Test Automated Unit Suite
Run the Day 5 pytest suite to verify live fetches, language lessons, tool chaining, and graceful fallbacks:
```powershell
cd murf-livekit-starter/backend
uv run pytest tests/test_day5_tools.py
```

### Step 3: Manual Voice Testing (Interactive Session)

1. Open **`http://localhost:3000`** in your browser and click **Start Voice Session**.
2. **Multi-Subject Test (Live Data Fetch)**:
   - **You Say**: *"Can you teach me Python programming loops?"* or *"Explain gravity in physics."*
   - **Agent Action**: Calls `fetch_ncert_exercise_and_syllabus(subject="coding", topic="python")`.
   - **Agent Speaks**: Explains the concept naturally and presents the practice question aloud.
3. **Multi-Language Test (Sanskrit / Tamil / French / Hindi)**:
   - **You Say**: *"Teach me basic greetings in Sanskrit"* or *"Teach me French."*
   - **Agent Action**: Calls `fetch_language_lesson_and_vocabulary(language="Sanskrit")`.
   - **Agent Speaks**: Shares greetings, grammar tip, and practice phrase aloud in native script.
4. **Advanced Tool Chaining (Day 4 Memory Integration)**:
   - **You Say**: *"My name is Ramesh, I study Class 10 Science."* → Allow agent to save your profile.
   - **Start New Call & Say**: *"Give me an exercise on Light."* (Notice you didn't mention Class 10!).
   - **Agent Action**: Automatically looks up Ramesh's saved profile from SQLite, retrieves "Class 10 Science", and calls `fetch_ncert_exercise_and_syllabus(subject="science", topic="light", class_level="Class 10")`.
5. **Graceful Failure Path (Offline / API Timeout)**:
   - Ask for an obscure topic, or temporarily disable network:
   - **Agent Action**: Catches network exception in `fetch_ncert_exercise_and_syllabus`.
   - **Agent Speaks**: *"I could not reach the live network connection right now, but here is the official NCERT offline curriculum exercise for you..."* (No silence, no hallucination!).

---

## 4. Recording Your Day 5 Demo Video

Record a 45–60 second screen recording demonstrating Day 5:
1. **Part 1 (Multi-Subject & Language Learning)**: Ask for a math exercise, coding concept, or Sanskrit/French language lesson → Show tool execution and natural voice response.
2. **Part 2 (Graceful Out-Loud Failure & Smoother UI)**: Show the smooth avatar face skin, Day 5 script HUD banner, and the agent explaining server timeout aloud during fallback.

---

## 5. LinkedIn Post Description Template

Copy & paste this template when sharing your Day 5 video on LinkedIn:

```text
🛠️ Day 5 of 10 Days of Voice Challenge — Teaching My Agent Any Subject & Any Language with Real-World Tools! 🎙️🌐

Today, I equipped my voice agent with multi-subject & language learning tools, live API data fetching, tool chaining, and graceful out-loud failure handling!

Introducing **Shiksha AI** 📚✨ — an empathetic AI Learning & Literacy Companion built for Bharat (#VoiceForBharat).

Key Day 5 features built today:
1️⃣ **Multi-Subject & Language Tools**: Teaches ANY subject (Math, Science, Coding, Physics, History) and ANY language (Hindi, Sanskrit, Tamil, French, Spanish, English)!
2️⃣ **Day 4 Tool Chaining**: Automatically retrieves the learner's saved grade level from SQLite memory if not specified during the call.
3️⃣ **Graceful Out-Loud Failure Path**: When live APIs time out or go offline, Shiksha AI explicitly explains the network status aloud and seamlessly switches to offline curriculum data.
4️⃣ **Timestamped Attribution**: All returned data is timestamped ("Sourced live as of today").
5️⃣ **Smoother Character Skin & UI HUD**: Redesigned tutor avatar with silky smooth skin gradients, cheek blush, eye highlights, and Day 5 multi-subject script HUD!

Powered by Murf Falcon TTS API, LiveKit Agents, Deepgram Nova-3 Multi, and Gemini! ⚡

#VoiceForBharat @Murf AI #VoiceAI #BuildInPublic #AI #GenerativeAI #EdTech #LiveKit #Bharat #Python #API #NCERT
```
