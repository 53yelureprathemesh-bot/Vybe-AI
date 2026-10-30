"""AI Wellness Assistant ('Talk to VYBE') Module.

Provides intelligent natural language conversations, intent detection,
database-grounded history retrieval, and optional Gemini LLM integration
with safe rule-based fallback.
"""
import os
import re
import json
import requests
from datetime import datetime
from typing import Dict, Any, List, Optional

from activity_library import get_activity_by_id, get_all_activities
from database import get_activity_history, get_user_preferences
from models import ChatRequest, ChatMessage

SYSTEM_PROMPT = """You are VYBE, a thoughtful, calm, and intelligent workplace wellness AI companion.
Your mission is to help desk workers, IT professionals, and software engineers maintain physical and mental rhythm.

Approved Activity Library (YOU MUST ONLY RECOMMEND FROM THESE):
1. 'eyecare' (20 seconds): Look 20ft away, relax eye muscles.
2. 'deskyoga' (2 minutes): Seated gentle shoulder rolls, neck release, wrist mobility.
3. 'mindreset' (1 minute): Unforced natural breathing, mindful calm.
4. 'walkbreak' (5 minutes): Comfortable hallway or outdoor stroll.
5. 'hydratemate' (1 minute): Water intake and posture check.
6. 'powernap' (10-15 minutes): Optional quiet recharge when time and workplace allow.

Guidelines:
- Never give medical advice, diagnostic claims, or rigid health prescriptions.
- Always be concise, supportive, and friendly.
- Suggest actionable breaks that fit the user's available time.
- Return response in JSON format with fields:
  "message": (string, friendly explanation and advice),
  "suggested_activity_id": (string or null, must be one of the 6 approved IDs),
  "suggested_actions": (list of objects with "label" and "action")
"""

