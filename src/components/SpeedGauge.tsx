import React from 'react';
import { Play, RotateCcw, Square, Activity, ArrowDown, ArrowUp, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { SpeedMetrics, TestPhase } from '../types';

interface SpeedGaugeProps {
  metrics: SpeedMetrics;
  phase: TestPhase;
  onStart: () => void;
  onStop: () => void;
  unit: string;
}

export const SpeedGauge: React.FC<SpeedGaugeProps> = ({
  metrics,
  phase,
  onStart,
  onStop,
  unit,
}) => {
  // Determine primary value to display based on phase
  let displayValue = 0;
  let displayLabel = 'Mbps';
  let phaseText = 'Ready to test';
  let accentColor = '#06b6d4'; // Cyan default

  switch (phase) {
    case 'idle':
      displayValue = 0;
      phaseText = 'Ready to test';
      accentColor = '#06b6d4';
      break;
    case 'latency':
      displayValue = metrics.ping.current;
      displayLabel = 'ms';
      phaseText = 'Checking latency & jitter...';
      accentColor = '#a855f7'; // Purple
      break;
    case 'download':
      displayValue = metrics.download.current;
      displayLabel = unit;
      phaseText = 'Testing download speed...';
      accentColor = '#06b6d4'; // Cyan
      break;
    case 'upload':
      displayValue = metrics.upload.current;
      displayLabel = unit;
      phaseText = 'Testing upload speed...';
      accentColor = '#10b981'; // Emerald
      break;
    case 'finishing':
      displayValue = metrics.download.avg;
      displayLabel = unit;
      phaseText = 'Calculating results...';
      accentColor = '#6366f1'; // Indigo
      break;
    case 'completed':
      displayValue = metrics.download.avg;
      displayLabel = unit;
      phaseText = 'Test Complete';
      accentColor = '#10b981';
      break;
    case 'error':
      displayValue = 0;
      phaseText = metrics.error || 'Unable to complete the test. Please try again.';
      accentColor = '#f43f5e'; // Rose
      break;
  }

  // Calculate Gauge Arc (260 degree arc)
  // Max scale dynamic: up to 100 Mbps, 500 Mbps, or 1000+ Mbps depending on current speed
  let maxScale = 100;
  const currentVal = Math.max(metrics.download.peak, metrics.download.current, metrics.upload.current, 10);
  if (currentVal > 500) maxScale = 1500;
  else if (currentVal > 250) maxScale = 500;
  else if (currentVal > 100) maxScale = 250;
  else maxScale = 100;

  // Percentage for arc (0 to 1)
  const normalizedValue = Math.min(Math.max(displayValue / maxScale, 0), 1);
  
  // Radius and Circumference for SVG arc
  const radius = 135;
  const circumference = 2 * Math.PI * radius;
  // Use a 240-degree open arc at the bottom
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - normalizedValue * arcLength;

  // Needle angle: sweeps 240 degrees from start (0 deg in SVG space = 7 o'clock in screen space)
  const needleAngle = normalizedValue * 240;

  const isTesting = phase !== 'idle' && phase !== 'completed' && phase !== 'error';
  const isDownload = phase === 'download';
  
  // Dynamic pulse speed & intensity based on current download speed (faster pulse as speed increases)
  const downloadSpeed = metrics.download.current;
  const pulseDuration = Math.max(0.6, 1.8 - Math.min(downloadSpeed / 100, 1) * 1.0);

  return (
    <div className="relative flex flex-col items-center justify-center p-4 select-none">
      {/* Outer Pulse Glow Rings during active testing with special Download speed acceleration */}
      {isTesting && (
        <>
          {/* Layer 1: Ambient soft aura */}
          <motion.div 
            className="absolute w-72 h-72 sm:w-84 sm:h-84 rounded-full -z-20 pointer-events-none blur-2xl"
            animate={{
              scale: isDownload ? [1, 1.18, 1] : [1, 1.08, 1],
              opacity: isDownload ? [0.25, 0.55, 0.25] : [0.15, 0.35, 0.15],
            }}
            transition={{
              duration: isDownload ? pulseDuration : 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ backgroundColor: accentColor }}
          />

          {/* Layer 2: Expanding energetic shockwave ring */}
          <motion.div 
            className="absolute w-72 h-72 sm:w-84 sm:h-84 rounded-full -z-10 pointer-events-none border-2"
            animate={{
              scale: [0.95, isDownload ? 1.35 : 1.2],
              opacity: isDownload ? [0.6, 0] : [0.35, 0],
            }}
            transition={{
              duration: isDownload ? pulseDuration : 1.5,
              repeat: Infinity,
              ease: 'easeOut',
            }}
            style={{ borderColor: accentColor }}
          />

          {/* Layer 3: High-speed secondary micro pulse for download */}
          {isDownload && downloadSpeed > 20 && (
            <motion.div 
              className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full -z-10 pointer-events-none border border-cyan-300/40"
              animate={{
                scale: [0.98, 1.22],
                opacity: [0.7, 0],
              }}
              transition={{
                duration: pulseDuration * 0.7,
                repeat: Infinity,
                ease: 'easeOut',
                delay: pulseDuration * 0.3,
              }}
            />
          )}
        </>
      )}

      {/* Main Gauge SVG Viewport */}
      <div className="relative w-72 h-72 sm:w-84 sm:h-84 flex items-center justify-center">
        <svg
          className="w-full h-full transform -rotate-120 overflow-visible"
          viewBox="0 0 320 320"
          aria-hidden="true"
        >
          <defs>
            {/* Dynamic Gradients */}
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>

            <linearGradient id="needleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#334155" stopOpacity="0.2" />
              <stop offset="50%" stopColor={accentColor} stopOpacity="0.7" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
            </linearGradient>

            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="needleGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Dotted Track Arc */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth="5"
            strokeDasharray="10 5"
            strokeLinecap="round"
          />

          {/* Sub-division Scale Ticks */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((step, idx) => {
            const angle = -120 + step * 240;
            const rad = (angle * Math.PI) / 180;
            const x1 = 160 + (radius - 12) * Math.cos(rad);
            const y1 = 160 + (radius - 12) * Math.sin(rad);
            const x2 = 160 + (radius - 4) * Math.cos(rad);
            const y2 = 160 + (radius - 4) * Math.sin(rad);
            return (
              <line
                key={idx}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#475569"
                strokeWidth="2"
                strokeOpacity="0.5"
              />
            );
          })}

          {/* Active Progress Arc */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            filter="url(#glowEffect)"
            className="transition-all duration-150 ease-out"
          />

          {/* Dynamic Speedometer Needle using Framer Motion */}
          <motion.g
            initial={{ rotate: 0 }}
            animate={{ rotate: needleAngle }}
            transition={{
              type: 'spring',
              stiffness: 120,
              damping: 16,
              mass: 0.5,
              restDelta: 0.001,
            }}
            style={{ transformOrigin: '160px 160px' }}
          >
            {/* Needle Drop Shadow */}
            <line
              x1="160"
              y1="160"
              x2={160 + (radius - 18)}
              y2="160"
              stroke="#000000"
              strokeWidth="4"
              strokeOpacity="0.35"
              strokeLinecap="round"
              transform="translate(2, 2)"
            />

            {/* Subtle Counterweight Extension behind pivot */}
            <line
              x1="160"
              y1="160"
              x2="136"
              y2="160"
              stroke="#334155"
              strokeWidth="3"
              strokeLinecap="round"
              strokeOpacity="0.7"
            />

            {/* Needle Main Glowing Beam */}
            <line
              x1="160"
              y1="160"
              x2={160 + (radius - 16)}
              y2="160"
              stroke="url(#needleGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              filter="url(#needleGlow)"
            />

            {/* Needle High-Precision Tip Pointer Dot */}
            <circle
              cx={160 + (radius - 16)}
              cy="160"
              r="3"
              fill="#ffffff"
              stroke={accentColor}
              strokeWidth="1.5"
              filter="url(#needleGlow)"
            />

            {/* Center Pivot Hub Cap */}
            <circle
              cx="160"
              cy="160"
              r="8"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="2"
            />
            <circle
              cx="160"
              cy="160"
              r="3.5"
              fill={accentColor}
              filter="url(#needleGlow)"
            />
          </motion.g>
        </svg>

        {/* Center Digital Display & Primary Interaction Trigger */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {phase === 'idle' ? (
            <button
              id="start-speed-test-button"
              onClick={onStart}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 px-10 sm:px-12 rounded-full shadow-2xl shadow-blue-500/30 text-base sm:text-lg tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-4 focus:ring-cyan-400/40"
              aria-label="Start Internet Speed Test"
            >
              START TEST
            </button>
          ) : (
            <div className="flex flex-col items-center justify-center">
              {/* Dynamic Sub-phase Icon */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/60 mb-2">
                {phase === 'latency' && <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />}
                {phase === 'download' && <ArrowDown className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />}
                {phase === 'upload' && <ArrowUp className="w-3.5 h-3.5 text-blue-400 animate-bounce" />}
                {phase === 'completed' && <Zap className="w-3.5 h-3.5 text-emerald-400" />}
                <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                  {phase === 'latency' ? 'Checking Latency...' : phase === 'download' ? 'Testing Download...' : phase === 'upload' ? 'Testing Upload...' : phase}
                </span>
              </div>

              {/* Large Digital Metric */}
              <div className="flex items-baseline justify-center">
                <span className="font-mono-num text-5xl sm:text-6xl font-bold tracking-tight text-white drop-shadow-sm">
                  {displayValue > 0 ? displayValue.toFixed(displayValue < 10 && displayLabel !== 'ms' ? 2 : 1) : '0'}
                </span>
                <span className="ml-1.5 text-sm sm:text-base font-medium text-slate-400">
                  {displayLabel}
                </span>
              </div>

              {/* Progress Indicator Bar */}
              {isTesting && (
                <div className="w-32 sm:w-40 mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all duration-200"
                    style={{ width: `${metrics.progress}%` }}
                  />
                </div>
              )}

              {/* Action button below metric */}
              {isTesting ? (
                <button
                  id="cancel-speed-test-button"
                  onClick={onStop}
                  className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/40 transition-colors cursor-pointer"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>Stop Test</span>
                </button>
              ) : (
                <button
                  id="test-again-gauge-button"
                  onClick={onStart}
                  className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-2.5 px-8 rounded-full shadow-lg shadow-blue-500/25 text-xs sm:text-sm tracking-wider uppercase transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  TEST AGAIN
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Real-time Status Badge & Instructions */}
      <div className="mt-4 flex flex-col items-center text-center max-w-md">
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border ${
            phase === 'error'
              ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
              : phase === 'completed'
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : isTesting
              ? 'bg-cyan-950/40 border-cyan-800/60 text-cyan-300 animate-pulse'
              : 'bg-slate-900/80 border-slate-800 text-slate-300'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              phase === 'error'
                ? 'bg-rose-500'
                : phase === 'completed'
                ? 'bg-emerald-400'
                : isTesting
                ? 'bg-cyan-400'
                : 'bg-slate-500'
            }`}
          />
          <span>{phaseText}</span>
        </div>

        {/* Live Mini Counters while Testing */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 w-full">
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-center">
            <span className="text-[11px] text-slate-400 block font-medium">Ping / Jitter</span>
            <span className="font-mono-num text-xs sm:text-sm font-bold text-purple-300">
              {metrics.ping.avg > 0 ? `${metrics.ping.avg} ms` : '--'}
              {metrics.ping.jitter > 0 && (
                <span className="text-[10px] text-purple-400 font-normal ml-1">
                  (±{metrics.ping.jitter}ms)
                </span>
              )}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-center">
            <span className="text-[11px] text-slate-400 block font-medium">Download</span>
            <div className="flex flex-col items-center">
              <span className="font-mono-num text-xs sm:text-sm font-bold text-cyan-300">
                {metrics.download.current > 0 ? `${metrics.download.current.toFixed(1)} ${unit}` : '--'}
              </span>
              {metrics.download.current > 0 && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {(metrics.download.current / 8).toFixed(2)} MB/s
                </span>
              )}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-center">
            <span className="text-[11px] text-slate-400 block font-medium">Upload</span>
            <div className="flex flex-col items-center">
              <span className="font-mono-num text-xs sm:text-sm font-bold text-emerald-300">
                {metrics.upload.current > 0 ? `${metrics.upload.current.toFixed(1)} ${unit}` : '--'}
              </span>
              {metrics.upload.current > 0 && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {(metrics.upload.current / 8).toFixed(2)} MB/s
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
