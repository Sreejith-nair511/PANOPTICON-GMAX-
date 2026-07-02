'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Search, FolderOpen, Film, Users, FileText, Clock, ArrowRight, X } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { mockCases, mockEvidence, mockSuspects } from '@/lib/mockData';
import { cn, formatRelativeTime } from '@/lib/utils';

type ResultType = 'case' | 'evidence' | 'suspect' | 'report';
interface SearchResult {
  id: string;
  type: ResultType;
  title: string;
  subtitle: string;
  href: string;
  time?: string;
}

const TYPE_CONFIG: Record<ResultType, { icon: React.ElementType; color: string; label: string }> = {
  case:     { icon: FolderOpen, color: 'text-accent',   label: 'Case'     },
  evidence: { icon: Film,       color: 'text-primary',  label: 'Evidence' },
  suspect:  { icon: Users,      color: 'text-warning',  label: 'Suspect'  },
  report:   { icon: FileText,   color: 'text-success',  label: 'Report'   },
};

function buildIndex(): SearchResult[] {
  const results: SearchResult[] = [];
  try {
    (mockCases ?? []).forEach(c => results.push({
      id: c.id, type: 'case',
      title: c.title, subtitle: `${c.caseNumber} · ${c.location}`,
      href: `/cases/${c.id}`, time: c.updatedAt,
    }));
    (mockEvidence ?? []).forEach(e => results.push({
      id: e.id, type: 'evidence',
      title: e.originalName, subtitle: `${e.type} · ${e.caseId}`,
      href: `/evidence`, time: e.uploadedAt,
    }));
    (mockSuspects ?? []).forEach(s => results.push({
      id: s.id, type: 'suspect',
      title: s.label, subtitle: (s.description || '').slice(0, 60),
      href: `/cases/${s.caseId}`,
    }));
  } catch { /* silent */ }
  return results;
}

// Build lazily on first use instead of at module init
let _cachedIndex: SearchResult[] | null = null;
function getAllResults(): SearchResult[] {
  if (!_cachedIndex) _cachedIndex = buildIndex();
  return _cachedIndex;
}

export function GlobalSearch() {
  const { globalSearchOpen, setGlobalSearchOpen } = useUIStore();
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.trim().length > 1
    ? getAllResults().filter(r =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.subtitle.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10)
    : getAllResults().slice(0, 8);

  useEffect(() => {
    if (globalSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setQuery('');
      setSelectedIdx(0);
    }
  }, [globalSearchOpen]);

  // Cmd+K to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setGlobalSearchOpen(true);
      }
      if (e.key === 'Escape') setGlobalSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setGlobalSearchOpen]);

  const navigate = useCallback((href: string) => {
    router.push(href);
    setGlobalSearchOpen(false);
  }, [router, setGlobalSearchOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && results[selectedIdx]) navigate(results[selectedIdx].href);
  };

  return (
    <AnimatePresence>
      {globalSearchOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setGlobalSearchOpen(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -16 }}
            transition={{ duration: 0.15 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4"
          >
            <div className="glass-strong rounded-2xl border border-border shadow-panel overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
                <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => { setQuery(e.target.value); setSelectedIdx(0); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search cases, evidence, suspects, reports..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <kbd className="text-2xs bg-surface border border-border px-1.5 py-0.5 rounded text-muted-foreground">ESC</kbd>
              </div>

              {/* Results */}
              <div className="max-h-[420px] overflow-y-auto no-scrollbar py-2">
                {results.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No results for "{query}"</p>
                  </div>
                ) : (
                  <>
                    {/* Group by type */}
                    {(['case','evidence','suspect','report'] as ResultType[]).map(type => {
                      const group = results.filter(r => r.type === type);
                      if (!group.length) return null;
                      const config = TYPE_CONFIG[type];
                      const Icon = config.icon;
                      return (
                        <div key={type} className="mb-2">
                          <p className="px-5 py-1.5 text-2xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
                            {config.label}s
                          </p>
                          {group.map((result, idx) => {
                            const globalIdx = results.indexOf(result);
                            return (
                              <button
                                key={result.id}
                                onClick={() => navigate(result.href)}
                                onMouseEnter={() => setSelectedIdx(globalIdx)}
                                className={cn(
                                  'w-full flex items-center gap-4 px-5 py-3 text-left transition-colors',
                                  globalIdx === selectedIdx ? 'bg-accent/10' : 'hover:bg-surface-raised/50'
                                )}
                              >
                                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', globalIdx === selectedIdx ? 'bg-accent/20' : 'bg-surface')}>
                                  <Icon className={cn('w-4 h-4', config.color)} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
                                  <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                                </div>
                                {result.time && (
                                  <span className="text-2xs text-muted-foreground/50 shrink-0">{formatRelativeTime(result.time)}</span>
                                )}
                                <ArrowRight className={cn('w-4 h-4 shrink-0 transition-opacity', globalIdx === selectedIdx ? 'opacity-100 text-accent' : 'opacity-0')} />
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-2.5 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-3 text-2xs text-muted-foreground/50">
                  <span className="flex items-center gap-1"><kbd className="bg-surface border border-border px-1 rounded">↑↓</kbd> navigate</span>
                  <span className="flex items-center gap-1"><kbd className="bg-surface border border-border px-1 rounded">↵</kbd> open</span>
                </div>
                <span className="text-2xs text-muted-foreground/50">{results.length} results</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
