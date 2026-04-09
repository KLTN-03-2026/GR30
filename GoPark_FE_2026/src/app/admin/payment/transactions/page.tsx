"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  RefreshCw,
  Download,
  Eye,
  Clock,
  X,
  CreditCard,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Wallet,
  Banknote,
  Receipt,
  Calendar,
  MapPin,
  User,
  Hash,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreVertical,
  ArrowRightLeft,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// ─── Kiểu dữ liệu ───────────────────────────────────────────────────────────

/** Trạng thái giao dịch */
type TransactionStatus = "success" | "pending" | "failed" | "refunded";

/** Phương thức thanh toán */
type PaymentMethod = "momo" | "vnpay" | "zalopay" | "bank_transfer" | "wallet" | "cash" | "credit_card";

/** Loại giao dịch */
type TransactionType = "top_up" | "withdrawal" | "booking_payment" | "subscription" | "refund" | "penalty";

/** Thông tin người dùng trong giao dịch */
interface TransactionUser {
  _id: string;
  userName: string;
  email: string;
  role: "user" | "owner";
}

/** Chi tiết giao dịch */
interface Transaction {
  _id: string;
  transactionCode: string;
  user: TransactionUser;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  paymentMethod: PaymentMethod;
  description: string;
  bookingId?: string;
  parkingLotName?: string;
  parkingLotAddress?: string;
  createdAt: string;
  completedAt?: string;
  failedReason?: string;
  refundReason?: string;
}

/** Bộ lọc */
interface Filters {
  search: string;
  status: string;
  type: string;
  paymentMethod: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
}

// ─── Hằng số cấu hình ────────────────────────────────────────────────────────

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/** Cấu hình trạng thái giao dịch */
const statusConfig: Record<TransactionStatus, { label: string; className: string; dot: string; icon: typeof CheckCircle2 }> = {
  success: {
    label: "Thành công",
    className: "bg-green-100 text-green-800 border-green-200",
    dot: "bg-green-500",
    icon: CheckCircle2,
  },
  pending: {
    label: "Đang xử lý",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    dot: "bg-yellow-500",
    icon: Clock,
  },
  failed: {
    label: "Thất bại",
    className: "bg-red-100 text-red-800 border-red-200",
    dot: "bg-red-500",
    icon: XCircle,
  },
  refunded: {
    label: "Đã hoàn tiền",
    className: "bg-blue-100 text-blue-800 border-blue-200",
    dot: "bg-blue-500",
    icon: ArrowRightLeft,
  },
};

/** Cấu hình loại giao dịch */
const typeConfig: Record<TransactionType, { label: string; color: string; bgColor: string; icon: typeof CreditCard }> = {
  top_up: { label: "Nộp tiền vào ví", color: "text-green-600", bgColor: "bg-green-100", icon: Wallet },
  withdrawal: { label: "Rút tiền từ ví", color: "text-emerald-600", bgColor: "bg-emerald-100", icon: Banknote },
  booking_payment: { label: "Thanh toán đặt chỗ", color: "text-blue-600", bgColor: "bg-blue-100", icon: CreditCard },
  subscription: { label: "Gói dịch vụ", color: "text-violet-600", bgColor: "bg-violet-100", icon: Receipt },
  refund: { label: "Hoàn tiền", color: "text-orange-600", bgColor: "bg-orange-100", icon: ArrowRightLeft },
  penalty: { label: "Phạt đỗ quá giờ", color: "text-red-600", bgColor: "bg-red-100", icon: AlertCircle },
};

/** Nhãn phương thức thanh toán */
const paymentMethodConfig: Record<PaymentMethod, { label: string; color: string }> = {
  momo: { label: "MoMo", color: "text-pink-600" },
  vnpay: { label: "VNPay", color: "text-blue-600" },
  zalopay: { label: "ZaloPay", color: "text-blue-500" },
  bank_transfer: { label: "Chuyển khoản", color: "text-gray-700" },
  wallet: { label: "Ví GoPark", color: "text-teal-600" },
  cash: { label: "Tiền mặt", color: "text-green-600" },
  credit_card: { label: "Thẻ tín dụng", color: "text-indigo-600" },
};

