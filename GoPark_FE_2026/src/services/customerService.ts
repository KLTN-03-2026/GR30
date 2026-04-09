import { get } from "@/lib/api";

/**
 * Lấy danh sách khách hàng của một bãi đỗ xe theo lotId.
 * API: GET /parking-lots/{lotId}/users?search={search}
 */
export const getCustomersByLot = (
  lotId: number,
  search: string = "",
): Promise<unknown> =>
  get<unknown>(`/parking-lots/${lotId}/users`, search ? { search } : undefined);
