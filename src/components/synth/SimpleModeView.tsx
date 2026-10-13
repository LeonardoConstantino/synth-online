import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { usePresets } from '@/hooks/usePresets';
import { useSynthStore } from '@/store/synthStore';
import { useUIStore } from '@/store/uiStore';
import { Knob } from '@/components/ui/Knob';
import { WaveformVisualizer } from '@/components/ui/WaveformVisualizer';
import { Radio, Sparkles, Volume2, HelpCircle } from 'lucide-react';

interface SimpleModeViewProps {
  onOpenPresetDrawer: () => void;
}

export const SimpleModeView: React.FC<SimpleModeViewProps> = ({ onOpenPresetDrawer }) => {
  const { presets, activePresetId, apply } = usePresets();
  const masterVolume = useSynthStore((s) => s.params.masterVolume);
  const setMasterVolume = useSynthStore((s) => s.setMasterVolume);

  const getGlyphSvg = (glyph?: string) => {
    switch (glyph) {
      case 'pulse':
        return (
          <svg className="w-6 h-6 text-[#8B5CF6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h4l3 9 4-18 3 9h4" />
          </svg>
        );
      case 'beam':
        return (
          <svg className="w-6 h-6 text-[#5DE4FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="12" y1="4" x2="12" y2="20" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        );
      case 'crystal':
        return (
          <svg className="w-6 h-6 text-[#BFA7FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 2 12 12 22 22 12" />
          </svg>
        );
      case 'sphere':
        return (
          <svg className="w-6 h-6 text-[#8B5CF6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        );
      case 'drum':
        return (
          <svg className="w-6 h-6 text-[#5DE4FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <ellipse cx="12" cy="8" rx="8" ry="4" />
            <path d="M4 8v8c0 2.21 3.58 4 8 4s8-1.79 8-4V8" />
            <path d="M4 12c0 2.21 3.58 4 8 4s8-1.79 8-4" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-[#5DE4FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 12c3-4 6-4 9 0s6 4 9 0" />
          </svg>
        );
    }
  };

  const featuredPresets = presets.filter((p) => p.featured).slice(0, 6);

  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="flex flex-col gap-5 w-full max-w-5xl mx-auto">
        {/* Top Control Bar in Simple Mode: Featured Cards + Master Volume */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-center">
          {/* Quick Preset Cards */}
          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {featuredPresets.map((preset) => {
              const isActive = preset.id === activePresetId;
              return (
                <Tooltip.Root key={preset.id}>
                  <Tooltip.Trigger asChild>
                    <button
                      type="button"
                      onClick={() => apply(preset)}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#12101A] border-[#8B5CF6] shadow-lg ring-1 ring-[#8B5CF6]/50'
                          : 'bg-[#12101A]/60 border-[#211735] hover:border-[#8B5CF6]/40 hover:bg-[#12101A]'
                      }`}
                      aria-label={`Selecionar preset ${preset.name}`}
                      aria-pressed={isActive}
                    >
                      <div className="p-2 rounded-lg bg-[#09070D] border border-[#211735] mb-2">
                        {getGlyphSvg(preset.visualGlyph)}
                      </div>
                      <span className="text-xs font-semibold text-neutral-100 truncate w-full">
                        {preset.name}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mt-0.5">
                        {preset.category}
                      </span>
                      {isActive && (
                        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#5DE4FF]" />
                      )}
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="max-w-xs z-50 px-2.5 py-1.5 text-xs text-neutral-200 bg-[#09070D] border border-[#211735] rounded shadow-xl"
                      sideOffset={5}
                    >
                      {preset.description}
                      <Tooltip.Arrow className="fill-[#09070D]" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              );
            })}
          </div>

          {/* Master Volume & Explore Button */}
          <div className="flex items-center justify-around p-3 bg-[#12101A] border border-[#211735] rounded-xl">
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <div>
                  <Knob
                    label="Volume Master"
                    value={masterVolume}
                    min={-40}
                    max={0}
                    step={1}
                    unit="dB"
                    defaultValue={-6}
                    onChange={setMasterVolume}
                    ariaLabel={`Volume principal: ${masterVolume} decibéis`}
                  />
                </div>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="z-50 px-2.5 py-1.5 text-xs text-neutral-200 bg-[#09070D] border border-[#211735] rounded shadow-xl"
                  sideOffset={5}
                >
                  Controle do volume geral de saída do sintetizador.
                  <Tooltip.Arrow className="fill-[#09070D]" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  onClick={onOpenPresetDrawer}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-[#211735]/40 text-neutral-300 hover:text-white transition-colors"
                >
                  <div className="p-2 rounded-md bg-[#09070D] border border-[#211735]">
                    <Radio className="w-4 h-4 text-[#8B5CF6]" />
                  </div>
                  <span className="text-[11px] font-medium whitespace-nowrap">
                    Mais Sons
                  </span>
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="z-50 px-2.5 py-1.5 text-xs text-neutral-200 bg-[#09070D] border border-[#211735] rounded shadow-xl"
                  sideOffset={5}
                >
                  Abra a biblioteca completa para explorar e salvar presets customizados.
                  <Tooltip.Arrow className="fill-[#09070D]" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </div>
        </div>

        {/* Live Visualizer Oscilloscope */}
        <div className="w-full">
          <WaveformVisualizer height={54} />
        </div>
      </div>
    </Tooltip.Provider>
  );
};
