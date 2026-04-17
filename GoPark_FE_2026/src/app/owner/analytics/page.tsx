"use client";

import React, { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { DashboardHeader } from "./components/DashboardHeader";
import { OverviewCards } from "./components/OverviewCards";
import { AnalyticsCharts } from "./components/Charts";
import { DataTables } from "./components/DataTables";
import { analyticsService, AnalyticsData } from "@/services/analytics.service";
import * as xlsx from "xlsx";
import { toast } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useCustomerStore } from "@/stores/customer.store";

export default function AnalyticsPage() {
  const { lotId } = useCustomerStore();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const currentLotId = lotId ? lotId.toString() : "all";
        const result = await analyticsService.getAnalytics(
          dateRange,
          currentLotId,
        );
        setData(result);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        toast.error("Không tải được dữ liệu thống kê.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateRange, lotId]);

  const handleExport = () => {
    if (!data) return;

    try {
      // Create a logical structure for the Excel file
      const wb = xlsx.utils.book_new();

      // 1. Transactions Sheet
      const txSheet = xlsx.utils.json_to_sheet(
        data.recentTransactions.map((tx) => ({
          "Transaction ID": tx.id,
          "Parking Lot Name": tx.parkingLotName,
          "License Plate": tx.licensePlate,
          "Date/Time": new Date(tx.time).toLocaleString(),
          "Amount (VND)": tx.amount,
          Status: tx.status,
          "Payment Method": tx.method,
        })),
      );
      xlsx.utils.book_append_sheet(wb, txSheet, "Recent Transactions");

      // 2. Revenue Summary Sheet
      const revenueSheet = xlsx.utils.json_to_sheet(
        data.revenueOverTime.map((r) => ({
          Date: r.date,
          "Revenue (VND)": r.amount,
        })),
      );
      xlsx.utils.book_append_sheet(wb, revenueSheet, "Revenue Over Time");

      // Download
      xlsx.writeFile(
        wb,
        `GoPark_Analytics_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      toast.success("Xuất dữ liệu thống kê thành công!");
    } catch (error) {
      console.error("Export failed", error);
      toast.error("Xuất dữ liệu thất bại.");
    }
  };

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

        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
          <DashboardHeader
            dateRange={dateRange}
            setDateRange={setDateRange}
            onExport={handleExport}
          />

          {isLoading && data ? (
            <div className="absolute inset-0 bg-background/50 z-50 flex items-center justify-center backdrop-blur-sm pointer-events-none">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : null}

          {!data && isLoading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            data && (
              <div
                className={`transition-opacity duration-200 ${isLoading ? "opacity-50" : "opacity-100"}`}
              >
                <OverviewCards metrics={data.metrics} />
                <AnalyticsCharts
                  revenueData={data.revenueOverTime}
                  paymentData={data.paymentMethods}
                  trafficData={data.trafficFlow}
                />
                <DataTables
                  recentTransactions={data.recentTransactions}
                  topParkingLots={data.topParkingLots}
                />
              </div>
            )
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
