import React, { useState } from 'react';
import { WellnessCheckInInput, Recommendation, UserProfile } from '../types';
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
  Check,
  CheckCircle,
  Eye,
  Activity as ActivityIcon,
  Heart,
  Footprints,
  Droplets,
  Moon
} from 'lucide-react';
import { api } from '../services/api';

interface CheckInViewProps {
  initialValues?: WellnessCheckInInput | null;
  user?: UserProfile;
  currentRecommendation?: Recommendation | null;
  onRecommendationReceived: (rec: Recommendation) => void;
  onStartActivity: (activityId: string) => void;
}

export const CheckInView: React.FC<CheckInViewProps> = ({
  initialValues,
  user,
  currentRecommendation,
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
  const [result, setResult] = useState<Recommendation | null>(currentRecommendation || null);
  const resultRef = React.useRef<HTMLDivElement>(null);

  // Sync state if currentRecommendation changes
  React.useEffect(() => {
    if (currentRecommendation) {
      setResult(currentRecommendation);
    }
  }, [currentRecommendation]);

  // Sync form inputs and auto-generate recommendations when opened or when scenario is loaded
  React.useEffect(() => {
    if (initialValues) {
      if (initialValues.screen_session_min !== undefined) setScreenMin(initialValues.screen_session_min);
      if (initialValues.sitting_duration_min !== undefined) setSittingMin(initialValues.sitting_duration_min);
      if (initialValues.mood) setMood(initialValues.mood);
      if (initialValues.energy) setEnergy(initialValues.energy);
      if (initialValues.available_time_seconds !== undefined) setAvailableTime(initialValues.available_time_seconds);
      if (initialValues.preferred_activity_category) setPreference(initialValues.preferred_activity_category);
      if (initialValues.reminder_mode) setReminderMode(initialValues.reminder_mode);

      evaluateRecommendation({
        user_id: user?.user_id || 'default_user',
        screen_session_min: initialValues.screen_session_min ?? screenMin,
        sitting_duration_min: initialValues.sitting_duration_min ?? sittingMin,
        mood: initialValues.mood ?? mood,
        energy: initialValues.energy ?? energy,
        available_time_seconds: initialValues.available_time_seconds ?? availableTime,
        preferred_activity_category: initialValues.preferred_activity_category ?? preference,
        reminder_mode: initialValues.reminder_mode ?? reminderMode
      }, false);
    } else if (!result && !currentRecommendation) {
      // Evaluate default initial recommendations so the user has immediate options
      evaluateRecommendation({
        user_id: user?.user_id || 'default_user',
        screen_session_min: screenMin,
        sitting_duration_min: sittingMin,
        mood,
        energy,
        available_time_seconds: availableTime,
        preferred_activity_category: preference,
        reminder_mode: reminderMode
      }, false);
    }
  }, [initialValues]);

  const evaluateRecommendation = async (payload: WellnessCheckInInput, shouldScroll = true) => {
    setLoading(true);
    try {
      const rec = await api.getRecommendation(payload);
      setResult(rec);
      onRecommendationReceived(rec);
      if (shouldScroll) {
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: WellnessCheckInInput = {
      user_id: user?.user_id || 'default_user',
      screen_session_min: screenMin,
      sitting_duration_min: sittingMin,
      mood,
      energy,
      available_time_seconds: availableTime,
      preferred_activity_category: preference,
      reminder_mode: reminderMode
    };
    await evaluateRecommendation(payload, true);
  };

  const handleSelectAlternative = async (alt: Recommendation['alternatives'][0]) => {
    const act = await api.getActivity(alt.id);
    const prevResult = result;
    const newRec: Recommendation = {
      activity_id: alt.id,
      activity_name: alt.name,
      tagline: alt.tagline || act?.tagline || '',
      category: alt.category,
      duration_seconds: alt.duration_seconds,
      duration_label: alt.duration_label || (alt.duration_seconds < 60 ? `${alt.duration_seconds}s` : `${Math.floor(alt.duration_seconds / 60)} min`),
      description: alt.description || act?.description || '',
      reason: alt.reason || `Selected as an alternative option matching your check-in.`,
      confidence_score: alt.confidence_score || 0.9,
      alternatives: prevResult
        ? [
            {
              id: prevResult.activity_id,
              name: prevResult.activity_name,
              tagline: prevResult.tagline,
              duration_seconds: prevResult.duration_seconds,
              duration_label: prevResult.duration_label,
              category: prevResult.category,
              description: prevResult.description,
              reason: prevResult.reason,
              confidence_score: prevResult.confidence_score
            },
            ...prevResult.alternatives.filter(a => a.id !== alt.id)
          ]
        : [],
      action_type: reminderMode === 'immediate' ? 'immediate' : 'scheduled',
      source: 'rule_engine'
    };
    setResult(newRec);
    onRecommendationReceived(newRec);
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
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
        <div ref={resultRef} className="space-y-6 animate-slide-up pt-4">
          {/* 1. Primary Recommendation Card */}
          <div className="bg-gradient-to-br from-white via-vybe-mint/20 to-teal-50 rounded-3xl p-6 md:p-8 border-2 border-vybe-teal shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-vybe-teal bg-white px-3 py-1 rounded-full border border-vybe-teal/20 flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-vybe-teal" />
                  Primary Recommendation
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
                  {result.category.replace('_', ' ')}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200">
                Fit: {result.duration_label} Window
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-vybe-navy mb-1">{result.activity_name}</h3>
                <p className="text-xs sm:text-sm font-medium text-vybe-slate mb-3">{result.tagline}</p>
                <p className="text-xs text-slate-600 mb-4 max-w-2xl">{result.description}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 border border-teal-100 text-xs text-slate-700 leading-relaxed font-medium mb-6 shadow-sm">
              <span className="font-bold text-vybe-navy">Why this fits your check-in: </span>
              {result.reason}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onStartActivity(result.activity_id)}
                className="px-7 py-3 rounded-xl bg-vybe-teal hover:bg-vybe-teal-dark text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start {result.activity_name} Now ({result.duration_label})</span>
              </button>
            </div>
          </div>

          {/* 2. Multiple Alternative Options Matched to Check-In */}
          {result.alternatives && result.alternatives.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-vybe-navy flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-vybe-teal" />
                    <span>Alternative Options for Your Rhythm</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Prefer a different focus? Select any option below as your active exercise or start it right away.
                  </p>
                </div>
                <span className="text-xs font-semibold text-vybe-teal bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                  {result.alternatives.length} More Options
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.alternatives.map((alt) => (
                  <div
                    key={alt.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-vybe-teal/60 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-bold text-vybe-teal capitalize bg-vybe-mint/40 px-2 py-0.5 rounded-md">
                          {alt.category.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {alt.duration_label || (alt.duration_seconds < 60 ? `${alt.duration_seconds}s` : `${Math.floor(alt.duration_seconds / 60)}m`)}
                        </span>
                      </div>

                      <h5 className="text-base font-bold text-vybe-navy group-hover:text-vybe-teal transition-colors">
                        {alt.name}
                      </h5>
                      {alt.tagline && (
                        <p className="text-[11px] text-slate-400 font-medium mb-2">{alt.tagline}</p>
                      )}
                      <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                        {alt.description}
                      </p>

                      {alt.reason && (
                        <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100 mb-3">
                          {alt.reason}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100 mt-2">
                      <button
                        type="button"
                        onClick={() => handleSelectAlternative(alt)}
                        className="flex-1 py-2 px-3 rounded-lg border border-vybe-teal text-vybe-teal hover:bg-vybe-mint/30 font-bold text-xs transition-all text-center flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Select Option</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onStartActivity(alt.id)}
                        className="py-2 px-3 rounded-lg bg-vybe-navy hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-1"
                        title="Start immediately"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
