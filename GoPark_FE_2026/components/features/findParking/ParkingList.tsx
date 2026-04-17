"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Maximize2, Minimize2, ChevronRight, ChevronLeft, Loader2, Route, Clock, ArrowLeft, LocateFixed } from "lucide-react"

export function ParkingList({ parkingLots = [], loading = false, onSelectLot, selectedLotId, onRouteFound, onClearRoute, isNavigating, onStartNavigation }: { parkingLots?: any[], loading?: boolean, onSelectLot?: (lot: any) => void, selectedLotId?: number, onRouteFound?: (route: any) => void, onClearRoute?: () => void, isNavigating?: boolean, onStartNavigation?: () => void }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // States for directions
  const [directionLot, setDirectionLot] = useState<any | null>(null);
  const [routeInfo, setRouteInfo] = useState<{distance: number, duration: number, startName: string, endName: string, steps: any[]} | null>(null);
  const [isRouting, setIsRouting] = useState(false);

  const viewMode = isFullScreen ? "grid" : "list";
  const itemsPerPage = isFullScreen ? 12 : 5;
  const totalPages = Math.ceil(parkingLots.length / itemsPerPage);

  const displayedLots = parkingLots.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleGetDirections = (lot: any) => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ Geolocation");
      return;
    }
    setDirectionLot(lot);
    setIsRouting(true);
    setRouteInfo(null);
    if (onSelectLot) onSelectLot(lot);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { longitude, latitude } = position.coords;
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${longitude},${latitude};${lot.lng},${lot.lat}?overview=full&geometries=geojson&steps=true`);
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            setRouteInfo({
              distance: route.distance,
              duration: route.duration,
              startName: "Vị trí của bạn",
              endName: lot.address || lot.name,
              steps: route.legs && route.legs[0] ? route.legs[0].steps : []
            });
            if (onRouteFound) {
              onRouteFound({ coordinates: route.geometry.coordinates });
            }
          }
        } catch (error) {
          console.error("Lỗi tìm đường:", error);
          alert("Không thể tìm đường.");
        } finally {
          setIsRouting(false);
        }
      },
      (error) => {
        console.error("Lỗi lấy vị trí:", error);
        alert("Không thể lấy vị trí của bạn.");
        setIsRouting(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const formatDuration = (seconds: number) => {
    const m = Math.round(seconds / 60);
    if (m < 60) return `${m} phút`;
    return `${Math.floor(m/60)}g ${m%60}p`;
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

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

  const getManeuverTranslation = (maneuver: any) => {
    if (!maneuver) return 'Di chuyển';
    const type = maneuver.type;
    const modifier = maneuver.modifier;
    
    if (type === 'depart') return 'Bắt đầu từ';
    if (type === 'arrive') return 'Đến nơi';
    if (type === 'roundabout') return 'Đi vào vòng xuyến';
    if (type === 'continue') return 'Đi tiếp';
    
    switch (modifier) {
      case 'left': return 'Rẽ trái';
      case 'right': return 'Rẽ phải';
      case 'slight left': return 'Chếch sang trái';
      case 'slight right': return 'Chếch sang phải';
      case 'sharp left': return 'Rẽ gắt sang trái';
      case 'sharp right': return 'Rẽ gắt sang phải';
      case 'uturn': return 'Quay đầu';
      case 'straight': return 'Đi thẳng';
    }
    
    if (type === 'turn') return 'Rẽ';
    return 'Tiến tới';
  };

  return (
    <div className={`bg-background dark:bg-black border-r dark:border-white/10 h-full flex flex-col overflow-hidden transition-all duration-300 ease-in-out z-40 relative ${isFullScreen ? "w-full absolute inset-0 z-50" : "w-[350px] lg:w-[400px] shrink-0"}`}>
      <div className="p-4 border-b dark:border-white/10 flex items-center justify-between">
        <div className="font-medium text-lg dark:text-white">
          {directionLot ? "Chỉ đường" : `Kết quả tìm kiếm (${parkingLots.length})`}
        </div>
        <div className="flex items-center gap-1">
          {directionLot && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full dark:text-white dark:hover:bg-[#059669]"
              onClick={() => {
                setDirectionLot(null);
                setRouteInfo(null);
                if (onClearRoute) onClearRoute();
              }}
              title="Quay lại"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full dark:text-white dark:hover:bg-[#059669]"
            onClick={() => {
              setIsFullScreen(!isFullScreen)
              setCurrentPage(1)
            }}
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
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto p-4 ${!directionLot && viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-4"}`}>
        {directionLot ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <Card className="dark:bg-[#064e3b]/30 dark:border-white/20">
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-2">{directionLot.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{directionLot.address}</p>
                <div className="bg-muted p-4 rounded-lg flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Route className="w-5 h-5 text-primary shrink-0" />
                    <span>Vị trí của bạn &rarr; <strong>{directionLot.name}</strong></span>
                  </div>
                  
                  {isRouting ? (
                    <div className="flex items-center gap-2 text-primary font-medium mt-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang tính toán tuyến đường...</span>
                    </div>
                  ) : routeInfo ? (
                    <>
                      <div className="flex bg-background rounded-md border mt-2 overflow-hidden shadow-sm">
                        <div className="flex-1 p-3 flex flex-col items-center justify-center border-r">
                          <span className="text-xs text-muted-foreground uppercase font-semibold mb-1">Khoảng cách</span>
                          <span className="font-bold text-lg text-emerald-600">{formatDistance(routeInfo.distance)}</span>
                        </div>
                        <div className="flex-1 p-3 flex flex-col items-center justify-center">
                          <span className="text-xs text-muted-foreground uppercase font-semibold mb-1">Thời gian</span>
                          <span className="flex items-center font-bold text-lg text-blue-600"><Clock className="w-4 h-4 mr-1" /> {formatDuration(routeInfo.duration)}</span>
                        </div>
                      </div>
                      {routeInfo.steps && routeInfo.steps.length > 0 && (
                        <div className="mt-4 border-t pt-4">
                          <h4 className="font-semibold text-sm mb-3">Chi tiết lộ trình (<span className="text-primary">{routeInfo.steps.filter(s => s.maneuver?.type === 'turn' || ['left', 'right', 'sharp right', 'sharp left', 'slight left', 'slight right'].includes(s.maneuver?.modifier)).length}</span> ngã rẽ)</h4>
                          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                            {routeInfo.steps.map((step, idx) => (
                              <div key={idx} className="flex gap-3 text-sm items-start">
                                <div className="mt-0.5 shrink-0 bg-secondary/30 p-1.5 rounded text-primary">
                                  <Route className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col flex-1">
                                  <div>
                                    <span className="font-medium">{getManeuverTranslation(step.maneuver)}</span>
                                    {step.name && step.name !== "" && (
                                      <span> vào <span className="font-semibold text-primary">{step.name}</span></span>
                                    )}
                                  </div>
                                  {step.distance > 0 && (
                                    <span className="text-xs text-muted-foreground mt-0.5">{formatDistance(step.distance)}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!isNavigating && onStartNavigation ? (
                        <Button 
                          className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg" 
                          onClick={(e) => {
                            e.stopPropagation();
                            onStartNavigation();
                          }}
                        >
                          <LocateFixed className="w-5 h-5 mr-2" />
                          Bắt đầu đi
                        </Button>
                      ) : isNavigating ? (
                        <div className="mt-4 p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 rounded-xl text-center font-medium animate-pulse flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Đang điều hướng...
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="text-sm text-destructive mt-2">
                      Không thể tìm thấy tuyến đường. Vui lòng thử lại sau.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : parkingLots.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">Không tìm thấy bãi đỗ xe nào khu vực này</div>
        ) : (
          displayedLots.map((lot) => (
            <Card 
              key={lot.id} 
              className={`overflow-hidden hover:shadow-md transition-shadow cursor-pointer dark:bg-[#064e3b]/30 dark:border-white/20 ${selectedLotId === lot.id ? "ring-2 ring-primary border-primary" : ""}`}
              onClick={() => onSelectLot?.(lot)}
            >
              <div className="flex h-full">
                <div className={`relative shrink-0 ${viewMode === "grid" ? "w-1/3 min-w-[120px]" : "w-[120px]"}`}>
                  <img
                    src={lot.image || "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=400&h=200&q=80"}
                    alt={lot.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant={lot.available_slots > 0 ? "default" : "destructive"} className="text-[10px] uppercase font-bold py-0.5 px-1.5 shadow-sm">
                      {lot.available_slots > 0 ? "Còn chỗ" : "Hết chỗ"}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-3 flex-1 flex flex-col justify-between min-w-0">
                  <div className="space-y-1 mt-1">
                    <h3 className="font-bold text-base truncate pr-2 dark:text-white" title={lot.name}>{lot.name}</h3>
                    <p className="text-xs text-muted-foreground truncate dark:text-white/60" title={lot.address}>{lot.address}</p>
                  </div>
                  <div className="flex items-end justify-between mt-3 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground dark:text-white/60 uppercase font-medium tracking-wide">Trống</span>
                      <span className="font-bold text-lg leading-tight text-emerald-600 dark:text-emerald-400">
                        {lot.available_slots || 0} <span className="text-sm font-normal text-muted-foreground dark:text-white/60">/ {lot.total_slots || 0}</span>
                      </span>
                    </div>
                    {(lot.minprice || lot.minPrice) && (
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] text-muted-foreground dark:text-white/60 uppercase font-medium tracking-wide">Chỉ từ</span>
                        <span className="font-bold text-sm text-primary">
                          {new Intl.NumberFormat('vi-VN').format(lot.minprice || lot.minPrice)}đ/h
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Direction button inside Card in a new row */}
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full pointer-events-auto z-10 bg-secondary/50 hover:bg-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGetDirections(lot);
                      }}
                    >
                      <Route className="w-4 h-4 mr-2" />
                      Chỉ đường
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))
        )}
      </div>
      
      {!directionLot && totalPages > 1 && (
        <div className="p-3 border-t dark:border-white/10 flex items-center justify-between bg-muted/20 dark:bg-black/50">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="dark:border-white/30 dark:text-white dark:hover:bg-[#059669]"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Trước
          </Button>
          <span className="text-sm font-medium dark:text-white">
            Trang {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="dark:border-white/30 dark:text-white dark:hover:bg-[#059669]"
          >
            Sau <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
