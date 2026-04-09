"use client";

import React, { useEffect, useState } from "react";
import { 
  Building2, 
  MapPin, 
  Wallet, 
  RefreshCcw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronRight,
  ClipboardList
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { apiClient } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface RequestItem {
  id: string;
  type: string;
  status: string;
  payload: any;
  createdAt: string;
  note?: Array<{
    action: string;
    approvedBy: string;
    timestamp: string;
    reason?: string;
  }>;
}
// Các loại yêu cầu có thể có
export default function MyRequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
// Hàm lấy danh sách yêu cầu của người dùng hiện tại
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await apiClient<{ data: RequestItem[] }>("/request/me");
      setRequests(response.data || []);
    } catch (error) {
      console.error("Lỗi lấy danh sách yêu cầu:", error);
    } finally {
      setLoading(false);
    }
  };
// gọi hàm lấy yêu cầu khi component được mount
  useEffect(() => {
    fetchRequests();
  }, []);
// Hàm hiển thị badge trạng thái với màu sắc và icon tương ứng
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Đã duyệt</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none flex items-center gap-1"><XCircle className="w-3 h-3" /> Đã từ chối</Badge>;
      case "PENDING":
      default:
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none flex items-center gap-1"><Clock className="w-3 h-3" /> Đang chờ duyệt</Badge>;
    }
  };
// Hàm hiển thị icon tương ứng với loại yêu cầu
  const getRequestIcon = (type: string) => {
    switch (type) {
      case "BECOME_OWNER":
        return <Building2 className="w-5 h-5 text-blue-500" />;
      case "WITHDRAW_FUND":
        return <Wallet className="w-5 h-5 text-green-500" />;
      case "REFUND":
      case "PAYMENT":
        return <RefreshCcw className="w-5 h-5 text-purple-500" />;
      default:
        return <ClipboardList className="w-5 h-5 text-gray-500" />;
    }
  };
// Hàm hiển thị tên loại yêu cầu dựa trên trường type
  const getRequestTypeName = (type: string) => {
    switch (type) {
      case "BECOME_OWNER": return "Đăng ký Chủ bãi đỗ";
      case "WITHDRAW_FUND": return "Yêu cầu rút tiền";
      case "REFUND": return "Yêu cầu hoàn tiền";
      case "PAYMENT": return "Thanh toán";
      case "NEW_PARKING_LOT": return "Thêm bãi đỗ mới";
      case "UPDATE_PARKING_LOT": return "Cập nhật bãi đỗ";
      default: return type;
    }
  };
// Hàm hiển thị tóm tắt thông tin trong payload của yêu cầu, tùy theo loại yêu cầu sẽ có cách hiển thị khác nhau
  const renderPayloadSummary = (type: string, payload: any) => {
    if (!payload) return null;

    if (type === "BECOME_OWNER" || type === "NEW_PARKING_LOT") {
      return (
        <div className="mt-3 text-sm text-gray-600 space-y-1">
          <p><span className="font-medium text-gray-700">Tên bãi:</span> {payload.parkingLotName}</p>
          <p className="flex items-start gap-1">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" /> 
            <span className="line-clamp-1">{payload.address}</span>
          </p>
        </div>
      );
    }
   // Với yêu cầu rút tiền, hiển thị số tiền và ngân hàng liên quan đến yêu cầu rút tiền đó 
    if (type === "WITHDRAW_FUND") {
      return (
        <div className="mt-3 text-sm text-gray-600">
          <p><span className="font-medium text-gray-700">Số tiền:</span> {payload.amount?.toLocaleString('vi-VN')} VNĐ</p>
          <p><span className="font-medium text-gray-700">Ngân hàng:</span> {payload.bankName}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4 max-w-4xl min-h-[calc(100vh-200px)]">
        <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lịch sử Yêu cầu</h1>
          <p className="text-muted-foreground mt-1">Quản lý và theo dõi trạng thái các yêu cầu của bạn trên hệ thống</p>
        </div>
        <Button variant={"outline"} onClick={fetchRequests}>Làm mới</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="divide-y">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 flex gap-4 items-start">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="w-40 h-5" />
                    <Skeleton className="w-full max-w-md h-4" />
                    <Skeleton className="w-24 h-4 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center text-gray-500">
              <ClipboardList className="w-12 h-12 mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900">Không có yêu cầu nào</h3>
              <p className="mt-1">Bạn chưa gửi yêu cầu nào tới hệ thống.</p>
            </div>
          ) : (
            <div className="divide-y cursor-default">
              {requests.map((request) => (
                <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors flex items-start flex-col sm:flex-row gap-4">
                  <div className="bg-gray-100 p-3 rounded-full flex-shrink-0">
                    {getRequestIcon(request.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {getRequestTypeName(request.type)}
                      </h3>
                      {getStatusBadge(request.status)}
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-2">
                      Gửi lúc: {format(new Date(request.createdAt), 'HH:mm - dd/MM/yyyy', { locale: vi })}
                    </p>

                    {renderPayloadSummary(request.type, request.payload)}

                    {request.status === "REJECTED" && request.note && request.note.length > 0 && (
                      <div className="mt-3 bg-red-50 border border-red-100 text-red-700 p-3 rounded-md text-sm">
                        <span className="font-medium text-red-800 flex items-center gap-1 mb-1">
                          <XCircle className="w-4 h-4" /> Lý do từ chối:
                        </span>
                        {request.note[request.note.length - 1].reason || "Không rõ lý do, vui lòng liên hệ admin."}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
      <Footer />
    </>
  );
}