"""Automated tests for AI Wellness Assistant ('Talk to VYBE') and safe fallbacks."""
import pytest
from ai_agent import assistant
from models import ChatRequest
from database import clear_activity_history, add_activity_record, update_user_preferences
from datetime import datetime

def test_chat_stressed_user_intent():
    """Verify stressed user query receives MindReset relaxation."""
    req = ChatRequest(user_id="default_user", message="I am feeling extremely stressed right now.")
    res = assistant.process_chat(req)
    assert res.role == "assistant"
    assert res.suggested_activity_id == "mindreset"
    assert "mindreset" in res.content.lower() or "breathing" in res.content.lower() or "calm" in res.content.lower()

def test_chat_two_minutes_availability():
    """Verify short time query returns 2-minute activity (DeskYoga)."""
    req = ChatRequest(user_id="default_user", message="I have only two minutes before my next meeting.")
    res = assistant.process_chat(req)
    assert res.suggested_activity_id in ["deskyoga", "eyecare"]

def test_chat_decline_walking():
    """Verify declining walking break receives a suitable alternative."""
    req = ChatRequest(user_id="default_user", message="I don't want to walk. Give me another option.")
    res = assistant.process_chat(req)
    assert res.suggested_activity_id in ["deskyoga", "mindreset", "eyecare"]
    assert res.suggested_activity_id != "walkbreak"

def test_chat_query_activities_today():
    """Verify assistant reports actual database records without hallucinations."""
    user = "test_user_chat_hist"
    clear_activity_history(user)
    
    # 1. When empty
    req = ChatRequest(user_id=user, message="What activities did I complete today?")
    res = assistant.process_chat(req)
    assert "haven't logged" in res.content.lower() or "no" in res.content.lower()

    # 2. When activities exist
    now = datetime.utcnow().isoformat()
    add_activity_record(user, "eyecare", "EyeCare", "eye_relaxation", 20, now, now)
    res2 = assistant.process_chat(req)
    assert "1" in res2.content
    assert "EyeCare" in res2.content

def test_disabled_ai_preference_returns_polite_message():
    """When user turns off AI in preferences, assistant respects it."""
    user = "test_user_no_ai"
    update_user_preferences(user, {"enable_ai": False})
    req = ChatRequest(user_id=user, message="Help me relax")
    res = assistant.process_chat(req)
    assert "disabled" in res.content.lower()
