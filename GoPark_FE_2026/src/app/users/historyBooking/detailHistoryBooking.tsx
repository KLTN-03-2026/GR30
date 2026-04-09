// "use client";

// import React from "react";
// import { MapPin, X, FileText, Clock, ArrowRight, Car } from "lucide-react";

// interface Props {
//   isOpen: boolean;
//   onClose: () => void;
//   booking: any;
// }

// function DetailHistoryBooking({ isOpen, onClose, booking }: Props) {
//   if (!isOpen || !booking) return null;

//   return (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

//       {/* Overlay Backdrop */}
//       <div
//         className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
//         onClick={onClose}
//       />

//       {/* Container Chính */}
//       <div className="relative z-10 w-full max-w-[1000px] max-h-[90vh] overflow-y-auto bg-[#F8FBFF] rounded-[2rem] p-8 shadow-2xl border-4 border-slate-100">

//         {/* HEADER */}
//         <div className="flex justify-between items-start mb-8">
//           <div>
//             <div className={`inline-block px-5 py-2 rounded-full text-[13px] font-black uppercase tracking-widest mb-4 text-white shadow-sm ${
//                 booking.status === 'Đã đặt' 
//                 ? 'bg-red-600 shadow-red-600/30' 
//                 : 'bg-emerald-600 shadow-emerald-600/30'
//             }`}>
//               {booking.status}
//             </div>
            
//             <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">{booking.name}</h2>
            
//             <div className="flex items-center gap-2.5 text-slate-800 font-bold mt-4 text-[17px]">
//               <MapPin className="w-6 h-6 text-slate-700" />
//               <span>{booking.address}</span>
//             </div>
//           </div>

//           <button 
//             onClick={onClose} 
//             className="w-12 h-12 bg-slate-100 border-2 border-slate-300 rounded-full flex items-center justify-center text-slate-800 hover:bg-slate-200 hover:text-black transition-colors shadow-sm shrink-0"
//           >
//             <X className="w-7 h-7 font-bold" />
//           </button>
//         </div>

//         {/* NỘI DUNG CHÍNH */}
//         <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

//           {/* CỘT TRÁI (Hình ảnh + Bản đồ) */}
//           <div className="lg:col-span-2 space-y-6">
            
//             <div className="rounded-[1.5rem] overflow-hidden h-[260px] shadow-sm border-2 border-slate-200">
//               <img
//                 src="/xedep.jpg"
//                 className="w-full h-full object-cover"
//                 alt="Hình bãi đỗ xe"
//               />
//             </div>

//             <div className="bg-white rounded-[1.5rem] p-3 shadow-sm border-2 border-slate-200">
//               <div className="h-[220px] rounded-2xl bg-slate-100 flex flex-col items-center justify-center text-slate-700 border-2 border-slate-300 overflow-hidden relative">
//                  <MapPin className="w-12 h-12 mb-3 text-blue-600" />
//                  <span className="text-base font-black text-slate-700 uppercase tracking-widest">Bản đồ bãi đỗ</span>
//               </div>
//             </div>

//           </div>

//           {/* CỘT PHẢI (Thông tin chi tiết) */}
//           <div className="lg:col-span-3 space-y-6">
            
//              {/* THẺ 1: Chi tiết vé đặt */}
//              <div className="bg-white rounded-[1.5rem] p-6 lg:p-7 shadow-sm border-2 border-slate-200">
//                 <h4 className="text-[16px] font-black text-slate-800 mb-8 uppercase tracking-widest flex items-center gap-2.5">
//                   <FileText className="w-6 h-6 text-blue-700" />
//                   Chi tiết vé đặt
//                 </h4>
                
//                 <div className="grid grid-cols-2 gap-y-8 gap-x-4">
//                   <div className="col-span-2 sm:col-span-1">
//                     <p className="text-[13px] text-slate-700 font-black mb-2.5 uppercase tracking-widest">Mã vé (ID)</p>
//                     <p className="font-black text-slate-900 text-lg break-words leading-tight">{booking.id}</p>
//                   </div>
//                   <div>
//                     <p className="text-[13px] text-slate-700 font-black mb-2.5 uppercase tracking-widest">Vị trí đỗ</p>
//                     <p className="font-black text-blue-800 text-2xl bg-blue-100 w-fit px-5 py-2 rounded-xl border-2 border-blue-300">{booking.code}</p>
//                   </div>
//                   <div>
//                     <p className="text-[13px] text-slate-700 font-black mb-2.5 uppercase tracking-widest">Khu vực</p>
//                     <p className="font-black text-slate-900 text-[21px]">{booking.floor_zone && booking.floor_zone !== "N/A" ? booking.floor_zone : "Không có"}</p>
//                   </div>
//                   <div>
//                     <p className="text-[13px] text-slate-700 font-black mb-2.5 uppercase tracking-widest">Tầng đỗ xe</p>
//                     <p className="font-black text-slate-900 text-[21px]">
//                       {booking.floor_name && booking.floor_name !== "N/A" 
//                         ? booking.floor_name 
//                         : (booking.floor_number && booking.floor_number !== "N/A" ? `Tầng ${booking.floor_number}` : "Không có")}
//                     </p>
//                   </div>
//                 </div>
//              </div>

