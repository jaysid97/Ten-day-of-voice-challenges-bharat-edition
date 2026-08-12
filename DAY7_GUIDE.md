# Day 7 Guide — Know When to Ask for Human Help (#VoiceForBharat)

This guide provides complete documentation, architecture specs, testing procedures, video recording steps, and submission instructions for **Day 7: Know When to Ask for Human Help** featuring **Shiksha AI (शिक्षा AI)** (Learning & Literacy Track).

---

## 1. Summary of Day 7 Implementation & Enhancements

- **Agent Name**: Shiksha AI (शिक्षा AI) — AI Learning & Literacy Tutor for Bharat
- **Track**: Learning & Literacy (EdTech - Bharat Edition)
- **Step 1: Choose Two Reasons for Human Help**:
  1. **Frustrated Learner / Repeated Stuck Concept / Explicit Request for Human Teacher**: The learner is upset, stuck on a concept repeatedly (e.g. calculus/fractions), or explicitly asks to speak to a real human teacher.
  2. **Exam, Certificate, or Administrative Policy Dispute**: The caller reports an error in official CBSE exam hall tickets, marks re-checking disputes, or fee/scholarship issues requiring human authority.
- **Step 2 & 3: Human Help Escalation Tool (`create_escalation`) & PII Sanitization**:
  - Built `@llm.function_tool def create_escalation(...)` in `tools.py`.
  - Saves structured request summaries: `caller_name`, `contact_info`, `reason_category`, `issue_description`, `agent_checked`, `urgency` (`low`, `medium`, `high`, `emergency`), `preferred_language`, and `preferred_contact_method`.
  - **PII Scrubbing**: Helper `sanitize_summary(text)` automatically redacts passwords, OTPs, PINs, bank accounts, and Aadhaar/SSN numbers before saving or sending (`[REDACTED_SENSITIVE]`, `[REDACTED_OTP]`, `[REDACTED_PIN]`, `[REDACTED_CARD_NO]`, `[REDACTED_GOVT_ID]`).
- **Step 4: Hard Consent Rule (Ask Before Sharing)**:
  - SYSTEM_PROMPT mandates asking caller permission BEFORE invoking `create_escalation`:
    *"I can submit a support ticket to a senior teacher with your name, topic, and contact number. Do I have your permission to share these details and create the ticket?"*
  - If user says **YES**: Calls `create_escalation(..., user_consent_granted=True)`.
  - If user says **NO**: Agent respects refusal, aborts ticket creation, and continues conversation politely.
- **Step 5: Send Request Somewhere Real**:
  - **SQLite Database**: Table `human_help_requests` stores all structured tickets with reference IDs.
  - **Discord Webhook**: Sends formatted markdown Embed Cards to Discord Webhook (`DISCORD_WEBHOOK_URL`) with urgency colors (Red for Emergency/High, Amber for Medium, Green for Low).
  - **Interactive Human Escalation Center (Next.js Frontend)**: Live admin dashboard tab with real-time status filtering (`ALL`, `OPEN`, `IN_PROGRESS`, `RESOLVED`) and single-click action buttons.
- **Step 6: Clear Next Step & Honest Timeline**:
  - Agent speaks the generated Reference ID aloud (e.g. `REF-84920`).
  - States honest timeline: *"A senior teacher will review your request and contact you within 2 to 4 hours."*
- **Advanced Optional Features**:
  - **Urgency Levels**: `low`, `medium`, `high`, `emergency`.
  - **Duplicate Request Prevention**: Automatically updates open tickets for the same caller & issue category instead of creating duplicates.
  - **Status Lifecycle & Resolution**: Dashboard allows marking tickets `IN_PROGRESS` and `RESOLVED`.

---

## 2. Day 7 Verification Matrix

