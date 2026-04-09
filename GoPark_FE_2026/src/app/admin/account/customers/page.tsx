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

// ─── Types ────────────────────────────────────────────────────────────────────

interface Customer {
  _id: string;
  userName: string;
  email: string;
  phoneNumber: string;
  avatar?: string;
  status: "active" | "banned";
  totalBookings: number;
  totalSpent: number;
  lastActive: string;
  createdAt: string;
  address?: string;
  recentBookings?: RecentBooking[];
}

interface RecentBooking {
  _id: string;
  parkingLotName: string;
  date: string;
  status: "completed" | "cancelled" | "confirmed" | "pending";
  amount: number;
}

interface Filters {
  search: string;
  status: string;
  sortBy: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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

const bookingStatusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  confirmed: "bg-blue-100 text-blue-700",
  pending: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
};

const bookingStatusLabels: Record<string, string> = {
  completed: "Hoàn thành",
  confirmed: "Đã xác nhận",
  pending: "Chờ xác nhận",
  cancelled: "Đã hủy",
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockCustomers: Customer[] = [
  {
    _id: "c1",
    userName: "Nguyễn Văn Anh",
    email: "nguyenvananh@gmail.com",
    phoneNumber: "0901 234 567",
    status: "active",
    totalBookings: 24,
    totalSpent: 3600000,
    lastActive: "2026-03-13T10:30:00Z",
    createdAt: "2025-06-15T08:00:00Z",
    address: "123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
    recentBookings: [
      { _id: "b1", parkingLotName: "Bãi đỗ xe Times City", date: "2026-03-12T08:00:00Z", status: "completed", amount: 150000 },
      { _id: "b2", parkingLotName: "Bãi đỗ xe Vincom Đồng Khởi", date: "2026-03-10T14:00:00Z", status: "completed", amount: 200000 },
      { _id: "b3", parkingLotName: "Bãi đỗ xe Landmark 81", date: "2026-03-08T09:00:00Z", status: "cancelled", amount: 180000 },
    ],
  },
  {
    _id: "c2",
    userName: "Trần Thị Bình",
    email: "tranthibinh@gmail.com",
    phoneNumber: "0907 654 321",
    status: "active",
    totalBookings: 12,
    totalSpent: 1800000,
    lastActive: "2026-03-12T15:45:00Z",
    createdAt: "2025-09-20T10:30:00Z",
    address: "45 Lê Lợi, Quận 3, TP. Hồ Chí Minh",
    recentBookings: [
      { _id: "b4", parkingLotName: "Bãi đỗ xe Royal City", date: "2026-03-11T10:00:00Z", status: "confirmed", amount: 120000 },
    ],
  },
  {
    _id: "c3",
    userName: "Phạm Minh Châu",
    email: "phamminhchau@yahoo.com",
    phoneNumber: "0912 345 678",
    status: "banned",
    totalBookings: 5,
    totalSpent: 750000,
    lastActive: "2026-02-28T12:00:00Z",
    createdAt: "2025-11-01T09:00:00Z",
    address: "78 Trần Hưng Đạo, Quận 5, TP. Hồ Chí Minh",
    recentBookings: [],
  },
  {
    _id: "c4",
    userName: "Lê Hoàng Dũng",
    email: "lehoangdung@outlook.com",
    phoneNumber: "0938 765 432",
    status: "active",
    totalBookings: 36,
    totalSpent: 5400000,
    lastActive: "2026-03-13T08:15:00Z",
    createdAt: "2025-03-10T14:00:00Z",
    address: "156 Điện Biên Phủ, Quận Bình Thạnh, TP. Hồ Chí Minh",
    recentBookings: [
      { _id: "b5", parkingLotName: "Bãi đỗ xe Saigon Centre", date: "2026-03-13T07:00:00Z", status: "confirmed", amount: 250000 },
      { _id: "b6", parkingLotName: "Bãi đỗ xe Times City", date: "2026-03-11T16:00:00Z", status: "completed", amount: 150000 },
    ],
  },
  {
    _id: "c5",
    userName: "Vũ Thị Thu Hảo",
    email: "vuthithuhao@gmail.com",
    phoneNumber: "0976 543 210",
    status: "active",
    totalBookings: 8,
    totalSpent: 1200000,
    lastActive: "2026-03-11T20:00:00Z",
    createdAt: "2025-12-25T16:00:00Z",
    address: "200 Cách Mạng Tháng 8, Quận 10, TP. Hồ Chí Minh",
    recentBookings: [
      { _id: "b7", parkingLotName: "Bãi đỗ xe Vạn Hạnh Mall", date: "2026-03-10T11:00:00Z", status: "pending", amount: 100000 },
    ],
  },
  {
    _id: "c6",
    userName: "Đỗ Quang Khải",
    email: "doquangkhai@gmail.com",
    phoneNumber: "0889 123 456",
    status: "active",
    totalBookings: 18,
    totalSpent: 2700000,
    lastActive: "2026-03-13T12:00:00Z",
    createdAt: "2025-07-04T11:30:00Z",
    address: "89 Nguyễn Thị Minh Khai, Quận 1, TP. Hồ Chí Minh",
    recentBookings: [
      { _id: "b8", parkingLotName: "Bãi đỗ xe Bitexco", date: "2026-03-12T09:00:00Z", status: "completed", amount: 300000 },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const formatDateTime = (dateString: string) =>
  new Date(dateString).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const getInitials = (name: string) => {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const avatarColors = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-orange-500 to-amber-600",
  "from-pink-500 to-rose-600",
  "from-cyan-500 to-sky-600",
];

const getAvatarColor = (id: string) => {
  const index = id.charCodeAt(id.length - 1) % avatarColors.length;
  return avatarColors[index];
};

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    sortBy: "newest",
  });

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      setUsingMockData(false);

      const token = localStorage.getItem("authToken") || localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/v1/admin/users?role=customer`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      if (result.status === "success") {
        setCustomers(result.data.data || result.data);
      } else {
        throw new Error("Không thể tải dữ liệu");
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
      setUsingMockData(true);
      setCustomers(mockCustomers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter & sort
  const filteredCustomers = useMemo(() => {
    let result = [...customers];

    // Search
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.userName.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          c.phoneNumber.replace(/\s/g, "").includes(term.replace(/\s/g, ""))
      );
    }

    // Status
    if (filters.status) {
      result = result.filter((c) => c.status === filters.status);
    }

    // Sort
    if (filters.sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (filters.sortBy === "oldest") {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (filters.sortBy === "most-bookings") {
      result.sort((a, b) => b.totalBookings - a.totalBookings);
    } else if (filters.sortBy === "most-spent") {
      result.sort((a, b) => b.totalSpent - a.totalSpent);
    }

    return result;
  }, [customers, filters]);

  // Stats
  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter((c) => c.status === "active").length;
    const banned = customers.filter((c) => c.status === "banned").length;
    const thisMonth = customers.filter((c) => {
      const created = new Date(c.createdAt);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;
    return { total, active, banned, thisMonth };
  }, [customers]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: "", status: "", sortBy: "newest" });
  };

  const openDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDetailOpen(true);
  };

  const handleToggleStatus = async (customer: Customer) => {
    const newStatus = customer.status === "active" ? "banned" : "active";
    console.log(`Toggling status for ${customer._id} to ${newStatus}`);
    // TODO: API call
    setCustomers((prev) =>
      prev.map((c) => (c._id === customer._id ? { ...c, status: newStatus } : c))
    );
  };

  // ─── Stat Cards ─────────────────────────────────────────────────────────────

  const statCards = [
    {
      title: "Tổng khách hàng",
      value: stats.total,
      icon: Users,
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      title: "Khách hàng mới",
      value: stats.thisMonth,
      subtitle: "Trong tháng này",
      icon: UserPlus,
      color: "bg-emerald-500",
      lightColor: "bg-emerald-50",
      textColor: "text-emerald-700",
    },
    {
      title: "Đang hoạt động",
      value: stats.active,
      icon: UserCheck,
      color: "bg-violet-500",
      lightColor: "bg-violet-50",
      textColor: "text-violet-700",
    },
    {
      title: "Đã khóa",
      value: stats.banned,
      icon: ShieldBan,
      color: "bg-red-500",
      lightColor: "bg-red-50",
      textColor: "text-red-700",
    },
  ];

  // ─── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu khách hàng...</p>
        </div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl px-8 py-6 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Users className="w-6 h-6" />
            Quản lý Khách hàng
          </h1>
          <p className="text-blue-200/70 mt-1 text-sm">
            Tìm thấy {filteredCustomers.length} khách hàng
            {usingMockData && (
              <span className="ml-2 text-orange-300 text-xs">(Dữ liệu mẫu)</span>
            )}
          </p>
          {error && <p className="text-red-300 text-xs mt-1">Lỗi kết nối: {error}</p>}
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Button onClick={fetchCustomers} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm shadow-none gap-2">
            <RefreshCw size={16} />
            Làm mới
          </Button>
          <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm shadow-none gap-2">
            <Download size={16} />
            Xuất Excel
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
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
                    {card.subtitle && (
                      <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
                    )}
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

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
          {/* Status */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="h-11 px-4 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm min-w-[160px]"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="banned">Đã khóa</option>
          </select>
          {/* Sort */}
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="h-11 px-4 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm min-w-[180px]"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="most-bookings">Nhiều booking nhất</option>
            <option value="most-spent">Chi tiêu nhiều nhất</option>
          </select>
          {/* Clear */}
          {(filters.search || filters.status || filters.sortBy !== "newest") && (
            <Button variant="ghost" onClick={clearFilters} className="h-11 text-gray-500 hover:text-gray-700">
              <X size={16} className="mr-1" />
              Xóa lọc
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Liên hệ
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Booking
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Chi tiêu
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Hoạt động
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCustomers.map((customer) => {
                const config = statusConfig[customer.status];
                return (
                  <tr
                    key={customer._id}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                    onClick={() => openDetail(customer)}
                  >
                    {/* Customer info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(customer._id)} flex items-center justify-center flex-shrink-0 shadow-sm`}
                        >
                          <span className="text-white text-sm font-semibold">
                            {getInitials(customer.userName)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{customer.userName}</p>
                          <p className="text-xs text-gray-400">
                            Tham gia {formatDate(customer.createdAt)}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Contact */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} className="text-gray-400 flex-shrink-0" />
                          <span className="truncate max-w-[180px]">{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={14} className="text-gray-400 flex-shrink-0" />
                          {customer.phoneNumber}
                        </div>
                      </div>
                    </td>
                    {/* Bookings count */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-50 rounded-lg px-3 py-1.5">
                          <span className="text-sm font-bold text-blue-700">{customer.totalBookings}</span>
                        </div>
                        <span className="text-xs text-gray-400">lượt</span>
                      </div>
                    </td>
                    {/* Total spent */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(customer.totalSpent)}
                      </p>
                    </td>
                    {/* Status */}
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`text-xs font-medium ${config.className}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${config.dot} mr-1.5 inline-block`} />
                        {config.label}
                      </Badge>
                    </td>
                    {/* Last active */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{timeAgo(customer.lastActive)}</p>
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => openDetail(customer)}>
                            <Eye size={16} className="mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(customer)}
                            className={customer.status === "active" ? "text-red-600" : "text-green-600"}
                          >
                            {customer.status === "active" ? (
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

        {/* Empty State */}
        {filteredCustomers.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full w-20 h-20 mx-auto mb-5 flex items-center justify-center">
              <Users className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy khách hàng</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm để có kết quả phù hợp hơn
            </p>
            <Button onClick={clearFilters} variant="outline">
              Xóa tất cả bộ lọc
            </Button>
          </div>
        )}
      </div>

      {/* ─── Detail Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Chi tiết khách hàng</DialogTitle>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6 mt-2">
              {/* Profile header */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-br ${getAvatarColor(selectedCustomer._id)} flex items-center justify-center shadow-md`}
                >
                  <span className="text-white text-xl font-bold">
                    {getInitials(selectedCustomer.userName)}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{selectedCustomer.userName}</h3>
                  <p className="text-sm text-gray-500">
                    Tham gia từ {formatDate(selectedCustomer.createdAt)}
                  </p>
                  <Badge
                    variant="outline"
                    className={`mt-2 ${statusConfig[selectedCustomer.status].className}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[selectedCustomer.status].dot} mr-1.5 inline-block`} />
                    {statusConfig[selectedCustomer.status].label}
                  </Badge>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail size={18} className="text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm font-medium text-gray-900">{selectedCustomer.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone size={18} className="text-green-500" />
                  <div>
                    <p className="text-xs text-gray-400">Số điện thoại</p>
                    <p className="text-sm font-medium text-gray-900">{selectedCustomer.phoneNumber}</p>
                  </div>
                </div>
                {selectedCustomer.address && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg sm:col-span-2">
                    <MapPin size={18} className="text-orange-500" />
                    <div>
                      <p className="text-xs text-gray-400">Địa chỉ</p>
                      <p className="text-sm font-medium text-gray-900">{selectedCustomer.address}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <Car className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-blue-700">{selectedCustomer.totalBookings}</p>
                  <p className="text-xs text-blue-500">Tổng booking</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-green-700">{formatCurrency(selectedCustomer.totalSpent)}</p>
                  <p className="text-xs text-green-500">Đã chi tiêu</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <Clock className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-sm font-bold text-purple-700 mt-1">{timeAgo(selectedCustomer.lastActive)}</p>
                  <p className="text-xs text-purple-500">Hoạt động cuối</p>
                </div>
              </div>

              {/* Recent bookings */}
              {selectedCustomer.recentBookings && selectedCustomer.recentBookings.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                    Booking gần đây
                  </h4>
                  <div className="space-y-2">
                    {selectedCustomer.recentBookings.map((booking) => (
                      <div
                        key={booking._id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <MapPin size={14} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{booking.parkingLotName}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              <Calendar size={10} />
                              {formatDate(booking.date)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <Badge className={`text-xs ${bookingStatusColors[booking.status] || "bg-gray-100 text-gray-700"}`}>
                            {bookingStatusLabels[booking.status] || booking.status}
                          </Badge>
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(booking.amount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <Button variant="outline" onClick={() => setDetailOpen(false)}>
                  Đóng
                </Button>
                <Button
                  onClick={() => handleToggleStatus(selectedCustomer)}
                  className={
                    selectedCustomer.status === "active"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }
                >
                  {selectedCustomer.status === "active" ? (
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
