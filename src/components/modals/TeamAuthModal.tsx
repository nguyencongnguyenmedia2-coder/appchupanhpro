// src/components/modals/TeamAuthModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { X, Users, Check, Plus, FolderKanban, Shield } from 'lucide-react-native';
import { useAuthStore } from '../../stores/useAuthStore';

interface TeamAuthModalProps {
  visible: boolean;
  onClose: () => void;
}

export const TeamAuthModal: React.FC<TeamAuthModalProps> = ({ visible, onClose }) => {
  const {
    teams,
    currentTeam,
    projects,
    currentProject,
    switchTeam,
    switchProject,
    joinTeamByCode,
    user,
  } = useAuthStore();

  const [inviteCode, setInviteCode] = useState('');
  const [activeTab, setActiveTab] = useState<'teams' | 'projects'>('teams');

  const handleJoinByCode = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập mã mời nhóm');
      return;
    }
    const res = await joinTeamByCode(inviteCode);
    Alert.alert('Kết Quả', res.message);
    if (res.success) {
      setInviteCode('');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.iconCircle}>
                <Users size={20} color="#0284C7" />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.title}>Quản Lý Nhóm & Dự Án</Text>
                <Text style={styles.subtitle}>Đang hoạt động: {user.fullName} ({user.employeeCode})</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Navigation Bar */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'teams' && styles.tabItemActive]}
              onPress={() => setActiveTab('teams')}
            >
              <Text style={[styles.tabText, activeTab === 'teams' && styles.tabTextActive]}>
                Đội Nhóm Của Tôi ({teams.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'projects' && styles.tabItemActive]}
              onPress={() => setActiveTab('projects')}
            >
              <Text style={[styles.tabText, activeTab === 'projects' && styles.tabTextActive]}>
                Dự Án / Công Trình ({projects.length})
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 24 }}>
            {activeTab === 'teams' ? (
              <>
                {/* Join via Invite Code */}
                <View style={styles.joinCard}>
                  <Text style={styles.cardTitle}>Đăng Nhập Vào Nhóm Bằng Mã Mời</Text>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập mã nhóm (vd: SEN-889)..."
                      placeholderTextColor="#64748B"
                      value={inviteCode}
                      onChangeText={setInviteCode}
                      autoCapitalize="characters"
                    />
                    <TouchableOpacity style={styles.joinBtn} onPress={handleJoinByCode} activeOpacity={0.8}>
                      <Text style={styles.joinBtnText}>Tham Gia</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.joinHint}>
                    Mã mẫu có sẵn: SEN-889 (Đội Giám Sát Hiện Trường) hoặc KHO-441 (Tổ Quản Lý Kho)
                  </Text>
                </View>

                {/* Team list */}
                <Text style={styles.sectionTitle}>Chọn nhóm làm việc hiện tại:</Text>
                <View style={styles.listContainer}>
                  {teams.map((team) => {
                    const isSelected = currentTeam?.id === team.id;
                    return (
                      <TouchableOpacity
                        key={team.id}
                        style={[styles.itemCard, isSelected && styles.itemCardSelected]}
                        onPress={() => switchTeam(team.id)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.itemHeader}>
                          <Text style={styles.itemName}>{team.name}</Text>
                          {isSelected && (
                            <View style={styles.selectedBadge}>
                              <Check size={14} color="#FFFFFF" />
                              <Text style={styles.selectedBadgeText}>Đang chọn</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.itemDesc}>{team.description}</Text>
                        <View style={styles.itemFooter}>
                          <Text style={styles.itemMeta}>Mã: {team.code}</Text>
                          <Text style={styles.itemMeta}>• {team.memberCount} thành viên</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            ) : (
              <>
                {/* Projects list */}
                <Text style={styles.sectionTitle}>Chọn Dự Án Đang Thi Công / Giám Sát:</Text>
                <View style={styles.listContainer}>
                  {projects.map((proj) => {
                    const isSelected = currentProject?.id === proj.id;
                    return (
                      <TouchableOpacity
                        key={proj.id}
                        style={[styles.itemCard, isSelected && styles.itemCardSelected]}
                        onPress={() => switchProject(proj.id)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.itemHeader}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <FolderKanban size={16} color="#38BDF8" />
                            <Text style={[styles.itemName, { marginLeft: 6 }]}>{proj.name}</Text>
                          </View>
                          {isSelected && (
                            <View style={styles.selectedBadge}>
                              <Check size={14} color="#FFFFFF" />
                              <Text style={styles.selectedBadgeText}>Đang chọn</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.itemDesc}>📍 {proj.locationAddress}</Text>
                        <View style={styles.itemFooter}>
                          <Text style={styles.itemMeta}>Mã: {proj.code}</Text>
                          <Text style={styles.itemMeta}>• Phụ trách: {proj.managerName}</Text>
                          <Text style={styles.itemMeta}>• {proj.totalPhotos} ảnh</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.footerBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.footerBtnText}>Đóng & Quay Lại Chụp Ảnh</Text>
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
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 18,
    backgroundColor: '#1E293B',
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
    borderBottomColor: '#0284C7',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabTextActive: {
    color: '#0284C7',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  joinCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    color: '#FFFFFF',
    paddingHorizontal: 12,
    fontSize: 13,
  },
  joinBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  joinHint: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 8,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 10,
  },
  listContainer: {
    gap: 10,
  },
  itemCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  itemCardSelected: {
    borderColor: '#0284C7',
    backgroundColor: 'rgba(2, 132, 199, 0.08)',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 3,
  },
  itemDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 16,
  },
  itemFooter: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  itemMeta: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  footerBtn: {
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  footerBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
