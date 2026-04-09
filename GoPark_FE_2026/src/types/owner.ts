export interface OwnerProfileType {
  name: string;
  phone: string | null;
  email: string;
  image: string | null;
  totalLots: number;
}

/** Dùng cho danh sách bãi từ /parking-lots/owner/:ownerId */
export interface ParkingLotType {
  id: number;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  totalSlots: number;
  availableSlots: number;
  status: "OPEN" | "CLOSED" | string;
}

/** Dùng cho /parking-lots/owner/:ownerId/totals */
export interface OwnerTotalsType {
  totalParkingLots: number;
  totalSlots: number;
  totalAvailableSlots: number;
  totalOccupiedSlots: number;
  statusBreakdown: Record<string, number>;
}

/** Request body cho update profile */
export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
}

/** Request body cho change password */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
