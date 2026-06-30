'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  BrainCircuit,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Command,
  Zap,
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { mockAlerts } from '@/lib/mockData';
import { cn, initials } from '@/lib/utils';

export function Header() {
  const { unreadCount, setGlobalSearchOpen, setAiPanelOpen, aiPanelOpen, markAllRead } = useUIStore();
  const { user, logout } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const recentAlerts = mockAlerts.slice(0, 5);

  return (
    <header className="h-14 border-b border-border bg-[#080d1a]/90 backdrop-blur-sm flex items-center justify-between px-4 gap-4 shrink-0 z-20">
      {/* Left: breadcrumb / title area */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-sm text-muted-foreground font-mono tracking-wider">
            PANOPTICON v1.0
          </span>
        </div>
        <div className="text-muted-foreground/30">|</div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-success" />
          <span className="text-xs text-success/80">Operational</span>
        </div>
      </div>

      {/* Center: global search */}
      <button
        onClick={() => setGlobalSearchOpen(true)}
        className="hidden md:flex items-center gap-3 px-4 py-2 rounded-lg bg-surface border border-border text-muted-foreground hover:border-accent/40 hover:text-foreground transition-all duration-150 max-w-sm w-full"
      >
        <Search className="w-4 h-4 shrink-0" />
        <span className="text-sm flex-1 text-left">Search cases, evidence, suspects...</span>
        <kbd className="flex items-center gap-1 text-2xs bg-surface-raised px-1.5 py-0.5 rounded border border-border">
          <Command className="w-2.5 h-2.5" />K
        </kbd>
      </button>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* AI Panel toggle */}
        <button
          onClick={() => setAiPanelOpen(!aiPanelOpen)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 border',
            aiPanelOpen
              ? 'bg-accent/10 border-accent/30 text-accent'
              : 'bg-transparent border-border text-muted-foreground hover:border-accent/30 hover:text-accent'
          )}
        >
          <BrainCircuit className="w-4 h-4" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-colors border border-transparent hover:border-border"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger animate-pulse" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 w-80 glass-strong rounded-xl border border-border shadow-panel overflow-hidden z-50"
              >
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <span className="text-sm font-semibold">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-accent hover:text-accent-glow transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {recentAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={cn(
                        'flex gap-3 p-4 border-b border-border/50 hover:bg-surface-raised/50 transition-colors cursor-pointer',
                        !alert.read && 'bg-accent/5'
                      )}
                    >
                      <div
                        className={cn('w-2 h-2 rounded-full mt-1 shrink-0', {
                          'bg-danger': alert.severity === 'critical',
                          'bg-warning': alert.severity === 'warning',
                          'bg-accent': alert.severity === 'info',
                        })}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{alert.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {alert.message}
                        </p>
                        <p className="text-2xs text-muted-foreground/60 mt-1">
                          {formatRelativeTime(alert.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3">
                  <button className="w-full text-center text-xs text-accent hover:text-accent-glow transition-colors py-1">
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-surface-raised transition-colors border border-transparent hover:border-border"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1565C0] to-[#00B4D8] flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {user ? initials(user.name) : 'AN'}
              </span>
            </div>
            <span className="hidden sm:block text-sm font-medium">
              {user?.name?.split(' ')[0] ?? 'Analyst'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 w-52 glass-strong rounded-xl border border-border shadow-panel overflow-hidden z-50"
              >
                <div className="p-4 border-b border-border">
                  <p className="text-sm font-semibold">{user?.name ?? 'Analyst'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email ?? 'analyst@panopticon.gov'}</p>
                  <span className="badge-info mt-2 inline-block capitalize">
                    {user?.role ?? 'investigator'}
                  </span>
                </div>
                <div className="p-2">
                  {[
                    { label: 'Profile', icon: User, href: '/settings/profile' },
                    { label: 'Settings', icon: Settings, href: '/settings' },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-colors text-left"
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    );
                  })}
                  <div className="my-1 border-t border-border" />
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-danger hover:bg-danger/10 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showNotifications || showUserMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </header>
  );
}
