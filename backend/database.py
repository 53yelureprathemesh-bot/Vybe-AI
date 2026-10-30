"""SQLite Database module for VYBE AI.

Provides persistent storage, data isolation per user, data migrations,
seed data generation for hackathon demos, and data export/deletion.
"""
import sqlite3
import json
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "vybe_wellness.db")

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Create all required tables with indexes and constraints."""
    with get_connection() as conn:
        cursor = conn.cursor()
        
        # 1. Users table (with auth, demographics, sound preferences)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id TEXT PRIMARY KEY,
                display_name TEXT NOT NULL,
                email TEXT UNIQUE,
                password_hash TEXT,
                dob TEXT,
                age INTEGER DEFAULT 28,
                role TEXT DEFAULT 'Software Engineer',
                sound_preset TEXT DEFAULT 'zen_bowl',
                custom_sound_url TEXT,
                sound_volume REAL DEFAULT 0.8,
                timezone TEXT NOT NULL DEFAULT 'UTC',
                created_at TEXT NOT NULL
            );
        """)

        # Migration columns if table already existed without new auth fields
        existing_cols = [r["name"] for r in cursor.execute("PRAGMA table_info(users)").fetchall()]
        migrations = [
            ("email", "ALTER TABLE users ADD COLUMN email TEXT"),
            ("password_hash", "ALTER TABLE users ADD COLUMN password_hash TEXT"),
            ("dob", "ALTER TABLE users ADD COLUMN dob TEXT"),
            ("age", "ALTER TABLE users ADD COLUMN age INTEGER DEFAULT 28"),
            ("role", "ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'Software Engineer'"),
            ("sound_preset", "ALTER TABLE users ADD COLUMN sound_preset TEXT DEFAULT 'zen_bowl'"),
            ("custom_sound_url", "ALTER TABLE users ADD COLUMN custom_sound_url TEXT"),
            ("sound_volume", "ALTER TABLE users ADD COLUMN sound_volume REAL DEFAULT 0.8")
        ]
        for col_name, sql in migrations:
            if col_name not in existing_cols:
                cursor.execute(sql)
                
        # Screen sessions table (for automatic background tracking)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS screen_sessions (
                session_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                started_at TEXT NOT NULL,
                ended_at TEXT NOT NULL,
                active_minutes REAL NOT NULL,
                idle_minutes REAL NOT NULL,
                breaks_taken INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_screen_user ON screen_sessions(user_id, started_at);")
        
        # 2. Preferences table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS preferences (
                user_id TEXT PRIMARY KEY,
                display_name TEXT NOT NULL,
                timezone TEXT NOT NULL DEFAULT 'UTC',
                preferred_activities TEXT NOT NULL,
                disabled_activities TEXT NOT NULL,
                favorite_activities TEXT NOT NULL,
                reminder_interval_min INTEGER NOT NULL DEFAULT 45,
                work_start TEXT NOT NULL DEFAULT '09:00',
                work_end TEXT NOT NULL DEFAULT '17:00',
                quiet_hours_start TEXT NOT NULL DEFAULT '12:30',
                quiet_hours_end TEXT NOT NULL DEFAULT '13:30',
                enable_ai INTEGER NOT NULL DEFAULT 1,
                enable_reminders INTEGER NOT NULL DEFAULT 1,
                theme TEXT NOT NULL DEFAULT 'light',
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            );
        """)
        
        # 3. Activity history table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS activity_history (
                record_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                activity_id TEXT NOT NULL,
                activity_name TEXT NOT NULL,
                category TEXT NOT NULL,
                duration_seconds INTEGER NOT NULL,
                started_at TEXT NOT NULL,
                completed_at TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'completed',
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_history(user_id, completed_at);")
        
        # 4. Feedback table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS feedback (
                feedback_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                record_id INTEGER,
                activity_id TEXT NOT NULL,
                rating TEXT NOT NULL,
                want_similar INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback(user_id, activity_id);")
        
        # 5. Reminder history table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reminder_history (
                reminder_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                activity_id TEXT NOT NULL,
                scheduled_at TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                snooze_count INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_reminder_user ON reminder_history(user_id, scheduled_at);")
        
        conn.commit()
        
    # Ensure default user exists
    ensure_default_user("default_user", "Alex Morgan")

def ensure_default_user(user_id: str = "default_user", display_name: str = "Alex Morgan"):
    """Create default user and default preferences if not present."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT user_id FROM users WHERE user_id = ?", (user_id,))
        if not cursor.fetchone():
            now = datetime.utcnow().isoformat()
            cursor.execute(
                "INSERT INTO users (user_id, display_name, timezone, created_at) VALUES (?, ?, ?, ?)",
                (user_id, display_name, "Local", now)
            )
            cursor.execute("""
                INSERT INTO preferences (
                    user_id, display_name, timezone, preferred_activities, disabled_activities,
                    favorite_activities, reminder_interval_min, work_start, work_end,
                    quiet_hours_start, quiet_hours_end, enable_ai, enable_reminders, theme
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                user_id, display_name, "Local",
                json.dumps(["eyecare", "mindreset", "deskyoga", "walkbreak", "hydratemate"]),
                json.dumps([]),
                json.dumps(["eyecare", "deskyoga"]),
                45, "09:00", "17:00", "12:30", "13:30", 1, 1, "light"
            ))
            conn.commit()

# Authentication & User Profile Management
import hashlib

def hash_password(password: str) -> str:
    """Hash password with application salt."""
    return hashlib.sha256(("vybe_salt_" + password).encode("utf-8")).hexdigest()

def register_user(name: str, email: str, password: str, dob: str, age: int, role: str) -> Dict[str, Any]:
    """Register a new user with full demographics and initialize preferences."""
    email_clean = email.lower().strip()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT user_id FROM users WHERE lower(email) = ?", (email_clean,))
        if cursor.fetchone():
            raise ValueError("An account with this email already exists.")
            
        now = datetime.utcnow().isoformat()
        user_id = f"user_{int(datetime.utcnow().timestamp())}_{hashlib.md5(email_clean.encode()).hexdigest()[:6]}"
        pwd_hash = hash_password(password)

        cursor.execute("""
            INSERT INTO users (
                user_id, display_name, email, password_hash, dob, age, role,
                sound_preset, custom_sound_url, sound_volume, timezone, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'zen_bowl', NULL, 0.8, 'Local', ?)
        """, (user_id, name.strip(), email_clean, pwd_hash, dob, age, role.strip(), now))

        # Initialize preferences
        cursor.execute("""
            INSERT INTO preferences (
                user_id, display_name, timezone, preferred_activities, disabled_activities,
                favorite_activities, reminder_interval_min, work_start, work_end,
                quiet_hours_start, quiet_hours_end, enable_ai, enable_reminders, theme
            ) VALUES (?, ?, 'Local', ?, ?, ?, 45, '09:00', '17:00', '12:30', '13:30', 1, 1, 'light')
        """, (
            user_id, name.strip(),
            json.dumps(["eyecare", "mindreset", "deskyoga", "walkbreak", "hydratemate"]),
            json.dumps([]),
            json.dumps(["eyecare", "deskyoga"])
        ))
        conn.commit()

        return get_user_profile(user_id)

def login_user(email: str, password: str) -> Dict[str, Any]:
    """Verify user credentials and return profile."""
    email_clean = email.lower().strip()
    pwd_hash = hash_password(password)
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE lower(email) = ?", (email_clean,))
        row = cursor.fetchone()
        if not row:
            raise ValueError("Invalid email or password.")
        
        user_data = dict(row)
        if user_data["password_hash"] != pwd_hash:
            raise ValueError("Invalid email or password.")
            
        return get_user_profile(user_data["user_id"])

def get_user_profile(user_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve user demographic profile and sound settings."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        if not row:
            return None
        data = dict(row)
        return {
            "user_id": data["user_id"],
            "name": data["display_name"],
            "email": data.get("email") or f"{data['user_id']}@vybe.ai",
            "dob": data.get("dob") or "1998-05-15",
            "age": data.get("age") or 28,
            "role": data.get("role") or "Software Engineer",
            "sound_preset": data.get("sound_preset") or "zen_bowl",
            "custom_sound_url": data.get("custom_sound_url"),
            "sound_volume": data.get("sound_volume") if data.get("sound_volume") is not None else 0.8,
            "created_at": data["created_at"]
        }

def update_sound_settings(user_id: str, sound_preset: str, custom_sound_url: Optional[str] = None, sound_volume: float = 0.8) -> Dict[str, Any]:
    """Save user notification sound preferences and optional custom audio URL/Base64."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE users SET
                sound_preset = ?,
                custom_sound_url = ?,
                sound_volume = ?
            WHERE user_id = ?
        """, (sound_preset, custom_sound_url, sound_volume, user_id))
        conn.commit()
    return get_user_profile(user_id)

# Screen Time & Automated Activity Logging
def record_screen_session(
    user_id: str,
    started_at: str,
    ended_at: str,
    active_minutes: float,
    idle_minutes: float,
    breaks_taken: int = 0
) -> int:
    """Store an automated focus/screen tracking interval."""
    now = datetime.utcnow().isoformat()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO screen_sessions (
                user_id, started_at, ended_at, active_minutes, idle_minutes, breaks_taken, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (user_id, started_at, ended_at, active_minutes, idle_minutes, breaks_taken, now))
        conn.commit()
        return cursor.lastrowid

def get_today_screen_stats(user_id: str) -> Dict[str, Any]:
    """Calculate today's total active screen time and idle time."""
    today_prefix = datetime.utcnow().strftime("%Y-%m-%d")
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT SUM(active_minutes) as total_active, SUM(idle_minutes) as total_idle, SUM(breaks_taken) as total_breaks
            FROM screen_sessions
            WHERE user_id = ? AND started_at >= ?
        """, (user_id, today_prefix))
        row = cursor.fetchone()
        active = round(row["total_active"] or 0.0, 1) if row else 0.0
        idle = round(row["total_idle"] or 0.0, 1) if row else 0.0
        breaks = (row["total_breaks"] or 0) if row else 0
        return {
            "date": today_prefix,
            "total_active_screen_minutes": active,
            "total_idle_minutes": idle,
            "total_breaks_taken": breaks
        }

# Preferences CRUD
def get_user_preferences(user_id: str = "default_user") -> Dict[str, Any]:
    ensure_default_user(user_id)
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM preferences WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        if not row:
            return {}
        data = dict(row)
        data["preferred_activities"] = json.loads(data["preferred_activities"])
        data["disabled_activities"] = json.loads(data["disabled_activities"])
        data["favorite_activities"] = json.loads(data["favorite_activities"])
        data["enable_ai"] = bool(data["enable_ai"])
        data["enable_reminders"] = bool(data["enable_reminders"])
        return data

def update_user_preferences(user_id: str, prefs: Dict[str, Any]) -> Dict[str, Any]:
    ensure_default_user(user_id)
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE preferences SET
                display_name = ?,
                timezone = ?,
                preferred_activities = ?,
                disabled_activities = ?,
                favorite_activities = ?,
                reminder_interval_min = ?,
                work_start = ?,
                work_end = ?,
                quiet_hours_start = ?,
                quiet_hours_end = ?,
                enable_ai = ?,
                enable_reminders = ?,
                theme = ?
            WHERE user_id = ?
        """, (
            prefs.get("display_name", "Alex Morgan"),
            prefs.get("timezone", "Local"),
            json.dumps(prefs.get("preferred_activities", [])),
            json.dumps(prefs.get("disabled_activities", [])),
            json.dumps(prefs.get("favorite_activities", [])),
            prefs.get("reminder_interval_min", 45),
            prefs.get("work_start", "09:00"),
            prefs.get("work_end", "17:00"),
            prefs.get("quiet_hours_start", "12:30"),
            prefs.get("quiet_hours_end", "13:30"),
            1 if prefs.get("enable_ai", True) else 0,
            1 if prefs.get("enable_reminders", True) else 0,
            prefs.get("theme", "light"),
            user_id
        ))
        conn.commit()
    return get_user_preferences(user_id)

