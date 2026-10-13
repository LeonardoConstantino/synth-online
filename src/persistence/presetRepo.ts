import { getDB } from './db';
import { Preset } from '@/types/synth';
import { DEFAULT_PRESETS } from '@/synth/presets/defaults';

export const presetRepo = {
  async getAll(): Promise<Preset[]> {
    const db = await getDB();
    let presets = await db.getAll('presets');

    // If empty, seed default presets
    if (!presets || presets.length === 0) {
      const tx = db.transaction('presets', 'readwrite');
      for (const preset of DEFAULT_PRESETS) {
        await tx.store.put(preset);
      }
      await tx.done;
      presets = await db.getAll('presets');
    } else {
      // Ensure all default presets exist and factory presets are updated
      const existingMap = new Map(presets.map(p => [p.id, p]));
      for (const def of DEFAULT_PRESETS) {
        const existing = existingMap.get(def.id);
        // If missing or if it's a factory preset, sync latest definition
        if (!existing || existing.featured) {
          await db.put('presets', def);
        }
      }
      presets = await db.getAll('presets');
    }

    return presets;
  },

  async getById(id: string): Promise<Preset | undefined> {
    const db = await getDB();
    return db.get('presets', id);
  },

  async save(preset: Preset): Promise<void> {
    const db = await getDB();
    const toSave: Preset = {
      ...preset,
      updatedAt: Date.now(),
      createdAt: preset.createdAt || Date.now(),
    };
    await db.put('presets', toSave);
  },

  async delete(id: string): Promise<boolean> {
    const db = await getDB();
    const existing = await db.get('presets', id);
    if (!existing) return false;

    // Never delete featured default presets as required by Section 10 & 14
    if (existing.featured) {
      console.warn('Cannot delete a default featured preset');
      return false;
    }

    await db.delete('presets', id);
    return true;
  },
};
