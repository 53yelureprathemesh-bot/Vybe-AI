"""Automated tests for SQLite database persistence and data isolation."""
import pytest
from datetime import datetime
from database import (
    add_activity_record,
    get_activity_history,
    clear_activity_history,
    add_feedback,
    get_activity_feedback_stats,
    get_user_preferences,
    update_user_preferences,
    export_user_data
)

def test_activity_persistence_and_retrieval():
    """Verify activities are saved to SQLite and retrievable."""
    user = "test_user_db1"
    clear_activity_history(user)
    
    now = datetime.utcnow().isoformat()
    rec_id = add_activity_record(
        user_id=user,
        activity_id="eyecare",
        activity_name="EyeCare",
        category="eye_relaxation",
        duration_seconds=20,
        started_at=now,
        completed_at=now,
        status="completed"
    )
    assert rec_id > 0

    history = get_activity_history(user, limit=10)
    assert len(history) == 1
    assert history[0]["activity_id"] == "eyecare"
    assert history[0]["duration_seconds"] == 20

def test_feedback_saved_correctly():
    """Verify user feedback is stored and aggregated."""
    user = "test_user_db1"
    add_feedback(user_id=user, activity_id="deskyoga", rating="helpful", want_similar=True)
    add_feedback(user_id=user, activity_id="deskyoga", rating="helpful", want_similar=True)
    add_feedback(user_id=user, activity_id="deskyoga", rating="not_helpful", want_similar=False)

    stats = get_activity_feedback_stats(user)
    assert "deskyoga" in stats
    assert stats["deskyoga"]["helpful"] == 2
    assert stats["deskyoga"]["not_helpful"] == 1

def test_multi_user_isolation():
    """Ensure user A cannot see user B's records."""
    user_a = "user_alpha"
    user_b = "user_beta"
    clear_activity_history(user_a)
    clear_activity_history(user_b)

    now = datetime.utcnow().isoformat()
    add_activity_record(user_a, "walkbreak", "WalkBreak", "walking", 300, now, now)
    add_activity_record(user_b, "mindreset", "MindReset", "breathing", 60, now, now)

    history_a = get_activity_history(user_a)
    history_b = get_activity_history(user_b)

    assert len(history_a) == 1
    assert history_a[0]["activity_id"] == "walkbreak"
    assert len(history_b) == 1
    assert history_b[0]["activity_id"] == "mindreset"

def test_preferences_update_and_export():
    """Verify user preferences update and JSON export."""
    user = "test_user_export"
    update_user_preferences(user, {"display_name": "Sarah Connor", "reminder_interval_min": 60})
    
    prefs = get_user_preferences(user)
    assert prefs["display_name"] == "Sarah Connor"
    assert prefs["reminder_interval_min"] == 60

    exported = export_user_data(user)
    assert exported["user_id"] == user
    assert exported["preferences"]["display_name"] == "Sarah Connor"
    assert "activity_history" in exported
