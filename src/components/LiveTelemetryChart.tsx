import React from 'react';
import { Activity } from 'lucide-react';
import { SpeedMetrics } from '../types';

interface LiveTelemetryChartProps {
  metrics: SpeedMetrics;
  unit: string;
}

export const LiveTelemetryChart: React.FC<LiveTelemetryChartProps> = ({ metrics, unit }) => {
  const isDownload = metrics.phase === 'download';
  const isUpload = metrics.phase === 'upload';
  const data = isDownload ? metrics.download.telemetry : isUpload ? metrics.upload.telemetry : [];

  if (data.length < 2) {
    return null;
  }

  const maxVal = Math.max(...data, 10);
  const minVal = 0;
  const width = 600;
  const height = 100;
  const padding = 10;

  // Build SVG polyline points
  const points = data
    .map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((val - minVal) / (maxVal - minVal)) * (height - 2 * padding);
      return `${x},${y}`;
    })
    .join(' ');

  // Build closed area polygon
  const firstX = padding;
  const lastX = padding + (width - 2 * padding);
  const bottomY = height - padding;
  const areaPoints = `${firstX},${bottomY} ${points} ${lastX},${bottomY}`;

  const strokeColor = isDownload ? '#06b6d4' : '#10b981';
  const fillColor = isDownload ? 'url(#downloadAreaGrad)' : 'url(#uploadAreaGrad)';

  return (
    <div className="w-full max-w-xl mx-auto p-4 bg-slate-900/60 border border-slate-800 rounded-xl backdrop-blur-md">
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
        <div className="flex items-center gap-1.5 font-medium">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Real-time Throughput Stream</span>
        </div>
        <div className="font-mono-num text-slate-300">
          Peak: <span className="font-bold text-white">{maxVal.toFixed(1)}</span> {unit}
        </div>
      </div>

      <div className="relative w-full h-24 overflow-hidden rounded-lg bg-slate-950/60 p-1 border border-slate-800/60">
        <svg
          className="w-full h-full"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="downloadAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="uploadAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#334155" strokeDasharray="4 4" strokeWidth="1" />
          
          {/* Area Fill */}
          <polygon points={areaPoints} fill={fillColor} />

          {/* Line Stroke */}
          <polyline
            points={points}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};
