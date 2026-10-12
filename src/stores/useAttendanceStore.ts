// src/stores/useAttendanceStore.ts
import { create } from 'zustand';
import { AttendanceRecord, AttendanceType, WorkplaceGeofence } from '../types/attendance';
import { LocationService } from '../services/locationService';

// Default office location: Hoa Sen Dung Quat / Binh Son
const DEFAULT_OFFICE: WorkplaceGeofence = {
  id: 'office-1',
  name: 'Trụ Sở / Chi Nhánh Bình Sơn – Tôn Hoa Sen',
  address: 'Khu Kinh Tế Dung Quất, Xã Bình Sơn, Tỉnh Quảng Ngãi',
  latitude: 15.289412,
  longitude: 108.734208,
  radiusMeters: 300, // Valid geofence radius
};

interface AttendanceState {
  records: AttendanceRecord[];
  currentShift: 'checked_out' | 'checked_in';
  activeGeofence: WorkplaceGeofence;
  lastRecord: AttendanceRecord | null;

  recordAttendance: (params: {
    type: AttendanceType;
    userName: string;
    employeeCode: string;
    photoUri: string;
    sha256Hash: string;
    note?: string;
  }) => Promise<{ record: AttendanceRecord; isWithinGeofence: boolean; distance: number }>;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => {
  const initialRecords: AttendanceRecord[] = [
    {
      id: 'ATT-20261012-001',
      userId: 'usr-1',
      userName: 'Nguyễn Văn Minh',
      employeeCode: 'NV-2026',
      type: 'check_in',
      timestamp: '2026-10-12T08:02:14.000Z',
      formattedDate: 'Thứ Hai, 12/10/2026',
      formattedTime: '08:02:14',
      location: {
        latitude: 15.289412,
        longitude: 108.734208,
        address: 'Tôn Hoa Sen – Chi nhánh Bình Sơn, Quảng Ngãi',
        accuracy: 6,
        distanceFromOfficeMeters: 18,
        isWithinGeofence: true,
      },
      photoUri: '',
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      status: 'on_time',
      note: 'Chấm công đúng giờ ca sáng',
    },
  ];

  return {
    records: initialRecords,
    currentShift: 'checked_in',
    activeGeofence: DEFAULT_OFFICE,
    lastRecord: initialRecords[0],

    recordAttendance: async (params) => {
      const loc = await LocationService.getCurrentLocation();
      const office = get().activeGeofence;
      const distance = LocationService.calculateDistance(
        loc.latitude,
        loc.longitude,
        office.latitude,
        office.longitude
      );
      const isWithin = distance <= office.radiusMeters;

      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const timeStr = `${hours}:${minutes}:${seconds}`;
      const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

      const newRecord: AttendanceRecord = {
        id: `ATT-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`,
        userId: 'usr-1',
        userName: params.userName,
        employeeCode: params.employeeCode,
        type: params.type,
        timestamp: now.toISOString(),
        formattedTime: timeStr,
        formattedDate: dateStr,
        location: {
          latitude: loc.latitude,
          longitude: loc.longitude,
          address: loc.address,
          accuracy: loc.accuracy,
          distanceFromOfficeMeters: distance,
          isWithinGeofence: isWithin,
        },
        photoUri: params.photoUri,
        sha256Hash: params.sha256Hash,
        status: !isWithin ? 'outside_geofence' : 'on_time',
        note: params.note || (isWithin ? 'Hợp lệ trong bán kính' : `Ngoài bán kính cho phép (${distance}m > ${office.radiusMeters}m)`),
      };

      set((state) => ({
        records: [newRecord, ...state.records],
        currentShift: params.type === 'check_in' ? 'checked_in' : 'checked_out',
        lastRecord: newRecord,
      }));

      return { record: newRecord, isWithinGeofence: isWithin, distance };
    },
  };
});
