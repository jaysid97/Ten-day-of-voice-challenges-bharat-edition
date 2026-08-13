import json
import logging
import os
import sqlite3
from datetime import datetime
from typing import Any, Dict, Optional

logger = logging.getLogger("agent.db")

# Ensure absolute database path so all backend, frontend API, and CLI processes use the exact same SQLite database file
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DEFAULT_DB_PATH = os.path.join(REPO_ROOT, "agent_memory.db")
DB_PATH = os.getenv("DATABASE_PATH", DEFAULT_DB_PATH)


def get_connection(db_path: str = DB_PATH) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def init_db(db_path: str = DB_PATH) -> None:
    """Initialize SQLite database and create user_profiles, outbound_calls, and opt_out_preferences tables."""
    with get_connection(db_path) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS user_profiles (
                user_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                language_preference TEXT DEFAULT 'Hindi/English',
                facts TEXT NOT NULL,
                last_interaction TEXT NOT NULL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS outbound_calls (
                call_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                phone_number TEXT DEFAULT '+919876543210',
                topic TEXT NOT NULL,
                outcome TEXT NOT NULL,
                retry_count INTEGER DEFAULT 0,
                next_retry_at TEXT,
                timestamp TEXT NOT NULL,
                notes TEXT
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS opt_out_preferences (
                user_id TEXT PRIMARY KEY,
                opt_out INTEGER DEFAULT 1,
                timestamp TEXT NOT NULL,
                reason TEXT
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS human_help_requests (
                ref_id TEXT PRIMARY KEY,
                caller_name TEXT NOT NULL,
                contact_info TEXT DEFAULT '+919876543210',
                reason_category TEXT NOT NULL,
                issue_description TEXT NOT NULL,
                agent_checked TEXT NOT NULL,
                urgency TEXT DEFAULT 'medium',
                preferred_language TEXT DEFAULT 'Hindi',
                preferred_contact_method TEXT DEFAULT 'Phone Call',
                status TEXT DEFAULT 'OPEN',
                timestamp TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                notes TEXT
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS call_analytics (
                call_id TEXT PRIMARY KEY,
                caller_name TEXT NOT NULL DEFAULT 'Learner',
                channel TEXT NOT NULL DEFAULT 'BROWSER',
                status TEXT NOT NULL DEFAULT 'SUCCESS',
                failure_category TEXT DEFAULT 'NONE',
                tools_used TEXT NOT NULL DEFAULT '[]',
                duration_seconds INTEGER DEFAULT 0,
                timestamp TEXT NOT NULL,
                notes TEXT
            )
        """)
        conn.commit()

        # Seed initial realistic call analytics data if table is empty
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM call_analytics")
        if cursor.fetchone()[0] == 0:
            initial_calls = [
                ("call_1001", "Ramesh Kumar", "BROWSER", "SUCCESS", "NONE", '["fetch_ncert_exercise_and_syllabus"]', 145, datetime.now().isoformat(), "Learner completed NCERT Science photosynthesis exercise"),
                ("call_1002", "Priya Sharma", "BROWSER", "SUCCESS", "NONE", '["fetch_language_lesson_and_vocabulary"]', 210, datetime.now().isoformat(), "Learner completed Spoken English greeting lesson"),
                ("call_1003", "Anand Verma", "SIP", "SUCCESS", "NONE", '["create_escalation"]', 180, datetime.now().isoformat(), "Learner requested teacher help for hall ticket error - Ticket REF-84920 created"),
                ("call_1004", "Sunita Patel", "BROWSER", "FAILED", "INCOMPLETE_TASK", '[]', 25, datetime.now().isoformat(), "Learner disconnected before practice started"),
                ("call_1005", "Vikram Singh", "SIP", "SUCCESS", "NONE", '["fetch_subject_quiz_and_solution"]', 160, datetime.now().isoformat(), "Learner completed Class 10 Math trigonometry quiz"),
            ]
            conn.executemany(
                """
                INSERT INTO call_analytics (call_id, caller_name, channel, status, failure_category, tools_used, duration_seconds, timestamp, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                initial_calls,
            )
            conn.commit()
    logger.info(f"Database initialized with Day 8 schema at {db_path}")


def get_user_profile(user_id_or_name: str, db_path: str = DB_PATH) -> Optional[Dict[str, Any]]:
    """Look up a user profile by user_id or name (case-insensitive)."""
    if not user_id_or_name:
        return None
    clean_id = user_id_or_name.strip().lower()
    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        # Direct match on user_id
        cursor.execute("SELECT * FROM user_profiles WHERE user_id = ?", (clean_id,))
        row = cursor.fetchone()

        # Fallback: case-insensitive match on name or user_id
        if not row:
            cursor.execute(
                "SELECT * FROM user_profiles WHERE LOWER(name) = ? OR LOWER(user_id) = ?",
                (clean_id, clean_id),
            )
            row = cursor.fetchone()

        if row:
            data = dict(row)
            try:
                data["facts"] = json.loads(data["facts"])
            except Exception:
                data["facts"] = {}
            return data
    return None


def get_most_recent_user_profile(db_path: str = DB_PATH) -> Optional[Dict[str, Any]]:
    """Retrieve the most recently updated user profile from DB."""
    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user_profiles ORDER BY last_interaction DESC LIMIT 1")
        row = cursor.fetchone()
        if row:
            data = dict(row)
            try:
                data["facts"] = json.loads(data["facts"])
            except Exception:
                data["facts"] = {}
            return data
    return None


def save_user_profile(
    user_id: str,
    name: str,
    language_preference: str,
    facts: Dict[str, Any],
    db_path: str = DB_PATH,
) -> bool:
    """Insert or update user profile with facts and timestamp."""
    try:
        clean_user_id = (user_id or name or "learner").strip().lower()
        safe_name = name if (name and name != "Learner") else clean_user_id.capitalize()
        safe_lang = language_preference or "Hindi/English"
        timestamp = datetime.now().isoformat()
        facts_json = json.dumps(facts or {}, ensure_ascii=False)

        with get_connection(db_path) as conn:
            conn.execute(
                """
                INSERT INTO user_profiles (user_id, name, language_preference, facts, last_interaction)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(user_id) DO UPDATE SET
                    name = excluded.name,
                    language_preference = excluded.language_preference,
                    facts = excluded.facts,
                    last_interaction = excluded.last_interaction
                """,
                (clean_user_id, safe_name, safe_lang, facts_json, timestamp),
            )
            conn.commit()
        logger.info(f"Saved profile for {safe_name} ({clean_user_id})")
        return True
    except Exception as e:
        logger.error(f"Error saving user profile for '{user_id}': {e}")
        return False


def delete_user_profile(user_id_or_name: str, db_path: str = DB_PATH) -> bool:
    """Delete user profile from database."""
    if not user_id_or_name:
        return False
    clean_id = user_id_or_name.strip().lower()
    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM user_profiles WHERE LOWER(user_id) = ? OR LOWER(name) = ?",
            (clean_id, clean_id),
        )
        deleted = cursor.rowcount > 0
        conn.commit()
    logger.info(f"Deleted profile for {user_id_or_name}: {deleted}")
    return deleted


# -----------------------------------------------------------------------------
# Day 6: Outbound Calls & Opt-Out Preferences
# -----------------------------------------------------------------------------


def set_learner_opt_out(
    user_id_or_name: str,
    opt_out: bool = True,
    reason: str = "User requested opt-out during call",
    db_path: str = DB_PATH,
) -> bool:
    """Set opt-out status for a learner to stop receiving outbound practice calls."""
    if not user_id_or_name:
        return False
    clean_id = user_id_or_name.strip().lower()
    timestamp = datetime.now().isoformat()
    opt_val = 1 if opt_out else 0

    with get_connection(db_path) as conn:
        conn.execute(
            """
            INSERT INTO opt_out_preferences (user_id, opt_out, timestamp, reason)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                opt_out = excluded.opt_out,
                timestamp = excluded.timestamp,
                reason = excluded.reason
            """,
            (clean_id, opt_val, timestamp, reason),
        )
        conn.commit()
    logger.info(f"Updated opt-out preference for '{clean_id}': opt_out={opt_out}")
    return True


def is_learner_opted_out(user_id_or_name: str, db_path: str = DB_PATH) -> bool:
    """Check if a learner has opted out of receiving outbound practice calls."""
    if not user_id_or_name:
        return False
    clean_id = user_id_or_name.strip().lower()
    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT opt_out FROM opt_out_preferences WHERE user_id = ?",
            (clean_id,),
        )
        row = cursor.fetchone()
        if row:
            return bool(row["opt_out"])
    return False


def calculate_retry_delay(outcome: str, current_retry_count: int = 0) -> tuple[Optional[str], str]:
    """Calculate next retry timestamp and status based on outcome rules.
    - NO_ANSWER: retry in 15 minutes (max 3 retries)
    - BUSY: retry in 5 minutes (max 3 retries)
    - VOICEMAIL: no retry (message dropped)
    - ANSWERED: no retry (completed)
    - OPT_OUT: no retry (opt out saved)
    """
    outcome_upper = outcome.upper()
    MAX_RETRIES = 3

    if current_retry_count >= MAX_RETRIES or outcome_upper in ("ANSWERED", "VOICEMAIL", "OPT_OUT"):
        return None, f"No retry scheduled for outcome '{outcome_upper}' (retries: {current_retry_count})"

    from datetime import timedelta

    if outcome_upper == "NO_ANSWER":
        delay_minutes = 15
    elif outcome_upper == "BUSY":
        delay_minutes = 5
    else:
        return None, f"Unknown outcome '{outcome_upper}'"

    next_retry = (datetime.now() + timedelta(minutes=delay_minutes)).isoformat()
    note = f"Scheduled Retry #{current_retry_count + 1} in {delay_minutes} mins"
    return next_retry, note


def log_outbound_call(
    call_id: str,
    user_id: str,
    phone_number: str = "+919876543210",
    topic: str = "NCERT Class 10 Science Photosynthesis",
    outcome: str = "ANSWERED",
    retry_count: int = 0,
    notes: str = "",
    db_path: str = DB_PATH,
) -> Dict[str, Any]:
    """Log an outbound call record and calculate retry rule if needed."""
    clean_id = (user_id or "learner").strip().lower()
    timestamp = datetime.now().isoformat()
    next_retry_at, retry_note = calculate_retry_delay(outcome, retry_count)
    full_notes = f"{notes} | {retry_note}".strip(" |")

    with get_connection(db_path) as conn:
        conn.execute(
            """
            INSERT INTO outbound_calls (call_id, user_id, phone_number, topic, outcome, retry_count, next_retry_at, timestamp, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(call_id) DO UPDATE SET
                outcome = excluded.outcome,
                retry_count = excluded.retry_count,
                next_retry_at = excluded.next_retry_at,
                notes = excluded.notes
            """,
            (call_id, clean_id, phone_number, topic, outcome, retry_count, next_retry_at, timestamp, full_notes),
        )
        conn.commit()

    if outcome.upper() == "OPT_OUT":
        set_learner_opt_out(clean_id, opt_out=True, reason="Opted out during outbound call", db_path=db_path)

    logger.info(f"Logged outbound call {call_id} for {clean_id}: {outcome}")
    return {
        "call_id": call_id,
        "user_id": clean_id,
        "phone_number": phone_number,
        "topic": topic,
        "outcome": outcome.upper(),
        "retry_count": retry_count,
        "next_retry_at": next_retry_at,
        "timestamp": timestamp,
        "notes": full_notes,
    }


def get_outbound_history(user_id: Optional[str] = None, db_path: str = DB_PATH) -> list[Dict[str, Any]]:
    """Retrieve history of outbound calls."""
    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        if user_id:
            cursor.execute(
                "SELECT * FROM outbound_calls WHERE user_id = ? ORDER BY timestamp DESC",
                (user_id.strip().lower(),),
            )
        else:
            cursor.execute("SELECT * FROM outbound_calls ORDER BY timestamp DESC LIMIT 50")
        rows = cursor.fetchall()
        return [dict(r) for r in rows]


# -----------------------------------------------------------------------------
# Day 7: Human-in-the-Loop & Escalation Management
# -----------------------------------------------------------------------------
import re
import random

def sanitize_summary(text: str) -> str:
    """Sanitize and strip sensitive private data (passwords, OTPs, PINs, bank accounts, Aadhaar) from human summaries."""
    if not text:
        return ""
    
    sanitized = text
    # Scrub Passwords / Secrets
    sanitized = re.sub(r'(?i)\b(password|passwd|pwd)\b(?:\s*[:=]|\s+is)?\s*\S+', r'\1: [REDACTED_SENSITIVE]', sanitized)
    # Scrub OTPs
    sanitized = re.sub(r'(?i)\b(otp|one time password)\b(?:\s*[:=]|\s+is)?\s*\d{4,8}', r'OTP: [REDACTED_OTP]', sanitized)
    # Scrub PINs
    sanitized = re.sub(r'(?i)\b(pin|secret pin)\b(?:\s*[:=]|\s+is)?\s*\d{4,6}', r'PIN: [REDACTED_PIN]', sanitized)
    # Scrub Credit/Debit Card Numbers (16-digit numbers or spaced/dashed)
    sanitized = re.sub(r'\b(?:\d[ -]*?){13,16}\b', '[REDACTED_CARD_NO]', sanitized)
    # Scrub Aadhaar / Government IDs (12-digit numbers)
    sanitized = re.sub(r'\b\d{4}[ -]?\d{4}[ -]?\d{4}\b', '[REDACTED_GOVT_ID]', sanitized)

    return sanitized


def save_human_help_request(
    caller_name: str,
    reason_category: str,
    issue_description: str,
    agent_checked: str,
    contact_info: str = "+919876543210",
    urgency: str = "medium",
    preferred_language: str = "Hindi",
    preferred_contact_method: str = "Phone Call",
    user_consent_granted: bool = True,
    notes: str = "",
    db_path: str = DB_PATH,
) -> Dict[str, Any]:
    """Create or update a human help escalation request in SQLite database.

    Enforces consent validation, PII scrubbing, duplicate prevention, and reference ID generation.
    """
    if not user_consent_granted:
        raise ValueError("Consent required: Cannot create human help request without explicit caller permission.")

    clean_name = (caller_name or "Learner").strip()
    clean_urgency = (urgency or "medium").lower()
    if clean_urgency not in ("low", "medium", "high", "emergency"):
        clean_urgency = "medium"

    clean_desc = sanitize_summary(issue_description)
    clean_checked = sanitize_summary(agent_checked)
    timestamp = datetime.now().isoformat()

    with get_connection(db_path) as conn:
        cursor = conn.cursor()

        # Check for active open ticket for same caller & category to stop duplicate requests
        cursor.execute(
            """
            SELECT * FROM human_help_requests 
            WHERE LOWER(caller_name) = ? AND reason_category = ? AND status IN ('OPEN', 'IN_PROGRESS')
            ORDER BY timestamp DESC LIMIT 1
            """,
            (clean_name.lower(), reason_category),
        )
        existing = cursor.fetchone()

        if existing:
            existing_row = dict(existing)
            ref_id = existing_row["ref_id"]
            updated_notes = f"{existing_row.get('notes', '')} | Appended update at {timestamp}: {clean_desc}".strip(" |")

            # Higher urgency takes precedence
            urgency_levels = {"low": 1, "medium": 2, "high": 3, "emergency": 4}
            new_urgency = clean_urgency if urgency_levels.get(clean_urgency, 2) > urgency_levels.get(existing_row["urgency"], 2) else existing_row["urgency"]

            cursor.execute(
                """
                UPDATE human_help_requests 
                SET issue_description = ?, agent_checked = ?, urgency = ?, updated_at = ?, notes = ?
                WHERE ref_id = ?
                """,
                (f"{existing_row['issue_description']} ; Additional: {clean_desc}", clean_checked, new_urgency, timestamp, updated_notes, ref_id),
            )
            conn.commit()
            logger.info(f"Updated existing escalation request {ref_id} for {clean_name}")
            return {
                "ref_id": ref_id,
                "is_duplicate": True,
                "status": existing_row["status"],
                "caller_name": clean_name,
                "urgency": new_urgency,
                "message": f"Updated existing open ticket {ref_id} for {clean_name}. Next step: Teacher follow-up pending.",
            }

        # Generate unique reference ID (e.g., REF-84920)
        random_num = random.randint(10000, 99999)
        ref_id = f"REF-{random_num}"

        cursor.execute(
            """
            INSERT INTO human_help_requests (
                ref_id, caller_name, contact_info, reason_category, issue_description,
                agent_checked, urgency, preferred_language, preferred_contact_method,
                status, timestamp, updated_at, notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', ?, ?, ?)
            """,
            (
                ref_id, clean_name, contact_info, reason_category, clean_desc,
                clean_checked, clean_urgency, preferred_language, preferred_contact_method,
                timestamp, timestamp, notes,
            ),
        )
        conn.commit()

    logger.info(f"Created new human help escalation request {ref_id} for {clean_name}")
    return {
        "ref_id": ref_id,
        "is_duplicate": False,
        "status": "OPEN",
        "caller_name": clean_name,
        "urgency": clean_urgency,
        "message": f"Help request {ref_id} successfully registered. Senior teacher will follow up via {preferred_contact_method} within 2-4 hours.",
    }


def get_human_help_requests(
    status: Optional[str] = None,
    ref_id: Optional[str] = None,
    db_path: str = DB_PATH,
) -> list[Dict[str, Any]]:
    """Retrieve human help requests filtered by status or ref_id."""
    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        if ref_id:
            cursor.execute("SELECT * FROM human_help_requests WHERE ref_id = ?", (ref_id.strip().upper(),))
        elif status:
            cursor.execute("SELECT * FROM human_help_requests WHERE status = ? ORDER BY timestamp DESC", (status.strip().upper(),))
        else:
            cursor.execute("SELECT * FROM human_help_requests ORDER BY timestamp DESC LIMIT 50")
        rows = cursor.fetchall()
        return [dict(r) for r in rows]


def update_human_help_status(
    ref_id: str,
    new_status: str,
    resolution_notes: str = "",
    db_path: str = DB_PATH,
) -> bool:
    """Update human help ticket status (OPEN, IN_PROGRESS, RESOLVED)."""
    clean_status = new_status.strip().upper()
    if clean_status not in ("OPEN", "IN_PROGRESS", "RESOLVED"):
        return False
    timestamp = datetime.now().isoformat()
    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE human_help_requests 
            SET status = ?, updated_at = ?, notes = notes || ' | Resolution Note: ' || ?
            WHERE ref_id = ?
            """,
            (clean_status, timestamp, resolution_notes, ref_id.strip().upper()),
        )
        updated = cursor.rowcount > 0
        conn.commit()
    logger.info(f"Updated request {ref_id} status to {clean_status}: {updated}")
    return updated


# -----------------------------------------------------------------------------
# Day 8: Call Analytics & Performance Dashboard
# -----------------------------------------------------------------------------


def log_call_analytics(
    call_id: str,
    caller_name: str = "Learner",
    channel: str = "BROWSER",
    status: str = "SUCCESS",
    failure_category: Optional[str] = None,
    tools_used: Optional[list[str]] = None,
    duration_seconds: int = 45,
    notes: str = "",
    db_path: str = DB_PATH,
) -> Dict[str, Any]:
    """Record call outcome (SUCCESS or FAILED) and metrics in SQLite database."""
    clean_call_id = call_id.strip()
    clean_name = (caller_name or "Learner").strip()
    clean_channel = (channel or "BROWSER").strip().upper()
    clean_status = (status or "SUCCESS").strip().upper()
    if clean_status not in ("SUCCESS", "FAILED"):
        clean_status = "SUCCESS"

    if clean_status == "SUCCESS":
        fail_cat = "NONE"
    else:
        fail_cat = (failure_category or "INCOMPLETE_TASK").strip().upper()

    tools_json = json.dumps(tools_used or [], ensure_ascii=False)
    timestamp = datetime.now().isoformat()
    scrubbed_notes = sanitize_summary(notes)

    with get_connection(db_path) as conn:
        conn.execute(
            """
            INSERT INTO call_analytics (
                call_id, caller_name, channel, status, failure_category,
                tools_used, duration_seconds, timestamp, notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(call_id) DO UPDATE SET
                status = excluded.status,
                failure_category = excluded.failure_category,
                tools_used = excluded.tools_used,
                duration_seconds = excluded.duration_seconds,
                notes = excluded.notes
            """,
            (
                clean_call_id, clean_name, clean_channel, clean_status, fail_cat,
                tools_json, duration_seconds, timestamp, scrubbed_notes,
            ),
        )
        conn.commit()

    logger.info(f"Logged call analytics {clean_call_id}: status={clean_status}, channel={clean_channel}")
    return {
        "call_id": clean_call_id,
        "caller_name": clean_name,
        "channel": clean_channel,
        "status": clean_status,
        "failure_category": fail_cat,
        "tools_used": tools_used or [],
        "duration_seconds": duration_seconds,
        "timestamp": timestamp,
        "notes": scrubbed_notes,
    }


def get_analytics_summary(db_path: str = DB_PATH) -> Dict[str, Any]:
    """Compute call analytics totals (Total Calls, Successful Calls, Failed Calls, Success Rate, Failure Categories)."""
    with get_connection(db_path) as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM call_analytics")
        total_calls = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM call_analytics WHERE status = 'SUCCESS'")
        successful_calls = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM call_analytics WHERE status = 'FAILED'")
        failed_calls = cursor.fetchone()[0]

        cursor.execute(
            "SELECT failure_category, COUNT(*) as cnt FROM call_analytics WHERE status = 'FAILED' GROUP BY failure_category"
        )
        failure_rows = cursor.fetchall()
        failure_categories = {row["failure_category"]: row["cnt"] for row in failure_rows}

    success_rate = round((successful_calls / total_calls * 100), 1) if total_calls > 0 else 0.0

    return {
        "total_calls": total_calls,
        "successful_calls": successful_calls,
        "failed_calls": failed_calls,
        "success_rate_percent": success_rate,
        "failure_categories": failure_categories,
    }


def get_call_analytics_history(limit: int = 50, db_path: str = DB_PATH) -> list[Dict[str, Any]]:
    """Retrieve history of recent call records with PII scrubbing."""
    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM call_analytics ORDER BY timestamp DESC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        history = []
        for r in rows:
            data = dict(r)
            try:
                data["tools_used"] = json.loads(data.get("tools_used") or "[]")
            except Exception:
                data["tools_used"] = []
            data["notes"] = sanitize_summary(data.get("notes", ""))
            history.append(data)
        return history



