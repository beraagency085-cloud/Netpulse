import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Trash2, 
  Copy, 
  Check, 
  RefreshCw, 
  Activity, 
  Wifi, 
  ShieldCheck, 
  Zap,
  ArrowRight,
  HelpCircle,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { AIChatMessage, SpeedMetrics, QualityAssessment, ServerNode, ClientInfo } from '../types';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: SpeedMetrics;
  assessment: QualityAssessment;
  server: ServerNode | null;
  client: ClientInfo | null;
  unit: string;
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
}

const PRESET_QUESTIONS = [
  { label: 'Why is my ping high?', prompt: 'Why is my ping or latency high, and what are the fastest ways to lower it?' },
  { label: 'Optimize Wi-Fi channel', prompt: 'How do I optimize my Wi-Fi channel, band (5GHz vs 2.4GHz), and router placement for maximum speed?' },
  { label: 'Is my speed good for 4K & Gaming?', prompt: 'Based on my speed test metrics, is my connection sufficient for 4K HDR streaming and competitive online gaming?' },
  { label: 'How to fix Bufferbloat & Jitter', prompt: 'What causes bufferbloat and jitter during heavy household downloads, and how can I fix it?' },
  { label: 'Fastest DNS (1.1.1.1 / 8.8.8.8)', prompt: 'How do I switch my DNS to Cloudflare 1.1.1.1 or Google 8.8.8.8 on my device and router?' },
  { label: 'Detect ISP Throttling', prompt: 'How do I know if my internet service provider (ISP) is throttling my bandwidth or specific video services?' },
];

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  isOpen,
  onClose,
  metrics,
  assessment,
  server,
  client,
  unit,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>(() => {
    return [
      {
        id: 'welcome-msg',
        role: 'assistant',
        text: `### Hello! I am your NetPulse AI Network Specialist 👋\n\nI can help you **diagnose connection issues**, **lower gaming ping**, **optimize Wi-Fi channels**, **fix bufferbloat**, and **interpret your speed test results**.\n\nHow can I help optimize your internet connection today?`,
        timestamp: Date.now(),
        suggestedFollowUps: [
          'Analyze my current speed test results',
          'How do I lower ping for gaming?',
          'What are the best DNS servers?'
        ]
      }
    ];
  });

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [attachMetrics, setAttachMetrics] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen, messages]);

  // Handle external prompt triggers (e.g. from ResultCard "Ask AI to analyze results")
  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) {
        onClearInitialPrompt();
      }
    }
  }, [initialPrompt, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: AIChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) {
      setInputText('');
    }
    setIsLoading(true);

    try {
      // Build context object
      const contextData = attachMetrics ? {
        download: metrics.download.avg > 0 ? Number(metrics.download.avg.toFixed(1)) : undefined,
        upload: metrics.upload.avg > 0 ? Number(metrics.upload.avg.toFixed(1)) : undefined,
        ping: metrics.ping.avg > 0 ? metrics.ping.avg : undefined,
        jitter: metrics.ping.jitter > 0 ? metrics.ping.jitter : undefined,
        quality: assessment.grade,
        clientIp: client?.ip,
        serverName: server?.name,
      } : undefined;

      const historyPayload = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          context: contextData,
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned error status ${res.status}`);
      }

      const data = await res.json();
      
      const assistantMessage: AIChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: data.text || 'I analyzed your network query. Please verify your connection or try another test.',
        timestamp: Date.now(),
        suggestedFollowUps: data.suggestedFollowUps || [
          'What are the best DNS servers for speed?',
          'How do I test my connection for bufferbloat?',
          'How to improve Wi-Fi signal coverage?'
        ]
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('AI chat failed:', err);
      const errorMessage: AIChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: `### Diagnostic Assistant\n\nI experienced a temporary communication hiccup, but here are quick actionable network guidelines for **"${text}"**:\n\n1. **Wired over Wireless**: Always test via Ethernet Cat6/7 for clean, latency-free gaming and video streaming.\n2. **DNS Acceleration**: Set primary DNS to \`1.1.1.1\` and secondary to \`8.8.8.8\`.\n3. **Wi-Fi Band Separation**: Connect your computer to 5GHz or 6GHz Wi-Fi and keep IoT devices on 2.4GHz.\n4. **Router Restart**: Power-cycle your modem/router for 30 seconds to clear clogged NAT routing tables.`,
        timestamp: Date.now(),
        suggestedFollowUps: [
          'How do I change my DNS settings?',
          'How to configure 5GHz Wi-Fi band?'
        ]
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-msg-reset',
        role: 'assistant',
        text: `### Chat Cleared 🔄\n\nI am ready to solve any network question, analyze your speeds, or help you tweak your router settings.\n\nWhat would you like to investigate?`,
        timestamp: Date.now(),
        suggestedFollowUps: [
          'Analyze my current speed test results',
          'How do I lower ping for gaming?',
          'How do I optimize my Wi-Fi channel?'
        ]
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm pointer-events-auto transition-opacity"
        onClick={onClose}
      />

      {/* Slide-in Drawer Container */}
      <aside 
        className={`relative z-10 w-full ${isExpanded ? 'max-w-3xl' : 'max-w-xl'} h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col pointer-events-auto transition-all duration-300`}
        aria-label="AI Network Specialist Support Chat"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">NetPulse AI Specialist</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Live Solve
                </span>
              </div>
              <p className="text-xs text-slate-400">Network troubleshooting & instant question solving</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors hidden sm:flex items-center justify-center"
              title={isExpanded ? 'Collapse Drawer' : 'Expand Drawer'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={handleClearChat}
              className="p-2 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800/80 transition-colors"
              title="Clear Conversation History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
              title="Close Support Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Metrics Telemetry Badge Ribbon */}
        <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 overflow-x-auto py-0.5 scrollbar-none text-slate-300">
            <span className="text-slate-400 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider">
              <Activity className="w-3 h-3 text-cyan-400" />
              Live Context:
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/50 text-[11px]">
              <span className="text-slate-400">DL:</span>
              <strong className="text-cyan-300 font-mono-num">{metrics.download.avg > 0 ? metrics.download.avg.toFixed(1) : '—'} {unit}</strong>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/50 text-[11px]">
              <span className="text-slate-400">UL:</span>
              <strong className="text-blue-300 font-mono-num">{metrics.upload.avg > 0 ? metrics.upload.avg.toFixed(1) : '—'} {unit}</strong>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/50 text-[11px]">
              <span className="text-slate-400">Ping:</span>
              <strong className="text-purple-300 font-mono-num">{metrics.ping.avg > 0 ? metrics.ping.avg : '—'} ms</strong>
            </span>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-400 hover:text-slate-200 select-none ml-2 shrink-0">
            <input 
              type="checkbox" 
              checked={attachMetrics} 
              onChange={(e) => setAttachMetrics(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-cyan-500/20"
            />
            <span>Include in prompt</span>
          </label>
        </div>

        {/* Conversation Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800/50 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                  isUser 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-none shadow-md shadow-cyan-900/20' 
                    : 'bg-slate-800/70 border border-slate-700/60 text-slate-200 rounded-tl-none shadow-sm'
                }`}>
                  {/* Content body rendered with formatted text */}
                  <div className="space-y-2 whitespace-pre-wrap font-sans text-[13.5px]">
                    {msg.text.split('\n\n').map((paragraph, pIdx) => {
                      // Check for markdown heading
                      if (paragraph.startsWith('### ')) {
                        return (
                          <h4 key={pIdx} className="font-bold text-white text-base mt-2 mb-1 border-b border-slate-700/50 pb-1">
                            {paragraph.replace('### ', '')}
                          </h4>
                        );
                      }
                      if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                        return (
                          <p key={pIdx} className="font-semibold text-cyan-300">
                            {paragraph.replace(/\*\*/g, '')}
                          </p>
                        );
                      }
                      return (
                        <p key={pIdx} className="leading-relaxed">
                          {paragraph}
                        </p>
                      );
                    })}
                  </div>

                  {/* Message Footer & Copy Action */}
                  <div className="mt-2.5 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="flex items-center gap-1 hover:text-white transition-colors"
                        title="Copy answer to clipboard"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Suggested Follow-up Question Chips */}
                  {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-700/40">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5 flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5 text-amber-400" />
                        Suggested Next Questions:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedFollowUps.map((question, qIdx) => (
                          <button
                            key={qIdx}
                            onClick={() => handleSendMessage(question)}
                            className="text-left text-xs bg-slate-900/80 hover:bg-slate-700 text-cyan-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700/60 transition-colors flex items-center gap-1 group"
                          >
                            <span>{question}</span>
                            <ArrowRight className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Thinking / Typing Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800/50 flex items-center justify-center text-cyan-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl rounded-tl-none p-4 text-slate-400 text-sm flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>NetPulse AI is diagnosing and formulating step-by-step solution...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Preset Question Quick-Launch Carousel */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/70">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-cyan-400" />
            Quick Question Topics:
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {PRESET_QUESTIONS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(item.prompt)}
                disabled={isLoading}
                className="whitespace-nowrap text-xs bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-full border border-slate-700/60 transition-colors shrink-0 disabled:opacity-50"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask any question (e.g. 'How to lower ping for Valorant?', 'Why is upload slow?')..."
                rows={1}
                disabled={isLoading}
                className="w-full bg-slate-900 border border-slate-700/80 focus:border-cyan-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-none max-h-32 disabled:opacity-50 font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 flex items-center justify-center"
              aria-label="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-1.5 text-center text-[10px] text-slate-400">
            Powered by Gemini 3.7 Flash &middot; Press <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300 font-mono text-[9px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300 font-mono text-[9px]">Shift+Enter</kbd> for new line
          </div>
        </div>
      </aside>
    </div>
  );
};
