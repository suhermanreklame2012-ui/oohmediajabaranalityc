import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Trash2, 
  Maximize2, 
  Minimize2, 
  ChevronDown, 
  ArrowUpRight, 
  ShieldCheck, 
  Compass, 
  TrendingUp, 
  Flame, 
  MessageSquare,
  HelpCircle,
  CornerDownLeft,
  MapPin,
  Users,
  Activity,
  Zap,
  Building2,
  DollarSign,
  PlusCircle,
  Filter
} from 'lucide-react';
import { BillboardSpot } from '../types/ooh';
import { NewLocationRecommendation } from '../types/siteRecommendation';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface JabarOohAiAssistantProps {
  selectedSpot?: BillboardSpot | null;
  onSelectSpotById?: (spotId: string) => void;
  onOpenAddSpotWithPrefill?: (candidate: Partial<BillboardSpot>) => void;
  onViewCandidateLocationOnMap?: (lat: number, lng: number, label: string) => void;
}

const DEFAULT_PROMPTS = [
  { label: '📍 Sarankan Lokasi Billboard Baru', prompt: 'Berdasarkan kepadatan lalu lintas dan data demografi Jawa Barat, sarankan 3 lokasi billboard baru yang paling strategis beserta analisis coverage gap dan proyeksi ROI-nya.' },
  { label: '🏆 5 Billboard Reach Tertinggi', prompt: 'Tampilkan 5 billboard dengan reach tertinggi di Jawa Barat beserta metrik efektivitasnya.' },
  { label: '☕ Rekomendasi Brand F&B', prompt: 'Titik mana yang paling strategis untuk kampanye brand kuliner / kafe kekinian di Bandung?' },
  { label: '🚗 Tren Komuter Pasteur vs Dago', prompt: 'Jelaskan analisis tren mobilitas komuter di koridor Tol Pasteur dibandingkan kawasan Dago.' },
  { label: '💰 Rata-rata CPM & Anggaran', prompt: 'Berapa rata-rata CPM billboard di Jawa Barat dan bagaimana formula efisiensi anggarannya?' }
];