/** Nhãn vai trò */
const roleLabels: Record<string, string> = { user: "Khách hàng", owner: "Chủ bãi" };

// ─── Dữ liệu mẫu ────────────────────────────────────────────────────────────

const mockTransactions: Transaction[] = [
  {
    _id: "txn1",
    transactionCode: "GP-TXN-20260313-001",
    user: { _id: "u1", userName: "Nguyễn Văn Anh", email: "nguyenvananh@gmail.com", role: "user" },
    type: "booking_payment",
    status: "success",
    amount: 150000,
    paymentMethod: "momo",
    description: "Thanh toán đặt chỗ bãi đỗ xe Times City - Khu A, vị trí A01",
    bookingId: "BK-20260313-001",
    parkingLotName: "Bãi đỗ xe Times City",
    parkingLotAddress: "458 Minh Khai, Hai Bà Trưng, Hà Nội",
    createdAt: "2026-03-13T14:30:00Z",
    completedAt: "2026-03-13T14:30:15Z",
  },
  {
    _id: "txn2",
    transactionCode: "GP-TXN-20260313-002",
    user: { _id: "u2", userName: "Trần Thị Bình", email: "tranthibinh@gmail.com", role: "user" },
    type: "booking_payment",
    status: "success",
    amount: 250000,
    paymentMethod: "vnpay",
    description: "Thanh toán đặt chỗ bãi đỗ xe Vincom Đồng Khởi - Tầng 2, vị trí B15",
    bookingId: "BK-20260313-002",
    parkingLotName: "Bãi đỗ xe Vincom Đồng Khởi",
    parkingLotAddress: "72 Lê Thánh Tôn, Quận 1, TP.HCM",
    createdAt: "2026-03-13T12:15:00Z",
    completedAt: "2026-03-13T12:15:22Z",
  },
  {
    _id: "txn3",
    transactionCode: "GP-TXN-20260313-003",
    user: { _id: "u3", userName: "Phạm Minh Châu", email: "phamminhchau@yahoo.com", role: "user" },
    type: "refund",
    status: "refunded",
    amount: 120000,
    paymentMethod: "momo",
    description: "Hoàn tiền do bãi đỗ xe đóng cửa ngoài giờ hoạt động",
    bookingId: "BK-20260310-045",
    parkingLotName: "Bãi đỗ xe Quận 10",
    parkingLotAddress: "200 CMT8, Quận 10, TP.HCM",
    refundReason: "Bãi đỗ xe đóng cửa, khách đến nhưng không thể vào",
    createdAt: "2026-03-13T10:00:00Z",
    completedAt: "2026-03-13T10:05:00Z",
  },
  {
    _id: "txn4",
    transactionCode: "GP-TXN-20260312-015",
    user: { _id: "u4", userName: "Lê Hoàng Dũng", email: "lehoangdung@outlook.com", role: "user" },
    type: "booking_payment",
    status: "failed",
    amount: 300000,
    paymentMethod: "credit_card",
    description: "Thanh toán đặt chỗ bãi ParkSmart Quận 1",
    bookingId: "BK-20260312-088",
    parkingLotName: "ParkSmart Quận 1",
    failedReason: "Thẻ tín dụng bị từ chối do không đủ hạn mức",
    createdAt: "2026-03-12T18:45:00Z",
  },
  {
    _id: "txn5",
    transactionCode: "GP-TXN-20260312-012",
    user: { _id: "o4", userName: "Phạm Đức Duy", email: "phamducduy@gmail.com", role: "owner" },
    type: "withdrawal",
    status: "success",
    amount: 5000000,
    paymentMethod: "bank_transfer",
    description: "Rút tiền doanh thu từ hệ thống ParkSmart về tài khoản ngân hàng",
    createdAt: "2026-03-12T16:30:00Z",
    completedAt: "2026-03-12T16:35:00Z",
  },
  {
    _id: "txn6",
    transactionCode: "GP-TXN-20260312-010",
    user: { _id: "o5", userName: "Hoàng Minh Tuấn", email: "hoangminhtuan@outlook.com", role: "owner" },
    type: "subscription",
    status: "success",
    amount: 990000,
    paymentMethod: "vnpay",
    description: "Mua gói quảng cáo ưu tiên hiển thị - 1 tháng (04/2026)",
    parkingLotName: "Bãi đỗ xe Bitexco",
    createdAt: "2026-03-12T14:00:00Z",
    completedAt: "2026-03-12T14:00:30Z",
  },
  {
    _id: "txn7",
    transactionCode: "GP-TXN-20260312-008",
    user: { _id: "u5", userName: "Vũ Thị Thu Hảo", email: "vuthithuhao@gmail.com", role: "user" },
    type: "penalty",
    status: "pending",
    amount: 50000,
    paymentMethod: "momo",
    description: "Phí phạt quá giờ đỗ xe tại Bãi đỗ xe Vạn Hạnh Mall",
    parkingLotName: "Bãi đỗ xe Vạn Hạnh Mall",
    parkingLotAddress: "11 Sư Vạn Hạnh, Q10, TP.HCM",
    createdAt: "2026-03-12T09:20:00Z",
  },
  {
    _id: "txn8",
    transactionCode: "GP-TXN-20260311-022",
    user: { _id: "u6", userName: "Đỗ Quang Khải", email: "doquangkhai@gmail.com", role: "user" },
    type: "booking_payment",
    status: "success",
    amount: 350000,
    paymentMethod: "zalopay",
    description: "Thanh toán đặt chỗ bãi đỗ xe Bitexco - B1, vị trí B1-25",
    bookingId: "BK-20260311-055",
    parkingLotName: "Bãi đỗ xe Bitexco",
    parkingLotAddress: "2 Hải Triều, Quận 1, TP.HCM",
    createdAt: "2026-03-11T08:00:00Z",
    completedAt: "2026-03-11T08:00:18Z",
  },
  {
    _id: "txn9",
    transactionCode: "GP-TXN-20260311-019",
    user: { _id: "u1", userName: "Nguyễn Văn Anh", email: "nguyenvananh@gmail.com", role: "user" },
    type: "booking_payment",
    status: "success",
    amount: 200000,
    paymentMethod: "momo",
    description: "Thanh toán đặt chỗ bãi Royal City - B2, vị trí B2-10",
    bookingId: "BK-20260311-030",
    parkingLotName: "Bãi đỗ xe Royal City",
    parkingLotAddress: "72A Nguyễn Trãi, Thanh Xuân, Hà Nội",
    createdAt: "2026-03-11T06:30:00Z",
    completedAt: "2026-03-11T06:30:12Z",
  },
  {
    _id: "txn10",
    transactionCode: "GP-TXN-20260310-030",
    user: { _id: "o2", userName: "Nguyễn Thị Hương", email: "nguyenthihuong@gmail.com", role: "owner" },
    type: "withdrawal",
    status: "success",
    amount: 3200000,
    paymentMethod: "bank_transfer",
    description: "Rút tiền doanh thu tháng 2/2026 về tài khoản ngân hàng VCB",
    createdAt: "2026-03-10T10:00:00Z",
    completedAt: "2026-03-10T10:10:00Z",
  },
  {
    _id: "txn11",
    transactionCode: "GP-TXN-20260313-004",
    user: { _id: "u1", userName: "Nguyễn Văn Anh", email: "nguyenvananh@gmail.com", role: "user" },
    type: "top_up",
    status: "success",
    amount: 500000,
    paymentMethod: "momo",
    description: "Nạp tiền vào ví GoPark qua MoMo",
    createdAt: "2026-03-13T09:00:00Z",
    completedAt: "2026-03-13T09:00:05Z",
  },
  {
    _id: "txn12",
    transactionCode: "GP-TXN-20260312-020",
    user: { _id: "u2", userName: "Trần Thị Bình", email: "tranthibinh@gmail.com", role: "user" },
    type: "top_up",
    status: "pending",
    amount: 1000000,
    paymentMethod: "bank_transfer",
    description: "Nạp tiền vào ví GoPark qua chuyển khoản ngân hàng",
    createdAt: "2026-03-12T11:00:00Z",
  },
];

