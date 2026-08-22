import React, { useState } from 'react';
import { 
  Tv, 
  Video, 
  Gamepad2, 
  CloudUpload, 
  Radio, 
  Users, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  Clock, 
  Zap, 
  Layers, 
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { SpeedMetrics, QualityAssessment } from '../types';

interface BandwidthCapabilitiesPanelProps {
  metrics: SpeedMetrics;
  assessment?: QualityAssessment;
  unit?: 'Mbps' | 'MB/s' | 'Gbps';
}

type CategoryType = 'all' | 'streaming' | 'work' | 'gaming' | 'uploads';

interface CapabilityItem {
  id: string;
  category: 'streaming' | 'work' | 'gaming' | 'uploads';
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'optimal' | 'good' | 'limited' | 'insufficient';
  statusText: string;
  requirement: string;
  explanation: string;
  practicalInsight: string;
  capacityMetric?: string;
}

export const BandwidthCapabilitiesPanel: React.FC<BandwidthCapabilitiesPanelProps> = ({
  metrics,
  assessment,
  unit = 'Mbps',
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [showTimeEstimator, setShowTimeEstimator] = useState(true);

  // Normalize speeds in Mbps for accurate calculation
  const downloadMbps = metrics.download.avg || metrics.download.current || 0;
  const uploadMbps = metrics.upload.avg || metrics.upload.current || 0;
  const pingMs = metrics.ping.avg || metrics.ping.current || 0;
  const jitterMs = metrics.ping.jitter || 0;

  // Calculate simultaneous 4K & 1080p streams
  const max4KStreams = Math.max(0, Math.floor(downloadMbps / 25));
  const maxHDStreams = Math.max(0, Math.floor(downloadMbps / 5));
  const maxSimultaneousCalls = Math.max(0, Math.floor(Math.min(downloadMbps / 4, uploadMbps / 3.5)));

  // Helper to format estimated time for file transfer
  const getTransferTime = (fileSizeMB: number, speedMbps: number): string => {
    if (speedMbps <= 0) return 'Unavailable';
    const totalBits = fileSizeMB * 8;
    const effectiveSpeedMbps = speedMbps * 0.92; // 8% protocol overhead
    const totalSeconds = totalBits / effectiveSpeedMbps;

    if (totalSeconds < 1) return '< 1 second';
    if (totalSeconds < 60) return `${Math.ceil(totalSeconds)} seconds`;
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = Math.round(totalSeconds % 60);
    if (minutes < 60) {
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Generate dynamic capabilities based on measured real-world metrics
  const capabilities: CapabilityItem[] = [
    // 1. 4K Ultra HD Streaming
    {
      id: 'streaming-4k',
      category: 'streaming',
      title: '4K Ultra HD & HDR Streaming',
      subtitle: 'Netflix, YouTube 4K, Disney+, Apple TV+, Prime Video',
      icon: Tv,
      status:
        downloadMbps >= 50 ? 'optimal' :
        downloadMbps >= 25 ? 'good' :
        downloadMbps >= 15 ? 'limited' : 'insufficient',
      statusText:
        downloadMbps >= 50 ? 'Instant 4K HDR (Multiple Screens)' :
        downloadMbps >= 25 ? 'Smooth 4K UHD (Single Screen)' :
        downloadMbps >= 15 ? 'HD 1080p Only (4K May Buffer)' : 'Standard Definition (SD) Only',
      requirement: '25 Mbps per 4K stream (15 Mbps minimum)',
      explanation: downloadMbps >= 25
        ? `Your download speed (${downloadMbps.toFixed(1)} Mbps) easily fulfills the 25 Mbps bandwidth required for crisp 4K UHD video.`
        : `Your download speed (${downloadMbps.toFixed(1)} Mbps) is below the recommended 25 Mbps for smooth 4K streaming.`,
      practicalInsight: max4KStreams > 1
        ? `Supports up to ${max4KStreams} simultaneous 4K streams simultaneously in your household.`
        : max4KStreams === 1
        ? 'Supports 1 active 4K stream without buffering.'
        : `Supports ${Math.max(1, maxHDStreams)} standard 1080p HD stream(s).`,
      capacityMetric: `${max4KStreams}x 4K Streams`,
    },

    // 2. HD Video Conferencing & Remote Work
    {
      id: 'video-conferencing',
      category: 'work',
      title: 'HD Video Conferencing & Remote Collaboration',
      subtitle: 'Zoom, Microsoft Teams, Google Meet, Slack Huddles, Discord',
      icon: Video,
      status:
        downloadMbps >= 15 && uploadMbps >= 5 && pingMs <= 60 && jitterMs <= 10 ? 'optimal' :
        downloadMbps >= 8 && uploadMbps >= 2.5 && pingMs <= 100 ? 'good' :
        downloadMbps >= 3 && uploadMbps >= 1 ? 'limited' : 'insufficient',
      statusText:
        downloadMbps >= 15 && uploadMbps >= 5 && pingMs <= 60
          ? 'Studio Quality 1080p + Screen Share'
          : downloadMbps >= 8 && uploadMbps >= 2.5
          ? 'Clear 720p/1080p Video Calls'
          : downloadMbps >= 3 && uploadMbps >= 1
          ? 'Audio-first with Basic Video'
          : 'High Risk of Call Drops & Choppy Audio',
      requirement: '4 Mbps down / 3.5 Mbps up + Latency < 80ms',
      explanation:
        uploadMbps >= 4 && pingMs <= 70
          ? `High upload bandwidth (${uploadMbps.toFixed(1)} Mbps) and low ping (${pingMs} ms) prevent stutter during group screen shares.`
          : `Upload bandwidth (${uploadMbps.toFixed(1)} Mbps) or latency (${pingMs} ms) may cause slight delay during multi-speaker video meetings.`,
      practicalInsight: maxSimultaneousCalls > 1
        ? `Can comfortably support ${maxSimultaneousCalls} separate video calls at the same time without packet loss.`
        : 'Sufficient for 1 primary video conference with active webcam and screen sharing.',
      capacityMetric: `${Math.max(1, maxSimultaneousCalls)} Callers`,
    },

    // 3. Competitive Online Gaming & Cloud Gaming
    {
      id: 'gaming-online',
      category: 'gaming',
      title: 'Competitive Multiplayer & Cloud Gaming',
      subtitle: 'Valorant, Fortnite, CS2, Call of Duty, GeForce NOW, Xbox Cloud',
      icon: Gamepad2,
      status:
        pingMs <= 30 && jitterMs <= 6 && downloadMbps >= 25 ? 'optimal' :
        pingMs <= 60 && jitterMs <= 15 && downloadMbps >= 15 ? 'good' :
        pingMs <= 100 ? 'limited' : 'insufficient',
      statusText:
        pingMs <= 30 && jitterMs <= 6
          ? 'Esports Grade / Zero Noticeable Lag'
          : pingMs <= 60
          ? 'Great Responsiveness for Online Play'
          : pingMs <= 100
          ? 'Casual Gaming / Minor Input Lag'
          : 'Noticeable Latency / High Desync',
      requirement: 'Ping < 40ms, Jitter < 10ms, Download > 15 Mbps for Cloud',
      explanation:
        pingMs <= 35
          ? `Exceptional round-trip ping (${pingMs} ms) and jitter (${jitterMs} ms) guarantee instantaneous hit registration and responsive controls.`
          : `A ping of ${pingMs} ms is playable, but fast-twitch competitive shooters may feel slight desync compared to sub-30ms fiber lines.`,
      practicalInsight: downloadMbps >= 35 && pingMs <= 40
        ? 'Fully qualified for GeForce NOW / Xbox Cloud 60fps game streaming without dedicated hardware.'
        : 'Best suited for downloaded local games and cooperative online multiplayer.',
      capacityMetric: `${pingMs}ms Ping`,
    },

    // 4. Large Cloud Backups & File Uploads
    {
      id: 'cloud-backup',
      category: 'uploads',
      title: 'Cloud Backup & High-Resolution Uploads',
      subtitle: 'Google Drive, iCloud Photos, Dropbox, OneDrive, Adobe Creative Cloud',
      icon: CloudUpload,
      status:
        uploadMbps >= 40 ? 'optimal' :
        uploadMbps >= 15 ? 'good' :
        uploadMbps >= 5 ? 'limited' : 'insufficient',
      statusText:
        uploadMbps >= 40 ? 'Blazing Fast Cloud Sync' :
        uploadMbps >= 15 ? 'Fast Backup (Minutes for GBs)' :
        uploadMbps >= 5 ? 'Moderate Sync Times' : 'Slow Uploads (Hours for Multi-GB)',
      requirement: '15+ Mbps upload for seamless multi-gigabyte transfers',
      explanation:
        uploadMbps >= 20
          ? `High upload rate (${uploadMbps.toFixed(1)} Mbps) allows rapid syncing of 4K RAW video and large photo libraries.`
          : `Upload rate (${uploadMbps.toFixed(1)} Mbps) means large multi-gigabyte uploads should ideally run in the background.`,
      practicalInsight: `A 1 GB project file will upload in approximately ${getTransferTime(1024, uploadMbps)}.`,
      capacityMetric: `${uploadMbps.toFixed(1)} Mbps Up`,
    },

    // 5. Live Streaming & Content Broadcasting
    {
      id: 'live-streaming',
      category: 'uploads',
      title: 'Live Broadcasting & Content Creation',
      subtitle: 'OBS Studio, Twitch 1080p60, YouTube Live, TikTok Live, Kick',
      icon: Radio,
      status:
        uploadMbps >= 20 ? 'optimal' :
        uploadMbps >= 10 ? 'good' :
        uploadMbps >= 5 ? 'limited' : 'insufficient',
      statusText:
        uploadMbps >= 20 ? 'Flawless 1080p60 / 1440p High Bitrate' :
        uploadMbps >= 10 ? 'Stable 1080p 60fps Broadcast' :
        uploadMbps >= 5 ? '720p 30fps Stream Supported' : 'High Risk of Dropped Frames',
      requirement: '8 to 12 Mbps dedicated upload bitrate for 1080p 60fps',
      explanation:
        uploadMbps >= 12
          ? `With ${uploadMbps.toFixed(1)} Mbps upload, you have ample headroom to stream at a crisp 8,000 Kbps bitrate with room for game traffic.`
          : `Upload bandwidth (${uploadMbps.toFixed(1)} Mbps) is tight for 1080p60 streaming. 720p30 with 3,500 Kbps bitrate is recommended.`,
      practicalInsight: uploadMbps >= 15
        ? 'Supports high-bitrate streaming while simultaneously playing online multiplayer.'
        : 'Consider capping OBS stream bitrate to avoid network choke during gaming.',
      capacityMetric: `${uploadMbps >= 15 ? '1080p60' : uploadMbps >= 8 ? '1080p30' : '720p30'} Ready`,
    },

    // 6. Simultaneous Household Multi-Device Usability
    {
      id: 'multi-device',
      category: 'streaming',
      title: 'Simultaneous Multi-Device & Smart Home',
      subtitle: 'Phones, Smart TVs, Laptops, Consoles, Tablets & IoT Cameras',
      icon: Users,
      status:
        downloadMbps >= 150 ? 'optimal' :
        downloadMbps >= 60 ? 'good' :
        downloadMbps >= 25 ? 'limited' : 'insufficient',
      statusText:
        downloadMbps >= 150 ? 'Heavy Multi-User Household (10+ Devices)' :
        downloadMbps >= 60 ? 'Family Household (5–8 Devices)' :
        downloadMbps >= 25 ? 'Moderate Use (2–4 Devices)' : 'Single User / 1 Active Device',
      requirement: '50+ Mbps for 4+ simultaneous heavy users',
      explanation: `Total connection capacity (${downloadMbps.toFixed(1)} Mbps download / ${uploadMbps.toFixed(1)} Mbps upload) dictates shared family bandwidth headroom.`,
      practicalInsight: downloadMbps >= 100
        ? 'Multiple family members can stream 4K, play games, and attend video calls simultaneously without throttling each other.'
        : 'Heavy downloads may cause brief quality drops on other streaming devices on your Wi-Fi network.',
      capacityMetric: `${downloadMbps >= 150 ? '10+' : downloadMbps >= 60 ? '5-8' : '2-4'} Devices`,
    },
  ];

  const filteredCapabilities = activeCategory === 'all'
    ? capabilities
    : capabilities.filter((c) => c.category === activeCategory);

  const getStatusBadge = (status: CapabilityItem['status']) => {
    switch (status) {
      case 'optimal':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wide">
            <CheckCircle2 className="w-3 h-3" />
            Optimal
          </span>
        );
      case 'good':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase tracking-wide">
            <CheckCircle2 className="w-3 h-3" />
            Supported
          </span>
        );
      case 'limited':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-wide">
            <AlertTriangle className="w-3 h-3" />
            Limited
          </span>
        );
      case 'insufficient':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 uppercase tracking-wide">
            <XCircle className="w-3 h-3" />
            Insufficient
          </span>
        );
    }
  };

  return (
    <div id="bandwidth-capabilities-panel" className="w-full rounded-3xl bg-slate-900/40 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-sm animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Real-World Bandwidth Analysis</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            What Can You Realistically Do With Your Speed?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Based on your measured <strong className="text-slate-200">{downloadMbps.toFixed(1)} Mbps</strong> download, <strong className="text-slate-200">{uploadMbps.toFixed(1)} Mbps</strong> upload, and <strong className="text-slate-200">{pingMs} ms</strong> latency.
          </p>
        </div>

        {/* Quick Capacity Pills */}
        <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">4K Streams</span>
            <span className="text-sm font-bold text-cyan-400 font-mono-num">{max4KStreams} max</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">HD Calls</span>
            <span className="text-sm font-bold text-emerald-400 font-mono-num">{maxSimultaneousCalls} max</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Gaming Latency</span>
            <span className={`text-sm font-bold font-mono-num ${pingMs <= 35 ? 'text-emerald-400' : pingMs <= 70 ? 'text-cyan-400' : 'text-amber-400'}`}>
              {pingMs <= 35 ? 'A+' : pingMs <= 70 ? 'Good' : 'Fair'}
            </span>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Activities' },
          { id: 'streaming', label: '4K & Media Streaming' },
          { id: 'work', label: 'Video Calls & Remote Work' },
          { id: 'gaming', label: 'Online & Cloud Gaming' },
          { id: 'uploads', label: 'Cloud Backup & Creation' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id as CategoryType)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === tab.id
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Interactive Activity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCapabilities.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform shadow-inner">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{item.title}</h4>
                      <span className="text-[11px] text-slate-400 block">{item.subtitle}</span>
                    </div>
                  </div>
                  {getStatusBadge(item.status)}
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 mb-3">
                  <span className="text-xs font-bold text-slate-200 block mb-1">
                    {item.statusText}
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.explanation}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>{item.practicalInsight}</span>
                </span>
                {item.capacityMetric && (
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono-num font-semibold shrink-0">
                    {item.capacityMetric}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Practical Real-World Transfer Time Calculator Bar */}
      <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/90 space-y-3">
        <div 
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setShowTimeEstimator(!showTimeEstimator)}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Estimated Real-World Download & Upload Times
            </h4>
          </div>
          <button className="text-slate-400 hover:text-white transition-colors">
            {showTimeEstimator ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showTimeEstimator && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            {/* 1GB 1080p Movie */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">1 GB HD Video</span>
              <span className="font-mono-num text-sm font-bold text-cyan-300 block">
                {getTransferTime(1024, downloadMbps)}
              </span>
              <span className="text-[10px] text-slate-500">Download</span>
            </div>

            {/* 10GB Game Update */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">10 GB Game Update</span>
              <span className="font-mono-num text-sm font-bold text-cyan-300 block">
                {getTransferTime(10240, downloadMbps)}
              </span>
              <span className="text-[10px] text-slate-500">Download</span>
            </div>

            {/* 50GB AAA Game Install */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">50 GB AAA Game</span>
              <span className="font-mono-num text-sm font-bold text-cyan-300 block">
                {getTransferTime(51200, downloadMbps)}
              </span>
              <span className="text-[10px] text-slate-500">Download</span>
            </div>

            {/* 1GB Cloud Photo/Video Backup */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">1 GB Cloud Photos</span>
              <span className="font-mono-num text-sm font-bold text-emerald-300 block">
                {getTransferTime(1024, uploadMbps)}
              </span>
              <span className="text-[10px] text-slate-500">Upload</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
