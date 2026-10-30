import os
import glob
import subprocess
from playwright.sync_api import sync_playwright

def record_demo():
    print("Starting automated walkthrough recording...")
    record_dir = os.path.abspath("demo_recording")
    os.makedirs(record_dir, exist_ok=True)

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

        # Scene 1: Landing Page
        print("Scene 1: Loading Landing Page...")
        page.goto("http://127.0.0.1:8000")
        page.wait_for_timeout(2500)

        # Smooth scroll through Landing Page
        for pos in [450, 950, 1600, 2300, 0]:
            page.evaluate(f"window.scrollTo({{ top: {pos}, behavior: 'smooth' }})")
            page.wait_for_timeout(900)

        # Scene 2: Entering Dashboard
        print("Scene 2: Entering Dashboard...")
        try:
            page.click("text=Start Your Journey", timeout=3000)
        except:
            page.click("text=Home Dashboard", timeout=3000)
        page.wait_for_timeout(2500)

        # Scene 3: User Profile Dropdown & Auth Modal
        print("Scene 3: User Profile Dropdown & Auth Modal...")
        try:
            # Click user profile button in navbar
            page.click("header button:has(.lucide-chevron-down)", timeout=3000)
            page.wait_for_timeout(1500)
            # Click Switch Account / Sign In
            page.click("text=Switch Account / Sign In", timeout=3000)
            page.wait_for_timeout(2000)
            # Switch to Sign In tab
            try:
                page.click("text=Sign In with Email", timeout=2000)
                page.wait_for_timeout(1200)
            except:
                pass
            # Close modal with the X button
            page.click("div.fixed button:has(.lucide-x)", timeout=3000)
            page.wait_for_timeout(1000)
        except Exception as e:
            print("Auth step note:", e)

        # Ensure no modal is open
        try:
            page.keyboard.press("Escape")
            page.wait_for_timeout(500)
        except:
            pass

        # Scene 4: Dashboard & Automatic Screen Tracker
        print("Scene 4: Live Screen Focus Tracker...")
        page.evaluate("window.scrollTo({ top: 350, behavior: 'smooth' })")
        page.wait_for_timeout(2000)
        # Click Choose Another activity on dashboard
        try:
            page.click("text=Choose Another", timeout=3000)
            page.wait_for_timeout(2000)
        except Exception as e:
            print("Choose another note:", e)

        # Scene 5: Sound Studio Modal
        print("Scene 5: Opening Sound Studio...")
        try:
            # Click Sound button in navbar
            page.click("header button:has(.lucide-bell)", timeout=3000)
            page.wait_for_timeout(2000)
            # Click Soft Crystal Bell preset
            page.click("text=Soft Crystal Bell", timeout=2500)
            page.wait_for_timeout(1500)
            # Click Calming Harp
            page.click("text=Calming Harp", timeout=2500)
            page.wait_for_timeout(1500)
            # Close modal by clicking Save Sound Preference
            try:
                page.click("button:has-text('Save Sound Preference')", timeout=2500)
            except:
                page.click("div.fixed button:has(.lucide-x)", timeout=2500)
            page.wait_for_timeout(1500)
        except Exception as e:
            print("Sound studio note:", e)

        # Ensure no modal is blocking
        try:
            page.keyboard.press("Escape")
            page.wait_for_timeout(500)
        except:
            pass

        # Scene 6: Wellness Check-In
        print("Scene 6: Wellness Check-In & AI Recommendation...")
        page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
        page.wait_for_timeout(500)
        try:
            page.click("text=Wellness Check-In", timeout=4000)
            page.wait_for_timeout(2000)
            # Scroll check-in form
            page.evaluate("window.scrollTo({ top: 350, behavior: 'smooth' })")
            page.wait_for_timeout(1500)
            # Click Generate Recommendation button
            page.click("text=Generate My AI Wellness Recommendation", timeout=4000)
            page.wait_for_timeout(3000)
        except Exception as e:
            print("Check-in note:", e)

        # Scene 7: Guided Interactive Activity Player
        print("Scene 7: Interactive Activity Player...")
        try:
            page.click("text=Start This Activity Now, text=Start Activity", timeout=4000)
            page.wait_for_timeout(4500) # Watch breathing ring and countdown timer
            # Complete activity
            page.click("text=Complete Activity, button:has-text('Complete')", timeout=4000)
            page.wait_for_timeout(2500) # Watch celebration & rating
            # Close feedback dialog
            try:
                page.click("div.fixed button:has(.lucide-x), button:has-text('Done')", timeout=2500)
            except:
                page.keyboard.press("Escape")
            page.wait_for_timeout(1500)
        except Exception as e:
            print("Player note:", e)

        # Ensure modal closed
        try:
            page.keyboard.press("Escape")
            page.wait_for_timeout(500)
        except:
            pass

        # Scene 8: AI Wellness Assistant
        print("Scene 8: Talk to VYBE Assistant...")
        page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
        try:
            page.click("text=AI Wellness Assistant", timeout=4000)
            page.wait_for_timeout(2500)
            # Click a suggestion chip or type message
            try:
                page.click("text=My neck is stiff", timeout=3000)
            except:
                page.fill("input[placeholder*='message'], textarea", "My shoulders are tense from long coding hours")
                page.keyboard.press("Enter")
            page.wait_for_timeout(3500)
        except Exception as e:
            print("Assistant note:", e)

        # Scene 9: Workday Smart Planner
        print("Scene 9: Workday Smart Break Planner...")
        try:
            page.click("text=Smart Break Planner", timeout=4000)
            page.wait_for_timeout(2000)
            page.evaluate("window.scrollTo({ top: 400, behavior: 'smooth' })")
            page.wait_for_timeout(2000)
        except Exception as e:
            print("Planner note:", e)

        # Scene 10: My Wellness Journey Analytics
        print("Scene 10: My Wellness Journey Analytics...")
        page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
        try:
            page.click("text=My Wellness Journey", timeout=4000)
            page.wait_for_timeout(2500)
            page.evaluate("window.scrollTo({ top: 400, behavior: 'smooth' })")
            page.wait_for_timeout(2500)
        except Exception as e:
            print("Journey note:", e)

        # Scene 11: Relaxation Zone Catalog
        print("Scene 11: Relaxation Zone...")
        page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
        try:
            page.click("text=Relaxation Zone", timeout=4000)
            page.wait_for_timeout(2000)
            page.evaluate("window.scrollTo({ top: 400, behavior: 'smooth' })")
            page.wait_for_timeout(2500)
        except Exception as e:
            print("Relaxation note:", e)

        print("Finishing up and saving video...")
        page.wait_for_timeout(1500)
        context.close()
        browser.close()

    # Find the recorded video
    video_files = glob.glob(os.path.join(record_dir, "*.webm"))
    if not video_files:
        print("No webm video found in demo_recording/")
        return

    latest_video = max(video_files, key=os.path.getctime)
    mp4_output = os.path.abspath("vybe_ai_walkthrough_demo.mp4")
    print(f"Converting {latest_video} to {mp4_output} with FFmpeg...")

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
    record_demo()
