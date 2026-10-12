# TIMESTAMP PRO – CHỤP ẢNH THỰC TẾ & QUẢN LÝ CHẤM CÔNG

Ứng dụng chuyên nghiệp đa nền tảng (iOS, Android, Web) phục vụ giám sát hiện trường, chụp ảnh công trình đóng dấu thời gian, tọa độ GPS, kiểm định chữ ký số SHA-256, chấm công theo bán kính địa lý (Geofencing) và xuất báo cáo doanh nghiệp.

---

## 🌟 TÍNH NĂNG NỔI BẬT

### 1. Camera Đóng Dấu Thời Gian & GPS Thực Tế (Pixel-Burned Stamp)
- **Giao diện chuẩn hiện đại:** Thanh công cụ phía trên nền trắng với biểu tượng màu đen (Menu, Flash, Giám định ảnh, Nâng cấp VIP, Đảo camera, Nút "Đăng nhập vào nhóm" nổi bật màu xanh nhạt).
- **Xem trước Camera trực tiếp:** Hỗ trợ camera thiết bị thật (trên điện thoại và webcam trên trình duyệt), điều chỉnh zoom (0.5x, 1x, 2x), bật/tắt lưới căn chỉnh (Grid 3x3), chỉ báo GPS theo thời gian thực (độ chính xác ±m).
- **Khung thông tin đóng dấu (Stamp Card):**
  - Thanh màu vàng (accent bar) làm điểm nhấn đặc trưng ở góc dưới bên trái.
  - Đồng hồ thời gian thực tự động nhảy giây/phút (vd: `10:46:25`).
  - Ngày tháng tiếng Việt chuẩn (vd: `Thứ Hai, 12 Tháng 10, 2026`).
  - Tên cơ sở / Chi nhánh, địa chỉ thực tế từ GPS (reverse geocoding tiếng Việt).
  - Tọa độ vệ tinh GPS kinh độ/vĩ độ & sai số mét.
  - Tên dự án, tên nhân viên, mã nhân viên, ghi chú hiện trường.
  - Tem kiểm định: `✓ Ảnh ghi nhận thời gian và vị trí thực tế`.
  - **Đóng dấu thực sự vào pixel ảnh:** Sử dụng `StampEngine` kết hợp Canvas 2D vẽ trực tiếp lên file ảnh xuất ra, bảo đảm ảnh lưu vào máy và đồng bộ đều giữ nguyên dấu đóng.

### 2. Xác Thực Ảnh & Mã Vân Tay SHA-256 (Photo Integrity & Authenticity)
- Mỗi bức ảnh được cấp mã định danh duy nhất (vd: `TSP-20261012-XXXX`).
- Tự động tính toán mã băm SHA-256 tiêu chuẩn FIPS 180-4 ngay khi đóng dấu xong.
- Công cụ **Giám Định Số (Verification Inspector):** So sánh mã băm thực tế của tệp với mã băm được lưu trữ để phát hiện can thiệp hậu kỳ hoặc chỉnh sửa điểm ảnh.

### 3. Thư Viện 10+ Mẫu Đóng Dấu Đa Ngành Nghề
- Mẫu Công trình xây dựng (mặc định)
- Mẫu Chấm công nhân viên
- Mẫu Giao nhận hàng (Logistics)
- Mẫu Kiểm tra kho bãi
- Mẫu Cửa hàng & Điểm bán (Retail audit)
- Mẫu Ghi nhận hiện trường sự cố
- Mẫu Bảo trì & Sửa chữa thiết bị
- Mẫu Tối giản ngày giờ
- Mẫu Tọa độ GPS chi tiết
- Mẫu Doanh nghiệp có Logo & Tem VIP

### 4. Chấm Công Theo Bán Kính Định Vị (GPS Geofencing)
- Tính năng **VÀO CA** và **TAN CA**.
- Tự động tính khoảng cách từ vị trí hiện tại tới tọa độ trụ sở/công trình theo công thức Haversine.
- Cảnh báo trực quan khi vượt quá bán kính quy định (vd: khoảng cách > 300m).
- Xuất dữ liệu chấm công sang tệp Excel / CSV chuẩn UTF-8 (hỗ trợ tiếng Việt không lỗi font).

