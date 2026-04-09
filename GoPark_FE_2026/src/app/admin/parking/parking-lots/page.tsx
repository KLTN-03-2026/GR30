"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  RefreshCw,
  Download,
  MoreVertical,
  Eye,
  MapPin,
  Clock,
  X,
  Star,
  Car,
  ParkingSquare,
  Users,
  TrendingUp,
  Ban,
  CheckCircle,
  Phone,
  Mail,
  Building2,
  Navigation,
  Layers,
  Activity,
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

/** Trạng thái bãi đỗ xe */
type ParkingLotStatus = "active" | "pending" | "suspended" | "closed";

/** Loại bãi đỗ xe */
type ParkingLotType = "outdoor" | "indoor" | "underground" | "rooftop" | "multi-level";

/** Thông tin chủ bãi */
interface OwnerInfo {
  _id: string;
  userName: string;
  email: string;
  phoneNumber: string;
}

/** Khu vực đỗ xe */
interface ParkingZone {
  name: string;
  totalSlots: number;
  availableSlots: number;
}

/** Thông tin bãi đỗ xe */
interface ParkingLot {
  _id: string;
  name: string;
  address: string;
  description?: string;
  owner: OwnerInfo;
  status: ParkingLotStatus;
  type: ParkingLotType;
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
  pricePerHour: number;
  pricePerDay?: number;
  rating: number;
  totalReviews: number;
  totalBookings: number;
  totalRevenue: number;
  openTime: string;
  closeTime: string;
  amenities: string[];
  zones?: ParkingZone[];
  images?: string[];
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

/** Bộ lọc */
interface Filters {
  search: string;
  status: string;
  type: string;
  sortBy: string;
}

// ─── Hằng số cấu hình ────────────────────────────────────────────────────────

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/** Cấu hình trạng thái bãi đỗ */
const statusConfig: Record<ParkingLotStatus, { label: string; className: string; dot: string }> = {
  active: {
    label: "Hoạt động",
    className: "bg-green-100 text-green-800 border-green-200",
    dot: "bg-green-500",
  },
  pending: {
    label: "Chờ duyệt",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    dot: "bg-yellow-500",
  },
  suspended: {
    label: "Tạm ngưng",
    className: "bg-orange-100 text-orange-800 border-orange-200",
    dot: "bg-orange-500",
  },
  closed: {
    label: "Đã đóng",
    className: "bg-red-100 text-red-800 border-red-200",
    dot: "bg-red-500",
  },
};

/** Nhãn loại bãi đỗ */
const typeLabels: Record<ParkingLotType, string> = {
  outdoor: "Ngoài trời",
  indoor: "Trong nhà",
  underground: "Hầm ngầm",
  rooftop: "Sân thượng",
  "multi-level": "Nhiều tầng",
};

/** Nhãn tiện ích */
const amenityLabels: Record<string, string> = {
  covered: "Có mái che",
  cctv: "Camera CCTV",
  security: "Bảo vệ 24/7",
  ev_charging: "Sạc EV",
  car_wash: "Rửa xe",
  disabled_access: "Lối đi người khuyết tật",
  valet: "Dịch vụ valet",
  lighting: "Đèn chiếu sáng",
};

// ─── Dữ liệu mẫu ────────────────────────────────────────────────────────────

const mockParkingLots: ParkingLot[] = [
  {
    _id: "pl1",
    name: "Bãi đỗ xe Times City",
    address: "458 Minh Khai, Hai Bà Trưng, Hà Nội",
    description: "Bãi đỗ xe hiện đại nằm trong khu đô thị Times City với hệ thống camera giám sát 24/7.",
    owner: { _id: "o1", userName: "Trần Quốc Bảo", email: "tranquocbao@gmail.com", phoneNumber: "0901 111 222" },
    status: "active",
    type: "underground",
    totalSlots: 120,
    availableSlots: 45,
    occupiedSlots: 75,
    pricePerHour: 15000,
    pricePerDay: 100000,
    rating: 4.5,
    totalReviews: 234,
    totalBookings: 1520,
    totalRevenue: 228000000,
    openTime: "06:00",
    closeTime: "23:00",
    amenities: ["covered", "cctv", "security", "lighting"],
    zones: [
      { name: "A", totalSlots: 40, availableSlots: 15 },
      { name: "B", totalSlots: 40, availableSlots: 18 },
      { name: "C", totalSlots: 40, availableSlots: 12 },
    ],
    createdAt: "2025-04-10T08:00:00Z",
    updatedAt: "2026-03-13T10:00:00Z",
  },
  {
    _id: "pl2",
    name: "Bãi đỗ xe Vincom Đồng Khởi",
    address: "72 Lê Thánh Tôn, Quận 1, TP. Hồ Chí Minh",
    description: "Bãi đỗ xe cao cấp tại trung tâm Quận 1 với dịch vụ valet parking.",
    owner: { _id: "o1", userName: "Trần Quốc Bảo", email: "tranquocbao@gmail.com", phoneNumber: "0901 111 222" },
    status: "active",
    type: "multi-level",
    totalSlots: 200,
    availableSlots: 82,
    occupiedSlots: 118,
    pricePerHour: 25000,
    pricePerDay: 180000,
    rating: 4.7,
    totalReviews: 456,
    totalBookings: 3200,
    totalRevenue: 576000000,
    openTime: "00:00",
    closeTime: "23:59",
    amenities: ["covered", "cctv", "security", "ev_charging", "valet", "lighting"],
    zones: [
      { name: "Tầng 1", totalSlots: 50, availableSlots: 20 },
      { name: "Tầng 2", totalSlots: 50, availableSlots: 22 },
      { name: "Tầng 3", totalSlots: 50, availableSlots: 18 },
      { name: "Tầng 4", totalSlots: 50, availableSlots: 22 },
    ],
    createdAt: "2025-04-10T08:00:00Z",
    updatedAt: "2026-03-13T14:30:00Z",
  },
  {
    _id: "pl3",
    name: "Bãi đỗ xe Thảo Điền",
    address: "12 Quốc Hương, Quận 2, TP. Hồ Chí Minh",
    owner: { _id: "o1", userName: "Trần Quốc Bảo", email: "tranquocbao@gmail.com", phoneNumber: "0901 111 222" },
    status: "pending",
    type: "outdoor",
    totalSlots: 50,
    availableSlots: 50,
    occupiedSlots: 0,
    pricePerHour: 10000,
    rating: 0,
    totalReviews: 0,
    totalBookings: 0,
    totalRevenue: 0,
    openTime: "06:00",
    closeTime: "22:00",
    amenities: ["lighting"],
    createdAt: "2026-03-01T08:00:00Z",
    updatedAt: "2026-03-01T08:00:00Z",
  },
  {
    _id: "pl4",
    name: "Bãi đỗ xe Royal City",
    address: "72A Nguyễn Trãi, Thanh Xuân, Hà Nội",
    description: "Bãi đỗ xe rộng rãi tại Royal City với nhiều tiện ích hiện đại.",
    owner: { _id: "o2", userName: "Nguyễn Thị Hương", email: "nguyenthihuong@gmail.com", phoneNumber: "0938 333 444" },
    status: "active",
    type: "underground",
    totalSlots: 300,
    availableSlots: 120,
    occupiedSlots: 180,
    pricePerHour: 20000,
    pricePerDay: 150000,
    rating: 4.8,
    totalReviews: 623,
    totalBookings: 4500,
    totalRevenue: 675000000,
    openTime: "00:00",
    closeTime: "23:59",
    amenities: ["covered", "cctv", "security", "ev_charging", "car_wash", "disabled_access", "lighting"],
    zones: [
      { name: "B1", totalSlots: 100, availableSlots: 40 },
      { name: "B2", totalSlots: 100, availableSlots: 45 },
      { name: "B3", totalSlots: 100, availableSlots: 35 },
    ],
    createdAt: "2025-07-22T10:30:00Z",
    updatedAt: "2026-03-13T12:00:00Z",
  },
  {
    _id: "pl5",
    name: "Bãi đỗ xe Lotte Mart Q7",
    address: "469 Nguyễn Hữu Thọ, Quận 7, TP. Hồ Chí Minh",
    owner: { _id: "o2", userName: "Nguyễn Thị Hương", email: "nguyenthihuong@gmail.com", phoneNumber: "0938 333 444" },
    status: "active",
    type: "indoor",
    totalSlots: 150,
    availableSlots: 68,
    occupiedSlots: 82,
    pricePerHour: 12000,
    pricePerDay: 80000,
    rating: 4.0,
    totalReviews: 189,
    totalBookings: 980,
    totalRevenue: 78400000,
    openTime: "07:00",
    closeTime: "22:00",
    amenities: ["covered", "cctv", "security", "lighting"],
    createdAt: "2025-07-22T10:30:00Z",
    updatedAt: "2026-03-12T16:00:00Z",
  },
  {
    _id: "pl6",
    name: "Bãi đỗ xe Quận 10",
    address: "200 Cách Mạng Tháng 8, Quận 10, TP. Hồ Chí Minh",
    owner: { _id: "o3", userName: "Lê Văn Cường", email: "levancuong@yahoo.com", phoneNumber: "0912 555 666" },
    status: "suspended",
    type: "outdoor",
    totalSlots: 60,
    availableSlots: 60,
    occupiedSlots: 0,
    pricePerHour: 8000,
    rating: 3.2,
    totalReviews: 45,
    totalBookings: 120,
    totalRevenue: 9600000,
    openTime: "06:00",
    closeTime: "21:00",
    amenities: ["lighting"],
    createdAt: "2025-10-05T09:00:00Z",
    updatedAt: "2026-02-28T10:00:00Z",
  },
  {
    _id: "pl7",
    name: "ParkSmart Quận 1",
    address: "15 Lê Duẩn, Quận 1, TP. Hồ Chí Minh",
    description: "Hệ thống bãi đỗ xe thông minh ParkSmart với công nghệ IoT tiên tiến.",
    owner: { _id: "o4", userName: "Phạm Đức Duy", email: "phamducduy@gmail.com", phoneNumber: "0976 777 888" },
    status: "active",
    type: "multi-level",
    totalSlots: 250,
    availableSlots: 95,
    occupiedSlots: 155,
    pricePerHour: 30000,
    pricePerDay: 200000,
    rating: 4.9,
    totalReviews: 789,
    totalBookings: 5600,
    totalRevenue: 1120000000,
    openTime: "00:00",
    closeTime: "23:59",
    amenities: ["covered", "cctv", "security", "ev_charging", "car_wash", "valet", "disabled_access", "lighting"],
    zones: [
      { name: "Tầng 1", totalSlots: 60, availableSlots: 20 },
      { name: "Tầng 2", totalSlots: 60, availableSlots: 25 },
      { name: "Tầng 3", totalSlots: 60, availableSlots: 20 },
      { name: "Tầng 4", totalSlots: 40, availableSlots: 15 },
      { name: "Tầng 5", totalSlots: 30, availableSlots: 15 },
    ],
    createdAt: "2025-01-15T14:00:00Z",
    updatedAt: "2026-03-13T16:00:00Z",
  },
  {
    _id: "pl8",
    name: "Bãi đỗ xe Bitexco",
    address: "2 Hải Triều, Quận 1, TP. Hồ Chí Minh",
    description: "Bãi đỗ xe sang trọng ngay tại tòa nhà Bitexco Financial Tower.",
    owner: { _id: "o5", userName: "Hoàng Minh Tuấn", email: "hoangminhtuan@outlook.com", phoneNumber: "0889 999 000" },
    status: "active",
    type: "underground",
    totalSlots: 300,
    availableSlots: 130,
    occupiedSlots: 170,
    pricePerHour: 35000,
    pricePerDay: 250000,
    rating: 4.9,
    totalReviews: 1023,
    totalBookings: 6800,
    totalRevenue: 1700000000,
    openTime: "00:00",
    closeTime: "23:59",
    amenities: ["covered", "cctv", "security", "ev_charging", "valet", "disabled_access", "lighting"],
    zones: [
      { name: "B1", totalSlots: 100, availableSlots: 40 },
      { name: "B2", totalSlots: 100, availableSlots: 50 },
      { name: "B3", totalSlots: 100, availableSlots: 40 },
    ],
    createdAt: "2025-08-30T16:00:00Z",
    updatedAt: "2026-03-13T15:00:00Z",
  },
];

// ─── Hàm tiện ích ─────────────────────────────────────────────────────────────

/** Định dạng ngày theo chuẩn Việt Nam */
const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

/** Định dạng tiền tệ VND */
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

/** Định dạng tiền tệ rút gọn */
const formatCompactCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", notation: "compact", maximumFractionDigits: 1 }).format(amount);

/** Định dạng số lớn */
const formatNumber = (num: number) => new Intl.NumberFormat("vi-VN").format(num);

/** Tính phần trăm sử dụng chỗ đỗ */
const getOccupancyPercent = (occupied: number, total: number) =>
  total > 0 ? Math.round((occupied / total) * 100) : 0;

/** Lấy màu cho thanh công suất */
const getOccupancyColor = (percent: number) => {
  if (percent >= 90) return "bg-red-500";
  if (percent >= 70) return "bg-orange-500";
  if (percent >= 50) return "bg-yellow-500";
  return "bg-green-500";
};

/** Lấy chữ cái đầu cho avatar */
const getInitials = (name: string) => {
  const parts = name.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

// ─── Component chính ──────────────────────────────────────────────────────────

export default function ParkingLotsPage() {
  // ── Trạng thái ──────────────────────────────────────────────────────────────
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Bộ lọc */
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    type: "",
    sortBy: "rating",
  });

