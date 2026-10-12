// src/components/camera/CameraPreviewView.tsx
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';

let CameraView: any = null;
let useCameraPermissions: any = () => [null, () => {}];
if (Platform.OS !== 'web') {
  try {
    const cam = require('expo-camera');
    CameraView = cam.CameraView;
    useCameraPermissions = cam.useCameraPermissions;
  } catch {}
}
import { MapPin, Grid, AlertCircle, RefreshCw } from 'lucide-react-native';
import { useCameraStore } from '../../stores/useCameraStore';
import { LocationData } from '../../types/photo';

interface CameraPreviewViewProps {
  location: LocationData;
  isLocationLoading: boolean;
  onCameraReady?: () => void;
  videoRef?: React.MutableRefObject<HTMLVideoElement | null>;
  cameraRef?: React.MutableRefObject<any>;
}

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
  const internalVideoRef = useRef<HTMLVideoElement | null>(null);

  // Setup Web camera stream using navigator.mediaDevices.getUserMedia for real camera on web
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !navigator.mediaDevices) {
      return;
    }

    let stream: MediaStream | null = null;
    const startWebCamera = async () => {
      try {
        setWebError(null);
        const facingMode = cameraFacing === 'front' ? 'user' : 'environment';
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        const targetEl = videoRef?.current || internalVideoRef.current;
        if (targetEl) {
          targetEl.srcObject = stream;
          targetEl.play();
          setWebStreamReady(true);
          onCameraReady?.();
        }
      } catch (err: any) {
        console.warn('Web camera getUserMedia error:', err);
        setWebError('Không thể mở Camera thực tế hoặc quyền truy cập bị từ chối.');
      }
    };

    startWebCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraFacing, videoRef, onCameraReady]);

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
      {/* Real Camera preview */}
      {Platform.OS === 'web' ? (
        <View style={styles.webCameraContainer}>
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
          {webError && (
            <View style={styles.webFallbackOverlay}>
              <AlertCircle size={40} color="#F59E0B" />
              <Text style={styles.webFallbackText}>{webError}</Text>
              <Text style={styles.webFallbackSub}>
                Vui lòng nhấn "Cho phép" khi trình duyệt yêu cầu quyền truy cập Camera.
              </Text>
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
  webFallbackOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  webFallbackText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 12,
  },
  webFallbackSub: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
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
