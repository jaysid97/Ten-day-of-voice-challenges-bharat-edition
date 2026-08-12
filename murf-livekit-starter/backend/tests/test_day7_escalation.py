import os
import sys
import tempfile
import pytest

# Ensure src is on python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

from db import (
    init_db,
    sanitize_summary,
    save_human_help_request,
    get_human_help_requests,
    update_human_help_status,
)
from tools import create_escalation, send_discord_webhook


@pytest.fixture
def temp_db():
    """Create a temporary SQLite database file for testing Day 7 escalation features."""
    db_fd, db_path = tempfile.mkstemp(suffix=".db")
    os.close(db_fd)
    init_db(db_path)
    yield db_path
    try:
        if os.path.exists(db_path):
            os.remove(db_path)
    except Exception:
        pass


def test_pii_sanitization():
    """Verify sensitive private details (passwords, OTPs, PINs, cards, Aadhaar) are scrubbed."""
    raw_text = "Learner reported password: Secret123 and OTP: 987654. PIN: 4321. Aadhaar: 1234 5678 9012. Card: 4111-1111-1111-1111."
    clean = sanitize_summary(raw_text)

    assert "Secret123" not in clean
    assert "[REDACTED_SENSITIVE]" in clean or "[REDACTED" in clean
    assert "987654" not in clean
    assert "[REDACTED_OTP]" in clean
    assert "4321" not in clean
    assert "[REDACTED_PIN]" in clean
    assert "4111-1111-1111-1111" not in clean
    assert "[REDACTED_CARD_NO]" in clean
    assert "1234 5678 9012" not in clean
    assert "[REDACTED_GOVT_ID]" in clean


def test_consent_enforcement_raises_error(temp_db):
    """Verify creating a human help request without consent fails."""
    with pytest.raises(ValueError, match="Consent required"):
        save_human_help_request(
            caller_name="Ramesh",
            reason_category="Frustrated Learner / Teacher Help Needed",
            issue_description="Stuck on fractions",
            agent_checked="Explained basic rules twice",
            user_consent_granted=False,
            db_path=temp_db,
        )


def test_create_and_fetch_escalation_request(temp_db):
    """Verify valid escalation creation returns a Reference ID and stores in SQLite DB."""
    ticket = save_human_help_request(
        caller_name="Ramesh",
        reason_category="Frustrated Learner / Teacher Help Needed",
        issue_description="Learner crying, stuck on Class 10 Math differentiation",
        agent_checked="Checked NCERT calculus syllabus, learner remained frustrated",
        contact_info="+91 98765 43210",
        urgency="high",
        preferred_language="Hindi",
        preferred_contact_method="Phone Call",
        user_consent_granted=True,
        db_path=temp_db,
    )

    assert ticket["ref_id"].startswith("REF-")
    assert ticket["status"] == "OPEN"
    assert ticket["caller_name"] == "Ramesh"
    assert ticket["is_duplicate"] is False

    # Fetch from DB
    open_requests = get_human_help_requests(status="OPEN", db_path=temp_db)
    assert len(open_requests) == 1
    assert open_requests[0]["ref_id"] == ticket["ref_id"]
    assert open_requests[0]["urgency"] == "high"


def test_duplicate_request_prevention(temp_db):
    """Verify duplicate requests for the same caller and issue category update the existing ticket."""
    ticket1 = save_human_help_request(
        caller_name="Priya",
        reason_category="Exam, Certificate, or Policy Dispute",
        issue_description="CBSE Class 12 Hall Ticket photo error",
        agent_checked="Checked policy guidelines",
        urgency="medium",
        user_consent_granted=True,
        db_path=temp_db,
    )

    # Second request for same caller and category
    ticket2 = save_human_help_request(
        caller_name="Priya",
        reason_category="Exam, Certificate, or Policy Dispute",
        issue_description="Follow-up on CBSE Hall Ticket photo error",
        agent_checked="Checked policy guidelines again",
        urgency="high",
        user_consent_granted=True,
        db_path=temp_db,
    )

    assert ticket2["is_duplicate"] is True
    assert ticket2["ref_id"] == ticket1["ref_id"]
    assert ticket2["urgency"] == "high"

    # Verify DB contains 1 updated ticket
    requests = get_human_help_requests(db_path=temp_db)
    assert len(requests) == 1
    assert requests[0]["urgency"] == "high"
    assert "Follow-up" in requests[0]["notes"] or "Follow-up" in requests[0]["issue_description"]


def test_status_update_lifecycle(temp_db):
    """Verify ticket status can transition OPEN -> IN_PROGRESS -> RESOLVED."""
    ticket = save_human_help_request(
        caller_name="Rahul",
        reason_category="Frustrated Learner / Teacher Help Needed",
        issue_description="Stuck on Sanskrit grammar",
        agent_checked="Taught basic greetings",
        user_consent_granted=True,
        db_path=temp_db,
    )
    ref_id = ticket["ref_id"]

    # Transition to IN_PROGRESS
    ok1 = update_human_help_status(ref_id, "IN_PROGRESS", resolution_notes="Senior teacher assigned", db_path=temp_db)
    assert ok1 is True
    in_prog = get_human_help_requests(ref_id=ref_id, db_path=temp_db)[0]
    assert in_prog["status"] == "IN_PROGRESS"

    # Transition to RESOLVED
    ok2 = update_human_help_status(ref_id, "RESOLVED", resolution_notes="Completed 1-on-1 tutoring session", db_path=temp_db)
    assert ok2 is True
    resolved = get_human_help_requests(ref_id=ref_id, db_path=temp_db)[0]
    assert resolved["status"] == "RESOLVED"


def test_create_escalation_tool_function(temp_db):
    """Verify create_escalation function tool rejects unconsented calls and processes valid calls."""
    # Ensure temp DB is initialized
    init_db(temp_db)
    
    # Test refusal when consent is False
    res_no_consent = create_escalation(
        caller_name="TestUser",
        reason_category="Frustrated Learner / Teacher Help Needed",
        issue_description="Needs help",
        agent_checked="Nothing",
        user_consent_granted=False,
        db_path=temp_db,
    )
    assert "CONSENT NOT GRANTED" in res_no_consent

    # Test valid call
    res_valid = create_escalation(
        caller_name="TestUser",
        reason_category="Frustrated Learner / Teacher Help Needed",
        issue_description="Stuck on calculus",
        agent_checked="Checked syllabus",
        user_consent_granted=True,
        db_path=temp_db,
    )
    assert "STATUS: HUMAN HELP TICKET CREATED" in res_valid or "STATUS: EXISTING TICKET UPDATED" in res_valid
    assert "REF-" in res_valid
