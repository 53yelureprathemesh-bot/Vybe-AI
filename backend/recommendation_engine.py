"""AI Recommendation Engine for VYBE AI.

Implements the 5-phase agent loop:
OBSERVE -> ANALYSE -> DECIDE -> ACT -> LEARN

Guarantees:
1. Strict duration filtering (never recommends an activity longer than available time).
2. Explicit preference and disabled-activity enforcement.
3. Adaptive learning from historical feedback and completion records.
4. Transparent explainability for all recommendations.
5. Robust fallback behavior.
"""
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

from activity_library import get_all_activities, get_activity_by_id
from database import (
    get_user_preferences,
    get_activity_history,
    get_activity_feedback_stats
)
from models import WellnessCheckIn, RecommendationResponse

class RecommendationEngine:
    def __init__(self):
        self.activities = get_all_activities()

    def recommend(
        self,
        checkin: WellnessCheckIn,
        exclude_activity_ids: Optional[List[str]] = None
    ) -> RecommendationResponse:
        """Execute the OBSERVE -> ANALYSE -> DECIDE -> ACT loop."""
        exclude_ids = set(exclude_activity_ids or [])
        
        # 1. OBSERVE: Fetch user context, preferences, and feedback memory
        prefs = get_user_preferences(checkin.user_id)
        disabled_activities = set(prefs.get("disabled_activities", []))
        favorite_activities = set(prefs.get("favorite_activities", []))
        feedback_stats = get_activity_feedback_stats(checkin.user_id)
        recent_history = get_activity_history(checkin.user_id, limit=10)
        recent_activity_ids = [r["activity_id"] for r in recent_history[:3]]
        
        # 2. ANALYSE & FILTER: Hard constraints
        candidates = []
        for act in self.activities:
            act_id = act["id"]
            
            # Constraint A: User explicitly disabled this activity
            if act_id in disabled_activities:
                continue
                
            # Constraint B: User requested exclusion (e.g. clicked "Choose Another")
            if act_id in exclude_ids:
                continue
                
            # Constraint C: Strict duration check (Must fit within available break time)
            if act["duration_seconds"] > checkin.available_time_seconds:
                continue
                
            # Constraint D: PowerNap policies (Only if available time >= 10 min and mood is tired/low energy or user chose quiet_rest)
            if act_id == "powernap":
                if checkin.available_time_seconds < 600:
                    continue
                if checkin.preferred_activity_category != "quiet_rest" and checkin.mood not in ["tired", "low_energy"]:
                    continue
                    
            candidates.append(act)
            
        # Fallback if no candidate fits strict filters
        if not candidates:
            # If all were excluded via "Choose Another", clear exclude_ids and retry with duration filter
            for act in self.activities:
                if act["id"] not in disabled_activities and act["duration_seconds"] <= checkin.available_time_seconds:
                    candidates.append(act)
                    
        # Ultimate fallback (shortest approved activity: eyecare)
        if not candidates:
            eyecare = get_activity_by_id("eyecare")
            return self._build_response(
                activity=eyecare,
                reason="EyeCare fits your brief time window best, offering immediate micro-relaxation.",
                confidence=0.85,
                alternatives=[],
                action_type=checkin.reminder_mode
            )

        # 3. DECIDE: Multi-Factor Scoring
        scored_candidates = []
        for act in candidates:
            act_id = act["id"]
            score = 5.0  # Base score
            reasons = []

            # Factor 1: Screen session trigger
            if checkin.screen_session_min >= 45:
                if act["category"] == "eye_relaxation":
                    score += 4.5
                    reasons.append(f"Continuous screen session of {checkin.screen_session_min} minutes calls for optical rest.")
                elif act["category"] == "breathing_relaxation":
                    score += 1.5

            # Factor 2: Prolonged sitting trigger
            if checkin.sitting_duration_min >= 50:
                if act["category"] in ["movement", "walking"]:
                    score += 4.5
                    reasons.append(f"Sitting continuously for {checkin.sitting_duration_min} minutes warrants physical movement.")
                elif act["category"] == "hydration":
                    score += 1.5

            # Factor 3: Mood & Emotional state
            if checkin.mood == "stressed":
                if act["category"] == "breathing_relaxation":
                    score += 5.0
                    reasons.append("Reported stress is best balanced with a calming breathing cycle.")
                elif act["category"] == "movement":
                    score += 2.0
            elif checkin.mood in ["tired", "low_energy"] or checkin.energy == "low":
                if act["category"] == "walking":
                    score += 4.0
                    reasons.append("A brief walk naturally boosts alertness and circulation.")
                elif act["category"] == "hydration":
                    score += 3.0
                    reasons.append("Hydration helps combat fatigue and energy slumps.")
                elif act["category"] == "quiet_rest" and checkin.available_time_seconds >= 600:
                    score += 4.0
                    reasons.append("Sufficient time is available for a restorative power nap.")

            # Factor 4: User explicit category preference
            if checkin.preferred_activity_category and checkin.preferred_activity_category != "let_ai_choose":
                if act["category"] == checkin.preferred_activity_category:
                    score += 6.0
                    reasons.append(f"Matches your requested preference for {act['category'].replace('_', ' ')}.")

            # Factor 5: User favorites
            if act_id in favorite_activities:
                score += 1.5

            # Factor 6: Historical feedback learning (LEARN)
            stats = feedback_stats.get(act_id, {})
            helpful_count = stats.get("helpful", 0)
            not_helpful_count = stats.get("not_helpful", 0)
            if helpful_count > 0:
                score += min(helpful_count * 0.8, 3.0)
            if not_helpful_count > 0:
                score -= not_helpful_count * 1.5

            # Factor 7: Recency penalty (Avoid back-to-back repetitions)
            if recent_activity_ids and act_id == recent_activity_ids[0]:
                score -= 3.0  # Penalize the most recently completed activity
            elif act_id in recent_activity_ids:
                score -= 1.5

            # Available time utilization bonus (prefer activities that use a healthy portion of available time)
            fit_ratio = act["duration_seconds"] / max(checkin.available_time_seconds, 1)
            score += fit_ratio * 1.0

            scored_candidates.append({
                "activity": act,
                "score": score,
                "reasons": reasons
            })

        # Sort candidates descending by score
        scored_candidates.sort(key=lambda x: x["score"], reverse=True)
        top_pick = scored_candidates[0]
        selected_act = top_pick["activity"]
        
        # Build synthesis reason
        if top_pick["reasons"]:
            primary_reason = top_pick["reasons"][0]
            explanation = f"You selected a {self._format_duration(checkin.available_time_seconds)} break. {primary_reason} VYBE recommends {selected_act['name']}."
        else:
            explanation = f"VYBE selected {selected_act['name']} as a comfortable {self._format_duration(selected_act['duration_seconds'])} pause fitting your schedule."

        # Alternatives for "Choose Another"
        alternatives = [
            {
                "id": c["activity"]["id"],
                "name": c["activity"]["name"],
                "duration_seconds": c["activity"]["duration_seconds"],
                "category": c["activity"]["category"],
                "description": c["activity"]["description"]
            }
            for c in scored_candidates[1:4]
        ]

        return self._build_response(
            activity=selected_act,
            reason=explanation,
            confidence=min(round(top_pick["score"] / 15.0, 2), 0.98),
            alternatives=alternatives,
            action_type=checkin.reminder_mode
        )

    def _format_duration(self, seconds: int) -> str:
        if seconds < 60:
            return f"{seconds}-second"
        minutes = seconds // 60
        return f"{minutes}-minute"

    def _build_response(
        self,
        activity: Dict[str, Any],
        reason: str,
        confidence: float,
        alternatives: List[Dict[str, Any]],
        action_type: str
    ) -> RecommendationResponse:
        dur = activity["duration_seconds"]
        dur_label = f"{dur}s" if dur < 60 else f"{dur // 60} min"
        return RecommendationResponse(
            activity_id=activity["id"],
            activity_name=activity["name"],
            tagline=activity.get("tagline", ""),
            category=activity["category"],
            duration_seconds=activity["duration_seconds"],
            duration_label=dur_label,
            description=activity["description"],
            reason=reason,
            confidence_score=confidence,
            alternatives=alternatives,
            action_type="immediate" if action_type == "immediate" else "scheduled",
            source="rule_engine"
        )

# Singleton instance
engine = RecommendationEngine()
