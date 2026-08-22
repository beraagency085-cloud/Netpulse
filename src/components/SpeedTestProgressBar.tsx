import React from 'react';
import { 
  Activity, 
  ArrowDown, 
  ArrowUp, 
  CheckCircle2, 
  Zap, 
  Radio,
  Clock
} from 'lucide-react';
import { SpeedMetrics, TestPhase } from '../types';

interface SpeedTestProgressBarProps {
  metrics: SpeedMetrics;
  unit: string;
}

export const SpeedTestProgressBar: React.FC<SpeedTestProgressBarProps> = ({
  metrics,
  unit,
}) => {
  const { phase, progress } = metrics;
  const isTesting = phase !== 'idle' && phase !== 'completed' && phase !== 'error';
  const isCompleted = phase === 'completed';

  // If idle or error without progress, don't show the active bar
  if (phase === 'idle' || (phase === 'error' && progress === 0)) {
    return null;
  }

  // Determine active phase metadata
  const getPhaseInfo = () => {
    switch (phase) {
      case 'latency':
        return {
          title: 'Testing Latency & Jitter',
          step: '1 / 3',
          icon: <Radio className="w-4 h-4 text-purple-400 animate-pulse" />,
          colorClass: 'from-purple-500 via-indigo-500 to-cyan-400',
          glowClass: 'shadow-purple-500/50',
          textColor: 'text-purple-400',
          bgBadge: 'bg-purple-950/60 border-purple-500/30 text-purple-300',
          detail: `${metrics.ping.current > 0 ? `${metrics.ping.current} ms ping` : 'Measuring packet round-trip...'}`,
        };
      case 'download':
        return {
          title: 'Testing Download Bandwidth',
          step: '2 / 3',
          icon: <ArrowDown className="w-4 h-4 text-cyan-400 animate-bounce" />,
          colorClass: 'from-cyan-500 via-teal-400 to-blue-500',
          glowClass: 'shadow-cyan-500/50',
          textColor: 'text-cyan-400',
          bgBadge: 'bg-cyan-950/60 border-cyan-500/30 text-cyan-300',
          detail: `${metrics.download.current > 0 ? `${metrics.download.current.toFixed(1)} ${unit}` : 'Streaming multi-threaded chunks...'}`,
        };
      case 'upload':
        return {
          title: 'Testing Upload Throughput',
          step: '3 / 3',
          icon: <ArrowUp className="w-4 h-4 text-blue-400 animate-bounce" />,
          colorClass: 'from-blue-500 via-indigo-500 to-purple-400',
          glowClass: 'shadow-blue-500/50',
          textColor: 'text-blue-400',
          bgBadge: 'bg-blue-950/60 border-blue-500/30 text-blue-300',
          detail: `${metrics.upload.current > 0 ? `${metrics.upload.current.toFixed(1)} ${unit}` : 'Buffering payload stream...'}`,
        };
      case 'finishing':
        return {
          title: 'Calculating Diagnostics',
          step: 'Finishing',
          icon: <Zap className="w-4 h-4 text-emerald-400 animate-spin" />,
          colorClass: 'from-emerald-400 via-teal-400 to-cyan-400',
          glowClass: 'shadow-emerald-500/50',
          textColor: 'text-emerald-400',
          bgBadge: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300',
          detail: 'Aggregating jitter & bufferbloat ratings...',
        };
      case 'completed':
        return {
          title: 'Diagnostic Complete',
          step: 'Done',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          colorClass: 'from-emerald-400 via-cyan-400 to-blue-500',
          glowClass: 'shadow-emerald-500/30',
          textColor: 'text-emerald-400',
          bgBadge: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300',
          detail: 'All metrics finalized',
        };
      case 'error':
        return {
          title: 'Test Interrupted',
          step: 'Error',
          icon: <Activity className="w-4 h-4 text-rose-400" />,
          colorClass: 'from-rose-500 to-red-600',
          glowClass: 'shadow-rose-500/40',
          textColor: 'text-rose-400',
          bgBadge: 'bg-rose-950/60 border-rose-500/30 text-rose-300',
          detail: metrics.error || 'Network error encountered',
        };
      default:
        return {
          title: 'Speed Test',
          step: '',
          icon: <Activity className="w-4 h-4 text-slate-400" />,
          colorClass: 'from-cyan-500 to-blue-500',
          glowClass: 'shadow-cyan-500/50',
          textColor: 'text-slate-400',
          bgBadge: 'bg-slate-800 border-slate-700 text-slate-300',
          detail: '',
        };
    }
  };

  const info = getPhaseInfo();
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full max-w-7xl mb-5 transition-all duration-300 animate-in fade-in slide-in-from-top-2">
      {/* Dynamic Progress Container Box */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800/90 shadow-xl p-3 sm:p-4">
        
        {/* Top Information Header */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`p-1.5 rounded-lg border flex items-center justify-center shrink-0 ${info.bgBadge}`}>
              {info.icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                  {info.title}
                </span>
                <span className="hidden xs:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 border border-slate-700 text-slate-300 shrink-0">
                  Step {info.step}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block truncate">
                {info.detail}
              </span>
            </div>
          </div>

          {/* Real-time Percentage Badge */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Step Indicators on larger screens */}
            <div className="hidden md:flex items-center gap-1.5 text-[11px] font-medium mr-2">
              <span className={`px-2 py-0.5 rounded-md border ${
                phase === 'latency' 
                  ? 'bg-purple-950/80 border-purple-500/40 text-purple-300 font-bold' 
                  : clampedProgress > 20 ? 'bg-slate-800/80 border-slate-700 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                1. Ping
              </span>
              <span className="text-slate-600">→</span>
              <span className={`px-2 py-0.5 rounded-md border ${
                phase === 'download' 
                  ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300 font-bold' 
                  : clampedProgress > 60 ? 'bg-slate-800/80 border-slate-700 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                2. Download
              </span>
              <span className="text-slate-600">→</span>
              <span className={`px-2 py-0.5 rounded-md border ${
                phase === 'upload' 
                  ? 'bg-blue-950/80 border-blue-500/40 text-blue-300 font-bold' 
                  : clampedProgress >= 95 ? 'bg-slate-800/80 border-slate-700 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                3. Upload
              </span>
            </div>

            <div className="flex items-baseline gap-0.5">
              <span className="font-mono text-base sm:text-lg font-black text-white tracking-tight">
                {Math.round(clampedProgress)}
              </span>
              <span className="text-xs font-semibold text-cyan-400">%</span>
            </div>
          </div>
        </div>

        {/* Dynamic Multi-Phase Fill Bar Track */}
        <div className="relative h-2.5 sm:h-3 w-full bg-slate-950/90 rounded-full overflow-hidden p-[2px] border border-slate-800 shadow-inner">
          
          {/* Active Filling Gradient Bar with Transition */}
          <div 
            className={`h-full rounded-full bg-gradient-to-r ${info.colorClass} transition-all duration-300 ease-out relative shadow-lg ${info.glowClass}`}
            style={{ width: `${clampedProgress}%` }}
          >
            {/* Shimmer Light Stripe Animation */}
            {isTesting && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1.5s_infinite] rounded-full" />
            )}

            {/* Glowing Leading Head Dot */}
            {isTesting && clampedProgress > 0 && clampedProgress < 100 && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_#ffffff] animate-ping opacity-75" />
            )}
          </div>
        </div>

        {/* Subtle Bottom Ambient Glow Line */}
        <div 
          className={`absolute bottom-0 left-0 h-[1px] bg-gradient-to-r ${info.colorClass} opacity-40 transition-all duration-300`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};
