"""Approved activity library for VYBE AI.

Every activity includes strict durations, safety-conscious instructions,
category classifications, and step-by-step guidance for the Activity Player.
"""
from typing import Dict, List, Any

ACTIVITIES: Dict[str, Dict[str, Any]] = {
    "eyecare": {
        "id": "eyecare",
        "name": "EyeCare",
        "tagline": "20-20-20 Visual Rest",
        "category": "eye_relaxation",
        "duration_seconds": 20,
        "intensity": "Gentle",
        "description": "Relieve digital eye strain by looking 20 feet away to relax ciliary eye muscles.",
        "benefits": ["Decreases digital eye strain", "Promotes natural blinking", "Softens optical focus"],
        "icon": "Eye",
        "color": "teal",
        "instructions": [
            "Look away from your screen.",
            "Focus softly on an object roughly 20 feet in the distance.",
            "Blink naturally and release any tension around your forehead.",
            "Take one gentle breath as your eyes relax."
        ],
        "steps": [
            {"seconds": 5, "text": "Turn your gaze away from all monitors and screens."},
            {"seconds": 5, "text": "Locate an object across the room or outside a window."},
            {"seconds": 5, "text": "Blink slowly 3 times to lubricate your eyes naturally."},
            {"seconds": 5, "text": "Keep your gaze soft and let the eye muscles fully relax."}
        ]
    },
    "deskyoga": {
        "id": "deskyoga",
        "name": "DeskYoga",
        "tagline": "Gentle Posture & Mobility",
        "category": "movement",
        "duration_seconds": 120,
        "intensity": "Mild",
        "description": "Comfortable seated mobility exercises to relieve neck, shoulder, and wrist stiffness.",
        "benefits": ["Releases upper back tension", "Improves circulation", "Prevents mouse-wrist fatigue"],
        "icon": "Activity",
        "color": "blue",
        "instructions": [
            "Sit tall with feet flat on the floor.",
            "Relax your shoulders down and back.",
            "Perform gentle, slow shoulder rolls.",
            "Gently extend and stretch your wrists.",
            "Move only within your comfortable range; stop if you feel any discomfort."
        ],
        "steps": [
            {"seconds": 30, "text": "Shoulder Rolls: Roll your shoulders backward in smooth circles 5 times, then forward 5 times."},
            {"seconds": 30, "text": "Neck Releases: Gently tilt your right ear toward your right shoulder for 15s, then switch sides."},
            {"seconds": 30, "text": "Wrist & Finger Stretches: Extend your arms forward, gently flexing fingers up and down."},
            {"seconds": 30, "text": "Seated Torso Lengthening: Interlace fingers overhead, take a gentle breath, and release downward."}
        ]
    },
    "mindreset": {
        "id": "mindreset",
        "name": "MindReset",
        "tagline": "1-Minute Breathing & Calm",
        "category": "breathing_relaxation",
        "duration_seconds": 60,
        "intensity": "Calming",
        "description": "A natural, steady breathing pause to lower cognitive overload and center your attention.",
        "benefits": ["Clears cognitive fatigue", "Balances nervous system", "Restores calm focus"],
        "icon": "Heart",
        "color": "emerald",
        "instructions": [
            "Sit comfortably with your hands resting on your lap.",
            "Relax your jaw, neck, and shoulders.",
            "Breathe slowly and naturally at your own comfortable pace.",
            "Stop or adjust if the exercise makes you feel uncomfortable in any way."
        ],
        "steps": [
            {"seconds": 15, "text": "Close your eyes or lower your gaze. Let your jaw un-clench."},
            {"seconds": 15, "text": "Inhale smoothly through your nose for 4 seconds without forcing."},
            {"seconds": 15, "text": "Exhale softly through your mouth or nose for 4-5 seconds."},
            {"seconds": 15, "text": "Notice your shoulders dropping. Take two more calm, unhurried breaths."}
        ]
    },
    "walkbreak": {
        "id": "walkbreak",
        "name": "WalkBreak",
        "tagline": "5-Minute Movement Stroll",
        "category": "walking",
        "duration_seconds": 300,
        "intensity": "Moderate",
        "description": "Step away from your workstation to stimulate blood flow and give your brain a physical change of scenery.",
        "benefits": ["Boosts leg circulation", "Resets mental alertness", "Combats prolonged sitting"],
        "icon": "Footprints",
        "color": "amber",
        "instructions": [
            "Step away from your desk safely.",
            "Take a comfortable walk around your floor, hallway, or outdoor area.",
            "Move at your own natural pace.",
            "Return to work whenever you are ready."
        ],
        "steps": [
            {"seconds": 60, "text": "Stand up, gently stretch your legs, and step away from your workspace."},
            {"seconds": 120, "text": "Walk at an easy, comfortable pace. Look around and let your mind wander."},
            {"seconds": 60, "text": "Notice your posture; keep your shoulders relaxed and stride naturally."},
            {"seconds": 60, "text": "Head back to your desk, drink a sip of water, and settle in refreshed."}
        ]
    },
    "hydratemate": {
        "id": "hydratemate",
        "name": "HydrateMate",
        "tagline": "Hydration & Posture Pause",
        "category": "hydration",
        "duration_seconds": 60,
        "intensity": "Gentle",
        "description": "A quick pause to check in with your body's hydration needs and reset your posture.",
        "benefits": ["Supports energy levels", "Prevents dehydration headaches", "Encourages brief standing"],
        "icon": "Droplets",
        "color": "cyan",
        "instructions": [
            "Take a brief moment away from your screen.",
            "Refill your glass or water bottle.",
            "Drink water if you are thirsty and it is appropriate for you.",
            "Enjoy a moment of stillness."
        ],
        "steps": [
            {"seconds": 15, "text": "Stand up and check your water bottle or cup."},
            {"seconds": 25, "text": "Take a refreshing sip of water at your own pace if you feel thirsty."},
            {"seconds": 20, "text": "Take one deep breath, roll your shoulders back, and resume your rhythm."}
        ]
    },
    "powernap": {
        "id": "powernap",
        "name": "PowerNap",
        "tagline": "Optional Rest & Recharge",
        "category": "quiet_rest",
        "duration_seconds": 600,  # 10 minutes default
        "intensity": "Restorative",
        "description": "An optional 10-15 minute quiet rest to recharge cognitive stamina when time and workplace permit.",
        "benefits": ["Restores mental alertness", "Decreases afternoon slump", "Non-stimulant cognitive recharge"],
        "icon": "Moon",
        "color": "indigo",
        "instructions": [
            "Only choose if you have sufficient time and your workplace policy permits.",
            "Dim room lights or close your eyes in a comfortable chair.",
            "Set an alarm or let the VYBE timer wake you gently.",
            "Present as optional rest, not medical therapy."
        ],
        "steps": [
            {"seconds": 60, "text": "Find a quiet, supportive seating or reclining position."},
            {"seconds": 480, "text": "Close your eyes, relax your muscles, and allow your thoughts to drift away naturally."},
            {"seconds": 60, "text": "Gently wake up, stretch your arms, blink into the light, and reorient."}
        ]
    }
}

def get_all_activities() -> List[Dict[str, Any]]:
    """Return all approved activities as a list."""
    return list(ACTIVITIES.values())

def get_activity_by_id(activity_id: str) -> Dict[str, Any] | None:
    """Retrieve an activity by id."""
    return ACTIVITIES.get(activity_id.lower().strip())
