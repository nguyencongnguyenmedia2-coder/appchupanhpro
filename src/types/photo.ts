// src/types/photo.ts
export type SyncStatus = 'saved_local' | 'local_only' | 'pending' | 'synced';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  address: string;
  subPremise?: string;
  street?: string;
  ward?: string;
  district?: string;
  city?: string;
  provider?: string;
  isMocked?: boolean;
}

export interface PhotoRecord {
  id: string; // TSP-20261012-XXXX
  ownerId?: string;
  ownerName: string;
  employeeCode?: string;
  projectId?: string;
  projectName: string;
  teamId?: string;
  teamName?: string;
  originalUri?: string;
  stampedUri: string; // The real burned image URI / data URL
  capturedAt: string; // ISO string
  capturedAtFormatted: string; // e.g. "10:46:25 - Thứ Hai, 12 Tháng 10, 2026"
  location: LocationData;
  note?: string;
  templateId: string;
  templateName: string;
  sha256Hash: string; // Cryptographic hash of the stamped image
  fileSizeBytes?: number;
  width?: number;
  height?: number;
  syncStatus: SyncStatus;
  syncedAt?: string;
  verificationStatus?: 'verified' | 'tampered' | 'unverified';
}

export interface StampConfig {
  showTime: boolean;
  showDate: boolean;
  showAddress: boolean;
  showCoordinates: boolean;
  showProject: boolean;
  showNote: boolean;
  showEmployee: boolean;
  showVerificationBadge: boolean;
  showLogo: boolean;
  customTitle?: string;
  customNote?: string;
  customProject?: string;
  accentColor: string; // e.g., '#F59E0B' (amber/yellow)
  textColor: string; // e.g., '#FFFFFF'
  backgroundColor: string; // e.g., 'rgba(0, 0, 0, 0.65)'
  fontSize: 'small' | 'medium' | 'large';
  position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}
