'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

// --- Types & Mock Data Interfaces ---
export interface TransactionLog {
  id: string;
  parkingLotName: string;
  licensePlate: string;
  time: string;
  amount: number;
  status: 'PAID' | 'FAILED' | 'PENDING';
  method: 'VNPAY' | 'VIETQR' | 'WALLET';
}

export interface TopParkingLot {
  id: string;
  name: string;
  totalRevenue: number;
  occupancyRate: number;
}

interface DataTablesProps {
  recentTransactions: TransactionLog[];
  topParkingLots: TopParkingLot[];
}

// --- Main Export ---
export function DataTables({ recentTransactions, topParkingLots }: DataTablesProps) {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  const getStatusBadge = (status: TransactionLog['status']) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-200">Đã thanh toán</Badge>;
      case 'PENDING':
        return <Badge className="bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 border-amber-200">Chờ xử lý</Badge>;
      case 'FAILED':
        return <Badge className="bg-rose-500/15 text-rose-600 hover:bg-rose-500/25 border-rose-200">Thất bại</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
      
      {/* Recent Transactions Table */}
      <Card className="col-span-full lg:col-span-4">
        <CardHeader>
          <CardTitle>Giao dịch gần đây</CardTitle>
          <CardDescription>
            Các khoản thanh toán mới nhất trên các bãi đỗ xe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Tên bãi</TableHead>
                  <TableHead>Biển số</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Phương thức</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{tx.parkingLotName}</TableCell>
                    <TableCell>{tx.licensePlate}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(tx.time), 'dd MMM, HH:mm')}
                    </TableCell>
                    <TableCell>{formatCurrency(tx.amount)}</TableCell>
                    <TableCell>{getStatusBadge(tx.status)}</TableCell>
                    <TableCell className="text-right font-medium text-muted-foreground">
                      {tx.method}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Top Parking Lots Table */}
      <Card className="col-span-full lg:col-span-3">
        <CardHeader>
          <CardTitle>Bãi đỗ hiệu quả nhất</CardTitle>
          <CardDescription>
            Các bãi đỗ tạo ra doanh thu cao nhất.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Tên bãi</TableHead>
                  <TableHead>Doanh thu</TableHead>
                  <TableHead className="text-right">Tỉ lệ lấp đầy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topParkingLots.map((lot) => (
                  <TableRow key={lot.id}>
                    <TableCell className="font-medium">{lot.name}</TableCell>
                    <TableCell className="text-emerald-600 font-medium">
                      {formatCurrency(lot.totalRevenue)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-sm font-medium">{lot.occupancyRate}%</span>
                        <div className="w-12 bg-secondary h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${lot.occupancyRate > 90 ? 'bg-rose-500' : lot.occupancyRate > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${lot.occupancyRate}%` }} 
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
