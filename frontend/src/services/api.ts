import {
  Activity,
  WellnessCheckInInput,
  Recommendation,
  ActivityRecord,
  UserPreferences,
  WorkdayPlan,
  AnalyticsSummary,
  ChatMessage,
  UserProfile
} from '../types';

const API_BASE = '/api';

export const api = {
  // 1. Health check
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
    } catch {
      return { status: 'offline', app: 'VYBE AI' };
    }
  },

  // 2. Activities
  async getActivities(): Promise<Activity[]> {
    try {
      const res = await fetch(`${API_BASE}/activities`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, using local activity library');
    }
    return defaultActivities;
  },

  async getActivity(id: string): Promise<Activity | null> {
    try {
      const res = await fetch(`${API_BASE}/activities/${id}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend unavailable');
    }
    return defaultActivities.find(a => a.id === id) || null;
  },

  // 3. Recommendation
  async getRecommendation(checkin: WellnessCheckInInput, exclude?: string): Promise<Recommendation> {
    try {
      const url = exclude ? `${API_BASE}/recommend?exclude=${encodeURIComponent(exclude)}` : `${API_BASE}/recommend`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkin)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend recommendation offline, using fallback engine');
    }

    // Local deterministic fallback
    return localFallbackRecommend(checkin, exclude);
  },

  // 4. Chat Assistant
  async sendChat(message: string, userId = 'default_user', history: ChatMessage[] = []): Promise<ChatMessage> {
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, message, conversation_history: history })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend chat offline, using client assistant fallback');
    }
    return {
      role: 'assistant',
      content: "I recommend taking a moment to relax your eyes or stretch gently at your desk.",
      suggested_activity_id: 'eyecare',
      suggested_actions: [{ label: 'Start EyeCare (20s)', action: 'start_eyecare' }],
      source: 'rule_engine'
    };
  },

  // 5. User Preferences
  async getPreferences(userId = 'default_user'): Promise<UserPreferences> {
    try {
      const res = await fetch(`${API_BASE}/preferences?user_id=${userId}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Preferences fallback');
    }
    const saved = localStorage.getItem(`vybe_prefs_${userId}`);
    if (saved) return JSON.parse(saved);
    return defaultPreferences;
  },

  async updatePreferences(prefs: UserPreferences): Promise<UserPreferences> {
    try {
      const res = await fetch(`${API_BASE}/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Preferences save fallback');
    }
    localStorage.setItem(`vybe_prefs_${prefs.user_id}`, JSON.stringify(prefs));
    return prefs;
  },

  async resetPreferences(userId = 'default_user'): Promise<UserPreferences> {
    try {
      const res = await fetch(`${API_BASE}/preferences/reset?user_id=${userId}`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Preferences reset fallback');
    }
    localStorage.removeItem(`vybe_prefs_${userId}`);
    return defaultPreferences;
  },

  // 6. History
  async getHistory(userId = 'default_user', limit = 50): Promise<ActivityRecord[]> {
    try {
      const res = await fetch(`${API_BASE}/history?user_id=${userId}&limit=${limit}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('History fallback');
    }
    const saved = localStorage.getItem(`vybe_hist_${userId}`);
    return saved ? JSON.parse(saved) : [];
  },

  async recordActivity(record: Omit<ActivityRecord, 'record_id'>): Promise<{ status: string; record_id: number }> {
    try {
      const res = await fetch(`${API_BASE}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Record save fallback');
    }
    const history = await this.getHistory(record.user_id);
    const newRecord = { ...record, record_id: Date.now() };
    localStorage.setItem(`vybe_hist_${record.user_id}`, JSON.stringify([newRecord, ...history]));
    return { status: 'success', record_id: newRecord.record_id };
  },

  async clearHistory(userId = 'default_user'): Promise<void> {
    try {
      await fetch(`${API_BASE}/history?user_id=${userId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Clear history fallback');
    }
    localStorage.removeItem(`vybe_hist_${userId}`);
  },

  // 7. Feedback
  async submitFeedback(data: {
    user_id?: string;
    record_id?: number;
    activity_id: string;
    rating: 'helpful' | 'okay' | 'not_helpful';
    want_similar: boolean;
  }): Promise<{ status: string; feedback_id: number }> {
    try {
      const res = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Feedback fallback');
    }
    return { status: 'success', feedback_id: Date.now() };
  },

  // 8. Reminders
  async getReminders(userId = 'default_user') {
    try {
      const res = await fetch(`${API_BASE}/reminders?user_id=${userId}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Reminders fallback');
    }
    return [];
  },

  async scheduleReminder(data: { user_id: string; activity_id: string; scheduled_at: string }) {
    try {
      const res = await fetch(`${API_BASE}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Schedule reminder fallback');
    }
    return { status: 'success', reminder_id: Date.now() };
  },

  async updateReminder(reminderId: number, update: { status: string; snooze_minutes?: number }, userId = 'default_user') {
    try {
      const res = await fetch(`${API_BASE}/reminders/${reminderId}?user_id=${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Update reminder fallback');
    }
    return { status: 'success', reminder_id: reminderId };
  },

  // 9. Break Planner
  async getPlanner(userId = 'default_user', date?: string): Promise<WorkdayPlan> {
    try {
      const url = date ? `${API_BASE}/planner?user_id=${userId}&date=${date}` : `${API_BASE}/planner?user_id=${userId}`;
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Planner fallback');
    }
    return {
      user_id: userId,
      date: date || new Date().toISOString().slice(0, 10),
      work_start: '09:00',
      work_end: '17:00',
      items: [
        { time: '09:00', type: 'work', title: 'Deep Work Session', duration_minutes: 45, status: 'upcoming' },
        { time: '09:45', type: 'break', title: 'EyeCare Break', duration_minutes: 1, activity_id: 'eyecare', status: 'upcoming' },
        { time: '09:46', type: 'work', title: 'Focused Work', duration_minutes: 45, status: 'upcoming' },
        { time: '10:31', type: 'break', title: 'DeskYoga Break', duration_minutes: 2, activity_id: 'deskyoga', status: 'upcoming' },
        { time: '12:30', type: 'lunch', title: 'Lunch & Quiet Hours (No Reminders)', duration_minutes: 60, status: 'upcoming' }
      ]
    };
  },

  // 10. Analytics
  async getAnalytics(userId = 'default_user', timeframe = '7days'): Promise<AnalyticsSummary> {
    try {
      const res = await fetch(`${API_BASE}/analytics?user_id=${userId}&timeframe=${timeframe}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Analytics fallback');
    }
    return {
      timeframe: timeframe as any,
      total_completed_activities: 0,
      total_minutes_spent: 0,
      reminder_acceptance_rate: 100,
      helpful_rate_percent: 100,
      activity_distribution: {},
      daily_trend: [],
      recent_records: []
    };
  },

  // 11. Demo data
  async seedDemo(userId = 'default_user') {
    const res = await fetch(`${API_BASE}/demo/seed?user_id=${userId}`, { method: 'POST' });
    return await res.json();
  },

  async resetDemo(userId = 'default_user') {
    const res = await fetch(`${API_BASE}/demo/reset?user_id=${userId}`, { method: 'POST' });
    return await res.json();
  },

  // 12. Export
  async exportData(userId = 'default_user') {
    const res = await fetch(`${API_BASE}/export?user_id=${userId}`);
    return await res.json();
  },

  // 13. User Authentication & Profile
  async register(data: {
    name: string;
    email: string;
    password: string;
    dob: string;
    age: number;
    role: string;
  }): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Registration failed');
    }
    const profile = await res.json();
    localStorage.setItem('vybe_user_session', JSON.stringify(profile));
    return profile;
  },

  async login(data: { email: string; password: string }): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Login failed');
    }
    const profile = await res.json();
    localStorage.setItem('vybe_user_session', JSON.stringify(profile));
    return profile;
  },

  async getMe(userId = 'default_user'): Promise<UserProfile> {
    try {
      const res = await fetch(`${API_BASE}/auth/me?user_id=${userId}`);
      if (res.ok) {
        const profile = await res.json();
        localStorage.setItem('vybe_user_session', JSON.stringify(profile));
        return profile;
      }
    } catch {}

    const saved = localStorage.getItem('vybe_user_session');
    if (saved) return JSON.parse(saved);

    return {
      user_id: 'default_user',
      name: 'Alex Morgan',
      email: 'alex.morgan@workplace.com',
      dob: '1996-04-12',
      age: 28,
      role: 'Software Engineer',
      sound_preset: 'zen_bowl',
      custom_sound_url: null,
      sound_volume: 0.8,
      created_at: new Date().toISOString()
    };
  },

  // 14. Sound Settings
  async updateSoundSettings(data: {
    user_id: string;
    sound_preset: string;
    custom_sound_url?: string | null;
    sound_volume: number;
  }): Promise<{ status: string; profile: UserProfile }> {
    try {
      const res = await fetch(`${API_BASE}/sound/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const respData = await res.json();
        localStorage.setItem('vybe_user_session', JSON.stringify(respData.profile));
        return respData;
      }
    } catch {}

    return {
      status: 'success',
      profile: {
        user_id: data.user_id,
        name: 'Alex Morgan',
        email: 'alex@vybe.ai',
        dob: '1996-04-12',
        age: 28,
        role: 'Software Engineer',
        sound_preset: data.sound_preset,
        custom_sound_url: data.custom_sound_url,
        sound_volume: data.sound_volume,
        created_at: new Date().toISOString()
      }
    };
  },

  // 15. Screen Time Tracking
  async logScreenSession(data: {
    user_id: string;
    started_at: string;
    ended_at: string;
    active_minutes: number;
    idle_minutes: number;
    breaks_taken: number;
  }) {
    try {
      const res = await fetch(`${API_BASE}/tracking/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch {}
    return { status: 'success' };
  },

  async getTodayScreenStats(userId = 'default_user'): Promise<{
    date: string;
    total_active_screen_minutes: number;
    total_idle_minutes: number;
    total_breaks_taken: number;
  }> {
    try {
      const res = await fetch(`${API_BASE}/tracking/today?user_id=${userId}`);
      if (res.ok) return await res.json();
    } catch {}
    return {
      date: new Date().toISOString().slice(0, 10),
      total_active_screen_minutes: 0,
      total_idle_minutes: 0,
      total_breaks_taken: 0
    };
  },

  // 16. Background Desktop Agent
  async getBackgroundAgentStatus(): Promise<{ running: boolean; pid: number | null }> {
    try {
      const res = await fetch(`${API_BASE}/background/status`);
      if (res.ok) return await res.json();
    } catch {}
    return { running: false, pid: null };
  },

  async triggerWindowsToast(): Promise<{ status: string }> {
    try {
      const res = await fetch(`${API_BASE}/background/test-notification`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch {}
    return { status: 'offline' };
  }
};

export const defaultPreferences: UserPreferences = {
  user_id: 'default_user',
  display_name: 'Alex Morgan',
  timezone: 'Local',
  preferred_activities: ['eyecare', 'mindreset', 'deskyoga', 'walkbreak', 'hydratemate'],
  disabled_activities: [],
  favorite_activities: ['eyecare', 'deskyoga'],
  reminder_interval_min: 45,
  work_start: '09:00',
  work_end: '17:00',
  quiet_hours_start: '12:30',
  quiet_hours_end: '13:30',
  enable_ai: true,
  enable_reminders: true,
  theme: 'light'
};

export const defaultActivities: Activity[] = [
  {
    id: 'eyecare',
    name: 'EyeCare',
    tagline: '20-20-20 Visual Rest',
    category: 'eye_relaxation',
    duration_seconds: 20,
    intensity: 'Gentle',
    description: 'Relieve digital eye strain by looking 20 feet away to relax ciliary eye muscles.',
    benefits: ['Decreases digital eye strain', 'Promotes natural blinking', 'Softens optical focus'],
    icon: 'Eye',
    color: 'teal',
    instructions: [
      'Look away from your screen.',
      'Focus softly on an object roughly 20 feet in the distance.',
      'Blink naturally and release any tension around your forehead.',
      'Take one gentle breath as your eyes relax.'
    ],
    steps: [
      { seconds: 5, text: 'Turn your gaze away from all monitors and screens.' },
      { seconds: 5, text: 'Locate an object across the room or outside a window.' },
      { seconds: 5, text: 'Blink slowly 3 times to lubricate your eyes naturally.' },
      { seconds: 5, text: 'Keep your gaze soft and let the eye muscles fully relax.' }
    ]
  },
  {
    id: 'deskyoga',
    name: 'DeskYoga',
    tagline: 'Gentle Posture & Mobility',
    category: 'movement',
    duration_seconds: 120,
    intensity: 'Mild',
    description: 'Comfortable seated mobility exercises to relieve neck, shoulder, and wrist stiffness.',
    benefits: ['Releases upper back tension', 'Improves circulation', 'Prevents mouse-wrist fatigue'],
    icon: 'Activity',
    color: 'blue',
    instructions: [
      'Sit tall with feet flat on the floor.',
      'Relax your shoulders down and back.',
      'Perform gentle, slow shoulder rolls.',
      'Gently extend and stretch your wrists.',
      'Move only within your comfortable range; stop if you feel any discomfort.'
    ],
    steps: [
      { seconds: 30, text: 'Shoulder Rolls: Roll your shoulders backward in smooth circles 5 times, then forward 5 times.' },
      { seconds: 30, text: 'Neck Releases: Gently tilt your right ear toward your right shoulder for 15s, then switch sides.' },
      { seconds: 30, text: 'Wrist & Finger Stretches: Extend your arms forward, gently flexing fingers up and down.' },
      { seconds: 30, text: 'Seated Torso Lengthening: Interlace fingers overhead, take a gentle breath, and release downward.' }
    ]
  },
  {
    id: 'mindreset',
    name: 'MindReset',
    tagline: '1-Minute Breathing & Calm',
    category: 'breathing_relaxation',
    duration_seconds: 60,
    intensity: 'Calming',
    description: 'A natural, steady breathing pause to lower cognitive overload and center your attention.',
    benefits: ['Clears cognitive fatigue', 'Balances nervous system', 'Restores calm focus'],
    icon: 'Heart',
    color: 'emerald',
    instructions: [
      'Sit comfortably with your hands resting on your lap.',
      'Relax your jaw, neck, and shoulders.',
      'Breathe slowly and naturally at your own comfortable pace.',
      'Stop or adjust if the exercise makes you feel uncomfortable in any way.'
    ],
    steps: [
      { seconds: 15, text: 'Close your eyes or lower your gaze. Let your jaw un-clench.' },
      { seconds: 15, text: 'Inhale smoothly through your nose for 4 seconds without forcing.' },
      { seconds: 15, text: 'Exhale softly through your mouth or nose for 4-5 seconds.' },
      { seconds: 15, text: 'Notice your shoulders dropping. Take two more calm, unhurried breaths.' }
    ]
  },
  {
    id: 'walkbreak',
    name: 'WalkBreak',
    tagline: '5-Minute Movement Stroll',
    category: 'walking',
    duration_seconds: 300,
    intensity: 'Moderate',
    description: 'Step away from your workstation to stimulate blood flow and give your brain a physical change of scenery.',
    benefits: ['Boosts leg circulation', 'Resets mental alertness', 'Combats prolonged sitting'],
    icon: 'Footprints',
    color: 'amber',
    instructions: [
      'Step away from your desk safely.',
      'Take a comfortable walk around your floor, hallway, or outdoor area.',
      'Move at your own natural pace.',
      'Return to work whenever you are ready.'
    ],
    steps: [
      { seconds: 60, text: 'Stand up, gently stretch your legs, and step away from your workspace.' },
      { seconds: 120, text: 'Walk at an easy, comfortable pace. Look around and let your mind wander.' },
      { seconds: 60, text: 'Notice your posture; keep your shoulders relaxed and stride naturally.' },
      { seconds: 60, text: 'Head back to your desk, drink a sip of water, and settle in refreshed.' }
    ]
  },
  {
    id: 'hydratemate',
    name: 'HydrateMate',
    tagline: 'Hydration & Posture Pause',
    category: 'hydration',
    duration_seconds: 60,
    intensity: 'Gentle',
    description: 'A quick pause to check in with your body’s hydration needs and reset your posture.',
    benefits: ['Supports energy levels', 'Prevents dehydration headaches', 'Encourages brief standing'],
    icon: 'Droplets',
    color: 'cyan',
    instructions: [
      'Take a brief moment away from your screen.',
      'Refill your glass or water bottle.',
      'Drink water if you are thirsty and it is appropriate for you.',
      'Enjoy a moment of stillness.'
    ],
    steps: [
      { seconds: 15, text: 'Stand up and check your water bottle or cup.' },
      { seconds: 25, text: 'Take a refreshing sip of water at your own pace if you feel thirsty.' },
      { seconds: 20, text: 'Take one deep breath, roll your shoulders back, and resume your rhythm.' }
    ]
  },
  {
    id: 'powernap',
    name: 'PowerNap',
    tagline: 'Optional Rest & Recharge',
    category: 'quiet_rest',
    duration_seconds: 600,
    intensity: 'Restorative',
    description: 'An optional 10-15 minute quiet rest to recharge cognitive stamina when time and workplace permit.',
    benefits: ['Restores mental alertness', 'Decreases afternoon slump', 'Non-stimulant cognitive recharge'],
    icon: 'Moon',
    color: 'indigo',
    instructions: [
      'Only choose if you have sufficient time and your workplace policy permits.',
      'Dim room lights or close your eyes in a comfortable chair.',
      'Set an alarm or let the VYBE timer wake you gently.',
      'Present as optional rest, not medical therapy.'
    ],
    steps: [
      { seconds: 60, text: 'Find a quiet, supportive seating or reclining position.' },
      { seconds: 480, text: 'Close your eyes, relax your muscles, and allow your thoughts to drift away naturally.' },
      { seconds: 60, text: 'Gently wake up, stretch your arms, blink into the light, and reorient.' }
    ]
  }
];

function localFallbackRecommend(checkin: WellnessCheckInInput, exclude?: string): Recommendation {
  const allowed = defaultActivities.filter(a => a.duration_seconds <= checkin.available_time_seconds && a.id !== exclude);
  const selected = allowed.length > 0 ? allowed[0] : defaultActivities[0];
  return {
    activity_id: selected.id,
    activity_name: selected.name,
    tagline: selected.tagline,
    category: selected.category,
    duration_seconds: selected.duration_seconds,
    duration_label: `${selected.duration_seconds}s`,
    description: selected.description,
    reason: `Selected for your available time window.`,
    confidence_score: 0.9,
    alternatives: [],
    action_type: checkin.reminder_mode === 'immediate' ? 'immediate' : 'scheduled',
    source: 'rule_engine'
  };
}
