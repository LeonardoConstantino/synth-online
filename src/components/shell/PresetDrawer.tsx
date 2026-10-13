import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { usePresets } from '@/hooks/usePresets';
import { useUIStore } from '@/store/uiStore';
import { Preset, PresetCategory } from '@/types/synth';
import { Search, X, Plus, Trash2, Check, Lock, Music2, Radio } from 'lucide-react';

interface PresetDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PresetDrawer: React.FC<PresetDrawerProps> = ({ open, onOpenChange }) => {
  const { presets, activePresetId, apply, save, remove } = usePresets();
  const mode = useUIStore((s) => s.mode);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetCategory, setNewPresetCategory] = useState<PresetCategory>('lead');
  const [newPresetDesc, setNewPresetDesc] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // In simple mode, show featured presets and custom user presets
  const filteredPresets = presets.filter((preset) => {
    if (mode === 'simple' && !preset.featured && preset.id.startsWith('preset-')) {
      return false;
    }
    const matchesSearch =
      preset.name.toLowerCase().includes(search.toLowerCase()) ||
      preset.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || preset.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;

    await save(newPresetName, newPresetCategory, newPresetDesc);
    setSaveSuccess(true);
    setNewPresetName('');
    setNewPresetDesc('');
    setTimeout(() => {
      setSaveSuccess(false);
      setIsSaving(false);
    }, 1200);
  };

  const getGlyphSvg = (glyph?: string) => {
    switch (glyph) {
      case 'pulse':
        return (
          <svg className="w-5 h-5 text-[#8B5CF6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h4l3 9 4-18 3 9h4" />
          </svg>
        );
      case 'wave':
        return (
          <svg className="w-5 h-5 text-[#5DE4FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 12c3-4 6-4 9 0s6 4 9 0" />
          </svg>
        );
      case 'crystal':
        return (
          <svg className="w-5 h-5 text-[#BFA7FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 2 12 12 22 22 12" />
          </svg>
        );
      case 'sphere':
        return (
          <svg className="w-5 h-5 text-[#8B5CF6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        );
      case 'drum':
        return (
          <svg className="w-5 h-5 text-[#5DE4FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <ellipse cx="12" cy="8" rx="8" ry="4" />
            <path d="M4 8v8c0 2.21 3.58 4 8 4s8-1.79 8-4V8" />
            <path d="M4 12c0 2.21 3.58 4 8 4s8-1.79 8-4" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-[#5DE4FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="12" y1="4" x2="12" y2="20" />
          </svg>
        );
    }
  };

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'drums', label: 'Bateria / Drums' },
    { id: 'bass', label: 'Bass' },
    { id: 'lead', label: 'Lead' },
    { id: 'pad', label: 'Pad' },
    { id: 'keys', label: 'Keys' },
    { id: 'fx', label: 'FX' },
  ];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 transition-opacity" />
        <Dialog.Content
          className="fixed top-0 right-0 h-full w-full max-w-md bg-[#09070D] border-l border-[#211735] p-6 z-50 shadow-2xl flex flex-col focus:outline-none overflow-hidden"
          aria-describedby="preset-drawer-desc"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#211735]">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-[#8B5CF6]" />
              <Dialog.Title className="text-lg font-display font-semibold text-[#F3F0F7] tracking-tight">
                Biblioteca de Sons
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                className="p-1 text-neutral-400 hover:text-white rounded-md hover:bg-[#12101A] transition-colors"
                aria-label="Fechar gaveta de presets"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <p id="preset-drawer-desc" className="text-xs text-neutral-400 mt-2">
            Selecione um timbre ou grave sua própria configuração no banco IndexedDB local.
          </p>

          {/* Action to Save current preset */}
          {!isSaving ? (
            <button
              onClick={() => setIsSaving(true)}
              className="mt-4 flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-[#F3F0F7] bg-[#12101A] border border-[#211735] hover:border-[#8B5CF6] hover:bg-[#211735]/40 rounded-lg transition-all"
            >
              <Plus className="w-4 h-4 text-[#8B5CF6]" />
              <span>Salvar Timbre Atual Como Preset</span>
            </button>
          ) : (
            <form onSubmit={handleSave} className="mt-4 p-3 bg-[#12101A] border border-[#8B5CF6]/40 rounded-lg flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-200">Novo Preset</span>
                <button
                  type="button"
                  onClick={() => setIsSaving(false)}
                  className="text-neutral-400 hover:text-white text-xs"
                >
                  Cancelar
                </button>
              </div>

              <input
                type="text"
                placeholder="Nome do Preset (ex: Nebula Lead)"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                required
                className="px-2.5 py-1.5 bg-[#09070D] border border-[#211735] rounded text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-[#8B5CF6]"
              />

              <div className="flex gap-2">
                <select
                  value={newPresetCategory}
                  onChange={(e) => setNewPresetCategory(e.target.value as PresetCategory)}
                  className="px-2 py-1.5 bg-[#09070D] border border-[#211735] rounded text-xs text-neutral-200 focus:outline-none focus:border-[#8B5CF6]"
                >
                  <option value="lead">Lead</option>
                  <option value="bass">Bass</option>
                  <option value="pad">Pad</option>
                  <option value="keys">Keys</option>
                  <option value="drums">Bateria</option>
                  <option value="fx">FX</option>
                </select>

                <input
                  type="text"
                  placeholder="Descrição rápida"
                  value={newPresetDesc}
                  onChange={(e) => setNewPresetDesc(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-[#09070D] border border-[#211735] rounded text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <button
                type="submit"
                disabled={saveSuccess}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#8B5CF6] hover:bg-[#7c4ee4] text-white text-xs font-medium rounded transition-colors"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Salvo com sucesso!
                  </>
                ) : (
                  'Confirmar e Salvar'
                )}
              </button>
            </form>
          )}

          {/* Search bar */}
          <div className="relative mt-4">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nome ou descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#12101A] border border-[#211735] rounded-lg text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>

          {/* Category filter tabs */}
          <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 text-xs rounded transition-colors whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-[#211735] text-[#8B5CF6] font-medium border border-[#8B5CF6]/30'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Preset list */}
          <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-2">
            {filteredPresets.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-500">
                Nenhum timbre encontrado para esse filtro.
              </div>
            ) : (
              filteredPresets.map((preset) => {
                const isActive = preset.id === activePresetId;
                return (
                  <div
                    key={preset.id}
                    onClick={() => apply(preset)}
                    className={`group relative p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                      isActive
                        ? 'bg-[#12101A] border-[#8B5CF6] shadow-sm ring-1 ring-[#8B5CF6]/30'
                        : 'bg-[#12101A]/60 border-[#211735] hover:border-[#8B5CF6]/40 hover:bg-[#12101A]'
                    }`}
                  >
                    <div className="mt-0.5 p-2 rounded bg-[#09070D] border border-[#211735]">
                      {getGlyphSvg(preset.visualGlyph)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-neutral-100 truncate">
                            {preset.name}
                          </h4>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                            {preset.category}
                          </span>
                        </div>
                        {isActive && (
                          <span className="text-[10px] font-mono text-[#5DE4FF] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#5DE4FF]" />
                            Ativo
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                        {preset.description}
                      </p>
                    </div>

                    {/* Delete action for custom presets */}
                    {!preset.featured ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          remove(preset.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-rose-400 transition-opacity"
                        title="Excluir preset customizado"
                        aria-label={`Excluir ${preset.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-neutral-600" title="Preset padrão de fábrica">
                        <Lock className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
