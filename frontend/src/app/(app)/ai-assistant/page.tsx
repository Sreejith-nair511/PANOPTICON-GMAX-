'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit,
  Send,
  Sparkles,
  Film,
  Users,
  Clock,
  Loader2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  FolderOpen,
  ChevronDown,
  Hash,
  Zap,
  MessageSquare,
  Plus,
  Search,
} from 'lucide-react';
import { mockChatMessages, mockCases } from '@/lib/mockData';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { ChatMessage } from '@/types';

const suggestedQueries = [
  { label: 'Who touched the backpack?', icon: Users },
  { label: 'Show suspect movements before the robbery', icon: Film },
  { label: 'When did the weapon first appear?', icon: Clock },
  { label: 'Cross-reference all suspects across cameras', icon: BrainCircuit },
  { label: 'Generate a forensic timeline', icon: Clock },
  { label: 'Identify all persons in Platform 4', icon: Users },
  { label: 'Reconstruct escape route', icon: Film },
  { label: 'Analyze behavioral patterns', icon: Sparkles },
];

const capabilities = [
  { icon: Film, label: 'Video Analysis', description: 'Frame-by-frame examination of footage' },
  { icon: Users, label: 'Person Re-ID', description: 'Cross-camera suspect tracking' },
  { icon: Clock, label: 'Timeline Build', description: 'Automated event reconstruction' },
  { icon: BrainCircuit, label: 'Pattern Analysis', description: 'Behavioral and movement patterns' },
  { icon: Hash, label: 'Object Detection', description: 'Weapons, vehicles, items' },
  { icon: Zap, label: 'Report Generation', description: 'AI-written forensic reports' },
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedCase, setSelectedCase] = useState(mockCases[0]);
  const [showCaseSelector, setShowCaseSelector] = useState(false);
  const [sessions] = useState([
    { id: 'sess-001', title: 'Robbery – Station Camera Analysis', time: '2h ago', messages: 4 },
    { id: 'sess-002', title: 'Suspect Alpha Movement Trace', time: '1d ago', messages: 7 },
    { id: 'sess-003', title: 'Port District Vehicle IDs', time: '3d ago', messages: 12 },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: generateResponse(text),
        timestamp: new Date().toISOString(),
        confidence: Math.floor(Math.random() * 20) + 76,
        processingTime: Math.floor(Math.random() * 1500) + 900,
        evidenceRefs: ['ev-001', 'ev-002'],
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 2000 + Math.random() * 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left sidebar: sessions */}
      <div className="w-64 shrink-0 border-r border-border flex flex-col bg-[#070c19]">
        <div className="p-4 border-b border-border">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent-glow transition-colors">
            <Plus className="w-4 h-4" />
            New Session
          </button>
        </div>

        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search sessions..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/40"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
          <p className="px-2 py-1 text-2xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
            Recent Sessions
          </p>
          {sessions.map((s) => (
            <button
              key={s.id}
              className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-surface-raised transition-colors group"
            >
              <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                <MessageSquare className="w-3.5 h-3.5 text-accent/70" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{s.title}</p>
                <p className="text-2xs text-muted-foreground">
                  {s.messages} messages · {s.time}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main chat */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-[#080d1a]/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-[#080d1a]" />
            </div>
            <div>
              <h1 className="text-sm font-semibold">AI Forensic Copilot</h1>
              <p className="text-xs text-muted-foreground">
                Powered by Gemini Pro · Context: {selectedCase.title}
              </p>
            </div>
          </div>

          {/* Case selector */}
          <div className="relative">
            <button
              onClick={() => setShowCaseSelector(!showCaseSelector)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border text-xs hover:border-accent/40 transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5 text-accent/70" />
              <span className="font-mono text-muted-foreground">{selectedCase.caseNumber}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
            <AnimatePresence>
              {showCaseSelector && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  className="absolute right-0 top-10 w-72 glass-strong rounded-xl border border-border shadow-panel overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-border">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Select Investigation Context
                    </p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {mockCases.filter(c => c.status === 'active').map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedCase(c);
                          setShowCaseSelector(false);
                        }}
                        className={cn(
                          'w-full flex items-start gap-3 p-3 text-left hover:bg-surface-raised transition-colors border-b border-border/50',
                          selectedCase.id === c.id && 'bg-accent/5'
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{c.title}</p>
                          <p className="text-2xs text-muted-foreground font-mono">{c.caseNumber}</p>
                        </div>
                        {selectedCase.id === c.id && (
                          <div className="w-2 h-2 rounded-full bg-accent mt-1 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {showCaseSelector && (
              <div className="fixed inset-0 z-40" onClick={() => setShowCaseSelector(false)} />
            )}
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {/* Empty state */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              {/* Hero */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent/20 to-primary/20 border border-accent/25 flex items-center justify-center mx-auto mb-5">
                  <Sparkles className="w-9 h-9 text-accent" />
                </div>
                <h2 className="text-xl font-bold mb-2">AI Forensic Intelligence</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Ask investigative questions in natural language. I have access to all processed
                  evidence, detected persons, tracked suspects, and reconstructed timelines.
                </p>
              </div>

              {/* Capabilities */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {capabilities.map((c) => {
                  const Icon = c.icon;
                  return (
                    <div
                      key={c.label}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface border border-border text-center"
                    >
                      <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Icon className="w-4.5 h-4.5 text-accent" />
                      </div>
                      <div>
                        <p className="text-xs font-medium">{c.label}</p>
                        <p className="text-2xs text-muted-foreground mt-0.5">{c.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Suggested queries */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">
                  Try asking
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {suggestedQueries.map((q) => {
                    const Icon = q.icon;
                    return (
                      <button
                        key={q.label}
                        onClick={() => {
                          setInput(q.label);
                          inputRef.current?.focus();
                        }}
                        className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm text-left text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-colors border border-border hover:border-accent/30 group"
                      >
                        <Icon className="w-4 h-4 text-accent/50 group-hover:text-accent transition-colors shrink-0" />
                        <span className="text-xs">{q.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <FullMessageBubble key={msg.id} message={msg} />
          ))}

          {/* Typing */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-4"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shrink-0">
                  <BrainCircuit className="w-4.5 h-4.5 text-white" />
                </div>
                <div className="flex items-center gap-2 px-5 py-3.5 rounded-2xl rounded-tl-sm bg-surface border border-border">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-accent"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.18 }}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground ml-1">
                    Analyzing {selectedCase.evidenceCount} evidence items...
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-5 border-t border-border bg-[#080d1a]/80 backdrop-blur-sm shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3 rounded-2xl bg-surface border border-border p-3 focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/20 transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask about ${selectedCase.title}...`}
                rows={1}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none leading-relaxed max-h-40 overflow-y-auto no-scrollbar"
                style={{ minHeight: '24px' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 shrink-0',
                  input.trim() && !isTyping
                    ? 'bg-accent text-accent-foreground hover:bg-accent-glow shadow-glow-sm'
                    : 'text-muted-foreground cursor-not-allowed'
                )}
              >
                {isTyping ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-2xs text-muted-foreground/40 text-center mt-2">
              AI may make mistakes. Verify critical information against source evidence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FullMessageBubble({ message: msg }: { message: ChatMessage }) {
  const isUser = msg.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end"
      >
        <div className="max-w-xl px-5 py-3.5 rounded-2xl rounded-tr-sm bg-accent/15 border border-accent/25 text-sm leading-relaxed">
          {msg.content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-4 max-w-3xl"
    >
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shrink-0 mt-0.5">
        <BrainCircuit className="w-4.5 h-4.5 text-white" />
      </div>
      <div className="flex-1 space-y-3">
        <div className="px-5 py-4 rounded-2xl rounded-tl-sm bg-surface border border-border text-sm leading-7">
          {msg.content.split('\n').map((line, i) => {
            const parts = line.split(/(\*\*[^*]+\*\*)/g);
            return (
              <p key={i} className={i > 0 ? 'mt-2' : ''}>
                {parts.map((part, j) =>
                  part.startsWith('**') && part.endsWith('**') ? (
                    <strong key={j} className="font-semibold text-foreground">
                      {part.slice(2, -2)}
                    </strong>
                  ) : (
                    <span key={j} className="text-muted-foreground">{part}</span>
                  )
                )}
              </p>
            );
          })}
        </div>

        {/* Refs */}
        {(msg.evidenceRefs?.length || msg.suspectRefs?.length) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xs text-muted-foreground/50">Sources:</span>
            {msg.evidenceRefs?.map((r) => (
              <span key={r} className="flex items-center gap-1 text-2xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                <Film className="w-2.5 h-2.5" /> {r}
              </span>
            ))}
            {msg.suspectRefs?.map((r) => (
              <span key={r} className="flex items-center gap-1 text-2xs px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20">
                <Users className="w-2.5 h-2.5" /> {r}
              </span>
            ))}
          </div>
        )}

        {/* Meta + actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {msg.confidence && (
              <span className="text-2xs text-success/70 font-medium">{msg.confidence}% confidence</span>
            )}
            {msg.processingTime && (
              <span className="text-2xs text-muted-foreground/50">{(msg.processingTime / 1000).toFixed(1)}s</span>
            )}
            <span className="text-2xs text-muted-foreground/40">{formatRelativeTime(msg.timestamp)}</span>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button onClick={handleCopy} className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground/40 hover:text-muted-foreground transition-colors" title="Copy">
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground/40 hover:text-success transition-colors">
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground/40 hover:text-danger transition-colors">
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
            <button className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground/40 hover:text-muted-foreground transition-colors">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function generateResponse(query: string): string {
  const lower = query.toLowerCase();
  if (lower.includes('backpack') || lower.includes('bag')) {
    return 'Based on frame-by-frame analysis of evidence **ev-001** (Station Camera 4):\n\n**Suspect Alpha** made contact with the victim\'s backpack at **14:32:28**, handling it for approximately 12 seconds.\n\nSuspect Beta remained 2.3 meters away in a lookout position during this entire interaction. No other individuals made contact with the backpack in the reviewed footage.\n\nConfidence rating: High (92%). Corroborated by both CAM-STN-004 and CAM-STN-002 angles.';
  }
  if (lower.includes('weapon') || lower.includes('gun') || lower.includes('firearm')) {
    return 'Weapon detection results from **YOLOv8** object detection:\n\n**First appearance:** 14:32:14 — Suspect Alpha reveals object consistent with a handgun from under jacket. Detection confidence: 89%.\n\n**Last appearance:** 14:33:01 — Object concealed again as suspects exit via north door.\n\nThe weapon was visible in **14 frames** across a 47-second window. No weapon was detected on Suspect Beta at any point.';
  }
  if (lower.includes('timeline') || lower.includes('reconstruct')) {
    return 'AI-reconstructed event timeline for **PAN-2026-0047**:\n\n**14:28:14** — Suspects enter south entrance (91% confidence)\n**14:29:02** — Stationary at ticketing area, suspected target selection\n**14:30:48** — Movement toward Platform 4 initiated\n**14:31:48** — Suspects arrive at Platform 4\n**14:32:14** — Robbery initiated. Weapon displayed.\n**14:32:28** — Victim\'s backpack taken\n**14:33:01** — Suspects flee via north exit\n**14:35:22** — Lost from camera coverage\n\nTotal incident duration: **4 minutes 47 seconds**';
  }
  return `I have analyzed the evidence for case **${mockCases[0].caseNumber}** in relation to your query.\n\nBased on processing ${mockCases[0].evidenceCount} evidence items with **YOLOv8**, **ByteTrack**, and **FastReID**, I found relevant information across 3 camera feeds.\n\nWould you like me to expand on any specific aspect — suspect movements, object interactions, or generate a formal forensic timeline report?`;
}
