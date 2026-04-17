"use client";

import * as React from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { Booking } from "@/types/booking";
import { useBookings } from "@/hooks/useBookings";
import { useDebounce } from "@/hooks/useDebounce";
import { Loader2, AlertCircle } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { DateRange } from "react-day-picker";

export function BookingDataTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    undefined,
  );
  const [searchText, setSearchText] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");

  const debouncedSearch = useDebounce(searchText, 500);

  // Formatting dates for API
  const startDate = dateRange?.from
    ? format(dateRange.from, "yyyy-MM-dd")
    : undefined;
  // If no "to" date, use "from" date as end date to query a single day
  const endDate = dateRange?.to
    ? format(dateRange.to, "yyyy-MM-dd")
    : dateRange?.from
      ? format(dateRange.from, "yyyy-MM-dd")
      : undefined;

  const {
    data: serverData,
    isLoading,
    isError,
  } = useBookings({
    search: debouncedSearch,
    startDate,
    endDate,
  });

  // Apply status range filtering locally
  const data = React.useMemo(() => {
    let res = serverData || [];
    if (statusFilter !== "ALL") {
      res = res.filter((item) => item.status === statusFilter);
    }
    return res;
  }, [serverData, statusFilter]);

  const columns: ColumnDef<Booking>[] = [
    {
      accessorKey: "id",
      header: "Mã đặt chỗ",
      cell: ({ row }) => (
        <div className="font-mono font-bold text-slate-900">
          {row.getValue("id")}
        </div>
      ),
    },
    {
      accessorKey: "userName",
      header: "Khách hàng",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800">
            {row.original.userName}
          </span>
          <span className="text-xs text-slate-500">
            {row.original.userPhone}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "licensePlate",
      header: "Biển số xe",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <Badge
            variant="outline"
            className="w-fit bg-slate-50 font-mono text-xs border-slate-200"
          >
            {row.original.licensePlate}
          </Badge>
          <span className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">
            {row.original.vehicleType}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "slotCode",
      header: "Vị trí",
      cell: ({ row }) => {
        const floorNumber = row.original.floorNumber;
        const zone = row.original.zone;

        return (
          <div className="flex flex-col gap-1">
            <Badge className="w-fit bg-slate-900 text-white hover:bg-slate-800 font-mono text-xs shadow-sm">
              {row.getValue("slotCode")}
            </Badge>
            <span className="text-[10px] text-slate-500 font-medium tracking-tight">
              Tầng {floorNumber !== undefined ? floorNumber : "—"} •{" "}
              {zone || "Khu —"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "startTime",
      header: "Thời gian",
      cell: ({ row }) => {
        const start = new Date(row.original.startTime);
        const end = new Date(row.original.endTime);
        return (
          <div className="flex flex-col text-xs gap-0.5">
            <div className="flex items-center gap-1 text-slate-600">
              <span className="font-bold">{format(start, "HH:mm")}</span>
              <span className="text-slate-300">→</span>
              <span className="font-bold">{format(end, "HH:mm")}</span>
            </div>
            <span className="text-slate-400">
              {format(start, "dd/MM/yyyy", { locale: vi })}
            </span>
          </div>
        );
      },
    },

    {
      accessorKey: "totalPrice",
      header: "Thành Tiền",
      cell: ({ row }) => {
        const amount = Number(row.getValue("totalPrice"));
        return (
          <div className="font-bold text-slate-900">
            {amount > 0 ? `${amount.toLocaleString("vi-VN")} đ` : "0 đ"}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 6,
      },
    },
  });

  const currentPage = table.getState().pagination.pageIndex + 1;
  const pageSize = table.getState().pagination.pageSize;
  const totalRows = data.length;
  const startRow = totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(currentPage * pageSize, totalRows);
  const totalPages = table.getPageCount();

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:flex items-center gap-3 w-full">
          <div className="relative w-full xl:w-80">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm theo biển số, mã booking..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="pl-9 h-11 border-slate-200 rounded-xl focus-visible:ring-slate-900"
            />
          </div>

          <div className="w-full xl:w-64">
            <DatePickerWithRange
              date={dateRange}
              setDate={setDateRange}
              className="h-11 [&>button]:h-11 [&>button]:rounded-xl [&>button]:border-slate-200"
            />
          </div>

          {(searchText || statusFilter !== "ALL" || dateRange) && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearchText("");
                setStatusFilter("ALL");
                setDateRange(undefined);
              }}
              className="h-11 text-slate-500 font-bold hover:text-rose-600 hover:bg-rose-50 rounded-xl"
            >
              Xóa lọc
            </Button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-slate-100"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-12 text-slate-500 font-bold text-xs uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-48 text-center"
                >
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                    <p className="font-medium">Đang tải dữ liệu...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-48 text-center"
                >
                  <div className="flex flex-col items-center justify-center text-rose-500 gap-2">
                    <AlertCircle className="w-8 h-8 opacity-50" />
                    <p className="font-medium text-rose-600">
                      Lỗi khi tải dữ liệu. Vui lòng thử lại.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-slate-50/50 border-slate-100 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-48 text-center"
                >
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                    <IconSearch className="w-8 h-8 opacity-20" />
                    <p className="font-medium">Không có dữ liệu đặt chỗ</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Container */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4 mt-2">
        <div className="text-xs font-bold text-slate-500 bg-slate-100 px-4 py-2 rounded-lg border border-slate-200/50">
          <span className="text-slate-900">{startRow}</span> –{" "}
          <span className="text-slate-900">{endRow}</span>
          {" / "}
          <span className="text-slate-900">{totalRows}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-10 px-3 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 transition-all font-bold gap-1"
          >
            <IconChevronLeft className="h-4 w-4" />
            Trước
          </Button>

          <div className="flex items-center gap-1 px-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                if (totalPages <= 5) return true;
                return (
                  Math.abs(p - currentPage) <= 1 || p === 1 || p === totalPages
                );
              })
              .map((p, index, array) => (
                <React.Fragment key={p}>
                  {index > 0 && array[index - 1] !== p - 1 && (
                    <span className="text-slate-300 px-1">...</span>
                  )}
                  <button
                    onClick={() => table.setPageIndex(p - 1)}
                    className={`h-10 min-w-[40px] px-2 rounded-xl text-xs font-black transition-all ${
                      p === currentPage
                        ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                        : "bg-white text-slate-500 border border-slate-200 hover:border-slate-400 hover:text-slate-900"
                    }`}
                  >
                    {p}
                  </button>
                </React.Fragment>
              ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-10 px-3 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 transition-all font-bold gap-1"
          >
            Sau
            <IconChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
