// src/components/modals/SettingsDrawer.tsx
import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  X,
  User,
  Shield,
  HardDrive,
  WifiOff,
  LogOut,
  Building2,
  BadgePercent,
  Sliders,
  HelpCircle,
} from 'lucide-react-native';
import { useAuthStore } from '../../stores/useAuthStore';
import { useCameraStore } from '../../stores/useCameraStore';

interface SettingsDrawerProps {
  visible: boolean;
  onClose: () => void;
  onOpenAdmin?: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  visible,
  onClose,
  onOpenAdmin,
}) => {
  const { user, isOfflineMode, toggleOfflineMode } = useAuthStore();
  const { setShowVipModal } = useCameraStore();

  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    if (mb < 1000) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  const percentUsed = Math.min(
    100,
    Math.round((user.storageUsedBytes / user.storageQuotaBytes) * 100)
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user.fullName.substring(0, 1)}</Text>
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.userName}>{user.fullName}</Text>
                <Text style={styles.userRole}>
                  {user.role === 'admin' ? 'Quản Trị Viên' : 'Kỹ Sư Giám Sát'} • {user.employeeCode}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 24 }}>
            {/* Storage Quota Card */}
            <View style={styles.quotaCard}>
              <View style={styles.quotaHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <HardDrive size={16} color="#38BDF8" />
                  <Text style={styles.quotaTitle}>Dung Lượng Lưu Trữ</Text>
                </View>
                <Text style={styles.quotaVal}>
                  {formatBytes(user.storageUsedBytes)} / {formatBytes(user.storageQuotaBytes)}
                </Text>
              </View>

              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${percentUsed}%` }]} />
              </View>

              <Text style={styles.quotaSub}>
                Đã sử dụng {percentUsed}% bộ nhớ thiết bị lưu ảnh an toàn.
              </Text>
            </View>

            {/* Offline Mode Indicator */}
            <View style={styles.settingRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <WifiOff size={18} color="#10B981" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.settingLabel}>Lưu Trữ 100% Cục Bộ Trên Máy</Text>
                  <Text style={styles.settingSub}>
                    Ảnh và dữ liệu lưu trực tiếp trên điện thoại, không cần tải lên máy chủ ngoài
                  </Text>
                </View>
              </View>
            </View>

            {/* Department info */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Building2 size={16} color="#94A3B8" />
                <Text style={styles.infoKey}>Doanh nghiệp:</Text>
                <Text style={styles.infoVal}>{user.currentOrganizationName || 'TẬP ĐOÀN HOA SEN'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Shield size={16} color="#94A3B8" />
                <Text style={styles.infoKey}>Phòng ban:</Text>
                <Text style={styles.infoVal}>{user.department}</Text>
              </View>
              <View style={styles.infoRow}>
                <BadgePercent size={16} color="#94A3B8" />
                <Text style={styles.infoKey}>Gói bản quyền:</Text>
                <Text style={[styles.infoVal, { color: '#F59E0B', fontWeight: 'bold' }]}>
                  {user.subscriptionTier.toUpperCase()} (VIP)
                </Text>
              </View>
            </View>

            {/* Web Admin Portal Entry */}
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                onClose();
                onOpenAdmin?.();
              }}
              activeOpacity={0.7}
            >
              <Sliders size={18} color="#0284C7" />
              <Text style={[styles.actionRowText, { color: '#38BDF8' }]}>
                Mở Trang Quản Trị Doanh Nghiệp (Admin Portal)
              </Text>
            </TouchableOpacity>

            {/* Upgrade VIP */}
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                onClose();
                setShowVipModal(true);
              }}
              activeOpacity={0.7}
            >
              <BadgePercent size={18} color="#F59E0B" />
              <Text style={styles.actionRowText}>Nâng Cấp Gói / Gia Hạn Bản Quyền</Text>
            </TouchableOpacity>

            {/* Support */}
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() =>
                Alert.alert(
                  'Hỗ Trợ Kỹ Thuật',
                  'Hotline kỹ thuật TIMESTAMP PRO: 1900 6868\nEmail: hotro@timestamppro.vn'
                )
              }
              activeOpacity={0.7}
            >
              <HelpCircle size={18} color="#94A3B8" />
              <Text style={styles.actionRowText}>Hướng Dẫn Sử Dụng & Trợ Giúp</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Footer Logout */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => Alert.alert('Đăng xuất', 'Bạn đang ở chế độ làm việc công trường.')}
              activeOpacity={0.7}
            >
              <LogOut size={16} color="#EF4444" />
              <Text style={styles.logoutBtnText}>Đăng Xuất Tài Khoản</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userRole: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 18,
    backgroundColor: '#1E293B',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  quotaCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  quotaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quotaTitle: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
  quotaVal: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#0F172A',
    borderRadius: 3,
    marginVertical: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
  },
  quotaSub: {
    color: '#94A3B8',
    fontSize: 11,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  settingSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoKey: {
    color: '#94A3B8',
    fontSize: 12,
    marginLeft: 8,
    width: 100,
  },
  infoVal: {
    color: '#E2E8F0',
    fontSize: 12,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  actionRowText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 12,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 6,
  },
});