class VybeAIAssistant:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY", "")

    def process_chat(self, request: ChatRequest) -> ChatMessage:
        """Process incoming chat query with LLM or rule-based fallback."""
        user_msg = request.message.strip()
        user_id = request.user_id

        # Check if user has disabled AI in settings
        prefs = get_user_preferences(user_id)
        if not prefs.get("enable_ai", True):
            return ChatMessage(
                role="assistant",
                content="AI features are currently disabled in your Settings. You can still use manual timers and quick actions from the Dashboard.",
                source="rule_engine"
            )

        # 1. Try LLM if API key is set
        if self.api_key:
            llm_result = self._call_gemini_api(user_msg, user_id)
            if llm_result:
                return llm_result

        # 2. Deterministic Rule-Based Fallback
        return self._rule_based_response(user_msg, user_id)

    def _call_gemini_api(self, user_msg: str, user_id: str) -> Optional[ChatMessage]:
        """Attempt to call Gemini API and parse structured response."""
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [
                    {"role": "user", "parts": [{"text": f"{SYSTEM_PROMPT}\n\nUser Question: {user_msg}"}]}
                ],
                "generationConfig": {
                    "temperature": 0.2,
                    "responseMimeType": "application/json"
                }
            }
            resp = requests.post(url, headers=headers, json=payload, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(text)
                
                act_id = parsed.get("suggested_activity_id")
                # Validate activity ID is in approved list
                if act_id and not get_activity_by_id(act_id):
                    act_id = None

                return ChatMessage(
                    role="assistant",
                    content=parsed.get("message", "I recommend taking a moment to reset."),
                    suggested_activity_id=act_id,
                    suggested_actions=parsed.get("suggested_actions", []),
                    source="llm"
                )
        except Exception:
            # Silently fall back to rule-based engine on any network or parsing error
            pass
        return None

    def _rule_based_response(self, text: str, user_id: str) -> ChatMessage:
        """Deterministic, grounded intent detection and response generation."""
        q = text.lower()
        now_str = datetime.utcnow().strftime("%Y-%m-%d")

        # Intent 1: Check completed activities / history today
        if any(w in q for w in ["what activities", "completed today", "history", "my breaks today", "did i complete"]):
            history = get_activity_history(user_id, limit=20)
            today_recs = [h for h in history if h["completed_at"].startswith(now_str)]
            
            if not today_recs:
                return ChatMessage(
                    role="assistant",
                    content="You haven't logged any completed wellness activities yet today. How about kicking off with a quick 20-second EyeCare break or 1-minute MindReset?",
                    suggested_activity_id="eyecare",
                    suggested_actions=[{"label": "Start EyeCare", "action": "start_eyecare"}],
                    source="rule_engine"
                )
            
            total_sec = sum(h["duration_seconds"] for h in today_recs)
            total_min = round(total_sec / 60.0, 1)
            act_names = ", ".join(f"{h['activity_name']} ({h['duration_seconds']}s)" for h in today_recs[-4:])
            
            return ChatMessage(
                role="assistant",
                content=f"Today you've completed {len(today_recs)} wellness sessions totaling approximately {total_min} minutes! Recent activities include: {act_names}. Keep up this balanced rhythm!",
                suggested_actions=[{"label": "View Journey Analytics", "action": "navigate_journey"}],
                source="rule_engine"
            )

        # Intent 2: Stressed / Anxious / Overwhelmed
        if any(w in q for w in ["stress", "anxious", "overwhelm", "frustrated", "pressure"]):
            return ChatMessage(
                role="assistant",
                content="Work tension can sneak up quickly. Let's do a 1-minute MindReset breathing pause together. No forced breath-holding—just calm, natural cadence to reset your nervous system.",
                suggested_activity_id="mindreset",
                suggested_actions=[{"label": "Start MindReset (1m)", "action": "start_mindreset"}],
                source="rule_engine"
            )

        # Intent 3: Very short availability (2 minutes or less)
        if any(w in q for w in ["two minutes", "2 minutes", "2 min", "quick break", "little time", "meeting in"]):
            return ChatMessage(
                role="assistant",
                content="With just 2 minutes available, DeskYoga is perfect for loosening stiff shoulders and wrists before your next meeting.",
                suggested_activity_id="deskyoga",
                suggested_actions=[
                    {"label": "Start DeskYoga (2m)", "action": "start_deskyoga"},
                    {"label": "Or 20s EyeCare", "action": "start_eyecare"}
                ],
                source="rule_engine"
            )

        # Intent 4: Desk exercises / Stretching / Stiff muscles
        if any(w in q for w in ["desk exercise", "stretch", "posture", "shoulder", "neck", "wrist", "back"]):
            return ChatMessage(
                role="assistant",
                content="DeskYoga provides gentle, ergonomic seated movements designed specifically for desk workers: shoulder rolls, neck releases, and wrist mobility.",
                suggested_activity_id="deskyoga",
                suggested_actions=[{"label": "Start DeskYoga (2m)", "action": "start_deskyoga"}],
                source="rule_engine"
            )

        # Intent 5: Working for hours / Continuous screen session
        if any(w in q for w in ["two hours", "2 hours", "long time", "screen", "eyes hurt", "staring at", "headache"]):
            return ChatMessage(
                role="assistant",
                content="After continuous focus, your ciliary eye muscles need a break. Try the 20-20-20 EyeCare pause: look 20 feet away for 20 seconds and let your gaze soften.",
                suggested_activity_id="eyecare",
                suggested_actions=[
                    {"label": "Start EyeCare (20s)", "action": "start_eyecare"},
                    {"label": "Grab Water (HydrateMate)", "action": "start_hydratemate"}
                ],
                source="rule_engine"
            )

        # Intent 6: Dislike walking / alternative requested
        if any(w in q for w in ["don't want to walk", "dont want to walk", "no walking", "another option", "different activity"]):
            return ChatMessage(
                role="assistant",
                content="No problem at all! Instead of a walk, DeskYoga (2m) or MindReset (1m) provide great seated resets without leaving your workstation.",
                suggested_activity_id="deskyoga",
                suggested_actions=[
                    {"label": "Try DeskYoga (2m)", "action": "start_deskyoga"},
                    {"label": "Try MindReset (1m)", "action": "start_mindreset"}
                ],
                source="rule_engine"
            )

        # Intent 7: Break planning / Schedule assistance
        if any(w in q for w in ["plan breaks", "schedule", "workday", "break planner", "rest of my day"]):
            return ChatMessage(
                role="assistant",
                content="The Smart Break Planner organizes micro-breaks and movement intervals around your core working hours and quiet lunch periods. Would you like to view your timeline?",
                suggested_actions=[{"label": "Open Break Planner", "action": "navigate_planner"}],
                source="rule_engine"
            )

        # Intent 8: Tired / Low energy / Power nap
        if any(w in q for w in ["tired", "exhausted", "sleepy", "low energy", "power nap", "nap"]):
            return ChatMessage(
                role="assistant",
                content="When energy dips, a quick 5-minute WalkBreak or a glass of water via HydrateMate can boost blood flow. If workplace policy and schedule allow, a 10-minute PowerNap is also available.",
                suggested_activity_id="walkbreak",
                suggested_actions=[
                    {"label": "Start WalkBreak (5m)", "action": "start_walkbreak"},
                    {"label": "HydrateMate (1m)", "action": "start_hydratemate"}
                ],
                source="rule_engine"
            )

        # Intent 9: Thirsty / Water
        if any(w in q for w in ["water", "thirsty", "hydrate", "drink"]):
            return ChatMessage(
                role="assistant",
                content="Hydration supports cognitive stamina and physical comfort. Take 60 seconds with HydrateMate to grab a fresh glass of water.",
                suggested_activity_id="hydratemate",
                suggested_actions=[{"label": "Start HydrateMate (1m)", "action": "start_hydratemate"}],
                source="rule_engine"
            )

        # Default fallback
        return ChatMessage(
            role="assistant",
            content="I'm here to support your workday rhythm. Whether you need a 20-second eye rest, a 2-minute seated stretch, or help planning breaks, just let me know what fits your schedule best right now.",
            suggested_activity_id="eyecare",
            suggested_actions=[
                {"label": "Quick EyeCare (20s)", "action": "start_eyecare"},
                {"label": "DeskYoga (2m)", "action": "start_deskyoga"}
            ],
            source="rule_engine"
        )

# Singleton assistant
assistant = VybeAIAssistant()
