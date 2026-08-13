# Day 8 Guide — Real-Time Call Analytics & Performance Dashboard (#VoiceForBharat)

This guide provides complete documentation, architecture specs, testing procedures, video recording steps, and submission instructions for **Day 8: Track Performance & Call Analytics** featuring **Shiksha AI (शिक्षा AI)** (Learning & Literacy Track).

---

## 1. Summary of Day 8 Implementation & Enhancements

- **Agent Name**: Shiksha AI (शिक्षा AI) — AI Learning & Literacy Tutor for Bharat
- **Track**: Learning & Literacy (EdTech - Bharat Edition)
- **Step 1: Define Key Call Metrics**:
  - **Total Calls Handled**: Cumulative counter of inbound WebRTC and outbound SIP sessions.
  - **Successful Calls**: Sessions completed without unhandled errors or unexpected drops.
  - **Failed Calls**: Sessions terminated prematurely due to STT errors, API timeouts, guardrail refusals, or learner disconnection.
  - **Overall Success Rate (%)**: Calculated percentage `(Successful Calls / Total Calls) * 100`.
  - **Failure Category Taxonomy**: Categorization of issues (`STT_SPEECH_RECOGNITION_ERROR`, `NETWORK_API_TIMEOUT`, `LLM_GUARDRAIL_REFUSAL`, `LEARNER_DISCONNECTED`, `UNKNOWN`).
  - **Tools Usage Tracking**: Records which tools were executed during each session (`fetch_ncert_exercise_and_syllabus`, `lookup_caller`, `create_escalation`, etc.).
  - **Call Duration**: Tracks exact call duration in seconds.
- **Step 2 & 3: Database Analytics Schema & Session Teardown Logger**:
  - Created `call_analytics` table in SQLite (`agent_memory.db`) via `init_db()`.
  - Implemented `log_call_analytics()`, `get_analytics_summary()`, and `get_call_analytics_history()` in `backend/src/db.py`.
  - Wired `log_call_analytics` call into session teardown in `backend/src/agent.py` to automatically record every ended session.
- **Step 4: Real-Time Interactive Analytics Dashboard (Next.js Frontend)**:
  - Built dedicated page at `/analytics` ([`frontend/app/analytics/page.tsx`](file:///d:/ten%20day%20voice%20agent%20bharat%20edition/murf-livekit-starter/frontend/app/analytics/page.tsx)).
  - Features real-time 3-second auto-polling for live call updates.
  - Includes Metric Cards for Total Calls, Success Rate, and Failed Calls.
  - Includes Failure Category Distribution breakdown with progress bars.
  - Includes detailed Call History table displaying timestamp, caller name, channel, status, tools used, failure category, and notes.
  - Includes an interactive **"Simulate Test Call Analytics"** action button to inject synthetic test records for UI testing.
- **Step 5: API Route Endpoint**:
  - Created [`frontend/app/api/analytics/route.ts`](file:///d:/ten%20day%20voice%20agent%20bharat%20edition/murf-livekit-starter/frontend/app/api/analytics/route.ts) with `GET` (fetch summary & history) and `POST` (simulate call logging) endpoints interfacing with Python backend logic.
- **Step 6: UI Navigation & Header Badges**:
  - Added `📊 Analytics Dashboard` link in root navigation ([`layout.tsx`](file:///d:/ten%20day%20voice%20agent%20bharat%20edition/murf-livekit-starter/frontend/app/layout.tsx#L99-L110)).
  - Updated Agent State Header badge to `DAY 8 • CALL ANALYTICS & HUMAN ESCALATIONS`.
- **Step 7: Automated Unit Test Suite**:
  - Added [`backend/tests/test_day8_analytics.py`](file:///d:/ten%20day%20voice%20agent%20bharat%20edition/murf-livekit-starter/backend/tests/test_day8_analytics.py) with 4 comprehensive pytest cases testing table creation, logging, metrics calculation, and history retrieval.

---

## 2. Day 8 Verification Matrix

| Step / Requirement | Implementation Detail | Status |
| :--- | :--- | :---: |
| **Step 1: Key Call Metrics** | Total Calls, Success Calls, Failed Calls, Success Rate %, Failure Categories, Tools Used, Duration | ✅ Complete |
| **Step 2: Database Analytics Schema** | `call_analytics` table in SQLite `agent_memory.db` | ✅ Complete |
| **Step 3: Session Teardown Logger** | `log_call_analytics` invoked in `entrypoint` teardown in `agent.py` | ✅ Complete |
| **Step 4: Real-Time Frontend Dashboard** | Next.js Page `/analytics` with auto-refresh, KPI cards, failure distribution & history table | ✅ Complete |
| **Step 5: Analytics API Route** | `GET` / `POST` endpoint in `app/api/analytics/route.ts` | ✅ Complete |
| **Step 6: Header & Nav Integration** | Header badge and top navigation link updated for Day 8 | ✅ Complete |
| **Step 7: Automated Unit Tests** | Pytest suite `backend/tests/test_day8_analytics.py` (4/4 passing) | ✅ Complete |
| **Advanced: Call Simulation** | Interactive "Simulate Test Call Analytics" button on dashboard UI | ✅ Complete |

---

## 3. How to Run & Verify Day 8

### Step 1: Run Pytest Test Suite
Execute the pytest suite covering database initialization, log insertion, analytics summary aggregation, and history fetching:
```powershell
cd backend
& "d:\ten day voice agent bharat edition\backend\.venv\Scripts\python.exe" -m pytest tests/test_day8_analytics.py
```

### Step 2: Start the Web Application
```powershell
.\start_app.ps1
```
Open browser at `http://localhost:3000`.

### Step 3: Access the Call Analytics Dashboard
- Click **📊 Analytics Dashboard** in the top navigation bar or navigate directly to `http://localhost:3000/analytics`.
- Inspect the **Total Calls**, **Success Rate (%)**, and **Failure Category Breakdown** metric cards.
- Click **🧪 Simulate Test Call Analytics** to trigger synthetic calls and watch the real-time table update instantly via 3s polling!

---

## 4. LinkedIn Post Template (#VoiceForBharat)

**Title**: Day 8 of 10 Days of Voice Agents — Real-Time Call Analytics & Performance Dashboard 📊🎙️

**Post Body**:
```text
Day 8 of 10 Days of Voice Agents: Track Performance & Real-Time Call Analytics! 🚀 #VoiceForBharat

You can't improve what you don't measure! For Day 8 of #VoiceForBharat, I added a full Real-Time Call Analytics Engine & Performance Dashboard to Shiksha AI (शिक्षा AI) — our EdTech Voice Agent for Bharat built with Murf Falcon TTS!

Key capabilities built today:
1. 📊 Key Call Metrics: Tracks Total Calls, Success Rate (%), Failure Categories, Tool Execution Frequencies, and Duration.
2. 🗄️ SQLite Analytics Engine: Persistent logging in SQLite (`call_analytics` table) hooked directly into session teardown.
3. 🏷️ Failure Taxonomy: Categorizes failures into STT Speech Errors, API Timeouts, Guardrail Refusals, and Learner Disconnections.
4. 🖥️ Interactive Dashboard: Real-time Next.js analytics dashboard at `/analytics` with 3s auto-refresh polling and synthetic call simulation controls.
5. 🧪 Automated Test Suite: Verified via Pytest suite covering analytics calculation and history retention.

Powered by Murf Falcon TTS (55ms latency) for ultra-fast, human-like voice responses!

Tagging @Murf AI | #VoiceForBharat #EdTech #AI #VoiceAgents #Bharat #MurfAI #LiveKit #Python #NextJS #Analytics
```
