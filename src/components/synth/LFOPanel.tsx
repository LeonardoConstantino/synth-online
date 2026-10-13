import React from 'react';
import { useSynthStore } from '@/store/synthStore';
import { LFOTarget, LFOType } from '@/types/synth';
import { Slider } from '@/components/ui/Slider';
import { Waves } from 'lucide-react';

const LFO_TARGETS: { target: LFOTarget; label: string }[] = [
  { target: 'filterFreq', label: 'Cutoff' },
  { target: 'frequency', label: 'Vibrato' },
  { target: 'amplitude', label: 'Tremolo' },
];

const LFO_TYPES: { type: LFOType; label: string }[] = [
  { type: 'sine', label: 'Sine' },
  { type: 'triangle', label: 'Tri' },
  { type: 'square', label: 'Sqr' },
  { type: 'sawtooth', label: 'Saw' },
];

export const LFOPanel: React.FC = React.memo(() => {
  const lfo = useSynthStore((s) => s.params.lfo);
  const setLFOEnabled = useSynthStore((s) => s.setLFOEnabled);
  const setLFORate = useSynthStore((s) => s.setLFORate);
  const setLFODepth = useSynthStore((s) => s.setLFODepth);
  const setLFOTarget = useSynthStore((s) => s.setLFOTarget);
  const setLFOType = useSynthStore((s) => s.setLFOType);

  return (
    <div className="flex flex-col gap-3.5 p-4 bg-[#12101A] border border-[#211735] rounded-xl shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#211735]">
        <div className="flex items-center gap-2">
          <Waves className="w-4 h-4 text-[#8B5CF6]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-200">
            Oscilador de Baixa Frequência (LFO)
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setLFOEnabled(!lfo.enabled)}
          className={`px-2.5 py-0.5 text-[11px] font-mono rounded transition-colors ${
            lfo.enabled
              ? 'bg-[#8B5CF6] text-white font-medium shadow-sm'
              : 'bg-[#211735] text-neutral-400 hover:text-white'
          }`}
          aria-label={lfo.enabled ? 'Desativar LFO' : 'Ativar LFO'}
        >
          {lfo.enabled ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Target & Shape Selectors */}
      <div className="grid grid-cols-2 gap-3 opacity-100 transition-opacity">
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
            Destino (Target)
          </span>
          <div className="grid grid-cols-3 gap-1 bg-[#09070D] p-1 rounded-lg border border-[#211735]">
            {LFO_TARGETS.map((t) => (
              <button
                key={t.target}
                type="button"
                onClick={() => setLFOTarget(t.target)}
                className={`py-1 text-center text-xs rounded transition-all truncate ${
                  lfo.target === t.target
                    ? 'bg-[#211735] text-[#5DE4FF] font-medium ring-1 ring-[#8B5CF6]/50 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#12101A]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
            Forma (Shape)
          </span>
          <div className="grid grid-cols-4 gap-1 bg-[#09070D] p-1 rounded-lg border border-[#211735]">
            {LFO_TYPES.map((t) => (
              <button
                key={t.type}
                type="button"
                onClick={() => setLFOType(t.type)}
                className={`py-1 text-center text-xs rounded transition-all truncate ${
                  lfo.type === t.type
                    ? 'bg-[#211735] text-[#5DE4FF] font-medium ring-1 ring-[#8B5CF6]/50 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#12101A]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Rate & Depth */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <Slider
          label="Velocidade (Rate)"
          value={lfo.rate}
          min={0.1}
          max={20}
          step={0.1}
          unit="Hz"
          onChange={setLFORate}
          formatValue={(v) => `${v.toFixed(1)} Hz`}
        />

        <Slider
          label="Profundidade (Depth)"
          value={lfo.depth}
          min={0}
          max={1}
          step={0.01}
          onChange={setLFODepth}
          formatValue={(v) => `${Math.round(v * 100)}%`}
        />
      </div>
    </div>
  );
});