### 5. Hoạt Động Cục Bộ 100% (Local-First Phone Storage)
- Lưu trữ trực tiếp và tự động vào Album "TIMESTAMP PRO" trong thư viện ảnh của điện thoại.
- Hoàn toàn độc lập, không yêu cầu kết nối mạng hay đưa dữ liệu lên Supabase / máy chủ ngoài.
- Dữ liệu ảnh, chấm công, nhật ký định vị được bảo mật tuyệt đối trên thiết bị của bạn.

### 6. Quản Trị Doanh Nghiệp (Admin Portal)
- Dashboard tổng quan các chỉ số KPI: Tổng số ảnh, Lượt chấm công, Dung lượng lưu trữ, Dự án.
- Quản lý dự án, tổ chức, phân quyền nhân sự.
- Nhật ký kiểm toán bảo mật (Audit Logs) ghi nhận địa chỉ IP, người thực hiện và thời gian.

---

## 🛠️ CẤU TRÚC THƯ MỤC DỰ ÁN

```
timestamp-pro/
├── App.tsx                     # Component gốc điều phối màn hình và điều hướng
├── app.json                    # Cấu hình Expo, quyền Camera, Location, MediaLibrary
├── package.json                # Thư viện phụ thuộc (React Native, Expo, Zustand, Lucide, Supabase)
├── tsconfig.json               # Cấu hình TypeScript
├── .env.example                # Mẫu biến môi trường Supabase & API keys
│
├── src/
│   ├── types/                  # Định nghĩa TypeScript Types & Data Models
│   │   ├── photo.ts            # PhotoRecord, LocationData, StampConfig
│   │   ├── template.ts         # Danh sách 10+ Stamp Templates
│   │   ├── attendance.ts       # AttendanceRecord, WorkplaceGeofence
│   │   └── auth.ts             # UserProfile, Team, Project, Subscriptions
│   │
│   ├── services/               # Các tầng xử lý nghiệp vụ lõi
│   │   ├── stampEngine.ts      # Engine đóng dấu vào pixel ảnh & tính mã băm SHA-256
│   │   ├── locationService.ts  # GPS, Reverse Geocoding địa chỉ VN, Haversine Geofence
│   │   ├── storageService.ts   # Lưu trữ ảnh ngoại tuyến, Media Library, Hàng đợi đồng bộ
│   │   ├── verificationService.ts # Giám định tính toàn vẹn SHA-256 & chống giả mạo
│   │   ├── reportService.ts    # Xuất báo cáo CSV UTF-8 BOM (Excel) & In ấn PDF
│   │   └── supabaseClient.ts   # Kết nối Supabase Backend
│   │
│   ├── stores/                 # Quản lý trạng thái (Zustand Stores)
│   │   ├── useCameraStore.ts   # Flash, Zoom, Lưới, Tab hiện tại, Modals
│   │   ├── useTemplateStore.ts # Quản lý mẫu đóng dấu và tùy biến trường dữ liệu
│   │   ├── usePhotoStore.ts    # Danh sách ảnh, xem ảnh vừa chụp, đồng bộ
│   │   ├── useAttendanceStore.ts # Điểm danh ca làm việc, lịch sử chấm công
│   │   └── useAuthStore.ts     # Thông tin nhân viên, đội nhóm, dự án, gói VIP
│   │
│   └── components/
│       ├── camera/             # Giao diện Camera chính
│       │   ├── CameraTopBar.tsx     # Thanh công cụ trên nền trắng, icon đen
│       │   ├── CameraPreviewView.tsx# Xem trước camera, zoom 0.5x/1x/2x, lưới, GPS
│       │   ├── StampOverlay.tsx     # Bảng thông tin đóng dấu với thanh vàng điểm nhấn
│       │   └── CameraControls.tsx   # Thư viện, Nút chụp tròn lớn, Bản mẫu
│       │
│       ├── navigation/
│       │   └── BottomTabBar.tsx     # 5 tabs: Báo cáo, Video, Ảnh, Chấm công, Danh sách
│       │
│       ├── modals/             # Hộp thoại chức năng
│       │   ├── TemplateSelectorModal.tsx # Bộ chọn & tùy biến 10 mẫu đóng dấu
│       │   ├── PhotoPreviewModal.tsx     # Kiểm tra ảnh sau chụp, lưu máy, chia sẻ
│       │   ├── VerificationModal.tsx     # Chứng thực tệp & kiểm định SHA-256
│       │   ├── TeamAuthModal.tsx         # Đăng nhập nhóm bằng mã mời, chọn dự án
│       │   ├── VipModal.tsx              # Gói VIP/Plus & Thanh toán VietQR/MoMo
│       │   └── SettingsDrawer.tsx        # Cài đặt cá nhân & mở Admin Portal
│       │
│       └── views/              # Các màn hình chính
│           ├── CameraScreen.tsx          # Màn hình chụp ảnh
│           ├── GalleryScreen.tsx         # Thư viện lưới ảnh, lọc dự án, đa chọn
│           ├── AttendanceScreen.tsx      # Chấm công vào/tan ca & GPS Geofence
│           ├── ReportsScreen.tsx         # Biểu đồ thống kê & xuất file
│           ├── ListScreen.tsx            # Danh sách ảnh, dự án, hàng đợi đồng bộ
│           └── AdminDashboardView.tsx    # Trang quản trị web doanh nghiệp
│
└── supabase/
    └── migrations/
        └── 20261012_initial_schema.sql   # PostgreSQL Schema: 15 bảng, Indexes & RLS Policies
```

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY DỰ ÁN

