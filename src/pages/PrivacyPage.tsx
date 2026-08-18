import React from 'react';
import { ShieldCheck, Lock, EyeOff, Server, Check } from 'lucide-react';
import { PageRoute } from '../types';

interface PrivacyPageProps {
  onNavigate: (route: PageRoute) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Privacy & Security</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-500 mt-2">
          Last Updated: August 2026 • Editable Policy Template
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 flex items-start gap-3">
          <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-bold text-emerald-300">Our Core Privacy Commitment</h2>
            <p className="text-xs text-emerald-200/80 mt-1">
              NetPulse Test does not require user registration, does not collect personal identity information (names, phone numbers, email addresses), and operates on a zero-tracking architecture.
            </p>
          </div>
        </div>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-heading text-white">1. Information Processed During a Speed Test</h2>
          <p>
            When you initiate a test, our server temporarily processes low-level network telemetry necessary to calculate your bandwidth:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li><strong>IP Address:</strong> Used strictly to route socket packets and detect approximate country/continent routing. We mask the final octet in user interfaces.</li>
            <li><strong>Byte Stream Counters:</strong> Real-time volume of uncompressed data transferred to gauge download and upload Mbps.</li>
            <li><strong>Timestamps:</strong> Used to compute round-trip latency (Ping) and jitter variance in milliseconds.</li>
            <li><strong>User Agent:</strong> Browser and OS information used purely to optimize multi-stream chunk sizes.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-heading text-white">2. Local Storage Persistence</h2>
          <p>
            Your speed test history is stored locally in your browser's private <code className="text-cyan-400 font-mono">localStorage</code>. This data never leaves your device and is not synchronized to an external server unless you explicitly download or share the summary.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-heading text-white">3. Third-Party Advertisements (Google AdSense)</h2>
          <p>
            We may display third-party advertisements served by Google AdSense to fund bandwidth costs. Google AdSense may use cookies to serve personalized ads based on prior visits. Users may opt out of personalized advertising by visiting Google's Ad Settings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-heading text-white">4. Data Deletion & Inquiries</h2>
          <p>
            You can clear your local test history at any time using the "Clear History" button in the History Drawer. For any inquiries, please use our Contact page.
          </p>
        </section>
      </div>
    </div>
  );
};
