import { create } from "zustand";

/**
 * Owner UI State (Zustand)
 * Chỉ giữ UI state thuần túy (ví dụ: show/hide panels).
 * Việc fetch API được xử lý bởi React Query hooks (useOwnerParkingLots, useOwnerTotals, v.v.)
 */
interface OwnerUIState {
  showParkingLots: boolean;
  setShowParkingLots: (show: boolean) => void;
  toggleParkingLots: () => void;
}

export const useOwnerStore = create<OwnerUIState>((set) => ({
  showParkingLots: false,
  setShowParkingLots: (show) => set({ showParkingLots: show }),
  toggleParkingLots: () =>
    set((state) => ({ showParkingLots: !state.showParkingLots })),
}));
