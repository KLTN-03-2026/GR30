import React from "react";
import { Star, MapPin, Banknote } from "lucide-react";

const suggestedParkings = [
  {
    id: 1,
    name: "Bãi đỗ xe Vincom Center",
    image: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?q=80&w=400&auto=format&fit=crop",
    address: "72 Lê Thánh Tôn, Bến Nghé, Quận 1",
    distance: "0.5 km",
    price: "20.000đ/giờ",
    rating: 4.9,
  },
  {
    id: 2,
    name: "Bãi đỗ xe Nguyễn Huệ",
    image: "https://images.unsplash.com/photo-1604063155776-081e7e45fcc3?q=80&w=400&auto=format&fit=crop",
    address: "Đường Nguyễn Huệ, Quận 1",
    distance: "0.8 km",
    price: "15.000đ/giờ",
    rating: 4.6,
  },
  {
    id: 3,
    name: "Bãi đỗ xe Bitexco",
    image: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?q=80&w=400&auto=format&fit=crop",
    address: "2 Hải Triều, Bến Nghé, Quận 1",
    distance: "1.2 km",
    price: "25.000đ/giờ",
    rating: 4.8,
  },
  {
    id: 4,
    name: "Bãi đỗ Lê Lợi Parking",
    image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=400&auto=format&fit=crop",
    address: "Đường Lê Lợi, Bến Thành, Quận 1",
    distance: "1.5 km",
    price: "15.000đ/giờ",
    rating: 4.5,
  }
];

export function SuggestedParking() {
  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Các bãi đỗ xe gợi ý gần đây</h2>
        <button className="text-blue-600 dark:text-blue-400 font-medium text-sm hover:underline">
          Xem tất cả
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {suggestedParkings.map((parking) => (
          <div key={parking.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all cursor-pointer">
            <div className="aspect-[4/3] w-full bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
              <img 
                src={parking.image} 
                alt={parking.name} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1 shadow-sm">
                <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                {parking.rating}
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1" title={parking.name}>
                {parking.name}
              </h3>
              
              <div className="space-y-1.5 mt-2">
                <div className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{parking.address}</span>
                </div>
                
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 dark:border-gray-700">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400">
                    <Banknote className="w-4 h-4" />
                    <span>{parking.price}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    Cách {parking.distance}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
