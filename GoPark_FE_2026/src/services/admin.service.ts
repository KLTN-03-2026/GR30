import { get, patch } from "@/lib/api";

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

export interface ParkingLotStats {
  totalParkingLots: number;
  activeParkingLots: number;
  availableSpacesParkingSlot: string;
  averageRating: string;
}

export interface AdminActivity {
  id: string;
  type: string;
  content: string;
  username: string;
  time: string;
  status: "success" | "warning" | "error";
}

export interface SystemStatus {
  apiService: { status: string; message: string };
  database: { status: string; message: string };
  paymentGateway: { status: string; message: string };
  notification: { status: string; message: string };
}

export interface WrappedResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface UserStats {
  totalUsers: number;
  newUsersLastMonth: number;
  activeUsers: number;
  blockedUsers: number;
}

export interface CustomerList {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: "ACTIVE" | "BLOCKED";
  totalBookings: number;
  totalSpending: number;
  lastActive: string;
  createdAt: string;
  address?: string;
}

export interface OwnerStats {
  totalOwners: number;
  newOwnersLastMonth: number;
  activeOwners: number;
  blockedOwners: number;
}

export interface OwnerList {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalParkingLots: number;
  totalRevenue: string; // Backend returns string like "0 Tr ₫"
  totalBookings: number;
  status: "ACTIVE" | "BLOCKED" | string;
  createdAt: string;
}

/** Transaction related types */
export type TransactionStatus = "success" | "pending" | "failed" | "refunded";
export type PaymentMethod =
  | "momo"
  | "vnpay"
  | "zalopay"
  | "bank_transfer"
  | "wallet"
  | "cash"
  | "credit_card";
export type TransactionType =
  | "top_up"
  | "withdrawal"
  | "booking_payment"
  | "subscription"
  | "refund"
  | "penalty";

export interface TransactionUser {
  _id: string;
  userName: string;
  email: string;
  role: "user" | "owner";
}

export interface Transaction {
  _id: string;
  transactionCode: string;
  user: TransactionUser;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  paymentMethod: PaymentMethod;
  description: string;
  bookingId?: string;
  parkingLotName?: string;
  parkingLotAddress?: string;
  createdAt: string;
  completedAt?: string;
  failedReason?: string;
  refundReason?: string;
}

/** Report related types */
export interface MonthlyRevenue {
  month: string;
  bookingRevenue: number;
  subscriptionRevenue: number;
  penaltyRevenue: number;
  totalRevenue: number;
  refunds: number;
  netRevenue: number;
}

export interface ParkingLotRevenue {
  name: string;
  revenue: number;
  bookings: number;
  percentage: number;
}

export interface RevenueSource {
  name: string;
  value: number;
  color: string;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  bookings: number;
}

export interface RecentTransaction {
  _id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  time: string;
}

/** Parking Lot related types */
export type ParkingLotStatus = "ACTIVE" | "PENDING" | "INACTIVE" | "CLOSED";
export type ParkingLotType =
  | "OUTDOOR"
  | "INDOOR"
  | "UNDERGROUND"
  | "ROOFTOP"
  | "MULTI_LEVEL";

export interface OwnerInfoShort {
  _id: string;
  userName: string;
  email: string;
  phoneNumber: string;
}

export interface ParkingZone {
  name: string;
  totalSlots: number;
  availableSlots: number;
}

export interface ParkingLot {
  _id: string;
  name: string;
  address: string;
  description?: string;
  owner: OwnerInfoShort;
  status: ParkingLotStatus;
  type: ParkingLotType;
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
  pricePerHour: {
    zonename?: string;
    pricePerHour: number;
    pricePerDay: number;
  }[];
  rating: number;
  totalReviews: number;
  totalBookings: number;
  totalRevenue: number;
  openTime: string;
  closeTime: string;
  amenities: string[];
  zones?: ParkingZone[];
  images?: string[];
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ParkingLotItem {
  id: number;
  name: string;
  location: string;
  description: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING" | string;
  type: string;
  occupiedSlots: number;
  owner: {
    id: number;
    name: string;
    phone: string;
    gender: string | null;
    image: string | null;
  };
  availableSpaces: {
    totalSlots: number;
    availableSlots: number;
  };
  totalSpaces: number;
  pricePerHour: {
    zonename?: string;
    pricePerHour: number;
    pricePerDay: number;
  }[];
  averageRating: string;
  totalReviews: number;
  totalBookings: number;
  totalRevenue: string;
  openTime: string;
  closeTime: string;
  amenities: string[];
  zones: {
    id: number;
    name: string;
    totalSlots: number;
    availableSlots: number;
  }[];
}

/** Approval Request related types */
export type RequestType =
  | "UPDATE_PARKING_LOT"
  | "PAYMENT"
  | "BECOME_OWNER"
  | "WITHDRAW_FUND"
  | "REFUND"
  | "NEW_PARKING_LOT"
  | "OTHER";

export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "PROCESSING";

export interface Requester {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  role?: "user" | "owner";
}

export interface StatsApprovalRequest {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
}

export interface ApprovalRequest {
  id: string;
  requester: Requester;
  type: RequestType;
  status: RequestStatus;
  title?: string;
  description: string;
  payload?: any;
  attachments?: string[];
  adminNote?: string;
  relatedParkingLot?: {
    id: string;
    name: string;
    address: string;
  };
  newValue?: string;
  oldValue?: string;
  amount?: number;
  createdAt: string;
  updatedAt: string;
}

class AdminService {
  /**
   * Get overview stats for admin dashboard
   * GET /api/v1/admin/stats/overview
   */
  async getOverviewStats(): Promise<AdminStats> {
    const response = await get<ApiResponse<AdminStats>>(
      "/admin/stats/overview",
    );
    return response.data;
  }

