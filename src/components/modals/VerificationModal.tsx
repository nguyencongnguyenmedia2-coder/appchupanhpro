// src/components/modals/VerificationModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Hash,
  MapPin,
  Clock,
  User,
  CheckCircle2,
} from 'lucide-react-native';
import { usePhotoStore } from '../../stores/usePhotoStore';
import { VerificationService, VerificationResult } from '../../services/verificationService';

interface VerificationModalProps {
  visible: boolean;
  onClose: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({ visible, onClose }) => {
  const { photos } = usePhotoStore();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const activePhoto = photos[selectedPhotoIndex] || null;

  const handleVerifyNow = async () => {
    if (!activePhoto) return;
    setIsVerifying(true);
    try {
      const res = await VerificationService.verifyPhoto(activePhoto);
      setResult(res);
    } finally {
      setIsVerifying(false);
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
                <ShieldCheck size={20} color="#10B981" />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.title}>Chứng Thực Toàn Vẹn Ảnh</Text>
                <Text style={styles.subtitle}>Kiểm định chữ ký số SHA-256 & Tọa độ GPS</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 24 }}>
            {photos.length === 0 ? (
              <View style={styles.emptyState}>
                <FileCheck size={44} color="#64748B" />
                <Text style={styles.emptyTitle}>Chưa có ảnh nào được chụp</Text>
                <Text style={styles.emptySub}>
                  Hãy chụp ảnh mới để kiểm tra tính toàn vẹn và mã vân tay SHA-256.
                </Text>
              </View>
            ) : (
              <>
                {/* Photo Selector */}
                <Text style={styles.sectionTitle}>Chọn ảnh cần kiểm định ({photos.length} ảnh):</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoPickerRow}>
                  {photos.map((p, idx) => (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.photoThumbnailCard,
                        selectedPhotoIndex === idx && styles.photoThumbnailSelected,
                      ]}
                      onPress={() => {
                        setSelectedPhotoIndex(idx);
                        setResult(null);
                      }}
                    >
                      <Text style={styles.photoThumbId}>{p.id.split('-').slice(-2).join('-')}</Text>
                      <Text style={styles.photoThumbTime}>
                        {p.capturedAtFormatted.split('–')[0]?.trim() || '10:46'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Inspect Target Card */}
                {activePhoto && (
                  <View style={styles.targetCard}>
                    <Text style={styles.targetTitle}>{activePhoto.id}</Text>
                    <Text style={styles.targetSub}>{activePhoto.projectName || 'Ảnh Hiện Trường'}</Text>

                    <View style={styles.metaRow}>
                      <Clock size={14} color="#94A3B8" />
                      <Text style={styles.metaVal}>{activePhoto.capturedAtFormatted}</Text>
                    </View>

                    <View style={styles.metaRow}>
                      <MapPin size={14} color="#94A3B8" />
                      <Text style={styles.metaVal} numberOfLines={2}>
                        {activePhoto.location.address}
                      </Text>
                    </View>

                    <View style={styles.metaRow}>
                      <User size={14} color="#94A3B8" />
                      <Text style={styles.metaVal}>
                        {activePhoto.ownerName} ({activePhoto.employeeCode || 'NV-2026'})
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.verifyBtn}
                      onPress={handleVerifyNow}
                      disabled={isVerifying}
                      activeOpacity={0.8}
                    >
                      {isVerifying ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <>
                          <ShieldCheck size={18} color="#FFFFFF" />
                          <Text style={styles.verifyBtnText}>Thực Hiện Giám Định Số Ngay</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {/* Verification Result Output */}
                {result && (
                  <View
                    style={[
                      styles.resultCard,
                      result.isValid ? styles.resultCardValid : styles.resultCardInvalid,
                    ]}
                  >
                    <View style={styles.resultHeader}>
                      {result.isValid ? (
                        <CheckCircle2 size={24} color="#10B981" />
                      ) : (
                        <AlertTriangle size={24} color="#EF4444" />
                      )}
                      <View style={{ marginLeft: 10 }}>
                        <Text style={styles.resultStatusText}>
                          {result.isValid
                            ? 'XÁC THỰC HỢP LỆ – NGUYÊN BẢN 100%'
                            : 'CẢNH BÁO – TỆP ẢNH BỊ THAY ĐỔI'}
                        </Text>
                        <Text style={styles.resultLevel}>Cấp độ: {result.securityLevel}</Text>
                      </View>
                    </View>

                    {/* Hash Comparison */}
                    <View style={styles.hashBox}>
                      <View style={styles.hashRow}>
                        <Hash size={13} color="#F59E0B" />
                        <Text style={styles.hashLabel}>Mã Hash Lúc Chụp:</Text>
                      </View>
                      <Text style={styles.hashCode}>{result.storedHash}</Text>

                      <View style={[styles.hashRow, { marginTop: 6 }]}>
                        <Hash size={13} color="#38BDF8" />
                        <Text style={styles.hashLabel}>Mã Hash Giám Định Lại:</Text>
                      </View>
                      <Text style={styles.hashCode}>{result.calculatedHash}</Text>
                    </View>

                    {/* Verification Notes */}
                    <View style={styles.notesBox}>
                      {result.notes.map((note, i) => (
                        <Text key={i} style={styles.noteItem}>
                          • {note}
                        </Text>
                      ))}
                    </View>

                    <Text style={styles.disclaimerText}>
                      Lưu ý pháp lý: Chứng thực sử dụng thuật toán băm SHA-256 tiêu chuẩn FIPS 180-4 kết hợp tọa độ vệ tinh GPS và thời gian hệ thống tại thời điểm ghi nhận.
                    </Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '88%',
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
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
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
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
  },
  emptySub: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 8,
  },
  photoPickerRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  photoThumbnailCard: {
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  photoThumbnailSelected: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  photoThumbId: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  photoThumbTime: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  targetCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  targetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  targetSub: {
    fontSize: 13,
    color: '#38BDF8',
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  metaVal: {
    color: '#E2E8F0',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  verifyBtn: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  resultCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1.5,
  },
  resultCardValid: {
    backgroundColor: 'rgba(6, 78, 59, 0.25)',
    borderColor: '#10B981',
  },
  resultCardInvalid: {
    backgroundColor: 'rgba(127, 29, 29, 0.25)',
    borderColor: '#EF4444',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultStatusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  resultLevel: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 2,
  },
  hashBox: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  hashRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hashLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#CBD5E1',
    marginLeft: 4,
  },
  hashCode: {
    fontSize: 10.5,
    fontFamily: 'monospace',
    color: '#34D399',
    marginTop: 2,
  },
  notesBox: {
    marginTop: 10,
  },
  noteItem: {
    fontSize: 12,
    color: '#E2E8F0',
    marginTop: 3,
  },
  disclaimerText: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 12,
    lineHeight: 14,
  },
});
