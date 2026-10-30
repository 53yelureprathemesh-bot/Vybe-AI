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
        """Deterministic, grounded conversation analysis and intelligent recommendation generation."""
        q = text.lower()
        now_str = datetime.utcnow().strftime("%Y-%m-%d")

        # 1. Check completed activities / history today
        if any(w in q for w in ["what activities", "completed today", "history", "my breaks today", "did i complete", "my stats"]):
            history = get_activity_history(user_id, limit=20)
            today_recs = [h for h in history if h["completed_at"].startswith(now_str)]
            
            if not today_recs:
                return ChatMessage(
                    role="assistant",
                    content="You haven't logged any completed wellness activities yet today. How about kicking off with a quick 20-second EyeCare break or 1-minute MindReset to build your daily streak?",
                    suggested_activity_id="eyecare",
                    suggested_actions=[{"label": "Start EyeCare (20s)", "action": "start_eyecare"}],
                    source="rule_engine"
                )
            
            total_sec = sum(h["duration_seconds"] for h in today_recs)
            total_min = round(total_sec / 60.0, 1)
            act_names = ", ".join(f"{h['activity_name']} ({h['duration_seconds']}s)" for h in today_recs[-4:])
            
            return ChatMessage(
                role="assistant",
                content=f"📊 Great progress today! You've completed {len(today_recs)} wellness sessions totaling approximately {total_min} minutes. Recent activities include: {act_names}. Keep up this balanced rhythm!",
                suggested_actions=[{"label": "View Journey Analytics", "action": "navigate_journey"}],
                source="rule_engine"
            )

        # 2. Greetings & Casual Openers
        if re.search(r"^(hi|hello|hey|good morning|good afternoon|good evening|who are you|how are you|help)\b", q.strip()):
            return ChatMessage(
                role="assistant",
                content="Hello! 👋 I'm VYBE, your workplace wellness companion.\n\nI actively read your messages, analyze your physical and cognitive fatigue, and suggest what's best for your workday.\n\nHow is your body and mind feeling right now?\n• \"My shoulders and neck are stiff\"\n• \"My eyes feel strained from staring at code\"\n• \"I'm feeling stressed by a deadline\"\n• \"I only have 2 minutes before my next meeting\"",
                suggested_actions=[
                  {"label": "20s EyeCare", "action": "start_eyecare"},
                  {"label": "2m Desk Yoga", "action": "start_deskyoga"},
                  {"label": "1m Mind Reset", "action": "start_mindreset"}
                ],
                source="rule_engine"
            )

        # 3. Eye Strain / Screen Fatigue
        if any(w in q for w in ["eye", "eyes", "screen", "blur", "vision", "staring", "headache", "monitor", "glare"]):
            return ChatMessage(
                role="assistant",
                content="🔍 **Conversation Analysis: Optical Fatigue & Screen Strain**\n\nWhen concentrating on code or high-contrast screens, your natural blink rate drops from 15 times/minute to under 5. This causes tear film evaporation, dry eyes, and ciliary lens muscle fatigue.\n\n💡 **Best Recommendation**:\nThe **20-20-20 EyeCare Protocol** (20 seconds). Shift your gaze to an object at least 20 feet away for 20 seconds so your optical muscles can fully decompress.",
                suggested_activity_id="eyecare",
                suggested_actions=[
                    {"label": "Start EyeCare (20s)", "action": "start_eyecare"},
                    {"label": "Grab Water (HydrateMate)", "action": "start_hydratemate"}
                ],
                source="rule_engine"
            )

        # 4. Neck, Shoulder, Upper Body Stiffness / Desk Exercises
        if any(w in q for w in ["neck", "shoulder", "stretch", "posture", "hunch", "slouch", "stiff", "desk exercise", "back"]):
            return ChatMessage(
                role="assistant",
                content="🔍 **Conversation Analysis: Upper Body & Cervical Strain**\n\nLeaning forward toward your monitor multiplies gravitational strain on your cervical spine up to 40 lbs, causing trapezius and shoulder knots.\n\n💡 **Best Recommendation**:\n**Seated Desk Yoga (2 minutes)**. A gentle series of shoulder rolls, neck releases, and seated spinal twists you can do without leaving your chair.",
                suggested_activity_id="deskyoga",
                suggested_actions=[{"label": "Start Desk Yoga (2m)", "action": "start_deskyoga"}],
                source="rule_engine"
            )

        # 5. Wrist, Hand & Typing Pain
        if any(w in q for w in ["wrist", "hand", "finger", "typing", "mouse", "carpal", "rsi"]):
            return ChatMessage(
                role="assistant",
                content="🔍 **Conversation Analysis: Repetitive Typing / Ergonomic Strain**\n\nContinuous keystrokes and trackpad friction cause micro-friction in the flexor tendons of the carpal tunnel.\n\n💡 **Best Recommendation**:\n**Desk Yoga Wrist Mobility (2 minutes)** to restore synovial fluid circulation and relieve tendon stiffness.",
                suggested_activity_id="deskyoga",
                suggested_actions=[{"label": "Start Desk Yoga (2m)", "action": "start_deskyoga"}],
                source="rule_engine"
            )

        # 6. Stress / Anxiety / Overwhelmed
        if any(w in q for w in ["stress", "anxious", "overwhelm", "frustrated", "pressure", "deadline", "panic"]):
            return ChatMessage(
                role="assistant",
                content="🔍 **Conversation Analysis: Sympathetic Nervous System Overdrive**\n\nWork pressure and difficult bugs activate shallow breathing and elevated heart rate.\n\n💡 **Best Recommendation**:\n**Mind Reset (1 minute)** with guided 4-7-8 breathing. This stimulates the vagus nerve, sending calming signals to your prefrontal cortex in 60 seconds.",
                suggested_activity_id="mindreset",
                suggested_actions=[{"label": "Start Mind Reset (1m)", "action": "start_mindreset"}],
                source="rule_engine"
            )

        # 7. Low Energy / Sleepy / Fatigue
        if any(w in q for w in ["tired", "exhausted", "sleepy", "low energy", "power nap", "nap", "fatigue"]):
            return ChatMessage(
                role="assistant",
                content="🔍 **Conversation Analysis: Energy Dip & Static Circulation**\n\nLong sitting spells decrease venous blood flow to the brain, producing afternoon drowsiness.\n\n💡 **Best Recommendation**:\nA brisk **5-Minute Walk Break** to stimulate lower-limb circulation, or a quick hydration checkpoint with **HydrateMate**.",
                suggested_activity_id="walkbreak",
                suggested_actions=[
                    {"label": "Start WalkBreak (5m)", "action": "start_walkbreak"},
                    {"label": "HydrateMate (1m)", "action": "start_hydratemate"}
                ],
                source="rule_engine"
            )

        # 8. Very short availability (2 minutes or less)
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

        # 9. Dislike walking / alternative requested
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

        # 10. Break planning / Schedule assistance
        if any(w in q for w in ["plan breaks", "schedule", "workday", "break planner", "rest of my day"]):
            return ChatMessage(
                role="assistant",
                content="The Smart Break Planner organizes micro-breaks and movement intervals around your core working hours and quiet lunch periods. Would you like to view your timeline?",
                suggested_actions=[{"label": "Open Break Planner", "action": "navigate_planner"}],
                source="rule_engine"
            )

        # 11. Thirsty / Water
        if any(w in q for w in ["water", "thirsty", "hydrate", "drink"]):
            return ChatMessage(
                role="assistant",
                content="🔍 **Conversation Analysis: Fluid & Electrolyte Balance**\n\nHydration supports cognitive stamina and physical comfort. Take 60 seconds with HydrateMate to grab a fresh glass of water.",
                suggested_activity_id="hydratemate",
                suggested_actions=[{"label": "Start HydrateMate (1m)", "action": "start_hydratemate"}],
                source="rule_engine"
            )

        # Default fallback
        return ChatMessage(
            role="assistant",
            content=f"🔍 **Conversation Analysis & Recommendation**\n\nI heard you say: \"{text}\".\n\nAs a desk worker, keeping your rhythm requires balancing optical recovery, seated posture release, and mindful breathing. Which reset would feel best for you right now?",
            suggested_activity_id="eyecare",
            suggested_actions=[
                {"label": "Quick EyeCare (20s)", "action": "start_eyecare"},
                {"label": "DeskYoga (2m)", "action": "start_deskyoga"},
                {"label": "MindReset (1m)", "action": "start_mindreset"}
            ],
            source="rule_engine"
        )

# Singleton assistant
assistant = VybeAIAssistant()
