"""Smart Break Planner Module for VYBE AI.

Constructs an intelligent workday schedule that alternates focused work blocks
with micro-breaks (EyeCare, MindReset), movement pauses (DeskYoga, WalkBreak),
and designated quiet periods (lunch/meetings).
"""
from datetime import datetime, timedelta
from typing import List, Dict, Any

from database import get_user_preferences, get_activity_history
from activity_library import get_activity_by_id
from models import WorkdayPlan, PlanItem

def generate_workday_plan(user_id: str = "default_user", target_date: str = None) -> WorkdayPlan:
    """Generate a chronological timeline for a user's workday."""
    if not target_date:
        target_date = datetime.utcnow().strftime("%Y-%m-%d")

    prefs = get_user_preferences(user_id)
    work_start_str = prefs.get("work_start", "09:00")
    work_end_str = prefs.get("work_end", "17:00")
    quiet_start_str = prefs.get("quiet_hours_start", "12:30")
    quiet_end_str = prefs.get("quiet_hours_end", "13:30")
    interval_min = prefs.get("reminder_interval_min", 45)
    disabled_activities = set(prefs.get("disabled_activities", []))

    # Parse hours
    sh, sm = map(int, work_start_str.split(":"))
    eh, em = map(int, work_end_str.split(":"))
    qh_start, qm_start = map(int, quiet_start_str.split(":"))
    qh_end, qm_end = map(int, quiet_end_str.split(":"))

    base_time = datetime.strptime(f"{target_date} {work_start_str}", "%Y-%m-%d %H:%M")
    end_time = datetime.strptime(f"{target_date} {work_end_str}", "%Y-%m-%d %H:%M")
    quiet_start = datetime.strptime(f"{target_date} {quiet_start_str}", "%Y-%m-%d %H:%M")
    quiet_end = datetime.strptime(f"{target_date} {quiet_end_str}", "%Y-%m-%d %H:%M")

    # Fetch any completed activities on this date to mark them
    history = get_activity_history(user_id, limit=30)
    completed_today = [h for h in history if h["completed_at"].startswith(target_date)]

    items: List[PlanItem] = []
    current = base_time
    cycle_index = 0

    activity_rotation = ["eyecare", "deskyoga", "hydratemate", "mindreset", "walkbreak"]
    # Filter disabled
    allowed_rotation = [a for a in activity_rotation if a not in disabled_activities]
    if not allowed_rotation:
        allowed_rotation = ["eyecare"]

    while current < end_time:
        # Check if current time falls within lunch / quiet hours
        if quiet_start <= current < quiet_end:
            items.append(PlanItem(
                time=current.strftime("%H:%M"),
                type="lunch",
                title="Lunch & Quiet Hours (No Reminders)",
                duration_minutes=int((quiet_end - current).total_seconds() / 60),
                status="upcoming",
                recommended_reason="Designated quiet rest and nourishment window."
            ))
            current = quiet_end
            continue

        # Add a focused work block
        work_block_minutes = min(interval_min, int((end_time - current).total_seconds() / 60))
        if work_block_minutes > 15:
            items.append(PlanItem(
                time=current.strftime("%H:%M"),
                type="work",
                title="Deep Work Session",
                duration_minutes=work_block_minutes,
                status="upcoming",
                recommended_reason="Dedicated focus block."
            ))
            current += timedelta(minutes=work_block_minutes)

        # Break time (if before end of day)
        if current < end_time and not (quiet_start <= current < quiet_end):
            act_id = allowed_rotation[cycle_index % len(allowed_rotation)]
            cycle_index += 1
            act_meta = get_activity_by_id(act_id)
            break_min = max(1, act_meta["duration_seconds"] // 60)

            # Check if user already completed something near this time
            curr_str = current.strftime("%H:%M")
            is_done = any(
                abs((datetime.fromisoformat(c["completed_at"].replace("Z", "")) - current).total_seconds()) < 1800
                for c in completed_today
            )

            items.append(PlanItem(
                time=curr_str,
                type="completed" if is_done else "break",
                title=f"{act_meta['name']} Break",
                duration_minutes=break_min,
                activity_id=act_id,
                status="completed" if is_done else "upcoming",
                recommended_reason=act_meta["description"]
            ))
            current += timedelta(minutes=break_min)

    return WorkdayPlan(
        user_id=user_id,
        date=target_date,
        work_start=work_start_str,
        work_end=work_end_str,
        items=items
    )
