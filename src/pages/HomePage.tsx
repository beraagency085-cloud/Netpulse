import React from 'react';
import { 
  Wifi, 
  Smartphone, 
  Laptop, 
  Monitor, 
  Tablet, 
  Server, 
  ShieldCheck, 
  Zap, 
  Activity, 
  RotateCcw,
  Sparkles,
  HelpCircle,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { SpeedGauge } from '../components/SpeedGauge';
import { LiveTelemetryChart, MiniSparkline } from '../components/LiveTelemetryChart';
import { ResultCard } from '../components/ResultCard';
import { AdSlot } from '../components/AdSlot';
import { SpeedTestProgressBar } from '../components/SpeedTestProgressBar';
import { SpeedMetrics, QualityAssessment, ServerNode, ClientInfo, TestSettings } from '../types';

interface HomePageProps {
  metrics: SpeedMetrics;
  assessment: QualityAssessment;
  server: ServerNode | null;
  client: ClientInfo | null;
  settings: TestSettings;
  onStartTest: () => void;
  onStopTest: () => void;
  onOpenShareModal: () => void;
  onOpenSettings: () => void;
  onAskAI?: (prompt?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  metrics,
  assessment,
  server,
  client,
  settings,
  onStartTest,
  onStopTest,
  onOpenShareModal,
  onOpenSettings,
  onAskAI,
}) => {
  const isCompleted = metrics.phase === 'completed';
  const isTesting = metrics.phase !== 'idle' && metrics.phase !== 'completed' && metrics.phase !== 'error';

  // Dynamic color palette based on active phase
  const getPhaseGradient = () => {
    switch (metrics.phase) {
      case 'latency':
        return 'from-purple-500 via-indigo-500 to-cyan-400';
      case 'download':
        return 'from-cyan-500 via-teal-400 to-blue-500';
      case 'upload':
        return 'from-blue-500 via-indigo-500 to-purple-400';
      case 'finishing':
      case 'completed':
        return 'from-emerald-400 via-cyan-400 to-blue-500';
      default:
        return 'from-cyan-500 to-blue-500';
    }
  };

  return (
    <div className="w-full flex flex-col items-center px-4 sm:px-6 lg:px-8 py-6 relative">
      {/* 0. SUBTLE GLOBAL TOP PROGRESS BAR (Fixed at the very top of viewport during test phases) */}
      {(isTesting || (isCompleted && metrics.progress === 100)) && (
        <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-slate-950/40 pointer-events-none">
          <div 
            className={`h-full bg-gradient-to-r ${getPhaseGradient()} transition-all duration-300 ease-out shadow-[0_0_12px_rgba(34,211,238,0.8)] relative`}
            style={{ width: `${Math.min(Math.max(metrics.progress, 0), 100)}%` }}
          >
            {/* Shimmer light effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
            {/* Trailing glow beacon */}
            {isTesting && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_8px_#ffffff]" />
            )}
          </div>
        </div>
      )}

      {/* 1. TOP ADVERTISEMENT AREA */}
      <div className="w-full max-w-7xl mb-4">
        <AdSlot position="top" />
      </div>

      {/* 2. DYNAMIC SPEED TEST PHASE PROGRESS BAR (Ping, Download, Upload) */}
      <SpeedTestProgressBar metrics={metrics} unit={settings.unit} />

      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6 items-stretch">
        {/* Main Speed Testing Core Section (Left Column) */}
        <main className="w-full lg:w-2/3 flex flex-col gap-6">
          <section className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-between relative overflow-hidden flex-grow min-h-[500px]">
            {/* Top Bar inside testing card */}
            <div className="w-full flex items-center justify-between pb-4 border-b border-slate-800/80 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-semibold uppercase tracking-wider text-slate-300 text-[11px]">
                  NetPulse High-Speed Diagnostic
                </span>
              </div>
              <button
                onClick={onOpenSettings}
                className="text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer transition-colors text-xs"
              >
                {settings.parallelStreams} Streams • {settings.unit}
              </button>
            </div>

            {/* Gauge Area */}
            <div className="relative my-4 flex flex-col items-center w-full">
              <SpeedGauge
                metrics={metrics}
                phase={metrics.phase}
                onStart={onStartTest}
                onStop={onStopTest}
                unit={settings.unit}
              />
            </div>

            {/* Real-time Bandwidth Telemetry Waveform during active test */}
            {isTesting && (
              <div className="w-full max-w-xl my-2">
                <LiveTelemetryChart metrics={metrics} unit={settings.unit} />
              </div>
            )}

            {/* 4 Core Metrics Row in Bottom of Card */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
              <div className={`bg-slate-800/40 p-3 sm:p-4 rounded-2xl border border-slate-700/50 flex flex-col justify-between text-center transition-all ${metrics.phase === 'download' ? 'border-cyan-500/60 ring-1 ring-cyan-500/30' : ''}`}>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Download</span>
                  <span className="text-xl sm:text-2xl font-bold text-white font-mono-num">
                    {metrics.download.avg > 0 ? metrics.download.avg.toFixed(1) : metrics.download.current > 0 ? metrics.download.current.toFixed(1) : '0.0'}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">{settings.unit}</span>
                </div>
                <div className="mt-2 pt-1 border-t border-slate-700/30">
                  <MiniSparkline
                    data={metrics.download.telemetry}
                    color="#22d3ee"
                    gradientId="homeMiniDownSpark"
                    height={28}
                  />
                </div>
              </div>

              <div className={`bg-slate-800/40 p-3 sm:p-4 rounded-2xl border border-slate-700/50 flex flex-col justify-between text-center transition-all ${metrics.phase === 'upload' ? 'border-blue-500/60 ring-1 ring-blue-500/30' : ''}`}>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Upload</span>
                  <span className="text-xl sm:text-2xl font-bold text-white font-mono-num">
                    {metrics.upload.avg > 0 ? metrics.upload.avg.toFixed(1) : metrics.upload.current > 0 ? metrics.upload.current.toFixed(1) : '0.0'}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">{settings.unit}</span>
                </div>
                <div className="mt-2 pt-1 border-t border-slate-700/30">
                  <MiniSparkline
                    data={metrics.upload.telemetry}
                    color="#3b82f6"
                    gradientId="homeMiniUpSpark"
                    height={28}
                  />
                </div>
              </div>

              <div className={`bg-slate-800/40 p-3 sm:p-4 rounded-2xl border border-slate-700/50 flex flex-col justify-between text-center transition-all ${metrics.phase === 'latency' ? 'border-purple-500/60 ring-1 ring-purple-500/30' : ''}`}>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Ping</span>
                  <span className="text-xl sm:text-2xl font-bold text-white font-mono-num">
                    {metrics.ping.avg > 0 ? metrics.ping.avg : metrics.ping.current > 0 ? metrics.ping.current : '0'}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">ms</span>
                </div>
                <div className="mt-2 pt-1 border-t border-slate-700/30">
                  <MiniSparkline
                    data={metrics.ping.samples}
                    color="#c084fc"
                    gradientId="homeMiniPingSpark"
                    height={28}
                  />
                </div>
              </div>

              <div className="bg-slate-800/40 p-3 sm:p-4 rounded-2xl border border-slate-700/50 flex flex-col justify-between text-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Jitter</span>
                  <span className="text-xl sm:text-2xl font-bold text-white font-mono-num">
                    {metrics.ping.jitter > 0 ? metrics.ping.jitter : '0'}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">ms</span>
                </div>
                <div className="mt-2 pt-1 border-t border-slate-700/30">
                  <MiniSparkline
                    data={metrics.ping.samples.map((s, idx, arr) => idx === 0 ? 0 : Math.abs(s - arr[idx - 1]))}
                    color="#60a5fa"
                    gradientId="homeMiniJitterSpark"
                    height={28}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Inline Content Advertisement */}
          <div className="w-full">
            <AdSlot position="content" />
          </div>

          {/* Full Result Card if Completed */}
          {isCompleted && (
            <div className="w-full">
              <ResultCard
                metrics={metrics}
                assessment={assessment}
                server={server}
                client={client}
                unit={settings.unit}
                onTestAgain={onStartTest}
                onOpenShareModal={onOpenShareModal}
                onAskAI={onAskAI}
              />
            </div>
          )}
        </main>

        {/* Aside Column: Connection Details & Sticky Sidebar Ad */}
        <aside className="w-full lg:w-1/3 flex flex-col gap-6">
          {/* AI Specialist Quick Banner */}
          {onAskAI && (
            <div className="bg-gradient-to-br from-cyan-950/60 via-slate-900/60 to-blue-950/60 border border-cyan-500/30 rounded-3xl p-5 shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Live AI Support
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </h4>
                  <p className="text-[11px] text-cyan-300">Ask questions & diagnose your speeds</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Have questions about high ping, Wi-Fi channel optimization, or buffering? Chat with our live AI Network Specialist.
              </p>
              <button
                onClick={() => onAskAI()}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>OPEN AI SUPPORT CHAT</span>
              </button>
            </div>
          )}

          {/* Connection Details Card */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between flex-grow">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <span>Connection Details</span>
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <span className="text-xs text-slate-500">Provider</span>
                  <span className="text-sm font-medium text-slate-200">
                    {client?.org || 'Broadband ISP'}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <span className="text-xs text-slate-500">Server</span>
                  <span className="text-sm font-medium text-slate-200 truncate max-w-[170px]">
                    {server?.name.split('(')[0] || 'NetPulse Edge Server'}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <span className="text-xs text-slate-500">Quality</span>
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] rounded font-bold uppercase">
                    {isCompleted ? `${assessment.grade} • ${assessment.label}` : 'READY'}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <span className="text-xs text-slate-500">Client IP</span>
                  <span className="text-sm font-medium text-slate-200 font-mono-num">
                    {client?.ip || '68.231.14.*'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Streams</span>
                  <span className="text-sm font-medium text-slate-200">
                    {settings.parallelStreams} Parallel HTTP/2
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={onOpenShareModal}
                className="w-full py-3 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="h-4 w-4 text-cyan-400" />
                <span>SHARE RESULTS</span>
              </button>

              <button
                onClick={onOpenSettings}
                className="w-full py-3 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Server className="h-4 w-4 text-blue-400" />
                <span>CHANGE SERVER & SETTINGS</span>
              </button>
            </div>
          </div>

          {/* Sticky Sidebar Advertisement Area */}
          <div className="w-full">
            <AdSlot position="sidebar" className="!w-full !min-h-[250px] lg:!min-h-[300px]" />
          </div>
        </aside>
      </div>

      {/* Cross-Platform Testing & Educational Cards */}
      <div className="w-full max-w-7xl mt-8">
        <div className="p-6 rounded-3xl bg-slate-900/30 border border-slate-800">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 text-center">
            Universal Cross-Platform Testing
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
            {[
              { icon: Smartphone, label: 'Android' },
              { icon: Smartphone, label: 'iPhone' },
              { icon: Tablet, label: 'Tablets' },
              { icon: Laptop, label: 'Windows' },
              { icon: Laptop, label: 'Mac' },
              { icon: Monitor, label: 'Desktop' },
            ].map((dev, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800/60 flex flex-col items-center justify-center">
                <dev.icon className="w-5 h-5 text-cyan-400 mb-1.5" />
                <span className="text-xs font-medium text-slate-300">{dev.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    {/* SEO Content Section */}
      <article className="w-full max-w-7xl mt-8">
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/30 border border-slate-800">

          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Free Internet Speed Test Online — Check WiFi & Mobile Data Speed | NetPulse
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            NetPulse is a free online internet speed test tool that instantly measures your
            download speed, upload speed, ping, and jitter with high accuracy. Whether you're
            on WiFi, broadband, fiber, or mobile data (4G/5G), NetPulse gives you a reliable
            connection quality report in seconds — no app download, no sign-up, completely free.
          </p>

          <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
            Why NetPulse Is the Best Speed Test Tool
          </h2>
          <ul className="text-sm text-slate-400 leading-relaxed mb-6 list-disc list-inside space-y-1">
            <li>100% free internet speed test — no registration required</li>
            <li>Real-time, server-based accurate measurement</li>
            <li>Works on mobile, tablet, laptop, and desktop</li>
            <li>Tests download speed, upload speed, ping, and jitter simultaneously</li>
            <li>Compatible with WiFi, broadband, fiber, and mobile networks (4G/5G)</li>
            <li>Detailed connection quality grading and history tracking</li>
          </ul>

          <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
            How Does an Internet Speed Test Work?
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            A speed test measures three core metrics. Download speed shows how fast data
            transfers from the server to your device — critical for streaming and browsing.
            Upload speed shows how fast data transfers from your device to the server —
            important for video calls and file sharing. Ping (latency) measures the round-trip
            time for a signal to reach the server and return, which directly affects gaming and
            real-time communication performance.
          </p>

          <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
            What Is a Good Internet Speed?
          </h2>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm text-slate-400 border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-left">
                  <th className="py-2 pr-4 text-slate-300">Use Case</th>
                  <th className="py-2 pr-4 text-slate-300">Recommended Speed</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-800">
                  <td className="py-2 pr-4">Browsing & Social Media</td>
                  <td className="py-2 pr-4">5–10 Mbps</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2 pr-4">HD Video Streaming</td>
                  <td className="py-2 pr-4">15–25 Mbps</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2 pr-4">Online Gaming</td>
                  <td className="py-2 pr-4">25+ Mbps, ping under 50ms</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Video Calls / Remote Work</td>
                  <td className="py-2 pr-4">10–30 Mbps</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">
                Is the NetPulse speed test result accurate?
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Yes. NetPulse uses real-time, server-based measurement, though results may vary
                slightly depending on network congestion, device, and time of day.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">
                Does NetPulse work on mobile data (4G/5G)?
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Yes, NetPulse works seamlessly on both WiFi and mobile data connections,
                including 4G and 5G networks.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">
                Is NetPulse completely free to use?
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Yes, NetPulse is 100% free with no sign-up, subscription, or app download
                required.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">
                How often should I run a speed test?
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                You can test as often as you like — there's no limit. Many users test before
                and after troubleshooting their router or contacting their ISP.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">
                Why is my ping high even with fast download speed?
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                High ping usually comes from network congestion, distance to the server, or
                WiFi interference — even if your download speed looks good, high ping can still
                affect gaming and video calls.
              </p>
            </div>
          </div>
        </section>
      </article>
  </div>
  );
};
