import { create } from "zustand";
import { 
  CustomerList, 
  OwnerList, 
  OwnerStats, 
  UserStats, 
  AdminStats, 
  AdminActivity, 
  SystemStatus,
  Transaction,
  MonthlyRevenue,
  ParkingLotRevenue,
  RevenueSource,
  DailyRevenue,
  RecentTransaction,
  ParkingLot,
  ParkingLotItem,
  ParkingLotStats,
  ApprovalRequest
} from "@/services/admin.service";

interface AdminState {
  // Dashboard Overview
  overviewStats: AdminStats | null;
  recentActivities: AdminActivity[];
  systemStatus: SystemStatus | null;
  isDashboardLoading: boolean;
  dashboardError: string | null;

  // Customers
  customers: CustomerList[];
  customerStats: UserStats | null;
  isCustomersLoading: boolean;
  customersError: string | null;

  // Owners
  owners: OwnerList[];
  ownerStats: OwnerStats | null;
  isOwnersLoading: boolean;
  ownersError: string | null;

  // Transactions
  transactions: Transaction[];
  isTransactionsLoading: boolean;
  transactionsError: string | null;

  // Reports
  monthlyRevenue: MonthlyRevenue[];
  dailyRevenue: DailyRevenue[];
  topParkingLots: ParkingLotRevenue[];
  revenueSources: RevenueSource[];
  recentTransactions: RecentTransaction[];
  parkingLots: ParkingLotItem[];
  parkingLotStats: ParkingLotStats | null;
  approvalRequests: ApprovalRequest[];
  isReportsLoading: boolean;
  isParkingLotsLoading: boolean;
  isApprovalsLoading: boolean;
  reportsError: string | null;
  parkingLotsError: string | null;
  approvalsError: string | null;

  // Actions
  setDashboardData: (stats: AdminStats, activities: AdminActivity[], systemStatus: SystemStatus) => void;
  setDashboardLoading: (loading: boolean) => void;
  setDashboardError: (error: string | null) => void;

  setCustomers: (customers: CustomerList[]) => void;
  setCustomerStats: (stats: UserStats) => void;
  setCustomersLoading: (loading: boolean) => void;
  setCustomersError: (error: string | null) => void;

  setOwners: (owners: OwnerList[]) => void;
  setOwnerStats: (stats: OwnerStats) => void;
  setOwnersLoading: (loading: boolean) => void;
  setOwnersError: (error: string | null) => void;

  setTransactions: (transactions: Transaction[]) => void;
  setTransactionsLoading: (loading: boolean) => void;
  setTransactionsError: (error: string | null) => void;

  setReportsData: (
    monthly: MonthlyRevenue[],
    daily: DailyRevenue[],
    topLots: ParkingLotRevenue[],
    sources: RevenueSource[],
    recent: RecentTransaction[]
  ) => void;
  setReportsLoading: (loading: boolean) => void;
  setReportsError: (error: string | null) => void;

  setParkingLots: (parkingLots: ParkingLotItem[]) => void;
  setParkingLotStats: (stats: ParkingLotStats) => void;
  setParkingLotsLoading: (loading: boolean) => void;
  setParkingLotsError: (error: string | null) => void;

  setApprovalRequests: (requests: ApprovalRequest[]) => void;
  setApprovalsLoading: (loading: boolean) => void;
  setApprovalsError: (error: string | null) => void;

  // Bulk updates
  setCustomerData: (customers: CustomerList[], stats: UserStats) => void;
  setOwnerData: (owners: OwnerList[], stats: OwnerStats) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  // Initial state
  overviewStats: null,
  recentActivities: [],
  systemStatus: null,
  isDashboardLoading: false,
  dashboardError: null,

  customers: [],
  customerStats: null,
  isCustomersLoading: false,
  customersError: null,

  owners: [],
  ownerStats: null,
  isOwnersLoading: false,
  ownersError: null,

  transactions: [],
  isTransactionsLoading: false,
  transactionsError: null,

  monthlyRevenue: [],
  dailyRevenue: [],
  topParkingLots: [],
  revenueSources: [],
  recentTransactions: [],
  parkingLots: [],
  parkingLotStats: null,
  approvalRequests: [],
  statsRequest: null,
  isReportsLoading: false,
  isParkingLotsLoading: false,
  isApprovalsLoading: false,
  reportsError: null,
  parkingLotsError: null,
  approvalsError: null,

  // Actions
  setDashboardData: (overviewStats, recentActivities, systemStatus) => 
    set({ overviewStats, recentActivities, systemStatus, isDashboardLoading: false, dashboardError: null }),
  setDashboardLoading: (isDashboardLoading) => set({ isDashboardLoading }),
  setDashboardError: (dashboardError) => set({ dashboardError, isDashboardLoading: false }),

  setCustomers: (customers) => set({ customers, isCustomersLoading: false }),
  setCustomerStats: (customerStats) => set({ customerStats }),
  setCustomersLoading: (isCustomersLoading) => set({ isCustomersLoading }),
  setCustomersError: (customersError) => set({ customersError, isCustomersLoading: false }),

  setOwners: (owners) => set({ owners, isOwnersLoading: false }),
  setOwnerStats: (ownerStats) => set({ ownerStats }),
  setOwnersLoading: (isOwnersLoading) => set({ isOwnersLoading }),
  setOwnersError: (ownersError) => set({ ownersError, isOwnersLoading: false }),

  setTransactions: (transactions) => set({ transactions, isTransactionsLoading: false }),
  setTransactionsLoading: (isTransactionsLoading) => set({ isTransactionsLoading }),
  setTransactionsError: (transactionsError) => set({ transactionsError, isTransactionsLoading: false }),

  setReportsData: (monthlyRevenue, dailyRevenue, topParkingLots, revenueSources, recentTransactions) =>
    set({ monthlyRevenue, dailyRevenue, topParkingLots, revenueSources, recentTransactions, isReportsLoading: false, reportsError: null }),
  setReportsLoading: (isReportsLoading) => set({ isReportsLoading }),
  setReportsError: (reportsError) => set({ reportsError, isReportsLoading: false }),

  setParkingLots: (parkingLots) => set({ parkingLots, isParkingLotsLoading: false }),
  setParkingLotStats: (parkingLotStats) => set({ parkingLotStats }),
  setParkingLotsLoading: (isParkingLotsLoading) => set({ isParkingLotsLoading }),
  setParkingLotsError: (parkingLotsError) => set({ parkingLotsError, isParkingLotsLoading: false }),

  setApprovalRequests: (approvalRequests) => set({ approvalRequests, isApprovalsLoading: false }),
  setApprovalsLoading: (isApprovalsLoading) => set({ isApprovalsLoading }),
  setApprovalsError: (approvalsError) => set({ approvalsError, isApprovalsLoading: false }),
  
  setCustomerData: (customers, customerStats) => 
    set({ customers, customerStats, isCustomersLoading: false, customersError: null }),
    
  setOwnerData: (owners, ownerStats) => 
    set({ owners, ownerStats, isOwnersLoading: false, ownersError: null }),
}));
