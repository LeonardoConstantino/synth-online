export type OscType = 'sine' | 'square' | 'sawtooth' | 'triangle' | 'fatsawtooth';

export type FilterType = 'lowpass' | 'highpass' | 'bandpass' | 'notch';

export type LFOTarget = 'frequency' | 'filterFreq' | 'amplitude';

export type LFOType = 'sine' | 'square' | 'triangle' | 'sawtooth';

export type UIMode = 'simple' | 'expert';

export type PresetCategory = 'bass' | 'lead' | 'pad' | 'keys' | 'fx' | 'drums';

export interface ADSR {
  attack: number;   // in seconds (0.005 to 5s)
  decay: number;    // in seconds (0.01 to 4s)
  sustain: number;  // 0 to 1
  release: number;  // in seconds (0.01 to 6s)
}

export interface OscParams {
  type: OscType;
  detune: number;    // in cents (-1200 to +1200)
  volume: number;    // in dB (-30 to +6)
  fmRatio: number;   // harmonic ratio for FM (0 to 10)
  fmDepth: number;   // modulation depth (0 to 100)
}

export interface FilterParams {
  type: FilterType;
  frequency: number;       // in Hz (20 to 20000)
  resonance: number;       // Q value (0.1 to 20)
  envelopeAmount: number;  // -1 to 1 (how much ADSR modulates cutoff)
}

export interface LFOParams {
  enabled: boolean;
  rate: number;       // in Hz (0.1 to 20)
  depth: number;      // 0 to 1
  target: LFOTarget;
  type: LFOType;
}

export interface ReverbParams {
  enabled: boolean;
  wet: number;        // 0 to 1
  decay: number;      // in seconds (0.5 to 10)
  preDelay: number;   // in seconds (0.01 to 0.5)
}

export interface DelayParams {
  enabled: boolean;
  wet: number;        // 0 to 1
  delayTime: number;  // in seconds (0.05 to 1.0)
  feedback: number;   // 0 to 0.95
}

export interface ChorusParams {
  enabled: boolean;
  wet: number;        // 0 to 1
  frequency: number;  // in Hz (0.5 to 10)
  delayTime: number;  // in ms (2 to 20)
  depth: number;      // 0 to 1
}

export interface EffectsParams {
  reverb: ReverbParams;
  delay: DelayParams;
  chorus: ChorusParams;
}

export interface SynthParams {
  masterVolume: number; // in dB (-60 to 0)
  osc: OscParams;
  adsr: ADSR;
  filter: FilterParams;
  lfo: LFOParams;
  effects: EffectsParams;
}

export interface Preset {
  id: string;
  name: string;
  category: PresetCategory;
  description: string;
  featured?: boolean;
  visualGlyph?: 'pulse' | 'wave' | 'crystal' | 'sphere' | 'beam' | 'drum';
  params: SynthParams;
  createdAt: number;
  updatedAt: number;
}

export interface PadBinding {
  index: number;
  midi: number;
  noteName: string;
  key: string;
}
