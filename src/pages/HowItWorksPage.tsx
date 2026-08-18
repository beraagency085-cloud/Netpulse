import React from 'react';
import { Activity, ArrowDown, ArrowUp, Gauge, Server, Wifi, Cpu, HelpCircle } from 'lucide-react';
import { PageRoute } from '../types';

interface HowItWorksPageProps {
  onNavigate: (route: PageRoute) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onNavigate }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Technical Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
          How NetPulse Measures Your Speed
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
          Understanding the 4-phase testing methodology behind our low-overhead diagnostic engine.
        </p>
      </div>

      {/* Step by Step Breakdown */}
      <div className="space-y-6 my-8">
        {/* Phase 1: Latency */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold font-heading text-white">Phase 1: Ping & Jitter Testing</h2>
              <span className="text-xs font-mono-num text-purple-400 bg-purple-950/50 px-2.5 py-0.5 rounded-full border border-purple-800/40">10-15 Iterations</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We send rapid micro-requests to the edge node to calculate the exact round-trip time (RTT). We compute minimum, average, and peak ping in milliseconds. Jitter is calculated as the mean absolute deviation between consecutive packets.
            </p>
            <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/60 text-xs text-slate-400">
              <strong className="text-slate-200">Why it matters:</strong> Low ping (&lt;30ms) is essential for online multiplayer games, video meetings (Zoom, Meet), and remote desktop sessions.
            </div>
          </div>
        </div>

        {/* Phase 2: Download */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <ArrowDown className="w-6 h-6" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold font-heading text-white">Phase 2: Multi-Stream Download Throughput</h2>
              <span className="text-xs font-mono-num text-cyan-400 bg-cyan-950/50 px-2.5 py-0.5 rounded-full border border-cyan-800/40">Multi-Thread Socket</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Your browser initiates 4 concurrent HTTP streams requesting chunked binary data. By opening multiple simultaneous TCP connections, we eliminate single-thread bottlenecks and quickly fill the bandwidth pipe without triggering artificial ISP compression artifacts.
            </p>
            <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/60 text-xs text-slate-400">
              <strong className="text-slate-200">Why it matters:</strong> Download speed determines how quickly you can stream 4K movies, download game updates, or load heavy web applications.
            </div>
          </div>
        </div>

        {/* Phase 3: Upload */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <ArrowUp className="w-6 h-6" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold font-heading text-white">Phase 3: Real Upload Stream Testing</h2>
              <span className="text-xs font-mono-num text-emerald-400 bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-800/40">Chunked POST</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Your client generates cryptographically pseudorandom byte buffers in memory and streams them to our speed server endpoint using <code className="text-emerald-300 font-mono">XMLHttpRequest.upload.onprogress</code>. This captures the exact byte velocity over time.
            </p>
            <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/60 text-xs text-slate-400">
              <strong className="text-slate-200">Why it matters:</strong> Upload speed is vital for cloud photo/video backups (Google Photos, iCloud), Zoom screen sharing, and streaming to Twitch/YouTube.
            </div>
          </div>
        </div>

        {/* Phase 4: Scoring */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Gauge className="w-6 h-6" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold font-heading text-white">Phase 4: Connection Quality Rating</h2>
              <span className="text-xs font-mono-num text-indigo-400 bg-indigo-950/50 px-2.5 py-0.5 rounded-full border border-indigo-800/40">A+ to D Grade</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Raw megabits per second tell only half the story. Our scoring engine weighs jitter stability, latency variance, and symmetric balance to calculate an overall grade and provide tailored suitability indicators for Gaming, 4K Streaming, and Cloud Work.
            </p>
          </div>
        </div>
      </div>

      {/* Why Speeds Vary FAQ */}
      <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4 my-8">
        <h3 className="text-lg font-bold font-heading text-white">
          Why Does My Speed Vary From What My ISP Advertises?
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Internet Service Providers (ISPs) typically advertise maximum theoretical speeds over a direct wired Ethernet link under ideal conditions. Real-world speeds can be affected by:
        </p>
        <ul className="space-y-2 text-xs text-slate-400 list-disc pl-5">
          <li><strong>Wi-Fi Obstacles:</strong> Walls, distance, and 2.4 GHz interference can cut Wi-Fi speeds in half. Use 5GHz or 6GHz Wi-Fi 6/7.</li>
          <li><strong>Active VPNs:</strong> Encrypting traffic through a VPN server adds latency and encryption CPU overhead.</li>
          <li><strong>Background Traffic:</strong> Smart TVs, game updates, security cameras, or cloud backups running on your local network.</li>
          <li><strong>ISP Peak Hour Contention:</strong> Local fiber/cable nodes sharing neighborhood capacity during evening peak hours.</li>
        </ul>
      </div>
    </div>
  );
};
