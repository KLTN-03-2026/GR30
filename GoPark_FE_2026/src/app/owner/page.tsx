"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { IconLoader2 } from "@tabler/icons-react";

import { OverviewCards } from "@/components/owner/dashboard/overview-cards";
import { RevenueChart } from "@/components/owner/dashboard/revenue-chart";
import { ParkingOccupancy } from "@/components/owner/dashboard/parking-occupancy";
import { RecentActivity } from "@/components/owner/dashboard/recent-activity";
import { QuickActions } from "@/components/owner/dashboard/quick-actions";

import { dashboardService } from "@/services/dashboard.service";
import { DashboardSummaryResponse } from "@/types/dashboard";
import { useAuthStore } from "@/stores/auth.store";

export default function Page() {
  const { user } = useAuthStore();
  // Fallback if somehow user is undefined, though RoleGuard should prevent this
  const ownerId = user?.id;
  // || "019d1fbc-2c1a-7c4c-b75b-bd7fc875be16"

  const { data, isLoading, error } = useQuery<DashboardSummaryResponse>({
    queryKey: ["dashboardSummary", ownerId],
    queryFn: () => dashboardService.getDashboardSummary(ownerId),
    enabled: !!user?.id, // Only fetch if we have a valid user id
  });

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col overflow-auto bg-muted/20">
          <div className="@container/main flex flex-1 flex-col gap-2 relative min-h-[500px]">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10 backdrop-blur-sm">
                <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {error && (
              <div className="m-4 lg:m-6 p-4 text-rose-500 bg-rose-50 border border-rose-200 rounded-lg">
                Lỗi khi tải dữ liệu Dashboard. Vui lòng kiểm tra kết nối API.
              </div>
            )}

            {!isLoading && data && (
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {/* Row 1: KPI Cards */}
                <OverviewCards data={data.overview} />

                {/* Row 2: Charts and Occupancy */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-4 lg:px-6">
                  <div className="lg:col-span-2">
                    <RevenueChart data={data.revenueChart} />
                  </div>
                  <div className="col-span-1">
                    <ParkingOccupancy data={data.parkingOccupancy} />
                  </div>
                </div>

                {/* Row 3: Activity and Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-4 lg:px-6 pb-6">
                  <div className="lg:col-span-2">
                    <RecentActivity data={data.recentActivities} />
                  </div>
                  <div className="col-span-1">
                    <QuickActions data={data.alerts} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
