import React, { useState } from 'react';
import { 
  ArrowDown, 
  ArrowUp, 
  Activity, 
  Gauge, 
  Wifi, 
  Cable, 
  RotateCw, 
  Globe, 
  SlidersHorizontal, 
  Layers, 
  ChevronDown, 
  CheckCircle2, 
  HelpCircle, 
  BookOpen, 
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { PageRoute } from '../types';

interface SpeedTestGuidesSectionProps {
  onNavigate?: (route: PageRoute) => void;
}

export const SpeedTestGuidesSection: React.FC<SpeedTestGuidesSectionProps> = ({ onNavigate }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqItems = [
    {
      question: "Why does my speed test result differ from the speed advertised by my ISP?",
      answer: "Internet Service Providers (ISPs) advertise speeds 'up to' a maximum theoretical limit under ideal conditions. In reality, actual speeds are influenced by network overhead (TCP/IP framing consumes ~5-10% of raw bandwidth), local Wi-Fi interference, router hardware limitations, peak-hour neighborhood congestion, and server distance. Running a speed test over an Ethernet cable directly connected to your modem will give you the closest reading to your ISP's provisioned line speed."
    },
    {
      question: "What is the difference between Megabits per second (Mbps) and Megabytes per second (MB/s)?",
      answer: "One byte consists of 8 bits. Internet providers and speed tests measure transfer speed in Megabits per second (Mbps, lowercase 'b'), whereas web browsers, Steam, and operating systems report file sizes and download speeds in Megabytes per second (MB/s, uppercase 'B'). To find your real file download rate in MB/s, divide your Mbps speed by 8. For example, a 100 Mbps connection will download files at roughly 12.5 MB/s."
    },
    {
      question: "Why is my Wi-Fi speed significantly slower than a wired Ethernet connection?",
      answer: "Wi-Fi signals are broadcast over radio frequencies that are susceptible to physical obstruction (concrete walls, metal doors, floors) and electromagnetic interference from neighboring routers, baby monitors, and microwave ovens. Furthermore, 2.4 GHz Wi-Fi has limited spectrum width. Switching to the 5 GHz or 6 GHz band (Wi-Fi 6/6E) helps dramatically, but a direct Cat6/Cat7 Ethernet cable will always provide lower latency, zero packet jitter, and maximum throughput."
    },
    {
      question: "What ping and jitter values are considered good for gaming and video calls?",
      answer: "For real-time applications like competitive online gaming (Valorant, CS2, Fortnite) and Zoom/Teams video conferencing, ping below 20 ms is considered elite, 20–50 ms is very good, and 50–100 ms is acceptable for casual web tasks. Jitter measures ping variance; an ideal jitter score is under 3–5 ms. When jitter exceeds 15–20 ms, you will experience voice audio clipping, video stuttering, and multiplayer 'rubber-banding'."
    },
    {
      question: "Does running an internet speed test consume mobile data allowance?",
      answer: "Yes. In order to accurately measure high-speed broadband and 4G/5G connections, speed testing tools transfer real uncompressed binary chunks over multiple concurrent connections. A single full test on a 100 Mbps connection typically transfers between 40 MB and 120 MB of data. If you are on a capped cellular data plan, you can enable NetPulse's 'Data Saver Mode' in the settings menu to reduce data consumption by up to 70%."
    },
    {
      question: "Why does my connection speed drop during peak evening hours?",
      answer: "Between 7:00 PM and 11:00 PM, millions of households stream 4K video, play games, and download content simultaneously. If your ISP's regional neighborhood routing nodes or fiber concentration cabinets are oversubscribed, bandwidth becomes shared and congested, causing throughput to decline and latency to rise. Contacting your ISP or enabling router Smart Queue Management (SQM) can help prioritize your critical traffic."
    },
    {
      question: "How does using a VPN affect my speed test results?",
      answer: "A Virtual Private Network (VPN) reroutes your internet traffic through an encrypted tunnel to an intermediary server. This encryption overhead and the physical distance to the VPN exit server typically reduces download and upload speeds by 10% to 30% and adds 15–40 ms of latency. To measure your actual ISP baseline speed, temporarily disconnect your VPN before running a test."
    }
  ];

  return (
    <div className="w-full max-w-7xl mt-12 space-y-12">
      {/* SECTION 1: WHAT IS A SPEED TEST */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 shadow-xl">
        <div className="max-w-3xl mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Connection Fundamentals</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
            What Is an Internet Speed Test?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
            An internet speed test is an online diagnostic tool that analyzes the real-world performance of your broadband or cellular connection. By establishing high-speed, parallel data transfers between your web browser and nearby edge measurement servers, the test determines your connection's data transfer capacity (bandwidth) and signal responsiveness (latency).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800/60 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">1. Latency & Jitter Probe</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sends lightweight timestamped packets back and forth to measure the round-trip delay in milliseconds (ms) and verify packet consistency without variance.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-purple-400 font-medium">
              Essential for: Online gaming & Zoom calls
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800/60 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
                <ArrowDown className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">2. Multi-Stream Download</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Opens multiple concurrent HTTP sockets to fetch uncompressed binary chunks, saturating your pipeline to capture your sustained peak bandwidth.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-cyan-400 font-medium">
              Essential for: 4K streaming & fast web browsing
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800/60 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                <ArrowUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">3. Live Upload Velocity</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generates random buffers in memory and transmits them via chunked POST requests, measuring how quickly your device pushes data out to the internet.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-emerald-400 font-medium">
              Essential for: Cloud backups & video broadcasts
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: HOW TO READ YOUR RESULTS */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 shadow-xl">
        <div className="max-w-3xl mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/40 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Gauge className="w-3.5 h-3.5" />
            <span>Metrics Breakdown</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
            How to Read Your Speed Test Results
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
            Understanding the four primary network metrics helps you diagnose whether your internet service meets your daily work, streaming, and gaming requirements.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-400" />
                <h3 className="text-base font-bold text-white">Download Speed (Mbps)</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono">
                Higher is Better
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Download speed indicates how many Megabits of data your connection can fetch per second. It governs page load speed, high-definition and 4K UHD video playback without buffering, and large software installation download times.
            </p>
            <div className="mt-3 text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <strong className="text-cyan-400">Target Benchmark:</strong> 25 Mbps is sufficient for a single 4K stream; 100–300+ Mbps is recommended for modern multi-device households.
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <h3 className="text-base font-bold text-white">Upload Speed (Mbps)</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-mono">
                Higher is Better
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload speed determines how rapidly you can send data to remote servers. This is crucial for uploading photos and documents to Google Drive or iCloud, sharing your camera on Zoom or Microsoft Teams, and live broadcasting to YouTube or Twitch.
            </p>
            <div className="mt-3 text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <strong className="text-emerald-400">Target Benchmark:</strong> 5–10 Mbps is good for standard 1080p video calls; 20–50+ Mbps is ideal for content creators and remote workers.
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-400" />
                <h3 className="text-base font-bold text-white">Ping / Latency (ms)</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/60 font-mono">
                Lower is Better
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ping (round-trip time) measures the delay in milliseconds between your click and the server's acknowledgment. Low latency ensures instantaneous response times during multiplayer games and eliminates awkward pauses during voice and video discussions.
            </p>
            <div className="mt-3 text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <strong className="text-purple-400">Target Benchmark:</strong> &lt;20 ms is exceptional; 20–50 ms is great; &gt;100 ms leads to noticeable lag in gaming and voice communications.
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-400" />
                <h3 className="text-base font-bold text-white">Jitter (ms)</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800/60 font-mono">
                Lower is Better
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Jitter measures the stability and consistency of your ping over time. If consecutive packets take wildly different times to arrive (e.g., jumping from 15 ms to 95 ms), you will experience packet loss, audio dropouts, and jerky motion even if your average ping is acceptable.
            </p>
            <div className="mt-3 text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <strong className="text-blue-400">Target Benchmark:</strong> &lt;3 ms is rock-solid; 4–10 ms is typical for Wi-Fi; &gt;20 ms indicates network instability or bufferbloat.
            </div>
          </div>
        </div>

        {/* Speed Reference Table */}
        <div className="mt-8">
          <h3 className="text-base font-bold text-white mb-3">
            Recommended Speed Thresholds by Activity
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Activity / Use Case</th>
                  <th className="py-3 px-4">Min. Download</th>
                  <th className="py-3 px-4">Min. Upload</th>
                  <th className="py-3 px-4">Max. Ping</th>
                  <th className="py-3 px-4">Experience Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono-num">
                <tr className="hover:bg-slate-800/20">
                  <td className="py-3 px-4 font-sans font-medium text-slate-200">Email & Web Browsing</td>
                  <td className="py-3 px-4 text-cyan-400">5–10 Mbps</td>
                  <td className="py-3 px-4">1–2 Mbps</td>
                  <td className="py-3 px-4">&lt;100 ms</td>
                  <td className="py-3 px-4 font-sans text-emerald-400">Instant Loading</td>
                </tr>
                <tr className="hover:bg-slate-800/20">
                  <td className="py-3 px-4 font-sans font-medium text-slate-200">HD Video Streaming (1080p)</td>
                  <td className="py-3 px-4 text-cyan-400">10–15 Mbps</td>
                  <td className="py-3 px-4">2–3 Mbps</td>
                  <td className="py-3 px-4">&lt;80 ms</td>
                  <td className="py-3 px-4 font-sans text-emerald-400">No Buffering</td>
                </tr>
                <tr className="hover:bg-slate-800/20">
                  <td className="py-3 px-4 font-sans font-medium text-slate-200">4K Ultra HD Streaming</td>
                  <td className="py-3 px-4 text-cyan-400">25–50 Mbps</td>
                  <td className="py-3 px-4">5 Mbps</td>
                  <td className="py-3 px-4">&lt;60 ms</td>
                  <td className="py-3 px-4 font-sans text-emerald-400">Crystal Clear HDR</td>
                </tr>
                <tr className="hover:bg-slate-800/20">
                  <td className="py-3 px-4 font-sans font-medium text-slate-200">Competitive Online Gaming</td>
                  <td className="py-3 px-4 text-cyan-400">25–50 Mbps</td>
                  <td className="py-3 px-4 text-emerald-400">5–10 Mbps</td>
                  <td className="py-3 px-4 text-purple-400">&lt;30 ms</td>
                  <td className="py-3 px-4 font-sans text-emerald-400">Zero Lag & Low Jitter</td>
                </tr>
                <tr className="hover:bg-slate-800/20">
                  <td className="py-3 px-4 font-sans font-medium text-slate-200">Remote Work & Zoom Conferences</td>
                  <td className="py-3 px-4 text-cyan-400">25–50 Mbps</td>
                  <td className="py-3 px-4 text-emerald-400">10–20 Mbps</td>
                  <td className="py-3 px-4 text-purple-400">&lt;40 ms</td>
                  <td className="py-3 px-4 font-sans text-emerald-400">Fluid Screen Share</td>
                </tr>
                <tr className="hover:bg-slate-800/20">
                  <td className="py-3 px-4 font-sans font-medium text-slate-200">Heavy Multi-User Smart Home</td>
                  <td className="py-3 px-4 text-cyan-400">100–500+ Mbps</td>
                  <td className="py-3 px-4 text-emerald-400">30–100+ Mbps</td>
                  <td className="py-3 px-4 text-purple-400">&lt;30 ms</td>
                  <td className="py-3 px-4 font-sans text-emerald-400">Capacity for 10+ Devices</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 3: TIPS TO IMPROVE YOUR INTERNET SPEED */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 shadow-xl">
        <div className="max-w-3xl mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>Optimization Checklist</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
            Tips to Improve Your Internet Speed
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
            If your speed test results are lower than expected, follow these proven troubleshooting steps to optimize your home network and eliminate bottlenecks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
          {/* Tip 1 */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                <Wifi className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">1. Connect to 5 GHz or 6 GHz Wi-Fi</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Legacy 2.4 GHz Wi-Fi is heavily congested by Bluetooth devices and neighbor networks. Switch to your router's 5 GHz or Wi-Fi 6 (6 GHz) band for up to 3x higher throughput and lower interference.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-cyan-400">
              ✓ Instant 2x to 3x throughput boost
            </div>
          </div>

          {/* Tip 2 */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                <Cable className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">2. Use an Ethernet Cable for Serious Work</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Radio signals fluctuate through walls. For competitive gaming, large file uploads, and home office workstations, plugging in a direct Cat6 or Cat7 cable drops jitter to near zero and eliminates packet loss.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-indigo-400">
              ✓ Drops latency by 10–25 ms
            </div>
          </div>

          {/* Tip 3 */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <RotateCw className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">3. Reboot Modem & Router Monthly</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Routers are compact computers with processors and RAM. Over weeks of uptime, memory leaks and stale ARP tables degrade routing efficiency. Power-cycle your modem and router for 30 seconds to flush caches.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-emerald-400">
              ✓ Clears router memory buffer leaks
            </div>
          </div>

          {/* Tip 4 */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">4. Switch to High-Performance DNS</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Default ISP DNS servers can be sluggish and unoptimized. Change your router or device DNS settings to Cloudflare (<code className="text-amber-300 font-mono">1.1.1.1</code>) or Google (<code className="text-amber-300 font-mono">8.8.8.8</code>) for faster website resolution.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-amber-400">
              ✓ Accelerates first-packet website lookup
            </div>
          </div>

          {/* Tip 5 */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">5. Pause Background Syncs & Torrents</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Silent background applications such as OneDrive, Google Photos, Steam game updates, and BitTorrent clients consume upstream bandwidth, creating invisible latency spikes during video calls.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-rose-400">
              ✓ Frees upstream bandwidth for active apps
            </div>
          </div>

          {/* Tip 6 */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">6. Enable Router SQM / QoS (Bufferbloat)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When someone starts downloading a large file, regular routers queue up packets, spiking ping from 20 ms to 300 ms (bufferbloat). Enabling Smart Queue Management (SQM like FQ_CoDel or Cake) keeps latency flat under full load.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-purple-400">
              ✓ Keeps ping stable even under heavy downloads
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: COMPREHENSIVE FAQ */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Got Questions?</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Detailed answers to common questions about network speed, diagnostic testing, and internet performance.
            </p>
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate('faq')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700/60 self-start sm:self-auto cursor-pointer"
            >
              <span>View All FAQs</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          )}
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {faqItems.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div 
                key={index}
                className="rounded-2xl bg-slate-950/60 border border-slate-800/80 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-semibold text-white">
                    {item.question}
                  </span>
                  <div className={`w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-cyan-400' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-slate-900 text-xs sm:text-sm text-slate-300 leading-relaxed animate-fade-in">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Read More Guides Callout */}
        {onNavigate && (
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/40 p-5 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Want deeper technical knowledge?</h4>
                <p className="text-xs text-slate-400">Read our in-depth guides on Mbps vs MB/s, Wi-Fi channel optimization, and gaming latency.</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('blog')}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 hover:scale-105 shrink-0 cursor-pointer"
            >
              <span>Explore Network Guides</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
