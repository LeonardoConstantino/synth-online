import React, { useState, useRef, useCallback, useEffect } from 'react';

interface KnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  defaultValue?: number;
  size?: number;
  onChange: (value: number) => void;
  ariaLabel?: string;
}

export const Knob: React.FC<KnobProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  defaultValue,
  size = 54,
  onChange,
  ariaLabel,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartYRef = useRef<number>(0);
  const startValueRef = useRef<number>(value);

  // Map value to angle (-135deg to +135deg = 270deg range)
  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const angle = -135 + normalized * 270;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartYRef.current = e.clientY;
    startValueRef.current = value;
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const deltaY = dragStartYRef.current - e.clientY; // Drag up = increase
      const range = max - min;
      const sensitivity = 200; // pixels to cover full range
      const stepVal = step;

      let newValue = startValueRef.current + (deltaY / sensitivity) * range;
      newValue = Math.max(min, Math.min(max, newValue));

      if (stepVal > 0) {
        newValue = Math.round(newValue / stepVal) * stepVal;
      }

      onChange(Number(newValue.toFixed(stepVal < 1 ? 2 : 0)));
    },
    [isDragging, min, max, step, onChange]
  );

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setIsDragging(false);
    }
  };

  const handleDoubleClick = () => {
    if (defaultValue !== undefined) {
      onChange(defaultValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    let nextValue = value;
    const increment = step || (max - min) / 50;

    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      nextValue = Math.min(max, value + increment);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      nextValue = Math.max(min, value - increment);
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextValue = min;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextValue = max;
    }
    onChange(Number(nextValue.toFixed(step < 1 ? 2 : 0)));
  };

  // SVG arc calculation
  const radius = size * 0.42;
  const strokeWidth = 3;
  const center = size / 2;
  const startAngleRad = ((-135 - 90) * Math.PI) / 180;
  const endAngleRad = ((angle - 90) * Math.PI) / 180;

  const bgStartRad = ((-135 - 90) * Math.PI) / 180;
  const bgEndRad = ((135 - 90) * Math.PI) / 180;

  const arcPath = (start: number, end: number) => {
    const x1 = center + radius * Math.cos(start);
    const y1 = center + radius * Math.sin(start);
    const x2 = center + radius * Math.cos(end);
    const y2 = center + radius * Math.sin(end);
    const largeArc = end - start > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  return (
    <div className="flex flex-col items-center gap-1 group select-none">
      <div
        role="slider"
        aria-label={ariaLabel || `${label}: ${value}${unit}`}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        className="relative cursor-ns-resize focus:outline-none focus-visible:ring-1 focus-visible:ring-[#8B5CF6] rounded-full"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} className="overflow-visible">
          {/* Background track arc */}
          <path
            d={arcPath(bgStartRad, bgEndRad)}
            fill="none"
            stroke="#211735"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active arc */}
          {normalized > 0.01 && (
            <path
              d={arcPath(startAngleRad, endAngleRad)}
              fill="none"
              stroke={isDragging ? '#BFA7FF' : '#8B5CF6'}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className="transition-colors duration-150"
            />
          )}

          {/* Knob Body */}
          <circle
            cx={center}
            cy={center}
            r={radius - 5}
            fill="#12101A"
            stroke={isDragging ? '#8B5CF6' : '#211735'}
            strokeWidth="1.5"
            className="transition-all duration-150"
          />

          {/* Indicator Dot / Notch */}
          <line
            x1={center}
            y1={center}
            x2={center + (radius - 7) * Math.cos(((angle - 90) * Math.PI) / 180)}
            y2={center + (radius - 7) * Math.sin(((angle - 90) * Math.PI) / 180)}
            stroke={isDragging ? '#5DE4FF' : '#F3F0F7'}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        {/* Glow halo when active */}
        {isDragging && (
          <div
            className="absolute inset-0 rounded-full pointer-events-none glow-violet opacity-60"
            style={{ width: size, height: size }}
          />
        )}
      </div>

      {/* Label and formatted readout */}
      <span className="text-[10px] tracking-wider uppercase text-neutral-400 group-hover:text-neutral-200 transition-colors">
        {label}
      </span>
      <span className="text-[11px] font-mono tabular-nums text-neutral-300 font-medium">
        {value}
        {unit && <span className="text-[9px] text-neutral-500 ml-0.5">{unit}</span>}
      </span>
    </div>
  );
};
