import * as Tone from 'tone';
import { ChorusParams } from '@/types/synth';

export class ChorusEffect {
  private chorus: Tone.Chorus;

  constructor(initialParams: ChorusParams) {
    this.chorus = new Tone.Chorus({
      frequency: Math.max(0.1, initialParams.frequency),
      delayTime: Math.max(1, initialParams.delayTime),
      depth: Math.max(0, Math.min(1, initialParams.depth)),
      wet: initialParams.enabled ? initialParams.wet : 0,
    }).start();
  }

  public update(params: ChorusParams): void {
    const now = Tone.now();
    const targetWet = params.enabled ? Math.max(0, Math.min(1, params.wet)) : 0;
    this.chorus.wet.rampTo(targetWet, 0.05, now);
    this.chorus.frequency.rampTo(Math.max(0.1, params.frequency), 0.05, now);
    this.chorus.delayTime = Math.max(1, params.delayTime);
    this.chorus.depth = Math.max(0, Math.min(1, params.depth));
  }

  public getNode(): Tone.Chorus {
    return this.chorus;
  }

  public dispose(): void {
    this.chorus.dispose();
  }
}
