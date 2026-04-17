"use client";

import { useQuery } from "@tanstack/react-query";
import { ReportDataTable } from "./ReportDataTable";
import { columns } from "./columns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getOwnerReports } from "@/services/report.service";
import { useAuthStore } from "@/stores/auth.store";
import { Loader2, AlertCircle } from "lucide-react";

export function ReportList() {
  const user = useAuthStore((s) => s.user);
  const ownerId = user?.id;

  const {
    data: reports = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["ownerReports", ownerId],
    queryFn: () => getOwnerReports(ownerId!),
    enabled: !!ownerId,
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Báo cáo</CardTitle>
        <CardDescription>
          Quản lý báo cáo người dùng và sự cố hệ thống trên các bãi đỗ xe.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-muted-foreground font-medium">Đang tải báo cáo...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center p-12 gap-4 text-destructive bg-destructive/5 rounded-lg border border-destructive/20">
            <AlertCircle className="w-8 h-8" />
            <p className="font-medium">Không thể tải báo cáo. Vui lòng thử lại sau.</p>
          </div>
        ) : (
          <ReportDataTable columns={columns} data={reports} />
        )}
      </CardContent>
    </Card>
  );
}
