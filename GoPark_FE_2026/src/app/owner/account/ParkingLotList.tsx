"use client";

import React from "react";
import { ParkingLotType } from "@/types/owner";

interface ParkingLotListProps {
  parkingLots: ParkingLotType[];
  isLoading: boolean;
}

export default function ParkingLotList({
  parkingLots,
  isLoading,
}: ParkingLotListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-44 rounded-xl bg-gray-100 animate-pulse border border-gray-200"
          ></div>
        ))}
      </div>
    );
  }

  if (parkingLots.length === 0) {
    return (
      <div className="p-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <svg
          className="w-12 h-12 text-gray-300 mx-auto mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          ></path>
        </svg>
        <p className="text-gray-500 font-medium">Không tìm thấy bãi đỗ xe nào.</p>
        <p className="text-gray-400 text-sm mt-1">
          Bạn chưa thêm bãi đỗ xe nào.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {parkingLots.map((lot) => (
        <div
          key={lot.id}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-indigo-100 transition-all group"
        >
          <div className="p-6">
            <h3
              className="text-lg font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-1"
              title={lot.name}
            >
              {lot.name}
            </h3>

            <div className="flex items-start gap-2 text-gray-600 mb-5 h-10">
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
              <p className="text-sm line-clamp-2">{lot.address}</p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                Tổng số chỗ
              </span>
              <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-bold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                {lot.totalSlots}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
