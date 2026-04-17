"use client";

import { useEffect, useState, useRef } from "react";
import { Map, MapControls, useMap, MapMarker, MarkerContent, MapRoute, MarkerLabel, MapRef } from "@/components/ui/map";
import { Button } from "@/components/ui/button";
import { RotateCcw, Mountain, LocateFixed, Layers, Route, Clock, Loader2, MapPin } from 'lucide-react';

const mapStyles = {
  default: undefined,
  openstreetmap: 'https://tiles.openfreemap.org/styles/bright',
  openstreetmap3d: 'https://tiles.openfreemap.org/styles/liberty',
};

type StyleKey = keyof typeof mapStyles;

interface RouteData {
  coordinates: [number, number][];
  duration: number; // seconds
  distance: number; // meters
}

function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} phút`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}g ${remainingMins}p`;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

// Controller quản lý các sự kiện click và trạng thái myLocation
function MapController({ 
  mapStyle, 
  onStyleChange,
  myLocation,
  setMyLocation,
}: { 
  mapStyle: StyleKey; 
  onStyleChange: (style: StyleKey) => void;
  myLocation: [number, number] | null;
  setMyLocation: (loc: [number, number] | null) => void;
}) {
  const { map, isLoaded } = useMap();
  const [pitch, setPitch] = useState(0);
  const [bearing, setBearing] = useState(0);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (!map || !isLoaded) return;
    const handleMove = () => {
      setPitch(Math.round(map.getPitch()));
      setBearing(Math.round(map.getBearing()));
    };
    map.on("move", handleMove);
    handleMove();
    return () => { map.off("move", handleMove); };
  }, [map, isLoaded]);

  const handle3DView = () => {
    map?.easeTo({ pitch: 60, bearing: -20, duration: 1000 });
  };

  const handleReset = () => {
    map?.easeTo({ pitch: 0, bearing: 0, duration: 1000 });
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ Geolocation");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        setMyLocation([longitude, latitude]);
        map?.flyTo({ center: [longitude, latitude], zoom: 16, duration: 1500 });
        setIsLocating(false);
      },
      (error) => {
        console.error("Lỗi lấy vị trí:", error);
        alert("Không thể lấy vị trí của bạn.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  if (!isLoaded) return null;

  return (
    <>
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap lg:flex-nowrap justify-between items-start gap-3 pointer-events-none">
        {/* Nhóm trái: Buttons & Pitch */}
        <div className="flex flex-col gap-2 pointer-events-auto max-w-full">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={handle3DView} className="shadow-sm">
              <Mountain className="size-4 mr-1.5" />
              <span className="hidden sm:inline">3D View</span><span className="sm:hidden">3D</span>
            </Button>
            <Button size="sm" variant="secondary" onClick={handleReset} className="shadow-sm">
              <RotateCcw className="size-4 mr-1.5" />Reset
            </Button>
            <Button
              size="sm"
              variant={myLocation ? "default" : "secondary"}
              onClick={handleLocateMe}
              disabled={isLocating}
              className="shadow-sm truncate"
            >
              <LocateFixed className={`size-4 mr-1.5 ${isLocating ? "animate-pulse" : ""}`} />
              <span className="hidden sm:inline">{isLocating ? "Đang tìm..." : "Vị trí của tôi"}</span>
              <span className="sm:hidden">{isLocating ? "Tìm..." : "Vị trí"}</span>
            </Button>
          </div>
          <div className="rounded-md bg-background/90 backdrop-blur px-3 py-2 text-xs font-mono border shadow-sm w-fit">
            <div>Pitch: {pitch}°</div>
            <div>Bearing: {bearing}°</div>
          </div>
        </div>

        {/* Nhóm phải: Chọn loại bản đồ */}
        <div className="pointer-events-auto max-w-full">
          <div className="flex items-center gap-2 bg-background/90 backdrop-blur p-1 rounded-md border shadow-sm w-fit">
            <Layers className="size-4 ml-2 text-muted-foreground shrink-0" />
            <select
              value={mapStyle}
              onChange={(e) => onStyleChange(e.target.value as StyleKey)}
              className="bg-transparent border-none text-sm focus:ring-0 cursor-pointer p-1 py-1.5 min-w-[120px] max-w-full outline-none text-foreground dark:bg-zinc-900"
            >
              <option value="default" className="bg-background text-foreground">GoPark (Mặc định)</option>
              <option value="openstreetmap" className="bg-background text-foreground">GoPark Map</option>
              <option value="openstreetmap3d" className="bg-background text-foreground">GoPark Map 3D</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );
}

export function ParkingMap({ 
  destination,
  parkingLots = [],
  selectedParkingLot,
  setSelectedParkingLot,
  directionRoute,
  isNavigating
}: { 
  destination?: {lng: number, lat: number, name: string} | null,
  parkingLots?: any[],
  selectedParkingLot?: any | null,
  setSelectedParkingLot?: (lot: any) => void,
  directionRoute?: {coordinates: [number, number][]} | null,
  isNavigating?: boolean
}) {
  const mapRef = useRef<MapRef>(null);
  const [mapStyle, setMapStyle] = useState<StyleKey>("default");
  const selectedStyleUrl = mapStyles[mapStyle];
  const is3D = mapStyle === "openstreetmap3d";

  const [myLocation, setMyLocation] = useState<[number, number] | null>(null);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Automatically zoom to selected parking lot
  useEffect(() => {
    if (selectedParkingLot && mapRef.current) {
      mapRef.current.flyTo({
        center: [Number(selectedParkingLot.lng), Number(selectedParkingLot.lat)],
        zoom: 16,
        duration: 2000
      });
    }
  }, [selectedParkingLot]);

  useEffect(() => {
    if (mapRef.current && is3D) {
      mapRef.current.easeTo({ pitch: 60, duration: 500 });
    }
  }, [is3D]);

  // Automatically zoom to fit the direction route
  useEffect(() => {
    if (directionRoute && mapRef.current) {
      if (isNavigating) return; // When navigating, camera is handled by navigation effect
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const maplibregl = (window as any).maplibregl;
      if (maplibregl) {
        const bounds = new maplibregl.LngLatBounds();
        directionRoute.coordinates.forEach(coord => bounds.extend(coord));
        mapRef.current.fitBounds(bounds, { padding: 50, duration: 1500 });
      }
    }
  }, [directionRoute, isNavigating]);

  // Handle Navigation mode
  useEffect(() => {
    let watchId: number | null = null;

    if (isNavigating && navigator.geolocation) {
      // 1. Enable 3D mode inherently
      setMapStyle("openstreetmap3d");

      // 2. Start tracking position
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { longitude, latitude, heading } = position.coords;
          const newPos: [number, number] = [longitude, latitude];
          setMyLocation(newPos);
          
          if (mapRef.current) {
            mapRef.current.easeTo({
              center: newPos,
              zoom: 19,
              pitch: 75,
              bearing: heading || 0, // orient forward if heading available
              duration: 1000 // smooth transition
            });
          }
        },
        (err) => console.error("Navigation position error:", err),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );

    } else if (!isNavigating && mapRef.current) {
      // Reset pitch when stopping navigation
      mapRef.current.easeTo({ pitch: 0, bearing: 0, duration: 1000 });
      setMapStyle("default");
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [isNavigating]);

  useEffect(() => {
    if (!myLocation || !destination) {
      setRoutes([]);
      return;
    }

    async function fetchRoutes() {
      setIsLoadingRoute(true);
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${myLocation![0]},${myLocation![1]};${destination!.lng},${destination!.lat}?overview=full&geometries=geojson&alternatives=true`
        );
        const data = await response.json();

        if (data.routes?.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const routeData: RouteData[] = data.routes.map((route: any) => ({
            coordinates: route.geometry.coordinates,
            duration: route.duration,
            distance: route.distance,
          }));
          setRoutes(routeData);
          setSelectedIndex(0);

          // Tự động zoom thấy cả 2 điểm
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (mapRef.current && (window as any).maplibregl) {
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
             const maplibregl = (window as any).maplibregl;
             const bounds = new maplibregl.LngLatBounds();
             bounds.extend(myLocation as [number, number]);
             bounds.extend([destination!.lng, destination!.lat]);
             mapRef.current.fitBounds(bounds, { padding: { top: 120, bottom: 120, left: 120, right: 120 }, duration: 1500 });
          }
        } else {
           alert("Không tìm thấy đường đi khả dụng!");
        }
      } catch (error) {
        console.error("Failed to fetch routes:", error);
      } finally {
        setIsLoadingRoute(false);
      }
    }

    fetchRoutes();
  }, [myLocation, destination]);

  const sortedRoutes = routes
    .map((route, index) => ({ route, index }))
    .sort((a, b) => {
      if (a.index === selectedIndex) return 1;
      if (b.index === selectedIndex) return -1;
      return 0;
    });

  return (
    <div className="flex-1 relative h-full bg-slate-100 flex flex-col border-l overflow-hidden">
      <Map
        ref={mapRef}
        center={[108.2022, 16.0544]}
        zoom={14}
        className="w-full h-full"
        styles={selectedStyleUrl ? { light: selectedStyleUrl, dark: selectedStyleUrl } : undefined}
      >
        <MapController mapStyle={mapStyle} onStyleChange={setMapStyle} myLocation={myLocation} setMyLocation={setMyLocation} />
        
        <MapControls />

        {/* Marker vị trí của tôi */}
        {myLocation && (
          <MapMarker longitude={myLocation[0]} latitude={myLocation[1]}>
            <MarkerContent>
              <div className="relative flex items-center justify-center">
                <div className="absolute h-8 w-8 animate-ping rounded-full bg-blue-500 opacity-50"></div>
                <div className="relative h-4 w-4 rounded-full border-2 border-white bg-blue-600 shadow-lg"></div>
              </div>
            </MarkerContent>
          </MapMarker>
        )}

        {/* Marker đích đến (kết quả tìm kiếm) */}
        {destination && (
          <MapMarker longitude={destination.lng} latitude={destination.lat}>
            <MarkerContent>
              <div className="size-5 rounded-full bg-red-500 border-2 border-white shadow-lg" />
              <MarkerLabel position="bottom">{destination.name}</MarkerLabel>
            </MarkerContent>
          </MapMarker>
        )}

        {/* Các bãi đỗ xe */}
        {parkingLots?.map((lot) => (
          <MapMarker 
            key={lot.id} 
            longitude={Number(lot.lng)} 
            latitude={Number(lot.lat)}
            onClick={(e) => {
              (e as any).originalEvent?.stopPropagation(); e.stopPropagation?.();
              setSelectedParkingLot?.(lot);
            }}
          >
            <MarkerContent className="cursor-pointer group">
              <div className={`p-2 rounded-xl border-2 shadow-lg transition-all ${selectedParkingLot?.id === lot.id ? 'bg-indigo-600 border-indigo-200 scale-125' : 'bg-primary border-primary-foreground hover:scale-110'}`}>
                 <Layers className="text-white size-4" />
              </div>
              <MarkerLabel position="bottom" className={`font-semibold bg-background/80 backdrop-blur ${selectedParkingLot?.id === lot.id ? 'text-indigo-600' : ''}`}>
                {lot.name}
              </MarkerLabel>
            </MarkerContent>
          </MapMarker>
        ))}

        {/* Đường dẫn */}
        {!directionRoute && sortedRoutes.map(({ route, index }) => {
          const isSelected = index === selectedIndex;
          return (
            <MapRoute
              key={index}
              coordinates={route.coordinates}
              color={isSelected ? "#6366f1" : "#94a3b8"}
              width={isSelected ? 6 : 5}
              opacity={isSelected ? 1 : 0.6}
              onClick={() => setSelectedIndex(index)}
            />
          );
        })}

        {directionRoute && (
          <MapRoute
            coordinates={directionRoute.coordinates}
            color="#10b981" // emerald-500
            width={6}
            opacity={1}
          />
        )}
      </Map>

      {/* Hiển thị Card Popup khi click vào Marker */}
      {selectedParkingLot && (
        <div className="absolute top-[80px] lg:top-4 right-1/2 transform translate-x-1/2 lg:translate-x-0 lg:right-4 z-50 pointer-events-auto bg-background shadow-2xl rounded-2xl p-4 w-11/12 max-w-sm border backdrop-blur-sm animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-primary truncate max-w-[80%]">{selectedParkingLot.name}</h3>
            <button onClick={() => setSelectedParkingLot?.(null)} className="text-muted-foreground hover:bg-muted p-1 rounded-full bg-secondary transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          
          <img src={selectedParkingLot.image || "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=400&h=200&q=80"} alt={selectedParkingLot.name} className="w-full h-32 object-cover rounded-xl mb-3 shadow-inner" />
          
          <div className="space-y-1.5 text-sm mb-4 text-muted-foreground">
            <p className="flex items-center gap-2"><MapPin className="size-4 shrink-0 text-indigo-500" /> <span className="line-clamp-2">{selectedParkingLot.address}</span></p>
            <p className="flex items-center gap-2"><Layers className="size-4 shrink-0 text-emerald-500" /> <span>Trống: <strong className="text-emerald-600">{selectedParkingLot.available_slots || 0}</strong> / {selectedParkingLot.total_slots || 0} chỗ</span></p>
            {selectedParkingLot.open_time && (
               <p className="flex items-center gap-2"><Clock className="size-4 shrink-0 text-orange-500" /> <span>{new Date(selectedParkingLot.open_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(selectedParkingLot.close_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></p>
            )}
              {(selectedParkingLot.minprice || selectedParkingLot.minPrice) && (
                 <p className="flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500 shrink-0"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                   <span>Chỉ từ <strong className="text-primary">{new Intl.NumberFormat('vi-VN').format(selectedParkingLot.minprice || selectedParkingLot.minPrice)}đ</strong>/giờ</span>
                 </p>
              )}
          </div>
          <div className="flex gap-2 w-full">
             <Button variant="outline" className="flex-1 rounded-xl shadow-sm border-gray-300 hover:bg-gray-100" onClick={() => {
                window.location.href = `/users/detailParking/${selectedParkingLot.id}`;
             }}>
               Chi tiết
             </Button>
             <Button className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-md" onClick={() => {
                window.location.href = `/users/myBooking/${selectedParkingLot.id}`;
             }}>
               Đặt chỗ ngay
             </Button>
          </div>
        </div>
      )}

      {/* Box hiển thị tuỳ chọn đường đi dưới góc trái, responsive */}
      {!directionRoute && routes.length > 0 && (
        <div className="absolute top-[80px] lg:top-auto sm:bottom-8 right-3 flex flex-col gap-2 z-10 bg-background/90 p-2 rounded-xl border shadow-lg backdrop-blur transition-all w-fit pointer-events-auto">
          {routes.map((route, index) => {
            const isActive = index === selectedIndex;
            const isFastest = index === 0;
            return (
              <Button
                key={index}
                variant={isActive ? "default" : "secondary"}
                size="sm"
                onClick={() => setSelectedIndex(index)}
                className="justify-start gap-2 shadow-sm w-full"
              >
                <div className="flex flex-col items-start leading-none min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 font-medium whitespace-nowrap">
                    <Clock className="size-3.5" />
                    <span>{formatDuration(route.duration)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] opacity-80 whitespace-nowrap">
                    <Route className="size-3" />
                    <span>{formatDistance(route.distance)}</span>
                  </div>
                </div>
                {isFastest && (
                  <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    Nhanh nhất
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      )}

      {/* Overlay loading router */}
      {isLoadingRoute && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center p-3 rounded-xl bg-background/80 backdrop-blur-sm shadow-xl">
          <Loader2 className="size-6 animate-spin text-primary" />
          <span className="ml-2 font-medium">Đang tìm đường...</span>
        </div>
      )}
    </div>
  )
}
