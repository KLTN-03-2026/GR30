"use client";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Car, Clock, ShieldCheck, MapPin, Search, CreditCard, Package, Calendar1Icon, ClockIcon } from "lucide-react";
import { get } from "@/lib/api";
import { any } from "zod";
import { useParams, useRouter } from "next/navigation";
import { ParkingContext } from "./ParkingContext";
import { post } from "@/lib/api";
import dayjs from "dayjs";
import { useAuthStore } from '@/stores/auth.store';
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];


// Kiểm tra xem một giờ có phải là quá khứ không (Dùng cho Giờ Vào)
const checkIsPastHour = (h:string, selectedDate:string, today:string) => {
  const isToday = selectedDate === today;
  if (!isToday) return false;
  return parseInt(h) < dayjs().hour();
};

// Kiểm tra xem một phút có phải là quá khứ không (Dùng cho Phút Vào)
const checkIsPastMinute = (m:string, selectedDate:string, selectedHour:string, today:string) => {
  const isToday = selectedDate === today;
  const isCurrentHour = selectedHour === dayjs().format("HH");
  return isToday && isCurrentHour && parseInt(m) < dayjs().minute();
};

// Kiểm tra giờ ra (Phải sau giờ vào nếu cùng ngày)
const checkIsBeforeStartHour = (h:string, startDate:string, endDate:string, startHour:string) => {
  const isSameDay = startDate === endDate;
  return isSameDay && parseInt(h) < parseInt(startHour);
};

