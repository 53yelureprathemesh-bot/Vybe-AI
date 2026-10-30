import React, { useState } from 'react';
import { UserProfile } from '../types';
import { SOUND_PRESETS, soundService } from '../services/soundService';
import { api } from '../services/api';
import {
  Bell,
  Volume2,
  Upload,
  Play,
  Check,
  X,
  Music,
  Trash2,
  Sparkles,
  Save,
  VolumeX
} from 'lucide-react';

interface SoundStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSoundUpdated: (updatedUser: UserProfile) => void;
  onTriggerTestToast?: (soundName: string) => void;
}

export const SoundStudioModal: React.FC<SoundStudioModalProps> = ({
  isOpen,
  onClose,
  user,
  onSoundUpdated,
  onTriggerTestToast
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>(user.sound_preset || 'zen_bowl');
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(user.custom_sound_url || null);
  const [customFileName, setCustomFileName] = useState<string | null>(
    user.custom_sound_url ? 'Custom Audio Track' : null
  );
  const [volume, setVolume] = useState<number>(user.sound_volume ?? 0.8);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePreviewPreset = (presetId: string) => {
    soundService.play(presetId, null, volume);
  };

  const handlePreviewCustom = () => {
    if (customAudioUrl) {
      soundService.playCustomAudio(customAudioUrl, volume);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Audio file size must be less than 5MB.');
      return;
    }

    setCustomFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCustomAudioUrl(base64);
      setSelectedPreset('custom');
      // Preview immediately
      soundService.playCustomAudio(base64, volume);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustom = () => {
    setCustomAudioUrl(null);
    setCustomFileName(null);
    if (selectedPreset === 'custom') {
      setSelectedPreset('zen_bowl');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.updateSoundSettings({
        user_id: user.user_id,
        sound_preset: selectedPreset,
        custom_sound_url: customAudioUrl,
        sound_volume: volume
      });
      onSoundUpdated(res.profile);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleTestAlert = () => {
    // Play selected sound
    soundService.play(selectedPreset, customAudioUrl, volume);
    if (onTriggerTestToast) {
      const activePresetName =
        selectedPreset === 'custom'
          ? customFileName || 'Custom Sound'
          : SOUND_PRESETS.find((p) => p.id === selectedPreset)?.name || 'Zen Bowl';
      onTriggerTestToast(activePresetName);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 md:p-8 relative border border-slate-100 flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-vybe-navy flex items-center justify-center text-vybe-teal shadow-md">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-vybe-navy">Notification Sound Studio</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-vybe-mint text-vybe-navy">
                Audio Engine
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Select a soothing chime or upload your own audio for smart break reminders.
            </p>
          </div>
        </div>

        {/* Built-in Presets */}
        <div className="space-y-3 mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            1. Soothing Sound Presets
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {SOUND_PRESETS.map((preset) => {
              const isSelected = selectedPreset === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-vybe-mint/40 border-vybe-teal shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{preset.emoji}</span>
                    <div>
                      <h4 className="text-xs font-bold text-vybe-navy flex items-center gap-1.5">
                        <span>{preset.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-vybe-teal" />}
                      </h4>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        {preset.description}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreviewPreset(preset.id);
                    }}
                    title="Preview chime"
                    className="p-2 rounded-xl bg-white hover:bg-vybe-teal hover:text-white border border-slate-200 text-slate-700 transition-colors shadow-2xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Audio Uploader */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-vybe-teal" />
              <span className="text-xs font-bold text-vybe-navy">2. Custom Audio Notification</span>
            </div>
            {customAudioUrl && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Custom Sound Ready
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Upload your favorite mp3, wav, or ogg file to play whenever a break reminder triggers.
          </p>

          {customAudioUrl ? (
            <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate pr-2">
                <Music className="w-4 h-4 text-vybe-teal shrink-0" />
                <span className="text-xs font-bold text-slate-800 truncate">
                  {customFileName || 'Custom Notification Track'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePreviewCustom}
                  className="px-3 py-1.5 rounded-lg bg-vybe-navy hover:bg-vybe-navy-light text-white text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Preview</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemoveCustom}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <label className="block w-full border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:border-vybe-teal bg-white transition-all">
              <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
              <span className="text-xs font-bold text-vybe-navy block">Choose Custom Audio File</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">MP3, WAV, OGG (Max 5MB)</span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Volume Controls & Live Test */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-bold text-slate-800">Notification Volume</span>
            </div>
            <span className="text-xs font-mono font-bold text-vybe-teal">
              {Math.round(volume * 100)}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-vybe-teal"
          />

          <button
            type="button"
            onClick={handleTestAlert}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-slate-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-vybe-teal" />
            <span>Test Play Selected Reminder Alert</span>
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-vybe-navy hover:bg-vybe-navy-light text-white text-xs font-bold shadow transition-all active:scale-95 flex items-center gap-1.5"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-vybe-teal" />
                <span>{saving ? 'Saving...' : 'Save Sound Preference'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
