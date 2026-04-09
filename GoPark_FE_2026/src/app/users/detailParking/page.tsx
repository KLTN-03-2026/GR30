import React from "react";
import Link from "next/link";
import { ParkingInfo } from "@/components/features/parking-detail/ParkingInfo";
import { ParkingLayout } from "@/components/features/parking-detail/ParkingLayout";
import { BookingForm } from "@/components/features/parking-detail/BookingForm";
import { ParkingRules } from "@/components/features/parking-detail/ParkingRules";
import { ReviewsList } from "@/components/features/parking-detail/ReviewsList";
import { SuggestedParking } from "@/components/features/parking-detail/SuggestedParking";

export default function DetailParkingPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 py-6 transition-colors">
      <div className="container max-w-7xl mx-auto px-4 space-y-6">
        {/* Breadcrumb text */}
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
           <span><Link href="/" className="hover:text-blue-500 transition-colors">Trang chủ</Link></span> &gt; <span>Bãi đỗ xe</span> &gt; <span className="text-gray-900 dark:text-white font-medium">Bãi Đỗ Xe An Tâm</span>
        </div>

        {/* Khung Thông tin chi tiết */}
        <ParkingInfo />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Cột trái (Chiếm 2/3): Sơ đồ & Đánh giá */}
          <div className="lg:col-span-2 space-y-6">
            {/* Khung Sơ đồ vị trí đỗ */}
            <ParkingLayout />

            {/* Khung Đánh giá của khách hàng */}
            <ReviewsList />
          </div>

          {/* Cột phải (Chiếm 1/3) */}
          <div className="lg:col-span-1 space-y-6">
            <BookingForm />
            <ParkingRules />
          </div>
        </div>

        {/* Khung Các bãi đỗ xe gợi ý */}
        <div className="pt-4">
          <SuggestedParking />
        </div>
      </div>
    </div>
  );
}
