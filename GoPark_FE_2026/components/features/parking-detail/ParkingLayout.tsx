"use client";
import React, { useContext, useState } from "react";
import { ParkingContext } from "./ParkingContext";

export function ParkingLayout() {

  const context = useContext(ParkingContext);
  if (!context) return null;
  const { dataLot,selectedSpot,setSelectedSpot } = context;
  console.log(dataLot);

  const handleSelect = (floor : any,zone : any,slot :any) => {
    
    const selection = {
    floorName: floor.floor_name,
    zoneName: zone.zone_name,
    zoneId : zone.id,
    slot: slot
  };
    setSelectedSpot(selection);
  };
  console.log("Data Lot in ParkingLayout:", dataLot);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Sơ đồ bãi đỗ ô tô :   {dataLot.name}</h2>

      {/* Chú thích */}
      <div className="flex justify-center gap-6 mb-8 text-sm text-gray-700 dark:text-gray-300">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"></div>
          <span>Trống</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-800"></div>
          <span>Đã đặt</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-blue-500 border border-blue-600 shadow-sm"></div>
          <span>Đang chọn</span>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-x-auto">
        <div className="min-w-[400px] flex flex-col gap-10 items-center">
          
          {/* 1. Lặp qua từng tầng (Floors) */}
          {dataLot.parkingFloor?.map((floor: any, index: number) => (
            <div key={floor.id || index} className="w-full flex flex-col gap-8 mb-5">
              
              {/* Hiển thị tầng rõ ràng, đẹp mắt với thanh gạch ngang */}
              <div className="flex items-center gap-4 w-full px-2">
                <div className="h-px flex-1 bg-gray-300 dark:bg-gray-600"></div>
                <div className="px-5 py-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold rounded-full text-xs uppercase tracking-widest border border-gray-300 dark:border-gray-600 shadow-sm">
                   {floor.floor_name}
                </div>
                <div className="h-px flex-1 bg-gray-300 dark:bg-gray-600"></div>
              </div>

              {/* 2. Lặp qua khu vực bên trong Tầng */}
              <div className="flex justify-center w-full">
                <div className="flex flex-col gap-10">
                  {floor.parkingZones?.map((zone: any) => (
                    <div key={zone.id} className="flex gap-6 items-start">
                      
                      {/* Nhãn Khu vực - Cố định độ rộng để thẳng hàng tuyệt đối */}
                      <div className="w-28 shrink-0 font-bold text-gray-500 dark:text-gray-400 text-right text-base pt-2">
                        {zone.zone_name}
                      </div>

                      {/* 3. Lặp qua từng vị trí đỗ (Slots) */}
                      <div className="flex gap-3 flex-wrap">
                        {zone.slot
                        ?.slice() // Tạo bản sao mảng để tránh lỗi "read-only"
                        .sort((a: any, b: any) => {
                          // Sắp xếp theo ID (tăng dần) - vì ID tạo trước sẽ nhỏ hơn
                          // Hoặc sắp xếp theo slot.code nếu bạn muốn theo tên A1, A2, A3...
                          return a.id - b.id; 
                        })
                          .map((slot: any) => {
                          const isAvailable = slot.status !== "AVAILABLE";
                          const isSelected = selectedSpot?.slot.id === slot.id;


                          return (
                            <button
                              key={slot.id}
                              onClick={() => handleSelect(floor,zone,slot)}
                              disabled={isAvailable}
                              className={`w-12 h-16 rounded-md flex items-center justify-center font-semibold text-sm transition-all
                                ${isAvailable 
                                  ? "bg-red-100 dark:bg-red-900/40 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800 cursor-not-allowed" 
                                  : isSelected 
                                    ? "bg-blue-500 text-white shadow-md transform scale-105 border-transparent" 
                                    : "bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                }`}
                            >
                              {/* Lấy 1 hoặc 2 chữ số cuối (ví dụ A1 -> 1) */}
                              {slot.code?.match(/\d+/)?.[0] || slot.code}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ))}

          {/* Lối đi chung */}
          <div className="w-full text-center border-t-2 border-dashed border-gray-300 dark:border-gray-600 pt-5 mt-2 font-bold text-gray-400 dark:text-gray-500 tracking-widest text-xs uppercase">
            Lối Vào / Ra
          </div>
        </div>
      </div>
    </div>
  );
}
