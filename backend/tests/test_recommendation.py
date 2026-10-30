"""Automated tests for VYBE AI recommendation engine."""
import pytest
from recommendation_engine import RecommendationEngine
from models import WellnessCheckIn
from database import update_user_preferences, clear_activity_history, reset_user_preferences

@pytest.fixture(autouse=True)
def setup_teardown():
    reset_user_preferences("test_user_rec")
    clear_activity_history("test_user_rec")
    yield
    clear_activity_history("test_user_rec")

def test_long_screen_session_recommends_visual_break():
    """Scenario 1: Long screen session (>= 90m) with 2m time prioritizes visual/eye relaxation."""
    engine = RecommendationEngine()
    checkin = WellnessCheckIn(
        user_id="test_user_rec",
        screen_session_min=90,
        sitting_duration_min=30,
        mood="normal",
        energy="moderate",
        available_time_seconds=120,
        preferred_activity_category="let_ai_choose"
    )
    rec = engine.recommend(checkin)
    assert rec.activity_id in ["eyecare", "deskyoga"]
    assert rec.duration_seconds <= 120
    assert "screen" in rec.reason.lower() or "eye" in rec.reason.lower() or "visual" in rec.reason.lower() or "eyecare" in rec.activity_id

def test_long_sitting_session_recommends_movement_activity():
    """Scenario 2: Sitting for 90 minutes with 5 minutes available recommends movement."""
    engine = RecommendationEngine()
    checkin = WellnessCheckIn(
        user_id="test_user_rec",
        screen_session_min=10,
        sitting_duration_min=90,
        mood="normal",
        energy="moderate",
        available_time_seconds=300,
        preferred_activity_category="let_ai_choose"
    )
    rec = engine.recommend(checkin)
    assert rec.activity_id in ["walkbreak", "deskyoga"]
    assert rec.duration_seconds <= 300

def test_stressed_user_recommends_relaxation():
    """Scenario 3: Stressed user with 2 minutes available receives MindReset."""
    engine = RecommendationEngine()
    checkin = WellnessCheckIn(
        user_id="test_user_rec",
        screen_session_min=10,
        sitting_duration_min=10,
        mood="stressed",
        energy="moderate",
        available_time_seconds=120,
        preferred_activity_category="let_ai_choose"
    )
    rec = engine.recommend(checkin)
    assert rec.activity_id == "mindreset"
    assert rec.category == "breathing_relaxation"
    assert "stress" in rec.reason.lower() or "calm" in rec.reason.lower() or "breathing" in rec.reason.lower()

def test_tired_user_recommends_suitable_restorative_activity():
    """Scenario 4: Tired user with 5 minutes available receives energizing or restorative break."""
    engine = RecommendationEngine()
    checkin = WellnessCheckIn(
        user_id="test_user_rec",
        screen_session_min=30,
        sitting_duration_min=20,
        mood="tired",
        energy="low",
        available_time_seconds=300,
        preferred_activity_category="let_ai_choose"
    )
    rec = engine.recommend(checkin)
    assert rec.activity_id in ["walkbreak", "hydratemate"]
    assert rec.duration_seconds <= 300

def test_one_minute_window_never_receives_five_minute_activity():
    """CRITICAL: 60-second window must NEVER return WalkBreak (300s) or PowerNap (600s)."""
    engine = RecommendationEngine()
    checkin = WellnessCheckIn(
        user_id="test_user_rec",
        screen_session_min=120,
        sitting_duration_min=120,
        mood="tired",
        energy="low",
        available_time_seconds=60,
        preferred_activity_category="let_ai_choose"
    )
    rec = engine.recommend(checkin)
    assert rec.duration_seconds <= 60
    assert rec.activity_id in ["eyecare", "mindreset", "hydratemate"]
    assert rec.activity_id not in ["walkbreak", "powernap", "deskyoga"]

def test_thirty_second_micro_window():
    """Scenario 5: 30-second window only matches EyeCare (20s)."""
    engine = RecommendationEngine()
    checkin = WellnessCheckIn(
        user_id="test_user_rec",
        screen_session_min=45,
        sitting_duration_min=45,
        mood="normal",
        energy="moderate",
        available_time_seconds=30,
        preferred_activity_category="let_ai_choose"
    )
    rec = engine.recommend(checkin)
    assert rec.activity_id == "eyecare"
    assert rec.duration_seconds == 20

def test_declined_activity_excluded_on_choose_another():
    """When user excludes an activity, it is not recommended again."""
    engine = RecommendationEngine()
    checkin = WellnessCheckIn(
        user_id="test_user_rec",
        screen_session_min=10,
        sitting_duration_min=90,
        mood="normal",
        energy="moderate",
        available_time_seconds=300,
        preferred_activity_category="let_ai_choose"
    )
    rec1 = engine.recommend(checkin)
    # Exclude first choice
    rec2 = engine.recommend(checkin, exclude_activity_ids=[rec1.activity_id])
    assert rec2.activity_id != rec1.activity_id
    assert rec2.duration_seconds <= 300

def test_disabled_activity_is_never_selected():
    """If user disables an activity in preferences, engine never selects it."""
    engine = RecommendationEngine()
    prefs = update_user_preferences("test_user_rec", {
        "disabled_activities": ["eyecare", "deskyoga"]
    })
    checkin = WellnessCheckIn(
        user_id="test_user_rec",
        screen_session_min=120,
        sitting_duration_min=60,
        mood="normal",
        energy="moderate",
        available_time_seconds=120,
        preferred_activity_category="let_ai_choose"
    )
    rec = engine.recommend(checkin)
    assert rec.activity_id not in ["eyecare", "deskyoga"]
