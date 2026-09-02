import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  Search, 
  ArrowRight, 
  Wifi, 
  Activity, 
  ShieldCheck, 
  Layers, 
  Zap, 
  BookOpen 
} from 'lucide-react';
import { PageRoute } from '../types';

interface FaqPageProps {
  onNavigate: (route: PageRoute) => void;
}

interface FaqItem {
  id: string;
  category: 'General' | 'Metrics' | 'Troubleshooting' | 'Mobile & Wi-Fi';
  question: string;
  answer: string;
}

export const FaqPage: React.FC<FaqPageProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({ 'g-1': true, 'm-1': true });

  const toggleFaq = (id: string) => {
    setOpenIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const faqs: FaqItem[] = [
    {
      id: 'g-1',
      category: 'General',
      question: 'How accurate is the NetPulse Internet Speed Test?',
      answer: 'NetPulse uses real-time, multi-threaded binary streaming to saturation-probe your connection without relying on synthetic math multipliers. We measure actual TCP throughput and calculate round-trip ICMP/HTTP ping with microsecond timing. Results reflect your live connection state, though minor variations can occur due to background apps, Wi-Fi channel hops, and network load.'
    },
    {
      id: 'g-2',
      category: 'General',
      question: 'Is NetPulse 100% free to use, and does it require account registration?',
      answer: 'Yes, NetPulse is completely free with zero subscription paywalls, forced software downloads, or invasive account requirements. You can run unlimited speed tests across all your desktop and mobile devices.'
    },
    {
      id: 'g-3',
      category: 'General',
      question: 'Does NetPulse store or sell my personal browsing history?',
      answer: 'No. NetPulse is strictly a network performance benchmark. We do not inspect packet contents, monitor DNS queries, or log personal browsing history. Non-identifying technical telemetry (such as IP address for server routing and throughput numbers) is processed exclusively to calculate your performance metrics and is retained locally in your browser.'
    },
    {
      id: 'm-1',
      category: 'Metrics',
      question: 'What is the difference between Download Speed and Upload Speed?',
      answer: 'Download speed measures how rapidly data travels from web servers to your device (crucial for streaming 4K video, browsing websites, and downloading updates). Upload speed measures how rapidly your device pushes data out to the internet (critical for Zoom/Teams video calls, uploading large files to Google Drive, and livestreaming).'
    },
    {
      id: 'm-2',
      category: 'Metrics',
      question: 'What is Jitter and why is it crucial for online gaming and VoIP?',
      answer: 'Jitter is the variance in latency over time. If your ping averages 25 ms but fluctuates between 10 ms and 90 ms on consecutive packets, your jitter is high. High jitter causes audio stuttering on Discord and Zoom, dropped frames, and character warping in multiplayer games.'
    },
    {
      id: 'm-3',
      category: 'Metrics',
      question: 'Why does my speed test report Mbps instead of MB/s?',
      answer: 'Broadband providers and speed tests measure speeds in Megabits per second (Mbps), while operating systems and file download managers display Megabytes per second (MB/s). Because 1 Byte equals 8 bits, divide your Mbps speed by 8 to determine your real-world download rate in MB/s (e.g., 100 Mbps = ~12.5 MB/s).'
    },
    {
      id: 't-1',
      category: 'Troubleshooting',
      question: 'Why am I not receiving the speed promised by my Internet Service Provider?',
      answer: 'ISPs advertise maximum theoretical speeds "up to" a plan cap under pristine lab conditions. In reality, speed is lowered by TCP/IP network protocol framing (~5-10% overhead), Wi-Fi radio attenuation through walls, neighbor interference, outdated router processors, and peak evening neighborhood congestion.'
    },
    {
      id: 't-2',
      category: 'Troubleshooting',
      question: 'What is Bufferbloat and how can I fix it on my home router?',
      answer: 'Bufferbloat occurs when a router excessively buffers network packets during high-bandwidth downloads, causing interactive traffic (gaming, voice calls) to sit in queue. This makes ping spike from 20 ms to 300 ms. You can resolve this by enabling Smart Queue Management (SQM, such as FQ_CoDel or Cake) in your router settings.'
    },
    {
      id: 't-3',
      category: 'Troubleshooting',
      question: 'How does a VPN affect speed test results?',
      answer: 'A VPN routes your traffic through an encrypted tunnel to a remote server. The cryptographic processing overhead and extra routing distance typically reduce download and upload rates by 10% to 30% and increase ping. Disconnect your VPN temporarily to measure your unthrottled baseline connection.'
    },
    {
      id: 'w-1',
      category: 'Mobile & Wi-Fi',
      question: 'Why is Wi-Fi significantly slower than a direct Ethernet cable?',
      answer: 'Radio frequencies are prone to physical interference from concrete walls, metal appliances, and overlapping signals from neighbors. A direct Cat6/Cat7 Ethernet cable bypasses radio interference completely, eliminating packet loss and dropping latency to the minimum physical threshold.'
    },
    {
      id: 'w-2',
      category: 'Mobile & Wi-Fi',
      question: 'Does running a speed test consume mobile data on 4G or 5G?',
      answer: 'Yes. To accurately test multi-gigabit and 5G throughput, the engine streams uncompressed binary buffers. A typical full test transfers between 40 MB and 120 MB of data. On metered cellular plans, enable NetPulse\'s Data Saver Mode in settings to reduce data transfer by up to 70%.'
    }
  ];

  const categories = ['All', 'General', 'Metrics', 'Troubleshooting', 'Mobile & Wi-Fi'];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesQuery = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Knowledge Base</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
          Frequently Asked Questions
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
          Comprehensive, clear explanations regarding speed measurements, latency, broadband troubleshooting, and network optimization.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-xl mx-auto mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search questions (e.g. ping, Mbps, WiFi, bufferbloat)..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:border-cyan-500 focus:outline-none placeholder:text-slate-500 shadow-lg"
        />
      </div>

      {/* Category Pills */}
      <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => {
            const isOpen = !!openIds[faq.id];
            return (
              <div
                key={faq.id}
                className="rounded-2xl bg-slate-900/50 border border-slate-800/80 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-900/80 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-semibold text-white">
                    {faq.question}
                  </span>
                  <div className={`w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-cyan-400' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-slate-800/60 text-xs sm:text-sm text-slate-300 leading-relaxed animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 p-6 rounded-2xl bg-slate-900/30 border border-slate-800 text-slate-400 text-sm">
            No questions found matching "{searchQuery}". Try searching for terms like "ping", "WiFi", or "Mbps".
          </div>
        )}
      </div>

      {/* Footer Navigation CTA */}
      <div className="mt-12 p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h4 className="text-sm font-bold text-white">Still have questions or found a discrepancy?</h4>
          <p className="text-xs text-slate-400 mt-0.5">Send a message to our engineering team or explore our in-depth guides.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('contact')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Contact Team
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
          >
            Run Speed Test
          </button>
        </div>
      </div>
    </div>
  );
};
