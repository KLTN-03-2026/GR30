"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  BellPlus,
  Send,
  Search,
  Filter,
  RefreshCw,
  Users,
  User,
  Globe,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  ChevronDown,
  X,
  Plus,
  Megaphone,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationStore, SentNotification, NotificationType, TargetType, NotificationStatus } from "@/stores/notification.store";
import { notificationService } from "@/services/notification.service";
import { userService, User as ApiUser } from "@/services/userService";

interface UserSelectItem {
  id: string;
  name: string;
  email: string;
  role: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const typeConfig: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
  PROMOTIONAL: { label: "Khuyến mãi", color: "text-purple-700", bgColor: "bg-purple-50 border-purple-200", icon: "🎉" },
  PROMOTION: { label: "Khuyến mãi", color: "text-purple-700", bgColor: "bg-purple-50 border-purple-200", icon: "🎉" },
  ALERT: { label: "Cảnh báo", color: "text-amber-700", bgColor: "bg-amber-50 border-amber-200", icon: "⚠️" },
  REMINDER: { label: "Nhắc nhở", color: "text-blue-700", bgColor: "bg-blue-50 border-blue-200", icon: "⏰" },
  SYSTEM: { label: "Hệ thống", color: "text-slate-700", bgColor: "bg-slate-50 border-slate-200", icon: "⚙️" },
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  SENT: { label: "Đã gửi", color: "text-emerald-700", bg: "bg-emerald-100" },
  sent: { label: "Đã gửi", color: "text-emerald-700", bg: "bg-emerald-100" },
  SCHEDULED: { label: "Đã lên lịch", color: "text-blue-700", bg: "bg-blue-100" },
  scheduled: { label: "Đã lên lịch", color: "text-blue-700", bg: "bg-blue-100" },
  DRAFT: { label: "Bản nháp", color: "text-gray-700", bg: "bg-gray-100" },
  draft: { label: "Bản nháp", color: "text-gray-700", bg: "bg-gray-100" },
  FAILED: { label: "Thất bại", color: "text-red-700", bg: "bg-red-100" },
  failed: { label: "Thất bại", color: "text-red-700", bg: "bg-red-100" },
  "Đã gửi": { label: "Đã gửi", color: "text-emerald-700", bg: "bg-emerald-100" },
};


function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}


