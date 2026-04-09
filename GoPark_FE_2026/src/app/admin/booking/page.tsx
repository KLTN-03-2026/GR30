"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Car,
  CheckCircle,
  XCircle,
  MoreVertical,
  Download,
  RefreshCw,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  _id: string;
  userName: string;
  email: string;
  phoneNumber: string;
}

interface ParkingSlot {
  _id: string;
  slotNumber: string;
  zone: string;
  parkingLot: {
    _id: string;
    name: string;
    address: string;
  };
}

interface Booking {
  _id: string;
  userId: User;
  parkingSlotId: ParkingSlot;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  startTime: string;
  endTime: string;
  vehicleNumber: string;
  paymentStatus: 'paid' | 'unpaid';
  paymentMethod: 'pay-at-parking' | 'prepaid';
  bookingDate: string;
  bookingType: 'date' | 'hours' | 'month' | 'guest';
  discount: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

interface Filters {
  search: string;
  status: string;
  paymentStatus: string;
  bookingType: string;
  dateFrom: string;
  dateTo: string;
  parkingLot: string;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800", 
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-green-100 text-green-800"
};

const statusLabels = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  cancelled: "Đã hủy",
  completed: "Hoàn thành"
};

const paymentStatusColors = {
  paid: "bg-green-100 text-green-800",
  unpaid: "bg-red-100 text-red-800"
};

const paymentStatusLabels = {
  paid: "Đã thanh toán",
  unpaid: "Chưa thanh toán"
};

const bookingTypeLabels = {
  date: "Theo ngày",
  hours: "Theo giờ", 
  month: "Theo tháng",
  guest: "Khách vãng lai"
};

