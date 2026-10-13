import React, { useState, useEffect } from 'react';
import { usePads } from '@/input/usePads';
import { useUIStore } from '@/store/uiStore';
import { usePresetStore } from '@/store/presetStore';
import { getSynthEngine } from '@/hooks/useSynth';
import { midiToNoteName, noteNameToMidi } from '@/input/midiMap';
import { DRUM_KIT_PIECES, DrumPieceInfo } from '@/audio/DrumEngine';
import { Settings2, RotateCcw, X, Check, Disc3, Music } from 'lucide-react';

interface PadGridProps {
  noteOn: (midi: number, velocity?: number) => void;
  noteOff: (midi: number) => void;
}

export const PadGrid: React.FC<PadGridProps> = ({ noteOn, noteOff }) => {
  const activeInputTab = useUIStore((s) => s.activeInputTab);
  const activePadIndex = useUIStore((s) => s.activePadIndex);
  const activeNotes = useUIStore((s) => s.activeNotes);
  const activePresetId = usePresetStore((s) => s.activePresetId);
  const presets = usePresetStore((s) => s.presets);

  const activePreset = presets.find((p) => p.id === activePresetId);
  const isDrumPreset = activePreset?.category === 'drums';

  const [isDrumMode, setIsDrumMode] = useState<boolean>(isDrumPreset);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editNoteName, setEditNoteName] = useState('');
  const [editKey, setEditKey] = useState('');

  // Sync drum mode when preset category changes
  useEffect(() => {
    setIsDrumMode(isDrumPreset);
    getSynthEngine().setDrumMode(isDrumPreset);
  }, [isDrumPreset]);

  const toggleDrumMode = (enabled: boolean) => {
    setIsDrumMode(enabled);
    getSynthEngine().setDrumMode(enabled);
  };

  const isPadsActive = activeInputTab === 'pads' || activeInputTab === 'both';

  const padOptions = React.useMemo(
    () => ({
      enabled: isPadsActive,
      isDrumMode,
    }),
    [isPadsActive, isDrumMode]
  );

  const { pads, activePadIndices, triggerPad, releasePad, rebindPad, resetPads } = usePads(
    noteOn,
    noteOff,
    padOptions
  );

  const startEditing = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const pad = pads[index];
    setEditingIndex(index);
    setEditNoteName(pad.noteName);
    setEditKey(pad.key);
  };

  const saveEditing = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIndex === null) return;
    const midi = noteNameToMidi(editNoteName.toUpperCase());
    rebindPad(editingIndex, midi, editKey);
    setEditingIndex(null);
  };

  const handlePadPress = (index: number) => {
    triggerPad(index, 0.95);
  };

  const handlePadRelease = (index: number) => {
    releasePad(index);
  };

  return (
    <div className="flex flex-col gap-2.5 w-full max-w-xl mx-auto select-none">
      {/* Header bar with Mode Switcher & Reset */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-2">
          {/* Segmented control for Melodic vs Drum pads */}
          <div className="flex items-center p-0.5 bg-[#12101A] border border-[#211735] rounded-lg">
            <button
              onClick={() => toggleDrumMode(false)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                !isDrumMode
                  ? 'bg-[#211735] text-[#5DE4FF] shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              aria-label="Modo Notas Melódicas"
            >
              <Music className="w-3 h-3" />
              <span>Notas</span>
            </button>
            <button
              onClick={() => toggleDrumMode(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                isDrumMode
                  ? 'bg-[#211735] text-[#BFA7FF] shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              aria-label="Modo Bateria e Percussão"
            >
              <Disc3 className="w-3 h-3" />
              <span>Bateria (Kits)</span>
            </button>
          </div>

          <span className="text-[10px] font-mono text-neutral-400 hidden sm:inline">
            {isDrumMode ? '16 Peças Acústicas & Eletrônicas' : '16 Notas Cromáticas'}
          </span>
        </div>

        {!isDrumMode && (
          <button
            onClick={() => resetPads(3)}
            className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors"
            title="Restaurar notas padrão dos pads"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restaurar</span>
          </button>
        )}
      </div>

      {/* 4x4 Grid */}
      <div className="grid grid-cols-4 gap-2.5 p-3 bg-[#09070D] border border-[#211735] rounded-xl shadow-xl">
        {pads.map((pad) => {
          const drumPiece: DrumPieceInfo | undefined = DRUM_KIT_PIECES[pad.index];
          const isPressed =
            activePadIndices.includes(pad.index) ||
            activePadIndex === pad.index ||
            (!isDrumMode && activeNotes.includes(pad.midi));

          return (
            <div
              key={pad.index}
              onPointerDown={(e) => {
                e.preventDefault();
                (e.target as HTMLElement).setPointerCapture(e.pointerId);
                handlePadPress(pad.index);
              }}
              onPointerUp={(e) => {
                try {
                  (e.target as HTMLElement).releasePointerCapture(e.pointerId);
                } catch {}
                handlePadRelease(pad.index);
              }}
              onPointerCancel={() => handlePadRelease(pad.index)}
              className={`relative h-20 sm:h-22 rounded-lg p-2 flex flex-col justify-between border cursor-pointer transition-all duration-100 ${
                isPressed
                  ? isDrumMode
                    ? 'bg-[#5DE4FF] border-white glow-cyan scale-95 text-black'
                    : 'bg-[#8B5CF6] border-[#BFA7FF] glow-violet scale-95 text-white'
                  : 'bg-[#12101A] border-[#211735] hover:border-[#8B5CF6]/50 hover:bg-[#191524]'
              }`}
            >
              {/* Header inside pad */}
              <div className="flex items-center justify-between pointer-events-none">
                <span
                  className={`text-[9px] font-mono ${
                    isPressed ? (isDrumMode ? 'text-black font-semibold' : 'text-white') : 'text-neutral-400'
                  }`}
                >
                  PAD {pad.index + 1}
                </span>
                <span
                  className={`text-[9px] font-mono px-1 rounded uppercase font-semibold ${
                    isPressed
                      ? isDrumMode ? 'bg-black/20 text-black' : 'bg-white/20 text-white'
                      : 'bg-[#211735] text-[#5DE4FF] border border-[#5DE4FF]/30'
                  }`}
                >
                  {pad.key}
                </span>
              </div>

              {/* Center / Bottom Content: Drum Piece Name or Note Name */}
              <div className="flex flex-col pointer-events-none">
                {isDrumMode && drumPiece ? (
                  <>
                    <span
                      className={`text-xs sm:text-sm font-semibold tracking-tight leading-tight line-clamp-1 ${
                        isPressed ? 'text-black' : 'text-neutral-100'
                      }`}
                    >
                      {drumPiece.name}
                    </span>
                    <span
                      className={`text-[9px] font-mono capitalize tracking-wide ${
                        isPressed ? 'text-neutral-800' : 'text-neutral-400'
                      }`}
                    >
                      {drumPiece.category}
                    </span>
                  </>
                ) : (
                  <span
                    className={`text-sm sm:text-base font-mono font-bold tracking-tight ${
                      isPressed ? 'text-white' : 'text-neutral-100'
                    }`}
                  >
                    {pad.noteName}
                  </span>
                )}
              </div>

              {/* Edit button (in melodic mode) */}
              {!isDrumMode && (
                <button
                  type="button"
                  onClick={(e) => startEditing(pad.index, e)}
                  className="absolute bottom-1.5 right-1.5 p-1 rounded hover:bg-black/30 text-neutral-400 hover:text-white transition-colors"
                  title="Configurar nota e tecla"
                  aria-label={`Configurar pad ${pad.index + 1}`}
                >
                  <Settings2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Pad Modal (for melodic mode) */}
      {editingIndex !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form
            onSubmit={saveEditing}
            className="w-full max-w-xs bg-[#12101A] border border-[#8B5CF6] rounded-xl p-4 shadow-2xl flex flex-col gap-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#211735]">
              <span className="text-xs font-semibold text-neutral-200">
                Configurar Pad {editingIndex + 1}
              </span>
              <button
                type="button"
                onClick={() => setEditingIndex(null)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-neutral-400">Nota Musical (ex: C3, D#3, F4)</label>
              <input
                type="text"
                value={editNoteName}
                onChange={(e) => setEditNoteName(e.target.value)}
                required
                className="px-2.5 py-1.5 bg-[#09070D] border border-[#211735] rounded text-xs font-mono text-white focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-neutral-400">Tecla de Atalho (ex: 1, Q, A, Z)</label>
              <input
                type="text"
                maxLength={1}
                value={editKey}
                onChange={(e) => setEditKey(e.target.value)}
                required
                className="px-2.5 py-1.5 bg-[#09070D] border border-[#211735] rounded text-xs font-mono text-white focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setEditingIndex(null)}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1 px-3 py-1.5 bg-[#8B5CF6] hover:bg-[#7c4ee4] text-white text-xs font-medium rounded transition-colors"
              >
                <Check className="w-3.5 h-3.5" /> Salvar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
