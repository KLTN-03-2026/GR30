import React, { useId } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number; 
  size?: number;  
}

export function StarRating({ rating, size = 20 }: StarRatingProps) {
  const uniqueId = useId(); // Tạo ID duy nhất để tránh xung đột Gradient giữa các bãi xe
  const avg = Number(rating);

  return (
    <div className="flex items-center gap-0.5">
      {/* Định nghĩa dải màu (Gradient) cho ngôi sao lẻ */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id={`star-grad-${uniqueId}`}>
            {/* Phần trăm màu vàng dựa trên phần thập phân (vd: 0.3 -> 30%) */}
            <stop offset={`${(avg % 1) * 100}%`} stopColor="#eab308" />
            {/* Phần còn lại là màu xám nhạt */}
            <stop offset={`${(avg % 1) * 100}%`} stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
      </svg>

      {[1, 2, 3, 4, 5].map((star) => {
        // 1. Nếu star <= phần nguyên (vd: 4): Sao đầy vàng
        const isFull = star <= Math.floor(avg);
        // 2. Nếu star là phần kế tiếp và có số lẻ: Dùng gradient
        const isHalf = star === Math.ceil(avg) && avg % 1 !== 0;

        return (
          <Star
            key={star}
            size={size}
            // Logic đổ màu: Vàng nguyên bản | Gradient lẻ | Không màu
            fill={isFull ? "#eab308" : isHalf ? `url(#star-grad-${uniqueId})` : "none"}
            // Màu viền (Stroke)
            stroke={isFull || isHalf ? "#eab308" : "#d1d5db"}
            strokeWidth={1.5}
          />
        );
      })}
    </div>
  );
}