export default function AdminBookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    paymentStatus: "",
    bookingType: "",
    dateFrom: "",
    dateTo: "",
    parkingLot: ""
  });

  // Fetch bookings from API
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      setUsingMockData(false);
      
      const response = await fetch("http://localhost:5000/api/v1/bookings/admin/all", {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("API Response:", result);
      
      if (result.status === "success") {
        const bookingsData = result.data.data || result.data;
        console.log("Bookings Data:", bookingsData);
        setBookings(bookingsData);
        setFilteredBookings(bookingsData);
      } else {
        throw new Error("Error loading data");
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      
      // Show error message instead of mock data for production
      console.log("API Error, using mock data for development");
      setUsingMockData(true);
      // Mock data for development when API is not available
      const mockBookings: Booking[] = [
        {
          _id: "1",
          userId: {
            _id: "user1",
            userName: "Nguyễn Văn A",
            email: "a@example.com",
            phoneNumber: "0901234567"
          },
          parkingSlotId: {
            _id: "slot1",
            slotNumber: "A01",
            zone: "A",
            parkingLot: {
              _id: "lot1",
              name: "Bãi đỗ xe Times City",
              address: "458 Minh Khai, Hai Bà Trưng, Hà Nội"
            }
          },
          status: "confirmed",
          startTime: "2024-12-01T08:00:00Z",
          endTime: "2024-12-01T18:00:00Z",
          vehicleNumber: "30A-12345",
          paymentStatus: "paid",
          paymentMethod: "prepaid",
          bookingDate: "2024-11-30T10:00:00Z",
          bookingType: "hours",
          discount: 0,
          totalPrice: 150000,
          createdAt: "2024-11-30T10:00:00Z",
          updatedAt: "2024-11-30T10:05:00Z"
        },
        {
          _id: "2",
          userId: {
            _id: "user2",
            userName: "Trần Thị B",
            email: "b@example.com",
            phoneNumber: "0907654321"
          },
          parkingSlotId: {
            _id: "slot2",
            slotNumber: "B15",
            zone: "B",
            parkingLot: {
              _id: "lot2",
              name: "Bãi đỗ xe Royal City",
              address: "72A Nguyễn Trãi, Thanh Xuân, Hà Nội"
            }
          },
          status: "pending",
          startTime: "2024-12-02T09:00:00Z",
          endTime: "2024-12-02T17:00:00Z",
          vehicleNumber: "29B-98765",
          paymentStatus: "unpaid",
          paymentMethod: "pay-at-parking",
          bookingDate: "2024-12-01T14:30:00Z",
          bookingType: "guest",
          discount: 10,
          totalPrice: 120000,
          createdAt: "2024-12-01T14:30:00Z",
          updatedAt: "2024-12-01T14:30:00Z"
        }
      ];
      setBookings(mockBookings);
      setFilteredBookings(mockBookings);
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings
  useEffect(() => {
    let filtered = [...bookings];

    // Search by customer name, vehicle number, or parking lot name
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.userId?.userName?.toLowerCase()?.includes(searchTerm) ||
        booking.vehicleNumber?.toLowerCase()?.includes(searchTerm) ||
        booking.parkingSlotId?.parkingLot?.name?.toLowerCase()?.includes(searchTerm)
      );
    }

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(booking => booking.status === filters.status);
    }

    // Filter by payment status
    if (filters.paymentStatus) {
      filtered = filtered.filter(booking => booking.paymentStatus === filters.paymentStatus);
    }

    // Filter by booking type
    if (filters.bookingType) {
      filtered = filtered.filter(booking => booking.bookingType === filters.bookingType);
    }

    // Filter by date range
    if (filters.dateFrom) {
      filtered = filtered.filter(booking => 
        new Date(booking.startTime) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(booking => 
        new Date(booking.startTime) <= new Date(filters.dateTo + "T23:59:59")
      );
    }

    setFilteredBookings(filtered);
  }, [filters, bookings]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      paymentStatus: "",
      bookingType: "",
      dateFrom: "",
      dateTo: "",
      parkingLot: ""
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      // API call to update status
      console.log(`Updating booking ${bookingId} to status ${newStatus}`);
      // Refresh data after update
      fetchBookings();
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  };

  const exportBookings = () => {
    // Export functionality
    console.log("Exporting bookings to CSV/Excel");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu đặt chỗ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl px-8 py-6 shadow-lg">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              <Calendar className="w-6 h-6" />
              Quản lý đặt chỗ
            </h1>
            <p className="text-blue-200/70 mt-1 text-sm">
              Tìm thấy {filteredBookings.length} đặt chỗ
              {usingMockData && (
                <span className="ml-2 text-orange-300 text-xs">(Dữ liệu mẫu)</span>
              )}
            </p>
            {error && (
              <p className="text-red-300 text-xs mt-1">Lỗi kết nối API: {error}</p>
            )}
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <Button 
              onClick={fetchBookings}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm shadow-none gap-2"
            >
              <RefreshCw size={16} />
              Làm mới
            </Button>
            <Button 
              onClick={exportBookings}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm shadow-none gap-2"
            >
              <Download size={16} />
              Xuất Excel
            </Button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Tìm kiếm theo tên khách hàng, biển số xe, tên bãi đỗ..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Status Filter */}
              <div>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>

              {/* Payment Status Filter */}
              <div>
                <select
                  value={filters.paymentStatus}
                  onChange={(e) => handleFilterChange("paymentStatus", e.target.value)}
                  className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Thanh toán</option>
                  <option value="paid">Đã thanh toán</option>
                  <option value="unpaid">Chưa thanh toán</option>
                </select>
              </div>

              {/* Booking Type Filter */}
              <div>
                <select
                  value={filters.bookingType}
                  onChange={(e) => handleFilterChange("bookingType", e.target.value)}
                  className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Loại đặt chỗ</option>
                  <option value="guest">Khách vãng lai</option>
                  <option value="hours">Theo giờ</option>
                  <option value="date">Theo ngày</option>
                  <option value="month">Theo tháng</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                  className="h-11"
                  placeholder="Từ ngày"
                />
              </div>

              {/* Date To */}
              <div>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                  className="h-11"
                  placeholder="Đến ngày"
                />
              </div>

              {/* Clear Filters */}
              <div>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full h-11 font-medium"
                >
                  Xóa bộ lọc
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bãi đỗ & Vị trí
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Xe & Thanh toán
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-blue-100 rounded-full p-2 mr-3">
                          <User size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.userId?.userName || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.userId?.phoneNumber || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <MapPin size={16} className="text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {booking.parkingSlotId?.parkingLot?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Khu {booking.parkingSlotId?.zone || 'N/A'} - Vị trí {booking.parkingSlotId?.slotNumber || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <Clock size={16} className="text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(booking.startTime)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                          </div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {bookingTypeLabels[booking.bookingType] || booking.bookingType || 'N/A'}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <Car size={16} className="text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.vehicleNumber || 'N/A'}
                          </div>
                          <Badge 
                            className={`text-xs mt-1 ${paymentStatusColors[booking.paymentStatus] || 'bg-gray-100 text-gray-800'}`}
                          >
                            {paymentStatusLabels[booking.paymentStatus] || 'N/A'}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={`${statusColors[booking.status] || 'bg-gray-100 text-gray-800'}`}>
                        {statusLabels[booking.status] || booking.status || 'N/A'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {formatCurrency(booking.totalPrice || 0)}
                      </div>
                      {booking.discount > 0 && (
                        <div className="text-xs text-green-600">
                          Giảm {booking.discount}%
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => {
                              console.log("View booking details:", booking._id);
                            }}
                          >
                            <Eye size={16} className="mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          {booking.status === 'pending' && (
                            <DropdownMenuItem 
                              onClick={() => handleUpdateStatus(booking._id, 'confirmed')}
                            >
                              <CheckCircle size={16} className="mr-2" />
                              Xác nhận
                            </DropdownMenuItem>
                          )}
                          {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                            <DropdownMenuItem 
                              onClick={() => handleUpdateStatus(booking._id, 'cancelled')}
                              className="text-red-600"
                            >
                              <XCircle size={16} className="mr-2" />
                              Hủy đặt chỗ
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Calendar className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Không tìm thấy đặt chỗ nào
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm để có kết quả phù hợp hơn
              </p>
              <Button onClick={clearFilters} variant="outline">
                Xóa tất cả bộ lọc
              </Button>
            </div>
          )}
        </div>
    </div>
  );
}