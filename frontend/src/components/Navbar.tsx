import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { NavSection, UserProfile, ScreenTrackingState } from '../types';
import {
  Clock,
  Menu,
  Sparkles,
  Bell,
  Monitor,
  User,
  LogOut,
  ChevronDown,
  Calendar,
  Briefcase
} from 'lucide-react';
import { AmbientSoundscape } from './AmbientSoundscape';
import { SOUND_PRESETS } from '../services/soundService';

interface NavbarProps {
  currentSection: NavSection;
  onNavigate: (section: NavSection) => void;
  onOpenMobileMenu: () => void;
  user: UserProfile;
  onOpenAuth: () => void;
  onOpenSoundStudio: () => void;
  screenState: ScreenTrackingState;
  isDemoActive?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSection,
  onNavigate,
  onOpenMobileMenu,
  user,
  onOpenAuth,
  onOpenSoundStudio,
  screenState,
  isDemoActive = false
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeMinutes = Math.floor(screenState.continuousActiveSeconds / 60);
  const activeSecondsRem = screenState.continuousActiveSeconds % 60;
  const currentPresetName =
    user.sound_preset === 'custom'
      ? 'Custom Audio'
      : SOUND_PRESETS.find((p) => p.id === user.sound_preset)?.name || 'Zen Bowl';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-2.5 transition-all">
      <div className="flex items-center justify-between max-w-7xl mx-auto gap-3">
        {/* Left: Mobile Toggle & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div
            onClick={() => onNavigate('dashboard')}
            className="cursor-pointer transition-transform hover:scale-[1.01]"
          >
            <Logo size="md" showTagline={false} />
          </div>
        </div>

        {/* Center: Live Screen Time & Workday Clock */}
        <div className="hidden md:flex items-center gap-3">
          {/* Live Automatic Screen Time Counter Badge */}
          <div
            title={`Auto-Tracking: Continuous screen time: ${activeMinutes}m ${activeSecondsRem}s. Status: ${screenState.status.toUpperCase()}`}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-inner transition-colors ${
              screenState.isIdle
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            <span className="flex h-2 w-2 relative">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  screenState.isIdle ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  screenState.isIdle ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              ></span>
            </span>
            <Monitor className="w-3.5 h-3.5" />
            <span className="font-mono">
              {screenState.isIdle ? 'Away / Rest' : `${activeMinutes}m ${activeSecondsRem}s Focus`}
            </span>
          </div>

          {/* Clock */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/60 text-slate-700 text-xs font-medium shadow-inner">
            <Clock className="w-3.5 h-3.5 text-vybe-teal" />
            <span className="font-mono font-semibold text-vybe-navy">{timeStr || 'Loading...'}</span>
          </div>
        </div>

        {/* Right Actions: Sound Studio, Ambient Mixer, Profile Badge & Check-In */}
        <div className="flex items-center gap-2.5">
          {/* Sound Studio Quick Button */}
          <button
            onClick={onOpenSoundStudio}
            title={`Active Notification Sound: ${currentPresetName}. Click to change or upload audio.`}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
          >
            <Bell className="w-3.5 h-3.5 text-vybe-teal" />
            <span className="truncate max-w-[100px]">{currentPresetName}</span>
          </button>

          {/* Ambient Focus Soundscape Synthesizer */}
          <AmbientSoundscape />

          {/* Quick Check-In Button */}
          <button
            onClick={() => onNavigate('checkin')}
            className="px-3 py-1.5 rounded-lg bg-vybe-teal hover:bg-vybe-teal-dark text-white text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span>Check-In</span>
          </button>

          {/* User Profile Pill & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-full bg-vybe-navy text-vybe-mint font-bold text-xs flex items-center justify-center shadow-inner">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-vybe-navy block leading-tight truncate max-w-[90px]">
                  {user.name}
                </span>
                <span className="text-[10px] text-slate-400 block leading-none truncate max-w-[90px]">
                  {user.role}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 top-11 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-slide-up">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 mb-3">
                  <div className="w-10 h-10 rounded-full bg-vybe-navy text-vybe-mint font-black text-sm flex items-center justify-center">
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-extrabold text-vybe-navy truncate">{user.name}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Briefcase className="w-3.5 h-3.5 text-vybe-teal" />
                      <span>Role:</span>
                    </span>
                    <span className="font-semibold text-vybe-navy">{user.role}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-vybe-teal" />
                      <span>Age / DOB:</span>
                    </span>
                    <span className="font-semibold text-vybe-navy">{user.age} yrs ({user.dob})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Bell className="w-3.5 h-3.5 text-vybe-teal" />
                      <span>Chime:</span>
                    </span>
                    <span className="font-semibold text-vybe-navy truncate max-w-[120px]">{currentPresetName}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenSoundStudio();
                    }}
                    className="w-full py-2 px-3 rounded-xl text-left text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors"
                  >
                    <Bell className="w-3.5 h-3.5 text-vybe-teal" />
                    <span>Change Notification Sound</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenAuth();
                    }}
                    className="w-full py-2 px-3 rounded-xl text-left text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-vybe-teal" />
                    <span>Switch Account / Sign In</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