def reset_user_preferences(user_id: str = "default_user") -> Dict[str, Any]:
    defaults = {
        "display_name": "Alex Morgan",
        "timezone": "Local",
        "preferred_activities": ["eyecare", "mindreset", "deskyoga", "walkbreak", "hydratemate"],
        "disabled_activities": [],
        "favorite_activities": ["eyecare", "deskyoga"],
        "reminder_interval_min": 45,
        "work_start": "09:00",
        "work_end": "17:00",
        "quiet_hours_start": "12:30",
        "quiet_hours_end": "13:30",
        "enable_ai": True,
        "enable_reminders": True,
        "theme": "light"
    }
    return update_user_preferences(user_id, defaults)

# Activity History CRUD
def add_activity_record(
    user_id: str,
    activity_id: str,
    activity_name: str,
    category: str,
    duration_seconds: int,
    started_at: str,
    completed_at: str,
    status: str = "completed"
) -> int:
    ensure_default_user(user_id)
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO activity_history (
                user_id, activity_id, activity_name, category,
                duration_seconds, started_at, completed_at, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, activity_id, activity_name, category, duration_seconds, started_at, completed_at, status))
        conn.commit()
        return cursor.lastrowid

def get_activity_history(user_id: str = "default_user", limit: int = 50) -> List[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM activity_history
            WHERE user_id = ?
            ORDER BY completed_at DESC
            LIMIT ?
        """, (user_id, limit))
        return [dict(row) for row in cursor.fetchall()]

def clear_activity_history(user_id: str = "default_user"):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM activity_history WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM feedback WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM reminder_history WHERE user_id = ?", (user_id,))
        conn.commit()

# Feedback CRUD
def add_feedback(
    user_id: str,
    activity_id: str,
    rating: str,
    want_similar: bool = True,
    record_id: Optional[int] = None
) -> int:
    ensure_default_user(user_id)
    now = datetime.utcnow().isoformat()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO feedback (user_id, record_id, activity_id, rating, want_similar, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (user_id, record_id, activity_id, rating, 1 if want_similar else 0, now))
        conn.commit()
        return cursor.lastrowid

def get_activity_feedback_stats(user_id: str = "default_user") -> Dict[str, Dict[str, int]]:
    """Return positive/negative feedback counts by activity."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT activity_id, rating, COUNT(*) as cnt
            FROM feedback
            WHERE user_id = ?
            GROUP BY activity_id, rating
        """, (user_id,))
        stats: Dict[str, Dict[str, int]] = {}
        for row in cursor.fetchall():
            act = row["activity_id"]
            if act not in stats:
                stats[act] = {"helpful": 0, "okay": 0, "not_helpful": 0}
            stats[act][row["rating"]] = row["cnt"]
        return stats

# Reminder History CRUD
def add_reminder(user_id: str, activity_id: str, scheduled_at: str) -> int:
    ensure_default_user(user_id)
    now = datetime.utcnow().isoformat()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO reminder_history (user_id, activity_id, scheduled_at, status, snooze_count, created_at)
            VALUES (?, ?, ?, 'pending', 0, ?)
        """, (user_id, activity_id, scheduled_at, now))
        conn.commit()
        return cursor.lastrowid

