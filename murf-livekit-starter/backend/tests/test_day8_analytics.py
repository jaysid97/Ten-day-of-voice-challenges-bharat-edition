import pytest
from db import (
    init_db,
    log_call_analytics,
    get_analytics_summary,
    get_call_analytics_history,
    sanitize_summary,
)

TEST_DB = "test_analytics_db.db"


@pytest.fixture(autouse=True)
def setup_test_database() -> None:
    init_db(TEST_DB)


def test_log_successful_call() -> None:
    """Test logging a successful voice call record."""
    res = log_call_analytics(
        call_id="call_test_001",
        caller_name="Ramesh",
        channel="BROWSER",
        status="SUCCESS",
        tools_used=["fetch_ncert_exercise_and_syllabus", "lookup_word_meaning_and_origin"],
        duration_seconds=120,
        notes="Completed NCERT Science quiz",
        db_path=TEST_DB,
    )
    assert res["status"] == "SUCCESS"
    assert res["failure_category"] == "NONE"
    assert len(res["tools_used"]) == 2


def test_log_failed_call() -> None:
    """Test logging a failed voice call record with failure categorization."""
    res = log_call_analytics(
        call_id="call_test_002",
        caller_name="Sita",
        channel="SIP",
        status="FAILED",
        failure_category="INCOMPLETE_TASK",
        tools_used=[],
        duration_seconds=15,
        notes="User hung up before completing practice",
        db_path=TEST_DB,
    )
    assert res["status"] == "FAILED"
    assert res["failure_category"] == "INCOMPLETE_TASK"


def test_analytics_summary_computation() -> None:
    """Test computation of total, successful, failed, and success rate percent."""
    log_call_analytics("call_sim_1", status="SUCCESS", db_path=TEST_DB)
    log_call_analytics("call_sim_2", status="SUCCESS", db_path=TEST_DB)
    log_call_analytics("call_sim_3", status="FAILED", failure_category="USER_OPT_OUT", db_path=TEST_DB)

    summary = get_analytics_summary(db_path=TEST_DB)
    assert summary["total_calls"] >= 3
    assert summary["successful_calls"] >= 2
    assert summary["failed_calls"] >= 1
    assert summary["success_rate_percent"] > 0.0


def test_pii_scrubbing_in_analytics() -> None:
    """Test that sensitive passwords, OTPs, and card numbers are scrubbed from notes."""
    raw_notes = "User password is secret123 and OTP is 987654"
    scrubbed = sanitize_summary(raw_notes)
    assert "secret123" not in scrubbed
    assert "987654" not in scrubbed
    assert "[REDACTED" in scrubbed
