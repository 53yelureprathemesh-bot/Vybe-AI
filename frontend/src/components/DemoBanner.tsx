import React, { useState } from 'react';
import { WellnessCheckInInput } from '../types';
import { PlayCircle, RotateCcw, Database, Sparkles, Check } from 'lucide-react';
import { api } from '../services/api';

interface DemoBannerProps {
  onLoadScenario: (scenario: WellnessCheckInInput, label: string) => void;
  onRefreshData: () => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ onLoadScenario, onRefreshData }) => {
  const [activeScenario, setActiveScenario] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const scenarios: Array<{
    id: number;
    title: string;
    badge: string;
    description: string;
    data: WellnessCheckInInput;
  }> = [
    {
      id: 1,
      title: 'Scenario 1: Long Screen Focus',
      badge: '90m Screen · 2m Break',
      description: 'Screen: 90m, Sitting: 60m, Mood: Normal, Time: 2m',
      data: {
        screen_session_min: 90,
        sitting_duration_min: 60,
        mood: 'normal',
        energy: 'moderate',
        available_time_seconds: 120,
        preferred_activity_category: 'let_ai_choose',
        reminder_mode: 'immediate'
      }
    },
    {
      id: 2,
      title: 'Scenario 2: Prolonged Sitting',
      badge: '90m Sitting · 5m Walk',
      description: 'Screen: 10m, Sitting: 90m, Mood: Normal, Time: 5m',
      data: {
        screen_session_min: 10,
        sitting_duration_min: 90,
        mood: 'normal',
        energy: 'moderate',
        available_time_seconds: 300,
        preferred_activity_category: 'let_ai_choose',
        reminder_mode: 'immediate'
      }
    },
    {
      id: 3,
      title: 'Scenario 3: Stress Relief',
      badge: 'Stressed · 2m Calm',
      description: 'Screen: 10m, Sitting: 10m, Mood: Stressed, Time: 2m',
      data: {
        screen_session_min: 10,
        sitting_duration_min: 10,
        mood: 'stressed',
        energy: 'moderate',
        available_time_seconds: 120,
        preferred_activity_category: 'let_ai_choose',
        reminder_mode: 'immediate'
      }
    },
    {
      id: 4,
      title: 'Scenario 4: Fatigue / Slump',
      badge: 'Tired · 5m Reset',
      description: 'Screen: 30m, Sitting: 20m, Mood: Tired, Time: 5m',
      data: {
        screen_session_min: 30,
        sitting_duration_min: 20,
        mood: 'tired',
        energy: 'low',
        available_time_seconds: 300,
        preferred_activity_category: 'let_ai_choose',
        reminder_mode: 'immediate'
      }
    },
    {
      id: 5,
      title: 'Scenario 5: 30-Sec Micro-Break',
      badge: '30 Seconds Only',
      description: 'Available time: 30s (Hard duration constraint)',
      data: {
        screen_session_min: 45,
        sitting_duration_min: 45,
        mood: 'normal',
        energy: 'moderate',
        available_time_seconds: 30,
        preferred_activity_category: 'let_ai_choose',
        reminder_mode: 'immediate'
      }
    }
  ];

  const handleSelectScenario = (sc: typeof scenarios[0]) => {
    setActiveScenario(sc.id);
    onLoadScenario(sc.data, sc.title);
    setStatusMsg(`Loaded ${sc.title}`);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleSeedDemoData = async () => {
    setLoading(true);
    try {
      await api.seedDemo();
      setStatusMsg('Seeded 7-day demo history into SQLite!');
      onRefreshData();
    } catch {
      setStatusMsg('Local demo data ready');
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMsg(null), 3500);
    }
  };

  const handleResetDemoData = async () => {
    if (!window.confirm('Reset all demo data and restore initial clean preferences?')) return;
    setLoading(true);
    try {
      await api.resetDemo();
      setActiveScenario(null);
      setStatusMsg('Demo data reset to clean state.');
      onRefreshData();
    } catch {
      setStatusMsg('Demo data cleared.');
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMsg(null), 3500);
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-vybe-navy to-slate-900 text-white px-4 py-2.5 border-b border-slate-700 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Left Label */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vybe-teal opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-vybe-teal"></span>
          </span>
          <span className="font-bold tracking-wide text-vybe-mint">Hackathon Live Demo Bar:</span>
          <span className="text-slate-400 hidden xl:inline">Test evaluation scenarios in 1-click</span>
        </div>

        {/* Center: Scenario Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {scenarios.map((sc) => {
            const isSelected = activeScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => handleSelectScenario(sc)}
                title={sc.description}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 border ${
                  isSelected
                    ? 'bg-vybe-teal text-vybe-navy border-vybe-teal font-bold shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {isSelected ? <Check className="w-3 h-3" /> : <PlayCircle className="w-3 h-3 text-vybe-teal" />}
                <span>{sc.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Data Controls */}
        <div className="flex items-center gap-2">
          {statusMsg && (
            <span className="text-[11px] text-vybe-teal font-medium animate-fade-in hidden sm:inline">
              {statusMsg}
            </span>
          )}

          <button
            onClick={handleSeedDemoData}
            disabled={loading}
            title="Pre-populate 7-day realistic activity & feedback records for analytics"
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 border border-slate-700 transition-colors"
          >
            <Database className="w-3 h-3 text-cyan-400" />
            <span>Seed 7D Data</span>
          </button>

          <button
            onClick={handleResetDemoData}
            disabled={loading}
            title="Clear all demo history and restore initial state"
            className="px-2.5 py-1 rounded-md bg-rose-950/60 hover:bg-rose-900 text-rose-200 text-[11px] font-medium flex items-center gap-1 border border-rose-800/60 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
