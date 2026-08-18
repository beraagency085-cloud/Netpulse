import React from 'react';
import { ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { PageRoute } from '../types';

interface TermsPageProps {
  onNavigate: (route: PageRoute) => void;
}

export const TermsPage: React.FC<TermsPageProps> = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold uppercase tracking-wider mb-3">
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>Legal Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
          Terms of Service
        </h1>
        <p className="text-xs text-slate-500 mt-2">
          Last Updated: August 2026 • Editable Agreement Template
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold font-heading text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing and using NetPulse Test, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-heading text-white">2. Permitted Use & Fair Access</h2>
          <p>
            NetPulse Test is provided for personal, diagnostic, and non-commercial network testing. You agree not to abuse, flood, reverse-engineer, or use automated scrapers/bots against our high-speed download or upload endpoints in a manner that degrades service for other users.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-heading text-white">3. Accuracy of Speed Measurements</h2>
          <p>
            While NetPulse Test employs high-precision multi-stream socket testing, speed test results are diagnostic estimates subject to local Wi-Fi interference, ISP routing conditions, hardware processing limitations, and third-party network congestion. Results are provided "as is" without warranty.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-heading text-white">4. Data Consumption Notice</h2>
          <p>
            Running internet speed tests transfers real network data (typically 20MB to 150MB depending on your line speed). If you are on a metered or limited cellular plan, enable "Mobile Data Saver" in the Settings menu to limit data usage.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-heading text-white">5. Limitation of Liability</h2>
          <p>
            In no event shall NetPulse Test or its operators be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use this service.
          </p>
        </section>
      </div>
    </div>
  );
};
