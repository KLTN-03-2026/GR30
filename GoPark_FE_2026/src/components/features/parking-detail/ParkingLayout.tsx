"use client";
import React, { useState } from "react";

const rows = [
  { id: "A", spots: [1, 2, 3, 4, 5, 6] },
  { id: "B", spots: [1, 2, 3, 4, 5, 6] },
  { id: "C", spots: [1, 2, 3, 4, 5, 6] },
];

const mockOccupied = ["A-2", "A-5", "B-1", "B-2", "C-6"];

export function ParkingLayout() {
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);

  const handleSelect = (spotId: string) => {
    if (mockOccupied.includes(spotId)) return;
    setSelectedSpot(spotId === selectedSpot ? null : spotId);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Sơ đồ bãi đỗ ô tô</h2>

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
          <div className="w-6 h-6 rounded bg-blue-500 border border-blue-600"></div>
          <span>Đang chọn</span>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-x-auto">
        <div className="min-w-[400px] flex flex-col gap-8 items-center">
            {rows.map((row) => (
              <div key={row.id} className="flex gap-4 items-center">
                <div className="w-8 font-bold text-gray-500 dark:text-gray-400 text-center">{row.id}</div>
                <div className="flex gap-3">
                  {row.spots.map((spot) => {
                    const spotId = `${row.id}-${spot}`;
                    const isOccupied = mockOccupied.includes(spotId);
                    const isSelected = selectedSpot === spotId;

                    return (
                      <button
                        key={spotId}
                        onClick={() => handleSelect(spotId)}
                        disabled={isOccupied}
                        className={`w-12 h-16 rounded-md flex items-center justify-center font-semibold text-sm transition-all
                          ${isOccupied ? "bg-red-100 dark:bg-red-900/40 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800 cursor-not-allowed" : 
                            isSelected ? "bg-blue-500 text-white shadow-md transform scale-105" : 
                            "bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          }`}
                      >
                        {spot}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {/* Lối đi */}
            <div className="w-full text-center border-t-2 border-dashed border-gray-300 dark:border-gray-600 pt-4 mt-2 font-semibold text-gray-400 dark:text-gray-500">
               Lối Vào / Ra
            </div>
        </div>
      </div>
    </div>
  );
}
