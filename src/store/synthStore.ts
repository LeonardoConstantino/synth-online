import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { SynthParams, OscType, FilterType, LFOTarget, LFOType, ADSR, ReverbParams, DelayParams, ChorusParams } from '@/types/synth';
import { DEFAULT_PRESETS } from '@/synth/presets/defaults';

export interface SynthStoreState {
  params: SynthParams;
  setOscType: (type: OscType) => void;
  setOscDetune: (detune: number) => void;
  setOscVolume: (volume: number) => void;
  setOscFM: (fmRatio: number, fmDepth: number) => void;
  setADSR: (adsr: Partial<ADSR>) => void;
  setFilterType: (type: FilterType) => void;
  setFilterFreq: (frequency: number) => void;
  setFilterResonance: (resonance: number) => void;
  setFilterEnvelopeAmount: (amount: number) => void;
  setLFOEnabled: (enabled: boolean) => void;
  setLFORate: (rate: number) => void;
  setLFODepth: (depth: number) => void;
  setLFOTarget: (target: LFOTarget) => void;
  setLFOType: (type: LFOType) => void;
  setEffectReverb: (reverb: Partial<ReverbParams>) => void;
  setEffectDelay: (delay: Partial<DelayParams>) => void;
  setEffectChorus: (chorus: Partial<ChorusParams>) => void;
  setMasterVolume: (vol: number) => void;
  setAllParams: (params: SynthParams) => void;
}

const initialParams: SynthParams = { ...DEFAULT_PRESETS[0].params };

export const useSynthStore = create<SynthStoreState>()(
  subscribeWithSelector((set) => ({
    params: initialParams,

    setOscType: (type) =>
      set((state) => ({
        params: {
          ...state.params,
          osc: { ...state.params.osc, type },
        },
      })),

    setOscDetune: (detune) =>
      set((state) => ({
        params: {
          ...state.params,
          osc: { ...state.params.osc, detune },
        },
      })),

    setOscVolume: (volume) =>
      set((state) => ({
        params: {
          ...state.params,
          osc: { ...state.params.osc, volume },
        },
      })),

    setOscFM: (fmRatio, fmDepth) =>
      set((state) => ({
        params: {
          ...state.params,
          osc: { ...state.params.osc, fmRatio, fmDepth },
        },
      })),

    setADSR: (adsr) =>
      set((state) => ({
        params: {
          ...state.params,
          adsr: { ...state.params.adsr, ...adsr },
        },
      })),

    setFilterType: (type) =>
      set((state) => ({
        params: {
          ...state.params,
          filter: { ...state.params.filter, type },
        },
      })),

    setFilterFreq: (frequency) =>
      set((state) => ({
        params: {
          ...state.params,
          filter: { ...state.params.filter, frequency },
        },
      })),

    setFilterResonance: (resonance) =>
      set((state) => ({
        params: {
          ...state.params,
          filter: { ...state.params.filter, resonance },
        },
      })),

    setFilterEnvelopeAmount: (envelopeAmount) =>
      set((state) => ({
        params: {
          ...state.params,
          filter: { ...state.params.filter, envelopeAmount },
        },
      })),

    setLFOEnabled: (enabled) =>
      set((state) => ({
        params: {
          ...state.params,
          lfo: { ...state.params.lfo, enabled },
        },
      })),

    setLFORate: (rate) =>
      set((state) => ({
        params: {
          ...state.params,
          lfo: { ...state.params.lfo, rate },
        },
      })),

    setLFODepth: (depth) =>
      set((state) => ({
        params: {
          ...state.params,
          lfo: { ...state.params.lfo, depth },
        },
      })),

    setLFOTarget: (target) =>
      set((state) => ({
        params: {
          ...state.params,
          lfo: { ...state.params.lfo, target },
        },
      })),

    setLFOType: (type) =>
      set((state) => ({
        params: {
          ...state.params,
          lfo: { ...state.params.lfo, type },
        },
      })),

    setEffectReverb: (reverb) =>
      set((state) => ({
        params: {
          ...state.params,
          effects: {
            ...state.params.effects,
            reverb: { ...state.params.effects.reverb, ...reverb },
          },
        },
      })),

    setEffectDelay: (delay) =>
      set((state) => ({
        params: {
          ...state.params,
          effects: {
            ...state.params.effects,
            delay: { ...state.params.effects.delay, ...delay },
          },
        },
      })),

    setEffectChorus: (chorus) =>
      set((state) => ({
        params: {
          ...state.params,
          effects: {
            ...state.params.effects,
            chorus: { ...state.params.effects.chorus, ...chorus },
          },
        },
      })),

    setMasterVolume: (masterVolume) =>
      set((state) => ({
        params: {
          ...state.params,
          masterVolume,
        },
      })),

    setAllParams: (params) =>
      set(() => ({
        params: { ...params },
      })),
  }))
);
