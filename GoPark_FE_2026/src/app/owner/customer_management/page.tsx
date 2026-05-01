"use client";

import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, Loader2, AlertCircle } from "lucide-react";
import { FormAddCustomer } from "./form_add_customer";
import { useCustomers } from "@/hooks/useCustomers";
import { useCustomerStore } from "@/stores/customer.store";

import { useAuthStore } from "@/stores/auth.store";

export default function CustomerManagementPage() {
  const { user } = useAuthStore();
  const role = user?.role?.toLowerCase() || "user";
  const { customers, isLoading, isFetching, isError } = useCustomers();
  const { searchText, setSearchText, lotId } = useCustomerStore();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        {role !== "staff" && <SiteHeader />}
        <div className="max-w-[1400px] mx-auto p-6 space-y-6 w-full">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              Quản lý Khách hàng
            </h1>
            <p className="text-sm text-muted-foreground">
              Quản lý danh sách khách hàng.
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-6">
                {/* Toolbar */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 flex-1 max-w-sm relative">
                    {isFetching && !isLoading ? (
                      <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Input
                      placeholder="Tìm theo tên, SĐT, biển số..."
                      className="max-w-sm"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </div>
                  {/* <Sheet>
                    <SheetTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Thêm khách hàng
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-[400px] sm:w-[600px] sm:max-w-[calc(100vw-2rem)]">
                      <FormAddCustomer />
                    </SheetContent>
                  </Sheet> */}
                </div>

                {/* Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên khách hàng</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>SĐT</TableHead>
                        <TableHead>Biển số xe</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Loading */}
                      {isLoading && (
                        <TableRow>
                          <TableCell colSpan={4} className="h-32 text-center">
                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Đang tải dữ liệu...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}

                      {/* Chưa chọn bãi */}
                      {!isLoading && lotId === null && (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="h-32 text-center text-muted-foreground"
                          >
                            Vui lòng chọn bãi đỗ xe ở thanh trên để xem danh
                            sách khách hàng.
                          </TableCell>
                        </TableRow>
                      )}

                      {/* Error */}
                      {isError && !isLoading && (
                        <TableRow>
                          <TableCell colSpan={4} className="h-32 text-center">
                            <div className="flex items-center justify-center gap-2 text-destructive">
                              <AlertCircle className="h-4 w-4" />
                              <span>
                                Không thể tải dữ liệu. Vui lòng thử lại sau.
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}

                      {/* Empty */}
                      {!isLoading &&
                        !isError &&
                        lotId !== null &&
                        customers.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="h-32 text-center text-muted-foreground"
                            >
                              Không tìm thấy khách hàng nào.
                            </TableCell>
                          </TableRow>
                        )}

                      {/* Data rows */}
                      {!isLoading &&
                        !isError &&
                        customers.map((customer) => (
                          <TableRow key={customer.userId}>
                            <TableCell>{customer.name}</TableCell>
                            <TableCell>{customer.email}</TableCell>
                            <TableCell>{customer.phone}</TableCell>
                            <TableCell className="font-mono">
                              {customer.plateNumber}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
