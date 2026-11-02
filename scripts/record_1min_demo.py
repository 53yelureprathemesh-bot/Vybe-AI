import os
import json
import glob
import time
import subprocess
from playwright.sync_api import sync_playwright

def record_1min_demo():
    print("================================================================")
    print("Starting 1-Minute All-Dashboards Demo Video Recording for VYBE AI")
    print("================================================================")

    record_dir = os.path.abspath("demo_recording_1min")
    os.makedirs(record_dir, exist_ok=True)

    # Clean previous temp recordings in this directory
    for f in glob.glob(os.path.join(record_dir, "*.webm")):
        try:
            os.remove(f)
        except:
            pass

    prajakta_user = {
        "user_id": "user_1793320275_2e63fb",
        "name": "Prajakta Yelure",
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

        # ----------------------------------------------------------------------
        # Scene 1: Home Dashboard & Focus Timer (0s - 7s)
        # ----------------------------------------------------------------------
        print("[0:00] Scene 1: Home Dashboard & Focus Timer...")
        page.goto("http://127.0.0.1:8000")
        page.wait_for_timeout(2500)

        # Smooth scroll down to show desktop background protection & notification center
        page.evaluate("window.scrollTo({ top: 380, behavior: 'smooth' })")
        page.wait_for_timeout(1800)

        # Click '🔔 Test Desktop Alert' to trigger real notification toast & audio chime
        print("[0:04] Triggering Desktop Alert...")
        try:
            page.click("button:has-text('Test Desktop Alert')", timeout=2500)
            page.wait_for_timeout(1200)
        except Exception as e:
            print("Alert trigger note:", e)

        # ----------------------------------------------------------------------
        # Scene 2: Notification Hit & Activity Player (7s - 17s)
        # ----------------------------------------------------------------------
        print("[0:07] Scene 2: Launching Guided Activity Player...")
        page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
        page.wait_for_timeout(800)

        # Click Start on Next Best Break card
        for selector in [
            "button:has-text('Start Now')",
            "button:has-text('Start 20-20-20 Eye Rest Now')",
            "button:has-text('Start')",
            "button:has-text('Take Micro-Break')"
        ]:
            try:
                page.click(selector, timeout=1200)
                print(f"Started activity with selector: {selector}")
                break
            except:
                continue

        # Guided Activity Player with breathing circle & countdown
        page.wait_for_timeout(3000)
        print("[0:11] Fast-forwarding activity completion celebration...")
        try:
            # Trigger celebration confetti and completion
            page.evaluate("window.__vybeTriggerActivityComplete && window.__vybeTriggerActivityComplete()")
            page.wait_for_timeout(1800) # Confetti celebration
            
            # Rate Helpful
            print("[0:13] Submitting feedback: Helpful...")
            page.click("button:has-text('Helpful')", timeout=1500)
            page.wait_for_timeout(800)
            
            # Return to Dashboard
            page.click("button:has-text('Return to Dashboard')", timeout=1500)
            page.wait_for_timeout(1000)
        except Exception as e:
            print("Player note:", e)

        # ----------------------------------------------------------------------
        # Scene 3: Notification Sound Studio (17s - 24s)
        # ----------------------------------------------------------------------
        print("[0:17] Scene 3: Notification Sound Studio Modal...")
        try:
            # Open sound studio
            page.evaluate("window.__vybeOpenSoundStudio && window.__vybeOpenSoundStudio(true)")
            page.wait_for_timeout(1200)
            
            # Select Calming Harp chime
            try:
                page.click("text=Calming Harp", timeout=1500)
                page.wait_for_timeout(800)
            except:
                pass
            
            # Test Play sound
            page.click("button:has-text('Test Play Selected Reminder Alert')", timeout=1500)
            page.wait_for_timeout(1000)
            
            # Save Sound Preference
            page.click("button:has-text('Save Sound Preference')", timeout=1500)
            page.wait_for_timeout(1400)
        except Exception as e:
            print("Sound studio note:", e)

        # ----------------------------------------------------------------------
        # Scene 4: AI Wellness Assistant VYBE ('Talk to VYBE') (24s - 36s)
        # ----------------------------------------------------------------------
        print("[0:24] Scene 4: AI Wellness Assistant VYBE ('Talk to VYBE')...")
        try:
            page.evaluate("window.__vybeNavigate && window.__vybeNavigate('assistant')")
            page.wait_for_timeout(1500)
            
            # Type prompt
            print("[0:26] Typing user message to VYBE...")
            prompt_text = "My eyes burn and neck is stiff from 3 hours of coding"
            chat_input = page.locator("input[placeholder*='Message VYBE'], input[type='text']").first
            chat_input.fill(prompt_text)
            page.wait_for_timeout(800)
            page.keyboard.press("Enter")
            
            # Show live conversation analysis and recommendation card
            print("[0:28] Displaying multi-turn conversation fatigue analysis & recommendation...")
            page.wait_for_timeout(4500)
        except Exception as e:
            print("Assistant note:", e)

        # ----------------------------------------------------------------------
        # Scene 5: Smart Break Planner (36s - 43s)
        # ----------------------------------------------------------------------
        print("[0:36] Scene 5: Smart Break Planner...")
        try:
            page.evaluate("window.__vybeNavigate && window.__vybeNavigate('planner')")
            page.wait_for_timeout(1500)
            page.evaluate("window.scrollTo({ top: 380, behavior: 'smooth' })")
            page.wait_for_timeout(2000)
            page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
            page.wait_for_timeout(1000)
        except Exception as e:
            print("Planner note:", e)

        # ----------------------------------------------------------------------
        # Scene 6: Relaxation Zone (43s - 50s)
        # ----------------------------------------------------------------------
        print("[0:43] Scene 6: Relaxation Zone...")
        try:
            page.evaluate("window.__vybeNavigate && window.__vybeNavigate('relaxation')")
            page.wait_for_timeout(1500)
            
            # Click a category filter
            try:
                page.click("button:has-text('Eye Relaxation')", timeout=1500)
                page.wait_for_timeout(800)
            except:
                pass

            page.evaluate("window.scrollTo({ top: 400, behavior: 'smooth' })")
            page.wait_for_timeout(2000)
            page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
            page.wait_for_timeout(1000)
        except Exception as e:
            print("Relaxation note:", e)

        # ----------------------------------------------------------------------
        # Scene 7: Wellness Check-In (50s - 58s)
        # ----------------------------------------------------------------------
        print("[0:50] Scene 7: Wellness Check-In...")
        try:
            page.evaluate("window.__vybeNavigate && window.__vybeNavigate('checkin')")
            page.wait_for_timeout(1500)
            
            # Select mood Tired
            try:
                page.click("button:has-text('Tired')", timeout=1500)
                page.wait_for_timeout(800)
            except:
                pass
                
            page.evaluate("window.scrollTo({ top: 450, behavior: 'smooth' })")
            page.wait_for_timeout(1200)
            
            # Click submit button
            print("[0:53] Submitting voluntary check-in...")
            page.click("button[type='submit']", timeout=2500)
            
            # Wait for AI recommendation card to render
            page.wait_for_timeout(2800)
        except Exception as e:
            print("Check-in note:", e)

        # ----------------------------------------------------------------------
        # Scene 8: My Wellness Journey Analytics (58s - 65s)
        # ----------------------------------------------------------------------
        print("[0:58] Scene 8: My Wellness Journey Analytics...")
        page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
        try:
            page.evaluate("window.__vybeNavigate && window.__vybeNavigate('journey')")
            page.wait_for_timeout(1500)
            page.evaluate("window.scrollTo({ top: 400, behavior: 'smooth' })")
            page.wait_for_timeout(2200)
            page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
            page.wait_for_timeout(1000)
        except Exception as e:
            print("Journey note:", e)

        # ----------------------------------------------------------------------
        # Scene 9: Preferences & Settings (65s - 71s)
        # ----------------------------------------------------------------------
        print("[1:05] Scene 9: Preferences & Settings...")
        try:
            page.evaluate("window.__vybeNavigate && window.__vybeNavigate('settings')")
            page.wait_for_timeout(1500)
            page.evaluate("window.scrollTo({ top: 420, behavior: 'smooth' })")
            page.wait_for_timeout(2000)
            page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
            page.wait_for_timeout(1000)
        except Exception as e:
            print("Settings note:", e)

        # ----------------------------------------------------------------------
        # Scene 10: Clean Return to Home Dashboard (71s - 75s)
        # ----------------------------------------------------------------------
        print("[1:11] Scene 10: Clean return to Home Dashboard...")
        try:
            page.evaluate("window.__vybeNavigate && window.__vybeNavigate('dashboard')")
            page.wait_for_timeout(2500)
        except Exception as e:
            print("Final return note:", e)

        print("Finalizing video stream and saving recording...")
        page.wait_for_timeout(1000)
        context.close()
        browser.close()

    # Find the recorded webm file
    video_files = glob.glob(os.path.join(record_dir, "*.webm"))
    if not video_files:
        print("ERROR: No webm file found in demo_recording_1min/")
        return

    latest_webm = max(video_files, key=os.path.getctime)
    mp4_output = os.path.abspath("vybe_ai_all_dashboards_demo.mp4")
    subm_mp4 = os.path.abspath("VybeAI_WorkplaceWellnessAgent/VybeAI_WorkplaceWellnessAgent_DemoVideo.mp4")
    art_dir = r"C:\Users\PRAJKTA\.gemini\antigravity\brain\0d03fad5-79d2-4e8a-ba91-c855460419b9"
    art_mp4 = os.path.join(art_dir, "vybe_ai_all_dashboards_demo.mp4")

    print(f"Encoding {latest_webm} to High-Quality MP4: {mp4_output}...")

    ffmpeg_cmd = [
        "ffmpeg",
        "-y",
        "-i", latest_webm,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "fast",
        "-crf", "22",
        "-r", "30",
        "-movflags", "+faststart",
        mp4_output
    ]

    res = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
    if res.returncode == 0:
        file_size_mb = os.path.getsize(mp4_output) / (1024 * 1024)
        print(f"SUCCESS: Demo Video saved to: {mp4_output} ({file_size_mb:.2f} MB)")
        import shutil
        shutil.copy(mp4_output, subm_mp4)
        print(f"Copied to Submission Folder: {subm_mp4}")
        try:
            shutil.copy(mp4_output, art_mp4)
            print(f"Copied to Artifacts: {art_mp4}")
        except Exception as ex:
            print("Artifact copy notice:", ex)
    else:
        print("FFmpeg error:", res.stderr)

if __name__ == "__main__":
    record_1min_demo()
