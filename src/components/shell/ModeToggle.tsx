import React from 'react';
import { useUIStore } from '@/store/uiStore';
import { Sparkles, Sliders } from 'lucide-react';

export const ModeToggle: React.FC = () => {
  const mode = useUIStore((s) => s.mode);
  const setMode = useUIStore((s) => s.setMode);

  return (
    <div className="flex items-center gap-1 p-1 bg-[#12101A] border border-[#211735] rounded-lg">
      <button
        onClick={() => setMode('simple')}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
          mode === 'simple'
            ? 'bg-[#211735] text-[#F3F0F7] shadow-sm ring-1 ring-[#8B5CF6]/50'
            : 'text-neutral-400 hover:text-neutral-200'
        }`}
        aria-label="Modo Leigo: Interface simplificada"
        aria-pressed={mode === 'simple'}
      >
        <Sparkles className="w-3.5 h-3.5 text-[#5DE4FF]" />
        <span>Leigo</span>
      </button>

      <button
        onClick={() => setMode('expert')}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
          mode === 'expert'
            ? 'bg-[#211735] text-[#F3F0F7] shadow-sm ring-1 ring-[#8B5CF6]/50'
            : 'text-neutral-400 hover:text-neutral-200'
        }`}
        aria-label="Modo Expert: Laboratório completo de síntese"
        aria-pressed={mode === 'expert'}
      >
        <Sliders className="w-3.5 h-3.5 text-[#BFA7FF]" />
        <span>Expert</span>
      </button>
    </div>
  );
};