// ─── Hàm tiện ích ─────────────────────────────────────────────────────────────

/** Định dạng ngày */
const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

/** Định dạng ngày giờ đầy đủ */
const formatDateTime = (dateString: string) =>
  new Date(dateString).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });

/** Định dạng tiền tệ VND */
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

/** Định dạng tiền tệ rút gọn */
const formatCompactCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", notation: "compact", maximumFractionDigits: 1 }).format(amount);

/** Lấy chữ cái đầu cho avatar */
const getInitials = (name: string) => {
  const parts = name.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

/** Màu avatar */
const avatarColors = [
  "from-blue-500 to-indigo-600", "from-emerald-500 to-teal-600", "from-violet-500 to-purple-600",
  "from-orange-500 to-amber-600", "from-pink-500 to-rose-600", "from-cyan-500 to-sky-600",
];
const getAvatarColor = (id: string) => avatarColors[id.charCodeAt(id.length - 1) % avatarColors.length];

/** Thời gian tương đối */
const timeAgo = (dateString: string) => {
  const diffMs = new Date().getTime() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  if (hrs < 24) return `${hrs} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  return formatDate(dateString);
};

// ─── Component chính ──────────────────────────────────────────────────────────

export default function TransactionsPage() {
  // ── State ───────────────────────────────────────────────────────────────────
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    type: "",
    paymentMethod: "",
    dateFrom: "",
    dateTo: "",
    sortBy: "newest",
  });

  /** Giao dịch đang xem chi tiết */
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // ── Gọi API ─────────────────────────────────────────────────────────────────

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      setUsingMockData(false);

      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/transactions`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`Lỗi HTTP! Mã: ${response.status}`);
      const result = await response.json();
      if (result.status === "success") {
        setTransactions(result.data.data || result.data);
      } else {
        throw new Error("Không thể tải dữ liệu");
      }
    } catch (err) {
      console.error("Lỗi khi tải giao dịch:", err);
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
      setUsingMockData(true);
      setTransactions(mockTransactions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  // ── Lọc & sắp xếp ──────────────────────────────────────────────────────────

  const filteredTxns = useMemo(() => {
    let result = [...transactions];

    // Tìm kiếm theo mã giao dịch, tên người dùng, tên bãi đỗ
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.transactionCode.toLowerCase().includes(term) ||
          t.user.userName.toLowerCase().includes(term) ||
          t.user.email.toLowerCase().includes(term) ||
          (t.parkingLotName && t.parkingLotName.toLowerCase().includes(term)) ||
          t.description.toLowerCase().includes(term)
      );
    }

    // Lọc trạng thái
    if (filters.status) result = result.filter((t) => t.status === filters.status);
    // Lọc loại
    if (filters.type) result = result.filter((t) => t.type === filters.type);
    // Lọc phương thức
    if (filters.paymentMethod) result = result.filter((t) => t.paymentMethod === filters.paymentMethod);

    // Lọc theo khoảng ngày
    if (filters.dateFrom) result = result.filter((t) => new Date(t.createdAt) >= new Date(filters.dateFrom));
    if (filters.dateTo) result = result.filter((t) => new Date(t.createdAt) <= new Date(filters.dateTo + "T23:59:59"));

    // Sắp xếp
    switch (filters.sortBy) {
      case "newest": result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case "oldest": result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break;
      case "amount-high": result.sort((a, b) => b.amount - a.amount); break;
      case "amount-low": result.sort((a, b) => a.amount - b.amount); break;
    }

    return result;
  }, [transactions, filters]);

  // ── Thống kê ────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = transactions.length;
    const success = transactions.filter((t) => t.status === "success").length;
    const totalAmount = transactions.filter((t) => t.status === "success" && t.type !== "refund" && t.type !== "withdrawal")
      .reduce((s, t) => s + t.amount, 0);
    const refundedAmount = transactions.filter((t) => t.status === "refunded" || t.type === "refund")
      .reduce((s, t) => s + t.amount, 0);
    const pending = transactions.filter((t) => t.status === "pending").length;
    return { total, success, totalAmount, refundedAmount, pending };
  }, [transactions]);

  // ── Xử lý sự kiện ──────────────────────────────────────────────────────────

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: "", status: "", type: "", paymentMethod: "", dateFrom: "", dateTo: "", sortBy: "newest" });
  };

  const openDetail = (txn: Transaction) => { setSelectedTxn(txn); setDetailOpen(true); };

  // ── Thẻ thống kê ────────────────────────────────────────────────────────────

  const statCards = [
    { title: "Tổng giao dịch", value: stats.total.toString(), icon: Receipt, color: "bg-blue-500" },
    { title: "Thành công", value: stats.success.toString(), icon: CheckCircle2, color: "bg-green-500" },
    { title: "Thu vào", value: formatCompactCurrency(stats.totalAmount), icon: TrendingUp, color: "bg-emerald-500" },
    { title: "Hoàn tiền", value: formatCompactCurrency(stats.refundedAmount), icon: TrendingDown, color: "bg-orange-500" },
  ];

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải lịch sử giao dịch...</p>
        </div>
      </div>
    );
  }

  // ── Giao diện ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Tiêu đề ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl px-8 py-6 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Receipt className="w-6 h-6" />
            Lịch sử Giao dịch
          </h1>
          <p className="text-blue-200/70 mt-1 text-sm">
            Tìm thấy {filteredTxns.length} giao dịch
            {usingMockData && <span className="ml-2 text-orange-300 text-xs">(Dữ liệu mẫu)</span>}
          </p>
          {error && <p className="text-red-300 text-xs mt-1">Lỗi kết nối: {error}</p>}
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Button onClick={fetchTransactions} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm shadow-none gap-2">
            <RefreshCw size={16} />Làm mới
          </Button>
          <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm shadow-none gap-2">
            <Download size={16} />Xuất Excel
          </Button>
        </div>
      </div>

      {/* ── Thẻ thống kê ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="hover:shadow-md transition-shadow border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Thanh tìm kiếm & bộ lọc ───────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
        {/* Dòng 1: Tìm kiếm */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Tìm theo mã giao dịch, tên người dùng, bãi đỗ, email..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white"
          />
        </div>
        {/* Dòng 2: Bộ lọc */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {/* Trạng thái */}
          <select value={filters.status} onChange={(e) => handleFilterChange("status", e.target.value)}
            className="h-10 px-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
            <option value="">Trạng thái</option>
            <option value="success">Thành công</option>
            <option value="pending">Đang xử lý</option>
            <option value="failed">Thất bại</option>
            <option value="refunded">Đã hoàn tiền</option>
          </select>
          {/* Loại giao dịch */}
          <select value={filters.type} onChange={(e) => handleFilterChange("type", e.target.value)}
            className="h-10 px-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
            <option value="">Loại GD</option>
            <option value="top_up">Nộp tiền vào ví</option>
            <option value="withdrawal">Rút tiền từ ví</option>
            <option value="booking_payment">Thanh toán đặt chỗ</option>
            <option value="subscription">Gói dịch vụ</option>
            <option value="refund">Hoàn tiền</option>
            <option value="penalty">Phạt đỗ quá giờ</option>
          </select>
          {/* Phương thức */}
          <select value={filters.paymentMethod} onChange={(e) => handleFilterChange("paymentMethod", e.target.value)}
            className="h-10 px-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
            <option value="">Phương thức</option>
            <option value="momo">MoMo</option>
            <option value="vnpay">VNPay</option>
            <option value="zalopay">ZaloPay</option>
            <option value="bank_transfer">Chuyển khoản</option>
            <option value="wallet">Ví GoPark</option>
            <option value="cash">Tiền mặt</option>
            <option value="credit_card">Thẻ tín dụng</option>
          </select>
          {/* Từ ngày */}
          <Input type="date" value={filters.dateFrom} onChange={(e) => handleFilterChange("dateFrom", e.target.value)} className="h-10" />
          {/* Đến ngày */}
          <Input type="date" value={filters.dateTo} onChange={(e) => handleFilterChange("dateTo", e.target.value)} className="h-10" />
          {/* Sắp xếp */}
          <select value={filters.sortBy} onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="h-10 px-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="amount-high">Số tiền ↓</option>
            <option value="amount-low">Số tiền ↑</option>
          </select>
          {/* Xóa lọc */}
          <Button variant="ghost" onClick={clearFilters} className="h-10 text-gray-500 hover:text-gray-700">
            <X size={16} className="mr-1" />Xóa lọc
          </Button>
        </div>
      </div>

      {/* ── Bảng giao dịch ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã GD</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Người dùng</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Loại</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Số tiền</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phương thức</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thời gian</th>
                <th className="px-5 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTxns.map((txn) => {
                const stConf = statusConfig[txn.status];
                const tConf = typeConfig[txn.type];
                const TIcon = tConf.icon;
                const pmConf = paymentMethodConfig[txn.paymentMethod];
                // Giao dịch hoàn/rút là tiền ra, còn lại là tiền vào
                const isOutgoing = txn.type === "refund" || txn.type === "withdrawal";

                return (
                  <tr key={txn._id} className="hover:bg-blue-50/40 transition-colors cursor-pointer" onClick={() => openDetail(txn)}>
                    {/* Mã giao dịch */}
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded">
                        {txn.transactionCode.split("-").slice(-1)[0]}
                      </span>
                    </td>

                    {/* Người dùng */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(txn.user._id)} flex items-center justify-center flex-shrink-0`}>
                          <span className="text-white text-[10px] font-bold">{getInitials(txn.user.userName)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[140px]">{txn.user.userName}</p>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">{roleLabels[txn.user.role]}</Badge>
                        </div>
                      </div>
                    </td>

                    {/* Loại giao dịch */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-6 h-6 rounded ${tConf.bgColor} flex items-center justify-center`}>
                          <TIcon className={`w-3.5 h-3.5 ${tConf.color}`} />
                        </div>
                        <span className="text-xs text-gray-600">{tConf.label}</span>
                      </div>
                    </td>

                    {/* Số tiền */}
                    <td className="px-5 py-3.5">
                      <span className={`text-sm font-bold ${isOutgoing ? "text-red-600" : "text-green-600"}`}>
                        {isOutgoing ? "−" : "+"}{formatCurrency(txn.amount)}
                      </span>
                    </td>

                    {/* Phương thức */}
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium ${pmConf.color}`}>{pmConf.label}</span>
                    </td>

                    {/* Trạng thái */}
                    <td className="px-5 py-3.5">
                      <Badge variant="outline" className={`text-xs font-medium ${stConf.className}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${stConf.dot} mr-1.5 inline-block`} />
                        {stConf.label}
                      </Badge>
                    </td>

                    {/* Thời gian */}
                    <td className="px-5 py-3.5">
                      <p className="text-xs text-gray-500">{timeAgo(txn.createdAt)}</p>
                    </td>

                    {/* Menu */}
                    <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><MoreVertical size={14} /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => openDetail(txn)}><Eye size={14} className="mr-2" />Xem chi tiết</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Trạng thái trống */}
        {filteredTxns.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full w-20 h-20 mx-auto mb-5 flex items-center justify-center">
              <Receipt className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy giao dịch nào</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
            <Button onClick={clearFilters} variant="outline">Xóa tất cả bộ lọc</Button>
          </div>
        )}
      </div>

      {/* ── Dialog chi tiết giao dịch ──────────────────────────────────────── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Chi tiết giao dịch</DialogTitle>
          </DialogHeader>

          {selectedTxn && (() => {
            const stConf = statusConfig[selectedTxn.status];
            const tConf = typeConfig[selectedTxn.type];
            const TIcon = tConf.icon;
            const pmConf = paymentMethodConfig[selectedTxn.paymentMethod];
            const isOutgoing = selectedTxn.type === "refund" || selectedTxn.type === "withdrawal";
            const StIcon = stConf.icon;

            return (
              <div className="space-y-5 mt-2">

                {/* Phần đầu — Số tiền & trạng thái */}
                <div className={`p-6 rounded-xl text-center ${isOutgoing ? "bg-gradient-to-br from-red-50 to-orange-50" : "bg-gradient-to-br from-green-50 to-emerald-50"}`}>
                  <p className={`text-4xl font-bold ${isOutgoing ? "text-red-600" : "text-green-600"}`}>
                    {isOutgoing ? "−" : "+"}{formatCurrency(selectedTxn.amount)}
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <Badge variant="outline" className={`text-xs font-medium ${stConf.className}`}>
                      <StIcon size={12} className="mr-1" />
                      {stConf.label}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${tConf.bgColor} ${tConf.color} border-0`}>
                      <TIcon size={12} className="mr-1" />
                      {tConf.label}
                    </Badge>
                  </div>
                </div>

                {/* Thông tin giao dịch */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Hash size={18} className="text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-400">Mã giao dịch</p>
                      <p className="text-sm font-mono font-semibold text-gray-900">{selectedTxn.transactionCode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Wallet size={18} className="text-indigo-500" />
                    <div>
                      <p className="text-xs text-gray-400">Phương thức</p>
                      <p className={`text-sm font-semibold ${pmConf.color}`}>{pmConf.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar size={18} className="text-green-500" />
                    <div>
                      <p className="text-xs text-gray-400">Thời gian tạo</p>
                      <p className="text-sm font-medium text-gray-900">{formatDateTime(selectedTxn.createdAt)}</p>
                    </div>
                  </div>
                  {selectedTxn.completedAt && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle2 size={18} className="text-emerald-500" />
                      <div>
                        <p className="text-xs text-gray-400">Hoàn thành lúc</p>
                        <p className="text-sm font-medium text-gray-900">{formatDateTime(selectedTxn.completedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mô tả */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Mô tả</h4>
                  <p className="text-sm text-gray-700 leading-relaxed bg-white border border-gray-100 rounded-lg p-4">
                    {selectedTxn.description}
                  </p>
                </div>

                {/* Người dùng */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Người thực hiện</h4>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(selectedTxn.user._id)} flex items-center justify-center shadow-sm`}>
                      <span className="text-white text-sm font-semibold">{getInitials(selectedTxn.user.userName)}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{selectedTxn.user.userName}</p>
                        <Badge variant="outline" className="text-xs">{roleLabels[selectedTxn.user.role]}</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{selectedTxn.user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Bãi đỗ liên quan */}
                {selectedTxn.parkingLotName && (
                  <div className="flex items-center gap-3 p-3 bg-violet-50 rounded-lg">
                    <MapPin size={18} className="text-violet-500" />
                    <div>
                      <p className="text-xs text-violet-400">Bãi đỗ xe</p>
                      <p className="text-sm font-medium text-gray-900">{selectedTxn.parkingLotName}</p>
                      {selectedTxn.parkingLotAddress && <p className="text-xs text-gray-500">{selectedTxn.parkingLotAddress}</p>}
                    </div>
                  </div>
                )}

                {/* Mã booking */}
                {selectedTxn.bookingId && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Receipt size={18} className="text-blue-500" />
                    <div>
                      <p className="text-xs text-blue-400">Mã đặt chỗ</p>
                      <p className="text-sm font-mono font-semibold text-gray-900">{selectedTxn.bookingId}</p>
                    </div>
                  </div>
                )}

                {/* Lý do thất bại */}
                {selectedTxn.failedReason && (
                  <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                    <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <XCircle size={14} />Lý do thất bại
                    </h4>
                    <p className="text-sm text-red-700">{selectedTxn.failedReason}</p>
                  </div>
                )}

                {/* Lý do hoàn tiền */}
                {selectedTxn.refundReason && (
                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <h4 className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <ArrowRightLeft size={14} />Lý do hoàn tiền
                    </h4>
                    <p className="text-sm text-orange-700">{selectedTxn.refundReason}</p>
                  </div>
                )}

                {/* Nút đóng */}
                <div className="flex justify-end pt-2 border-t border-gray-100">
                  <Button variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
