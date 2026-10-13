import * as Tone from 'tone';
import { LFOParams } from '@/types/synth';

export class LFOEngine {
  private lfo: Tone.LFO | null = null;
  private currentParams: LFOParams;
  private currentTarget: Tone.Signal<any> | Tone.Param<any> | null = null;

  constructor(initialParams: LFOParams) {
    this.currentParams = { ...initialParams };
  }

  public connectTarget(target: Tone.Signal<any> | Tone.Param<any>): void {
    this.stop();
    this.currentTarget = target;

    if (!this.currentParams.enabled) {
      return;
    }

    let min = -100;
    let max = 100;

    if (this.currentParams.target === 'filterFreq') {
      // Modulate filter cutoff in cents: +/- 2400 cents (2 octaves) at full depth
      const cents = Math.max(10, this.currentParams.depth * 2400);
      min = -cents;
      max = cents;
    } else if (this.currentParams.target === 'frequency') {
      // Pitch vibrato in cents: +/- 150 cents
      const cents = Math.max(5, this.currentParams.depth * 150);
      min = -cents;
      max = cents;
    } else if (this.currentParams.target === 'amplitude') {
      // Tremolo: 0 to 1 gain
      min = Math.max(0.05, 1 - this.currentParams.depth);
      max = 1;
    }

    this.lfo = new Tone.LFO({
      frequency: Math.max(0.1, Math.min(20, this.currentParams.rate)),
      type: this.currentParams.type,
      min,
      max,
    });

    // Prevent Tone.js from zeroing and overriding the destination Signal
    if ('override' in target) {
      (target as any).override = false;
    }

    this.lfo.connect(target);
    this.lfo.start();
  }

  public update(params: LFOParams, newTarget?: Tone.Signal<any> | Tone.Param<any>): void {
    const targetChanged = newTarget && newTarget !== this.currentTarget;
    const typeOrTargetChanged =
      params.target !== this.currentParams.target ||
      params.type !== this.currentParams.type ||
      params.enabled !== this.currentParams.enabled;

    this.currentParams = { ...params };

    if (!params.enabled) {
      this.stop();
      return;
    }

    const activeTarget = newTarget || this.currentTarget;

    if (targetChanged || typeOrTargetChanged || !this.lfo) {
      if (activeTarget) {
        this.connectTarget(activeTarget);
      }
      return;
    }

    if (this.lfo) {
      const now = Tone.now();
      this.lfo.frequency.rampTo(Math.max(0.1, Math.min(20, params.rate)), 0.05, now);

      if (params.target === 'filterFreq') {
        const cents = Math.max(10, params.depth * 2400);
        this.lfo.min = -cents;
        this.lfo.max = cents;
      } else if (params.target === 'frequency') {
        const cents = Math.max(5, params.depth * 150);
        this.lfo.min = -cents;
        this.lfo.max = cents;
      } else if (params.target === 'amplitude') {
        this.lfo.min = Math.max(0.05, 1 - params.depth);
        this.lfo.max = 1;
      }
    }
  }

  public stop(): void {
    if (this.lfo) {
      try {
        this.lfo.stop();
        this.lfo.disconnect();
        this.lfo.dispose();
      } catch {}
      this.lfo = null;
    }

    if (this.currentTarget) {
      try {
        if ('overridden' in this.currentTarget) {
          (this.currentTarget as any).overridden = false;
        }
        if ('value' in this.currentTarget) {
          (this.currentTarget as any).value = 0;
        }
      } catch {}
    }
  }

  public dispose(): void {
    this.stop();
    this.currentTarget = null;
  }
}
