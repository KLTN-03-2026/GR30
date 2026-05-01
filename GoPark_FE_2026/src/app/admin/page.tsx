"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  MapPin,
  Receipt,
  TrendingUp,
  Server,
  Database,
  CreditCard,
  Bell,
  Activity,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  CheckCircle2,
  Clock,
  Settings,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

import { adminService, type AdminStats, type AdminActivity, type SystemStatus } from "@/services/admin.service";

import RoleGuard from "@/components/RoleGuard";
import { useAdminStore } from "@/stores";


const MOCK_SYSTEM_STATUS: SystemStatus = {
  apiService: { status: "healthy", message: "Hoạt động bình thường" },
  database: { status: "healthy", message: "Kết nối ổn định" },
  paymentGateway: { status: "healthy", message: "Cổng thanh toán MoMo & ZaloPay" },
  notification: { status: "healthy", message: "Hệ thống Push Notification" },
};

export default function AdminDashboard() {
  const {
    overviewStats: stats,
    recentActivities: activities,
    systemStatus,
    isDashboardLoading: loading,
    dashboardError: error,
    setDashboardData,
    setDashboardLoading,
    setDashboardError
  } = useAdminStore();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredActivities = activities.filter((activity) => {
    if (!activity) return false;
    
    // Safely access properties with optional chaining and fallback to empty string
    const content = activity.content || "";
    const username = activity.username || "";
    const type = activity.type || "";
    const status = activity.status || "";

    const matchesSearch =
      content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = 
      typeFilter === "all" || 
      type.toLowerCase() === typeFilter.toLowerCase();
      
    const matchesStatus = 
      statusFilter === "all" || 
      status.toLowerCase() === statusFilter.toLowerCase();
      
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const currentActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchData = async () => {
      try {
        setDashboardLoading(true);

        // Fetch all data using adminService
        const [statsData, activitiesData, statusData] = await Promise.all([
          adminService.getOverviewStats(),
          adminService.getRecentActivities(),
          adminService.getSystemStatus().catch(() => null), // Optional, fallback handled below
        ]);

        setDashboardData(
          statsData, 
          activitiesData, 
          statusData || MOCK_SYSTEM_STATUS
        );
      } catch (err: any) {
        console.error("Fetch error:", err);
        setDashboardError(err.message);
      }
    };

  useEffect(() => {
    if (!stats) {
      fetchData();
    }
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const statCards = [
    {
      title: "Tổng người dùng",
      value: formatNumber(stats?.totalUsers || 0),
      change: `${(stats?.userChangePercent as number) >= 0 ? "+" : ""}${stats?.userChangePercent || 0}%`,
      changeType:
        (stats?.userChangePercent || 0) >= 0 ? "positive" : "negative",
      icon: Users,
      description: "So với tháng trước",
      iconGradient: "from-blue-500 to-indigo-600",
      bgTint: "from-blue-50 to-indigo-50",
      borderColor: "border-blue-100",
      accentColor: "text-blue-600",
    },
    {
      title: "Bãi đỗ xe",
      value: formatNumber(stats?.totalParkingLots || 0),
      change: `+${stats?.newParkingLotsThisMonth || 0}`,
      changeType: "positive",
      icon: MapPin,
      description: "Bãi mới trong tháng",
      iconGradient: "from-emerald-500 to-teal-600",
      bgTint: "from-emerald-50 to-teal-50",
      borderColor: "border-emerald-100",
      accentColor: "text-emerald-600",
    },
    {
      title: "Đặt chỗ hôm nay",
      value: formatNumber(stats?.todayBookings || 0),
      change: `${(stats?.bookingChangePercent as number) >= 0 ? "+" : ""}${stats?.bookingChangePercent || 0}%`,
      changeType:
        (stats?.bookingChangePercent || 0) >= 0 ? "positive" : "negative",
      icon: Receipt,
      description: "So với hôm qua",
      iconGradient: "from-violet-500 to-purple-600",
      bgTint: "from-violet-50 to-purple-50",
      borderColor: "border-violet-100",
      accentColor: "text-violet-600",
    },
    {
      title: "Doanh thu tháng",
      value: formatCurrency(stats?.thisMonthRevenue || 0),
      change: `${(stats?.revenueChangePercent as number) >= 0 ? "+" : ""}${stats?.revenueChangePercent || 0}%`,
      changeType:
        (stats?.revenueChangePercent || 0) >= 0 ? "positive" : "negative",
      icon: TrendingUp,
      description: "So với tháng trước",
      iconGradient: "from-amber-500 to-orange-600",
      bgTint: "from-amber-50 to-orange-50",
      borderColor: "border-amber-100",
      accentColor: "text-amber-600",
    },
  ];

  return (
    <RoleGuard allowedRole="admin">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dashboard admin...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Lỗi server không hoạt động
            </h3>
            <Button onClick={() => window.location.reload()}>Thử lại</Button>
          </div>
        </div>
      ) : (
      <div className="space-y-6">
        {/* Header */ }
        <div className="flex justify-between items-center bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl px-8 py-6 shadow-lg">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Dashboard Admin
            </h1>
            <p className="text-blue-200/70 mt-1 text-sm">Tổng quan hệ thống GoPark</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              className="bg-amber-400/15 text-amber-300 border border-amber-400/30 backdrop-blur-sm px-3 py-1"
            >
              <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
              {stats?.pendingApprovals || 0} chờ duyệt
            </Badge>
            <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm shadow-none">
              Xuất báo cáo
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card key={index} className={`bg-gradient-to-br ${card.bgTint} ${card.borderColor} border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative`}>
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.iconGradient} opacity-[0.04] rounded-full -translate-y-10 translate-x-10`} />
                <CardContent className="p-5 relative">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        {card.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mb-2">
                        {card.value}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                            card.changeType === "positive"
                              ? "text-emerald-700 bg-emerald-100"
                              : "text-red-700 bg-red-100"
                          }`}
                        >
                          {card.change}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {card.description}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.iconGradient} flex items-center justify-center shadow-lg shadow-black/10`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recent Activities */}
          <Card className="lg:col-span-2 border-gray-100 dark:border-slate-800 shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
             <CardHeader className="pb-3 px-6 pt-6 mb-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
                  <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">Hoạt động hệ thống</CardTitle>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative group">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      placeholder="Tìm kiếm..."
                      className="h-9 pl-9 text-sm w-[180px] md:w-[240px] border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500/30 bg-slate-50 dark:bg-slate-800 text-slate-900"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                  

                  {(searchTerm || typeFilter !== "all" || statusFilter !== "all") && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                      onClick={() => {
                        setSearchTerm("");
                        setTypeFilter("all");
                        setStatusFilter("all");
                        setCurrentPage(1);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
                <Table>
                  <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                    <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                      <TableHead className="text-[11px] font-bold uppercase text-slate-500 tracking-wider h-10">Loại</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase text-slate-500 tracking-wider h-10 w-[40%]">Hoạt động</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase text-slate-500 tracking-wider h-10">Người thực hiện</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase text-slate-500 tracking-wider h-10">Thời gian</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase text-slate-500 tracking-wider h-10 text-right">Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentActivities.length > 0 ? (
                      currentActivities.map((activity) => {
                        let Icon = Activity;
                        let colorClass = "blue";
                        
                        const activityType = activity.type.toLowerCase();

                        switch (true) {
                          case activityType.includes("user"):
                            Icon = UserPlus;
                            colorClass = "indigo";
                            break;
                          case activityType.includes("parking"):
                            Icon = MapPin;
                            colorClass = "emerald";
                            break;
                          case activityType.includes("wallet") || activityType.includes("payment"):
                            Icon = CreditCard;
                            colorClass = "amber";
                            break;
                          case activityType.includes("booking"):
                            Icon = Receipt;
                            colorClass = "blue";
                            break;
                          case activityType.includes("system"):
                            Icon = Settings;
                            colorClass = "rose";
                            break;
                          default:
                            Icon = Activity;
                            colorClass = "blue";
                            break;
                        }
                    

                        const statusConfig = {
                          success: { label: "Thành công", class: "text-emerald-700 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50" },
                          warning: { label: "Cảnh báo", class: "text-amber-700 bg-amber-50 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50" },
                          error: { label: "Lỗi", class: "text-rose-700 bg-rose-50 border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/50" }
                        };

                        const currentStatus = statusConfig[activity.status] || statusConfig.success;

                        return (
                          <TableRow key={activity.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 border-slate-100 dark:border-slate-800 transition-colors group">
                            <TableCell className="py-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-transform duration-300`}>
                                  <Icon className={`w-4 h-4 text-${colorClass}-500`} />
                                </div>
                                <span className="text-[11px] font-bold uppercase text-slate-400 group-hover:text-slate-600 transition-colors tracking-tight">{activity.type}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3">
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                {activity.content}
                              </p>
                            </TableCell>
                            <TableCell className="py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                  <Users className="w-3 h-3 text-slate-400" />
                                </div>
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{activity.username}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3">
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <Clock className="w-3.5 h-3.5 opacity-60" />
                                <span className="text-xs font-medium whitespace-nowrap">{activity.time}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 text-right">
                              <Badge variant="outline" className={`text-[10px] uppercase font-bold px-2 py-0.5 h-6 border shadow-none pointer-events-none ${currentStatus.class}`}>
                                {currentStatus.label}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-48 text-center">
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center shadow-inner">
                              <Activity className="w-6 h-6 text-slate-300 dark:text-slate-700" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Không tìm thấy dữ liệu</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
                <div className="flex items-center gap-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Hiển thị {currentActivities.length} <span className="opacity-50 mx-0.5">/</span> {filteredActivities.length} kết quả
                  </p>
                  <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden md:block" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Dòng mỗi trang:</span>
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={(val) => {
                        setItemsPerPage(Number(val));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="h-8 w-[70px] bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold px-2 text-slate-900 shadow-none">
                        <SelectValue placeholder="5" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 rounded-lg hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </Button>
                    
                    <div className="flex items-center gap-0.5 px-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                        .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && <span className="text-slate-300 text-xs px-0.5">...</span>}
                          <Button
                            variant={currentPage === page ? "default" : "ghost"}
                            className={`w-7 h-7 text-xs font-bold rounded-lg transition-all ${currentPage === page ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 dark:shadow-none" : "text-slate-500 hover:bg-white dark:hover:bg-slate-700"}`}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        </React.Fragment>
                      ))}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 rounded-lg hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="border-gray-100 dark:border-slate-800 shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader className="pb-3 px-6 pt-6">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full" />
                <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">Trạng thái hệ thống</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="space-y-3.5">
                {systemStatus &&
                  Object.entries(systemStatus).map(([key, service]) => {
                    let ServiceIcon = Server;
                    let iconBgGradient = "from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700";
                    let iconColor = "text-slate-500 dark:text-slate-400";
                    
                    if (key.toLowerCase().includes("database")) {
                      ServiceIcon = Database;
                      iconBgGradient = "from-violet-500 to-purple-600";
                      iconColor = "text-white";
                    } else if (key.toLowerCase().includes("payment")) {
                      ServiceIcon = CreditCard;
                      iconBgGradient = "from-amber-500 to-orange-600";
                      iconColor = "text-white";
                    } else if (key.toLowerCase().includes("notification")) {
                      ServiceIcon = Bell;
                      iconBgGradient = "from-pink-500 to-rose-600";
                      iconColor = "text-white";
                    } else if (key.toLowerCase().includes("api")) {
                      ServiceIcon = Activity;
                      iconBgGradient = "from-blue-500 to-indigo-600";
                      iconColor = "text-white";
                    }

                    return (
                      <div
                        key={key}
                        className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all duration-200 group ${
                          service.status === "healthy"
                            ? "bg-white dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/50 hover:border-emerald-200 dark:hover:border-emerald-900/30"
                            : "bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30 hover:border-red-200"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${iconBgGradient} flex items-center justify-center shadow-sm shrink-0 border border-white/10`}>
                          <ServiceIcon className={`w-5 h-5 ${iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200 capitalize">
                            {key.replace(/([A-Z])/g, " $1")}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                            {service.message}
                          </p>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight shrink-0 border ${
                          service.status === "healthy"
                            ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50"
                            : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${service.status === "healthy" ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                          {service.status === "healthy" ? "Tốt" : "Lỗi"}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      )}
    </RoleGuard>
  );
}
