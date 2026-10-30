import os

presentation_html = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VYBE AI — Executive Presentation | Prajakta Yelure</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #090d16;
      --bg-card: rgba(22, 30, 46, 0.85);
      --border-card: rgba(255, 255, 255, 0.08);
      --accent-emerald: #10b981;
      --accent-cyan: #06b6d4;
      --accent-indigo: #6366f1;
      --accent-amber: #f59e0b;
      --accent-rose: #f43f5e;
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --font-main: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-dark);
      color: var(--text-primary);
      font-family: var(--font-main);
      overflow: hidden;
      height: 100vh;
      width: 100vw;
      display: flex;
      flex-direction: column;
      user-select: none;
    }

    .bg-glow-1 {
      position: fixed;
      top: -10%;
      left: 15%;
      width: 50vw;
      height: 50vw;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%);
      filter: blur(80px);
      pointer-events: none;
      z-index: 0;
    }
    .bg-glow-2 {
      position: fixed;
      bottom: -15%;
      right: 10%;
      width: 55vw;
      height: 55vw;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.14) 0%, transparent 70%);
      filter: blur(90px);
      pointer-events: none;
      z-index: 0;
    }

    header {
      position: relative;
      z-index: 20;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 28px;
      background: rgba(10, 15, 25, 0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-card);
    }

    .brand-box {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
      box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
      font-weight: 900;
      font-size: 18px;
      color: #fff;
    }

    .brand-name {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.5px;
      background: linear-gradient(to right, #ffffff, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .badge-user {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 12px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      color: #34d399;
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn-header {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-card);
      border-radius: 8px;
      color: #cbd5e1;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-header:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      border-color: rgba(255, 255, 255, 0.2);
    }

    .btn-header.primary {
      background: linear-gradient(135deg, #10b981, #059669);
      border: none;
      color: #fff;
      box-shadow: 0 2px 10px rgba(16, 185, 129, 0.3);
    }

    .btn-header.primary:hover {
      background: linear-gradient(135deg, #34d399, #10b981);
    }

    .progress-bar-container {
      width: 100%;
      height: 3px;
      background: rgba(255, 255, 255, 0.05);
      position: relative;
      z-index: 20;
    }

    .progress-bar-fill {
      height: 100%;
      width: 6.25%;
      background: linear-gradient(to right, #10b981, #06b6d4, #6366f1);
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    main {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 40px;
      z-index: 10;
      overflow: hidden;
    }

    .slide-stage {
      width: 100%;
      max-width: 1280px;
      aspect-ratio: 16 / 9;
      position: relative;
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: 20px;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(16px);
      overflow: hidden;
      display: flex;
    }

    .slide {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      padding: 44px 54px;
      display: flex;
      flex-direction: column;
      opacity: 0;
      visibility: hidden;
      transform: translateX(40px) scale(0.98);
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      overflow-y: auto;
    }

    .slide.active {
      opacity: 1;
      visibility: visible;
      transform: translateX(0) scale(1);
    }

    .slide.prev {
      transform: translateX(-40px) scale(0.98);
      opacity: 0;
      visibility: hidden;
    }

    .slide-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      padding-bottom: 16px;
    }

    .slide-category {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--accent-emerald);
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .slide-title {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #fff;
      line-height: 1.2;
    }

    .slide-subtitle {
      font-size: 14px;
      color: var(--text-secondary);
      margin-top: 4px;
    }

    .slide-number-pill {
      font-size: 12px;
      font-weight: 700;
      font-family: var(--font-mono);
      padding: 4px 12px;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-card);
      color: var(--text-secondary);
    }

    .slide-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      height: 100%;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }

    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 14px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .card.highlight {
      background: rgba(16, 185, 129, 0.05);
      border-color: rgba(16, 185, 129, 0.25);
    }

    .card.accent-cyan {
      background: rgba(6, 182, 212, 0.05);
      border-color: rgba(6, 182, 212, 0.25);
    }

    .card.accent-indigo {
      background: rgba(99, 102, 241, 0.05);
      border-color: rgba(99, 102, 241, 0.25);
    }

    .card-title {
      font-size: 16px;
      font-weight: 700;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }

    .card-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.08);
      font-size: 16px;
    }

    .card-desc {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .card-list {
      list-style: none;
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .card-list li {
      font-size: 12.5px;
      color: #cbd5e1;
      display: flex;
      align-items: flex-start;
      gap: 8px;
      line-height: 1.4;
    }

    .card-list li::before {
      content: "✦";
      color: var(--accent-emerald);
      font-size: 11px;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .code-box {
      background: #06090e;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 14px;
      font-family: var(--font-mono);
      font-size: 12px;
      color: #38bdf8;
      overflow-x: auto;
      line-height: 1.6;
    }

    .code-comment {
      color: #64748b;
    }

    .code-keyword {
      color: #f43f5e;
    }

    .flow-steps {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 14px;
      position: relative;
    }

    .flow-step {
      flex: 1;
      text-align: center;
      padding: 14px 10px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      position: relative;
    }

    .flow-arrow {
      color: var(--accent-emerald);
      font-size: 18px;
      padding: 0 8px;
      flex-shrink: 0;
    }

    footer {
      position: relative;
      z-index: 20;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 32px;
      background: rgba(10, 15, 25, 0.9);
      border-top: 1px solid var(--border-card);
      backdrop-filter: blur(12px);
    }

    .footer-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .slide-counter {
      font-family: var(--font-mono);
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .footer-center {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .slide-dot {
      width: 8px;
      height: 8px;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.15);
      cursor: pointer;
      transition: all 0.25s ease;
    }

    .slide-dot.active {
      width: 24px;
      background: var(--accent-emerald);
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
    }

    .footer-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .btn-nav {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 18px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid var(--border-card);
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-nav:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-1px);
    }

    .btn-nav:disabled {
      opacity: 0.3;
      cursor: not-allowed;
      transform: none;
    }

    .overview-drawer {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(5, 8, 14, 0.94);
      backdrop-filter: blur(20px);
      z-index: 100;
      padding: 40px;
      display: none;
      flex-direction: column;
      overflow-y: auto;
    }

    .overview-drawer.open {
      display: flex;
    }

    .overview-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }

    .overview-card {
      background: #111827;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      height: 140px;
    }

    .overview-card:hover {
      border-color: var(--accent-emerald);
      transform: translateY(-4px);
      box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.3);
    }

    .overview-card.active {
      border-color: var(--accent-emerald);
      background: rgba(16, 185, 129, 0.08);
    }

    .video-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.9);
      backdrop-filter: blur(20px);
      z-index: 150;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }

    .video-modal.open {
      display: flex;
    }

    .video-container {
      width: 100%;
      max-width: 1000px;
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .notes-drawer {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      background: rgba(15, 23, 42, 0.96);
      backdrop-filter: blur(16px);
      border-top: 1px solid rgba(255, 255, 255, 0.12);
      padding: 20px 30px;
      transform: translateY(100%);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 30;
      max-height: 250px;
      overflow-y: auto;
    }

    .notes-drawer.open {
      transform: translateY(0);
    }
  </style>
</head>
<body>
  <div class="bg-glow-1"></div>
  <div class="bg-glow-2"></div>

  <header>
    <div class="brand-box">
      <div class="brand-logo">V</div>
      <div>
        <div class="brand-name">VYBE AI</div>
        <div style="font-size: 11px; color: var(--text-muted);">Executive Presentation Deck</div>
      </div>
      <div class="badge-user">
        <span>👤 Prajakta Yelure</span>
        <span style="opacity: 0.5;">|</span>
        <span>Software Engineer (Age 25)</span>
      </div>
    </div>

    <div class="header-controls">
      <button class="btn-header" onclick="toggleOverview()">
        <span>☷ Slide Grid (O)</span>
      </button>
      <button class="btn-header" onclick="toggleNotes()">
        <span>📝 Speaker Notes (S)</span>
      </button>
      <button class="btn-header" onclick="openVideoModal()">
        <span>▶ Watch Walkthrough Video</span>
      </button>
      <a href="/presentation/download" class="btn-header primary" download>
        <span>⬇ Download PowerPoint (.pptx)</span>
      </a>
      <a href="/" class="btn-header">
        <span>⚡ Open VYBE AI App</span>
      </a>
    </div>
  </header>

  <div class="progress-bar-container">
    <div class="progress-bar-fill" id="progressFill"></div>
  </div>

  <main>
    <div class="slide-stage" id="slideStage">
      
      <!-- SLIDE 1: Cover Slide -->
      <div class="slide active" data-slide="1">
        <div class="slide-header">
          <div>
            <div class="slide-category">✦ Executive System Presentation</div>
            <div class="slide-title">VYBE AI — Intelligent Workplace Wellness Agent</div>
            <div class="slide-subtitle">"Your Work. Your Wellness. Your Rhythm."</div>
          </div>
          <div class="slide-number-pill">01 / 16</div>
        </div>
        <div class="slide-body">
          <div class="grid-2">
            <div style="display: flex; flex-direction: column; justify-content: center; gap: 16px;">
              <div style="display: inline-block; padding: 6px 14px; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 999px; color: var(--accent-emerald); font-size: 13px; font-weight: 700; width: fit-content;">
                ⭐ Full-Stack Autonomous Wellness Companion
              </div>
              <h1 style="font-size: 34px; font-weight: 900; line-height: 1.2; letter-spacing: -0.5px;">
                Engineered for <span style="background: linear-gradient(135deg, #10b981, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Peak Cognitive Performance</span> and Daily Health
              </h1>
              <p style="color: var(--text-secondary); font-size: 15px; line-height: 1.6;">
                Built specifically for developers and desk professionals who spend 8+ hours immersed in deep coding flow. VYBE AI continuously monitors screen time, intelligently calculates fatigue, and delivers micro-interventions that sustain mental clarity without breaking focus.
              </p>
              <div style="display: flex; gap: 14px; margin-top: 8px;">
                <div class="card" style="flex: 1; padding: 14px;">
                  <div style="font-size: 11px; color: var(--text-muted); font-weight: 600;">PERSONALIZED FOR</div>
                  <div style="font-size: 16px; font-weight: 800; color: #fff; margin-top: 2px;">Prajakta Yelure</div>
                  <div style="font-size: 12px; color: var(--accent-emerald);">Age 25 • Software Engineer</div>
                </div>
                <div class="card" style="flex: 1; padding: 14px;">
                  <div style="font-size: 11px; color: var(--text-muted); font-weight: 600;">ACTIVE ARCHITECTURE</div>
                  <div style="font-size: 16px; font-weight: 800; color: #fff; margin-top: 2px;">Python 3.10 + Node.js</div>
                  <div style="font-size: 12px; color: var(--accent-cyan);">FastAPI • React 18 • SQLite</div>
                </div>
              </div>
            </div>

            <div class="card highlight" style="justify-content: center; gap: 14px; padding: 28px;">
              <div style="font-size: 14px; font-weight: 800; color: #fff; text-transform: uppercase; letter-spacing: 1px;">
                🚀 Core System Pillars
              </div>
              <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <div style="width: 28px; height: 28px; border-radius: 6px; background: rgba(16, 185, 129, 0.2); display: flex; align-items: center; justify-content: center; color: var(--accent-emerald); font-weight: 800;">1</div>
                  <div>
                    <div style="font-size: 13.5px; font-weight: 700; color: #fff;">100% Automatic Screen Time Tracking</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">Zero manual start/stop logs; passive idle and activity telemetry.</div>
                  </div>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <div style="width: 28px; height: 28px; border-radius: 6px; background: rgba(6, 182, 212, 0.2); display: flex; align-items: center; justify-content: center; color: var(--accent-cyan); font-weight: 800;">2</div>
                  <div>
                    <div style="font-size: 13.5px; font-weight: 700; color: #fff;">Multi-Sensory Notification Engine</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">Synthesized chimes, custom audio upload, and non-blocking modals.</div>
                  </div>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <div style="width: 28px; height: 28px; border-radius: 6px; background: rgba(99, 102, 241, 0.2); display: flex; align-items: center; justify-content: center; color: var(--accent-indigo); font-weight: 800;">3</div>
                  <div>
                    <div style="font-size: 13.5px; font-weight: 700; color: #fff;">Contextual AI Recommendation Loop</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">5-stage ranking adapting to Prajakta's fatigue and preferences.</div>
                  </div>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <div style="width: 28px; height: 28px; border-radius: 6px; background: rgba(245, 158, 11, 0.2); display: flex; align-items: center; justify-content: center; color: var(--accent-amber); font-weight: 800;">4</div>
                  <div>
                    <div style="font-size: 13.5px; font-weight: 700; color: #fff;">Interactive Guided Wellness Player</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">Synchronized 4-7-8 breathing ring, 20-20-20 eye care, and posture routines.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SLIDE 2: Problem Statement -->
      <div class="slide" data-slide="2">
        <div class="slide-header">
          <div>
            <div class="slide-category">✦ The Challenge</div>
            <div class="slide-title">The Software Engineer's Wellness Dilemma</div>
            <div class="slide-subtitle">Why developers neglect health during high-intensity sprint cycles</div>
          </div>
          <div class="slide-number-pill">02 / 16</div>
        </div>
        <div class="slide-body">
          <div class="grid-3" style="margin-bottom: 20px;">
            <div class="card">
              <div class="card-icon" style="color: #f43f5e; background: rgba(244, 63, 94, 0.15);">👁</div>
              <div class="card-title">Computer Vision Syndrome</div>
              <div class="card-desc">Blink rates drop by 66% during coding flow, causing dry eyes, corneal fatigue, and persistent migraine triggers.</div>
            </div>
            <div class="card">
              <div class="card-icon" style="color: #f59e0b; background: rgba(245, 158, 11, 0.15);">⚡</div>
              <div class="card-title">Cervical & Spinal Strain</div>
              <div class="card-desc">"Tech-neck" posture exerts over 45 lbs of pressure on the cervical spine during protracted debugging sessions.</div>
            </div>
            <div class="card">
              <div class="card-icon" style="color: #6366f1; background: rgba(99, 102, 241, 0.15);">🧠</div>
              <div class="card-title">Context-Switching Fatigue</div>
              <div class="card-desc">Rough, aggressive popups interrupt complex mental models, frustrating engineers into disabling reminders entirely.</div>
            </div>
          </div>
          <div class="card highlight">
            <div class="card-title" style="color: var(--accent-emerald);">The VYBE AI Solution</div>
            <div class="card-desc" style="font-size: 14px;">
              Instead of fighting a developer's flow state, VYBE AI works <strong>with</strong> the engineer's rhythm. By continuously gauging screen strain, it schedules harmonic micro-pauses (30 seconds to 3 minutes) that reset physical strain without clearing working memory.
            </div>
          </div>
        </div>
      </div>

      <!-- SLIDE 3: Tech Stack & Files -->
      <div class="slide" data-slide="3">
        <div class="slide-header">
          <div>
            <div class="slide-category">✦ Engineering Specifications</div>
            <div class="slide-title">Technology Stack & File Architecture</div>
            <div class="slide-subtitle">Modern runtimes, languages, and modular codebase breakdown</div>
          </div>
          <div class="slide-number-pill">03 / 16</div>
        </div>
        <div class="slide-body">
          <div class="grid-2">
            <div class="card">
              <div class="card-title"><span class="card-icon" style="color: var(--accent-cyan);">🐍</span> Python 3.10 Backend Runtimes</div>
              <ul class="card-list">
                <li><strong>FastAPI & Uvicorn:</strong> High-performance async ASGI server with automated OpenAPI docs.</li>
                <li><strong>SQLite 3 (`vybe_wellness.db`):</strong> Lightweight ACID database storing user profiles, screen sessions, and feedback.</li>
                <li><strong>Pydantic v2:</strong> Strict type validation for check-ins, user demographics, and sound preferences.</li>
                <li><strong>`recommendation_engine.py`:</strong> 5-stage closed-loop AI ranking algorithms.</li>
                <li><strong>`ai_agent.py`:</strong> Conversational LLM assistant for natural language wellness queries.</li>
              </ul>
            </div>
            <div class="card">
              <div class="card-title"><span class="card-icon" style="color: var(--accent-emerald);">⚡</span> Node.js 20+ Frontend Runtimes</div>
              <ul class="card-list">
                <li><strong>React 18 & Vite:</strong> Ultra-fast Hot Module Replacement (HMR) and optimized rollup production bundles.</li>
                <li><strong>Web Audio API:</strong> Native oscillator synthesis for harmonic, non-intrusive sound cues.</li>
                <li><strong>HTML5 Audio API:</strong> Ambient soundscape mixer (Rain, Cafe, Ocean, White Noise).</li>
                <li><strong>Lucide React Icons:</strong> Minimalist, modern SVG icon library.</li>
                <li><strong>Tailwind CSS 3:</strong> Responsive dark-mode styling with custom glassmorphism.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- SLIDE 4: How to Run -->
      <div class="slide" data-slide="4">
        <div class="slide-header">
          <div>
            <div class="slide-category">✦ DevOps & Execution</div>
            <div class="slide-title">How to Run the Website</div>
            <div class="slide-subtitle">Step-by-step developer and production execution commands</div>
          </div>
          <div class="slide-number-pill">04 / 16</div>
        </div>
        <div class="slide-body">
          <div class="grid-2">
            <div style="display: flex; flex-direction: column; gap: 14px;">
              <div class="card">
                <div style="font-size: 13px; font-weight: 700; color: var(--accent-emerald); margin-bottom: 6px;">STEP 1: LAUNCH FASTAPI BACKEND</div>
                <div class="code-box">
                  <span class="code-comment"># Activate environment & start Uvicorn</span><br>
                  <span class="code-keyword">cd</span> backend<br>
                  python -m uvicorn main:app --host 0.0.0.0 --port 8000
                </div>
              </div>
              <div class="card">
                <div style="font-size: 13px; font-weight: 700; color: var(--accent-cyan); margin-bottom: 6px;">STEP 2: RUN FRONTEND (DEV MODE)</div>
                <div class="code-box">
                  <span class="code-comment"># Start Vite dev server with proxy</span><br>
                  <span class="code-keyword">cd</span> frontend<br>
                  npm install && npm run dev
                </div>
              </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 14px;">
              <div class="card">
                <div style="font-size: 13px; font-weight: 700; color: var(--accent-indigo); margin-bottom: 6px;">STEP 3: SINGLE-COMMAND PRODUCTION</div>
                <div class="code-box">
                  <span class="code-comment"># Fast automated Windows runner</span><br>
                  .\run.bat
                </div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">
                  Mounts pre-built React SPA inside FastAPI at <code>http://localhost:8000</code>.
                </div>
              </div>
              <div class="card highlight">
                <div class="card-title">🌐 Live Access Endpoints</div>
                <ul class="card-list">
                  <li><strong>Web Application:</strong> <code>http://localhost:8000</code></li>
                  <li><strong>Interactive Presentation:</strong> <code>http://localhost:8000/presentation</code></li>
                  <li><strong>FastAPI Swagger Docs:</strong> <code>http://localhost:8000/docs</code></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SLIDE 5: Automatic Screen Time -->
      <div class="slide" data-slide="5">
        <div class="slide-header">
          <div>
            <div class="slide-category">✦ Passive Intelligence</div>
            <div class="slide-title">100% Automatic Screen Time & Idle Monitor</div>
            <div class="slide-subtitle">Seamless tracking with zero manual clicks required from the engineer</div>
          </div>
          <div class="slide-number-pill">05 / 16</div>
        </div>
        <div class="slide-body">
          <div class="grid-2">
            <div class="card">
              <div class="card-title">⚙️ Event-Driven Activity Engine</div>
              <div class="card-desc">
                Developers should not have to remember to click "Start Working". VYBE AI listens passively to user presence:
              </div>
              <ul class="card-list" style="margin-top: 12px;">
                <li><strong>DOM Telemetry:</strong> Monitors <code>mousemove</code>, <code>keydown</code>, and <code>scroll</code>.</li>
                <li><strong>Idle Auto-Pause:</strong> If inactive for >60 seconds, tracking halts automatically.</li>
                <li><strong>Tab Visibility Awareness:</strong> Detects when tab moves to background or window loses focus.</li>
                <li><strong>Heartbeat Synchronization:</strong> Transmits 10-second batched telemetry to <code>/api/screen-tracking/ping</code>.</li>
              </ul>
            </div>
            <div class="card accent-cyan">
              <div class="card-title">📊 Live Dashboard Metrics</div>
              <div style="display: flex; gap: 12px; margin-top: 10px;">
                <div class="card" style="flex: 1; text-align: center; background: rgba(0,0,0,0.3);">
                  <div style="font-size: 26px; font-weight: 800; color: var(--accent-emerald);">3h 42m</div>
                  <div style="font-size: 11px; color: var(--text-muted);">ACTIVE SCREEN TIME</div>
                </div>
                <div class="card" style="flex: 1; text-align: center; background: rgba(0,0,0,0.3);">
                  <div style="font-size: 26px; font-weight: 800; color: var(--accent-cyan);">91%</div>
                  <div style="font-size: 11px; color: var(--text-muted);">FOCUS SCORE</div>
                </div>
              </div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-top: 14px; line-height: 1.5;">
                Persisted in SQLite table <code>screen_sessions</code>, calculating cumulative daily exposure and triggering proactive wellness suggestions before eye strain sets in.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SLIDE 6: How Notifications Hit -->
      <div class="slide" data-slide="6">
        <div class="slide-header">
          <div>
            <div class="slide-category">✦ User Alerting Mechanics</div>
            <div class="slide-title">How Notifications Hit & Alert The User</div>
            <div class="slide-subtitle">Four non-disruptive, multi-sensory notification delivery channels</div>
          </div>
          <div class="slide-number-pill">06 / 16</div>
        </div>
        <div class="slide-body">
          <div class="grid-4">
            <div class="card highlight">
              <div class="card-title">1. Audio Chime</div>
              <div class="card-desc">
                Instant synthesizer chime generated locally via Web Audio API. Zero delay, zero network load, smooth harmonic frequencies.
              </div>
            </div>
            <div class="card accent-cyan">
              <div class="card-title">2. In-App Banner</div>
              <div class="card-desc">
                High-contrast glowing banner slides into view with countdown indicator, activity name, and target body area.
              </div>
            </div>
            <div class="card accent-indigo">
              <div class="card-title">3. Desktop Alert</div>
              <div class="card-desc">
                Native OS system tray notification via browser Web Notification API, reaching the user even when minimized.
              </div>
            </div>
            <div class="card">
              <div class="card-title">4. Modal Action</div>
              <div class="card-desc">
                One-click interactive launch: "Start Activity", "Snooze 5 Min", or "Swap Routine" without breaking application state.
              </div>
            </div>
          </div>
          <div class="flow-steps" style="margin-top: 24px;">
            <div class="flow-step">
              <div style="font-size: 11px; color: var(--accent-emerald); font-weight: 700;">STEP 1</div>
              <div style="font-size: 13px; font-weight: 600; color: #fff;">Timer Threshold Met</div>
            </div>
            <div class="flow-arrow">➔</div>
            <div class="flow-step">
              <div style="font-size: 11px; color: var(--accent-cyan); font-weight: 700;">STEP 2</div>
              <div style="font-size: 13px; font-weight: 600; color: #fff;">Sound Chime Synthesized</div>
            </div>
            <div class="flow-arrow">➔</div>
            <div class="flow-step">
              <div style="font-size: 11px; color: var(--accent-indigo); font-weight: 700;">STEP 3</div>
              <div style="font-size: 13px; font-weight: 600; color: #fff;">Interactive Alert Renders</div>
            </div>
            <div class="flow-arrow">➔</div>
            <div class="flow-step">
              <div style="font-size: 11px; color: var(--accent-amber); font-weight: 700;">STEP 4</div>
              <div style="font-size: 13px; font-weight: 600; color: #fff;">Engineer Takes 60s Micro-Break</div>
            </div>
          </div>
        </div>
      </div>

      <!-- SLIDE 7: Sound Studio -->
      <div class="slide" data-slide="7">
        <div class="slide-header">
          <div>
            <div class="slide-category">✦ Audio Engineering</div>
            <div class="slide-title">Notification Sound Studio & Ambient Soundscapes</div>
            <div class="slide-subtitle">Curated calming audio presets, custom sound uploads, and deep focus soundscapes</div>
          </div>
          <div class="slide-number-pill">07 / 16</div>
        </div>
        <div class="slide-body">
          <div class="grid-2">
            <div class="card">
              <div class="card-title">🎵 Built-in Chimes & Custom Audio Upload</div>
              <div class="card-desc">
                Engineers have unique sensory preferences. VYBE AI lets users test and customize alert tones:
              </div>
              <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px;">
                <span class="btn-header">🔔 Zen Temple Bell</span>
                <span class="btn-header">✨ Crystal Chime</span>
                <span class="btn-header">🪵 Soft Marimba</span>
                <span class="btn-header">🌊 Gentle Pulse</span>
              </div>
              <div style="margin-top: 14px; padding: 12px; background: rgba(16, 185, 129, 0.08); border: 1px dashed rgba(16, 185, 129, 0.3); border-radius: 8px;">
                <div style="font-size: 12px; font-weight: 700; color: var(--accent-emerald);">📁 Custom Sound Upload Support</div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                  Upload your own <code>.mp3</code> or <code>.wav</code> file. Preview immediately, adjust volume, and save to Prajakta's user profile.
                </div>
              </div>
            </div>
            <div class="card accent-indigo">
              <div class="card-title">🎧 Continuous Ambient Soundscapes</div>
              <div class="card-desc">
                Mask background office chatter and boost coding flow with built-in procedural audio generators:
              </div>
              <ul class="card-list" style="margin-top: 12px;">
                <li><strong>Gentle Rain:</strong> Calming white noise for deep refactoring.</li>
                <li><strong>Coffee Shop:</strong> Warm ambient chatter stimulating creativity.</li>
                <li><strong>Forest Breeze:</strong> Nature sounds to reduce cortisol levels.</li>
                <li><strong>Binaural White Noise:</strong> Acoustic focus masking for high-intensity debugging.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- SLIDE 8: AI Decision Loop -->
      <div class="slide" data-slide="8">
        <div class="slide-header">
          <div>
            <div class="slide-category">✦ Algorithmic Core</div>
            <div class="slide-title">Closed-Loop 5-Stage AI Decision Engine</div>
            <div class="slide-subtitle">How VYBE AI selects the mathematically optimal activity for Prajakta</div>
          </div>
          <div class="slide-number-pill">08 / 16</div>
        </div>
        <div class="slide-body">
          <div class="grid-3">
            <div class="card">
              <div class="card-title">Stage 1 & 2: Ingestion</div>
              <div class="card-desc">
                Ingests Prajakta's profile (Software Engineer, Age 25), current screen duration (e.g. 110 min), and recent fatigue score.
              </div>
            </div>
            <div class="card highlight">
              <div class="card-title">Stage 3 & 4: Multi-Criteria</div>
              <div class="card-desc">
                Filters 12+ activity library by time budget, desk constraints, recent skips, and calculates contextual priority weights.
              </div>
            </div>
            <div class="card accent-cyan">
              <div class="card-title">Stage 5: Feedback Update</div>
              <div class="card-desc">
                User thumbs-up/down immediately updates preference weights in SQLite, personalizing tomorrow's recommendations.
              </div>
            </div>
          </div>
          <div class="card" style="margin-top: 18px; padding: 14px 20px;">
            <div style="font-family: var(--font-mono); font-size: 12.5px; color: #a5f3fc;">
              PriorityScore = (Fatigue_Weight × ScreenHours) + (Category_Affinity × 1.5) - (Recent_Skip_Penalty × 0.8)
            </div>
          </div>
        </div>
      </div>

      <!-- SLIDE 9: Interactive Guided Activity Player -->
      <div class="slide" data-slide="9">
        <div class="slide-header">
          <div>
            <div class="slide-category">✦ Active Wellness Execution</div>
            <div class="slide-title">Guided Interactive Activity Player</div>
            <div class="slide-subtitle">Engaging countdown timer, circular breathing ring, and step-by-step cue cards</div>
          </div>
          <div class="slide-number-pill">09 / 16</div>
        </div>
        <div class="slide-body">
          <div class="grid-2">
            <div class="card highlight" style="align-items: center; justify-content: center; text-align: center; padding: 24px;">
              <div style="width: 140px; height: 140px; border-radius: 50%; border: 6px solid var(--accent-emerald); display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 0 25px rgba(16, 185, 129, 0.3);">
                <div style="font-size: 32px; font-weight: 900; font-family: var(--font-mono); color: #fff;">00:60</div>
                <div style="font-size: 11px; color: var(--accent-emerald); font-weight: 700;">INHALE (4s)</div>
              </div>
              <div style="font-size: 16px; font-weight: 700; color: #fff; margin-top: 16px;">Box Breathing 4-7-8</div>
              <div style="font-size: 12px; color: var(--text-secondary);">Calms the central nervous system & lowers heart rate variability.</div>
            </div>
            <div class="card">
              <div class="card-title">🧘 4 Specialized Activity Modalities</div>
              <ul class="card-list">
                <li><strong>20-20-20 Eye Care:</strong> Look at an object 20 feet away for 20 seconds to reset ciliary eye muscles.</li>
                <li><strong>Cervical Neck & Shoulder Rolls:</strong> Relieves thoracic strain from laptop hunching.</li>
                <li><strong>Box Breathing / 4-7-8 Pranayama:</strong> Clinical oxygenation technique clearing cognitive fog.</li>
                <li><strong>Desk Hip & Hamstring Opener:</strong> Counters pelvic tilt caused by hours in office chairs.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- SLIDE 10: Talk to VYBE -->
      <div class="slide" data-slide="10">
        <div class="slide-header">
          <div>
            <div class="slide-category">✦ Conversational Assistant</div>
            <div class="slide-title">'Talk to VYBE' — AI Wellness Coach</div>
            <div class="slide-subtitle">Natural language conversational support grounded in developer wellness science</div>
          </div>
          <div class="slide-number-pill">10 / 16</div>
        </div>
        <div class="slide-body">
          <div class="grid-2">
            <div class="card">
              <div class="card-title">💬 Instant Quick-Prompt Pills</div>
              <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
                <div style="padding: 10px 14px; background: rgba(255,255,255,0.05); border-radius: 8px; font-size: 12.5px; color: #e2e8f0;">
                  "I've been debugging for 3 hours and my eyes sting. What should I do?"
                </div>
                <div style="padding: 10px 14px; background: rgba(255,255,255,0.05); border-radius: 8px; font-size: 12.5px; color: #e2e8f0;">
                  "Feeling a mid-afternoon energy dip right after lunch."
                </div>
                <div style="padding: 10px 14px; background: rgba(255,255,255,0.05); border-radius: 8px; font-size: 12.5px; color: #e2e8f0;">
                  "Give me a quick 2-minute upper body stretch I can do at my desk."
                </div>
              </div>
            </div>
            <div class="card accent-cyan">
              <div class="card-title">🤖 Intelligent System Responses</div>
              <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
                VYBE AI replies with empathetic, concise, actionable advice and automatically attaches an interactive activity launcher directly inside the chat window. Prajakta can launch the suggested stretch with one click right from the chat.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SLIDE 11: Workday Planner -->
      <div class="slide" data-slide="11">
        <div class="slide-header">
          <div>
            <div class="slide-category">✦ Calendar Synchronization</div>
            <div class="slide-title">Workday Smart Break Planner & Quiet Hours</div>
            <div class="slide-subtitle">Structured wellness schedule harmonized around Prajakta's engineering workday</div>
          </div>
          <div class="slide-number-pill">11 / 16</div>
        </div>
        <div class="slide-body">
          <div class="grid-3">
            <div class="card">
              <div style="font-size: 11px; color: var(--accent-emerald); font-weight: 700;">10:30 AM</div>
              <div style="font-size: 15px; font-weight: 700; color: #fff; margin-top: 4px;">Morning Alignment</div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-top: 6px;">2-min wrist & posture stretch before daily standup.</div>
            </div>
            <div class="card highlight">
              <div style="font-size: 11px; color: var(--accent-cyan); font-weight: 700;">02:30 PM</div>
              <div style="font-size: 15px; font-weight: 700; color: #fff; margin-top: 4px;">Post-Lunch Reset</div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-top: 6px;">Hydration checkpoint & 4-7-8 breathing to counter afternoon slump.</div>
            </div>
            <div class="card">
              <div style="font-size: 11px; color: var(--accent-indigo); font-weight: 700;">04:45 PM</div>
              <div style="font-size: 15px; font-weight: 700; color: #fff; margin-top: 4px;">Late Sprint Decompression</div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-top: 6px;">Palming eye relaxation before closing pull requests.</div>
            </div>
          </div>
          <div class="card accent-indigo" style="margin-top: 18px; padding: 16px;">
            <div class="card-title">🔕 "Quiet Hours" & Focus Sprint Protection</div>
            <div class="card-desc">
              During high-stakes deployments, client presentations, or tight coding deadlines, Prajakta can enable Quiet Hours to mute all notifications with a single toggle.
            </div>
          </div>
        </div>
      </div>

      <!-- SLIDE 12: Analytics -->
      <div class="slide" data-slide="12">
        <div class="slide-header">
          <div>
            <div class="slide-category">✦ Quantified Self</div>
            <div class="slide-title">Journey Analytics & Health Metrics</div>
            <div class="slide-subtitle">Daily trends, activity completion ratios, and exportable telemetry</div>
          </div>
          <div class="slide-number-pill">12 / 16</div>
        </div>
        <div class="slide-body">
          <div class="grid-4" style="margin-bottom: 20px;">
            <div class="card" style="text-align: center;">
              <div style="font-size: 26px; font-weight: 800; color: var(--accent-emerald);">88%</div>
              <div style="font-size: 11px; color: var(--text-muted);">OVERALL WELLNESS INDEX</div>
            </div>
            <div class="card" style="text-align: center;">
              <div style="font-size: 26px; font-weight: 800; color: var(--accent-cyan);">14</div>
              <div style="font-size: 11px; color: var(--text-muted);">MICRO-BREAKS COMPLETED</div>
            </div>
            <div class="card" style="text-align: center;">
              <div style="font-size: 26px; font-weight: 800; color: var(--accent-indigo);">2.4 L</div>
              <div style="font-size: 11px; color: var(--text-muted);">HYDRATION LOGGED</div>
            </div>
            <div class="card" style="text-align: center;">
              <div style="font-size: 26px; font-weight: 800; color: var(--accent-amber);">94%</div>
              <div style="font-size: 11px; color: var(--text-muted);">FLOW RETENTION RATE</div>
            </div>
          </div>
          <div class="card highlight">
            <div class="card-title">📁 Complete Data Portability</div>
            <div class="card-desc">
              Users can export their complete wellness logs, screen telemetry, and feedback records to JSON or CSV anytime via <code>/api/export</code>.
            </div>
          </div>
        </div>
      </div>

      <!-- SLIDE 13: Key Advantages -->
      <div class="slide" data-slide="13">
        <div class="slide-header">
          <div>
            <div class="slide-category">✦ Value Proposition</div>
            <div class="slide-title">Key Advantages for Software Engineers</div>
            <div class="slide-subtitle">Tangible cognitive and physical ROI for technology professionals</div>
          </div>
          <div class="slide-number-pill">13 / 16</div>
        </div>
        <div class="slide-body">
          <div class="grid-2">
            <div class="card">
              <div class="card-title">🚀 Sustained Code Velocity</div>
              <div class="card-desc">
                Fatigued engineers commit 2.3x more regression bugs. Regular 60-second micro-resets preserve mental clarity, leading to cleaner architectures and faster PR merges.
              </div>
            </div>
            <div class="card highlight">
              <div class="card-title">🛡️ Prevention of Repetitive Strain Injury</div>
              <div class="card-desc">
                Targeted wrist flexor and median nerve glides prevent carpal tunnel syndrome, protecting an engineer's career longevity.
              </div>
            </div>
            <div class="card accent-cyan">
              <div class="card-title">🎯 Zero Interruption Guarantees</div>
              <div class="card-desc">
                Quiet hours and non-blocking toast designs respect focus mode. No obnoxious modal takeovers that break terminal commands.
              </div>
            </div>
            <div class="card accent-indigo">
              <div class="card-title">🧘 Mental Recharge at the Desk</div>
              <div class="card-desc">
                No gym clothes or equipment required. 100% of routines are designed to be performed seated or standing right beside your desk.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SLIDE 14: Privacy & Ethics -->
      <div class="slide" data-slide="14">
        <div class="slide-header">
          <div>
            <div class="slide-category">✦ Trust & Compliance</div>
            <div class="slide-title">Privacy, Trust & Ethical AI by Principle</div>
            <div class="slide-subtitle">Local-first data governance built with developer respect</div>
          </div>
          <div class="slide-number-pill">14 / 16</div>
        </div>
        <div class="slide-body">
          <div class="grid-3">
            <div class="card">
              <div class="card-title">🔒 100% Local-First Storage</div>
              <div class="card-desc">
                All telemetry and profile info reside inside your local SQLite database. No external ad tracking or corporate data brokerage.
              </div>
            </div>
            <div class="card highlight">
              <div class="card-title">🚫 Zero Keystroke Logging</div>
              <div class="card-desc">
                VYBE AI never captures typed keystrokes, clipboard contents, or code files. It only tracks presence velocity timestamps.
              </div>
            </div>
            <div class="card accent-cyan">
              <div class="card-title">🗑️ Right to be Forgotten</div>
              <div class="card-desc">
                1-click database reset endpoint <code>/api/demo/reset</code> permanently purges activity history with zero lingering traces.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SLIDE 15: Strategic Roadmap -->
      <div class="slide" data-slide="15">
        <div class="slide-header">
          <div>
            <div class="slide-category">✦ Future Vision</div>
            <div class="slide-title">Strategic Roadmap & Future Innovations</div>
            <div class="slide-subtitle">Expanding VYBE AI into an ubiquitous developer companion</div>
          </div>
          <div class="slide-number-pill">15 / 16</div>
        </div>
        <div class="slide-body">
          <div class="grid-3">
            <div class="card highlight">
              <div style="font-size: 11px; color: var(--accent-emerald); font-weight: 700;">PHASE 1 (COMPLETED)</div>
              <div style="font-size: 16px; font-weight: 800; color: #fff; margin-top: 4px;">Full-Stack MVP</div>
              <ul class="card-list" style="margin-top: 10px;">
                <li>Python FastAPI & React SPA</li>
                <li>Screen tracking & Idle sensor</li>
                <li>Sound Studio & Custom Audio</li>
                <li>Interactive Web Presentation</li>
              </ul>
            </div>
            <div class="card accent-cyan">
              <div style="font-size: 11px; color: var(--accent-cyan); font-weight: 700;">PHASE 2 (Q1)</div>
              <div style="font-size: 16px; font-weight: 800; color: #fff; margin-top: 4px;">IDE Extensions</div>
              <ul class="card-list" style="margin-top: 10px;">
                <li>VS Code & JetBrains Plugin</li>
                <li>Triggers break on Git Commit</li>
                <li>Status bar fatigue meter</li>
              </ul>
            </div>
            <div class="card accent-indigo">
              <div style="font-size: 11px; color: var(--accent-indigo); font-weight: 700;">PHASE 3 (Q2)</div>
              <div style="font-size: 16px; font-weight: 800; color: #fff; margin-top: 4px;">Biometric Wearables</div>
              <ul class="card-list" style="margin-top: 10px;">
                <li>Apple Watch & Garmin HRV</li>
                <li>Real-time stress spike alerts</li>
                <li>Automatic quiet hour detection</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- SLIDE 16: Conclusion & Links -->
      <div class="slide" data-slide="16">
        <div class="slide-header">
          <div>
            <div class="slide-category">✦ Final Summary & Access</div>
            <div class="slide-title">Conclusion & Live Demonstration Access</div>
            <div class="slide-subtitle">Ready for immediate testing and production deployment</div>
          </div>
          <div class="slide-number-pill">16 / 16</div>
        </div>
        <div class="slide-body">
          <div class="grid-2">
            <div class="card highlight">
              <div class="card-title">🎉 Project Summary for Prajakta Yelure</div>
              <p style="font-size: 13.5px; color: #cbd5e1; line-height: 1.6;">
                VYBE AI provides a production-grade, aesthetically pleasing, and scientifically grounded workplace wellness ecosystem. By unifying passive screen monitoring, smart audio chimes, customized sound uploads, and context-aware micro-interventions, software engineers can thrive without sacrificing health.
              </p>
              <div style="display: flex; gap: 10px; margin-top: 18px;">
                <a href="/" class="btn-header primary" style="padding: 10px 18px; font-size: 13px;">⚡ Open Web App</a>
                <button onclick="openVideoModal()" class="btn-header" style="padding: 10px 18px; font-size: 13px;">▶ Play Video</button>
                <a href="/presentation/download" class="btn-header" style="padding: 10px 18px; font-size: 13px;">⬇ Download PPTX</a>
              </div>
            </div>
            <div class="card">
              <div class="card-title">🔗 Quick Reference Links</div>
              <ul class="card-list" style="margin-top: 10px;">
                <li><strong>Live App:</strong> <code>http://localhost:8000</code></li>
                <li><strong>Interactive Presentation:</strong> <code>http://localhost:8000/presentation</code></li>
                <li><strong>PowerPoint File:</strong> <code>VYBE_AI_Prajakta_Presentation.pptx</code></li>
                <li><strong>Video Walkthrough:</strong> <code>vybe_ai_walkthrough_prajakta.mp4</code></li>
                <li><strong>API Swagger Docs:</strong> <code>http://localhost:8000/docs</code></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Notes Drawer -->
    <div class="notes-drawer" id="notesDrawer">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <div style="font-size: 14px; font-weight: 800; color: var(--accent-emerald);">📝 Speaker Notes & Architectural Highlights</div>
        <button onclick="toggleNotes()" style="background: none; border: none; color: #94a3b8; font-size: 16px; cursor: pointer;">✕</button>
      </div>
      <div id="notesContent" style="font-size: 13px; color: #cbd5e1; line-height: 1.6;">
        Welcome to VYBE AI! Use your keyboard arrow keys (Left / Right) or Spacebar to navigate smoothly through the deck.
      </div>
    </div>
  </main>

  <!-- Bottom Control Bar -->
  <footer>
    <div class="footer-left">
      <div class="slide-counter" id="slideCounter">Slide 1 of 16</div>
      <button class="btn-nav" onclick="toggleNotes()" style="padding: 5px 12px; font-size: 12px;">
        <span>📝 Notes</span>
      </button>
    </div>

    <div class="footer-center" id="dotsContainer"></div>

    <div class="footer-right">
      <button class="btn-nav" id="prevBtn" onclick="prevSlide()" disabled>
        <span>◀ Previous</span>
      </button>
      <button class="btn-nav" id="nextBtn" onclick="nextSlide()">
        <span>Next ▶</span>
      </button>
      <button class="btn-nav" onclick="toggleFullscreen()">
        <span>⛶</span>
      </button>
    </div>
  </footer>

  <!-- Overview Grid Drawer -->
  <div class="overview-drawer" id="overviewDrawer">
    <div class="overview-header">
      <div>
        <h2 style="font-size: 24px; font-weight: 800; color: #fff;">Slide Overview (16 Slides)</h2>
        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">Click any slide to jump directly to it</div>
      </div>
      <button class="btn-nav" onclick="toggleOverview()" style="padding: 8px 18px;">✕ Close Overview</button>
    </div>
    <div class="overview-grid" id="overviewGrid"></div>
  </div>

  <!-- Video Walkthrough Modal -->
  <div class="video-modal" id="videoModal">
    <div class="video-container">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; background: rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.1);">
        <div style="font-weight: 700; font-size: 15px; color: #fff;">🎬 VYBE AI — Video Walkthrough for Prajakta Yelure</div>
        <button onclick="closeVideoModal()" style="background: none; border: none; color: #94a3b8; font-size: 18px; cursor: pointer;">✕</button>
      </div>
      <div style="padding: 10px; background: #000; display: flex; justify-content: center;">
        <video id="walkthroughVideo" controls style="width: 100%; max-height: 70vh; border-radius: 8px;" src="/presentation/video">
          Your browser does not support the video tag.
        </video>
      </div>
      <div style="padding: 12px 20px; font-size: 12px; color: var(--text-muted); display: flex; justify-content: space-between;">
        <span>Recorded automatically in high-definition 1280x800 H.264 format</span>
        <a href="/presentation/video" download class="btn-header" style="font-size: 11px; padding: 4px 10px;">⬇ Download MP4 Video</a>
      </div>
    </div>
  </div>

  <script>
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    let currentSlide = 1;

    const speakerNotes = {
      1: "Slide 1 introduces VYBE AI as a complete, personalized wellness companion designed for Prajakta Yelure, a 25-year-old software engineer. Highlight the core problem of long developer screen hours and how VYBE AI continuously assists without breaking concentration.",
      2: "Slide 2 outlines the clinical and physical reality for software engineers: 66% drop in blink rates leading to Computer Vision Syndrome, cervical spine compression from tech-neck posture, and context switching fatigue.",
      3: "Slide 3 details the technical foundation: Python 3.10 with FastAPI for lightning-fast async backend endpoints, SQLite for local-first database persistence, and Node.js 20+ with React 18 and Web Audio API for synthetic chimes.",
      4: "Slide 4 provides copy-pasteable execution commands for both development (Vite + Uvicorn) and production (run.bat standalone server). Mention that the frontend SPA is automatically served on port 8000.",
      5: "Slide 5 covers the 100% automatic screen tracking mechanism. No manual logging is needed. Event listeners on mouse and keyboard sync telemetry via 10-second heartbeat pings.",
      6: "Slide 6 breaks down the 4 distinct notification delivery channels: Instant local Web Audio synthesis, glowing in-app banners, native OS desktop notifications, and non-blocking action modals.",
      7: "Slide 7 highlights sensory customizability: 5 built-in harmonic chime presets, custom MP3/WAV upload capability with instant preview, and 4 soothing ambient soundscapes.",
      8: "Slide 8 explains the closed-loop 5-stage AI decision algorithm. Priority score calculates fatigue, category affinity, and penalty weights based on user feedback.",
      9: "Slide 9 presents the interactive guided activity player with live animated countdown, synchronized 4-7-8 box breathing ring, and step-by-step ergonomic cues.",
      10: "Slide 10 demonstrates the 'Talk to VYBE' AI assistant, featuring conversational support and quick prompt pills tailored for developers.",
      11: "Slide 11 covers the workday break planner spanning 9 AM to 6 PM with Quiet Hours support for deep work blocks.",
      12: "Slide 12 reviews quantified self journey analytics, including daily screen time trends, focus scores, and 1-click JSON/CSV data export.",
      13: "Slide 13 summarizes key advantages for software engineers: sustained code velocity, prevention of RSI, zero friction, and reduced late-afternoon syntax errors.",
      14: "Slide 14 reinforces privacy by design: 100% local SQLite storage, zero keystroke logging, and complete data purging controls.",
      15: "Slide 15 charts the strategic roadmap: Phase 1 MVP complete; Phase 2 VS Code extensions; Phase 3 biometric wearable integration.",
      16: "Slide 16 provides demonstration links to the live application, interactive presentation, PowerPoint file download, and walkthrough video."
    };

    const dotsContainer = document.getElementById('dotsContainer');
    for (let i = 1; i <= totalSlides; i++) {
      const dot = document.createElement('div');
      dot.className = `slide-dot ${i === 1 ? 'active' : ''}`;
      dot.onclick = () => goToSlide(i);
      dotsContainer.appendChild(dot);
    }

    const overviewGrid = document.getElementById('overviewGrid');
    slides.forEach((slide, idx) => {
      const num = idx + 1;
      const title = slide.querySelector('.slide-title')?.innerText || `Slide ${num}`;
      const cat = slide.querySelector('.slide-category')?.innerText || 'VYBE AI';
      const card = document.createElement('div');
      card.className = `overview-card ${num === 1 ? 'active' : ''}`;
      card.innerHTML = `
        <div style="font-size: 10px; color: var(--accent-emerald); font-weight: 700; text-transform: uppercase;">${cat}</div>
        <div style="font-size: 13px; font-weight: 700; color: #fff; margin-top: 6px; line-height: 1.3;">${title}</div>
        <div style="margin-top: auto; font-size: 11px; font-family: var(--font-mono); color: var(--text-muted);">Slide ${num} of ${totalSlides}</div>
      `;
      card.onclick = () => {
        goToSlide(num);
        toggleOverview();
      };
      overviewGrid.appendChild(card);
    });

    function updateSlide() {
      slides.forEach((slide, index) => {
        const slideNum = index + 1;
        slide.classList.remove('active', 'prev');
        if (slideNum === currentSlide) {
          slide.classList.add('active');
        } else if (slideNum < currentSlide) {
          slide.classList.add('prev');
        }
      });

      const progressPercent = (currentSlide / totalSlides) * 100;
      document.getElementById('progressFill').style.width = `${progressPercent}%`;
      document.getElementById('slideCounter').innerText = `Slide ${currentSlide} of ${totalSlides}`;
      document.getElementById('prevBtn').disabled = (currentSlide === 1);
      document.getElementById('nextBtn').disabled = (currentSlide === totalSlides);

      document.querySelectorAll('.slide-dot').forEach((dot, idx) => {
        dot.classList.toggle('active', idx + 1 === currentSlide);
      });

      document.querySelectorAll('.overview-card').forEach((card, idx) => {
        card.classList.toggle('active', idx + 1 === currentSlide);
      });

      document.getElementById('notesContent').innerText = speakerNotes[currentSlide] || "No notes available for this slide.";
    }

    function nextSlide() {
      if (currentSlide < totalSlides) {
        currentSlide++;
        updateSlide();
      }
    }

    function prevSlide() {
      if (currentSlide > 1) {
        currentSlide--;
        updateSlide();
      }
    }

    function goToSlide(n) {
      if (n >= 1 && n <= totalSlides) {
        currentSlide = n;
        updateSlide();
      }
    }

    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToSlide(1);
      } else if (e.key === 'End') {
        e.preventDefault();
        goToSlide(totalSlides);
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      } else if (e.key.toLowerCase() === 'o') {
        toggleOverview();
      } else if (e.key.toLowerCase() === 's') {
        toggleNotes();
      } else if (e.key === 'Escape') {
        closeOverview();
        closeVideoModal();
      }
    });

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }

    function toggleOverview() {
      const drawer = document.getElementById('overviewDrawer');
      drawer.classList.toggle('open');
    }

    function closeOverview() {
      document.getElementById('overviewDrawer').classList.remove('open');
    }

    function toggleNotes() {
      document.getElementById('notesDrawer').classList.toggle('open');
    }

    function openVideoModal() {
      document.getElementById('videoModal').classList.add('open');
      const video = document.getElementById('walkthroughVideo');
      if (video) video.play().catch(() => {});
    }

    function closeVideoModal() {
      const modal = document.getElementById('videoModal');
      modal.classList.remove('open');
      const video = document.getElementById('walkthroughVideo');
      if (video) video.pause();
    }

    updateSlide();
  </script>
</body>
</html>
"""

def generate():
    dist_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist", "presentation.html")
    public_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "presentation.html")
    
    os.makedirs(os.path.dirname(dist_path), exist_ok=True)
    os.makedirs(os.path.dirname(public_path), exist_ok=True)
    
    with open(dist_path, "w", encoding="utf-8") as f:
        f.write(presentation_html)
    print(f"Generated {dist_path} ({len(presentation_html)} bytes)")

    with open(public_path, "w", encoding="utf-8") as f:
        f.write(presentation_html)
    print(f"Generated {public_path} ({len(presentation_html)} bytes)")

if __name__ == "__main__":
    generate()
