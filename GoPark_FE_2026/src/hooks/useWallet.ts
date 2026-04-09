import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";

export function useWallet() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;

  return useQuery({
    queryKey: ["wallet", userId],
    queryFn: async () => {
      // Gọi API lấy thông tin ví
      const res: any = await apiClient(`/wallets/my-wallet?userId=${userId}`);
      return Number(res?.data?.balance ?? res?.balance ?? 0);
    },
    enabled: !!userId,
    // Dữ liệu tiền cần mới thường xuyên, cache 1 phút thôi hoặc 30s
    staleTime: 1000 * 30,
    retry: false,
  });
}

// Hook để lấy lịch sử GD
export function useWalletTransactions() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;

  return useQuery({
    queryKey: ["walletTransactions", userId],
    queryFn: async () => {
      const res: any = await apiClient(`/wallets/transactions?userId=${userId}`);
      return (res?.data ?? res ?? []) as any[];
    },
    enabled: !!userId,
  });
}
