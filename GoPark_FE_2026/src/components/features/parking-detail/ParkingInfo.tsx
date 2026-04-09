import React from "react";
import { MapPin, Clock, Star, Banknote, Info, User, Phone, Mail } from "lucide-react";

export function ParkingInfo() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-6 transition-colors">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Hình ảnh */}
        <div className="w-full md:w-1/3 space-y-4">
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

        {/* Thông tin chi tiết */}
        <div className="w-full md:w-2/3 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bãi Đỗ Xe An Tâm - Quận 1</h1>
              <div className="flex items-center text-yellow-500 mt-1">
                <Star className="w-5 h-5 fill-current" />
                <span className="ml-1 font-semibold text-gray-800 dark:text-gray-200">4.8</span>
                <span className="ml-1 text-gray-500 dark:text-gray-400 text-sm">(124 đánh giá)</span>
              </div>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
              Đang hoạt động
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-200">Địa chỉ</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-200">Giờ hoạt động</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">06:00 - 23:00 (Thứ 2 - Chủ Nhật)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Banknote className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-200">Giá vé</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">15.000đ / giờ (Dành cho Ô tô)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-200">Tiện ích</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Camera 24/7, Có mái che, Rửa xe</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 mt-4">
             <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Mô tả</h3>
             <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
               Bãi đỗ xe rộng rãi, thoáng mát ngay trung tâm Quận 1. Được trang bị hệ thống camera an ninh 24/7 và nhân viên bảo vệ trực xuyên đêm. Hệ thống nhận diện biển số tự động giúp ra vào nhanh chóng không cần chờ đợi.
             </p>
          </div>

          {/* Thông tin chủ bãi đỗ */}
          <div className="pt-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Thông tin chủ quản lý</h3>
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
               <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center shrink-0">
                 <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
               </div>
               <div>
                 <h4 className="font-bold text-gray-900 dark:text-white">Công ty cổ phần bãi đỗ An Tâm</h4>
                 <div className="flex flex-col sm:flex-row sm:gap-4 mt-1 space-y-1 sm:space-y-0 text-sm text-gray-600 dark:text-gray-300">
                   <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> 0909 123 456</span>
                   <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> contact@antam.com</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bản đồ */}
      <div className="mt-6 rounded-lg overflow-hidden h-[300px] border border-gray-200 dark:border-gray-700">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.513364273523!2d106.699042215334!3d10.7719363923241!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f40a3b49e59%3A0xa1bd14e483a602db!2sCh%E1%BB%A3%20B%E1%BA%BFn%20Th%C3%A0nh!5e0!3m2!1svi!2s!4v1655000000000!5m2!1svi!2s" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen={true} 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          title="Bản đồ vị trí bãi đỗ xe"
          className="dark:opacity-80"
        ></iframe>
      </div>
    </div>
  );
}
