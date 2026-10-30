"""FastAPI REST API server for VYBE AI.

Exposes endpoints for activities, check-ins, recommendations, chat assistant,
break planner, activity history, feedback, reminders, analytics, and demo mode.
"""
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List, Optional
import os

from database import (
    init_db,
    get_user_preferences,
    update_user_preferences,
    reset_user_preferences,
    add_activity_record,
    get_activity_history,
    clear_activity_history,
    add_feedback,
    add_reminder,
    update_reminder_status,
    get_recent_reminders,
    get_analytics_data,
    export_user_data,
    seed_demo_data,
    register_user,
    login_user,
    get_user_profile,
    update_sound_settings,
    record_screen_session,
    get_today_screen_stats
)
from activity_library import get_all_activities, get_activity_by_id
from recommendation_engine import engine
from ai_agent import assistant
from planner import generate_workday_plan
from models import (
    WellnessCheckIn,
    RecommendationResponse,
    ActivityRecordCreate,
    FeedbackCreate,
    ReminderCreate,
    ReminderUpdate,
    ChatRequest,
    ChatMessage,
    UserPreferences,
    WorkdayPlan,
    UserRegisterRequest,
    UserLoginRequest,
    UserProfileResponse,
    SoundSettingsUpdate,
    ScreenTrackingPing,
    ScreenSessionRecord
)

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title="VYBE AI API",
    description="Intelligent Workplace Wellness Agent REST API",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend Vite dev server and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "VYBE AI",
        "tagline": "Your Work. Your Wellness. Your Rhythm.",
        "ai_enabled": bool(os.environ.get("GEMINI_API_KEY")),
        "version": "1.0.0"
    }

# 0. User Authentication & Onboarding
@app.post("/api/auth/register", response_model=UserProfileResponse)
def register(req: UserRegisterRequest):
    try:
        profile = register_user(
            name=req.name,
            email=req.email,
            password=req.password,
            dob=req.dob,
            age=req.age,
            role=req.role
        )
        return profile
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/auth/login", response_model=UserProfileResponse)
def login(req: UserLoginRequest):
    try:
        profile = login_user(req.email, req.password)
        return profile
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.get("/api/auth/me", response_model=UserProfileResponse)
def get_current_user(user_id: str = "default_user"):
    profile = get_user_profile(user_id)
    if not profile:
        profile = get_user_profile("default_user")
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    return profile

# 0.1 Sound Preference & Audio Management
@app.post("/api/sound/settings")
def save_sound_settings(req: SoundSettingsUpdate):
    profile = update_sound_settings(
        user_id=req.user_id,
        sound_preset=req.sound_preset,
        custom_sound_url=req.custom_sound_url,
        sound_volume=req.sound_volume
    )
    return {"status": "success", "profile": profile}

# 0.2 Automated Screen Time Tracking
@app.post("/api/tracking/session")
def log_screen_session(session: ScreenSessionRecord):
    session_id = record_screen_session(
        user_id=session.user_id,
        started_at=session.started_at,
        ended_at=session.ended_at,
        active_minutes=session.active_minutes,
        idle_minutes=session.idle_minutes,
        breaks_taken=session.breaks_taken
    )
    return {"status": "success", "session_id": session_id}

@app.get("/api/tracking/today")
def get_today_screen_tracking(user_id: str = "default_user"):
    return get_today_screen_stats(user_id)

# Background Desktop Monitor Integration
@app.get("/api/background/status")
def get_background_status():
    pid_file = os.path.join(os.path.dirname(__file__), "desktop_agent.pid")
    is_running = False
    pid = None
    if os.path.exists(pid_file):
        try:
            with open(pid_file, "r") as f:
                pid = int(f.read().strip())
            import ctypes
            kernel32 = ctypes.windll.kernel32
            handle = kernel32.OpenProcess(0x1000, False, pid)
            if handle != 0:
                kernel32.CloseHandle(handle)
                is_running = True
        except:
            is_running = False
    return {"running": is_running, "pid": pid}

