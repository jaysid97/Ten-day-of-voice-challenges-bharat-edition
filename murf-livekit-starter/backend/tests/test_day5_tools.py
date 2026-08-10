import pytest
import sys
import os

# Add src to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from tools import (
    fetch_ncert_exercise_and_syllabus,
    fetch_language_lesson_and_vocabulary,
    fetch_subject_quiz_and_solution,
    lookup_word_meaning_and_origin,
)
from db import init_db, save_user_profile


def test_fetch_ncert_exercise_happy_path():
    result = fetch_ncert_exercise_and_syllabus(subject="math", topic="fractions", class_level="Class 8")
    assert "Fractions" in result or "fractions" in result or "LIVE DATA FETCH SUCCESS" in result or "NCERT" in result
    assert "Practice Exercise" in result


def test_fetch_ncert_exercise_chaining():
    init_db()
    save_user_profile(
        user_id="test_learner_day5",
        name="Aarav",
        language_preference="Hindi",
        facts={"current_level": "Class 10 Science", "topics_covered": "Light Reflection"},
    )
    result = fetch_ncert_exercise_and_syllabus(subject="science", topic="light", user_id_or_name="test_learner_day5")
    assert "Class 10 Science" in result or "Aarav" in result or "Auto-Chained" in result


def test_fetch_language_lesson():
    result = fetch_language_lesson_and_vocabulary(language="Sanskrit", topic_or_level="beginner")
    assert "Sanskrit" in result
    assert "Spoken Practice" in result or "Greetings" in result or "Exercise" in result


def test_fetch_subject_quiz():
    result = fetch_subject_quiz_and_solution(subject="coding", topic="python", difficulty="easy")
    assert "Python" in result or "Coding" in result
    assert "Quiz Question" in result


def test_lookup_word_meaning():
    result = lookup_word_meaning_and_origin(word="curiosity")
    assert "curiosity" in result.lower()
    assert "Definition" in result


def test_graceful_failure_path():
    result = fetch_ncert_exercise_and_syllabus(subject="math", topic="nonexistent_xyz_123456789")
    assert "LIVE SOURCE UNREACHABLE" in result or "GRACEFUL FALLBACK ACTIVE" in result or "Practice Exercise" in result
