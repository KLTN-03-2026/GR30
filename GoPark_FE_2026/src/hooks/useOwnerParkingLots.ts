import { useQuery } from "@tanstack/react-query";
import { getOwnerParkingLots } from "@/services/ownerService";
import { useAuthStore } from "@/stores/auth.store";
import { ParkingLotType } from "@/types/owner";

/**
 * Lấy danh sách bãi đỗ xe của owner.
 * ownerId lấy từ useAuthStore (user.id sau khi login thật).
 * BE trả về dạng { statusCode, message, data: [...] } hoặc trực tiếp [...].
 */
export function useOwnerParkingLots() {
  const ownerId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ["parkingLots", ownerId],
    queryFn: () => getOwnerParkingLots(ownerId!),
    enabled: !!ownerId,
    staleTime: 1000 * 60 * 10,
    select: (res) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = res as any;
      const list = raw?.data ?? raw;
      return (Array.isArray(list) ? list : []) as ParkingLotType[];
    },
  });
}