export function BookingForm() {

  const router = useRouter();
  const [selectedPlate, setSelectedPlate] = useState<string>("");

  const [startTime, setStartTime] = useState<string>("");

  const [endTime, setEndTime] = useState<string>("");

  //const [servicePackage, setServicePackage] = useState("hourly");

  const [paymentMethod, setPaymentMethod] = useState("vnpay");

  const today = dayjs().format("YYYY-MM-DD");
  //const [selectedVehicleId, setSelectedVehicleId] = useState<number | string>("");

  const context = useContext(ParkingContext);

  if (!context) return null;

  const { dataLot, loadingLot, selectedSpot } = context;

  // Helper to split dynamic strings for Select components
  const getHH = (timeStr: string) => timeStr ? timeStr.split('T')[1]?.split(':')[0] || "00" : "00";
  const getMM = (timeStr: string) => timeStr ? timeStr.split('T')[1]?.split(':')[1]?.substring(0, 2) || "00" : "00";

  console.log("Data Lot in BookingForm:", dataLot);

  console.log("Selected Spot in BookingForm:", selectedSpot);


  useEffect(() => {

    //1.chọn biển số xe
    if (dataLot?.userVehicles?.length > 0) {

      setSelectedPlate(dataLot.userVehicles[0].plate_number);

    }

    //2.thiết lập thời gian mặc định
    if(!startTime) {
      const now = dayjs();
      // Tính toán số phút được làm tròn (ví dụ: 24 -> 30, 46 -> 00 của giờ kế tiếp)
      const currentMinute = now.minute();
      let roundedMinute = 0;

      if (currentMinute < 15) roundedMinute = 15;
      else if (currentMinute < 30) roundedMinute = 30;
      else if (currentMinute < 45) roundedMinute = 45;
      else roundedMinute = 60; // Sẽ nhảy sang giờ tiếp theo

      // Thiết lập Start Time: Ngày hôm nay + Giờ hiện tại + Phút đã làm tròn
      const start = now.minute(roundedMinute).second(0);
      
      // Thiết lập End Time: Start Time + 1 giờ
      const end = start.add(1, "hour");

      setStartTime(start.format("YYYY-MM-DDTHH:mm"));
      setEndTime(end.format("YYYY-MM-DDTHH:mm"));
    }

  }, [dataLot])

  // 2. Tính toán các giá trị phụ thuộc (Sử dụng useMemo để tối ưu)

  const bookingDetails = useMemo(() => {

    const currentVehicle = dataLot?.userVehicles?.find(

      (v: any) => v.plate_number === selectedPlate
    );

    let selectedZone: any = null;

    if (selectedSpot) {
      dataLot?.parkingFloor?.forEach((floor: any) => {
        const zone = floor.parkingZones?.find(
          (z: any) => z.zone_name === selectedSpot.zoneName
        );
        if (zone) selectedZone = { ...zone, floor_name: floor.floor_name };
      });
    }

    console.log(selectedZone)
    const pricing = selectedZone

      ? dataLot?.pricingRules?.find((p: any) => p.zone_name === selectedZone.zone_name && p.floor_name === selectedZone.floor_name)

      : null;

    console.log("Current price:", pricing);
    return {

      vehicle: currentVehicle,
      zone: selectedZone,
      // Đảm bảo priceHourly luôn là số (mặc định 0) để không lỗi .toLocaleString()

      priceHourly: pricing?.price_per_hour || 0,

      priceDayly: pricing?.price_per_day || 0,

    };

  }, [dataLot, selectedPlate, selectedSpot]);


  

  // 4. Logic tính tổng tiền tạm tính

  const totalPrice = useMemo(() => {
    console.log("--- Debug Time ---");
    console.log("Raw Start:", startTime)
    console.log("Raw End:", endTime);

    if (!startTime || !endTime) return 0;
    const start = dayjs(startTime);
    const end = dayjs(endTime);
    // 2. Kiểm tra nếu parse lỗi (Invalid Date)

    // Kiểm tra tính hợp lệ
    if (!start.isValid() || !end.isValid() || end.isBefore(start) || end.isSame(start)) {
      return 0;
    }

    //số phút chênh lệch
    const totalMinutes = end.diff(start, "minute");
    const pricePerHour = bookingDetails.priceHourly || 0;
    const priceDay = bookingDetails.priceDayly || 0;
    
    //giá tiền 1p
    const priceMin = pricePerHour / 60;

    //
    const days = Math.floor(totalMinutes / 1440);
    const remainingMinutes = totalMinutes % 1440;

    // Công thức: (Ngày * Giá ngày) + (Phút lẻ * Giá phút)
    return (days * priceDay) + (remainingMinutes * priceMin);
  }, [startTime, endTime, bookingDetails]); // Tiền sẽ tính lại khi 1 trong 3 cái này đổi

  if (loadingLot) return <div className="p-6 text-center">Đang tải thông tin...</div>;

  async function handBooking(e: any) {
    e.preventDefault();
    const start = dayjs(startTime);
    const end = dayjs(endTime);
    const now = dayjs();


    if (!selectedPlate) {
      alert("Vui lòng chọn biển số xe");
      return;
    }

    if (!startTime || !endTime) {
      alert("Vui lòng chọn thời gian vào và ra");
      return;
    }


    if(start.isBefore(now,"minute")){
      alert("giờ vào không được nhỏ hơn giờ hiên tại");
      return;
    }


    if (end.isBefore(start) || end.isSame(start)) {
      alert("Lỗi: Thời gian ra phải sau thời gian vào!\n(Lưu ý: 12:00 AM là 00:00 sáng)");
      return; // Chặn gửi BE
    }


    if (!selectedSpot) {
      alert("Vui lòng chọn vị trí đỗ");
      return;
    }

    if (dayjs(endTime).isBefore(dayjs(startTime))) {
      alert("Thời gian ra phải sau thời gian vào - Vui lòng chọn lại");
      return;
    }
    

    const vehicle = bookingDetails.vehicle;

    console.log(startTime, endTime)
    const bookingData = {
      user_id: String(vehicle.user.id),
      vehicle_id: vehicle.id,
      slot_id: selectedSpot?.slot.id,
      parking_lot_id: dataLot.id,
      start_time: dayjs(startTime).toISOString(), // Output: 2026-04-10T03:45:00.000Z
      end_time: dayjs(endTime).toISOString(),
      status: paymentMethod === 'cash' ? "PENDING" : "PENDING_PAYMENT"
    }

    console.log("Booking Data:", bookingData);

    try {
      // Gọi API để tạo booking
      const saved: any = await post("/booking", bookingData);
      console.log("Dữ liệu Booking vừa tạo:", saved);

      const bookingId = saved?.id || saved?.data?.id;
      // Lấy thông tin user hiện tại
      const auth = useAuthStore.getState();
      const currentUserId = auth?.user?.id;
      // Round tổng tiền lên đơn vị VND
      const amount = Math.round(totalPrice || 0);

      if (paymentMethod === 'vnpay') {
        // Tạo link VNPAY từ backend rồi chuyển hướng
        const res: any = await post('/payment/vnpay/create-url', { amount, userId: currentUserId, bookingId: bookingId });
        console.log('VNPay create-url response:', res);
        // Backend có thể trả về { success, url } hoặc { data: { success, url } }
        const ok = Boolean(res?.success || res?.data?.success);
        const redirectUrl = res?.url || res?.data?.url;
        if (ok && redirectUrl) {

          window.location.href = redirectUrl;

          return;

        } else {

          // Hiển thị thông điệp lỗi chi tiết từ backend nếu có

          const msg = res?.message || res?.data?.message || 'Không thể tạo link VNPAY. Vui lòng thử lại sau.';

          alert(window.location.host + ' cho biết\n\n' + msg);

          return;

        }

      }

      if (paymentMethod === 'wallet') {

        // Gọi endpoint ví để trừ tiền (sử dụng owner của bãi đỗ)

        const ownerId = dataLot?.owner?.id || dataLot?.owner_id;

        try {

          await post('/wallets/payment', {

            ownerId,

            amount,

            bookingId: bookingId,

            customerId: currentUserId,

          });

          //alert('Thanh toán bằng Ví GoPark thành công');
          toast.success("Thanh toán thành công! Mã QR đã được gửi vào Email của bạn.", {
            position: "top-right", // Đưa lên góc trên bên phải
            style: {
              padding: '16px',       // Làm cho khung to ra
              fontSize: '16px',      // Chữ to hơn
              width: '350px',        // Chiều ngang rộng hơn
              fontWeight: 'bold',    // Chữ đậm cho dễ nhìn
              marginTop: '20px',     // Cách mép trên một chút cho đỡ dính
            },
            duration: 3000,          // Hiển thị lâu hơn (5 giây) để người dùng kịp đọc
          });

          // Chỉnh sửa tại đây: Điều hướng sang trang hóa đơn thay vì profile
          setTimeout(() => {
            router.push(`/users/invoice/${bookingId}`);
          }, 50); // Giảm xuống 50ms để chuyển trang gần như tức thì

          return;

        } catch (err: any) {

          console.error('Lỗi thanh toán ví:', err);

          alert(err?.message || 'Thanh toán bằng ví thất bại');

          return;

        }

      }

      // if (paymentMethod === 'cash') {
      //   toast.success("Đặt chỗ thành công! Vui lòng thanh toán tiền mặt khi đến bãi.", {
      //     position: "top-right",
      //     style: {
      //       padding: '16px',
      //       fontSize: '16px',
      //       width: '350px',
      //       fontWeight: 'bold',
      //       marginTop: '20px',
      //     },
      //     duration: 5000,
      //   });

      //   // Chuyển hướng sau 1 giây tương tự như wallet
      //   setTimeout(() => {
      //     router.push("/users/profile");
      //   }, 1000);

      //   return;
      // }

    } catch (error:any) {

      console.error("Lỗi khi đặt chỗ:", error);

      const errorMessage = error?.response?.data?.message || error?.response?.message || error?.message ||  "Đặt chỗ thất bại. Vui lòng thử lại.";

      // Hiển thị message đó lên alert hoặc toast
      alert(errorMessage);

    }
  }
  return (

    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-6 transition-colors relative overflow-hidden">

      {/* Decorative top border */}

      <div className="absolute top-0 left-0 w-full h-1.5 bg-green-800 dark:bg-green-700"></div>



      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">

        <Car className="w-5 h-5 text-green-900 dark:text-green-700" />

        Đặt chỗ đỗ xe

      </h2>



      <form className="space-y-6">



        {/* Biển số xe */}

        <div>

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">

            <Search className="w-4 h-4 text-gray-500" />

            Chọn xe ô tô của bạn

          </label>

          <div className="relative">

            <select

              value={selectedPlate}

              onChange={(e) => setSelectedPlate(e.target.value)}

              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all text-gray-900 dark:text-white font-medium appearance-none cursor-pointer"

            >

              {dataLot?.userVehicles?.length > 0 ? (

                dataLot.userVehicles.map((v: any) => (

                  <option key={v.plate_number} value={v.plate_number}>

                    {v.plate_number} - {v.type}

                  </option>

                ))

              ) : (

                <option disabled>Không có xe nào được đăng ký</option>

              )}

            </select>

            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">

              <Car className="w-4 h-4 text-green-700 dark:text-green-700" />

            </div>

          </div>

        </div>


        {/* Thời gian - Đã điều chỉnh để lấy toàn bộ chiều rộng (rộng hơn) */}

        {/* Grid Date/Time Inputs */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          {/* Check-in Date */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 tracking-[0.05em] uppercase pl-1">NGÀY VÀO</label>
            <div className="relative">
              <input
                type="date"
                min={today}
                value={startTime ? startTime.split('T')[0] : ""}
                onChange={(e) => {
                  const date = e.target.value;
                  const time = startTime.split('T')[1] || "00:00";
                  setStartTime(`${date}T${time}`);
                }}
                className="w-full h-14 px-4 bg-white border border-[#E9ECEF] rounded-[20px] focus:outline-none focus:border-green-600 focus:ring-4 focus:ring-green-600/5 transition-all font-bold text-[#0A1F1C] text-sm"
              />
            </div>
          </div>

          {/* Check-in Time Dropdowns */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 tracking-[0.05em] uppercase pl-1">GIỜ VÀO</label>
            <div className="flex gap-2">
              <Select
                value={getHH(startTime)}
                onValueChange={(val) => {
                  const date = startTime.split('T')[0] || dayjs().format("YYYY-MM-DD");
                  const mm = getMM(startTime);
                  setStartTime(`${date}T${val}:${mm}`);
                }}
              >
                <SelectTrigger className="h-14 rounded-[20px] border-[#E9ECEF] font-bold text-[#0A1F1C] flex-1">
                  <SelectValue placeholder="Giờ" />
                </SelectTrigger>
                {/* <SelectContent>
                  {HOURS.map((h) => (
                    <SelectItem key={h} value={h}>{h}h</SelectItem>
                  ))}
                </SelectContent> */}


                <SelectContent>
                  {HOURS.map((h) => (
                    <SelectItem 
                      key={h} 
                      value={h} 
                      disabled={checkIsPastHour(h, startTime.split('T')[0], today)}
                    >
                      {h}h
                    </SelectItem>
                  ))}
                </SelectContent>

              </Select>
              <Select
                value={getMM(startTime)}
                onValueChange={(val) => {
                  const date = startTime.split('T')[0] || dayjs().format("YYYY-MM-DD");
                  const hh = getHH(startTime);
                  setStartTime(`${date}T${hh}:${val}`);
                }}
              >
                <SelectTrigger className="h-14 rounded-[20px] border-[#E9ECEF] font-bold text-[#0A1F1C] flex-1">
                  <SelectValue placeholder="Phút" />
                </SelectTrigger>
                {/* <SelectContent>
                  {MINUTES.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent> */}

                <SelectContent>
                  {MINUTES.map((m) => (
                    <SelectItem 
                      key={m} 
                      value={m} 
                      disabled={checkIsPastMinute(m, startTime.split('T')[0], getHH(startTime), today)}
                    >
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>


              </Select>
            </div>
          </div>

          {/* Check-out Date */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 tracking-[0.05em] uppercase pl-1">NGÀY RA</label>
            <div className="relative">
              <input
                type="date"
                min={today}
                value={endTime ? endTime.split('T')[0] : ""}
                onChange={(e) => {
                  const date = e.target.value;
                  const time = endTime.split('T')[1] || "00:00";
                  setEndTime(`${date}T${time}`);
                }}
                className="w-full h-14 px-4 bg-white border border-[#E9ECEF] rounded-[20px] focus:outline-none focus:border-green-600 focus:ring-4 focus:ring-green-600/5 transition-all font-bold text-[#0A1F1C] text-sm"
              />
            </div>
          </div>

          {/* Check-out Time Dropdowns */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 tracking-[0.05em] uppercase pl-1">GIỜ RA</label>
            <div className="flex gap-2">
              <Select
                value={getHH(endTime)}
                onValueChange={(val) => {
                  const date = endTime.split('T')[0] || dayjs().format("YYYY-MM-DD");
                  const mm = getMM(endTime);
                  setEndTime(`${date}T${val}:${mm}`);
                }}
              >
                <SelectTrigger className="h-14 rounded-[20px] border-[#E9ECEF] font-bold text-[#0A1F1C] flex-1">
                  <SelectValue placeholder="Giờ" />
                </SelectTrigger>
                {/* <SelectContent>
                  {HOURS.map((h) => (
                    <SelectItem key={h} value={h}>{h}h</SelectItem>
                  ))}
                </SelectContent> */}

                <SelectContent>
                  {HOURS.map((h) => (
                    <SelectItem 
                      key={h} 
                      value={h} 
                      disabled={checkIsBeforeStartHour(h, startTime.split('T')[0], endTime.split('T')[0], getHH(startTime))}
                    >
                      {h}h
                    </SelectItem>
                  ))}
                </SelectContent>

              </Select>
              <Select
                value={getMM(endTime)}
                onValueChange={(val) => {
                  const date = endTime.split('T')[0] || dayjs().format("YYYY-MM-DD");
                  const hh = getHH(endTime);
                  setEndTime(`${date}T${hh}:${val}`);
                }}
              >
                <SelectTrigger className="h-14 rounded-[20px] border-[#E9ECEF] font-bold text-[#0A1F1C] flex-1">
                  <SelectValue placeholder="Phút" />
                </SelectTrigger>
                <SelectContent>
                  {MINUTES.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>


        {/* Selected Time Summary - Match UI Precisely */}
        <div className="bg-[#F8F9FA] rounded-[24px] p-6 border border-[#F1F3F5] space-y-3">
          <label className="text-[11px] font-bold text-[#ADB5BD] tracking-widest uppercase block">
            THỜI GIAN ĐÃ CHỌN
          </label>

          <div className="flex gap-4 items-center">
            {/* Icon Clock - Màu xanh đặc trưng */}
            <div className="w-8 h-8 bg-[#00875A] rounded-full flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-white" />
            </div>

            <div className="flex flex-col gap-2">
              {/* Hàng Từ */}
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-gray-400 min-w-[35px]">Từ:</span>
                <div className="flex items-center gap-2">
                  <span className="text-[18px] font-bold text-slate-800">
                    {startTime ? dayjs(startTime).format("HH:mm") : "--:--"}
                  </span>
                  <span className="text-gray-300">-</span>
                  <span className="text-[18px] font-bold text-slate-800">
                    {startTime ? dayjs(startTime).format("DD/MM/YYYY") : "--/--/----"}
                  </span>
                </div>
              </div>

              {/* Hàng Đến */}
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-gray-400 min-w-[35px]">Đến:</span>
                <div className="flex items-center gap-2">
                  <span className="text-[18px] font-bold text-slate-800">
                    {endTime ? dayjs(endTime).format("HH:mm") : "--:--"}
                  </span>
                  <span className="text-gray-300">-</span>
                  <span className="text-[18px] font-bold text-slate-800">
                    {endTime ? dayjs(endTime).format("DD/MM/YYYY") : "--/--/----"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Vị trí đã chọn (mock) */}

        <div className="bg-green-50/50 dark:bg-green-900/10 p-3.5 rounded-lg border border-green-100 dark:border-green-800/40 transition-colors">

          <div className="flex justify-between items-center text-sm">

            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1.5">

              <MapPin className="w-4 h-4 text-green-700 dark:text-green-700" />

              Vị trí đỗ:

            </span>

            <span className="font-bold text-green-700 dark:text-green-400 px-2 py-0.5 bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-700/50 shadow-sm">

              {selectedSpot

                ? `${selectedSpot.floorName}-${selectedSpot.zoneName}-${selectedSpot.slot.code}`

                : "Chưa chọn"}

            </span>

          </div>

        </div>



        {/* Chọn hình thức thanh toán */}

        <div>

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">

            <CreditCard className="w-4 h-4 text-gray-500" />

            Hình thức thanh toán

          </label>

          <div className="relative">

            <select

              value={paymentMethod}

              onChange={(e) => setPaymentMethod(e.target.value)}

              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all text-gray-900 dark:text-white font-medium appearance-none cursor-pointer"

            >

              <option value="vnpay">Chuyển khoản (VNPAY)</option>

              <option value="wallet">Ví GoPark</option>

              {/* <option value="cash">Thanh toán trực tiếp</option> */}

            </select>

            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">

              <CreditCard className="w-4 h-4 text-green-700 dark:text-green-700" />

            </div>

          </div>

        </div>



        {/* Tổng tiền */}

        <div className="border-t border-gray-100 dark:border-gray-700 pt-5 mt-2">

          <div className="flex justify-between items-center mb-3">

            <span className="text-gray-500 text-sm">

              {/* Sử dụng bookingDetails.vehicle thay vì currentVehicles */}

              Đơn giá ({selectedSpot?.zoneName || "Khu vực"})

            </span>

            <span className="font-medium text-sm text-gray-900 dark:text-white">

              {/* Sử dụng bookingDetails.priceHourly */}

              {bookingDetails.priceHourly.toLocaleString()}đ/giờ

            </span>

            <span className="font-medium text-sm text-gray-900 dark:text-white">

              {/* Sử dụng bookingDetails.priceHourly */}

              {bookingDetails.priceDayly.toLocaleString()}đ/ngày

            </span>

          </div>



          <div className="flex justify-between items-end mb-6">

            <span className="font-bold text-gray-900 dark:text-white">Tổng tạm tính</span>

            <span className="text-2xl font-black text-green-600 dark:text-green-500">

              {/* Gọi hàm calculateTotal đã viết ở trên */}

              {Math.round(totalPrice).toLocaleString()}đ

            </span>

          </div>



          <button

            type="button"

            onClick={(handBooking)}

            className="group relative w-full bg-green-800 hover:bg-green-700 cursor-pointer text-white font-bold py-3.5 px-4 rounded-lg transition-all shadow-[0_4px_14px_0_rgba(22,163,74,0.39)] hover:shadow-[0_6px_20px_rgba(22,163,74,0.23)] active:scale-[0.98] text-lg overflow-hidden"

          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>

            <span className="flex items-center justify-center gap-2">

              <ShieldCheck className="w-5 h-5" />

              Xác nhận Đặt Chỗ

            </span>

          </button>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4 px-4 leading-relaxed">

            Thanh toán an toàn. Hệ thống sẽ giữ chỗ ngay sau khi bạn hoàn tất thanh toán.

          </p>

        </div>

      </form>

    </div>

  );

}
