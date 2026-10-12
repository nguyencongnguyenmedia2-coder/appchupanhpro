// src/components/views/ReportsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  BarChart3,
  Camera,
  UserCheck,
  FolderKanban,
  FileSpreadsheet,
  Printer,
  Calendar,
  Users,
  TrendingUp,
} from 'lucide-react-native';
import { usePhotoStore } from '../../stores/usePhotoStore';
import { useAttendanceStore } from '../../stores/useAttendanceStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { ReportService } from '../../services/reportService';

export const ReportsScreen: React.FC = () => {
  const { photos } = usePhotoStore();
  const { records } = useAttendanceStore();
  const { projects } = useAuthStore();

  const handleExportFullCsv = () => {
    if (photos.length === 0) {
      Alert.alert('Thông báo', 'Không có dữ liệu ảnh để xuất');
      return;
    }
    ReportService.exportPhotosCsv(photos, 'TIMESTAMP_PRO_TongHopHienTruong.csv');
  };

  const handlePrintFullPdf = () => {
    if (photos.length === 0) {
      Alert.alert('Thông báo', 'Không có dữ liệu ảnh để tạo báo cáo');
      return;
    }
    ReportService.printOrSavePdfReport('BÁO CÁO TỔNG HỢP HIỆN TRƯỜNG & CHẤM CÔNG', photos);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Báo Cáo & Thống Kê Hiện Trường</Text>
          <Text style={styles.subTitle}>Dữ liệu tổng hợp theo dự án và nhân sự</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleExportFullCsv}>
            <FileSpreadsheet size={16} color="#10B981" />
            <Text style={[styles.actionBtnText, { color: '#10B981' }]}>Excel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handlePrintFullPdf}>
            <Printer size={16} color="#38BDF8" />
            <Text style={[styles.actionBtnText, { color: '#38BDF8' }]}>PDF</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Metric Cards Row */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: 'rgba(2, 132, 199, 0.15)' }]}>
              <Camera size={20} color="#0284C7" />
            </View>
            <Text style={styles.metricNumber}>{photos.length}</Text>
            <Text style={styles.metricLabel}>Tổng Số Ảnh</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <UserCheck size={20} color="#10B981" />
            </View>
            <Text style={styles.metricNumber}>{records.length}</Text>
            <Text style={styles.metricLabel}>Lượt Chấm Công</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <FolderKanban size={20} color="#F59E0B" />
            </View>
            <Text style={styles.metricNumber}>{projects.length}</Text>
            <Text style={styles.metricLabel}>Dự Án Đang Làm</Text>
          </View>
        </View>

        {/* Breakdown by Projects */}
        <Text style={styles.sectionTitle}>Phân Bổ Ảnh Theo Dự Án:</Text>
        <View style={styles.projectList}>
          {projects.map((proj) => {
            const count = photos.filter((p) => p.projectId === proj.id).length;
            const percentage = photos.length > 0 ? Math.round((count / photos.length) * 100) : 0;
            return (
              <View key={proj.id} style={styles.projectItem}>
                <View style={styles.projectItemHeader}>
                  <Text style={styles.projectName}>{proj.name}</Text>
                  <Text style={styles.projectCount}>{count} ảnh ({percentage}%)</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${Math.max(5, percentage)}%` }]} />
                </View>
              </View>
            );
          })}
        </View>

        {/* Storage Summary */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Tình Trạng Lưu Trữ Trên Máy:</Text>
        <View style={styles.syncCard}>
          <View style={styles.syncRow}>
            <Text style={styles.syncLabel}>Ảnh lưu an toàn trên máy:</Text>
            <Text style={[styles.syncVal, { color: '#10B981' }]}>
              {photos.length} ảnh
            </Text>
          </View>
          <View style={styles.syncRow}>
            <Text style={styles.syncLabel}>Chế độ làm việc:</Text>
            <Text style={[styles.syncVal, { color: '#38BDF8' }]}>
              100% Cục Bộ (Lưu bộ nhớ điện thoại)
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subTitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  metricLabel: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 2,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 10,
  },
  projectList: {
    gap: 10,
  },
  projectItem: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  projectItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  projectCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#38BDF8',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#0F172A',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
  },
  syncCard: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 8,
  },
  syncRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  syncLabel: {
    fontSize: 12.5,
    color: '#CBD5E1',
  },
  syncVal: {
    fontSize: 12.5,
    fontWeight: 'bold',
  },
});
