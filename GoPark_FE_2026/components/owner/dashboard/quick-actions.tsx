import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconFileExport,
  IconAlertTriangle,
  IconPlus,
  IconCheck,
} from "@tabler/icons-react";
import { DashboardSummaryResponse } from "@/types/dashboard";

export function QuickActions({ data }: { data?: DashboardSummaryResponse['alerts'] }) {
  return (
    <Card className="h-full bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle>Thao tác nhanh</CardTitle>
        <CardDescription>Các chức năng thường dùng</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button className="w-full justify-start" size="lg">
          <IconPlus className="mr-2" size={18} />
          Tạo Lượt gửi xe mới (Thủ công)
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start bg-background"
          size="lg"
        >
          <IconFileExport className="mr-2" size={18} />
          Xuất Báo cáo hôm nay
        </Button>

        {data && data.length > 0 ? (
          data.map((alert) => (
            <div key={alert.id} className="mt-4 p-4 bg-rose-500/10 border border-rose-200 rounded-lg flex gap-3 text-sm text-rose-600 dark:text-rose-400">
              <IconAlertTriangle className="shrink-0 text-rose-500 mt-0.5" />
              <div className="flex flex-col">
                <span className="font-semibold">Cảnh báo hệ thống</span>
                <span className="opacity-90">{alert.message}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="mt-4 p-4 border border-emerald-200 bg-emerald-500/10 rounded-lg flex gap-3 text-sm text-emerald-600 dark:text-emerald-400">
            <IconCheck className="shrink-0 text-emerald-500 mt-0.5" />
            <div className="flex flex-col">
              <span className="font-semibold">Tuyệt vời!</span>
              <span className="opacity-90">Không có xe nào đỗ quá thời gian quy định.</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
