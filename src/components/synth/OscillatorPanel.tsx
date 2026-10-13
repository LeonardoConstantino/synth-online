import React from 'react';
import { useSynthStore } from '@/store/synthStore';
import { OscType } from '@/types/synth';
import { Slider } from '@/components/ui/Slider';
import { Knob } from '@/components/ui/Knob';
import { Activity } from 'lucide-react';

const WAVEFORMS: { type: OscType; label: string; icon: React.ReactNode }[] = [
  {
    type: 'sine',
    label: 'Sine',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 12c3-8 6-8 10 0s7 8 10 0" />
      </svg>
    ),
  },
  {
    type: 'triangle',
    label: 'Triangle',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 18l5-12 5 12 5-12 5 12" />
      </svg>
    ),
  },
  {
    type: 'sawtooth',
    label: 'Saw',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 18l10-12v12l10-12v12" />
      </svg>
    ),
  },
  {
    type: 'square',
    label: 'Square',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 18V6h9v12h9V6" />
      </svg>
    ),
  },
  {
    type: 'fatsawtooth',
    label: 'Fat Saw',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 18l8-12v12l8-12v12" />
        <path d="M4 18l8-10v10" strokeOpacity="0.5" />
      </svg>
    ),
  },
];

export const OscillatorPanel: React.FC = React.memo(() => {
  const osc = useSynthStore((s) => s.params.osc);
  const setOscType = useSynthStore((s) => s.setOscType);
  const setOscDetune = useSynthStore((s) => s.setOscDetune);
  const setOscVolume = useSynthStore((s) => s.setOscVolume);
  const setOscFM = useSynthStore((s) => s.setOscFM);

  return (
    <div className="flex flex-col gap-3.5 p-4 bg-[#12101A] border border-[#211735] rounded-xl shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#211735]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#8B5CF6]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-200">
            Oscilador (OSC)
          </h3>
        </div>
        <span className="text-[10px] font-mono uppercase text-neutral-400">
          Fonte Sonora
        </span>
      </div>

      {/* Waveform Selector */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
          Forma de Onda
        </span>
        <div className="grid grid-cols-5 gap-1.5 bg-[#09070D] p-1 rounded-lg border border-[#211735]">
          {WAVEFORMS.map((w) => (
            <button
              key={w.type}
              type="button"
              onClick={() => setOscType(w.type)}
              className={`flex flex-col items-center gap-1 py-1.5 px-1 rounded transition-all ${
                osc.type === w.type
                  ? 'bg-[#211735] text-[#5DE4FF] font-medium ring-1 ring-[#8B5CF6]/50 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#12101A]'
              }`}
              aria-label={`Selecionar onda ${w.label}`}
              aria-pressed={osc.type === w.type}
            >
              {w.icon}
              <span className="text-[10px] truncate">{w.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Detune Slider & Volume Knob */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center pt-1">
        <div className="sm:col-span-2 flex flex-col gap-3">
          <Slider
            label="Detune (Cents)"
            value={osc.detune}
            min={-1200}
            max={1200}
            step={1}
            unit="¢"
            onChange={setOscDetune}
            formatValue={(v) => `${v > 0 ? `+${v}` : v} ¢`}
          />

          <Slider
            label="FM Ratio (Harmônico)"
            value={osc.fmRatio}
            min={0}
            max={10}
            step={0.1}
            onChange={(val) => setOscFM(val, osc.fmDepth)}
            formatValue={(v) => `${v.toFixed(1)}x`}
          />

          <Slider
            label="FM Profundidade (Índice)"
            value={osc.fmDepth}
            min={0}
            max={100}
            step={1}
            onChange={(val) => setOscFM(osc.fmRatio, val)}
            formatValue={(v) => `${v}%`}
          />
        </div>

        <div className="flex justify-center border-t sm:border-t-0 sm:border-l border-[#211735] pt-2 sm:pt-0 sm:pl-2">
          <Knob
            label="Volume OSC"
            value={osc.volume}
            min={-30}
            max={6}
            step={0.5}
            unit="dB"
            defaultValue={0}
            onChange={setOscVolume}
          />
        </div>
      </div>
    </div>
  );
});
