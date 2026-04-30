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
import { adminService, CustomerList } from "@/services/admin.service";
import { useAdminStore } from "@/stores";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: "ACTIVE" | "BLOCKED";
  totalBookings: number;
  totalSpending: number;
  lastActive: string;
  createdAt: string;
  address?: string;
  recentBookings?: RecentBooking[];
}

interface RecentBooking {
  id: string;
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

import { get } from "@/lib/api";

export const statusConfig = {
  ACTIVE: {
    label: "Hoạt động",
    className: "bg-green-100 text-green-800 border-green-200",
    dot: "bg-green-500",
  },
  BLOCKED: {
    label: "Đã khóa",
    className: "bg-red-100 text-red-800 border-red-200",
    dot: "bg-red-500",
  },
  SPENDING: {
    label: "Chưa xác thực",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    dot: "bg-yellow-500",
  }
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
  const { 
    customers, 
    customerStats: apiStats, 
    isCustomersLoading: loading, 
    customersError: error,
    setCustomerData,
    setCustomersLoading,
    setCustomersError,
    setCustomers
  } = useAdminStore();

  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    sortBy: "newest",
  });

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setCustomersLoading(true);

      const [statsData, customerListData] = await Promise.all([
        adminService.getUserStats(),
        adminService.getCustomers()
      ]);

      if (customerListData && statsData) {
        setCustomerData(customerListData, statsData);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      setCustomersError(err instanceof Error ? err.message : "Lỗi không xác định");
    }
  };

  useEffect(() => {
    if (customers.length === 0) {
      fetchCustomers();
    }
  }, []);

  // Filter & sort
  const filteredCustomers = useMemo(() => {
    let result = [...customers];

    // Search
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          (c.name || "").toLowerCase().includes(term) ||
          (c.email || "").toLowerCase().includes(term) ||
          (c.phone || "").replace(/\s/g, "").includes(term.replace(/\s/g, ""))
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
      result.sort((a, b) => b.totalSpending - a.totalSpending);
    }

    return result;
  }, [customers, filters]);

  // Stats
  const stats = useMemo(() => {
    if (apiStats) {
      return {
        total: apiStats.totalUsers,
        active: apiStats.activeUsers,
        banned: apiStats.blockedUsers,
        thisMonth: apiStats.newUsersLastMonth,
      };
    }
    

    const total = customers.length;
    const active = customers.filter((c) => c.status === "ACTIVE").length;
    const banned = customers.filter((c) => c.status === "BLOCKED").length;
    const thisMonth = customers.filter((c) => {
      const created = new Date(c.createdAt);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;
    return { total, active, banned, thisMonth };
  }, [customers, apiStats]);


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
    if (togglingId) return;
    
    const isBlocking = customer.status === "ACTIVE";
    const newStatus = isBlocking ? "BLOCKED" : "ACTIVE";
    const apiStatus = isBlocking ? "BLOCKED" : "ACTIVE";
    
    setTogglingId(customer.id);
    try {
      await adminService.updateUserStatus(customer.id, apiStatus);
      
      setCustomers(
        customers.map((c) => (c.id === customer.id ? { ...c, status: newStatus as "ACTIVE" | "BLOCKED" } : c))
      );
      
      toast.success(`${isBlocking ? "Khóa" : "Mở khóa"} tài khoản thành công`);
      
      if (selectedCustomer && selectedCustomer.id === customer.id) {
        setSelectedCustomer({ ...selectedCustomer, status: newStatus as "ACTIVE" | "BLOCKED" });
      }
    } catch (error: any) {
      toast.error(error.message || `Không thể ${isBlocking ? "khóa" : "mở khóa"} tài khoản`);
    } finally {
      setTogglingId(null);
    }
  };

  // ─── Stat Cards ─────────────────────────────────────────────────────────────

const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const statCards = [
    {
      title: "Tổng khách hàng",
      value: formatNumber(stats.total),
      icon: Users,
      gradient: "from-blue-500 to-indigo-600",
      bgTint: "from-blue-50 to-indigo-50",
      border: "border-blue-100",
    },
    {
      title: "Khách hàng mới",
      value: formatNumber(stats.thisMonth),
      subtitle: apiStats ? "Trong 7 ngày qua" : "Trong tháng này",
      icon: UserPlus,
      gradient: "from-emerald-500 to-teal-600",
      bgTint: "from-emerald-50 to-teal-50",
      border: "border-emerald-100",
    },
    {
      title: "Đang hoạt động",
      value: formatNumber(stats.active),
      icon: UserCheck,
      gradient: "from-violet-500 to-purple-600",
      bgTint: "from-violet-50 to-purple-50",
      border: "border-violet-100",
    },
    {
      title: "Đã khóa",
      value: formatNumber(stats.banned),
      icon: ShieldBan,
      gradient: "from-red-500 to-rose-600",
      bgTint: "from-red-50 to-rose-50",
      border: "border-red-100",
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
            Tìm thấy {stats.total} khách hàng
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
                    {card.subtitle && (
                      <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
                    )}
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
                className="pl-10 h-11 bg-slate-50 border-gray-200 focus:bg-white text-slate-900"
              />
          </div>
          {/* Status */}
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
          {/* Sort */}
          <Select value={filters.sortBy} onValueChange={(val) => handleFilterChange("sortBy", val)}>
            <SelectTrigger className="h-11 min-w-[180px] border-gray-200 bg-slate-50 text-slate-900">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mới nhất</SelectItem>
              <SelectItem value="oldest">Cũ nhất</SelectItem>
              <SelectItem value="most-bookings">Nhiều booking nhất</SelectItem>
              <SelectItem value="most-spent">Chi tiêu nhiều nhất</SelectItem>
            </SelectContent>
          </Select>
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
               
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCustomers.map((customer) => {
                const statusKey = (customer.status || "ACTIVE").toUpperCase() as keyof typeof statusConfig;
                const config = statusConfig[statusKey] || statusConfig.ACTIVE;
                return (
                  <tr
                    key={customer.id}
                    className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                    onClick={() => openDetail(customer)}
                  >
                    {/* Customer info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(customer.id)} flex items-center justify-center flex-shrink-0 shadow-sm`}
                        >
                          <span className="text-white text-sm font-semibold">
                            {getInitials(customer.name)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{customer.name}</p>
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
                          {customer.phone}
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
                        {formatCurrency(customer.totalSpending)}
                      </p>
                    </td>
                    {/* Status */}
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`text-xs font-medium ${config.className}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${config.dot} mr-1.5 inline-block`} />
                        {config.label}
                      </Badge>
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ">
                            <MoreVertical size={16} className="text-slate-600" />
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
                            className={customer.status === "ACTIVE" ? "text-red-600" : "text-green-600"}
                            disabled={togglingId === customer.id}
                          >
                            {togglingId === customer.id ? (
                              <Loader2 size={16} className="mr-2 animate-spin" />
                            ) : customer.status === "ACTIVE" ? (
                              <Ban size={16} className="mr-2 cursor-pointer" />
                            ) : (
                              <CheckCircle size={16} className="mr-2 cursor-pointer" />
                            )}
                            {customer.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa"}
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
                  className={`w-16 h-16 rounded-full bg-gradient-to-br ${getAvatarColor(selectedCustomer.id)} flex items-center justify-center shadow-md`}
                >
                  <span className="text-white text-xl font-bold">
                    {getInitials(selectedCustomer.name)}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{selectedCustomer.name}</h3>
                  <p className="text-sm text-gray-500">
                    Tham gia từ {formatDate(selectedCustomer.createdAt)}
                  </p>
                  <Badge
                    variant="outline"
                    className={`mt-2 ${(statusConfig[(selectedCustomer.status || "ACTIVE").toUpperCase() as keyof typeof statusConfig] || statusConfig.ACTIVE).className}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${(statusConfig[(selectedCustomer.status || "ACTIVE").toUpperCase() as keyof typeof statusConfig] || statusConfig.ACTIVE).dot} mr-1.5 inline-block`} />
                    {(statusConfig[(selectedCustomer.status || "ACTIVE").toUpperCase() as keyof typeof statusConfig] || statusConfig.ACTIVE).label}
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
                    <p className="text-sm font-medium text-gray-900">{selectedCustomer.phone}</p>
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
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <Car className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-blue-700">{selectedCustomer.totalBookings}</p>
                  <p className="text-xs text-blue-500">Tổng booking</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-green-700">{formatCurrency(selectedCustomer.totalSpending)}</p>
                  <p className="text-xs text-green-500">Đã chi tiêu</p>
                </div>
                {/* <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <Clock className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-sm font-bold text-purple-700 mt-1">{timeAgo(selectedCustomer.lastActive)}</p>
                  <p className="text-xs text-purple-500">Hoạt động cuối</p>
                </div> */}
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
                        key={booking.id}
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
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 cursor-pointer">
                <Button variant="outline" onClick={() => setDetailOpen(false)}>
                  Đóng
                </Button>
                <Button
                  onClick={() => handleToggleStatus(selectedCustomer)}
                  disabled={togglingId === selectedCustomer.id}
                  className={
                    selectedCustomer.status === "ACTIVE"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }
                >
                  {togglingId === selectedCustomer.id ? (
                    <Loader2 size={16} className="mr-2 animate-spin" />
                  ) : selectedCustomer.status === "ACTIVE" ? (
                    <Ban size={16} className="mr-2 cursor-pointer" />
                  ) : (
                    <CheckCircle size={16} className="mr-2 cursor-pointer" />
                  )}
                  {selectedCustomer.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
