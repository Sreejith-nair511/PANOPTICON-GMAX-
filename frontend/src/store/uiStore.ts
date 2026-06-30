import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { UIState, Alert, PanelLayout } from '@/types';

interface UIStore extends UIState {
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setActivePanelLayout: (layout: PanelLayout) => void;
  setSelectedCase: (caseId: string | null) => void;
  setSelectedEvidence: (evidenceId: string | null) => void;
  setGlobalSearchOpen: (open: boolean) => void;
  setAiPanelOpen: (open: boolean) => void;
  addNotification: (alert: Alert) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIStore>()(
  immer((set) => ({
    sidebarCollapsed: false,
    activePanelLayout: 'default',
    selectedCaseId: null,
    selectedEvidenceId: null,
    globalSearchOpen: false,
    aiPanelOpen: false,
    notifications: [],
    unreadCount: 0,

    setSidebarCollapsed: (collapsed) =>
      set((state) => {
        state.sidebarCollapsed = collapsed;
      }),

    toggleSidebar: () =>
      set((state) => {
        state.sidebarCollapsed = !state.sidebarCollapsed;
      }),

    setActivePanelLayout: (layout) =>
      set((state) => {
        state.activePanelLayout = layout;
      }),

    setSelectedCase: (caseId) =>
      set((state) => {
        state.selectedCaseId = caseId;
      }),

    setSelectedEvidence: (evidenceId) =>
      set((state) => {
        state.selectedEvidenceId = evidenceId;
      }),

    setGlobalSearchOpen: (open) =>
      set((state) => {
        state.globalSearchOpen = open;
      }),

    setAiPanelOpen: (open) =>
      set((state) => {
        state.aiPanelOpen = open;
      }),

    addNotification: (alert) =>
      set((state) => {
        state.notifications.unshift(alert);
        if (!alert.read) {
          state.unreadCount += 1;
        }
        // Keep max 100 notifications
        if (state.notifications.length > 100) {
          state.notifications = state.notifications.slice(0, 100);
        }
      }),

    markNotificationRead: (id) =>
      set((state) => {
        const notification = state.notifications.find((n) => n.id === id);
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }),

    markAllRead: () =>
      set((state) => {
        state.notifications.forEach((n) => (n.read = true));
        state.unreadCount = 0;
      }),

    clearNotifications: () =>
      set((state) => {
        state.notifications = [];
        state.unreadCount = 0;
      }),
  }))
);
