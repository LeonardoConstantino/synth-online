import * as Tone from 'tone';
import { EffectsParams } from '@/types/synth';
import { ReverbEffect } from './Reverb';
import { DelayEffect } from './Delay';
import { ChorusEffect } from './Chorus';

export class EffectsChain {
  private reverb: ReverbEffect;
  private delay: DelayEffect;
  private chorus: ChorusEffect;
  private masterVolume: Tone.Volume;
  private limiter: Tone.Limiter;
  private analyser: Tone.Analyser;

  constructor(initialParams: EffectsParams, initialMasterVolume: number) {
    this.reverb = new ReverbEffect(initialParams.reverb);
    this.delay = new DelayEffect(initialParams.delay);
    this.chorus = new ChorusEffect(initialParams.chorus);
    this.masterVolume = new Tone.Volume(initialMasterVolume);
    // Limiter at -3dB protects against clipping as specified
    this.limiter = new Tone.Limiter(-3);
    // Analyser for real-time oscilloscope / spectrum visualization
    this.analyser = new Tone.Analyser('waveform', 256);

    // Audio routing chain: Reverb -> Delay -> Chorus -> Master Volume -> Limiter -> Analyser -> Destination
    this.reverb.getNode().connect(this.delay.getNode());
    this.delay.getNode().connect(this.chorus.getNode());
    this.chorus.getNode().connect(this.masterVolume);
    this.masterVolume.connect(this.limiter);
    this.limiter.connect(this.analyser);
    this.analyser.toDestination();
  }

  public getInput(): Tone.ToneAudioNode {
    return this.reverb.getNode();
  }

  public update(params: EffectsParams, masterVolumeDb: number): void {
    const now = Tone.now();
    this.reverb.update(params.reverb);
    this.delay.update(params.delay);
    this.chorus.update(params.chorus);
    this.masterVolume.volume.rampTo(Math.max(-60, Math.min(6, masterVolumeDb)), 0.05, now);
  }

  public getWaveformData(): Float32Array {
    return this.analyser.getValue() as Float32Array;
  }

  public dispose(): void {
    this.reverb.dispose();
    this.delay.dispose();
    this.chorus.dispose();
    this.masterVolume.dispose();
    this.limiter.dispose();
    this.analyser.dispose();
  }
}
