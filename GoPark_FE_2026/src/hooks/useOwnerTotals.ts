import { useQuery } from "@tanstack/react-query";
import { getOwnerTotals } from "@/services/ownerService";
import { useAuthStore } from "@/stores/auth.store";
import { OwnerTotalsType } from "@/types/owner";

/**
 * Lấy thống kê tổng hợp các bãi của owner.
 * ownerId lấy từ useAuthStore (user.id sau khi login thật).
 * BE trả về dạng { statusCode, message, data: { totalParkingLots, ... } }.
 */
export function useOwnerTotals() {
  const ownerId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ["ownerTotals", ownerId],
    queryFn: () => getOwnerTotals(ownerId!),
    enabled: !!ownerId,
    staleTime: 1000 * 60 * 5,
    select: (res) => {
      // Unwrap nếu BE trả về { data: {...} }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = res as any;
      return (raw?.data ?? raw) as OwnerTotalsType;
    },
  });
}
