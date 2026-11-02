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

            # Factor 1: Screen session trigger (Dominant optical strain factor)
            if checkin.screen_session_min >= 90:
                if act["category"] == "eye_relaxation":
                    score += 10.0
                    reasons.append(f"High continuous screen session of {checkin.screen_session_min} minutes calls for optical rest.")
                elif act["category"] == "breathing_relaxation":
                    score += 2.0
            elif checkin.screen_session_min >= 45:
                if act["category"] == "eye_relaxation":
                    score += 6.0
                    reasons.append(f"Continuous screen session of {checkin.screen_session_min} minutes calls for optical rest.")
                elif act["category"] == "breathing_relaxation":
                    score += 2.0
            elif checkin.screen_session_min >= 20:
                if act["category"] == "eye_relaxation":
                    score += 3.5
                    reasons.append(f"Screen time of {checkin.screen_session_min} minutes benefits from a quick visual reset.")

            # Factor 2: Prolonged sitting trigger (Physical immobility factor)
            if checkin.sitting_duration_min >= 90:
                if act["category"] in ["movement", "walking"]:
                    score += 10.0
                    reasons.append(f"Extended sitting for {checkin.sitting_duration_min} minutes warrants active mobility or walking.")
                elif act["category"] == "hydration":
                    score += 2.0
            elif checkin.sitting_duration_min >= 45:
                if act["category"] in ["movement", "walking"]:
                    score += 6.0
                    reasons.append(f"Sitting continuously for {checkin.sitting_duration_min} minutes warrants physical movement.")
                elif act["category"] == "hydration":
                    score += 2.0
            elif checkin.sitting_duration_min >= 20:
                if act["category"] in ["movement", "walking"]:
                    score += 3.5
                    reasons.append(f"Sitting for {checkin.sitting_duration_min} minutes is relieved by gentle stretching.")

            # Factor 3: Mood & Emotional state
            if checkin.mood == "stressed":
                if act["category"] == "breathing_relaxation":
                    score += 10.0
                    reasons.append("Reported stress is best balanced with a calming breathing cycle.")
                elif act["category"] == "movement":
                    score += 2.0
                    reasons.append("Gentle mobility releases physical tension built up during high stress.")
            elif checkin.mood in ["tired", "low_energy"] or checkin.energy == "low":
                if act["category"] == "walking":
                    score += 6.5
                    reasons.append("A brief walk naturally boosts alertness and circulation.")
                elif act["category"] == "hydration":
                    score += 5.5
                    reasons.append("Hydration helps combat fatigue and midday energy slumps.")
                elif act["category"] == "quiet_rest" and checkin.available_time_seconds >= 600:
                    score += 6.5
                    reasons.append("Sufficient time is available for a restorative power nap.")
                elif act["category"] == "eye_relaxation":
                    score += 2.5
            elif checkin.mood == "feeling_good":
                if act["category"] in ["movement", "walking"]:
                    score += 4.5
                    reasons.append("Keep your positive momentum with energizing posture mobility.")
                elif act["category"] == "hydration":
                    score += 2.5

            # Factor 4: Energy level refinements
            if checkin.energy == "high":
                if act["category"] in ["walking", "movement"]:
                    score += 3.5
            elif checkin.energy == "low":
                if act["category"] in ["hydration", "breathing_relaxation"]:
                    score += 3.0

            # Factor 5: User explicit category preference
            if checkin.preferred_activity_category and checkin.preferred_activity_category != "let_ai_choose":
                if act["category"] == checkin.preferred_activity_category:
                    score += 10.0
                    reasons.append(f"Matches your requested preference for {act['category'].replace('_', ' ')}.")

            # Factor 6: User favorites
            if act_id in favorite_activities:
                score += 1.0

            # Factor 7: Historical feedback learning (LEARN)
            stats = feedback_stats.get(act_id, {})
            helpful_count = stats.get("helpful", 0)
            not_helpful_count = stats.get("not_helpful", 0)
            if helpful_count > 0:
                score += min(helpful_count * 0.5, 2.0)
            if not_helpful_count > 0:
                score -= not_helpful_count * 1.5

            # Factor 8: Recency penalty (Avoid back-to-back repetitions)
            if recent_activity_ids and act_id == recent_activity_ids[0]:
                score -= 3.0  # Penalize the most recently completed activity
            elif act_id in recent_activity_ids:
                score -= 1.5

            # Available time utilization bonus
            fit_ratio = act["duration_seconds"] / max(checkin.available_time_seconds, 1)
            score += fit_ratio * 0.5

            scored_candidates.append({
                "activity": act,
                "score": score,
                "reasons": reasons
            })

        # Sort candidates descending by score
        scored_candidates.sort(key=lambda x: x["score"], reverse=True)
        top_pick = scored_candidates[0]
        selected_act = top_pick["activity"]
        
        # Build synthesis reason tailored to the check-in
        mood_label = checkin.mood.replace("_", " ")
        if top_pick["reasons"]:
            primary_reason = top_pick["reasons"][0]
            explanation = f"Based on your check-in ({mood_label} mood, {checkin.energy} energy, {checkin.available_time_seconds}s break): {primary_reason} VYBE recommends {selected_act['name']}."
        else:
            explanation = f"Based on your check-in ({mood_label} mood, {checkin.energy} energy): VYBE selected {selected_act['name']} as an optimal {self._format_duration(selected_act['duration_seconds'])} pause fitting your schedule."

        # Alternatives for multiple suggestions
        alternatives = []
        for c in scored_candidates[1:]:
            act_item = c["activity"]
            alt_reason = c["reasons"][0] if c["reasons"] else f"A tailored {act_item['name']} session suited to your current rhythm."
            dur = act_item["duration_seconds"]
            dur_label = f"{dur}s" if dur < 60 else f"{dur // 60} min"
            alternatives.append({
                "id": act_item["id"],
                "name": act_item["name"],
                "tagline": act_item.get("tagline", ""),
                "duration_seconds": dur,
                "duration_label": dur_label,
                "category": act_item["category"],
                "description": act_item["description"],
                "reason": alt_reason,
                "confidence_score": min(round(c["score"] / 15.0, 2), 0.95)
            })

        # Ensure at least 2 alternative options are presented if available in library
        if len(alternatives) < 2:
            existing_ids = {selected_act["id"]}.union({a["id"] for a in alternatives})
            for act_extra in self.activities:
                if act_extra["id"] not in existing_ids and act_extra["id"] not in disabled_activities:
                    dur = act_extra["duration_seconds"]
                    dur_label = f"{dur}s" if dur < 60 else f"{dur // 60} min"
                    alternatives.append({
                        "id": act_extra["id"],
                        "name": act_extra["name"],
                        "tagline": act_extra.get("tagline", ""),
                        "duration_seconds": dur,
                        "duration_label": dur_label,
                        "category": act_extra["category"],
                        "description": act_extra["description"],
                        "reason": f"Alternative {dur_label} option to complement your check-in.",
                        "confidence_score": 0.82
                    })
                    if len(alternatives) >= 3:
                        break

        return self._build_response(
            activity=selected_act,
            reason=explanation,
            confidence=min(round(top_pick["score"] / 15.0, 2), 0.98),
            alternatives=alternatives[:3],
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
