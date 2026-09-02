export type TestPhase = 
  | 'idle'
  | 'latency'
  | 'download'
  | 'upload'
  | 'finishing'
  | 'completed'
  | 'error';

export interface PingMetrics {
  current: number;
  min: number;
  avg: number;
  max: number;
  jitter: number;
  samples: number[];
}

export interface SpeedMetrics {
  ping: PingMetrics;
  download: {
    current: number; // in Mbps
    peak: number;    // in Mbps
    avg: number;     // in Mbps
    bytesTransferred: number;
    telemetry: number[];
  };
  upload: {
    current: number; // in Mbps
    peak: number;    // in Mbps
    avg: number;     // in Mbps
    bytesTransferred: number;
    telemetry: number[];
  };
  progress: number; // 0 - 100
  phase: TestPhase;
  error?: string;
  timestamp?: number;
}

export interface QualityAssessment {
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  label: string;
  summary: string;
  color: string;
  suitability: {
    gaming: { rating: 'Excellent' | 'Good' | 'Fair' | 'Poor'; icon: string; detail: string };
    streaming4K: { rating: 'Excellent' | 'Good' | 'Fair' | 'Poor'; icon: string; detail: string };
    videoCalls: { rating: 'Excellent' | 'Good' | 'Fair' | 'Poor'; icon: string; detail: string };
    cloudBackup: { rating: 'Excellent' | 'Good' | 'Fair' | 'Poor'; icon: string; detail: string };
  };
}

export interface ServerNode {
  id: string;
  name: string;
  location: string;
  country: string;
  isDefault: boolean;
  pingUrl: string;
  downloadUrl: string;
  uploadUrl: string;
}

export interface ClientInfo {
  ip: string;
  protocol: string;
  userAgent: string;
  isp?: string;
}

export interface HistoryRecord {
  id: string;
  date: string;
  timestamp: number;
  downloadSpeed: number; // Mbps
  uploadSpeed: number;   // Mbps
  ping: number;          // ms
  jitter: number;        // ms
  serverName: string;
  grade: string;
}

export interface TestSettings {
  unit: 'Mbps' | 'MB/s' | 'Gbps';
  parallelStreams: number;
  testDurationSeconds: number;
  dataSaverMode: boolean;
  autoStartOnLoad: boolean;
  selectedServerId: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'model' | 'assistant';
  text: string;
  timestamp: number;
  sources?: string[];
  suggestedFollowUps?: string[];
}

export type PageRoute = 
  | 'home'
  | 'about'
  | 'how-it-works'
  | 'blog'
  | 'faq'
  | 'privacy'
  | 'terms'
  | 'contact'
  | 'cookies'
  | 'history';
