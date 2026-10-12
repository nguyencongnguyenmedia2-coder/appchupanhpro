// src/components/camera/CameraPreviewView.tsx
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';

let CameraView: any = null;
let useCameraPermissions: any = () => [null, () => {}];
if (Platform.OS !== 'web') {
  try {
    const cam = require('expo-camera');
    CameraView = cam.CameraView;
    useCameraPermissions = cam.useCameraPermissions;
  } catch {}
}
import { MapPin, Grid, AlertCircle, Camera as CameraIcon, Upload, RefreshCw, Eye } from 'lucide-react-native';
import { useCameraStore } from '../../stores/useCameraStore';
import { LocationData } from '../../types/photo';

interface CameraPreviewViewProps {
  location: LocationData;
  isLocationLoading: boolean;
  onCameraReady?: () => void;
  videoRef?: React.MutableRefObject<HTMLVideoElement | null>;
  cameraRef?: React.MutableRefObject<any>;
}

// Realistic crisp construction site preview for simulation/testing
const SAMPLE_CONSTRUCTION_IMAGE =
  'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?q=80&w=1470&auto=format&fit=crop';

export const CameraPreviewView: React.FC<CameraPreviewViewProps> = ({
  location,
  isLocationLoading,
  onCameraReady,
  videoRef,
  cameraRef,
}) => {
  const {
    cameraFacing,
    flashMode,
    zoomLevel,
    setZoomLevel,
    showGrid,
    toggleGrid,
  } = useCameraStore();

  const [permission, requestPermission] = useCameraPermissions();
  const [webStreamReady, setWebStreamReady] = useState(false);
  const [webError, setWebError] = useState<string | null>(null);
  const [isSimulatedMode, setIsSimulatedMode] = useState(false);
  const internalVideoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Setup Web camera stream using flexible multi-tier getUserMedia
  const startWebCamera = async () => {
    if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !navigator.mediaDevices) {
      return;
    }

    setWebError(null);
    let stream: MediaStream | null = null;

    try {
      // Tier 1: Try with preferred facingMode
      try {
        const facing = cameraFacing === 'front' ? 'user' : { ideal: 'environment' };
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: false,
        });
      } catch (err1) {
        // Tier 2: Flexible fallback for PC/Laptop webcams without 'environment'
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      if (stream) {
        const targetEl = videoRef?.current || internalVideoRef.current;
        if (targetEl) {
          targetEl.srcObject = stream;
          await targetEl.play().catch(() => {});
          setWebStreamReady(true);
          setWebError(null);
          setIsSimulatedMode(false);
          onCameraReady?.();
        }
      }
    } catch (err: any) {
      console.warn('Web camera getUserMedia error:', err);
      setWebError('Không thể mở Camera thực tế hoặc quyền truy cập bị từ chối.');
    }
  };

  useEffect(() => {
    startWebCamera();

    return () => {
      const targetEl = videoRef?.current || internalVideoRef.current;
      if (targetEl && targetEl.srcObject) {
        const stream = targetEl.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraFacing]);

  // Handle file upload fallback
  const handleFileUpload = (e: any) => {
    const file = e.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          // Put into video element as poster or display
          const targetEl = videoRef?.current || internalVideoRef.current;
          if (targetEl) {
            targetEl.poster = result;
          }
          setIsSimulatedMode(true);
          setWebError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle native permission denied state
  if (Platform.OS !== 'web' && (!permission || !permission.granted)) {
    return (
      <View style={styles.permissionContainer}>
        <AlertCircle size={52} color="#EF4444" />
        <Text style={styles.permissionTitle}>Cần Cấp Quyền Máy Ảnh</Text>
        <Text style={styles.permissionDesc}>
          TIMESTAMP PRO cần quyền sử dụng máy ảnh để chụp ảnh chấm công, công trình và kiểm tra hiện trường thực tế.
        </Text>
        <TouchableOpacity style={styles.grantButton} onPress={requestPermission} activeOpacity={0.8}>
          <Text style={styles.grantButtonText}>Cấp Quyền Camera Ngay</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Real Camera preview or Simulated Scene */}
      {Platform.OS === 'web' ? (
        <View style={styles.webCameraContainer}>
          {isSimulatedMode ? (
            <Image
              source={{ uri: SAMPLE_CONSTRUCTION_IMAGE }}
              style={styles.simulatedImage}
              resizeMode="cover"
            />
          ) : (
            <video
              ref={(el) => {
                internalVideoRef.current = el;
                if (videoRef) videoRef.current = el;
              }}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: cameraFacing === 'front' ? 'scaleX(-1)' : 'none',
              }}
            />
          )}

          {/* Hidden File Input for browser photo selection */}
          {Platform.OS === 'web' && (
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef as any}
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          )}

          {/* If camera is blocked, display interactive options instead of a dead screen */}
          {webError && !isSimulatedMode && (
            <View style={styles.webFallbackOverlay}>
              <AlertCircle size={36} color="#F59E0B" />
              <Text style={styles.webFallbackText}>{webError}</Text>
              <Text style={styles.webFallbackSub}>
                Trình duyệt yêu cầu bạn cấp quyền Camera. Hãy nhấn nút bên dưới để mở lại hoặc chọn chế độ mẫu:
              </Text>

              <View style={styles.actionButtonsCol}>
                {/* 1. Request Permission Button */}
                <TouchableOpacity
                  style={styles.retryCameraBtn}
                  onPress={startWebCamera}
                  activeOpacity={0.8}
                >
                  <CameraIcon size={16} color="#FFFFFF" />
                  <Text style={styles.retryCameraBtnText}>Bấm Để Cấp Quyền & Mở Camera</Text>
                </TouchableOpacity>

                {/* 2. Realistic Simulated Scene */}
                <TouchableOpacity
                  style={styles.simulatedSceneBtn}
                  onPress={() => {
                    setIsSimulatedMode(true);
                    setWebError(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Eye size={16} color="#0F172A" />
                  <Text style={styles.simulatedSceneBtnText}>Dùng Khung Hình Hiện Trường Thực Tế</Text>
                </TouchableOpacity>

                {/* 3. Pick photo from device */}
                <TouchableOpacity
                  style={styles.pickPhotoBtn}
                  onPress={() => fileInputRef.current?.click()}
                  activeOpacity={0.8}
                >
                  <Upload size={16} color="#CBD5E1" />
                  <Text style={styles.pickPhotoBtnText}>Chọn Ảnh Từ Máy Tính / Điện Thoại</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      ) : (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={cameraFacing}
          enableTorch={flashMode === 'on'}
          zoom={zoomLevel === 2 ? 0.5 : zoomLevel === 0.5 ? 0 : 0.2}
          onCameraReady={onCameraReady}
        />
      )}

      {/* Grid Overlay 3x3 */}
      {showGrid && (
        <View style={styles.gridOverlay} pointerEvents="none">
          <View style={styles.gridCol} />
          <View style={styles.gridCol} />
          <View style={styles.gridRow} />
          <View style={styles.gridRow} />
        </View>
      )}

      {/* Status Bar Overlays inside camera: GPS indicator on top-left, Grid toggle & Zoom on top-right */}
      <View style={styles.cameraHeaderOverlay}>
        {/* GPS Status Indicator */}
        <View style={styles.gpsBadge}>
          <MapPin size={13} color="#10B981" />
          <Text style={styles.gpsBadgeText}>
            {isLocationLoading
              ? 'Đang tìm tín hiệu GPS...'
              : `GPS: ±${location.accuracy}m (Sẵn sàng)`}
          </Text>
          <View style={styles.livePulse} />
        </View>

        {/* Grid toggle button */}
        <TouchableOpacity
          style={[styles.miniButton, showGrid && styles.miniButtonActive]}
          onPress={toggleGrid}
          activeOpacity={0.7}
        >
          <Grid size={15} color={showGrid ? '#F59E0B' : '#FFFFFF'} />
        </TouchableOpacity>
      </View>

      {/* Zoom Ratio Controls (0.5x, 1x, 2x) */}
      <View style={styles.zoomContainer}>
        {[0.5, 1, 2].map((z) => (
          <TouchableOpacity
            key={z}
            style={[styles.zoomButton, zoomLevel === z && styles.zoomButtonActive]}
            onPress={() => setZoomLevel(z)}
            activeOpacity={0.7}
          >
            <Text style={[styles.zoomText, zoomLevel === z && styles.zoomTextActive]}>
              {z}x
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    overflow: 'hidden',
    position: 'relative',
  },
  webCameraContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#090D16',
    position: 'relative',
  },
  simulatedImage: {
    width: '100%',
    height: '100%',
  },
  webFallbackOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 10,
  },
  webFallbackText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  webFallbackSub: {
    color: '#94A3B8',
    fontSize: 12.5,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    maxWidth: 380,
    lineHeight: 18,
  },
  actionButtonsCol: {
    width: '100%',
    maxWidth: 320,
    gap: 10,
  },
  retryCameraBtn: {
    backgroundColor: '#0284C7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryCameraBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  simulatedSceneBtn: {
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  simulatedSceneBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  pickPhotoBtn: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  pickPhotoBtnText: {
    color: '#CBD5E1',
    fontSize: 12.5,
    fontWeight: '600',
    marginLeft: 6,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  permissionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionDesc: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  grantButton: {
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  grantButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFill,
    borderWidth: 0,
  },
  gridCol: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    left: '33.33%',
  },
  gridRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    top: '33.33%',
  },
  cameraHeaderOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 15,
  },
  gpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  gpsBadgeText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 5,
    marginRight: 6,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  miniButton: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    padding: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  miniButtonActive: {
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  zoomContainer: {
    position: 'absolute',
    right: 14,
    top: '40%',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: 24,
    padding: 4,
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  zoomButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  zoomButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  zoomText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  zoomTextActive: {
    color: '#0F172A',
  },
});
