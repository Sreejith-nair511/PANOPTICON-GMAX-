'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AiPanel } from '@/components/ai/AiPanel';
import { GlobalSearch } from './GlobalSearch';
import { useUIStore } from '@/store/uiStore';
import { motion, AnimatePresence } from 'framer-motion';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { aiPanelOpen } = useUIStore();

  return (
    <div style={{ display:'flex', height:'100vh', width:'100vw', overflow:'hidden', background:'var(--bg-base)' }}>
      <GlobalSearch />
      <Sidebar />
      <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden', minWidth:0 }}>
        <Header />
        <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
          <main style={{ flex:1, overflowY:'auto', overflowX:'hidden' }}>
            {children}
          </main>
          <AnimatePresence>
            {aiPanelOpen && (
              <motion.div
                initial={{ width:0, opacity:0 }}
                animate={{ width:380, opacity:1 }}
                exit={{ width:0, opacity:0 }}
                transition={{ duration:0.22, ease:[0.4,0,0.2,1] }}
                style={{ flexShrink:0, overflow:'hidden', borderLeft:'1px solid var(--border)' }}
              >
                <AiPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
