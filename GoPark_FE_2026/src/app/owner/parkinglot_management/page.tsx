"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Check,
  Clock,
  Settings,
  Layers,
  LayoutGrid,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { TicketDetail, TicketData } from "./ticket-detail";
import { MockFloor } from "./components/mock-data";
import { SetupWizardTab } from "./components/setup-wizard-modal";
import { StructureManagerTab } from "./components/structure-manager-modal";
import { ZoneSlotGrid, ApiSlot } from "./components/zone-slot-grid";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { parkingService } from "@/services/parking.service";
import { useCustomerStore } from "@/stores/customer.store";
import { Loader2 } from "lucide-react";

export default function ParkingLotManagementPage() {
  const { lotId } = useCustomerStore();
  const [date, setDate] = React.useState<Date>();

  // Fetch real structure
  const { data: floorsResponse, isLoading } = useQuery({
    queryKey: ["parkingLotFloors", lotId],
    queryFn: () => parkingService.getFloors(lotId as number),
    enabled: !!lotId,
  });

  const floorsData = React.useMemo(() => {
    if (!floorsResponse?.data) return [] as MockFloor[];
    return floorsResponse.data.map((floor: any) => ({
      id: floor.id.toString(),
      floorId: floor.id as number,
      name: floor.floor_name,
      zones: (floor.parkingZone || []).map((zone: any) => ({
        id: zone.id.toString(),
        zoneId: zone.id as number,
        floorId: floor.id as number, // truyền xuống để ZoneSlotGrid dùng
        name: zone.zone_name,
        totalSlots: zone.total_slots || 0,
        slots: [], // Không dùng mock nữa — ZoneSlotGrid tự fetch
      })),
    })) as (MockFloor & {
      floorId: number;
      zones: (MockFloor["zones"][number] & {
        zoneId: number;
        floorId: number;
        totalSlots: number;
      })[];
    })[];
  }, [floorsResponse]);

  const [selectedFloor, setSelectedFloor] = React.useState("");
  const [selectedZone, setSelectedZone] = React.useState<string>("all"); // "all" or zoneId

  // Auto select first floor when data loads
  React.useEffect(() => {
    if (floorsData.length > 0 && !selectedFloor) {
      setSelectedFloor(floorsData[0].id);
    }
  }, [floorsData, selectedFloor]);

  // Modal State
  const [isConfigOpen, setIsConfigOpen] = React.useState(false);
  const hasData = floorsData.length > 0;

  const [activeTab, setActiveTab] = React.useState(hasData ? "edit" : "setup");

  // Whenever we change floors, reset selected zone to 'all'
  React.useEffect(() => {
    setSelectedZone("all");
  }, [selectedFloor]);

  // Make sure to sync activeTab correctly when opening
  const openConfigModal = (tab: "setup" | "edit") => {
    setActiveTab(tab);
    setIsConfigOpen(true);
  };

  const [isTicketOpen, setIsTicketOpen] = React.useState(false);
  const [selectedTicket, setSelectedTicket] = React.useState<{
    data: TicketData | null;
    status: "occupied" | "reserved" | "available";
  }>({ data: null, status: "available" });

  const currentFloor = floorsData.find((f) => f.id === selectedFloor);
  const activeZones = React.useMemo(() => {
    if (!currentFloor) return [];
    if (selectedZone === "all") return currentFloor.zones;
    return currentFloor.zones.filter((z) => z.id === selectedZone);
  }, [currentFloor, selectedZone]);

  const handleSlotClick = (slot: ApiSlot) => {
    // Slot OCCUPIED/RESERVED: có thể mở ticket detail sau khi fetch booking data
    // Hiện tại API list không trả ticket data — để mở rộng sau
    if (slot.status === "OCCUPIED" || slot.status === "RESERVED") {
      // TODO: fetch booking detail by slot.id
    }
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="bg-slate-50">
        <SiteHeader />

        <div className="p-4 md:p-6 space-y-6 max-w-[1600px] w-full mx-auto">
          {/* TOP BAR: Button on Left, Date/Time on Right */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60">
            {!hasData ? (
              <Button
                onClick={() => openConfigModal("setup")}
                className="bg-black text-white hover:bg-slate-800 shadow-xl border border-black px-6"
              >
                <Settings className="w-4 h-4 mr-2" /> Thiết lập Sơ đồ
              </Button>
            ) : (
              <Button
                onClick={() => openConfigModal("edit")}
                variant="outline"
                className="bg-white text-slate-800 hover:bg-slate-50 shadow-sm border-slate-200 px-6 font-semibold"
              >
                <Settings className="w-4 h-4 mr-1 text-slate-500" /> Quản lý Sơ
                đồ
              </Button>
            )}

            <div className="flex items-center gap-4 w-full md:w-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[200px] justify-start text-left font-semibold h-11 border-slate-200 bg-slate-50 hover:bg-slate-100",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Chọn ngày xem</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                <div className="relative w-28">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="time"
                    className="pl-9 h-9 border-0 shadow-none bg-transparent font-semibold"
                    defaultValue="10:00"
                  />
                </div>
                <div className="w-4 border-t-2 border-slate-300"></div>
                <div className="relative w-28">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="time"
                    className="pl-9 h-9 border-0 shadow-none bg-transparent font-semibold"
                    defaultValue="14:00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SELECTORS: Floor dropdown + Zone pills */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            {/* Floor selector row */}
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
              <div className="flex items-center gap-1.5 shrink-0">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
                  Tầng
                </span>
              </div>
              <Select value={selectedFloor} onValueChange={setSelectedFloor}>
                <SelectTrigger className="w-[220px] h-9 bg-slate-50 border-slate-200 font-bold text-sm shadow-none focus:ring-0">
                  <SelectValue placeholder="Chọn tầng..." />
                </SelectTrigger>
                <SelectContent>
                  {floorsData.map((floor) => (
                    <SelectItem
                      key={floor.id}
                      value={floor.id}
                      className="font-semibold"
                    >
                      {floor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Zone pills row */}
            <div className="flex items-center px-4 py-2.5 gap-2 overflow-x-auto">
              <div className="flex items-center gap-1.5 mr-1 shrink-0">
                <LayoutGrid className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
                  Khu vực
                </span>
              </div>

              {/* All zones pill */}
              <button
                onClick={() => setSelectedZone("all")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 shrink-0 ${
                  selectedZone === "all"
                    ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                <LayoutGrid className="w-3 h-3" />
                Tất cả
              </button>

              {/* Per-zone pills */}
              {currentFloor?.zones.map((z) => {
                const zz = z as any;
                const isActive = selectedZone === z.id;
                return (
                  <button
                    key={z.id}
                    onClick={() => setSelectedZone(z.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 whitespace-nowrap shrink-0 ${
                      isActive
                        ? "bg-slate-900 text-white shadow-md shadow-slate-300"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {z.name}
                    {zz.totalSlots > 0 && (
                      <span
                        className={`text-[10px] font-bold rounded-full px-1 ${
                          isActive ? "text-white/70" : "text-slate-400"
                        }`}
                      >
                        {zz.totalSlots}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* GRID */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col relative w-full">
            {/* Grid header bar */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-bold text-slate-800 ">
                  Sơ đồ bãi đỗ
                </span>
                <span className="text-slate-300 font-light">—</span>
                <span className="text-sm font-bold text-slate-800 tracking-tight">
                  {currentFloor?.name ?? ""}
                </span>
                {selectedZone !== "all" &&
                  currentFloor?.zones.find((z) => z.id === selectedZone)
                    ?.name && (
                    <>
                      <span className="text-slate-300">/</span>
                      <span className="text-sm font-bold text-slate-600">
                        {
                          currentFloor?.zones.find((z) => z.id === selectedZone)
                            ?.name
                        }
                      </span>
                    </>
                  )}
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-white border border-slate-200 px-2.5 py-1 rounded-full">
                Tự động cập nhật mỗi 30s
              </span>
            </div>

            <div className="flex-1 overflow-auto bg-slate-50/40 p-4 sm:p-8 relative min-h-[460px]">
              {/* Dot pattern background */}
              <div
                className="absolute inset-0 opacity-[0.035] pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1.5px 1.5px, #94a3b8 1px, transparent 0)",
                  backgroundSize: "28px 28px",
                }}
              />

              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4 mt-20 relative z-10">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-md flex items-center justify-center">
                      <Loader2 className="w-7 h-7 animate-spin text-slate-400" />
                    </div>
                  </div>
                  <p className="font-semibold tracking-wide text-sm">
                    Đang tải cấu trúc bãi đỗ...
                  </p>
                </div>
              ) : activeZones.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-6 mt-20 relative z-10">
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-md border-4 border-slate-100">
                    <Settings className="w-14 h-14 text-slate-300 pointer-events-none animate-spin-slow" />
                  </div>
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-black text-slate-800">
                      Bãi đỗ chưa có Cấu trúc
                    </h2>
                    <p className="font-medium tracking-wide text-slate-500 max-w-md mx-auto">
                      Quý khách cần phác thảo Tầng và Khu vực đỗ xe để hệ thống
                      có thể quản lý và hiển thị không gian trực quan.
                    </p>
                  </div>
                  {!hasData && (
                    <Button
                      onClick={() => openConfigModal("setup")}
                      className="mt-6 bg-black text-white px-10 py-7 rounded-2xl hover:bg-slate-800 shadow-2xl hover:shadow-black/20 hover:-translate-y-1 transition-all duration-300 font-bold text-lg"
                    >
                      Tạo Sơ Đồ Khởi Tạo Ngay
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-12 relative z-10">
                  {activeZones.map((zone, idx) => {
                    const z = zone as any;
                    return (
                      <div key={zone.id} className="relative">
                        {lotId && z.zoneId ? (
                          <ZoneSlotGrid
                            lotId={lotId as number}
                            floorId={
                              z.floorId ?? (currentFloor as any)?.floorId
                            }
                            zoneId={z.zoneId}
                            zoneName={zone.name}
                            zoneIndex={idx}
                            size={selectedZone === "all" ? "small" : "normal"}
                            onSlotClick={handleSlotClick}
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Đang tải...
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* LEGEND */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white px-5 py-3.5 rounded-2xl shadow-sm border border-slate-200/60">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 shrink-0">
              Chú thích
            </span>
            <div className="flex flex-wrap items-center gap-3">
              {/* Available */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full">
                <div className="w-4 h-7 rounded-sm bg-white border-2 border-dashed border-slate-300 shadow-sm shrink-0" />
                <span className="text-xs font-semibold text-slate-500">
                  Chỗ trống
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              </div>

              {/* Occupied */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
                <div className="relative w-4 h-7 rounded-sm bg-blue-200 border-2 border-blue-500 shadow-sm overflow-hidden shrink-0">
                  <div className="absolute bottom-0 left-0 w-full h-1/2 bg-blue-500" />
                </div>
                <span className="text-xs font-semibold text-blue-600">
                  Xe đang đỗ
                </span>
              </div>

              {/* Reserved */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-full">
                <div className="relative w-4 h-7 rounded-sm bg-orange-500 border-2 border-orange-600 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-xs font-semibold text-orange-600">
                  Đã đặt trước
                </span>
              </div>
            </div>

            <span className="text-[10px] text-slate-400 font-medium hidden md:inline">
              Nhấn vào ô đỗ để xem chi tiết
            </span>
          </div>
        </div>

        <TicketDetail
          isOpen={isTicketOpen}
          onClose={() => setIsTicketOpen(false)}
          data={selectedTicket.data}
          status={selectedTicket.status}
        />

        {/* MASTER CONFIG MODAL */}
        <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
          <DialogContent className="sm:max-w-[1000px] h-[90vh] flex flex-col p-0 overflow-hidden bg-white">
            <div className="flex border-b overflow-x-auto bg-slate-50/50">
              <button
                onClick={() => setActiveTab("setup")}
                disabled={hasData}
                className={`py-4 px-6 font-semibold border-b-2 text-sm transition-colors ${activeTab === "setup" ? "border-black text-black" : "border-transparent text-slate-500 hover:text-slate-800"} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Khởi tạo Cấu trúc
              </button>
              <button
                onClick={() => setActiveTab("edit")}
                disabled={!hasData}
                className={`py-4 px-6 font-semibold border-b-2 text-sm transition-colors ${activeTab === "edit" ? "border-black text-black" : "border-transparent text-slate-500"} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Chỉnh sửa Cấu trúc & Giá
              </button>
            </div>
            <div className="flex-1 overflow-hidden relative">
              {activeTab === "setup" && (
                <SetupWizardTab onClose={() => setIsConfigOpen(false)} />
              )}
              {activeTab === "edit" && <StructureManagerTab />}
            </div>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
