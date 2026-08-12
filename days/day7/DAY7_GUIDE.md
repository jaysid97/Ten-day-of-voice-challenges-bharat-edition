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
  - **PII Scrubbing**: Helper `sanitize_summary(text)` automatically redacts passwords, OTPs, PINs, bank accounts, and Aadhaar/SSN numbers before saving or sending.
- **Step 4: Hard Consent Rule (Ask Before Sharing)**:
  - SYSTEM_PROMPT mandates asking caller permission BEFORE invoking `create_escalation`.
- **Step 5: Send Request Somewhere Real**:
  - **SQLite Database**: Table `human_help_requests` stores all structured tickets with reference IDs.
  - **Discord Webhook**: Sends formatted markdown Embed Cards to Discord Webhook.
  - **Interactive Human Escalation Center (Next.js Frontend)**: Live admin dashboard tab with real-time status filtering (`ALL`, `OPEN`, `IN_PROGRESS`, `RESOLVED`).
- **Step 6: Clear Next Step & Honest Timeline**:
  - Agent speaks generated Reference ID aloud (`REF-84920`) and gives 2-4 hr callback timeline.

---

## 2. Verification Command
```powershell
cd backend
& "d:\ten day voice agent bharat edition\backend\.venv\Scripts\python.exe" -m pytest tests/test_day7_escalation.py
```
