import { useQuery } from "@tanstack/react-query";
import { getCustomersByLot } from "@/services/customerService";
import { useCustomerStore } from "@/stores/customer.store";
import { useDebounce } from "@/hooks/useDebounce";
import { CustomerType } from "@/types/customer";

/**
 * Hook tổng hợp: React Query cho server state + Zustand cho UI state.
 *
 * - Search là SERVER-SIDE: truyền `search` lên API qua query param.
 * - Dùng debounce 400ms để tránh spam API khi user đang gõ.
 * - BE trả về { statusCode, message, data: [...], count } → unwrap trong select.
 */
export function useCustomers() {
  const { lotId, searchText } = useCustomerStore();

  // Debounce 400ms: chỉ gọi API sau khi user ngừng gõ
  const debouncedSearch = useDebounce(searchText, 400);

  const query = useQuery({
    queryKey: ["customers", lotId, debouncedSearch],
    queryFn: () => getCustomersByLot(lotId!, debouncedSearch),
    enabled: lotId !== null,
    staleTime: 1000 * 60 * 2, // 2 phút (search result thay đổi thường hơn)
    select: (res) => {
      // BE wrap trong { statusCode, message, data: [...], count }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = res as any;
      const list = raw?.data ?? raw;
      return (Array.isArray(list) ? list : []) as CustomerType[];
    },
  });

  return {
    customers: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching, // dùng để hiển thị subtle loading khi search
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
