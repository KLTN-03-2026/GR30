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

/** Các loại đơn yêu cầu */
type RequestType =
  | "upgrade_to_owner"      // Nâng cấp tài khoản user lên owner
  | "cancel_parking_lot"    // Hủy bãi đỗ xe
  | "rename_parking_lot"    // Đổi tên bãi đỗ xe
  | "update_parking_info"   // Cập nhật thông tin bãi đỗ
  | "refund_request"        // Yêu cầu hoàn tiền
  | "report_issue"          // Báo cáo sự cố
  | "other";                // Yêu cầu khác

/** Trạng thái xử lý đơn */
type RequestStatus = "pending" | "approved" | "rejected" | "processing";

/** Thông tin người gửi đơn */
interface Requester {
  _id: string;
  userName: string;
  email: string;
  phoneNumber: string;
  role: "user" | "owner";
}

/** Chi tiết đơn yêu cầu */
interface ApprovalRequest {
  _id: string;
  requester: Requester;
  type: RequestType;
  status: RequestStatus;
  title: string;
  description: string;
  attachments?: string[];
  adminNote?: string;
  // Thông tin bổ sung cho các loại đơn cụ thể
  relatedParkingLot?: {
    _id: string;
    name: string;
    address: string;
  };
  newValue?: string;       // Giá trị mới (vd: tên mới của bãi đỗ)
  oldValue?: string;       // Giá trị cũ
  amount?: number;         // Số tiền (cho hoàn tiền)
  createdAt: string;
  updatedAt: string;
}

/** Bộ lọc hiển thị */
interface Filters {
  search: string;
  status: string;
  type: string;
  sortBy: string;
}

