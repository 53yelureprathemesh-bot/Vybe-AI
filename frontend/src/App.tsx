import React, { useState, useEffect } from 'react';
import {
  NavSection,
  Recommendation,
  Activity,
  AnalyticsSummary,
  ActivityRecord,
  WellnessCheckInInput,
  UserProfile,
  ScreenTrackingState
} from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DemoBanner } from './components/DemoBanner';
import { ActivityPlayer } from './components/ActivityPlayer';
import { ReminderToast } from './components/ReminderToast';
import { AuthModal } from './components/AuthModal';
import { SoundStudioModal } from './components/SoundStudioModal';

import { LandingPageView } from './views/LandingPageView';
import { DashboardView } from './views/DashboardView';
import { CheckInView } from './views/CheckInView';
import { ChatAssistantView } from './views/ChatAssistantView';
import { PlannerView } from './views/PlannerView';
import { RelaxationZoneView } from './views/RelaxationZoneView';
import { JourneyAnalyticsView } from './views/JourneyAnalyticsView';
import { SettingsView } from './views/SettingsView';

import { api } from './services/api';
import { soundService } from './services/soundService';
import { screenTracker } from './services/screenTracker';
import { desktopNotification } from './services/desktopNotification';

const DEFAULT_USER: UserProfile = {
  user_id: 'default_user',
  name: 'Demo Professional',
  email: 'demo@vybe.ai',
  dob: '1998-05-15',
  age: 28,
  role: 'Software Engineer',
  sound_preset: 'zen_bowl',
  custom_sound_url: null,
  sound_volume: 80,
  created_at: new Date().toISOString()
};

