// src/components/camera/CameraControls.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Image as ImageIcon, LayoutTemplate, Video, Square } from 'lucide-react-native';
import { useCameraStore } from '../../stores/useCameraStore';
import { usePhotoStore } from '../../stores/usePhotoStore';

interface CameraControlsProps {
  onCapturePress: () => void;
  onGalleryPress: () => void;
  onTemplatePress: () => void;
  onToggleVideoRecord?: () => void;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  onCapturePress,
  onGalleryPress,
  onTemplatePress,
  onToggleVideoRecord,
}) => {
  const { isCapturing, activeTab, isRecordingVideo, videoDurationSec } = useCameraStore();
  const { photos } = usePhotoStore();

  const isVideoTab = activeTab === 'video';

  const formatVideoTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <View style={styles.container}>
      {/* Video duration counter when recording */}
      {isVideoTab && isRecordingVideo && (
        <View style={styles.videoTimerBadge}>
          <View style={styles.recordingDot} />
          <Text style={styles.videoTimerText}>{formatVideoTimer(videoDurationSec)}</Text>
        </View>
      )}

      <View style={styles.controlsRow}>
        {/* Left: Gallery Button with recent thumbnail count */}
        <TouchableOpacity
          style={styles.sideButton}
          onPress={onGalleryPress}
          activeOpacity={0.7}
          accessibilityLabel="Thư viện ảnh"
        >
          <View style={styles.iconCircle}>
            <ImageIcon size={22} color="#FFFFFF" />
            {photos.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>
                  {photos.length > 99 ? '99+' : photos.length}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.sideLabel}>Thư viện</Text>
        </TouchableOpacity>

        {/* Center: Big Shutter Button */}
        <View style={styles.shutterWrapper}>
          <TouchableOpacity
            style={[
              styles.shutterOuter,
              isVideoTab && styles.shutterOuterVideo,
              isCapturing && styles.shutterCapturing,
            ]}
            onPress={isVideoTab ? onToggleVideoRecord : onCapturePress}
            disabled={isCapturing}
            activeOpacity={0.8}
            accessibilityLabel={isVideoTab ? 'Quay video' : 'Chụp ảnh'}
          >
            {isCapturing ? (
              <ActivityIndicator color="#0284C7" size="large" />
            ) : isVideoTab ? (
              isRecordingVideo ? (
                <View style={styles.shutterSquareStop} />
              ) : (
                <View style={styles.shutterRedCircle} />
              )
            ) : (
              <View style={styles.shutterInner} />
            )}
          </TouchableOpacity>
        </View>

        {/* Right: Bản mẫu (Templates) Button */}
        <TouchableOpacity
          style={styles.sideButton}
          onPress={onTemplatePress}
          activeOpacity={0.7}
          accessibilityLabel="Bản mẫu đóng dấu"
        >
          <View style={styles.iconCircle}>
            <LayoutTemplate size={22} color="#F59E0B" />
          </View>
          <Text style={styles.sideLabel}>Bản mẫu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    position: 'relative',
  },
  videoTimerBadge: {
    position: 'absolute',
    top: -34,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  videoTimerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 420,
  },
  sideButton: {
    alignItems: 'center',
    width: 72,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#0284C7',
    borderRadius: 9,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  sideLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
  shutterWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  shutterOuterVideo: {
    borderColor: '#EF4444',
  },
  shutterCapturing: {
    borderColor: '#0284C7',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  shutterRedCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#EF4444',
  },
  shutterSquareStop: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
});
