import React from 'react';
import { X, Trash2, Download, History, ArrowDown, ArrowUp, Activity, ShieldCheck } from 'lucide-react';
import { HistoryRecord } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  records: HistoryRecord[];
  onClearHistory: () => void;
  unit: string;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  records,
  onClearHistory,
  unit,
}) => {
  if (!isOpen) return null;

  // Compute summary stats
  const totalTests = records.length;
  const avgDownload = totalTests > 0
    ? (records.reduce((acc, r) => acc + r.downloadSpeed, 0) / totalTests).toFixed(1)
    : '0.0';
  const avgUpload = totalTests > 0
    ? (records.reduce((acc, r) => acc + r.uploadSpeed, 0) / totalTests).toFixed(1)
    : '0.0';
  const bestDownload = totalTests > 0
    ? Math.max(...records.map((r) => r.downloadSpeed)).toFixed(1)
    : '0.0';

  const exportCSV = () => {
    if (records.length === 0) return;

    const headers = ['Timestamp', 'Date', 'Download (Mbps)', 'Upload (Mbps)', 'Ping (ms)', 'Jitter (ms)', 'Grade', 'Server'];
    const rows = records.map((r) => [
      r.timestamp,
      `"${r.date}"`,
      r.downloadSpeed,
      r.uploadSpeed,
      r.ping,
      r.jitter,
      r.grade,
      `"${r.serverName}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NetPulse_Speed_History_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold font-heading text-white">
              Speed Test History
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {totalTests} records
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close History"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Aggregated Stats */}
        {totalTests > 0 && (
          <div className="grid grid-cols-3 gap-3 my-4">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Avg Download</span>
              <span className="font-mono-num text-lg font-bold text-cyan-400">{avgDownload} {unit}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Avg Upload</span>
              <span className="font-mono-num text-lg font-bold text-emerald-400">{avgUpload} {unit}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Peak Speed</span>
              <span className="font-mono-num text-lg font-bold text-white">{bestDownload} {unit}</span>
            </div>
          </div>
        )}

        {/* Record List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 my-2">
          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
              <History className="w-10 h-10 mb-2 stroke-1 text-slate-600" />
              <p className="text-sm font-medium">No speed tests recorded yet.</p>
              <p className="text-xs text-slate-600 mt-1">Run a speed test to track your bandwidth over time.</p>
            </div>
          ) : (
            records.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800/80 flex items-center justify-between transition-colors gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 font-heading font-black flex items-center justify-center text-sm">
                    {item.grade}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      {item.serverName}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {item.date}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="flex items-center justify-end gap-1 text-xs font-mono-num font-bold text-cyan-400">
                      <ArrowDown className="w-3 h-3" />
                      <span>{item.downloadSpeed}</span>
                    </div>
                    <span className="text-[9px] text-slate-500">Down</span>
                  </div>

                  <div>
                    <div className="flex items-center justify-end gap-1 text-xs font-mono-num font-bold text-emerald-400">
                      <ArrowUp className="w-3 h-3" />
                      <span>{item.uploadSpeed}</span>
                    </div>
                    <span className="text-[9px] text-slate-500">Up</span>
                  </div>

                  <div>
                    <div className="flex items-center justify-end gap-1 text-xs font-mono-num font-bold text-purple-300">
                      <Activity className="w-3 h-3" />
                      <span>{item.ping}ms</span>
                    </div>
                    <span className="text-[9px] text-slate-500">Ping</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action Footer */}
        {records.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-2">
            <button
              onClick={onClearHistory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>

            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