//              {/* THẺ 2 MỚI: Khách hàng & Phương tiện */}
//              <div className="bg-white rounded-[1.5rem] p-6 lg:p-7 shadow-sm border-2 border-slate-200">
//                 <h4 className="text-[16px] font-black text-slate-800 mb-8 uppercase tracking-widest flex items-center gap-2.5">
//                   <Car className="w-6 h-6 text-blue-700" />
//                   Khách hàng & Phương tiện
//                 </h4>
                
//                 <div className="grid grid-cols-2 gap-y-8 gap-x-4">
//                   <div className="col-span-2 sm:col-span-1">
//                     <p className="text-[13px] text-slate-700 font-black mb-2.5 uppercase tracking-widest">Khách hàng</p>
//                     <p className="font-black text-slate-900 text-xl leading-tight">
//                       {booking.user_name || booking.userName || booking.customer_name || "Chưa cập nhật"}
//                     </p>
//                   </div>
//                   <div>
//                      <p className="text-[13px] text-slate-700 font-black mb-2.5 uppercase tracking-widest">Loại xe</p>
//                      <p className="font-black text-slate-900 text-xl leading-tight">
//                        {booking.type || booking.type || "Chưa cập nhật"}
//                      </p>
//                   </div>
//                   <div className="col-span-2">
//                      <p className="text-[13px] text-slate-700 font-black mb-2.5 uppercase tracking-widest">Biển số xe</p>
//                      <p className="font-black text-slate-900 text-[24px] bg-slate-100 w-fit px-6 py-3 rounded-xl border-2 border-slate-300 tracking-wider">
//                        {booking.plate_number || booking.plate_number || "Chưa đánh biển số"}
//                      </p>
//                   </div>
//                 </div>
//              </div>

//              {/* THẺ 3: Thời gian & Tổng tiền */}
//              <div className="bg-white rounded-[1.5rem] p-6 lg:p-7 shadow-sm border-2 border-slate-200">
//                 <h4 className="text-[16px] font-black text-slate-800 mb-8 uppercase tracking-widest flex items-center gap-2.5">
//                   <Clock className="w-6 h-6 text-blue-700" />
//                   Thời gian & Thanh toán
//                 </h4>

//                 <div className="space-y-6">
//                   {/* Hàng Thời gian */}
//                   <div className="flex items-center justify-between p-4 lg:p-6 rounded-2xl bg-slate-100 border-2 border-slate-300">
//                     <div className="flex-1">
//                       <p className="text-[13px] text-slate-700 font-black mb-2.5 uppercase tracking-widest">Thời gian vào</p>
//                       <p className="font-black text-slate-900 text-[26px] leading-tight mb-1">{booking.start_time}</p>
//                       <p className="text-[17px] text-slate-800 font-bold">{booking.start_date}</p>
//                     </div>
                    
//                     <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center border-2 border-slate-300 shadow-md shrink-0 mx-5 pb-0.5">
//                        <ArrowRight className="w-7 h-7 text-slate-700 font-bold" />
//                     </div>
                    
//                     <div className="flex-1 text-right">
//                       <p className="text-[13px] text-slate-700 font-black mb-2.5 uppercase tracking-widest">Thời gian ra</p>
//                       <p className="font-black text-slate-900 text-[26px] leading-tight mb-1">{booking.end_time}</p>
//                       <p className="text-[17px] text-slate-800 font-bold">{booking.end_date}</p>
//                     </div>
//                   </div>

//                   {/* Hàng Tổng tiền */}
//                   <div className="flex items-end justify-between pt-6 border-t-2 border-slate-200 pb-2">
//                     <p className="text-[15px] text-slate-800 font-black uppercase tracking-widest mb-2">Tổng tiền</p>
//                     <p className="font-black text-red-600 text-[36px] tracking-tight leading-none drop-shadow-sm">
//                       {booking.total_price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.total_price) : "0 ₫"}
//                     </p>
//                   </div>
//                 </div>

