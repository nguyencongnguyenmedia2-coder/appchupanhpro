// src/components/views/ListScreen.tsx
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
  ListFilter,
  CheckCircle2,
  HardDrive,
  Download,
  MapPin,
  FolderKanban,
  Users,
  Building,
} from 'lucide-react-native';
import { usePhotoStore } from '../../stores/usePhotoStore';
import { useAuthStore } from '../../stores/useAuthStore';

export const ListScreen: React.FC = () => {
  const { photos, backupAllPhotosToDevice, isSavingToDevice } = usePhotoStore();
  const { projects, teams, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'photos' | 'projects' | 'teams'>('photos');

  const handleBackupAll = async () => {
    if (photos.length === 0) {
      Alert.alert('Bộ Nhớ', 'Chưa có ảnh nào để lưu.');
      return;
    }
    const res = await backupAllPhotosToDevice();
    Alert.alert('Thành Công', `Đã lưu toàn bộ ${res.savedCount} ảnh vào Album "TIMESTAMP PRO" trên máy!`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Danh Sách & Bộ Nhớ Điện Thoại</Text>
          <Text style={styles.subTitle}>
            Lưu trữ 100% cục bộ trên máy • {photos.length} ảnh trong thiết bị
          </Text>
        </View>

        <TouchableOpacity
          style={styles.syncBtn}
          onPress={handleBackupAll}
          disabled={isSavingToDevice}
          activeOpacity={0.8}
        >
          {isSavingToDevice ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Download size={15} color="#FFFFFF" />
              <Text style={styles.syncBtnText}>Lưu Album</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'photos' && styles.tabItemActive]}
          onPress={() => setActiveTab('photos')}
        >
          <Text style={[styles.tabText, activeTab === 'photos' && styles.tabTextActive]}>
            Ảnh Cục Bộ ({photos.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'projects' && styles.tabItemActive]}
          onPress={() => setActiveTab('projects')}
        >
          <Text style={[styles.tabText, activeTab === 'projects' && styles.tabTextActive]}>
            Dự Án ({projects.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'teams' && styles.tabItemActive]}
          onPress={() => setActiveTab('teams')}
        >
          <Text style={[styles.tabText, activeTab === 'teams' && styles.tabTextActive]}>
            Đội Nhóm ({teams.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 32 }}>
        {activeTab === 'photos' && (
          <View style={styles.list}>
            {photos.length === 0 ? (
              <Text style={styles.emptyText}>Chưa có ảnh nào được lưu trên máy.</Text>
            ) : (
              photos.map((photo) => (
                <View key={photo.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{photo.id}</Text>
                    <View style={styles.syncBadgeDone}>
                      <CheckCircle2 size={12} color="#10B981" />
                      <Text style={styles.syncBadgeText}>Đã lưu máy</Text>
                    </View>
                  </View>

                  <Text style={styles.cardProject}>{photo.projectName}</Text>
                  <Text style={styles.cardAddress} numberOfLines={1}>
                    📍 {photo.location.address}
                  </Text>
                  <Text style={styles.cardMeta}>
                    {photo.capturedAtFormatted} • {photo.templateName}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'projects' && (
          <View style={styles.list}>
            {projects.map((proj) => (
              <View key={proj.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{proj.name}</Text>
                  <Text style={styles.cardBadge}>Mã: {proj.code}</Text>
                </View>
                <Text style={styles.cardAddress}>📍 {proj.locationAddress}</Text>
                <Text style={styles.cardMeta}>
                  Người quản lý: {proj.managerName} • Tổng số ảnh: {proj.totalPhotos}
                </Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'teams' && (
          <View style={styles.list}>
            {teams.map((team) => (
              <View key={team.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{team.name}</Text>
                  <Text style={styles.cardBadge}>Mã: {team.code}</Text>
                </View>
                <Text style={styles.cardAddress}>{team.description}</Text>
                <Text style={styles.cardMeta}>
                  {team.memberCount} thành viên trực thuộc
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
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  syncBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingHorizontal: 16,
  },
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#F59E0B',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabTextActive: {
    color: '#F59E0B',
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  list: {
    gap: 10,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  cardBadge: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '600',
  },
  syncBadgeDone: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  syncBadgeText: {
    fontSize: 10.5,
    fontWeight: 'bold',
    marginLeft: 4,
    color: '#10B981',
  },
  cardProject: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#CBD5E1',
    marginTop: 4,
  },
  cardAddress: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 2,
  },
  cardMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  emptyText: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 13,
  },
});
