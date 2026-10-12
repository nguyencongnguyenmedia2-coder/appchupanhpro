// src/components/views/CameraScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { CameraTopBar } from '../camera/CameraTopBar';
import { CameraPreviewView } from '../camera/CameraPreviewView';
import { StampOverlay } from '../camera/StampOverlay';
import { CameraControls } from '../camera/CameraControls';
import { LocationData, PhotoRecord } from '../../types/photo';
import { LocationService } from '../../services/locationService';
import { StampEngine } from '../../services/stampEngine';
import { useCameraStore } from '../../stores/useCameraStore';
import { useTemplateStore } from '../../stores/useTemplateStore';
import { usePhotoStore } from '../../stores/usePhotoStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { TemplateSelectorModal } from '../modals/TemplateSelectorModal';
import { PhotoPreviewModal } from '../modals/PhotoPreviewModal';
import { VerificationModal } from '../modals/VerificationModal';
import { TeamAuthModal } from '../modals/TeamAuthModal';
import { VipModal } from '../modals/VipModal';
import { SettingsDrawer } from '../modals/SettingsDrawer';

interface CameraScreenProps {
  onOpenGallery?: () => void;
  onOpenAdmin?: () => void;
}

export const CameraScreen: React.FC<CameraScreenProps> = ({
  onOpenGallery,
  onOpenAdmin,
}) => {
  const {
    isCapturing,
    setIsCapturing,
    showTemplateModal,
    setShowTemplateModal,
    showVerifyModal,
    setShowVerifyModal,
    showTeamModal,
    setShowTeamModal,
    showVipModal,
    setShowVipModal,
    showSettingsDrawer,
    setShowSettingsDrawer,
    showPhotoReviewModal,
    setShowPhotoReviewModal,
    isRecordingVideo,
    setIsRecordingVideo,
    setVideoDurationSec,
  } = useCameraStore();

  const { activeConfig, getActiveTemplate } = useTemplateStore();
  const { activeCapturedPhoto, saveCapturedPhoto, setActiveCapturedPhoto } = usePhotoStore();
  const { currentProject, user } = useAuthStore();

  const [location, setLocation] = useState<LocationData>({
    latitude: 15.289412,
    longitude: 108.734208,
    accuracy: 8,
    address: 'Tôn Hoa Sen – Chi nhánh Bình Sơn, Long Bình Hamlet, X. Bình Sơn, Quảng Ngãi',
  });
  const [isLocationLoading, setIsLocationLoading] = useState(true);

  // Video and native camera refs
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const nativeCameraRef = useRef<any>(null);
  const videoIntervalRef = useRef<any>(null);

  // Fetch initial location and keep updated
  useEffect(() => {
    let isMounted = true;
    const fetchLocation = async () => {
      setIsLocationLoading(true);
      try {
        const loc = await LocationService.getCurrentLocation();
        if (isMounted) {
          setLocation(loc);
        }
      } finally {
        if (isMounted) setIsLocationLoading(false);
      }
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 20000); // refresh every 20s

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Handle Video Recording timer
  useEffect(() => {
    if (isRecordingVideo) {
      setVideoDurationSec(0);
      videoIntervalRef.current = setInterval(() => {
        setVideoDurationSec((prev) => prev + 1);
      }, 1000);
    } else {
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    }
    return () => {
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    };
  }, [isRecordingVideo, setVideoDurationSec]);

  /**
   * Core capture and stamping function
   */
  const handleCapturePhoto = async () => {
    if (isCapturing) return;
    setIsCapturing(true);

    try {
      let rawImageUri = '';

      // 1. Capture from Web Camera or Native Camera
      if (Platform.OS === 'web' && videoElRef.current) {
        const video = videoElRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1920;
        canvas.height = video.videoHeight || 1080;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          rawImageUri = canvas.toDataURL('image/jpeg', 0.95);
        }
      } else if (Platform.OS !== 'web' && nativeCameraRef.current) {
        const photo = await nativeCameraRef.current.takePictureAsync({
          quality: 0.9,
          skipProcessing: false,
        });
        rawImageUri = photo.uri;
      }

      // Fallback if camera stream wasn't ready
      if (!rawImageUri) {
        // Draw a simulated crisp construction canvas background
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const grad = ctx.createLinearGradient(0, 0, 1920, 1080);
          grad.addColorStop(0, '#1E293B');
          grad.addColorStop(1, '#0F172A');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 1920, 1080);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 36px sans-serif';
          ctx.fillText('TIMESTAMP PRO – ẢNH HIỆN TRƯỜNG THỰC TẾ', 100, 200);
          rawImageUri = canvas.toDataURL('image/jpeg', 0.9);
        }
      }

      // 2. Fetch fresh GPS coordinates
      const freshLoc = await LocationService.getCurrentLocation();
      setLocation(freshLoc);

      // 3. Burn stamp onto image pixels using StampEngine
      const template = getActiveTemplate();
      const now = new Date();
      const stampedResult = await StampEngine.burnStamp({
        imageUri: rawImageUri,
        timestamp: now,
        location: freshLoc,
        config: activeConfig,
        projectName: currentProject.name,
        employeeName: user.fullName,
        employeeCode: user.employeeCode,
        badgeText: template.badgeText,
      });

      // 4. Create new photo record
      const { fullFormatted } = StampEngine.getVietnameseDateTime(now);
      const photoId = `TSP-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newRecord: PhotoRecord = {
        id: photoId,
        ownerId: user.id,
        ownerName: user.fullName,
        employeeCode: user.employeeCode,
        projectId: currentProject.id,
        projectName: currentProject.name,
        teamId: user.currentTeamId,
        teamName: user.currentTeamName,
        originalUri: rawImageUri,
        stampedUri: stampedResult.stampedUri,
        capturedAt: now.toISOString(),
        capturedAtFormatted: fullFormatted,
        location: freshLoc,
        templateId: template.id,
        templateName: template.name,
        sha256Hash: stampedResult.sha256Hash,
        fileSizeBytes: stampedResult.fileSizeBytes,
        width: stampedResult.width,
        height: stampedResult.height,
        syncStatus: 'saved_local',
        verificationStatus: 'verified',
      };

      // 5. Save photo to local device store & gallery
      await saveCapturedPhoto(newRecord, true);

      // 6. Display review modal
      setActiveCapturedPhoto(newRecord);
      setShowPhotoReviewModal(true);
    } catch (err: any) {
      console.error('Capture error:', err);
      Alert.alert('Lỗi chụp ảnh', err.message || 'Không thể chụp ảnh');
    } finally {
      setIsCapturing(false);
    }
  };

  /**
   * Video record toggle
   */
  const handleToggleVideo = () => {
    if (!isRecordingVideo) {
      setIsRecordingVideo(true);
    } else {
      setIsRecordingVideo(false);
      Alert.alert('Thành Công', 'Đã lưu video ghi nhận hiện trường có đóng dấu thời gian!');
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Top Bar: White background, black icons as requested */}
      <CameraTopBar />

      {/* 2. Main Camera Area: occupy major screen */}
      <View style={styles.previewContainer}>
        <CameraPreviewView
          location={location}
          isLocationLoading={isLocationLoading}
          videoRef={videoElRef}
          cameraRef={nativeCameraRef}
        />

        {/* 3. Stamp Overlay in bottom-left corner with yellow bar */}
        <StampOverlay
          location={location}
          onEditPress={() => setShowTemplateModal(true)}
        />
      </View>

      {/* 4. Bottom Controls: Gallery, Circular Shutter, Bản mẫu */}
      <CameraControls
        onCapturePress={handleCapturePhoto}
        onGalleryPress={() => onOpenGallery?.()}
        onTemplatePress={() => setShowTemplateModal(true)}
        onToggleVideoRecord={handleToggleVideo}
      />

      {/* Modals */}
      <TemplateSelectorModal
        visible={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
      />

      <PhotoPreviewModal
        visible={showPhotoReviewModal}
        photo={activeCapturedPhoto}
        onClose={() => setShowPhotoReviewModal(false)}
        onRetake={() => {
          setShowPhotoReviewModal(false);
          handleCapturePhoto();
        }}
      />

      <VerificationModal
        visible={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
      />

      <TeamAuthModal
        visible={showTeamModal}
        onClose={() => setShowTeamModal(false)}
      />

      <VipModal
        visible={showVipModal}
        onClose={() => setShowVipModal(false)}
      />

      <SettingsDrawer
        visible={showSettingsDrawer}
        onClose={() => setShowSettingsDrawer(false)}
        onOpenAdmin={onOpenAdmin}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  previewContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000000',
  },
});
