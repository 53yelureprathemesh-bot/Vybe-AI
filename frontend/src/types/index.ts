export type NavSection =
  | 'landing'
  | 'dashboard'
  | 'assistant'
  | 'planner'
  | 'relaxation'
  | 'checkin'
  | 'journey'
  | 'settings';

export interface UserProfile {
  user_id: string;
  name: string;
  email: string;
  dob: string;
  age: number;
  role: string;
  sound_preset: string;
  custom_sound_url?: string | null;
  sound_volume: number;
  created_at: string;
}

export interface ScreenTrackingState {
  continuousActiveSeconds: number;
  totalActiveTodaySeconds: number;
  idleSeconds: number;
  isIdle: boolean;
  status: 'active' | 'idle' | 'away';
  lastActivityTime: number;
}

export type SoundPresetId = 'zen_bowl' | 'crystal_bell' | 'calm_harp' | 'water_drop' | 'gentle_gong' | 'custom';

export interface ActivityStep {
  seconds: number;
  text: string;
}

export interface Activity {
  id: string;
  name: string;
  tagline: string;
  category: string;
  duration_seconds: number;
  intensity: string;
  description: string;
  benefits: string[];
  icon: string;
  color: string;
  instructions: string[];
  steps: ActivityStep[];
}

export interface WellnessCheckInInput {
  user_id?: string;
  screen_session_min: number;
  sitting_duration_min: number;
  mood: 'feeling_good' | 'normal' | 'tired' | 'stressed' | 'low_energy';
  energy: 'high' | 'moderate' | 'low';
  available_time_seconds: number;
  preferred_activity_category?: string;
  reminder_mode: 'immediate' | 'reminder';
}

export interface Recommendation {
  activity_id: string;
  activity_name: string;
  tagline: string;
  category: string;
  duration_seconds: number;
  duration_label: string;
  description: string;
  reason: string;
  confidence_score: number;
  alternatives: Array<{
    id: string;
    name: string;
    duration_seconds: number;
    category: string;
    description: string;
  }>;
  action_type: 'immediate' | 'scheduled';
  source: 'rule_engine' | 'llm';
}

export interface ActivityRecord {
  record_id?: number;
  user_id: string;
  activity_id: string;
  activity_name: string;
  category: string;
  duration_seconds: number;
  started_at: string;
  completed_at: string;
  status: 'completed' | 'stopped_early' | 'skipped';
}

export interface UserPreferences {
  user_id: string;
  display_name: string;
  timezone: string;
  preferred_activities: string[];
  disabled_activities: string[];
  favorite_activities: string[];
  reminder_interval_min: number;
  work_start: string;
  work_end: string;
  quiet_hours_start: string;
  quiet_hours_end: string;
  enable_ai: boolean;
  enable_reminders: boolean;
  theme: string;
}

export interface PlanItem {
  time: string;
  type: 'work' | 'break' | 'lunch' | 'completed';
  title: string;
  duration_minutes: number;
  activity_id?: string;
  status: 'upcoming' | 'completed' | 'skipped';
  recommended_reason?: string;
}

export interface WorkdayPlan {
  user_id: string;
  date: string;
  work_start: string;
  work_end: string;
  items: PlanItem[];
}

export interface AnalyticsSummary {
  timeframe: 'today' | '7days' | '30days';
  total_completed_activities: number;
  total_minutes_spent: number;
  reminder_acceptance_rate: number;
  helpful_rate_percent: number;
  most_frequent_activity?: string;
  activity_distribution: Record<string, number>;
  daily_trend: Array<{ date: string; count: number; minutes: number }>;
  recent_records: ActivityRecord[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  suggested_activity_id?: string;
  suggested_actions?: Array<{ label: string; action: string }>;
  source?: string;
}
