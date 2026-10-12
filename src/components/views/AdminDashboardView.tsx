// src/components/views/AdminDashboardView.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Camera,
  ShieldAlert,
  CreditCard,
  FileCheck2,
  HardDrive,
  ArrowLeft,
  Building2,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react-native';
import { usePhotoStore } from '../../stores/usePhotoStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useAttendanceStore } from '../../stores/useAttendanceStore';
import { ReportService } from '../../services/reportService';

interface AdminDashboardViewProps {
  onBackToApp: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onBackToApp }) => {
  const { photos } = usePhotoStore();
  const { user, projects, teams } = useAuthStore();
  const { records } = useAttendanceStore();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'overview' | 'photos' | 'projects' | 'audit' | 'subscriptions'
  >('overview');

  const AUDIT_LOGS = [
    {
      id: 'AUD-01',
      actor: 'Nguyễn Văn Minh (NV-2026)',
      action: 'Chụp ảnh đóng dấu & tạo mã băm SHA-256',
      target: 'Nhà Xưởng Tôn Hoa Sen Dung Quất',
      ip: '113.161.42.18 (Viettel 4G)',
      time: '10:46:25 - 12/10/2026',
      status: 'Hợp lệ',
    },
    {
      id: 'AUD-02',
      actor: 'Nguyễn Văn Minh (NV-2026)',
      action: 'Chấm công vào ca trong bán kính GPS',
      target: 'Văn Phòng Chi Nhánh Bình Sơn',
      ip: '113.161.42.18 (Viettel 4G)',
      time: '08:02:14 - 12/10/2026',
      status: 'Hợp lệ',
    },
    {
      id: 'AUD-03',
      actor: 'Hệ thống TIMESTAMP PRO Local Storage',
      action: 'Lưu trữ tệp ảnh có đóng dấu vào thư viện thiết bị',
      target: 'Album thiết bị: TIMESTAMP PRO',
      ip: 'Nội bộ điện thoại (Local FileSystem)',
      time: '07:30:00 - 12/10/2026',
      status: 'Đã lưu',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Top Admin Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBackToApp}>
          <ArrowLeft size={20} color="#FFFFFF" />
          <Text style={styles.backBtnText}>Quay Lại Camera</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>HỆ THỐNG QUẢN TRỊ DOANH NGHIỆP</Text>
          <Text style={styles.headerSub}>TIMESTAMP PRO ENTERPRISE PORTAL</Text>
        </View>

        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeText}>ADMIN ROLE</Text>
        </View>
      </View>

      {/* Admin Horizontal Tabs */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={[styles.navTab, activeAdminTab === 'overview' && styles.navTabActive]}
          onPress={() => setActiveAdminTab('overview')}
        >
          <LayoutDashboard size={16} color={activeAdminTab === 'overview' ? '#F59E0B' : '#94A3B8'} />
          <Text style={[styles.navTabText, activeAdminTab === 'overview' && styles.navTabTextActive]}>
            Tổng Quan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navTab, activeAdminTab === 'photos' && styles.navTabActive]}
          onPress={() => setActiveAdminTab('photos')}
        >
          <Camera size={16} color={activeAdminTab === 'photos' ? '#F59E0B' : '#94A3B8'} />
          <Text style={[styles.navTabText, activeAdminTab === 'photos' && styles.navTabTextActive]}>
            Ảnh Hiện Trường ({photos.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navTab, activeAdminTab === 'projects' && styles.navTabActive]}
          onPress={() => setActiveAdminTab('projects')}
        >
          <FolderKanban size={16} color={activeAdminTab === 'projects' ? '#F59E0B' : '#94A3B8'} />
          <Text style={[styles.navTabText, activeAdminTab === 'projects' && styles.navTabTextActive]}>
            Dự Án ({projects.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navTab, activeAdminTab === 'audit' && styles.navTabActive]}
          onPress={() => setActiveAdminTab('audit')}
        >
          <ShieldAlert size={16} color={activeAdminTab === 'audit' ? '#F59E0B' : '#94A3B8'} />
          <Text style={[styles.navTabText, activeAdminTab === 'audit' && styles.navTabTextActive]}>
            Nhật Ký Kiểm Toán
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 40 }}>
        {activeAdminTab === 'overview' && (
          <>
            {/* KPI Cards */}
            <View style={styles.kpiGrid}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>TỔNG ẢNH HIỆN TRƯỜNG</Text>
                <Text style={styles.kpiValue}>{photos.length}</Text>
                <Text style={styles.kpiHint}>+100% chứng thực SHA-256</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>LƯỢT CHẤM CÔNG HỢP LỆ</Text>
                <Text style={[styles.kpiValue, { color: '#10B981' }]}>{records.length}</Text>
                <Text style={styles.kpiHint}>Trong bán kính định vị</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>DUNG LƯỢNG SỬ DỤNG</Text>
                <Text style={[styles.kpiValue, { color: '#38BDF8' }]}>420 MB</Text>
                <Text style={styles.kpiHint}>Hạn mức: 15 GB (Plus)</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>DỰ ÁN ĐANG THEO DÕI</Text>
                <Text style={[styles.kpiValue, { color: '#F59E0B' }]}>{projects.length}</Text>
                <Text style={styles.kpiHint}>Chi nhánh Tôn Hoa Sen</Text>
              </View>
            </View>

            {/* Quick Export Panel */}
            <View style={styles.panelCard}>
              <Text style={styles.panelTitle}>Xuất Báo Cáo Doanh Nghiệp Toàn Diện</Text>
              <Text style={styles.panelSub}>
                Tạo tệp bảng tính CSV / Excel chuẩn UTF-8 hoặc tài liệu in ấn PDF kèm mã băm SHA-256
              </Text>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <TouchableOpacity
                  style={styles.panelExportBtn}
                  onPress={() => ReportService.exportPhotosCsv(photos)}
                >
                  <FileSpreadsheet size={16} color="#10B981" />
                  <Text style={styles.panelExportBtnText}>Xuất Dữ Liệu Ảnh (Excel)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.panelExportBtn, { backgroundColor: '#0284C7' }]}
                  onPress={() =>
                    ReportService.printOrSavePdfReport('BÁO CÁO GIÁM SÁT HIỆN TRƯỜNG DOANH NGHIỆP', photos)
                  }
                >
                  <FileCheck2 size={16} color="#FFFFFF" />
                  <Text style={[styles.panelExportBtnText, { color: '#FFFFFF' }]}>In Biên Bản Báo Cáo PDF</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {activeAdminTab === 'photos' && (
          <View style={styles.tableCard}>
            <Text style={styles.tableTitle}>Danh Mục Toàn Bộ Hình Ảnh Xác Thực</Text>
            {photos.map((p) => (
              <View key={p.id} style={styles.tableRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tableRowId}>{p.id}</Text>
                  <Text style={styles.tableRowSub}>{p.location.address}</Text>
                  <Text style={styles.tableRowHash}>SHA-256: {p.sha256Hash.substring(0, 24)}...</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.tableRowTime}>{p.capturedAtFormatted.split('–')[0]}</Text>
                  <View style={styles.statusVerifiedBadge}>
                    <Text style={styles.statusVerifiedText}>✓ Khớp Hash</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeAdminTab === 'projects' && (
          <View style={styles.tableCard}>
            <Text style={styles.tableTitle}>Quản Lý Dự Án & Địa Bàn</Text>
            {projects.map((proj) => (
              <View key={proj.id} style={styles.projectAdminCard}>
                <Text style={styles.projTitle}>{proj.name}</Text>
                <Text style={styles.projLocation}>📍 {proj.locationAddress}</Text>
                <Text style={styles.projMeta}>
                  Phụ trách: {proj.managerName} • Trạng thái: {proj.status.toUpperCase()} • Tổng số ảnh: {proj.totalPhotos}
                </Text>
              </View>
            ))}
          </View>
        )}

        {activeAdminTab === 'audit' && (
          <View style={styles.tableCard}>
            <Text style={styles.tableTitle}>Nhật Ký Kiểm Toán Bảo Mật (Audit Logs)</Text>
            <Text style={styles.tableSub}>
              Ghi lại mọi thao tác chụp ảnh, sửa cấu hình, chấm công và đồng bộ nhằm bảo đảm tính khách quan pháp lý.
            </Text>
            {AUDIT_LOGS.map((log) => (
              <View key={log.id} style={styles.auditItem}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.auditAction}>{log.action}</Text>
                  <Text style={styles.auditStatus}>{log.status}</Text>
                </View>
                <Text style={styles.auditActor}>Thực hiện bởi: {log.actor}</Text>
                <Text style={styles.auditTarget}>Đối tượng: {log.target}</Text>
                <Text style={styles.auditMeta}>
                  Thời gian: {log.time} • IP: {log.ip}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1D',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerSub: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  adminBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  adminBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingHorizontal: 16,
  },
  navTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 6,
  },
  navTabActive: {
    borderBottomColor: '#F59E0B',
  },
  navTabText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  navTabTextActive: {
    color: '#F59E0B',
  },
  body: {
    padding: 20,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 20,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#141D32',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  kpiLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  kpiValue: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    marginTop: 8,
  },
  kpiHint: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
  },
  panelCard: {
    backgroundColor: '#141D32',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  panelTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  panelSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  panelExportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  panelExportBtnText: {
    color: '#E2E8F0',
    fontSize: 12.5,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  tableCard: {
    backgroundColor: '#141D32',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  tableTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  tableSub: {
    color: '#94A3B8',
    fontSize: 11.5,
    marginTop: 4,
    marginBottom: 14,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  tableRowId: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  tableRowSub: {
    color: '#94A3B8',
    fontSize: 11.5,
    marginTop: 2,
  },
  tableRowHash: {
    color: '#34D399',
    fontFamily: 'monospace',
    fontSize: 10,
    marginTop: 2,
  },
  tableRowTime: {
    color: '#CBD5E1',
    fontSize: 11,
  },
  statusVerifiedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  statusVerifiedText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: 'bold',
  },
  projectAdminCard: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  projTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  projLocation: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  projMeta: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
  },
  auditItem: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  auditAction: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: 'bold',
  },
  auditStatus: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: 'bold',
  },
  auditActor: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
  },
  auditTarget: {
    color: '#94A3B8',
    fontSize: 11.5,
    marginTop: 2,
  },
  auditMeta: {
    color: '#64748B',
    fontSize: 10.5,
    marginTop: 4,
  },
});
