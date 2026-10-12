// src/components/modals/TemplateSelectorModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  StyleSheet,
} from 'react-native';
import {
  X,
  Check,
  Palette,
  Sliders,
  HardHat,
  UserCheck,
  Truck,
  Boxes,
  Store,
  Camera,
  Wrench,
  Clock,
  Compass,
  ShieldCheck,
  Crown,
} from 'lucide-react-native';
import { useTemplateStore } from '../../stores/useTemplateStore';
import { StampTemplate } from '../../types/template';

interface TemplateSelectorModalProps {
  visible: boolean;
  onClose: () => void;
}

export const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
  visible,
  onClose,
}) => {
  const { templates, selectedTemplateId, setSelectedTemplate, activeConfig, updateActiveConfig } =
    useTemplateStore();

  const [activeTab, setActiveTab] = useState<'templates' | 'customize'>('templates');

  const getTemplateIcon = (iconName: string) => {
    const props = { size: 20, color: '#F59E0B' };
    switch (iconName) {
      case 'HardHat':
        return <HardHat {...props} />;
      case 'UserCheck':
        return <UserCheck {...props} />;
      case 'Truck':
        return <Truck {...props} />;
      case 'Boxes':
        return <Boxes {...props} />;
      case 'Store':
        return <Store {...props} />;
      case 'Camera':
        return <Camera {...props} />;
      case 'Wrench':
        return <Wrench {...props} />;
      case 'Clock':
        return <Clock {...props} />;
      case 'Compass':
        return <Compass {...props} />;
      case 'ShieldCheck':
        return <ShieldCheck {...props} color="#EAB308" />;
      default:
        return <HardHat {...props} />;
    }
  };

  const ACCENT_COLORS = [
    '#F59E0B', // Yellow / Amber (Default)
    '#10B981', // Emerald
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#EF4444', // Red
    '#06B6D4', // Cyan
    '#E2E8F0', // Minimal Slate
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Bản Mẫu Đóng Dấu</Text>
              <Text style={styles.subtitle}>Tùy chỉnh thông tin và màu sắc hiển thị lên ảnh</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Sub Navigation */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'templates' && styles.tabItemActive]}
              onPress={() => setActiveTab('templates')}
            >
              <Text
                style={[styles.tabItemText, activeTab === 'templates' && styles.tabItemTextActive]}
              >
                Thư Viện Mẫu ({templates.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'customize' && styles.tabItemActive]}
              onPress={() => setActiveTab('customize')}
            >
              <Text
                style={[styles.tabItemText, activeTab === 'customize' && styles.tabItemTextActive]}
              >
                Tùy Chỉnh Trường Dữ Liệu
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 24 }}>
            {activeTab === 'templates' ? (
              /* Templates List */
              <View style={styles.templateList}>
                {templates.map((tpl) => {
                  const isSelected = selectedTemplateId === tpl.id;
                  return (
                    <TouchableOpacity
                      key={tpl.id}
                      style={[styles.templateCard, isSelected && styles.templateCardSelected]}
                      onPress={() => setSelectedTemplate(tpl.id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.templateHeader}>
                        <View style={styles.iconWrapper}>{getTemplateIcon(tpl.icon)}</View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.templateName}>{tpl.name}</Text>
                            {tpl.isVip && (
                              <View style={styles.vipPill}>
                                <Crown size={11} color="#B45309" />
                                <Text style={styles.vipPillText}>VIP</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.templateDesc}>{tpl.description}</Text>
                        </View>
                        {isSelected && (
                          <View style={styles.selectedCheck}>
                            <Check size={16} color="#FFFFFF" />
                          </View>
                        )}
                      </View>

                      {/* Preview mini sample badge */}
                      <View style={styles.previewSample}>
                        <View
                          style={[
                            styles.miniAccent,
                            { backgroundColor: tpl.defaultConfig.accentColor },
                          ]}
                        />
                        <Text style={styles.previewSampleText} numberOfLines={1}>
                          {tpl.badgeText}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              /* Customize Tab */
              <View style={styles.customSection}>
                {/* Accent Color picker */}
                <Text style={styles.sectionLabel}>Màu Thanh Điểm Nhấn (Accent Bar)</Text>
                <View style={styles.colorRow}>
                  {ACCENT_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: color },
                        activeConfig.accentColor === color && styles.colorCircleActive,
                      ]}
                      onPress={() => updateActiveConfig({ accentColor: color })}
                    >
                      {activeConfig.accentColor === color && (
                        <Check size={14} color="#000000" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Edit Text Fields */}
                <Text style={[styles.sectionLabel, { marginTop: 18 }]}>Tiêu Đề / Tên Đơn Vị</Text>
                <TextInput
                  style={styles.textInput}
                  value={activeConfig.customTitle}
                  onChangeText={(val) => updateActiveConfig({ customTitle: val })}
                  placeholder="Nhập tên cơ sở, chi nhánh..."
                  placeholderTextColor="#64748B"
                />

                <Text style={[styles.sectionLabel, { marginTop: 12 }]}>Tên Dự Án / Công Trình</Text>
                <TextInput
                  style={styles.textInput}
                  value={activeConfig.customProject}
                  onChangeText={(val) => updateActiveConfig({ customProject: val })}
                  placeholder="Nhập tên dự án..."
                  placeholderTextColor="#64748B"
                />

                <Text style={[styles.sectionLabel, { marginTop: 12 }]}>Ghi Chú Mặc Định</Text>
                <TextInput
                  style={styles.textInput}
                  value={activeConfig.customNote}
                  onChangeText={(val) => updateActiveConfig({ customNote: val })}
                  placeholder="Nhập ghi chú hiện trường..."
                  placeholderTextColor="#64748B"
                />

                {/* Field Toggles */}
                <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Bật / Tắt Các Trường Thông Tin</Text>

                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Thời gian (Giờ:Phút:Giây)</Text>
                  <Switch
                    value={activeConfig.showTime}
                    onValueChange={(val) => updateActiveConfig({ showTime: val })}
                    trackColor={{ false: '#334155', true: '#0284C7' }}
                  />
                </View>

                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Ngày tháng tiếng Việt</Text>
                  <Switch
                    value={activeConfig.showDate}
                    onValueChange={(val) => updateActiveConfig({ showDate: val })}
                    trackColor={{ false: '#334155', true: '#0284C7' }}
                  />
                </View>

                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Địa chỉ thực tế từ GPS</Text>
                  <Switch
                    value={activeConfig.showAddress}
                    onValueChange={(val) => updateActiveConfig({ showAddress: val })}
                    trackColor={{ false: '#334155', true: '#0284C7' }}
                  />
                </View>

                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Tọa độ GPS kinh độ, vĩ độ & sai số</Text>
                  <Switch
                    value={activeConfig.showCoordinates}
                    onValueChange={(val) => updateActiveConfig({ showCoordinates: val })}
                    trackColor={{ false: '#334155', true: '#0284C7' }}
                  />
                </View>

                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Tên dự án / Hạng mục</Text>
                  <Switch
                    value={activeConfig.showProject}
                    onValueChange={(val) => updateActiveConfig({ showProject: val })}
                    trackColor={{ false: '#334155', true: '#0284C7' }}
                  />
                </View>

                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Tên & Mã nhân viên</Text>
                  <Switch
                    value={activeConfig.showEmployee}
                    onValueChange={(val) => updateActiveConfig({ showEmployee: val })}
                    trackColor={{ false: '#334155', true: '#0284C7' }}
                  />
                </View>

                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Tem chứng thực ✓ Ảnh thực tế</Text>
                  <Switch
                    value={activeConfig.showVerificationBadge}
                    onValueChange={(val) => updateActiveConfig({ showVerificationBadge: val })}
                    trackColor={{ false: '#334155', true: '#0284C7' }}
                  />
                </View>

                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Logo doanh nghiệp góc trên</Text>
                  <Switch
                    value={activeConfig.showLogo}
                    onValueChange={(val) => updateActiveConfig({ showLogo: val })}
                    trackColor={{ false: '#334155', true: '#0284C7' }}
                  />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer Submit */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.applyButton} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.applyButtonText}>Áp Dụng Mẫu Này</Text>
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  closeButton: {
    padding: 6,
    borderRadius: 20,
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
    borderBottomColor: '#F59E0B',
  },
  tabItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabItemTextActive: {
    color: '#F59E0B',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  templateList: {
    gap: 12,
  },
  templateCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  templateCardSelected: {
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  vipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  vipPillText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#B45309',
    marginLeft: 2,
  },
  templateDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  selectedCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewSample: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  miniAccent: {
    width: 3,
    height: 14,
    borderRadius: 1.5,
    marginRight: 8,
  },
  previewSampleText: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  customSection: {
    paddingBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleActive: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  textInput: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    color: '#FFFFFF',
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  toggleLabel: {
    fontSize: 13,
    color: '#CBD5E1',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  applyButton: {
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
