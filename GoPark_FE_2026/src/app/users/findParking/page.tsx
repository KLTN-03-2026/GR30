"use client";
import React, { useState, useEffect } from "react";
import { TopFilter } from "@/components/features/findParking/TopFilter";
import { ParkingMap } from "@/components/features/findParking/ParkingMap";
import { ParkingList } from "@/components/features/findParking/ParkingList";
import { parkingService } from "@/services/parking.service";

export default function FindParkingPage() {
  const [destination, setDestination] = useState<{lng: number, lat: number, name: string} | null>(null);
  const [parkingLots, setParkingLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParkingLot, setSelectedParkingLot] = useState<any | null>(null);
  const [directionRoute, setDirectionRoute] = useState<{coordinates: [number, number][]} | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const fetchLots = async () => {
      try {
        setLoading(true);
        const res = await parkingService.getAllParkingLots();
        if (res.data) {
          setParkingLots(res.data);
        } else if (Array.isArray(res)) {
          setParkingLots(res);
        }
      } catch (err) {
        console.error("Failed to fetch parking lots", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLots();
  }, []);

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden">
      <div className="w-full z-50">
        <TopFilter onSearch={setDestination} />
      </div>
      <div className="flex flex-1 relative overflow-hidden z-0">
        <ParkingList 
          parkingLots={parkingLots} 
          loading={loading} 
          onSelectLot={setSelectedParkingLot} 
          selectedLotId={selectedParkingLot?.id} 
          onRouteFound={setDirectionRoute}
          onClearRoute={() => { setDirectionRoute(null); setIsNavigating(false); }}
          isNavigating={isNavigating}
          onStartNavigation={() => setIsNavigating(true)}
        />
        <ParkingMap 
          destination={destination} 
          parkingLots={parkingLots}
          selectedParkingLot={selectedParkingLot}
          setSelectedParkingLot={setSelectedParkingLot}
          directionRoute={directionRoute}
          isNavigating={isNavigating}
        />
      </div>
    </div>
  );
}