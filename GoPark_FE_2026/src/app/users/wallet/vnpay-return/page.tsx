'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function VnpayReturnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const calledIpn = useRef(false);
  
  const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
  const vnp_Amount = searchParams.get('vnp_Amount');
  const isSuccess = vnp_ResponseCode === '00';
  
  const [amount, setAmount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (vnp_Amount) {
      setAmount(parseInt(vnp_Amount) / 100);
    }
  }, [vnp_Amount]);

  // LOCALHACK: Tự động gọi IPN khi trở về trang return (Do VNPAY ko thể IPN về localhost)
  useEffect(() => {
    const triggerIpnLocally = async () => {
      if (isSuccess && !calledIpn.current) {
        calledIpn.current = true;
        setIsSyncing(true);
        try {
          // Lấy toàn bộ query params hiện tại trên URL
          const queryStr = searchParams.toString();
          
          console.log("Đang đồng bộ giao dịch local...");
          await apiClient(`/payment/vnpay/ipn?${queryStr}`, { method: 'GET' });
          console.log("Đồng bộ hoàn tất!");
        } catch (error) {
          console.error("Lỗi khi đồng bộ IPN ở local:", error);
        }finally {
          setIsSyncing(false);
        }
      }
    };
    triggerIpnLocally();
  }, [isSuccess, searchParams]);

  return (
    <div className="flex h-screen w-full items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center flex flex-col items-center">
          {isSuccess ? (
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
          ) : (
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
          )}
          <CardTitle className="text-2xl">{isSuccess ? 'Nạp tiền thành công!' : 'Giao dịch thất bại'}</CardTitle>
          <CardDescription>
            {isSuccess 
              ? 'Hệ thống đã ghi nhận giao dịch của bạn.' 
              : 'Có lỗi xảy ra trong quá trình thanh toán, hoặc bạn đã hủy giao dịch.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">Mã giao dịch</span>
            <span className="font-medium">{searchParams.get('vnp_TransactionNo') || searchParams.get('vnp_TxnRef')}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">Số tiền</span>
            <span className="font-bold text-lg text-green-600">
              {amount.toLocaleString('vi-VN')} VNĐ
            </span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">Mã ngân hàng</span>
            <span className="font-medium">{searchParams.get('vnp_BankCode')}</span>
          </div>
          <div className="flex justify-between pb-2">
            <span className="text-gray-500">Thông tin Hóa đơn</span>
            <span className="font-medium text-right">{searchParams.get('vnp_OrderInfo')}</span>
          </div>
        </CardContent>

        
        <CardFooter className="flex flex-col space-y-3">

          {/* Nút Xem hóa đơn chi tiết - Thiết kế đồng nhất với nút chính */}
          {isSuccess && searchParams.get('vnp_OrderInfo')?.startsWith('PayBooking_') && (
            <Button 
              className="w-full" 
              disabled={isSyncing}
              onClick={() => {
                const orderInfo = searchParams.get('vnp_OrderInfo') || '';
                const parts = orderInfo.split('_');
                const bookingId = parts[2] ?? parts[1] ?? '';
                if (bookingId) {
                  router.push(`/users/invoice/${bookingId}`);
                } else {
                  router.push('/users/profile');
                }
              }}
            >
              {isSyncing ? 'Đang khởi tạo hóa đơn...' : 'Xem hóa đơn chi tiết'}
            </Button>
          )}

          <Button 
            className="w-full"
            onClick={() => {
              const orderInfo = searchParams.get('vnp_OrderInfo') || '';
              if (orderInfo.startsWith('PayBooking_')) {
                router.push('/users/profile');
              } else {
                router.push('/users/wallet');
              }
            }}
          >
            Quay về trang chủ
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
