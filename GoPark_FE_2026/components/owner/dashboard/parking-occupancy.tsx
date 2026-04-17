import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardSummaryResponse } from "@/types/dashboard";

export function ParkingOccupancy({ data }: { data?: DashboardSummaryResponse['parkingOccupancy'] }) {
  if (!data || data.length === 0) return null;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Sức chứa bãi đỗ</CardTitle>
        <CardDescription>Tỉ lệ lấp đầy theo thời gian thực</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {data.map((lot) => {
          const occupancyRate = lot.capacity > 0 ? Math.round((lot.occupied / lot.capacity) * 100) : 0;
          let statusColor = "bg-primary";
          let alertBadge = null;

          if (occupancyRate >= 95) {
            statusColor = "bg-rose-500";
            alertBadge = <Badge variant="destructive" className="ml-auto text-[10px] h-5">Quá tải</Badge>;
          } else if (occupancyRate >= 80) {
            statusColor = "bg-amber-500";
            alertBadge = <Badge variant="outline" className="ml-auto text-[10px] h-5 text-amber-500 border-amber-500">Sắp đầy</Badge>;
          } else {
             alertBadge = <Badge variant="outline" className="ml-auto text-[10px] h-5 text-emerald-500 border-emerald-500">Trống</Badge>;
          }

          return (
            <div key={lot.lotId} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{lot.name}</span>
                {alertBadge}
              </div>
              <div className="flex items-center gap-4">
                <Progress value={occupancyRate} indicatorClassName={statusColor} className="flex-1 h-2" />
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {occupancyRate}%
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {lot.occupied} / {lot.capacity} chỗ
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
