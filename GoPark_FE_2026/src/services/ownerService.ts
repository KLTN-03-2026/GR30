import {
  OwnerProfileType,
  ParkingLotType,
  OwnerTotalsType,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "@/types/owner";
import { get, put, post } from "@/lib/api";

// ─── Profile ────────────────────────────────────────────────────────────────

interface UserApiResponse {
  id: string;
  email: string;
  status: string;
  profile?: {
    name?: string;
    phone?: string | null;
    image?: string | null;
  };
  totalLots?: number;
}

export const getOwnerProfile = async (id: string): Promise<OwnerProfileType> => {
  if (!id || id === "undefined") {
    console.error("OwnerService: fetchProfile called with invalid ID:", id);
    throw new Error("Invalid User ID");
  }

  console.log(`OwnerService: Fetching data for /users/${id}`);
  const res = await get<{ data: UserApiResponse } | UserApiResponse>(`/users/${id}`);

  // Unwrap BE envelope nếu có
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (res as any)?.data ?? (res as UserApiResponse);

  return {
    name: user?.profile?.name || "N/A",
    phone: user?.profile?.phone ?? null,
    email: user?.email || "",
    image: user?.profile?.image ?? null,
    totalLots: user?.totalLots || 0,
  };
};

export const updateOwnerProfile = async (
  id: string,
  data: UpdateProfileRequest,
): Promise<OwnerProfileType> => {
  const res = await put<{ data: UserApiResponse } | UserApiResponse>(
    `/users/${id}`,
    { name: data.name, phone: data.phone },
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (res as any)?.data ?? (res as UserApiResponse);

  return {
    name: user?.profile?.name || data.name || "N/A",
    phone: user?.profile?.phone ?? data.phone ?? null,
    email: user?.email || "",
    image: user?.profile?.image ?? null,
    totalLots: user?.totalLots || 0,
  };
};

// ─── Password ────────────────────────────────────────────────────────────────

export const changePassword = async (payload: ChangePasswordRequest): Promise<void> => {
  await post<unknown>("/auth/change-password", payload);
};

// ─── Parking Lots ─────────────────────────────────────────────────────────────

export const getOwnerParkingLots = async (ownerId: string): Promise<ParkingLotType[]> => {
  return get<ParkingLotType[]>(`/parking-lots/owner/${ownerId}`);
};

export const getOwnerTotals = async (ownerId: string): Promise<OwnerTotalsType> => {
  return get<OwnerTotalsType>(`/parking-lots/owner/${ownerId}/totals`);
};
