import React, { useMemo } from 'react';
import { Play, RotateCcw, Square, Activity, ArrowDown, ArrowUp, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { SpeedMetrics, TestPhase } from '../types';

interface SpeedGaugeProps {
  metrics: SpeedMetrics;
  phase: TestPhase;
  onStart: (mode?: 'full' | 'download_only') => void;
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
      phaseText = 'Ready for high-speed diagnostic';
      accentColor = '#06b6d4';
      break;
    case 'latency':
      displayValue = metrics.ping.current;
      displayLabel = 'ms';
      phaseText = 'Measuring packet latency & jitter...';
      accentColor = '#a855f7'; // Purple
      break;
    case 'download':
      displayValue = metrics.download.current;
      displayLabel = unit;
      phaseText = 'Testing Download Pulse & Bandwidth...';
      accentColor = '#06b6d4'; // Cyan
      break;
    case 'upload':
      displayValue = metrics.upload.current;
      displayLabel = unit;
      phaseText = 'Testing upload throughput...';
      accentColor = '#10b981'; // Emerald
      break;
    case 'finishing':
      displayValue = metrics.download.avg;
      displayLabel = unit;
      phaseText = 'Finalizing network diagnostics...';
      accentColor = '#6366f1'; // Indigo
      break;
    case 'completed':
      displayValue = metrics.download.avg;
      displayLabel = unit;
      phaseText = 'Test Completed Successfully';
      accentColor = '#10b981';
      break;
    case 'error':
      displayValue = 0;
      phaseText = metrics.error || 'Unable to complete the test. Please try again.';
      accentColor = '#f43f5e'; // Rose
      break;
  }

  // Calculate Gauge Arc (240 degree automotive sweep)
  let maxScale = 100;
  const currentVal = Math.max(metrics.download.peak, metrics.download.current, metrics.upload.current, 10);
  if (currentVal > 500) maxScale = 1500;
  else if (currentVal > 250) maxScale = 500;
  else if (currentVal > 100) maxScale = 250;
  else maxScale = 100;

  // Percentage for arc (0 to 1)
  const normalizedValue = Math.min(Math.max(displayValue / maxScale, 0), 1);
  
  // Radius and Circumference for SVG arc
  const radius = 122;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - normalizedValue * arcLength;

  // Needle angle: sweeps from 150° (0 speed at bottom-left) to 390° (max speed at bottom-right)
  const needleAngle = 150 + normalizedValue * 240;

  // 40 Precision Ticks (every 6° across 240° sweep) - Authentic automotive speedometer layout
  const gaugeTicks = useMemo(() => {
    const totalTicks = 40;
    const items = [];
    for (let i = 0; i <= totalTicks; i++) {
      const fraction = i / totalTicks;
      const angle = 150 + fraction * 240;
      const rad = (angle * Math.PI) / 180;
      const isMajor = i % 8 === 0;
      const isMedium = i % 4 === 0 && !isMajor;
      const isRedline = fraction >= 0.82;

      const rOuter = 132;
      const rInner = isMajor ? 116 : isMedium ? 122 : 126;

      const x1 = 160 + rInner * Math.cos(rad);
      const y1 = 160 + rInner * Math.sin(rad);
      const x2 = 160 + rOuter * Math.cos(rad);
      const y2 = 160 + rOuter * Math.sin(rad);

      // Speed Numeral for Major Ticks (rendered at radius 100)
      let num = null;
      if (isMajor) {
        const val = Math.round(fraction * maxScale);
        const rNum = 100;
        const nx = 160 + rNum * Math.cos(rad);
        const ny = 160 + rNum * Math.sin(rad);
        num = { val, nx, ny, fraction };
      }

      items.push({
        id: i,
        fraction,
        isMajor,
        isMedium,
        isRedline,
        x1,
        y1,
        x2,
        y2,
        num,
      });
    }
    return items;
  }, [maxScale]);

  const isTesting = phase !== 'idle' && phase !== 'completed' && phase !== 'error';
  const isDownload = phase === 'download';
  
  // Dynamic pulse speed & intensity based on current download speed
  const downloadSpeed = metrics.download.current;
  const downloadSpeedAvg = metrics.download.avg;
  // Faster pulse as download speed climbs
  const pulseDuration = Math.max(0.45, 1.6 - Math.min(downloadSpeed / 100, 1) * 1.0);

  // Compute /s (MB/s and kB/s)
  const activeDownSpeed = isDownload ? downloadSpeed : downloadSpeedAvg;
  const downMBps = activeDownSpeed > 0 ? (activeDownSpeed / 8).toFixed(2) : '0.00';
  const downKBps = activeDownSpeed > 0 ? Math.round((activeDownSpeed / 8) * 1024).toLocaleString() : '0';

  return (
    <div className="relative flex flex-col items-center justify-center p-4 select-none">
      {/* Main Gauge Viewport with mathematically centered Pulse Rings */}
      <div className="relative w-72 h-72 sm:w-84 sm:h-84 flex items-center justify-center">
        {/* === DOWNLOAD & TESTING PULSE SHOCKWAVE ENGINE === */}
        {/* Rendered at z-0 so it is completely visible above the card background and directly behind the gauge */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          {/* Layer 1: Ambient Luminous Core Aura */}
          <motion.div
            className="absolute w-60 h-60 sm:w-72 sm:h-72 rounded-full pointer-events-none blur-2xl"
            animate={{
              scale: isDownload ? [0.95, 1.25, 0.95] : isTesting ? [0.95, 1.1, 0.95] : [0.98, 1.05, 0.98],
              opacity: isDownload ? [0.45, 0.85, 0.45] : isTesting ? [0.25, 0.5, 0.25] : [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: isDownload ? pulseDuration : isTesting ? 1.4 : 3.0,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              backgroundColor: isDownload ? '#06b6d4' : accentColor,
            }}
          />

          {/* Active Testing & Download Pulse Waves */}
          {isTesting && (
            <>
              {/* Layer 2: Primary Neon Shockwave Ring (Continuous expansion) */}
              <motion.div
                className="absolute rounded-full border-2 pointer-events-none"
                style={{
                  width: '240px',
                  height: '240px',
                  borderColor: isDownload ? '#22d3ee' : accentColor,
                  boxShadow: isDownload
                    ? '0 0 30px rgba(6, 182, 212, 0.9), inset 0 0 15px rgba(6, 182, 212, 0.5)'
                    : `0 0 20px ${accentColor}`,
                }}
                animate={{
                  scale: [0.85, isDownload ? 1.4 : 1.2],
                  opacity: isDownload ? [0.95, 0] : [0.6, 0],
                }}
                transition={{
                  duration: isDownload ? pulseDuration : 1.4,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />

              {/* Layer 3: Secondary Shockwave Ring (Staggered continuous ripple) */}
              <motion.div
                className="absolute rounded-full border-2 pointer-events-none"
                style={{
                  width: '240px',
                  height: '240px',
                  borderColor: isDownload ? '#38bdf8' : accentColor,
                  boxShadow: isDownload
                    ? '0 0 25px rgba(56, 189, 248, 0.8)'
                    : `0 0 15px ${accentColor}`,
                }}
                animate={{
                  scale: [0.85, isDownload ? 1.45 : 1.25],
                  opacity: isDownload ? [0.85, 0] : [0.5, 0],
                }}
                transition={{
                  duration: isDownload ? pulseDuration : 1.4,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: (isDownload ? pulseDuration : 1.4) * 0.38,
                }}
              />

              {/* Layer 4: Dedicated High-Speed Download Pulse Wave */}
              {isDownload && (
                <motion.div
                  className="absolute rounded-full border border-cyan-200 pointer-events-none"
                  style={{
                    width: '220px',
                    height: '220px',
                    boxShadow: '0 0 20px rgba(165, 243, 252, 0.95), 0 0 40px rgba(6, 182, 212, 0.6)',
                  }}
                  animate={{
                    scale: [0.9, 1.32],
                    opacity: [0.9, 0],
                  }}
                  transition={{
                    duration: pulseDuration * 0.75,
                    repeat: Infinity,
                    ease: 'easeOut',
                    delay: pulseDuration * 0.18,
                  }}
                />
              )}

              {/* Layer 5: High-throughput Electric boundary wave when speed > 20 Mbps */}
              {isDownload && downloadSpeed > 20 && (
                <motion.div
                  className="absolute rounded-full border border-blue-400/60 pointer-events-none"
                  style={{
                    width: '260px',
                    height: '260px',
                    boxShadow: '0 0 35px rgba(59, 130, 246, 0.5)',
                  }}
                  animate={{
                    scale: [0.95, 1.22],
                    opacity: [0.65, 0],
                  }}
                  transition={{
                    duration: pulseDuration * 1.1,
                    repeat: Infinity,
                    ease: 'easeOut',
                    delay: 0.1,
                  }}
                />
              )}
            </>
          )}
        </div>

        {/* Speedometer SVG Gauge Graphic (Rendered at z-10) */}
        <svg
          className="relative z-10 w-full h-full overflow-visible pointer-events-none"
          viewBox="0 0 320 320"
          aria-hidden="true"
        >
          <defs>
            {/* High-Speed Multi-tone Gradient */}
            <linearGradient id="speedometerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="35%" stopColor="#06b6d4" />
              <stop offset="70%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>

            <linearGradient id="needleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="25%" stopColor={accentColor} />
              <stop offset="85%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>

            <linearGradient id="needleBodyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="30%" stopColor={accentColor} />
              <stop offset="90%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>

            <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="needleGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="tickGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. Outer Instrument Bezel with Metallic Rings */}
          <circle
            cx="160"
            cy="160"
            r="154"
            fill="#030712"
            fillOpacity="0.8"
            stroke="#1e293b"
            strokeWidth="2.5"
          />
          <circle
            cx="160"
            cy="160"
            r="150"
            fill="none"
            stroke="#334155"
            strokeWidth="1"
            strokeOpacity="0.45"
          />
          <circle
            cx="160"
            cy="160"
            r="146"
            fill="none"
            stroke="#1e293b"
            strokeWidth="0.75"
            strokeDasharray="2 4"
            strokeOpacity="0.6"
          />

          {/* 2. Background Recessed Track Arc (240° sweep from 150° to 390°) */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            fill="none"
            stroke="#0f172a"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={0}
            transform="rotate(150 160 160)"
          />
          {/* Subtle inner track line */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth="3"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={0}
            transform="rotate(150 160 160)"
            strokeOpacity="0.7"
          />

          {/* 3. High-Speed Redline Warning Arc (Top 18% of scale: 354° to 390°) */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            fill="none"
            stroke="#ef4444"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${circumference * (36 / 360)} ${circumference}`}
            strokeDashoffset={0}
            transform="rotate(354 160 160)"
            strokeOpacity="0.85"
          />

          {/* 4. Active Sweeping Neon Speed Arc */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            fill="none"
            stroke={phase === 'upload' ? '#10b981' : phase === 'latency' ? '#a855f7' : 'url(#speedometerGradient)'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(150 160 160)"
            filter="url(#gaugeGlow)"
            className="transition-all duration-100 ease-out"
          />

          {/* 5. Automotive Speedometer Ticks & Hash Marks */}
          {gaugeTicks.map((t) => {
            const isActive = t.fraction <= normalizedValue && normalizedValue > 0;
            const tickColor = isActive
              ? accentColor
              : t.isRedline
              ? '#ef4444'
              : t.isMajor
              ? '#94a3b8'
              : t.isMedium
              ? '#64748b'
              : '#334155';

            const strokeWidth = t.isMajor ? 2.5 : t.isMedium ? 1.5 : 1;
            const strokeOpacity = isActive ? 1 : t.isMajor ? 0.95 : t.isMedium ? 0.7 : 0.45;

            return (
              <line
                key={`tick-${t.id}`}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke={tickColor}
                strokeWidth={strokeWidth}
                strokeOpacity={strokeOpacity}
                strokeLinecap="round"
                filter={isActive ? 'url(#tickGlow)' : undefined}
                className="transition-colors duration-150"
              />
            );
          })}

          {/* 6. Speedometer Speed Numbers around dial */}
          {gaugeTicks.map((t) => {
            if (!t.num) return null;
            const isPassed = t.fraction <= normalizedValue && normalizedValue > 0;
            const numColor = isPassed
              ? '#38bdf8'
              : t.isRedline
              ? '#f87171'
              : '#94a3b8';

            return (
              <text
                key={`num-${t.id}`}
                x={t.num.nx}
                y={t.num.ny}
                textAnchor="middle"
                dominantBaseline="central"
                fill={numColor}
                className={`font-mono text-[11px] select-none pointer-events-none transition-colors duration-150 ${
                  isPassed ? 'font-bold' : 'font-medium'
                }`}
                style={{
                  textShadow: isPassed ? `0 0 8px ${accentColor}` : undefined,
                }}
              >
                {t.num.val}
              </text>
            );
          })}

          {/* 7. Authentic Instrument Cluster Branding Label */}
          <text
            x="160"
            y="82"
            textAnchor="middle"
            fill="#64748b"
            className="text-[8.5px] uppercase font-mono tracking-[0.25em] font-semibold select-none pointer-events-none"
          >
            NETPULSE • {unit}
          </text>

          {/* Min / Max indicators at the dial edges */}
          <text
            x="58"
            y="218"
            textAnchor="middle"
            fill="#64748b"
            className="text-[8px] font-mono font-bold tracking-wider select-none pointer-events-none"
          >
            0
          </text>
          <text
            x="262"
            y="218"
            textAnchor="middle"
            fill="#ef4444"
            className="text-[8px] font-mono font-bold tracking-wider select-none pointer-events-none"
          >
            MAX
          </text>

          {/* 8. Automotive High-Speed Needle Assembly (Framer Motion) */}
          <motion.g
            initial={{ rotate: 150 }}
            animate={{ rotate: needleAngle }}
            transition={{
              type: 'spring',
              stiffness: 130,
              damping: 17,
              mass: 0.4,
              restDelta: 0.001,
            }}
            style={{ transformOrigin: '160px 160px' }}
          >
            {/* Needle Drop Shadow for 3D realism */}
            <polygon
              points="136,162 158,165 272,162 272,158 158,155 136,158"
              fill="#000000"
              fillOpacity="0.45"
              transform="translate(2, 3)"
            />

            {/* Aerodynamic Counterweight behind Pivot */}
            <rect
              x="134"
              y="157"
              width="22"
              height="6"
              rx="2"
              fill="#1e293b"
              stroke="#334155"
              strokeWidth="1"
            />
            <line x1="139" y1="158" x2="139" y2="162" stroke="#475569" strokeWidth="1" />
            <line x1="145" y1="158" x2="145" y2="162" stroke="#475569" strokeWidth="1" />

            {/* Needle Tapered Sports Blade */}
            <polygon
              points="156,156.5 273,158.8 277,160 273,161.2 156,163.5"
              fill="url(#needleBodyGradient)"
            />

            {/* High-Intensity Laser Filament down center of blade */}
            <line
              x1="158"
              y1="160"
              x2="275"
              y2="160"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeLinecap="round"
              filter="url(#needleGlow)"
            />

            {/* Razor-sharp Needle Pointer Tip Dot */}
            <circle
              cx="275"
              cy="160"
              r="3.5"
              fill="#ffffff"
              stroke={accentColor}
              strokeWidth="1.5"
              filter="url(#needleGlow)"
            />

            {/* Instrument Hub Boss Cap (Multi-tiered Chrome & Jewel) */}
            <circle
              cx="160"
              cy="160"
              r="14"
              fill="#090d16"
              stroke="#334155"
              strokeWidth="2.5"
            />
            <circle
              cx="160"
              cy="160"
              r="9"
              fill="#1e293b"
              stroke="#475569"
              strokeWidth="1"
            />
            <circle
              cx="160"
              cy="160"
              r="4.5"
              fill={accentColor}
              filter="url(#needleGlow)"
            />
            <circle
              cx="158.5"
              cy="158.5"
              r="1.5"
              fill="#ffffff"
              fillOpacity="0.85"
            />
          </motion.g>
        </svg>

        {/* Center Digital Display & Primary Interaction Trigger */}
        <div className="absolute z-20 inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-auto">
          {phase === 'idle' ? (
            <div className="flex flex-col items-center gap-3">
              <button
                id="start-speed-test-button"
                onClick={() => onStart('full')}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 px-9 sm:px-11 rounded-full shadow-2xl shadow-cyan-500/30 text-sm sm:text-base tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-4 focus:ring-cyan-400/40 uppercase"
                aria-label="Start Full Speed Test"
              >
                START TEST
              </button>

              <button
                id="check-download-speed-only-btn"
                onClick={() => onStart('download_only')}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 hover:border-cyan-400 transition-all cursor-pointer shadow-md shadow-cyan-500/20 hover:scale-105 active:scale-95"
                title="Only test download speed with live Mbps and MB/s rate"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                </span>
                <ArrowDown className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
                <span>Check Download Only</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              {/* Dynamic Sub-phase Icon Badge */}
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border mb-1.5 transition-all ${
                isDownload 
                  ? 'bg-cyan-950/90 border-cyan-400/80 shadow-md shadow-cyan-500/30 ring-1 ring-cyan-400/50' 
                  : 'bg-slate-900/90 border-slate-700/60'
              }`}>
                {phase === 'latency' && <Activity className="w-3.5 h-3.5 text-purple-400 animate-pulse" />}
                {isDownload && (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <ArrowDown className="relative inline-flex w-3 h-3 text-cyan-300" />
                  </span>
                )}
                {phase === 'upload' && <ArrowUp className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />}
                {phase === 'completed' && <Zap className="w-3.5 h-3.5 text-emerald-400" />}
                <span className={`text-[11px] font-bold uppercase tracking-wider ${
                  isDownload ? 'text-cyan-300 font-extrabold' : 'text-slate-300'
                }`}>
                  {phase === 'latency' ? 'Checking Latency...' : isDownload ? '⚡ Download Pulse Active' : phase === 'upload' ? 'Testing Upload...' : phase}
                </span>
              </div>

              {/* Large Digital Metric */}
              <div className="flex items-baseline justify-center">
                <span className="font-mono-num text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-md">
                  {displayValue > 0 ? displayValue.toFixed(displayValue < 10 && displayLabel !== 'ms' ? 2 : 1) : '0.0'}
                </span>
                <span className="ml-1.5 text-sm sm:text-base font-bold text-cyan-400">
                  {displayLabel}
                </span>
              </div>

              {/* DUAL SPEED READOUT: Prominent /s (MB/s) Display */}
              {(isDownload || (phase === 'completed' && metrics.download.avg > 0)) && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-1 flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-500/50 shadow-sm shadow-cyan-500/30"
                >
                  <span className="text-[10px] uppercase font-bold text-cyan-400">
                    Rate (/s):
                  </span>
                  <span className="font-mono text-xs sm:text-sm font-bold text-white">
                    {downMBps} MB/s
                  </span>
                  <span className="text-[9px] text-cyan-300/80 font-mono hidden sm:inline">
                    ({downKBps} kB/s)
                  </span>
                </motion.div>
              )}

              {/* Download Live Equalizer Pulse Wave */}
              {isDownload && (
                <div className="flex items-center gap-1 my-1.5" title="Live multi-thread download packet stream">
                  {[0.4, 0.9, 0.6, 1.0, 0.7, 0.5, 0.85, 0.45].map((scale, i) => (
                    <motion.span
                      key={i}
                      className="w-1 bg-gradient-to-t from-cyan-500 to-blue-400 rounded-full"
                      animate={{ height: ['4px', `${12 * scale}px`, '4px'] }}
                      transition={{
                        duration: 0.35 + i * 0.06,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Progress Indicator Bar */}
              {isTesting && (
                <div className="w-32 sm:w-40 mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all duration-150"
                    style={{ width: `${metrics.progress}%` }}
                  />
                </div>
              )}

              {/* Action button below metric */}
              {isTesting ? (
                <button
                  id="cancel-speed-test-button"
                  onClick={onStop}
                  className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/40 transition-colors cursor-pointer"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>Stop Test</span>
                </button>
              ) : (
                <button
                  id="test-again-gauge-button"
                  onClick={() => onStart('full')}
                  className="mt-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-2 px-7 rounded-full shadow-lg shadow-cyan-500/25 text-xs sm:text-sm tracking-wider uppercase transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  TEST AGAIN
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Real-time Status Badge & Instructions */}
      <div className="mt-4 flex flex-col items-center text-center max-w-md w-full">
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium border ${
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

        {/* Live Mini Counters with Dual Mbps and /s (MB/s) Display */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 w-full">
          {/* Ping */}
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
            <span className="text-[10px] sm:text-[11px] text-slate-400 block font-semibold uppercase">Ping / Jitter</span>
            <span className="font-mono-num text-xs sm:text-sm font-bold text-purple-300">
              {metrics.ping.avg > 0 ? `${metrics.ping.avg} ms` : metrics.ping.current > 0 ? `${metrics.ping.current} ms` : '--'}
              {metrics.ping.jitter > 0 && (
                <span className="text-[10px] text-purple-400 font-normal ml-1 block sm:inline">
                  (±{metrics.ping.jitter}ms)
                </span>
              )}
            </span>
          </div>

          {/* Download (Highlighted with Pulse Effect) */}
          <div className={`p-2.5 rounded-xl border text-center transition-all ${
            isDownload 
              ? 'bg-cyan-950/50 border-cyan-400/80 ring-2 ring-cyan-500/30 shadow-md shadow-cyan-500/20' 
              : 'bg-slate-900/60 border-slate-800/80'
          }`}>
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <ArrowDown className={`w-3 h-3 ${isDownload ? 'text-cyan-400 animate-bounce' : 'text-slate-400'}`} />
              <span className="text-[10px] sm:text-[11px] text-slate-300 font-bold uppercase">Download</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-mono-num text-xs sm:text-sm font-bold text-cyan-300">
                {metrics.download.current > 0 
                  ? `${metrics.download.current.toFixed(1)} ${unit}` 
                  : metrics.download.avg > 0 
                  ? `${metrics.download.avg.toFixed(1)} ${unit}` 
                  : '--'}
              </span>
              <span className="text-[10px] text-white font-mono font-bold mt-0.5 px-1.5 py-0.5 rounded bg-cyan-900/60 border border-cyan-500/30">
                {metrics.download.current > 0 
                  ? `${(metrics.download.current / 8).toFixed(2)} MB/s` 
                  : metrics.download.avg > 0 
                  ? `${(metrics.download.avg / 8).toFixed(2)} MB/s` 
                  : '0.00 MB/s'}
              </span>
            </div>
          </div>

          {/* Upload */}
          <div className={`p-2.5 rounded-xl border text-center transition-all ${
            phase === 'upload' 
              ? 'bg-blue-950/50 border-blue-400/80 ring-2 ring-blue-500/30 shadow-md shadow-blue-500/20' 
              : 'bg-slate-900/60 border-slate-800/80'
          }`}>
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <ArrowUp className={`w-3 h-3 ${phase === 'upload' ? 'text-blue-400 animate-bounce' : 'text-slate-400'}`} />
              <span className="text-[10px] sm:text-[11px] text-slate-300 font-bold uppercase">Upload</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-mono-num text-xs sm:text-sm font-bold text-blue-300">
                {metrics.upload.current > 0 
                  ? `${metrics.upload.current.toFixed(1)} ${unit}` 
                  : metrics.upload.avg > 0 
                  ? `${metrics.upload.avg.toFixed(1)} ${unit}` 
                  : '--'}
              </span>
              <span className="text-[10px] text-slate-300 font-mono mt-0.5">
                {metrics.upload.current > 0 
                  ? `${(metrics.upload.current / 8).toFixed(2)} MB/s` 
                  : metrics.upload.avg > 0 
                  ? `${(metrics.upload.avg / 8).toFixed(2)} MB/s` 
                  : '0.00 MB/s'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
