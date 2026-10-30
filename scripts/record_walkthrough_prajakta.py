import os
import json
import glob
import subprocess
from playwright.sync_api import sync_playwright

def record_prajakta_demo():
    print("Starting automated full walkthrough recording for Prajakta Yelure...")
    record_dir = os.path.abspath("demo_recording_prajakta")
    os.makedirs(record_dir, exist_ok=True)

    # Clean old recordings
    for f in glob.glob(os.path.join(record_dir, "*.webm")):
        try:
            os.remove(f)
        except:
            pass

    prajakta_user = {
        "user_id": "user_1793320275_2e63fb",
        "name": "Prajakta yelure",
        "email": "53yelureprathemesh@gmail.com",
        "dob": "2001-05-05",
        "age": 25,
        "role": "Software Engineer",
        "sound_preset": "crystal_bell",
        "custom_sound_url": None,
        "sound_volume": 85,
        "created_at": "2026-10-30T06:01:15.835747"
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
            headless=True
        )
        context = browser.new_context(
            viewport={"width": 1280, "height": 800},
            record_video_dir=record_dir,
            record_video_size={"width": 1280, "height": 800}
        )
        page = context.new_page()

        # Seed Prajakta's active session in localStorage
        init_js = f"""
            localStorage.setItem('vybe_user', JSON.stringify({json.dumps(prajakta_user)}));
            localStorage.setItem('vybe_user_session', JSON.stringify({json.dumps(prajakta_user)}));
        """
        page.add_init_script(init_js)

        # ----------------------------------------------------
        # Scene 1: Landing Page Tour
        # ----------------------------------------------------
        print("Scene 1: Landing Page...")
        page.goto("http://127.0.0.1:8000")
        page.wait_for_timeout(2500)

        for pos in [450, 1050, 1700, 2300, 0]:
            page.evaluate(f"window.scrollTo({{ top: {pos}, behavior: 'smooth' }})")
            page.wait_for_timeout(800)

        # ----------------------------------------------------
        # Scene 2: Dashboard with Prajakta Yelure Profile
        # ----------------------------------------------------
        print("Scene 2: Entering Dashboard (Logged in as Prajakta Yelure)...")
        try:
            page.click("text=Start Your Journey", timeout=3000)
        except:
            page.click("text=Home Dashboard", timeout=3000)
        page.wait_for_timeout(2500)

        # Showcase Prajakta Yelure Profile Menu in Navbar
        print("Scene 2b: Showcase Prajakta Yelure Profile in Navbar...")
        try:
            page.click("header button:has(.lucide-chevron-down)", timeout=3000)
            page.wait_for_timeout(2500) # Prominently show Prajakta Yelure, Age 25, Software Engineer
            page.keyboard.press("Escape")
            page.wait_for_timeout(1000)
        except Exception as e:
            print("Profile dropdown note:", e)

        # ----------------------------------------------------
        # Scene 3: Live Automatic Screen Focus Tracker
        # ----------------------------------------------------
        print("Scene 3: Live Automatic Screen Focus Tracker...")
        page.evaluate("window.scrollTo({ top: 350, behavior: 'smooth' })")
        page.wait_for_timeout(2000)

        # Click Choose Another activity to show AI recalculation
        try:
            page.click("text=Choose Another", timeout=3000)
            page.wait_for_timeout(2500)
        except Exception as e:
            print("Choose another note:", e)

        # ----------------------------------------------------
        # Scene 4: HOW NOTIFICATIONS HIT & NOTIFY THE USER
        # ----------------------------------------------------
        print("Scene 4: Triggering Live Break Notification...")
        try:
            # Click Remind Me Later on Dashboard card
            page.click("text=Remind Me Later", timeout=3000)
            print("Remind Me Later clicked! Waiting for Notification Toast to HIT...")
            # Wait for the reminder to trigger (6 seconds)
            page.wait_for_timeout(6500)

            # Floating notification toast appears with audio pulse animation
            print("NOTIFICATION HIT! Floating reminder toast is active on screen!")
            page.wait_for_timeout(4500) # Highlight how the notification alerts the user!

            # Click 'Start Now' directly inside the notification toast
            print("Clicking 'Start Now' on the notification toast...")
            page.click("div.fixed button:has-text('Start Now')", timeout=3000)
            page.wait_for_timeout(2500)
        except Exception as e:
            print("Notification toast note:", e)

        # ----------------------------------------------------
        # Scene 5: Guided Interactive Activity Player
        # ----------------------------------------------------
        print("Scene 5: Guided Interactive Activity Player...")
        try:
            # Watch breathing circle and countdown timer
            page.wait_for_timeout(4000)
            # Click Complete Activity
            page.click("text=Complete Activity, button:has-text('Complete')", timeout=4000)
            page.wait_for_timeout(2500) # Watch celebration confetti
            # Rate 'Helpful'
            try:
                page.click("button:has-text('Helpful')", timeout=2000)
                page.wait_for_timeout(1000)
            except:
                pass
            # Click 'Return to Dashboard' to cleanly close ActivityPlayer
            page.click("button:has-text('Return to Dashboard')", timeout=3000)
            page.wait_for_timeout(1500)
        except Exception as e:
            print("Player note:", e)

        # Ensure modal fully closed
        try:
            page.evaluate("document.querySelectorAll('.fixed.inset-0').forEach(e => e.remove())")
        except:
            pass
        page.wait_for_timeout(1000)

        # ----------------------------------------------------
        # Scene 6: Notification Sound Studio
        # ----------------------------------------------------
        print("Scene 6: Notification Sound Studio...")
        try:
            # Click sound button in navbar
            page.click("header button:has(.lucide-bell)", timeout=3000)
            page.wait_for_timeout(2000)
            # Select Soft Crystal Bell
            page.click("text=Soft Crystal Bell", timeout=2500)
            page.wait_for_timeout(1500)
            # Select Calming Harp
            page.click("text=Calming Harp", timeout=2500)
            page.wait_for_timeout(1500)
            # Click Save Sound Preference
            page.click("button:has-text('Save Sound Preference')", timeout=2500)
            page.wait_for_timeout(1500)
        except Exception as e:
            print("Sound studio note:", e)

        # Ensure modal fully closed
        try:
            page.evaluate("document.querySelectorAll('.fixed.inset-0').forEach(e => e.remove())")
        except:
            pass
        page.wait_for_timeout(1000)

        # ----------------------------------------------------
        # Scene 7: Wellness Check-In & AI Recommendation
        # ----------------------------------------------------
        print("Scene 7: Wellness Check-In...")
        page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
        try:
            page.click("text=Wellness Check-In", timeout=4000)
            page.wait_for_timeout(2000)
            page.evaluate("window.scrollTo({ top: 350, behavior: 'smooth' })")
            page.wait_for_timeout(1500)
            page.click("text=Generate My AI Wellness Recommendation", timeout=4000)
            page.wait_for_timeout(3000)
        except Exception as e:
            print("Check-in note:", e)

        # ----------------------------------------------------
        # Scene 8: 'Talk to VYBE' Conversational AI Assistant
        # ----------------------------------------------------
        print("Scene 8: 'Talk to VYBE' AI Assistant...")
        page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
        try:
            page.click("text=AI Wellness Assistant", timeout=4000)
            page.wait_for_timeout(2500)
            # Click prompt chip for developers
            try:
                page.click("button:has-text('I have been working for two hours')", timeout=3000)
            except:
                page.fill("input[placeholder*='Ask VYBE']", "My neck and shoulders are tense from long coding hours")
                page.keyboard.press("Enter")
            page.wait_for_timeout(4000)
        except Exception as e:
            print("Assistant note:", e)

        # ----------------------------------------------------
        # Scene 9: Workday Smart Break Planner
        # ----------------------------------------------------
        print("Scene 9: Workday Smart Break Planner...")
        try:
            page.click("text=Smart Break Planner", timeout=4000)
            page.wait_for_timeout(2000)
            page.evaluate("window.scrollTo({ top: 400, behavior: 'smooth' })")
            page.wait_for_timeout(2500)
        except Exception as e:
            print("Planner note:", e)

        # ----------------------------------------------------
        # Scene 10: My Wellness Journey Analytics
        # ----------------------------------------------------
        print("Scene 10: My Wellness Journey Analytics...")
        page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
        try:
            page.click("text=My Wellness Journey", timeout=4000)
            page.wait_for_timeout(2500)
            page.evaluate("window.scrollTo({ top: 450, behavior: 'smooth' })")
            page.wait_for_timeout(2500)
        except Exception as e:
            print("Journey note:", e)

        # ----------------------------------------------------
        # Scene 11: Relaxation Zone Catalog
        # ----------------------------------------------------
        print("Scene 11: Relaxation Zone...")
        page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
        try:
            page.click("text=Relaxation Zone", timeout=4000)
            page.wait_for_timeout(2000)
            page.evaluate("window.scrollTo({ top: 400, behavior: 'smooth' })")
            page.wait_for_timeout(2500)
        except Exception as e:
            print("Relaxation note:", e)

        # ----------------------------------------------------
        # Scene 12: Preferences & Settings
        # ----------------------------------------------------
        print("Scene 12: Preferences & Settings...")
        page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
        try:
            page.click("text=Preferences & Settings", timeout=4000)
            page.wait_for_timeout(2000)
            page.evaluate("window.scrollTo({ top: 500, behavior: 'smooth' })")
            page.wait_for_timeout(2500)
        except Exception as e:
            print("Settings note:", e)

        print("Finalizing video recording...")
        page.wait_for_timeout(2000)
        context.close()
        browser.close()

    # Find the recorded video
    video_files = glob.glob(os.path.join(record_dir, "*.webm"))
    if not video_files:
        print("No webm video found in demo_recording_prajakta/")
        return

    latest_video = max(video_files, key=os.path.getctime)
    mp4_output = os.path.abspath("vybe_ai_walkthrough_prajakta.mp4")
    print(f"Encoding {latest_video} to {mp4_output} with FFmpeg...")

    ffmpeg_cmd = [
        "ffmpeg",
        "-y",
        "-i", latest_video,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-r", "30",
        "-movflags", "+faststart",
        mp4_output
    ]

    res = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
    if res.returncode == 0:
        print(f"SUCCESS: High-Definition Walkthrough Video saved to: {mp4_output}")
        file_size_mb = os.path.getsize(mp4_output) / (1024 * 1024)
        print(f"Video File Size: {file_size_mb:.2f} MB")
    else:
        print("FFmpeg error:", res.stderr)

if __name__ == "__main__":
    record_prajakta_demo()
