import { Report } from "@/types/report";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportPriorityBadge, ReportStatusBadge } from "./ReportBadges";
import { format } from "date-fns";

interface ReportDetailProps {
  report: Report;
}

export function ReportDetail({ report }: ReportDetailProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{report.title}</CardTitle>
            <CardDescription className="mt-1.5">
              Mã báo cáo: {report.id}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <ReportPriorityBadge priority={report.priority} />
            <ReportStatusBadge status={report.status} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-medium mb-2 border-b pb-2">Mô tả</h3>
          <p className="text-sm text-foreground/80 whitespace-pre-wrap">{report.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">ID Người dùng</p>
            <p className="text-sm">{report.user_id}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">ID Bãi đỗ xe</p>
            <p className="text-sm">{report.parking_lot_id}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">ID Đặt chỗ</p>
            <p className="text-sm">{report.booking_id || "N/A"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Ngày tạo</p>
            <p className="text-sm">{format(new Date(report.created_at), "PPp")}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Cập nhật lần cuối</p>
            <p className="text-sm">{format(new Date(report.updated_at), "PPp")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
