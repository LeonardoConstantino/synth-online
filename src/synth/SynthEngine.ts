import * as Tone from 'tone';
import { SynthParams } from '@/types/synth';
import { FilterEngine } from '@/audio/Filter';
import { EffectsChain } from '@/audio/effects/EffectsChain';
import { VoiceManager } from '@/audio/VoiceManager';
import { LFOEngine } from '@/audio/LFO';
import { DrumEngine, DrumSoundId } from '@/audio/DrumEngine';

export class SynthEngine {
  private filter: FilterEngine;
  private effectsChain: EffectsChain;
  private voiceManager: VoiceManager;
  private lfo: LFOEngine;
  private drumEngine: DrumEngine;
  private currentParams: SynthParams;
  private isDrumMode = false;
  private isDisposed = false;

  constructor(initialParams: SynthParams) {
    this.currentParams = { ...initialParams };

    // 1. Effects Chain (Reverb -> Delay -> Chorus -> MasterVol -> Limiter -> Analyser -> Destination)
    this.effectsChain = new EffectsChain(initialParams.effects, initialParams.masterVolume);

    // 2. Filter Engine
    this.filter = new FilterEngine(initialParams.filter);
    // Connect Filter output to EffectsChain input
    this.filter.getNode().connect(this.effectsChain.getInput());

    // 3. Voice Manager (voices output to Filter input)
    this.voiceManager = new VoiceManager(this.filter.getNode());

    // 4. LFO Engine (modulates filter detune in cents when target is filterFreq)
    this.lfo = new LFOEngine(initialParams.lfo);
    if (initialParams.lfo.enabled && initialParams.lfo.target === 'filterFreq') {
      this.lfo.connectTarget(this.filter.getDetuneParam());
    }

    // 5. Drum Engine (connected to EffectsChain input to share master processing & effects)
    this.drumEngine = new DrumEngine(this.effectsChain.getInput());
  }

  public setDrumMode(isDrum: boolean): void {
    this.isDrumMode = isDrum;
  }

  public getDrumMode(): boolean {
    return this.isDrumMode;
  }

  public triggerDrum(soundId: DrumSoundId, velocity = 0.9): void {
    if (this.isDisposed) return;
    this.drumEngine.triggerSound(soundId, velocity);
  }

  public triggerDrumPad(padIndex: number, velocity = 0.9): void {
    if (this.isDisposed) return;
    this.drumEngine.triggerByPadIndex(padIndex, velocity);
  }

  public noteOn(midi: number, velocity = 0.8): void {
    if (this.isDisposed) return;

    // If drum mode is active, trigger drum element
    if (this.isDrumMode) {
      this.drumEngine.triggerByMidi(midi, velocity);
      return;
    }

    // Trigger synth voice
    this.voiceManager.noteOn(midi, velocity, this.currentParams);

    // Trigger filter envelope
    const now = Tone.now();
    this.filter.triggerEnvelope(
      now,
      0.5,
      this.currentParams.adsr.attack,
      this.currentParams.adsr.decay,
      this.currentParams.adsr.sustain
    );
  }

  public noteOff(midi: number): void {
    if (this.isDisposed) return;

    // Drums are oneshot percussive hits, only synth voices need noteOff release
    if (this.isDrumMode) return;

    this.voiceManager.noteOff(midi, this.currentParams.adsr.release);

    // If no more voices, release filter envelope
    if (this.voiceManager.getActiveNotes().length <= 1) {
      const now = Tone.now();
      this.filter.releaseEnvelope(now, this.currentParams.adsr.release);
    }
  }

  public allNotesOff(): void {
    if (this.isDisposed) return;
    this.voiceManager.allNotesOff();
  }

  public updateParams(params: SynthParams): void {
    if (this.isDisposed) return;

    this.currentParams = { ...params };

    // Update filter
    this.filter.update(params.filter);

    // Update effects chain & master volume
    this.effectsChain.update(params.effects, params.masterVolume);

    // Update LFO
    if (params.lfo.enabled) {
      if (params.lfo.target === 'filterFreq') {
        this.lfo.update(params.lfo, this.filter.getDetuneParam());
      } else {
        this.lfo.update(params.lfo);
      }
    } else {
      this.lfo.stop();
    }
  }

  public getWaveformData(): Float32Array {
    if (this.isDisposed) return new Float32Array(256);
    return this.effectsChain.getWaveformData();
  }

  public dispose(): void {
    this.isDisposed = true;
    this.drumEngine.dispose();
    this.voiceManager.dispose();
    this.lfo.dispose();
    this.filter.dispose();
    this.effectsChain.dispose();
  }
}
