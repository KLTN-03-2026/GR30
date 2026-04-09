"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Camera, Car, Info, QrCode, Mail, ArrowLeft, Wallet, User, Phone, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";   
import { Loader } from "@/components/ui/loader";
import { apiClient } from "@/lib/api";
import { useWallet } from "@/hooks/useWallet";
import { QRCodeSVG } from "qrcode.react";

interface UserProfile {
  name: string;
  phone: string;
  gender: "male" | "female" | "other" | "";
  image: string;
}

interface Vehicle {
  id: string; // From backend id is number, so we will handle that
  plate_number: string;
  image: string;
  type: string;
}

const MAX_VEHICLES = 3;

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, updateUser } = useAuthStore();
  const { data: balance, isLoading: isWalletLoading } = useWallet();
  const [isMounted, setIsMounted] = useState(false);

  // States
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    phone: "",
    gender: "",
    image: "",
  });
  const [email, setEmail] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Modals
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  
  // Forms
  const [pForm, setPForm] = useState<UserProfile>({ name: "", phone: "", gender: "", image: "" });
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [vForm, setVForm] = useState<{ plate_number: string; image: string; type: string }>({
    plate_number: "",
    image: "",
    type: "Từ 4 đến 10 chỗ",
  });
  
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingVehicle, setIsSavingVehicle] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await apiClient<any>("/users/me", { method: "GET" });
      if (res.data) {
        setEmail(res.data.email);
        setProfile({
          name: res.data.profile?.name || "",
          phone: res.data.profile?.phone || "",
          gender: res.data.profile?.gender || "",
          image: res.data.profile?.image || "",
        });
        setVehicles(res.data.vehicles || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchProfile();
  }, []);

  // -- BASE 64 UPLOAD --
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isProfile: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check limit (2MB limit for base64 safety)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Vui lòng chọn ảnh nhỏ hơn 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (isProfile) {
        setPForm((prev) => ({ ...prev, image: base64 }));
      } else {
        setVForm((prev) => ({ ...prev, image: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  const openEditProfile = () => {
    setPForm({ ...profile });
    setIsProfileDialogOpen(true);
  };

  const handleProfileSave = async () => {
    if (pForm.phone && pForm.phone.length !== 10) {
      toast.error("Số điện thoại phải có đúng 10 số.");
      return;
    }

    setIsSavingProfile(true);
    try {
      await apiClient("/users/me/profile", {
        method: "PATCH",
        body: JSON.stringify(pForm),
      });
      toast.success("Đã cập nhật thông tin cá nhân!");
      setProfile(pForm);
      updateUser({ profile: { ...authUser?.profile, name: pForm.name, image: pForm.image } as any });
      setIsProfileDialogOpen(false);
    } catch (e) {
      toast.error("Không thể cập nhật hồ sơ");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // -- VEHICLE LOGIC --
  const openAddVehicle = () => {
    if ((vehicles?.length || 0) >= MAX_VEHICLES) {
      toast.error(`Bạn chỉ được đăng ký tối đa ${MAX_VEHICLES} phương tiện!`);
      return;
    }
    setVForm({ plate_number: "", image: "", type: "Từ 4 đến 10 chỗ" });
    setEditingVehicleId(null);
    setIsVehicleDialogOpen(true);
  };

  const openEditVehicle = (vehicle: Vehicle) => {
    setVForm({ plate_number: vehicle.plate_number, image: vehicle.image, type: vehicle.type });
    setEditingVehicleId(vehicle.id.toString());
    setIsVehicleDialogOpen(true);
  };

  const handleDeleteVehicle = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa phương tiện này?")) {
      try {
        await apiClient(`/vehicles/${id}`, { method: "DELETE" });
        setVehicles((prev) => prev.filter((v) => v.id.toString() !== id.toString()));
        toast.success("Đã xóa phương tiện thành công.");
      } catch (e) {
        toast.error("Không thể xóa phương tiện");
      }
    }
  };

  const handleSaveVehicle = async () => {
    if (!vForm.plate_number.trim()) {
      toast.error("Vui lòng nhập biển số xe.");
      return;
    }

    // Kiểm tra trùng biển số xe
    const isDuplicate = vehicles?.some(
      (v) => v.plate_number.toLowerCase() === vForm.plate_number.trim().toLowerCase() && v.id.toString() !== editingVehicleId
    );

    if (isDuplicate) {
      toast.error("Biển số xe này đã được đăng ký!");
      return;
    }

    setIsSavingVehicle(true);
    try {
      if (editingVehicleId) {
        // Update
        const res = await apiClient<any>(`/vehicles/${editingVehicleId}`, {
          method: "PATCH",
          body: JSON.stringify(vForm),
        });
        toast.success("Cập nhật phương tiện thành công.");
        setVehicles((prev) =>
          prev.map((v) => (v.id.toString() === editingVehicleId ? res.data : v))
        );
      } else {
        // Add new
        if ((vehicles?.length || 0) >= MAX_VEHICLES) {
          toast.error(`Chỉ có thể thêm tối đa ${MAX_VEHICLES} phương tiện.`);
          return;
        }
        const res = await apiClient<any>("/vehicles", {
          method: "POST",
          body: JSON.stringify(vForm),
        });
        toast.success("Thêm phương tiện mới thành công.");
        setVehicles((prev) => [...(prev || []), res.data]);
        
        // Sinh data QR Code ảo chứa mã nhận diện của xe và user
        const qrPayload = JSON.stringify({
          action: "PARKING_CHECKIN",
          vehicleId: res.data.id,
          plateNumber: res.data.plate_number,
          userId: authUser?.id,
          timestamp: new Date().toISOString()
        });
        setQrCodeData(qrPayload);
        setIsQrDialogOpen(true);
      }
      setIsVehicleDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Lỗi lưu phương tiện");
    } finally {
      setIsSavingVehicle(false);
    }
  };

  const handleShowQR = (vehicle: Vehicle) => {
    const qrPayload = JSON.stringify({
      action: "PARKING_CHECKIN",
      vehicleId: vehicle.id,
      plateNumber: vehicle.plate_number,
      userId: authUser?.id,
      timestamp: new Date().toISOString()
    });
    setQrCodeData(qrPayload);
    setIsQrDialogOpen(true);
  };


  if (!isMounted) return null;

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-7xl">
      <div className="mb-6 flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => router.push("/")} 
          className="shrink-0 text-slate-500 hover:text-slate-800 rounded-full w-10 h-10 border-slate-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tài khoản của tôi</h1>
          <p className="text-slate-500">Quản lý thông tin cá nhân và phương tiện đăng ký</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CỘT TRÁI: THÔNG TIN CÁ NHÂN (VIEW MODE) */}
        <div className="col-span-1 lg:col-span-5">
            <Card className="shadow-sm border-blue-50/50 dark:border-stone-800">
              <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-xl text-slate-800 dark:text-white">Hồ sơ cá nhân</CardTitle>
                  <CardDescription className="dark:text-slate-400">Thông tin định danh của bạn</CardDescription>
                </div>
                <Button variant="outline" size="icon" onClick={openEditProfile} className="dark:border-stone-700 dark:hover:bg-stone-800">
                  <Edit2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center mb-6">
                  <Avatar className="w-24 h-24 border-2 border-primary/10">
                    <AvatarImage src={profile.image} alt={profile.name} className="object-cover" />
                    <AvatarFallback className="text-2xl bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                      {(profile.name || authUser?.profile?.name || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="mt-3 font-semibold text-lg text-slate-800 dark:text-white">{profile.name || "Chưa cập nhật tên"}</h2>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-stone-800">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2"><Mail className="w-4 h-4"/> Email:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{email}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Số điện thoại:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{profile.phone || "Chưa cập nhật"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Giới tính:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* VÍ CỦA TÔI */}
          <Card className="shadow-sm border-blue-50/50 dark:border-stone-800 mt-8">
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-xl text-slate-800 dark:text-white">Ví của tôi</CardTitle>
                <CardDescription className="dark:text-slate-400">Số dư hiện tại trên hệ thống</CardDescription>
              </div>
              <Button variant="outline" size="icon" className="bg-emerald-50 border-emerald-100 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:border-emerald-800 dark:hover:bg-emerald-800/60">
                <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/40 rounded-xl border border-emerald-100/50 dark:border-emerald-800/50">
                <p className="text-sm font-medium text-emerald-700/80 dark:text-emerald-300 mb-1 uppercase tracking-wider">Số dư khả dụng</p>
                <div className="flex items-baseline gap-1">
                  {isWalletLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                  ) : (
                    <>
                      <h3 className="text-3xl font-bold text-emerald-800 dark:text-emerald-100">{(balance || 0).toLocaleString('vi-VN')}</h3>
                      <span className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">đ</span>
                    </>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Button onClick={() => router.push('/users/wallet')} className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white shadow-sm">
                  Nạp tiền
                </Button>
                <Button onClick={() => router.push('/users/wallet')} variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-100 dark:hover:bg-emerald-800/60 dark:hover:text-white">
                  Lịch sử GD
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CỘT PHẢI: QUẢN LÝ PHƯƠNG TIỆN */}
        <div className="col-span-1 lg:col-span-7">
          <Card className="shadow-sm border-blue-50/50 h-full">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  Hồ sơ phương tiện ô tô
                  <span className="text-sm font-normal px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                    {vehicles?.length || 0} / {MAX_VEHICLES}
                  </span>
                </CardTitle>
                <CardDescription>Quản lý tối đa {MAX_VEHICLES} phương tiện đăng ký gửi xe (Chỉ ô tô)</CardDescription>
              </div>
              <Button onClick={openAddVehicle} disabled={(vehicles?.length || 0) >= MAX_VEHICLES} size="sm" className="w-full bg-green-800 cursor-pointer sm:w-auto hover:bg-green-700">
                <Plus className="w-4 h-4 mr-1" /> Thêm xe
              </Button>
            </CardHeader>
            
            <CardContent>
              {(!vehicles || vehicles.length === 0) ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <div className="w-12 h-12 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Info className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-600">Chưa có phương tiện nào</h3>
                  <p className="text-xs text-slate-400 mt-1">Hãy thêm phương tiện để sử dụng bãi đỗ</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {(vehicles || []).map((v) => (
                    <div key={v.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors bg-white group relative overflow-hidden">
                      {/* Ảnh phương tiện / QR code giả lập */}
                      <div className="flex gap-3">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0 relative bg-slate-100">
                          {v.image ? (
                             <img src={v.image} alt={v.plate_number} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Car className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        {/* QR Code */}
                        <div 
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg border border-slate-100 flex flex-col items-center justify-center bg-slate-50 flex-shrink-0 cursor-pointer hover:bg-slate-100 transition-colors"
                          onClick={() => handleShowQR(v)}
                        >
                          <QrCode className="w-12 h-12 text-slate-800" />
                          <span className="text-[10px] text-slate-500 mt-1 font-medium text-center px-1 break-all flex-wrap">Xem QR</span>
                        </div>
                      </div>

                      {/* Thông tin phương tiện */}
                      <div className="flex-1 flex flex-col justify-between py-1 relative">
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 tracking-wider uppercase">{v.plate_number}</h3>
                                <div className="flex items-center gap-1.5 text-sm text-slate-600 mt-1 mb-1">
                                  <Car className="w-4 h-4 text-blue-600" />
                                  <span className="font-medium text-slate-700">Ô tô ({v.type})</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 absolute top-0 right-0 z-10 sm:invisible group-hover:visible transition-all">
                              <Button variant="ghost" size="icon" onClick={() => openEditVehicle(v)} className="h-8 w-8 text-blue-600 hover:bg-blue-50 cursor-pointer">
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteVehicle(v.id)} className="h-8 w-8 text-red-600 hover:bg-red-50 cursor-pointer">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-slate-400 flex items-center gap-1">
                          <Info className="w-3.5 h-3.5" />
                          <span className="line-clamp-1">Trình mã QR khi ra/vào bãi.</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* DIALOG CHỈNH SỬA PROFILE */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa hồ sơ</DialogTitle>
            <DialogDescription>Cập nhật thông tin cá nhân của bạn. Tài khoản email không thể thay đổi.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center mb-4 mt-2">
            <div className="relative">
              <Avatar className="w-20 h-20 border-2 border-primary/10">
                <AvatarImage src={pForm.image} alt={pForm.name} className="object-cover" />
                <AvatarFallback className="text-xl bg-blue-100 text-blue-700">
                  {pForm.name ? pForm.name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-sm">
                <Camera className="w-3.5 h-3.5" />
                <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, true)} />
              </label>
            </div>
          </div>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Họ và tên</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input value={pForm.name} onChange={(e) => setPForm({...pForm, name: e.target.value})} placeholder="VD: Nguyễn Văn A" className="pl-9" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Số điện thoại</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input 
                  value={pForm.phone} 
                  onChange={(e) => setPForm({...pForm, phone: e.target.value.replace(/\D/g, "").slice(0, 10)})} 
                  placeholder="VD: 0901234567" 
                  maxLength={10}
                  className="pl-9" 
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Giới tính</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10" />
                <Select value={pForm.gender} onValueChange={(val: any) => setPForm({...pForm, gender: val})}>
                  <SelectTrigger className="pl-9">
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Nam</SelectItem>
                    <SelectItem value="female">Nữ</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>Hủy</Button>
             <Button onClick={handleProfileSave}>Lưu hồ sơ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* DIALOG THÊM / SỬA PHƯƠNG TIỆN */}
      <Dialog open={isVehicleDialogOpen} onOpenChange={setIsVehicleDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingVehicleId ? "Sửa thông tin xe" : "Thêm ô tô mới"}</DialogTitle>
            <DialogDescription>
              Vui lòng nhập chính xác biển số xe để quy trình quét tại bãi diễn ra thuận lợi.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center">
               <div className="w-full h-32 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 relative flex items-center justify-center overflow-hidden">
                  {vForm.image ? (
                     <img src={vForm.image} alt="Vehicle" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                       <Camera className="w-8 h-8 mb-2" />
                       <span className="text-xs">Tải ảnh xe lên (Tùy chọn)</span>
                    </div>
                  )}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleFileChange(e, false)} />
               </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="plate">Biển số xe <span className="text-red-500">*</span></Label>
              <Input
                id="plate"
                placeholder="VD: 59A-123.45"
                value={vForm.plate_number}
                onChange={(e) => setVForm({ ...vForm, plate_number: e.target.value.toUpperCase() })}
                className="uppercase font-medium"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="type">Loại xe (Ô tô)</Label>
              <Select value={vForm.type} onValueChange={(val) => setVForm({ ...vForm, type: val })}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Chọn loại xe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Từ 4 đến 10 chỗ">Từ 4 đến 10 chỗ</SelectItem>
                  <SelectItem value="Lớn hơn 10 chỗ">Lớn hơn 10 chỗ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVehicleDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSaveVehicle}>Lưu thông tin</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG HIỂN THỊ QR CODE */}
      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-center font-bold text-xl">Mã QR Check-in Xe</DialogTitle>
            <DialogDescription className="text-center">
              Dùng mã này để quét tại cổng kiểm soát. 
              <br/>Mã được sinh tự động ngay sau khi tạo xe mới.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 bg-white border border-gray-100 rounded-xl shadow-inner mt-2">
            {qrCodeData && (
              <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm mb-4">
                <QRCodeSVG
                  value={qrCodeData}
                  size={220}
                  bgColor={"#ffffff"}
                  fgColor={"#0f172a"}
                  level={"Q"}
                  imageSettings={{
                    src: "/logo.png",
                    x: undefined,
                    y: undefined,
                    height: 48,
                    width: 48,
                    excavate: true,
                  }}
                />
              </div>
            )}
            <div className="text-sm font-semibold bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-mono mt-1">
              Biển số: {vForm.plate_number.toUpperCase()}
            </div>
          </div>
          <DialogFooter className="sm:justify-center mt-2">
            <Button className="w-full" onClick={() => setIsQrDialogOpen(false)}>Đã lưu mã QR</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isSavingProfile && <Loader fullScreen variant="spinner" text="Đang lưu hồ sơ..." />}
      {isSavingVehicle && <Loader fullScreen variant="spinner" text="Đang lưu thông tin phương tiện..." />}
    </div>
  );
}


