"""Automated tests for User Authentication, Screen Tracking, and Sound Settings."""
import pytest
from fastapi.testclient import TestClient
from main import app
from datetime import datetime

client = TestClient(app)

def test_user_registration_and_login():
    """Verify new user registration with demographics, password validation, and login."""
    unique_email = f"test_{int(datetime.utcnow().timestamp())}@vybe.ai"
    reg_payload = {
        "name": "Jordan Lee",
        "email": unique_email,
        "password": "SecurePassword123!",
        "dob": "1996-08-20",
        "age": 30,
        "role": "Frontend Architect"
    }

    # 1. Register
    reg_resp = client.post("/api/auth/register", json=reg_payload)
    assert reg_resp.status_code == 200
    user_data = reg_resp.json()
    assert user_data["name"] == "Jordan Lee"
    assert user_data["email"] == unique_email
    assert user_data["age"] == 30
    assert user_data["role"] == "Frontend Architect"
    user_id = user_data["user_id"]

    # 2. Login with correct password
    login_resp = client.post("/api/auth/login", json={"email": unique_email, "password": "SecurePassword123!"})
    assert login_resp.status_code == 200
    assert login_resp.json()["user_id"] == user_id

    # 3. Login with wrong password
    bad_login = client.post("/api/auth/login", json={"email": unique_email, "password": "WrongPassword"})
    assert bad_login.status_code == 401

def test_sound_settings_update():
    """Verify notification sound preset selection and volume update."""
    payload = {
        "user_id": "default_user",
        "sound_preset": "crystal_bell",
        "custom_sound_url": "data:audio/mp3;base64,mockCustomAudio",
        "sound_volume": 0.95
    }
    resp = client.post("/api/sound/settings", json=payload)
    assert resp.status_code == 200
    profile = resp.json()["profile"]
    assert profile["sound_preset"] == "crystal_bell"
    assert profile["custom_sound_url"] == "data:audio/mp3;base64,mockCustomAudio"
    assert profile["sound_volume"] == 0.95

def test_automated_screen_session_logging():
    """Verify logging continuous active and idle screen time intervals."""
    user = "screen_test_user"
    now = datetime.utcnow().isoformat()
    session_payload = {
        "user_id": user,
        "started_at": now,
        "ended_at": now,
        "active_minutes": 45.5,
        "idle_minutes": 5.0,
        "breaks_taken": 2
    }
    log_resp = client.post("/api/tracking/session", json=session_payload)
    assert log_resp.status_code == 200
    assert log_resp.json()["session_id"] > 0

    stats_resp = client.get(f"/api/tracking/today?user_id={user}")
    assert stats_resp.status_code == 200
    data = stats_resp.json()
    assert data["total_active_screen_minutes"] >= 45.5
