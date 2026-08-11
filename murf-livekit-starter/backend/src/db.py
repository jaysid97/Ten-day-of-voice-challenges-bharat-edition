import json
import logging
import os
import sqlite3
from datetime import datetime
from typing import Any, Dict, Optional

logger = logging.getLogger("agent.db")

DB_PATH = os.getenv("DATABASE_PATH", "agent_memory.db")


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
        conn.commit()
    logger.info(f"Database initialized with Day 6 schema at {db_path}")


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
    clean_user_id = (user_id or name).strip().lower()
    timestamp = datetime.now().isoformat()
    facts_json = json.dumps(facts, ensure_ascii=False)

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
            (clean_user_id, name, language_preference, facts_json, timestamp),
        )
        conn.commit()
    logger.info(f"Saved profile for {name} ({clean_user_id})")
    return True


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

