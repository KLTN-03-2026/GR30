"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Users,
  UserPlus,
  UserCheck,
  ShieldBan,
  RefreshCw,
  Download,
  MoreVertical,
  Eye,
  Ban,
  CheckCircle,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Car,
  Clock,
  X,
  TrendingUp,
  Building2,
  Star,
  ParkingSquare,
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

/** Thông tin bãi đỗ xe của chủ bãi */
interface ParkingLot {
  _id: string;
  name: string;
  address: string;
  totalSlots: number;
  status: "active" | "pending" | "suspended";
  rating: number;
}

/** Thông tin chủ bãi đỗ */
interface Owner {
  _id: string;
  userName: string;
  email: string;
  phoneNumber: string;
  avatar?: string;
  status: "active" | "banned";
  totalParkingLots: number;
  totalRevenue: number;
  totalBookings: number;
  lastActive: string;
  createdAt: string;
  address?: string;
  businessName?: string;
  parkingLots?: ParkingLot[];
}

/** Bộ lọc hiển thị */
interface Filters {
  search: string;
  status: string;
  sortBy: string;
}

// ─── Hằng số cấu hình ────────────────────────────────────────────────────────

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/** Cấu hình màu sắc & nhãn cho trạng thái tài khoản */
const statusConfig = {
  active: {
    label: "Hoạt động",
    className: "bg-green-100 text-green-800 border-green-200",
    dot: "bg-green-500",
  },
  banned: {
    label: "Đã khóa",
    className: "bg-red-100 text-red-800 border-red-200",
    dot: "bg-red-500",
  },
};

/** Cấu hình màu sắc cho trạng thái bãi đỗ */
const parkingLotStatusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "Hoạt động", className: "bg-green-100 text-green-700" },
  pending: { label: "Chờ duyệt", className: "bg-yellow-100 text-yellow-700" },
  suspended: { label: "Tạm ngưng", className: "bg-red-100 text-red-700" },
};

// ─── Dữ liệu mẫu (mock data) ────────────────────────────────────────────────

