// src/components/views/AttendanceScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  UserCheck,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  Building,
  LogIn,
  LogOut,
} from 'lucide-react-native';
import { useAttendanceStore } from '../../stores/useAttendanceStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { ReportService } from '../../services/reportService';
import { LocationService } from '../../services/locationService';

export const AttendanceScreen: React.FC = () => {
  const { records, currentShift, activeGeofence, recordAttendance } = useAttendanceStore();
  const { user } = useAuthStore();

  const [isProcessing, setIsProcessing] = useState(false);

  const handlePunchAttendance = async (type: 'check_in' | 'check_out') => {
    setIsProcessing(true);
    try {
      const res = await recordAttendance({
        type,
        userName: user.fullName,
        employeeCode: user.employeeCode,
        photoUri: '',
        sha256Hash: `att_hash_${Date.now().toString(16)}`,
      });

      if (res.isWithinGeofence) {
        Alert.alert(
          'Thành Công',
          `Đã ghi nhận ${type === 'check_in' ? 'VÀO CA' : 'TAN CA'} thành công!\nKhoảng cách: ${res.distance}m (Hợp lệ trong bán kính ${activeGeofence.radiusMeters}m).`
        );
      } else {
        Alert.alert(
          'CẢNH BÁO BÁN KÍNH GPS',
          `Vị trí hiện tại của bạn cách văn phòng ${res.distance}m (Vượt quá bán kính quy định ${activeGeofence.radiusMeters}m). Bản ghi đã được đánh dấu vi phạm ngoại tuyến để người quản lý duyệt.`
        );
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể chấm công');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportCsv = () => {
    if (records.length === 0) {
      Alert.alert('Thông báo', 'Chưa có bản ghi chấm công nào để xuất.');
      return;
    }
    ReportService.exportAttendanceCsv(records);
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Chấm Công & Giám Sát Ca</Text>
          <Text style={styles.subTitle}>
            Xác thực định vị GPS Geofence & Thời gian thực
          </Text>
        </View>

        <TouchableOpacity style={styles.exportBtn} onPress={handleExportCsv} activeOpacity={0.8}>
          <FileSpreadsheet size={16} color="#10B981" />
          <Text style={styles.exportBtnText}>Xuất Excel</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Office Geofence Info Card */}
        <View style={styles.geofenceCard}>
          <View style={styles.geofenceHeader}>
            <Building size={18} color="#F59E0B" />
            <Text style={styles.officeTitle}>{activeGeofence.name}</Text>
          </View>
          <Text style={styles.officeAddress}>📍 {activeGeofence.address}</Text>
          <View style={styles.radiusPill}>
            <MapPin size={13} color="#38BDF8" />
            <Text style={styles.radiusText}>
              Bán kính điểm danh cho phép: ≤ {activeGeofence.radiusMeters} mét
            </Text>
          </View>
        </View>

        {/* Big Action Buttons Row: Check In & Check Out */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.punchBtn, styles.checkInBtn]}
            onPress={() => handlePunchAttendance('check_in')}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <LogIn size={26} color="#FFFFFF" />
                <Text style={styles.punchBtnText}>VÀO CA</Text>
                <Text style={styles.punchBtnSub}>Chụp ảnh & Điểm danh</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.punchBtn, styles.checkOutBtn]}
            onPress={() => handlePunchAttendance('check_out')}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <LogOut size={26} color="#FFFFFF" />
                <Text style={styles.punchBtnText}>TAN CA</Text>
                <Text style={styles.punchBtnSub}>Xác nhận kết ca</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Current status pill */}
        <View style={styles.statusBox}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>
            Trạng thái hiện tại: {currentShift === 'checked_in' ? 'Đang trong ca làm việc' : 'Đã tan ca'}
          </Text>
        </View>

        {/* Attendance History Section */}
        <Text style={styles.historyHeading}>
          Lịch Sử Chấm Công Gần Đây ({records.length} lượt):
        </Text>

        <View style={styles.historyList}>
          {records.map((rec) => {
            const isCheckIn = rec.type === 'check_in';
            const isGood = rec.location.isWithinGeofence;
            return (
              <View key={rec.id} style={styles.historyItem}>
                <View
                  style={[
                    styles.typeIcon,
                    isCheckIn ? styles.typeCheckIn : styles.typeCheckOut,
                  ]}
                >
                  {isCheckIn ? (
                    <LogIn size={16} color="#FFFFFF" />
                  ) : (
                    <LogOut size={16} color="#FFFFFF" />
                  )}
                </View>

                <View style={{ flex: 1, marginLeft: 10 }}>
                  <View style={styles.historyItemHeader}>
                    <Text style={styles.historyType}>
                      {isCheckIn ? 'Chấm công Vào Ca' : 'Chấm công Tan Ca'}
                    </Text>
                    <Text style={styles.historyTime}>{rec.formattedTime}</Text>
                  </View>

                  <Text style={styles.historyDate}>{rec.formattedDate}</Text>
                  <Text style={styles.historyAddress} numberOfLines={1}>
                    📍 {rec.location.address}
                  </Text>

                  <View style={styles.badgeRow}>
                    <View
                      style={[
                        styles.geoBadge,
                        isGood ? styles.geoBadgeValid : styles.geoBadgeInvalid,
                      ]}
                    >
                      {isGood ? (
                        <CheckCircle2 size={11} color="#10B981" />
                      ) : (
                        <AlertTriangle size={11} color="#EF4444" />
                      )}
                      <Text
                        style={[
                          styles.geoBadgeText,
                          { color: isGood ? '#10B981' : '#EF4444' },
                        ]}
                      >
                        {isGood
                          ? `Hợp lệ (${rec.location.distanceFromOfficeMeters}m)`
                          : `Ngoài bán kính (${rec.location.distanceFromOfficeMeters}m)`}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
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
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subTitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  exportBtnText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  geofenceCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  geofenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  officeTitle: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  officeAddress: {
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 6,
  },
  radiusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  radiusText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 6,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  punchBtn: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  checkInBtn: {
    backgroundColor: '#059669', // Emerald
  },
  checkOutBtn: {
    backgroundColor: '#DC2626', // Red
  },
  punchBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 6,
  },
  punchBtnSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    marginTop: 2,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 14,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  statusText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  historyHeading: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 22,
    marginBottom: 10,
  },
  historyList: {
    gap: 10,
  },
  historyItem: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#334155',
  },
  typeIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeCheckIn: {
    backgroundColor: '#059669',
  },
  typeCheckOut: {
    backgroundColor: '#DC2626',
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyType: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  historyTime: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: 'bold',
  },
  historyDate: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 1,
  },
  historyAddress: {
    color: '#CBD5E1',
    fontSize: 11.5,
    marginTop: 4,
  },
  badgeRow: {
    marginTop: 6,
  },
  geoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  geoBadgeValid: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  geoBadgeInvalid: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  geoBadgeText: {
    fontSize: 10.5,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});
