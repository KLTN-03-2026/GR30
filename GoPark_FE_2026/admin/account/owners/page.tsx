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
  Loader2,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminService, OwnerList, OwnerStats } from "@/services/admin.service";
import { useAdminStore } from "@/stores";
import { toast } from "sonner";

// ─── Kiểu dữ liệu ───────────────────────────────────────────────────────────

/** Thông tin bãi đỗ xe của chủ bãi */
interface ParkingLot {
  id: string;
  name: string;
  address: string;
  totalSlots: number;
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
  rating: number;
}

/** Thông tin chủ bãi đỗ */
interface Owner extends OwnerList {
  avatar?: string;
  lastActive?: string;
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
import { statusConfig } from "@/app/admin/account/customers/page"

/** Cấu hình màu sắc cho trạng thái bãi đỗ */
const parkingLotStatusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "Hoạt động", className: "bg-green-100 text-green-700" },
  pending: { label: "Chờ duyệt", className: "bg-yellow-100 text-yellow-700" },
  suspended: { label: "Tạm ngưng", className: "bg-red-100 text-red-700" },
};


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
  const {
    owners,
    ownerStats,
    isOwnersLoading: loading,
    ownersError: error,
    setOwnerData,
    setOwnersLoading,
    setOwnersError,
    setOwners,
    setOwnerStats
  } = useAdminStore();

  /** Bộ lọc tìm kiếm / trạng thái / sắp xếp */
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    sortBy: "newest",
  });

  /** Chủ bãi đỗ đang xem chi tiết */
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // ── Gọi API lấy danh sách chủ bãi đỗ ───────────────────────────────────────

  const fetchOwners = async () => {
    try {
      setOwnersLoading(true);

      const [statsData, listData] = await Promise.all([
        adminService.getOwnerStats(),
        adminService.getOwners()
      ]);

      if (statsData && listData) {
        setOwnerData(listData, statsData);
      }

    } catch (err) {
      console.error("Lỗi khi tải danh sách chủ bãi đỗ:", err);
      setOwnersError(err instanceof Error ? err.message : "Lỗi không xác định");
    }
  };

  /** Tải dữ liệu khi component được mount */
  useEffect(() => {
    if (owners.length === 0) {
      fetchOwners();
    }
  }, []);

  // ── Lọc & sắp xếp danh sách ────────────────────────────────────────────────

  const filteredOwners = useMemo(() => {
    let result = [...owners] as Owner[];

    // Tìm kiếm theo tên, email, SĐT, tên doanh nghiệp
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (o) =>
          (o.name || "").toLowerCase().includes(term) ||
          (o.email || "").toLowerCase().includes(term) ||
          (o.phone || "").replace(/\s/g, "").includes(term.replace(/\s/g, "")) ||
          (o.businessName || "").toLowerCase().includes(term)
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
        // Since revenue is a string like "0 Tr ₫", we might need a better way to sort
        // But for now, we leave it or attempt basic string comparison
        result.sort((a, b) => b.totalRevenue.localeCompare(a.totalRevenue));
        break;
    }

    return result;
  }, [owners, filters]);

  // ── Tính toán thống kê ──────────────────────────────────────────────────────

  const stats = useMemo(() => {
    if (ownerStats) {
      return {
        total: ownerStats.totalOwners,
        active: ownerStats.activeOwners,
        blocked: ownerStats.blockedOwners,
        newLastMonth: ownerStats.newOwnersLastMonth,
      };
    }

    const total = owners.length;
    const active = owners.filter((o) => o.status === "ACTIVE").length;
    const blocked = owners.filter((o) => o.status === "BLOCKED" || o.status === "BANNED").length;
    return { total, active, blocked, newLastMonth: 0 };
  }, [owners, ownerStats]);

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
    if (togglingId) return;
    
    const isBlocking = owner.status === "ACTIVE";
    // UI use BANNED or BLOCKED for red badge
    const newStatus = isBlocking ? "BLOCKED" : "ACTIVE";
    const apiStatus = isBlocking ? "BLOCKED" : "ACTIVE";
    
    setTogglingId(owner.id);
    try {
      await adminService.updateUserStatus(owner.id, apiStatus);
      
      setOwners(
        owners.map((o) => (o.id === owner.id ? { ...o, status: newStatus } : o))
      );
      
      toast.success(`${isBlocking ? "Khóa" : "Mở khóa"} tài khoản chủ bãi thành công`);
      
      // Cập nhật luôn owner đang xem chi tiết (nếu có)
      if (selectedOwner && selectedOwner.id === owner.id) {
        setSelectedOwner({ ...selectedOwner, status: newStatus });
      }
    } catch (error: any) {
      toast.error(error.message || `Không thể ${isBlocking ? "khóa" : "mở khóa"} tài khoản`);
    } finally {
      setTogglingId(null);
    }
  };

  // ── Cấu hình thẻ thống kê ──────────────────────────────────────────────────

  const statCards = [
    {
      title: "Tổng chủ bãi",
      value: stats.total,
      icon: Users,
      gradient: "from-blue-500 to-indigo-600",
      bgTint: "from-blue-50 to-indigo-50",
      border: "border-blue-100",
    },
    {
      title: "Đang hoạt động",
      value: stats.active,
      icon: UserCheck,
      gradient: "from-emerald-500 to-teal-600",
      bgTint: "from-emerald-50 to-teal-50",
      border: "border-emerald-100",
    },
    {
      title: "Chủ bãi mới (tháng)",
      value: stats.newLastMonth,
      icon: UserPlus,
      gradient: "from-violet-500 to-purple-600",
      bgTint: "from-violet-50 to-purple-50",
      border: "border-violet-100",
    },
    {
      title: "Đã bị khóa",
      value: stats.blocked,
      icon: ShieldBan,
      gradient: "from-red-500 to-rose-600",
      bgTint: "from-red-50 to-rose-50",
      border: "border-red-100",
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
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Card
              key={i}
              className={`bg-gradient-to-br ${card.bgTint} ${card.border} border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative shadow-sm`}
            >
              <div
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.gradient} opacity-[0.04] rounded-full -translate-y-10 translate-x-10`}
              />
              <CardContent className="p-5 relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {card.value}
                    </p>
                  </div>
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg shadow-black/10`}
                  >
                    <Icon className="w-5 h-5 text-white" />
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
              className="pl-10 h-11 bg-slate-50 border-gray-200 focus:bg-white text-slate-900"
            />
          </div>
          {/* Lọc trạng thái */}
          <Select value={filters.status || "all"} onValueChange={(val) => handleFilterChange("status", val === "all" ? "" : val)}>
            <SelectTrigger className="h-11 min-w-[160px] border-gray-200 bg-slate-50 text-slate-900">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="ACTIVE">Hoạt động</SelectItem>
              <SelectItem value="BANNED">Đã khóa</SelectItem>
            </SelectContent>
          </Select>
          {/* Sắp xếp */}
          <Select value={filters.sortBy} onValueChange={(val) => handleFilterChange("sortBy", val)}>
            <SelectTrigger className="h-11 min-w-[180px] border-gray-200 bg-slate-50 text-slate-900">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mới nhất</SelectItem>
              <SelectItem value="oldest">Cũ nhất</SelectItem>
              <SelectItem value="most-lots">Nhiều bãi đỗ nhất</SelectItem>
              <SelectItem value="most-revenue">Doanh thu nhiều nhất</SelectItem>
            </SelectContent>
          </Select>
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
                const statusKey = (owner.status || "ACTIVE").toUpperCase() as keyof typeof statusConfig;
                const config = statusConfig[statusKey] || statusConfig.ACTIVE;
                return (
                  <tr
                    key={owner.id}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                    onClick={() => openDetail(owner)}
                  >
                    {/* Thông tin chủ bãi */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar với chữ cái đầu */}
                        <div
                          className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(owner.id)} flex items-center justify-center flex-shrink-0 shadow-sm`}
                        >
                          <span className="text-white text-sm font-semibold">
                            {getInitials(owner.name)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{owner.name}</p>
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
                          {owner.phone}
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
                        {owner.totalRevenue}
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
                            <MoreVertical size={16} className="text-slate-600" />
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
                            className={owner.status === "ACTIVE" ? "text-red-600" : "text-green-600"}
                            disabled={togglingId === owner.id}
                          >
                            {togglingId === owner.id ? (
                              <Loader2 size={16} className="mr-2 animate-spin" />
                            ) : owner.status === "ACTIVE" ? (
                              <Ban size={16} className="mr-2" />
                            ) : (
                              <CheckCircle size={16} className="mr-2" />
                            )}
                            {owner.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa"}
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
                  className={`w-16 h-16 rounded-full bg-gradient-to-br ${getAvatarColor(selectedOwner.id)} flex items-center justify-center shadow-md`}
                >
                  <span className="text-white text-xl font-bold">
                    {getInitials(selectedOwner.name)}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{selectedOwner.name}</h3>
                  {selectedOwner.businessName && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Building2 size={14} />
                      {selectedOwner.businessName}
                    </p>
                  )}
                  <Badge
                    variant="outline"
                    className={`mt-2 ${(statusConfig[(selectedOwner.status || "ACTIVE").toUpperCase() as keyof typeof statusConfig] || statusConfig.ACTIVE).className}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${(statusConfig[(selectedOwner.status || "ACTIVE").toUpperCase() as keyof typeof statusConfig] || statusConfig.ACTIVE).dot} mr-1.5 inline-block`} />
                    {(statusConfig[(selectedOwner.status || "ACTIVE").toUpperCase() as keyof typeof statusConfig] || statusConfig.ACTIVE).label}
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
                    <p className="text-sm font-medium text-gray-900">{selectedOwner.phone}</p>
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
                  <p className="text-lg font-bold text-green-700">{selectedOwner.totalRevenue}</p>
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
                          key={lot.id}
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
                {selectedOwner.lastActive && <span>Hoạt động cuối: {timeAgo(selectedOwner.lastActive)}</span>}
              </div>

              {/* Nút hành động */}
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <Button variant="outline" onClick={() => setDetailOpen(false)}>
                  Đóng
                </Button>
                <Button
                  onClick={() => handleToggleStatus(selectedOwner)}
                  disabled={togglingId === selectedOwner.id}
                  className={
                    selectedOwner.status === "ACTIVE"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }
                >
                  {togglingId === selectedOwner.id ? (
                    <Loader2 size={16} className="mr-2 animate-spin" />
                  ) : selectedOwner.status === "ACTIVE" ? (
                    <Ban size={16} className="mr-2" />
                  ) : (
                    <CheckCircle size={16} className="mr-2" />
                  )}
                  {selectedOwner.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
