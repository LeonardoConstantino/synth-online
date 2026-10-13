import { useEffect, useRef, useCallback } from 'react';
import { SynthEngine } from '@/synth/SynthEngine';
import { useSynthStore } from '@/store/synthStore';
import { useUIStore } from '@/store/uiStore';
import { startAudioContext, isAudioReady } from '@/audio/context';

let globalEngineInstance: SynthEngine | null = null;

export function getSynthEngine(): SynthEngine {
  if (!globalEngineInstance) {
    const initialParams = useSynthStore.getState().params;
    globalEngineInstance = new SynthEngine(initialParams);
  }
  return globalEngineInstance;
}

export function useSynth() {
  const engineRef = useRef<SynthEngine>(getSynthEngine());
  const addActiveNote = useUIStore((s) => s.addActiveNote);
  const removeActiveNote = useUIStore((s) => s.removeActiveNote);
  const clearActiveNotes = useUIStore((s) => s.clearActiveNotes);
  const setAudioStarted = useUIStore((s) => s.setAudioStarted);

  // Subscribe with selector to avoid unnecessary full re-renders
  useEffect(() => {
    const unsubscribe = useSynthStore.subscribe(
      (state) => state.params,
      (params) => {
        engineRef.current.updateParams(params);
      }
    );
    return () => unsubscribe();
  }, []);

  const ensureAudio = useCallback(async () => {
    if (!isAudioReady()) {
      const ready = await startAudioContext();
      if (ready) {
        setAudioStarted(true);
      }
      return ready;
    }
    return true;
  }, [setAudioStarted]);

  const noteOn = useCallback(
    async (midi: number, velocity = 0.8) => {
      await ensureAudio();
      addActiveNote(midi);
      engineRef.current.noteOn(midi, velocity);
    },
    [ensureAudio, addActiveNote]
  );

  const noteOff = useCallback(
    (midi: number) => {
      removeActiveNote(midi);
      engineRef.current.noteOff(midi);
    },
    [removeActiveNote]
  );

  const allNotesOff = useCallback(() => {
    clearActiveNotes();
    engineRef.current.allNotesOff();
  }, [clearActiveNotes]);

  return {
    engine: engineRef.current,
    noteOn,
    noteOff,
    allNotesOff,
    ensureAudio,
  };
}
