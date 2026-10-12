// src/stores/useCameraStore.ts
import { create } from 'zustand';

export type BottomTabType = 'reports' | 'video' | 'photos' | 'attendance' | 'list';
export type FlashModeType = 'off' | 'on' | 'auto';
export type CameraFacingType = 'back' | 'front';

interface CameraState {
  flashMode: FlashModeType;
  cameraFacing: CameraFacingType;
  zoomLevel: number;
  showGrid: boolean;
  activeTab: BottomTabType;
  isCapturing: boolean;
  isRecordingVideo: boolean;
  videoDurationSec: number;
  showVerifyModal: boolean;
  showVipModal: boolean;
  showTemplateModal: boolean;
  showTeamModal: boolean;
  showSettingsDrawer: boolean;
  showPhotoReviewModal: boolean;

  setFlashMode: (mode: FlashModeType) => void;
  toggleFlash: () => void;
  setCameraFacing: (facing: CameraFacingType) => void;
  toggleCameraFacing: () => void;
  setZoomLevel: (zoom: number) => void;
  toggleGrid: () => void;
  setActiveTab: (tab: BottomTabType) => void;
  setIsCapturing: (capturing: boolean) => void;
  setIsRecordingVideo: (recording: boolean) => void;
  setVideoDurationSec: (sec: number | ((prev: number) => number)) => void;

  setShowVerifyModal: (show: boolean) => void;
  setShowVipModal: (show: boolean) => void;
  setShowTemplateModal: (show: boolean) => void;
  setShowTeamModal: (show: boolean) => void;
  setShowSettingsDrawer: (show: boolean) => void;
  setShowPhotoReviewModal: (show: boolean) => void;
}

export const useCameraStore = create<CameraState>((set) => ({
  flashMode: 'off',
  cameraFacing: 'back',
  zoomLevel: 1,
  showGrid: false,
  activeTab: 'photos', // Default tab is Ảnh as requested
  isCapturing: false,
  isRecordingVideo: false,
  videoDurationSec: 0,
  showVerifyModal: false,
  showVipModal: false,
  showTemplateModal: false,
  showTeamModal: false,
  showSettingsDrawer: false,
  showPhotoReviewModal: false,

  setFlashMode: (mode) => set({ flashMode: mode }),
  toggleFlash: () =>
    set((state) => ({
      flashMode: state.flashMode === 'off' ? 'on' : state.flashMode === 'on' ? 'auto' : 'off',
    })),
  setCameraFacing: (facing) => set({ cameraFacing: facing }),
  toggleCameraFacing: () =>
    set((state) => ({
      cameraFacing: state.cameraFacing === 'back' ? 'front' : 'back',
    })),
  setZoomLevel: (zoom) => set({ zoomLevel: zoom }),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setIsCapturing: (capturing) => set({ isCapturing: capturing }),
  setIsRecordingVideo: (recording) => set({ isRecordingVideo: recording }),
  setVideoDurationSec: (val) =>
    set((state) => ({
      videoDurationSec: typeof val === 'function' ? val(state.videoDurationSec) : val,
    })),

  setShowVerifyModal: (show) => set({ showVerifyModal: show }),
  setShowVipModal: (show) => set({ showVipModal: show }),
  setShowTemplateModal: (show) => set({ showTemplateModal: show }),
  setShowTeamModal: (show) => set({ showTeamModal: show }),
  setShowSettingsDrawer: (show) => set({ showSettingsDrawer: show }),
  setShowPhotoReviewModal: (show) => set({ showPhotoReviewModal: show }),
}));
