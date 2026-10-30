"""Windows Native Background Desktop Monitor for VYBE AI.

Runs quietly in the background of your Windows PC, laptop, or desktop.
Tracks system-wide user presence across all desktop applications (VS Code, Word,
Excel, browser, etc.) using the Windows OS GetLastInputInfo API.

Periodically synchronizes screen telemetry with the local VYBE AI backend and
automatically displays native Windows Toast notifications suggesting:
  - Desk Stretches & Exercises (DeskYoga)
  - Hydration Breaks (Drink water)
  - 20-20-20 Eye Relaxation
  - 1-Minute Mindful Breathing

Can run silently in background via pythonw without showing a console window.
"""

import sys
import os
import time
import json
import urllib.request
import subprocess
import ctypes
from datetime import datetime

# Windows API structures for global PC input tracking
class LASTINPUTINFO(ctypes.Structure):
    _fields_ = [
        ("cbSize", ctypes.c_uint),
        ("dwTime", ctypes.c_uint)
    ]

def get_idle_seconds() -> float:
    """Returns number of seconds since the last physical keyboard or mouse input on this PC."""
    try:
        lii = LASTINPUTINFO()
        lii.cbSize = ctypes.sizeof(LASTINPUTINFO)
        if ctypes.windll.user32.GetLastInputInfo(ctypes.byref(lii)):
            millis = ctypes.windll.kernel32.GetTickCount() - lii.dwTime
            return max(0.0, millis / 1000.0)
    except Exception as e:
        pass
    return 0.0

def show_windows_toast(title: str, message: str, activity_id: str = "deskyoga"):
    """Displays a native Windows Toast notification via PowerShell with sound."""
    app_url = f"http://localhost:8000/?action=start&activity={activity_id}"
    
    # PowerShell script to show native Windows toast notification
    ps_script = f"""
    [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null
    [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] > $null

    $template = @"
    <toast launch="{app_url}">
        <visual>
            <binding template="ToastGeneric">
                <text>{title}</text>
                <text>{message}</text>
                <text placement="attribution">VYBE AI Workplace Wellness</text>
            </binding>
        </visual>
        <audio src="ms-winsoundevent:Notification.Default" />
        <actions>
            <action content="Start Break" arguments="{app_url}" activationType="protocol"/>
            <action content="Dismiss" arguments="dismiss" activationType="system"/>
        </actions>
    </toast>
"@

    $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
    $xml.LoadXml($template)
    $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
    $toast.Tag = "vybe-ai"
    $toast.Group = "wellness"
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("VYBE AI").Show($toast)
    """

    try:
        subprocess.Popen(
            ["powershell", "-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command", ps_script],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0
        )
    except Exception as e:
        # Fallback to msg command or basic popup
        try:
            subprocess.Popen(["msg", "*", f"{title}: {message}"])
        except:
            pass

ROTATING_SUGGESTIONS = [
    {
        "activity_id": "deskyoga",
        "title": "VYBE AI — 🧘 Time for a Desk Stretch!",
        "message": "You've been focused at your PC! Do a quick 2-minute seated neck & shoulder stretch."
    },
    {
        "activity_id": "hydratemate",
        "title": "VYBE AI — 💧 Time to Hydrate!",
        "message": "Drink a glass of water now to replenish energy and counter fatigue."
    },
    {
        "activity_id": "eyecare",
        "title": "VYBE AI — 👁️ 20-20-20 Eye Break!",
        "message": "Rest your vision: look at something 20 feet away for 20 seconds."
    },
    {
        "activity_id": "mindreset",
        "title": "VYBE AI — 🌬️ 1-Minute Mind Reset",
        "message": "Take 4 calm, slow breaths to reset focus and lower stress."
    }
]

def run_agent():
    pid_file = os.path.join(os.path.dirname(__file__), "desktop_agent.pid")
    with open(pid_file, "w") as f:
        f.write(str(os.getpid()))

    print(f"VYBE AI Desktop Background Agent running (PID: {os.getpid()})...")

    continuous_active_seconds = 0
    total_active_today_seconds = 0
    idle_accumulated_seconds = 0
    suggestion_idx = 0
    session_start = datetime.now().isoformat()
    last_sync_time = time.time()
    reminder_threshold_seconds = 30 * 60  # Default 30 minutes
    has_alerted_this_session = False

    while True:
        try:
            time.sleep(1)
            idle_sec = get_idle_seconds()

            if idle_sec < 60:
                # User is active anywhere on PC
                continuous_active_seconds += 1
                total_active_today_seconds += 1
            else:
                # User is away from PC
                idle_accumulated_seconds += 1
                # If away for > 5 minutes, reset continuous screen focus
                if idle_sec > 300 and continuous_active_seconds > 0:
                    continuous_active_seconds = 0
                    has_alerted_this_session = False

            # Check if continuous focus exceeded notification threshold
            if continuous_active_seconds >= reminder_threshold_seconds and not has_alerted_this_session:
                has_alerted_this_session = True
                sug = ROTATING_SUGGESTIONS[suggestion_idx % len(ROTATING_SUGGESTIONS)]
                suggestion_idx += 1
                show_windows_toast(sug["title"], sug["message"], sug["activity_id"])
                print(f"Triggered Windows desktop notification: {sug['title']}")

            # Sync with local backend every 3 minutes
            now_ts = time.time()
            if now_ts - last_sync_time >= 180:
                last_sync_time = now_ts
                active_min = round(continuous_active_seconds / 60.0, 1)
                idle_min = round(idle_accumulated_seconds / 60.0, 1)
                
                payload = json.dumps({
                    "user_id": "default_user",
                    "started_at": session_start,
                    "ended_at": datetime.now().isoformat(),
                    "active_minutes": active_min,
                    "idle_minutes": idle_min,
                    "breaks_taken": 1 if has_alerted_this_session else 0
                }).encode("utf-8")

                req = urllib.request.Request(
                    "http://127.0.0.1:8000/api/tracking/session",
                    data=payload,
                    headers={"Content-Type": "application/json"}
                )
                try:
                    urllib.request.urlopen(req, timeout=3)
                except Exception:
                    pass  # Backend might be restarting

        except KeyboardInterrupt:
            break
        except Exception as e:
            time.sleep(2)

    if os.path.exists(pid_file):
        try:
            os.remove(pid_file)
        except:
            pass

if __name__ == "__main__":
    run_agent()
