# VYBE AI — Intelligent Workplace Wellness Agent

> **"Your Work. Your Wellness. Your Rhythm."**

[![Live App on Vercel](https://img.shields.io/badge/Live%20Demo-vybe--ai--five.vercel.app-14B8A6?style=for-the-badge&logo=vercel)](https://vybe-ai-five.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Vybe--AI-14213D?style=for-the-badge&logo=github)](https://github.com/53yelureprathemesh-bot/Vybe-AI)

🌐 **Live Production Deployment**: [https://vybe-ai-five.vercel.app/](https://vybe-ai-five.vercel.app/)

VYBE AI is a modern, responsive, privacy-first workplace wellness web application designed specifically for software developers, IT professionals, remote workers, and computer desk workers.

It helps employees sustain mental clarity, relieve digital eye strain, improve posture, and balance focused work sessions with science-backed micro-breaks, guided mobility, calming breathing exercises, and smart workday planning.

---

## 🌟 Key Highlights & Architecture

- **Zero-Placeholder Guarantee**: Every button, navigation item, timer, feedback form, and chart is fully implemented and connected to persistent SQLite storage.
- **5-Stage AI Recommendation Loop**: Full implementation of **OBSERVE → ANALYSE → DECIDE → ACT → LEARN**:
  - Multi-factor scoring with strict duration bounds (never recommends an activity longer than available time).
  - Feedback-weighted adaptation (+1.5 for helpful, -2.0 for not-helpful) and recency suppression.
  - Transparent explanations in plain, supportive English.
- **Dual AI Engine**:
  - Deterministic rule-based engine that runs 100% offline without any API keys.
  - Optional Google Gemini LLM integration with safe structured output validation and automatic fallback.
- **Interactive Guided Player**: Timestamp-based countdown timer, animated breathing ring, step-by-step guidance, Web Audio chime synthesis, confetti celebration, and post-activity feedback dialog.
- **Hackathon Demo Bar**: One-click scenario switcher for all 5 evaluation scenarios plus instant 7-day demo data generation and clean state reset.
- **100% Privacy-First**: All inputs are voluntary. Zero keystroke logging, zero screen scraping, zero employee surveillance.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Canvas Confetti |
| **Backend** | Python 3.10+, FastAPI, Uvicorn, Pydantic v2 |
| **Database** | SQLite (with WAL mode, parameterized queries, and isolated user schemas) |
| **Testing** | Pytest, HTTPX, FastAPI TestClient (24 automated tests passing) |
| **Design System** | Deep Navy (`#14213D`), Teal (`#14B8A6`), Soft Mint (`#DDF7EE`), Warm White (`#F8FAFC`), Slate (`#64748B`) |

---

## 📋 Approved Activity Library

| Activity | Category | Duration | Description |
| :--- | :--- | :--- | :--- |
| **EyeCare** | Eye Relaxation | 20s | 20-20-20 optical rest to relax ciliary eye muscles. |
| **DeskYoga** | Movement | 2m (120s) | Seated shoulder rolls, neck releases, and wrist mobility. |
| **MindReset** | Breathing | 1m (60s) | Natural 4-4 breathing cadence to balance cognitive stress. |
| **WalkBreak** | Walking | 5m (300s) | Hallway or outdoor stroll to boost lower-body blood circulation. |
| **HydrateMate**| Hydration | 1m (60s) | Water intake pause and ergonomic posture check. |
| **PowerNap** | Quiet Rest | 10–15m | Optional cognitive recharge when schedule and workplace permit. |

---

## 🚀 Quick Start Guide

### Option 1: One-Click Run (Windows)
Double-click `run.bat` or run in PowerShell:
```powershell
.\run.bat
```
This starts the fullstack FastAPI server on `http://localhost:8000`. The server automatically serves both the REST API and the compiled React frontend!

Open your browser at:
👉 **[http://localhost:8000](http://localhost:8000)**

---

### Option 2: Full Development Mode (FastAPI + Vite Hot Reload)

1. **Start Backend (Port 8000)**:
```powershell
$env:PATH = "C:\Program Files\nodejs;C:\Users\PRAJKTA\AppData\Local\Programs\Python\Python310;C:\Users\PRAJKTA\AppData\Local\Programs\Python\Python310\Scripts;" + $env:PATH
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

2. **Start Frontend Dev Server (Port 3000)**:
```powershell
$env:PATH = "C:\Program Files\nodejs;C:\Users\PRAJKTA\AppData\Local\Programs\Python\Python310;C:\Users\PRAJKTA\AppData\Local\Programs\Python\Python310\Scripts;" + $env:PATH
cd frontend
npm run dev
```

Open your browser at:
👉 **[http://localhost:3000](http://localhost:3000)** (Vite proxies all `/api` requests to port 8000).

---

## 🧪 Running Automated Tests

Run the complete 24-test verification suite:
```powershell
$env:PATH = "C:\Program Files\nodejs;C:\Users\PRAJKTA\AppData\Local\Programs\Python\Python310;C:\Users\PRAJKTA\AppData\Local\Programs\Python\Python310\Scripts;" + $env:PATH
$env:PYTHONPATH = "e:\vybe ai\backend"
python -m pytest backend/tests -v
```

### Test Suite Verification Highlights
- ✅ `test_long_screen_session_recommends_visual_break`: Verifies 90m screen session prioritizes `EyeCare`.
- ✅ `test_long_sitting_session_recommends_movement_activity`: Verifies 90m sitting session recommends `WalkBreak` or `DeskYoga`.
- ✅ `test_stressed_user_recommends_relaxation`: Verifies stressed state selects `MindReset`.
- ✅ `test_one_minute_window_never_receives_five_minute_activity`: Verifies strict duration bound enforcement.
- ✅ `test_thirty_second_micro_window`: Verifies only `EyeCare` (20s) matches $\le 30$s.
- ✅ `test_declined_activity_excluded_on_choose_another`: Verifies excluded activity is not repeated.
- ✅ `test_disabled_activity_is_never_selected`: Verifies user preference exclusions are strictly respected.
- ✅ `test_activity_persistence_and_retrieval`: Verifies SQLite storage.
- ✅ `test_feedback_saved_correctly`: Verifies rating aggregation.
- ✅ `test_multi_user_isolation`: Verifies data separation between users.
- ✅ `test_reminder_creation_and_snooze`: Verifies 5-minute snooze calculations.
- ✅ `test_quiet_hours_respected_in_break_planner`: Verifies lunch quiet hours suppress active alerts.
- ✅ `test_chat_grounded_today_history`: Verifies AI queries real SQLite database records without hallucinations.

---

## 🏆 Hackathon Demo Scenarios

Use the top **Hackathon Live Demo Bar** to test all 5 pre-configured scenarios with a single click:

| Scenario | Input Parameters | Expected System Behavior |
| :--- | :--- | :--- |
| **Scenario 1** | Screen: 90m, Sitting: 60m, Mood: Normal, Time: 2m | Recommends **EyeCare (20s)** or **DeskYoga (2m)** with screen fatigue rationale. |
| **Scenario 2** | Screen: 10m, Sitting: 90m, Mood: Normal, Time: 5m | Recommends **WalkBreak (5m)** for physical circulation. |
| **Scenario 3** | Screen: 10m, Sitting: 10m, Mood: Stressed, Time: 2m | Recommends **MindReset (1m)** breathing pause to downregulate stress. |
| **Scenario 4** | Screen: 30m, Sitting: 20m, Mood: Tired, Time: 5m | Recommends **WalkBreak (5m)** or **HydrateMate (1m)** for natural alertness. |
| **Scenario 5** | Available Time: 30 seconds | Strictly matches **EyeCare (20s)** — zero activities exceeding 30s allowed. |

### Data Management Buttons in Demo Bar
- **Seed 7D Data**: Pre-populates 5 days of realistic activity records and feedback ratings to instantly visualize Recharts graphs on the Journey Analytics page.
- **Reset Demo**: Clears all records and resets preferences to initial clean state.

---

## 📂 Project Structure

```
e:/vybe ai/
├── backend/
│   ├── main.py                     # FastAPI REST API & static SPA mounting
│   ├── database.py                 # SQLite schema, queries, analytics & migrations
│   ├── models.py                   # Pydantic schemas for validation
│   ├── activity_library.py         # 6 core approved activities & instructions
│   ├── recommendation_engine.py    # OBSERVE-ANALYSE-DECIDE-ACT-LEARN scoring loop
│   ├── ai_agent.py                 # "Talk to VYBE" chat assistant + Gemini fallback
│   ├── planner.py                  # Workday break schedule generator & quiet hours
│   ├── requirements.txt            # Python dependencies
│   ├── vybe_wellness.db            # SQLite persistent database file
│   └── tests/                      # Automated test suite (24 tests)
│       ├── test_recommendation.py
│       ├── test_database.py
│       ├── test_reminders.py
│       ├── test_ai_agent.py
│       └── test_api.py
├── frontend/
│   ├── index.html                  # HTML entrypoint
│   ├── package.json                # React, Vite, Tailwind, Recharts dependencies
│   ├── vite.config.ts              # Vite config with /api proxy
│   ├── tailwind.config.js          # Brand palette: Navy, Teal, Mint, Slate
│   ├── tsconfig.json               # TypeScript configuration
│   └── src/
│       ├── App.tsx                 # Core app orchestrator, routes & modals
│       ├── main.tsx
│       ├── index.css               # Tailwind directives & breathing animations
│       ├── types/                  # TypeScript interfaces
│       ├── services/api.ts         # Resilient API client service
│       ├── components/
│       │   ├── Logo.tsx            # Brand wave & leaf energy symbol
│       │   ├── Navbar.tsx          # Workday clock, AI badge, quick check-in
│       │   ├── Sidebar.tsx         # 8 primary navigation links
│       │   ├── DemoBanner.tsx      # Hackathon 5-scenario demo switcher
│       │   ├── ActivityPlayer.tsx  # Guided countdown timer, chime & feedback
│       │   └── ReminderToast.tsx   # Smart floating reminder banner
│       └── views/
│           ├── LandingPageView.tsx # Hero, How It Works, Features, Privacy
│           ├── DashboardView.tsx   # Time greeting, Next Best Break, Quick Actions
│           ├── CheckInView.tsx     # 7-question voluntary check-in wizard
│           ├── ChatAssistantView.tsx # "Talk to VYBE" AI chat with suggestions
│           ├── PlannerView.tsx     # Workday timeline & interval schedule
│           ├── RelaxationZoneView.tsx # Approved activity library & favorites
│           ├── JourneyAnalyticsView.tsx # Recharts visual analytics (Today/7D/30D)
│           └── SettingsView.tsx    # Preferences, quiet hours, JSON data export
├── .env.example                    # Environment variable template
├── run.bat                         # Single-click Windows launcher
├── dev.bat                         # Vite dev server launcher
└── README.md                       # Comprehensive documentation
```

---

## 🔒 Privacy & Compliance Statement

VYBE AI operates under a strict privacy-first principle:
1. **Voluntary Data Only**: All session information is voluntarily submitted via check-ins or timers.
2. **Zero Employer Surveillance**: Activity records are stored locally for the employee's personal reflection only.
3. **No Private Scraping**: VYBE does not monitor keystrokes, capture screen images, or access workplace chat channels.
4. **Data Ownership**: Users can export their full activity records as JSON or permanently wipe their history with a single click.
