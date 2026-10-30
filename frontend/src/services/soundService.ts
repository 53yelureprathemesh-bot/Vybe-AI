/**
 * Audio Synthesizer and Custom Sound Player for VYBE AI.
 *
 * Provides 5 built-in synthesized harmonic chimes (Zen Bowl, Crystal Bell,
 * Calm Harp, Water Drop, Gentle Gong) using Web Audio API (zero audio files needed),
 * plus custom audio file upload playback support.
 */

export interface SoundPreset {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const SOUND_PRESETS: SoundPreset[] = [
  {
    id: 'zen_bowl',
    name: 'Zen Singing Bowl',
    emoji: '🥣',
    description: '432Hz meditative Tibetan bowl with warm harmonic resonance'
  },
  {
    id: 'crystal_bell',
    name: 'Soft Crystal Bell',
    emoji: '🔔',
    description: 'Pure, crisp high overtone bell chime'
  },
  {
    id: 'calm_harp',
    name: 'Calming Harp',
    emoji: '🎵',
    description: 'Gentle ascending 4-note acoustic arpeggio'
  },
  {
    id: 'water_drop',
    name: 'Forest Water Drop',
    emoji: '💧',
    description: 'Organic droplet with acoustic cavity resonance'
  },
  {
    id: 'gentle_gong',
    name: 'Gentle Gong',
    emoji: '🧘',
    description: 'Deep, soothing sub-harmonic resonance'
  }
];

class SoundService {
  private audioCtx: AudioContext | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;

  private getContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Play the user's selected notification chime.
   * If a custom audio file (base64 or URL) is set, it plays that.
   * Otherwise, synthesizes the chosen preset.
   */
  public play(presetId = 'zen_bowl', customUrl?: string | null, volume = 0.8) {
    if (customUrl && (customUrl.startsWith('data:audio') || customUrl.startsWith('http') || customUrl.startsWith('blob'))) {
      this.playCustomAudio(customUrl, volume);
      return;
    }

    switch (presetId) {
      case 'crystal_bell':
        this.playCrystalBell(volume);
        break;
      case 'calm_harp':
        this.playCalmHarp(volume);
        break;
      case 'water_drop':
        this.playWaterDrop(volume);
        break;
      case 'gentle_gong':
        this.playGentleGong(volume);
        break;
      case 'zen_bowl':
      default:
        this.playZenBowl(volume);
        break;
    }
  }

  /**
   * 1. Zen Singing Bowl (432Hz fundamental + harmonic overtone)
   */
  public playZenBowl(volume = 0.8) {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const duration = 2.4;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(432, now); // 432Hz healing tone

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(864.5, now); // Gentle shimmer harmonic

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.35 * volume, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    } catch (e) {
      console.warn('Audio playback not permitted or failed', e);
    }
  }

  /**
   * 2. Soft Crystal Bell (1046.5Hz C6 + high bell strike)
   */
  public playCrystalBell(volume = 0.8) {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const duration = 1.8;

      const osc = ctx.createOscillator();
      const oscHigh = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1046.5, now);

      oscHigh.type = 'sine';
      oscHigh.frequency.setValueAtTime(2093, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.25 * volume, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      oscHigh.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      oscHigh.start(now);
      osc.stop(now + duration);
      oscHigh.stop(now + duration);
    } catch (e) {
      console.warn('Audio playback failed', e);
    }
  }

  /**
   * 3. Calming Harp (4-note arpeggio chord)
   */
  public playCalmHarp(volume = 0.8) {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + idx * 0.12;
        const duration = 1.2;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.2 * volume, noteStart + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + duration);
      });
    } catch (e) {
      console.warn('Audio playback failed', e);
    }
  }

  /**
   * 4. Forest Water Drop
   */
  public playWaterDrop(volume = 0.8) {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const duration = 0.8;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.25);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.3 * volume, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn('Audio playback failed', e);
    }
  }

  /**
   * 5. Gentle Gong (Sub-harmonic calming wash)
   */
  public playGentleGong(volume = 0.8) {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const duration = 2.8;

      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(175, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(150, now + duration);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.4 * volume, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn('Audio playback failed', e);
    }
  }

  /**
   * Custom Audio file playback (Base64 or URL)
   */
  public playCustomAudio(url: string, volume = 0.8) {
    try {
      if (this.currentAudioElement) {
        this.currentAudioElement.pause();
        this.currentAudioElement = null;
      }
      const audio = new Audio(url);
      audio.volume = Math.max(0, Math.min(1, volume));
      this.currentAudioElement = audio;
      audio.play().catch((err) => {
        console.warn('Custom audio playback failed, falling back to Zen Bowl', err);
        this.playZenBowl(volume);
      });
    } catch (e) {
      this.playZenBowl(volume);
    }
  }
}

export const soundService = new SoundService();
