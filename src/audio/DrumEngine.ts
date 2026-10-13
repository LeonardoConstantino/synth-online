import * as Tone from 'tone';

export type DrumSoundId =
  | 'kick'
  | 'kick_808'
  | 'snare_acoustic'
  | 'snare_808'
  | 'rimshot'
  | 'clap'
  | 'hihat_closed'
  | 'hihat_open'
  | 'hihat_pedal'
  | 'tom_floor'
  | 'tom_mid'
  | 'tom_high'
  | 'crash'
  | 'ride'
  | 'ride_bell'
  | 'cowbell'
  | 'conga_low'
  | 'conga_high'
  | 'shaker';

export interface DrumPieceInfo {
  id: DrumSoundId;
  name: string;
  category: 'acoustic' | 'electronic' | 'percussion';
  padIndex: number;
  midiNote: number;
  description: string;
}

export const DRUM_KIT_PIECES: DrumPieceInfo[] = [
  { id: 'kick', name: 'Bumbo 22"', category: 'acoustic', padIndex: 0, midiNote: 36, description: 'Grave encorpado e potente' },
  { id: 'snare_acoustic', name: 'Caixa Madeira', category: 'acoustic', padIndex: 1, midiNote: 38, description: 'Corpo quente com esteira brilhante' },
  { id: 'rimshot', name: 'Rimshot', category: 'acoustic', padIndex: 2, midiNote: 37, description: 'Batida estalada no aro' },
  { id: 'clap', name: 'Palmas (Clap)', category: 'electronic', padIndex: 3, midiNote: 39, description: 'Palmas sintetizadas clássicas' },
  { id: 'hihat_closed', name: 'Chimbal Fechado', category: 'acoustic', padIndex: 4, midiNote: 42, description: 'Ataque seco e definido' },
  { id: 'hihat_pedal', name: 'Chimbal Pedal', category: 'acoustic', padIndex: 5, midiNote: 44, description: 'Som do prato fechando no pé (chick)' },
  { id: 'hihat_open', name: 'Chimbal Aberto', category: 'acoustic', padIndex: 6, midiNote: 46, description: 'Sustentação metálica brilhante' },
  { id: 'crash', name: 'Prato de Ataque', category: 'acoustic', padIndex: 7, midiNote: 49, description: 'Explosão dinâmica de início de compasso' },
  { id: 'tom_floor', name: 'Surdo de Chão', category: 'acoustic', padIndex: 8, midiNote: 41, description: 'Tambor grave para viradas pesadas' },
  { id: 'tom_mid', name: 'Tom Médio', category: 'acoustic', padIndex: 9, midiNote: 45, description: 'Tambor médio afinado' },
  { id: 'tom_high', name: 'Tom Alto', category: 'acoustic', padIndex: 10, midiNote: 48, description: 'Tom agudo de ataque' },
  { id: 'ride', name: 'Prato Condução', category: 'acoustic', padIndex: 11, midiNote: 51, description: 'Corpo limpo e ping de baqueta' },
  { id: 'ride_bell', name: 'Cúpula (Bell)', category: 'acoustic', padIndex: 12, midiNote: 53, description: 'Som focado da cúpula do ride' },
  { id: 'cowbell', name: 'Cowbell (808)', category: 'electronic', padIndex: 13, midiNote: 56, description: 'Bloco metálico marcante' },
  { id: 'conga_low', name: 'Conga / Tumba', category: 'percussion', padIndex: 14, midiNote: 64, description: 'Percussão latina encorpada' },
  { id: 'shaker', name: 'Shaker / Maraca', category: 'percussion', padIndex: 15, midiNote: 70, description: 'Pandeiro e chocalho rítmico' },
];

export class DrumEngine {
  private outputNode: Tone.ToneAudioNode;

  // Synths for drum components
  private kickSynth: Tone.MembraneSynth;
  private subKickSynth: Tone.MembraneSynth;
  private tomSynth: Tone.MembraneSynth;
  private congaSynth: Tone.MembraneSynth;

