// src/stores/useTemplateStore.ts
import { create } from 'zustand';
import { PRESET_TEMPLATES, StampTemplate } from '../types/template';
import { StampConfig } from '../types/photo';

interface TemplateState {
  templates: StampTemplate[];
  selectedTemplateId: string;
  activeConfig: StampConfig;

  setSelectedTemplate: (templateId: string) => void;
  updateActiveConfig: (partial: Partial<StampConfig>) => void;
  getActiveTemplate: () => StampTemplate;
}

export const useTemplateStore = create<TemplateState>((set, get) => {
  const initialTemplate = PRESET_TEMPLATES[0]; // Construction template default matching user reference

  return {
    templates: PRESET_TEMPLATES,
    selectedTemplateId: initialTemplate.id,
    activeConfig: { ...initialTemplate.defaultConfig },

    setSelectedTemplate: (templateId: string) => {
      const found = get().templates.find((t) => t.id === templateId) || initialTemplate;
      set({
        selectedTemplateId: found.id,
        activeConfig: { ...found.defaultConfig },
      });
    },

    updateActiveConfig: (partial: Partial<StampConfig>) => {
      set((state) => ({
        activeConfig: { ...state.activeConfig, ...partial },
      }));
    },

    getActiveTemplate: () => {
      const state = get();
      return state.templates.find((t) => t.id === state.selectedTemplateId) || PRESET_TEMPLATES[0];
    },
  };
});
