import { useEffect, useRef } from 'react';
import { KEYBOARD_MAP } from './midiMap';
import { useUIStore } from '@/store/uiStore';

interface UseKeyboardProps {
  noteOn: (midi: number, velocity?: number) => void;
  noteOff: (midi: number) => void;
  enabled?: boolean;
}

export function useKeyboard({ noteOn, noteOff, enabled = true }: UseKeyboardProps) {
  const octave = useUIStore((s) => s.octave);
  const octaveUp = useUIStore((s) => s.octaveUp);
  const octaveDown = useUIStore((s) => s.octaveDown);
  const activeKeysRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;

      // Don't capture keys if typing inside input / textarea / select
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.tagName === 'SELECT'
      ) {
        return;
      }

      // Prevent key repeat triggering multiple noteOn
      if (e.repeat) return;

      const key = e.key.toLowerCase();

      // Octave switching hotkeys: Z (down), X (up)
      if (key === 'z') {
        e.preventDefault();
        octaveDown();
        return;
      }
      if (key === 'x') {
        e.preventDefault();
        octaveUp();
        return;
      }

      // Note keys
      if (key in KEYBOARD_MAP) {
        e.preventDefault();
        const semitoneOffset = KEYBOARD_MAP[key];
        const baseMidi = (octave + 1) * 12; // C4 = 60 when octave = 4
        const midi = baseMidi + semitoneOffset;

        activeKeysRef.current.set(key, midi);
        noteOn(midi, 0.85);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      const key = e.key.toLowerCase();
      if (activeKeysRef.current.has(key)) {
        const midi = activeKeysRef.current.get(key)!;
        activeKeysRef.current.delete(key);
        noteOff(midi);
      }
    };

    const handleBlur = () => {
      // Release all notes on window blur
      for (const midi of activeKeysRef.current.values()) {
        noteOff(midi);
      }
      activeKeysRef.current.clear();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      for (const midi of activeKeysRef.current.values()) {
        noteOff(midi);
      }
      activeKeysRef.current.clear();
    };
  }, [enabled, octave, octaveDown, octaveUp, noteOn, noteOff]);
}
