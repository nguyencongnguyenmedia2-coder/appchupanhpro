// src/services/verificationService.ts
import { StampEngine } from './stampEngine';
import { PhotoRecord } from '../types/photo';

export interface VerificationResult {
  isValid: boolean;
  photoId: string;
  calculatedHash: string;
  storedHash: string;
  tampered: boolean;
  capturedAt: string;
  location: string;
  gpsCoordinates: string;
  gpsAccuracyMeters: number;
  author: string;
  employeeCode?: string;
  notes: string[];
  securityLevel: 'Standard' | 'Cryptographic Verified' | 'Tampered / Mismatched';
}

export class VerificationService {
  /**
   * Verify an existing photo record by recomputing its SHA-256 hash
   */
  public static async verifyPhoto(photo: PhotoRecord): Promise<VerificationResult> {
    try {
      // Recompute the hash of the stamped image data
      const currentCalculatedHash = await StampEngine.calculateSha256(photo.stampedUri);
      const isMatch = currentCalculatedHash === photo.sha256Hash;

      const latStr = `${Math.abs(photo.location.latitude).toFixed(5)}° ${photo.location.latitude >= 0 ? 'N' : 'S'}`;
      const lngStr = `${Math.abs(photo.location.longitude).toFixed(5)}° ${photo.location.longitude >= 0 ? 'E' : 'W'}`;

      const notes: string[] = [];
      if (isMatch) {
        notes.push('Dấu vân tay SHA-256 khớp 100% với bản ghi ban đầu.');
        notes.push('Không phát hiện chỉnh sửa pixel hoặc can thiệp hậu kỳ.');
      } else {
        notes.push('CẢNH BÁO: Mã hash của ảnh không khớp với mã hash được cấp lúc chụp!');
        notes.push('Ảnh có dấu hiệu đã bị nén lại, chỉnh sửa hoặc can thiệp dữ liệu.');
      }

      if (photo.location.isMocked) {
        notes.push('Lưu ý: Tọa độ GPS có dấu hiệu giả lập (Fake GPS detected).');
      } else {
        notes.push(`Tọa độ vệ tinh độ chính xác cao: ±${photo.location.accuracy}m.`);
      }

      return {
        isValid: isMatch,
        photoId: photo.id,
        calculatedHash: currentCalculatedHash,
        storedHash: photo.sha256Hash,
        tampered: !isMatch,
        capturedAt: photo.capturedAtFormatted || photo.capturedAt,
        location: photo.location.address,
        gpsCoordinates: `${latStr}, ${lngStr}`,
        gpsAccuracyMeters: photo.location.accuracy,
        author: `${photo.ownerName} (${photo.employeeCode || 'N/A'})`,
        employeeCode: photo.employeeCode,
        notes,
        securityLevel: isMatch ? 'Cryptographic Verified' : 'Tampered / Mismatched',
      };
    } catch (err: any) {
      return {
        isValid: false,
        photoId: photo.id,
        calculatedHash: 'ERROR',
        storedHash: photo.sha256Hash,
        tampered: true,
        capturedAt: photo.capturedAt,
        location: photo.location.address,
        gpsCoordinates: 'N/A',
        gpsAccuracyMeters: 0,
        author: photo.ownerName,
        notes: [`Lỗi khi giải mã chữ ký ảnh: ${err.message}`],
        securityLevel: 'Tampered / Mismatched',
      };
    }
  }
}
