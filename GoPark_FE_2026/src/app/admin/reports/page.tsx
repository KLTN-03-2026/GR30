"use client";

import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Users,
  Car,
  Calendar,
  RefreshCw,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Receipt,
  ParkingSquare,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
  LineChart,
  Line,
} from "recharts";

// ─── Kiểu dữ liệu ───────────────────────────────────────────────────────────

/** Dữ liệu doanh thu theo tháng */
interface MonthlyRevenue {
  month: string;           // Tên tháng (vd: "T1", "T2", ...)
  bookingRevenue: number;  // Doanh thu từ đặt chỗ
  subscriptionRevenue: number; // Doanh thu từ gói dịch vụ
  penaltyRevenue: number;  // Doanh thu từ phạt
  totalRevenue: number;    // Tổng doanh thu
  refunds: number;         // Hoàn tiền
  netRevenue: number;      // Doanh thu ròng
}

/** Doanh thu theo bãi đỗ */
interface ParkingLotRevenue {
  name: string;
  revenue: number;
  bookings: number;
  percentage: number;
}

/** Phân bổ doanh thu theo nguồn */
interface RevenueSource {
  name: string;
  value: number;
  color: string;
}

/** Doanh thu theo ngày (7 ngày gần nhất) */
interface DailyRevenue {
  date: string;
  revenue: number;
  bookings: number;
}

/** Giao dịch gần đây */
interface RecentTransaction {
  _id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  time: string;
}

// ─── Hằng số ──────────────────────────────────────────────────────────────────

/** Khoảng thời gian lọc */
const PERIODS = [
  { value: "7d", label: "7 ngày" },
  { value: "30d", label: "30 ngày" },
  { value: "this_month", label: "Tháng này" },
  { value: "last_month", label: "Tháng trước" },
  { value: "this_quarter", label: "Quý này" },
  { value: "this_year", label: "Năm nay" },
];

/** Màu cho biểu đồ tròn */
const PIE_COLORS = ["#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#10B981", "#EC4899"];

// ─── Dữ liệu mẫu ────────────────────────────────────────────────────────────

/** Doanh thu 12 tháng */
const mockMonthlyRevenue: MonthlyRevenue[] = [
  { month: "T1", bookingRevenue: 45000000, subscriptionRevenue: 5000000, penaltyRevenue: 2000000, totalRevenue: 52000000, refunds: 3200000, netRevenue: 48800000 },
  { month: "T2", bookingRevenue: 38000000, subscriptionRevenue: 4500000, penaltyRevenue: 1800000, totalRevenue: 44300000, refunds: 2800000, netRevenue: 41500000 },
  { month: "T3", bookingRevenue: 52000000, subscriptionRevenue: 6200000, penaltyRevenue: 2500000, totalRevenue: 60700000, refunds: 4100000, netRevenue: 56600000 },
  { month: "T4", bookingRevenue: 48000000, subscriptionRevenue: 5800000, penaltyRevenue: 2200000, totalRevenue: 56000000, refunds: 3600000, netRevenue: 52400000 },
  { month: "T5", bookingRevenue: 55000000, subscriptionRevenue: 7000000, penaltyRevenue: 2800000, totalRevenue: 64800000, refunds: 4500000, netRevenue: 60300000 },
  { month: "T6", bookingRevenue: 62000000, subscriptionRevenue: 7500000, penaltyRevenue: 3000000, totalRevenue: 72500000, refunds: 5000000, netRevenue: 67500000 },
  { month: "T7", bookingRevenue: 70000000, subscriptionRevenue: 8200000, penaltyRevenue: 3500000, totalRevenue: 81700000, refunds: 5800000, netRevenue: 75900000 },
  { month: "T8", bookingRevenue: 68000000, subscriptionRevenue: 8000000, penaltyRevenue: 3200000, totalRevenue: 79200000, refunds: 5400000, netRevenue: 73800000 },
  { month: "T9", bookingRevenue: 58000000, subscriptionRevenue: 7200000, penaltyRevenue: 2600000, totalRevenue: 67800000, refunds: 4200000, netRevenue: 63600000 },
  { month: "T10", bookingRevenue: 65000000, subscriptionRevenue: 8500000, penaltyRevenue: 3100000, totalRevenue: 76600000, refunds: 5200000, netRevenue: 71400000 },
  { month: "T11", bookingRevenue: 72000000, subscriptionRevenue: 9000000, penaltyRevenue: 3600000, totalRevenue: 84600000, refunds: 6000000, netRevenue: 78600000 },
  { month: "T12", bookingRevenue: 80000000, subscriptionRevenue: 10000000, penaltyRevenue: 4000000, totalRevenue: 94000000, refunds: 6800000, netRevenue: 87200000 },
];

