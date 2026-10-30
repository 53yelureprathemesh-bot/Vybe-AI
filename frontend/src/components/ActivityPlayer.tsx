import React, { useState, useEffect, useRef } from 'react';
import { Activity } from '../types';
import { Play, Pause, Square, CheckCircle, ThumbsUp, Minus, ThumbsDown, X, Sparkles, Volume2, VolumeX, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

interface ActivityPlayerProps {
  activity: Activity;
  onClose: () => void;
  onCompleted: (activityId: string) => void;
  onSelectNext?: (activityId: string) => void;
}

export const ActivityPlayer: React.FC<ActivityPlayerProps> = ({
  activity,
  onClose,
  onCompleted,
  onSelectNext
}) => {
  const totalSeconds = activity.duration_seconds;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(totalSeconds);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // Feedback state
  const [feedbackRating, setFeedbackRating] = useState<'helpful' | 'okay' | 'not_helpful' | null>(null);
  const [wantSimilar, setWantSimilar] = useState<boolean>(true);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  // Timestamp-based timing to prevent drift or rerender resets
  const startTimeRef = useRef<number>(Date.now());
  const pausedTimeRef = useRef<number>(0);
  const pauseStartRef = useRef<number | null>(null);
  const recordIdRef = useRef<number | null>(null);

  // Play gentle synthesized chime using Web Audio API
  const playChime = (freq = 528, type: OscillatorType = 'sine', duration = 0.6) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      // AudioContext not allowed or unsupported
    }
  };

  // Main countdown loop based on wall-clock elapsed time
  useEffect(() => {
    if (isFinished || isPaused) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedMs = now - startTimeRef.current - pausedTimeRef.current;
      const elapsedSec = Math.floor(elapsedMs / 1000);
      const remaining = Math.max(0, totalSeconds - elapsedSec);

      setSecondsRemaining(remaining);

      // Determine step based on elapsed seconds
      if (activity.steps && activity.steps.length > 0) {
        let accumulatedSec = 0;
        let stepIdx = 0;
        for (let i = 0; i < activity.steps.length; i++) {
          accumulatedSec += activity.steps[i].seconds;
          if (elapsedSec < accumulatedSec) {
            stepIdx = i;
            break;
          }
          stepIdx = activity.steps.length - 1;
        }
        if (stepIdx !== currentStepIndex) {
          setCurrentStepIndex(stepIdx);
          playChime(660, 'sine', 0.2);
        }
      }

      if (remaining <= 0) {
        clearInterval(interval);
        handleActivityComplete();
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isPaused, isFinished, totalSeconds, currentStepIndex, activity.steps]);

  // Handle Pause / Resume
  const togglePause = () => {
    if (isPaused) {
      // Resuming
      if (pauseStartRef.current) {
        pausedTimeRef.current += Date.now() - pauseStartRef.current;
        pauseStartRef.current = null;
      }
      setIsPaused(false);
    } else {
      // Pausing
      pauseStartRef.current = Date.now();
      setIsPaused(true);
    }
  };

  // Stop early
  const handleStop = async () => {
    const elapsed = totalSeconds - secondsRemaining;
    if (elapsed >= 5) {
      // Record partial activity
      const now = new Date().toISOString();
      await api.recordActivity({
        user_id: 'default_user',
        activity_id: activity.id,
        activity_name: activity.name,
        category: activity.category,
        duration_seconds: elapsed,
        started_at: new Date(startTimeRef.current).toISOString(),
        completed_at: now,
        status: 'stopped_early'
      });
    }
    onClose();
  };

  // Activity completed
  const handleActivityComplete = async () => {
    setIsFinished(true);
    playChime(784, 'triangle', 0.8);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    const now = new Date().toISOString();
    const res = await api.recordActivity({
      user_id: 'default_user',
      activity_id: activity.id,
      activity_name: activity.name,
      category: activity.category,
      duration_seconds: totalSeconds,
      started_at: new Date(startTimeRef.current).toISOString(),
      completed_at: now,
      status: 'completed'
    });
    recordIdRef.current = res.record_id;
    onCompleted(activity.id);
  };

  // Submit Feedback
  const handleSubmitFeedback = async (rating: 'helpful' | 'okay' | 'not_helpful') => {
    setFeedbackRating(rating);
    await api.submitFeedback({
      user_id: 'default_user',
      activity_id: activity.id,
      rating,
      want_similar: wantSimilar,
      record_id: recordIdRef.current || undefined
    });
    setFeedbackSubmitted(true);
  };

  const progressPercent = Math.min(100, Math.round(((totalSeconds - secondsRemaining) / totalSeconds) * 100));
  const currentStep = activity.steps && activity.steps[currentStepIndex]
    ? activity.steps[currentStepIndex]
    : { text: activity.instructions[0] || 'Follow the rhythm and breathe naturally.' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 md:p-8 relative border border-slate-100 flex flex-col items-center overflow-hidden">
        
        {/* Top Controls: Sound toggle & Close */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-vybe-teal bg-vybe-mint/60 px-2.5 py-1 rounded-full">
              {activity.category.replace('_', ' ')}
            </span>
            <span className="text-xs text-slate-400 font-medium">{activity.intensity} Intensity</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute sound chime' : 'Enable sound chime'}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-vybe-teal" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={handleStop}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Not Finished: Active Activity Guidance */}
        {!isFinished ? (
          <div className="w-full flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold text-vybe-navy mb-1">{activity.name}</h2>
            <p className="text-xs text-vybe-slate mb-6">{activity.tagline}</p>

            {/* Circular Timer Visual with Breathing Glow */}
            <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-full border-4 border-vybe-mint animate-breathe-subtle"></div>
              
              {/* SVG Ring Progress */}
              <svg className="w-48 h-48 -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="#E2E8F0"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="#14B8A6"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 80}
                  strokeDashoffset={2 * Math.PI * 80 * (1 - progressPercent / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-300 ease-linear"
                />
              </svg>

              {/* Center Countdown Display */}
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-extrabold text-vybe-navy font-mono">
                  {Math.floor(secondsRemaining / 60)}:{(secondsRemaining % 60).toString().padStart(2, '0')}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                  {isPaused ? 'Paused' : 'Remaining'}
                </span>
              </div>
            </div>

            {/* Current Step Instruction Card */}
            <div className="w-full min-h-[90px] bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-6 flex flex-col justify-center shadow-inner">
              <span className="text-[10px] font-bold uppercase tracking-wider text-vybe-teal mb-1">
                Step {currentStepIndex + 1} of {activity.steps?.length || 1}
              </span>
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                {currentStep.text}
              </p>
            </div>

            {/* Player Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={togglePause}
                className="px-6 py-2.5 rounded-xl bg-vybe-navy hover:bg-vybe-navy-light text-white font-semibold text-xs flex items-center gap-2 shadow transition-all active:scale-95"
              >
                {isPaused ? (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Resume</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause</span>
                  </>
                )}
              </button>

              <button
                onClick={handleStop}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-2 transition-all active:scale-95"
              >
                <Square className="w-3.5 h-3.5 fill-slate-700" />
                <span>Stop</span>
              </button>
            </div>
          </div>
        ) : (
          /* Finished Screen: Feedback & Completion */
          <div className="w-full flex flex-col items-center text-center animate-fade-in py-2">
            <div className="w-14 h-14 rounded-2xl bg-vybe-mint flex items-center justify-center text-vybe-teal mb-3 shadow-md">
              <CheckCircle className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold text-vybe-navy mb-1">Great rhythm!</h2>
            <p className="text-xs text-slate-500 mb-6">
              You completed <span className="font-bold text-vybe-navy">{activity.name}</span> ({activity.duration_seconds} seconds).
              Saved to your personal journey history.
            </p>

            {/* Feedback Question */}
            <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-5 mb-6 text-left">
              <p className="text-xs font-bold text-slate-800 mb-3">
                How do you feel about this activity?
              </p>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  onClick={() => handleSubmitFeedback('helpful')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    feedbackRating === 'helpful'
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Helpful</span>
                </button>

                <button
                  onClick={() => handleSubmitFeedback('okay')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    feedbackRating === 'okay'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
                  }`}
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>Okay</span>
                </button>

                <button
                  onClick={() => handleSubmitFeedback('not_helpful')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    feedbackRating === 'not_helpful'
                      ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300 hover:bg-rose-50/50'
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>Not helpful</span>
                </button>
              </div>

              {/* Follow-up question */}
              <div className="flex items-center justify-between text-xs text-slate-600 pt-3 border-t border-slate-200/60">
                <span>Would you like similar activities in the future?</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wantSimilar}
                    onChange={(e) => setWantSimilar(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-vybe-teal"></div>
                </label>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-3 w-full justify-center">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-vybe-navy hover:bg-vybe-navy-light text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
              >
                Return to Dashboard
              </button>

              {onSelectNext && (
                <button
                  onClick={() => onSelectNext('deskyoga')}
                  className="px-5 py-2.5 rounded-xl bg-vybe-mint text-vybe-navy hover:bg-vybe-mint-dark text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <span>Optional Next Activity</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