  /** Bãi đỗ đang xem chi tiết */
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // ── Gọi API lấy danh sách bãi đỗ ───────────────────────────────────────────

  const fetchParkingLots = async () => {
    try {
      setLoading(true);
      setError(null);
      setUsingMockData(false);

      const token = localStorage.getItem("authToken") || localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/v1/admin/parking-lots`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`Lỗi HTTP! Mã: ${response.status}`);

      const result = await response.json();
      if (result.status === "success") {
        setParkingLots(result.data.data || result.data);
      } else {
        throw new Error("Không thể tải dữ liệu");
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách bãi đỗ:", err);
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
      // Dùng dữ liệu mẫu khi API chưa sẵn sàng
      setUsingMockData(true);
      setParkingLots(mockParkingLots);
    } finally {
      setLoading(false);
    }
  };

  /** Tải dữ liệu khi component được mount */
  useEffect(() => {
    fetchParkingLots();
  }, []);

  // ── Lọc & sắp xếp ──────────────────────────────────────────────────────────

  const filteredLots = useMemo(() => {
    let result = [...parkingLots];

    // Tìm kiếm theo tên, địa chỉ, tên chủ bãi
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (lot) =>
          lot.name.toLowerCase().includes(term) ||
          lot.address.toLowerCase().includes(term) ||
          lot.owner.userName.toLowerCase().includes(term)
      );
    }

    // Lọc theo trạng thái
    if (filters.status) {
      result = result.filter((lot) => lot.status === filters.status);
    }

    // Lọc theo loại
    if (filters.type) {
      result = result.filter((lot) => lot.type === filters.type);
    }

    // Sắp xếp
    switch (filters.sortBy) {
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "most-slots":
        result.sort((a, b) => b.totalSlots - a.totalSlots);
        break;
      case "most-bookings":
        result.sort((a, b) => b.totalBookings - a.totalBookings);
        break;
      case "most-revenue":
        result.sort((a, b) => b.totalRevenue - a.totalRevenue);
        break;
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "price-low":
        result.sort((a, b) => a.pricePerHour - b.pricePerHour);
        break;
      case "price-high":
        result.sort((a, b) => b.pricePerHour - a.pricePerHour);
        break;
    }

    return result;
  }, [parkingLots, filters]);

  // ── Thống kê ────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = parkingLots.length;
    const active = parkingLots.filter((l) => l.status === "active").length;
    const totalSlots = parkingLots.reduce((s, l) => s + l.totalSlots, 0);
    const totalOccupied = parkingLots.reduce((s, l) => s + l.occupiedSlots, 0);
    const avgRating = parkingLots.length > 0
      ? (parkingLots.reduce((s, l) => s + l.rating, 0) / parkingLots.filter(l => l.rating > 0).length).toFixed(1)
      : "0";
    const totalRevenue = parkingLots.reduce((s, l) => s + l.totalRevenue, 0);
    return { total, active, totalSlots, totalOccupied, avgRating, totalRevenue };
  }, [parkingLots]);

  // ── Xử lý sự kiện ──────────────────────────────────────────────────────────

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: "", status: "", type: "", sortBy: "rating" });
  };

  const openDetail = (lot: ParkingLot) => {
    setSelectedLot(lot);
    setDetailOpen(true);
  };

  /** Chuyển trạng thái bãi đỗ */
  const handleToggleStatus = async (lot: ParkingLot, newStatus: ParkingLotStatus) => {
    console.log(`Chuyển bãi ${lot._id} sang ${newStatus}`);
    // TODO: Gọi API cập nhật trạng thái
    setParkingLots((prev) =>
      prev.map((l) => (l._id === lot._id ? { ...l, status: newStatus } : l))
    );
    if (selectedLot && selectedLot._id === lot._id) {
      setSelectedLot((prev) => prev ? { ...prev, status: newStatus } : prev);
    }
  };

  // ── Thẻ thống kê ───────────────────────────────────────────────────────────

  const statCards = [
    { title: "Tổng bãi đỗ", value: stats.total.toString(), icon: ParkingSquare, color: "bg-blue-500" },
    { title: "Đang hoạt động", value: stats.active.toString(), icon: Activity, color: "bg-green-500" },
    { title: "Tổng chỗ đỗ", value: formatNumber(stats.totalSlots), icon: Car, color: "bg-violet-500" },
    { title: "Đánh giá TB", value: `${stats.avgRating} ⭐`, icon: Star, color: "bg-amber-500" },
  ];

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải danh sách bãi đỗ xe...</p>
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
            <ParkingSquare className="w-6 h-6" />
            Tất cả Bãi đỗ xe
          </h1>
          <p className="text-blue-200/70 mt-1 text-sm">
            Tìm thấy {filteredLots.length} bãi đỗ xe
            {usingMockData && <span className="ml-2 text-orange-300 text-xs">(Dữ liệu mẫu)</span>}
          </p>
          {error && <p className="text-red-300 text-xs mt-1">Lỗi kết nối: {error}</p>}
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Button onClick={fetchParkingLots} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm shadow-none gap-2">
            <RefreshCw size={16} />
            Làm mới
          </Button>
          <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm shadow-none gap-2">
            <Download size={16} />
            Xuất Excel
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

      {/* ── Thanh tìm kiếm & lọc ──────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Tìm theo tên bãi đỗ, địa chỉ, chủ bãi..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
          {/* Lọc trạng thái */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="h-11 px-4 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm min-w-[160px]"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="pending">Chờ duyệt</option>
            <option value="suspended">Tạm ngưng</option>
            <option value="closed">Đã đóng</option>
          </select>
          {/* Lọc loại bãi */}
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className="h-11 px-4 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm min-w-[160px]"
          >
            <option value="">Tất cả loại</option>
            <option value="outdoor">Ngoài trời</option>
            <option value="indoor">Trong nhà</option>
            <option value="underground">Hầm ngầm</option>
            <option value="rooftop">Sân thượng</option>
            <option value="multi-level">Nhiều tầng</option>
          </select>
          {/* Sắp xếp */}
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="h-11 px-4 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm min-w-[180px]"
          >
            <option value="rating">Đánh giá cao nhất</option>
            <option value="most-slots">Nhiều chỗ nhất</option>
            <option value="most-bookings">Nhiều booking nhất</option>
            <option value="most-revenue">Doanh thu cao nhất</option>
            <option value="newest">Mới nhất</option>
            <option value="price-low">Giá thấp → cao</option>
            <option value="price-high">Giá cao → thấp</option>
          </select>
          {/* Xóa lọc */}
          {(filters.search || filters.status || filters.type || filters.sortBy !== "rating") && (
            <Button variant="ghost" onClick={clearFilters} className="h-11 text-gray-500 hover:text-gray-700">
              <X size={16} className="mr-1" />
              Xóa lọc
            </Button>
          )}
        </div>
      </div>

      {/* ── Bảng danh sách bãi đỗ ──────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bãi đỗ xe</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Chủ bãi</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Công suất</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Giá / giờ</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Đánh giá</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLots.map((lot) => {
                const stConf = statusConfig[lot.status];
                const occupancy = getOccupancyPercent(lot.occupiedSlots, lot.totalSlots);
                const occColor = getOccupancyColor(occupancy);

                return (
                  <tr
                    key={lot._id}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                    onClick={() => openDetail(lot)}
                  >
                    {/* Thông tin bãi đỗ */}
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        {/* Icon loại bãi */}
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <ParkingSquare className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate max-w-[220px]">{lot.name}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin size={10} className="flex-shrink-0" />
                            <span className="truncate max-w-[200px]">{lot.address}</span>
                          </p>
                          <Badge variant="outline" className="text-[10px] mt-1 px-1.5 py-0 h-4">
                            {typeLabels[lot.type]}
                          </Badge>
                        </div>
                      </div>
                    </td>

                    {/* Chủ bãi */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[10px] font-bold">{getInitials(lot.owner.userName)}</span>
                        </div>
                        <span className="text-sm text-gray-700 truncate max-w-[120px]">{lot.owner.userName}</span>
                      </div>
                    </td>

                    {/* Công suất sử dụng */}
                    <td className="px-6 py-4">
                      <div className="w-32">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-500">{lot.occupiedSlots}/{lot.totalSlots}</span>
                          <span className="font-semibold text-gray-700">{occupancy}%</span>
                        </div>
                        {/* Thanh tiến trình công suất */}
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${occColor} transition-all`} style={{ width: `${occupancy}%` }} />
                        </div>
                      </div>
                    </td>

                    {/* Giá */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(lot.pricePerHour)}</p>
                      {lot.pricePerDay && (
                        <p className="text-xs text-gray-400">{formatCurrency(lot.pricePerDay)}/ngày</p>
                      )}
                    </td>

                    {/* Đánh giá */}
                    <td className="px-6 py-4">
                      {lot.rating > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-0.5 bg-amber-50 px-2 py-1 rounded-lg">
                            <Star size={14} className="fill-amber-400 text-amber-400" />
                            <span className="text-sm font-bold text-amber-700">{lot.rating}</span>
                          </div>
                          <span className="text-xs text-gray-400">({lot.totalReviews})</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Chưa có</span>
                      )}
                    </td>