### 1. Yêu Cầu Môi Trường
- Node.js version 18+ (hoặc mới hơn)
- npm version 9+

### 2. Cài Đặt Thư Viện
```bash
npm install --legacy-peer-deps
```

### 3. Cấu Hình Biến Môi Trường (Nếu sử dụng Supabase thật)
Tạo tệp `.env` dựa trên `.env.example`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Chạy Ứng Dụng Trên Trình Duyệt Web / Preview Trực Tiếp
```bash
# Xuất bản build web tĩnh
npx expo export --platform web

# Phục vụ máy chủ cục bộ
npx serve dist -l 3000
```
Truy cập: `http://localhost:3000`

### 5. Chạy Ứng Dụng Di Động (iOS & Android) Qua Expo Go
```bash
# Khởi động Expo Metro Bundler
npx expo start
```
- Mở ứng dụng **Expo Go** trên điện thoại Android hoặc iOS.
- Quét mã QR hiển thị trên màn hình terminal để chạy ứng dụng trực tiếp trên camera điện thoại thật.
- Có thể chạy lệnh riêng:
  - Android: `npm run android`
  - iOS: `npm run ios`

---

## 🗄️ CƠ SỞ DỮ LIỆU & SUPABASE MIGRATION

Tệp migration nằm tại [20261012_initial_schema.sql](file:///d:/app%202/supabase/migrations/20261012_initial_schema.sql) gồm 15 bảng:
1. `organizations` (Doanh nghiệp)
2. `profiles` (Tài khoản người dùng, mã nhân viên, phòng ban)
3. `organization_members` (Thành viên tổ chức)
4. `teams` (Nhóm làm việc)
5. `team_members` (Phân quyền nhóm)
6. `projects` (Dự án, công trình, tọa độ tâm và bán kính)
7. `stamp_templates` (Mẫu đóng dấu tùy chỉnh)
8. `photos` (Bản ghi ảnh, đường dẫn ảnh gốc và ảnh đã đóng dấu, tọa độ, mã SHA-256)
9. `photo_metadata` (Thông tin EXIF, thiết bị, camera)
10. `photo_verifications` (Lịch sử kiểm định tính toàn vẹn)
11. `attendance_records` (Điểm danh ca làm việc, kiểm tra bán kính geofence)
12. `subscriptions` (Gói dịch vụ Free/Plus/Enterprise)
13. `payments` (Lịch sử giao dịch thanh toán)
14. `notifications` (Thông báo hệ thống)
15. `audit_logs` (Nhật ký kiểm toán bảo mật)

Bảo mật dữ liệu bằng **Row Level Security (RLS)** bảo đảm người dùng chỉ được xem ảnh và dữ liệu trong phạm vi đội nhóm hoặc dự án được phân công.
