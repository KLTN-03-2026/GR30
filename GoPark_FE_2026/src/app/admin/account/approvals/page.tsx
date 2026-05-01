"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  RefreshCw,
  Download,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Clock,
  X,
  FileText,
  UserPlus,
  Trash2,
  Edit3,
  AlertTriangle,
  Filter,
  ArrowUpCircle,
  Building2,
  ShieldCheck,
  ClipboardList,
  MessageSquare,
  Send,
  Delete,
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
import {
  adminService,
  ApprovalRequest,
  RequestType,
  RequestStatus,
  Requester,
} from "@/services/admin.service";
import { useAdminStore, useAuthStore } from "@/stores";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

 

/** Bộ lọc hiển thị */
interface Filters {
  search: string;
  status: string;
  type: string;
  sortBy: string;
}

/** Cấu hình hiển thị cho từng loại đơn */
const requestTypeConfig: Record<
  RequestType,
  { label: string; icon: typeof FileText; color: string; bgColor: string }
> = {
  UPDATE_PARKING_LOT: {
    label: "Cập nhật bãi đỗ",
    icon: Edit3,
    color: "text-violet-600",
    bgColor: "bg-violet-100",
  },
  PAYMENT: {
    label: "Thanh toán",
    icon: Send,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  BECOME_OWNER: {
    label: "Nâng cấp tài khoản",
    icon: ArrowUpCircle,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  WITHDRAW_FUND: {
    label: "Rút tiền",
    icon: Download,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  REFUND: {
    label: "Hoàn tiền",
    icon: AlertTriangle,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  NEW_PARKING_LOT: {
    label: "Bãi đỗ mới",
    icon: Building2,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
  OTHER: {
    label: "Yêu cầu khác",
    icon: FileText,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
};

/** Cấu hình trạng thái đơn */
const statusConfig: Record<RequestStatus, { label: string; className: string; dot: string }> = {
  PENDING: {
    label: "Chờ xử lý",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    dot: "bg-yellow-50",
  },
  PROCESSING: {
    label: "Đang xử lý",
    className: "bg-blue-100 text-blue-800 border-blue-200",
    dot: "bg-blue-500",
  },
  APPROVED: {
    label: "Đã duyệt",
    className: "bg-green-100 text-green-800 border-green-200",
    dot: "bg-green-500",
  },
  REJECTED: {
    label: "Đã từ chối",
    className: "bg-red-100 text-red-800 border-red-200",
    dot: "bg-red-500",
  },
};

/** Nhãn vai trò người gửi */
const roleLabels: Record<string, string> = {
  user: "Khách hàng",
  owner: "Chủ bãi đỗ",
};

// ─── Hàm tiện ích ─────────────────────────────────────────────────────────────

/** Định dạng ngày theo chuẩn Việt Nam */
const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

/** Định dạng ngày giờ đầy đủ */
const formatDateTime = (dateString: string) =>
  new Date(dateString).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/** Định dạng tiền tệ VND */
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

/** Lấy chữ cái đầu cho avatar */
const getInitials = (name: string) => {
  const parts = name.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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

/** Hiển thị thời gian tương đối */
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

export default function ApprovalsPage() {
  const {
    approvalRequests: requests,
    isApprovalsLoading: loading,
    approvalsError: error,
    setApprovalRequests: setRequests,
    setApprovalsLoading,
    setApprovalsError,
  } = useAdminStore();

  /** Bộ lọc */
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    type: "",
    sortBy: "newest",
  });

  /** Đơn đang xem chi tiết */
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  /** Ghi chú admin khi duyệt/từ chối */
  const [adminNote, setAdminNote] = useState("");

  /** ID của đơn đang được xử lý (để hiện loading) */
  const [actingRequestId, setActingRequestId] = useState<string | null>(null);

  /** Lấy thông tin user hiện tại (admin) */
  const { user } = useAuthStore();
  const adminId = user?.id || "";

  // ── Gọi API lấy danh sách đơn yêu cầu ─────────────────────────────────────

  const fetchRequests = async () => {
    try {
      setApprovalsLoading(true);

      const [statsRequest , requests] = await Promise.all([
        adminService.getStatsApprovalRequests(),
        adminService.getApprovalRequests()
      ])

      
        setRequests(requests);
    } catch (err) {
      console.error("Lỗi khi tải danh sách đơn:", err);
      setApprovalsError(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setApprovalsLoading(false);
    }
  };

  /** Tải dữ liệu khi component được mount */
  useEffect(() => {
    if (Array.isArray(requests) && requests.length === 0) {
      fetchRequests();
    }
  }, []);

  // ── Lọc & sắp xếp danh sách ────────────────────────────────────────────────

  const filteredRequests = useMemo(() => {
    if (!Array.isArray(requests)) return [];
    let result = [...requests];

    // Tìm kiếm theo tên người gửi, tiêu đề, mô tả
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (r: ApprovalRequest) =>
          (r.requester?.name || "").toLowerCase().includes(term) ||
          (r.title || "").toLowerCase().includes(term) ||
          (r.description || "").toLowerCase().includes(term) ||
          (r.requester?.email || "").toLowerCase().includes(term)
      );
    }

    // Lọc theo trạng thái
    if (filters.status) {
      result = result.filter((r: ApprovalRequest) => r.status === filters.status);
    }

    // Lọc theo loại đơn
    if (filters.type) {
      result = result.filter((r: ApprovalRequest) => r.type === filters.type);
    }

    // Sắp xếp
    switch (filters.sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
    }

    return result;
  }, [requests, filters]);

  // ── Thống kê ────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r: ApprovalRequest) => r.status === "PENDING").length;
    const approved = requests.filter((r: ApprovalRequest) => r.status === "APPROVED").length;
    const rejected = requests.filter((r: ApprovalRequest) => r.status === "REJECTED").length;
    return { total, pending, approved, rejected };
  }, [requests]);

  // ── Xử lý sự kiện ──────────────────────────────────────────────────────────

  /** Cập nhật bộ lọc */
  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  /** Xóa tất cả bộ lọc */
  const clearFilters = () => {
    setFilters({ search: "", status: "", type: "", sortBy: "newest" });
  };

  /** Mở dialog xem chi tiết */
  const openDetail = (request: ApprovalRequest) => {
    setSelectedRequest(request);
    setAdminNote(request.adminNote || "");
    setDetailOpen(true);
  };

  /** Duyệt đơn yêu cầu */
  const handleApprove = async (request: ApprovalRequest) => {
    if (actingRequestId) return;
    
    setActingRequestId(request.id);
    try {
      console.log(`Duyệt đơn ${request.id} với ghi chú: ${adminNote}`);
      
      // Gọi API duyệt đơn
      await adminService.approveRequest(request.id, adminId, adminNote);
      
      const updatedRequests = requests.map((r: ApprovalRequest) =>
        r.id === request.id ? { ...r, status: "APPROVED" as RequestStatus, adminNote, updatedAt: new Date().toISOString() } : r
      );
      setRequests(updatedRequests);
      
      if (selectedRequest && selectedRequest.id === request.id) {
        setSelectedRequest({ ...selectedRequest, status: "APPROVED", adminNote, updatedAt: new Date().toISOString() });
      }

      toast.success("Duyệt đơn yêu cầu thành công");
    } catch (err: any) {
      console.error("Lỗi khi duyệt đơn:", err);
      toast.error(err.message || "Không thể duyệt đơn yêu cầu");
    } finally {
      setActingRequestId(null);
    }
  };

  /** Từ chối đơn yêu cầu */
  const handleReject = async (request: ApprovalRequest) => {
    if (actingRequestId) return;

    setActingRequestId(request.id);
    try {
      console.log(`Từ chối đơn ${request.id} với ghi chú: ${adminNote}`);
      
      // Gọi API từ chối đơn
      await adminService.rejectRequest(request.id, adminId, adminNote);
      
      const updatedRequests = requests.map((r: ApprovalRequest) =>
        r.id === request.id ? { ...r, status: "REJECTED" as RequestStatus, adminNote, updatedAt: new Date().toISOString() } : r
      );
      setRequests(updatedRequests);
      
      if (selectedRequest && selectedRequest.id === request.id) {
        setSelectedRequest({ ...selectedRequest, status: "REJECTED", adminNote, updatedAt: new Date().toISOString() });
      }

      toast.success("Đã từ chối đơn yêu cầu");
    } catch (err: any) {
      console.error("Lỗi khi từ chối đơn:", err);
      toast.error(err.message || "Không thể từ chối đơn yêu cầu");
    } finally {
      setActingRequestId(null);
    }
  };

  /** Chuyển đơn sang trạng thái "đang xử lý" */
  const handleMarkProcessing = async (request: ApprovalRequest) => {
    console.log(`Chuyển đơn ${request.id} sang đang xử lý`);
    // TODO: Gọi API cập nhật trạng thái
    const updatedRequests = requests.map((r: ApprovalRequest) =>
      r.id === request.id ? { ...r, status: "PROCESSING" as RequestStatus, updatedAt: new Date().toISOString() } : r
    );
    setRequests(updatedRequests);
    if (selectedRequest && selectedRequest.id === request.id) {
      setSelectedRequest({ ...selectedRequest, status: "PROCESSING", updatedAt: new Date().toISOString() });
    }
  };

  // ── Cấu hình thẻ thống kê ──────────────────────────────────────────────────

  const statCards = [
    {
      title: "Tổng đơn",
      value: stats.total,
      icon: ClipboardList,
      gradient: "from-blue-500 to-indigo-600",
      bgTint: "from-blue-50 to-indigo-50",
      border: "border-blue-100",
    },
    {
      title: "Chờ xử lý",
      value: stats.pending,
      icon: Clock,
      gradient: "from-yellow-500 to-orange-500",
      bgTint: "from-yellow-50 to-orange-50",
      border: "border-yellow-100",
    },
    {
      title: "Từ chối",
      value: stats.rejected,
      icon: X,
      gradient: "from-red-500 to-rose-600",
      bgTint: "from-red-50 to-rose-50",
      border: "border-red-100",
    },
    {
      title: "Đã duyệt",
      value: stats.approved,
      icon: CheckCircle,
      gradient: "from-emerald-500 to-teal-600",
      bgTint: "from-emerald-50 to-teal-50",
      border: "border-emerald-100",
    },
  ];

  // ── Trạng thái đang tải ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải danh sách đơn yêu cầu...</p>
        </div>
      </div>
    );
  }

  // ── Giao diện chính ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Tiêu đề trang ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl px-8 py-6 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <ClipboardList className="w-6 h-6" />
            Quản lý Đơn yêu cầu
          </h1>
          <p className="text-blue-200/70 mt-1 text-sm">
            Tiếp nhận và xử lý đơn từ người dùng & chủ bãi đỗ
          </p>
          {error && <p className="text-red-300 text-xs mt-1">Lỗi kết nối: {error}</p>}
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Button onClick={fetchRequests} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm shadow-none gap-2">
            <RefreshCw size={16} />
            Làm mới
          </Button>
          <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm shadow-none gap-2">
            <Download size={16} />
            Xuất Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Card 
              key={i} 
              className={`bg-gradient-to-br ${card.bgTint} ${card.border} border hover:shadow-md transition-all duration-300 overflow-hidden relative shadow-sm`}
            >
              <div
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.gradient} opacity-[0.04] rounded-full -translate-y-10 translate-x-10`}
              />
              <CardContent className="p-5 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                  </div>
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg shadow-black/10`}>
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
              placeholder="Tìm theo tên người gửi, tiêu đề, email..."
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
              <SelectItem value="PENDING">Chờ xử lý</SelectItem>
              <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
              <SelectItem value="APPROVED">Đã duyệt</SelectItem>
              <SelectItem value="REJECTED">Đã từ chối</SelectItem>
            </SelectContent>
          </Select>

          {/* Lọc loại đơn */}
          <Select value={filters.type || "all"} onValueChange={(val) => handleFilterChange("type", val === "all" ? "" : val)}>
            <SelectTrigger className="h-11 min-w-[180px] border-gray-200 bg-slate-50 text-slate-900">
              <SelectValue placeholder="Tất cả loại đơn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại đơn</SelectItem>
              <SelectItem value="UPDATE_PARKING_LOT">Cập nhật bãi đỗ</SelectItem>
              <SelectItem value="PAYMENT">Thanh toán</SelectItem>
              <SelectItem value="BECOME_OWNER">Nâng cấp tài khoản</SelectItem>
              <SelectItem value="WITHDRAW_FUND">Rút tiền</SelectItem>
              <SelectItem value="REFUND">Hoàn tiền</SelectItem>
              <SelectItem value="NEW_PARKING_LOT">Bãi đỗ mới</SelectItem>
              <SelectItem value="OTHER">Yêu cầu khác</SelectItem>
            </SelectContent>
          </Select>

          {/* Sắp xếp */}
          <Select value={filters.sortBy} onValueChange={(val) => handleFilterChange("sortBy", val)}>
            <SelectTrigger className="h-11 min-w-[140px] border-gray-200 bg-slate-50 text-slate-900">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mới nhất</SelectItem>
              <SelectItem value="oldest">Cũ nhất</SelectItem>
            </SelectContent>
          </Select>
          {/* Nút xóa bộ lọc */}
          {(filters.search || filters.status || filters.type || filters.sortBy !== "newest") && (
            <Button variant="ghost" onClick={clearFilters} className="h-11 text-gray-500 hover:text-gray-700">
              <X size={16} className="mr-1" />
              Xóa lọc
            </Button>
          )}
        </div>
      </div>

      {/* ── Danh sách đơn yêu cầu (dạng thẻ) ─────────────────────────────── */}
      <div className="space-y-3">
        {filteredRequests.map((request) => {
          const typeConf = requestTypeConfig[request.type];
          const statusConf = statusConfig[request.status];
          const TypeIcon = typeConf.icon;

          return (
            <div
              key={request.id}
              onClick={() => openDetail(request)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
            >
              <div className="flex flex-col sm:flex-row gap-4">

                {/* Icon loại đơn */}
                <div className={`w-12 h-12 rounded-xl ${typeConf.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <TypeIcon className={`w-6 h-6 ${typeConf.color}`} />
                </div>

                {/* Nội dung chính */}
                <div className="flex-1 min-w-0">
                  {/* Dòng 1: Tiêu đề + badges */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1.5">
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                      {request.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Badge loại đơn */}
                      <Badge variant="outline" className={`text-xs ${typeConf.bgColor} ${typeConf.color} border-0`}>
                        {typeConf.label}
                      </Badge>
                      {/* Badge trạng thái */}
                      <Badge variant="outline" className={`text-xs font-medium ${statusConf.className}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot} mr-1.5 inline-block`} />
                        {statusConf.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Dòng 2: Mô tả ngắn */}
                  <p className="text-sm text-gray-500 line-clamp-1 mb-2">{request.description}</p>

                  {/* Dòng 3: Thông tin meta */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                    {/* Người gửi */}
                    <span className="flex items-center gap-1">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${getAvatarColor(request.requester.id)} flex items-center justify-center`}>
                        <span className="text-white text-[8px] font-bold">{getInitials(request.requester.name || request.requester.email)}</span>
                      </div>
                      <span className="font-medium text-gray-600 truncate max-w-[120px]">{request.requester.name || request.requester.email}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 flex-shrink-0">
                        {request.requester.role ? roleLabels[request.requester.role] : "Người dùng"}
                      </Badge>
                    </span>

                    {/* Bãi đỗ liên quan */}
                    {request.relatedParkingLot && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {request.relatedParkingLot.name}
                      </span>
                    )}

                    {/* Số tiền (cho đơn hoàn tiền) */}
                    {request.amount && (
                      <span className="flex items-center gap-1 font-medium text-amber-600">
                        {formatCurrency(request.amount)}
                      </span>
                    )}

                    {/* Thời gian gửi */}
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {timeAgo(request.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Menu hành động */}
                <div className="flex items-start flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => openDetail(request)}>
                        <Eye size={16} className="mr-2" />
                        Xem chi tiết
                      </DropdownMenuItem>
                       {/* Chỉ hiện các nút hành động khi đơn chưa xử lý xong */}
                      {(request.status === "PENDING" || request.status === "PROCESSING") && (
                        <>
                          <DropdownMenuSeparator />
                          {request.status === "PENDING" && (
                            <DropdownMenuItem onClick={() => handleMarkProcessing(request)} className="text-blue-600">
                              <RefreshCw size={16} className="mr-2" />
                              Đánh dấu đang xử lý
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => { handleApprove(request); }} 
                            className="text-green-600"
                            disabled={actingRequestId === request.id}
                          >
                            {actingRequestId === request.id ? (
                              <Loader2 size={16} className="mr-2 animate-spin" />
                            ) : (
                              <CheckCircle size={16} className="mr-2" />
                            )}
                            Duyệt đơn
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => { handleReject(request); }} 
                            className="text-red-600"
                            disabled={actingRequestId === request.id}
                          >
                            {actingRequestId === request.id ? (
                              <Loader2 size={16} className="mr-2 animate-spin" />
                            ) : (
                              <XCircle size={16} className="mr-2" />
                            )}
                            Từ chối
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trạng thái trống */}
      {filteredRequests.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-16 text-center">
          <div className="bg-gray-100 rounded-full w-20 h-20 mx-auto mb-5 flex items-center justify-center">
            <ClipboardList className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy đơn yêu cầu nào</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
          </p>
          <Button onClick={clearFilters} variant="outline">
            Xóa tất cả bộ lọc
          </Button>
        </div>
      )}

      {/* ── Dialog chi tiết đơn yêu cầu ────────────────────────────────────── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Chi tiết đơn yêu cầu</DialogTitle>
          </DialogHeader>

          {selectedRequest && (() => {
            const typeConf = requestTypeConfig[selectedRequest.type];
            const statusConf = statusConfig[selectedRequest.status];
            const TypeIcon = typeConf.icon;
            const canAction = selectedRequest.status === "PENDING" || selectedRequest.status === "PROCESSING";

            return (
              <div className="space-y-5 mt-2">

                {/* Phần đầu — Loại đơn + trạng thái */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
                  <div className={`w-14 h-14 rounded-xl ${typeConf.bgColor} flex items-center justify-center`}>
                    <TypeIcon className={`w-7 h-7 ${typeConf.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{selectedRequest.title}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className={`text-xs ${typeConf.bgColor} ${typeConf.color} border-0`}>
                        {typeConf.label}
                      </Badge>
                      <Badge variant="outline" className={`text-xs font-medium ${statusConf.className}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot} mr-1.5 inline-block`} />
                        {statusConf.label}
                      </Badge>
                    </div>
                  </div>
                </div>

                 <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Người gửi đơn</h4>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(selectedRequest.requester.id)} flex items-center justify-center shadow-sm`}>
                      <span className="text-white text-sm font-semibold">{getInitials(selectedRequest.requester.name || selectedRequest.requester.email)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{selectedRequest.requester.name || selectedRequest.requester.email}</p>
                        <Badge variant="outline" className="text-xs">{selectedRequest.requester.role ? roleLabels[selectedRequest.requester.role] : "Người dùng"}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Mail size={12} />{selectedRequest.requester.email}</span>
                        {selectedRequest.requester.phone && <span className="flex items-center gap-1"><Phone size={12} />{selectedRequest.requester.phone}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nội dung đơn */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Nội dung yêu cầu</h4>
                  <p className="text-sm text-gray-700 leading-relaxed bg-white border border-gray-100 rounded-lg p-4">
                    {selectedRequest.description}
                  </p>
                </div>

                {/* Thông tin bổ sung (bãi đỗ, giá trị thay đổi, số tiền) */}
                {(selectedRequest.relatedParkingLot || selectedRequest.oldValue || selectedRequest.amount) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Bãi đỗ liên quan */}
                    {selectedRequest.relatedParkingLot && (
                      <div className="flex items-center gap-3 p-3 bg-violet-50 rounded-lg">
                        <MapPin size={18} className="text-violet-500" />
                        <div>
                          <p className="text-xs text-violet-400">Bãi đỗ liên quan</p>
                          <p className="text-sm font-medium text-gray-900">{selectedRequest.relatedParkingLot.name}</p>
                          <p className="text-xs text-gray-500">{selectedRequest.relatedParkingLot.address}</p>
                        </div>
                      </div>
                    )}

                    {/* Số tiền hoàn */}
                    {selectedRequest.amount && (
                      <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                        <AlertTriangle size={18} className="text-amber-500" />
                        <div>
                          <p className="text-xs text-amber-400">Số tiền yêu cầu</p>
                          <p className="text-lg font-bold text-amber-700">{formatCurrency(selectedRequest.amount)}</p>
                        </div>
                      </div>
                    )}

                    {/* Giá trị thay đổi — cũ → mới */}
                    {selectedRequest.oldValue && selectedRequest.newValue && (
                      <div className="sm:col-span-2 p-3 bg-orange-50 rounded-lg">
                        <p className="text-xs text-orange-400 mb-2">Thay đổi</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 p-2 bg-white rounded border border-orange-200">
                            <p className="text-xs text-gray-400 mb-0.5">Hiện tại</p>
                            <p className="text-sm font-medium text-gray-900 line-through opacity-60">{selectedRequest.oldValue}</p>
                          </div>
                          <span className="text-orange-400 font-bold">→</span>
                          <div className="flex-1 p-2 bg-white rounded border border-green-200">
                            <p className="text-xs text-gray-400 mb-0.5">Mới</p>
                            <p className="text-sm font-medium text-green-700">{selectedRequest.newValue}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Ghi chú admin (nếu đã có) */}
                {selectedRequest.adminNote && !canAction && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <ShieldCheck size={14} />
                      Phản hồi từ Admin
                    </h4>
                    <p className="text-sm text-gray-700">{selectedRequest.adminNote}</p>
                  </div>
                )}

                {/* Ô nhập ghi chú admin (khi đơn đang chờ xử lý) */}
                {canAction && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Ghi chú xử lý (tuỳ chọn)
                    </h4>
                    <textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Nhập ghi chú hoặc lý do xử lý đơn..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm resize-none"
                    />
                  </div>
                )}

                {/* Thời gian */}
                <div className="flex items-center justify-between text-xs text-gray-400 px-1">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    Gửi lúc: {formatDateTime(selectedRequest.createdAt)}
                  </span>
                  {selectedRequest.updatedAt !== selectedRequest.createdAt && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      Cập nhật: {formatDateTime(selectedRequest.updatedAt)}
                    </span>
                  )}
                </div>

                {/* Nút hành động */}
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                  <Button variant="outline" onClick={() => setDetailOpen(false)}>
                    Đóng
                  </Button>

                  {canAction && (
                    <>
                      {/* Nút đánh dấu đang xử lý */}
                      {selectedRequest.status === "PENDING" && (
                        <Button
                          variant="outline"
                          className="border-blue-200 text-blue-600 hover:bg-blue-50"
                          onClick={() => handleMarkProcessing(selectedRequest)}
                        >
                          <RefreshCw size={16} className="mr-2" />
                          Đang xử lý
                        </Button>
                      )}

                      {/* Nút từ chối */}
                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => handleReject(selectedRequest)}
                        disabled={actingRequestId === selectedRequest.id}
                      >
                        {actingRequestId === selectedRequest.id ? (
                          <Loader2 size={16} className="mr-2 animate-spin" />
                        ) : (
                          <XCircle size={16} className="mr-2" />
                        )}
                        Từ chối
                      </Button>

                      {/* Nút duyệt */}
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApprove(selectedRequest)}
                        disabled={actingRequestId === selectedRequest.id}
                      >
                        {actingRequestId === selectedRequest.id ? (
                          <Loader2 size={16} className="mr-2 animate-spin" />
                        ) : (
                          <CheckCircle size={16} className="mr-2" />
                        )}
                        Duyệt đơn
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