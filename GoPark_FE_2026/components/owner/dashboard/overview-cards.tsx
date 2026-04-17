import {
  IconTrendingDown,
  IconTrendingUp,
  IconCash,
  IconCar,
  IconParking,
  IconUsers,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardSummaryResponse } from "@/types/dashboard";

export function OverviewCards({
  data,
}: {
  data?: DashboardSummaryResponse["overview"];
}) {
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 *:data-[slot=card]:bg-card *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs">
      <Card className="@container/card relative overflow-hidden">
        <CardHeader className="pb-2">
          <CardDescription className="text-muted-foreground font-medium">
            Doanh thu hôm nay
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-primary">
            {data.todayRevenue.toLocaleString()} đ
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={
                data.revenueGrowth >= 0
                  ? "text-emerald-500 bg-emerald-500/10 border-emerald-200"
                  : "text-rose-500 bg-rose-500/10 border-rose-200"
              }
            >
              {data.revenueGrowth >= 0 ? (
                <IconTrendingUp size={14} className="mr-1" />
              ) : (
                <IconTrendingDown size={14} className="mr-1" />
              )}
              {data.revenueGrowth}%
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>

      <Card className="@container/card relative overflow-hidden">
        <CardHeader className="pb-2">
          <CardDescription className="text-muted-foreground font-medium">
            Lượt gửi xe hôm nay
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-primary">
            {data.todayBookings}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={
                data.bookingsGrowth >= 0
                  ? "text-emerald-500 bg-emerald-500/10 border-emerald-200"
                  : "text-rose-500 bg-rose-500/10 border-rose-200"
              }
            >
              {data.bookingsGrowth >= 0 ? (
                <IconTrendingUp size={14} className="mr-1" />
              ) : (
                <IconTrendingDown size={14} className="mr-1" />
              )}
              {data.bookingsGrowth}%
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>

      <Card className="@container/card relative overflow-hidden">
        <CardHeader className="pb-2">
          <CardDescription className="text-muted-foreground font-medium">
            Lấp đầy trung bình
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-primary">
            {data.averageOccupancy}%
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={
                data.occupancyGrowth >= 0
                  ? "text-emerald-500 bg-emerald-500/10 border-emerald-200"
                  : "text-rose-500 bg-rose-500/10 border-rose-200"
              }
            >
              {data.occupancyGrowth >= 0 ? (
                <IconTrendingUp size={14} className="mr-1" />
              ) : (
                <IconTrendingDown size={14} className="mr-1" />
              )}
              {data.occupancyGrowth}%
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>

      <Card className="@container/card relative overflow-hidden">
        <CardHeader className="pb-2">
          <CardDescription className="text-muted-foreground font-medium">
            Khách hàng mới
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-primary">
            +{data.newCustomers}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={
                data.customersGrowth >= 0
                  ? "text-emerald-500 bg-emerald-500/10 border-emerald-200"
                  : "text-rose-500 bg-rose-500/10 border-rose-200"
              }
            >
              {data.customersGrowth >= 0 ? (
                <IconTrendingUp size={14} className="mr-1" />
              ) : (
                <IconTrendingDown size={14} className="mr-1" />
              )}
              {data.customersGrowth}%
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  );
}
