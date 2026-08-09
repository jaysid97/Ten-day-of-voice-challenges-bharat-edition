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
    """Initialize SQLite database and create user_profiles table if not exists."""
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
        conn.commit()
    logger.info(f"Database initialized at {db_path}")


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
