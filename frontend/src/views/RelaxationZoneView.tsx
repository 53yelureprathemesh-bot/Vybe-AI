import React, { useState, useEffect } from 'react';
import { Activity, UserPreferences } from '../types';
import {
  Sparkles,
  Play,
  Heart,
  Eye,
  Activity as ActivityIcon,
  Footprints,
  Droplets,
  Moon,
  Check,
  Ban,
  Clock,
  Flame
} from 'lucide-react';
import { api, defaultActivities } from '../services/api';

interface RelaxationZoneViewProps {
  onStartActivity: (activityId: string) => void;
}

export const RelaxationZoneView: React.FC<RelaxationZoneViewProps> = ({ onStartActivity }) => {
  const [activities, setActivities] = useState<Activity[]>(defaultActivities);
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [acts, userPrefs] = await Promise.all([
      api.getActivities(),
      api.getPreferences('default_user')
    ]);
    setActivities(acts);
    setPrefs(userPrefs);
  };

  const toggleFavorite = async (activityId: string) => {
    if (!prefs) return;
    const currentFavs = new Set(prefs.favorite_activities || []);
    if (currentFavs.has(activityId)) {
      currentFavs.delete(activityId);
    } else {
      currentFavs.add(activityId);
    }
    const updated = { ...prefs, favorite_activities: Array.from(currentFavs) };
    setPrefs(updated);
    await api.updatePreferences(updated);
  };

  const toggleDisabled = async (activityId: string) => {
    if (!prefs) return;
    const currentDisabled = new Set(prefs.disabled_activities || []);
    if (currentDisabled.has(activityId)) {
      currentDisabled.delete(activityId);
    } else {
      currentDisabled.add(activityId);
    }
    const updated = { ...prefs, disabled_activities: Array.from(currentDisabled) };
    setPrefs(updated);
    await api.updatePreferences(updated);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Eye':
        return Eye;
      case 'Activity':
        return ActivityIcon;
      case 'Heart':
        return Heart;
      case 'Footprints':
        return Footprints;
      case 'Droplets':
        return Droplets;
      case 'Moon':
        return Moon;
      default:
        return Sparkles;
    }
  };

  const categories = [
    { id: 'all', label: 'All Activities' },
    { id: 'eye_relaxation', label: 'Eye Relaxation' },
    { id: 'movement', label: 'Movement' },
    { id: 'breathing_relaxation', label: 'Breathing' },
    { id: 'walking', label: 'Walking' },
    { id: 'hydration', label: 'Hydration' },
    { id: 'quiet_rest', label: 'Quiet Rest' }
  ];

  const filteredActivities = activities.filter((act) => {
    if (selectedCategory !== 'all' && act.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-vybe-teal">
          Approved Wellness Library
        </span>
        <h1 className="text-3xl font-extrabold text-vybe-navy mt-1">Your Space to Reset</h1>
        <p className="text-xs text-slate-500 mt-2">
          Explore evidence-based micro-breaks designed to restore focus, posture, and circulation.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedCategory === cat.id
                ? 'bg-vybe-navy text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Activity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map((act) => {
          const Icon = getIcon(act.icon);
          const isFavorite = prefs?.favorite_activities?.includes(act.id);
          const isDisabled = prefs?.disabled_activities?.includes(act.id);

          return (
            <div
              key={act.id}
              className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                isDisabled
                  ? 'border-slate-200 opacity-50 bg-slate-50/50'
                  : 'border-slate-200/90 hover:border-vybe-teal/50 shadow-sm hover:shadow-md'
              }`}
            >
              <div>
                {/* Card Top: Category, Intensity & Favorite */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-vybe-teal bg-vybe-mint/60 px-2 py-0.5 rounded-md">
                      {act.category.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {act.intensity}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Favorite toggle */}
                    <button
                      onClick={() => toggleFavorite(act.id)}
                      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-300'
                        }`}
                      />
                    </button>

                    {/* Disable toggle */}
                    <button
                      onClick={() => toggleDisabled(act.id)}
                      title={isDisabled ? 'Enable activity' : 'Disable activity'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDisabled ? 'text-rose-500 hover:bg-rose-50' : 'text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Activity Icon & Title */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-vybe-mint flex items-center justify-center text-vybe-teal shadow-inner">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-vybe-navy">{act.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                      <Clock className="w-3 h-3 text-vybe-teal" />
                      <span>{act.duration_seconds < 60 ? `${act.duration_seconds} sec` : `${act.duration_seconds / 60} min`}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">{act.description}</p>

                {/* Key Benefits */}
                <div className="space-y-1 mb-6">
                  {act.benefits?.map((b, bIdx) => (
                    <div key={bIdx} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Check className="w-3 h-3 text-vybe-teal shrink-0" />
                      <span className="truncate">{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div>
                {isDisabled ? (
                  <button
                    onClick={() => toggleDisabled(act.id)}
                    className="w-full py-2.5 rounded-xl bg-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-300 transition-colors"
                  >
                    Disabled (Click to Enable)
                  </button>
                ) : (
                  <button
                    onClick={() => onStartActivity(act.id)}
                    className="w-full py-2.5 rounded-xl bg-vybe-navy hover:bg-vybe-navy-light text-white font-bold text-xs shadow-sm hover:shadow transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Start {act.name} ({act.duration_seconds < 60 ? `${act.duration_seconds}s` : `${act.duration_seconds / 60}m`})</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