/** Doanh thu 7 ngày gần nhất */
const mockDailyRevenue: DailyRevenue[] = [
  { date: "07/03", revenue: 2800000, bookings: 45 },
  { date: "08/03", revenue: 3200000, bookings: 52 },
  { date: "09/03", revenue: 2500000, bookings: 38 },
  { date: "10/03", revenue: 3800000, bookings: 61 },
  { date: "11/03", revenue: 4200000, bookings: 68 },
  { date: "12/03", revenue: 3600000, bookings: 55 },
  { date: "13/03", revenue: 4500000, bookings: 72 },
];

/** Top bãi đỗ doanh thu cao nhất */
const mockTopParkingLots: ParkingLotRevenue[] = [
  { name: "Bãi đỗ xe Bitexco", revenue: 170000000, bookings: 6800, percentage: 22.5 },
  { name: "ParkSmart Quận 1", revenue: 112000000, bookings: 5600, percentage: 14.8 },
  { name: "Bãi đỗ xe Royal City", revenue: 67500000, bookings: 4500, percentage: 8.9 },
  { name: "Vincom Đồng Khởi", revenue: 57600000, bookings: 3200, percentage: 7.6 },
  { name: "Times City", revenue: 22800000, bookings: 1520, percentage: 3.0 },
  { name: "Lotte Mart Q7", revenue: 7840000, bookings: 980, percentage: 1.0 },
];

/** Phân bổ doanh thu theo nguồn */
const mockRevenueSources: RevenueSource[] = [
  { name: "Đặt chỗ đỗ xe", value: 713000000, color: "#3B82F6" },
  { name: "Gói dịch vụ", value: 86900000, color: "#8B5CF6" },
  { name: "Phạt đỗ quá giờ", value: 34300000, color: "#F59E0B" },
];

/** Giao dịch gần đây */
const mockRecentTransactions: RecentTransaction[] = [
  { _id: "rt1", description: "Thanh toán đặt chỗ - Bãi Bitexco", amount: 350000, type: "income", time: "14:30" },
  { _id: "rt2", description: "Nạp tiền ví - Nguyễn Văn Anh", amount: 500000, type: "income", time: "14:15" },
  { _id: "rt3", description: "Hoàn tiền booking #BK-045", amount: 120000, type: "expense", time: "13:50" },
  { _id: "rt4", description: "Gói quảng cáo - Bãi Bitexco", amount: 990000, type: "income", time: "13:20" },
  { _id: "rt5", description: "Thanh toán đặt chỗ - Royal City", amount: 200000, type: "income", time: "12:45" },
  { _id: "rt6", description: "Phạt đỗ quá giờ - Vạn Hạnh Mall", amount: 50000, type: "income", time: "12:10" },
  { _id: "rt7", description: "Rút tiền - Phạm Đức Duy", amount: 5000000, type: "expense", time: "11:30" },
  { _id: "rt8", description: "Thanh toán đặt chỗ - Vincom Q1", amount: 250000, type: "income", time: "11:00" },
];

// ─── Hàm tiện ích ─────────────────────────────────────────────────────────────

/** Định dạng tiền tệ VND */
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

