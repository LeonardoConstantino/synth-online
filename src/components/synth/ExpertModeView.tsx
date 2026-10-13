import React from 'react';
import { OscillatorPanel } from './OscillatorPanel';
import { EnvelopePanel } from './EnvelopePanel';
import { FilterPanel } from './FilterPanel';
import { LFOPanel } from './LFOPanel';
import { EffectsRack } from './EffectsRack';
import { WaveformVisualizer } from '@/components/ui/WaveformVisualizer';
import { Knob } from '@/components/ui/Knob';
import { useSynthStore } from '@/store/synthStore';
import { usePresetStore } from '@/store/presetStore';
import { Radio, Volume2, ShieldAlert } from 'lucide-react';

interface ExpertModeViewProps {
  onOpenPresetDrawer: () => void;
  onPanic: () => void;
}

export const ExpertModeView: React.FC<ExpertModeViewProps> = React.memo(
  ({ onOpenPresetDrawer, onPanic }) => {
    const masterVolume = useSynthStore((s) => s.params.masterVolume);
    const setMasterVolume = useSynthStore((s) => s.setMasterVolume);
    const activePresetId = usePresetStore((s) => s.activePresetId);
    const presets = usePresetStore((s) => s.presets);
    const activePreset = presets.find((p) => p.id === activePresetId);

    return (
      <div className="flex flex-col gap-4 w-full max-w-5xl mx-auto">
        {/* Signal Flow Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#12101A] border border-[#211735] rounded-xl">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-neutral-200">Cadeia de Sinal:</span>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-400">
              <span className="text-[#8B5CF6]">OSC</span>
              <span>→</span>
              <span className="text-[#BFA7FF]">ENV</span>
              <span>→</span>
              <span className="text-[#5DE4FF]">FILTER</span>
              <span>→</span>
              <span className="text-[#BFA7FF]">FX</span>
              <span>→</span>
              <span className="text-neutral-300">OUT</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenPresetDrawer}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#09070D] border border-[#211735] hover:border-[#8B5CF6] text-neutral-200 rounded-lg text-xs font-medium transition-colors"
            >
              <Radio className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>Timbre: {activePreset?.name || 'Manual'}</span>
            </button>

            <button
              onClick={onPanic}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#09070D] border border-rose-900/40 hover:bg-rose-950/40 text-rose-300 rounded-lg text-xs font-mono transition-colors"
              title="Corta todas as vozes e notas ativas instantaneamente"
              aria-label="Botão Panic: Parar todas as notas"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>PANIC</span>
            </button>

            <div className="w-28 hidden sm:block">
              <Knob
                label="Master"
                value={masterVolume}
                min={-40}
                max={0}
                step={1}
                unit="dB"
                defaultValue={-6}
                size={42}
                onChange={setMasterVolume}
              />
            </div>
          </div>
        </div>

        {/* Live Oscilloscope */}
        <WaveformVisualizer height={50} />

        {/* Grid of Synthesis Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <OscillatorPanel />
          <EnvelopePanel />
          <FilterPanel />
          <LFOPanel />
        </div>

        {/* Effects Rack */}
        <EffectsRack />
      </div>
    );
  }
);
