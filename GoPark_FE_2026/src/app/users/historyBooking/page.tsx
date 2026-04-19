"use client";

import React, { useEffect, useState } from "react";
import { get } from "@/lib/api";
import {
  Search,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
} from "lucide-react";
import Header from "@/components/layout/Header";
import DetailHistoryBooking from "./detailHistoryBooking";
// import { any } from "zod";
// import { mapDataBooking } from "../shareBooking/page";
interface BookingItem {
  id: string;
  name: string;
  address: string;
  code: string;
  start_date: string;
  start_date_iso: string;
  end_date: string;
  end_date_iso: string;
  start_timestamp: number;
  start_time: string;
  end_time: string;
  status: string;
  total_price: number;
}

function historyBooking() {
  const [booking, setBooking] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [selectedDate, setSelectedDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);

  const [currentTime, setCurrentTime] = useState("");
  const [listDropdown, setListDropdown] = useState(false);
  const userId = "019d1645-e42c-717a-a6bb-d014ba19f26c";

  useEffect(() => {
    // const userId = localStorage.getItem('')

    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    get(`/booking/user/${userId}`)
      .then((res: any) => {
        console.log(res.data);
        const mapData = res.data.map(mapDataBooking);
        console.log(mapData);
        setBooking(mapData);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const statusMap: any = {
    BOOKED: "Đã đặt",
    ACTIVE: "Đang hoạt động",
  };

  const filteredBooking = booking
    .filter((b) => (filterStatus == "Tất cả" ? true : b.status == filterStatus))
    .filter((b) => {
      if (!selectedDate) return true;
      return b.start_date_iso == selectedDate;
    })
    .filter((b) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) || b.address.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => b.start_timestamp - a.start_timestamp);

  const statusOptions = ["Tất cả", "Đang hoạt động", "Đã đặt"];
  const totalPages = Math.ceil(filteredBooking.length / itemsPerPage);

  const currentItems = filteredBooking.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const parkingOptions = Array.from(new Set(booking.map((b) => b.name)));
  const filteredOptions = parkingOptions.filter((name) =>
    name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#F8FBFF] text-slate-900 font-sans pb-16">
      <Header />

      <main className="max-w-[1200px] mx-auto px-6 mt-12">
        <div className="mb-10">
          <h2 className="text-4xl font-black tracking-tight mb-2">
            Lịch sử đặt chỗ
          </h2>
          <p className="text-slate-600 font-medium text-base">
            Xem và quản lý lịch sử đỗ xe của bạn
          </p>
        </div>

        {/* CONTAINER TÌM KIẾM */}
        <div className="bg-white rounded-[24px] p-6 lg:p-8 shadow-sm border border-slate-200 mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Search className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Tìm kiếm chuyến đi
            </h3>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-end gap-6 lg:gap-4">
            {/* 1. Date Range Picker */}
            <div className="w-full lg:w-[280px]">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-3">
                Khoảng thời gian
              </label>
              <div className="relative w-full">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Calendar className="w-5 h-5" />
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-base font-semibold text-slate-800 outline-none focus:border-blue-400 focus:bg-white focus:shadow-sm transition-all hover:bg-slate-50"
                />
              </div>
            </div>

            {/* 2. Phần Tìm Kiếm */}
            <div className="w-full lg:w-[350px] lg:mx-auto">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-3">
                Tìm kiếm
              </label>
              <div className="relative w-full">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Nhập tên bãi đỗ, địa chỉ..."
                  value={searchQuery}
                  onFocus={() => setListDropdown(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setListDropdown(true);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-base font-semibold text-slate-800 outline-none focus:border-blue-400 focus:bg-white focus:shadow-sm transition-all hover:bg-slate-50 placeholder:text-slate-500"
                />

                {/* DROPDOWN */}
                {listDropdown && filteredOptions.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-xl shadow-lg mt-2 z-50 max-h-60 overflow-auto">
                    {filteredOptions.map((name, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setSearchQuery(name);
                          setListDropdown(false);
                          setCurrentPage(1);
                        }}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer font-medium"
                      >
                        {name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 3. Quick Time Suggestions */}
            <div className="w-full lg:w-auto lg:border-l border-slate-200 lg:pl-8 flex flex-col items-start lg:items-end pb-[2px]">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-3">
                Gợi ý nhanh
              </label>
              <button
                onClick={() => {
                  const today = new Date().toISOString().split("T")[0];
                  setSelectedDate(today);
                  setCurrentPage(1);
                }}
                className="w-fit bg-blue-50/80 text-blue-700 font-bold text-sm py-3.5 px-8 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors shadow-sm whitespace-nowrap"
              >
                Hôm nay
              </button>
            </div>
          </div>
        </div>

        {/* CÁC TABS PHÂN LỌC VÀ HIỂN THỊ TỔNG CỘNG */}
        {/* Đã gỡ bỏ absolute, dùng flex-row space-between để tự động đẩy nhau ra, không thể dính nhau */}
        <div className="flex flex-col lg:flex-row items-center justify-between mb-8 gap-5 px-1 w-full">
          {/* Tabs Bên Trái */}
          <div className="flex items-center bg-white rounded-full p-1.5 shadow-sm border border-slate-200 overflow-x-auto w-full lg:w-auto shrink-0 z-10">
            {statusOptions.map((status) => {
              const countForTab = booking.filter((b) => {
                const matchStatus =
                  status == "Tất cả" ? true : b.status == status;
                const matchDate = !selectedDate
                  ? true
                  : b.start_date_iso == selectedDate;
                const matchSearch = !searchQuery
                  ? true
                  : b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    b.address.toLowerCase().includes(searchQuery.toLowerCase());

                return matchStatus && matchDate && matchSearch;
              }).length;

              return (
                <button
                  key={status}
                  onClick={() => {
                    setFilterStatus(status);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-2 whitespace-nowrap px-6 py-3 rounded-full text-[15px] font-bold transition-all ${
                    filterStatus == status
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {status}
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs ${
                      filterStatus == status
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {countForTab}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex bg-blue-600 text-white text-base font-bold px-6 py-3 rounded-xl border border-blue-700 items-center justify-center gap-3 shadow-md w-full lg:w-auto h-[52px] shrink-0">
            <span className="uppercase tracking-wider text-blue-50">
              {filterStatus === "Tất cả" ? "Tổng chuyến đi" : filterStatus}
            </span>
            <span className="bg-white px-3.5 py-1.5 rounded-lg shadow-sm text-xl text-blue-700 min-w-[36px] text-center leading-none flex items-center justify-center">
              {filteredBooking.length}
            </span>
          </div>

          <div className="flex justify-end w-full lg:w-auto shrink-0 z-10">
            <button className="flex items-center gap-2.5 px-6 py-3 bg-[#004AC6] text-white rounded-full text-base font-bold shadow-sm hover:bg-blue-800 transition-colors w-32 justify-center">
              <Clock className="w-5 h-5" />
              {currentTime || "--:--"}
            </button>
          </div>
        </div>

        {/* Danh sách Booking Items */}
        <div className="space-y-6">
          {currentItems.length > 0 ? (
            currentItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-8 items-stretch hover:shadow-md transition-shadow cursor-default"
              >
                <div className="w-full lg:w-[320px] h-[240px] rounded-3xl overflow-hidden shrink-0 border border-slate-200">
                  <img
                    src="/xedep.jpg"
                    alt="Bãi đỗ xe"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between py-2 pr-2">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2.5 tracking-tight">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 text-slate-600 text-base font-medium">
                          <MapPin className="w-5 h-5 text-slate-500" />
                          <span>{item.address}</span>
                        </div>
                      </div>

                      <div
                        className={`text-xs font-bold tracking-widest px-5 py-2.5 rounded-full uppercase text-white ${
                          item.status === "Đã đặt"
                            ? "bg-red-500 shadow-sm shadow-red-500/30"
                            : "bg-emerald-500 shadow-sm shadow-emerald-500/30"
                        }`}
                      >
                        {item.status}
                      </div>
                    </div>

                    {/* Lưới phân chia chỉ còn lại 3 cột thời gian và vị trí đỗ */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <div>
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                          Thời gian vào
                        </p>
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-slate-900 text-[19px] leading-tight">
                            {item.start_time}
                          </span>
                          <span className="font-semibold text-slate-600 text-sm">
                            {item.start_date}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                          Thời gian ra
                        </p>
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-slate-900 text-[19px] leading-tight">
                            {item.end_time}
                          </span>
                          <span className="font-semibold text-slate-600 text-sm">
                            {item.end_date}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">
                          Vị trí đỗ
                        </p>
                        <div className="flex flex-col gap-1 mt-1">
                          <span className="font-black text-blue-700 text-[20px] leading-tight bg-blue-100/60 w-fit px-3 py-1.5 rounded-lg border border-blue-200/50">
                            {item.code}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phần Tổng tiền được chuyển xuống phía bên trái dưới cùng */}
                  <div className="flex justify-between items-end mt-2">
                    <div className="flex flex-col gap-1 px-2">
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                        Tổng tiền
                      </p>
                      <span className="font-black text-red-600 text-[26px] leading-none">
                        {item.total_price
                          ? new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(item.total_price)
                          : "0 ₫"}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedBooking(item);
                        setOpenModal(true);
                      }}
                      className="bg-[#2463EB] hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-2xl shadow-md shadow-blue-500/20 transition-all active:scale-95 text-[15px] flex items-center gap-2"
                    >
                      Chi tiết vé
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-white rounded-[2rem] border border-slate-200">
              <div className="w-20 h-20 bg-slate-50 text-slate-400 flex items-center justify-center rounded-full mx-auto mb-6">
                <Search className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold text-slate-800 mb-2">
                Không tìm thấy chuyến đi nào
              </h4>
              <p className="text-slate-600 text-base">
                Vui lòng thử bộ lọc hoặc từ khóa khác.
              </p>
            </div>
          )}
        </div>

        {/* Nút phân trang */}
        {totalPages > 0 && (
          <div className="flex items-center justify-center gap-3 mt-12 pb-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 mx-auto" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-12 h-12 flex items-center justify-center rounded-2xl font-bold text-base ${currentPage === i + 1 ? "bg-[#004AC6] text-white shadow-md shadow-blue-500/20" : "text-slate-700 hover:bg-slate-100"}`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <ChevronRight className="w-6 h-6 mx-auto" />
            </button>
          </div>
        )}
      </main>

      <DetailHistoryBooking
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        booking={selectedBooking}
      />
    </div>
  );
}
export default historyBooking;
