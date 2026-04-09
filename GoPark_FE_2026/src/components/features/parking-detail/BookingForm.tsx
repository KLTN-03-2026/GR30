"use client";
import React, { useState } from "react";
import { Car, Clock, ShieldCheck, MapPin, Search, CreditCard, Package } from "lucide-react";

export function BookingForm() {
  const [selectedPlate, setSelectedPlate] = useState("51H-123.45");
  const [servicePackage, setServicePackage] = useState("hourly");
  const [paymentMethod, setPaymentMethod] = useState("vnpay");
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-6 transition-colors relative overflow-hidden">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-green-800 dark:bg-green-700"></div>
      
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Car className="w-5 h-5 text-green-900 dark:text-green-700" />
        Đặt chỗ đỗ xe
      </h2>
      
      <form className="space-y-6">
        
        {/* Biển số xe */}
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
              <Search className="w-4 h-4 text-gray-500" />
              Chọn xe ô tô của bạn
            </label>
            <div className="relative">
              <select 
                value={selectedPlate}
                onChange={(e) => setSelectedPlate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all text-gray-900 dark:text-white font-medium appearance-none cursor-pointer"
              >
                <option value="51H-123.45">51H-123.45</option>
                <option value="60A-987.65">60A-987.65</option>
                <option value="new">+ Thêm xe mới...</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Car className="w-4 h-4 text-green-700 dark:text-green-700" />
              </div>
            </div>
        </div>

        {/* Gói dịch vụ */}
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-gray-500" />
              Gói dịch vụ
            </label>
            <div className="relative">
              <select 
                value={servicePackage}
                onChange={(e) => setServicePackage(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all text-gray-900 dark:text-white font-medium appearance-none cursor-pointer"
              >
                <option value="hourly">Theo giờ</option>
                <option value="daily">Theo ngày</option>
                <option value="monthly">Theo tháng</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Package className="w-4 h-4 text-green-700 dark:text-green-700" />
              </div>
            </div>
        </div>

        {/* Thời gian */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                 <Clock className="w-4 h-4 text-gray-500" />
                 Giờ vào
               </label>
               <input 
                type="datetime-local" 
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none text-sm text-gray-900 dark:text-white transition-colors"
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                 <Clock className="w-4 h-4 text-gray-500" />
                 Giờ ra
               </label>
               <input 
                type="datetime-local" 
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none text-sm text-gray-900 dark:text-white transition-colors"
               />
            </div>
        </div>

        {/* Vị trí đã chọn (mock) */}
        <div className="bg-green-50/50 dark:bg-green-900/10 p-3.5 rounded-lg border border-green-100 dark:border-green-800/40 transition-colors">
           <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-green-700 dark:text-green-700" />
                Vị trí đỗ:
              </span>
              <span className="font-bold text-green-700 dark:text-green-400 px-2 py-0.5 bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-700/50 shadow-sm">
                A-3
              </span>
           </div>
        </div>

        {/* Chọn hình thức thanh toán */}
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-gray-500" />
              Hình thức thanh toán
            </label>
            <div className="relative">
              <select 
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all text-gray-900 dark:text-white font-medium appearance-none cursor-pointer"
              >
                <option value="vnpay">Chuyển khoản (VNPAY)</option>
                <option value="wallet">Ví GoPark</option>
                <option value="cash">Thanh toán trực tiếp</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CreditCard className="w-4 h-4 text-green-700 dark:text-green-700" />
              </div>
            </div>
        </div>

        {/* Tổng tiền */}
        <div className="border-t border-gray-100 dark:border-gray-700 pt-5 mt-2">
            <div className="flex justify-between items-center mb-3">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Đơn giá (Ô tô)</span>
                <span className="font-medium text-gray-900 dark:text-white text-sm">
                  15.000đ/giờ
                </span>
            </div>
            
            <div className="flex justify-between items-end mb-6">
                <span className="font-bold text-gray-900 dark:text-white">Tổng tạm tính</span>
                <span className="text-2xl font-black text-green-600 dark:text-green-500 drop-shadow-sm">30.000đ</span>
            </div>
            
            <button 
                type="button"
                className="group relative w-full bg-green-800 hover:bg-green-700 cursor-pointer text-white font-bold py-3.5 px-4 rounded-lg transition-all shadow-[0_4px_14px_0_rgba(22,163,74,0.39)] hover:shadow-[0_6px_20px_rgba(22,163,74,0.23)] active:scale-[0.98] text-lg overflow-hidden"
            >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <span className="flex items-center justify-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  Xác nhận Đặt Chỗ
                </span>
            </button>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4 px-4 leading-relaxed">
               Thanh toán an toàn. Bạn không bị trừ tiền cho đến khi check-in tại bãi đỗ.
            </p>
        </div>
      </form>
    </div>
  );
}
