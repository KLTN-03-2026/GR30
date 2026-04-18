'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, Loader2, ArrowLeft, CheckCircle2, XCircle, Clock, ChevronDown, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import { useWallet } from '@/hooks/useWallet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type WithdrawStatus = 'form' | 'loading' | 'success' | 'failed';

type Bank = {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
};

export default function WithdrawPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { data: balance, isLoading: isFetchingWallet, refetch: refetchWallet } = useWallet();

  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [banks, setBanks] = useState<Bank[]>([]);
  const [filteredBanks, setFilteredBanks] = useState<Bank[]>([]);
  const [searchBank, setSearchBank] = useState('');
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [isBankDialogOpen, setIsBankDialogOpen] = useState(false);

  const [status, setStatus] = useState<WithdrawStatus>('form');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(300); // 5 minutes in seconds
  const [loadingError, setLoadingError] = useState('');

  // Fetch banks list from VietQR
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await fetch('https://api.vietqr.io/v2/banks');
        const data = await res.json();
        if (data.code === '00') {
          setBanks(data.data);
          setFilteredBanks(data.data);
        }
      } catch (error) {
        console.error('Error fetching banks:', error);
      }
    };
    fetchBanks();
  }, []);

  useEffect(() => {
    if (!searchBank) {
      setFilteredBanks(banks);
    } else {
      const lower = searchBank.toLowerCase();
      setFilteredBanks(banks.filter(b => b.shortName.toLowerCase().includes(lower) || b.name.toLowerCase().includes(lower)));
    }
  }, [searchBank, banks]);

  const handleWithdraw = async () => {
    const numAmount = parseInt(amount);

    if (isNaN(numAmount) || numAmount < 10000) {
      toast.error('Số tiền rút tối thiểu là 10.000 VNĐ');
      return;
    }

    if (!selectedBank || !accountNumber.trim()) {
      toast.error('Vui lòng chọn ngân hàng và nhập số tài khoản.');
      return;
    }

    const compiledRefId = `${selectedBank.shortName} - ${accountNumber.trim()}`;

    try {
      const res = await apiClient<any>('/wallets/withdraw', {
        method: 'POST',
        body: JSON.stringify({
          userId: user?.id,
          amount: numAmount,
          refId: compiledRefId, 
        }),
      });

      const txId = res.data?.id || res.id;
      if (txId) {
        setTransactionId(txId);
        setStatus('loading');
        setCountdown(300);
      } else {
        toast.error('Lỗi khởi tạo yêu cầu. Không tìm thấy ID giao dịch.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Không thể tạo yêu cầu rút tiền.');
    }
  };

  useEffect(() => {
    let pollingInterval: NodeJS.Timeout;
    let timerInterval: NodeJS.Timeout;

    if (status === 'loading' && transactionId) {
      timerInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            clearInterval(pollingInterval);
            setStatus('failed');
            setLoadingError('Hết thời gian chờ. Yêu cầu của bạn đã bị từ chối. Tiền đã được hoàn lại vào ví.');
            refetchWallet();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      pollingInterval = setInterval(async () => {
        try {
          const res = await apiClient<any>(`/wallets/transaction/${transactionId}`, { method: 'GET' });
          const currentStatus = res.data?.status || res.status;
          
          if (currentStatus === 'SUCCESS') {
            clearInterval(pollingInterval);
            clearInterval(timerInterval);
            setStatus('success');
            await refetchWallet();
          } else if (currentStatus === 'FAILED' || currentStatus === 'CANCELLED') {
            clearInterval(pollingInterval);
            clearInterval(timerInterval);
            setStatus('failed');
            setLoadingError('Quản trị viên đã từ chối lệnh rút tiền này. Tiền đã được hoàn lại vào ví.');
            await refetchWallet();
          }
        } catch (e) {
          console.error('Error polling transaction:', e);
        }
      }, 5000);
    }

    return () => {
      clearInterval(timerInterval);
      clearInterval(pollingInterval);
    };
  }, [status, transactionId, refetchWallet]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl min-h-screen pt-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
          <Wallet className="h-8 w-8 text-emerald-600" />
          Rút Tiền Khỏi Ví
        </h1>
        <Button 
          variant="outline" 
          onClick={() => {
            if (status === 'loading') {
              if (window.confirm('Giao dịch đang chờ xử lý. Nếu bạn thoát, lệnh sẽ không bị hủy nhưng bạn không còn theo dõi được trực tiếp trên màn hình này. Thoát?')) {
                router.push('/users/wallet');
              }
            } else {
              router.push('/users/wallet');
            }
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại ví
        </Button>
      </div>

      {status === 'form' && (
        <Card className="shadow-lg border-t-emerald-500 border-t-4">
          <CardHeader>
            <CardTitle>Thông tin rút tiền</CardTitle>
            <CardDescription>
              Số dư khả dụng: {' '}
              <strong className="text-emerald-600 text-lg">
                 {isFetchingWallet ? <Loader2 className="h-4 w-4 inline animate-spin"/> : (balance || 0).toLocaleString('vi-VN')} VNĐ
              </strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="amount">Số tiền cần rút (VNĐ)</Label>
                <button 
                  type="button" 
                  onClick={() => setAmount(String(balance || 0))}
                  className="text-xs text-emerald-600 font-semibold hover:underline"
                >
                  Rút toàn bộ ({isFetchingWallet ? '...' : (balance || 0).toLocaleString('vi-VN')} VNĐ)
                </button>
              </div>
              <Input
                id="amount"
                type="number"
                placeholder="Ví dụ: 100000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={10000}
                className="text-lg font-medium"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {[50000, 100000, 200000, 500000, 1000000].map((val) => (
                  <Button
                    key={val}
                    type="button"
                    variant="outline"
                    className={`text-xs px-3 py-1 h-8 ${amount === String(val) ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : ''}`}
                    onClick={() => setAmount(String(val))}
                  >
                    {val.toLocaleString('vi-VN')}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Tối thiểu: 10.000 VNĐ. Tiền rút không thể vượt quá số dư.</p>
            </div>

            <div className="space-y-3">
              <Label>Ngân hàng nhận tiền</Label>
              <div className="relative mb-3">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Tìm kiếm danh sách ngân hàng..." 
                  className="pl-9 bg-gray-50 border-gray-200 focus-visible:ring-emerald-500"
                  value={searchBank}
                  onChange={(e) => setSearchBank(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[350px] overflow-y-auto w-full pr-1 pb-1">
                {filteredBanks.map(bank => (
                  <div
                    key={bank.id}
                    className={`flex flex-col items-center justify-center p-3 border rounded-xl cursor-pointer transition-all hover:border-emerald-500 hover:shadow-md bg-white ${
                      selectedBank?.id === bank.id ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedBank(bank)}
                  >
                    <img src={bank.logo} alt={bank.shortName} className="w-14 h-10 object-contain bg-white rounded-md mb-2" />
                    <span className="font-bold text-gray-900 text-sm text-center line-clamp-1">{bank.shortName}</span>
                  </div>
                ))}
                {filteredBanks.length === 0 && (
                  <div className="col-span-2 md:col-span-3 text-center py-6 text-gray-500 text-sm border rounded-xl border-dashed">
                    Không tìm thấy ngân hàng nào.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Số tài khoản / Thẻ</Label>
              <Input
                id="accountNumber"
                placeholder="Nhập số tài khoản ngân hàng..."
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="text-md"
              />
              <p className="text-xs text-muted-foreground">
                Vui lòng kiểm tra kỹ thông tin ngân hàng giúp quá trình hoàn tiền cho bạn nhanh nhất.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg"
              onClick={handleWithdraw}
              disabled={isFetchingWallet || !amount || !accountNumber || !selectedBank}
            >
              Yêu cầu Rút Tiền
            </Button>
          </CardFooter>
        </Card>
      )}

      {status === 'loading' && (
        <Card className="shadow-xl text-center py-10 relative overflow-hidden border-orange-400 border-2">
          <div className="absolute top-0 left-0 w-full h-1 bg-orange-200">
            <div className="h-full bg-orange-500 animate-pulse w-full"></div>
          </div>
          <CardHeader>
            <Loader2 className="h-16 w-16 animate-spin text-orange-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-orange-600">Đang chờ xử lý</CardTitle>
            <CardDescription className="text-lg mt-2">
              Đơn rút tiền <strong className="text-gray-900">{parseInt(amount).toLocaleString('vi-VN')} VNĐ</strong> của bạn đã được gửi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-orange-50 p-4 rounded-xl inline-block mt-4 border border-orange-100">
              <p className="text-orange-800 font-medium mb-1">Thời gian chờ xử lý tối đa:</p>
              <div className="text-3xl font-mono font-bold text-orange-600 flex items-center justify-center gap-2">
                <Clock className="w-6 h-6" /> {formatTime(countdown)}
              </div>
            </div>
            
            <p className="text-muted-foreground text-sm max-w-md mx-auto mt-6">
              Hệ thống đang chờ đợi Quản trị viên phê duyệt chuyển khoản trực tiếp qua ngân hàng. 
              Vui lòng giữ nguyên trang này hoặc theo dõi thông báo.
            </p>
          </CardContent>
        </Card>
      )}

      {status === 'success' && (
         <Card className="shadow-xl text-center py-10 border-emerald-400 border-2 bg-emerald-50/30">
          <CardHeader>
            <CheckCircle2 className="h-20 w-20 text-emerald-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-emerald-700">Rút tiền thành công!</CardTitle>
            <CardDescription className="text-lg mt-2">
              Chúng tôi đã chuyển khoản thành công <strong>{parseInt(amount).toLocaleString('vi-VN')} VNĐ</strong> cho bạn qua thông tin đã cung cấp.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Số tiền đã được trừ vào số dự Ví GoPark của bạn. Cảm ơn bạn đã sử dụng dịch vụ!
            </p>
          </CardContent>
          <CardFooter className="justify-center mt-6">
            <Button onClick={() => router.push('/users/wallet')} className="bg-emerald-600 hover:bg-emerald-700">
              Quay lại ví
            </Button>
          </CardFooter>
        </Card>
      )}

      {status === 'failed' && (
        <Card className="shadow-xl text-center py-10 border-red-400 border-2 bg-red-50/30">
          <CardHeader>
            <XCircle className="h-20 w-20 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-red-600">Rút tiền không thành công</CardTitle>
            <CardDescription className="text-base mt-2 text-red-500 font-medium">
              {loadingError}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Số tiền đã được hoàn trả lại về số dư khả dụng của bạn.
            </p>
          </CardContent>
          <CardFooter className="justify-center mt-6 flex gap-4">
            <Button variant="outline" onClick={() => router.push('/users/wallet')}>Quay lại ví</Button>
            <Button onClick={() => setStatus('form')} className="bg-emerald-600 hover:bg-emerald-700">
              Thử lại
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}