export function JabarOohAiAssistant({ 
  selectedSpot, 
  onSelectSpotById,
  onOpenAddSpotWithPrefill,
  onViewCandidateLocationOnMap 
}: JabarOohAiAssistantProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'site-recommendations'>('chat');

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-welcome',
        role: 'model',
        text: `Halo! Saya **JabarOOH AI Assistant**, analis intelijen media luar ruang Jawa Barat.\n\n✨ **Fitur Baru**: Saya kini dapat **menyarankan lokasi billboard baru** berbasis analisis telemetri kepadatan lalu lintas (*traffic sensor*), durasi pandang (*dwell time*), dan data demografi audiens (SES A/B/C & rentang usia).\n\nSilakan pilih tombol di bawah atau ketik pertanyaan Anda!`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Site Recommendations state
  const [siteRecommendations, setSiteRecommendations] = useState<NewLocationRecommendation[]>([]);
  const [isSitesLoading, setIsSitesLoading] = useState<boolean>(false);
  const [corridorFilter, setCorridorFilter] = useState<string>('all');
  const [audienceFilter, setAudienceFilter] = useState<string>('all');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, isOpen, activeTab]);

  // Focus input when opened in chat tab
  useEffect(() => {
    if (isOpen && !isMinimized && activeTab === 'chat') {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, isMinimized, activeTab]);

  // Fetch structured site recommendations when tab is active
  useEffect(() => {
    if (isOpen && activeTab === 'site-recommendations') {
      fetchSiteRecommendations();
    }
  }, [isOpen, activeTab, corridorFilter, audienceFilter]);

  const fetchSiteRecommendations = async () => {
    setIsSitesLoading(true);
    try {
      const url = `/api/ai/site-recommendations?corridorFilter=${corridorFilter}&targetAudience=${audienceFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSiteRecommendations(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch site recommendations:', err);
    } finally {
      setIsSitesLoading(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    // Switch to chat tab if not active
    setActiveTab('chat');

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const history = messages
        .filter(m => m.id !== 'msg-welcome')
        .slice(-6)
        .map(m => ({ role: m.role, text: m.text }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history,
          selectedSpotId: selectedSpot?.id
        })
      });

      const data = await res.json();
      if (data.success && data.reply) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'model',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error(data.error || 'Respon AI tidak tersedia');
      }
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `Maaf, terjadi kendala saat memproses permintaan Anda: ${err.message || 'Koneksi terputus'}. Silakan coba kembali sesaat lagi.`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'msg-welcome',
        role: 'model',
        text: `Riwayat percakapan telah dibersihkan. Silakan tanyakan performa titik reklame atau analisis tren lokasi yang Anda inginkan!`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Convert candidate location recommendation to partial BillboardSpot for prefilling AddSpotModal
  const handleAdoptCandidateLocation = (candidate: NewLocationRecommendation) => {
    if (onOpenAddSpotWithPrefill) {
      onOpenAddSpotWithPrefill({
        name: candidate.candidateLocationName,
        roadName: candidate.roadName,
        regency: candidate.regency,
        district: candidate.district || 'Pusat Kota',
        type: candidate.proposedMediaFormat.type,
        dimensions: {
          width: candidate.proposedMediaFormat.dimensions.width,
          height: candidate.proposedMediaFormat.dimensions.height,
          areaM2: candidate.proposedMediaFormat.dimensions.areaM2,
          sides: candidate.proposedMediaFormat.dimensions.sides || 1
        },
        orientation: candidate.proposedMediaFormat.orientation,
        facingDirection: candidate.proposedMediaFormat.facingDirection,
        coordinates: {
          lat: candidate.coordinates.lat,
          lng: candidate.coordinates.lng
        },
        dailyGrossReach: candidate.projectedPerformance.estimatedDailyReach,
        avgDwellTimeSec: candidate.trafficMetrics.estimatedDwellTimeSec,
        ratePerMonthIdr: candidate.projectedPerformance.suggestedMonthlyRateIdr,
        occupancyStatus: 'Available',
        currentBrand: 'Rencana Titik Baru'
      });
    }
  };

  // Helper to format text with markdown styling (bolding, lists, code badges)
  const renderFormattedText = (raw: string) => {
    const lines = raw.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('### ')) {
        return (
          <h4 key={i} className="text-sm font-bold text-teal-300 mt-2 mb-1.5 flex items-center gap-1.5">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={i} className="font-bold text-white my-1 text-xs">
            {line.replace(/\*\*/g, '')}
          </p>
        );
      }

      // Check for bullet points
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
      const cleanLine = isBullet ? line.trim().substring(2) : line;

      // Highlight spot codes like [BDG-01] or [JBR-BDG-002]
      const parts = cleanLine.split(/(\[[A-Z0-9\-_]+\])/g);

      return (
        <p key={i} className={`${isBullet ? 'pl-3.5 relative before:content-["•"] before:absolute before:left-1 before:text-teal-400 text-slate-300 my-0.5' : 'text-slate-200 my-1'} text-xs leading-relaxed`}>
          {parts.map((part, pIdx) => {
            const match = part.match(/\[([A-Z0-9\-_]+)\]/);
            if (match) {
              const spotCode = match[1];
              return (
                <button
                  key={pIdx}
                  onClick={() => onSelectSpotById && onSelectSpotById(spotCode)}
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-teal-950 hover:bg-teal-900 border border-teal-500/50 hover:border-teal-400 text-teal-300 text-[10px] font-mono font-bold rounded cursor-pointer mx-1 transition-all"
                  title={`Klik untuk melihat titik ${spotCode}`}
                >
                  <span>{spotCode}</span>
                  <ArrowUpRight className="w-2.5 h-2.5 opacity-70" />
                </button>
              );
            }

            // Bold highlights within line
            const subParts = part.split(/(\*\*[^*]+\*\*)/g);
            return subParts.map((sub, sIdx) => {
              if (sub.startsWith('**') && sub.endsWith('**')) {
                return (
                  <strong key={sIdx} className="font-bold text-white">
                    {sub.slice(2, -2)}
                  </strong>
                );
              }
              return sub;
            });
          })}
        </p>
      );
    });
  };

  return (
    <>
      {/* 1. FLOATING ACTION LAUNCHER (When closed) */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
          {/* Helpful callout badge on desktop */}
          <div 
            onClick={() => {
              setIsOpen(true);
              setActiveTab('site-recommendations');
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/95 hover:bg-slate-800 border border-teal-500/40 rounded-full shadow-xl text-xs text-slate-200 backdrop-blur-md cursor-pointer transition-all hover:scale-105"
            title="Klik untuk melihat rekomendasi lokasi titik reklame baru"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
            <span className="font-semibold text-[11px] text-teal-300">Saran Lokasi Baru</span>
            <span className="text-[10px] text-slate-400">· Trafik & Demografi</span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 hover:from-teal-600 hover:to-emerald-400 text-white rounded-2xl shadow-2xl shadow-teal-900/50 border border-teal-400/40 transition-all duration-300 hover:scale-105 active:scale-95"
            title="Buka JabarOOH AI Assistant"
            aria-label="Buka JabarOOH AI Assistant"
          >
            <Bot className="w-7 h-7 text-white drop-shadow" />
            
            {/* Online Pulse Dot */}
            <span className="absolute top-2 right-2 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            </span>
          </button>
        </div>
      )}

      {/* 2. CHAT WINDOW DIALOG (When open) */}
      {isOpen && (
        <div 
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-[480px] bg-slate-950/95 border border-teal-500/40 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col transition-all duration-200 overflow-hidden ${
            isMinimized ? 'h-16' : 'h-[660px] max-h-[88vh]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-teal-950/90 via-slate-900 to-slate-950 border-b border-teal-500/30">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-xl bg-teal-600/30 border border-teal-400/50 flex items-center justify-center text-teal-300 shadow-inner">
                <Bot className="w-4 h-4 text-teal-300" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border border-slate-950 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs text-white tracking-tight">JabarOOH AI Assistant</h3>
                  <span className="px-1.5 py-0.2 bg-teal-500/20 text-teal-300 text-[9px] font-mono font-semibold rounded border border-teal-500/30">
                    Gemini 3.8 Flash
                  </span>
                </div>
                <p className="text-[10px] text-teal-400/80 font-medium">Analisis Performa & Lokasi Baru Jawa Barat</p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Bersihkan Percakapan"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(prev => !prev)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title={isMinimized ? 'Perbesar' : 'Kecilkan'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Tutup AI Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub Navigation: Chat vs Saran Lokasi Baru */}
          {!isMinimized && (
            <div className="flex items-center border-b border-slate-800 bg-slate-900/60 px-3 py-1.5 gap-2">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'chat'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Percakapan AI</span>
              </button>

              <button
                onClick={() => setActiveTab('site-recommendations')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'site-recommendations'
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Saran Lokasi Baru (Trafik & Demografi)</span>
                <span className="px-1.5 py-0.2 text-[9px] bg-amber-400 text-slate-950 font-bold rounded-full">
                  6 Titik
                </span>
              </button>
            </div>
          )}

          {!isMinimized && activeTab === 'chat' && (
            <>
              {/* Context Spot Banner (if spot is selected) */}
              {selectedSpot && (
                <div className="px-3.5 py-2 bg-teal-950/40 border-b border-teal-500/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-[11px] text-slate-400 truncate">
                      Konteks Aktif: <strong className="text-white font-mono">[{selectedSpot.code}]</strong> {selectedSpot.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleSendMessage(`Bagaimana analisis performa mendalam untuk titik [${selectedSpot.code}] ${selectedSpot.name}?`)}
                    className="shrink-0 px-2 py-0.5 bg-teal-600/30 hover:bg-teal-600/50 border border-teal-500/40 rounded text-[10px] text-teal-300 font-semibold transition-colors"
                  >
                    Tanyakan Titik Ini
                  </button>
                </div>
              )}

              {/* Chat Message Scrollable Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      {m.role === 'model' ? (
                        <>
                          <Bot className="w-3 h-3 text-teal-400" />
                          <span className="text-[10px] font-bold text-teal-400 font-mono">JabarOOH AI</span>
                        </>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 font-mono">Operator</span>
                      )}
                      <span className="text-[9px] text-slate-500">{m.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[90%] rounded-2xl p-3 shadow-md ${
                        m.role === 'user'
                          ? 'bg-gradient-to-r from-teal-700 to-teal-600 text-white rounded-tr-none text-xs leading-relaxed font-medium'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none text-xs leading-relaxed'
                      }`}
                    >
                      {m.role === 'user' ? (
                        <p className="whitespace-pre-wrap">{m.text}</p>
                      ) : (
                        <div className="space-y-1">{renderFormattedText(m.text)}</div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isLoading && (
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <Bot className="w-3 h-3 text-teal-400" />
                      <span className="text-[10px] font-bold text-teal-400 font-mono">JabarOOH AI</span>
                      <span className="text-[9px] text-slate-500">Menganalisis data...</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-3 shadow-md flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-xs text-slate-400 ml-2">Mengolah kepadatan trafik & demografi Jawa Barat...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts Pills */}
              <div className="px-3 pt-2 pb-1 border-t border-slate-800/80 bg-slate-950/70">
                <div className="text-[10px] text-slate-400 mb-1.5 font-medium flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>Pertanyaan Cepat Rekomendasi:</span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
                  {DEFAULT_PROMPTS.map((p, idx) => (
                    <button
                      key={idx}
                      disabled={isLoading}
                      onClick={() => handleSendMessage(p.prompt)}
                      className="shrink-0 px-2.5 py-1 bg-slate-900 hover:bg-teal-950/60 border border-slate-800 hover:border-teal-500/40 text-[10px] text-slate-300 hover:text-teal-300 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Bar */}
              <div className="p-3 bg-slate-900/90 border-t border-slate-800">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    placeholder="Tanyakan performa, tren komuter, atau saran lokasi baru..."
                    className="flex-1 bg-slate-950 border border-slate-700/80 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isLoading}
                    className="p-2.5 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 text-white disabled:text-slate-600 rounded-xl transition-all shadow-md flex items-center justify-center shrink-0"
                    title="Kirim Pertanyaan (Enter)"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                {/* Footer Sub-Note */}
                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/60 text-[9px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5 text-teal-400" />
                    <span>Terverifikasi Suherman Reklame</span>
                  </span>
                  <span className="font-mono text-slate-400">suherman.reklame2012@gmail.com</span>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: SARAN LOKASI BARU (INTERACTIVE SITE RECOMMENDATION CARDS) */}
          {!isMinimized && activeTab === 'site-recommendations' && (
            <div className="flex-1 overflow-y-auto flex flex-col bg-slate-950">
              {/* Filter Strip */}
              <div className="p-3 bg-slate-900/90 border-b border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    <span>Filter Koridor Strategis:</span>
                  </span>
                  <span className="text-[10px] text-teal-300 font-mono">
                    {siteRecommendations.length} Lokasi Teridentifikasi
                  </span>
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'all', label: 'Semua Koridor' },
                    { id: 'bandung', label: 'Bandung Raya' },
                    { id: 'tol_komuter', label: 'Jalur Tol & Arteri' },
                    { id: 'industri', label: 'Industri Karawang' },
                    { id: 'wisata', label: 'Destinasi Wisata' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setCorridorFilter(f.id)}
                      className={`px-2.5 py-1 text-[10px] font-medium rounded-lg whitespace-nowrap transition-colors ${
                        corridorFilter === f.id
                          ? 'bg-amber-400 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Site Recommendations List */}
              <div className="flex-1 p-3 space-y-3.5 overflow-y-auto">
                {isSitesLoading ? (
                  <div className="py-12 text-center space-y-2">
                    <Sparkles className="w-6 h-6 text-amber-400 animate-spin mx-auto" />
                    <p className="text-xs text-slate-400">Menghitung analisis spasial & demografi koridor...</p>
                  </div>
                ) : siteRecommendations.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Tidak ditemukan kandidat lokasi dengan filter yang dipilih.
                  </div>
                ) : (
                  siteRecommendations.map((cand) => (
                    <div 
                      key={cand.id}
                      className="p-3.5 bg-slate-900/90 border border-slate-800 hover:border-amber-400/50 rounded-xl space-y-3 transition-all shadow-md group"
                    >
                      {/* Top Title & Regency */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 font-mono">
                              REKOMENDASI AI
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{cand.regency}</span>
                          </div>
                          <h4 className="text-xs font-bold text-white mt-1 group-hover:text-amber-300 transition-colors">
                            {cand.candidateLocationName}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                            <span>{cand.roadName}</span>
                          </p>
                        </div>

                        {/* ROI Score Badge */}
                        <div className="text-right shrink-0">
                          <div className="px-2 py-1 bg-emerald-950/70 border border-emerald-500/40 rounded-lg text-center">
                            <span className="text-[9px] text-emerald-400 block font-mono">Skor Kelayakan</span>
                            <strong className="text-sm font-black text-emerald-300 font-mono">
                              {cand.projectedPerformance.roiFeasibilityScore}
                            </strong>
                            <span className="text-[8px] text-emerald-500">/100</span>
                          </div>
                        </div>
                      </div>

                      {/* 2x2 Key Metrics Pill Matrix */}
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        {/* Traffic Box */}
                        <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="flex items-center gap-1">
                              <Activity className="w-3 h-3 text-amber-400" />
                              <span>Kepadatan Trafik</span>
                            </span>
                            <span className={`px-1 rounded text-[8px] font-bold ${
                              cand.trafficMetrics.congestionLevel === 'Macet Total'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {cand.trafficMetrics.congestionLevel}
                            </span>
                          </div>
                          <div className="font-bold text-white font-mono">
                            {cand.trafficMetrics.avgVolumePerHour.toLocaleString('id-ID')} kend/jam
                          </div>
                          <div className="text-[9px] text-slate-400">
                            Dwell Time: <strong className="text-amber-300">{cand.trafficMetrics.estimatedDwellTimeSec}s</strong> (Kecepatan {cand.trafficMetrics.avgSpeedKmh} km/j)
                          </div>
                        </div>

                        {/* Demographics Box */}
                        <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-cyan-400" />
                              <span>Profil Audiens</span>
                            </span>
                            <span className="px-1 rounded text-[8px] font-bold bg-cyan-500/20 text-cyan-300">
                              {cand.demographicProfile.sesTier.split(' ')[0]}
                            </span>
                          </div>
                          <div className="font-bold text-white text-[10px] truncate">
                            {cand.demographicProfile.targetAgeGroup.split(' ')[0]}
                          </div>
                          <div className="text-[9px] text-slate-400 truncate">
                            {cand.demographicProfile.dominantPersona}
                          </div>
                        </div>
                      </div>

                      {/* Proposed Format & Financials */}
                      <div className="p-2 bg-teal-950/30 border border-teal-500/20 rounded-lg text-[10px] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-teal-400 font-semibold">Format Media Disarankan:</span>
                          <span className="font-bold text-white font-mono">
                            {cand.proposedMediaFormat.type} ({cand.proposedMediaFormat.dimensions.width}x{cand.proposedMediaFormat.dimensions.height}m)
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>Proyeksi Reach / VAC:</span>
                          <span className="font-mono text-white">
                            {(cand.projectedPerformance.estimatedDailyReach / 1000).toFixed(0)}k Reach · {(cand.projectedPerformance.estimatedVac / 1000).toFixed(0)}k VAC
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>Estimasi Sewa / CPM:</span>
                          <span className="font-mono text-emerald-400 font-bold">
                            Rp{(cand.projectedPerformance.suggestedMonthlyRateIdr / 1000000).toFixed(0)} Jt/bln (CPM Rp{cand.projectedPerformance.projectedCpmIdr.toLocaleString('id-ID')})
                          </span>
                        </div>
                      </div>

                      {/* Strategic Coverage Gap Rationale */}
                      <div className="text-[10px] text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-800/80 leading-relaxed">
                        <span className="text-amber-400 font-bold block mb-0.5">Analisis Kesenjangan Pasar (Coverage Gap):</span>
                        {cand.coverageGapAnalysis}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        {onOpenAddSpotWithPrefill && (
                          <button
                            onClick={() => handleAdoptCandidateLocation(cand)}
                            className="flex-1 py-1.5 px-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-[11px] font-bold rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5"
                            title="Buka form Tambah Titik dengan data kandidat ini yang sudah terisi otomatis"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Simulasi Tambah Titik</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setActiveTab('chat');
                            handleSendMessage(`Jelaskan analisis kelayakan mendalam dan strategi penawaran brand untuk calon titik baru "${cand.candidateLocationName}" di ${cand.roadName}, ${cand.regency}.`);
                          }}
                          className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[10px] font-medium rounded-lg transition-colors flex items-center gap-1"
                          title="Tanyakan detail kelayakan kepada AI"
                        >
                          <Bot className="w-3.5 h-3.5 text-teal-400" />
                          <span>Tanya AI</span>
                        </button>

                        {onViewCandidateLocationOnMap && (
                          <button
                            onClick={() => onViewCandidateLocationOnMap(cand.coordinates.lat, cand.coordinates.lng, cand.candidateLocationName)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                            title="Lihat koordinat titik di peta interaktif"
                          >
                            <MapPin className="w-3.5 h-3.5 text-rose-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Note */}
              <div className="p-2.5 bg-slate-900 border-t border-slate-800 text-[9px] text-slate-400 flex items-center justify-between">
                <span>Algoritma Spasial Kepadatan Trafik & Sensus Demografi</span>
                <span className="font-mono text-teal-400">JabarOOH v3.5</span>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
