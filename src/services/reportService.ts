// src/services/reportService.ts
import { PhotoRecord } from '../types/photo';
import { AttendanceRecord } from '../types/attendance';

export class ReportService {
  /**
   * Export Photos list as CSV formatted in UTF-8 with BOM for Excel Vietnamese display
   */
  public static exportPhotosCsv(photos: PhotoRecord[], filename: string = 'TIMESTAMP_PRO_BaoCaoAnh.csv'): void {
    const headers = [
      'Mã Ảnh',
      'Thời Gian Chụp',
      'Dự Án',
      'Địa Chỉ Thực Tế',
      'Vĩ Độ (Lat)',
      'Kinh Độ (Lng)',
      'Độ Chính Xác (m)',
      'Nhân Viên',
      'Mã Nhân Viên',
      'Bản Mẫu',
      'Ghi Chú',
      'Mã Hash SHA-256',
      'Trạng Thái Đồng Bộ',
    ];

    const rows = photos.map((p) => [
      `"${p.id}"`,
      `"${p.capturedAtFormatted || p.capturedAt}"`,
      `"${p.projectName || ''}"`,
      `"${(p.location.address || '').replace(/"/g, '""')}"`,
      `"${p.location.latitude}"`,
      `"${p.location.longitude}"`,
      `"${p.location.accuracy}"`,
      `"${p.ownerName}"`,
      `"${p.employeeCode || ''}"`,
      `"${p.templateName || ''}"`,
      `"${(p.note || '').replace(/"/g, '""')}"`,
      `"${p.sha256Hash}"`,
      `"${p.syncStatus}"`,
    ]);

    // Prepend UTF-8 BOM (\uFEFF) so Excel displays Vietnamese correctly without font garbling
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  }

  /**
   * Export Attendance records as CSV with UTF-8 BOM
   */
  public static exportAttendanceCsv(records: AttendanceRecord[], filename: string = 'TIMESTAMP_PRO_ChamCong.csv'): void {
    const headers = [
      'Mã Điểm Danh',
      'Nhân Viên',
      'Mã NV',
      'Loại Chấm Công',
      'Ngày',
      'Giờ',
      'Địa Điểm',
      'Khoảng Cách Tới VP (m)',
      'Đúng Bán Kính?',
      'Trạng Thái',
      'Mã Hash SHA-256',
      'Ghi Chú',
    ];

    const rows = records.map((r) => [
      `"${r.id}"`,
      `"${r.userName}"`,
      `"${r.employeeCode}"`,
      `"${r.type === 'check_in' ? 'Vào ca' : 'Tan ca'}"`,
      `"${r.formattedDate}"`,
      `"${r.formattedTime}"`,
      `"${(r.location.address || '').replace(/"/g, '""')}"`,
      `"${r.location.distanceFromOfficeMeters}"`,
      `"${r.location.isWithinGeofence ? 'Hợp lệ' : 'Ngoài bán kính'}"`,
      `"${r.status === 'on_time' ? 'Đúng giờ' : r.status === 'late' ? 'Đi muộn' : 'Vi phạm'}"`,
      `"${r.sha256Hash}"`,
      `"${(r.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  }

  /**
   * Generate Printable HTML/PDF report
   */
  public static printOrSavePdfReport(title: string, photos: PhotoRecord[]): void {
    const html = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; color: #1e293b; }
          .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 25px; }
          .title { font-size: 24px; font-weight: bold; color: #0f172a; margin-bottom: 5px; }
          .subtitle { font-size: 14px; color: #64748b; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
          .card { border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; page-break-inside: avoid; }
          .card img { width: 100%; height: 260px; object-fit: cover; display: block; }
          .card-body { padding: 12px; font-size: 13px; background: #f8fafc; }
          .card-title { font-weight: bold; color: #0f172a; margin-bottom: 4px; }
          .badge { display: inline-block; padding: 2px 6px; font-size: 11px; font-weight: 600; border-radius: 4px; background: #dcfce7; color: #166534; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #94a3b8; }
          @media print {
            body { margin: 10mm; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${title}</div>
          <div class="subtitle">Hệ thống TIMESTAMP PRO – Chụp Ảnh Thực Tế | Tạo lúc: ${new Date().toLocaleString('vi-VN')}</div>
          <div class="subtitle">Tổng số: ${photos.length} hình ảnh có chứng thực thời gian và tọa độ GPS</div>
        </div>
        <div class="grid">
          ${photos
            .map(
              (p) => `
            <div class="card">
              <img src="${p.stampedUri}" alt="Photo ${p.id}" />
              <div class="card-body">
                <div class="card-title">${p.projectName || 'Ảnh Hiện Trường'}</div>
                <div><strong>Mã ảnh:</strong> ${p.id}</div>
                <div><strong>Thời gian:</strong> ${p.capturedAtFormatted || p.capturedAt}</div>
                <div><strong>Địa điểm:</strong> ${p.location.address}</div>
                <div><strong>Tọa độ:</strong> ${p.location.latitude.toFixed(5)}, ${p.location.longitude.toFixed(5)} (±${p.location.accuracy}m)</div>
                <div><strong>Người chụp:</strong> ${p.ownerName} (${p.employeeCode || 'N/A'})</div>
                <div style="margin-top: 4px;"><span class="badge">✓ SHA-256: ${p.sha256Hash.substring(0, 16)}...</span></div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
        <div class="footer">
          Bản quyền thuộc TIMESTAMP PRO © 2026. Chứng từ kỹ thuật số phục vụ giám sát và kiểm tra hiện trường.
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 500);
          }
        </script>
      </body>
      </html>
    `;

    if (typeof window !== 'undefined') {
      const printWin = window.open('', '_blank');
      if (printWin) {
        printWin.document.open();
        printWin.document.write(html);
        printWin.document.close();
      }
    }
  }

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    if (typeof window === 'undefined') return;
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