  private snareNoise: Tone.NoiseSynth;
  private snareTone: Tone.Synth;

  private hihatClosed: Tone.NoiseSynth;
  private hihatOpen: Tone.NoiseSynth;
  private clapSynth: Tone.NoiseSynth;
  private shakerSynth: Tone.NoiseSynth;

  private crashSynth: Tone.MetalSynth;
  private rideSynth: Tone.MetalSynth;
  private cowbellSynth: Tone.MetalSynth;
  private rimshotSynth: Tone.Synth;

  constructor(outputNode: Tone.ToneAudioNode) {
    this.outputNode = outputNode;

    // 1. Kicks
    this.kickSynth = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 7,
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.38,
        sustain: 0,
        release: 0.2,
      },
      volume: 3,
    }).connect(this.outputNode);

    this.subKickSynth = new Tone.MembraneSynth({
      pitchDecay: 0.08,
      octaves: 5,
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.002,
        decay: 0.75,
        sustain: 0,
        release: 0.4,
      },
      volume: 2,
    }).connect(this.outputNode);

    // 2. Toms
    this.tomSynth = new Tone.MembraneSynth({
      pitchDecay: 0.06,
      octaves: 4.5,
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.002,
        decay: 0.45,
        sustain: 0,
        release: 0.3,
      },
      volume: 1,
    }).connect(this.outputNode);

    // 3. Congas
    this.congaSynth = new Tone.MembraneSynth({
      pitchDecay: 0.04,
      octaves: 3,
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.003,
        decay: 0.25,
        sustain: 0,
        release: 0.2,
      },
      volume: 0,
    }).connect(this.outputNode);

    // 4. Snare (Body + Snare Wire Noise)
    this.snareTone = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.002,
        decay: 0.14,
        sustain: 0,
        release: 0.08,
      },
      volume: -2,
    }).connect(this.outputNode);

    this.snareNoise = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: {
        attack: 0.001,
        decay: 0.18,
        sustain: 0,
      },
      volume: 2,
    }).connect(this.outputNode);

    // 5. Rimshot
    this.rimshotSynth = new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: {
        attack: 0.001,
        decay: 0.06,
        sustain: 0,
        release: 0.04,
      },
      volume: -4,
    }).connect(this.outputNode);

    // 6. Hi-Hats
    this.hihatClosed = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: {
        attack: 0.001,
        decay: 0.045,
        sustain: 0,
      },
      volume: -3,
    }).connect(this.outputNode);

    this.hihatOpen = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: {
        attack: 0.001,
        decay: 0.35,
        sustain: 0,
      },
      volume: -2,
    }).connect(this.outputNode);

    // 7. Clap
    this.clapSynth = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: {
        attack: 0.015,
        decay: 0.22,
        sustain: 0,
      },
      volume: 0,
    }).connect(this.outputNode);

    // 8. Shaker
    this.shakerSynth = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: {
        attack: 0.008,
        decay: 0.07,
        sustain: 0,
      },
      volume: -4,
    }).connect(this.outputNode);

    // 9. Cymbals (Crash & Ride & Cowbell)
    this.crashSynth = new Tone.MetalSynth({
      envelope: {
        attack: 0.002,
        decay: 1.4,
        release: 0.4,
      },
      harmonicity: 4.8,
      modulationIndex: 32,
      resonance: 5000,
      octaves: 1.5,
      volume: -6,
    }).connect(this.outputNode);

    this.rideSynth = new Tone.MetalSynth({
      envelope: {
        attack: 0.001,
        decay: 0.6,
        release: 0.3,
      },
      harmonicity: 3.2,
      modulationIndex: 18,
      resonance: 4000,
      octaves: 1.2,
      volume: -7,
    }).connect(this.outputNode);

    this.cowbellSynth = new Tone.MetalSynth({
      envelope: {
        attack: 0.001,
        decay: 0.18,
        release: 0.1,
      },
      harmonicity: 1.5,
      modulationIndex: 12,
      resonance: 800,
      octaves: 0.8,
      volume: -4,
    }).connect(this.outputNode);
  }

  public triggerSound(soundId: DrumSoundId, velocity = 0.9): void {
    const now = Tone.now();
    const vel = Math.max(0.2, Math.min(1.0, velocity));

    switch (soundId) {
      case 'kick':
        this.kickSynth.triggerAttackRelease('C1', '8n', now, vel);
        break;

      case 'kick_808':
        this.subKickSynth.triggerAttackRelease('F0', '4n', now, vel);
        break;

      case 'snare_acoustic':
        this.snareTone.triggerAttackRelease('G2', '16n', now, vel * 0.8);
        this.snareNoise.triggerAttackRelease('16n', now, vel);
        break;

      case 'snare_808':
        this.snareTone.triggerAttackRelease('A2', '16n', now, vel * 0.7);
        this.snareNoise.triggerAttackRelease('16n', now, vel * 1.1);
        break;

      case 'rimshot':
        this.rimshotSynth.triggerAttackRelease('E4', '32n', now, vel);
        break;

      case 'clap':
        this.clapSynth.triggerAttackRelease('16n', now, vel);
        break;

      case 'hihat_closed':
        this.hihatClosed.triggerAttackRelease('32n', now, vel);
        break;

      case 'hihat_pedal':
        this.hihatClosed.triggerAttackRelease('32n', now, vel * 0.65);
        break;

      case 'hihat_open':
        this.hihatOpen.triggerAttackRelease('8n', now, vel);
        break;

      case 'tom_floor':
        this.tomSynth.triggerAttackRelease('F1', '8n', now, vel);
        break;

      case 'tom_mid':
        this.tomSynth.triggerAttackRelease('C2', '8n', now, vel);
        break;

      case 'tom_high':
        this.tomSynth.triggerAttackRelease('F2', '8n', now, vel);
        break;

      case 'crash':
        this.crashSynth.triggerAttackRelease('8n', now, vel * 0.9);
        break;

      case 'ride':
        this.rideSynth.triggerAttackRelease('16n', now, vel * 0.85);
        break;

      case 'ride_bell':
        this.rideSynth.triggerAttackRelease('32n', now, vel);
        break;

      case 'cowbell':
        this.cowbellSynth.triggerAttackRelease('16n', now, vel);
        break;

      case 'conga_low':
        this.congaSynth.triggerAttackRelease('G2', '8n', now, vel);
        break;

      case 'conga_high':
        this.congaSynth.triggerAttackRelease('C3', '8n', now, vel);
        break;

      case 'shaker':
        this.shakerSynth.triggerAttackRelease('32n', now, vel * 0.75);
        break;
    }
  }

  public triggerByPadIndex(padIndex: number, velocity = 0.9): void {
    const piece = DRUM_KIT_PIECES[padIndex % DRUM_KIT_PIECES.length];
    if (piece) {
      this.triggerSound(piece.id, velocity);
    }
  }

  public triggerByMidi(midiNote: number, velocity = 0.9): boolean {
    const piece = DRUM_KIT_PIECES.find((p) => p.midiNote === midiNote);
    if (piece) {
      this.triggerSound(piece.id, velocity);
      return true;
    }
    // Fallback based on octave offset mod 16
    const index = Math.abs(midiNote - 36) % DRUM_KIT_PIECES.length;
    this.triggerByPadIndex(index, velocity);
    return true;
  }

  public dispose(): void {
    this.kickSynth.dispose();
    this.subKickSynth.dispose();
    this.tomSynth.dispose();
    this.congaSynth.dispose();
    this.snareNoise.dispose();
    this.snareTone.dispose();
    this.rimshotSynth.dispose();
    this.hihatClosed.dispose();
    this.hihatOpen.dispose();
    this.clapSynth.dispose();
    this.shakerSynth.dispose();
    this.crashSynth.dispose();
    this.rideSynth.dispose();
    this.cowbellSynth.dispose();
  }
}
