import React from 'react';
import { Zap, ShieldCheck, Server, Globe, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';
import { PageRoute } from '../types';

interface AboutPageProps {
  onNavigate: (route: PageRoute) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Zap className="w-3.5 h-3.5" />
          <span>About NetPulse Test</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
          Built for Precision Network Diagnostics
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
          NetPulse Test is an independent, real-time internet performance benchmarking engine engineered to deliver accurate, non-synthetic speed measurements.
        </p>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
            01
          </div>
          <h3 className="text-base font-bold font-heading text-slate-100">Real Throughput</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            No synthetic multipliers or fake random numbers. NetPulse streams real byte arrays across parallel HTTP sockets to saturate your network pipe.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
            02
          </div>
          <h3 className="text-base font-bold font-heading text-slate-100">Multi-Device Ready</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Optimized for Android smartphones, iPhones, iPadOS tablets, Windows laptops, macOS workstations, Linux, and smart displays without installing any native apps.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            03
          </div>
          <h3 className="text-base font-bold font-heading text-slate-100">Privacy By Default</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            We do not sell telemetry, log personally identifiable browsing information, or track user locations beyond coarse continent routing.
          </p>
        </div>
      </div>

      {/* Technical Highlights */}
      <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-6 my-8">
        <h2 className="text-xl font-bold font-heading text-white">
          Why We Built NetPulse
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Modern broadband networks with 5G, Wi-Fi 6E/7, and Gigabit Fiber require sophisticated multi-connection TCP probing to bypass bufferbloat artifacts and single-thread throttling. Many legacy speed tests rely on compressed assets or single-thread HTTP requests that fail to reflect actual application throughput.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {[
            'Real-time Jitter standard deviation sampling',
            'Uncompressed pseudo-random binary test vectors',
            'Configurable multi-stream parallel threads (1-8)',
            'Detailed 4K, Gaming & Cloud Backup suitability scoring',
            'Instant CSV export for historical logging',
            'Zero bloated tracking scripts or invasive SDKs',
          ].map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-center">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-linear-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-lg shadow-cyan-600/25 transition-all hover:scale-105"
          >
            <span>Run a Free Speed Test Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
