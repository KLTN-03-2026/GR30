"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Maximize2, Minimize2, ChevronRight, ChevronLeft } from "lucide-react"

const MOCK_PARKING_LOTS = [
  { id: 1, name: "Bãi đỗ xe Vincom", address: "72 Lê Thánh Tôn, Q.1", distance: "1.2 km", available: 15, price: "20.000đ/giờ", image: "https://images.unsplash.com/photo-1590674899480-128a3915bc55?auto=format&fit=crop&q=80&w=500" },
  { id: 2, name: "Nhà xe Hầm Bitexco", address: "2 Hải Triều, Q.1", distance: "2.5 km", available: 5, price: "25.000đ/giờ", image: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&q=80&w=500" },
  { id: 3, name: "Bãi xe ngoài trời", address: "Nguyễn Huệ, Q.1", distance: "3.0 km", available: 0, price: "15.000đ/giờ", image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=500" },
  { id: 4, name: "Bãi gửi xe Phố đi bộ", address: "Tôn Thất Thiệp, Q.1", distance: "1.5 km", available: 20, price: "15.000đ/giờ", image: "https://images.unsplash.com/photo-1470224114660-3f6686c562eb?auto=format&fit=crop&q=80&w=500" },
  { id: 5, name: "Nhà xe Nguyễn Huệ", address: "115 Nguyễn Huệ, Q.1", distance: "2.0 km", available: 12, price: "20.000đ/giờ", image: "https://images.unsplash.com/photo-1524230572899-a752b38b584c?auto=format&fit=crop&q=80&w=500" },
  { id: 6, name: "Bãi xe Chợ Bến Thành", address: "Quách Thị Trang, Q.1", distance: "2.2 km", available: 8, price: "10.000đ/giờ", image: "https://images.unsplash.com/photo-1590674899480-128a3915bc55?auto=format&fit=crop&q=80&w=500" },
  { id: 7, name: "Bãi xe Nhà hát Thành. phố", address: "Công trường Lam Sơn, Q.1", distance: "1.8 km", available: 0, price: "25.000đ/giờ", image: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&q=80&w=500" },
  { id: 8, name: "Bãi xe Bưu điện", address: "Công xã Paris, Q.1", distance: "2.6 km", available: 30, price: "15.000đ/giờ", image: "https://images.unsplash.com/photo-1524230572899-a752b38b584c?auto=format&fit=crop&q=80&w=500" },
]

export function ParkingList() {
  const [isOpen, setIsOpen] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = isFullScreen ? 10 : 3;
  const totalPages = Math.ceil(MOCK_PARKING_LOTS.length / itemsPerPage);
  const paginatedLots = MOCK_PARKING_LOTS.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset trang nếu vượt quá trang tối đa
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  if (!isOpen) {
    return (
      <Button
        variant="secondary"
        size="icon"
        className="absolute top-1/2 -translate-y-1/2 left-4 z-[999] shadow-md rounded-full bg-white dark:bg-[#064e3b] dark:text-white dark:hover:bg-[#10b981]"
        onClick={() => setIsOpen(true)}
        title="Mở danh sách"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className={`
      bg-background dark:bg-black border-r dark:border-white/10 h-full flex flex-col overflow-hidden transition-all duration-300 ease-in-out z-40 relative
      ${isFullScreen ? "w-full absolute inset-0 z-50" : "w-[350px] lg:w-[400px] shrink-0"}
    `}>
      <div className="p-4 border-b dark:border-white/10 flex items-center justify-between">
        <div className="font-medium text-lg dark:text-white">
          Kết quả tìm kiếm ({MOCK_PARKING_LOTS.length})
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full dark:text-white dark:hover:bg-[#059669]"
            onClick={() => {
              setIsFullScreen(!isFullScreen)
              setCurrentPage(1)
            }}
            title={isFullScreen ? "Thu nhỏ" : "Phóng to"}
          >
            {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full dark:text-white dark:hover:bg-[#059669]"
            onClick={() => {
              setIsOpen(false);
              setIsFullScreen(false);
            }}
            title="Đóng danh sách"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto p-4 ${isFullScreen ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 content-start" : "space-y-4"}`}>
        {paginatedLots.map((lot) => (
          <Card key={lot.id} className="p-0 m-0 overflow-hidden cursor-pointer hover:border-primary transition-colors dark:bg-zinc-900 dark:border-white/10 dark:hover:border-[#10b981] flex flex-col">
            {/* Ảnh bãi xe */}
            <div className="w-full h-40 bg-zinc-200 dark:bg-zinc-800 shrink-0 overflow-hidden">
              <img src={lot.image} alt={lot.name} className="w-full h-full object-cover transition-transform hover:scale-105" />
            </div>
            
            <CardContent className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="font-semibold line-clamp-1 title dark:text-white">{lot.name}</h3>
                  <Badge variant={lot.available > 0 ? "default" : "destructive"} className={lot.available > 0 ? "dark:bg-[#10b981] dark:text-white shrink-0" : "shrink-0"}>
                    {lot.available > 0 ? `Còn ${lot.available} chỗ` : 'Hết chỗ'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground dark:text-white/60 mb-3 line-clamp-1">{lot.address}</p>
              </div>
              <div className="flex items-center justify-between text-sm mt-auto pt-2">
                <span className="font-medium text-primary dark:text-[#10b981]">{lot.price}</span>
                <span className="text-muted-foreground dark:text-white/60">{lot.distance}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="p-3 border-t dark:border-white/10 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/50">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="dark:border-white/20 dark:text-white dark:hover:bg-zinc-800"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Trước
          </Button>
          <span className="text-sm font-medium dark:text-white/80">
            Trang {currentPage} / {totalPages}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="dark:border-white/20 dark:text-white dark:hover:bg-zinc-800"
          >
            Tiếp <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}
