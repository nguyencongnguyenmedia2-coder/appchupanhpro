// src/types/attendance.ts
export type AttendanceType = 'check_in' | 'check_out' | 'overtime_in' | 'overtime_out';
export type AttendanceStatus = 'on_time' | 'late' | 'early_leave' | 'outside_geofence';

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  employeeCode: string;
  type: AttendanceType;
  timestamp: string; // ISO string
  formattedTime: string;
  formattedDate: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    accuracy: number;
    distanceFromOfficeMeters: number;
    isWithinGeofence: boolean;
  };
  photoUri: string;
  sha256Hash: string;
  status: AttendanceStatus;
  note?: string;
}

export interface WorkplaceGeofence {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radiusMeters: number; // e.g. 250m
}
