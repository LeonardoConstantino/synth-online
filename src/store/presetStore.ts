import { create } from 'zustand';
import { Preset, PresetCategory, SynthParams } from '@/types/synth';
import { presetRepo } from '@/persistence/presetRepo';
import { useSynthStore } from './synthStore';
import { DEFAULT_PRESETS } from '@/synth/presets/defaults';

interface PresetStoreState {
  presets: Preset[];
  activePresetId: string;
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;

  loadPresets: (force?: boolean) => Promise<void>;
  applyPreset: (preset: Preset) => void;
  saveCurrentAsPreset: (name: string, category: PresetCategory, description: string) => Promise<Preset>;
  deletePreset: (id: string) => Promise<boolean>;
}

export const usePresetStore = create<PresetStoreState>((set, get) => ({
  presets: DEFAULT_PRESETS,
  activePresetId: DEFAULT_PRESETS[0].id,
  isLoading: false,
  isLoaded: false,
  error: null,

  loadPresets: async (force = false) => {
    if (get().isLoaded && !force) return;
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const presets = await presetRepo.getAll();
      set({ presets, isLoading: false, isLoaded: true });
    } catch (err: any) {
      console.error('Failed to load presets:', err);
      set({ error: err.message || 'Error loading presets', isLoading: false });
    }
  },

  applyPreset: (preset: Preset) => {
    // 1. Update synth parameters in synthStore
    useSynthStore.getState().setAllParams(preset.params);
    // 2. Mark active preset id
    set({ activePresetId: preset.id });
  },

  saveCurrentAsPreset: async (name: string, category: PresetCategory, description: string) => {
    const currentParams = useSynthStore.getState().params;
    const newPreset: Preset = {
      id: `custom-${Date.now()}`,
      name: name.trim() || 'Meu Som',
      category,
      description: description.trim() || 'Preset criado pelo usuário.',
      featured: false,
      visualGlyph: 'crystal',
      params: JSON.parse(JSON.stringify(currentParams)),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await presetRepo.save(newPreset);
    set((state) => ({
      presets: [newPreset, ...state.presets],
      activePresetId: newPreset.id,
    }));

    return newPreset;
  },

  deletePreset: async (id: string) => {
    const success = await presetRepo.delete(id);
    if (success) {
      set((state) => ({
        presets: state.presets.filter((p) => p.id !== id),
        activePresetId: state.activePresetId === id ? DEFAULT_PRESETS[0].id : state.activePresetId,
      }));
    }
    return success;
  },
}));
