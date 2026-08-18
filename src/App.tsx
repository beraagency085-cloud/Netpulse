import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ShareModal } from './components/ShareModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { SettingsModal } from './components/SettingsModal';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { ContactPage } from './pages/ContactPage';
import { CookiesPage } from './pages/CookiesPage';
import { SpeedTestEngine } from './services/speedEngine';
import { 
  SpeedMetrics, 
  QualityAssessment, 
  ServerNode, 
  ClientInfo, 
  TestSettings, 
  HistoryRecord, 
  PageRoute 
} from './types';

const DEFAULT_SETTINGS: TestSettings = {
  unit: 'Mbps',
  parallelStreams: 4,
  testDurationSeconds: 8,
  dataSaverMode: false,
  autoStartOnLoad: false,
  selectedServerId: 'edge-auto',
};

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<PageRoute>('home');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Modal open states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Settings & History with LocalStorage
  const [settings, setSettings] = useState<TestSettings>(() => {
    try {
      const saved = localStorage.getItem('netpulse_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem('netpulse_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Server & Client Metadata
  const [server, setServer] = useState<ServerNode | null>(null);
  const [servers, setServers] = useState<ServerNode[]>([]);
  const [client, setClient] = useState<ClientInfo | null>(null);

  // Speed Test Live Metrics State
  const [metrics, setMetrics] = useState<SpeedMetrics>({
    ping: { current: 0, min: 0, avg: 0, max: 0, jitter: 0, samples: [] },
    download: { current: 0, peak: 0, avg: 0, bytesTransferred: 0, telemetry: [] },
    upload: { current: 0, peak: 0, avg: 0, bytesTransferred: 0, telemetry: [] },
    progress: 0,
    phase: 'idle',
  });

  // Calculated Connection Assessment
  const [assessment, setAssessment] = useState<QualityAssessment>(() =>
    SpeedTestEngine.calculateAssessment(0, 0, 0, 0)
  );

  const engineRef = useRef<SpeedTestEngine | null>(null);

  // Initialize server telemetry and engine
  useEffect(() => {
    // 1. Fetch server & client info
    fetch('/api/speedtest/server-info')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setClient(data.client);
          setServer(data.server);
        }
      })
      .catch((err) => console.log('Server info fetch fallback:', err));

    // 2. Fetch server list
    fetch('/api/speedtest/servers')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.servers) {
          setServers(data.servers);
          if (!server && data.servers.length > 0) {
            setServer(data.servers[0]);
          }
        }
      })
      .catch((err) => console.log('Server list fetch fallback:', err));

    // 3. Initialize engine
    engineRef.current = new SpeedTestEngine((updatedMetrics) => {
      setMetrics(updatedMetrics);

      // When completed, calculate quality assessment and save record
      if (updatedMetrics.phase === 'completed') {
        const quality = SpeedTestEngine.calculateAssessment(
          updatedMetrics.download.avg,
          updatedMetrics.upload.avg,
          updatedMetrics.ping.avg,
          updatedMetrics.ping.jitter
        );
        setAssessment(quality);

        // Record to History
        const newRecord: HistoryRecord = {
          id: `test_${Date.now()}`,
          date: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          timestamp: Date.now(),
          downloadSpeed: updatedMetrics.download.avg,
          uploadSpeed: updatedMetrics.upload.avg,
          ping: updatedMetrics.ping.avg,
          jitter: updatedMetrics.ping.jitter,
          serverName: server?.name || 'NetPulse Edge Server',
          grade: quality.grade,
        };

        setHistoryRecords((prev) => {
          const updated = [newRecord, ...prev].slice(0, 50); // keep last 50
          try {
            localStorage.setItem('netpulse_history', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    }, settings);

    return () => {
      engineRef.current?.abort();
    };
  }, []);

  // Update theme class on HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  // Handle settings update
  const handleUpdateSettings = (newSettings: TestSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('netpulse_settings', JSON.stringify(newSettings));
    } catch {}
    engineRef.current?.updateSettings(newSettings);

    // Update active server if changed
    if (newSettings.selectedServerId) {
      const selected = servers.find((s) => s.id === newSettings.selectedServerId);
      if (selected) setServer(selected);
    }
  };

  const handleClearHistory = () => {
    setHistoryRecords([]);
    try {
      localStorage.removeItem('netpulse_history');
    } catch {}
  };

  const handleStartTest = () => {
    if (currentRoute !== 'home') {
      setCurrentRoute('home');
    }
    engineRef.current?.start().catch((err) => {
      console.log('Test start result:', err.message);
    });
  };

  const handleStopTest = () => {
    engineRef.current?.abort();
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} bg-grid-pattern transition-colors duration-300`}>
      {/* Top Navigation */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={setCurrentRoute}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        server={server}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Routed Content Area */}
      <div className="flex-1 flex flex-col">
        {currentRoute === 'home' && (
          <HomePage
            metrics={metrics}
            assessment={assessment}
            server={server}
            client={client}
            settings={settings}
            onStartTest={handleStartTest}
            onStopTest={handleStopTest}
            onOpenShareModal={() => setIsShareModalOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {currentRoute === 'about' && <AboutPage onNavigate={setCurrentRoute} />}
        {currentRoute === 'how-it-works' && <HowItWorksPage onNavigate={setCurrentRoute} />}
        {currentRoute === 'privacy' && <PrivacyPage onNavigate={setCurrentRoute} />}
        {currentRoute === 'terms' && <TermsPage onNavigate={setCurrentRoute} />}
        {currentRoute === 'contact' && <ContactPage onNavigate={setCurrentRoute} />}
        {currentRoute === 'cookies' && <CookiesPage onNavigate={setCurrentRoute} />}
      </div>

      {/* Share & Certificate Export Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        metrics={metrics}
        assessment={assessment}
        server={server}
        unit={settings.unit}
      />

      {/* History Drawer Modal */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        records={historyRecords}
        onClearHistory={handleClearHistory}
        unit={settings.unit}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        servers={servers}
      />

      {/* Global Footer */}
      <Footer onNavigate={setCurrentRoute} />
    </div>
  );
}
