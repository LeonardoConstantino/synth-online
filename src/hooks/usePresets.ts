import { useEffect, useCallback } from 'react';
import { usePresetStore } from '@/store/presetStore';
import { useUIStore } from '@/store/uiStore';
import { Preset, PresetCategory } from '@/types/synth';
import { getSynthEngine } from './useSynth';

export function usePresets() {
  const presets = usePresetStore((s) => s.presets);
  const activePresetId = usePresetStore((s) => s.activePresetId);
  const isLoading = usePresetStore((s) => s.isLoading);
  const error = usePresetStore((s) => s.error);
  const loadPresets = usePresetStore((s) => s.loadPresets);
  const applyPresetAction = usePresetStore((s) => s.applyPreset);
  const saveAction = usePresetStore((s) => s.saveCurrentAsPreset);
  const deleteAction = usePresetStore((s) => s.deletePreset);

  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  const activePreset = presets.find((p) => p.id === activePresetId) || presets[0] || null;

  const apply = useCallback(
    (preset: Preset) => {
      applyPresetAction(preset);
      const engine = getSynthEngine();
      const isDrum = preset.category === 'drums';
      engine.setDrumMode(isDrum);
      if (isDrum) {
        useUIStore.getState().setActiveInputTab('pads');
      }
    },
    [applyPresetAction]
  );

  const save = useCallback(
    async (name: string, category: PresetCategory, description: string) => {
      return saveAction(name, category, description);
    },
    [saveAction]
  );

  const remove = useCallback(
    async (id: string) => {
      return deleteAction(id);
    },
    [deleteAction]
  );

  return {
    presets,
    activePreset,
    activePresetId,
    isLoading,
    error,
    apply,
    save,
    remove,
  };
}
