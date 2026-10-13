import React from 'react';
import { useSynthStore } from '@/store/synthStore';
import { FilterType } from '@/types/synth';
import { Slider } from '@/components/ui/Slider';
import { Filter } from 'lucide-react';

const FILTER_TYPES: { type: FilterType; label: string }[] = [
  { type: 'lowpass', label: 'Low Pass' },
  { type: 'highpass', label: 'High Pass' },
  { type: 'bandpass', label: 'Band Pass' },
  { type: 'notch', label: 'Notch' },
];

export const FilterPanel: React.FC = React.memo(() => {
  const filter = useSynthStore((s) => s.params.filter);
  const setFilterType = useSynthStore((s) => s.setFilterType);
  const setFilterFreq = useSynthStore((s) => s.setFilterFreq);
  const setFilterResonance = useSynthStore((s) => s.setFilterResonance);
  const setFilterEnvelopeAmount = useSynthStore((s) => s.setFilterEnvelopeAmount);

  // Map 0..100 linear slider value to logarithmic frequency 20Hz..20000Hz
  const freqToLogSlider = (hz: number) => {
    const minLog = Math.log10(20);
    const maxLog = Math.log10(20000);
    const currLog = Math.log10(Math.max(20, Math.min(20000, hz)));
    return Math.round(((currLog - minLog) / (maxLog - minLog)) * 100);
  };

  const logSliderToFreq = (val: number) => {
    const minLog = Math.log10(20);
    const maxLog = Math.log10(20000);
    const logVal = minLog + (val / 100) * (maxLog - minLog);
    return Math.round(Math.pow(10, logVal));
  };

  const sliderVal = freqToLogSlider(filter.frequency);

  return (
    <div className="flex flex-col gap-3.5 p-4 bg-[#12101A] border border-[#211735] rounded-xl shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#211735]">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#8B5CF6]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-200">
            Filtro (VCF)
          </h3>
        </div>
        <span className="text-[10px] font-mono uppercase text-neutral-400">
          Timbre & Frequência
        </span>
      </div>

      {/* Filter Type Buttons */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
          Tipo de Filtro
        </span>
        <div className="grid grid-cols-4 gap-1.5 bg-[#09070D] p-1 rounded-lg border border-[#211735]">
          {FILTER_TYPES.map((t) => (
            <button
              key={t.type}
              type="button"
              onClick={() => setFilterType(t.type)}
              className={`py-1 px-1.5 text-center text-xs rounded transition-all truncate ${
                filter.type === t.type
                  ? 'bg-[#211735] text-[#5DE4FF] font-medium ring-1 ring-[#8B5CF6]/50 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#12101A]'
              }`}
              aria-label={`Filtro ${t.label}`}
              aria-pressed={filter.type === t.type}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cutoff frequency, resonance, and envelope amount */}
      <div className="flex flex-col gap-3 pt-1">
        <Slider
          label="Frequência de Corte (Cutoff)"
          value={sliderVal}
          min={0}
          max={100}
          step={1}
          onChange={(val) => setFilterFreq(logSliderToFreq(val))}
          formatValue={() => `${filter.frequency >= 1000 ? `${(filter.frequency / 1000).toFixed(2)} kHz` : `${filter.frequency} Hz`}`}
        />

        <div className="grid grid-cols-2 gap-3">
          <Slider
            label="Ressonância (Q)"
            value={filter.resonance}
            min={0.1}
            max={20}
            step={0.1}
            onChange={setFilterResonance}
            formatValue={(v) => v.toFixed(1)}
          />

          <Slider
            label="Modulação ADSR (Env)"
            value={filter.envelopeAmount}
            min={-1}
            max={1}
            step={0.05}
            onChange={setFilterEnvelopeAmount}
            formatValue={(v) => `${v > 0 ? `+${Math.round(v * 100)}` : Math.round(v * 100)}%`}
          />
        </div>
      </div>
    </div>
  );
});
