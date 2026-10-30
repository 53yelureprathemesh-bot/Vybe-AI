/**
 * Windows Desktop Notification Service for VYBE AI.
 * 
 * Interacts with the native Web Notifications API to display rich OS toast
 * notifications in the bottom right corner of the Windows PC screen, even when
 * the browser is running in the background or minimized.
 */

export interface DesktopNotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface DesktopNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  activityId?: string;
  onClick?: () => void;
}

export interface WellnessSuggestion {
  activityId: string;
  category: 'exercise' | 'hydration' | 'eyecare' | 'breathing' | 'walking';
  title: string;
  body: string;
  badge: string;
}

export const WELLNESS_ROTATION: WellnessSuggestion[] = [
  {
    activityId: 'deskyoga',
    category: 'exercise',
    title: '🧘 Time for a Desk Stretch!',
    body: 'Relieve neck and shoulder stiffness with a quick 2-minute seated Desk Yoga routine.',
    badge: 'Exercise'
  },
  {
    activityId: 'hydratemate',
    category: 'hydration',
    title: '💧 Hydration Checkpoint!',
    body: 'Drink a glass of water now. Staying hydrated keeps cognitive fatigue and brain fog away.',
    badge: 'Hydration'
  },
  {
    activityId: 'eyecare',
    category: 'eyecare',
    title: '👁️ 20-20-20 Eye Care Break',
    body: 'Rest your eyes! Look at an object 20 feet away for 20 seconds to reset ciliary muscles.',
    badge: 'Eye Care'
  },
  {
    activityId: 'mindreset',
    category: 'breathing',
    title: '🌬️ 1-Minute Mind Reset',
    body: 'Take 4 slow, calming breaths to clear tension and regain sharp developer focus.',
    badge: 'Breathing'
  },
  {
    activityId: 'walkbreak',
    category: 'walking',
    title: '🚶 Quick Movement Stroll',
    body: 'Step away from your desk for a brief stroll to stimulate leg circulation.',
    badge: 'Walking'
  }
];

class DesktopNotificationService {
  private rotationIndex = 0;
  private notificationClickListener: ((activityId: string) => void) | null = null;

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  public async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const res = await Notification.requestPermission();
      return res === 'granted';
    } catch {
      return false;
    }
  }

  public onNotificationClick(listener: (activityId: string) => void) {
    this.notificationClickListener = listener;
  }

  /**
   * Get the next rotating wellness suggestion (Exercise -> Hydration -> Eye Care -> Breathing -> Walk)
   */
  public getNextSuggestion(): WellnessSuggestion {
    const suggestion = WELLNESS_ROTATION[this.rotationIndex % WELLNESS_ROTATION.length];
    this.rotationIndex += 1;
    return suggestion;
  }

  /**
   * Send a native Windows desktop toast notification
   */
  public async send(payload: DesktopNotificationPayload): Promise<Notification | null> {
    if (!this.isSupported()) return null;

    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    if (permission !== 'granted') return null;

    try {
      const notification = new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/favicon.ico',
        tag: payload.tag || 'vybe-wellness-reminder',
        requireInteraction: true // Keep on screen until user interacts
      });

      notification.onclick = (e) => {
        e.preventDefault();
        window.focus();
        notification.close();

        if (payload.onClick) {
          payload.onClick();
        }

        if (payload.activityId && this.notificationClickListener) {
          this.notificationClickListener(payload.activityId);
        }
      };

      return notification;
    } catch (err) {
      console.warn('Native notification failed, falling back to in-app:', err);
      return null;
    }
  }

  /**
   * Send next rotating suggestion as desktop notification
   */
  public sendNextSuggestion(onLaunchActivity?: (activityId: string) => void): WellnessSuggestion | null {
    const suggestion = this.getNextSuggestion();
    this.send({
      title: `VYBE AI — ${suggestion.title}`,
      body: suggestion.body,
      activityId: suggestion.activityId,
      onClick: () => {
        if (onLaunchActivity) {
          onLaunchActivity(suggestion.activityId);
        }
      }
    });
    return suggestion;
  }

  /**
   * Trigger an immediate test desktop notification
   */
  public async sendTestNotification(onLaunchActivity?: (activityId: string) => void): Promise<boolean> {
    const granted = await this.requestPermission();
    if (!granted) return false;

    await this.send({
      title: 'VYBE AI — Desktop Alert Active! 🔔',
      body: 'Desktop notifications are working! Even when minimized or working in other apps, VYBE will remind you to stretch, hydrate, and rest.',
      activityId: 'deskyoga',
      onClick: () => {
        if (onLaunchActivity) {
          onLaunchActivity('deskyoga');
        }
      }
    });

    return true;
  }
}

export const desktopNotification = new DesktopNotificationService();
