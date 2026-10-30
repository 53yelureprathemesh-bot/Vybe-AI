import React, { useState, useEffect } from 'react';
import { UserPreferences } from '../types';
import {
  User,
  Bell,
  Sliders,
  ShieldCheck,
  Download,
  Trash2,
  RotateCcw,
  Save,
  Check,
  AlertTriangle,
  Bot
} from 'lucide-react';
import { api, defaultActivities } from '../services/api';

export const SettingsView: React.FC = () => {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [exportData, setExportData] = useState<any | null>(null);

  // Form fields
  const [displayName, setDisplayName] = useState<string>('Alex Morgan');
  const [timezone, setTimezone] = useState<string>('Local');
  const [theme, setTheme] = useState<string>('light');
  const [enableReminders, setEnableReminders] = useState<boolean>(true);
  const [intervalMin, setIntervalMin] = useState<number>(45);
  const [quietStart, setQuietStart] = useState<string>('12:30');
  const [quietEnd, setQuietEnd] = useState<string>('13:30');
  const [workStart, setWorkStart] = useState<string>('09:00');
  const [workEnd, setWorkEnd] = useState<string>('17:00');
  const [enableAI, setEnableAI] = useState<boolean>(true);
  const [disabledActivities, setDisabledActivities] = useState<string[]>([]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getPreferences('default_user');
      setPrefs(data);
      setDisplayName(data.display_name || 'Alex Morgan');
      setTimezone(data.timezone || 'Local');
      setTheme(data.theme || 'light');
      setEnableReminders(data.enable_reminders ?? true);
      setIntervalMin(data.reminder_interval_min || 45);
      setQuietStart(data.quiet_hours_start || '12:30');
      setQuietEnd(data.quiet_hours_end || '13:30');
      setWorkStart(data.work_start || '09:00');
      setWorkEnd(data.work_end || '17:00');
      setEnableAI(data.enable_ai ?? true);
      setDisabledActivities(data.disabled_activities || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prefs) return;
    const updated: UserPreferences = {
      ...prefs,
      display_name: displayName,
      timezone,
      theme,
      enable_reminders: enableReminders,
      reminder_interval_min: intervalMin,
      quiet_hours_start: quietStart,
      quiet_hours_end: quietEnd,
      work_start: workStart,
      work_end: workEnd,
      enable_ai: enableAI,
      disabled_activities: disabledActivities
    };
    await api.updatePreferences(updated);
    setPrefs(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const toggleDisabledActivity = (actId: string) => {
    if (disabledActivities.includes(actId)) {
      setDisabledActivities(disabledActivities.filter((id) => id !== actId));
    } else {
      setDisabledActivities([...disabledActivities, actId]);
    }
  };

  const handleResetPreferences = async () => {
    if (!window.confirm('Reset all preferences to defaults?')) return;
    const res = await api.resetPreferences('default_user');
    setPrefs(res);
    setDisplayName(res.display_name);
    setEnableAI(res.enable_ai);
    setDisabledActivities([]);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDeleteHistory = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete all activity and feedback history? This cannot be undone.'
      )
    )
      return;
    await api.clearHistory('default_user');
    alert('Activity history deleted successfully.');
  };

  const handleExportData = async () => {
    const data = await api.exportData('default_user');
    setExportData(data);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `vybe_wellness_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-vybe-teal">
          Customisation & Controls
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-vybe-navy mt-1">
          Preferences & Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Full user control over reminders, activity preferences, AI suggestions, and local privacy.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: General Profile */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-vybe-teal" />
            <h3 className="text-sm font-bold text-vybe-navy">General Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-vybe-teal"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Timezone</label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-vybe-teal"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Smart Reminders & Work Hours */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Bell className="w-4 h-4 text-vybe-teal" />
            <h3 className="text-sm font-bold text-vybe-navy">Reminders & Workday Rhythm</h3>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Enable Smart Reminders</span>
              <span className="text-[11px] text-slate-500">
                Receive unforced micro-break reminders during focus sessions
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enableReminders}
                onChange={(e) => setEnableReminders(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-vybe-teal"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Reminder Interval: {intervalMin} min
              </label>
              <input
                type="range"
                min="20"
                max="90"
                step="5"
                value={intervalMin}
                onChange={(e) => setIntervalMin(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-vybe-teal"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Quiet Hours (Lunch/Rest)
              </label>
              <div className="flex items-center gap-2 text-xs font-mono">
                <input
                  type="time"
                  value={quietStart}
                  onChange={(e) => setQuietStart(e.target.value)}
                  className="py-1.5 px-2 rounded-lg border border-slate-200 text-xs"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="time"
                  value={quietEnd}
                  onChange={(e) => setQuietEnd(e.target.value)}
                  className="py-1.5 px-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Personalisation & Disabled Activities */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-vybe-teal" />
            <h3 className="text-sm font-bold text-vybe-navy">Activity Personalisation</h3>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Activity Inclusion Controls
            </label>
            <p className="text-[11px] text-slate-500 mb-3">
              Uncheck any activity you do not wish the AI to recommend:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {defaultActivities.map((act) => {
                const isExcluded = disabledActivities.includes(act.id);
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => toggleDisabledActivity(act.id)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                      isExcluded
                        ? 'bg-rose-50 border-rose-200 text-rose-700'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{act.name}</span>
                    <span className="text-[10px] font-bold">
                      {isExcluded ? 'Disabled' : 'Enabled'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Toggle */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-800 block">AI Recommendation Features</span>
              <span className="text-[11px] text-slate-500">
                When disabled, only static manual timers are available
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enableAI}
                onChange={(e) => setEnableAI(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-vybe-teal"></div>
            </label>
          </div>
        </div>

        {/* Section 4: Privacy & Data Controls */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-vybe-teal" />
            <h3 className="text-sm font-bold text-vybe-navy">Privacy & Local Data Management</h3>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            All data is stored securely in your persistent local SQLite database. You can export a JSON copy of your data or permanently delete records at any time.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleExportData}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-vybe-teal" />
              <span>Export Personal Data (JSON)</span>
            </button>

            <button
              type="button"
              onClick={handleResetPreferences}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Preferences</span>
            </button>

            <button
              type="button"
              onClick={handleDeleteHistory}
              className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-rose-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Activity History</span>
            </button>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {saveSuccess ? (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>Settings saved successfully!</span>
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">Settings persist across browser refreshes.</span>
          )}

          <button
            type="submit"
            className="px-7 py-3 rounded-xl bg-vybe-teal hover:bg-vybe-teal-dark text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
