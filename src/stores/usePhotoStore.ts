// src/stores/usePhotoStore.ts
import { create } from 'zustand';
import { PhotoRecord } from '../types/photo';
import { StorageService } from '../services/storageService';

interface PhotoState {
  photos: PhotoRecord[];
  activeCapturedPhoto: PhotoRecord | null;
  isLoading: boolean;
  isSavingToDevice: boolean;
  filterProject: string;
  searchQuery: string;

  loadStoredPhotos: () => Promise<void>;
  setActiveCapturedPhoto: (photo: PhotoRecord | null) => void;
  saveCapturedPhoto: (photo: PhotoRecord, saveToGalleryNow?: boolean) => Promise<void>;
  deletePhoto: (photoId: string) => Promise<void>;
  setFilterProject: (project: string) => void;
  setSearchQuery: (query: string) => void;
  backupAllPhotosToDevice: () => Promise<{ savedCount: number }>;
}

export const usePhotoStore = create<PhotoState>((set, get) => ({
  photos: [],
  activeCapturedPhoto: null,
  isLoading: false,
  isSavingToDevice: false,
  filterProject: 'all',
  searchQuery: '',

  loadStoredPhotos: async () => {
    set({ isLoading: true });
    try {
      const records = await StorageService.getPhotos();
      set({ photos: records });
    } finally {
      set({ isLoading: false });
    }
  },

  setActiveCapturedPhoto: (photo) => set({ activeCapturedPhoto: photo }),

  saveCapturedPhoto: async (photo, saveToGalleryNow = true) => {
    // 1. Save to local storage database
    const localRecord: PhotoRecord = {
      ...photo,
      syncStatus: 'saved_local',
    };
    await StorageService.savePhotoRecord(localRecord);

    // 2. Automatically save stamped file to device camera roll / media library
    if (saveToGalleryNow) {
      try {
        await StorageService.saveToDeviceGallery(
          localRecord.stampedUri,
          `${localRecord.id}.jpg`
        );
      } catch (err) {
        console.warn('Auto save to gallery warning:', err);
      }
    }

    set((state) => ({
      photos: [localRecord, ...state.photos.filter((p) => p.id !== localRecord.id)],
      activeCapturedPhoto: localRecord,
    }));
  },

  deletePhoto: async (photoId) => {
    await StorageService.deletePhoto(photoId);
    set((state) => ({
      photos: state.photos.filter((p) => p.id !== photoId),
      activeCapturedPhoto: state.activeCapturedPhoto?.id === photoId ? null : state.activeCapturedPhoto,
    }));
  },

  setFilterProject: (project) => set({ filterProject: project }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  backupAllPhotosToDevice: async () => {
    set({ isSavingToDevice: true });
    try {
      const photos = get().photos;
      let count = 0;
      for (const p of photos) {
        await StorageService.saveToDeviceGallery(p.stampedUri, `${p.id}.jpg`);
        count++;
      }
      return { savedCount: count };
    } finally {
      set({ isSavingToDevice: false });
    }
  },
}));
