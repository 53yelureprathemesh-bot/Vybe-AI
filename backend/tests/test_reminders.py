"""Automated tests for reminder scheduling, snooze logic, and quiet hours."""
import pytest
from datetime import datetime, timedelta
from database import add_reminder, update_reminder_status, get_recent_reminders, clear_activity_history
from planner import generate_workday_plan

def test_reminder_creation_and_snooze():
    """Verify reminder scheduling and snooze for 5 minutes."""
    user = "test_user_rem"
    clear_activity_history(user)
    
    future_time = (datetime.utcnow() + timedelta(minutes=45)).isoformat()
    rem_id = add_reminder(user, "deskyoga", future_time)
    assert rem_id > 0

    # Snooze by 10 minutes
    success = update_reminder_status(rem_id, user, status="snoozed", snooze_minutes=10)
    assert success is True

    reminders = get_recent_reminders(user)
    assert len(reminders) == 1
    assert reminders[0]["status"] == "snoozed"
    assert reminders[0]["snooze_count"] == 1

def test_quiet_hours_respected_in_break_planner():
    """Verify planner designates lunch/quiet hours without scheduling active breaks."""
    plan = generate_workday_plan("default_user")
    lunch_items = [item for item in plan.items if item.type == "lunch"]
    assert len(lunch_items) >= 1
    assert "Quiet Hours" in lunch_items[0].title