/** Định dạng tiền rút gọn */
const formatCompactCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", notation: "compact", maximumFractionDigits: 1 }).format(amount);

/** Định dạng số */
const formatNumber = (num: number) => new Intl.NumberFormat("vi-VN").format(num);

/** Custom tooltip cho biểu đồ */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
        <p className="text-sm font-semibold text-gray-900 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {formatCompactCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Component chính ──────────────────────────────────────────────────────────

export default function RevenueReportPage() {
  // ── State ───────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("this_year");

  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [topParkingLots, setTopParkingLots] = useState<ParkingLotRevenue[]>([]);
  const [revenueSources, setRevenueSources] = useState<RevenueSource[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);

  // ── Tải dữ liệu ────────────────────────────────────────────────────────────

  const fetchData = async () => {
    setLoading(true);
    try {
      // TODO: Gọi API thực tế
      await new Promise((res) => setTimeout(res, 600));
      setMonthlyRevenue(mockMonthlyRevenue);
      setDailyRevenue(mockDailyRevenue);
      setTopParkingLots(mockTopParkingLots);
      setRevenueSources(mockRevenueSources);
      setRecentTransactions(mockRecentTransactions);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu báo cáo:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [period]);

  // ── Tính toán thống kê ──────────────────────────────────────────────────────

  const summary = useMemo(() => {
    const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.totalRevenue, 0);
    const totalRefunds = monthlyRevenue.reduce((s, m) => s + m.refunds, 0);
    const netRevenue = monthlyRevenue.reduce((s, m) => s + m.netRevenue, 0);
    const totalBookingRevenue = monthlyRevenue.reduce((s, m) => s + m.bookingRevenue, 0);

    // So sánh tháng hiện tại vs tháng trước
    const currentMonth = monthlyRevenue[monthlyRevenue.length - 1];
    const prevMonth = monthlyRevenue[monthlyRevenue.length - 2];
    const revenueGrowth = currentMonth && prevMonth
      ? ((currentMonth.totalRevenue - prevMonth.totalRevenue) / prevMonth.totalRevenue * 100).toFixed(1)
      : "0";

    const todayRevenue = dailyRevenue.length > 0 ? dailyRevenue[dailyRevenue.length - 1].revenue : 0;
    const todayBookings = dailyRevenue.length > 0 ? dailyRevenue[dailyRevenue.length - 1].bookings : 0;

    return { totalRevenue, totalRefunds, netRevenue, totalBookingRevenue, revenueGrowth, todayRevenue, todayBookings };
  }, [monthlyRevenue, dailyRevenue]);

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải báo cáo doanh thu...</p>
        </div>
      </div>
    );
  }

  // ── Giao diện ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Tiêu đề + chọn khoảng thời gian ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl px-8 py-6 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <BarChart3 className="w-6 h-6" />
            Báo cáo Doanh thu
          </h1>
          <p className="text-blue-200/70 mt-1 text-sm">Thống kê tổng quan doanh thu hệ thống GoPark</p>
        </div>
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          {/* Bộ chọn khoảng thời gian */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="h-10 px-4 border border-white/20 rounded-lg bg-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm [&>option]:text-gray-900"
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <Button onClick={fetchData} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm shadow-none gap-2">
            <RefreshCw size={16} />Làm mới
          </Button>
          <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm shadow-none gap-2">
            <Download size={16} />Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* ── Thẻ thống kê tổng quan ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tổng doanh thu */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <Badge className={`text-xs font-medium ${Number(summary.revenueGrowth) >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"} border-0`}>
                {Number(summary.revenueGrowth) >= 0 ? <ArrowUpRight size={12} className="mr-0.5" /> : <ArrowDownRight size={12} className="mr-0.5" />}
                {summary.revenueGrowth}%
              </Badge>
            </div>
            <p className="text-sm text-gray-500">Tổng doanh thu</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{formatCompactCurrency(summary.totalRevenue)}</p>
          </CardContent>
        </Card>

        {/* Doanh thu ròng */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-green-500 flex items-center justify-center shadow-lg">
                <Wallet className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-500">Doanh thu ròng</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{formatCompactCurrency(summary.netRevenue)}</p>
          </CardContent>
        </Card>

        {/* Doanh thu hôm nay */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-violet-50 to-purple-50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-violet-500 flex items-center justify-center shadow-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <Badge className="bg-violet-100 text-violet-700 border-0 text-xs">Hôm nay</Badge>
            </div>
            <p className="text-sm text-gray-500">Doanh thu hôm nay</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{formatCompactCurrency(summary.todayRevenue)}</p>
          </CardContent>
        </Card>

        {/* Tổng hoàn tiền */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-orange-50 to-amber-50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-500">Tổng hoàn tiền</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{formatCompactCurrency(summary.totalRefunds)}</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Biểu đồ doanh thu theo tháng (AreaChart) ──────────────────────── */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Doanh thu theo tháng</h3>
              <p className="text-sm text-gray-500 mt-0.5">Biểu đồ phân tích doanh thu hệ thống trong năm</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-500" />Đặt chỗ</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-violet-500" />Gói dịch vụ</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500" />Phạt</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={360}>
            <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradBooking" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradSubscription" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradPenalty" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9CA3AF" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}Tr`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="bookingRevenue" name="Đặt chỗ" stackId="1" stroke="#3B82F6" fill="url(#gradBooking)" strokeWidth={2} />
              <Area type="monotone" dataKey="subscriptionRevenue" name="Gói dịch vụ" stackId="1" stroke="#8B5CF6" fill="url(#gradSubscription)" strokeWidth={2} />
              <Area type="monotone" dataKey="penaltyRevenue" name="Phạt" stackId="1" stroke="#F59E0B" fill="url(#gradPenalty)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── 2 cột: Biểu đồ tròn + Doanh thu 7 ngày ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Phân bổ doanh thu theo nguồn */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <PieChartIcon size={18} className="text-gray-500" />
              <h3 className="text-lg font-bold text-gray-900">Phân bổ doanh thu</h3>
            </div>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={220}>
                <PieChart>
                  <Pie
                    data={revenueSources}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    dataKey="value"
                    stroke="none"
                  >
                    {revenueSources.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCompactCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-4">
                {revenueSources.map((source) => {
                  const total = revenueSources.reduce((s, r) => s + r.value, 0);
                  const pct = ((source.value / total) * 100).toFixed(1);
                  return (
                    <div key={source.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: source.color }} />
                          {source.name}
                        </span>
                        <span className="text-sm font-bold text-gray-900">{pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: source.color }} />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{formatCompactCurrency(source.value)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Doanh thu 7 ngày gần nhất */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 size={18} className="text-gray-500" />
              <h3 className="text-lg font-bold text-gray-900">7 ngày gần nhất</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyRevenue} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#9CA3AF" }} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}Tr`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} labelFormatter={(label) => `Ngày ${label}`} />
                <Bar dataKey="revenue" name="Doanh thu" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
            {/* Tổng 7 ngày */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-500">Tổng 7 ngày</span>
              <span className="text-lg font-bold text-blue-600">
                {formatCompactCurrency(dailyRevenue.reduce((s, d) => s + d.revenue, 0))}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 2 cột: Top bãi đỗ + Giao dịch gần đây ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top bãi đỗ doanh thu cao nhất */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <ParkingSquare size={18} className="text-gray-500" />
                <h3 className="text-lg font-bold text-gray-900">Top bãi đỗ doanh thu</h3>
              </div>
              <Badge variant="outline" className="text-xs">Top {topParkingLots.length}</Badge>
            </div>
            <div className="space-y-3">
              {topParkingLots.map((lot, index) => (
                <div key={lot.name} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  {/* Hạng */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    index === 0 ? "bg-amber-100 text-amber-700" :
                    index === 1 ? "bg-gray-200 text-gray-700" :
                    index === 2 ? "bg-orange-100 text-orange-700" :
                    "bg-gray-100 text-gray-500"
                  }`}>
                    {index + 1}
                  </div>
                  {/* Thông tin */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{lot.name}</p>
                    <p className="text-xs text-gray-400">{formatNumber(lot.bookings)} bookings</p>
                  </div>
                  {/* Doanh thu + phần trăm */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900">{formatCompactCurrency(lot.revenue)}</p>
                    <p className="text-xs text-blue-600">{lot.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Giao dịch gần đây */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Receipt size={18} className="text-gray-500" />
                <h3 className="text-lg font-bold text-gray-900">Giao dịch gần đây</h3>
              </div>
              <Badge variant="outline" className="text-xs">Hôm nay</Badge>
            </div>
            <div className="space-y-1">
              {recentTransactions.map((txn) => (
                <div key={txn._id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                  {/* Icon loại */}
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    txn.type === "income" ? "bg-green-100" : "bg-red-100"
                  }`}>
                    {txn.type === "income" ?
                      <ArrowUpRight className="w-4 h-4 text-green-600" /> :
                      <ArrowDownRight className="w-4 h-4 text-red-600" />
                    }
                  </div>
                  {/* Mô tả */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{txn.description}</p>
                    <p className="text-xs text-gray-400">{txn.time}</p>
                  </div>
                  {/* Số tiền */}
                  <span className={`text-sm font-bold flex-shrink-0 ${txn.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {txn.type === "income" ? "+" : "−"}{formatCurrency(txn.amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Biểu đồ so sánh doanh thu vs hoàn tiền ───────────────────────── */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Doanh thu ròng vs Hoàn tiền</h3>
              <p className="text-sm text-gray-500 mt-0.5">So sánh doanh thu ròng và hoàn tiền qua từng tháng</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500" />Doanh thu ròng</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-400" />Hoàn tiền</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9CA3AF" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}Tr`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="netRevenue" name="Doanh thu ròng" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: "#10B981" }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="refunds" name="Hoàn tiền" stroke="#F87171" strokeWidth={2} dot={{ r: 3, fill: "#F87171" }} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Bảng tổng hợp theo tháng ──────────────────────────────────────── */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Calendar size={18} className="text-gray-500" />
            <h3 className="text-lg font-bold text-gray-900">Bảng tổng hợp doanh thu theo tháng</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tháng</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Đặt chỗ</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Gói DV</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Phạt</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Tổng</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Hoàn tiền</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Doanh thu ròng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {monthlyRevenue.map((row) => (
                  <tr key={row.month} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{row.month}/2026</td>
                    <td className="px-4 py-3 text-sm text-right text-blue-600">{formatCompactCurrency(row.bookingRevenue)}</td>
                    <td className="px-4 py-3 text-sm text-right text-violet-600">{formatCompactCurrency(row.subscriptionRevenue)}</td>
                    <td className="px-4 py-3 text-sm text-right text-amber-600">{formatCompactCurrency(row.penaltyRevenue)}</td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">{formatCompactCurrency(row.totalRevenue)}</td>
                    <td className="px-4 py-3 text-sm text-right text-red-500">−{formatCompactCurrency(row.refunds)}</td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-green-600">{formatCompactCurrency(row.netRevenue)}</td>
                  </tr>
                ))}
              </tbody>
              {/* Tổng cộng */}
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">Tổng cộng</td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-blue-700">
                    {formatCompactCurrency(monthlyRevenue.reduce((s, m) => s + m.bookingRevenue, 0))}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-violet-700">
                    {formatCompactCurrency(monthlyRevenue.reduce((s, m) => s + m.subscriptionRevenue, 0))}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-amber-700">
                    {formatCompactCurrency(monthlyRevenue.reduce((s, m) => s + m.penaltyRevenue, 0))}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                    {formatCompactCurrency(summary.totalRevenue)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-red-600">
                    −{formatCompactCurrency(summary.totalRefunds)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-green-700">
                    {formatCompactCurrency(summary.netRevenue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