| Step / Requirement | Implementation Detail | Status |
| :--- | :--- | :--- |
| **Step 1: Two Escalation Reasons** | 1. Frustrated Learner / Teacher Request 2. Exam/Certificate Policy Dispute | ✅ Complete |
| **Step 2: Human Help Tool** | `@llm.function_tool create_escalation` in `tools.py` | ✅ Complete |
| **Step 3: Short Summary & PII Removal** | Structured fields saved; `sanitize_summary` redacts passwords, OTPs, PINs, cards, Aadhaar | ✅ Complete |
| **Step 4: Explicit Consent Workflow** | Agent asks permission before calling tool; aborts if denied | ✅ Complete |
| **Step 5: Send Somewhere Real** | SQLite DB (`human_help_requests`), Discord Webhook, Next.js Admin Dashboard | ✅ Complete |
| **Step 6: Clear Next Step & Reference ID** | Agent speaks `REF-XXXXX` and honest 2-4 hr callback timeline | ✅ Complete |
| **Step 7: Test Both Paths** | Tested escalation conversation path vs non-escalation path in pytest & UI | ✅ Complete |
| **Advanced: Urgency Levels** | `low`, `medium`, `high`, `emergency` support | ✅ Complete |
| **Advanced: Duplicate Prevention** | Appends notes and updates existing open tickets for same caller/category | ✅ Complete |
| **Advanced: Status Dashboard** | Interactive UI with filter buttons (`ALL`, `OPEN`, `IN_PROGRESS`, `RESOLVED`) | ✅ Complete |

---

## 3. How to Run & Verify Day 7

### Step 1: Run Pytest Test Suite
Execute the pytest suite covering consent enforcement, PII scrubbing, ticket creation, duplicate prevention, and status lifecycle:
```powershell
cd backend
& "d:\ten day voice agent bharat edition\backend\.venv\Scripts\python.exe" -m pytest tests/test_day7_escalation.py
```

### Step 2: Start the Web Application
```powershell
.\start_app.ps1
```
Open browser at `http://localhost:3000`.

### Step 3: Test Interactive Escalation Scenarios
- Switch to **🚨 Day 7 Human Escalations** tab on the frontend.
- **Path 1 (Escalation Path)**: Say *"I don't understand calculus, call a human teacher!"* -> Agent asks permission -> Say *"Yes, go ahead"* -> Agent creates ticket `REF-XXXXX` and speaks callback timeline.
- **Path 2 (Normal Path)**: Say *"What is photosynthesis?"* -> Agent answers normally using tools. No ticket created.
- Check the **Live Human Escalation Requests Center** dashboard at the bottom of the page to inspect and manage open tickets.

---

## 4. LinkedIn Post Template (Step 9)

**Title**: Day 7 of 10 Days of Voice Agents — Teaching AI When to Ask for Human Help 🤖🤝👨‍🏫

**Post Body**:
```text
Day 7 of 10 Days of Voice Agents: Know When to Ask for Human Help! 🚀 #VoiceForBharat

Building an AI voice agent isn't about solving every problem alone — it's about knowing when to step back and connect the user to a real human expert.

For Day 7, I updated Shiksha AI (शिक्षा AI) — our multilingual EdTech Voice Agent for Bharat built with Murf AI Falcon TTS — to handle human escalation gracefully!

Key capabilities built today:
1. 🎯 Defined 2 Clear Escalation Reasons: Frustrated learner / repeated concept block, and official CBSE exam hall ticket / administrative disputes.
2. 🔒 Hard Consent Rule (Ask Before Sharing): Shiksha AI explicitly asks the caller for permission before creating a support ticket. If consent is refused, data sharing is aborted.
3. 🛡️ PII Sanitization: Automatically redacts passwords, OTPs, PINs, bank accounts, and Aadhaar numbers from summaries.
4. 📬 Multi-Channel Escalation & Webhooks: Saves tickets to SQLite DB (`human_help_requests`), dispatches formatted Embed Cards to Discord Webhooks, and renders a live Human Admin Dashboard.
5. 🎟️ Reference ID & Honest Next Steps: Gives caller a reference ID (e.g. REF-84920) and honest 2-4 hr callback timeline.
6. 🔄 Duplicate Prevention & Urgency Levels: Updates open tickets for identical issues and tracks urgency (Low, Medium, High, Emergency).

Powered by the ultra-fast Murf Falcon TTS API (55ms latency) for ultra-real voice interactions!

Tagging @Murf AI | #VoiceForBharat #EdTech #AI #VoiceAgents #Bharat #MurfAI #LiveKit #Python #NextJS
```

---

## 5. Submission Form Checklist (Step 10)

1. **LinkedIn Post**: Publish post with demo video.
2. **Tags**: Tag official `@Murf AI` handle.
3. **Hashtags**: Include `#VoiceForBharat`.
4. **Form**: Submit post link on the submission form shared on Discord.
