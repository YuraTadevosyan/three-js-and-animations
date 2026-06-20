'use client';

import { create } from 'zustand';

export const SECTIONS = ['hero', 'about', 'projects', 'skills', 'contact'] as const;
export type SectionId = (typeof SECTIONS)[number];

interface SceneState {
  /** Section currently in view — the camera rig lerps toward its waypoint. */
  active: SectionId;
  /** Index form of `active`, handy for camera waypoint lookups. */
  activeIndex: number;
  /** Whole-page scroll progress, 0 → 1. Drives parallax + grid speed. */
  progress: number;
  /** Normalised pointer position, -1 → 1 on each axis, smoothed per frame. */
  pointer: { x: number; y: number };
  /** Honour prefers-reduced-motion: skip heavy intro/parallax work. */
  reducedMotion: boolean;
  /** Set true once the WebGL canvas has rendered its first frame. */
  ready: boolean;

  setActive: (id: SectionId) => void;
  setProgress: (p: number) => void;
  setPointer: (x: number, y: number) => void;
  setReducedMotion: (v: boolean) => void;
  setReady: (v: boolean) => void;
}

export const useScene = create<SceneState>((set) => ({
  active: 'hero',
  activeIndex: 0,
  progress: 0,
  pointer: { x: 0, y: 0 },
  reducedMotion: false,
  ready: false,

  setActive: (id) =>
    set({ active: id, activeIndex: Math.max(0, SECTIONS.indexOf(id)) }),
  setProgress: (p) => set({ progress: p }),
  setPointer: (x, y) => set({ pointer: { x, y } }),
  setReducedMotion: (v) => set({ reducedMotion: v }),
  setReady: (v) => set({ ready: v }),
}));
