import React, { useRef, useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { KEYBOARD_MAP, isBlackKey, midiToNoteName } from '@/input/midiMap';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface KeyboardProps {
  noteOn: (midi: number, velocity?: number) => void;
  noteOff: (midi: number) => void;
}

// Invert KEYBOARD_MAP for display hints
const REVERSE_KEY_HINTS: Record<number, string> = {};
for (const [key, offset] of Object.entries(KEYBOARD_MAP)) {
  REVERSE_KEY_HINTS[offset] = key.toUpperCase();
}

export const Keyboard: React.FC<KeyboardProps> = ({ noteOn, noteOff }) => {
  const octave = useUIStore((s) => s.octave);
  const octaveUp = useUIStore((s) => s.octaveUp);
  const octaveDown = useUIStore((s) => s.octaveDown);
  const activeNotes = useUIStore((s) => s.activeNotes);

  const isMouseDownRef = useRef(false);
  const activePointerNotesRef = useRef<Map<number, number>>(new Map()); // pointerId -> midi

  const baseMidi = (octave + 1) * 12; // C4 = 60
  const totalNotes = 25; // 2 octaves + 1 (C to C)

  const handlePointerDown = (midi: number, e: React.PointerEvent) => {
    e.preventDefault();
    isMouseDownRef.current = true;
    activePointerNotesRef.current.set(e.pointerId, midi);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    noteOn(midi, 0.85);
  };

  const handlePointerEnter = (midi: number, e: React.PointerEvent) => {
    if (isMouseDownRef.current && !activeNotes.includes(midi)) {
      noteOn(midi, 0.8);
    }
  };

  const handlePointerLeave = (midi: number, e: React.PointerEvent) => {
    if (isMouseDownRef.current && activeNotes.includes(midi)) {
      noteOff(midi);
    }
  };

  const handlePointerUp = (midi: number, e: React.PointerEvent) => {
    isMouseDownRef.current = false;
    activePointerNotesRef.current.delete(e.pointerId);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    noteOff(midi);
  };

  // Generate keys array
  const keys: Array<{ midi: number; isBlack: boolean; indexInScale: number; keyHint: string | undefined }> = [];
  for (let i = 0; i < totalNotes; i++) {
    const midi = baseMidi + i;
    const isBlack = isBlackKey(midi);
    const keyHint = REVERSE_KEY_HINTS[i];
    keys.push({ midi, isBlack, indexInScale: i, keyHint });
  }

  // Filter white keys to structure the layout
  const whiteKeys = keys.filter((k) => !k.isBlack);

  return (
    <div className="flex flex-col gap-2 w-full max-w-5xl mx-auto select-none">
      {/* Top bar with Octave shift & status */}
      <div className="flex items-center justify-between px-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#12101A] border border-[#211735] rounded-md p-0.5">
            <button
              onClick={octaveDown}
              disabled={octave <= 1}
              className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors"
              aria-label="Oitava abaixo (atalho: Z)"
              title="Oitava abaixo (Z)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-[11px] text-neutral-200">
              OCT <span className="text-[#8B5CF6] font-semibold">{octave}</span>
            </span>
            <button
              onClick={octaveUp}
              disabled={octave >= 7}
              className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors"
              aria-label="Oitava acima (atalho: X)"
              title="Oitava acima (X)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="text-[11px] text-neutral-400 font-mono hidden sm:inline">
            {midiToNoteName(baseMidi)} – {midiToNoteName(baseMidi + totalNotes - 1)}
          </span>
        </div>

        <div className="flex items-center gap-3 text-neutral-400 text-[11px]">
          <span className="hidden md:inline">
            Teclado Físico: <kbd className="font-mono text-[#BFA7FF] px-1 bg-[#12101A] rounded border border-[#211735]">A</kbd>-<kbd className="font-mono text-[#BFA7FF] px-1 bg-[#12101A] rounded border border-[#211735]">'</kbd>
          </span>
          <span className="hidden md:inline">
            Oitava: <kbd className="font-mono text-[#BFA7FF] px-1 bg-[#12101A] rounded border border-[#211735]">Z</kbd> / <kbd className="font-mono text-[#BFA7FF] px-1 bg-[#12101A] rounded border border-[#211735]">X</kbd>
          </span>
        </div>
      </div>

      {/* Piano Keys Frame */}
      <div className="relative w-full h-44 sm:h-52 bg-[#09070D] p-2 rounded-xl border border-[#211735] shadow-2xl flex touch-none">
        {/* White keys container */}
        <div className="flex w-full h-full relative">
          {whiteKeys.map((k) => {
            const isActive = activeNotes.includes(k.midi);
            return (
              <button
                key={k.midi}
                type="button"
                onPointerDown={(e) => handlePointerDown(k.midi, e)}
                onPointerEnter={(e) => handlePointerEnter(k.midi, e)}
                onPointerLeave={(e) => handlePointerLeave(k.midi, e)}
                onPointerUp={(e) => handlePointerUp(k.midi, e)}
                onPointerCancel={(e) => handlePointerUp(k.midi, e)}
                aria-label={`Nota ${midiToNoteName(k.midi)}`}
                className={`flex-1 relative h-full rounded-b-md border-r border-[#12101A] last:border-r-0 transition-colors flex flex-col justify-end items-center pb-2 ${
                  isActive
                    ? 'bg-[#8B5CF6] text-white shadow-lg ring-2 ring-[#BFA7FF] translate-y-0.5'
                    : 'bg-[#1a1724] text-neutral-400 hover:bg-[#231e32] active:bg-[#8B5CF6]'
                }`}
              >
                {/* Visual note label */}
                <div className="flex flex-col items-center gap-0.5 pointer-events-none">
                  {k.keyHint && (
                    <span
                      className={`text-[9px] font-mono px-1 rounded ${
                        isActive ? 'text-white' : 'text-[#8B5CF6] bg-[#09070D]/40'
                      }`}
                    >
                      {k.keyHint}
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-mono font-medium ${
                      isActive ? 'text-white' : 'text-neutral-300'
                    }`}
                  >
                    {midiToNoteName(k.midi)}
                  </span>
                </div>
              </button>
            );
          })}

          {/* Black keys positioned absolutely over white keys */}
          {keys.map((k) => {
            if (!k.isBlack) return null;

            // Compute relative position based on standard piano keyboard layout
            // Count how many white keys precede this black key
            const precedingWhiteKeys = keys
              .slice(0, k.indexInScale)
              .filter((x) => !x.isBlack).length;
            const totalWhite = whiteKeys.length;
            const leftPercent = ((precedingWhiteKeys - 0.32) / totalWhite) * 100;
            const widthPercent = (0.64 / totalWhite) * 100;

            const isActive = activeNotes.includes(k.midi);

            return (
              <button
                key={k.midi}
                type="button"
                onPointerDown={(e) => handlePointerDown(k.midi, e)}
                onPointerEnter={(e) => handlePointerEnter(k.midi, e)}
                onPointerLeave={(e) => handlePointerLeave(k.midi, e)}
                onPointerUp={(e) => handlePointerUp(k.midi, e)}
                onPointerCancel={(e) => handlePointerUp(k.midi, e)}
                aria-label={`Nota ${midiToNoteName(k.midi)}`}
                style={{
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`,
                }}
                className={`absolute top-0 h-[60%] z-10 rounded-b-md transition-all flex flex-col justify-end items-center pb-2 ${
                  isActive
                    ? 'bg-[#BFA7FF] text-black shadow-lg ring-2 ring-[#5DE4FF] translate-y-0.5'
                    : 'bg-[#09070D] text-neutral-400 hover:bg-[#12101A] border-x border-b border-[#211735]'
                }`}
              >
                <div className="flex flex-col items-center gap-0.5 pointer-events-none">
                  {k.keyHint && (
                    <span
                      className={`text-[9px] font-mono px-0.5 rounded ${
                        isActive ? 'text-black font-bold' : 'text-[#BFA7FF]'
                      }`}
                    >
                      {k.keyHint}
                    </span>
                  )}
                  <span
                    className={`text-[8px] font-mono ${
                      isActive ? 'text-black font-bold' : 'text-neutral-400'
                    }`}
                  >
                    {midiToNoteName(k.midi)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
