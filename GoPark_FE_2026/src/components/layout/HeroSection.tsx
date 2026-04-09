"use client";
import React, { useState, useEffect } from "react";
import { MapPin, Clock, Ticket, BadgeCheck, Zap, Navigation, Plus, User as UserIcon, Search, Settings, Send, PhoneCall, Shield, Home, Car, ChevronDown, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";

// Mock Data
const mockAllParkings = [
  {
    name: "GoPark Complex Quận Cẩm Lệ",
    address: "18, Hòa Nam 6, Hòa Nam, Đà Nẵng",
    status: "Mở cửa",
    timeOpen: "24/7",
    availableSpots: 89,
    totalSpots: 150,
    pricing: {
      firstHour: "25,000 VND",
      nextHour: "15,000 VND",
      overnight: "120,000 VND",
    },
    amenities: [
      { label: "Mái che", icon: Home, color: "text-blue-500" },
      { label: "Sạc xe EV", icon: Zap, color: "text-amber-500" },
      { label: "Bảo vệ 24/7", icon: Shield, color: "text-emerald-500" },
      { label: "Vé tháng", icon: Ticket, color: "text-purple-500" },
    ],
    bgImage: "book.png",
  },
  {
    name: "Bãi đỗ xe Trung tâm Vincom",
    address: "910A Ngô Quyền, Sơn Trà, Đà Nẵng",
    status: "Đang đông",
    timeOpen: "08:00 - 23:00",
    availableSpots: 12,
    totalSpots: 200,
    pricing: {
      firstHour: "30,000 VND",
      nextHour: "20,000 VND",
      overnight: "Không nhận",
    },
    amenities: [
      { label: "Trong nhà", icon: Home, color: "text-blue-500" },
      { label: "Bảo vệ 24/7", icon: Shield, color: "text-emerald-500" },
      { label: "Rửa xe", icon: Zap, color: "text-amber-500" },
    ],
    bgImage: "book.png", 
  },
  {
    name: "Bãi đỗ xe Sân bay Quốc tế",
    address: "Sân bay Đà Nẵng, Hải Châu, Đà Nẵng",
    status: "Mở cửa",
    timeOpen: "24/7",
    availableSpots: 150,
    totalSpots: 500,
    pricing: {
      firstHour: "15,000 VND",
      nextHour: "10,000 VND",
      overnight: "150,000 VND",
    },
    amenities: [
      { label: "Mái che", icon: Home, color: "text-blue-500" },
      { label: "Camera 24/7", icon: Shield, color: "text-emerald-500" },
      { label: "Đưa đón", icon: Navigation, color: "text-purple-500" },
    ],
    bgImage: "bg.jpg",
  }
];

// Mock Data - Nearby
const mockNearbyParkings = [
  { id: 1, name: "Bãi đỗ ngõ 28 Duy Tân", address: "Ngõ 28 Duy Tân, Cầu Giấy, Hà Nội", price: "20,000 VND/h", distance: "0.2 km", available: 12 },
  { id: 2, name: "Bãi đỗ TTC Tower", address: "19 Duy Tân, Cầu Giấy, Hà Nội", price: "25,000 VND/h", distance: "0.5 km", available: 5 },
  { id: 3, name: "Bãi đỗ xe Dịch Vọng Hậu", address: "Phố Dịch Vọng Hậu, Cầu Giấy", price: "15,000 VND/h", distance: "0.8 km", available: 30 },
  { id: 4, name: "Bãi đỗ xe Keangnam", address: "Phạm Hùng, Nam Từ Liêm", price: "30,000 VND/h", distance: "1.5 km", available: 120 },
];

const HeroSection = () => {
  const [isNameExpanded, setIsNameExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState("left");

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (activeTab !== "all") return;
    
    const interval = setInterval(() => {
      setSlideDirection("left");
      setCurrentIndex((prev) => (prev + 1) % mockAllParkings.length);
      setIsNameExpanded(false); // reset details when sliding
    }, 10000);

    return () => clearInterval(interval);
  }, [activeTab]);

  const handleNext = () => {
    setSlideDirection("left");
    setCurrentIndex((prev) => (prev + 1) % mockAllParkings.length);
    setIsNameExpanded(false);
  };

  const handlePrev = () => {
    setSlideDirection("right");
    setCurrentIndex((prev) => (prev - 1 + mockAllParkings.length) % mockAllParkings.length);
    setIsNameExpanded(false);
  };

  const currentParkingData = mockAllParkings[currentIndex];

  return (
    <section className="relative w-full min-h-screen bg-[#F0F2F5] dark:bg-stone-900 overflow-hidden font-sans p-4 sm:p-6 md:p-10 flex flex-col">
      
      {/* BACKGROUND GRADIENT/DECORATION */}
      <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-br from-gray-200 to-gray-100 dark:from-stone-800 dark:to-stone-900 -z-10 rounded-b-[3rem] md:rounded-b-[4rem]" />

      {/* HEADER NAV */}
      <header className="flex flex-col xl:flex-row justify-between items-center gap-4 z-10 w-full mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-center xl:text-left w-full xl:w-auto">
          Xin chào, <span className="font-semibold text-black dark:text-white capitalize">{user?.profile?.name || "bạn"}</span>
        </h1>

        <div className="flex bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-full shadow-sm p-1 overflow-x-auto w-full max-w-md sm:max-w-max justify-start sm:justify-center hide-scrollbar">
          <button 
            onClick={() => setActiveTab("all")}
            className={`px-4 sm:px-6 py-2 cursor-pointer rounded-full text-xs sm:text-sm font-semibold transition whitespace-nowrap ${activeTab === "all" ? "bg-white dark:bg-stone-800 shadow-sm text-black dark:text-white" : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium"}`}
          >
            Tất cả bãi đỗ
          </button>
          <button 
            onClick={() => setActiveTab("nearby")}
            className={`px-4 sm:px-6 py-2 cursor-pointer rounded-full text-xs sm:text-sm font-semibold transition whitespace-nowrap ${activeTab === "nearby" ? "bg-white dark:bg-stone-800 shadow-sm text-black dark:text-white" : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium"}`}
          >
            Gần tôi
          </button>
          <button 
            onClick={() => setActiveTab("map")}
            className={`px-4 sm:px-6 py-2 cursor-pointer rounded-full text-xs sm:text-sm font-semibold transition whitespace-nowrap ${activeTab === "map" ? "bg-white dark:bg-stone-800 shadow-sm text-black dark:text-white" : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium"}`}
          >
            Bản đồ
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full xl:w-auto justify-center">
          <div className="flex items-center bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-full px-3 py-2 sm:px-4 sm:py-2 shadow-sm text-xs sm:text-sm font-medium">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-gray-500" />
            Đà Nẵng, Việt Nam
          </div>
          <button className="w-9 h-9 sm:w-10 sm:h-10 bg-white/60 dark:bg-black/40 backdrop-blur-md flex justify-center items-center rounded-full shadow-sm">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* NEARBY PARKINGS VIEW */}
      {activeTab === 'nearby' && (
        <div className="flex-1 w-full mx-auto z-10 mt-6 animate-in fade-in slide-in-from-bottom-8">
          <div className="bg-white/60 dark:bg-stone-900/60 backdrop-blur-2xl rounded-[2rem] xl:rounded-[3rem] shadow-xl border border-white/40 dark:border-white/10 p-6 lg:p-10 flex flex-col min-h-[60vh]">
            <div className="flex justify-between items-center mb-8 shrink-0">
               <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                 <MapPin className="text-blue-500 w-8 h-8 animate-bounce" /> Bãi đỗ xe gần bạn
               </h2>
               <button onClick={() => setActiveTab('all')} className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 transition">
                 <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
               </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 overflow-y-auto custom-scrollbar flex-1 pb-4">
              {mockNearbyParkings.map(p => (
                 <div key={p.id} className="bg-white/90 dark:bg-stone-800/90 p-5 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-black/5 dark:border-white/5 cursor-pointer group hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-4">
                       <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                          <Car className="w-5 h-5" />
                       </div>
                       <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2.5 py-1.5 rounded-full">Còn {p.available} chỗ</span>
                    </div>
                    <h3 className="font-bold text-lg mb-1 truncate text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{p.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 min-h-[40px]">{p.address}</p>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-stone-700/50">
                       <div>
                         <p className="text-[10px] text-gray-400 uppercase font-semibold">Giá từ</p>
                         <p className="font-bold text-black dark:text-white">{p.price}</p>
                       </div>
                       <div className="text-right">
                         <p className="text-[10px] text-gray-400 uppercase font-semibold">Cách bạn</p>
                         <p className="font-bold text-blue-500">{p.distance}</p>
                       </div>
                    </div>
                 </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MAP VIEW */}
      {activeTab === 'map' && (
        <div className="flex-1 w-full mx-auto z-10 mt-6 animate-in fade-in slide-in-from-bottom-8">
          <div className="bg-white dark:bg-stone-900 rounded-[2rem] shadow-xl border border-gray-200 dark:border-stone-800 p-6 flex flex-col min-h-[70vh]">
            
            {/* Map Top Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
               
               <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                 <div className="flex items-center gap-2 border border-gray-200 dark:border-stone-700 rounded-xl px-4 py-2 bg-gray-50 dark:bg-stone-800/50">
                   <Clock className="w-4 h-4 text-gray-400" />
                   <span className="text-sm font-medium whitespace-nowrap">Pick a date</span>
                 </div>
                 
                 <div className="flex items-center gap-2">
                   <div className="flex items-center gap-2 border border-gray-200 dark:border-stone-700 rounded-xl px-4 py-2 bg-gray-50 dark:bg-stone-800/50 flex-1">
                     <Clock className="w-4 h-4 text-gray-400" />
                     <span className="text-sm font-medium">10:00</span>
                   </div>
                   <span className="text-gray-400">-</span>
                   <div className="flex items-center gap-2 border border-gray-200 dark:border-stone-700 rounded-xl px-4 py-2 bg-gray-50 dark:bg-stone-800/50 flex-1">
                     <Clock className="w-4 h-4 text-gray-400" />
                     <span className="text-sm font-medium">14:00</span>
                   </div>
                 </div>
               </div>
            </div>

            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-2 bg-white dark:bg-stone-800 border border-gray-200 dark:border-stone-700 px-4 py-2 rounded-xl">
                 <span className="font-bold text-lg">2nd Floor</span>
                 <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                Total Slots: <span className="text-black dark:text-white font-bold text-lg ml-1">45</span>
              </div>
            </div>

            {/* Parking Slots Diagram */}
            <div className="flex-1 flex justify-center items-center relative py-10 w-full overflow-x-auto min-w-[600px]">
              
              {/* Center Arrow / Road */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 border-l-2 border-dashed border-gray-200 dark:border-stone-700/50 flex flex-col items-center">
                 <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-gray-100 dark:border-b-stone-800 mt-2"></div>
              </div>

              <div className="flex gap-20">
                 {/* Left Column */}
                 <div className="flex flex-col gap-6 -mt-8">
                    {/* Block 1 */}
                    <div className="flex flex-col gap-3">
                       <div className="w-16 h-28 border-2 border-gray-200 dark:border-stone-700/50 rounded-xl flex items-center justify-center rotate-[30deg] text-xs font-bold text-gray-400 bg-white dark:bg-stone-800">A1</div>
                       <div className="w-16 h-28 border-2 border-gray-200 dark:border-stone-700/50 rounded-xl flex items-center justify-center rotate-[30deg] text-xs font-bold text-gray-400 bg-white dark:bg-stone-800">A3</div>
                       <div className="w-16 h-28 border-2 border-gray-200 dark:border-stone-700/50 rounded-xl flex items-center justify-center rotate-[30deg] relative bg-slate-100 dark:bg-stone-800/50 overflow-hidden">
                          <Car className="w-8 h-8 text-slate-400 dark:text-stone-500 -ml-2 rotate-90" />
                          <div className="absolute top-0 right-0 bottom-0 w-4 bg-slate-200 dark:bg-stone-700/50"></div>
                       </div>
                       <div className="w-16 h-28 border-2 border-gray-200 dark:border-stone-700/50 rounded-xl flex items-center justify-center rotate-[30deg] relative bg-slate-100 dark:bg-stone-800/50 overflow-hidden">
                          <Car className="w-8 h-8 text-slate-400 dark:text-stone-500 -ml-2 rotate-90" />
                          <div className="absolute top-0 right-0 bottom-0 w-4 bg-slate-200 dark:bg-stone-700/50"></div>
                       </div>
                       <div className="w-16 h-28 border-2 border-gray-200 dark:border-stone-700/50 rounded-xl flex items-center justify-center rotate-[30deg] text-xs font-bold text-gray-400 bg-white dark:bg-stone-800">A9</div>
                       <div className="w-16 h-28 border-2 border-gray-200 dark:border-stone-700/50 rounded-xl flex items-center justify-center rotate-[30deg] relative bg-white dark:bg-stone-800 overflow-hidden">
                          <Car className="w-8 h-8 text-slate-300 dark:text-stone-600 -ml-2 rotate-90" />
                       </div>
                    </div>
                 </div>

                 {/* Middle-Left Column */}
                 <div className="flex flex-col gap-6 mt-8">
                    <div className="flex flex-col gap-3">
                       <div className="w-16 h-28 border-2 border-gray-200 dark:border-stone-700/50 rounded-xl flex items-center justify-center rotate-[30deg] relative bg-white dark:bg-stone-800 overflow-hidden">
                          <Car className="w-8 h-8 text-slate-300 dark:text-stone-600 -ml-2 rotate-90" />
                       </div>
                       <div className="w-16 h-28 border-2 border-gray-200 dark:border-stone-700/50 rounded-xl flex items-center justify-center rotate-[30deg] relative bg-white dark:bg-stone-800 overflow-hidden">
                          <Car className="w-8 h-8 text-slate-300 dark:text-stone-600 -ml-2 rotate-90" />
                       </div>
                       <div className="w-16 h-28 border-2 border-gray-200 dark:border-stone-700/50 rounded-xl flex items-center justify-center rotate-[30deg] relative bg-slate-100 dark:bg-stone-800/50 overflow-hidden">
                          <Car className="w-8 h-8 text-slate-400 dark:text-stone-500 -ml-2 rotate-90" />
                          <div className="absolute top-0 right-0 bottom-0 w-4 bg-slate-200 dark:bg-stone-700/50"></div>
                       </div>
                       <div className="w-16 h-28 border-2 border-gray-200 dark:border-stone-700/50 rounded-xl flex items-center justify-center rotate-[30deg] text-xs font-bold text-gray-400 bg-white dark:bg-stone-800">A8</div>
                       <div className="w-16 h-28 border-2 border-gray-200 dark:border-stone-700/50 rounded-xl flex items-center justify-center rotate-[30deg] text-xs font-bold text-gray-400 bg-white dark:bg-stone-800">A10</div>
                       <div className="w-16 h-28 border-2 border-gray-200 dark:border-stone-700/50 rounded-xl flex items-center justify-center rotate-[30deg] text-xs font-bold text-gray-400 bg-white dark:bg-stone-800">A12</div>
                    </div>
                 </div>

                 {/* Center Gap for Road */}
                 <div className="w-12"></div>

                 {/* Middle-Right Column */}
                 <div className="flex flex-col gap-6 -mt-10 -ml-8">
                    <div className="flex flex-col gap-3">
                       <div className="w-16 h-28 border-2 border-gray-200 dark:border-stone-700/50 rounded-xl flex items-center justify-center -rotate-[30deg] text-xs font-bold text-gray-400 bg-white dark:bg-stone-800">A14</div>
                       <div className="w-16 h-28 border-2 border-gray-200 dark:border-stone-700/50 rounded-xl flex items-center justify-center -rotate-[30deg] text-xs font-bold text-gray-400 bg-white dark:bg-stone-800">A16</div>
                       <div className="w-16 h-28 border-2 border-gray-200 dark:border-stone-700/50 rounded-xl flex items-center justify-center -rotate-[30deg] relative bg-slate-100 dark:bg-stone-800/50 overflow-hidden">
                          <Car className="w-8 h-8 text-slate-400 dark:text-stone-500 ml-2 rotate-90" />
                          <div className="absolute top-0 left-0 bottom-0 w-4 bg-slate-200 dark:bg-stone-700/50"></div>
                       </div>
                       <div className="w-16 h-28 border-2 border-gray-200 dark:border-stone-700/50 rounded-xl flex items-center justify-center -rotate-[30deg] text-xs font-bold text-gray-400 bg-white dark:bg-stone-800">A20</div>
                       <div className="w-16 h-28 border-2 border-green-500 rounded-xl flex items-center justify-center -rotate-[30deg] bg-green-500 text-white shadow-lg cursor-pointer transform hover:scale-105 transition">
                          <div className="flex items-center gap-1">
                             <div className="w-3 h-3 rounded-full border border-white flex items-center justify-center">
                               <span className="text-[8px] font-bold">✓</span>
                             </div>
                             <span className="text-sm font-bold">A22</span>
                          </div>
                       </div>
                       <div className="w-16 h-28 border-2 border-gray-200 dark:border-stone-700/50 rounded-xl flex items-center justify-center -rotate-[30deg] relative bg-white dark:bg-stone-800 overflow-hidden">
                          <Car className="w-8 h-8 text-slate-300 dark:text-stone-600 ml-2 rotate-90" />
                       </div>
                    </div>
                 </div>

                 {/* Right Column */}
                 <div className="flex flex-col gap-6 mt-6 -ml-8">
                    <div className="flex flex-col gap-3">
                       <div className="w-16 h-28 border-2 border-gray-200 dark:border-stone-700/50 rounded-xl flex items-center justify-center -rotate-[30deg] relative bg-slate-100 dark:bg-stone-800/50 overflow-hidden">
                          <Car className="w-8 h-8 text-slate-400 dark:text-stone-500 ml-2 rotate-90" />
                          <div className="absolute top-0 right-0 bottom-0 w-8 bg-slate-200 dark:bg-stone-700/50"></div>
                       </div>
                       <div className="w-16 h-28 border-2 border-gray-200 dark:border-stone-700/50 rounded-xl flex items-center justify-center -rotate-[30deg] relative bg-white dark:bg-stone-800 overflow-hidden">
                          <Car className="w-8 h-8 text-slate-300 dark:text-stone-600 ml-2 rotate-90" />
                       </div>
                       <div className="w-16 h-28 border-2 border-gray-200 dark:border-stone-700/50 rounded-xl flex items-center justify-center -rotate-[30deg] relative bg-slate-100 dark:bg-stone-800/50 overflow-hidden">
                          <Car className="w-8 h-8 text-slate-400 dark:text-stone-500 ml-2 rotate-90" />
                       </div>
                       <div className="w-16 h-28 border-2 border-gray-200 dark:border-stone-700/50 rounded-xl flex items-center justify-center -rotate-[30deg] text-xs font-bold text-gray-400 bg-white dark:bg-stone-800">A21</div>
                       <div className="w-16 h-28 border-2 border-gray-200 dark:border-stone-700/50 rounded-xl flex items-center justify-center -rotate-[30deg] text-xs font-bold text-gray-400 bg-white dark:bg-stone-800">A23</div>
                       <div className="w-16 h-28 border-2 border-gray-200 dark:border-stone-700/50 rounded-xl flex items-center justify-center -rotate-[30deg] text-xs font-bold text-gray-400 bg-white dark:bg-stone-800">A25</div>
                    </div>
                 </div>

              </div>
            </div>

            {/* Legend Footer */}
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-stone-800 flex justify-center items-center gap-8">
               <div className="flex items-center gap-2">
                 <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-stone-600 bg-white dark:bg-stone-800"></div>
                 <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Available</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-4 h-4 rounded-sm bg-slate-200 dark:bg-stone-700 flex items-center justify-center">
                   <Car className="w-3 h-3 text-slate-500" />
                 </div>
                 <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Occupied</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-4 h-4 rounded-full bg-green-500"></div>
                 <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Selected / Reserved</span>
               </div>
            </div>

          </div>
        </div>
      )}

      {/* ALL PARKINGS VIEW (MAIN CONTENT + BOTTOM WIDGETS) */}
      {activeTab === 'all' && (
        <>
          {/* MAIN CONTENT */}
          <div className="relative flex-1 w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 z-10 mt-2 md:mt-12 animate-in fade-in slide-in-from-bottom-8">
        
        {/* LEFT COLUMN: GREETING & FLOATING CONTROLS */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col justify-center z-20 text-center md:text-left relative overflow-hidden">
          <div className="relative w-full h-[200px] md:h-[250px]">
            {mockAllParkings.map((parking, index) => (
              <div
                key={`info-${index}`}
                className={`absolute inset-0 flex flex-col transition-all duration-700 ease-in-out ${
                  index === currentIndex
                    ? "opacity-100 translate-x-0"
                    : slideDirection === "left"
                    ? index < currentIndex || (currentIndex === 0 && index === mockAllParkings.length - 1)
                      ? "opacity-0 -translate-x-full"
                      : "opacity-0 translate-x-full"
                    : index > currentIndex || (currentIndex === mockAllParkings.length - 1 && index === 0)
                    ? "opacity-0 translate-x-full"
                    : "opacity-0 -translate-x-full"
                }`}
              >
                <h2 
                  className={`text-3xl md:text-4xl lg:text-5xl font-bold text-black dark:text-white leading-tight break-words transition-all duration-300 ${!isNameExpanded ? 'line-clamp-2 md:line-clamp-3' : ''}`}
                  title={parking.name}
                >
                  {parking.name}
                </h2>
                
                {parking.name.length > 25 && (
                  <button 
                    onClick={() => setIsNameExpanded(!isNameExpanded)}
                    className="flex justify-center md:justify-start gap-1 text-sm font-semibold mt-3 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors w-full md:w-auto items-center"
                  >
                    {isNameExpanded ? "Thu gọn" : "Xem thêm"}
                    <ChevronDown className={`w-4 h-4 transition-transform ${isNameExpanded ? 'rotate-180' : ''}`} />
                  </button>
                )}

                <div className="mt-4">
                  <p className="text-gray-500 dark:text-gray-400 text-sm md:text-lg bg-white/40 dark:bg-black/40 backdrop-blur-md inline-block px-4 py-2 rounded-full shadow-sm">{parking.status} • Trống {parking.availableSpots}/{parking.totalSpots} chỗ</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* SLIDER CONTROLS */}
          <div className="flex gap-3 justify-center md:justify-start mt-4">
             <button 
                onClick={handlePrev}
                className="w-10 h-10 rounded-full bg-white/60 dark:bg-black/40 backdrop-blur shadow-sm hover:shadow-md flex items-center justify-center hover:bg-white dark:hover:bg-stone-800 transition text-gray-700 dark:text-gray-300"
             >
                <ChevronLeft className="w-5 h-5" />
             </button>
             <button 
                onClick={handleNext}
                className="w-10 h-10 rounded-full bg-white/60 dark:bg-black/40 backdrop-blur shadow-sm hover:shadow-md flex items-center justify-center hover:bg-white dark:hover:bg-stone-800 transition text-gray-700 dark:text-gray-300"
             >
                <ChevronRight className="w-5 h-5" />
             </button>
             <div className="flex items-center gap-1.5 ml-2">
                {mockAllParkings.map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-5 bg-black dark:bg-white' : 'w-1.5 bg-gray-300 dark:bg-stone-600'}`}></div>
                ))}
             </div>
          </div>
        </div>

        {/* CENTER COLUMN: CAR IMAGE */}
        <div className="lg:col-span-4 xl:col-span-5 relative flex items-center justify-center min-h-[250px] md:min-h-[300px] z-0 -mx-4 md:mx-0 overflow-hidden">
          {mockAllParkings.map((parking, index) => (
            <div
              key={`img-${index}`}
              className={`absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-in-out ${
                index === currentIndex
                  ? "translate-x-0"
                  : slideDirection === "left"
                  ? index < currentIndex || (currentIndex === 0 && index === mockAllParkings.length - 1)
                    ? "-translate-x-[120%]"
                    : "translate-x-[120%]"
                  : index > currentIndex || (currentIndex === mockAllParkings.length - 1 && index === 0)
                  ? "translate-x-[120%]"
                  : "-translate-x-[120%]"
              }`}
            >
              <img 
                src={parking.bgImage} 
                alt="Car/Parking" 
                className={`w-full max-w-[650px] aspect-[4/3] object-cover shadow-2xl hover:scale-[1.02] transition-transform duration-700 ${
                  index % 2 === 0 ? "-rotate-3" : "rotate-3"
                }`}
              />
            </div>
          ))}
        </div>

        {/* RIGHT COLUMN: AI ASSISTANT & CARDS */}
        <div className="lg:col-span-4 xl:col-span-4 flex flex-col gap-6 z-20 lg:pl-4 xl:pl-10 justify-center">
          
          {/* AI Assistant Card */}
          <div className="bg-white/70 dark:bg-stone-800/70 backdrop-blur-2xl p-6 rounded-[2rem] shadow-xl border border-white/40 dark:border-white/10 flex flex-col delay-500 animate-in fade-in slide-in-from-right-8 duration-700 fill-mode-both">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-lg">Thông tin bãi đỗ</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Hỗ trợ tìm kiếm thông minh</p>
              </div>
              <button className="text-gray-400 hover:text-black"><Plus className="w-5 h-5 rotate-45" /></button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {currentParkingData.amenities.map((item, idx) => (
                <div key={`${currentIndex}-${idx}`} className="flex items-center gap-3 bg-gray-50 dark:bg-black/20 p-3 rounded-2xl animate-in fade-in duration-500">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <div>
                    <p className="text-xs font-bold">{item.label}</p>
                    <p className="text-[10px] text-gray-500">Khu vực ưu tiên</p>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Input Area */}
            <div className="mt-6 bg-gray-100 dark:bg-black/30 p-2 rounded-2xl flex items-center shadow-inner">
              <input 
                type="text" 
                placeholder="Tìm chỗ đậu xe theo tháng..." 
                className="bg-transparent border-none outline-none px-3 flex-1 text-sm text-gray-700 dark:text-gray-200" 
              />
              <button className="w-10 h-10 rounded-xl bg-green-500 hover:bg-green-600 text-white flex justify-center items-center shadow-md transition hover:scale-105">
                <Send className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>

          {/* Vị trí */}
          <div className="bg-white/70 dark:bg-stone-800/70 backdrop-blur-2xl p-5 rounded-[2rem] shadow-xl border border-white/40 dark:border-white/10 relative overflow-hidden delay-700 animate-in fade-in slide-in-from-right-8 duration-700 fill-mode-both flex flex-col min-h-[220px]">
            <div className="relative z-10 flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-500"/> Vị trí Bãi đỗ</h3>
                <p className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">{currentParkingData.address}</p>
              </div>
            </div>
            <div className="flex-1 bg-gray-100 dark:bg-black/20 w-full rounded-xl flex items-center p-0 relative shadow-inner overflow-hidden border border-black/5 dark:border-white/10 group cursor-pointer pointer-events-none sm:pointer-events-auto">
               {/* Real Map Google Maps iframe */}
               <iframe 
                 key={currentIndex}
                 src={`https://maps.google.com/maps?q=${encodeURIComponent(currentParkingData.address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`} 
                 className="absolute inset-0 w-full h-full border-0 group-hover:scale-105 transition-transform duration-700 animate-in fade-in" 
                 allow="fullscreen"
                 allowFullScreen 
                 loading="lazy" 
                 referrerPolicy="no-referrer-when-downgrade"
               />
               
               {/* Clickable Overlay for Mobile (to prevent accidental scroll) - Removed for full interactivity */}
               <div className="absolute inset-0 pointer-events-none group-hover:bg-transparent transition-colors duration-300"></div>

               <div className="absolute bottom-2 right-2 text-[10px] font-medium bg-white/90 dark:bg-stone-800/90 backdrop-blur px-2 py-1 rounded shadow-md border border-gray-200 dark:border-stone-700 z-10 flex items-center gap-1 pointer-events-none">
                 <Navigation className="w-3 h-3 text-blue-500" />
                 Cách bạn: 2.4km
               </div>
            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM WIDGETS */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 z-20 delay-1000 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both">
        
        {/* New Consultant Card */}
        <div className="bg-white/70 dark:bg-stone-800/70 backdrop-blur-2xl p-6 rounded-[2rem] shadow-xl border border-white/40 dark:border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-bold">Nhân viên hỗ trợ bãi đỗ</h3>
            <p className="text-xs text-gray-500 max-w-[200px] mt-1">Liên hệ với chúng tôi để nhận khuyến mãi vé tháng ngay hôm nay</p>
            <div className="flex items-center gap-2 mt-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold">Thành Nam</p>
                <p className="text-[10px] text-gray-500">Kinh nghiệm 4 năm</p>
              </div>
            </div>
          </div>
          <button className="w-12 h-12 bg-white dark:bg-black shadow-md rounded-2xl flex items-center justify-center hover:scale-105 transition hover:shadow-lg">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
          </button>
        </div>

        {/* Khung giờ trống */}
        <div className="bg-white/70 dark:bg-stone-800/70 backdrop-blur-2xl p-5 rounded-[2rem] shadow-xl border border-white/40 dark:border-white/10 flex flex-col py-6 transition-all duration-300">
          <h3 className="font-bold flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500"/> Thời gian bãi trống</h3>
          <p className="text-xs text-gray-500 mt-1">Hôm nay, 21 Tháng 3, 2026</p>
          <div className="flex items-center justify-between mt-auto px-4 bg-white/50 dark:bg-black/20 py-4 rounded-xl shadow-inner">
            <button className="text-gray-400">&lt;</button>
            <div className="text-center animate-in fade-in duration-500">
              <p className="text-sm font-semibold text-gray-500">Giờ hoạt động</p>
              <h2 className="text-2xl font-light mt-1">{currentParkingData.timeOpen}</h2>
            </div>
            <button className="text-gray-400">&gt;</button>
          </div>
        </div>

        {/* Bảng giá nhanh */}
        <div className="bg-white/70 dark:bg-stone-800/70 backdrop-blur-2xl p-5 rounded-[2rem] shadow-xl border border-white/40 dark:border-white/10 flex flex-col justify-center transition-all duration-300">
          <h3 className="font-bold flex items-center gap-2"><Car className="w-4 h-4 text-purple-500"/> Đặt chỗ ngay</h3>
          <div className="space-y-3 mt-4">
             <div className="flex justify-between items-center bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-white/20 animate-in fade-in duration-500">
               <span className="text-sm font-medium">Giờ đầu</span>
               <span className="font-bold text-primary">{currentParkingData.pricing.firstHour}</span>
             </div>
             <div className="flex justify-between items-center bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-white/20 animate-in fade-in duration-500">
               <span className="text-sm font-medium">Giờ tiếp theo</span>
               <span className="font-bold text-primary">{currentParkingData.pricing.nextHour}</span>
             </div>
             <div className="flex justify-between items-center bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-white/20 animate-in fade-in duration-500">
               <span className="text-sm font-medium">Qua đêm</span>
               <span className="font-bold text-primary">{currentParkingData.pricing.overnight}</span>
             </div>
             <button onClick={() => window.location.href = `/users/detailParking/`} className="w-full bg-green-900 cursor-pointer dark:bg-white text-white dark:text-black py-3 rounded-xl font-bold hover:shadow-lg transition">
               Đặt vé xe
             </button>
          </div>
        </div>

      </div>
      </>
      )}

    </section>
  );
};

export default HeroSection;