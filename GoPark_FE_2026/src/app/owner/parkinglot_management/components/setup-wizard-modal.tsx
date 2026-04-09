"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Check,
  Settings,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  LogOut,
  LogIn,
  MapPin,
  MoveRight,
  CarFront,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { parkingService } from "@/services/parking.service";
import { useCustomerStore } from "@/stores/customer.store";
import { toast } from "sonner";

export function SetupWizardTab({ onClose }: any) {
  const { lotId } = useCustomerStore();
  const queryClient = useQueryClient();

  const { data: floorsData, isSuccess: isFloorsSuccess } = useQuery({
    queryKey: ["parkingLotFloors", lotId],
    queryFn: () => parkingService.getFloors(lotId as number),
    enabled: !!lotId,
  });

  const [step, setStep] = React.useState(1);
  const [floors, setFloors] = React.useState<any[]>([
    { id: "f_new_1", name: "Tầng trệt" },
  ]);
  const [gates, setGates] = React.useState<any[]>([
    {
      id: "g_new_1",
      floorId: "f_new_1",
      name: "Cổng chính",
      type: "in",
      position: "bottom",
    },
  ]);
  const [zones, setZones] = React.useState<any[]>([
    {
      id: "z_new_1",
      floorId: "f_new_1",
      name: "Khu A VIP",
      priceHour: 20000,
      priceDay: 150000,
      prefix: "A",
      count: 12,
    },
  ]);

  React.useEffect(() => {
    if (isFloorsSuccess && floorsData?.data?.length > 0) {
      const mappedFloors = floorsData.data.map((f: any) => ({
        id: f.id.toString(),
        name: f.floor_name,
      }));
      setFloors(mappedFloors);

      const mappedZones: any[] = [];
      floorsData.data.forEach((f: any) => {
        if (f.parkingZone && Array.isArray(f.parkingZone)) {
          f.parkingZone.forEach((z: any) => {
            const prefixMatch = z.description?.match(/Tiền tố (.*)/);
            const prefix = prefixMatch ? prefixMatch[1].trim() : z.zone_name.charAt(0);
            mappedZones.push({
              id: z.id.toString(),
              floorId: f.id.toString(),
              name: z.zone_name,
              count: z.total_slots,
              prefix: prefix,
              priceHour: 20000, 
              priceDay: 150000,
            });
          });
        }
      });
      if (mappedZones.length > 0) {
        setZones(mappedZones);
      } else {
        setZones([]);
      }
    }
  }, [isFloorsSuccess, floorsData]);

  const [activeGateFloorId, setActiveGateFloorId] = React.useState("f_new_1");

  React.useEffect(() => {
    if (floors.length > 0 && !floors.find((f) => f.id === activeGateFloorId)) {
      setActiveGateFloorId(floors[0].id);
    }
  }, [floors, activeGateFloorId]);

  const handleNext = () => setStep((s) => Math.min(s + 1, 4));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const addFloor = () =>
    setFloors([
      ...floors,
      { id: `f_new_${Date.now()}`, name: `Tầng ${floors.length + 1}` },
    ]);
  const removeFloor = (id: string) => {
    setFloors(floors.filter((f) => f.id !== id));
    setGates(gates.filter((g) => g.floorId !== id));
    setZones(zones.filter((z) => z.floorId !== id));
  };

  const addGate = (floorId: string) =>
    setGates([
      ...gates,
      {
        id: `g_new_${Date.now()}`,
        floorId,
        name: `Cổng mới ${gates.filter((g) => g.floorId === floorId).length + 1}`,
        type: "in",
        position: "bottom",
      },
    ]);
  const removeGate = (id: string) => setGates(gates.filter((g) => g.id !== id));

  const addZone = (floorId: string) =>
    setZones([
      ...zones,
      {
        id: `z_new_${crypto.randomUUID()}`,
        floorId,
        name: `Khu mới`,
        priceHour: 20000,
        priceDay: 150000,
        prefix: "New",
        count: 10,
      },
    ]);
  const removeZone = (id: string) => setZones(zones.filter((z) => z.id !== id));

  const setupMutation = useMutation({
    mutationFn: async () => {
      if (!lotId)
        throw new Error("Vui lòng chọn bãi đỗ xe trước khi thiết lập");

      for (const [index, floor] of floors.entries()) {
        let currentFloorId = floor.id;
        const isNewFloor = String(floor.id).startsWith("f_new");

        if (isNewFloor) {
          // Bước 2: Thêm Tầng mới (Floor)
          const floorRes = await parkingService.createFloor(lotId, {
            floor_name: floor.name,
            floor_number: index + 1,
            description: `Khu vực ${floor.name}`,
          });

          // Unwrap logic tùy BE
          currentFloorId = floorRes.data?.id || floorRes.id;

          if (!currentFloorId) {
            throw new Error(`Không lấy được ID cho tầng: ${floor.name}`);
          }
        }

        // Bước 3: Thêm Khu vực (Zone) - Bắt đầu có Slots
        const floorZones = zones.filter((z) => z.floorId === floor.id);
        for (const zone of floorZones) {
          let currentZoneId = zone.id;
          const isNewZone = String(zone.id).startsWith("z_new");

            if (isNewZone) {
            const zoneRes = await parkingService.createZone(currentFloorId, {
              zone_name: zone.name,
              prefix: zone.prefix,
              total_slots: zone.count,
              description: `Khu vực ${zone.name} - Tiền tố ${zone.prefix}`,
            });

            currentZoneId = zoneRes.data?.id || zoneRes.id;

            if (!currentZoneId) {
              throw new Error(`Không lấy được ID cho khu vực: ${zone.name}`);
            }

            // Thêm giá tiền cho zone mới
            await parkingService.createPricingRule({
              price_per_hour: zone.priceHour,
              price_per_day: zone.priceDay,
              parking_lot_id: lotId,
              parking_floor_id: currentFloorId,
              parking_zone_id: currentZoneId,
            });
          } else {
            // Đối với khu vực cũ, nếu sau này cần update số lượng ô đỗ hay giá,
            // ta sẽ gọi các hàm API tương ứng:
            // await parkingService.updateZone(currentZoneId, { total_slots: zone.count });
            // await parkingService.updatePricingRule(...);
          }
        }
      }
    },
    onSuccess: () => {
      toast.success("Thiết lập sơ đồ bãi đỗ xe thành công");

      // Refresh dữ liệu ở trang chính
      queryClient.invalidateQueries({
        queryKey: ["parkingLotStructure", lotId],
      });

      onClose();
      setStep(1);
    },
    onError: (error: any) => {
      console.error("Error saving setup:", error);
      toast.error(error.message || "Có lỗi xảy ra khi lưu thiết lập");
    },
  });

  const handleSave = () => {
    if (!lotId) {
      toast.error("Vui lòng chọn bãi đỗ xe trước khi thiết lập");
      return;
    }
    setupMutation.mutate();
  };

  const getGateIconAndColor = (type: string) => {
    switch (type) {
      case "in":
        return {
          icon: <LogIn className="w-5 h-5 mb-1" />,
          color: "bg-green-500 text-white border-green-700",
        };
      case "out":
        return {
          icon: <LogOut className="w-5 h-5 mb-1" />,
          color: "bg-red-500 text-white border-red-700",
        };
      case "both":
      default:
        return {
          icon: <MapPin className="w-5 h-5 mb-1" />,
          color: "bg-blue-500 text-white border-blue-700",
        };
    }
  };

  const getPositionClasses = (pos: string) => {
    switch (pos) {
      case "top":
        return "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2";
      case "bottom":
        return "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2";
      case "left":
        return "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2";
      case "right":
        return "right-0 top-1/2 -translate-y-1/2 translate-x-1/2";
      default:
        return "";
    }
  };

  const renderRealisticPreview = (prefix: string, count: number) => {
    const slots = Array.from(
      { length: Math.min(count, 50) },
      (_, i) => `${prefix}${i + 1}`,
    );
    const mid = Math.ceil(slots.length / 2);
    const topRow = slots.slice(0, mid);
    const bottomRow = slots.slice(mid);

    return (
      <div className="w-full bg-gray-700/80 p-8 sm:p-12 rounded-xl relative overflow-x-auto min-w-full border-4 border-gray-800 shadow-inner">
        <div className="flex flex-col relative w-max mx-auto">
          <div className="flex gap-1.5 justify-center mb-8">
            {topRow.map((slot) => (
              <div
                key={slot}
                className="w-16 h-[106px] border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 font-bold hover:bg-slate-50 transition-colors bg-white rounded-md relative shadow-sm"
              >
                <span className="rotate-180 mb-1 text-base">{slot}</span>
              </div>
            ))}
          </div>

          <div className="w-full bg-gray-800/50 py-10 relative flex items-center justify-center gap-24 my-2 rounded-lg border-y border-dashed border-gray-600/50">
            <div className="flex items-center text-white/30 gap-3">
              <MoveRight className="w-12 h-12" />
              <span className="font-bold text-2xl tracking-[0.3em] font-mono">
                LỐI ĐI CHÍNH
              </span>
              <MoveRight className="w-12 h-12" />
            </div>
          </div>

          <div className="flex gap-1.5 justify-center mt-8">
            {bottomRow.map((slot) => (
              <div
                key={slot}
                className="w-16 h-[106px] border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 font-bold hover:bg-slate-50 transition-colors bg-white rounded-md relative shadow-sm"
              >
                <span className="mt-1 text-base">{slot}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // const getPositionClasses = ...
  // This file has been converted.

  return (
    <div className="flex-1 overflow-hidden bg-slate-50 flex flex-col h-full">
      <div className="p-6 pb-4 border-b bg-white shrink-0">
        <h2 className="text-2xl font-bold text-slate-800">
          Cài đặt Sơ đồ Cấu trúc Bãi đỗ
        </h2>

        <div className="flex items-center justify-center gap-2 sm:gap-4 mt-8 px-4">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2",
                    step >= s
                      ? "bg-black text-white border-black shadow-md scale-110"
                      : "bg-white text-gray-400 border-gray-200",
                  )}
                >
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                <span
                  className={cn(
                    "text-xs font-semibold hidden sm:block",
                    step >= s ? "text-black" : "text-gray-400",
                  )}
                >
                  {s === 1
                    ? "Tầng"
                    : s === 2
                      ? "Khu vực"
                      : s === 3 && "Xác nhận"}
                </span>
              </div>
              {s < 3 && (
                <div
                  className={cn(
                    "h-1 w-8 sm:w-16 mb-6 rounded-full transition-colors duration-300",
                    step > s ? "bg-black" : "bg-gray-200",
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 xl:p-8">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto flex flex-col justify-center min-h-[50vh]">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-slate-800">
                Bước 1: Thiết lập Tầng vật lý
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Định nghĩa các tầng đỗ xe khả dụng của hệ thống.
              </p>
            </div>
            <div className="space-y-4">
              {floors.map((f, i) => (
                <div
                  key={f.id}
                  className="flex gap-4 items-center bg-white p-4 rounded-xl border shadow-sm transition-all hover:shadow-md"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 border">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1 block">
                      Tên tầng
                    </Label>
                    <Input
                      value={f.name}
                      onChange={(e) =>
                        setFloors(
                          floors.map((fl) =>
                            fl.id === f.id
                              ? { ...fl, name: e.target.value }
                              : fl,
                          ),
                        )
                      }
                      className="font-medium text-black border-slate-200 bg-slate-50"
                      placeholder="VD: Tầng hầm B1"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFloor(f.id)}
                    disabled={floors.length === 1}
                    className="mt-5 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addFloor}
                className="w-full border-dashed border-2 py-8 text-slate-500 hover:text-black hover:border-black hover:bg-slate-50/50 transition-colors"
              >
                <Plus className="w-5 h-5 mr-3" /> Thêm Tầng mới
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">
                Bước 2: Tái tạo Khu vực & Tạo Chỗ đỗ
              </h3>
            </div>

            <Tabs defaultValue={floors[0]?.id} className="w-full">
              <TabsList className="mb-6 flex-wrap h-auto bg-white border p-1 rounded-xl shadow-sm justify-center w-full max-w-2xl mx-auto">
                {floors.map((f) => (
                  <TabsTrigger
                    key={f.id}
                    value={f.id}
                    className="px-6 py-2.5 rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-medium transition-all"
                  >
                    {f.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {floors.map((f) => (
                <TabsContent key={f.id} value={f.id} className="space-y-8">
                  <div className="space-y-6">
                    {zones
                      .filter((z) => z.floorId === f.id)
                      .map((z, i) => (
                        <div
                          key={z.id}
                          className="bg-white border rounded-2xl shadow-sm px-6 pb-6"
                        >
                          <div className="flex items-center justify-between py-4">
                            <h4 className="flex-1 text-lg font-bold text-slate-800">
                              <span className="mr-3 bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-semibold">
                                Khu vực {i + 1}
                              </span>{" "}
                              {z.name}
                            </h4>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeZone(z.id)}
                              className="text-red-500 hover:bg-red-50 mt-1 mr-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="pt-4 border-t space-y-8">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                              <div className="space-y-2">
                                <Label>Tên Khu vực</Label>
                                <Input
                                  value={z.name}
                                  onChange={(e) =>
                                    setZones(
                                      zones.map((zn) =>
                                        zn.id === z.id
                                          ? { ...zn, name: e.target.value }
                                          : zn,
                                      ),
                                    )
                                  }
                                  className="font-medium"
                                  placeholder="VD: Khu A VIP"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Số lượng chỗ</Label>
                                <Input
                                  type="number"
                                  min={1}
                                  max={100}
                                  value={z.count}
                                  onChange={(e) =>
                                    setZones(
                                      zones.map((zn) =>
                                        zn.id === z.id
                                          ? {
                                              ...zn,
                                              count:
                                                parseInt(e.target.value) || 0,
                                            }
                                          : zn,
                                      ),
                                    )
                                  }
                                  className="font-mono text-center"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Tiền tố mã ô đỗ</Label>
                                <Input
                                  value={z.prefix}
                                  onChange={(e) =>
                                    setZones(
                                      zones.map((zn) =>
                                        zn.id === z.id
                                          ? { ...zn, prefix: e.target.value }
                                          : zn,
                                      ),
                                    )
                                  }
                                  placeholder="VD: A"
                                  className="font-mono text-center uppercase"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <div className="space-y-2">
                                <Label>Giá theo giờ (VNĐ)</Label>
                                <Input
                                  type="number"
                                  min={0}
                                  value={z.priceHour}
                                  onChange={(e) =>
                                    setZones(
                                      zones.map((zn) =>
                                        zn.id === z.id
                                          ? {
                                              ...zn,
                                              priceHour:
                                                parseInt(e.target.value) || 0,
                                            }
                                          : zn,
                                      ),
                                    )
                                  }
                                  className="font-mono text-center"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Giá theo ngày (VNĐ)</Label>
                                <Input
                                  type="number"
                                  min={0}
                                  value={z.priceDay}
                                  onChange={(e) =>
                                    setZones(
                                      zones.map((zn) =>
                                        zn.id === z.id
                                          ? {
                                              ...zn,
                                              priceDay:
                                                parseInt(e.target.value) || 0,
                                            }
                                          : zn,
                                      ),
                                    )
                                  }
                                  className="font-mono text-center"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => addZone(f.id)}
                    className="w-full py-8 border-dashed border-2 hover:border-black hover:bg-slate-50 transition-colors rounded-2xl"
                  >
                    <Plus className="w-5 h-5 mr-2" /> Tạo thêm Khu vực (Zone)
                    mới
                  </Button>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col justify-center">
            <div className="text-center mb-6">
              <h3 className="text-3xl font-extrabold text-slate-800">
                Hoàn tất Sơ đồ
              </h3>
              <p className="text-sm text-slate-500 mt-3 font-medium">
                Bạn có thể bấm Quay lại để điều chỉnh, hoặc Xác nhận để lưu
                cấu trúc bãi đỗ ô tô.
              </p>
            </div>

            <div className="max-w-3xl mx-auto w-full">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border text-center">
                  <div className="text-4xl font-black text-black mb-2">
                    {floors.length}
                  </div>
                  <div className="text-xs text-slate-400 uppercase font-bold tracking-widest">
                    Tầng
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border text-center">
                  <div className="text-4xl font-black text-black mb-2">
                    {zones.length}
                  </div>
                  <div className="text-xs text-slate-400 uppercase font-bold tracking-widest">
                    Khu vực (Zones)
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border text-center">
                  <div className="text-4xl font-black text-black mb-2">
                    {zones.reduce((acc, z) => acc + z.count, 0)}
                  </div>
                  <div className="text-xs text-slate-400 uppercase font-bold tracking-widest">
                    Tổng Chỗ Đỗ
                  </div>
                </div>
              </div>

              <div className="shadow-sm border rounded-xl bg-white">
                <div className="p-6">
                  <h4 className="font-bold border-b pb-4 mb-6 text-slate-800 text-lg">
                    Chi tiết phân bổ hệ thống
                  </h4>
                  <div className="space-y-6">
                    {floors.map((f) => {
                      const fGates = gates.filter((g) => g.floorId === f.id);
                      const fZones = zones.filter((z) => z.floorId === f.id);
                      return (
                        <div
                          key={f.id}
                          className="bg-slate-50 rounded-xl p-5 border shadow-sm"
                        >
                          <h5 className="font-black text-slate-800 mb-4 text-lg border-l-4 border-black pl-3">
                            {f.name}
                          </h5>
                          <div className="grid md:grid-cols-1 gap-8">
                            <div>
                              <h6 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center">
                                <CarFront className="w-3 h-3 mr-1" /> Khu vực
                                & Bảng giá
                              </h6>
                              {fZones.length > 0 ? (
                                <div className="space-y-2">
                                  {fZones.map((z) => (
                                    <div
                                      key={z.id}
                                      className="text-sm py-2 px-3 bg-white rounded-lg border font-medium text-slate-700 flex flex-col gap-2 shadow-sm"
                                    >
                                      <div className="flex justify-between items-center w-full">
                                        <span className="font-bold text-slate-800">
                                          {z.name}
                                        </span>
                                        <span className="font-bold bg-slate-100 px-2 py-0.5 rounded border">
                                          {z.count} slot
                                        </span>
                                      </div>
                                      <div className="flex justify-between text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded border">
                                        <span>
                                          Giờ: {z.priceHour.toLocaleString()}đ
                                        </span>
                                        <span>
                                          Ngày: {z.priceDay.toLocaleString()}đ
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 border border-dashed border-slate-300 p-3 block rounded-lg text-center bg-white">
                                  Trống
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t bg-white flex gap-3 sm:justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.04)] shrink-0">
        <Button
          variant="ghost"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 font-medium hidden sm:block"
        >
          Đóng
        </Button>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={step === 1}
            className="w-full sm:w-auto px-8 font-semibold text-slate-600 shadow-sm border-slate-200"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại
          </Button>
          {step < 3 ? (
            <Button
              onClick={handleNext}
              className="w-full sm:w-auto px-10 bg-black hover:bg-slate-800 text-white font-semibold shadow-md border border-black"
              disabled={setupMutation.isPending}
            >
              Tiếp tục <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={setupMutation.isPending}
              className="w-full sm:w-auto px-10 bg-black hover:bg-zinc-800 text-white font-bold shadow-xl ring-2 ring-black/10 ring-offset-2"
            >
              {setupMutation.isPending ? (
                <>
                  <Settings className="w-4 h-4 mr-2 animate-spin" /> Đang
                  lưu...
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4 mr-2" /> Xác nhận & Lưu hệ
                  thống
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
