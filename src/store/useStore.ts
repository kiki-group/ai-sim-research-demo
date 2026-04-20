import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ActionRun, Group, Report } from "../lib/types";

/** Model is fixed for the demo; switch here to change everywhere. */
export const GEMINI_MODEL = "gemini-3-flash-preview";

type State = {
  apiKey: string | null;
  activeGroupId: string | null;
  groups: Record<string, Group>;
  reports: Record<string, Report>;
  actionRuns: Record<string, ActionRun>;
};

type Actions = {
  setApiKey: (k: string | null) => void;
  setActiveGroup: (id: string | null) => void;
  upsertGroup: (g: Group) => void;
  deleteGroup: (id: string) => void;
  addReport: (r: Report) => void;
  deleteReport: (id: string) => void;
  addActionRun: (r: ActionRun) => void;
  clearAll: () => void;
};

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      apiKey: null,
      activeGroupId: null,
      groups: {},
      reports: {},
      actionRuns: {},

      setApiKey: (k) => set({ apiKey: k }),
      setActiveGroup: (id) => set({ activeGroupId: id }),
      upsertGroup: (g) =>
        set((s) => ({
          groups: { ...s.groups, [g.id]: g },
          activeGroupId: s.activeGroupId ?? g.id,
        })),
      deleteGroup: (id) =>
        set((s) => {
          const { [id]: _, ...rest } = s.groups;
          const activeGroupId =
            s.activeGroupId === id
              ? Object.keys(rest)[0] ?? null
              : s.activeGroupId;
          return { groups: rest, activeGroupId };
        }),
      addReport: (r) =>
        set((s) => ({ reports: { ...s.reports, [r.id]: r } })),
      deleteReport: (id) =>
        set((s) => {
          const { [id]: _, ...rest } = s.reports;
          return { reports: rest };
        }),
      addActionRun: (r) =>
        set((s) => ({ actionRuns: { ...s.actionRuns, [r.id]: r } })),
      clearAll: () =>
        set({
          apiKey: null,
          activeGroupId: null,
          groups: {},
          reports: {},
          actionRuns: {},
        }),
    }),
    {
      name: "cohort.demo.v1",
      version: 1,
    }
  )
);

export const useActiveGroup = () => {
  const { activeGroupId, groups } = useStore();
  return activeGroupId ? groups[activeGroupId] ?? null : null;
};
