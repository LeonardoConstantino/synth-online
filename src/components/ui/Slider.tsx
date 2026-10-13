import React from 'react';
import * as RadixSlider from '@radix-ui/react-slider';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  orientation?: 'horizontal' | 'vertical';
  ariaLabel?: string;
  formatValue?: (val: number) => string;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  orientation = 'horizontal',
  ariaLabel,
  formatValue,
}) => {
  const displayVal = formatValue ? formatValue(value) : `${value}${unit ? ` ${unit}` : ''}`;

  return (
    <div className={`flex ${orientation === 'vertical' ? 'flex-col items-center h-48' : 'flex-col'} gap-1.5 group select-none`}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-[11px] font-medium tracking-wide uppercase text-neutral-400 group-hover:text-neutral-200 transition-colors">
          {label}
        </span>
        <span className="text-[11px] font-mono tabular-nums text-neutral-300 font-medium">
          {displayVal}
        </span>
      </div>

      <RadixSlider.Root
        className={`relative flex items-center select-none touch-none ${
          orientation === 'vertical' ? 'flex-col w-5 h-full' : 'w-full h-5'
        }`}
        value={[value]}
        onValueChange={([val]) => onChange(val)}
        min={min}
        max={max}
        step={step}
        orientation={orientation}
        aria-label={ariaLabel || `${label}: ${displayVal}`}
      >
        <RadixSlider.Track
          className={`relative bg-[#211735] rounded-full overflow-hidden ${
            orientation === 'vertical' ? 'w-1.5 h-full' : 'w-full h-1.5'
          }`}
        >
          <RadixSlider.Range className="absolute bg-[#8B5CF6] group-hover:bg-[#BFA7FF] transition-colors rounded-full" />
        </RadixSlider.Track>
        <RadixSlider.Thumb
          className="block w-3.5 h-3.5 bg-[#F3F0F7] border-2 border-[#8B5CF6] rounded-full shadow hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] transition-transform"
          aria-label={label}
        />
      </RadixSlider.Root>
    </div>
  );
};