def update_reminder_status(reminder_id: int, user_id: str, status: str, snooze_minutes: Optional[int] = None) -> bool:
    with get_connection() as conn:
        cursor = conn.cursor()
        if status == "snoozed" and snooze_minutes:
            cursor.execute("""
                UPDATE reminder_history
                SET status = 'snoozed',
                    snooze_count = snooze_count + 1,
                    scheduled_at = datetime(scheduled_at, '+' || ? || ' minutes')
                WHERE reminder_id = ? AND user_id = ?
            """, (snooze_minutes, reminder_id, user_id))
        else:
            cursor.execute("""
                UPDATE reminder_history
                SET status = ?
                WHERE reminder_id = ? AND user_id = ?
            """, (status, reminder_id, user_id))
        conn.commit()
        return cursor.rowcount > 0

def get_recent_reminders(user_id: str = "default_user", limit: int = 20) -> List[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM reminder_history
            WHERE user_id = ?
            ORDER BY scheduled_at DESC
            LIMIT ?
        """, (user_id, limit))
        return [dict(row) for row in cursor.fetchall()]

# Analytics Aggregation
def get_analytics_data(user_id: str = "default_user", timeframe: str = "7days") -> Dict[str, Any]:
    """Calculate authentic metrics strictly from database records."""
    days = 1 if timeframe == "today" else (7 if timeframe == "7days" else 30)
    cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
    
    with get_connection() as conn:
        cursor = conn.cursor()
        
        # 1. Activities in timeframe
        cursor.execute("""
            SELECT * FROM activity_history
            WHERE user_id = ? AND completed_at >= ? AND status = 'completed'
            ORDER BY completed_at ASC
        """, (user_id, cutoff))
        records = [dict(r) for r in cursor.fetchall()]
        
        total_completed = len(records)
        total_seconds = sum(r["duration_seconds"] for r in records)
        total_minutes = round(total_seconds / 60.0, 1)
        
        # Distribution by activity
        distribution: Dict[str, int] = {}
        for r in records:
            name = r["activity_name"]
            distribution[name] = distribution.get(name, 0) + 1
            
        most_frequent = max(distribution, key=distribution.get) if distribution else None
        
        # Daily trend
        trend_map: Dict[str, Dict[str, Any]] = {}
        for i in range(days):
            date_key = (datetime.utcnow() - timedelta(days=days - 1 - i)).strftime("%Y-%m-%d")
            trend_map[date_key] = {"date": date_key, "count": 0, "minutes": 0.0}
            
        for r in records:
            d_key = r["completed_at"][:10]
            if d_key in trend_map:
                trend_map[d_key]["count"] += 1
                trend_map[d_key]["minutes"] += round(r["duration_seconds"] / 60.0, 1)
                
        daily_trend = list(trend_map.values())
        
        # Reminder Acceptance Rate
        cursor.execute("""
            SELECT status, COUNT(*) as cnt
            FROM reminder_history
            WHERE user_id = ? AND scheduled_at >= ?
            GROUP BY status
        """, (user_id, cutoff))
        reminder_stats = {r["status"]: r["cnt"] for r in cursor.fetchall()}
        total_reminders = sum(reminder_stats.values())
        completed_reminders = reminder_stats.get("completed", 0)
        acceptance_rate = round((completed_reminders / total_reminders * 100), 1) if total_reminders > 0 else 100.0
        
        # Helpful Rate
        cursor.execute("""
            SELECT rating, COUNT(*) as cnt
            FROM feedback
            WHERE user_id = ? AND created_at >= ?
            GROUP BY rating
        """, (user_id, cutoff))
        feedback_stats = {r["rating"]: r["cnt"] for r in cursor.fetchall()}
        total_feedback = sum(feedback_stats.values())
        helpful_count = feedback_stats.get("helpful", 0)
        helpful_rate = round((helpful_count / total_feedback * 100), 1) if total_feedback > 0 else 100.0
        
        return {
            "timeframe": timeframe,
            "total_completed_activities": total_completed,
            "total_minutes_spent": total_minutes,
            "reminder_acceptance_rate": acceptance_rate,
            "helpful_rate_percent": helpful_rate,
            "most_frequent_activity": most_frequent,
            "activity_distribution": distribution,
            "daily_trend": daily_trend,
            "recent_records": records[-10:] if records else []
        }

# Data Export (JSON)
def export_user_data(user_id: str = "default_user") -> Dict[str, Any]:
    prefs = get_user_preferences(user_id)
    history = get_activity_history(user_id, limit=500)
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM feedback WHERE user_id = ?", (user_id,))
        feedback = [dict(r) for r in cursor.fetchall()]
        cursor.execute("SELECT * FROM reminder_history WHERE user_id = ?", (user_id,))
        reminders = [dict(r) for r in cursor.fetchall()]
        
    return {
        "export_date": datetime.utcnow().isoformat(),
        "user_id": user_id,
        "preferences": prefs,
        "activity_history": history,
        "feedback": feedback,
        "reminders": reminders
    }

# Seed Demo Data (Clearly labeled fictional data for hackathon presentation)
def seed_demo_data(user_id: str = "default_user"):
    """Populate realistic 7-day activity and feedback history for hackathon demo."""
    clear_activity_history(user_id)
    
    sample_activities = [
        ("eyecare", "EyeCare", "eye_relaxation", 20),
        ("deskyoga", "DeskYoga", "movement", 120),
        ("mindreset", "MindReset", "breathing_relaxation", 60),
        ("walkbreak", "WalkBreak", "walking", 300),
        ("hydratemate", "HydrateMate", "hydration", 60),
    ]
    
    ratings = ["helpful", "helpful", "helpful", "okay", "helpful"]
    
    now = datetime.utcnow()
    # Insert activities over past 5 days
    for day_offset in range(5, 0, -1):
        day_date = now - timedelta(days=day_offset)
        # 3 to 4 activities per day
        for i in range(3):
            act_id, act_name, cat, duration = sample_activities[(day_offset + i) % len(sample_activities)]
            start_time = (day_date.replace(hour=9 + i * 3, minute=15)).isoformat()
            end_time = (day_date.replace(hour=9 + i * 3, minute=15) + timedelta(seconds=duration)).isoformat()
            rec_id = add_activity_record(
                user_id=user_id,
                activity_id=act_id,
                activity_name=act_name,
                category=cat,
                duration_seconds=duration,
                started_at=start_time,
                completed_at=end_time,
                status="completed"
            )
            # Add corresponding feedback
            add_feedback(
                user_id=user_id,
                activity_id=act_id,
                rating=ratings[(day_offset + i) % len(ratings)],
                want_similar=True,
                record_id=rec_id
            )
            
    # Add 2 completed activities today
    today_morning = now.replace(hour=9, minute=30)
    add_activity_record(
        user_id=user_id,
        activity_id="eyecare",
        activity_name="EyeCare",
        category="eye_relaxation",
        duration_seconds=20,
        started_at=today_morning.isoformat(),
        completed_at=(today_morning + timedelta(seconds=20)).isoformat(),
        status="completed"
    )
    add_feedback(user_id=user_id, activity_id="eyecare", rating="helpful", want_similar=True)
    
    # Add sample reminders
    rem_time = (now + timedelta(minutes=40)).isoformat()
    add_reminder(user_id=user_id, activity_id="deskyoga", scheduled_at=rem_time)

# Initialize on module load
init_db()
