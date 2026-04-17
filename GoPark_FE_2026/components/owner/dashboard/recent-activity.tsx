import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardSummaryResponse } from "@/types/dashboard";

export function RecentActivity({ data }: { data?: DashboardSummaryResponse['recentActivities'] }) {
  if (!data || data.length === 0) {
     return (
       <Card className="h-full">
         <CardHeader>
           <CardTitle>Hoạt động gần đây</CardTitle>
           <CardDescription>Trạng thái các xe vào ra liên tục</CardDescription>
         </CardHeader>
         <CardContent>
           <div className="text-center p-4 text-muted-foreground">Không có hoạt động nào</div>
         </CardContent>
       </Card>
     )
  }

  const formatDistanceToNow = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = Math.abs(now.getTime() - date.getTime());
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Hoạt động gần đây</CardTitle>
        <CardDescription>Trạng thái các xe vào ra liên tục</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã Hóa Đơn</TableHead>
              <TableHead>Xe / Biển số</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thời gian</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">BK-{booking.id}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{booking.vehicle}</span>
                    <span className="text-xs text-muted-foreground">{booking.lotName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {booking.status === "ONGOING" && (
                    <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-500/10">Đang đỗ</Badge>
                  )}
                  {booking.status === "OVERSTAY" && (
                    <Badge variant="destructive" className="bg-rose-500">Quá giờ</Badge>
                  )}
                  {booking.status === "PENDING" && (
                    <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-500/10">Chờ xác nhận</Badge>
                  )}
                  {booking.status === "CONFIRMED" && (
                    <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-500/10">Sắp tới</Badge>
                  )}
                  {booking.status === "COMPLETED" && (
                    <Badge variant="outline" className="text-emerald-500 border-emerald-200 bg-emerald-500/10">Hoàn thành</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right text-muted-foreground text-sm">
                  {formatDistanceToNow(booking.time)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
