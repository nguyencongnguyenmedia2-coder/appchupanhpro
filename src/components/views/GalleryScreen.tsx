// src/components/views/GalleryScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  ArrowLeft,
  Search,
  Filter,
  FileSpreadsheet,
  Printer,
  Trash2,
  Share2,
  CloudUpload,
  CheckCircle,
  Eye,
  CheckSquare,
  Square,
} from 'lucide-react-native';
import { usePhotoStore } from '../../stores/usePhotoStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { ReportService } from '../../services/reportService';
import { StorageService } from '../../services/storageService';
import { PhotoRecord } from '../../types/photo';

interface GalleryScreenProps {
  onBackToCamera: () => void;
  onSelectPhotoDetail?: (photo: PhotoRecord) => void;
}

export const GalleryScreen: React.FC<GalleryScreenProps> = ({
  onBackToCamera,
  onSelectPhotoDetail,
}) => {
  const { photos, deletePhoto } = usePhotoStore();
  const { projects } = useAuthStore();

  const [search, setSearch] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Filter photos
  const filteredPhotos = photos.filter((p) => {
    const matchProject = selectedProjectId === 'all' || p.projectId === selectedProjectId;
    const matchSearch =
      !search.trim() ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.location.address.toLowerCase().includes(search.toLowerCase()) ||
      (p.note && p.note.toLowerCase().includes(search.toLowerCase())) ||
      (p.projectName && p.projectName.toLowerCase().includes(search.toLowerCase()));
    return matchProject && matchSearch;
  });

  const toggleSelectPhoto = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredPhotos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPhotos.map((p) => p.id));
    }
  };

  const handleDeleteSelected = () => {
    Alert.alert(
      'Xác Nhận Xóa',
      `Bạn có chắc chắn muốn xóa ${selectedIds.length} ảnh đã chọn khỏi thiết bị?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa vĩnh viễn',
          style: 'destructive',
          onPress: async () => {
            for (const id of selectedIds) {
              await deletePhoto(id);
            }
            setSelectedIds([]);
            setIsSelectMode(false);
          },
        },
      ]
    );
  };

  const handleExportCsv = () => {
    const exportTargets = selectedIds.length > 0
      ? photos.filter((p) => selectedIds.includes(p.id))
      : filteredPhotos;

    if (exportTargets.length === 0) {
      Alert.alert('Thông báo', 'Không có ảnh nào để xuất dữ liệu.');
      return;
    }
    ReportService.exportPhotosCsv(exportTargets);
  };

  const handlePrintPdf = () => {
    const exportTargets = selectedIds.length > 0
      ? photos.filter((p) => selectedIds.includes(p.id))
      : filteredPhotos;

    if (exportTargets.length === 0) {
      Alert.alert('Thông báo', 'Không có ảnh nào để tạo báo cáo PDF.');
      return;
    }
    ReportService.printOrSavePdfReport('BÁO CÁO HÌNH ẢNH HIỆN TRƯỜNG', exportTargets);
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBackToCamera}>
          <ArrowLeft size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.title}>Thư Viện Ảnh Đóng Dấu</Text>
          <Text style={styles.subTitle}>
            {filteredPhotos.length} ảnh ghi nhận • Lưu trữ cục bộ trên máy
          </Text>
        </View>

        <TouchableOpacity
          style={styles.selectModeBtn}
          onPress={() => {
            setIsSelectMode(!isSelectMode);
            setSelectedIds([]);
          }}
        >
          <Text style={styles.selectModeText}>{isSelectMode ? 'Xong' : 'Chọn'}</Text>
        </TouchableOpacity>
      </View>

      {/* Search & Actions Bar */}
      <View style={styles.searchBar}>
        <View style={styles.searchInputWrapper}>
          <Search size={16} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo địa chỉ, dự án, ghi chú..."
            placeholderTextColor="#64748B"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Quick export actions */}
        <TouchableOpacity style={styles.iconBtn} onPress={handleExportCsv} accessibilityLabel="Xuất CSV">
          <FileSpreadsheet size={18} color="#10B981" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={handlePrintPdf} accessibilityLabel="Xuất PDF">
          <Printer size={18} color="#38BDF8" />
        </TouchableOpacity>
      </View>

      {/* Project Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
        <TouchableOpacity
          style={[styles.chip, selectedProjectId === 'all' && styles.chipActive]}
          onPress={() => setSelectedProjectId('all')}
        >
          <Text style={[styles.chipText, selectedProjectId === 'all' && styles.chipTextActive]}>
            Tất Cả Dự Án
          </Text>
        </TouchableOpacity>

        {projects.map((proj) => (
          <TouchableOpacity
            key={proj.id}
            style={[styles.chip, selectedProjectId === proj.id && styles.chipActive]}
            onPress={() => setSelectedProjectId(proj.id)}
          >
            <Text
              style={[
                styles.chipText,
                selectedProjectId === proj.id && styles.chipTextActive,
              ]}
            >
              {proj.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Multi-select Header if active */}
      {isSelectMode && (
        <View style={styles.multiSelectBar}>
          <TouchableOpacity style={styles.selectAllBtn} onPress={handleSelectAll}>
            {selectedIds.length === filteredPhotos.length ? (
              <CheckSquare size={16} color="#F59E0B" />
            ) : (
              <Square size={16} color="#94A3B8" />
            )}
            <Text style={styles.selectAllText}>
              Đã chọn: {selectedIds.length}/{filteredPhotos.length}
            </Text>
          </TouchableOpacity>

          {selectedIds.length > 0 && (
            <TouchableOpacity style={styles.deleteSelectedBtn} onPress={handleDeleteSelected}>
              <Trash2 size={16} color="#EF4444" />
              <Text style={styles.deleteSelectedText}>Xóa</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Photos Grid */}
      <ScrollView style={styles.gridContainer} contentContainerStyle={styles.gridContent}>
        {filteredPhotos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Chưa có ảnh nào phù hợp</Text>
            <Text style={styles.emptySub}>
              Nhấn nút quay lại để chụp ảnh mới với camera thật.
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredPhotos.map((photo) => {
              const isSelected = selectedIds.includes(photo.id);
              return (
                <TouchableOpacity
                  key={photo.id}
                  style={[styles.gridItem, isSelected && styles.gridItemSelected]}
                  onPress={() => {
                    if (isSelectMode) {
                      toggleSelectPhoto(photo.id);
                    } else {
                      onSelectPhotoDetail?.(photo);
                    }
                  }}
                  activeOpacity={0.85}
                >
                  <Image source={{ uri: photo.stampedUri }} style={styles.photoImg} />

                  {/* Sync & Verified Badge */}
                  <View style={styles.photoOverlayBadge}>
                    <Text style={styles.timeTag}>
                      {photo.capturedAtFormatted.split('–')[0]?.trim()}
                    </Text>
                    {photo.syncStatus === 'synced' && (
                      <CheckCircle size={14} color="#10B981" />
                    )}
                  </View>

                  {/* Multi-select Checkbox */}
                  {isSelectMode && (
                    <View style={styles.selectCheckbox}>
                      {isSelected ? (
                        <CheckSquare size={18} color="#F59E0B" />
                      ) : (
                        <Square size={18} color="#FFFFFF" />
                      )}
                    </View>
                  )}

                  {/* Caption info */}
                  <View style={styles.photoCaption}>
                    <Text style={styles.photoProject} numberOfLines={1}>
                      {photo.projectName || 'Ảnh Hiện Trường'}
                    </Text>
                    <Text style={styles.photoLocation} numberOfLines={1}>
                      {photo.location.address}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subTitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  selectModeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1E293B',
    borderRadius: 6,
  },
  selectModeText: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '600',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    marginLeft: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    maxHeight: 36,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: '#F59E0B',
  },
  chipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#F59E0B',
    fontWeight: '700',
  },
  multiSelectBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  selectAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectAllText: {
    color: '#E2E8F0',
    fontSize: 13,
    marginLeft: 6,
  },
  deleteSelectedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 6,
  },
  deleteSelectedText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  gridContainer: {
    flex: 1,
  },
  gridContent: {
    padding: 12,
    paddingBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  gridItemSelected: {
    borderColor: '#F59E0B',
  },
  photoImg: {
    width: '100%',
    height: 140,
    backgroundColor: '#0F172A',
  },
  photoOverlayBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeTag: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  selectCheckbox: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderRadius: 4,
    padding: 2,
  },
  photoCaption: {
    padding: 8,
  },
  photoProject: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  photoLocation: {
    color: '#94A3B8',
    fontSize: 10.5,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptySub: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 6,
  },
});
