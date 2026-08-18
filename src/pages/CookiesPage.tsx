import React, { useState } from 'react';
import { Cookie, Shield, Check, Info } from 'lucide-react';
import { PageRoute } from '../types';

interface CookiesPageProps {
  onNavigate: (route: PageRoute) => void;
}

export const CookiesPage: React.FC<CookiesPageProps> = () => {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSavePreferences = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold uppercase tracking-wider mb-3">
          <Cookie className="w-3.5 h-3.5 text-cyan-400" />
          <span>Cookie Information</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
          Cookie Policy & Controls
        </h1>
        <p className="text-xs text-slate-500 mt-2">
          Transparent data storage disclosures • Updated August 2026
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold font-heading text-white">What Are Cookies?</h2>
          <p>
            Cookies and browser local storage are small text fragments stored on your device that help web applications preserve user preferences (like your dark/light theme setting or speed test history).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold font-heading text-white">How NetPulse Test Uses Local Storage</h2>
          
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block text-xs">Essential Functional Storage</span>
                <span className="text-[11px] text-slate-400">Stores test measurement unit preferences (Mbps vs MB/s), stream counts, and dark/light mode.</span>
              </div>
              <span className="text-[11px] font-bold text-cyan-400 px-2 py-0.5 bg-cyan-950/60 rounded border border-cyan-800/40">Always Active</span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <div>
                <span className="font-semibold text-slate-200 block text-xs">Diagnostic History Storage</span>
                <span className="text-[11px] text-slate-400">Keeps your past speed tests in client-side localStorage so you can compare network improvements.</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 px-2 py-0.5 bg-emerald-950/60 rounded border border-emerald-800/40">Client-Only</span>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-heading text-white">Third-Party Advertising Cookies</h2>
          <p>
            Google AdSense may use cookies to serve advertisements based on your prior visits to this or other websites. You can manage or disable personalized advertising cookies through the Google Ads Settings page or your browser settings.
          </p>
        </section>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {saved ? '✓ Preferences updated' : 'Manage storage settings directly in the Settings modal.'}
          </span>
          <button
            onClick={handleSavePreferences}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
          >
            {saved ? 'Saved!' : 'Confirm Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};
