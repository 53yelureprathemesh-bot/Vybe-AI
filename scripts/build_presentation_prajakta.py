import os
import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_prajakta_deck(output_path="VYBE_AI_Prajakta_Presentation.pptx"):
    prs = pptx.Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    DARK_NAVY = RGBColor(15, 23, 42)      # #0F172A
    DEEP_TEAL = RGBColor(13, 148, 136)    # #0D9488
    LIGHT_TEAL = RGBColor(20, 184, 166)   # #14B8A6
    BG_LIGHT = RGBColor(248, 250, 252)    # #F8FAFC
    CARD_BG = RGBColor(255, 255, 255)     # #FFFFFF
    TEXT_DARK = RGBColor(30, 41, 59)      # #1E293B
    TEXT_MUTED = RGBColor(100, 116, 139)  # #64748B
    BORDER_COLOR = RGBColor(226, 232, 240)# #E2E8F0
    ACCENT_CYAN = RGBColor(6, 182, 212)   # #06B6D4
    ACCENT_AMBER = RGBColor(245, 158, 11) # #F59E0B
    ACCENT_PURPLE = RGBColor(147, 51, 234)# #9333EA

    def add_bg(slide, color):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = color
        bg.line.fill.background()
        return bg

    def add_card(slide, left, top, width, height, bg_color=CARD_BG, border_color=BORDER_COLOR):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        if border_color:
            card.line.color.rgb = border_color
            card.line.width = Pt(1.5)
        else:
            card.line.fill.background()
        return card

    def add_header(slide, tag, title, subtitle=None):
        tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(1.3))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p_tag = tf.paragraphs[0]
        p_tag.text = tag.upper()
        p_tag.font.name = "Segoe UI"
        p_tag.font.size = Pt(11)
        p_tag.font.bold = True
        p_tag.font.color.rgb = DEEP_TEAL
        p_tag.space_after = Pt(4)

        p_title = tf.add_paragraph()
        p_title.text = title
        p_title.font.name = "Segoe UI"
        p_title.font.size = Pt(24)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_DARK
        p_title.space_after = Pt(4)

        if subtitle:
            p_sub = tf.add_paragraph()
            p_sub.text = subtitle
            p_sub.font.name = "Segoe UI"
            p_sub.font.size = Pt(13)
            p_sub.font.color.rgb = TEXT_MUTED

    # ==========================================
    # SLIDE 1: Cover (Personalized for Prajakta Yelure)
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    add_bg(s1, DARK_NAVY)

    tb1 = s1.shapes.add_textbox(Inches(0.8), Inches(2.0), Inches(11.7), Inches(4.2))
    tf1 = tb1.text_frame
    tf1.word_wrap = True

    p1 = tf1.paragraphs[0]
    p1.text = "VYBE AI"
    p1.font.name = "Segoe UI"
    p1.font.size = Pt(46)
    p1.font.bold = True
    p1.font.color.rgb = RGBColor(255, 255, 255)
    p1.space_after = Pt(6)

    p2 = tf1.add_paragraph()
    p2.text = "Your Work. Your Wellness. Your Rhythm."
    p2.font.name = "Segoe UI"
    p2.font.size = Pt(22)
    p2.font.color.rgb = LIGHT_TEAL
    p2.space_after = Pt(16)

    p_badge = tf1.add_paragraph()
    p_badge.text = "PERSONALIZED PRESENTATION & SYSTEM WALKTHROUGH FOR:"
    p_badge.font.name = "Segoe UI"
    p_badge.font.size = Pt(12)
    p_badge.font.bold = True
    p_badge.font.color.rgb = ACCENT_CYAN
    p_badge.space_after = Pt(4)

    p_user = tf1.add_paragraph()
    p_user.text = "Prajakta Yelure  |  Age 25  |  Software Engineer"
    p_user.font.name = "Segoe UI"
    p_user.font.size = Pt(18)
    p_user.font.bold = True
    p_user.font.color.rgb = RGBColor(255, 255, 255)
    p_user.space_after = Pt(16)

    p3 = tf1.add_paragraph()
    p3.text = "Full-Stack System Architecture, Runtimes (Python & Node.js), Notification Delivery Mechanics,\nand Comprehensive Feature Suite for Developer Health."
    p3.font.name = "Segoe UI"
    p3.font.size = Pt(13)
    p3.font.color.rgb = RGBColor(203, 213, 225)

    # ==========================================
    # SLIDE 2: Problem Statement (Software Engineer Focus)
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    add_bg(s2, BG_LIGHT)
    add_header(s2, "Workplace Realities", "The Software Engineer Strain Dilemma", "Why developers like Prajakta face unique ergonomic and cognitive hurdles")

    cards_s2 = [
        ("The Coding Flow Lock", "Continuous Unbroken Focus", "Writing code requires deep mental context. Engineers spend 3 to 5 hours uninterrupted staring at IDEs, ignoring natural fatigue cues until physical pain sets in.", ACCENT_AMBER),
        ("Physical Tech Strain", "CVS, Tech Neck & RSI", "• Computer Vision Syndrome from high-contrast code themes.\n• Cervical spine strain ('tech neck') from laptop hunching.\n• Wrist tension from continuous keyboard typing.", RGBColor(239, 68, 68)),
        ("The Alarm Paradox", "Why Generic Timers Fail", "Traditional alarms interrupt during complex debugging sessions. They feel disruptive and annoying, leading developers to permanently mute them.", RGBColor(99, 102, 241))
    ]
    for i, (title, sub, body, accent) in enumerate(cards_s2):
        left = Inches(0.8 + i * 4.0)
        add_card(s2, left, Inches(2.0), Inches(3.7), Inches(4.7))
        tb = s2.shapes.add_textbox(left + Inches(0.3), Inches(2.3), Inches(3.1), Inches(4.1))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.name = "Segoe UI"
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = TEXT_DARK
        p.space_after = Pt(4)
        ps = tf.add_paragraph()
        ps.text = sub
        ps.font.name = "Segoe UI"
        ps.font.size = Pt(11)
        ps.font.bold = True
        ps.font.color.rgb = accent
        ps.space_after = Pt(12)
        pb = tf.add_paragraph()
        pb.text = body
        pb.font.name = "Segoe UI"
        pb.font.size = Pt(12)
        pb.font.color.rgb = TEXT_MUTED

    # ==========================================
    # SLIDE 3: Tech Stack & File Types Used
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    add_bg(s3, BG_LIGHT)
    add_header(s3, "Architecture & Engineering", "Which Runtimes & File Types Are Used?", "Complete breakdown of the Python, Node.js, and browser runtime environments")

    tech_types = [
        ("Python 3.10 Runtime (Backend)", "Files: .py, .db, .sql", "• FastAPI (main.py): High-throughput asynchronous REST API.\n• Pydantic v2 (models.py): Strict data validation and schemas.\n• SQLite (database.py & vybe_wellness.db): Local database for users, screen sessions, and activity records.\n• Pytest (backend/tests/): 27 automated unit and integration tests.", Inches(0.8), Inches(2.0)),
        ("Node.js Runtime (Frontend Build)", "Files: .tsx, .ts, .json, .css", "• React 18: Modern component-driven user interface.\n• TypeScript (types/index.ts): Strict static typing.\n• Vite (vite.config.ts): Sub-second lightning build tool.\n• Tailwind CSS: Custom ergonomic design palette.\n• Lucide React: 40+ crisp SVG iconography components.", Inches(6.8), Inches(2.0)),
        ("Web Audio API (Browser Audio)", "Synthesizer: soundService.ts", "• Zero MP3 dependencies needed for presets!\n• Synthesizes acoustic frequencies directly in browser memory (oscillators, biquad filters, gain nodes).\n• Generates 432Hz Tibetan bowls, crystal bells, harps, and pink-noise gentle rain.", Inches(0.8), Inches(4.5)),
        ("Automation & Shell Scripts", "Files: .bat, .mp4, .pptx", "• run.bat: Single-click production runner (Uvicorn + SPA).\n• dev.bat: Hot-reloading Vite development server.\n• build_presentation.py: Automated PPT generation.\n• record_walkthrough.py: Automated Playwright video capture.", Inches(6.8), Inches(4.5))
    ]

    for title, sub, body, left, top in tech_types:
        add_card(s3, left, top, Inches(5.7), Inches(2.2))
        tb = s3.shapes.add_textbox(left + Inches(0.3), top + Inches(0.2), Inches(5.1), Inches(1.8))
        tf = tb.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.name = "Segoe UI"
        p1.font.size = Pt(14)
        p1.font.bold = True
        p1.font.color.rgb = DEEP_TEAL
        p1.space_after = Pt(2)
        p2 = tf.add_paragraph()
        p2.text = sub
        p2.font.name = "Segoe UI"
        p2.font.size = Pt(10)
        p2.font.bold = True
        p2.font.color.rgb = ACCENT_CYAN
        p2.space_after = Pt(6)
        p3 = tf.add_paragraph()
        p3.text = body
        p3.font.name = "Segoe UI"
        p3.font.size = Pt(10)
        p3.font.color.rgb = TEXT_MUTED

    # ==========================================
    # SLIDE 4: How To Run The Application
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    add_bg(s4, BG_LIGHT)
    add_header(s4, "Execution Guide", "How to Run & Deploy the Website", "Simple two-step pipeline for local development and standalone production")

    steps_run = [
        ("Step 1: Frontend Build (Node.js)", "npm run build in /frontend", "Vite compiles all TypeScript (.tsx/.ts) and Tailwind CSS into an optimized, minified bundle in /frontend/dist (HTML, JS, and CSS). Zero runtime Node dependency is needed after this step.", DEEP_TEAL),
        ("Step 2: Backend & Web Server (Python)", "uvicorn main:app --port 8000", "FastAPI initializes the SQLite database, mounts the REST API endpoints (/api/*), and serves the compiled React single-page app statically on root (/).", ACCENT_CYAN),
        ("Single-Click Launch (Windows)", "Double-Click run.bat", "A convenient Windows batch script that automatically sets paths, initializes the server, and hosts the application locally at http://localhost:8000.", RGBColor(16, 185, 129))
    ]
    for i, (title, sub, body, accent) in enumerate(steps_run):
        left = Inches(0.8 + i * 4.0)
        add_card(s4, left, Inches(2.0), Inches(3.7), Inches(4.7))
        tb = s4.shapes.add_textbox(left + Inches(0.3), Inches(2.3), Inches(3.1), Inches(4.1))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.name = "Segoe UI"
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = TEXT_DARK
        p.space_after = Pt(4)
        ps = tf.add_paragraph()
        ps.text = sub
        ps.font.name = "Segoe UI"
        ps.font.size = Pt(11)
        ps.font.bold = True
        ps.font.color.rgb = accent
        ps.space_after = Pt(12)
        pb = tf.add_paragraph()
        pb.text = body
        pb.font.name = "Segoe UI"
        pb.font.size = Pt(12)
        pb.font.color.rgb = TEXT_MUTED

    # ==========================================
    # SLIDE 5: Automatic Screen Tracking
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    add_bg(s5, BG_LIGHT)
    add_header(s5, "Core Feature", "100% Automatic Screen Time & Idle Monitor", "Tracking continuous work strain in real-time without invasive surveillance")

    add_card(s5, Inches(0.8), Inches(2.0), Inches(5.6), Inches(4.7))
    tb_s5_1 = s5.shapes.add_textbox(Inches(1.1), Inches(2.3), Inches(5.0), Inches(4.1))
    tf_s5_1 = tb_s5_1.text_frame
    tf_s5_1.word_wrap = True
    p = tf_s5_1.paragraphs[0]
    p.text = "How the Tracking Engine Works"
    p.font.name = "Segoe UI"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = TEXT_DARK
    p.space_after = Pt(8)
    pts_s5_1 = [
        "Low-Overhead Event Listeners: Monitors mousemove, keydown, touchstart, and scroll events passively.",
        "Active vs. Idle State: If Prajakta steps away or doesn't type for >60 seconds, the state transitions automatically to 'Idle' or 'Away'.",
        "Tab Visibility Sync: Listening to document.visibilitychange pauses the focus timer when switching windows.",
        "Threshold Trigger: Once continuous focus exceeds 45 minutes, an automated posture & eye alert is triggered."
    ]
    for pt in pts_s5_1:
        p_it = tf_s5_1.add_paragraph()
        p_it.text = "✦ " + pt
        p_it.font.name = "Segoe UI"
        p_it.font.size = Pt(11)
        p_it.font.color.rgb = TEXT_MUTED
        p_it.space_after = Pt(6)

    add_card(s5, Inches(6.8), Inches(2.0), Inches(5.7), Inches(4.7))
    tb_s5_2 = s5.shapes.add_textbox(Inches(7.1), Inches(2.3), Inches(5.1), Inches(4.1))
    tf_s5_2 = tb_s5_2.text_frame
    tf_s5_2.word_wrap = True
    p = tf_s5_2.paragraphs[0]
    p.text = "Live Indicators & Session Resets"
    p.font.name = "Segoe UI"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = TEXT_DARK
    p.space_after = Pt(8)
    pts_s5_2 = [
        "Navbar Live Focus Badge: Real-time badge (e.g., '⏱️ 14m Focus') constantly informs Prajakta of her screen duration.",
        "Dashboard Strain Ring: An animated progress ring counting toward the 45-minute posture reset threshold.",
        "Automatic Session Reset: When Prajakta starts and finishes any wellness break, continuous screen time resets to zero.",
        "Persistent SQLite Sync: Automatically records daily screen sessions into the screen_sessions database table."
    ]
    for pt in pts_s5_2:
        p_it = tf_s5_2.add_paragraph()
        p_it.text = "✦ " + pt
        p_it.font.name = "Segoe UI"
        p_it.font.size = Pt(11)
        p_it.font.color.rgb = TEXT_MUTED
        p_it.space_after = Pt(6)

    # ==========================================
    # SLIDE 6: HOW NOTIFICATIONS HIT & NOTIFY THE USER
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    add_bg(s6, BG_LIGHT)
    add_header(s6, "Notification Mechanics", "How Notifications Hit & Notify The User", "A gentle, non-startling multi-sensory notification delivery system")

    notif_steps = [
        ("1. Trigger Condition Met", "Screen threshold reached (45m) or scheduled reminder fires in the background.", DEEP_TEAL),
        ("2. Harmonic Chime Plays", "Web Audio API immediately plays user's selected chime (Zen Bowl, Crystal Bell, or custom MP3).", ACCENT_CYAN),
        ("3. Sleek Floating Toast Hits", "A non-intrusive banner appears in the top-right corner with a pulsing audio wave icon.", ACCENT_AMBER),
        ("4. Contextual Break Info", "Displays activity title (e.g. 20-20-20 Eye Rest), time required, and explainable rationale.", RGBColor(16, 185, 129)),
        ("5. User Action Control", "Buttons for 'Start Now', '+5m Snooze', '+10m Snooze', or Dismiss. Zero forced interruption.", RGBColor(139, 92, 246)),
        ("6. 1-Click Guided Player Launch", "Clicking 'Start Now' immediately opens the full-screen interactive breathing & exercise player.", RGBColor(236, 72, 153))
    ]

    for i, (title, desc, col) in enumerate(notif_steps):
        row = i // 3
        col_idx = i % 3
        left = Inches(0.8 + col_idx * 4.0)
        top = Inches(2.0 + row * 2.45)
        add_card(s6, left, top, Inches(3.7), Inches(2.25))
        tb = s6.shapes.add_textbox(left + Inches(0.25), top + Inches(0.2), Inches(3.2), Inches(1.85))
        tf = tb.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.name = "Segoe UI"
        p1.font.size = Pt(14)
        p1.font.bold = True
        p1.font.color.rgb = col
        p1.space_after = Pt(4)
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.name = "Segoe UI"
        p2.font.size = Pt(11)
        p2.font.color.rgb = TEXT_MUTED

    # ==========================================
    # SLIDE 7: Notification Sound Studio
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    add_bg(s7, BG_LIGHT)
    add_header(s7, "Acoustic Customization", "Notification Sound Studio & Ambient Mixer", "Acoustically engineered sound design that soothes rather than startles")

    sounds_s7 = [
        ("Zen Tibetan Bowl", "432 Hz Healing Tuning", "Deep harmonic resonance that calms the nervous system during intense work.", DEEP_TEAL),
        ("Soft Crystal Bell", "880 Hz High Clarity", "Crystalline chime with gentle reverberant decay for elegant transitions.", ACCENT_CYAN),
        ("Calming Harp Arpeggio", "Pentatonic Melody", "Five-note melodic sequence that brings musical warmth to break reminders.", RGBColor(168, 85, 247)),
        ("Forest Water Drop", "Natural Frequency Glide", "Acoustic water drop with low-pass splash filter evoking natural tranquility.", RGBColor(34, 197, 94)),
        ("Gentle Temple Gong", "220 Hz Grounding Bell", "Deep grounded resonance anchoring awareness back into the physical body.", ACCENT_AMBER),
        ("Custom Audio Uploader", "MP3 / WAV / OGG Files", "Upload your own chime audio track, saved as persistent Data URLs in SQLite.", RGBColor(236, 72, 153))
    ]
    for i, (title, sub, body, col) in enumerate(sounds_s7):
        row = i // 3
        col_idx = i % 3
        left = Inches(0.8 + col_idx * 4.0)
        top = Inches(2.0 + row * 2.45)
        add_card(s7, left, top, Inches(3.7), Inches(2.25))
        tb = s7.shapes.add_textbox(left + Inches(0.25), top + Inches(0.2), Inches(3.2), Inches(1.85))
        tf = tb.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.name = "Segoe UI"
        p1.font.size = Pt(14)
        p1.font.bold = True
        p1.font.color.rgb = col
        p1.space_after = Pt(2)
        p2 = tf.add_paragraph()
        p2.text = sub
        p2.font.name = "Segoe UI"
        p2.font.size = Pt(10)
        p2.font.bold = True
        p2.font.color.rgb = TEXT_DARK
        p2.space_after = Pt(6)
        p3 = tf.add_paragraph()
        p3.text = body
        p3.font.name = "Segoe UI"
        p3.font.size = Pt(10)
        p3.font.color.rgb = TEXT_MUTED

    # ==========================================
    # SLIDE 8: Closed-Loop AI Decision Engine
    # ==========================================
    s8 = prs.slides.add_slide(blank_layout)
    add_bg(s8, BG_LIGHT)
    add_header(s8, "Intelligence Engine", "The 5-Stage Cybernetic Decision Loop", "A closed-loop recommendation engine that continuously adapts to Prajakta's rhythm")

    loop_steps = [
        ("1. OBSERVE", "Data Ingestion", "• Demographic baseline (25yo, SWE)\n• Live screen tracking\n• Idle / away duration\n• Voluntary check-in", DEEP_TEAL),
        ("2. ANALYSE", "Context & Strain", "• Screen strain (>=45m)\n• Sitting strain (>=50m)\n• Circadian energy dip\n• Time window (30s-10m)", ACCENT_CYAN),
        ("3. DECIDE", "Scoring & Filter", "• Hard duration constraint\n• Fatigue category boost\n• Feedback weight score\n• Quiet-hours suppress", ACCENT_AMBER),
        ("4. ACT", "Guided Run", "• Non-intrusive toast\n• 432Hz audio chime\n• Guided countdown timer\n• Breathing visualizer", RGBColor(16, 185, 129)),
        ("5. LEARN", "Reinforcement", "• 1-click user rating\n• +1.5 for helpful rest\n• -2.0 for unhelpful\n• Dynamic weight updates", RGBColor(139, 92, 246))
    ]
    for i, (stage, sub, body, col) in enumerate(loop_steps):
        left = Inches(0.8 + i * 2.4)
        add_card(s8, left, Inches(2.0), Inches(2.2), Inches(4.7))
        tb = s8.shapes.add_textbox(left + Inches(0.2), Inches(2.3), Inches(1.8), Inches(4.1))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = stage
        p.font.name = "Segoe UI"
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = col
        p.space_after = Pt(2)
        ps = tf.add_paragraph()
        ps.text = sub
        ps.font.name = "Segoe UI"
        ps.font.size = Pt(10)
        ps.font.bold = True
        ps.font.color.rgb = TEXT_DARK
        ps.space_after = Pt(8)
        pb = tf.add_paragraph()
        pb.text = body
        pb.font.name = "Segoe UI"
        pb.font.size = Pt(10)
        pb.font.color.rgb = TEXT_MUTED

    # ==========================================
    # SLIDE 9: Guided Activity Player
    # ==========================================
    s9 = prs.slides.add_slide(blank_layout)
    add_bg(s9, BG_LIGHT)
    add_header(s9, "Interactive Experience", "Guided Activity Player & Micro-Break Catalog", "Science-backed desk interventions with real-time audio-visual guidance")

    add_card(s9, Inches(0.8), Inches(2.0), Inches(5.6), Inches(4.7))
    tb_s9 = s9.shapes.add_textbox(Inches(1.1), Inches(2.3), Inches(5.0), Inches(4.1))
    tf_s9 = tb_s9.text_frame
    tf_s9.word_wrap = True
    p = tf_s9.paragraphs[0]
    p.text = "Player Capabilities & Controls"
    p.font.name = "Segoe UI"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = TEXT_DARK
    p.space_after = Pt(8)
    items_s9 = [
        "Timestamp Countdown Timer: Precise state timer ensuring exercises last the exact intended duration.",
        "Animated Breathing Ring: Pulsing circular guide timing Inhale (4s), Hold (4s), Exhale (4s), Hold (4s).",
        "Step-by-Step Instructions: Clear, progressive instructional prompts updated as the exercise advances.",
        "Interactive Controls: Pause, Resume, Restart, and Finish options so Prajakta is always in control.",
        "Confetti & Star Rating: Immediate positive reinforcement and 1-click rating that feeds back into the AI engine."
    ]
    for it in items_s9:
        p_it = tf_s9.add_paragraph()
        p_it.text = "✦ " + it
        p_it.font.name = "Segoe UI"
        p_it.font.size = Pt(11)
        p_it.font.color.rgb = TEXT_MUTED
        p_it.space_after = Pt(5)

    add_card(s9, Inches(6.8), Inches(2.0), Inches(5.7), Inches(4.7))
    tb_s9_2 = s9.shapes.add_textbox(Inches(7.1), Inches(2.3), Inches(5.1), Inches(4.1))
    tf_s9_2 = tb_s9_2.text_frame
    tf_s9_2.word_wrap = True
    p = tf_s9_2.paragraphs[0]
    p.text = "6 Core Activity Categories"
    p.font.name = "Segoe UI"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = TEXT_DARK
    p.space_after = Pt(8)
    cats_s9 = [
        ("EyeCare (20-20-20 Rule)", "Look 20 feet away for 20 seconds to release ciliary muscle spasm."),
        ("DeskYoga (Seated Posture)", "Shoulder rolls, chest openers, and seated spinal twists."),
        ("MindReset (Box Breathing)", "4-4-4-4 tactical breathing to clear acute sprint stress."),
        ("WalkBreak (Circulation)", "2-5 minute indoor/outdoor walking to stimulate blood flow."),
        ("HydrateMate (Hydration)", "Structured water intake with mindful sip guidance."),
        ("PowerNap (Restorative NSDR)", "10-20 minute non-sleep deep rest audio pacing.")
    ]
    for c_title, c_desc in cats_s9:
        p_c = tf_s9_2.add_paragraph()
        p_c.text = "• " + c_title + ": " + c_desc
        p_c.font.name = "Segoe UI"
        p_c.font.size = Pt(11)
        p_c.font.color.rgb = TEXT_MUTED
        p_c.space_after = Pt(5)

    # ==========================================
    # SLIDE 10: AI Wellness Assistant ("Talk to VYBE")
    # ==========================================
    s10 = prs.slides.add_slide(blank_layout)
    add_bg(s10, BG_LIGHT)
    add_header(s10, "Conversational Intelligence", "'Talk to VYBE' AI Wellness Assistant", "Empathetic, actionable dialogue designed to troubleshoot developer fatigue")

    assistant_features = [
        ("Software Engineer Strain Intent", "Understands questions about coding fatigue, wrist tension, lower back stiffness, and meeting stress.", Inches(0.8), Inches(2.0)),
        ("Embedded Action Launchers", "Messages include 1-click buttons (e.g. 'Start Seated Spinal Twist') that launch guided exercises immediately.", Inches(6.8), Inches(2.0)),
        ("Dual AI Engine Architecture", "Deterministic NLP engine operates 100% offline; seamlessly upgrades to Google Gemini 1.5 Flash when API key is set.", Inches(0.8), Inches(3.6)),
        ("Database Memory Integration", "Retrieves Prajakta's actual activities today and screen focus metrics directly from SQLite database.", Inches(6.8), Inches(3.6)),
        ("Empathetic Guardrails", "Strict workplace wellness focus. Avoids clinical diagnoses, prioritizing safe, practical physical relief.", Inches(0.8), Inches(5.2)),
        ("Quick Suggestion Chips", "1-click prompt chips: 'My neck is stiff', 'Feeling stressed before release', 'What have I done today?'", Inches(6.8), Inches(5.2))
    ]
    for title, desc, left, top in assistant_features:
        add_card(s10, left, top, Inches(5.7), Inches(1.35))
        tb = s10.shapes.add_textbox(left + Inches(0.3), top + Inches(0.2), Inches(5.1), Inches(0.95))
        tf = tb.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = "✦  " + title
        p1.font.name = "Segoe UI"
        p1.font.size = Pt(13)
        p1.font.bold = True
        p1.font.color.rgb = DEEP_TEAL
        p1.space_after = Pt(2)
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.name = "Segoe UI"
        p2.font.size = Pt(11)
        p2.font.color.rgb = TEXT_MUTED

    # ==========================================
    # SLIDE 11: Workday Smart Planner & Quiet Hours
    # ==========================================
    s11 = prs.slides.add_slide(blank_layout)
    add_bg(s11, BG_LIGHT)
    add_header(s11, "Temporal Scheduling", "Workday Smart Planner & Quiet Hours", "Harmonizing deep focus blocks with circadian rest windows")

    p_cards_s11 = [
        ("Circadian Rhythm Pacing", "Aligned with Ultradian Waves", "Human focus naturally follows a 90-minute ultradian rhythm. VYBE alternates 50-minute deep work blocks with 3 to 5-minute micro-breaks to prevent cognitive plateauing.", DEEP_TEAL),
        ("Quiet Hours Shielding", "Protected Lunch & Standups", "Prajakta specifies protected quiet hours (e.g. 12:30 PM - 1:30 PM). VYBE automatically suppresses all alarms and replaces them with an undisturbed lunch/rest block.", ACCENT_AMBER),
        ("Interactive Schedule Tracker", "Live Schedule Progression", "Each scheduled item displays its current status (Upcoming, Completed, or Skipped). Users can manually start planned breaks right from the timeline.", RGBColor(16, 185, 129))
    ]
    for i, (title, sub, body, accent) in enumerate(p_cards_s11):
        left = Inches(0.8 + i * 4.0)
        add_card(s11, left, Inches(2.0), Inches(3.7), Inches(4.7))
        tb = s11.shapes.add_textbox(left + Inches(0.3), Inches(2.3), Inches(3.1), Inches(4.1))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.name = "Segoe UI"
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = TEXT_DARK
        p.space_after = Pt(4)
        ps = tf.add_paragraph()
        ps.text = sub
        ps.font.name = "Segoe UI"
        ps.font.size = Pt(11)
        ps.font.bold = True
        ps.font.color.rgb = accent
        ps.space_after = Pt(12)
        pb = tf.add_paragraph()
        pb.text = body
        pb.font.name = "Segoe UI"
        pb.font.size = Pt(12)
        pb.font.color.rgb = TEXT_MUTED

    # ==========================================
    # SLIDE 12: Journey Analytics & Health Metrics
    # ==========================================
    s12 = prs.slides.add_slide(blank_layout)
    add_bg(s12, BG_LIGHT)
    add_header(s12, "Data Visualization", "Journey Analytics & Habit Formation", "Interactive charts transforming daily micro-breaks into long-term wellness data")

    analytics_cards = [
        ("Daily Activity Completion", "Bar Chart Visualization", "Tracks daily volume of completed wellness activities over 7-day and 30-day windows. Shows consistent adherence.", Inches(0.8), Inches(2.0)),
        ("Category Breakdown", "Donut Distribution", "Visualizes proportion of time invested across EyeCare, Movement, Relaxation, and Hydration to maintain balanced ergonomics.", Inches(6.8), Inches(2.0)),
        ("Acceptance & Efficacy Rate", "Key Performance Indicators", "Calculates % of reminder recommendations accepted vs snoozed, and total minutes spent actively resetting.", Inches(0.8), Inches(4.4)),
        ("Chronological History Log", "Detailed Audit Trail", "Complete chronological ledger showing activity title, duration, timestamp, completion status, and user rating.", Inches(6.8), Inches(4.4))
    ]
    for title, sub, desc, left, top in analytics_cards:
        add_card(s12, left, top, Inches(5.7), Inches(2.1))
        tb = s12.shapes.add_textbox(left + Inches(0.3), top + Inches(0.25), Inches(5.1), Inches(1.6))
        tf = tb.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.name = "Segoe UI"
        p1.font.size = Pt(15)
        p1.font.bold = True
        p1.font.color.rgb = TEXT_DARK
        p1.space_after = Pt(2)
        p2 = tf.add_paragraph()
        p2.text = sub
        p2.font.name = "Segoe UI"
        p2.font.size = Pt(11)
        p2.font.bold = True
        p2.font.color.rgb = DEEP_TEAL
        p2.space_after = Pt(8)
        p3 = tf.add_paragraph()
        p3.text = desc
        p3.font.name = "Segoe UI"
        p3.font.size = Pt(11)
        p3.font.color.rgb = TEXT_MUTED

    # ==========================================
    # SLIDE 13: Advantages for Software Engineers
    # ==========================================
    s13 = prs.slides.add_slide(blank_layout)
    add_bg(s13, BG_LIGHT)
    add_header(s13, "Value Proposition", "Key Advantages for Software Engineers", "Tangible benefits tailored for developers, engineering teams, and desk professionals")

    advs = [
        ("1. Sustained Developer Flow", "Unlike rigid timers that break concentration during coding, VYBE adapts to natural task boundaries and offers gentle, dismissable reminders.", Inches(0.8), Inches(2.0)),
        ("2. Prevention of Eye & Posture Fatigue", "Targeted 20-20-20 eye rests and seated yoga counteract the 8+ hours spent hunched over IDE code editors.", Inches(6.8), Inches(2.0)),
        ("3. 100% Privacy Respecting", "Zero invasive screen recording, zero keylogging, and zero camera feeds. All data is stored locally in SQLite with full user sovereignty.", Inches(0.8), Inches(3.6)),
        ("4. Micro-Commitments (30s - 2m)", "Every exercise is engineered to fit into 30 to 120-second windows, eliminating the friction of taking extended breaks.", Inches(6.8), Inches(3.6)),
        ("5. Acoustic Calm (Zero Startling)", "Replaces jarring buzzer alarms with soothing 432Hz Tibetan bowls and crystal bells that keep the nervous system regulated.", Inches(0.8), Inches(5.2)),
        ("6. Evidence-Based Habit Analytics", "Clear Recharts visualizations enable engineers to track their wellness adherence alongside code sprint cycles.", Inches(6.8), Inches(5.2))
    ]
    for title, desc, left, top in advs:
        add_card(s13, left, top, Inches(5.7), Inches(1.35))
        tb = s13.shapes.add_textbox(left + Inches(0.3), top + Inches(0.2), Inches(5.1), Inches(0.95))
        tf = tb.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = "✦  " + title
        p1.font.name = "Segoe UI"
        p1.font.size = Pt(13)
        p1.font.bold = True
        p1.font.color.rgb = DEEP_TEAL
        p1.space_after = Pt(2)
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.name = "Segoe UI"
        p2.font.size = Pt(11)
        p2.font.color.rgb = TEXT_MUTED

    # ==========================================
    # SLIDE 14: Privacy, Security & Data Sovereignty
    # ==========================================
    s14 = prs.slides.add_slide(blank_layout)
    add_bg(s14, BG_LIGHT)
    add_header(s14, "Security & Trust", "Privacy & Data Sovereignty by Principle", "Built strictly as an employee empowerment tool, never as surveillance software")

    pillars_s14 = [
        ("Zero Invasive Monitoring", "NO Spyware / NO Screenshots", "VYBE strictly avoids capturing screen contents, browser tabs, keystrokes, or webcam video. Only aggregates anonymous interaction timing.", DEEP_TEAL),
        ("Local-First Architecture", "SQLite Isolated Storage", "All user demographic data (Prajakta Yelure, DOB, age, role) and activity histories reside in local SQLite tables with salted password hashes.", ACCENT_CYAN),
        ("Full User Sovereignty", "1-Click Data Export & Wipe", "Users can download a complete JSON dump of their entire profile and tracking records, or permanently wipe their history with a single click.", RGBColor(16, 185, 129))
    ]
    for i, (title, sub, body, accent) in enumerate(pillars_s14):
        left = Inches(0.8 + i * 4.0)
        add_card(s14, left, Inches(2.0), Inches(3.7), Inches(4.7))
        tb = s14.shapes.add_textbox(left + Inches(0.3), Inches(2.3), Inches(3.1), Inches(4.1))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.name = "Segoe UI"
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = TEXT_DARK
        p.space_after = Pt(4)
        ps = tf.add_paragraph()
        ps.text = sub
        ps.font.name = "Segoe UI"
        ps.font.size = Pt(11)
        ps.font.bold = True
        ps.font.color.rgb = accent
        ps.space_after = Pt(12)
        pb = tf.add_paragraph()
        pb.text = body
        pb.font.name = "Segoe UI"
        pb.font.size = Pt(12)
        pb.font.color.rgb = TEXT_MUTED

    # ==========================================
    # SLIDE 15: Future Roadmap & Innovations
    # ==========================================
    s15 = prs.slides.add_slide(blank_layout)
    add_bg(s15, BG_LIGHT)
    add_header(s15, "Looking Ahead", "Strategic Vision & Future Innovations", "Expanding VYBE AI into an ubiquitous ambient workplace companion")

    roadmap_s15 = [
        ("On-Device AI Posture Cam", "MediaPipe Computer Vision", "Utilizes local on-device machine learning to detect 'tech neck' forward head tilt and slouching in real-time with 100% privacy.", DEEP_TEAL),
        ("The 'Wellness Garden'", "Gamified Virtual Succulent", "A soothing virtual desk plant that flourishes with each completed healthy break, creating positive emotional reinforcement.", ACCENT_CYAN),
        ("Calendar Micro-Slotting", "Google & Outlook Integration", "Automatically discovers 5-minute gaps between video conferences and schedules seamless micro-walks without calendar conflicts.", ACCENT_AMBER),
        ("Native OS Tray Companion", "Tauri / Windows System Tray", "Lightweight desktop app with native Windows notifications, global hotkeys (Ctrl+Shift+B), and circadian blue-light screen tinting.", RGBColor(168, 85, 247))
    ]
    for i, (title, sub, body, accent) in enumerate(roadmap_s15):
        row = i // 2
        col = i % 2
        left = Inches(0.8 + col * 5.9)
        top = Inches(2.0 + row * 2.45)
        add_card(s15, left, top, Inches(5.6), Inches(2.25))
        tb = s15.shapes.add_textbox(left + Inches(0.3), top + Inches(0.25), Inches(5.0), Inches(1.8))
        tf = tb.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.name = "Segoe UI"
        p1.font.size = Pt(15)
        p1.font.bold = True
        p1.font.color.rgb = accent
        p1.space_after = Pt(2)
        p2 = tf.add_paragraph()
        p2.text = sub
        p2.font.name = "Segoe UI"
        p2.font.size = Pt(11)
        p2.font.bold = True
        p2.font.color.rgb = TEXT_DARK
        p2.space_after = Pt(6)
        p3 = tf.add_paragraph()
        p3.text = body
        p3.font.name = "Segoe UI"
        p3.font.size = Pt(11)
        p3.font.color.rgb = TEXT_MUTED

    # ==========================================
    # SLIDE 16: Conclusion & System Access
    # ==========================================
    s16 = prs.slides.add_slide(blank_layout)
    add_bg(s16, DARK_NAVY)

    tb_c = s16.shapes.add_textbox(Inches(1.2), Inches(1.6), Inches(11.0), Inches(4.8))
    tf_c = tb_c.text_frame
    tf_c.word_wrap = True

    p = tf_c.paragraphs[0]
    p.text = "VYBE AI"
    p.font.name = "Segoe UI"
    p.font.size = Pt(40)
    p.font.bold = True
    p.font.color.rgb = RGBColor(255, 255, 255)
    p.space_after = Pt(6)

    pt = tf_c.add_paragraph()
    pt.text = "Your Work. Your Wellness. Your Rhythm."
    pt.font.name = "Segoe UI"
    pt.font.size = Pt(22)
    pt.font.color.rgb = LIGHT_TEAL
    pt.space_after = Pt(18)

    psummary = tf_c.add_paragraph()
    psummary.text = "✦  Active User Session: Prajakta Yelure | Software Engineer (Age 25)\n✦  Full-Stack Runtimes: Python 3.10 (FastAPI + SQLite) & Node.js (React 18 + Vite)\n✦  100% Automatic Screen Time & Idle Monitor with 45m Posture Alert\n✦  Multi-Sensory Notification Engine: 432Hz Harmonic Chimes + Floating Reminder Toast\n✦  All 27 Pytest Unit & Integration Tests Passing (100% Verified & Stable)"
    psummary.font.name = "Segoe UI"
    psummary.font.size = Pt(13)
    psummary.font.color.rgb = RGBColor(226, 232, 240)
    psummary.space_after = Pt(22)

    plink = tf_c.add_paragraph()
    plink.text = "Live Local Web Application: http://localhost:8000"
    plink.font.name = "Segoe UI"
    plink.font.size = Pt(16)
    plink.font.bold = True
    plink.font.color.rgb = ACCENT_CYAN

    prs.save(output_path)
    print(f"Personalized Deck for Prajakta Yelure saved to: {output_path}")

if __name__ == "__main__":
    create_prajakta_deck("VYBE_AI_Prajakta_Presentation.pptx")
