import React, { useState } from 'react';
import { useSynthStore } from '@/store/synthStore';
import { Slider } from '@/components/ui/Slider';
import { Sparkles, ChevronDown, ChevronUp, Layers } from 'lucide-react';

export const EffectsRack: React.FC = React.memo(() => {
  const effects = useSynthStore((s) => s.params.effects);
  const setEffectReverb = useSynthStore((s) => s.setEffectReverb);
  const setEffectDelay = useSynthStore((s) => s.setEffectDelay);
  const setEffectChorus = useSynthStore((s) => s.setEffectChorus);

  const [expanded, setExpanded] = useState<{ reverb: boolean; delay: boolean; chorus: boolean }>({
    reverb: true,
    delay: true,
    chorus: true,
  });

  const toggleExpand = (fx: 'reverb' | 'delay' | 'chorus') => {
    setExpanded((prev) => ({ ...prev, [fx]: !prev[fx] }));
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-[#12101A] border border-[#211735] rounded-xl shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#211735]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#8B5CF6]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-200">
            Rack de Efeitos (DSP)
          </h3>
        </div>
        <span className="text-[10px] font-mono text-neutral-400">
          Reverb → Delay → Chorus
        </span>
      </div>

      {/* 1. Reverb Section */}
      <div className="flex flex-col bg-[#09070D] border border-[#211735] rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-[#12101A]/70">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEffectReverb({ enabled: !effects.reverb.enabled })}
              className={`w-3.5 h-3.5 rounded-full transition-all ${
                effects.reverb.enabled ? 'bg-[#5DE4FF] shadow-sm glow-cyan' : 'bg-[#211735]'
              }`}
              aria-label="Ativar/desativar reverb"
            />
            <span className="text-xs font-semibold text-neutral-200">Reverb Espacial</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-neutral-400">
              {Math.round(effects.reverb.wet * 100)}% wet
            </span>
            <button
              type="button"
              onClick={() => toggleExpand('reverb')}
              className="text-neutral-400 hover:text-white"
            >
              {expanded.reverb ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {expanded.reverb && (
          <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[#211735]">
            <Slider
              label="Mix (Wet)"
              value={effects.reverb.wet}
              min={0}
              max={1}
              step={0.01}
              onChange={(val) => setEffectReverb({ wet: val })}
              formatValue={(v) => `${Math.round(v * 100)}%`}
            />
            <Slider
              label="Decay (Tamanho)"
              value={effects.reverb.decay}
              min={0.5}
              max={10}
              step={0.1}
              unit="s"
              onChange={(val) => setEffectReverb({ decay: val })}
              formatValue={(v) => `${v.toFixed(1)}s`}
            />
            <Slider
              label="Pré-Delay"
              value={effects.reverb.preDelay}
              min={0.01}
              max={0.5}
              step={0.01}
              unit="s"
              onChange={(val) => setEffectReverb({ preDelay: val })}
              formatValue={(v) => `${Math.round(v * 1000)}ms`}
            />
          </div>
        )}
      </div>

      {/* 2. Delay Section */}
      <div className="flex flex-col bg-[#09070D] border border-[#211735] rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-[#12101A]/70">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEffectDelay({ enabled: !effects.delay.enabled })}
              className={`w-3.5 h-3.5 rounded-full transition-all ${
                effects.delay.enabled ? 'bg-[#5DE4FF] shadow-sm glow-cyan' : 'bg-[#211735]'
              }`}
              aria-label="Ativar/desativar delay"
            />
            <span className="text-xs font-semibold text-neutral-200">Feedback Delay</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-neutral-400">
              {Math.round(effects.delay.wet * 100)}% wet
            </span>
            <button
              type="button"
              onClick={() => toggleExpand('delay')}
              className="text-neutral-400 hover:text-white"
            >
              {expanded.delay ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {expanded.delay && (
          <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[#211735]">
            <Slider
              label="Mix (Wet)"
              value={effects.delay.wet}
              min={0}
              max={1}
              step={0.01}
              onChange={(val) => setEffectDelay({ wet: val })}
              formatValue={(v) => `${Math.round(v * 100)}%`}
            />
            <Slider
              label="Tempo de Eco"
              value={effects.delay.delayTime}
              min={0.05}
              max={1.0}
              step={0.01}
              unit="s"
              onChange={(val) => setEffectDelay({ delayTime: val })}
              formatValue={(v) => `${Math.round(v * 1000)}ms`}
            />
            <Slider
              label="Feedback (Repetições)"
              value={effects.delay.feedback}
              min={0}
              max={0.9}
              step={0.01}
              onChange={(val) => setEffectDelay({ feedback: val })}
              formatValue={(v) => `${Math.round(v * 100)}%`}
            />
          </div>
        )}
      </div>

      {/* 3. Chorus Section */}
      <div className="flex flex-col bg-[#09070D] border border-[#211735] rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-[#12101A]/70">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEffectChorus({ enabled: !effects.chorus.enabled })}
              className={`w-3.5 h-3.5 rounded-full transition-all ${
                effects.chorus.enabled ? 'bg-[#5DE4FF] shadow-sm glow-cyan' : 'bg-[#211735]'
              }`}
              aria-label="Ativar/desativar chorus"
            />
            <span className="text-xs font-semibold text-neutral-200">Stereo Chorus</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-neutral-400">
              {Math.round(effects.chorus.wet * 100)}% wet
            </span>
            <button
              type="button"
              onClick={() => toggleExpand('chorus')}
              className="text-neutral-400 hover:text-white"
            >
              {expanded.chorus ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {expanded.chorus && (
          <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[#211735]">
            <Slider
              label="Mix (Wet)"
              value={effects.chorus.wet}
              min={0}
              max={1}
              step={0.01}
              onChange={(val) => setEffectChorus({ wet: val })}
              formatValue={(v) => `${Math.round(v * 100)}%`}
            />
            <Slider
              label="Frequência / Taxa"
              value={effects.chorus.frequency}
              min={0.5}
              max={8}
              step={0.1}
              unit="Hz"
              onChange={(val) => setEffectChorus({ frequency: val })}
              formatValue={(v) => `${v.toFixed(1)} Hz`}
            />
            <Slider
              label="Profundidade"
              value={effects.chorus.depth}
              min={0}
              max={1}
              step={0.01}
              onChange={(val) => setEffectChorus({ depth: val })}
              formatValue={(v) => `${Math.round(v * 100)}%`}
            />
          </div>
        )}
      </div>
    </div>
  );
});
