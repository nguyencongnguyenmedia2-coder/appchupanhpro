// src/stores/useAuthStore.ts
import { create } from 'zustand';
import { UserProfile, Team, Project, SubscriptionTier } from '../types/auth';

interface AuthState {
  user: UserProfile;
  currentTeam: Team;
  currentProject: Project;
  teams: Team[];
  projects: Project[];
  isOfflineMode: boolean;

  setSubscriptionTier: (tier: SubscriptionTier) => void;
  switchTeam: (teamId: string) => void;
  switchProject: (projectId: string) => void;
  joinTeamByCode: (code: string) => Promise<{ success: boolean; message: string }>;
  toggleOfflineMode: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const initialTeams: Team[] = [
    {
      id: 'team-1',
      name: 'Đội Giám Sát Hiện Trường Miền Trung',
      code: 'SEN-889',
      organizationId: 'org-1',
      description: 'Chuyên trách kiểm tra tiến độ và nghiệm thu công trình Tôn Hoa Sen',
      memberCount: 14,
    },
    {
      id: 'team-2',
      name: 'Tổ Quản Lý Kho & Vận Tải Dung Quất',
      code: 'KHO-441',
      organizationId: 'org-1',
      description: 'Quản lý xuất nhập tồn và bàn giao hàng hóa logistic',
      memberCount: 8,
    },
  ];

  const initialProjects: Project[] = [
    {
      id: 'proj-1',
      code: 'CT-2026',
      name: 'Nhà Xưởng Tôn Hoa Sen – Dung Quất Mở Rộng',
      locationAddress: 'Khu Kinh Tế Dung Quất, Bình Sơn, Quảng Ngãi',
      latitude: 15.289412,
      longitude: 108.734208,
      status: 'active',
      totalPhotos: 248,
      managerName: 'Kỹ Sư Trần Tuấn Anh',
    },
    {
      id: 'proj-2',
      code: 'CH-102',
      name: 'Hệ Thống Phân Phối Đại Lý Cấp 1 Miền Trung',
      locationAddress: 'Thành phố Quảng Ngãi',
      status: 'active',
      totalPhotos: 120,
      managerName: 'Lê Hoàng Long',
    },
  ];

  return {
    user: {
      id: 'usr-1',
      email: 'minh.nguyen@hoasengroup.vn',
      fullName: 'Nguyễn Văn Minh',
      employeeCode: 'NV-2026',
      department: 'Ban Quản Lý Dự Án & Kỹ Thuật Hiện Trường',
      role: 'manager',
      currentOrganizationId: 'org-1',
      currentOrganizationName: 'TẬP ĐOÀN HOA SEN',
      currentTeamId: 'team-1',
      currentTeamName: 'Đội Giám Sát Hiện Trường Miền Trung',
      subscriptionTier: 'plus', // Plus tier unlocked
      storageUsedBytes: 420 * 1024 * 1024, // 420 MB
      storageQuotaBytes: 15 * 1024 * 1024 * 1024, // 15 GB
      isVip: true,
    },
    currentTeam: initialTeams[0],
    currentProject: initialProjects[0],
    teams: initialTeams,
    projects: initialProjects,
    isOfflineMode: false,

    setSubscriptionTier: (tier) =>
      set((state) => ({
        user: { ...state.user, subscriptionTier: tier, isVip: tier !== 'free' },
      })),

    switchTeam: (teamId) => {
      const found = get().teams.find((t) => t.id === teamId);
      if (found) {
        set((state) => ({
          currentTeam: found,
          user: { ...state.user, currentTeamId: found.id, currentTeamName: found.name },
        }));
      }
    },

    switchProject: (projectId) => {
      const found = get().projects.find((p) => p.id === projectId);
      if (found) {
        set({ currentProject: found });
      }
    },

    joinTeamByCode: async (code) => {
      const trimmed = code.trim().toUpperCase();
      const existing = get().teams.find((t) => t.code.toUpperCase() === trimmed);
      if (existing) {
        get().switchTeam(existing.id);
        return { success: true, message: `Đã kết nối thành công vào nhóm: "${existing.name}"` };
      }
      return { success: false, message: 'Mã nhóm không hợp lệ hoặc đã hết hạn.' };
    },

    toggleOfflineMode: () => set((state) => ({ isOfflineMode: !state.isOfflineMode })),
  };
});
