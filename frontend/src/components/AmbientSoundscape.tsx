import React, { useState, useRef, useEffect } from 'react';
import { Headphones, Volume2, VolumeX, Play, Pause, Waves, CloudRain, Coffee, Sparkles } from 'lucide-react';

export const AmbientSoundscape: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeSound, setActiveSound] = useState<'rain' | 'alpha' | 'ocean'>('rain');
  const [volume, setVolume] = useState<number>(0.3);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioNode | null>(null);

  const sounds = [
    { id: 'rain', label: 'Gentle Rain', icon: CloudRain, desc: 'Soft rainfall for focused deep coding' },
    { id: 'ocean', label: 'Rhythmic Ocean', icon: Waves, desc: 'Calming swell waves to lower stress' },
    { id: 'alpha', label: '432Hz Alpha Waves', icon: Sparkles, desc: 'Harmonic binaural focus frequency' }
  ];

  const stopAudio = () => {
    if (noiseSourceRef.current) {
      try {
        (noiseSourceRef.current as any).stop?.();
        noiseSourceRef.current.disconnect();
      } catch {}
      noiseSourceRef.current = null;
    }
  };

  const startAudio = (soundType: 'rain' | 'alpha' | 'ocean') => {
    stopAudio();

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      if (soundType === 'alpha') {
        // 432Hz Binaural Beat Drone
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(432, ctx.currentTime);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(442, ctx.currentTime); // 10Hz Alpha difference

        osc1.connect(masterGain);
        osc2.connect(masterGain);
        osc1.start();
        osc2.start();
        noiseSourceRef.current = osc1;
      } else {
        // Synthesize Pink/Filtered Noise Buffer
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        if (soundType === 'rain') {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, ctx.currentTime);
        } else {
          // Ocean rhythmic wave swell
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(400, ctx.currentTime);
        }

        whiteNoise.connect(filter);
        filter.connect(masterGain);
        whiteNoise.start();
        noiseSourceRef.current = whiteNoise;
      }

      setIsPlaying(true);
    } catch (e) {
      console.warn('Ambient audio could not start', e);
    }
  };

  const handleToggle = () => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      startAudio(activeSound);
    }
  };

  const handleChangeSound = (id: 'rain' | 'alpha' | 'ocean') => {
    setActiveSound(id);
    if (isPlaying) {
      startAudio(id);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(newVol * 0.4, audioCtxRef.current.currentTime);
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all ${
          isPlaying
            ? 'bg-vybe-mint text-vybe-navy border-vybe-teal shadow-xs animate-pulse-slow'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
        }`}
      >
        <Headphones className={`w-3.5 h-3.5 ${isPlaying ? 'text-vybe-teal animate-bounce' : 'text-slate-500'}`} />
        <span className="hidden sm:inline">
          {isPlaying ? `Ambient: ${activeSound.toUpperCase()}` : 'Focus Sounds'}
        </span>
      </button>

      {/* Popover Controls */}
      {isOpen && (
        <div className="absolute right-0 top-10 z-40 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 animate-slide-up">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Headphones className="w-4 h-4 text-vybe-teal" />
              <span className="text-xs font-bold text-vybe-navy">Ambient Focus Mixer</span>
            </div>
            <button
              onClick={handleToggle}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                isPlaying ? 'bg-rose-50 text-rose-600' : 'bg-vybe-teal text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? 'Stop' : 'Play'}</span>
            </button>
          </div>

          <div className="space-y-1.5 mb-3">
            {sounds.map((s) => {
              const Icon = s.icon;
              const isSelected = activeSound === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleChangeSound(s.id as any)}
                  className={`w-full p-2 rounded-xl text-left flex items-center justify-between text-xs transition-all ${
                    isSelected
                      ? 'bg-vybe-mint/50 text-vybe-navy font-bold border border-vybe-teal/40'
                      : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-vybe-teal" />
                    <span>{s.label}</span>
                  </div>
                  {isSelected && <span className="text-[10px] text-vybe-teal font-mono">ON</span>}
                </button>
              );
            })}
          </div>

          {/* Volume */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-slate-500">
            <Volume2 className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-vybe-teal"
            />
          </div>
        </div>
      )}
    </div>
  );
};
