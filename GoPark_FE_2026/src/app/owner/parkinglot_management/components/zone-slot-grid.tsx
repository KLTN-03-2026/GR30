"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { parkingService } from "@/services/parking.service";
import { Slot } from "./slot";
import {
  Loader2,
  RefreshCw,
  AlertTriangle,
  Zap,
  Car,
  BookCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";

// ──────────────────────────────────────────────────────────
//  Types
// ──────────────────────────────────────────────────────────
export interface ApiSlot {
  id: number;
  code: string;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "DISABLED";
}

interface ZoneSlotGridProps {
  lotId: number;
  floorId: number | string;
  zoneId: number | string;
  zoneName: string;
  zoneIndex: number;
  size?: "small" | "normal";
  onSlotClick?: (slot: ApiSlot) => void;
}

// ──────────────────────────────────────────────────────────
//  Status Mapping: API → Slot component
// ──────────────────────────────────────────────────────────
function mapStatus(
  apiStatus: ApiSlot["status"],
): "available" | "occupied" | "reserved" {
  switch (apiStatus) {
    case "OCCUPIED":
      return "occupied";
    case "RESERVED":
      return "reserved";
    case "AVAILABLE":
    default:
      return "available";
  }
}

// ──────────────────────────────────────────────────────────
//  Component
// ──────────────────────────────────────────────────────────
export function ZoneSlotGrid({
  lotId,
  floorId,
  zoneId,
  zoneName,
  zoneIndex,
  size = "normal",
  onSlotClick,
}: ZoneSlotGridProps) {
  const queryClient = useQueryClient();
  const queryKey = ["zoneSlots", lotId, floorId, zoneId];

  // Fetch slots — auto-poll mỗi 30s
  const { data, isLoading, isError, dataUpdatedAt, refetch, isFetching } =
    useQuery({
      queryKey,
      queryFn: () =>
        parkingService.getZoneSlots(
          lotId,
          Number(floorId),
          Number(zoneId),
          false, // Ẩn DISABLED trên trang chính
        ),
      refetchInterval: 30_000,
      staleTime: 20_000,
      enabled: !!lotId && !!floorId && !!zoneId,
    });

  const slots: ApiSlot[] = Array.isArray(data) ? data : (data?.data ?? []);

  const lastUpdated = dataUpdatedAt
    ? format(new Date(dataUpdatedAt), "HH:mm:ss")
    : null;

  // Thống kê
  const totalCount     = slots.length;
  const availableCount = slots.filter((s) => s.status === "AVAILABLE").length;
  const occupiedCount  = slots.filter((s) => s.status === "OCCUPIED").length;
  const reservedCount  = slots.filter((s) => s.status === "RESERVED").length;

  // ── Generate slots mutation (fallback khi zone rỗng) ──
  const generateMut = useMutation({
    mutationFn: () =>
      parkingService.generateSlotsForZone(
        lotId,
        Number(floorId),
        Number(zoneId),
      ),
    onSuccess: (res: any) => {
      const added = res?.data?.added ?? res?.added ?? 0;
      const disabled = res?.data?.disabled ?? res?.disabled ?? 0;
      if (added > 0)
        toast.success(`Đã tạo ${added} slot mới cho khu ${zoneName}`);
      if (disabled > 0) toast.warning(`Đã vô hiệu hoá ${disabled} slot thừa`);
      if (added === 0 && disabled === 0)
        toast.info("Slots đã đồng bộ, không có thay đổi.");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ?? err?.message ?? "Lỗi tạo slot",
      );
    },
  });

  // ──────── Loading state ────────
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white/60 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 animate-pulse" />
            <div className="h-5 w-28 bg-slate-100 rounded-lg animate-pulse" />
          </div>
          <div className="h-4 w-24 bg-slate-100 rounded-lg animate-pulse" />
        </div>
        <div className="flex items-center gap-3 justify-center py-12 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">
            Đang tải slots khu {zoneName}...
          </span>
        </div>
      </div>
    );
  }

  // ──────── Error state ────────
  if (isError) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50/40 flex items-center gap-3 justify-center py-8 text-red-400">
        <AlertTriangle className="w-5 h-5" />
        <span className="text-sm font-medium">
          Không thể tải slots. Thử lại sau.
        </span>
      </div>
    );
  }

  // ──────── Empty state (zone chưa generate) ────────
  if (slots.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/30 flex flex-col items-center justify-center py-12 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-200 flex items-center justify-center shadow-sm">
          <Zap className="w-6 h-6 text-amber-500" />
        </div>
        <div className="text-center">
          <p className="font-bold text-slate-700">
            Khu {zoneName} chưa có slots
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Nhấn để khởi tạo slots theo cấu hình
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => generateMut.mutate()}
          disabled={generateMut.isPending}
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-md px-5"
        >
          {generateMut.isPending ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <Zap className="w-3.5 h-3.5 mr-1.5" />
          )}
          Tạo Slots Ngay
        </Button>
      </div>
    );
  }

  // ──────── Slot grid ────────
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/60 overflow-hidden shadow-sm">
      {/* Zone header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white">
        <div className="flex items-center gap-3">
          {/* Zone index badge */}
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-md">
            {String.fromCharCode(64 + zoneIndex + 1)}
          </div>
          <div>
            <h3 className="text-base font-black text-slate-800 leading-tight tracking-tight">
              {zoneName}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              {totalCount} chỗ đỗ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Stat row — always shown */}
          <div className="flex items-center divide-x divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm text-xs font-bold">
            {/* Trống */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-emerald-700 bg-emerald-50/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span>{availableCount}</span>
              <span className="font-normal text-emerald-600 hidden sm:inline">trống</span>
            </div>
            {/* Xe đỗ */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-blue-700 bg-blue-50/50">
              <Car className="w-3 h-3 shrink-0" />
              <span>{occupiedCount}</span>
              <span className="font-normal text-blue-600 hidden sm:inline">đỗ</span>
            </div>
            {/* Đặt trước */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-orange-700 bg-orange-50/50">
              <BookCheck className="w-3 h-3 shrink-0" />
              <span>{reservedCount}</span>
              <span className="font-normal text-orange-600 hidden sm:inline">đặt</span>
            </div>
            {/* Tổng */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 bg-slate-50">
              <span className="text-slate-400 font-normal hidden sm:inline">tổng</span>
              <span className="font-black text-slate-800">{totalCount}</span>
            </div>
          </div>

          {/* Last updated + refresh */}
          <div className="flex items-center gap-1.5">
            {lastUpdated && (
              <span className="text-[10px] text-slate-400 font-mono hidden lg:inline bg-slate-100 px-1.5 py-0.5 rounded-md">
                {lastUpdated}
              </span>
            )}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors disabled:opacity-50"
              title="Refresh slots"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Slot grid area */}
      <div className="p-5">
        <div
          className={`flex flex-wrap items-end justify-start ${
            size === "small" ? "gap-x-3 gap-y-8" : "gap-x-5 gap-y-10"
          }`}
        >
          {slots.map((apiSlot) => {
            const mappedSlot = {
              id: String(apiSlot.id),
              label: apiSlot.code,
              status: mapStatus(apiSlot.status),
              ticket: undefined,
            };
            return (
              <div
                key={apiSlot.id}
                className="relative group flex flex-col items-center gap-1.5"
              >
                <Slot
                  slot={mappedSlot}
                  onClick={() => onSlotClick?.(apiSlot)}
                  size={size}
                  orientation="bottom"
                />
                {/* Slot code label below */}
                <span
                  className={`text-[9px] font-mono font-bold tracking-wide transition-colors ${
                    apiSlot.status === "OCCUPIED"
                      ? "text-blue-500"
                      : apiSlot.status === "RESERVED"
                        ? "text-orange-500"
                        : "text-slate-400"
                  }`}
                >
                  {apiSlot.code}
                </span>
                {/* Slot shadow below */}
                {size !== "small" && (
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-slate-300/40 rounded-full blur-sm pointer-events-none group-hover:bg-slate-400/50 transition-colors" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
