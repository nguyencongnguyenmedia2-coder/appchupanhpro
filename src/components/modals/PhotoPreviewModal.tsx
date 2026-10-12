// src/components/modals/PhotoPreviewModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import {
  X,
  RotateCcw,
  Download,
  Share2,
  CloudUpload,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react-native';
import { PhotoRecord } from '../../types/photo';
import { StorageService } from '../../services/storageService';
import { usePhotoStore } from '../../stores/usePhotoStore';

interface PhotoPreviewModalProps {
  visible: boolean;
  photo: PhotoRecord | null;
  onClose: () => void;
  onRetake: () => void;
}

export const PhotoPreviewModal: React.FC<PhotoPreviewModalProps> = ({
  visible,
  photo,
  onClose,
  onRetake,
}) => {
  const { syncPendingPhotos } = usePhotoStore();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  if (!photo) return null;

  const handleSaveToDevice = async () => {
    setIsSaving(true);
    setSaveSuccessMsg(null);
    try {
      const res = await StorageService.saveToDeviceGallery(
        photo.stampedUri,
        `${photo.id}.jpg`
      );
      if (res.success) {
        setSaveSuccessMsg(res.message);
        setTimeout(() => setSaveSuccessMsg(null), 3500);
      } else {
        Alert.alert('Thông báo', res.message);
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể lưu ảnh');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    await StorageService.sharePhoto(photo.stampedUri, `TIMESTAMP PRO – ${photo.id}`);
  };

  const handleUploadCloud = async () => {
    setIsSaving(true);
    try {
      await syncPendingPhotos();
      setSaveSuccessMsg('Đã đồng bộ ảnh thành công lên máy chủ đám mây!');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể đồng bộ: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={onClose}>
            <X size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{photo.id}</Text>
            <Text style={styles.headerSub}>{photo.capturedAtFormatted}</Text>
          </View>
          <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
            <Share2 size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Main Image View */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: photo.stampedUri }}
            style={styles.image}
            resizeMode="contain"
          />

          {/* Success Banner */}
          {saveSuccessMsg && (
            <View style={styles.successBanner}>
              <CheckCircle size={18} color="#FFFFFF" />
              <Text style={styles.successText}>{saveSuccessMsg}</Text>
            </View>
          )}
        </View>

        {/* Meta summary footer card */}
        <View style={styles.metaCard}>
          <View style={styles.metaRow}>
            <ShieldCheck size={16} color="#10B981" />
            <Text style={styles.metaLabel}>SHA-256 Hash:</Text>
            <Text style={styles.hashText} numberOfLines={1}>
              {photo.sha256Hash}
            </Text>
          </View>
          <Text style={styles.metaAddress} numberOfLines={1}>
            📍 {photo.location.address}
          </Text>
        </View>

        {/* Bottom Actions Row */}
        <View style={styles.footerActions}>
          {/* Retake */}
          {/* Retake */}
          <TouchableOpacity style={styles.actionBtnOutline} onPress={onRetake} activeOpacity={0.8}>
            <RotateCcw size={18} color="#CBD5E1" />
            <Text style={styles.actionBtnOutlineText}>Chụp lại</Text>
          </TouchableOpacity>

          {/* Save to Device */}
          <TouchableOpacity
            style={styles.actionBtnPrimary}
            onPress={handleSaveToDevice}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Download size={18} color="#FFFFFF" />
                <Text style={styles.actionBtnPrimaryText}>Lưu vào máy</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity
            style={styles.actionBtnCloud}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Share2 size={18} color="#0284C7" />
            <Text style={styles.actionBtnCloudText}>Chia sẻ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 44 : 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  headerSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  successBanner: {
    position: 'absolute',
    top: 20,
    backgroundColor: '#059669',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  successText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  metaCard: {
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 6,
    marginRight: 4,
  },
  hashText: {
    color: '#34D399',
    fontFamily: 'monospace',
    fontSize: 10,
    flex: 1,
  },
  metaAddress: {
    color: '#E2E8F0',
    fontSize: 11.5,
    marginTop: 4,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    gap: 10,
  },
  actionBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionBtnOutlineText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  actionBtnPrimary: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  actionBtnCloud: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F2FE',
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionBtnCloudText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 6,
  },
});
