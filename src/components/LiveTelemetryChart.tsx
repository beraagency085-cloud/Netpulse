import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine, 
  CartesianGrid 
} from 'recharts';
import { Activity, ArrowDown, ArrowUp, Zap, ShieldCheck, BarChart3 } from 'lucide-react';
import { SpeedMetrics } from '../types';

interface LiveTelemetryChartProps {
  metrics: SpeedMetrics;
  unit: string;
}

interface TelemetryPoint {
  index: number;
  timeLabel: string;
  speed: number;
  avg: number;
  phase: string;
}

// Reusable mini sparkline for individual metric cards
export const MiniSparkline: React.FC<{
  data: number[];
  color: string;
  gradientId: string;
  height?: number;
}> = ({ data, color, gradientId, height = 36 }) => {
  if (!data || data.length < 2) {
    return (
      <div 
        style={{ height }} 
        className="w-full flex items-center justify-center text-[10px] text-slate-600 font-mono"
      >
        <span className="h-0.5 w-12 bg-slate-800 rounded-full" />
      </div>
    );
  }

  const chartData = data.map((val, idx) => ({ idx, val }));

  return (
    <div className="w-full overflow-hidden" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="val"
            stroke={color}
            strokeWidth={1.75}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const LiveTelemetryChart: React.FC<LiveTelemetryChartProps> = ({ metrics, unit }) => {
  const [selectedView, setSelectedView] = useState<'auto' | 'download' | 'upload'>('auto');

  const isDownloadPhase = metrics.phase === 'download';
  const isUploadPhase = metrics.phase === 'upload';
  const isCompleted = metrics.phase === 'completed' || metrics.phase === 'finishing';

  // Determine active dataset
  const activeStream = useMemo(() => {
    if (selectedView === 'download') return 'download';
    if (selectedView === 'upload') return 'upload';
    if (isUploadPhase) return 'upload';
    if (isDownloadPhase) return 'download';
    if (metrics.upload.telemetry.length > 0 && !metrics.download.telemetry.length) return 'upload';
    return 'download';
  }, [selectedView, isDownloadPhase, isUploadPhase, metrics.download.telemetry.length, metrics.upload.telemetry.length]);

  const rawData = activeStream === 'download' 
    ? metrics.download.telemetry 
    : metrics.upload.telemetry;

  const activeAvg = activeStream === 'download' 
    ? metrics.download.avg || metrics.download.current || 0 
    : metrics.upload.avg || metrics.upload.current || 0;

  const activePeak = activeStream === 'download'
    ? metrics.download.peak || (rawData.length ? Math.max(...rawData) : 0)
    : metrics.upload.peak || (rawData.length ? Math.max(...rawData) : 0);

  // Compute stability/jitter metrics on throughput
  const stats = useMemo(() => {
    if (rawData.length < 2) {
      return {
        min: 0,
        max: 0,
        variance: 0,
        stdDev: 0,
        consistencyPct: 100,
        stabilityLabel: 'Measuring...',
      };
    }

    const min = Math.min(...rawData);
    const max = Math.max(...rawData);
    const avg = rawData.reduce((acc, v) => acc + v, 0) / rawData.length;
    
    // Calculate sample variance and standard deviation (jitter)
    const variance = rawData.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / rawData.length;
    const stdDev = Math.sqrt(variance);

    // Consistency score (0% to 100%)
    const coefVariation = avg > 0 ? (stdDev / avg) : 0;
    const consistencyPct = Math.max(0, Math.min(100, Math.round((1 - Math.min(coefVariation, 1)) * 100)));

    let stabilityLabel = 'Rock Solid';
    if (consistencyPct < 75) stabilityLabel = 'Fluctuating';
    else if (consistencyPct < 90) stabilityLabel = 'Moderate';
    else stabilityLabel = 'Rock Solid';

    return {
      min,
      max,
      variance,
      stdDev,
      consistencyPct,
      stabilityLabel,
    };
  }, [rawData]);

  const chartData: TelemetryPoint[] = useMemo(() => {
    return rawData.map((val, idx) => ({
      index: idx + 1,
      timeLabel: `${((idx + 1) * 0.1).toFixed(1)}s`,
      speed: val,
      avg: Number(activeAvg.toFixed(2)),
      phase: activeStream,
    }));
  }, [rawData, activeAvg, activeStream]);

  if (rawData.length < 2) {
    return null;
  }

  const isDownload = activeStream === 'download';
  const strokeColor = isDownload ? '#22d3ee' : '#3b82f6';
  const gradId = isDownload ? 'downloadSparkGrad' : 'uploadSparkGrad';

  return (
    <div 
      id="live-sparkline-telemetry" 
      className="w-full max-w-2xl mx-auto p-4 sm:p-5 bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-md shadow-xl transition-all"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isDownload ? 'bg-cyan-500/10 text-cyan-400' : 'bg-blue-500/10 text-blue-400'}`}>
            {isDownload ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Real-Time {isDownload ? 'Download' : 'Upload'} Sparkline
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            <span className="text-[11px] text-slate-400">
              High-frequency multi-stream telemetry & jitter analysis
            </span>
          </div>
        </div>

        {/* Stream Toggle Switch (when both or completed) */}
        {(metrics.upload.telemetry.length > 0 || isCompleted) && (
          <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-[11px]">
            <button
              onClick={() => setSelectedView('download')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                activeStream === 'download'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Download
            </button>
            <button
              onClick={() => setSelectedView('upload')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                activeStream === 'upload'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Upload
            </button>
          </div>
        )}
      </div>

      {/* Main Recharts Sparkline Area */}
      <div className="relative w-full h-36 sm:h-44 rounded-xl bg-slate-950/60 p-2 sm:p-3 border border-slate-800/80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="downloadSparkGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
                <stop offset="60%" stopColor="#06b6d4" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#0891b2" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="uploadSparkGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="60%" stopColor="#2563eb" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

            <XAxis
              dataKey="timeLabel"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={25}
            />

            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={[0, 'auto']}
              unit={` ${unit}`}
              width={55}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const dataPoint = payload[0].payload as TelemetryPoint;
                  return (
                    <div className="bg-slate-900/95 border border-slate-700 p-2.5 rounded-xl shadow-2xl backdrop-blur-md text-xs">
                      <div className="text-[10px] text-slate-400 font-mono">
                        Time: {dataPoint.timeLabel} (Sample #{dataPoint.index})
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 font-bold">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: strokeColor }} />
                        <span className="text-white font-mono-num text-sm">
                          {dataPoint.speed.toFixed(2)} {unit}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Session Avg: {dataPoint.avg.toFixed(2)} {unit}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Average Baseline Reference */}
            {activeAvg > 0 && (
              <ReferenceLine
                y={activeAvg}
                stroke="#64748b"
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{
                  value: `AVG: ${activeAvg.toFixed(1)} ${unit}`,
                  fill: '#94a3b8',
                  fontSize: 9,
                  position: 'insideTopRight',
                }}
              />
            )}

            <Area
              type="monotone"
              dataKey="speed"
              stroke={strokeColor}
              strokeWidth={2.5}
              fill={`url(#${gradId})`}
              dot={false}
              activeDot={{ r: 4, fill: '#ffffff', stroke: strokeColor, strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Jitter & Consistency Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-slate-800/80">
        {/* Peak Speed */}
        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/70 text-center">
          <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Peak Speed</span>
          <span className="font-mono-num text-xs sm:text-sm font-bold text-white">
            {activePeak.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">{unit}</span>
          </span>
        </div>

        {/* Throughput Variance / Jitter */}
        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/70 text-center">
          <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Speed Jitter</span>
          <span className="font-mono-num text-xs sm:text-sm font-bold text-cyan-300">
            ±{stats.stdDev.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">{unit}</span>
          </span>
        </div>

        {/* Consistency Score */}
        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/70 text-center">
          <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Consistency</span>
          <span className="font-mono-num text-xs sm:text-sm font-bold text-emerald-400">
            {stats.consistencyPct}%
          </span>
        </div>

        {/* Stability Rating */}
        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/70 text-center">
          <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Stream Quality</span>
          <span className="text-xs sm:text-sm font-bold text-slate-200">
            {stats.stabilityLabel}
          </span>
        </div>
      </div>
    </div>
  );
};
