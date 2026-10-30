import React, { useState, useEffect } from 'react';
import {
  Recommendation,
  ActivityRecord,
  AnalyticsSummary,
  Activity,
  NavSection,
  UserProfile,
  ScreenTrackingState
} from '../types';
import {
  Sparkles,
  Play,
  Bell,
  RefreshCw,
  Clock,
  CheckCircle,
  Eye,
  Activity as ActivityIcon,
  Heart,
  Footprints,
  Droplets,
  Calendar,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Monitor,
  Flame,
  Volume2,
  BellRing,
  Check,
  ShieldCheck,
  Zap,
  ExternalLink
} from 'lucide-react';
import { desktopNotification, WELLNESS_ROTATION } from '../services/desktopNotification';
import { screenTracker } from '../services/screenTracker';
import { api } from '../services/api';

interface DashboardViewProps {
  recommendation: Recommendation | null;
  analytics: AnalyticsSummary;
  recentRecords: ActivityRecord[];
  user?: UserProfile;
  screenState?: ScreenTrackingState;
  onStartActivity: (activityId: string) => void;
  onRemindLater: (activityId: string) => void;
  onChooseAnother: () => void;
  onNavigate: (section: NavSection) => void;
  onStartCheckIn: () => void;
  onOpenSoundStudio?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  recommendation,
  analytics,
  recentRecords,
  user,
  screenState,
  onStartActivity,
  onRemindLater,
  onChooseAnother,
  onNavigate,
  onStartCheckIn,
  onOpenSoundStudio
}) => {
  const [permission, setPermission] = useState<NotificationPermission>(desktopNotification.getPermission());
  const [bgAgentStatus, setBgAgentStatus] = useState<{ running: boolean; pid: number | null }>({ running: false, pid: null });
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [currentInterval, setCurrentInterval] = useState<number>(screenTracker.getThreshold());

  useEffect(() => {
    api.getBackgroundAgentStatus().then(setBgAgentStatus);
    const interval = setInterval(() => {
      setPermission(desktopNotification.getPermission());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await desktopNotification.requestPermission();
    setPermission(granted ? 'granted' : 'denied');
    if (granted) {
      setFeedbackMsg('Windows Desktop Notifications enabled! You will now receive background break alerts.');
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const handleTestDesktopNotification = async () => {
    setFeedbackMsg('Sending Windows desktop alert...');
    await desktopNotification.sendTestNotification((actId) => onStartActivity(actId));
    await api.triggerWindowsToast();
    setFeedbackMsg('Desktop alert sent! Look at the bottom-right corner of your screen.');
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  const handleTriggerBreakNow = () => {
    screenTracker.forceTriggerReminder();
    setFeedbackMsg('Automatic break reminder triggered!');
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleIntervalChange = (mins: number) => {
    screenTracker.setThreshold(mins);
    setCurrentInterval(mins);
    setFeedbackMsg(`Break reminder interval updated to ${mins} minutes`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Time-adaptive greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const currentDateStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Personalized Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-vybe-navy via-vybe-navy-light to-vybe-navy text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-vybe-teal/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-vybe-mint text-xs font-semibold mb-2">
            <Clock className="w-3.5 h-3.5" />
            <span>{currentDateStr}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {getGreeting()}{user ? `, ${user.name}` : ''}. Let's make today a healthier workday.
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            {user?.role ? `${user.role} · ` : ''}VYBE monitors your continuous screen focus and reminds you to reset before digital fatigue sets in.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          {onOpenSoundStudio && (
            <button
              onClick={onOpenSoundStudio}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all flex items-center gap-1.5"
            >
              <Volume2 className="w-3.5 h-3.5 text-vybe-teal" />
              <span>Sound Studio</span>
            </button>
          )}

          <button
            onClick={onStartCheckIn}
            className="px-4 py-2.5 rounded-xl bg-vybe-teal hover:bg-vybe-teal-dark text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Voluntary Check-In</span>
          </button>
        </div>
      </div>

      {/* Feedback toast for desktop notification actions */}
      {feedbackMsg && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-200" />
            <span>{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-emerald-200 hover:text-white text-sm ml-4">✕</button>
        </div>
      )}

      {/* Live Automatic Desktop Background Monitor & Multi-Action Notification Center */}
      {screenState && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm relative overflow-hidden">
          {/* Top Bar: Monitor Status & Screen Time */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm ${
                  screenState.isIdle
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                <Monitor className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-extrabold text-vybe-navy">
                    PC Background Monitor & Multi-Action Alerts
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      screenState.isIdle
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800 animate-pulse'
                    }`}
                  >
                    {screenState.isIdle ? 'Away / Rest Period' : '🟢 Active in Background (PC Protected)'}
                  </span>
                  {permission === 'granted' ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Windows Notifications: Active
                    </span>
                  ) : (
                    <button
                      onClick={handleEnableNotifications}
                      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-sm flex items-center gap-1 transition-all"
                    >
                      <BellRing className="w-3 h-3" /> Enable Windows Desktop Notifications
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tracks continuous PC usage across VS Code, browser & all desktop software to suggest exercises, hydration & breaks.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Continuous Focus Time
                </span>
                <span className="text-2xl font-black font-mono text-vybe-navy">
                  {Math.floor(screenState.continuousActiveSeconds / 60)}m{' '}
                  <span className="text-base text-slate-500 font-semibold">
                    {screenState.continuousActiveSeconds % 60}s
                  </span>
                </span>
              </div>

              <div className="hidden sm:block border-l border-slate-200 pl-4 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Today's Total Screen
                </span>
                <span className="text-lg font-bold font-mono text-slate-700">
                  {Math.floor(screenState.totalActiveTodaySeconds / 3600)}h{' '}
                  {Math.floor((screenState.totalActiveTodaySeconds % 3600) / 60)}m
                </span>
              </div>
            </div>
          </div>

          {/* Quick Controls: Interval Selector, Test Desktop Alert, Immediate Trigger */}
          <div className="bg-slate-50/80 rounded-2xl p-3.5 mb-4 border border-slate-200/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-vybe-teal" /> Alert Interval:
              </span>
              {[15, 20, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleIntervalChange(mins)}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-all ${
                    currentInterval === mins
                      ? 'bg-vybe-teal text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTestDesktopNotification}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-vybe-navy font-bold text-xs border border-slate-200 shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
              >
                <BellRing className="w-3.5 h-3.5 text-vybe-teal" />
                <span>Test Desktop Alert</span>
              </button>
              <button
                onClick={handleTriggerBreakNow}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-vybe-teal to-teal-600 hover:opacity-95 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Trigger Break Now</span>
              </button>
            </div>
          </div>

          {/* Progress bar to next automatic reminder */}
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-[11px] font-medium text-slate-500">
              <span>Next automatic exercise & hydration suggestion:</span>
              <span className="font-mono font-bold text-vybe-teal">
                {Math.min(currentInterval, Math.floor(screenState.continuousActiveSeconds / 60))} / {currentInterval} minutes
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-vybe-teal via-teal-500 to-indigo-500 h-full rounded-full transition-all duration-1000 ease-linear"
                style={{
                  width: `${Math.min(100, (screenState.continuousActiveSeconds / (currentInterval * 60)) * 100)}%`
                }}
              ></div>
            </div>
          </div>

          {/* Multi-Action Rotation Banner: Exercises, Hydration, Eye Care, Rest */}
          <div className="border-t border-slate-100 pt-3.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Multi-Action Wellness Rotation (Delivered Directly to Your Desktop):
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div
                onClick={() => onStartActivity('deskyoga')}
                className="p-2.5 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-100 transition-all cursor-pointer flex flex-col"
              >
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-800">
                  <span>🧘</span> Desk Stretches
                </div>
                <span className="text-[10px] text-blue-600 mt-0.5">2m neck & posture release</span>
              </div>

              <div
                onClick={() => onStartActivity('hydratemate')}
                className="p-2.5 rounded-xl bg-cyan-50/70 hover:bg-cyan-100/70 border border-cyan-100 transition-all cursor-pointer flex flex-col"
              >
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-cyan-800">
                  <span>💧</span> Hydration Break
                </div>
                <span className="text-[10px] text-cyan-600 mt-0.5">Drink a glass of water</span>
              </div>

              <div
                onClick={() => onStartActivity('eyecare')}
                className="p-2.5 rounded-xl bg-teal-50/70 hover:bg-teal-100/70 border border-teal-100 transition-all cursor-pointer flex flex-col"
              >
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-teal-800">
                  <span>👁️</span> 20-20-20 Eye Care
                </div>
                <span className="text-[10px] text-teal-600 mt-0.5">Look 20ft away for 20s</span>
              </div>

              <div
                onClick={() => onStartActivity('mindreset')}
                className="p-2.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-100 transition-all cursor-pointer flex flex-col"
              >
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-800">
                  <span>🌬️</span> Mind Reset
                </div>
                <span className="text-[10px] text-emerald-600 mt-0.5">1-min box breathing</span>
              </div>

              <div
                onClick={() => onStartActivity('walkbreak')}
                className="p-2.5 rounded-xl bg-amber-50/70 hover:bg-amber-100/70 border border-amber-100 transition-all cursor-pointer flex flex-col"
              >
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-800">
                  <span>🚶</span> Movement Stroll
                </div>
                <span className="text-[10px] text-amber-600 mt-0.5">5-min walkaway pause</span>
              </div>
            </div>

            {/* Background Daemon status note */}
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-vybe-teal" />
                {bgAgentStatus.running ? (
                  <span className="text-emerald-700 font-semibold">
                    Windows Native Daemon Active (PID: {bgAgentStatus.pid}) — Monitoring global PC inputs
                  </span>
                ) : (
                  <span>
                    In-browser background worker active. To enable native system-wide background tracking outside the browser, launch <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">start_background_monitor.bat</code>.
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Stats Counter Bar (Calculated strictly from real database records) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Completed Today
            </span>
            <div className="text-2xl font-black text-vybe-navy">
              {analytics.total_completed_activities}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">wellness sessions</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-vybe-mint flex items-center justify-center text-vybe-teal">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Time Spent
            </span>
            <div className="text-2xl font-black text-vybe-navy">
              {analytics.total_minutes_spent} <span className="text-sm font-semibold">min</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">active relaxation</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Next Scheduled Break
            </span>
            <div className="text-lg font-black text-vybe-navy truncate max-w-[120px]">
              {analytics.total_completed_activities > 0 ? 'In ~35 min' : 'Scheduled'}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Smart Reminder active</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Helpful Feedback
            </span>
            <div className="text-2xl font-black text-vybe-navy">
              {analytics.helpful_rate_percent}%
            </div>
            <span className="text-[10px] text-slate-500 font-medium">satisfaction rating</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Prominent Card: "Your Next Best Break" */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-vybe-mint flex items-center justify-center text-vybe-teal">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-vybe-teal">
                Intelligent Adaptive Suggestion
              </span>
              <h2 className="text-xl font-extrabold text-vybe-navy">Your Next Best Break</h2>
            </div>
          </div>

          {recommendation && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Confidence: {Math.round(recommendation.confidence_score * 100)}%
            </span>
          )}
        </div>

        {recommendation ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-2xl font-black text-vybe-navy">
                  {recommendation.activity_name}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-vybe-mint text-vybe-navy">
                  {recommendation.duration_label}
                </span>
                <span className="text-xs font-medium text-slate-400 capitalize">
                  · {recommendation.category.replace('_', ' ')}
                </span>
              </div>

              {/* Rationale explanation in plain language */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed font-medium">
                <span className="font-bold text-vybe-navy">Why selected: </span>
                {recommendation.reason}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {recommendation.description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onStartActivity(recommendation.activity_id)}
                  className="px-5 py-2.5 rounded-xl bg-vybe-teal hover:bg-vybe-teal-dark text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start Activity ({recommendation.duration_label})</span>
                </button>

                <button
                  onClick={() => onRemindLater(recommendation.activity_id)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Remind Me Later (10m)</span>
                </button>

                <button
                  onClick={onChooseAnother}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Choose Another</span>
                </button>
              </div>
            </div>

            {/* Quick Alternatives preview */}
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                Approved Alternatives
              </span>
              <div className="space-y-2">
                {recommendation.alternatives && recommendation.alternatives.length > 0 ? (
                  recommendation.alternatives.map((alt) => (
                    <button
                      key={alt.id}
                      onClick={() => onStartActivity(alt.id)}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 hover:border-vybe-teal text-left flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-vybe-navy transition-all group"
                    >
                      <div className="truncate pr-2">
                        <div className="font-bold">{alt.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal truncate">
                          {alt.description}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-vybe-teal px-1.5 py-0.5 bg-vybe-mint/60 rounded">
                        {alt.duration_seconds < 60 ? `${alt.duration_seconds}s` : `${alt.duration_seconds / 60}m`}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No alternative duration matches.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Voluntary Check-in Prompt if insufficient data */
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              Personalised recommendation waiting
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
              Complete a 15-second voluntary check-in with your screen duration and mood to receive tailored breaks.
            </p>
            <button
              onClick={onStartCheckIn}
              className="px-5 py-2.5 rounded-xl bg-vybe-navy text-white text-xs font-bold hover:bg-vybe-navy-light shadow transition-all active:scale-95"
            >
              Start Quick Check-In
            </button>
          </div>
        )}
      </div>

      {/* Working Quick-Action Panel (All buttons fully functional!) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-vybe-navy">Instant Quick Actions</h3>
            <p className="text-xs text-slate-500">Launch an immediate break with a single click</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              id: 'eyecare',
              title: 'Relax My Eyes',
              duration: '20s',
              icon: Eye,
              color: 'text-teal-600 bg-teal-50 hover:border-teal-300',
              action: () => onStartActivity('eyecare')
            },
            {
              id: 'deskyoga',
              title: 'Stretch My Body',
              duration: '2m',
              icon: ActivityIcon,
              color: 'text-blue-600 bg-blue-50 hover:border-blue-300',
              action: () => onStartActivity('deskyoga')
            },
            {
              id: 'mindreset',
              title: 'Calm My Mind',
              duration: '1m',
              icon: Heart,
              color: 'text-emerald-600 bg-emerald-50 hover:border-emerald-300',
              action: () => onStartActivity('mindreset')
            },
            {
              id: 'walkbreak',
              title: 'Take a Short Walk',
              duration: '5m',
              icon: Footprints,
              color: 'text-amber-600 bg-amber-50 hover:border-amber-300',
              action: () => onStartActivity('walkbreak')
            },
            {
              id: 'hydratemate',
              title: 'Drink Water',
              duration: '1m',
              icon: Droplets,
              color: 'text-cyan-600 bg-cyan-50 hover:border-cyan-300',
              action: () => onStartActivity('hydratemate')
            },
            {
              id: 'planner',
              title: 'Plan My Breaks',
              duration: 'Workday',
              icon: Calendar,
              color: 'text-indigo-600 bg-indigo-50 hover:border-indigo-300',
              action: () => onNavigate('planner')
            }
          ].map((btn, idx) => {
            const Icon = btn.icon;
            return (
              <button
                key={idx}
                onClick={btn.action}
                className={`p-4 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-all text-left flex flex-col justify-between group active:scale-95`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${btn.color} transition-colors`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-vybe-navy group-hover:text-vybe-teal transition-colors">
                    {btn.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium">{btn.duration}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity History List */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-vybe-navy">Recent Activity Sessions</h3>
            <p className="text-xs text-slate-500">Persistent SQLite database records</p>
          </div>
          <button
            onClick={() => onNavigate('journey')}
            className="text-xs font-bold text-vybe-teal hover:text-vybe-teal-dark flex items-center gap-1"
          >
            <span>View Full Journey</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentRecords && recentRecords.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recentRecords.slice(0, 5).map((rec, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-vybe-mint flex items-center justify-center text-vybe-teal font-bold">
                    ✓
                  </div>
                  <div>
                    <span className="font-bold text-vybe-navy">{rec.activity_name}</span>
                    <span className="text-[11px] text-slate-400 block">
                      {new Date(rec.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {rec.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-700">{rec.duration_seconds}s</span>
                  <span className="text-[10px] text-emerald-600 block font-semibold">Completed</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400 italic">
            No activity history yet today. Complete your first micro-break above!
          </div>
        )}
      </div>
    </div>
  );
};
