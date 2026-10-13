import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Preset } from '@/types/synth';

export interface SynthDBSchema extends DBSchema {
  presets: {
    key: string;
    value: Preset;
    indexes: { 'by-category': string };
  };
  settings: {
    key: string;
    value: { key: string; value: any };
  };
}

const DB_NAME = 'synth-online-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<SynthDBSchema>> | null = null;

export function getDB(): Promise<IDBPDatabase<SynthDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<SynthDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('presets')) {
          const presetStore = db.createObjectStore('presets', { keyPath: 'id' });
          presetStore.createIndex('by-category', 'category');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}