export const App: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<NavSection>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    timeframe: 'today',
    total_completed_activities: 0,
    total_minutes_spent: 0,
    reminder_acceptance_rate: 100,
    helpful_rate_percent: 100,
    activity_distribution: {},
    daily_trend: [],
    recent_records: []
  });
  const [recentRecords, setRecentRecords] = useState<ActivityRecord[]>([]);
  const [checkInDefaults, setCheckInDefaults] = useState<WellnessCheckInInput | null>(null);

  // User state
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('vybe_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_USER;
      }
    }
    return DEFAULT_USER;
  });

  // Screen tracking live state
  const [screenState, setScreenState] = useState<ScreenTrackingState>(screenTracker.getState());

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSoundStudioOpen, setIsSoundStudioOpen] = useState<boolean>(false);

  // Smart in-app reminder simulation
  const [activeReminder, setActiveReminder] = useState<{
    activity: Activity;
    scheduledTime: string;
  } | null>(null);

  // Subscribe to screen tracker
  useEffect(() => {
    screenTracker.setUserId(currentUser.user_id);

    const unsubscribe = screenTracker.subscribe((state) => {
      setScreenState(state);
    });

    const unregisterThreshold = screenTracker.onThresholdReached(async (activeMinutes) => {
      // Play user's selected chime or custom audio
      soundService.play(
        currentUser.sound_preset,
        currentUser.custom_sound_url,
        currentUser.sound_volume
      );

      // Get next rotating wellness suggestion (Exercise -> Hydration -> Eye Care -> Breathing -> Walk)
      const suggestion = desktopNotification.getNextSuggestion();
      let act = await api.getActivity(suggestion.activityId);
      if (!act) {
        act = await api.getActivity('deskyoga');
      }

      if (act) {
        // 1. Show in-app banner toast
        setActiveReminder({
          activity: act,
          scheduledTime: `${activeMinutes}m Continuous Focus · ${suggestion.badge}`
        });

        // 2. Fire native Windows OS desktop notification
        desktopNotification.send({
          title: `VYBE AI — ${suggestion.title}`,
          body: suggestion.body,
          activityId: act.id,
          onClick: () => {
            window.focus();
            handleStartActivity(act!.id);
          }
        });
      }
    });

    return () => {
      unsubscribe();
      unregisterThreshold();
    };
  }, [currentUser]);

  // Support URL query parameters & desktop notification clicks (e.g., from Windows desktop agent)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const actId = params.get('activity');
    if (actId) {
      handleStartActivity(actId);
    }

    desktopNotification.onNotificationClick((activityId) => {
      handleStartActivity(activityId);
    });
  }, []);

  useEffect(() => {
    refreshData(currentUser.user_id);
    loadInitialRecommendation(currentUser.user_id);
  }, [currentUser.user_id]);

  const refreshData = async (userId: string = currentUser.user_id) => {
    try {
      const [todayAnalytics, history] = await Promise.all([
        api.getAnalytics(userId, 'today'),
        api.getHistory(userId, 10)
      ]);
      setAnalytics(todayAnalytics);
      setRecentRecords(history);
    } catch (e) {
      console.error(e);
    }
  };

  const loadInitialRecommendation = async (userId: string = currentUser.user_id) => {
    try {
      const rec = await api.getRecommendation({
        user_id: userId,
        screen_session_min: 75,
        sitting_duration_min: 45,
        mood: 'normal',
        energy: 'moderate',
        available_time_seconds: 120,
        preferred_activity_category: 'let_ai_choose',
        reminder_mode: 'immediate'
      });
      setRecommendation(rec);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('vybe_user', JSON.stringify(user));
    screenTracker.setUserId(user.user_id);
    setIsAuthModalOpen(false);
    refreshData(user.user_id);
    loadInitialRecommendation(user.user_id);
  };

  const handleSoundUpdated = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('vybe_user', JSON.stringify(updatedUser));
  };

  const handleStartActivity = async (activityId: string) => {
    const act = await api.getActivity(activityId);
    if (act) {
      setActiveActivity(act);
      setActiveReminder(null);
    }
  };

  const handleActivityCompleted = async (_activityId: string) => {
    // Reset continuous active counter on completing a wellness activity
    screenTracker.resetContinuousScreenTime();
    await refreshData(currentUser.user_id);
  };

  const handleRemindLater = async (activityId: string) => {
    const act = await api.getActivity(activityId);
    if (!act) return;

    // Simulate reminder in 6 seconds with audio chime for hackathon demonstration
    setTimeout(() => {
      soundService.play(
        currentUser.sound_preset,
        currentUser.custom_sound_url,
        currentUser.sound_volume
      );
      setActiveReminder({
        activity: act,
        scheduledTime: 'Scheduled break is ready'
      });
    }, 6000);
  };

  const handleChooseAnother = async () => {
    if (!recommendation) return;
    const rec = await api.getRecommendation(
      {
        user_id: currentUser.user_id,
        screen_session_min: 60,
        sitting_duration_min: 60,
        mood: 'normal',
        energy: 'moderate',
        available_time_seconds: 120,
        preferred_activity_category: 'let_ai_choose',
        reminder_mode: 'immediate'
      },
      recommendation.activity_id
    );
    setRecommendation(rec);
  };

  const handleLoadDemoScenario = async (scenario: WellnessCheckInInput, _label: string) => {
    setCheckInDefaults(scenario);
    const rec = await api.getRecommendation(scenario);
    setRecommendation(rec);
    setCurrentSection('checkin');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 1. Hackathon Live Demo Mode Bar */}
      <DemoBanner
        onLoadScenario={handleLoadDemoScenario}
        onRefreshData={() => refreshData(currentUser.user_id)}
      />

      {/* 2. Responsive Navbar */}
      <Navbar
        currentSection={currentSection}
        onNavigate={setCurrentSection}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
        user={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenSoundStudio={() => setIsSoundStudioOpen(true)}
        screenState={screenState}
        isDemoActive={true}
      />

      {/* Main View Area with Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Responsive Sidebar (hidden on Landing Page) */}
        {currentSection !== 'landing' && (
          <Sidebar
            currentSection={currentSection}
            onNavigate={setCurrentSection}
            isOpenMobile={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Dynamic Content View */}
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 min-w-0 ${
            currentSection === 'landing' ? 'p-0 sm:p-0 lg:p-0' : ''
          }`}
        >
          {currentSection === 'landing' && (
            <LandingPageView
              onStartJourney={() => setCurrentSection('dashboard')}
              onExploreFeatures={() => setCurrentSection('relaxation')}
            />
          )}

          {currentSection === 'dashboard' && (
            <DashboardView
              recommendation={recommendation}
              analytics={analytics}
              recentRecords={recentRecords}
              user={currentUser}
              screenState={screenState}
              onStartActivity={handleStartActivity}
              onRemindLater={handleRemindLater}
              onChooseAnother={handleChooseAnother}
              onNavigate={setCurrentSection}
              onStartCheckIn={() => setCurrentSection('checkin')}
              onOpenSoundStudio={() => setIsSoundStudioOpen(true)}
            />
          )}

          {currentSection === 'checkin' && (
            <CheckInView
              initialValues={checkInDefaults}
              onRecommendationReceived={(rec) => setRecommendation(rec)}
              onStartActivity={handleStartActivity}
            />
          )}

          {currentSection === 'assistant' && (
            <ChatAssistantView
              onStartActivity={handleStartActivity}
              onNavigate={setCurrentSection}
            />
          )}

          {currentSection === 'planner' && (
            <PlannerView onStartActivity={handleStartActivity} />
          )}

          {currentSection === 'relaxation' && (
            <RelaxationZoneView onStartActivity={handleStartActivity} />
          )}

          {currentSection === 'journey' && <JourneyAnalyticsView />}

          {currentSection === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Guided Activity Player Modal */}
      {activeActivity && (
        <ActivityPlayer
          activity={activeActivity}
          onClose={() => setActiveActivity(null)}
          onCompleted={handleActivityCompleted}
          onSelectNext={(nextId) => handleStartActivity(nextId)}
        />
      )}

      {/* Smart In-App Reminder Toast */}
      {activeReminder && (
        <ReminderToast
          activity={activeReminder.activity}
          scheduledTime={activeReminder.scheduledTime}
          onStart={(id) => handleStartActivity(id)}
          onSnooze={(_mins) => {
            setActiveReminder(null);
          }}
          onDismiss={() => setActiveReminder(null)}
        />
      )}

      {/* User Login & Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Notification Sound Studio Modal */}
      <SoundStudioModal
        isOpen={isSoundStudioOpen}
        onClose={() => setIsSoundStudioOpen(false)}
        user={currentUser}
        onSoundUpdated={handleSoundUpdated}
      />
    </div>
  );
};
