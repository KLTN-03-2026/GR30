"use client";

import React, { useContext, useState } from "react";
import { MapPin, Clock, Star, Banknote, Info, User, Phone, Mail, Car, Bike } from "lucide-react";
import { ParkingContext } from "./ParkingContext";
import { MapLocationPicker } from "@/components/ui/map-location-picker";
import { useRouter } from "next/navigation";
export function ParkingInfo() {

  const context = useContext(ParkingContext);
  if (!context) return null;
  const { dataLot, loadingLot } = context;
  //console.log("ParkingInfo Component - Data from Context:", dataLot, "Loading:", loadingLot);

  const [selectedAreaIndex, setSelectedAreaIndex] = useState(0);
  const pricingRules = Array.isArray(dataLot?.pricingRules) ? dataLot.pricingRules : [];
  const validIndex = selectedAreaIndex < pricingRules.length ? selectedAreaIndex : 0;
  const selectedRule = pricingRules[validIndex] || null;
  const router = useRouter();

  const formatVnd = (n?: number) => n ? new Intl.NumberFormat('vi-VN').format(n) + 'đ' : '';
  function formatTime(startTime: string, endTime: string, days: string) {
    if (!startTime || !endTime || !days) return "chưa cập nhật"

    const opendate = new Date(startTime)
    const closedate = new Date(endTime)


    //lấy giờ và phút
    const openTime = opendate.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })

    const closeTime = closedate.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })

    const date_activity = days
    return `${openTime}-${closeTime} (${date_activity})`
  }

  const handleBooking = () => {
    // Ví dụ: Kiểm tra đăng nhập
    // if (!isLoggedIn) return alert("Vui lòng đăng nhập!");
    
    router.push(`/users/myBooking/${dataLot.id}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-6 transition-colors">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Hình ảnh và Quản lý */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="space-y-4">
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
              <img
                src="https://images.unsplash.com/photo-1590674899484-d5640e854abe?q=80&w=800&auto=format&fit=crop"
                alt="Parking"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2">
              <div className="w-1/3 aspect-video rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1604063155776-081e7e45fcc3?q=80&w=300&auto=format&fit=crop" className="w-full h-full object-cover" />
              </div>
              <div className="w-1/3 aspect-video rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?q=80&w=300&auto=format&fit=crop" className="w-full h-full object-cover" />
              </div>
              <div className="w-1/3 aspect-video rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                +3
              </div>
            </div>
          </div>

          {/* Thông tin chủ quản lý & Đặt ngay */}
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-gray-500 shrink-0" />
              <p className="font-semibold text-gray-900 dark:text-gray-200">Thông tin chủ quản lý</p>
            </div>
            <div className="space-y-3">
              <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">Công ty CP bãi đỗ An Tâm</p>
              <div className="flex flex-col space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> 0909 123 456</span>
                <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> {dataLot?.owner?.email} </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBooking}
              className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              Đặt ngay
            </button>
          </div>

          {/* Tọa độ hiển thị */}
          <div className="flex gap-3 justify-center items-center">
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/30 px-3 py-3 rounded-xl border border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 w-full justify-center shadow-sm transition-all hover:border-blue-300">
              <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="whitespace-nowrap">Lat: <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">{dataLot.lat ?? '---'}</span></span>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/30 px-3 py-3 rounded-xl border border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 w-full justify-center shadow-sm transition-all hover:border-blue-300">
              <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="whitespace-nowrap">Lng: <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">{dataLot.lng ?? '---'}</span></span>
            </div>
          </div>
        </div>

        {/* Thông tin chi tiết */}
        <div className="w-full md:w-2/3 flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{dataLot.name}</h1>
            </div>
            {/* Nhãn Đang hoạt động */}
            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
              {dataLot.status}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-200">Địa chỉ</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{dataLot.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-200">Giờ hoạt động</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{formatTime(dataLot.open_time, dataLot.close_time, dataLot.operating_days)}</p>
              </div>
            </div>
          </div>

          {/* Bảng giá vé */}
          <div className="mt-6 border-t border-gray-100 dark:border-gray-700/50 pt-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-gray-400" />
                <p className="font-medium text-gray-900 dark:text-gray-200">Bảng giá vé</p>
              </div>
              
              {/* Bộ lọc khu vực */}
              {pricingRules.length > 0 && (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">Khu vực:</p>
                  <select 
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none font-medium text-gray-700 dark:text-gray-200 shadow-sm cursor-pointer"
                    value={validIndex}
                    onChange={(e) => setSelectedAreaIndex(Number(e.target.value))}
                  >
                    {pricingRules.map((rule: any, idx: number) => {
                      return(
                     <option key={rule.id} value={idx}>
                        {rule.floor_name}-{rule.zone_name}
                      </option>
                      );
                    })}
                  </select>
                </div>
              )}
            </div>

            {pricingRules.length > 0 && selectedRule ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Giá theo giờ */}
                <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/50 p-5 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center group">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full mb-3 group-hover:scale-110 transition-transform">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-gray-500 dark:text-gray-400 text-xs mb-1 uppercase tracking-wider">Giá theo giờ</h4>
                  <div className="font-bold text-blue-600 dark:text-blue-400 text-2xl mt-1">
                    {formatVnd(selectedRule.price_per_hour)}<span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">/h</span>
                  </div>
                </div>

                {/* Giá theo ngày */}
                <div className="bg-green-50/50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-800/50 p-5 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center group">
                  <div className="p-3 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full mb-3 group-hover:scale-110 transition-transform">
                    <Banknote className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-gray-500 dark:text-gray-400 text-xs mb-1 uppercase tracking-wider">Giá theo ngày</h4>
                  <div className="font-bold text-green-600 dark:text-green-400 text-2xl mt-1">
                    {formatVnd(selectedRule.price_per_day || selectedRule.day)}<span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">/ngày</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-400 font-medium">Chưa cập nhật bảng giá</p>
              </div>
            )}
          </div>

          {/* Tiện ích */}
          <div className="mt-6 border-t border-gray-100 dark:border-gray-700/50 pt-5">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-gray-400 shrink-0" />
              <p className="font-medium text-gray-900 dark:text-gray-200">Tiện ích</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pl-7">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 p-3 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Tổng số chỗ</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{dataLot.total_slots ?? '...'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 p-3 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Chỗ trống</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-500">{dataLot.available_slots ?? '...'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 p-3 text-center flex flex-col justify-center items-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Khác</p>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Camera 24/7, Có mái che</p>
              </div>
            </div>
          </div>

          {/* Mô tả */}
          <div className="mt-6 border-t border-gray-100 dark:border-gray-700/50 pt-5 h-full">
            <h3 className="font-medium text-gray-900 dark:text-gray-200 mb-2">Mô tả</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed text-justify">
              {dataLot.description}
            </p>
          </div>
        </div>
      </div>

      {/* Bản đồ */}
      <div className="mt-6 rounded-lg overflow-hidden h-[300px] border border-gray-200 dark:border-gray-700">
        <MapLocationPicker
          location={dataLot.lat && dataLot.lng ? { lat: Number(dataLot.lat), lng: Number(dataLot.lng) } : null}
          //onChange={(loc) => context.setDataLot((prev: any) => ({ ...prev, lat: loc.lat, lng: loc.lng }))}
          onChange={()=>{}}
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
}
