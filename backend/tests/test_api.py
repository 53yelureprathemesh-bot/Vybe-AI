"""Automated integration tests for FastAPI endpoints using TestClient."""
import pytest
from fastapi.testclient import TestClient
from main import app
from datetime import datetime

client = TestClient(app)

def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app"] == "VYBE AI"

def test_list_activities_endpoint():
    response = client.get("/api/activities")
    assert response.status_code == 200
    activities = response.json()
    assert len(activities) >= 6
    act_ids = [a["id"] for a in activities]
    assert "eyecare" in act_ids
    assert "deskyoga" in act_ids
    assert "mindreset" in act_ids
    assert "walkbreak" in act_ids
    assert "hydratemate" in act_ids
    assert "powernap" in act_ids

def test_recommendation_endpoint():
    payload = {
        "user_id": "test_api_user",
        "screen_session_min": 90,
        "sitting_duration_min": 60,
        "mood": "normal",
        "energy": "moderate",
        "available_time_seconds": 120,
        "preferred_activity_category": "let_ai_choose",
        "reminder_mode": "immediate"
    }
    response = client.post("/api/recommend", json=payload)
    assert response.status_code == 200
    rec = response.json()
    assert "activity_id" in rec
    assert rec["duration_seconds"] <= 120
    assert "reason" in rec

def test_activity_record_and_history_lifecycle():
    user = "test_api_lifecycle"
    client.delete(f"/api/history?user_id={user}")
    
    now = datetime.utcnow().isoformat()
    record_payload = {
        "user_id": user,
        "activity_id": "deskyoga",
        "activity_name": "DeskYoga",
        "category": "movement",
        "duration_seconds": 120,
        "started_at": now,
        "completed_at": now,
        "status": "completed"
    }
    create_resp = client.post("/api/history", json=record_payload)
    assert create_resp.status_code == 200
    rec_id = create_resp.json()["record_id"]
    assert rec_id > 0

    # Submit feedback
    fb_payload = {
        "user_id": user,
        "record_id": rec_id,
        "activity_id": "deskyoga",
        "rating": "helpful",
        "want_similar": True
    }
    fb_resp = client.post("/api/feedback", json=fb_payload)
    assert fb_resp.status_code == 200

    # Verify history
    hist_resp = client.get(f"/api/history?user_id={user}")
    assert hist_resp.status_code == 200
    history = hist_resp.json()
    assert len(history) == 1
    assert history[0]["activity_id"] == "deskyoga"

def test_demo_seed_and_reset_endpoints():
    user = "demo_test_user"
    seed_resp = client.post(f"/api/demo/seed?user_id={user}")
    assert seed_resp.status_code == 200

    analytics_resp = client.get(f"/api/analytics?user_id={user}&timeframe=7days")
    assert analytics_resp.status_code == 200
    data = analytics_resp.json()
    assert data["total_completed_activities"] > 0

    reset_resp = client.post(f"/api/demo/reset?user_id={user}")
    assert reset_resp.status_code == 200
    
    analytics_after = client.get(f"/api/analytics?user_id={user}&timeframe=7days").json()
    assert analytics_after["total_completed_activities"] == 0
