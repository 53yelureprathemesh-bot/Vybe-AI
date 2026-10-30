"""Pydantic schemas and models for VYBE AI."""
from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field

# User & Authentication Models
class UserRegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: str = Field(min_length=5, max_length=120)
    password: str = Field(min_length=6, max_length=100)
    dob: str = Field(description="Date of birth YYYY-MM-DD")
    age: int = Field(ge=14, le=100)
    role: str = Field(default="Software Engineer", max_length=100)

class UserLoginRequest(BaseModel):
    email: str
    password: str

class UserProfileResponse(BaseModel):
    user_id: str
    name: str
    email: str
    dob: str
    age: int
    role: str
    sound_preset: str = "zen_bowl"
    custom_sound_url: Optional[str] = None
    sound_volume: float = 0.8
    created_at: str

class SoundSettingsUpdate(BaseModel):
    user_id: str = "default_user"
    sound_preset: str = "zen_bowl"
    custom_sound_url: Optional[str] = None
    sound_volume: float = 0.8

# Screen Time & Automatic Activity Tracking Models
class ScreenTrackingPing(BaseModel):
    user_id: str = "default_user"
    continuous_active_seconds: int
    session_idle_seconds: int
    timestamp: str

class ScreenSessionRecord(BaseModel):
    session_id: Optional[int] = None
    user_id: str
    started_at: str
    ended_at: str
    active_minutes: float
    idle_minutes: float
    breaks_taken: int = 0

# User & Preferences
class UserPreferences(BaseModel):
    user_id: str = "default_user"
    display_name: str = "Alex Morgan"
    timezone: str = "UTC"
    preferred_activities: List[str] = Field(default_factory=lambda: ["eyecare", "mindreset", "deskyoga", "walkbreak", "hydratemate"])
    disabled_activities: List[str] = Field(default_factory=list)
    favorite_activities: List[str] = Field(default_factory=lambda: ["eyecare", "deskyoga"])
    reminder_interval_min: int = 45
    work_start: str = "09:00"
    work_end: str = "17:00"
    quiet_hours_start: str = "12:30"
    quiet_hours_end: str = "13:30"
    enable_ai: bool = True
    enable_reminders: bool = True
    theme: str = "light"

# Wellness Check-In Input
class WellnessCheckIn(BaseModel):
    user_id: str = "default_user"
    screen_session_min: int = Field(ge=0, le=720, description="Minutes continuously looking at screen")
    sitting_duration_min: int = Field(ge=0, le=720, description="Minutes sitting without a break")
    mood: Literal["feeling_good", "normal", "tired", "stressed", "low_energy"] = "normal"
    energy: Literal["high", "moderate", "low"] = "moderate"
    available_time_seconds: int = Field(ge=30, le=1200, description="Available break time in seconds (e.g. 30, 60, 120, 300, 600, 900, 1200)")
    preferred_activity_category: Optional[Literal[
        "eye_relaxation", "movement", "breathing_relaxation", "walking", "hydration", "quiet_rest", "let_ai_choose"
    ]] = "let_ai_choose"
    reminder_mode: Literal["immediate", "reminder"] = "immediate"

# Recommendation Output
class RecommendationResponse(BaseModel):
    activity_id: str
    activity_name: str
    tagline: str
    category: str
    duration_seconds: int
    duration_label: str
    description: str
    reason: str
    confidence_score: float
    alternatives: List[Dict[str, Any]] = Field(default_factory=list)
    action_type: Literal["immediate", "scheduled"] = "immediate"
    source: Literal["rule_engine", "llm"] = "rule_engine"

# Activity Completion Record
class ActivityRecordCreate(BaseModel):
    user_id: str = "default_user"
    activity_id: str
    activity_name: str
    category: str
    duration_seconds: int
    started_at: str
    completed_at: str
    status: Literal["completed", "stopped_early", "skipped"] = "completed"

class ActivityRecord(ActivityRecordCreate):
    record_id: int

# Feedback Model
class FeedbackCreate(BaseModel):
    user_id: str = "default_user"
    record_id: Optional[int] = None
    activity_id: str
    rating: Literal["helpful", "okay", "not_helpful"]
    want_similar: bool = True

class FeedbackRecord(FeedbackCreate):
    feedback_id: int
    created_at: str

# Reminder System Model
class ReminderCreate(BaseModel):
    user_id: str = "default_user"
    activity_id: str
    scheduled_at: str
    reason: str = "Scheduled break"

class ReminderUpdate(BaseModel):
    status: Literal["completed", "dismissed", "snoozed"]
    snooze_minutes: Optional[int] = 5

class ReminderRecord(BaseModel):
    reminder_id: int
    user_id: str
    activity_id: str
    scheduled_at: str
    status: str
    snooze_count: int
    created_at: str

# Chat Assistant
class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str
    timestamp: Optional[str] = None
    suggested_activity_id: Optional[str] = None
    suggested_actions: Optional[List[Dict[str, str]]] = None
    source: Optional[str] = "rule_engine"

class ChatRequest(BaseModel):
    user_id: str = "default_user"
    message: str
    conversation_history: Optional[List[ChatMessage]] = Field(default_factory=list)

# Break Planner
class PlanItem(BaseModel):
    time: str
    type: Literal["work", "break", "lunch", "completed"]
    title: str
    duration_minutes: int
    activity_id: Optional[str] = None
    status: Literal["upcoming", "completed", "skipped"] = "upcoming"
    recommended_reason: Optional[str] = None

class WorkdayPlan(BaseModel):
    user_id: str
    date: str
    work_start: str
    work_end: str
    items: List[PlanItem]

# Analytics Summary
class AnalyticsSummary(BaseModel):
    timeframe: Literal["today", "7days", "30days"]
    total_completed_activities: int
    total_minutes_spent: float
    reminder_acceptance_rate: float
    helpful_rate_percent: float
    most_frequent_activity: Optional[str] = None
    activity_distribution: Dict[str, int]
    daily_trend: List[Dict[str, Any]]
    recent_records: List[Dict[str, Any]]
