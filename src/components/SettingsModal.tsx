import React from 'react';
import { X, Settings2, Sliders, Server, Zap, Shield, HelpCircle } from 'lucide-react';
import { TestSettings, ServerNode } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TestSettings;
  onUpdateSettings: (newSettings: TestSettings) => void;
  servers: ServerNode[];
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  servers,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold font-heading text-white">
              Speed Test Settings
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="py-4 space-y-5">
          {/* Unit selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Measurement Unit
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Mbps', 'MB/s', 'Gbps'] as const).map((unit) => (
                <button
                  key={unit}
                  onClick={() => onUpdateSettings({ ...settings, unit })}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    settings.unit === unit
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-sm'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Standard telecom speed is measured in Megabits per second (Mbps).
            </span>
          </div>

          {/* Test Server Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Test Server Node</span>
              <span className="text-[10px] text-cyan-400 font-normal">Auto-Selected</span>
            </label>
            <select
              value={settings.selectedServerId}
              onChange={(e) => onUpdateSettings({ ...settings, selectedServerId: e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-cyan-500 focus:outline-none"
            >
              {servers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.location})
                </option>
              ))}
            </select>
          </div>

          {/* Parallel Stream Count */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              <span>Concurrent Streams</span>
              <span className="text-cyan-400 font-mono-num font-bold">{settings.parallelStreams} streams</span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              step="1"
              value={settings.parallelStreams}
              onChange={(e) => onUpdateSettings({ ...settings, parallelStreams: Number(e.target.value) })}
              className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>1 (Single Stream)</span>
              <span>4 (Recommended)</span>
              <span>8 (Multi-Gigabit)</span>
            </div>
          </div>

          {/* Test Duration */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              <span>Test Duration</span>
              <span className="text-cyan-400 font-mono-num font-bold">{settings.testDurationSeconds}s</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Quick (5s)', value: 5 },
                { label: 'Standard (8s)', value: 8 },
                { label: 'Deep (15s)', value: 15 },
              ].map((dur) => (
                <button
                  key={dur.value}
                  onClick={() => onUpdateSettings({ ...settings, testDurationSeconds: dur.value })}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    settings.testDurationSeconds === dur.value
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-sm'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {dur.label}
                </button>
              ))}
            </div>
          </div>

          {/* Data Saver Mode Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">
                Mobile Data Saver
              </span>
              <span className="text-[11px] text-slate-500 block">
                Limits test payload size to conserve mobile cellular data.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.dataSaverMode}
              onChange={(e) => onUpdateSettings({ ...settings, dataSaverMode: e.target.checked })}
              className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition-all"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
