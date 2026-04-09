import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { get } from "@/lib/api";

// Interfaces mapping to the requested schema
export interface AnalyticsTransaction {
  id: string;
  parkingLotName: string;
  licensePlate: string;
  time: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'FAILED';
  method: 'VNPAY' | 'VIETQR' | 'WALLET';
}

export interface AnalyticsTopLot {
  id: string;
  name: string;
  totalRevenue: number;
  occupancyRate: number;
}

export interface AnalyticsData {
  metrics: {
    totalRevenue: number;
    revenueStatus: { value: number; isUp: boolean };
    successfulTransactions: number;
    occupancyRate: number;
    totalParkingLots: number;
  };
  revenueOverTime: { date: string; amount: number }[];
  paymentMethods: { method: string; value: number; color: string }[];
  trafficFlow: { hour: string; in: number; out: number }[];
  recentTransactions: AnalyticsTransaction[];
  topParkingLots: AnalyticsTopLot[];
  parkingLotsList: { id: string; name: string }[];
}

class AnalyticsService {
  async getAnalytics(
    dateRange: DateRange | undefined,
    lotId: string,
  ): Promise<AnalyticsData> {
    try {
      const params: Record<string, string> = {
        lotId: lotId !== 'all' ? lotId : '',
      };

      if (dateRange?.from) {
        params.startDate = format(dateRange.from, 'yyyy-MM-dd');
      }
      if (dateRange?.to) {
        params.endDate = format(dateRange.to, 'yyyy-MM-dd');
      }

      // Dùng helper get từ lib/api để tự động đính kèm token và dùng đúng base URL
      return await get<AnalyticsData>('/analytics', params);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
