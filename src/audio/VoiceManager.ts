import * as Tone from 'tone';
import { SynthParams } from '@/types/synth';
import { midiToFreq } from '@/input/midiMap';

export interface ActiveVoice {
  midi: number;
  synth: Tone.Synth<Tone.SynthOptions> | Tone.FMSynth;
  startedAt: number;
  releaseTimeout?: ReturnType<typeof setTimeout>;
}

export class VoiceManager {
  private activeVoices: Map<number, ActiveVoice> = new Map();
  private maxVoices = 16;
  private outputNode: Tone.ToneAudioNode;

  constructor(outputNode: Tone.ToneAudioNode) {
    this.outputNode = outputNode;
  }

  public setOutput(outputNode: Tone.ToneAudioNode): void {
    this.outputNode = outputNode;
  }

  public noteOn(midi: number, velocity: number, params: SynthParams): void {
    const now = Tone.now();

    // If note is already sounding, release old one first
    if (this.activeVoices.has(midi)) {
      this.killVoice(midi);
    }

    // Voice stealing: if 16 active voices, steal the oldest one
    if (this.activeVoices.size >= this.maxVoices) {
      let oldestMidi: number | null = null;
      let oldestTime = Infinity;

      for (const [m, voice] of this.activeVoices.entries()) {
        if (voice.startedAt < oldestTime) {
          oldestTime = voice.startedAt;
          oldestMidi = m;
        }
      }

      if (oldestMidi !== null) {
        this.killVoice(oldestMidi);
      }
    }

    // Create voice instance based on FM or standard oscillator
    const freq = midiToFreq(midi);
    const oscType = params.osc.type;
    const detune = params.osc.detune;

    const useFM = params.osc.fmDepth > 2 && params.osc.fmRatio > 0;

    let synth: Tone.Synth<Tone.SynthOptions> | Tone.FMSynth;

    if (useFM) {
      synth = new Tone.FMSynth({
        harmonicity: Math.max(0.1, params.osc.fmRatio),
        modulationIndex: params.osc.fmDepth,
        oscillator: {
          type: (oscType === 'fatsawtooth' ? 'sawtooth' : oscType) as 'sine' | 'square' | 'triangle' | 'sawtooth',
        },
        envelope: {
          attack: Math.max(0.005, params.adsr.attack),
          decay: Math.max(0.01, params.adsr.decay),
          sustain: Math.max(0, Math.min(1, params.adsr.sustain)),
          release: Math.max(0.01, params.adsr.release),
        },
        modulation: {
          type: 'sine',
        },
        modulationEnvelope: {
          attack: Math.max(0.005, params.adsr.attack),
          decay: Math.max(0.01, params.adsr.decay * 1.5),
          sustain: Math.max(0, Math.min(1, params.adsr.sustain * 0.8)),
          release: Math.max(0.01, params.adsr.release),
        },
        volume: params.osc.volume,
      });
    } else {
      synth = new Tone.Synth({
        oscillator: {
          type: (oscType === 'fatsawtooth' ? 'fatsawtooth' : oscType) as any,
        },
        envelope: {
          attack: Math.max(0.005, params.adsr.attack),
          decay: Math.max(0.01, params.adsr.decay),
          sustain: Math.max(0, Math.min(1, params.adsr.sustain)),
          release: Math.max(0.01, params.adsr.release),
        },
        volume: params.osc.volume,
      });
    }

    if (detune !== 0) {
      synth.detune.setValueAtTime(detune, now);
    }

    synth.connect(this.outputNode);
    synth.triggerAttack(freq, now, Math.max(0.1, Math.min(1, velocity)));

    this.activeVoices.set(midi, {
      midi,
      synth,
      startedAt: now,
    });
  }

  public noteOff(midi: number, releaseTime: number): void {
    const voice = this.activeVoices.get(midi);
    if (!voice) return;

    const now = Tone.now();
    try {
      voice.synth.triggerRelease(now);
    } catch {
      // Ignore if already triggered
    }

    // Schedule cleanup after release duration + small buffer
    const cleanupDelayMs = (releaseTime + 0.1) * 1000;
    voice.releaseTimeout = setTimeout(() => {
      this.killVoice(midi);
    }, cleanupDelayMs);
  }

  public killVoice(midi: number): void {
    const voice = this.activeVoices.get(midi);
    if (!voice) return;

    if (voice.releaseTimeout) {
      clearTimeout(voice.releaseTimeout);
    }

    try {
      voice.synth.disconnect();
      voice.synth.dispose();
    } catch {
      // Ignore errors during dispose
    }

    this.activeVoices.delete(midi);
  }

  public allNotesOff(): void {
    for (const midi of Array.from(this.activeVoices.keys())) {
      this.killVoice(midi);
    }
  }

  public getActiveNotes(): number[] {
    return Array.from(this.activeVoices.keys());
  }

  public dispose(): void {
    this.allNotesOff();
  }
}