// ─── Hằng số cấu hình ────────────────────────────────────────────────────────

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/** Cấu hình hiển thị cho từng loại đơn */
const requestTypeConfig: Record<RequestType, { label: string; icon: typeof FileText; color: string; bgColor: string }> = {
  upgrade_to_owner: {
    label: "Nâng cấp tài khoản",
    icon: ArrowUpCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  cancel_parking_lot: {
    label: "Hủy bãi đỗ xe",
    icon: Trash2,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  rename_parking_lot: {
    label: "Đổi tên bãi đỗ",
    icon: Edit3,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  update_parking_info: {
    label: "Cập nhật thông tin",
    icon: Building2,
    color: "text-violet-600",
    bgColor: "bg-violet-100",
  },
  refund_request: {
    label: "Hoàn tiền",
    icon: AlertTriangle,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  report_issue: {
    label: "Báo cáo sự cố",
    icon: AlertTriangle,
    color: "text-pink-600",
    bgColor: "bg-pink-100",
  },
  other: {
    label: "Yêu cầu khác",
    icon: FileText,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
};

/** Cấu hình trạng thái đơn */
const statusConfig: Record<RequestStatus, { label: string; className: string; dot: string }> = {
  pending: {
    label: "Chờ xử lý",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    dot: "bg-yellow-500",
  },
  processing: {
    label: "Đang xử lý",
    className: "bg-blue-100 text-blue-800 border-blue-200",
    dot: "bg-blue-500",
  },
  approved: {
    label: "Đã duyệt",
    className: "bg-green-100 text-green-800 border-green-200",
    dot: "bg-green-500",
  },
  rejected: {
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

// ─── Dữ liệu mẫu (mock data) ────────────────────────────────────────────────

const mockRequests: ApprovalRequest[] = [
  {
    _id: "req1",
    requester: { _id: "u1", userName: "Nguyễn Văn Anh", email: "nguyenvananh@gmail.com", phoneNumber: "0901 234 567", role: "user" },
    type: "upgrade_to_owner",
    status: "pending",
    title: "Đăng ký trở thành chủ bãi đỗ",
    description: "Tôi muốn đăng ký trở thành chủ bãi đỗ xe. Tôi hiện có 1 bãi đỗ tại địa chỉ 123 Nguyễn Huệ, Quận 1, TP.HCM với sức chứa khoảng 50 xe. Tôi đã chuẩn bị đầy đủ giấy phép kinh doanh và giấy tờ liên quan.",
    createdAt: "2026-03-13T08:30:00Z",
    updatedAt: "2026-03-13T08:30:00Z",
  },
  {
    _id: "req2",
    requester: { _id: "o1", userName: "Trần Quốc Bảo", email: "tranquocbao@gmail.com", phoneNumber: "0901 111 222", role: "owner" },
    type: "cancel_parking_lot",
    status: "pending",
    title: "Yêu cầu hủy bãi đỗ xe Thảo Điền",
    description: "Do hợp đồng thuê mặt bằng đã hết hạn và không được gia hạn, tôi muốn xin hủy bãi đỗ xe 'Bãi đỗ xe Thảo Điền' tại 12 Quốc Hương, Q2. Hiện tại bãi xe này không còn hoạt động.",
    relatedParkingLot: { _id: "pl3", name: "Bãi đỗ xe Thảo Điền", address: "12 Quốc Hương, Q2" },
    createdAt: "2026-03-12T14:00:00Z",
    updatedAt: "2026-03-12T14:00:00Z",
  },
  {
    _id: "req3",
    requester: { _id: "o2", userName: "Nguyễn Thị Hương", email: "nguyenthihuong@gmail.com", phoneNumber: "0938 333 444", role: "owner" },
    type: "rename_parking_lot",
    status: "processing",
    title: "Đổi tên bãi đỗ xe",
    description: "Tôi muốn đổi tên bãi đỗ từ 'Bãi đỗ xe Lotte Mart' thành 'Bãi đỗ xe Lotte Premium Q7' để phù hợp với thương hiệu mới sau khi nâng cấp dịch vụ.",
    relatedParkingLot: { _id: "pl5", name: "Bãi đỗ xe Lotte Mart", address: "469 Nguyễn Hữu Thọ, Q7" },
    oldValue: "Bãi đỗ xe Lotte Mart",
    newValue: "Bãi đỗ xe Lotte Premium Q7",
    createdAt: "2026-03-11T10:15:00Z",
    updatedAt: "2026-03-12T09:00:00Z",
  },
  {
    _id: "req4",
    requester: { _id: "u3", userName: "Phạm Minh Châu", email: "phamminhchau@yahoo.com", phoneNumber: "0912 345 678", role: "user" },
    type: "refund_request",
    status: "pending",
    title: "Yêu cầu hoàn tiền booking #BK20260310",
    description: "Tôi đã đặt chỗ tại bãi đỗ xe Quận 10 nhưng khi đến nơi thì bãi xe đã đóng cửa. Tôi muốn được hoàn lại 150.000đ cho lần đặt chỗ này.",
    relatedParkingLot: { _id: "pl6", name: "Bãi đỗ xe Quận 10", address: "200 CMT8, Q10" },
    amount: 150000,
    createdAt: "2026-03-10T16:45:00Z",
    updatedAt: "2026-03-10T16:45:00Z",
  },
  {
    _id: "req5",
    requester: { _id: "o4", userName: "Phạm Đức Duy", email: "phamducduy@gmail.com", phoneNumber: "0976 777 888", role: "owner" },
    type: "update_parking_info",
    status: "approved",
    title: "Cập nhật số chỗ đỗ ParkSmart Bình Thạnh",
    description: "Sau khi mở rộng khu vực đỗ xe tầng 3, tổng số chỗ đỗ tăng từ 75 lên 120 chỗ. Xin cập nhật thông tin trên hệ thống.",
    relatedParkingLot: { _id: "pl11", name: "ParkSmart Bình Thạnh", address: "300 Xô Viết Nghệ Tĩnh, BT" },
    oldValue: "75 chỗ",
    newValue: "120 chỗ",
    adminNote: "Đã xác minh và cập nhật số chỗ đỗ trên hệ thống.",
    createdAt: "2026-03-08T11:20:00Z",
    updatedAt: "2026-03-09T14:30:00Z",
  },
  {
    _id: "req6",
    requester: { _id: "u5", userName: "Vũ Thị Thu Hảo", email: "vuthithuhao@gmail.com", phoneNumber: "0976 543 210", role: "user" },
    type: "report_issue",
    status: "rejected",
    title: "Phản ánh bãi đỗ xe không đúng mô tả",
    description: "Bãi đỗ xe Vạn Hạnh Mall ghi có mái che nhưng thực tế khu vực B không có mái che, xe tôi bị nắng nóng suốt 4 tiếng.",
    relatedParkingLot: { _id: "pl13", name: "Bãi đỗ xe Vạn Hạnh Mall", address: "11 Sư Vạn Hạnh, Q10" },
    adminNote: "Đã liên hệ chủ bãi và xác nhận khu vực B đang trong quá trình lắp mái che. Vấn đề sẽ được khắc phục trong 2 tuần.",
    createdAt: "2026-03-07T09:00:00Z",
    updatedAt: "2026-03-08T10:00:00Z",
  },
  {
    _id: "req7",
    requester: { _id: "u6", userName: "Đỗ Quang Khải", email: "doquangkhai@gmail.com", phoneNumber: "0889 123 456", role: "user" },
    type: "upgrade_to_owner",
    status: "approved",
    title: "Đăng ký làm chủ bãi đỗ xe",
    description: "Tôi có mặt bằng 500m2 tại đường Nguyễn Thị Minh Khai, Q1 và muốn đăng ký làm chủ bãi đỗ xe trên nền tảng GoPark.",
    adminNote: "Đã xác minh giấy phép kinh doanh và mặt bằng. Chấp thuận.",
    createdAt: "2026-03-05T13:00:00Z",
    updatedAt: "2026-03-06T16:00:00Z",
  },
  {
    _id: "req8",
    requester: { _id: "o5", userName: "Hoàng Minh Tuấn", email: "hoangminhtuan@outlook.com", phoneNumber: "0889 999 000", role: "owner" },
    type: "other",
    status: "pending",
    title: "Yêu cầu hiển thị ưu tiên trên app",
    description: "Tôi muốn đăng ký gói quảng cáo để bãi đỗ xe Bitexco được hiển thị ưu tiên trên ứng dụng GoPark trong tháng 4/2026.",
    relatedParkingLot: { _id: "pl12", name: "Bãi đỗ xe Bitexco", address: "2 Hải Triều, Q1" },
    createdAt: "2026-03-13T07:00:00Z",
    updatedAt: "2026-03-13T07:00:00Z",
  },
];

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
  // ── Trạng thái (state) ──────────────────────────────────────────────────────
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // ── Gọi API lấy danh sách đơn yêu cầu ─────────────────────────────────────

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      setUsingMockData(false);

      const token = localStorage.getItem("authToken") || localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/v1/admin/approvals`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`Lỗi HTTP! Mã: ${response.status}`);

      const result = await response.json();
      if (result.status === "success") {
        setRequests(result.data.data || result.data);
      } else {
        throw new Error("Không thể tải dữ liệu");
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách đơn:", err);
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
      // Dùng dữ liệu mẫu khi API chưa sẵn sàng
      setUsingMockData(true);
      setRequests(mockRequests);
    } finally {
      setLoading(false);
    }
  };

  /** Tải dữ liệu khi component được mount */
  useEffect(() => {
    fetchRequests();
  }, []);

  // ── Lọc & sắp xếp danh sách ────────────────────────────────────────────────

  const filteredRequests = useMemo(() => {
    let result = [...requests];

    // Tìm kiếm theo tên người gửi, tiêu đề, mô tả
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.requester.userName.toLowerCase().includes(term) ||
          r.title.toLowerCase().includes(term) ||
          r.description.toLowerCase().includes(term) ||
          r.requester.email.toLowerCase().includes(term)
      );
    }

    // Lọc theo trạng thái
    if (filters.status) {
      result = result.filter((r) => r.status === filters.status);
    }

    // Lọc theo loại đơn
    if (filters.type) {
      result = result.filter((r) => r.type === filters.type);
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
    const pending = requests.filter((r) => r.status === "pending").length;
    const processing = requests.filter((r) => r.status === "processing").length;
    const approved = requests.filter((r) => r.status === "approved").length;
    const rejected = requests.filter((r) => r.status === "rejected").length;
    return { total, pending, processing, approved, rejected };
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
    console.log(`Duyệt đơn ${request._id} với ghi chú: ${adminNote}`);
    // TODO: Gọi API duyệt đơn
    setRequests((prev) =>
      prev.map((r) =>
        r._id === request._id ? { ...r, status: "approved" as RequestStatus, adminNote, updatedAt: new Date().toISOString() } : r
      )
    );
    if (selectedRequest && selectedRequest._id === request._id) {
      setSelectedRequest((prev) => prev ? { ...prev, status: "approved", adminNote, updatedAt: new Date().toISOString() } : prev);
    }
  };

  /** Từ chối đơn yêu cầu */
  const handleReject = async (request: ApprovalRequest) => {
    console.log(`Từ chối đơn ${request._id} với ghi chú: ${adminNote}`);
    // TODO: Gọi API từ chối đơn
    setRequests((prev) =>
      prev.map((r) =>
        r._id === request._id ? { ...r, status: "rejected" as RequestStatus, adminNote, updatedAt: new Date().toISOString() } : r
      )
    );
    if (selectedRequest && selectedRequest._id === request._id) {
      setSelectedRequest((prev) => prev ? { ...prev, status: "rejected", adminNote, updatedAt: new Date().toISOString() } : prev);
    }
  };

  /** Chuyển đơn sang trạng thái "đang xử lý" */
  const handleMarkProcessing = async (request: ApprovalRequest) => {
    console.log(`Chuyển đơn ${request._id} sang đang xử lý`);
    // TODO: Gọi API cập nhật trạng thái
    setRequests((prev) =>
      prev.map((r) =>
        r._id === request._id ? { ...r, status: "processing" as RequestStatus, updatedAt: new Date().toISOString() } : r
      )
    );
    if (selectedRequest && selectedRequest._id === request._id) {
      setSelectedRequest((prev) => prev ? { ...prev, status: "processing", updatedAt: new Date().toISOString() } : prev);
    }
  };

  // ── Cấu hình thẻ thống kê ──────────────────────────────────────────────────

  const statCards = [
    {
      title: "Tổng đơn",
      value: stats.total,
      icon: ClipboardList,
      color: "bg-blue-500",
    },
    {
      title: "Chờ xử lý",
      value: stats.pending,
      icon: Clock,
      color: "bg-yellow-500",
    },
    {
      title: "Đang xử lý",
      value: stats.processing,
      icon: RefreshCw,
      color: "bg-indigo-500",
    },
    {
      title: "Đã duyệt",
      value: stats.approved,
      icon: CheckCircle,
      color: "bg-green-500",
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
            {usingMockData && (
              <span className="ml-2 text-orange-300 text-xs">(Dữ liệu mẫu)</span>
            )}
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
              placeholder="Tìm theo tên người gửi, tiêu đề, email..."
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
            <option value="pending">Chờ xử lý</option>
            <option value="processing">Đang xử lý</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Đã từ chối</option>
          </select>
          {/* Lọc loại đơn */}
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className="h-11 px-4 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm min-w-[180px]"
          >
            <option value="">Tất cả loại đơn</option>
            <option value="upgrade_to_owner">Nâng cấp tài khoản</option>
            <option value="cancel_parking_lot">Hủy bãi đỗ xe</option>
            <option value="rename_parking_lot">Đổi tên bãi đỗ</option>
            <option value="update_parking_info">Cập nhật thông tin</option>
            <option value="refund_request">Hoàn tiền</option>
            <option value="report_issue">Báo cáo sự cố</option>
            <option value="other">Yêu cầu khác</option>
          </select>
          {/* Sắp xếp */}
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="h-11 px-4 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm min-w-[140px]"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
          </select>
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
              key={request._id}
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
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${getAvatarColor(request.requester._id)} flex items-center justify-center`}>
                        <span className="text-white text-[8px] font-bold">{getInitials(request.requester.userName)}</span>
                      </div>
                      <span className="font-medium text-gray-600">{request.requester.userName}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                        {roleLabels[request.requester.role]}
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
                      {(request.status === "pending" || request.status === "processing") && (
                        <>
                          <DropdownMenuSeparator />
                          {request.status === "pending" && (
                            <DropdownMenuItem onClick={() => handleMarkProcessing(request)} className="text-blue-600">
                              <RefreshCw size={16} className="mr-2" />
                              Đánh dấu đang xử lý
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => { openDetail(request); }} className="text-green-600">
                            <CheckCircle size={16} className="mr-2" />
                            Duyệt đơn
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { openDetail(request); }} className="text-red-600">
                            <XCircle size={16} className="mr-2" />
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
            const canAction = selectedRequest.status === "pending" || selectedRequest.status === "processing";

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

                {/* Thông tin người gửi */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Người gửi đơn</h4>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(selectedRequest.requester._id)} flex items-center justify-center shadow-sm`}>
                      <span className="text-white text-sm font-semibold">{getInitials(selectedRequest.requester.userName)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{selectedRequest.requester.userName}</p>
                        <Badge variant="outline" className="text-xs">{roleLabels[selectedRequest.requester.role]}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Mail size={12} />{selectedRequest.requester.email}</span>
                        <span className="flex items-center gap-1"><Phone size={12} />{selectedRequest.requester.phoneNumber}</span>
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
                      {selectedRequest.status === "pending" && (
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
                      >
                        <XCircle size={16} className="mr-2" />
                        Từ chối
                      </Button>

                      {/* Nút duyệt */}
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApprove(selectedRequest)}
                      >
                        <CheckCircle size={16} className="mr-2" />
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