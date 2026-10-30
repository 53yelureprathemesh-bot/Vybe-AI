import React from 'react';
import { Bell, Play, Clock, X } from 'lucide-react';
import { Activity } from '../types';

interface ReminderToastProps {
  activity: Activity;
  scheduledTime: string;
  onStart: (activityId: string) => void;
  onSnooze: (minutes: number) => void;
  onDismiss: () => void;
}

export const ReminderToast: React.FC<ReminderToastProps> = ({
  activity,
  scheduledTime,
  onStart,
  onSnooze,
  onDismiss
}) => {
  return (
    <div className="fixed bottom-5 right-5 z-40 max-w-sm w-full bg-white rounded-2xl shadow-2xl border border-vybe-teal/30 p-4 animate-slide-up transition-all">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-vybe-mint flex items-center justify-center text-vybe-teal shadow-inner">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-vybe-teal">
              Time for a rhythm reset
            </span>
            <h4 className="text-sm font-bold text-vybe-navy">{activity.name}</h4>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-slate-600 mb-3 leading-relaxed">
        {activity.description}
      </p>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onStart(activity.id)}
          className="flex-1 py-2 px-3 rounded-xl bg-vybe-teal hover:bg-vybe-teal-dark text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Start Now ({activity.duration_seconds}s)</span>
        </button>

        {/* Snooze Options */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSnooze(5)}
            title="Snooze 5 minutes"
            className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors"
          >
            +5m
          </button>
          <button
            onClick={() => onSnooze(10)}
            title="Snooze 10 minutes"
            className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors"
          >
            +10m
          </button>
        </div>
      </div>
    </div>
  );
};
