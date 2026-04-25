"use client";

import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOwnerParkingLots } from "@/hooks/useOwnerParkingLots";
import { useOwnerTotals } from "@/hooks/useOwnerTotals";
import { useCustomerStore } from "@/stores/customer.store";

export function SiteHeader() {
  const { lotId, setLotId } = useCustomerStore();
  const { data: parkingLots, isLoading: isLoadingLots } = useOwnerParkingLots();
  const { data: totals, isLoading: isLoadingTotals } = useOwnerTotals();

  // Auto-select bãi đầu tiên khi load xong
  useEffect(() => {
    if (parkingLots && parkingLots.length > 0 && lotId === null) {
      setLotId(parkingLots[0].id);
    }
  }, [parkingLots, lotId, setLotId]);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-between px-4 lg:px-6">

        {/* Chọn bãi đỗ xe */}
        <div className="flex items-center gap-2">
          <Select
            value={lotId !== null ? String(lotId) : ""}
            onValueChange={(val) => setLotId(Number(val))}
            disabled={isLoadingLots || !parkingLots?.length}
          >
            <SelectTrigger className="w-[200px]">
              {isLoadingLots ? (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> Đang tải...
                </span>
              ) : (
                <SelectValue placeholder="Chọn bãi đỗ xe" />
              )}
            </SelectTrigger>
            <SelectContent>
              {parkingLots?.map((lot) => (
                <SelectItem key={lot.id} value={String(lot.id)}>
                  {lot.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tổng số bãi */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Tổng số bãi:</span>
          <span className="font-medium text-foreground">
            {isLoadingTotals ? (
              <Loader2 className="h-3 w-3 animate-spin inline" />
            ) : (
              totals?.totalParkingLots ?? "—"
            )}
          </span>
        </div>

      </div>
    </header>
  );
}
