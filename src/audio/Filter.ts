import * as Tone from 'tone';
import { FilterParams } from '@/types/synth';

export class FilterEngine {
  private filterNode: Tone.Filter;
  private currentParams: FilterParams;

  constructor(initialParams: FilterParams) {
    this.currentParams = { ...initialParams };
    this.filterNode = new Tone.Filter({
      type: initialParams.type,
      frequency: initialParams.frequency,
      Q: initialParams.resonance,
      rolloff: -12,
    });
  }

  public update(params: FilterParams): void {
    this.currentParams = { ...params };
    const now = Tone.now();

    if (this.filterNode.type !== params.type) {
      this.filterNode.type = params.type;
    }

    // Smooth ramp to avoid clicks
    this.filterNode.frequency.rampTo(Math.max(20, Math.min(20000, params.frequency)), 0.05, now);
    this.filterNode.Q.rampTo(Math.max(0.1, Math.min(20, params.resonance)), 0.05, now);
  }

  public triggerEnvelope(time: number, duration: number, adsrAttack: number, adsrDecay: number, adsrSustain: number): void {
    if (Math.abs(this.currentParams.envelopeAmount) < 0.01) return;

    const baseFreq = Math.max(20, Math.min(20000, this.currentParams.frequency));
    const envMult = Math.pow(2, this.currentParams.envelopeAmount * 4); // Up to 4 octaves shift
    const peakFreq = Math.max(20, Math.min(20000, baseFreq * envMult));
    const sustainFreq = Math.max(20, Math.min(20000, baseFreq + (peakFreq - baseFreq) * adsrSustain));

    this.filterNode.frequency.cancelScheduledValues(time);
    this.filterNode.frequency.setValueAtTime(baseFreq, time);
    this.filterNode.frequency.linearRampToValueAtTime(peakFreq, time + Math.max(0.005, adsrAttack));
    this.filterNode.frequency.linearRampToValueAtTime(
      sustainFreq,
      time + Math.max(0.01, adsrAttack + adsrDecay)
    );
  }

  public releaseEnvelope(time: number, releaseTime: number): void {
    if (Math.abs(this.currentParams.envelopeAmount) < 0.01) return;
    const baseFreq = Math.max(20, Math.min(20000, this.currentParams.frequency));
    this.filterNode.frequency.cancelScheduledValues(time);
    this.filterNode.frequency.linearRampToValueAtTime(
      baseFreq,
      time + Math.max(0.01, releaseTime)
    );
  }

  public getNode(): Tone.Filter {
    return this.filterNode;
  }

  public getFrequencyParam(): Tone.Signal<'frequency'> {
    return this.filterNode.frequency;
  }

  public getDetuneParam(): Tone.Signal<'cents'> {
    return this.filterNode.detune;
  }

  public dispose(): void {
    this.filterNode.dispose();
  }
}
