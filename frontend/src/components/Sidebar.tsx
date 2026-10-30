import React from 'react';
import { NavSection } from '../types';
import {
  LayoutDashboard,
  BotMessageSquare,
  CalendarClock,
  Sparkles,
  ClipboardCheck,
  TrendingUp,
  SlidersHorizontal,
  Settings as SettingsIcon,
  Home,
  X,
  HeartPulse
} from 'lucide-react';

interface SidebarProps {
  currentSection: NavSection;
  onNavigate: (section: NavSection) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onNavigate,
  isOpenMobile,
  onCloseMobile
}) => {
  const navItems: Array<{
    id: NavSection;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }> = [
    { id: 'dashboard', label: 'Home Dashboard', icon: LayoutDashboard },
    { id: 'assistant', label: 'AI Wellness Assistant', icon: BotMessageSquare, badge: 'VYBE' },
    { id: 'planner', label: 'Smart Break Planner', icon: CalendarClock },
    { id: 'relaxation', label: 'Relaxation Zone', icon: Sparkles },
    { id: 'checkin', label: 'Wellness Check-In', icon: ClipboardCheck },
    { id: 'journey', label: 'My Wellness Journey', icon: TrendingUp },
    { id: 'settings', label: 'Preferences & Settings', icon: SettingsIcon },
  ];

  const handleSelect = (section: NavSection) => {
    onNavigate(section);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-10 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Mobile close header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 lg:hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Navigation</span>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Brand Tagline in Sidebar */}
        <div className="p-4 border-b border-slate-100 hidden lg:block">
          <p className="text-[11px] font-semibold text-vybe-teal uppercase tracking-widest">
            Workplace Companion
          </p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Your Work. Your Wellness. Your Rhythm.
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-vybe-navy text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-vybe-teal' : 'text-slate-400 group-hover:text-vybe-teal'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-vybe-teal text-vybe-navy'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-vybe-mint group-hover:text-vybe-navy'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              onClick={() => handleSelect('landing')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-slate-500 hover:bg-slate-50 hover:text-slate-800 ${
                currentSection === 'landing' ? 'bg-slate-100 text-vybe-navy font-bold' : ''
              }`}
            >
              <Home className="w-4 h-4 text-slate-400" />
              <span>Landing Page</span>
            </button>
          </div>
        </nav>

        {/* Bottom Privacy Badge */}
        <div className="p-3 m-3 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-600">
          <div className="flex items-center gap-2 mb-1">
            <HeartPulse className="w-3.5 h-3.5 text-vybe-teal" />
            <span className="text-[11px] font-bold text-slate-800">Voluntary & Private</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            VYBE does not monitor screens or keystrokes. All inputs are voluntary.
          </p>
        </div>
      </aside>
    </>
  );
};
