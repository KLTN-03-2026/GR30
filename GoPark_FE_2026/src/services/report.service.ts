import { get } from "@/lib/api";
import { Report } from "@/types/report";

export const getOwnerReports = async (ownerId: string): Promise<Report[]> => {
  const res = await get<{ data: Report[] } | Report[]>(`/reports/owner/${ownerId}`);
  
  // Unwrap BE envelope nếu có
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (res as any)?.data ?? res;
  return Array.isArray(data) ? data : [];
};
