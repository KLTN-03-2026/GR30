"use client";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { patch } from "@/lib/api";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Booking {
  id: string;
  start_time: string;
  end_time: string;
  [key: string]: any;
}

interface ExtendBookingModalProps {
  isOpen: boolean;
  booking: Booking | null;
  onClose: () => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

export function ExtendBookingModal({ isOpen, booking, onClose }: ExtendBookingModalProps) {
  const [newEndTime, setNewEndTime] = useState("");
  const [extraAmount, setExtraAmount] = useState(0);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State lưu thông tin đơn giá thực tế từ BE
  const [pricingInfo, setPricingInfo] = useState({
    pricePerHour: 0,
    priceDay: 0,
    zoneName: ""
  });

  
  useEffect(() => {
    if (!isOpen || !booking) return;

    // 1. Khởi tạo giờ nếu chưa có
    if (!newEndTime) {
      const initialTime = dayjs(booking.end_time).add(1, 'hour').format("YYYY-MM-DDTHH:mm");
      setNewEndTime(initialTime);
    }

    // 2. Gọi API Preview giá
    const fetchPreviewPrice = async () => {
      const isValidTime = newEndTime && dayjs(newEndTime).isAfter(dayjs(booking.end_time));
      
      if (isValidTime) {
        setLoadingPrice(true);
        try {
          const res = (await patch(`/booking/${booking.id}/extend`, {
            new_end_time: dayjs(newEndTime).toISOString(),
            isPreview: true 
          })) as any; 
          
          if (res?.data) {
            setExtraAmount(res.data.extraAmount || 0);
            setPricingInfo({
              pricePerHour: res.data.pricePerHour || 0,
              priceDay: res.data.priceDay || 0,
              zoneName: res.data.zoneName || "Khu vực"
            });
          }
        } catch (error) {
          console.error("Lỗi fetch giá:", error);
          setExtraAmount(0);
        } finally {
          setLoadingPrice(false);
        }
      } else {
        setExtraAmount(0);
      }
    };

    const timer = setTimeout(fetchPreviewPrice, 300); // Debounce 300ms để tránh gọi API liên tục khi chọn giờ
    return () => clearTimeout(timer);

  }, [newEndTime, booking, isOpen]);

  const getHH = (timeStr: string) => timeStr ? dayjs(timeStr).format("HH") : "00";
  const getMM = (timeStr: string) => timeStr ? dayjs(timeStr).format("mm") : "00";

  const handleExtend = async () => {
    if (isSubmitting || !booking) return;
    setIsSubmitting(true);
    try {
      await patch(`/booking/${booking.id}/extend`, {
        new_end_time: dayjs(newEndTime).toISOString(),
        isPreview: false
      });
      toast.success("Gia hạn thành công!");
      onClose();
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi gia hạn");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!booking) return null;
  const oldEndTimeDate = dayjs(booking.end_time).format("YYYY-MM-DD");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Gia hạn thời gian đỗ</DialogTitle>
        </DialogHeader>
      
        {/* Thông tin giờ cũ */}
        <div className="grid grid-cols-2 gap-4 mb-4 mt-2">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 opacity-60">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Giờ vào</p>
            <p className="font-bold text-gray-400">{dayjs(booking.start_time).format("HH:mm - DD/MM")}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 opacity-60">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Giờ ra cũ</p>
            <p className="font-bold text-gray-400">{dayjs(booking.end_time).format("HH:mm - DD/MM")}</p>
          </div>
        </div>

        {/* Input chọn giờ mới */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase pl-1">NGÀY RA MỚI</label>
            <input
              type="date"
              min={oldEndTimeDate}
              value={newEndTime ? newEndTime.split('T')[0] : ""}
              onChange={(e) => setNewEndTime(`${e.target.value}T${getHH(newEndTime)}:${getMM(newEndTime)}`)}
              className="w-full h-12 px-4 bg-white border border-[#E9ECEF] rounded-[12px] font-bold text-sm focus:border-blue-500 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase pl-1">GIỜ RA MỚI</label>
            <div className="flex gap-2">
              <Select 
                value={getHH(newEndTime)} 
                onValueChange={(val) => setNewEndTime(`${newEndTime.split('T')[0]}T${val}:${getMM(newEndTime)}`)}
              >
                <SelectTrigger className="h-12 rounded-[12px] font-bold flex-1">
                  <SelectValue placeholder="Giờ" />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.map((h) => (
                    <SelectItem key={h} value={h} disabled={dayjs(`${newEndTime.split('T')[0]}T${h}:${getMM(newEndTime)}`).isBefore(dayjs(booking.end_time))}>
                      {h}h
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={getMM(newEndTime)} 
                onValueChange={(val) => setNewEndTime(`${newEndTime.split('T')[0]}T${getHH(newEndTime)}:${val}`)}
              >
                <SelectTrigger className="h-12 rounded-[12px] font-bold flex-1">
                  <SelectValue placeholder="Phút" />
                </SelectTrigger>
                <SelectContent>
                  {MINUTES.map((m) => (
                    <SelectItem key={m} value={m} disabled={dayjs(`${newEndTime.split('T')[0]}T${getHH(newEndTime)}:${m}`).isBefore(dayjs(booking.end_time))}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* PHẦN HIỂN THỊ ĐƠN GIÁ */}
        <div className="space-y-3 mb-6">
            <div className="px-4 py-2 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                  <span>Đơn giá khu vực: <strong className="text-gray-700">{pricingInfo.zoneName}</strong></span>
                </div>
                <div className="flex justify-between text-[11px] text-gray-500 italic">
                  <span>Giá giờ/ngày:</span>
                  <span className="font-bold">
                    {pricingInfo.pricePerHour.toLocaleString()}đ / {pricingInfo.priceDay.toLocaleString()}đ
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-gray-500 mt-1 pt-1 border-t border-gray-200">
                  <span>Thời gian thêm:</span>
                  <span className="font-bold">
                    {newEndTime && dayjs(newEndTime).isAfter(dayjs(booking.end_time)) 
                    ? `${dayjs(newEndTime).diff(dayjs(booking.end_time), 'minute')} phút` 
                    : "0 phút"}
                  </span>
                </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
                <div>
                  <p className="text-xs text-blue-600 font-bold uppercase">Kết thúc mới</p>
                  <p className="text-lg font-black text-blue-900">
                    {newEndTime ? dayjs(newEndTime).format("HH:mm - DD/MM/YYYY") : "Chưa chọn"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-blue-600 font-bold uppercase">Tiền cộng thêm</p>
                  <p className="text-lg font-black text-blue-900">
                    {loadingPrice ? "..." : `+${extraAmount.toLocaleString()}đ`}
                  </p>
                </div>
            </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200">Hủy</button>
          <button 
            onClick={handleExtend}
            disabled={loadingPrice || isSubmitting || !newEndTime || dayjs(newEndTime).isBefore(dayjs(booking.end_time))}
            className="flex-[2] bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-blue-300 transition-all"
          >
            {isSubmitting ? "Đang xử lý..." : "Xác nhận gia hạn"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}