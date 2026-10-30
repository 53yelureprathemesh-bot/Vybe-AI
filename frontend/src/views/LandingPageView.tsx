import React from 'react';
import { NavSection } from '../types';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Eye,
  Activity as ActivityIcon,
  Heart,
  Footprints,
  Droplets,
  Calendar,
  Lock,
  CheckCircle2
} from 'lucide-react';

interface LandingPageViewProps {
  onStartJourney: () => void;
  onExploreFeatures: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onStartJourney,
  onExploreFeatures
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-vybe-mint/40 via-white to-white">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-vybe-mint/60 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute top-1/3 left-10 w-72 h-72 bg-teal-100/40 rounded-full blur-2xl -z-10 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vybe-mint text-vybe-navy border border-vybe-teal/30 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-vybe-teal" />
            <span>Intelligent Workplace Wellness Companion</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-vybe-navy tracking-tight leading-[1.15] mb-6">
            Your Work. Your Wellness.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-vybe-teal to-teal-700">
              Your Rhythm.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-vybe-slate leading-relaxed mb-10 font-normal">
            Meet your intelligent workplace wellness companion. VYBE AI helps you build healthier work habits with personalised breaks, guided relaxation, smart reminders and meaningful progress tracking.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartJourney}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-vybe-navy hover:bg-vybe-navy-light text-white font-bold text-sm shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 group active:scale-95"
            >
              <span>Start My Wellness Journey</span>
              <ArrowRight className="w-4 h-4 text-vybe-teal group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onExploreFeatures}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-vybe-navy font-bold text-sm border border-slate-200 shadow-sm hover:shadow transition-all"
            >
              Explore Features
            </button>
          </div>

          {/* Trust points */}
          <div className="mt-12 pt-8 border-t border-slate-200/60 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-vybe-teal" />
              <span>Voluntary Check-Ins Only</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-vybe-teal" />
              <span>Zero Surveillance / No Keystroke Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-vybe-teal" />
              <span>Science-Backed Micro-Breaks (20s - 5m)</span>
            </div>
          </div>
        </div>
      </section>

      {/* How VYBE Works Section */}
      <section id="how-it-works" className="py-16 lg:py-24 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-vybe-teal">
              The 4-Step Wellness Rhythm
            </span>
            <h2 className="text-3xl font-extrabold text-vybe-navy mt-1 tracking-tight">
              How VYBE Works
            </h2>
            <p className="text-sm text-slate-600 mt-3">
              Simple, gentle guidance embedded into your daily schedule without interrupting flow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Check In',
                desc: 'Share your screen time, sitting posture, and current mood in a 15-second voluntary check-in.'
              },
              {
                step: '02',
                title: 'Get Recommendation',
                desc: 'VYBE analyzes your context and selects the ideal micro-break fitting your exact available time.'
              },
              {
                step: '03',
                title: 'Follow Activity',
                desc: 'Follow clean, timestamped step-by-step guidance with timers and audio cues.'
              },
              {
                step: '04',
                title: 'Track Habits',
                desc: 'View meaningful activity participation, feedback ratings, and weekly consistency trends.'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative"
              >
                <span className="text-2xl font-black text-vybe-teal/40 font-mono mb-3 block">
                  {item.step}
                </span>
                <h3 className="text-base font-bold text-vybe-navy mb-2">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section id="features" className="py-20 lg:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-vybe-teal">
              Comprehensive Toolkit
            </span>
            <h2 className="text-3xl font-extrabold text-vybe-navy mt-1 tracking-tight">
              Designed for Long Hours at the Screen
            </h2>
            <p className="text-sm text-slate-600 mt-3">
              Thoughtful features built to maintain mental clarity, physical comfort, and continuous productivity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: 'Personalised AI Recommendations',
                desc: 'Smart adaptation based on current screen session, posture duration, mood, energy, and available minutes.'
              },
              {
                icon: Calendar,
                title: 'Smart Break Planning',
                desc: 'Chronological workday schedule alternating focus sessions with micro-breaks and quiet lunch hours.'
              },
              {
                icon: Heart,
                title: 'Guided Relaxation',
                desc: 'MindReset 1-minute breathing exercises and calming sensory breaks to reduce cognitive overload.'
              },
              {
                icon: Eye,
                title: 'Eye & Movement Breaks',
                desc: '20-20-20 optical rest (EyeCare) and seated DeskYoga mobility to relieve stiffness in neck and wrists.'
              },
              {
                icon: ActivityIcon,
                title: 'Wellness Activity Tracking',
                desc: 'Clear, authentic completion metrics and category breakdowns calculated directly from your stored records.'
              },
              {
                icon: Lock,
                title: 'Privacy-First Personalisation',
                desc: 'Strictly isolated local data, no background screen-scraping or workplace surveillance. You own your history.'
              }
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl p-6 bg-slate-50/70 border border-slate-200/90 hover:border-vybe-teal/40 transition-all hover:-translate-y-1"
                >
                  <div className="w-10 h-10 rounded-xl bg-vybe-mint flex items-center justify-center text-vybe-teal mb-4 shadow-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-vybe-navy mb-2">{feat.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Privacy Commitment Section */}
      <section className="py-16 bg-vybe-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-vybe-teal/20 text-vybe-teal flex items-center justify-center mx-auto mb-4 border border-vybe-teal/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4">
            Our Transparent Privacy Commitment
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto mb-6">
            VYBE AI is built exclusively for employee self-care and personal well-being.
            It does not record keystrokes, capture screenshots, access company chat channels, or monitor webcam feeds.
            All wellness inputs are voluntarily provided by you, and individual activity records are never shared with managers or used for employee surveillance.
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-vybe-mint font-semibold">
            <span>✓ 100% Voluntary</span>
            <span>✓ No Keystroke Logs</span>
            <span>✓ Local Data Control</span>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-vybe-navy mb-3">
            Ready to find your workday rhythm?
          </h3>
          <p className="text-xs text-slate-600 mb-6">
            Experience intelligent, stress-free micro-breaks tailored to your real schedule.
          </p>
          <button
            onClick={onStartJourney}
            className="px-8 py-3.5 rounded-xl bg-vybe-teal hover:bg-vybe-teal-dark text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            Start My Wellness Journey
          </button>
        </div>
      </section>
    </div>
  );
};
