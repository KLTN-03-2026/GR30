"use client";

import React from "react";
import OwnerProfile from "./OwnerProfile";
import ParkingLotList from "./ParkingLotList";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAccountPage } from "./hooks/useAccountPage";

export default function OwnerAccountPage() {
  const {
    profile,
    parkingLots,
    showParkingLots,
    isLoadingLots,
    handleViewParkingLots,
  } = useAccountPage();

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
        <div className="flex flex-1 flex-col">
          <div className="min-h-[calc(100vh-80px)] bg-gray-50 p-6 md:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
              <OwnerProfile
                profile={profile}
                onViewParkingLots={handleViewParkingLots}
              />

              {showParkingLots && (
                <div className="mt-8 pt-6 border-t border-gray-200 transition-all duration-300 ease-in-out">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    Bãi đỗ xe của tôi
                  </h2>
                  <ParkingLotList
                    parkingLots={parkingLots}
                    isLoading={isLoadingLots}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
