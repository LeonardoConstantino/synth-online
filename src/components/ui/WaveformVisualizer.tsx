import React, { useRef, useEffect } from 'react';
import { getSynthEngine } from '@/hooks/useSynth';

interface WaveformVisualizerProps {
  height?: number;
  className?: string;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  height = 64,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const engine = getSynthEngine();
      const waveform = engine.getWaveformData();
      const width = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, width, h);

      // Background subtle grid line
      ctx.strokeStyle = '#211735';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(width, h / 2);
      ctx.stroke();

      // Waveform line
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#8B5CF6';
      ctx.shadowColor = '#8B5CF6';
      ctx.shadowBlur = 8;
      ctx.beginPath();

      const sliceWidth = width / waveform.length;
      let x = 0;

      for (let i = 0; i < waveform.length; i++) {
        const v = waveform[i]; // -1 to 1
        const y = (v * 0.45 + 0.5) * h;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadow

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className={`relative overflow-hidden rounded-md border border-[#211735] bg-[#12101A] ${className}`}>
      <canvas
        ref={canvasRef}
        width={320}
        height={height}
        className="w-full h-full block"
      />
      <div className="absolute top-1.5 left-2 flex items-center gap-1.5 pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-[#5DE4FF] animate-pulse" />
        <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-400">
          Oscilloscope
        </span>
      </div>
    </div>
  );
};
