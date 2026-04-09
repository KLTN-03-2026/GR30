'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, Loader2, History, ArrowDownToLine, ArrowUpFromLine, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import { useWallet, useWalletTransactions } from '@/hooks/useWallet';

export default function WalletDashboardPage() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const user = useAuthStore((state) => state.user);
  const { data: balance, isLoading: isFetchingWallet, isError: isWalletError, refetch: refetchWallet } = useWallet();
  const { data: transactions, isLoading: isFetchingTransactions } = useWalletTransactions();
  const [isActivating, setIsActivating] = useState(false);

  const handleActivateWallet = async () => {
    setIsActivating(true);
    try {
      await apiClient('/wallets/init', {
        method: 'POST',
        body: JSON.stringify({ userId: user?.id })
      });
      toast.success('Kích hoạt ví thành công!');
      refetchWallet();
    } catch (e) {
      toast.error('Có lỗi khi kích hoạt ví. Vui lòng thử lại sau.');
      console.error(e);
    } finally {
      setIsActivating(false);
    }
  };

  const handleDeposit = async () => {
    const numAmount = parseInt(amount);

    if (isNaN(numAmount) || numAmount < 10000) {
      toast.error('Số tiền nạp tối thiểu là 10.000 VNĐ');
      return;
    }

    setIsLoading(true);

    try {
      const response: any = await apiClient('/payment/vnpay/create-url', {
        method: 'POST',
        body: JSON.stringify({
          amount: numAmount,
          userId: user?.id || 'default-user-id'
        })
      });

      const url = response?.data?.url || response?.url;

      if (url) {
        window.location.href = url;
      } else {
        toast.error(response?.message || 'Có lỗi khi tạo giao dịch VNPAY');
      }

    } catch (error) {
      console.error(error);
      toast.error('Lỗi kết nối tới máy chủ nạp tiền');
    } finally {
      setIsLoading(false);
    }
  };

  const presetAmounts = [10000, 20000, 50000, 100000, 200000, 500000];

  return (
    <div className="container mx-auto p-4 max-w-4xl min-h-screen pt-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
          <Wallet className="h-8 w-8 text-emerald-600" />
          Ví GoPark
        </h1>
        <Button 
          variant="outline" 
          onClick={() => router.back()} 
          className="w-full md:w-auto border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Số dư */}
        <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl relative overflow-hidden">
          <CardHeader>
            <CardDescription className="text-emerald-100">
              Số dư hiện tại
            </CardDescription>
            <CardTitle className="text-4xl">
              {isFetchingWallet ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : isWalletError ? (
                <span className="text-2xl opacity-80">Chưa kích hoạt</span>
              ) : (
                <>
                  {(balance || 0).toLocaleString('vi-VN')} ₫
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isWalletError ? (
              <div className="mt-2 relative z-10">
                <Button 
                  onClick={handleActivateWallet} 
                  disabled={isActivating}
                  className="bg-white text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                >
                  {isActivating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wallet className="mr-2 h-4 w-4" />}
                  Kích hoạt ví ngay
                </Button>
                <p className="text-xs text-emerald-100 mt-3 max-w-xs">Nhấn kích hoạt để sử dụng ví thanh toán phí đỗ xe GoPark miễn phí.</p>
              </div>
            ) : (
              <div className="text-sm text-emerald-100 mt-auto">
                {user ? user?.profile?.name || user.email : 'Khách hàng'}       
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nạp tiền */}
        <Card className={isWalletError ? "opacity-50 pointer-events-none grayscale-[0.5]" : ""}>
          <CardHeader>
            <CardTitle className="text-emerald-800 dark:text-emerald-400">
              Nạp tiền qua VNPAY
            </CardTitle>
            <CardDescription>
              Nhập số tiền bạn muốn nạp (Tối thiểu 10.000 VNĐ)
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <Label>Số tiền</Label>
              <Input
                type="number"
                placeholder="VD: 50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="10000"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {presetAmounts.map((preset) => (
                <Button
                  key={preset}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(preset.toString())}
                >
                  {preset.toLocaleString('vi-VN')}
                </Button>
              ))}
            </div>
          </CardContent>

          <CardFooter>
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={handleDeposit}
              disabled={isLoading || !amount || parseInt(amount) < 10000}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Thanh toán với VNPAY
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Lịch sử */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
            <History className="h-5 w-5" />
            Lịch sử giao dịch
          </CardTitle>
        </CardHeader>

        <CardContent>
          {isFetchingTransactions ? (
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          ) : transactions && transactions.length > 0 ? (
            transactions.map((tx: any) => {
              const isDeposit = tx.type === 'DEPOSIT' || Number(tx.amount) > 0;

              return (
                <div key={tx.id} className="flex justify-between p-4 border-b">
                  <div>
                    <p className="font-semibold">
                      {tx.type === 'PAYMENT'
                        ? 'Thanh toán đỗ xe'
                        : tx.type === 'DEPOSIT'
                        ? 'Nạp tiền VNPAY'
                        : tx.type}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(tx.created_at || tx.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className={`font-bold ${isDeposit ? 'text-green-600' : 'text-red-500'}`}>
                      {isDeposit ? '+' : ''}{Number(tx.amount).toLocaleString('vi-VN')} ₫
                    </p>
                    <p className="text-xs text-gray-500">
                      Số dư: {Number(tx.balance_after).toLocaleString('vi-VN')} ₫
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500">Bạn chưa có giao dịch nào</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}