'use client';

import { create } from 'zustand';

/**
 * Small UI-only store, kept separate from the 3D scene store so view state
 * (modals, menus) doesn't tangle with the render loop. Any component can open
 * the "about / tech" modal without prop-drilling.
 */
interface UIState {
  aboutOpen: boolean;
  openAbout: () => void;
  closeAbout: () => void;
  toggleAbout: () => void;
}

export const useUI = create<UIState>((set) => ({
  aboutOpen: false,
  openAbout: () => set({ aboutOpen: true }),
  closeAbout: () => set({ aboutOpen: false }),
  toggleAbout: () => set((s) => ({ aboutOpen: !s.aboutOpen })),
}));
