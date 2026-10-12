// src/components/camera/CameraTopBar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import {
  Menu,
  Zap,
  ZapOff,
  ShieldCheck,
  Crown,
  SwitchCamera,
  Users,
} from 'lucide-react-native';
import { useCameraStore } from '../../stores/useCameraStore';
import { useAuthStore } from '../../stores/useAuthStore';

export const CameraTopBar: React.FC = () => {
  const {
    flashMode,
    toggleFlash,
    toggleCameraFacing,
    setShowVerifyModal,
    setShowVipModal,
    setShowTeamModal,
    setShowSettingsDrawer,
  } = useCameraStore();

  const { currentTeam, user } = useAuthStore();

  return (
    <View style={styles.container}>
      {/* Top action row: White background, black icons as requested */}
      <View style={styles.iconRow}>
        {/* Menu button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setShowSettingsDrawer(true)}
          accessibilityLabel="Menu"
          activeOpacity={0.7}
        >
          <Menu size={22} color="#0F172A" />
        </TouchableOpacity>

        {/* Flash button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={toggleFlash}
          accessibilityLabel="Flash"
          activeOpacity={0.7}
        >
          {flashMode === 'off' ? (
            <ZapOff size={22} color="#475569" />
          ) : (
            <Zap size={22} color="#EAB308" fill="#FDE047" />
          )}
          {flashMode === 'auto' && <Text style={styles.flashBadge}>A</Text>}
        </TouchableOpacity>

        {/* Photo Authenticity / Integrity Inspector */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setShowVerifyModal(true)}
          accessibilityLabel="Xác thực ảnh"
          activeOpacity={0.7}
        >
          <ShieldCheck size={22} color="#10B981" />
        </TouchableOpacity>

        {/* VIP / Plus Upgrade button */}
        <TouchableOpacity
          style={[styles.iconButton, styles.vipButton]}
          onPress={() => setShowVipModal(true)}
          accessibilityLabel="Gói VIP"
          activeOpacity={0.7}
        >
          <Crown size={20} color="#D97706" fill="#FBBF24" />
          <Text style={styles.vipText}>{user.isVip ? 'VIP' : 'Nâng cấp'}</Text>
        </TouchableOpacity>

        {/* Flip Camera front / back */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={toggleCameraFacing}
          accessibilityLabel="Chuyển camera"
          activeOpacity={0.7}
        >
          <SwitchCamera size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Sub-bar: "Đăng nhập vào nhóm" button (light blue accent pill) */}
      <View style={styles.teamBar}>
        <TouchableOpacity
          style={styles.teamPill}
          onPress={() => setShowTeamModal(true)}
          activeOpacity={0.8}
        >
          <Users size={15} color="#0284C7" />
          <Text style={styles.teamPillText} numberOfLines={1}>
            {currentTeam ? currentTeam.name : 'Đăng nhập vào nhóm'}
          </Text>
          <View style={styles.teamDot} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingTop: Platform.OS === 'ios' ? 44 : 8,
    paddingBottom: 6,
    paddingHorizontal: 12,
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  flashBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  vipButton: {
    flexDirection: 'row',
    width: 'auto',
    paddingHorizontal: 12,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  vipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
    marginLeft: 4,
  },
  teamBar: {
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 4,
  },
  teamPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE', // Light blue accent as requested
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 14,
    maxWidth: '90%',
  },
  teamPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284C7',
    marginLeft: 6,
    marginRight: 6,
  },
  teamDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
});