                    {/* Trạng thái */}
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`text-xs font-medium ${stConf.className}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${stConf.dot} mr-1.5 inline-block`} />
                        {stConf.label}
                      </Badge>
                    </td>

                    {/* Menu hành động */}
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => openDetail(lot)}>
                            <Eye size={16} className="mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {lot.status === "active" && (
                            <DropdownMenuItem onClick={() => handleToggleStatus(lot, "suspended")} className="text-orange-600">
                              <Ban size={16} className="mr-2" />
                              Tạm ngưng
                            </DropdownMenuItem>
                          )}
                          {lot.status === "suspended" && (
                            <DropdownMenuItem onClick={() => handleToggleStatus(lot, "active")} className="text-green-600">
                              <CheckCircle size={16} className="mr-2" />
                              Kích hoạt lại
                            </DropdownMenuItem>
                          )}
                          {lot.status === "pending" && (
                            <>
                              <DropdownMenuItem onClick={() => handleToggleStatus(lot, "active")} className="text-green-600">
                                <CheckCircle size={16} className="mr-2" />
                                Duyệt
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(lot, "closed")} className="text-red-600">
                                <Ban size={16} className="mr-2" />
                                Từ chối
                              </DropdownMenuItem>
                            </>
                          )}
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
        {filteredLots.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full w-20 h-20 mx-auto mb-5 flex items-center justify-center">
              <ParkingSquare className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy bãi đỗ xe nào</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
            <Button onClick={clearFilters} variant="outline">Xóa tất cả bộ lọc</Button>
          </div>
        )}
      </div>

      {/* ── Dialog chi tiết bãi đỗ ─────────────────────────────────────────── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Chi tiết bãi đỗ xe</DialogTitle>
          </DialogHeader>

          {selectedLot && (() => {
            const stConf = statusConfig[selectedLot.status];
            const occupancy = getOccupancyPercent(selectedLot.occupiedSlots, selectedLot.totalSlots);
            const occColor = getOccupancyColor(occupancy);

            return (
              <div className="space-y-5 mt-2">

                {/* Phần đầu — Tên + trạng thái */}
                <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <ParkingSquare className="w-7 h-7 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{selectedLot.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin size={14} className="flex-shrink-0" />{selectedLot.address}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={`text-xs font-medium ${stConf.className}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${stConf.dot} mr-1.5 inline-block`} />
                          {stConf.label}
                        </Badge>
                        <Badge variant="outline" className="text-xs">{typeLabels[selectedLot.type]}</Badge>
                        <Badge variant="outline" className="text-xs">
                          <Clock size={10} className="mr-1" />{selectedLot.openTime} - {selectedLot.closeTime}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {selectedLot.description && (
                    <p className="text-sm text-gray-600 mt-3 ml-[72px]">{selectedLot.description}</p>
                  )}
                </div>

                {/* Thống kê nhanh */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <Car className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-700">{selectedLot.totalSlots}</p>
                    <p className="text-xs text-blue-500">Tổng chỗ đỗ</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-green-700">{formatCompactCurrency(selectedLot.totalRevenue)}</p>
                    <p className="text-xs text-green-500">Doanh thu</p>
                  </div>
                  <div className="text-center p-4 bg-violet-50 rounded-xl">
                    <Users className="w-5 h-5 text-violet-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-violet-700">{formatNumber(selectedLot.totalBookings)}</p>
                    <p className="text-xs text-violet-500">Tổng booking</p>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-xl">
                    <Star className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-amber-700">{selectedLot.rating > 0 ? selectedLot.rating : "—"}</p>
                    <p className="text-xs text-amber-500">{selectedLot.totalReviews} đánh giá</p>
                  </div>
                </div>

                {/* Thanh công suất lớn */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-700">Công suất sử dụng</h4>
                    <span className="text-sm font-bold text-gray-900">{occupancy}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${occColor} transition-all`} style={{ width: `${occupancy}%` }} />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>Đang dùng: <strong className="text-gray-700">{selectedLot.occupiedSlots}</strong></span>
                    <span>Còn trống: <strong className="text-green-600">{selectedLot.availableSlots}</strong></span>
                    <span>Tổng: <strong className="text-gray-700">{selectedLot.totalSlots}</strong></span>
                  </div>
                </div>

                {/* Khu vực đỗ xe (nếu có) */}
                {selectedLot.zones && selectedLot.zones.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Phân bổ theo khu vực</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {selectedLot.zones.map((zone) => {
                        const zoneOcc = getOccupancyPercent(zone.totalSlots - zone.availableSlots, zone.totalSlots);
                        const zoneColor = getOccupancyColor(zoneOcc);
                        return (
                          <div key={zone.name} className="p-3 bg-white border border-gray-100 rounded-lg">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-semibold text-gray-800">Khu {zone.name}</span>
                              <span className="text-xs text-gray-500">{zoneOcc}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${zoneColor}`} style={{ width: `${zoneOcc}%` }} />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              {zone.availableSlots}/{zone.totalSlots} trống
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Giá cả */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <p className="text-xs text-emerald-400 mb-1">Giá theo giờ</p>
                    <p className="text-xl font-bold text-emerald-700">{formatCurrency(selectedLot.pricePerHour)}</p>
                  </div>
                  {selectedLot.pricePerDay && (
                    <div className="p-3 bg-sky-50 rounded-lg">
                      <p className="text-xs text-sky-400 mb-1">Giá theo ngày</p>
                      <p className="text-xl font-bold text-sky-700">{formatCurrency(selectedLot.pricePerDay)}</p>
                    </div>
                  )}
                </div>

                {/* Tiện ích */}
                {selectedLot.amenities.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Tiện ích</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedLot.amenities.map((amenity) => (
                        <Badge key={amenity} variant="outline" className="text-xs bg-gray-50">
                          {amenityLabels[amenity] || amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Thông tin chủ bãi */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Chủ bãi đỗ</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
                      <span className="text-white text-sm font-semibold">{getInitials(selectedLot.owner.userName)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{selectedLot.owner.userName}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Mail size={12} />{selectedLot.owner.email}</span>
                        <span className="flex items-center gap-1"><Phone size={12} />{selectedLot.owner.phoneNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thời gian */}
                <div className="flex items-center justify-between text-xs text-gray-400 px-1">
                  <span>Đăng ký: {formatDate(selectedLot.createdAt)}</span>
                  <span>Cập nhật: {formatDate(selectedLot.updatedAt)}</span>
                </div>

                {/* Nút hành động */}
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                  <Button variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button>
                  {selectedLot.status === "active" && (
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={() => handleToggleStatus(selectedLot, "suspended")}>
                      <Ban size={16} className="mr-2" />Tạm ngưng
                    </Button>
                  )}
                  {selectedLot.status === "suspended" && (
                    <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleToggleStatus(selectedLot, "active")}>
                      <CheckCircle size={16} className="mr-2" />Kích hoạt lại
                    </Button>
                  )}
                  {selectedLot.status === "pending" && (
                    <>
                      <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleToggleStatus(selectedLot, "closed")}>
                        <Ban size={16} className="mr-2" />Từ chối
                      </Button>
                      <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleToggleStatus(selectedLot, "active")}>
                        <CheckCircle size={16} className="mr-2" />Duyệt
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