const mockOwners: Owner[] = [
  {
    _id: "o1",
    userName: "Trần Quốc Bảo",
    email: "tranquocbao@gmail.com",
    phoneNumber: "0901 111 222",
    status: "active",
    totalParkingLots: 3,
    totalRevenue: 45600000,
    totalBookings: 312,
    lastActive: "2026-03-13T14:30:00Z",
    createdAt: "2025-04-10T08:00:00Z",
    address: "456 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh",
    businessName: "Công ty TNHH Bãi đỗ Quốc Bảo",
    parkingLots: [
      { _id: "pl1", name: "Bãi đỗ xe Times City", address: "458 Minh Khai, HN", totalSlots: 120, status: "active", rating: 4.5 },
      { _id: "pl2", name: "Bãi đỗ xe Vincom Đồng Khởi", address: "72 Lê Thánh Tôn, Q1", totalSlots: 80, status: "active", rating: 4.2 },
      { _id: "pl3", name: "Bãi đỗ xe Thảo Điền", address: "12 Quốc Hương, Q2", totalSlots: 50, status: "pending", rating: 0 },
    ],
  },
  {
    _id: "o2",
    userName: "Nguyễn Thị Hương",
    email: "nguyenthihuong@gmail.com",
    phoneNumber: "0938 333 444",
    status: "active",
    totalParkingLots: 2,
    totalRevenue: 28900000,
    totalBookings: 198,
    lastActive: "2026-03-13T09:15:00Z",
    createdAt: "2025-07-22T10:30:00Z",
    address: "89 Trần Hưng Đạo, Quận 5, TP. Hồ Chí Minh",
    businessName: "Bãi xe Hương Nguyễn",
    parkingLots: [
      { _id: "pl4", name: "Bãi đỗ xe Royal City", address: "72A Nguyễn Trãi, HN", totalSlots: 200, status: "active", rating: 4.7 },
      { _id: "pl5", name: "Bãi đỗ xe Lotte Mart", address: "469 Nguyễn Hữu Thọ, Q7", totalSlots: 150, status: "active", rating: 4.0 },
    ],
  },
  {
    _id: "o3",
    userName: "Lê Văn Cường",
    email: "levancuong@yahoo.com",
    phoneNumber: "0912 555 666",
    status: "banned",
    totalParkingLots: 1,
    totalRevenue: 5200000,
    totalBookings: 45,
    lastActive: "2026-02-15T18:00:00Z",
    createdAt: "2025-10-05T09:00:00Z",
    address: "200 Cách Mạng Tháng 8, Quận 10, TP. Hồ Chí Minh",
    businessName: "Bãi xe Văn Cường",
    parkingLots: [
      { _id: "pl6", name: "Bãi đỗ xe Quận 10", address: "200 CMT8, Q10", totalSlots: 60, status: "suspended", rating: 3.2 },
    ],
  },
  {
    _id: "o4",
    userName: "Phạm Đức Duy",
    email: "phamducduy@gmail.com",
    phoneNumber: "0976 777 888",
    status: "active",
    totalParkingLots: 5,
    totalRevenue: 89500000,
    totalBookings: 567,
    lastActive: "2026-03-13T16:00:00Z",
    createdAt: "2025-01-15T14:00:00Z",
    address: "15 Lê Duẩn, Quận 1, TP. Hồ Chí Minh",
    businessName: "Hệ thống bãi đỗ xe ParkSmart",
    parkingLots: [
      { _id: "pl7", name: "ParkSmart Quận 1", address: "15 Lê Duẩn, Q1", totalSlots: 250, status: "active", rating: 4.8 },
      { _id: "pl8", name: "ParkSmart Quận 3", address: "100 Pasteur, Q3", totalSlots: 180, status: "active", rating: 4.6 },
      { _id: "pl9", name: "ParkSmart Phú Nhuận", address: "50 Phan Xích Long, PN", totalSlots: 100, status: "active", rating: 4.4 },
      { _id: "pl10", name: "ParkSmart Tân Bình", address: "200 Hoàng Văn Thụ, TB", totalSlots: 90, status: "active", rating: 4.3 },
      { _id: "pl11", name: "ParkSmart Bình Thạnh", address: "300 Xô Viết Nghệ Tĩnh, BT", totalSlots: 75, status: "pending", rating: 0 },
    ],
  },
  {
    _id: "o5",
    userName: "Hoàng Minh Tuấn",
    email: "hoangminhtuan@outlook.com",
    phoneNumber: "0889 999 000",
    status: "active",
    totalParkingLots: 1,
    totalRevenue: 12300000,
    totalBookings: 89,
    lastActive: "2026-03-12T20:45:00Z",
    createdAt: "2025-08-30T16:00:00Z",
    address: "78 Nguyễn Thị Minh Khai, Quận 1, TP. Hồ Chí Minh",
    businessName: "Bãi xe Minh Tuấn",
    parkingLots: [
      { _id: "pl12", name: "Bãi đỗ xe Bitexco", address: "2 Hải Triều, Q1", totalSlots: 300, status: "active", rating: 4.9 },
    ],
  },
];

// ─── Hàm tiện ích ─────────────────────────────────────────────────────────────

/** Định dạng ngày theo chuẩn Việt Nam (dd/mm/yyyy) */
const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

/** Định dạng tiền tệ VND */
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

/** Định dạng tiền tệ VND rút gọn (vd: 45.6tr) */
const formatCompactCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);

/** Lấy chữ cái đầu của tên để hiển thị avatar */
const getInitials = (name: string) => {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

/** Danh sách màu gradient cho avatar */
const avatarColors = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-orange-500 to-amber-600",
  "from-pink-500 to-rose-600",
  "from-cyan-500 to-sky-600",
];

/** Chọn màu avatar dựa trên ID */
const getAvatarColor = (id: string) => {
  const index = id.charCodeAt(id.length - 1) % avatarColors.length;
  return avatarColors[index];
};

/** Hiển thị thời gian tương đối (vd: "5 phút trước") */
const timeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return formatDate(dateString);
};

// ─── Component chính ──────────────────────────────────────────────────────────

