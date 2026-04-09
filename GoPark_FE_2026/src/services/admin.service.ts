import { get } from "@/lib/api";

export interface AdminStats {
  totalUsers: number;
  userChangePercent: number;
  totalParkingLots: number;
  newParkingLotsThisMonth: number;
  todayBookings: number;
  bookingChangePercent: number;
  thisMonthRevenue: number;
  revenueChangePercent: number;
  pendingApprovals: number;
  activeBookings: number;
}

export interface AdminActivity {
  id: string;
  type: string;
  message: string;
  user: string;
  time: string;
  status: "success" | "warning" | "error";
}

export interface SystemStatus {
  apiService: { status: string; message: string };
  database: { status: string; message: string };
  paymentGateway: { status: string; message: string };
  notification: { status: string; message: string };
}

export interface ApiResponse<T> {
  status: string;
  data: T;
}

class AdminService {
  /**
   * Get overview stats for admin dashboard
   * GET /api/v1/admin/stats/overview
   */
  async getOverviewStats(): Promise<AdminStats> {
    const response = await get<ApiResponse<AdminStats>>("/admin/stats/overview");
    return response.data;
  }

  /**
   * Get recent activities for admin dashboard
   * GET /api/v1/admin/stats/activities-recent
   */
  async getRecentActivities(): Promise<AdminActivity[]> {
    const response = await get<ApiResponse<AdminActivity[]>>("/admin/stats/activities-recent");
    return response.data;
  }

  /**
   * Get system status for admin dashboard
   * GET /api/v1/admin/dashboard/system-status
   * (Keeping this one as it was before, assuming it still exists)
   */
  async getSystemStatus(): Promise<SystemStatus> {
    const response = await get<ApiResponse<SystemStatus>>("/admin/dashboard/system-status");
    return response.data;
  }
}

export const adminService = new AdminService();
