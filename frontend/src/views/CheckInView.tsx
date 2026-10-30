import React, { useState } from 'react';
import { WellnessCheckInInput, Recommendation } from '../types';
import {
  Sparkles,
  Clock,
  Battery,
  Smile,
  Timer,
  Sliders,
  Bell,
  Play,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { api } from '../services/api';

interface CheckInViewProps {
  initialValues?: WellnessCheckInInput | null;
  onRecommendationReceived: (rec: Recommendation) => void;
  onStartActivity: (activityId: string) => void;
}

export const CheckInView: React.FC<CheckInViewProps> = ({
  initialValues,
  onRecommendationReceived,
  onStartActivity
}) => {
  const [screenMin, setScreenMin] = useState<number>(initialValues?.screen_session_min ?? 60);
  const [sittingMin, setSittingMin] = useState<number>(initialValues?.sitting_duration_min ?? 60);
  const [mood, setMood] = useState<WellnessCheckInInput['mood']>(initialValues?.mood ?? 'normal');
  const [energy, setEnergy] = useState<WellnessCheckInInput['energy']>(initialValues?.energy ?? 'moderate');
  const [availableTime, setAvailableTime] = useState<number>(initialValues?.available_time_seconds ?? 120);
  const [preference, setPreference] = useState<string>(initialValues?.preferred_activity_category ?? 'let_ai_choose');
  const [reminderMode, setReminderMode] = useState<'immediate' | 'reminder'>(initialValues?.reminder_mode ?? 'immediate');

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<Recommendation | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: WellnessCheckInInput = {
        user_id: 'default_user',
        screen_session_min: screenMin,
        sitting_duration_min: sittingMin,
        mood,
        energy,
        available_time_seconds: availableTime,
        preferred_activity_category: preference,
        reminder_mode: reminderMode
      };
      const rec = await api.getRecommendation(payload);
      setResult(rec);
      onRecommendationReceived(rec);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const timeOptions = [
    { label: '30 seconds', value: 30 },
    { label: '1 minute', value: 60 },
    { label: '2 minutes', value: 120 },
    { label: '5 minutes', value: 300 },
    { label: '10 minutes', value: 600 },
    { label: '15 minutes', value: 900 },
    { label: '20 minutes', value: 1200 }
  ];

  const moodOptions: Array<{ value: WellnessCheckInInput['mood']; label: string; emoji: string }> = [
    { value: 'feeling_good', label: 'Feeling good', emoji: '😊' },
    { value: 'normal', label: 'Normal', emoji: '🙂' },
    { value: 'tired', label: 'Tired', emoji: '🥱' },
    { value: 'stressed', label: 'Stressed', emoji: '🤯' },
    { value: 'low_energy', label: 'Low energy', emoji: '🔋' }
  ];

  const energyOptions: Array<{ value: WellnessCheckInInput['energy']; label: string }> = [
    { value: 'high', label: 'High' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'low', label: 'Low' }
  ];

  const categoryOptions = [
    { value: 'let_ai_choose', label: '✨ Let AI Choose' },
    { value: 'eye_relaxation', label: '👁️ Eye Relaxation' },
    { value: 'movement', label: '🧘 Movement & Posture' },
    { value: 'breathing_relaxation', label: '🫁 Breathing & Calm' },
    { value: 'walking', label: '🚶 Walking' },
    { value: 'hydration', label: '💧 Hydration' },
    { value: 'quiet_rest', label: '🌙 Quiet Rest' }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-vybe-teal">
          Voluntary Check-In
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-vybe-navy mt-1">
          How is your rhythm right now?
        </h1>
        <p className="text-xs text-slate-500 mt-2">
          Your answers help VYBE suggest the ideal micro-break fitting your exact available time without guessing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* 1. Continuous Screen Duration */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>1. How long have you been continuously looking at a screen?</span>
            </label>
            <span className="text-xs font-mono font-bold text-vybe-navy px-2 py-0.5 bg-slate-100 rounded">
              {screenMin} minutes
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="240"
            step="15"
            value={screenMin}
            onChange={(e) => setScreenMin(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-vybe-teal"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>Just started (0m)</span>
            <span>1 hour</span>
            <span>2 hours</span>
            <span>3+ hours</span>
          </div>
        </div>

        {/* 2. Sitting Duration */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>2. How long have you been sitting without a movement break?</span>
            </label>
            <span className="text-xs font-mono font-bold text-vybe-navy px-2 py-0.5 bg-slate-100 rounded">
              {sittingMin} minutes
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="240"
            step="15"
            value={sittingMin}
            onChange={(e) => setSittingMin(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-vybe-teal"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>Just stood up (0m)</span>
            <span>45 min</span>
            <span>90 min</span>
            <span>3+ hours</span>
          </div>
        </div>

        {/* 3. Mood Options */}
        <div>
          <label className="text-xs font-bold text-slate-800 block mb-2">
            3. How are you feeling?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {moodOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMood(opt.value)}
                className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all flex flex-col items-center gap-1 ${
                  mood === opt.value
                    ? 'bg-vybe-navy text-white border-vybe-navy shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="text-base">{opt.emoji}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Energy Level */}
        <div>
          <label className="text-xs font-bold text-slate-800 block mb-2">
            4. How is your energy level?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {energyOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setEnergy(opt.value)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                  energy === opt.value
                    ? 'bg-vybe-teal text-white border-vybe-teal shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Available Break Duration */}
        <div>
          <label className="text-xs font-bold text-slate-800 block mb-2">
            5. How much time do you have for a break?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {timeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAvailableTime(opt.value)}
                className={`py-2 px-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                  availableTime === opt.value
                    ? 'bg-vybe-navy text-white border-vybe-navy shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 6. Activity Preference */}
        <div>
          <label className="text-xs font-bold text-slate-800 block mb-2">
            6. What type of activity would you prefer?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categoryOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPreference(opt.value)}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                  preference === opt.value
                    ? 'bg-vybe-mint text-vybe-navy border-vybe-teal font-bold shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 7. Immediate vs Reminder */}
        <div>
          <label className="text-xs font-bold text-slate-800 block mb-2">
            7. Would you like a reminder or an immediate activity?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setReminderMode('immediate')}
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                reminderMode === 'immediate'
                  ? 'bg-vybe-navy text-white border-vybe-navy shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>Immediate Activity</span>
            </button>

            <button
              type="button"
              onClick={() => setReminderMode('reminder')}
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                reminderMode === 'reminder'
                  ? 'bg-vybe-navy text-white border-vybe-navy shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Schedule Reminder</span>
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-vybe-teal" />
            <span>Never shared with employer</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-7 py-3 rounded-xl bg-vybe-teal hover:bg-vybe-teal-dark text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            {loading ? (
              <span>Analyzing Rhythm...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Get Personalised Recommendation</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Recommendation Result Presentation */}
      {result && (
        <div className="bg-gradient-to-br from-white to-vybe-mint/30 rounded-3xl p-6 md:p-8 border-2 border-vybe-teal shadow-xl animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-vybe-teal bg-white px-2.5 py-1 rounded-full border border-vybe-teal/20">
              VYBE Agent Decision
            </span>
            <span className="text-xs font-bold text-slate-500">
              Fit: {result.duration_label} Window
            </span>
          </div>

          <h3 className="text-2xl font-black text-vybe-navy mb-1">{result.activity_name}</h3>
          <p className="text-xs text-vybe-slate mb-4">{result.tagline}</p>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 text-xs text-slate-700 leading-relaxed font-medium mb-4">
            <span className="font-bold text-vybe-navy">Reason: </span>
            {result.reason}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onStartActivity(result.activity_id)}
              className="px-6 py-2.5 rounded-xl bg-vybe-teal hover:bg-vybe-teal-dark text-white font-bold text-xs shadow transition-all active:scale-95 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start {result.activity_name} Now</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