export default function OwnersPage() {
  // ── Trạng thái (state) ──────────────────────────────────────────────────────
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Bộ lọc tìm kiếm / trạng thái / sắp xếp */
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    sortBy: "newest",
  });

  /** Chủ bãi đỗ đang xem chi tiết */
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // ── Gọi API lấy danh sách chủ bãi đỗ ───────────────────────────────────────

  const fetchOwners = async () => {
    try {
      setLoading(true);
      setError(null);
      setUsingMockData(false);

      const token = localStorage.getItem("authToken") || localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/v1/admin/users?role=owner`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`Lỗi HTTP! Mã: ${response.status}`);

      const result = await response.json();
      if (result.status === "success") {
        setOwners(result.data.data || result.data);
      } else {
        throw new Error("Không thể tải dữ liệu");
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách chủ bãi đỗ:", err);
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
      // Sử dụng dữ liệu mẫu khi API chưa sẵn sàng
      setUsingMockData(true);
      setOwners(mockOwners);
    } finally {
      setLoading(false);
    }
  };

  /** Tải dữ liệu khi component được mount */
  useEffect(() => {
    fetchOwners();
  }, []);

  // ── Lọc & sắp xếp danh sách ────────────────────────────────────────────────

  const filteredOwners = useMemo(() => {
    let result = [...owners];

    // Tìm kiếm theo tên, email, SĐT, tên doanh nghiệp
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (o) =>
          o.userName.toLowerCase().includes(term) ||
          o.email.toLowerCase().includes(term) ||
          o.phoneNumber.replace(/\s/g, "").includes(term.replace(/\s/g, "")) ||
          (o.businessName && o.businessName.toLowerCase().includes(term))
      );
    }

    // Lọc theo trạng thái tài khoản
    if (filters.status) {
      result = result.filter((o) => o.status === filters.status);
    }

    // Sắp xếp
    switch (filters.sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "most-lots":
        result.sort((a, b) => b.totalParkingLots - a.totalParkingLots);
        break;
      case "most-revenue":
        result.sort((a, b) => b.totalRevenue - a.totalRevenue);
        break;
    }

    return result;
  }, [owners, filters]);

  // ── Tính toán thống kê ──────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = owners.length;
    const active = owners.filter((o) => o.status === "active").length;
    const banned = owners.filter((o) => o.status === "banned").length;
    // Tổng số bãi đỗ của tất cả chủ bãi
    const totalLots = owners.reduce((sum, o) => sum + o.totalParkingLots, 0);
    // Tổng doanh thu toàn hệ thống
    const totalRevenue = owners.reduce((sum, o) => sum + o.totalRevenue, 0);
    return { total, active, banned, totalLots, totalRevenue };
  }, [owners]);

  // ── Xử lý sự kiện ──────────────────────────────────────────────────────────

  /** Cập nhật bộ lọc */
  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  /** Xóa tất cả bộ lọc, về mặc định */
  const clearFilters = () => {
    setFilters({ search: "", status: "", sortBy: "newest" });
  };

  /** Mở dialog xem chi tiết chủ bãi */
  const openDetail = (owner: Owner) => {
    setSelectedOwner(owner);
    setDetailOpen(true);
  };

  /** Khóa / mở khóa tài khoản chủ bãi */
  const handleToggleStatus = async (owner: Owner) => {
    const newStatus = owner.status === "active" ? "banned" : "active";
    console.log(`Chuyển trạng thái tài khoản ${owner._id} sang ${newStatus}`);
    // TODO: Gọi API cập nhật trạng thái
    setOwners((prev) =>
      prev.map((o) => (o._id === owner._id ? { ...o, status: newStatus } : o))
    );
    // Cập nhật luôn owner đang xem chi tiết (nếu có)
    if (selectedOwner && selectedOwner._id === owner._id) {
      setSelectedOwner((prev) => (prev ? { ...prev, status: newStatus } : prev));
    }
  };

  // ── Cấu hình thẻ thống kê ──────────────────────────────────────────────────

  const statCards = [
    {
      title: "Tổng chủ bãi",
      value: stats.total.toString(),
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Đang hoạt động",
      value: stats.active.toString(),
      icon: UserCheck,
      color: "bg-emerald-500",
    },
    {
      title: "Tổng bãi đỗ",
      value: stats.totalLots.toString(),
      icon: ParkingSquare,
      color: "bg-violet-500",
    },
    {
      title: "Tổng doanh thu",
      value: formatCompactCurrency(stats.totalRevenue),
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

  // ── Trạng thái đang tải ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu chủ bãi đỗ...</p>
        </div>
      </div>
    );
  }

  // ── Giao diện chính ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Tiêu đề trang & nút hành động ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl px-8 py-6 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Users className="w-6 h-6" />
            Quản lý Chủ bãi đỗ
          </h1>
          <p className="text-blue-200/70 mt-1 text-sm">
            Tìm thấy {filteredOwners.length} chủ bãi đỗ
            {usingMockData && (
              <span className="ml-2 text-orange-300 text-xs">(Dữ liệu mẫu)</span>
            )}
          </p>
          {error && <p className="text-red-300 text-xs mt-1">Lỗi kết nối: {error}</p>}
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Button onClick={fetchOwners} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm shadow-none gap-2">
            <RefreshCw size={16} />
            Làm mới
          </Button>
          <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm shadow-none gap-2">
            <Download size={16} />
            Xuất Excel
          </Button>
        </div>
      </div>

      {/* ── Thẻ thống kê ───────────────────────────────────────────────────── */}
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Tìm theo tên, email, SĐT hoặc tên doanh nghiệp..."
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
            <option value="banned">Đã khóa</option>
          </select>
          {/* Sắp xếp */}
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="h-11 px-4 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm min-w-[180px]"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="most-lots">Nhiều bãi đỗ nhất</option>
            <option value="most-revenue">Doanh thu nhiều nhất</option>
          </select>
          {/* Nút xóa bộ lọc (chỉ hiện khi có lọc) */}
          {(filters.search || filters.status || filters.sortBy !== "newest") && (
            <Button variant="ghost" onClick={clearFilters} className="h-11 text-gray-500 hover:text-gray-700">
              <X size={16} className="mr-1" />
              Xóa lọc
            </Button>
          )}
        </div>
      </div>

      {/* ── Bảng danh sách chủ bãi đỗ ──────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Tiêu đề bảng */}
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Chủ bãi đỗ
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Liên hệ
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Bãi đỗ
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Doanh thu
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Booking
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-12" />
              </tr>
            </thead>

            {/* Nội dung bảng */}
            <tbody className="divide-y divide-gray-50">
              {filteredOwners.map((owner) => {
                const config = statusConfig[owner.status];
                return (
                  <tr
                    key={owner._id}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                    onClick={() => openDetail(owner)}
                  >
                    {/* Thông tin chủ bãi */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar với chữ cái đầu */}
                        <div
                          className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(owner._id)} flex items-center justify-center flex-shrink-0 shadow-sm`}
                        >
                          <span className="text-white text-sm font-semibold">
                            {getInitials(owner.userName)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{owner.userName}</p>
                          {/* Tên doanh nghiệp (nếu có) */}
                          {owner.businessName && (
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              <Building2 size={10} />
                              <span className="truncate max-w-[160px]">{owner.businessName}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Thông tin liên hệ */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} className="text-gray-400 flex-shrink-0" />
                          <span className="truncate max-w-[180px]">{owner.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={14} className="text-gray-400 flex-shrink-0" />
                          {owner.phoneNumber}
                        </div>
                      </div>
                    </td>

                    {/* Số lượng bãi đỗ */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-violet-50 rounded-lg px-3 py-1.5">
                          <span className="text-sm font-bold text-violet-700">{owner.totalParkingLots}</span>
                        </div>
                        <span className="text-xs text-gray-400">bãi</span>
                      </div>
                    </td>

                    {/* Doanh thu */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCompactCurrency(owner.totalRevenue)}
                      </p>
                    </td>

                    {/* Tổng số booking */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-50 rounded-lg px-3 py-1.5">
                          <span className="text-sm font-bold text-blue-700">{owner.totalBookings}</span>
                        </div>
                        <span className="text-xs text-gray-400">lượt</span>
                      </div>
                    </td>

                    {/* Trạng thái tài khoản */}
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`text-xs font-medium ${config.className}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${config.dot} mr-1.5 inline-block`} />
                        {config.label}
                      </Badge>
                    </td>

                    {/* Menu hành động (3 chấm) */}
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => openDetail(owner)}>
                            <Eye size={16} className="mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(owner)}
                            className={owner.status === "active" ? "text-red-600" : "text-green-600"}
                          >
                            {owner.status === "active" ? (
                              <>
                                <Ban size={16} className="mr-2" />
                                Khóa tài khoản
                              </>
                            ) : (
                              <>
                                <CheckCircle size={16} className="mr-2" />
                                Mở khóa
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Trạng thái trống — khi không có kết quả nào */}
        {filteredOwners.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full w-20 h-20 mx-auto mb-5 flex items-center justify-center">
              <Users className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy chủ bãi đỗ</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm để có kết quả phù hợp hơn
            </p>
            <Button onClick={clearFilters} variant="outline">
              Xóa tất cả bộ lọc
            </Button>
          </div>
        )}
      </div>

      {/* ── Dialog chi tiết chủ bãi đỗ ─────────────────────────────────────── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Chi tiết chủ bãi đỗ</DialogTitle>
          </DialogHeader>

          {selectedOwner && (
            <div className="space-y-6 mt-2">

              {/* Phần đầu — Avatar, tên, trạng thái */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl">
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-br ${getAvatarColor(selectedOwner._id)} flex items-center justify-center shadow-md`}
                >
                  <span className="text-white text-xl font-bold">
                    {getInitials(selectedOwner.userName)}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{selectedOwner.userName}</h3>
                  {selectedOwner.businessName && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Building2 size={14} />
                      {selectedOwner.businessName}
                    </p>
                  )}
                  <Badge
                    variant="outline"
                    className={`mt-2 ${statusConfig[selectedOwner.status].className}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[selectedOwner.status].dot} mr-1.5 inline-block`} />
                    {statusConfig[selectedOwner.status].label}
                  </Badge>
                </div>
              </div>

              {/* Thông tin liên hệ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail size={18} className="text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm font-medium text-gray-900">{selectedOwner.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone size={18} className="text-green-500" />
                  <div>
                    <p className="text-xs text-gray-400">Số điện thoại</p>
                    <p className="text-sm font-medium text-gray-900">{selectedOwner.phoneNumber}</p>
                  </div>
                </div>
                {selectedOwner.address && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg sm:col-span-2">
                    <MapPin size={18} className="text-orange-500" />
                    <div>
                      <p className="text-xs text-gray-400">Địa chỉ</p>
                      <p className="text-sm font-medium text-gray-900">{selectedOwner.address}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Thẻ thống kê trong dialog */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-4 bg-violet-50 rounded-xl">
                  <ParkingSquare className="w-5 h-5 text-violet-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-violet-700">{selectedOwner.totalParkingLots}</p>
                  <p className="text-xs text-violet-500">Bãi đỗ xe</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-green-700">{formatCompactCurrency(selectedOwner.totalRevenue)}</p>
                  <p className="text-xs text-green-500">Doanh thu</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <Car className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-blue-700">{selectedOwner.totalBookings}</p>
                  <p className="text-xs text-blue-500">Tổng booking</p>
                </div>
              </div>

              {/* Danh sách bãi đỗ xe của chủ bãi */}
              {selectedOwner.parkingLots && selectedOwner.parkingLots.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                    Danh sách bãi đỗ xe
                  </h4>
                  <div className="space-y-2">
                    {selectedOwner.parkingLots.map((lot) => {
                      const lotStatus = parkingLotStatusConfig[lot.status] || { label: lot.status, className: "bg-gray-100 text-gray-700" };
                      return (
                        <div
                          key={lot._id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {/* Icon bãi đỗ */}
                            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                              <MapPin size={14} className="text-violet-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{lot.name}</p>
                              <p className="text-xs text-gray-400 flex items-center gap-1">
                                <MapPin size={10} />
                                {lot.address}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {/* Số chỗ đỗ */}
                            <span className="text-xs text-gray-500">{lot.totalSlots} chỗ</span>
                            {/* Đánh giá sao (chỉ hiện khi > 0) */}
                            {lot.rating > 0 && (
                              <span className="text-xs text-amber-600 flex items-center gap-0.5">
                                <Star size={12} className="fill-amber-400 text-amber-400" />
                                {lot.rating}
                              </span>
                            )}
                            {/* Trạng thái bãi đỗ */}
                            <Badge className={`text-xs ${lotStatus.className}`}>
                              {lotStatus.label}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Thông tin bổ sung */}
              <div className="flex items-center justify-between text-sm text-gray-400 px-1">
                <span>Tham gia: {formatDate(selectedOwner.createdAt)}</span>
                <span>Hoạt động cuối: {timeAgo(selectedOwner.lastActive)}</span>
              </div>

              {/* Nút hành động */}
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <Button variant="outline" onClick={() => setDetailOpen(false)}>
                  Đóng
                </Button>
                <Button
                  onClick={() => handleToggleStatus(selectedOwner)}
                  className={
                    selectedOwner.status === "active"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }
                >
                  {selectedOwner.status === "active" ? (
                    <>
                      <Ban size={16} className="mr-2" />
                      Khóa tài khoản
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} className="mr-2" />
                      Mở khóa tài khoản
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
