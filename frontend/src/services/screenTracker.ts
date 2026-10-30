/**
 * Live Automatic Screen Time & Activity Monitor for VYBE AI.
 *
 * Tracks continuous active screen focus, idle away periods, and window visibility.
 * Integrates an unthrottled Web Worker timer to monitor PC usage in the background,
 * periodically syncing screen sessions to SQLite backend and triggering multi-action
 * desktop notifications (exercise, hydration, breaks).
 */
import { ScreenTrackingState } from '../types';
import { api } from './api';
import { backgroundWorkerTimer } from './backgroundWorker';

type TrackerListener = (state: ScreenTrackingState) => void;
type ThresholdCallback = (activeMinutes: number) => void;

class ScreenTracker {
  private continuousActiveSeconds = 0;
  private totalActiveTodaySeconds = 0;
  private idleSeconds = 0;
  private isIdle = false;
  private lastActivityTime = Date.now();
  private sessionStartTime = new Date().toISOString();
  private breaksTakenCount = 0;

  private listeners: Set<TrackerListener> = new Set();
  private thresholdCallbacks: Set<ThresholdCallback> = new Set();
  private syncTimer: number | null = null;

  private userId = 'default_user';
  private reminderThresholdMinutes = 30; // Default 30m wellness alert
  private hasTriggeredAlertThisSession = false;
  private backgroundWorkMode = true; // Continues counting active PC time when window is in background

  constructor() {
    this.initEventListeners();
    this.startTracking();
    this.loadTodayBaseline();
  }

  public setUserId(newUserId: string) {
    this.userId = newUserId;
    this.loadTodayBaseline();
  }

  public setThreshold(minutes: number) {
    this.reminderThresholdMinutes = Math.max(1, minutes);
    this.hasTriggeredAlertThisSession = false;
    this.notifyListeners();
  }

  public getThreshold(): number {
    return this.reminderThresholdMinutes;
  }

  public setBackgroundWorkMode(enabled: boolean) {
    this.backgroundWorkMode = enabled;
    this.notifyListeners();
  }

  public isBackgroundWorkMode(): boolean {
    return this.backgroundWorkMode;
  }

  private async loadTodayBaseline() {
    try {
      const stats = await api.getTodayScreenStats(this.userId);
      if (stats && stats.total_active_screen_minutes) {
        this.totalActiveTodaySeconds = Math.round(stats.total_active_screen_minutes * 60);
      }
    } catch {
      // Offline fallback
    }
  }

  private initEventListeners() {
    if (typeof window === 'undefined') return;

    const onUserActivity = () => {
      this.lastActivityTime = Date.now();
      if (this.isIdle) {
        this.isIdle = false;
        this.notifyListeners();
      }
    };

    // Global browser interaction listeners
    ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'].forEach((evt) => {
      window.addEventListener(evt, onUserActivity, { passive: true });
    });

    // Window visibility listeners
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // If background work mode is disabled, mark idle on tab hide
        if (!this.backgroundWorkMode) {
          this.isIdle = true;
        }
      } else {
        this.lastActivityTime = Date.now();
        this.isIdle = false;
      }
      this.notifyListeners();
    });
  }

  private startTracking() {
    // Use unthrottled Web Worker timer so background PC time keeps ticking reliably
    backgroundWorkerTimer.start(() => {
      this.tick();
    });

    // Sync to backend every 3 minutes
    if (typeof window !== 'undefined') {
      this.syncTimer = window.setInterval(() => {
        this.flushSessionToBackend();
      }, 180000);

      window.addEventListener('beforeunload', () => {
        this.flushSessionToBackend();
      });
    }
  }

  private tick() {
    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivityTime;

    // In pure tab mode: if inactive >60s and in foreground, or hidden without background mode -> idle
    if (document.hidden && this.backgroundWorkMode) {
      // In Background Work Mode: tab is minimized or hidden, user is actively working on PC
      this.isIdle = false;
      this.continuousActiveSeconds += 1;
      this.totalActiveTodaySeconds += 1;
    } else if (timeSinceLastActivity > 60000) {
      // Idle in foreground tab
      this.isIdle = true;
      this.idleSeconds += 1;
    } else {
      // Active in foreground tab
      this.isIdle = false;
      this.continuousActiveSeconds += 1;
      this.totalActiveTodaySeconds += 1;
    }

    // Check if continuous focus exceeded notification threshold
    const activeMinutes = Math.floor(this.continuousActiveSeconds / 60);
    if (activeMinutes >= this.reminderThresholdMinutes && !this.hasTriggeredAlertThisSession) {
      this.hasTriggeredAlertThisSession = true;
      this.triggerThresholdReached(activeMinutes);
    }

    this.notifyListeners();
  }

  /**
   * Reset continuous screen time counter when a break or activity is taken
   */
  public resetContinuousScreenTime() {
    this.continuousActiveSeconds = 0;
    this.hasTriggeredAlertThisSession = false;
    this.breaksTakenCount += 1;
    this.notifyListeners();
  }

  /**
   * Force trigger break reminder immediately for testing or demo
   */
  public forceTriggerReminder() {
    const activeMinutes = Math.max(1, Math.floor(this.continuousActiveSeconds / 60));
    this.triggerThresholdReached(activeMinutes);
  }

  public subscribe(listener: TrackerListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public onThresholdReached(cb: ThresholdCallback): () => void {
    this.thresholdCallbacks.add(cb);
    return () => {
      this.thresholdCallbacks.delete(cb);
    };
  }

  private triggerThresholdReached(activeMinutes: number) {
    this.thresholdCallbacks.forEach((cb) => cb(activeMinutes));
  }

  private notifyListeners() {
    const state = this.getState();
    this.listeners.forEach((l) => l(state));
  }

  public getState(): ScreenTrackingState {
    let status: 'active' | 'idle' | 'away' = 'active';
    if (this.isIdle) {
      status = this.idleSeconds > 300 ? 'away' : 'idle';
    }

    return {
      continuousActiveSeconds: this.continuousActiveSeconds,
      totalActiveTodaySeconds: this.totalActiveTodaySeconds,
      idleSeconds: this.idleSeconds,
      isIdle: this.isIdle,
      status,
      lastActivityTime: this.lastActivityTime
    };
  }

  private async flushSessionToBackend() {
    const activeMin = round1(this.continuousActiveSeconds / 60.0);
    const idleMin = round1(this.idleSeconds / 60.0);
    if (activeMin < 0.2 && idleMin < 0.2) return;

    const now = new Date().toISOString();
    try {
      await api.logScreenSession({
        user_id: this.userId,
        started_at: this.sessionStartTime,
        ended_at: now,
        active_minutes: activeMin,
        idle_minutes: idleMin,
        breaks_taken: this.breaksTakenCount
      });
      this.sessionStartTime = now;
      this.breaksTakenCount = 0;
    } catch {
      // Handled silently
    }
  }
}

function round1(val: number): number {
  return Math.round(val * 10) / 10;
}

export const screenTracker = new ScreenTracker();
