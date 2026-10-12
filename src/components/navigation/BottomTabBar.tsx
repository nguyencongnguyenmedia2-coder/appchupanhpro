// src/components/navigation/BottomTabBar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import {
  BarChart3,
  Video,
  Camera,
  UserCheck,
  ListFilter,
} from 'lucide-react-native';
import { useCameraStore, BottomTabType } from '../../stores/useCameraStore';

interface TabItem {
  id: BottomTabType;
  label: string;
  icon: React.ComponentType<{ size: number; color: string }>;
}

const TABS: TabItem[] = [
  { id: 'reports', label: 'Báo cáo', icon: BarChart3 },
  { id: 'video', label: 'Video', icon: Video },
  { id: 'photos', label: 'Ảnh', icon: Camera },
  { id: 'attendance', label: 'Chấm công', icon: UserCheck },
  { id: 'list', label: 'Danh sách', icon: ListFilter },
];

export const BottomTabBar: React.FC = () => {
  const { activeTab, setActiveTab } = useCameraStore();

  return (
    <View style={styles.container}>
      <View style={styles.innerRow}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const IconComponent = tab.icon;
          const activeColor = '#F59E0B'; // Highlight yellow/amber
          const inactiveColor = '#94A3B8'; // Muted slate

          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabButton}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <View style={[styles.iconBox, isActive && styles.iconBoxActive]}>
                <IconComponent
                  size={20}
                  color={isActive ? activeColor : inactiveColor}
                />
              </View>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A', // Deep dark slate background
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 6,
    zIndex: 30,
  },
  innerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 62,
    position: 'relative',
  },
  iconBox: {
    padding: 3,
    borderRadius: 8,
  },
  iconBoxActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#F59E0B',
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 18,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#F59E0B',
  },
});
