"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { BookingDataTable } from "@/components/features/bookings/BookingDataTable";

export default function BookingsPage() {
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

        <div className="max-w-6xl mx-auto p-6 space-y-6 w-full">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              Lịch sử Booking
            </h1>
            <p className="text-sm text-muted-foreground">
              Theo dõi và quản lý toàn bộ các lượt đặt chỗ tại bãi đỗ xe của bạn.
            </p>
          </div>

          <Card>
            <CardContent className="p-4">
              <BookingDataTable />
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
