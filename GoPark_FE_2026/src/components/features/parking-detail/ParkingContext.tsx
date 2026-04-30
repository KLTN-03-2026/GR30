"use client";

import { createContext } from "react";

export interface SelectedSpotContext {
  slot: any;
  zoneName: string;
  floorName: string;
}

interface ParkingContextType {
  dataLot: any;
  loadingLot: boolean;
  selectedSpot: SelectedSpotContext | null;
  setSelectedSpot: (spot: SelectedSpotContext | null) => void;
  setDataLot: React.Dispatch<React.SetStateAction<any>>;
  setLoadingLot: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ParkingContext = createContext<ParkingContextType| undefined>(undefined);