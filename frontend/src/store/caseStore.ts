import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Case, Evidence, Suspect, TimelineEvent, ChatMessage } from '@/types';

interface CaseStore {
  cases: Case[];
  activeCaseId: string | null;
  activeCase: Case | null;
  evidence: Record<string, Evidence[]>;
  suspects: Record<string, Suspect[]>;
  timelines: Record<string, TimelineEvent[]>;
  chatMessages: Record<string, ChatMessage[]>;
  isLoading: boolean;
  error: string | null;

  setCases: (cases: Case[]) => void;
  addCase: (c: Case) => void;
  updateCase: (id: string, updates: Partial<Case>) => void;
  removeCase: (id: string) => void;
  setActiveCase: (caseId: string | null) => void;

  setEvidence: (caseId: string, evidence: Evidence[]) => void;
  addEvidence: (caseId: string, evidence: Evidence) => void;
  updateEvidence: (caseId: string, evidenceId: string, updates: Partial<Evidence>) => void;

  setSuspects: (caseId: string, suspects: Suspect[]) => void;
  addSuspect: (caseId: string, suspect: Suspect) => void;
  updateSuspect: (caseId: string, suspectId: string, updates: Partial<Suspect>) => void;

  setTimeline: (caseId: string, events: TimelineEvent[]) => void;
  addTimelineEvent: (caseId: string, event: TimelineEvent) => void;

  addChatMessage: (caseId: string, message: ChatMessage) => void;
  setChatMessages: (caseId: string, messages: ChatMessage[]) => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCaseStore = create<CaseStore>()(
  immer((set) => ({
    cases: [],
    activeCaseId: null,
    activeCase: null,
    evidence: {},
    suspects: {},
    timelines: {},
    chatMessages: {},
    isLoading: false,
    error: null,

    setCases: (cases) =>
      set((state) => {
        state.cases = cases;
      }),

    addCase: (c) =>
      set((state) => {
        state.cases.unshift(c);
      }),

    updateCase: (id, updates) =>
      set((state) => {
        const idx = state.cases.findIndex((c) => c.id === id);
        if (idx !== -1) {
          Object.assign(state.cases[idx], updates);
        }
        if (state.activeCase?.id === id) {
          Object.assign(state.activeCase, updates);
        }
      }),

    removeCase: (id) =>
      set((state) => {
        state.cases = state.cases.filter((c) => c.id !== id);
        if (state.activeCaseId === id) {
          state.activeCaseId = null;
          state.activeCase = null;
        }
      }),

    setActiveCase: (caseId) =>
      set((state) => {
        state.activeCaseId = caseId;
        state.activeCase = caseId
          ? (state.cases.find((c) => c.id === caseId) ?? null)
          : null;
      }),

    setEvidence: (caseId, evidence) =>
      set((state) => {
        state.evidence[caseId] = evidence;
      }),

    addEvidence: (caseId, evidence) =>
      set((state) => {
        if (!state.evidence[caseId]) state.evidence[caseId] = [];
        state.evidence[caseId].unshift(evidence);
      }),

    updateEvidence: (caseId, evidenceId, updates) =>
      set((state) => {
        const list = state.evidence[caseId];
        if (!list) return;
        const idx = list.findIndex((e) => e.id === evidenceId);
        if (idx !== -1) Object.assign(list[idx], updates);
      }),

    setSuspects: (caseId, suspects) =>
      set((state) => {
        state.suspects[caseId] = suspects;
      }),

    addSuspect: (caseId, suspect) =>
      set((state) => {
        if (!state.suspects[caseId]) state.suspects[caseId] = [];
        state.suspects[caseId].push(suspect);
      }),

    updateSuspect: (caseId, suspectId, updates) =>
      set((state) => {
        const list = state.suspects[caseId];
        if (!list) return;
        const idx = list.findIndex((s) => s.id === suspectId);
        if (idx !== -1) Object.assign(list[idx], updates);
      }),

    setTimeline: (caseId, events) =>
      set((state) => {
        state.timelines[caseId] = events;
      }),

    addTimelineEvent: (caseId, event) =>
      set((state) => {
        if (!state.timelines[caseId]) state.timelines[caseId] = [];
        state.timelines[caseId].push(event);
        state.timelines[caseId].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      }),

    addChatMessage: (caseId, message) =>
      set((state) => {
        if (!state.chatMessages[caseId]) state.chatMessages[caseId] = [];
        state.chatMessages[caseId].push(message);
      }),

    setChatMessages: (caseId, messages) =>
      set((state) => {
        state.chatMessages[caseId] = messages;
      }),

    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading;
      }),

    setError: (error) =>
      set((state) => {
        state.error = error;
      }),
  }))
);
