// src/services/storageService.ts
import { Platform } from 'react-native';
import { PhotoRecord } from '../types/photo';

let MediaLibrary: any = null;
let FileSystem: any = null;
let Sharing: any = null;

if (Platform.OS !== 'web') {
  try {
    MediaLibrary = require('expo-media-library');
    FileSystem = require('expo-file-system');
    Sharing = require('expo-sharing');
  } catch {}
}

const LOCAL_STORAGE_KEY = 'TIMESTAMP_PRO_PHOTOS_DB';
const SYNC_QUEUE_KEY = 'TIMESTAMP_PRO_SYNC_QUEUE';

export class StorageService {
  /**
   * Save a photo record to local offline storage (IndexedDB / localStorage / FileSystem)
   */
  public static async savePhotoRecord(record: PhotoRecord): Promise<void> {
    try {
      const existing = await this.getPhotos();
      const updated = [record, ...existing.filter((p) => p.id !== record.id)];

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      }

      // Add to sync queue if status is pending
      if (record.syncStatus === 'pending') {
        await this.addToSyncQueue(record.id);
      }
    } catch (err) {
      console.error('Failed to save photo record locally:', err);
    }
  }

  /**
   * Get all photos stored on device
   */
  public static async getPhotos(): Promise<PhotoRecord[]> {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (raw) {
          return JSON.parse(raw) as PhotoRecord[];
        }
      }
    } catch (err) {
      console.warn('Error reading stored photos:', err);
    }
    return [];
  }

  /**
   * Delete a photo record locally
   */
  public static async deletePhoto(photoId: string): Promise<void> {
    const photos = await this.getPhotos();
    const filtered = photos.filter((p) => p.id !== photoId);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    }
  }

  /**
   * Save stamped photo to native device Camera Roll / Media Library or trigger Web download
   */
  public static async saveToDeviceGallery(dataUrlOrUri: string, filename?: string): Promise<{ success: boolean; message: string }> {
    try {
      const name = filename || `TIMESTAMP_PRO_${Date.now()}.jpg`;

      // 1. Web environment: Trigger instant browser download / save
      if (Platform.OS === 'web' || typeof window !== 'undefined') {
        const link = document.createElement('a');
        link.href = dataUrlOrUri;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return {
          success: true,
          message: 'Đã lưu ảnh có đóng dấu vào máy thành công!',
        };
      }

      // 2. Native mobile: Use Expo MediaLibrary and FileSystem
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        return {
          success: false,
          message: 'Chưa được cấp quyền truy cập Thư viện ảnh thiết bị.',
        };
      }

      let fileUri = dataUrlOrUri;
      if (dataUrlOrUri.startsWith('data:')) {
        const base64Code = dataUrlOrUri.split('data:image/jpeg;base64,')[1] || dataUrlOrUri.split(',')[1] || '';
        const docDir = (FileSystem as any).documentDirectory || '';
        const localPath = `${docDir}${name}`;
        await FileSystem.writeAsStringAsync(localPath, base64Code, {
          encoding: (FileSystem as any).EncodingType?.Base64 || 'base64',
        });
        fileUri = localPath;
      }

      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync('TIMESTAMP PRO', asset, false);

      return {
        success: true,
        message: 'Đã lưu vào album "TIMESTAMP PRO" trong thư viện ảnh!',
      };
    } catch (err: any) {
      console.error('Save to gallery error:', err);
      return {
        success: false,
        message: `Lỗi khi lưu ảnh: ${err.message || 'Không thể lưu'}`,
      };
    }
  }

  /**
   * Share photo using native share sheet or web navigator.share
   */
  public static async sharePhoto(photoUri: string, title?: string): Promise<void> {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && (navigator as any).share) {
        // Convert dataUrl to blob/file for web share if supported
        const res = await fetch(photoUri);
        const blob = await res.blob();
        const file = new File([blob], 'timestamp_photo.jpg', { type: 'image/jpeg' });
        if ((navigator as any).canShare && (navigator as any).canShare({ files: [file] })) {
          await (navigator as any).share({
            title: title || 'Ảnh TIMESTAMP PRO',
            files: [file],
          });
          return;
        }
      }

      if (Platform.OS !== 'web' && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(photoUri, {
          dialogTitle: title || 'Chia sẻ ảnh đóng dấu TIMESTAMP PRO',
          mimeType: 'image/jpeg',
        });
        return;
      }

      // Web fallback: download
      await this.saveToDeviceGallery(photoUri);
    } catch (err) {
      console.warn('Share cancelled or not supported:', err);
    }
  }

  /**
   * Add photo ID to offline sync queue
   */
  public static async addToSyncQueue(photoId: string): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(SYNC_QUEUE_KEY);
      const queue: string[] = raw ? JSON.parse(raw) : [];
      if (!queue.includes(photoId)) {
        queue.push(photoId);
        localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      }
    } catch {}
  }

  /**
   * Get sync queue
   */
  public static async getSyncQueue(): Promise<string[]> {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(SYNC_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
