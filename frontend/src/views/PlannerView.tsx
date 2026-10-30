import React, { useState, useEffect } from 'react';
import { WorkdayPlan, PlanItem, UserPreferences } from '../types';
import {
  CalendarClock,
  Play,
  Check,
  SkipForward,
  Clock,
  Coffee,
  Briefcase,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

interface PlannerViewProps {
  onStartActivity: (activityId: string) => void;
}

export const PlannerView: React.FC<PlannerViewProps> = ({ onStartActivity }) => {
  const [plan, setPlan] = useState<WorkdayPlan | null>(null);
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Form states for schedule configuration
  const [workStart, setWorkStart] = useState<string>('09:00');
  const [workEnd, setWorkEnd] = useState<string>('17:00');
  const [quietStart, setQuietStart] = useState<string>('12:30');
  const [quietEnd, setQuietEnd] = useState<string>('13:30');
  const [intervalMin, setIntervalMin] = useState<number>(45);

  useEffect(() => {
    loadPlannerAndPrefs();
  }, []);

  const loadPlannerAndPrefs = async () => {
    setLoading(true);
    try {
      const [userPrefs, userPlan] = await Promise.all([
        api.getPreferences('default_user'),
        api.getPlanner('default_user')
      ]);
      setPrefs(userPrefs);
      setWorkStart(userPrefs.work_start || '09:00');
      setWorkEnd(userPrefs.work_end || '17:00');
      setQuietStart(userPrefs.quiet_hours_start || '12:30');
      setQuietEnd(userPrefs.quiet_hours_end || '13:30');
      setIntervalMin(userPrefs.reminder_interval_min || 45);
      setPlan(userPlan);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prefs) return;
    const updated = {
      ...prefs,
      work_start: workStart,
      work_end: workEnd,
      quiet_hours_start: quietStart,
      quiet_hours_end: quietEnd,
      reminder_interval_min: intervalMin
    };
    await api.updatePreferences(updated);
    setPrefs(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);

    // Refresh plan
    const newPlan = await api.getPlanner('default_user');
    setPlan(newPlan);
  };

  const handleSkipItem = (index: number) => {
    if (!plan) return;
    const newItems = [...plan.items];
    newItems[index] = { ...newItems[index], status: 'skipped' };
    setPlan({ ...plan, items: newItems });
  };

  const handleAcceptItem = (item: PlanItem) => {
    if (item.activity_id) {
      onStartActivity(item.activity_id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-vybe-teal">
            Schedule Architecture
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-vybe-navy mt-1">
            Smart Break Planner
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Build healthy interval rhythms throughout your workday without conflicting with quiet lunch hours.
          </p>
        </div>

        <button
          onClick={loadPlannerAndPrefs}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Regenerate Timeline</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Workday Schedule Configuration */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <CalendarClock className="w-4 h-4 text-vybe-teal" />
            <h3 className="text-sm font-bold text-vybe-navy">Workday Configuration</h3>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Start Work
                </label>
                <input
                  type="time"
                  value={workStart}
                  onChange={(e) => setWorkStart(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono focus:outline-none focus:border-vybe-teal"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  End Work
                </label>
                <input
                  type="time"
                  value={workEnd}
                  onChange={(e) => setWorkEnd(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono focus:outline-none focus:border-vybe-teal"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Lunch / Quiet Start
                </label>
                <input
                  type="time"
                  value={quietStart}
                  onChange={(e) => setQuietStart(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono focus:outline-none focus:border-vybe-teal"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Lunch / Quiet End
                </label>
                <input
                  type="time"
                  value={quietEnd}
                  onChange={(e) => setQuietEnd(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono focus:outline-none focus:border-vybe-teal"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700">
                  Focus Block Duration
                </label>
                <span className="text-xs font-mono font-bold text-vybe-teal">
                  {intervalMin} minutes
                </span>
              </div>
              <input
                type="range"
                min="25"
                max="90"
                step="5"
                value={intervalMin}
                onChange={(e) => setIntervalMin(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-vybe-teal"
              />
              <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                <span>Pomodoro (25m)</span>
                <span>Standard (45m)</span>
                <span>Deep Work (90m)</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-vybe-navy hover:bg-vybe-navy-light text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5 text-vybe-teal" />
              <span>Apply & Save Schedule</span>
            </button>

            {saveSuccess && (
              <p className="text-[11px] text-emerald-600 font-semibold text-center animate-fade-in">
                ✓ Workday rhythm updated!
              </p>
            )}
          </form>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
            <span className="font-bold text-slate-700">Quiet Hours:</span> During your configured
            lunch window ({quietStart} – {quietEnd}), all reminders are suppressed automatically.
          </div>
        </div>

        {/* Right 2 Columns: Chronological Workday Timeline */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-vybe-navy">Chronological Rhythm Timeline</h3>
              <p className="text-xs text-slate-500">Alternating focus sessions and micro-breaks</p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-vybe-mint rounded-lg text-vybe-navy">
              {plan?.date || 'Today'}
            </span>
          </div>

          {plan && plan.items && plan.items.length > 0 ? (
            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {plan.items.map((item, idx) => {
                const isWork = item.type === 'work';
                const isLunch = item.type === 'lunch';
                const isCompleted = item.status === 'completed';
                const isSkipped = item.status === 'skipped';

                return (
                  <div key={idx} className="relative group">
                    {/* Node Dot */}
                    <div
                      className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center text-[10px] ${
                        isCompleted
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                          : isSkipped
                          ? 'border-slate-300 text-slate-400'
                          : isLunch
                          ? 'border-amber-500 bg-amber-50 text-amber-600'
                          : isWork
                          ? 'border-vybe-navy bg-vybe-navy text-white'
                          : 'border-vybe-teal bg-vybe-mint text-vybe-teal font-bold'
                      }`}
                    >
                      {isCompleted ? '✓' : isLunch ? '☕' : isWork ? '💼' : '✨'}
                    </div>

                    {/* Timeline Item Content Card */}
                    <div
                      className={`p-4 rounded-2xl border transition-all ${
                        isCompleted
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : isSkipped
                          ? 'bg-slate-50/50 border-slate-200 opacity-60'
                          : isLunch
                          ? 'bg-amber-50/40 border-amber-200'
                          : isWork
                          ? 'bg-slate-50/80 border-slate-200'
                          : 'bg-white border-vybe-teal/40 shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-vybe-navy">
                            {item.time}
                          </span>
                          <span className="text-xs font-bold text-slate-800">{item.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({item.duration_minutes} min)
                          </span>
                        </div>

                        {/* Actions for upcoming breaks */}
                        {!isWork && !isLunch && !isCompleted && !isSkipped && (
                          <div className="flex items-center gap-1.5 self-start sm:self-auto">
                            <button
                              onClick={() => handleAcceptItem(item)}
                              className="px-3 py-1 rounded-lg bg-vybe-teal hover:bg-vybe-teal-dark text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs active:scale-95 transition-all"
                            >
                              <Play className="w-3 h-3 fill-white" />
                              <span>Start</span>
                            </button>
                            <button
                              onClick={() => handleSkipItem(idx)}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-medium transition-colors"
                            >
                              <SkipForward className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {item.recommended_reason && (
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {item.recommended_reason}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">Loading schedule timeline...</div>
          )}
        </div>
      </div>
    </div>
  );
};
