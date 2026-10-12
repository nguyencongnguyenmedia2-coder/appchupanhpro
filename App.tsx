// App.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';
import { useCameraStore } from './src/stores/useCameraStore';
import { usePhotoStore } from './src/stores/usePhotoStore';
import { CameraScreen } from './src/components/views/CameraScreen';
import { GalleryScreen } from './src/components/views/GalleryScreen';
import { AttendanceScreen } from './src/components/views/AttendanceScreen';
import { ReportsScreen } from './src/components/views/ReportsScreen';
import { ListScreen } from './src/components/views/ListScreen';
import { AdminDashboardView } from './src/components/views/AdminDashboardView';
import { BottomTabBar } from './src/components/navigation/BottomTabBar';
import { PhotoPreviewModal } from './src/components/modals/PhotoPreviewModal';
import { PhotoRecord } from './src/types/photo';

export default function App() {
  const { activeTab, setActiveTab } = useCameraStore();
  const { loadStoredPhotos } = usePhotoStore();

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);
  const [inspectedPhoto, setInspectedPhoto] = useState<PhotoRecord | null>(null);

  // Initialize stored photos on app load
  useEffect(() => {
    loadStoredPhotos();
  }, [loadStoredPhotos]);

  // Handle detailed inspect from gallery
  const handleSelectPhotoDetail = (photo: PhotoRecord) => {
    setInspectedPhoto(photo);
  };

  // Render view based on navigation state
  const renderCurrentView = () => {
    // 1. If Admin portal is open
    if (isAdminPortalOpen) {
      return <AdminDashboardView onBackToApp={() => setIsAdminPortalOpen(false)} />;
    }

    // 2. If Gallery is explicitly open from Camera controls
    if (isGalleryOpen) {
      return (
        <GalleryScreen
          onBackToCamera={() => setIsGalleryOpen(false)}
          onSelectPhotoDetail={handleSelectPhotoDetail}
        />
      );
    }

    // 3. Otherwise render tab view
    switch (activeTab) {
      case 'reports':
        return <ReportsScreen />;
      case 'attendance':
        return <AttendanceScreen />;
      case 'list':
        return <ListScreen />;
      case 'video':
      case 'photos':
      default:
        return (
          <CameraScreen
            onOpenGallery={() => setIsGalleryOpen(true)}
            onOpenAdmin={() => setIsAdminPortalOpen(true)}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.rootContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Main View Area */}
      <View style={styles.mainView}>{renderCurrentView()}</View>

      {/* Bottom Tab Bar (shown when not in Admin Portal or Gallery modal) */}
      {!isAdminPortalOpen && !isGalleryOpen && <BottomTabBar />}

      {/* Detail Photo Modal */}
      <PhotoPreviewModal
        visible={!!inspectedPhoto}
        photo={inspectedPhoto}
        onClose={() => setInspectedPhoto(null)}
        onRetake={() => {
          setInspectedPhoto(null);
          setIsGalleryOpen(false);
          setActiveTab('photos');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  mainView: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
