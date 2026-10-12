// src/types/auth.ts
export type SubscriptionTier = 'free' | 'plus' | 'enterprise';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  phoneNumber?: string;
  employeeCode: string;
  department: string;
  role: 'admin' | 'manager' | 'staff';
  currentOrganizationId?: string;
  currentOrganizationName?: string;
  currentTeamId?: string;
  currentTeamName?: string;
  subscriptionTier: SubscriptionTier;
  storageUsedBytes: number;
  storageQuotaBytes: number; // e.g. 5GB, 50GB, Unlimited
  isVip: boolean;
}

export interface Team {
  id: string;
  name: string;
  code: string; // Invite code e.g. "SEN-889"
  organizationId: string;
  description: string;
  memberCount: number;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  locationAddress: string;
  latitude?: number;
  longitude?: number;
  status: 'active' | 'completed' | 'paused';
  totalPhotos: number;
  managerName: string;
}
