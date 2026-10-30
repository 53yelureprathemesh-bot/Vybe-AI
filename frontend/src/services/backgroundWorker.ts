/**
 * Unthrottled Background Web Worker for VYBE AI.
 * 
 * Standard browser tabs throttle setInterval timers when hidden or minimized.
 * Web Workers run on a background thread immune to tab throttling, ensuring
 * precise 1-second ticks for screen time tracking and break notifications.
 */

export class BackgroundWorkerTimer {
  private worker: Worker | null = null;
  private tickCallbacks: Set<() => void> = new Set();
  private isRunning = false;
  private fallbackInterval: number | null = null;

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    if (typeof window === 'undefined' || typeof Worker === 'undefined') {
      return;
    }

    try {
      // Inline Web Worker script so no extra bundler asset configuration is required
      const workerCode = `
        let timer = null;
        self.onmessage = function(e) {
          if (e.data === 'start') {
            if (timer) clearInterval(timer);
            timer = setInterval(function() {
              self.postMessage('tick');
            }, 1000);
          } else if (e.data === 'stop') {
            if (timer) {
              clearInterval(timer);
              timer = null;
            }
          }
        };
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      this.worker = new Worker(workerUrl);

      this.worker.onmessage = (e) => {
        if (e.data === 'tick') {
          this.tickCallbacks.forEach((cb) => cb());
        }
      };
    } catch (e) {
      console.warn('Web Worker initialization failed, using standard interval:', e);
      this.worker = null;
    }
  }

  public start(onTick?: () => void) {
    if (onTick) {
      this.tickCallbacks.add(onTick);
    }

    if (this.isRunning) return;
    this.isRunning = true;

    if (this.worker) {
      this.worker.postMessage('start');
    } else if (typeof window !== 'undefined') {
      // Fallback to standard interval
      this.fallbackInterval = window.setInterval(() => {
        this.tickCallbacks.forEach((cb) => cb());
      }, 1000);
    }
  }

  public stop() {
    this.isRunning = false;
    if (this.worker) {
      this.worker.postMessage('stop');
    }
    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
      this.fallbackInterval = null;
    }
  }

  public onTick(callback: () => void): () => void {
    this.tickCallbacks.add(callback);
    return () => {
      this.tickCallbacks.delete(callback);
    };
  }
}

export const backgroundWorkerTimer = new BackgroundWorkerTimer();
