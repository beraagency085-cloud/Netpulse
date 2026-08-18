import React, { useState } from 'react';
import { 
  ArrowDown, 
  ArrowUp, 
  Activity, 
  Gauge, 
  RotateCcw, 
  Share2, 
  Copy, 
  Check, 
  Download, 
  Server, 
  ShieldCheck, 
  Gamepad2, 
  Tv, 
  Video, 
  CloudUpload,
  Info,
  Globe
} from 'lucide-react';
import { SpeedMetrics, QualityAssessment, ServerNode, ClientInfo } from '../types';

interface ResultCardProps {
  metrics: SpeedMetrics;
  assessment: QualityAssessment;
  server: ServerNode | null;
  client: ClientInfo | null;
  unit: string;
  onTestAgain: () => void;
  onOpenShareModal: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  metrics,
  assessment,
  server,
  client,
  unit,
  onTestAgain,
  onOpenShareModal,
}) => {
  const [copied, setCopied] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const copySummaryText = () => {
    const text = `⚡ NetPulse Speed Test Results ⚡
----------------------------------
⬇️ Download: ${metrics.download.avg} ${unit} (Peak: ${metrics.download.peak} ${unit})
⬆️ Upload: ${metrics.upload.avg} ${unit} (Peak: ${metrics.upload.peak} ${unit})
📶 Ping: ${metrics.ping.avg} ms (Min: ${metrics.ping.min} ms)
〰️ Jitter: ${metrics.ping.jitter} ms
🏆 Connection Rating: ${assessment.grade} (${assessment.label})
🖥️ Server: ${server ? server.name : 'NetPulse Edge'}
📅 Tested: ${new Date(metrics.timestamp || Date.now()).toLocaleString()}
----------------------------------
Test your internet speed at NetPulse Test`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div id="netpulse-result-dashboard" className="w-full max-w-4xl mx-auto my-6 animate-fade-in">
      {/* Primary Result Container */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/40 shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Top Header Bar with Grade & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-slate-800/80 bg-slate-950/40 gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white font-black text-2xl shadow-lg shadow-blue-500/20">
              {assessment.grade}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">
                  {assessment.label}
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {assessment.summary}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="copy-results-quick-button"
              onClick={copySummaryText}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              title="Copy formatted result summary"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>

            <button
              id="open-share-export-button"
              onClick={onOpenShareModal}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share & Export</span>
            </button>
          </div>
        </div>

        {/* 4 Core Primary Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-800/80 bg-slate-900/20">
          {/* Download Speed */}
          <div className="p-6 flex flex-col justify-between group hover:bg-slate-800/20 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-medium">
              <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
                DOWNLOAD
              </span>
              <span className="text-[10px] text-slate-500 font-mono-num">
                Peak: {metrics.download.peak}
              </span>
            </div>
            <div className="my-2">
              <span className="font-mono-num text-4xl sm:text-5xl font-bold text-white tracking-tight">
                {metrics.download.avg}
              </span>
              <span className="ml-1 text-xs sm:text-sm font-medium text-slate-400">
                {unit}
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Transferred: {formatBytes(metrics.download.bytesTransferred)}
            </div>
          </div>

          {/* Upload Speed */}
          <div className="p-6 flex flex-col justify-between group hover:bg-slate-800/20 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-medium">
              <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <ArrowUp className="w-3.5 h-3.5 text-blue-400" />
                UPLOAD
              </span>
              <span className="text-[10px] text-slate-500 font-mono-num">
                Peak: {metrics.upload.peak}
              </span>
            </div>
            <div className="my-2">
              <span className="font-mono-num text-4xl sm:text-5xl font-bold text-white tracking-tight">
                {metrics.upload.avg}
              </span>
              <span className="ml-1 text-xs sm:text-sm font-medium text-slate-400">
                {unit}
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Transferred: {formatBytes(metrics.upload.bytesTransferred)}
            </div>
          </div>

          {/* Latency / Ping */}
          <div className="p-6 flex flex-col justify-between group hover:bg-slate-800/20 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-medium">
              <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                PING
              </span>
              <span className="text-[10px] text-slate-500 font-mono-num">
                Min: {metrics.ping.min} ms
              </span>
            </div>
            <div className="my-2">
              <span className="font-mono-num text-4xl sm:text-5xl font-bold text-white tracking-tight">
                {metrics.ping.avg}
              </span>
              <span className="ml-1 text-xs sm:text-sm font-medium text-slate-400">
                ms
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Max: {metrics.ping.max} ms
            </div>
          </div>

          {/* Jitter */}
          <div className="p-6 flex flex-col justify-between group hover:bg-slate-800/20 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-medium">
              <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <Gauge className="w-3.5 h-3.5 text-blue-400" />
                JITTER
              </span>
              <span className="text-[10px] text-slate-500 font-mono-num">
                Samples: {metrics.ping.samples.length}
              </span>
            </div>
            <div className="my-2">
              <span className="font-mono-num text-4xl sm:text-5xl font-bold text-white tracking-tight">
                {metrics.ping.jitter}
              </span>
              <span className="ml-1 text-xs sm:text-sm font-medium text-slate-400">
                ms
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Stability: {metrics.ping.jitter <= 5 ? 'Rock Solid' : metrics.ping.jitter <= 15 ? 'Normal' : 'Variable'}
            </div>
          </div>
        </div>

        {/* Real-World Use-Case Suitability Badges */}
        <div className="p-6 border-t border-slate-800/80 bg-slate-950/20">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Connection Performance Capabilities</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Gaming */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                  <Gamepad2 className="w-4 h-4 text-indigo-400" />
                  <span>Online Gaming</span>
                </div>
                <span className={`text-[11px] font-bold ${
                  assessment.suitability.gaming.rating === 'Excellent' ? 'text-emerald-400' :
                  assessment.suitability.gaming.rating === 'Good' ? 'text-cyan-400' : 'text-amber-400'
                }`}>
                  {assessment.suitability.gaming.rating}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                {assessment.suitability.gaming.detail}
              </p>
            </div>

            {/* 4K Streaming */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                  <Tv className="w-4 h-4 text-cyan-400" />
                  <span>4K Streaming</span>
                </div>
                <span className={`text-[11px] font-bold ${
                  assessment.suitability.streaming4K.rating === 'Excellent' ? 'text-emerald-400' :
                  assessment.suitability.streaming4K.rating === 'Good' ? 'text-cyan-400' : 'text-amber-400'
                }`}>
                  {assessment.suitability.streaming4K.rating}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                {assessment.suitability.streaming4K.detail}
              </p>
            </div>

            {/* Video Calls */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                  <Video className="w-4 h-4 text-purple-400" />
                  <span>Video Calls</span>
                </div>
                <span className={`text-[11px] font-bold ${
                  assessment.suitability.videoCalls.rating === 'Excellent' ? 'text-emerald-400' :
                  assessment.suitability.videoCalls.rating === 'Good' ? 'text-cyan-400' : 'text-amber-400'
                }`}>
                  {assessment.suitability.videoCalls.rating}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                {assessment.suitability.videoCalls.detail}
              </p>
            </div>

            {/* Cloud Backup */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                  <CloudUpload className="w-4 h-4 text-emerald-400" />
                  <span>Cloud Backup</span>
                </div>
                <span className={`text-[11px] font-bold ${
                  assessment.suitability.cloudBackup.rating === 'Excellent' ? 'text-emerald-400' :
                  assessment.suitability.cloudBackup.rating === 'Good' ? 'text-cyan-400' : 'text-amber-400'
                }`}>
                  {assessment.suitability.cloudBackup.rating}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                {assessment.suitability.cloudBackup.detail}
              </p>
            </div>
          </div>
        </div>

        {/* Server & Client Metadata Bar */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span>Server: <strong className="text-slate-200">{server ? server.name : 'NetPulse Edge Server'}</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Location: <strong className="text-slate-200">{server ? server.location : 'Global Anycast Backbone'}</strong></span>
            </span>
            {client?.ip && (
              <span className="text-slate-500">
                IP: {client.ip}
              </span>
            )}
          </div>

          <div className="font-mono-num text-[11px] text-slate-500">
            Completed: {new Date(metrics.timestamp || Date.now()).toLocaleTimeString()}
          </div>
        </div>

        {/* Toggle Detailed Telemetry Accordion */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {showTechnicalDetails ? '▲ Hide Advanced Telemetry' : '▼ Show Advanced Telemetry & Diagnostics'}
          </button>

          <button
            id="test-again-result-button"
            onClick={onTestAgain}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>TEST AGAIN</span>
          </button>
        </div>

        {/* Technical Diagnostics Expansion */}
        {showTechnicalDetails && (
          <div className="p-6 border-t border-slate-800 bg-slate-950/80 text-xs space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-slate-500 block">Download Peak</span>
                <span className="font-mono-num text-sm font-semibold text-cyan-300">{metrics.download.peak} {unit}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Upload Peak</span>
                <span className="font-mono-num text-sm font-semibold text-emerald-300">{metrics.upload.peak} {unit}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Unloaded Latency</span>
                <span className="font-mono-num text-sm font-semibold text-purple-300">{metrics.ping.min} ms</span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Data Exchanged</span>
                <span className="font-mono-num text-sm font-semibold text-white">
                  {formatBytes(metrics.download.bytesTransferred + metrics.upload.bytesTransferred)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/80 pt-3">
              Note: Results represent real network throughput across concurrent TCP streams. Actual speeds may vary based on Wi-Fi frequency band (2.4GHz vs 5GHz/6GHz), router distance, background downloads, VPN encapsulation, and local ISP network congestion.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
