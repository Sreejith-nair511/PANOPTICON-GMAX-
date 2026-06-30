'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderOpen,
  Film,
  Search,
  BrainCircuit,
  FileText,
  Settings,
  ChevronLeft,
  Shield,
  Activity,
  Bell,
  Users,
  Map,
  Eye,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { initials } from '@/lib/utils';

const navigation = [
  {
    label: 'Operations',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/cases', label: 'Case Management', icon: FolderOpen },
      { href: '/evidence', label: 'Evidence', icon: Film },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { href: '/investigation', label: 'Investigation', icon: Search },
      { href: '/ai-assistant', label: 'AI Copilot', icon: BrainCircuit, badge: 'AI' },
      { href: '/tracking', label: 'Live Tracking', icon: Eye },
      { href: '/reports', label: 'Reports', icon: FileText },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, unreadCount } = useUIStore();
  const { user } = useAuthStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="relative flex flex-col h-full bg-[#080d1a] border-r border-border z-30 overflow-hidden shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-border shrink-0">
        <motion.div
          className="flex items-center gap-3 overflow-hidden"
          animate={{ opacity: 1 }}
        >
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00B4D8] to-[#1565C0] flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#00B4D8] to-[#1565C0] opacity-30 blur-md" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <span className="text-sm font-bold tracking-wider text-gradient-cyan whitespace-nowrap font-display">
                  PANOPTICON
                </span>
                <div className="text-2xs text-muted-foreground tracking-widest">
                  FORENSIC INTELLIGENCE
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 no-scrollbar">
        {navigation.map((group) => (
          <div key={group.label} className="mb-6">
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-4 mb-2"
                >
                  <span className="text-2xs font-semibold tracking-widest text-muted-foreground/60 uppercase">
                    {group.label}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={cn(
                    'nav-item mx-2 mb-0.5',
                    isActive && 'nav-item-active',
                    sidebarCollapsed && 'justify-center px-0'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0 transition-colors',
                      isActive ? 'text-accent' : 'text-muted-foreground'
                    )}
                  />
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.12 }}
                        className="flex items-center justify-between flex-1 overflow-hidden"
                      >
                        <span className="whitespace-nowrap text-sm">{item.label}</span>
                        {'badge' in item && item.badge && (
                          <span className="badge-info text-2xs ml-2">{item.badge}</span>
                        )}
                        {item.href === '/ai-assistant' && unreadCount > 0 && (
                          <span className="ml-auto badge-critical text-2xs">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* System status */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-3 mb-3 p-3 rounded-lg bg-success/5 border border-success/20"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="status-dot-active" />
              <span className="text-2xs font-semibold text-success/80 tracking-wider uppercase">
                System Operational
              </span>
            </div>
            <div className="space-y-1">
              {[
                { label: 'AI Pipeline', status: 'ok' },
                { label: 'Processing Queue', value: '7' },
                { label: 'DB Latency', value: '2ms' },
              ].map((s) => (
                <div key={s.label} className="flex justify-between">
                  <span className="text-2xs text-muted-foreground">{s.label}</span>
                  <span className="text-2xs text-success/70 font-mono">
                    {s.value ?? '●'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User footer */}
      <div className="border-t border-border p-3 shrink-0">
        <div className={cn('flex items-center gap-3', sidebarCollapsed && 'justify-center')}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1565C0] to-[#00B4D8] flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">
              {user ? initials(user.name) : 'AN'}
            </span>
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="flex-1 overflow-hidden"
              >
                <div className="text-sm font-medium text-foreground whitespace-nowrap truncate">
                  {user?.name ?? 'Analyst'}
                </div>
                <div className="text-2xs text-muted-foreground whitespace-nowrap truncate">
                  {user?.role ?? 'investigator'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-surface-raised border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-accent/40 transition-colors z-50"
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <motion.div
          animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronLeft className="w-3 h-3" />
        </motion.div>
      </button>
    </motion.aside>
  );
}
