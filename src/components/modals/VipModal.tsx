// src/components/modals/VipModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  X,
  Crown,
  Check,
  CreditCard,
  QrCode,
  Sparkles,
  Shield,
  Zap,
} from 'lucide-react-native';
import { useAuthStore } from '../../stores/useAuthStore';
import { SubscriptionTier } from '../../types/auth';

interface VipModalProps {
  visible: boolean;
  onClose: () => void;
}

export const VipModal: React.FC<VipModalProps> = ({ visible, onClose }) => {
  const { user, setSubscriptionTier } = useAuthStore();
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(user.subscriptionTier);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'vietqr' | 'momo' | 'vnpay'>('vietqr');
  const [showQrCheckout, setShowQrCheckout] = useState(false);

  const PLANS = [
    {
      id: 'free' as SubscriptionTier,
      name: 'Miễn Phí',
      price: '0 đ',
      period: 'mãi mãi',
      features: [
        'Chụp ảnh & đóng dấu cơ bản',
        'Lưu ảnh trên bộ nhớ thiết bị',
        '5 mẫu đóng dấu tiêu chuẩn',
        'Quản lý ảnh cá nhân',
      ],
      notIncluded: [
        'Logo thương hiệu riêng',
        'Đồng bộ đám mây tự động',
        'Quản lý nhóm & chấm công GPS',
      ],
    },
    {
      id: 'plus' as SubscriptionTier,
      name: 'TIMESTAMP PRO Plus',
      price: '89.000 đ',
      period: '/ tháng',
      badge: 'Phổ biến nhất',
      features: [
        'Toàn bộ 10+ mẫu đóng dấu cao cấp',
        'Tùy chỉnh Logo & Watermark doanh nghiệp',
        'Lưu trữ đám mây 15 GB',
        'Đồng bộ tức thì đa thiết bị',
        'Xác thực số & Chữ ký SHA-256',
        'Xuất báo cáo PDF & Excel không giới hạn',
      ],
    },
    {
      id: 'enterprise' as SubscriptionTier,
      name: 'Doanh Nghiệp / Enterprise',
      price: '199.000 đ',
      period: '/ người / tháng',
      badge: 'Doanh nghiệp',
      features: [
        'Không giới hạn lưu trữ dữ liệu',
        'Quản trị tập trung Web Dashboard',
        'Chấm công khuôn mặt & Bán kính GPS Geofence',
        'Phân quyền nhân viên, phòng ban, dự án',
        'Nhật ký kiểm toán Audit Log bảo mật',
        'Hỗ trợ kỹ thuật 24/7 & Hợp đồng hóa đơn VAT',
      ],
    },
  ];

  const handleCheckout = () => {
    if (selectedTier === 'free') {
      setSubscriptionTier('free');
      Alert.alert('Thành Công', 'Đã chuyển sang gói Miễn Phí');
      onClose();
      return;
    }
    setShowQrCheckout(true);
  };

  const handleSimulatePaymentWebhook = (success: boolean) => {
    if (success) {
      setSubscriptionTier(selectedTier);
      setShowQrCheckout(false);
      Alert.alert('Nâng Cấp Thành Công', `Gói ${selectedTier.toUpperCase()} đã được kích hoạt!`);
      onClose();
    } else {
      Alert.alert('Thanh toán', 'Giao dịch đã hủy hoặc chờ xác nhận ngân hàng.');
      setShowQrCheckout(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.iconCircle}>
                <Crown size={22} color="#D97706" fill="#FBBF24" />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.title}>Gói Dịch Vụ & Bản Quyền</Text>
                <Text style={styles.subtitle}>Hiện tại: {user.subscriptionTier.toUpperCase()} ({user.isVip ? 'VIP Đã Kích Hoạt' : 'Cơ bản'})</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 24 }}>
            {!showQrCheckout ? (
              <>
                <Text style={styles.sectionHeading}>Chọn gói bản quyền phù hợp cho bạn hoặc doanh nghiệp:</Text>

                {PLANS.map((plan) => {
                  const isSelected = selectedTier === plan.id;
                  return (
                    <TouchableOpacity
                      key={plan.id}
                      style={[
                        styles.planCard,
                        isSelected && styles.planCardSelected,
                        plan.id === 'plus' && styles.planCardPlus,
                      ]}
                      onPress={() => setSelectedTier(plan.id)}
                      activeOpacity={0.85}
                    >
                      {plan.badge && (
                        <View style={styles.planBadge}>
                          <Sparkles size={11} color="#FFFFFF" />
                          <Text style={styles.planBadgeText}>{plan.badge}</Text>
                        </View>
                      )}

                      <View style={styles.planHeader}>
                        <Text style={styles.planName}>{plan.name}</Text>
                        <View style={styles.priceRow}>
                          <Text style={styles.priceNumber}>{plan.price}</Text>
                          <Text style={styles.pricePeriod}>{plan.period}</Text>
                        </View>
                      </View>

                      <View style={styles.featureList}>
                        {plan.features.map((feat, i) => (
                          <View key={i} style={styles.featureItem}>
                            <Check size={14} color="#10B981" />
                            <Text style={styles.featureText}>{feat}</Text>
                          </View>
                        ))}
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {/* Vietnam Payment Options */}
                <Text style={[styles.sectionHeading, { marginTop: 16 }]}>Phương Thức Thanh Toán Việt Nam:</Text>
                <View style={styles.paymentMethodsRow}>
                  <TouchableOpacity
                    style={[
                      styles.paymentMethodCard,
                      selectedPaymentMethod === 'vietqr' && styles.paymentMethodActive,
                    ]}
                    onPress={() => setSelectedPaymentMethod('vietqr')}
                  >
                    <QrCode size={20} color="#0284C7" />
                    <Text style={styles.paymentMethodText}>VietQR Chuyển Khoản</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.paymentMethodCard,
                      selectedPaymentMethod === 'momo' && styles.paymentMethodActive,
                    ]}
                    onPress={() => setSelectedPaymentMethod('momo')}
                  >
                    <Zap size={20} color="#D946EF" />
                    <Text style={styles.paymentMethodText}>Ví MoMo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.paymentMethodCard,
                      selectedPaymentMethod === 'vnpay' && styles.paymentMethodActive,
                    ]}
                    onPress={() => setSelectedPaymentMethod('vnpay')}
                  >
                    <CreditCard size={20} color="#EF4444" />
                    <Text style={styles.paymentMethodText}>VNPAY-QR / Thẻ ATM</Text>
                  </TouchableOpacity>
                </View>

                {/* Submit button */}
                <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout} activeOpacity={0.8}>
                  <Text style={styles.checkoutBtnText}>
                    {selectedTier === 'free' ? 'Dùng Gói Miễn Phí' : `Thanh Toán & Kích Hoạt Gói ${selectedTier.toUpperCase()}`}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              /* QR Payment Dialog */
              <View style={styles.qrContainer}>
                <Text style={styles.qrTitle}>Quét Mã VietQR / Ngân Hàng Để Kích Hoạt</Text>
                <Text style={styles.qrSub}>Đơn hàng: Nâng cấp {selectedTier.toUpperCase()} – Người dùng: {user.email}</Text>

                <View style={styles.qrBox}>
                  {/* Visual simulated authentic VietQR frame */}
                  <View style={styles.qrMockFrame}>
                    <QrCode size={180} color="#0F172A" />
                    <View style={styles.qrCenterLogo}>
                      <Text style={styles.qrLogoText}>NAPAS 247</Text>
                    </View>
                  </View>
                  <Text style={styles.qrBankInfo}>Ngân hàng: MB Bank (Quân Đội)</Text>
                  <Text style={styles.qrBankInfo}>STK: 0987654321 - TIMESTAMP PRO</Text>
                  <Text style={styles.qrBankInfo}>Số tiền: {selectedTier === 'plus' ? '89.000 VNĐ' : '199.000 VNĐ'}</Text>
                  <Text style={styles.qrBankInfo}>Nội dung: TSP {user.employeeCode}</Text>
                </View>

                <View style={styles.qrActions}>
                  <TouchableOpacity
                    style={styles.simulateSuccessBtn}
                    onPress={() => handleSimulatePaymentWebhook(true)}
                  >
                    <Check size={16} color="#FFFFFF" />
                    <Text style={styles.simulateSuccessText}>Tôi Đã Chuyển Khoản Thành Công</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelQrBtn}
                    onPress={() => setShowQrCheckout(false)}
                  >
                    <Text style={styles.cancelQrText}>Quay Lại</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 18,
    backgroundColor: '#1E293B',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 10,
  },
  planCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#334155',
    position: 'relative',
  },
  planCardPlus: {
    borderColor: '#F59E0B',
  },
  planCardSelected: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
  },
  planBadge: {
    position: 'absolute',
    top: -10,
    right: 14,
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  planBadgeText: {
    color: '#0F172A',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 3,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  planName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F59E0B',
  },
  pricePeriod: {
    fontSize: 11,
    color: '#94A3B8',
    marginLeft: 4,
  },
  featureList: {
    gap: 6,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 12.5,
    color: '#E2E8F0',
    marginLeft: 8,
  },
  paymentMethodsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  paymentMethodCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  paymentMethodActive: {
    borderColor: '#0284C7',
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
  },
  paymentMethodText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  checkoutBtn: {
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  checkoutBtnText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: 'bold',
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  qrTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  qrSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  qrBox: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  qrMockFrame: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  qrCenterLogo: {
    position: 'absolute',
    backgroundColor: '#0284C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  qrLogoText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  qrBankInfo: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  qrActions: {
    width: '100%',
    maxWidth: 320,
    marginTop: 20,
    gap: 10,
  },
  simulateSuccessBtn: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  simulateSuccessText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6,
  },
  cancelQrBtn: {
    backgroundColor: '#334155',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelQrText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
  },
});