//              </div>
//           </div>

//         </div>

//         {/* NÚT ĐÓNG FOOTER */}
//         <div className="flex justify-end mt-10 pt-8 border-t-2 border-slate-200">
//           <button
//             onClick={onClose}
//             className="px-14 py-5 bg-black hover:bg-slate-900 text-white rounded-2xl font-black text-xl shadow-xl transition-all active:scale-95 border-2 border-slate-800"
//           >
//             Đóng cửa sổ
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// }
// export default DetailHistoryBooking;



"use client";

import React from "react";
import { MapPin, X, FileText, Clock, ArrowRight, Car } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
}

function DetailHistoryBooking({ isOpen, onClose, booking }: Props) {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

      {/* Overlay Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Container Chính */}
      <div className="relative z-10 w-full max-w-[1000px] max-h-[90vh] overflow-y-auto bg-[#F8FBFF] rounded-[2rem] p-8 shadow-2xl border-4 border-slate-100 no-scrollbar">

        {/* HEADER */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className={`inline-block px-5 py-2 rounded-full text-[13px] font-black uppercase tracking-widest mb-4 text-white shadow-sm ${
                booking.status === 'Đã đặt' 
                ? 'bg-red-600 shadow-red-600/30' 
                : 'bg-emerald-600 shadow-emerald-600/30'
            }`}>
              {booking.status}
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">{booking.name}</h2>
            
            <div className="flex items-center gap-2.5 text-slate-800 font-bold mt-4 text-[17px]">
              <MapPin className="w-6 h-6 text-slate-700" />
              <span>{booking.address}</span>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="w-12 h-12 bg-slate-100 border-2 border-slate-300 rounded-full flex items-center justify-center text-slate-800 hover:bg-slate-200 hover:text-black transition-colors shadow-sm shrink-0 cursor-pointer"
          >
            <X className="w-7 h-7 font-bold" />
          </button>
        </div>

        {/* NỘI DUNG CHÍNH - Chia 2 cột tỷ lệ bằng nhau hoàn hảo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* CỘT TRÁI (Hình ảnh + Thời gian & Thanh toán) */}
          <div className="space-y-8 flex flex-col">
            
            {/* HÌNH ẢNH */}
            <div className="rounded-[1.5rem] overflow-hidden h-[270px] shadow-sm border-2 border-slate-200 shrink-0">
              <img
                src="/xedep.jpg"
                className="w-full h-full object-cover"
                alt="Hình bãi đỗ xe"
              />
            </div>

            {/* THẺ ĐƯỢC CHUYỂN SANG: Thời gian & Tổng tiền (Nằm song song thẻ KH&Xe) */}
            <div className="bg-white rounded-[1.5rem] p-6 lg:p-7 shadow-sm border-2 border-slate-200 flex-1">
                <h4 className="text-[16px] font-black text-slate-800 mb-8 uppercase tracking-widest flex items-center gap-2.5">
                  <Clock className="w-6 h-6 text-blue-700" />
                  Thời gian & Thanh toán
                </h4>

                <div className="space-y-6">
                  {/* Hàng Thời gian */}
                  <div className="flex items-center justify-between p-4 lg:p-6 rounded-2xl bg-slate-100 border-2 border-slate-300">
                    <div className="flex-1">
                      <p className="text-[13px] text-slate-700 font-black mb-2.5 uppercase tracking-widest">Thời gian vào</p>
                      <p className="font-black text-slate-900 text-[26px] leading-tight mb-1">{booking.start_time}</p>
                      <p className="text-[17px] text-slate-800 font-bold">{booking.start_date}</p>
                    </div>
                    
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center border-2 border-slate-300 shadow-md shrink-0 mx-4 pb-0.5">
                       <ArrowRight className="w-7 h-7 text-slate-700 font-bold" />
                    </div>
                    
                    <div className="flex-1 text-right">
                      <p className="text-[13px] text-slate-700 font-black mb-2.5 uppercase tracking-widest">Thời gian ra</p>
                      <p className="font-black text-slate-900 text-[26px] leading-tight mb-1">{booking.end_time}</p>
                      <p className="text-[17px] text-slate-800 font-bold">{booking.end_date}</p>
                    </div>
                  </div>

                  {/* Hàng Tổng tiền */}
                  <div className="flex items-end justify-between pt-6 border-t-2 border-slate-200 pb-2">
                    <p className="text-[15px] text-slate-800 font-black uppercase tracking-widest mb-2">Tổng tiền</p>
                    <p className="font-black text-red-600 text-[36px] tracking-tight leading-none drop-shadow-sm">
                      {booking.total_price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.total_price) : "0 ₫"}
                    </p>
                  </div>
                </div>

            </div>

          </div>

          {/* CỘT PHẢI (Thông tin vé & Khách hàng/Xe) */}
          <div className="space-y-8 flex flex-col">
            
             {/* THẺ 1: Chi tiết vé đặt */}
             <div className="bg-white rounded-[1.5rem] p-6 lg:p-7 shadow-sm border-2 border-slate-200">
                <h4 className="text-[16px] font-black text-slate-800 mb-8 uppercase tracking-widest flex items-center gap-2.5">
                  <FileText className="w-6 h-6 text-blue-700" />
                  Chi tiết vé đặt
                </h4>
                
                <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-[13px] text-slate-700 font-black mb-2.5 uppercase tracking-widest">Mã vé (ID)</p>
                    <p className="font-black text-slate-900 text-lg break-words leading-tight">{booking.id}</p>
                  </div>
                  <div>
                    <p className="text-[13px] text-slate-700 font-black mb-2.5 uppercase tracking-widest">Vị trí đỗ</p>
                    <p className="font-black text-blue-800 text-2xl bg-blue-100 w-fit px-5 py-2 rounded-xl border-2 border-blue-300">{booking.code}</p>
                  </div>
                  <div>
                    <p className="text-[13px] text-slate-700 font-black mb-2.5 uppercase tracking-widest">Khu vực</p>
                    <p className="font-black text-slate-900 text-[21px]">{booking.floor_zone && booking.floor_zone !== "N/A" ? booking.floor_zone : "Không có"}</p>
                  </div>
                  <div>
                    <p className="text-[13px] text-slate-700 font-black mb-2.5 uppercase tracking-widest">Tầng đỗ xe</p>
                    <p className="font-black text-slate-900 text-[21px]">
                      {booking.floor_name && booking.floor_name !== "N/A" 
                        ? booking.floor_name 
                        : (booking.floor_number && booking.floor_number !== "N/A" ? `Tầng ${booking.floor_number}` : "Không có")}
                    </p>
                  </div>
                </div>
             </div>

             {/* THẺ 2: Khách hàng & Phương tiện */}
             <div className="bg-white rounded-[1.5rem] p-6 lg:p-7 shadow-sm border-2 border-slate-200 flex-1">
                <h4 className="text-[16px] font-black text-slate-800 mb-8 uppercase tracking-widest flex items-center gap-2.5">
                  <Car className="w-6 h-6 text-blue-700" />
                  Khách hàng & Phương tiện
                </h4>
                
                <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-[13px] text-slate-700 font-black mb-2.5 uppercase tracking-widest">Khách hàng</p>
                    <p className="font-black text-slate-900 text-xl leading-tight">
                      {booking.user_name || booking.userName || booking.customer_name || "Chưa cập nhật"}
                    </p>
                  </div>
                  <div>
                     <p className="text-[13px] text-slate-700 font-black mb-2.5 uppercase tracking-widest">Loại xe</p>
                     <p className="font-black text-slate-900 text-xl leading-tight">
                       {booking.vehicle_type || booking.type || "Chưa cập nhật"}
                     </p>
                  </div>
                  <div className="col-span-2">
                     <p className="text-[13px] text-slate-700 font-black mb-2.5 uppercase tracking-widest">Biển số xe</p>
                     <p className="font-black text-slate-900 text-[24px] bg-slate-100 w-fit px-6 py-3 rounded-xl border-2 border-slate-300 tracking-wider">
                       {booking.license_plate || booking.plate_number || "Chưa đánh biển số"}
                     </p>
                  </div>
                </div>
             </div>

          </div>

        </div>

        {/* NÚT ĐÓNG FOOTER */}
        <div className="flex justify-end mt-10 pt-8 border-t-2 border-slate-200">
          <button
            onClick={onClose}
            className="px-14 py-5 bg-black hover:bg-slate-900 text-white rounded-2xl font-black text-xl shadow-xl transition-all active:scale-95 border-2 border-slate-800 cursor-pointer"
          >
            Đóng cửa sổ
          </button>
        </div>

      </div>
    </div>
  );
}
export default DetailHistoryBooking;
