import { useState, useEffect, useCallback, useRef } from 'react';
import { PadBinding } from '@/types/synth';
import { getDefaultPads, midiToNoteName } from './midiMap';
import { useUIStore } from '@/store/uiStore';
import { getSynthEngine } from '@/hooks/useSynth';

const STORAGE_KEY = 'synth-pad-bindings';

export interface UsePadsOptions {
  enabled?: boolean;
  isDrumMode?: boolean;
  onPress?: (index: number) => void;
  onRelease?: (index: number) => void;
}

export function usePads(
  noteOn: (midi: number, velocity?: number) => void,
  noteOff: (midi: number) => void,
  optionsOrEnabled: boolean | UsePadsOptions = true
) {
  const options: UsePadsOptions =
    typeof optionsOrEnabled === 'boolean'
      ? { enabled: optionsOrEnabled }
      : optionsOrEnabled;

  const enabled = options.enabled ?? true;
  const isDrumMode = options.isDrumMode ?? false;

  const [pads, setPads] = useState<PadBinding[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return getDefaultPads(3);
  });

  const activePadIndices = useUIStore((s) => s.activePadIndices);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const noteOnRef = useRef(noteOn);
  noteOnRef.current = noteOn;

  const noteOffRef = useRef(noteOff);
  noteOffRef.current = noteOff;

  const isDrumModeRef = useRef(isDrumMode);
  isDrumModeRef.current = isDrumMode;

  const padsRef = useRef(pads);
  padsRef.current = pads;

  const activeKeysRef = useRef<Set<string>>(new Set());
  const minFlashTimersRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  // Save changes to localStorage
  const savePads = useCallback((newPads: PadBinding[]) => {
    setPads(newPads);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPads));
    } catch {}
  }, []);

  const triggerPad = useCallback((index: number, velocity = 0.9) => {
    const pad = padsRef.current[index];
    if (!pad) return;

    // Clear any pending release timer for this pad
    if (minFlashTimersRef.current.has(index)) {
      clearTimeout(minFlashTimersRef.current.get(index)!);
      minFlashTimersRef.current.delete(index);
    }

    useUIStore.getState().addActivePadIndex(index);

    if (optionsRef.current.onPress) {
      optionsRef.current.onPress(index);
    } else if (isDrumModeRef.current) {
      getSynthEngine().triggerDrumPad(index, velocity);
    } else {
      noteOnRef.current(pad.midi, velocity);
    }
  }, []);

  const releasePad = useCallback((index: number) => {
    const pad = padsRef.current[index];
    if (!pad) return;

    if (optionsRef.current.onRelease) {
      optionsRef.current.onRelease(index);
      useUIStore.getState().removeActivePadIndex(index);
    } else if (isDrumModeRef.current) {
      // In drum mode, retain visual illumination for at least 110ms for snappy tactile feel
      const timer = setTimeout(() => {
        useUIStore.getState().removeActivePadIndex(index);
        minFlashTimersRef.current.delete(index);
      }, 110);
      minFlashTimersRef.current.set(index, timer);
    } else {
      useUIStore.getState().removeActivePadIndex(index);
      noteOffRef.current(pad.midi);
    }
  }, []);

  // Keyboard Event Listeners for pad key shortcuts
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys if typing inside input / textarea / select
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.tagName === 'SELECT')
      ) {
        return;
      }

      if (e.repeat) return;

      const key = e.key.toLowerCase();
      const pad = padsRef.current.find((p) => p.key.toLowerCase() === key);
      if (!pad) return;

      e.preventDefault();
      e.stopPropagation();

      activeKeysRef.current.add(key);
      triggerPad(pad.index);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const pad = padsRef.current.find((p) => p.key.toLowerCase() === key);
      if (!pad) return;

      e.preventDefault();
      e.stopPropagation();

      activeKeysRef.current.delete(key);
      releasePad(pad.index);
    };

    const handleBlur = () => {
      for (const key of activeKeysRef.current) {
        const pad = padsRef.current.find((p) => p.key.toLowerCase() === key);
        if (pad) {
          releasePad(pad.index);
        }
      }
      activeKeysRef.current.clear();
      const currentIndices = useUIStore.getState().activePadIndices;
      if (currentIndices.length > 0) {
        useUIStore.getState().clearActivePadIndices();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('blur', handleBlur);

      for (const timer of minFlashTimersRef.current.values()) {
        clearTimeout(timer);
      }
      minFlashTimersRef.current.clear();
      activeKeysRef.current.clear();
      const currentIndices = useUIStore.getState().activePadIndices;
      if (currentIndices.length > 0) {
        useUIStore.getState().clearActivePadIndices();
      }
    };
  }, [enabled, triggerPad, releasePad]);

  const rebindPad = useCallback(
    (index: number, newMidi: number, newKey?: string) => {
      setPads((prevPads) => {
        const updated = prevPads.map((p) => {
          if (p.index === index) {
            return {
              ...p,
              midi: newMidi,
              noteName: midiToNoteName(newMidi),
              key: newKey !== undefined ? newKey.toLowerCase() : p.key,
            };
          }
          return p;
        });
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    },
    []
  );

  const resetPads = useCallback(
    (baseOctave = 3) => {
      const defaults = getDefaultPads(baseOctave);
      savePads(defaults);
    },
    [savePads]
  );

  return {
    pads,
    activePadIndices,
    triggerPad,
    releasePad,
    rebindPad,
    resetPads,
  };
}