  /**
   * Get recent activities for admin dashboard
   * GET /api/v1/admin/stats/activities-recent
   */
  async getRecentActivities(page?: number, limit?: number): Promise<{ data: AdminActivity[], total: number }> {
    const url = page && limit ? `/admin/stats/activities-recent?page=${page}&limit=${limit}` : "/admin/stats/activities-recent";
    const response = await get<any>(url);
    return { data: response.data || [], total: response.count || response.data?.length || 0 };
  }

  /**
   * Get user statistics
   * GET /api/v1/admin/stats/users
   */
  async getUserStats(): Promise<UserStats> {
    const response = await get<
      ApiResponse<{
        totalUsers: number;
        newUsersLastMonth: number;
        activeUsers: number;
        blockedUsers: number;
      }>
    >("/admin/stats/users");
    return response.data;
  }

  /**
   * Get system status for admin dashboard
   * GET /api/v1/admin/dashboard/system-status
   * (Keeping this one as it was before, assuming it still exists)
   */
  async getSystemStatus(): Promise<SystemStatus> {
    const response = await get<ApiResponse<SystemStatus>>(
      "/admin/dashboard/system-status",
    );
    return response.data;
  }

  async getCustomers(): Promise<CustomerList[]> {
    const response =
      await get<ApiResponse<WrappedResponse<CustomerList[]>>>(
        "/admin/users/list",
      );
    return response.data.data;
  }

  /**
   * Get owner statistics
   * GET /api/v1/admin/stats/owners
   */
  async getOwnerStats(): Promise<OwnerStats> {
    const response = await get<ApiResponse<OwnerStats>>("/admin/stats/owners");
    return response.data;
  }

  /**
   * Get list of owners
   * GET /api/v1/admin/owners/list
   */
  async getOwners(): Promise<OwnerList[]> {
    const response =
      await get<ApiResponse<WrappedResponse<OwnerList[]>>>(
        "/admin/owners/list",
      );
    return response.data.data;
  }

  /**
   * Get list of transactions
   * GET /api/v1/admin/transactions
   */
  async getTransactions(): Promise<Transaction[]> {
    const response = await get<ApiResponse<WrappedResponse<Transaction[]>>>(
      "/admin/transactions",
    );
    return response.data.data;
  }

  /**
   * Get list of all parking lots
   * GET /api/v1/admin/parking-lots
   */
  async getParkingLots(): Promise<ParkingLot[]> {
    const response = await get<ApiResponse<WrappedResponse<ParkingLot[]>>>(
      "/admin/parking-lots",
    );
    return response.data.data;
  }

  /**
   * Get parking lot stats
   * GET /api/v1/admin/stats/parking-lots
   */
  async getParkingLotStats(): Promise<ParkingLotStats> {
    const response = await get<ApiResponse<ParkingLotStats>>("/admin/stats/parking-lots");
    return response.data;
  }

  /**
   * Get parking lot list
   * GET /api/v1/admin/parking-lots/list
   */
  async getParkingLotsList(): Promise<{ data: ParkingLotItem[]; meta: any }> {
    const response = await get<ApiResponse<WrappedResponse<ParkingLotItem[]>> & { meta?: any }>(
      "/admin/parking-lots/list",
    );
    // The structure: { statusCode, message, data: { success, message, data: [...], meta: {...} } }
    // our 'get' helper usually returns the outer 'data' field.
    const nestedData = response.data; // This is the WrappedResponse
    return {
      data: nestedData.data || [],
      meta: (nestedData as any).meta || response.meta
    };
  }

  /**
   * Get list of all approval requests
   * GET /api/v1/admin/stats/requests
   */
  async getStatsApprovalRequests(): Promise<StatsApprovalRequest> {
    const response =
      await get<ApiResponse<StatsApprovalRequest>>("/admin/stats/requests");
    return response.data;
  }

  /**  * Get list of all approval requests
   * GET /api/v1/admin/requests
   */
  async getApprovalRequests(): Promise<ApprovalRequest[]> {
    const response = await get<
      ApiResponse<{
        items: ApprovalRequest[];
        meta: any;
      }>
    >("/admin/requests");
    return response.data.items;
  }

  /**
   * Update user status (block/unblock)
   * PATCH /api/v1/admin/users/:userId/status
   */
  async updateUserStatus(userId: string, status: "ACTIVE" | "BLOCKED"): Promise<void> {
    await patch(`/admin/users/${userId}/status`, { status });
  }

  /**
   * Approve an approval request
   * PATCH /api/v1/admin/requests/:requestId/approve
   */
  async approveRequest(requestId: string, adminId: string, reason: string): Promise<void> {
    await patch(`/admin/requests/${requestId}/approve`, { adminId, reason });
  }

  /**
   * Reject an approval request
   * PATCH /api/v1/admin/requests/:requestId/reject
   */
  async rejectRequest(requestId: string, adminId: string, reason: string): Promise<void> {
    await patch(`/admin/requests/${requestId}/reject`, { adminId, reason });
  }
}

export const adminService = new AdminService();
