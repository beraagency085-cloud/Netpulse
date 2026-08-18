import React, { useRef, useState, useEffect } from 'react';
import { X, Copy, Check, Share2, Download, ShieldCheck, Sparkles } from 'lucide-react';
import { SpeedMetrics, QualityAssessment, ServerNode } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: SpeedMetrics;
  assessment: QualityAssessment;
  server: ServerNode | null;
  unit: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  metrics,
  assessment,
  server,
  unit,
}) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      drawShareBadge();
    }
  }, [isOpen, metrics]);

  if (!isOpen) return null;

  const formattedSummary = `⚡ NetPulse Speed Test Results ⚡
Download: ${metrics.download.avg} ${unit}
Upload: ${metrics.upload.avg} ${unit}
Ping: ${metrics.ping.avg} ms | Jitter: ${metrics.ping.jitter} ms
Rating: ${assessment.grade} (${assessment.label})
Server: ${server?.name || 'NetPulse Edge Server'}
Date: ${new Date(metrics.timestamp || Date.now()).toLocaleDateString()}
Test your internet at NetPulse Test`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(formattedSummary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My NetPulse Internet Speed Test Result',
          text: formattedSummary,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share dismissed');
      }
    } else {
      handleCopyText();
    }
  };

  // Draw custom high-resolution NetPulse Result Card on HTML5 Canvas
  const drawShareBadge = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 800;
    const height = 450;
    canvas.width = width;
    canvas.height = height;

    // Dark sleek gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle grid overlay
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Outer glow border
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(15, 15, width - 30, height - 30);

    // Brand Header
    ctx.font = 'bold 24px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('⚡ NetPulse Test', 40, 60);

    ctx.font = '13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Official Internet Performance Certificate', 40, 82);

    // Grade Badge in top right
    ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
    ctx.fillRect(width - 120, 35, 75, 55);
    ctx.strokeStyle = '#06b6d4';
    ctx.strokeRect(width - 120, 35, 75, 55);

    ctx.font = 'bold 28px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#22d3ee';
    ctx.textAlign = 'center';
    ctx.fillText(assessment.grade, width - 82, 73);
    ctx.textAlign = 'left';

    // Divider
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.beginPath();
    ctx.moveTo(40, 110);
    ctx.lineTo(width - 40, 110);
    ctx.stroke();

    // Metric 1: Download
    ctx.font = '12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('DOWNLOAD SPEED', 50, 150);

    ctx.font = 'bold 44px "JetBrains Mono", monospace';
    ctx.fillStyle = '#22d3ee';
    ctx.fillText(`${metrics.download.avg}`, 50, 200);

    ctx.font = '16px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(unit, 50 + ctx.measureText(`${metrics.download.avg}`).width + 8, 198);

    // Metric 2: Upload
    ctx.font = '12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('UPLOAD SPEED', 290, 150);

    ctx.font = 'bold 44px "JetBrains Mono", monospace';
    ctx.fillStyle = '#34d399';
    ctx.fillText(`${metrics.upload.avg}`, 290, 200);

    ctx.font = '16px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(unit, 290 + ctx.measureText(`${metrics.upload.avg}`).width + 8, 198);

    // Metric 3: Ping
    ctx.font = '12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('PING LATENCY', 530, 150);

    ctx.font = 'bold 44px "JetBrains Mono", monospace';
    ctx.fillStyle = '#c084fc';
    ctx.fillText(`${metrics.ping.avg}`, 530, 200);

    ctx.font = '16px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('ms', 530 + ctx.measureText(`${metrics.ping.avg}`).width + 8, 198);

    // Secondary Row (Jitter, Server, Timestamp)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.fillRect(40, 250, width - 80, 120);
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.5)';
    ctx.strokeRect(40, 250, width - 80, 120);

    ctx.font = '13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Jitter:', 65, 285);
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(`${metrics.ping.jitter} ms`, 115, 285);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Quality:', 220, 285);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(assessment.label, 275, 285);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Server:', 65, 320);
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(server?.name || 'NetPulse Edge Hub', 120, 320);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Date:', 65, 350);
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(new Date(metrics.timestamp || Date.now()).toLocaleString(), 110, 350);

    // Footer Watermark
    ctx.font = '11px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';
    ctx.fillText('Verified by NetPulse Speed Engine • netpulsetest.app', width - 50, height - 30);
    ctx.textAlign = 'left';
  };

  const handleDownloadImage = () => {
    setIsGeneratingImage(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const imageURL = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = imageURL;
      a.download = `NetPulse-SpeedTest-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('Image export failed:', e);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close Share Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold font-heading text-white">
            Share Your Speed Results
          </h3>
        </div>

        {/* Live Canvas Badge Preview */}
        <div className="mb-4 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="w-full h-auto max-h-56 object-contain"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <button
            onClick={handleCopyText}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copied ? 'Copied Summary' : 'Copy Text'}</span>
          </button>

          <button
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Share2 className="w-4 h-4 text-cyan-400" />
            <span>Web Share API</span>
          </button>

          <button
            onClick={handleDownloadImage}
            disabled={isGeneratingImage}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20 transition-all hover:scale-105"
          >
            <Download className="w-4 h-4" />
            <span>Save Image PNG</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-500 text-center">
          No personal data or exact IP addresses are included in public share badges.
        </p>
      </div>
    </div>
  );
};
