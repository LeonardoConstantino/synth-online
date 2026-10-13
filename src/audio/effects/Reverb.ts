import * as Tone from 'tone';
import { ReverbParams } from '@/types/synth';

export class ReverbEffect {
  private reverb: Tone.Reverb;
  private currentParams: ReverbParams;

  constructor(initialParams: ReverbParams) {
    this.currentParams = { ...initialParams };
    this.reverb = new Tone.Reverb({
      decay: Math.max(0.1, initialParams.decay),
      preDelay: Math.max(0.01, initialParams.preDelay),
      wet: initialParams.enabled ? initialParams.wet : 0,
    });
    // Generate reverb impulse response
    this.reverb.generate().catch((err) => {
      console.warn('Reverb generation warning:', err);
    });
  }

  public update(params: ReverbParams): void {
    const prevParams = this.currentParams;
    this.currentParams = { ...params };
    const now = Tone.now();

    // Smooth wet transition to prevent audio click
    const targetWet = params.enabled ? Math.max(0, Math.min(1, params.wet)) : 0;
    this.reverb.wet.rampTo(targetWet, 0.05, now);

    // If decay changed significantly, regenerate impulse response
    if (Math.abs(prevParams.decay - params.decay) > 0.8) {
      this.reverb.decay = Math.max(0.1, params.decay);
    }
  }

  public getNode(): Tone.Reverb {
    return this.reverb;
  }

  public dispose(): void {
    this.reverb.dispose();
  }
}
