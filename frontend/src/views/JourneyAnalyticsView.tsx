import React, { useState, useEffect } from 'react';
import { AnalyticsSummary, ActivityRecord } from '../types';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  ThumbsUp,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity as ActivityIcon,
  Filter
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

export const JourneyAnalyticsView: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'today' | '7days' | '30days'>('7days');
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await api.getAnalytics('default_user', timeframe);
      setAnalytics(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#14B8A6', '#14213D', '#3B82F6', '#10B981', '#F59E0B', '#6366F1'];

  // Prepare Pie Chart data from activity_distribution
  const pieData = analytics?.activity_distribution
    ? Object.entries(analytics.activity_distribution).map(([name, count]) => ({
        name,
        value: count
      }))
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Title & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-vybe-teal">
            Personal Reflection
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-vybe-navy mt-1">
            My Wellness Journey
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visual activity tracking derived strictly from your authentic completed sessions.
          </p>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200/80">
          <button
            onClick={() => setTimeframe('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeframe === 'today'
                ? 'bg-white text-vybe-navy shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeframe('7days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeframe === '7days'
                ? 'bg-white text-vybe-navy shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeframe('30days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeframe === '30days'
                ? 'bg-white text-vybe-navy shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Completed Sessions
            </span>
            <div className="text-3xl font-black text-vybe-navy">
              {analytics?.total_completed_activities ?? 0}
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
              {analytics?.total_minutes_spent ?? 0}
              <span className="text-sm font-semibold text-slate-500 ml-1">m</span>
            </div>
            <span className="text-[10px] text-slate-500">total time reset</span>
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
            <span className="text-[10px] text-slate-500">breaks completed on prompt</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Marked Helpful
            </span>
            <div className="text-3xl font-black text-vybe-navy">
              {analytics?.helpful_rate_percent ?? 100}%
            </div>
            <span className="text-[10px] text-slate-500">user satisfaction score</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ThumbsUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      {analytics && analytics.total_completed_activities > 0 ? (
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
                <BarChart data={analytics.daily_trend}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => d.slice(5)}
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
              <p className="text-xs text-slate-500">Distribution across approved activities</p>
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
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
          <ActivityIcon className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-vybe-navy mb-1">No activity history in this period</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            Complete a guided session from the Dashboard or use the "Seed 7D Data" button in the demo bar to view visual analytics.
          </p>
        </div>
      )}

      {/* Participation Metric Clarification */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
        <span className="font-bold text-vybe-navy">Note on metrics: </span>
        All statistics displayed here represent your voluntary activity participation and recorded satisfaction feedback.
        VYBE does not calculate medical diagnosis scores, stress scores, or workplace productivity rankings.
      </div>
    </div>
  );
};