@app.post("/api/background/test-notification")
def trigger_test_desktop_notification():
    try:
        from desktop_agent import show_windows_toast
        show_windows_toast(
            "VYBE AI — 🧘 Desktop Alert Verified!",
            "Your Windows background wellness monitor is active and ready to keep you healthy!",
            "deskyoga"
        )
        return {"status": "success", "message": "Windows desktop notification sent"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# 1. Activities
@app.get("/api/activities")
def list_activities() -> List[Dict[str, Any]]:
    return get_all_activities()

@app.get("/api/activities/{activity_id}")
def get_activity(activity_id: str):
    act = get_activity_by_id(activity_id)
    if not act:
        raise HTTPException(status_code=404, detail="Activity not found")
    return act

# 2. Recommendation Engine (OBSERVE -> ANALYSE -> DECIDE -> ACT -> LEARN)
@app.post("/api/recommend", response_model=RecommendationResponse)
def get_recommendation(
    checkin: WellnessCheckIn,
    exclude: Optional[str] = Query(None, description="Comma-separated activity IDs to exclude")
):
    exclude_list = [x.strip() for x in exclude.split(",")] if exclude else []
    return engine.recommend(checkin, exclude_activity_ids=exclude_list)

# 3. AI Wellness Assistant ("Talk to VYBE")
@app.post("/api/chat", response_model=ChatMessage)
def chat_with_vybe(request: ChatRequest):
    return assistant.process_chat(request)

# 4. User Preferences & Settings
@app.get("/api/preferences")
def get_preferences(user_id: str = "default_user"):
    return get_user_preferences(user_id)

@app.put("/api/preferences")
def update_preferences(prefs: UserPreferences):
    return update_user_preferences(prefs.user_id, prefs.dict())

@app.post("/api/preferences/reset")
def reset_preferences(user_id: str = "default_user"):
    return reset_user_preferences(user_id)

# 5. Activity History
@app.get("/api/history")
def get_history(user_id: str = "default_user", limit: int = 50):
    return get_activity_history(user_id, limit=limit)

@app.post("/api/history")
def record_activity(record: ActivityRecordCreate):
    rec_id = add_activity_record(
        user_id=record.user_id,
        activity_id=record.activity_id,
        activity_name=record.activity_name,
        category=record.category,
        duration_seconds=record.duration_seconds,
        started_at=record.started_at,
        completed_at=record.completed_at,
        status=record.status
    )
    return {"status": "success", "record_id": rec_id}

@app.delete("/api/history")
def delete_history(user_id: str = "default_user"):
    clear_activity_history(user_id)
    return {"status": "success", "message": "Activity and feedback history cleared successfully"}

# 6. Feedback
@app.post("/api/feedback")
def submit_feedback(fb: FeedbackCreate):
    fb_id = add_feedback(
        user_id=fb.user_id,
        activity_id=fb.activity_id,
        rating=fb.rating,
        want_similar=fb.want_similar,
        record_id=fb.record_id
    )
    return {"status": "success", "feedback_id": fb_id}

# 7. Reminders
@app.get("/api/reminders")
def list_reminders(user_id: str = "default_user"):
    return get_recent_reminders(user_id)

@app.post("/api/reminders")
def schedule_reminder(rem: ReminderCreate):
    rem_id = add_reminder(rem.user_id, rem.activity_id, rem.scheduled_at)
    return {"status": "success", "reminder_id": rem_id}

@app.patch("/api/reminders/{reminder_id}")
def update_reminder(reminder_id: int, update: ReminderUpdate, user_id: str = "default_user"):
    success = update_reminder_status(reminder_id, user_id, update.status, update.snooze_minutes)
    if not success:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return {"status": "success", "reminder_id": reminder_id, "new_status": update.status}

# 8. Smart Break Planner
@app.get("/api/planner", response_model=WorkdayPlan)
def get_planner(user_id: str = "default_user", date: Optional[str] = None):
    return generate_workday_plan(user_id, date)

# 9. Wellness Analytics
@app.get("/api/analytics")
def get_analytics(user_id: str = "default_user", timeframe: str = "7days"):
    return get_analytics_data(user_id, timeframe)

# 10. Data Export
@app.get("/api/export")
def export_data(user_id: str = "default_user"):
    return export_user_data(user_id)

# 11. Hackathon Demo Mode
@app.post("/api/demo/seed")
def seed_demo(user_id: str = "default_user"):
    seed_demo_data(user_id)
    return {"status": "success", "message": "Demo data populated with realistic 7-day activity history"}

@app.post("/api/demo/reset")
def reset_demo(user_id: str = "default_user"):
    clear_activity_history(user_id)
    reset_user_preferences(user_id)
    return {"status": "success", "message": "Demo data and preferences reset to initial state"}

# 12. Direct Presentation, Video & Presentation Download endpoints
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
frontend_dist = os.path.join(project_root, "frontend", "dist")

@app.get("/presentation")
async def get_presentation():
    pres_file = os.path.join(frontend_dist, "presentation.html")
    if os.path.exists(pres_file):
        return FileResponse(pres_file)
    raise HTTPException(status_code=404, detail="Presentation not found")

@app.get("/presentation/download")
async def download_presentation():
    pptx_path = os.path.join(project_root, "VYBE_AI_Prajakta_Presentation.pptx")
    if not os.path.exists(pptx_path):
        pptx_path = os.path.join(project_root, "VYBE_AI_Presentation.pptx")
    if os.path.exists(pptx_path):
        return FileResponse(
            pptx_path,
            filename="VYBE_AI_Prajakta_Presentation.pptx",
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation"
        )
    raise HTTPException(status_code=404, detail="PowerPoint file not found")

@app.get("/presentation/video")
async def get_presentation_video():
    video_path = os.path.join(project_root, "vybe_ai_walkthrough_prajakta.mp4")
    if not os.path.exists(video_path):
        video_path = os.path.join(project_root, "vybe_ai_walkthrough_demo.mp4")
    if os.path.exists(video_path):
        return FileResponse(video_path, media_type="video/mp4", filename="vybe_ai_walkthrough_prajakta.mp4")
    raise HTTPException(status_code=404, detail="Walkthrough video not found")

# 13. Mount frontend build if available for seamless standalone serving
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    slides_dir = os.path.join(frontend_dist, "slides")
    if os.path.exists(slides_dir):
        app.mount("/slides", StaticFiles(directory=slides_dir), name="slides")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
