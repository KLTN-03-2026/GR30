import React from "react";
import { Download } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { DateRange } from "react-day-picker";

interface DashboardHeaderProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  selectedLot: string;
  setSelectedLot: (lotId: string) => void;
  parkingLots: { id: string; name: string }[];
  onExport: () => void;
}

export function DashboardHeader({
  dateRange,
  setDateRange,
  selectedLot,
  setSelectedLot,
  parkingLots,
  onExport,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Thống kê</h1>
        <p className="text-muted-foreground mt-1">
          Theo dõi hiệu suất và doanh thu bãi đỗ xe của bạn.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Date Range Picker Placeholder or Real Component */}
        <DatePickerWithRange
          date={dateRange}
          setDate={setDateRange}
          className="w-full sm:w-auto sm:min-w-[260px]"
        />

        <Select value={selectedLot} onValueChange={setSelectedLot}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Chọn bãi đỗ xe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả bãi đỗ</SelectItem>
            {parkingLots.map((lot) => (
              <SelectItem key={lot.id} value={lot.id}>
                {lot.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={onExport}
          variant="outline"
          className="w-full sm:w-auto"
        >
          <Download className="mr-2 h-4 w-4" />
          Xuất dữ liệu
        </Button>
      </div>
    </div>
  );
}
