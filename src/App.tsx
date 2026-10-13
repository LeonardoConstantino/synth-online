/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSynth } from '@/hooks/useSynth';
import { useKeyboard } from '@/input/useKeyboard';
import { useUIStore } from '@/store/uiStore';
import { ModeToggle } from '@/components/shell/ModeToggle';
import { PresetDrawer } from '@/components/shell/PresetDrawer';
import { Keyboard } from '@/components/synth/Keyboard';
import { PadGrid } from '@/components/synth/PadGrid';
import { SimpleModeView } from '@/components/synth/SimpleModeView';
import { ExpertModeView } from '@/components/synth/ExpertModeView';
import { Volume2, VolumeX, Piano, Grid, Radio, Info } from 'lucide-react';

export default function App() {
  const { noteOn, noteOff, allNotesOff, ensureAudio } = useSynth();
  const mode = useUIStore((s) => s.mode);
  const isAudioStarted = useUIStore((s) => s.isAudioStarted);

  const [isPresetDrawerOpen, setIsPresetDrawerOpen] = useState(false);
  const activeInputTab = useUIStore((s) => s.activeInputTab);
  const setActiveInputTab = useUIStore((s) => s.setActiveInputTab);

  // Register physical computer keyboard listener for piano (only enabled when keyboard is active)
  useKeyboard({
    noteOn,
    noteOff,
    enabled: activeInputTab === 'keyboard' || activeInputTab === 'both',
  });

  const handleStartAudio = async () => {
    await ensureAudio();
  };

  return (
    <div
      onClick={handleStartAudio}
      className="min-h-screen bg-[#09070D] text-[#F3F0F7] flex flex-col justify-between selection:bg-[#8B5CF6]/30"
    >
      {/* 1. Top Bar Contract (Zone 1: Wordmark, Zone 2: Navigation, Zone 3: Actions) */}
      <header className="sticky top-0 z-30 bg-[#09070D]/90 backdrop-blur-md border-b border-[#211735] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="text-lg sm:text-xl font-display font-bold tracking-tight text-[#F3F0F7] hover:text-[#BFA7FF] transition-colors"
          >
            Synth Online
          </a>
          <span className="hidden sm:inline text-xs font-mono text-neutral-400">
            · Instrumento Digital
          </span>
        </div>

        {/* Zone 2: Input Mode Switcher (clean functional segmented tabs) */}
        <nav className="flex items-center gap-1 p-1 bg-[#12101A] border border-[#211735] rounded-lg">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveInputTab('keyboard');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeInputTab === 'keyboard'
                ? 'bg-[#211735] text-[#5DE4FF] shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            aria-label="Visualizar Teclado"
          >
            <Piano className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Teclado</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveInputTab('pads');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeInputTab === 'pads'
                ? 'bg-[#211735] text-[#5DE4FF] shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            aria-label="Visualizar Grid de Pads"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pads</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveInputTab('both');
            }}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeInputTab === 'both'
                ? 'bg-[#211735] text-[#5DE4FF] shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            aria-label="Visualizar Teclado e Pads juntos"
          >
            <span>Ambos</span>
          </button>
        </nav>

        {/* Zone 3: Actions (ModeToggle & Presets Library) */}
        <div className="flex items-center gap-2 sm:gap-3" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setIsPresetDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#12101A] border border-[#211735] hover:border-[#8B5CF6] text-neutral-200 rounded-lg text-xs font-medium transition-colors"
            aria-label="Abrir biblioteca de presets"
          >
            <Radio className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span className="hidden sm:inline">Presets</span>
          </button>

          <ModeToggle />
        </div>
      </header>

      {/* Main Workspace Stage */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Audio Context Banner if not yet started */}
        {!isAudioStarted && (
          <div
            onClick={handleStartAudio}
            className="flex items-center justify-between p-3.5 bg-[#12101A] border border-[#8B5CF6]/50 rounded-xl cursor-pointer hover:bg-[#191524] transition-all glow-violet"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#211735] text-[#5DE4FF]">
                <Volume2 className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-neutral-100">
                  Clique em qualquer lugar ou toque uma tecla para ativar o áudio.
                </p>
                <p className="text-[11px] text-neutral-400">
                  Navegadores exigem um gesto do usuário para iniciar o Web Audio API.
                </p>
              </div>
            </div>
            <button className="px-3.5 py-1.5 bg-[#8B5CF6] hover:bg-[#7c4ee4] text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap">
              Ativar Áudio
            </button>
          </div>
        )}

        {/* Dynamic Mode Content */}
        {mode === 'simple' ? (
          <SimpleModeView onOpenPresetDrawer={() => setIsPresetDrawerOpen(true)} />
        ) : (
          <ExpertModeView
            onOpenPresetDrawer={() => setIsPresetDrawerOpen(true)}
            onPanic={allNotesOff}
          />
        )}

        {/* Input Interface Area (Keyboard and/or Pads) */}
        <section className="flex flex-col gap-6 pt-2">
          {(activeInputTab === 'keyboard' || activeInputTab === 'both') && (
            <div className="w-full">
              <Keyboard noteOn={noteOn} noteOff={noteOff} />
            </div>
          )}

          {(activeInputTab === 'pads' || activeInputTab === 'both') && (
            <div className="w-full">
              <PadGrid noteOn={noteOn} noteOff={noteOff} />
            </div>
          )}
        </section>
      </main>

      {/* Preset Drawer Sheet */}
      <PresetDrawer
        open={isPresetDrawerOpen}
        onOpenChange={setIsPresetDrawerOpen}
      />

      {/* Clean Footer */}
      <footer className="border-t border-[#211735] px-4 sm:px-8 py-4 text-xs text-neutral-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-display font-medium text-neutral-300">Synth Online</span>
          <span>·</span>
          <span>Web Audio API + Tone.js + IndexedDB</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span>16 Vozes de Polifonia</span>
          <span>·</span>
          <span>Zero Latência</span>
        </div>
      </footer>
    </div>
  );
}
