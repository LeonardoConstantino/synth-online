import React from 'react';
import { useSynthStore } from '@/store/synthStore';
import { Slider } from '@/components/ui/Slider';
import { Gauge } from 'lucide-react';

export const EnvelopePanel: React.FC = React.memo(() => {
  const adsr = useSynthStore((s) => s.params.adsr);
  const setADSR = useSynthStore((s) => s.setADSR);

  // SVG graph dimensions
  const svgWidth = 260;
  const svgHeight = 70;
  const padding = 8;
  const graphWidth = svgWidth - padding * 2;
  const graphHeight = svgHeight - padding * 2;

  // Normalized time factors for graph representation
  const maxTotalTime = 6; // max visual budget
  const aW = Math.max(15, (adsr.attack / maxTotalTime) * graphWidth * 0.9);
  const dW = Math.max(15, (adsr.decay / maxTotalTime) * graphWidth * 0.9);
  const sH = (1 - adsr.sustain) * graphHeight;
  const holdW = 35;
  const rW = Math.max(15, (adsr.release / maxTotalTime) * graphWidth * 0.9);

  // Normalize segments to fit inside graphWidth
  const totalW = aW + dW + holdW + rW;
  const scale = graphWidth / Math.max(graphWidth, totalW);

  const p0 = { x: padding, y: padding + graphHeight };
  const p1 = { x: padding + aW * scale, y: padding };
  const p2 = { x: p1.x + dW * scale, y: padding + sH };
  const p3 = { x: p2.x + holdW * scale, y: padding + sH };
  const p4 = { x: p3.x + rW * scale, y: padding + graphHeight };

  const pathD = `M ${p0.x} ${p0.y} L ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${p4.x} ${p4.y}`;
  const fillD = `${pathD} L ${p4.x} ${padding + graphHeight} L ${p0.x} ${padding + graphHeight} Z`;

  return (
    <div className="flex flex-col gap-3.5 p-4 bg-[#12101A] border border-[#211735] rounded-xl shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#211735]">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-[#8B5CF6]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-200">
            Envelope de Amplitude (ADSR)
          </h3>
        </div>
        <span className="text-[10px] font-mono uppercase text-neutral-400">
          Dinâmica
        </span>
      </div>

      {/* SVG Curve Display */}
      <div className="relative bg-[#09070D] border border-[#211735] rounded-lg p-2 flex items-center justify-center overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-16 overflow-visible"
        >
          <defs>
            <linearGradient id="adsrGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Fill under curve */}
          <path d={fillD} fill="url(#adsrGradient)" />

          {/* Stroke curve */}
          <path
            d={pathD}
            fill="none"
            stroke="#8B5CF6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Vertex marker dots */}
          <circle cx={p1.x} cy={p1.y} r="3" fill="#5DE4FF" />
          <circle cx={p2.x} cy={p2.y} r="3" fill="#BFA7FF" />
          <circle cx={p3.x} cy={p3.y} r="3" fill="#BFA7FF" />
        </svg>

        {/* Labels under vertices */}
        <div className="absolute bottom-1 left-3 right-3 flex justify-between text-[9px] font-mono text-neutral-400 pointer-events-none">
          <span>A</span>
          <span>D</span>
          <span>S</span>
          <span>R</span>
        </div>
      </div>

      {/* ADSR Sliders Grid */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <Slider
          label="Attack"
          value={adsr.attack}
          min={0.005}
          max={4.0}
          step={0.005}
          unit="s"
          onChange={(val) => setADSR({ attack: val })}
          formatValue={(v) => `${v.toFixed(v < 0.1 ? 3 : 2)}s`}
        />

        <Slider
          label="Decay"
          value={adsr.decay}
          min={0.01}
          max={4.0}
          step={0.01}
          unit="s"
          onChange={(val) => setADSR({ decay: val })}
          formatValue={(v) => `${v.toFixed(2)}s`}
        />

        <Slider
          label="Sustain"
          value={adsr.sustain}
          min={0}
          max={1.0}
          step={0.01}
          onChange={(val) => setADSR({ sustain: val })}
          formatValue={(v) => `${Math.round(v * 100)}%`}
        />

        <Slider
          label="Release"
          value={adsr.release}
          min={0.01}
          max={6.0}
          step={0.02}
          unit="s"
          onChange={(val) => setADSR({ release: val })}
          formatValue={(v) => `${v.toFixed(2)}s`}
        />
      </div>
    </div>
  );
});
