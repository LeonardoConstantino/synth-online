import * as Tone from 'tone';
import { DelayParams } from '@/types/synth';

export class DelayEffect {
  private delay: Tone.FeedbackDelay;

  constructor(initialParams: DelayParams) {
    this.delay = new Tone.FeedbackDelay({
      delayTime: Math.max(0.01, Math.min(1.0, initialParams.delayTime)),
      feedback: Math.max(0, Math.min(0.95, initialParams.feedback)),
      wet: initialParams.enabled ? initialParams.wet : 0,
    });
  }

  public update(params: DelayParams): void {
    const now = Tone.now();
    const targetWet = params.enabled ? Math.max(0, Math.min(1, params.wet)) : 0;
    this.delay.wet.rampTo(targetWet, 0.05, now);
    this.delay.delayTime.rampTo(Math.max(0.01, Math.min(1.0, params.delayTime)), 0.05, now);
    this.delay.feedback.rampTo(Math.max(0, Math.min(0.95, params.feedback)), 0.05, now);
  }

  public getNode(): Tone.FeedbackDelay {
    return this.delay;
  }

  public dispose(): void {
    this.delay.dispose();
  }
}
