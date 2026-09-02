import React, { useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  ArrowRight, 
  ArrowLeft, 
  Share2, 
  Check, 
  Wifi, 
  Activity, 
  Gauge, 
  HelpCircle, 
  ShieldCheck, 
  Zap,
  Sparkles
} from 'lucide-react';
import { PageRoute } from '../types';

interface BlogPageProps {
  onNavigate: (route: PageRoute) => void;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  readTime: string;
  date: string;
  category: 'Bandwidth' | 'Wi-Fi & Hardware' | 'Gaming & Latency' | 'Mobile Networks';
  content: React.ReactNode;
}

export const BlogPage: React.FC<BlogPageProps> = ({ onNavigate }) => {
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const articles: Article[] = [
    {
      id: 'mbps-vs-mbs',
      title: 'Mbps vs MB/s: Understanding the 8x Difference in Internet Speeds',
      slug: 'mbps-vs-mbs-difference',
      category: 'Bandwidth',
      date: 'Aug 28, 2026',
      readTime: '5 min read',
      excerpt: 'Ever wonder why your 100 Mbps broadband connection only downloads files at 12.5 MB/s? Here is the math behind bits, bytes, and ISP marketing.',
      content: (
        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <p>
            One of the most frequent sources of confusion for broadband consumers is the difference between <strong>Mbps</strong> (Megabits per second) and <strong>MB/s</strong> (Megabytes per second). When you subscribe to a 100 Mbps internet package, you might expect a 100-megabyte file to download in exactly one second. Instead, you observe your web browser or Steam client clocking around 12 to 12.5 MB/s.
          </p>

          <h3 className="text-lg font-bold text-white mt-6 mb-2">The Basic Math: 1 Byte = 8 Bits</h3>
          <p>
            In digital computing and networking telecommunications, data is measured in two distinct units:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li><strong>Bit (lowercase 'b'):</strong> The smallest binary unit of digital data (a single 0 or 1). Network transmission protocols (broadband lines, cellular modems, Wi-Fi adapters) measure data flow velocity in <em>Megabits per second (Mbps)</em>.</li>
            <li><strong>Byte (uppercase 'B'):</strong> A cluster of 8 bits. Storage devices (hard drives, SSDs, RAM) and operating systems measure data capacity and file sizes in <em>Megabytes (MB)</em> or <em>Gigabytes (GB)</em>.</li>
          </ul>

          <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 my-6">
            <h4 className="text-cyan-300 font-bold mb-1">The Golden Conversion Formula:</h4>
            <p className="font-mono text-white text-base">
              Download Speed in MB/s = Speed in Mbps ÷ 8
            </p>
            <p className="text-xs text-slate-400 mt-2">
              For example: 200 Mbps connection ÷ 8 = 25 MB/s maximum theoretical download rate.
            </p>
          </div>

          <h3 className="text-lg font-bold text-white mt-6 mb-2">Why Do ISPs Advertise in Mbps Instead of MB/s?</h3>
          <p>
            There are two primary reasons. First, from an engineering standpoint, serial communication interfaces transmit data as a sequential stream of single bits across copper wire, radio frequencies, or fiber optic pulses. Second, from a marketing perspective, higher numbers look more impressive to consumers: 100 Mbps sounds significantly faster to an everyday buyer than 12.5 MB/s.
          </p>

          <h3 className="text-lg font-bold text-white mt-6 mb-3">Download Time Comparison Table</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">ISP Plan (Mbps)</th>
                  <th className="py-3 px-4">Actual Rate (MB/s)</th>
                  <th className="py-3 px-4">1 GB File Time</th>
                  <th className="py-3 px-4">10 GB Game Time</th>
                  <th className="py-3 px-4">50 GB 4K Movie Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono-num">
                <tr>
                  <td className="py-3 px-4 text-cyan-400 font-bold">25 Mbps</td>
                  <td className="py-3 px-4">~3.1 MB/s</td>
                  <td className="py-3 px-4">5 min 20 sec</td>
                  <td className="py-3 px-4">53 minutes</td>
                  <td className="py-3 px-4">4 hrs 28 min</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-cyan-400 font-bold">50 Mbps</td>
                  <td className="py-3 px-4">~6.25 MB/s</td>
                  <td className="py-3 px-4">2 min 40 sec</td>
                  <td className="py-3 px-4">26 minutes</td>
                  <td className="py-3 px-4">2 hrs 14 min</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-cyan-400 font-bold">100 Mbps</td>
                  <td className="py-3 px-4">~12.5 MB/s</td>
                  <td className="py-3 px-4">1 min 20 sec</td>
                  <td className="py-3 px-4">13 minutes</td>
                  <td className="py-3 px-4">1 hr 7 min</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-cyan-400 font-bold">500 Mbps</td>
                  <td className="py-3 px-4">~62.5 MB/s</td>
                  <td className="py-3 px-4">16 seconds</td>
                  <td className="py-3 px-4">2 min 40 sec</td>
                  <td className="py-3 px-4">13 min 20 sec</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-cyan-400 font-bold">1,000 Mbps (1 Gbps)</td>
                  <td className="py-3 px-4">~125 MB/s</td>
                  <td className="py-3 px-4">8 seconds</td>
                  <td className="py-3 px-4">1 min 20 sec</td>
                  <td className="py-3 px-4">6 min 40 sec</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-bold text-white mt-6 mb-2">Protocol Overhead Factor</h3>
          <p>
            Keep in mind that around 5% to 10% of total bandwidth is consumed by transmission overhead (TCP headers, IP routing packets, encryption handshakes). Therefore, if you have a 100 Mbps connection, achieving 11.5 to 12.0 MB/s of sustained file download speed is considered optimal real-world efficiency.
          </p>
        </div>
      )
    },
    {
      id: 'wifi-speed-slow-fixes',
      title: 'Why Is My Wi-Fi Speed Slower Than What I Pay For? 7 Proven Solutions',
      slug: 'why-is-wifi-speed-slow',
      category: 'Wi-Fi & Hardware',
      date: 'Aug 29, 2026',
      readTime: '6 min read',
      excerpt: 'Experiencing severe speed drops over wireless? Learn how physical barriers, 2.4GHz interference, and channel overlap degrade your home connection.',
      content: (
        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <p>
            You subscribe to a high-speed 300 Mbps broadband connection, but when you run a speed test on your phone or laptop in the bedroom, the speedometer barely reaches 45 Mbps. This disparity is among the most common home networking complaints worldwide.
          </p>

          <h3 className="text-lg font-bold text-white mt-6 mb-2">The Culprits: What Slows Down Your Wireless Network?</h3>
          <p>
            Unlike insulated copper or fiber optic glass, Wi-Fi radio frequencies (RF) travel through open air. The signal weakens with distance and encounters numerous interference sources.
          </p>

          <div className="space-y-4 my-6">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <h4 className="font-bold text-white flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                1. Split Your Wi-Fi Bands: 2.4 GHz vs 5 GHz vs 6 GHz
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Many default ISP routers combine both frequencies into a single network name (SSID). Devices frequently lock onto the 2.4 GHz band because of its longer range, even though its maximum real-world throughput rarely exceeds 40–60 Mbps due to narrow channel widths. Separate the SSIDs in your router admin panel and connect your daily devices strictly to <strong>5 GHz</strong> or <strong>6 GHz (Wi-Fi 6E/7)</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <h4 className="font-bold text-white flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                2. Eliminate Physical and Reflective Obstructions
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dense building materials such as concrete, brick, plaster, and marble absorb Wi-Fi radio waves aggressively. Large mirrors and metal appliances reflect radio waves, creating destructive multi-path interference. Elevate your router on a shelf or desk in an open central room rather than concealing it inside a closed TV cabinet or behind a couch.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <h4 className="font-bold text-white flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                3. Neighbor Channel Congestion in Apartment Buildings
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                In urban apartments, dozens of neighboring routers compete for the same radio spectrum. Download a free Wi-Fi Analyzer tool on your phone to inspect channel utilization. For 5 GHz, look for unoccupied DFS channels (like 52, 100, or 132) to avoid neighboring airtime contention.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <h4 className="font-bold text-white flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                4. Outdated Wireless Adapters on Older Laptops
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your router might support Wi-Fi 6 (802.11ax), but if your laptop was manufactured in 2017 with an older single-stream 802.11n Wi-Fi card, it cannot physically negotiate modern gigabit transfer rates. A $15 USB 3.0 Wi-Fi 6 dongle can instantly restore full speed.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <h4 className="font-bold text-white flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                5. Periodic Gateway Rebooting
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Routers run continuous background software routines that suffer from memory fragmentation and bloated connection tracking tables over time. Power-cycling both your modem and router for 30 seconds once a month flushes stale caches and renegotiates clean frequency channels.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ping-jitter-gaming-guide',
      title: 'Ping, Latency, and Jitter: The Ultimate Guide to Lag-Free Gaming',
      slug: 'ping-jitter-gaming-latency-guide',
      category: 'Gaming & Latency',
      date: 'Aug 30, 2026',
      readTime: '7 min read',
      excerpt: 'Why raw download speed will not save you from multiplayer lag. Learn what causes packet jitter, latency spikes, and bufferbloat.',
      content: (
        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <p>
            Gamers often upgrade from a 50 Mbps broadband plan to a costly 500 Mbps plan expecting their online multiplayer games (Valorant, Counter-Strike 2, Apex Legends, Call of Duty) to feel noticeably faster—only to discover that weapon hit registration and rubber-banding remain identical.
          </p>
          <p>
            That is because online multiplayer games require remarkably little bandwidth (usually under 1 to 2 Mbps of continuous throughput). What truly defines your in-game smoothness is <strong>Ping (Round-Trip Latency)</strong> and <strong>Jitter (Packet Variance)</strong>.
          </p>

          <h3 className="text-lg font-bold text-white mt-6 mb-2">Ping vs. Jitter: What is the Difference?</h3>
          <ul className="list-disc list-inside space-y-3 pl-2">
            <li>
              <strong>Ping (Latency, ms):</strong> The elapsed time required for a packet of data to travel from your computer to the remote game server and back. Lower is always better. At 15 ms, actions feel instantaneous. At 120 ms, you will shoot a player only to find the server registered them shooting you first.
            </li>
            <li>
              <strong>Jitter (ms):</strong> The deviation in ping over time. If your ping is 20 ms on one frame, 110 ms on the next, and 35 ms immediately after, your jitter is high. High jitter confuses the game engine's prediction algorithms, resulting in severe teleporting, jerky player models, and desync.
            </li>
          </ul>

          <div className="p-5 rounded-2xl bg-purple-950/40 border border-purple-800/60 my-6 space-y-2">
            <h4 className="text-purple-300 font-bold">Ideal Latency Benchmarks for Gaming:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-2 font-mono text-xs">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-emerald-400 font-bold block text-sm">&lt; 20 ms</span>
                <span className="text-slate-400 text-[10px]">Elite Competitive</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-cyan-400 font-bold block text-sm">20–45 ms</span>
                <span className="text-slate-400 text-[10px]">Great Experience</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-amber-400 font-bold block text-sm">46–85 ms</span>
                <span className="text-slate-400 text-[10px]">Playable</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-rose-400 font-bold block text-sm">&gt; 100 ms</span>
                <span className="text-slate-400 text-[10px]">Severe Disadvantage</span>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-bold text-white mt-6 mb-2">The Hidden Culprit: Bufferbloat</h3>
          <p>
            Have you ever noticed your ping jumping from 25 ms to 250 ms the moment someone else in your house starts watching Netflix or downloading a software update? That is called <strong>Bufferbloat</strong>. Traditional home routers have large internal memory buffers that store packets when the line is busy, creating an artificial traffic jam.
          </p>
          <p>
            <strong>The Solution:</strong> Look for a router supporting <strong>Smart Queue Management (SQM)</strong> running algorithms such as <em>FQ_CoDel</em> or <em>Cake</em>. SQM prioritizes real-time interactive packets (gaming and voice calls) ahead of heavy bulk downloads, keeping ping stable at 20 ms even when your line is 100% saturated.
          </p>
        </div>
      )
    },
    {
      id: '5g-vs-fiber-comparison',
      title: '5G Mobile Data vs Home Fiber Broadband: Which Is Faster and More Reliable?',
      slug: '5g-vs-fiber-broadband-comparison',
      category: 'Mobile Networks',
      date: 'Aug 31, 2026',
      readTime: '6 min read',
      excerpt: 'Can 5G Home Internet replace traditional fiber optics? We compare peak download rates, upload symmetry, weather resilience, and latency.',
      content: (
        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <p>
            With the rapid expansion of 5G Ultra Wideband and Mid-Band networks, cellular carriers are actively marketing 5G Home Internet (Fixed Wireless Access, FWA) as a direct replacement for traditional wired cable and fiber optic broadband. But how do they compare when measured under sustained real-world load?
          </p>

          <h3 className="text-lg font-bold text-white mt-6 mb-2">Core Differences: Fiber Optics vs. 5G Wireless</h3>
          <p>
            <strong>Fiber Optic Broadband</strong> sends pulses of infrared light through microscopic strands of flexible glass fibers directly into your residence. Because light traveling through glass is shielded from environmental radio interference and distance degradation, fiber delivers consistent, symmetrical speeds (e.g., 500 Mbps down and 500 Mbps up) with sub-10 ms latency.
          </p>
          <p>
            <strong>5G Home Internet</strong> connects your home modem to a nearby cellular cell tower using microwave radio frequencies. While peak download speeds in optimal conditions can surpass 300 to 500 Mbps, performance is fundamentally shared with every mobile smartphone connected to that same cell tower.
          </p>

          <h3 className="text-lg font-bold text-white mt-6 mb-3">Head-to-Head Comparison</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Performance Metric</th>
                  <th className="py-3 px-4">Fiber Optic Broadband</th>
                  <th className="py-3 px-4">5G Home Wireless</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono-num">
                <tr>
                  <td className="py-3 px-4 font-sans font-medium text-slate-200">Download Speeds</td>
                  <td className="py-3 px-4 text-emerald-400">300 – 5,000 Mbps (Stable)</td>
                  <td className="py-3 px-4 text-cyan-400">100 – 400 Mbps (Variable)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-sans font-medium text-slate-200">Upload Speeds</td>
                  <td className="py-3 px-4 text-emerald-400">Symmetrical (Matches Download)</td>
                  <td className="py-3 px-4 text-amber-400">Asymmetrical (15 – 40 Mbps)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-sans font-medium text-slate-200">Typical Ping / Latency</td>
                  <td className="py-3 px-4 text-emerald-400">3 – 12 ms</td>
                  <td className="py-3 px-4 text-cyan-400">25 – 65 ms</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-sans font-medium text-slate-200">Weather & Tree Foliage Impact</td>
                  <td className="py-3 px-4 text-emerald-400">Zero Impact</td>
                  <td className="py-3 px-4 text-amber-400">Moderate (Rain fade & foliage attenuation)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-sans font-medium text-slate-200">Installation Ease</td>
                  <td className="py-3 px-4 text-slate-400">Requires line trenching / tech visit</td>
                  <td className="py-3 px-4 text-emerald-400">Instant plug-and-play self-setup</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-bold text-white mt-6 mb-2">Verdict: Which Should You Choose?</h3>
          <p>
            If Fiber is available at your address, it remains the gold standard for latency, reliability, and symmetrical upload power. However, if your only other alternative is legacy copper DSL or sluggish coaxial cable with poor customer support, 5G Home Internet provides an impressive, contract-free, high-speed solution.
          </p>
        </div>
      )
    }
  ];

  const activeArticle = articles.find(a => a.id === selectedArticleId);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-10 animate-fade-in">
      {/* Article Detail View */}
      {activeArticle ? (
        <article className="space-y-6">
          <button
            onClick={() => setSelectedArticleId(null)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Articles</span>
          </button>

          <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-semibold text-[11px] uppercase tracking-wider">
                {activeArticle.category}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {activeArticle.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {activeArticle.readTime}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-white tracking-tight leading-tight">
              {activeArticle.title}
            </h1>

            <p className="text-base text-slate-300 font-medium italic border-l-2 border-cyan-500 pl-4 py-1">
              {activeArticle.excerpt}
            </p>

            <hr className="border-slate-800 my-6" />

            {/* Main Article Body */}
            {activeArticle.content}

            {/* Bottom Share & Test Action */}
            <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? 'Link Copied!' : 'Share Article'}</span>
              </button>

              <button
                onClick={() => onNavigate('home')}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 hover:scale-105 cursor-pointer"
              >
                <span>Test Your Internet Speed Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </article>
      ) : (
        /* Blog Article Hub View */
        <div className="space-y-10">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              <span>NetPulse Knowledge Hub</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
              Broadband & Network Guides
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
              Explore in-depth engineering breakdowns, speed calculations, and network troubleshooting tips written in clear, accessible English.
            </p>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((art) => (
              <div
                key={art.id}
                onClick={() => setSelectedArticleId(art.id)}
                className="group p-6 rounded-3xl bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-cyan-500/5 hover:-translate-y-1"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-semibold text-[10px] uppercase tracking-wider">
                      {art.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3" />
                      {art.readTime}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                    {art.title}
                  </h2>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {art.excerpt}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-cyan-400 group-hover:text-cyan-300">
                  <span>Read Full Article</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Speed Test Banner */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-cyan-950/60 via-slate-900/60 to-blue-950/60 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-lg font-bold text-white">Ready to benchmark your current connection?</h3>
              <p className="text-xs text-slate-400">Get an instant, accurate download, upload, ping, and jitter reading in 15 seconds.</p>
            </div>
            <button
              onClick={() => onNavigate('home')}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 hover:scale-105 shrink-0 cursor-pointer"
            >
              Start Free Speed Test
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
