import { useAuthStore } from "@/stores/auth.store";
import { useOwnerStore } from "@/stores/owner.store";
import { useOwnerParkingLots } from "@/hooks/useOwnerParkingLots";
import { OwnerProfileType } from "@/types/owner";

/**
 * Hook cho trang Account Owner.
 *
 * - Profile: lấy trực tiếp từ useAuthStore (đã có sẵn sau khi login)
 *   → không cần gọi API riêng vì login response đã bao gồm profile.name, profile.phone
 * - Parking Lots: dùng useOwnerParkingLots (React Query)
 * - UI toggles: dùng useOwnerStore (Zustand UI state)
 */
export function useAccountPage() {
  // 1. Auth state — lấy user từ login response
  const user = useAuthStore((s) => s.user);

  // 2. UI state từ owner store
  const { showParkingLots, toggleParkingLots } = useOwnerStore();

  // 3. Parking lots — React Query (chỉ fetch khi showParkingLots = true)
  const {
    data: parkingLots = [],
    isLoading: isLoadingLots,
    isFetching: isFetchingLots,
  } = useOwnerParkingLots();

  // 4. Map user sang OwnerProfileType để truyền vào component
  const profile: OwnerProfileType | null = user
    ? {
        name: user.profile?.name || user.email || "N/A",
        phone: user.profile?.phone ?? null,
        email: user.email,
        image: user.profile?.image ?? null,
        totalLots: parkingLots.length,
      }
    : null;

  // 5. Handler toggle parking lots
  const handleViewParkingLots = () => {
    toggleParkingLots();
  };

  return {
    profile,
    parkingLots,
    showParkingLots,
    isLoadingLots,
    isFetchingLots,
    handleViewParkingLots,
    user,
  };
}