// ─── Component ────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { accessToken } = useAuthStore();
  const {
    notifications,
    setNotifications,
    isLoading: loading,
    setLoading,
    error: storeError,
    setError,
  } = useNotificationStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterTarget, setFilterTarget] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const [filteredNotifications, setFilteredNotifications] = useState<SentNotification[]>([]);

  // Create notification form
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<SentNotification | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "SYSTEM" as NotificationType,
    targetType: "all" as TargetType,
    targetRole: "all",
    selectedUsers: [] as string[],
  });
  const [userSearch, setUserSearch] = useState("");
  const [availableUsers, setAvailableUsers] = useState<UserSelectItem[]>([]);
  const [sending, setSending] = useState(false);

  // ── Fetch Users ───────────────────────────────────────────────────────────
  const fetchUsers = async () => {
    try {
      const users = await userService.getAllUsers();
      // Map API user to UI user item
      const mappedUsers: UserSelectItem[] = users.map((u) => ({
        id: u._id,
        name: u.userName,
        email: u.email,
        role: u.role,
      }));
      setAvailableUsers(mappedUsers);
    } catch (err) {
      console.error("Lỗi khi tải người dùng:", err);
    }
  };
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationService.getAll();
      setNotifications(response.data.items || []);
    } catch (err: any) {
      console.error("Lỗi khi tải thông báo:", err);
      setError(err.message || "Lỗi không xác định");
      toast.error("Không thể tải danh sách thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (notifications.length === 0) {
      fetchNotifications();
    fetchUsers();
    }
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = [...notifications];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          (n.title || "").toLowerCase().includes(term) ||
          (n.content?.toLowerCase().includes(term) ?? false)
      );
    }

    if (filterType && filterType !== "all") {
      filtered = filtered.filter((n) => n.type === filterType);
    }
    if (filterTarget && filterTarget !== "all") {
      if (filterTarget === "NULL") {
        filtered = filtered.filter((n) => !n.targetRole || n.targetRole === "NULL" || n.targetRole === "null" || n.targetType === "specific");
      } else {
        filtered = filtered.filter((n) => n.targetRole === filterTarget || n.targetType?.toLowerCase() === filterTarget.toLowerCase());
      }
    }
    if (filterStatus && filterStatus !== "all") {
      filtered = filtered.filter((n) => n.status === filterStatus);
    }

    setFilteredNotifications(filtered);
  }, [searchTerm, filterType, filterTarget, filterStatus, notifications]);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("");
    setFilterTarget("");
    setFilterStatus("");
  };

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      type: "SYSTEM",
      targetType: "all",
      targetRole: "user",
      selectedUsers: [],
    });
    setUserSearch("");
  };

  const handleSendNotification = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error("Vui lòng nhập đầy đủ tiêu đề và nội dung.");
      return;
    }

    setSending(true);

    try {
      const payload = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        targetType: formData.targetType,
        targetRole: formData.targetType === "role" ? formData.targetRole : undefined,
        targetUsers: formData.targetType === "specific" ? formData.selectedUsers : undefined,
      };

      if (formData.targetType === "all") {
        await notificationService.broadcast(payload);
      } else if (formData.targetType === "role") {
        await notificationService.sendToRole(payload);
      } else if (formData.targetType === "specific") {
        if (formData.selectedUsers.length === 0) {
          toast.error("Vui lòng chọn người nhận cụ thể.");
          return;
        }
        await notificationService.sendToUser(payload);
      }

      toast.success("Thông báo đã được gửi thành công!");
      await fetchNotifications();
      setIsCreateOpen(false);
      resetForm();
    } catch (err: any) {
      console.error("Lỗi khi gửi thông báo:", err);
      toast.error(`Gửi thông báo thất bại: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedUsers: prev.selectedUsers.includes(userId)
        ? prev.selectedUsers.filter((id) => id !== userId)
        : [...prev.selectedUsers, userId],
    }));
  };

  // TODO: Implement fetching users from real user service
  const filteredUsers = availableUsers.filter(
    (u) =>
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Stats
  const totalSent = notifications.filter((n) => n.status === "sent" || n.status === "SENT" || n.status === "Đã gửi").length;
  const totalFailed = notifications.filter((n) => n.status === "failed" || n.status === "FAILED").length;
  const totalTargeted = notifications.reduce((sum, n) => sum + (n.recipientCount || 0), 0);
  const totalRead = notifications.reduce((sum, n) => sum + (n.readCount || 0), 0);

  const stats = [
    {
      title: "Tổng thông báo",
      value: notifications.length,
      icon: Bell,
      gradient: "from-blue-500 to-indigo-600",
      bgTint: "from-blue-50 to-indigo-50",
      border: "border-blue-100",
    },
    {
      title: "Đã gửi thành công",
      value: totalSent,
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-teal-600",
      bgTint: "from-emerald-50 to-teal-50",
      border: "border-emerald-100",
    },
    {
      title: "Tổng người nhận",
      value: totalTargeted.toLocaleString("vi-VN"),
      icon: Users,
      gradient: "from-violet-500 to-purple-600",
      bgTint: "from-violet-50 to-purple-50",
      border: "border-violet-100",
    },
    {
      title: "Đã đọc",
      value: totalRead.toLocaleString("vi-VN"),
      icon: Eye,
      gradient: "from-amber-500 to-orange-600",
      bgTint: "from-amber-50 to-orange-50",
      border: "border-amber-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl px-8 py-6 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Megaphone className="w-6 h-6" />
            Quản lý Thông báo
          </h1>
          <p className="text-blue-200/70 mt-1 text-sm">
            Tạo và quản lý thông báo gửi đến người dùng
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              resetForm();
              setIsCreateOpen(true);
            }}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm shadow-none gap-2"
          >
            <BellPlus className="w-4 h-4" />
            Tạo thông báo
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card
              key={i}
              className={`bg-gradient-to-br ${stat.bgTint} ${stat.border} border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative`}
            >
              <div
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-[0.04] rounded-full -translate-y-10 translate-x-10`}
              />
              <CardContent className="p-5 relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg shadow-black/10`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="border-gray-100 shadow-sm bg-white">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm theo tiêu đề, nội dung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-slate-50 border-gray-200 focus:bg-white text-slate-900"
              />
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Select value={filterType || "all"} onValueChange={setFilterType}>
                <SelectTrigger className="w-full h-10 border-gray-200 bg-slate-50 text-slate-900">
                  <SelectValue placeholder="Tất cả loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  <SelectItem value="PROMOTIONAL">Khuyến mãi</SelectItem>
                  <SelectItem value="ALERT">Cảnh báo</SelectItem>
                  <SelectItem value="REMINDER">Nhắc nhở</SelectItem>
                  <SelectItem value="SYSTEM">Hệ thống</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterTarget || "all"} onValueChange={setFilterTarget}>
                <SelectTrigger className="w-full h-10 border-gray-200 bg-slate-50 text-slate-900">
                  <SelectValue placeholder="Tất cả đối tượng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả đối tượng</SelectItem>
                  <SelectItem value="ALL">Toàn bộ</SelectItem>
                  <SelectItem value="USER">Khách hàng</SelectItem>
                  <SelectItem value="OWNER">Chủ bãi</SelectItem>
                  <SelectItem value="NULL">Khách hàng cụ thể</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus || "all"} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full h-10 border-gray-200 bg-slate-50 text-slate-900">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="Đã gửi">Đã gửi</SelectItem>
                  <SelectItem value="FAILED">Thất bại</SelectItem>
                  <SelectItem value="DRAFT">Bản nháp</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters} className="h-10">
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Table */}
      <Card className="border-gray-100 shadow-sm bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-5 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
              <CardTitle className="text-base font-semibold text-gray-900">
                Thông báo đã gửi ({filteredNotifications.length})
              </CardTitle>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-500 gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              Làm mới
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-y border-gray-100 bg-gray-50/60">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Thông báo
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Đối tượng
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Đã đọc
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredNotifications.map((notif) => {
                  const tc = typeConfig[notif.type] || typeConfig.SYSTEM;
                  const sc = statusConfig[notif.status] || statusConfig.sent;
                  const readPercent =
                    notif.recipientCount > 0
                      ? Math.round(((notif.readCount || 0) / notif.recipientCount) * 100)
                      : 0;

                  return (
                    <tr
                      key={notif.id}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      {/* Title & Message */}
                      <td className="px-5 py-4 max-w-xs">
                        <div className="flex items-start gap-3">
                          <span className="text-lg shrink-0 mt-0.5">{tc.icon}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {notif.title}
                            </p>
                            <p className="text-xs text-gray-400 truncate mt-0.5">
                              {notif.content}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-5 py-4">
                        <Badge
                          className={`${tc.bgColor} ${tc.color} border text-[10px] font-semibold`}
                        >
                          {tc.label}
                        </Badge>
                      </td>

                      {/* Target */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          {notif.targetType === "all" && (
                            <Globe className="w-3.5 h-3.5 text-blue-500" />
                          )}
                          {notif.targetType === "role" && (
                            <Shield className="w-3.5 h-3.5 text-violet-500" />
                          )}
                          {notif.targetType === "specific" && (
                            <User className="w-3.5 h-3.5 text-amber-500" />
                          )}
                          <span className="text-sm text-gray-700">
                            <Badge
                          className={`${tc.bgColor} ${tc.color} border text-[10px] font-semibold`}
                        >
                            {notif.targetRole === "ALL" ? "Tất cả" :
                              notif.targetRole === "USER" ? "Khách hàng" :
                                notif.targetRole === "OWNER" ? "Chủ bãi" :
                                  notif.targetRole === null || notif.targetRole === "NULL" || notif.targetType === "specific" ? "Khách hàng cụ thể" :
                                    notif.targetRole || "Khách hàng cụ thể"}

                                    </Badge>
                          </span>
                        </div>
                      </td>

                      {/* Read Count */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-xs font-medium text-gray-600">
                            {notif.readSummary || "0/0"}
                          </span>
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                              style={{
                                width: `${notif.recipientCount > 0 ? Math.round(((notif.readCount || 0) / notif.recipientCount) * 100) : 0}%`
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <Badge
                          className={`${sc.bg} ${sc.color} text-[10px] font-semibold`}
                        >
                          {sc.label}
                        </Badge>
                      </td>

                      {/* Time */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {formatDate(notif.sentAt || notif.createdAt)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedNotification(notif);
                              setIsDetailOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setNotifications((prev) =>
                                prev.filter((n) => n.id !== notif.id)
                              );
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredNotifications.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Bell className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">
                Không tìm thấy thông báo
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Thử thay đổi bộ lọc hoặc tạo thông báo mới
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
              >
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Create Notification Dialog ────────────────────────────────── */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <BellPlus className="w-5 h-5 text-blue-600" />
              Tạo thông báo mới
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Nhập tiêu đề thông báo..."
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="h-10"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nội dung <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Nhập nội dung thông báo..."
                value={formData.message}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, message: e.target.value }))
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Notification Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Loại thông báo
              </label>
              <div className="grid grid-cols-5 gap-2">
                {(Object.keys(typeConfig) as NotificationType[]).map((type) => {
                  const cfg = typeConfig[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, type }))
                      }
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-xs font-medium ${
                        formData.type === type
                          ? `${cfg.bgColor} ${cfg.color} border-current shadow-sm`
                          : "border-gray-100 text-gray-500 hover:border-gray-200"
                      }`}
                    >
                      <span className="text-base">{cfg.icon}</span>
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Gửi đến
              </label>
              <div className="grid grid-cols-3 gap-3">
                {/* All */}
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, targetType: "all" }))
                  }
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    formData.targetType === "all"
                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-gray-100 text-gray-500 hover:border-gray-200"
                  }`}
                >
                  <Globe className="w-6 h-6" />
                  <span className="text-xs font-semibold">Tất cả</span>
                  <span className="text-[10px] text-gray-400">
                    ~1,250 người
                  </span>
                </button>

                {/* Role */}
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, targetType: "role" }))
                  }
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    formData.targetType === "role"
                      ? "border-violet-500 bg-violet-50 text-violet-700 shadow-sm"
                      : "border-gray-100 text-gray-500 hover:border-gray-200"
                  }`}
                >
                  <Shield className="w-6 h-6" />
                  <span className="text-xs font-semibold">Theo vai trò</span>
                  <span className="text-[10px] text-gray-400">
                    User hoặc Owner
                  </span>
                </button>

                {/* Specific */}
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, targetType: "specific" }))
                  }
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    formData.targetType === "specific"
                      ? "border-amber-500 bg-amber-50 text-amber-700 shadow-sm"
                      : "border-gray-100 text-gray-500 hover:border-gray-200"
                  }`}
                >
                  <User className="w-6 h-6" />
                  <span className="text-xs font-semibold">Cụ thể</span>
                  <span className="text-[10px] text-gray-400">
                    Chọn người dùng
                  </span>
                </button>
              </div>
            </div>

            {/* Role Selection */}
            {formData.targetType === "role" && (
              <div className="bg-violet-50/50 rounded-xl p-4 border border-violet-100">
                <label className="block text-sm font-medium text-violet-700 mb-2">
                  Chọn vai trò
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        targetRole: "user",
                      }))
                    }
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                      formData.targetRole === "user"
                        ? "border-violet-500 bg-white shadow-sm"
                        : "border-transparent bg-white/50 hover:bg-white"
                    }`}
                  >
                    <Users className="w-5 h-5 text-violet-600" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-800">
                        Khách hàng (User)
                      </p>
                      <p className="text-[10px] text-gray-400">~980 người</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        targetRole: "owner",
                      }))
                    }
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                      formData.targetRole === "owner"
                        ? "border-violet-500 bg-white shadow-sm"
                        : "border-transparent bg-white/50 hover:bg-white"
                    }`}
                  >
                    <Shield className="w-5 h-5 text-violet-600" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-800">
                        Chủ bãi (Owner)
                      </p>
                      <p className="text-[10px] text-gray-400">~45 người</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* User Selection */}
            {formData.targetType === "specific" && (
              <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
                <label className="block text-sm font-medium text-amber-700 mb-2">
                  Chọn người dùng ({formData.selectedUsers.length} đã chọn)
                </label>

                {/* Selected chips */}
                {formData.selectedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {formData.selectedUsers.map((uid) => {
                      const user = availableUsers.find((u) => u.id === uid);
                      return (
                        <span
                          key={uid}
                          className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full"
                        >
                          {user?.name || uid}
                          <button
                            type="button"
                            onClick={() => toggleUserSelection(uid)}
                            className="hover:text-amber-950"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* User search */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                  <Input
                    placeholder="Tìm kiếm người dùng..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>

                {/* User list */}
                <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg bg-white border border-amber-100 p-1.5">
                  {filteredUsers.map((user) => {
                    const selected = formData.selectedUsers.includes(user.id);
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => toggleUserSelection(user.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          selected
                            ? "bg-amber-100/80 text-amber-900"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                            selected
                              ? "bg-amber-500 text-white"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {user.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {user.name}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate">
                            {user.email}
                          </p>
                        </div>
                        <Badge
                          className={`text-[9px] shrink-0 ${
                            user.role === "owner"
                              ? "bg-violet-100 text-violet-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {user.role === "owner" ? "Chủ bãi" : "User"}
                        </Badge>
                        {selected && (
                          <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="gap-2 pt-2">
            <DialogClose asChild>
              <Button variant="outline" onClick={resetForm}>
                Hủy
              </Button>
            </DialogClose>
            <Button
              onClick={handleSendNotification}
              disabled={
                !formData.title.trim() ||
                !formData.message.trim() ||
                (formData.targetType === "specific" &&
                  formData.selectedUsers.length === 0) ||
                sending
              }
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-2 min-w-[120px]"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Gửi thông báo
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Detail Dialog ─────────────────────────────────────────────── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Chi tiết thông báo
            </DialogTitle>
          </DialogHeader>

          {selectedNotification && (
            <div className="space-y-4 py-2">
              {/* Title + type */}
              <div className="flex items-start gap-3">
                <span className="text-2xl">
                  {(typeConfig[selectedNotification.type] || typeConfig.SYSTEM).icon}
                </span>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {selectedNotification.title}
                  </h3>
                  <div className="flex gap-2 mt-1">
                    <Badge
                      className={`${(typeConfig[selectedNotification.type] || typeConfig.SYSTEM).bgColor} ${(typeConfig[selectedNotification.type] || typeConfig.SYSTEM).color} border text-[10px]`}
                    >
                      {(typeConfig[selectedNotification.type] || typeConfig.SYSTEM).label}
                    </Badge>
                    <Badge
                      className={`${(statusConfig[selectedNotification.status] || statusConfig.sent).bg} ${(statusConfig[selectedNotification.status] || statusConfig.sent).color} text-[10px]`}
                    >
                      {(statusConfig[selectedNotification.status] || statusConfig.sent).label}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selectedNotification.content || "Không có nội dung"}
                </p>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] uppercase font-semibold text-gray-400 mb-0.5">
                    Đối tượng
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedNotification.targetRole === "ALL" ? "Tất cả người dùng" :
                      selectedNotification.targetRole === "USER" ? "Khách hàng" :
                        selectedNotification.targetRole === "OWNER" ? "Chủ bãi" :
                          selectedNotification.targetRole === null || selectedNotification.targetRole === "NULL" || selectedNotification.targetType === "specific" ? "Khách hàng cụ thể" :
                            selectedNotification.targetRole || "Khách hàng cụ thể"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] uppercase font-semibold text-gray-400 mb-0.5">
                    Tỷ lệ đọc
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedNotification.readSummary || "0/0"}{" "}
                    ({selectedNotification.recipientCount > 0
                      ? Math.round(
                          ((selectedNotification.readCount || 0) /
                            selectedNotification.recipientCount) *
                            100
                        )
                      : 0}
                    %)
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] uppercase font-semibold text-gray-400 mb-0.5">
                    Thời gian gửi
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {formatDate(
                      selectedNotification.sentAt ||
                        selectedNotification.createdAt
                    )}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] uppercase font-semibold text-gray-400 mb-0.5">
                    Người tạo
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedNotification.createdBy}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}