import { create } from 'zustand';
import { UIMode } from '@/types/synth';

interface UIStoreState {
  mode: UIMode;
  octave: number;
  activeNotes: number[];
  activePadIndex: number | null;
  activePadIndices: number[];
  activeInputTab: 'keyboard' | 'pads' | 'both';
  isAudioStarted: boolean;
  isPresetDrawerOpen: boolean;
  selectedCategory: string;

  toggleMode: () => void;
  setMode: (mode: UIMode) => void;
  setOctave: (octave: number) => void;
  octaveUp: () => void;
  octaveDown: () => void;
  addActiveNote: (midi: number) => void;
  removeActiveNote: (midi: number) => void;
  clearActiveNotes: () => void;
  setActivePadIndex: (index: number | null) => void;
  addActivePadIndex: (index: number) => void;
  removeActivePadIndex: (index: number) => void;
  clearActivePadIndices: () => void;
  setActiveInputTab: (tab: 'keyboard' | 'pads' | 'both') => void;
  setAudioStarted: (started: boolean) => void;
  setPresetDrawerOpen: (open: boolean) => void;
  setSelectedCategory: (category: string) => void;
}

const getStoredMode = (): UIMode => {
  try {
    const saved = localStorage.getItem('synth-ui-mode');
    if (saved === 'expert' || saved === 'simple') return saved;
  } catch {}
  return 'simple'; // Default to friendly simple mode as specified
};

const getStoredOctave = (): number => {
  try {
    const saved = localStorage.getItem('synth-octave');
    if (saved) {
      const val = parseInt(saved, 10);
      if (val >= 1 && val <= 7) return val;
    }
  } catch {}
  return 4;
};

export const useUIStore = create<UIStoreState>((set) => ({
  mode: getStoredMode(),
  octave: getStoredOctave(),
  activeNotes: [],
  activePadIndex: null,
  activePadIndices: [],
  activeInputTab: 'keyboard',
  isAudioStarted: false,
  isPresetDrawerOpen: false,
  selectedCategory: 'all',

  toggleMode: () =>
    set((state) => {
      const nextMode: UIMode = state.mode === 'simple' ? 'expert' : 'simple';
      try {
        localStorage.setItem('synth-ui-mode', nextMode);
      } catch {}
      return { mode: nextMode };
    }),

  setMode: (mode) =>
    set(() => {
      try {
        localStorage.setItem('synth-ui-mode', mode);
      } catch {}
      return { mode };
    }),

  setOctave: (octave) =>
    set(() => {
      const clamped = Math.max(1, Math.min(7, octave));
      try {
        localStorage.setItem('synth-octave', String(clamped));
      } catch {}
      return { octave: clamped };
    }),

  octaveUp: () =>
    set((state) => {
      const next = Math.min(7, state.octave + 1);
      try {
        localStorage.setItem('synth-octave', String(next));
      } catch {}
      return { octave: next };
    }),

  octaveDown: () =>
    set((state) => {
      const next = Math.max(1, state.octave - 1);
      try {
        localStorage.setItem('synth-octave', String(next));
      } catch {}
      return { octave: next };
    }),

  addActiveNote: (midi) =>
    set((state) => {
      if (state.activeNotes.includes(midi)) return state;
      return { activeNotes: [...state.activeNotes, midi] };
    }),

  removeActiveNote: (midi) =>
    set((state) => {
      if (!state.activeNotes.includes(midi)) return state;
      return { activeNotes: state.activeNotes.filter((n) => n !== midi) };
    }),

  clearActiveNotes: () =>
    set((state) => {
      if (state.activeNotes.length === 0) return state;
      return { activeNotes: [] };
    }),

  setActivePadIndex: (index) =>
    set((state) => {
      if (state.activePadIndex === index) return state;
      return { activePadIndex: index };
    }),

  addActivePadIndex: (index) =>
    set((state) => {
      if (state.activePadIndices.includes(index) && state.activePadIndex === index) {
        return state;
      }
      return {
        activePadIndices: state.activePadIndices.includes(index)
          ? state.activePadIndices
          : [...state.activePadIndices, index],
        activePadIndex: index,
      };
    }),

  removeActivePadIndex: (index) =>
    set((state) => {
      if (!state.activePadIndices.includes(index)) {
        return state;
      }
      const next = state.activePadIndices.filter((i) => i !== index);
      return {
        activePadIndices: next,
        activePadIndex: next.length > 0 ? next[next.length - 1] : null,
      };
    }),

  clearActivePadIndices: () =>
    set((state) => {
      if (state.activePadIndices.length === 0 && state.activePadIndex === null) {
        return state;
      }
      return {
        activePadIndices: [],
        activePadIndex: null,
      };
    }),

  setActiveInputTab: (tab) =>
    set((state) => {
      if (state.activeInputTab === tab) return state;
      return { activeInputTab: tab };
    }),

  setAudioStarted: (started) =>
    set(() => ({
      isAudioStarted: started,
    })),

  setPresetDrawerOpen: (open) =>
    set(() => ({
      isPresetDrawerOpen: open,
    })),

  setSelectedCategory: (category) =>
    set(() => ({
      selectedCategory: category,
    })),
}));
