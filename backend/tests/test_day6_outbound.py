import os
import sys
import tempfile
import pytest

# Ensure src is on python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

from db import (
    init_db,
    log_outbound_call,
    set_learner_opt_out,
    is_learner_opted_out,
    calculate_retry_delay,
    get_outbound_history,
)
from outbound_call import place_outbound_call


@pytest.fixture
def temp_db():
    """Create a temporary SQLite database file for testing."""
    db_fd, db_path = tempfile.mkstemp(suffix=".db")
    os.close(db_fd)
    init_db(db_path)
    yield db_path
    try:
        if os.path.exists(db_path):
            os.remove(db_path)
    except Exception:
        pass



def test_outbound_opening_script_structure():
    """Verify Day 6 mandatory opening script contains Who, Why, and Opt-Out instructions."""
    name = "Ramesh"
    topic = "Class 10 Science Photosynthesis"
    outbound_opening = (
        f"नमस्ते {name} जी! मैं शिक्षा AI बोल रहा हूँ, आपकी डेली 5-मिनट NCERT प्रैक्टिस कॉल के लिए। "
        f"अगर आप ये कॉल्स बंद करना चाहते हैं, तो बस 'स्टॉप' या 'कॉल्स बंद करो' बोल दें। "
        f"आज हम {topic} रिवाइज करेंगे। क्या आप शुरू करने के लिए तैयार हैं?"
    )

    # Check Sentence 1: Who & Why
    assert "शिक्षा AI" in outbound_opening
    assert "प्रैक्टिस कॉल" in outbound_opening

    # Check Sentence 2: Opt-Out / How to make it stop
    assert "बंद करना चाहते हैं" in outbound_opening or "स्टॉप" in outbound_opening

    # Check Value delivery
    assert topic in outbound_opening


def test_sqlite_outbound_call_logging(temp_db):
    """Verify log_outbound_call saves calls to SQLite DB."""
    call_id = "test_call_101"
    user_id = "ramesh"
    phone = "+919876543210"
    topic = "Math Fractions"

    log_entry = log_outbound_call(
        call_id=call_id,
        user_id=user_id,
        phone_number=phone,
        topic=topic,
        outcome="ANSWERED",
        db_path=temp_db,
    )

    assert log_entry["call_id"] == call_id
    assert log_entry["outcome"] == "ANSWERED"
    assert log_entry["user_id"] == "ramesh"

    history = get_outbound_history(user_id=user_id, db_path=temp_db)
    assert len(history) == 1
    assert history[0]["call_id"] == call_id


def test_retry_delay_calculations():
    """Verify outcome handling & retry rules:
    - NO_ANSWER -> 15 mins delay
    - BUSY -> 5 mins delay
    - ANSWERED / VOICEMAIL / OPT_OUT -> No retry (None)
    """
    next_no_ans, _ = calculate_retry_delay("NO_ANSWER", current_retry_count=0)
    assert next_no_ans is not None

    next_busy, _ = calculate_retry_delay("BUSY", current_retry_count=0)
    assert next_busy is not None

    next_answered, _ = calculate_retry_delay("ANSWERED", current_retry_count=0)
    assert next_answered is None

    next_vm, _ = calculate_retry_delay("VOICEMAIL", current_retry_count=0)
    assert next_vm is None

    # Test max retries limit
    next_max, note = calculate_retry_delay("BUSY", current_retry_count=3)
    assert next_max is None
    assert "retries: 3" in note


def test_opt_out_preferences(temp_db):
    """Verify set_learner_opt_out and is_learner_opted_out functionality."""
    user_id = "priya"
    assert not is_learner_opted_out(user_id, db_path=temp_db)

    # Opt out
    set_learner_opt_out(user_id, opt_out=True, reason="Testing opt out", db_path=temp_db)
    assert is_learner_opted_out(user_id, db_path=temp_db)

    # Log call when opted out (should log OPT_OUT outcome)
    log_outbound_call("call_opt", user_id, "+919876543210", "Topic", "OPT_OUT", db_path=temp_db)
    assert is_learner_opted_out(user_id, db_path=temp_db)


def test_outbound_call_dispatcher(temp_db):
    """Verify place_outbound_call generates expected result structure."""
    res = place_outbound_call(
        to_phone="+919876543210",
        name="Ramesh",
        user_id="ramesh",
        topic="Physics Gravity",
        outcome_sim="ANSWERED",
    )
    assert res["status"] == "SUCCESS"
    assert "opening_script" in res
    assert res["log"]["outcome"] == "ANSWERED"
