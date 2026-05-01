import { get } from "@/lib/api";
import { DashboardSummaryResponse } from "@/types/dashboard";

class DashboardService {
  /**
   * Fetch the dashboard summary for an owner.
   * Method: GET
   * URL: /analytics/owner/{ownerId}/dashboard-summary
   */
  async getDashboardSummary(ownerId: string | number): Promise<DashboardSummaryResponse> {
    try {
      const response = await get<DashboardSummaryResponse>(`/analytics/owner/${ownerId}/dashboard-summary`);
      // Lấy data từ axios/fetch response nếu API bọc trong property 'data'
      const data = (response as any).data || response;
      return data;
    } catch (error) {
      console.error("Failed to fetch dashboard summary:", error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();
