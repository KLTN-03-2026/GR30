"use client";
import React, { useState } from "react";
import { TopFilter } from "@/components/features/findParking/TopFilter";
import { ParkingMap } from "@/components/features/findParking/ParkingMap";
import { ParkingList } from "@/components/features/findParking/ParkingList";

export default function FindParkingPage() {
  const [destination, setDestination] = useState<{lng: number, lat: number, name: string} | null>(null);

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden">
      {/* TopFilter - Trả về luồng hiển thị chuẩn */}
      <div className="w-full z-50">
        <TopFilter onSearch={setDestination} />
      </div>
      
      {/* Container cho Map và List nằm cạnh nhau */}
      <div className="flex flex-1 relative overflow-hidden z-0">
        {/* Danh sách bãi đỗ xe cạnh trái */}
        <ParkingList />
        
        {/* Bản đồ */}
        <ParkingMap destination={destination} />
      </div>
    </div>
  );
}
