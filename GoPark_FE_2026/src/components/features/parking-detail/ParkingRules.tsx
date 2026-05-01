import React from "react";
import { AlertCircle, ShieldCheck, Clock3, Ban } from "lucide-react";

export function ParkingRules() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-5 transition-colors">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-blue-600" />
        Quy định & Chính sách
      </h2>
      
      <ul className="space-y-4">
        <li className="flex items-start gap-3">
          <Clock3 className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-gray-800 dark:text-gray-200">Thời gian giữ chỗ</p>
            <p className="text-gray-500 dark:text-gray-400 mt-0.5">Hệ thống sẽ giữ chỗ của bạn trong <span className="font-medium text-gray-700 dark:text-gray-300">30 phút</span> kể từ giờ vào dự kiến. Quá thời gian, vé có thể bị hủy.</p>
          </div>
        </li>
        
        <li className="flex items-start gap-3">
          <Ban className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-gray-800 dark:text-gray-200">Chính sách hủy vé</p>
            <p className="text-gray-500 dark:text-gray-400 mt-0.5">Được phép hủy vé miễn phí trước <span className="font-medium text-gray-700 dark:text-gray-300">1 giờ</span> so với giờ vào dự kiến.</p>
          </div>
        </li>
        
        <li className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-gray-800 dark:text-gray-200">Lưu ý an toàn</p>
            <p className="text-gray-500 dark:text-gray-400 mt-0.5">Không để các vật dụng có giá trị cao hoặc chất dễ cháy nổ trên xe. Bãi đỗ không chịu trách nhiệm cho tài sản cá nhân trong xe.</p>
          </div>
        </li>
      </ul>
      
      <div className="mt-5 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800/30">
        <p className="text-xs text-blue-700 dark:text-blue-300 text-center font-medium">
          Hotline hỗ trợ khẩn cấp: 1900 1234
        </p>
      </div>
    </div>
  );
}
