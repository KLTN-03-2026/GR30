import React from 'react';
import { 
  DollarSign, 
  CreditCard, 
  Car, 
  Building2,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface OverviewMetrics {
  totalRevenue: number;
  revenueStatus: { value: number; isUp: boolean };
  successfulTransactions: number;
  occupancyRate: number;
  totalParkingLots: number;
}

interface OverviewCardsProps {
  metrics: OverviewMetrics;
}

export function OverviewCards({ metrics }: OverviewCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(metrics.totalRevenue)}
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {metrics.revenueStatus.isUp ? (
              <span className="text-emerald-500 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{metrics.revenueStatus.value}%
              </span>
            ) : (
              <span className="text-rose-500 flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                {metrics.revenueStatus.value}%
              </span>
            )}
            <span>so với tháng trước</span>
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Giao dịch thành công</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            +{new Intl.NumberFormat('vi-VN').format(metrics.successfulTransactions)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Tổng thanh toán hoàn tất
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tỉ lệ lấp đầy</CardTitle>
          <Car className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.occupancyRate}%</div>
          <div className="w-full bg-secondary h-2 rounded-full mt-2 overflow-hidden">
            <div 
              className={`h-full ${metrics.occupancyRate > 90 ? 'bg-rose-500' : metrics.occupancyRate > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
              style={{ width: `${metrics.occupancyRate}%` }} 
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Mức sử dụng công suất hiện tại
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bãi đỗ đang quản lý</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalParkingLots}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Số lượng bãi đỗ đang hoạt động
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
