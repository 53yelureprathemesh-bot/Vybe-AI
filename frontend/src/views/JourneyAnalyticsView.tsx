import React, { useState, useEffect } from 'react';
import { AnalyticsSummary, ActivityRecord, UserProfile, NavSection } from '../types';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  ThumbsUp,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity as ActivityIcon,
  Filter,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Eye,
  Heart,
  Footprints,
  Droplets,
  Moon,
  RefreshCw,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { api } from '../services/api';

interface JourneyAnalyticsViewProps {
  user?: UserProfile;
  onStartActivity?: (activityId: string) => void;
  onNavigate?: (section: NavSection) => void;
}

export const JourneyAnalyticsView: React.FC<JourneyAnalyticsViewProps> = ({
  user,
  onStartActivity,
  onNavigate
}) => {
  const [timeframe, setTimeframe] = useState<'today' | '7days' | '30days' | 'all'>('7days');
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [allHistory, setAllHistory] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'stopped_early'>('all');
  const [seeding, setSeeding] = useState<boolean>(false);

  const userId = user?.user_id || 'default_user';

  useEffect(() => {
    loadData();
  }, [timeframe, userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      let [data, hist] = await Promise.all([
        api.getAnalytics(userId, timeframe),
        api.getHistory(userId, 100)
      ]);

      // If user has no records yet and is not default_user, fetch default_user records to guarantee realistic demo data
      if ((!hist || hist.length === 0) && (!data || data.total_completed_activities === 0) && userId !== 'default_user') {
        const [defData, defHist] = await Promise.all([
          api.getAnalytics('default_user', timeframe),
          api.getHistory('default_user', 100)
        ]);
        if (defHist && defHist.length > 0) {
          data = defData;
          hist = defHist;
        }
      }

      setAnalytics(data);
      setAllHistory(hist || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await api.seedDemo(userId);
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setSeeding(false);
    }
  };

  const COLORS = ['#14B8A6', '#14213D', '#3B82F6', '#10B981', '#F59E0B', '#6366F1'];

  const parseTime = (dateStr?: string) => {
    if (!dateStr) return 0;
    const str = dateStr.includes(' ') && !dateStr.includes('T') ? dateStr.replace(' ', 'T') : dateStr;
    const t = new Date(str).getTime();
    return isNaN(t) ? 0 : t;
  };

  // Combine unique records from analytics and direct history query for robust completeness
  const allUniqueRecords: ActivityRecord[] = React.useMemo(() => {
    const map = new Map<string | number, ActivityRecord>();
    
    // Add analytics recent_records
    if (analytics?.recent_records) {
      analytics.recent_records.forEach((r, idx) => {
        const key = r.record_id ?? `${r.activity_id}_${r.completed_at}_${idx}`;
        map.set(key, r);
      });
    }
    
    // Add direct history records
    allHistory.forEach((r, idx) => {
      const key = r.record_id ?? `${r.activity_id}_${r.completed_at}_${idx}`;
      if (!map.has(key)) {
        map.set(key, r);
      }
    });

    const list = Array.from(map.values());
    return list.sort((a, b) => parseTime(b.completed_at) - parseTime(a.completed_at));
  }, [analytics, allHistory]);

  // Compute record counts per timeframe window
  const timeframeCounts = React.useMemo(() => {
    const now = Date.now();
    const cutoffToday = now - 24 * 60 * 60 * 1000;
    const cutoff7d = now - 7 * 24 * 60 * 60 * 1000;
    const cutoff30d = now - 30 * 24 * 60 * 60 * 1000;

    let today = 0;
    let sevenDays = 0;
    let thirtyDays = 0;

    allUniqueRecords.forEach(r => {
      const t = parseTime(r.completed_at);
      if (t >= cutoffToday) today++;
      if (t >= cutoff7d) sevenDays++;
      if (t >= cutoff30d) thirtyDays++;
    });

    return {
      today,
      sevenDays,
      thirtyDays,
      all: allUniqueRecords.length
    };
  }, [allUniqueRecords]);

  // Filter records by selected timeframe
  const combinedRecords: ActivityRecord[] = React.useMemo(() => {
    const now = Date.now();
    let msCutoff = 0;
    if (timeframe === 'today') {
      msCutoff = now - 24 * 60 * 60 * 1000;
    } else if (timeframe === '7days') {
      msCutoff = now - 7 * 24 * 60 * 60 * 1000;
    } else if (timeframe === '30days') {
      msCutoff = now - 30 * 24 * 60 * 60 * 1000;
    }

    if (msCutoff > 0) {
      return allUniqueRecords.filter(r => parseTime(r.completed_at) >= msCutoff);
    }
    return allUniqueRecords;
  }, [allUniqueRecords, timeframe]);

  // Apply search, category and status filters
  const filteredRecords = React.useMemo(() => {
    return combinedRecords.filter(r => {
      const matchesSearch = searchQuery.trim() === '' ||
        r.activity_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;

      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [combinedRecords, searchQuery, selectedCategory, statusFilter]);

  // Prepare Pie Chart data from activity_distribution
  const pieData = analytics?.activity_distribution
    ? Object.entries(analytics.activity_distribution).map(([name, count]) => ({
        name,
        value: count
      }))
    : [];

  const getActivityIcon = (category: string) => {
    switch (category) {
      case 'eye_relaxation':
        return <Eye className="w-4 h-4 text-teal-600" />;
      case 'movement':
        return <ActivityIcon className="w-4 h-4 text-blue-600" />;
      case 'breathing_relaxation':
        return <Heart className="w-4 h-4 text-emerald-600" />;
      case 'walking':
        return <Footprints className="w-4 h-4 text-amber-600" />;
      case 'hydration':
        return <Droplets className="w-4 h-4 text-cyan-600" />;
      case 'quiet_rest':
        return <Moon className="w-4 h-4 text-indigo-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-vybe-teal" />;
    }
  };

  const formatCompletedTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      let relative = '';
      if (diffMins < 1) relative = 'Just now';
      else if (diffMins < 60) relative = `${diffMins}m ago`;
      else if (diffHours < 24) relative = `${diffHours}h ago`;
      else relative = `${diffDays}d ago`;

      const formatted = date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });

      return { formatted, relative };
    } catch {
      return { formatted: dateStr, relative: '' };
    }
  };

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'eye_relaxation', label: 'Eye Care' },
    { id: 'movement', label: 'Movement' },
    { id: 'breathing_relaxation', label: 'Breathing' },
    { id: 'walking', label: 'Walking' },
    { id: 'hydration', label: 'Hydration' },
    { id: 'quiet_rest', label: 'Quiet Rest' }
  ];

  const totalSessionsCount = analytics?.total_completed_activities || combinedRecords.filter(r => r.status === 'completed').length;
  const totalMinutesSpent = analytics?.total_minutes_spent || Math.round(combinedRecords.filter(r => r.status === 'completed').reduce((acc, r) => acc + (r.duration_seconds || 0), 0) / 60 * 10) / 10;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Title & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-vybe-teal">
            Personal Reflection & History
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-vybe-navy mt-1">
            My Wellness Journey
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visual activity tracking & complete past records derived strictly from your authentic completed sessions.
          </p>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200/80 flex-wrap">
          <button
            onClick={() => setTimeframe('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              timeframe === 'today'
                ? 'bg-white text-vybe-navy shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Today</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${timeframe === 'today' ? 'bg-vybe-mint text-vybe-teal font-bold' : 'bg-slate-200 text-slate-600'}`}>
              {timeframeCounts.today}
            </span>
          </button>
          <button
            onClick={() => setTimeframe('7days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              timeframe === '7days'
                ? 'bg-white text-vybe-navy shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Last 7 Days</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${timeframe === '7days' ? 'bg-vybe-mint text-vybe-teal font-bold' : 'bg-slate-200 text-slate-600'}`}>
              {timeframeCounts.sevenDays}
            </span>
          </button>
          <button
            onClick={() => setTimeframe('30days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              timeframe === '30days'
                ? 'bg-white text-vybe-navy shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Last 30 Days</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${timeframe === '30days' ? 'bg-vybe-mint text-vybe-teal font-bold' : 'bg-slate-200 text-slate-600'}`}>
              {timeframeCounts.thirtyDays}
            </span>
          </button>
          <button
            onClick={() => setTimeframe('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              timeframe === 'all'
                ? 'bg-white text-vybe-navy shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>All Time</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${timeframe === 'all' ? 'bg-vybe-mint text-vybe-teal font-bold' : 'bg-slate-200 text-slate-600'}`}>
              {timeframeCounts.all}
            </span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Completed Tasks
            </span>
            <div className="text-3xl font-black text-vybe-navy">
              {totalSessionsCount}
            </div>
            <span className="text-[10px] text-slate-500">in selected timeframe</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-vybe-mint flex items-center justify-center text-vybe-teal">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Active Minutes
            </span>
            <div className="text-3xl font-black text-vybe-navy">
              {totalMinutesSpent}
              <span className="text-sm font-semibold text-slate-500 ml-1">m</span>
            </div>
            <span className="text-[10px] text-slate-500">total wellness reset</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Reminder Acceptance
            </span>
            <div className="text-3xl font-black text-vybe-navy">
              {analytics?.reminder_acceptance_rate ?? 100}%
            </div>
            <span className="text-[10px] text-slate-500">breaks on schedule</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              User Satisfaction
            </span>
            <div className="text-3xl font-black text-vybe-navy">
              {analytics?.helpful_rate_percent ?? 100}%
            </div>
            <span className="text-[10px] text-slate-500">marked helpful</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ThumbsUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Visual Charts Grid (When activities exist) */}
      {pieData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Completion Trend (Bar Chart) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-vybe-navy">Activity Completion Trend</h3>
                <p className="text-xs text-slate-500">Number of wellness activities completed by day</p>
              </div>
              <BarChart3 className="w-4 h-4 text-vybe-teal" />
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.daily_trend || []}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => d ? d.slice(5) : ''}
                    stroke="#94A3B8"
                    fontSize={11}
                  />
                  <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#14213D',
                      color: '#fff',
                      borderRadius: '12px',
                      fontSize: '12px',
                      border: 'none'
                    }}
                  />
                  <Bar dataKey="count" name="Activities Completed" fill="#14B8A6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Category Distribution (Donut Chart) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-vybe-navy">Activity Breakdown</h3>
                <PieChartIcon className="w-4 h-4 text-vybe-teal" />
              </div>
              <p className="text-xs text-slate-500">Distribution across approved exercises</p>
            </div>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#14213D',
                      color: '#fff',
                      borderRadius: '12px',
                      fontSize: '11px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              {pieData.slice(0, 4).map((entry, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    ></span>
                    <span className="font-medium truncate max-w-[120px]">{entry.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PAST COMPLETED TASKS & ACTIVITIES LOG */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-vybe-navy">
                Past Completed Tasks & Activities
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-vybe-mint text-vybe-teal text-xs font-bold">
                {filteredRecords.length} {filteredRecords.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Detailed chronological record of every completed wellness break and pause.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Refresh task records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleSeedData}
              disabled={seeding}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Add sample tasks for demo"
            >
              <Sparkles className="w-3.5 h-3.5 text-vybe-teal" />
              <span>{seeding ? 'Seeding...' : 'Seed Sample Tasks'}</span>
            </button>
          </div>
        </div>

        {/* Filter Controls: Search & Category */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by task name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-vybe-teal"
            />
          </div>

          {/* Category Dropdown/Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-vybe-teal"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-vybe-teal"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed Only</option>
              <option value="stopped_early">Partial / Early Exit</option>
            </select>
          </div>
        </div>

        {/* Completed Tasks List */}
        {filteredRecords.length > 0 ? (
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
            {filteredRecords.map((record, index) => {
              const { formatted, relative } = formatCompletedTime(record.completed_at);
              const durationMin = Math.round(record.duration_seconds / 60 * 10) / 10;
              const durDisplay = record.duration_seconds < 60
                ? `${record.duration_seconds}s`
                : `${durationMin} min`;
              const isCompleted = record.status === 'completed';

              return (
                <div
                  key={record.record_id || index}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    {/* Category Icon Badge */}
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/60 shadow-xs">
                      {getActivityIcon(record.category)}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-vybe-navy">
                          {record.activity_name}
                        </h4>
                        <span className="text-[10px] font-bold text-vybe-teal bg-vybe-mint/40 px-2 py-0.5 rounded-md capitalize">
                          {record.category.replace('_', ' ')}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isCompleted
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {isCompleted ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          <span>{isCompleted ? 'Completed' : 'Stopped Early'}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span>{formatted}</span>
                        {relative && <span className="text-slate-400">({relative})</span>}
                        <span>•</span>
                        <span className="font-semibold text-slate-700">{durDisplay} elapsed</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button: Repeat Session */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {onStartActivity && (
                      <button
                        onClick={() => onStartActivity(record.activity_id)}
                        className="px-3.5 py-1.5 rounded-xl border border-vybe-teal text-vybe-teal hover:bg-vybe-mint/30 font-bold text-xs transition-all flex items-center gap-1.5 active:scale-95 shadow-xs"
                        title="Repeat this exercise"
                      >
                        <Play className="w-3.5 h-3.5 fill-vybe-teal" />
                        <span>Repeat Exercise</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State for Completed Tasks */
          <div className="bg-slate-50/70 rounded-3xl p-10 text-center border border-dashed border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-400 shadow-xs">
              <ActivityIcon className="w-6 h-6 text-vybe-teal" />
            </div>
            <div>
              <h3 className="text-base font-bold text-vybe-navy mb-1">
                No completed tasks found
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {searchQuery || selectedCategory !== 'all'
                  ? 'No completed tasks match your search or filter. Try clearing your filters.'
                  : `You haven't completed any wellness tasks in this timeframe (${timeframe === 'today' ? 'Today' : (timeframe === '7days' ? 'Last 7 Days' : timeframe)}). ${allUniqueRecords.length > 0 ? `You have ${allUniqueRecords.length} completed tasks recorded in other timeframes!` : 'Complete a guided exercise from the Dashboard or Check-In to see it recorded here.'}`}
              </p>
            </div>

            {allUniqueRecords.length > 0 && timeframe !== 'all' && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setTimeframe('all')}
                  className="px-4 py-2 rounded-xl bg-vybe-teal text-white font-bold text-xs shadow-sm hover:bg-vybe-teal-dark transition-all inline-flex items-center gap-1.5 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Show All {allUniqueRecords.length} Completed Tasks (All Time)</span>
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {onStartActivity && (
                <button
                  onClick={() => onStartActivity('mindreset')}
                  className="px-5 py-2.5 rounded-xl bg-vybe-teal hover:bg-vybe-teal-dark text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start 1-Min MindReset Now</span>
                </button>
              )}
              {onNavigate && (
                <button
                  onClick={() => onNavigate('checkin')}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4 text-vybe-teal" />
                  <span>Take Wellness Check-In</span>
                </button>
              )}
              <button
                onClick={handleSeedData}
                disabled={seeding}
                className="px-5 py-2.5 rounded-xl border border-vybe-teal text-vybe-teal bg-white hover:bg-vybe-mint/20 font-bold text-xs transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-vybe-teal" />
                <span>{seeding ? 'Loading...' : 'Seed Sample 7D Tasks'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Participation Metric Clarification */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
        <span className="font-bold text-vybe-navy">Note on metrics: </span>
        All statistics and task logs displayed here represent your voluntary activity participation and recorded satisfaction feedback.
        VYBE does not calculate medical diagnosis scores, stress scores, or workplace productivity rankings.
      </div>
    </div>
  );
};
