import React, { useState } from 'react';
import { Activity, Settings2, History, Menu, X, Sun, Moon, Zap, Shield } from 'lucide-react';
import { PageRoute, ServerNode } from '../types';

interface NavbarProps {
  currentRoute: PageRoute;
  onNavigate: (route: PageRoute) => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  server: ServerNode | null;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  onOpenHistory,
  onOpenSettings,
  server,
  theme,
  onToggleTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { label: string; route: PageRoute }[] = [
    { label: 'Speed Test', route: 'home' },
    { label: 'How It Works', route: 'how-it-works' },
    { label: 'About', route: 'about' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => {
            onNavigate('home');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-2.5 group focus:outline-none"
          aria-label="NetPulse Test Home"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-2xl font-bold tracking-tight text-white flex items-center">
              NetPulse<span className="text-cyan-400">Test</span>
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-widest">
          {navItems.map((item) => (
            <button
              key={item.route}
              onClick={() => onNavigate(item.route)}
              className={`transition-colors cursor-pointer ${
                currentRoute === item.route
                  ? 'text-cyan-400 border-b-2 border-cyan-400 pb-1 font-semibold'
                  : 'hover:text-white pb-1 border-b-2 border-transparent'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Action Controls (History, Settings, Theme, Server Status) */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Server Node Status Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="truncate max-w-[130px] font-medium text-slate-300">
              {server ? server.name.split('(')[0] : 'Auto Edge Node'}
            </span>
          </div>

          {/* History Button */}
          <button
            id="nav-history-button"
            onClick={onOpenHistory}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800 transition-colors"
            title="Speed Test History"
            aria-label="Speed Test History"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Settings Button */}
          <button
            id="nav-settings-button"
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800 transition-colors"
            title="Test Settings"
            aria-label="Test Settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
            aria-label="Test Settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden px-4 pt-2 pb-6 border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl animate-fade-in space-y-2">
          {navItems.map((item) => (
            <button
              key={item.route}
              onClick={() => {
                onNavigate(item.route);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                currentRoute === item.route
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => {
                onOpenHistory();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800"
            >
              <History className="w-4 h-4 text-cyan-400" />
              <span>History</span>
            </button>

            <button
              onClick={() => {
                onOpenSettings();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800"
            >
              <Settings2 className="w-4 h-4 text-cyan-400" />
              <span>Settings</span>
            </button>

            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-slate-400 bg-slate-900 border border-slate-800"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
