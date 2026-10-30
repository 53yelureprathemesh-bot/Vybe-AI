import os
import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_deck(output_path='VYBE_AI_Presentation.pptx'):
    prs = pptx.Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    DARK_NAVY = RGBColor(15, 23, 42)
    DEEP_TEAL = RGBColor(13, 148, 136)
    LIGHT_TEAL = RGBColor(20, 184, 166)
    BG_LIGHT = RGBColor(248, 250, 252)
    CARD_BG = RGBColor(255, 255, 255)
    TEXT_DARK = RGBColor(30, 41, 59)
    TEXT_MUTED = RGBColor(100, 116, 139)
    BORDER_COLOR = RGBColor(226, 232, 240)
    ACCENT_CYAN = RGBColor(6, 182, 212)
    ACCENT_AMBER = RGBColor(245, 158, 11)

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
        p_tag.font.name = 'Segoe UI'
        p_tag.font.size = Pt(11)
        p_tag.font.bold = True
        p_tag.font.color.rgb = DEEP_TEAL
        p_tag.space_after = Pt(4)

        p_title = tf.add_paragraph()
        p_title.text = title
        p_title.font.name = 'Segoe UI'
        p_title.font.size = Pt(24)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_DARK
        p_title.space_after = Pt(4)

        if subtitle:
            p_sub = tf.add_paragraph()
            p_sub.text = subtitle
            p_sub.font.name = 'Segoe UI'
            p_sub.font.size = Pt(13)
            p_sub.font.color.rgb = TEXT_MUTED

    # 1. Slide 1: Cover
    s1 = prs.slides.add_slide(blank_layout)
    add_bg(s1, DARK_NAVY)
    tb1 = s1.shapes.add_textbox(Inches(0.8), Inches(2.2), Inches(11.7), Inches(3.8))
    tf1 = tb1.text_frame
    tf1.word_wrap = True

    p1 = tf1.paragraphs[0]
    p1.text = 'VYBE AI'
    p1.font.name = 'Segoe UI'
    p1.font.size = Pt(48)
    p1.font.bold = True
    p1.font.color.rgb = RGBColor(255, 255, 255)
    p1.space_after = Pt(8)

    p2 = tf1.add_paragraph()
    p2.text = 'Your Work. Your Wellness. Your Rhythm.'
    p2.font.name = 'Segoe UI'
    p2.font.size = Pt(22)
    p2.font.color.rgb = LIGHT_TEAL
    p2.space_after = Pt(16)

    p3 = tf1.add_paragraph()
    p3.text = 'An intelligent, adaptive workplace wellness agent designed for developers and desk professionals.\nAutomated screen strain tracking, closed-loop AI recommendations, sound studio, and guided micro-breaks.'
    p3.font.name = 'Segoe UI'
    p3.font.size = Pt(14)
    p3.font.color.rgb = RGBColor(203, 213, 225)

    # 2. Slide 2: Problem Statement
    s2 = prs.slides.add_slide(blank_layout)
    add_bg(s2, BG_LIGHT)
    add_header(s2, 'Context & Problem Statement', 'The Modern Workplace Strain Crisis', 'Why conventional wellness initiatives fail desk workers')

    cards_s2 = [
        ('The Uninterrupted Screen Trap', '8-12 Hours Continuous Strain', 'Engineers, developers, and office staff spend 8 to 12 hours glued to screens with zero meaningful physical or visual rest.', ACCENT_AMBER),
        ('Physical & Cognitive Toll', 'CVS, RSI, and Mental Burnout', 'Computer Vision Syndrome (dry eye, blurred vision), tech neck, lumbar compression, and severe cognitive exhaustion.', RGBColor(239, 68, 68)),
        ('Failure of Generic Timers', 'Intrusive, Context-Blind Alarms', 'Pomodoro timers and generic alarm apps get dismissed because they interrupt deep flow and offer blunt, one-size-fits-all advice.', RGBColor(99, 102, 241))
    ]
    for i, (title, sub, body, accent) in enumerate(cards_s2):
        left = Inches(0.8 + i * 4.0)
        add_card(s2, left, Inches(2.0), Inches(3.7), Inches(4.7))
        tb = s2.shapes.add_textbox(left + Inches(0.3), Inches(2.3), Inches(3.1), Inches(4.1))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.name = 'Segoe UI'
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = TEXT_DARK
        p.space_after = Pt(4)
        ps = tf.add_paragraph()
        ps.text = sub
        ps.font.name = 'Segoe UI'
        ps.font.size = Pt(11)
        ps.font.bold = True
        ps.font.color.rgb = accent
        ps.space_after = Pt(12)
        pb = tf.add_paragraph()
        pb.text = body
        pb.font.name = 'Segoe UI'
        pb.font.size = Pt(12)
        pb.font.color.rgb = TEXT_MUTED

    # 3. Slide 3: Solution
    s3 = prs.slides.add_slide(blank_layout)
    add_bg(s3, BG_LIGHT)
    add_header(s3, 'Product Solution', 'Meet VYBE AI: Intelligent Workplace Wellness', 'Proactive, non-intrusive micro-interventions tuned to your actual work rhythm')

    features_s3 = [
        ('Automated Screen Tracking', 'Background sensors calculate continuous active focus vs idle duration without intrusive recording.', Inches(0.8), Inches(2.0)),
        ('Adaptive AI Decision Loop', 'Continuous Observe-Analyse-Decide-Act-Learn cycle tailors breaks to real strain levels.', Inches(6.8), Inches(2.0)),
        ('Micro-Break Activity Engine', 'Science-backed exercises (20-20-20 eye rest, desk yoga, box breathing, posture stretches).', Inches(0.8), Inches(3.5)),
        ('Notification Sound Studio', '5 harmonic 432Hz synthesized chimes + custom .mp3 audio uploader + ambient soundscapes.', Inches(6.8), Inches(3.5)),
        ('Conversational Wellness Coach', 'Talk to VYBE AI assistant answers wellness queries and launches actions in 1-click.', Inches(0.8), Inches(5.0)),
        ('Smart Workday Planner', 'Circadian-balanced timeline that automatically protects lunch hours and focus blocks.', Inches(6.8), Inches(5.0))
    ]
    for title, desc, left, top in features_s3:
        add_card(s3, left, top, Inches(5.7), Inches(1.25))
        tb = s3.shapes.add_textbox(left + Inches(0.3), top + Inches(0.18), Inches(5.1), Inches(0.9))
        tf = tb.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = '✦  ' + title
        p1.font.name = 'Segoe UI'
        p1.font.size = Pt(14)
        p1.font.bold = True
        p1.font.color.rgb = DEEP_TEAL
        p1.space_after = Pt(2)
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.name = 'Segoe UI'
        p2.font.size = Pt(11)
        p2.font.color.rgb = TEXT_MUTED

    # 4. Slide 4: 5-Stage Decision Loop
    s4 = prs.slides.add_slide(blank_layout)
    add_bg(s4, BG_LIGHT)
    add_header(s4, 'AI Core Engine', 'The 5-Stage Cybernetic Decision Loop', 'Observe, reason, act, and continuously adapt to user feedback')

    loop_steps = [
        ('1. OBSERVE', 'Data Ingestion', '• Demographic profile\n• Live screen tracking\n• Idle / away duration\n• Voluntary check-in', DEEP_TEAL),
        ('2. ANALYSE', 'Context & Strain', '• Screen strain (>=45m)\n• Sitting strain (>=50m)\n• Circadian energy dip\n• Time window (30s-10m)', ACCENT_CYAN),
        ('3. DECIDE', 'Scoring & Filter', '• Hard duration bounds\n• Fatigue category boost\n• Feedback weight score\n• Quiet-hours suppress', ACCENT_AMBER),
        ('4. ACT', 'Guided Run', '• Soothing toast banner\n• 432Hz audio chime\n• Guided countdown timer\n• Breathing visualizer', RGBColor(16, 185, 129)),
        ('5. LEARN', 'Reinforcement', '• 1-click user rating\n• +1.5 for helpful rest\n• -2.0 for unhelpful\n• Dynamic weight updates', RGBColor(139, 92, 246))
    ]
    for i, (stage, sub, body, col) in enumerate(loop_steps):
        left = Inches(0.8 + i * 2.4)
        add_card(s4, left, Inches(2.0), Inches(2.2), Inches(4.7))
        tb = s4.shapes.add_textbox(left + Inches(0.2), Inches(2.3), Inches(1.8), Inches(4.1))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = stage
        p.font.name = 'Segoe UI'
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = col
        p.space_after = Pt(2)
        ps = tf.add_paragraph()
        ps.text = sub
        ps.font.name = 'Segoe UI'
        ps.font.size = Pt(10)
        ps.font.bold = True
        ps.font.color.rgb = TEXT_DARK
        ps.space_after = Pt(8)
        pb = tf.add_paragraph()
        pb.text = body
        pb.font.name = 'Segoe UI'
        pb.font.size = Pt(10)
        pb.font.color.rgb = TEXT_MUTED

    # 5. Slide 5: Automatic Screen Tracker
    s5 = prs.slides.add_slide(blank_layout)
    add_bg(s5, BG_LIGHT)
    add_header(s5, 'Live Screen Monitoring', 'Automatic Screen Time & Idle Monitor', 'Tracking continuous focus strain without invasive spyware or keyloggers')

    add_card(s5, Inches(0.8), Inches(2.0), Inches(5.6), Inches(4.7))
    tb_l = s5.shapes.add_textbox(Inches(1.1), Inches(2.3), Inches(5.0), Inches(4.1))
    tf_l = tb_l.text_frame
    tf_l.word_wrap = True
    p = tf_l.paragraphs[0]
    p.text = 'Passive Background Activity Engine'
    p.font.name = 'Segoe UI'
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = TEXT_DARK
    p.space_after = Pt(8)
    pts_l = [
        'Passive Event Listeners: Monitors mousemove, keydown, touch, and tab visibilitychange.',
        'Active vs. Idle State: After 60 seconds without interaction, engine shifts to Idle or Away.',
        'Continuous Strain Alert: Exceeding 45 minutes of unbroken focus triggers a soothing break prompt.',
        'SQLite Session Sync: Periodically flushes active minutes to backend screen_sessions table.'
    ]
    for pt in pts_l:
        p_it = tf_l.add_paragraph()
        p_it.text = '✦ ' + pt
        p_it.font.name = 'Segoe UI'
        p_it.font.size = Pt(11)
        p_it.font.color.rgb = TEXT_MUTED
        p_it.space_after = Pt(6)

    add_card(s5, Inches(6.8), Inches(2.0), Inches(5.7), Inches(4.7))
    tb_r = s5.shapes.add_textbox(Inches(7.1), Inches(2.3), Inches(5.1), Inches(4.1))
    tf_r = tb_r.text_frame
    tf_r.word_wrap = True
    p = tf_r.paragraphs[0]
    p.text = 'Visual Indicators & Session Resets'
    p.font.name = 'Segoe UI'
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = TEXT_DARK
    p.space_after = Pt(8)
    pts_r = [
        'Navbar Focus Chip: Real-time focus badge (e.g., 14m Focus) always visible to the user.',
        'Dashboard Strain Progress: Animated progress ring visually counting toward the 45m threshold.',
        'Automatic Timer Reset: Completing any wellness exercise automatically resets continuous screen time.',
        'Daily Aggregations: Tracks total active screen hours vs. breaks taken for long-term health metrics.'
    ]
    for pt in pts_r:
        p_it = tf_r.add_paragraph()
        p_it.text = '✦ ' + pt
        p_it.font.name = 'Segoe UI'
        p_it.font.size = Pt(11)
        p_it.font.color.rgb = TEXT_MUTED
        p_it.space_after = Pt(6)

    # 6. Slide 6: Sound Studio
    s6 = prs.slides.add_slide(blank_layout)
    add_bg(s6, BG_LIGHT)
    add_header(s6, 'Sensory Design', 'Notification Sound Studio & Ambient Focus', 'Acoustically engineered sound design that soothes rather than startles')

    sounds = [
        ('Zen Tibetan Bowl', '432 Hz Healing Tuning', 'Deep harmonic resonance that calms the nervous system during intense work.', DEEP_TEAL),
        ('Soft Crystal Bell', '880 Hz High Clarity', 'Crystalline chime with gentle reverberant decay for elegant transitions.', ACCENT_CYAN),
        ('Calming Harp Arpeggio', 'Pentatonic Melody', 'Five-note melodic sequence that brings musical warmth to break reminders.', RGBColor(168, 85, 247)),
        ('Forest Water Drop', 'Natural Frequency Glide', 'Acoustic water drop with low-pass splash filter evoking natural tranquility.', RGBColor(34, 197, 94)),
        ('Gentle Temple Gong', '220 Hz Grounding Bell', 'Deep grounded resonance anchoring awareness back into the physical body.', ACCENT_AMBER),
        ('Custom Audio Upload', 'MP3 / WAV / OGG Files', 'Upload custom notification sounds, stored securely as persistent Data URLs.', RGBColor(236, 72, 153))
    ]
    for i, (title, sub, body, col) in enumerate(sounds):
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
        p1.font.name = 'Segoe UI'
        p1.font.size = Pt(14)
        p1.font.bold = True
        p1.font.color.rgb = col
        p1.space_after = Pt(2)
        p2 = tf.add_paragraph()
        p2.text = sub
        p2.font.name = 'Segoe UI'
        p2.font.size = Pt(10)
        p2.font.bold = True
        p2.font.color.rgb = TEXT_DARK
        p2.space_after = Pt(6)
        p3 = tf.add_paragraph()
        p3.text = body
        p3.font.name = 'Segoe UI'
        p3.font.size = Pt(10)
        p3.font.color.rgb = TEXT_MUTED

    # 7. Slide 7: Guided Activity Player
    s7 = prs.slides.add_slide(blank_layout)
    add_bg(s7, BG_LIGHT)
    add_header(s7, 'Interactive Execution', 'Guided Activity Player & Micro-Break Catalog', 'Science-backed desk interventions with real-time audio-visual guidance')

    add_card(s7, Inches(0.8), Inches(2.0), Inches(5.6), Inches(4.7))
    tb_s7 = s7.shapes.add_textbox(Inches(1.1), Inches(2.3), Inches(5.0), Inches(4.1))
    tf_s7 = tb_s7.text_frame
    tf_s7.word_wrap = True
    p = tf_s7.paragraphs[0]
    p.text = 'Player Capabilities & Controls'
    p.font.name = 'Segoe UI'
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = TEXT_DARK
    p.space_after = Pt(8)
    items_s7 = [
        'Timestamp Countdown Timer: Precise state timer ensuring exercises last the intended duration.',
        'Animated Breathing Ring: Pulsing visual guide timing Inhale (4s), Hold (4s), Exhale (4s), Hold (4s).',
        'Step-by-Step Instructions: Clear instructional prompts updated as the exercise advances.',
        'Interactive Controls: Pause, Resume, Restart, and Finish options so the user is always in control.',
        'Confetti & Feedback: Immediate positive reinforcement and 1-click star rating feeding the AI.'
    ]
    for it in items_s7:
        p_it = tf_s7.add_paragraph()
        p_it.text = '✦ ' + it
        p_it.font.name = 'Segoe UI'
        p_it.font.size = Pt(11)
        p_it.font.color.rgb = TEXT_MUTED
        p_it.space_after = Pt(5)

    add_card(s7, Inches(6.8), Inches(2.0), Inches(5.7), Inches(4.7))
    tb_s7_2 = s7.shapes.add_textbox(Inches(7.1), Inches(2.3), Inches(5.1), Inches(4.1))
    tf_s7_2 = tb_s7_2.text_frame
    tf_s7_2.word_wrap = True
    p = tf_s7_2.paragraphs[0]
    p.text = '6 Core Activity Categories'
    p.font.name = 'Segoe UI'
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = TEXT_DARK
    p.space_after = Pt(8)
    cats = [
        ('EyeCare (20-20-20 Rule)', 'Look 20 feet away for 20 seconds. Relieves ciliary eye strain.'),
        ('DeskYoga (Seated Posture)', 'Shoulder rolls, chest openers, and seated spinal twists.'),
        ('MindReset (Box Breathing)', '4-4-4-4 tactical breathing to clear acute stress.'),
        ('WalkBreak (Circulation)', '2-5 minute indoor/outdoor walking to stimulate blood flow.'),
        ('HydrateMate (Hydration)', 'Structured water intake with mindful sip guidance.'),
        ('PowerNap (Restorative NSDR)', '10-20 minute non-sleep deep rest audio pacing.')
    ]
    for c_title, c_desc in cats:
        p_c = tf_s7_2.add_paragraph()
        p_c.text = '• ' + c_title + ': ' + c_desc
        p_c.font.name = 'Segoe UI'
        p_c.font.size = Pt(11)
        p_c.font.color.rgb = TEXT_MUTED
        p_c.space_after = Pt(5)

    # 8. Slide 8: Conversational AI
    s8 = prs.slides.add_slide(blank_layout)
    add_bg(s8, BG_LIGHT)
    add_header(s8, 'Conversational AI', 'Talk to VYBE AI Wellness Assistant', 'Empathetic, actionable dialogue designed to troubleshoot desk fatigue instantly')

    a_features = [
        ('Intent Classification', 'Detects physical strain, stress, tired eyes, time constraints, or past activity queries.', Inches(0.8), Inches(2.0)),
        ('Actionable Launchers', 'Messages embed clickable Start 2-Min Eye Rest buttons that launch the interactive player.', Inches(6.8), Inches(2.0)),
        ('Dual AI Architecture', 'Deterministic NLP engine operates 100% offline; upgrades to Gemini 1.5 Flash when API key is set.', Inches(0.8), Inches(3.6)),
        ('Context-Aware Memory', 'Retrieves user activities today and active screen strain directly from SQLite database.', Inches(6.8), Inches(3.6)),
        ('Empathetic Guardrails', 'Non-judgmental workplace wellness focus with strict avoidance of clinical overreach.', Inches(0.8), Inches(5.2)),
        ('Suggestion Chips', '1-click prompt chips: My neck is stiff, Feeling stressed, What have I done today?', Inches(6.8), Inches(5.2))
    ]
    for title, desc, left, top in a_features:
        add_card(s8, left, top, Inches(5.7), Inches(1.35))
        tb = s8.shapes.add_textbox(left + Inches(0.3), top + Inches(0.2), Inches(5.1), Inches(0.95))
        tf = tb.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = '✦  ' + title
        p1.font.name = 'Segoe UI'
        p1.font.size = Pt(13)
        p1.font.bold = True
        p1.font.color.rgb = DEEP_TEAL
        p1.space_after = Pt(2)
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.name = 'Segoe UI'
        p2.font.size = Pt(11)
        p2.font.color.rgb = TEXT_MUTED

    # 9. Slide 9: Planner & Analytics
    s9 = prs.slides.add_slide(blank_layout)
    add_bg(s9, BG_LIGHT)
    add_header(s9, 'Planning & Analytics', 'Workday Smart Planner & Journey Analytics', 'Ultradian focus blocks with quiet-hours protection and visual habit tracking')

    p_cards = [
        ('Ultradian Workday Pacing', '90-Minute Rhythm Alignment', 'Alternates 50-minute deep work blocks with 3-5 minute micro-breaks to prevent cognitive plateauing.', DEEP_TEAL),
        ('Quiet Hours Shielding', 'Protected Lunch & Meetings', 'Automatically suppresses reminder alarms during user-designated quiet hours (e.g. 12:30-1:30 PM).', ACCENT_AMBER),
        ('Recharts Visual Dashboards', 'Trends & Category Donut', 'Interactive bar charts of daily completions and donut charts of category distribution over 7 and 30 days.', RGBColor(16, 185, 129))
    ]
    for i, (title, sub, body, accent) in enumerate(p_cards):
        left = Inches(0.8 + i * 4.0)
        add_card(s9, left, Inches(2.0), Inches(3.7), Inches(4.7))
        tb = s9.shapes.add_textbox(left + Inches(0.3), Inches(2.3), Inches(3.1), Inches(4.1))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.name = 'Segoe UI'
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = TEXT_DARK
        p.space_after = Pt(4)
        ps = tf.add_paragraph()
        ps.text = sub
        ps.font.name = 'Segoe UI'
        ps.font.size = Pt(11)
        ps.font.bold = True
        ps.font.color.rgb = accent
        ps.space_after = Pt(12)
        pb = tf.add_paragraph()
        pb.text = body
        pb.font.name = 'Segoe UI'
        pb.font.size = Pt(12)
        pb.font.color.rgb = TEXT_MUTED

    # 10. Slide 10: Technical Architecture
    s10 = prs.slides.add_slide(blank_layout)
    add_bg(s10, BG_LIGHT)
    add_header(s10, 'Full-Stack Architecture', 'System Implementation & Engineering Rigor', 'Production-grade architecture with sub-second response times and 100% test pass')

    tech_boxes = [
        ('Frontend (React 18 & TypeScript)', '• Vite bundler for rapid HMR\n• Tailwind CSS responsive design\n• Lucide Icons & Recharts\n• Web Audio API real-time synthesizer', Inches(0.8), Inches(2.0)),
        ('Backend (FastAPI & Python 3.10)', '• Async REST API architecture\n• Pydantic v2 strict schemas\n• Static SPA serving from /dist\n• Lifespan resource management', Inches(6.8), Inches(2.0)),
        ('AI Recommendation Loop', '• Deterministic multi-factor scoring\n• Hard duration constraint filtering\n• Closed-loop reinforcement learning\n• Offline-first + Gemini expansion', Inches(0.8), Inches(4.4)),
        ('Database & Verification', '• SQLite relational storage\n• Salted SHA-256 user authentication\n• Screen sessions & preferences schema\n• 27 / 27 Pytest unit & API tests passing', Inches(6.8), Inches(4.4))
    ]
    for title, body, left, top in tech_boxes:
        add_card(s10, left, top, Inches(5.7), Inches(2.1))
        tb = s10.shapes.add_textbox(left + Inches(0.3), top + Inches(0.25), Inches(5.1), Inches(1.6))
        tf = tb.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.name = 'Segoe UI'
        p1.font.size = Pt(15)
        p1.font.bold = True
        p1.font.color.rgb = DEEP_TEAL
        p1.space_after = Pt(6)
        p2 = tf.add_paragraph()
        p2.text = body
        p2.font.name = 'Segoe UI'
        p2.font.size = Pt(11)
        p2.font.color.rgb = TEXT_MUTED

    # 11. Slide 11: Privacy & Ethics
    s11 = prs.slides.add_slide(blank_layout)
    add_bg(s11, BG_LIGHT)
    add_header(s11, 'Trust & Privacy', 'Ethical AI & Data Sovereignty by Principle', 'Employee empowerment tool designed to protect privacy, never surveil')

    pillars = [
        ('Zero Invasive Spyware', 'NO Screenshots / NO Keystrokes', 'VYBE never records screen pixels, browser tabs, or key text. Only passive aggregate activity timing is evaluated.', DEEP_TEAL),
        ('Local-First Data Storage', 'Isolated SQLite Records', 'User demographic records (DOB, age, role) and activity histories reside in local SQLite storage with salted credentials.', ACCENT_CYAN),
        ('1-Click Export & Wipe', 'Complete User Sovereignty', 'Users can download a complete JSON dump of their records or permanently delete their history with zero remnants.', RGBColor(16, 185, 129))
    ]
    for i, (title, sub, body, accent) in enumerate(pillars):
        left = Inches(0.8 + i * 4.0)
        add_card(s11, left, Inches(2.0), Inches(3.7), Inches(4.7))
        tb = s11.shapes.add_textbox(left + Inches(0.3), Inches(2.3), Inches(3.1), Inches(4.1))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.name = 'Segoe UI'
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = TEXT_DARK
        p.space_after = Pt(4)
        ps = tf.add_paragraph()
        ps.text = sub
        ps.font.name = 'Segoe UI'
        ps.font.size = Pt(11)
        ps.font.bold = True
        ps.font.color.rgb = accent
        ps.space_after = Pt(12)
        pb = tf.add_paragraph()
        pb.text = body
        pb.font.name = 'Segoe UI'
        pb.font.size = Pt(12)
        pb.font.color.rgb = TEXT_MUTED

    # 12. Slide 12: Future Roadmap
    s12 = prs.slides.add_slide(blank_layout)
    add_bg(s12, BG_LIGHT)
    add_header(s12, 'Looking Ahead', 'Future Innovations & Product Roadmap', 'Expanding VYBE AI into an ambient workplace companion')

    roadmap = [
        ('On-Device AI Posture Cam', 'MediaPipe Machine Learning', 'Local computer vision detecting forward head tilt and slouching without transmitting video frames.', DEEP_TEAL),
        ('The Wellness Garden', 'Gamified Virtual Succulent', 'A soothing virtual plant that flourishes with each healthy break, providing positive emotional rewards.', ACCENT_CYAN),
        ('Calendar Micro-Slotting', 'Google & Outlook Integration', 'Scans for 5-minute meeting gaps to schedule natural micro-walks without interrupting calls.', ACCENT_AMBER),
        ('Native OS Tray Companion', 'Tauri / Windows System Tray', 'Lightweight system tray app with global hotkeys (Ctrl+Shift+B) and circadian blue-light screen tinting.', RGBColor(168, 85, 247))
    ]
    for i, (title, sub, body, accent) in enumerate(roadmap):
        row = i // 2
        col = i % 2
        left = Inches(0.8 + col * 5.9)
        top = Inches(2.0 + row * 2.45)
        add_card(s12, left, top, Inches(5.6), Inches(2.25))
        tb = s12.shapes.add_textbox(left + Inches(0.3), top + Inches(0.25), Inches(5.0), Inches(1.8))
        tf = tb.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.name = 'Segoe UI'
        p1.font.size = Pt(15)
        p1.font.bold = True
        p1.font.color.rgb = accent
        p1.space_after = Pt(2)
        p2 = tf.add_paragraph()
        p2.text = sub
        p2.font.name = 'Segoe UI'
        p2.font.size = Pt(11)
        p2.font.bold = True
        p2.font.color.rgb = TEXT_DARK
        p2.space_after = Pt(6)
        p3 = tf.add_paragraph()
        p3.text = body
        p3.font.name = 'Segoe UI'
        p3.font.size = Pt(11)
        p3.font.color.rgb = TEXT_MUTED

    # 13. Slide 13: Conclusion
    s13 = prs.slides.add_slide(blank_layout)
    add_bg(s13, DARK_NAVY)
    tb_c = s13.shapes.add_textbox(Inches(1.5), Inches(1.8), Inches(10.3), Inches(4.5))
    tf_c = tb_c.text_frame
    tf_c.word_wrap = True
    p = tf_c.paragraphs[0]
    p.text = 'VYBE AI'
    p.font.name = 'Segoe UI'
    p.font.size = Pt(40)
    p.font.bold = True
    p.font.color.rgb = RGBColor(255, 255, 255)
    p.space_after = Pt(6)
    pt = tf_c.add_paragraph()
    pt.text = 'Your Work. Your Wellness. Your Rhythm.'
    pt.font.name = 'Segoe UI'
    pt.font.size = Pt(22)
    pt.font.color.rgb = LIGHT_TEAL
    pt.space_after = Pt(20)
    psummary = tf_c.add_paragraph()
    psummary.text = '✦  Fully Functional End-to-End Product (Not a Mockup)\n✦  100% Automatic Screen Time & Idle Monitor\n✦  5 Handcrafted 432Hz Harmonic Chimes + Custom Audio Uploader\n✦  Closed-Loop AI Decision Engine with Reinforcement Learning\n✦  All 27 Pytest Unit & Integration Tests Passing (100% Green)'
    psummary.font.name = 'Segoe UI'
    psummary.font.size = Pt(14)
    psummary.font.color.rgb = RGBColor(226, 232, 240)
    psummary.space_after = Pt(24)
    plink = tf_c.add_paragraph()
    plink.text = 'Live Local Web Application: http://localhost:8000'
    plink.font.name = 'Segoe UI'
    plink.font.size = Pt(16)
    plink.font.bold = True
    plink.font.color.rgb = ACCENT_CYAN

    prs.save(output_path)
    print('Deck saved to:', output_path)

if __name__ == '__main__':
    create_deck('VYBE_AI_Presentation.pptx')
