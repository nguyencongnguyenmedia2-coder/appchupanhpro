// src/components/camera/StampOverlay.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LocationData } from '../../types/photo';
import { useTemplateStore } from '../../stores/useTemplateStore';
import { StampEngine } from '../../services/stampEngine';
import { useAuthStore } from '../../stores/useAuthStore';
import { Edit3 } from 'lucide-react-native';

interface StampOverlayProps {
  location: LocationData;
  onEditPress?: () => void;
}

export const StampOverlay: React.FC<StampOverlayProps> = ({ location, onEditPress }) => {
  const { activeConfig, getActiveTemplate } = useTemplateStore();
  const { currentProject, user } = useAuthStore();
  const template = getActiveTemplate();

  const [currentTime, setCurrentTime] = useState<{ shortTimeStr: string; dateStr: string }>({
    shortTimeStr: '10:46',
    dateStr: 'Thứ Hai, 12 Tháng 10, 2026',
  });

  // Keep live time synced every second
  useEffect(() => {
    const update = () => {
      const { shortTimeStr, dateStr } = StampEngine.getVietnameseDateTime(new Date());
      setCurrentTime({ shortTimeStr, dateStr });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const latStr = `${Math.abs(location.latitude).toFixed(5)}° ${location.latitude >= 0 ? 'N' : 'S'}`;
  const lngStr = `${Math.abs(location.longitude).toFixed(5)}° ${location.longitude >= 0 ? 'E' : 'W'}`;

  return (
    <View style={styles.wrapper}>
      {/* Stamp Card with Yellow accent bar on left */}
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: activeConfig.backgroundColor || 'rgba(15, 23, 42, 0.78)' },
        ]}
        onPress={onEditPress}
        activeOpacity={0.9}
      >
        {/* Yellow Accent Bar */}
        <View
          style={[
            styles.accentBar,
            { backgroundColor: activeConfig.accentColor || '#F59E0B' },
          ]}
        />

        <View style={styles.contentContainer}>
          {/* Header row with Time and optional edit icon */}
          <View style={styles.rowBetween}>
            {activeConfig.showTime && (
              <Text style={styles.timeText}>{currentTime.shortTimeStr}</Text>
            )}
            {onEditPress && (
              <View style={styles.editBadge}>
                <Edit3 size={12} color="#CBD5E1" />
                <Text style={styles.editText}>Sửa</Text>
              </View>
            )}
          </View>

          {/* Vietnamese Date */}
          {activeConfig.showDate && (
            <Text style={styles.dateText}>{currentTime.dateStr}</Text>
          )}

          {/* Title / Facility / Address */}
          {activeConfig.showAddress && (
            <View style={styles.addressSection}>
              <Text style={styles.facilityText} numberOfLines={1}>
                {activeConfig.customTitle || 'Tôn Hoa Sen – Chi nhánh Bình Sơn'}
              </Text>
              <Text style={styles.addressText} numberOfLines={2}>
                {location.address || 'Long Bình Hamlet, X. Bình Sơn, Quảng Ngãi'}
              </Text>
            </View>
          )}

          {/* GPS Coordinates */}
          {activeConfig.showCoordinates && (
            <Text style={styles.gpsText}>
              {`Tọa độ: ${latStr}, ${lngStr} (±${location.accuracy}m)`}
            </Text>
          )}

          {/* Project name */}
          {activeConfig.showProject && (
            <Text style={styles.projectText} numberOfLines={1}>
              {`Dự án: ${activeConfig.customProject || currentProject.name}`}
            </Text>
          )}

          {/* Employee name / code */}
          {activeConfig.showEmployee && (
            <Text style={styles.employeeText}>
              {`Nhân viên: ${user.fullName} [${user.employeeCode}]`}
            </Text>
          )}

          {/* Custom Note */}
          {activeConfig.showNote && (activeConfig.customNote || template.defaultConfig.customNote) && (
            <Text style={styles.noteText} numberOfLines={2}>
              {`Ghi chú: ${activeConfig.customNote || template.defaultConfig.customNote}`}
            </Text>
          )}

          {/* Verification Badge */}
          {activeConfig.showVerificationBadge && (
            <Text style={styles.badgeText}>
              {template.badgeText || '✓ Ảnh ghi nhận thời gian và vị trí'}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    maxWidth: 420,
    zIndex: 20,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 8,
  },
  accentBar: {
    width: 5,
    borderRadius: 3,
    marginRight: 10,
  },
  contentContainer: {
    flex: 1,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  editBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  editText: {
    fontSize: 10,
    color: '#E2E8F0',
    marginLeft: 3,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
    marginBottom: 4,
  },
  addressSection: {
    marginVertical: 2,
  },
  facilityText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FDE047', // Warm yellow accent
  },
  addressText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#F1F5F9',
    lineHeight: 15,
  },
  gpsText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#93C5FD',
    marginTop: 2,
  },
  projectText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#E2E8F0',
    marginTop: 2,
  },
  employeeText: {
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 1,
  },
  noteText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#E2E8F0',
    marginTop: 2,
  },
  badgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#34D399', // Emerald
    marginTop: 4,
  },
});
