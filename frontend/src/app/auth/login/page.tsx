'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Shield, Lock, User, AlertCircle, Zap, Radio } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const CLASSIFIED_CASES = [
  { id: 'PAN-1888-0001', title: 'Jack the Ripper', location: 'Whitechapel, London' },
  { id: 'PAN-1971-0001', title: 'D.B. Cooper', location: 'Pacific Northwest, USA' },
  { id: 'PAN-1969-0001', title: 'Zodiac Killer', location: 'San Francisco Bay Area' },
  { id: 'PAN-1996-0012', title: 'Tupac Shakur', location: 'Las Vegas, NV' },
  { id: 'PAN-2026-0047', title: 'Central Station Robbery', location: 'Platform 4' },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, setLoading, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [caseIndex, setCaseIndex] = useState(0);

  // Cycle through classified cases in background
  useEffect(() => {
    const t = setInterval(() => setCaseIndex(i => (i + 1) % CLASSIFIED_CASES.length), 3000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Credentials required.'); return; }
    setLoading(true);
    // Accept demo creds locally
    await new Promise(r => setTimeout(r, 1000));
    login(
      { id: 'user-001', email, name: 'Det. Sarah Kim', role: 'investigator', badge: 'DET-4821', department: 'Homicide Division', createdAt: '2026-01-01T00:00:00Z', lastActive: new Date().toISOString() },
      'demo-jwt-' + Date.now()
    );
    router.push('/dashboard');
  };

  const currentCase = CLASSIFIED_CASES[caseIndex];

  return (
    <div className="min-h-screen bg-[#030509] flex overflow-hidden relative">
      {/* ── Left: Cinematic panel ── */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e] via-[#05080f] to-[#020305]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse 60% 80% at 20% 50%, rgba(0,180,216,0.06) 0%, transparent 60%)' }} />
        {/* Grid */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(0,180,216,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,216,0.08) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

        {/* Top: logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-glow-md">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-widest text-gradient-cyan">PANOPTICON</h1>
              <p className="text-2xs text-muted-foreground tracking-widest">FORENSIC INTELLIGENCE PLATFORM</p>
            </div>
          </div>
        </motion.div>

        {/* Center: rotating case showcase */}
        <div className="relative z-10 flex-1 flex flex-col items-start justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <p className="text-2xs font-mono text-accent/60 tracking-widest uppercase mb-6 flex items-center gap-2">
              <Radio className="w-3 h-3 animate-pulse" /> Active Case Database
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div key={caseIndex}
              initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
              transition={{ duration: 0.5 }}
              className="relative z-10"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="text-2xs font-mono px-2 py-0.5 rounded border border-danger/30 bg-danger/8 text-danger/80">
                  CLASSIFIED
                </span>
                <span className="text-2xs font-mono text-muted-foreground/50">{currentCase.id}</span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight text-foreground mb-2">{currentCase.title}</h2>
              <p className="text-base text-muted-foreground">{currentCase.location}</p>
            </motion.div>
          </AnimatePresence>

          {/* Case dots */}
          <div className="flex items-center gap-2 mt-8">
            {CLASSIFIED_CASES.map((_, i) => (
              <button key={i} onClick={() => setCaseIndex(i)}
                className={cn('rounded-full transition-all duration-300', i === caseIndex ? 'w-6 h-1.5 bg-accent' : 'w-1.5 h-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60')} />
            ))}
          </div>

          {/* Feature list */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-12 space-y-3">
            {[
              { icon: '🧠', label: 'AI-powered cross-camera suspect tracking' },
              { icon: '📁', label: 'Cold case reconstruction with historical data' },
              { icon: '🗺️', label: '3D crime scene reconstruction' },
              { icon: '📄', label: 'One-click downloadable forensic reports' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + i * 0.1 }}
                className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="text-base">{f.icon}</span>
                {f.label}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="relative z-10">
          <p className="text-2xs text-muted-foreground/40 font-mono">
            RESTRICTED · Law Enforcement Use Only · PANOPTICON v1.0
          </p>
        </motion.div>
      </div>

      {/* ── Right: Login form ── */}
      <div className="w-full lg:w-[440px] shrink-0 flex flex-col items-center justify-center p-8 relative">
        <div className="absolute inset-0 bg-[#04060f] border-l border-border/30" />

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-sm relative z-10">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-widest text-gradient-cyan">PANOPTICON</h1>
              <p className="text-2xs text-muted-foreground">FORENSIC INTELLIGENCE</p>
            </div>
          </div>

          <h2 className="text-xl font-bold mb-1">Secure Access</h2>
          <p className="text-sm text-muted-foreground mb-8">Enter your law enforcement credentials to proceed.</p>

          {error && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-lg bg-danger/8 border border-danger/20 mb-5">
              <AlertCircle className="w-4 h-4 text-danger shrink-0" />
              <p className="text-xs text-danger">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Badge Email</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="officer@department.gov" autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/10 transition-all" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••" autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/10 transition-all" />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className={cn('w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2',
                isLoading ? 'bg-accent/40 text-white/40 cursor-not-allowed' : 'bg-accent text-accent-foreground hover:bg-accent-glow shadow-glow-sm hover:shadow-glow-md')}>
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Authenticating...</>
              ) : (
                <><Shield className="w-4 h-4" />Access Platform</>
              )}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-border/50">
            <button onClick={() => { setEmail('analyst@panopticon.gov'); setPassword('demo1234'); }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm text-muted-foreground border border-border/60 hover:border-accent/30 hover:text-foreground hover:bg-surface/50 transition-all">
              <Zap className="w-4 h-4 text-accent" />
              Quick Demo Access
            </button>
            <p className="text-center text-2xs text-muted-foreground/40 mt-3">
              demo: analyst@panopticon.gov / demo1234
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
