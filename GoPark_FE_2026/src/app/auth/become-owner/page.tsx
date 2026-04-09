"use client";

import React, { useState } from "react";
import { Check, MapPin, X, UploadCloud, Star, User, Mail, Phone, FileText, Building2, Building, CarFront, LayoutList, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MapLocationPicker } from "@/components/ui/map-location-picker";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import Image from "next/image";

// Types
interface FormData {
  phone: string;
  taxCode: string;
  description: string;
  businessLicenses: File[];
  parkingLotName: string;
  address: string;
  location: { lat: number; lng: number } | null;
  floors: number | string;
  floorSlots: (number | string)[];
  agreedToTerms: boolean;
  images: File[];
  avatarIndex: number;
}

const STEPS = ["Xác thực hồ sơ", "Chi tiết bãi đỗ", "Xem lại thông tin"];

export default function BecomeOwnerPage() {
  const router = useRouter();
  const { user, accessToken, login } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    phone: "",
    taxCode: "",
    description: "",
    businessLicenses: [],
    parkingLotName: "",
    address: "",
    location: null,
    floors: 1,
    floorSlots: [""],
    agreedToTerms: false,
    images: [],
    avatarIndex: 0,
  });

  // Data for Step 1
  const currentUser = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fullName: (user as any)?.profile?.name || "Tài khoản",
    email: user?.email || "",
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.phone) {
        toast.error("Vui lòng nhập số điện thoại");
        return;
      }
      if (!formData.taxCode) {
        toast.error("Vui lòng nhập mã số thuế");
        return;
      }
      if (!formData.businessLicenses || formData.businessLicenses.length === 0) {
        toast.error("Vui lòng tải lên giấy phép kinh doanh");
        return;
      }
    }

    if (currentStep === 2) {
      if (!formData.parkingLotName) {
        toast.error("Vui lòng nhập tên bãi đỗ");
        return;
      }
      if (!formData.description) {
        toast.error("Vui lòng nhập mô tả bãi đỗ");
        return;
      }
      if (!formData.address) {
        toast.error("Vui lòng nhập địa chỉ bãi đỗ");
        return;
      }
      const floorsNum = Number(formData.floors);
      if (!floorsNum || floorsNum <= 0) {
        toast.error("Số tầng phải lớn hơn 0");
        return;
      }
      if (!formData.location) {
        toast.error("Vui lòng chọn vị trí trên bản đồ bằng cách nhấp vào bản đồ hoặc chờ bản đồ tự nhận vị trí");
        return;
      }
      if (formData.images.length === 0) {
        toast.error("Vui lòng tải lên ít nhất một hình ảnh của bãi đỗ");
        return;
      }
      for (let i = 0; i < floorsNum; i++) {
        const slots = Number(formData.floorSlots[i]);
        if (!slots || slots <= 0) {
          toast.error(`Số chỗ đỗ cho Tầng ${i + 1} phải lớn hơn 0`);
          return;
        }
      }
    }

    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.agreedToTerms) {
      toast.error("Vui lòng đồng ý với Điều khoản và Điều kiện để tiếp tục.");
      return;
    }

    if (!user) {
      toast.error("Bạn chưa đăng nhập.");
      return;
    }

    try {
      setLoading(true);

      const slots = formData.floorSlots.map((s, i) => ({
        floorNumber: i + 1,
        capacity: Number(s),
      }));

      // In real implementation, upload images first -> URLs
      const payload = {
        parkingLotName: formData.parkingLotName,
        address: formData.address,
        location: formData.location || { lat: 0, lng: 0 },
        floors: Number(formData.floors),
        floorSlots: slots,
        phone: formData.phone,
        taxCode: formData.taxCode,
        description: formData.description,
        avatarIndex: formData.avatarIndex,
        businessLicenses: formData.businessLicenses.map(f => f.name),
        images: formData.images.map(f => f.name)
      };

      await apiClient("/request/become-owner", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      toast.success(
        "Đăng ký thành công! Yêu cầu của bạn đang được xét duyệt. Admin sẽ liên hệ sau.",
      );
      
      setIsSuccess(true);
    } catch (error: any) { // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error(
        error.message || "Đã xảy ra lỗi khi đăng ký.",
      );
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateFormData = (key: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleGoHome = () => {
    router.push("/"); // Điều hướng về trang chủ
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 min-h-screen z-50 bg-background flex items-center justify-center p-4 py-10 pointer-events-auto">
        <Card className="max-w-md w-full border-muted shadow-2xl">
          <CardContent className="pt-10 pb-8 px-8 text-center flex flex-col items-center">
            <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
              <Check className="h-10 w-10" />
            </div>
            
            <h2 className="text-2xl font-bold mb-3">Gửi yêu cầu thành công!</h2>
            
            <p className="text-muted-foreground mb-8 px-2 max-w-sm">
              Hồ sơ đăng ký trở thành Chủ bãi đỗ của bạn đã được gửi tới Ban quản trị định duyệt. 
              Bạn có thể theo dõi tiến độ phê duyệt trên trang quản lý yêu cầu.
            </p>

            <div className="flex flex-col w-full gap-3">
              <Button 
                onClick={() => router.push("/users/requests")} 
                className="w-full h-12 text-md font-medium bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Xem lịch sử yêu cầu
              </Button>
              <Button 
                onClick={() => router.push("/users")} 
                variant="outline" 
                className="w-full h-12 text-md font-medium"
              >
                Quay lại Trang chủ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    // We add a solid bg-background to cover the 3D map from the parent AuthLayout
    // and pointer-events-auto to re-enable clicks that AuthLayout disabled.
    <div className="fixed inset-0 min-h-screen bg-background p-4 sm:p-6 lg:p-8 flex items-center justify-center pointer-events-auto overflow-y-auto">
      <Card className="w-full max-w-[95vw] lg:max-w-[1500px] shadow-2xl my-auto max-h-[96vh] overflow-y-auto flex flex-col border-muted">
        <CardHeader className="pb-6 relative">
          {/* Nút Hủy / Về Trang chủ */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleGoHome}
            className="absolute left-6 top-6 text-muted-foreground hover:bg-muted text-lg font-bold w-10 h-10 rounded-full"
            title="Quay lại Trang chủ"
          >
            <X className="w-6 h-6" />
          </Button>

          <CardTitle className="text-3xl text-center font-bold mt-2 sm:mt-0">
            Trở thành Chủ Bãi Đỗ Xe
          </CardTitle>
          <CardDescription className="text-center text-base mt-2">
            Đăng ký bãi đỗ xe của bạn trên GoPark và bắt đầu quản lý chỗ đỗ hiệu quả.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 px-4 sm:px-8 lg:px-12 pb-8">
          <Stepper currentStep={currentStep} />

          <div className="mt-10 h-full">
            {currentStep === 1 && (
              <Step1Profile
                user={currentUser}
                data={formData}
                onChange={updateFormData}
              />
            )}
            {currentStep === 2 && (
              <Step2Parking data={formData} onChange={updateFormData} />
            )}
            {currentStep === 3 && (
              <Step3Review
                user={currentUser}
                data={formData}
                onChange={updateFormData}
              />
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6 mt-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || loading}
            className={currentStep === 1 ? "invisible" : ""}
          >
            Quay lại
          </Button>

          {currentStep < 3 ? (
            <Button onClick={handleNext}>Tiếp tục</Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? "Đang xử lý..." : "Gửi Yêu Cầu"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

// --- Sub-components ---

function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="relative">
      {/* Background Line */}
      <div className="absolute top-5 left-0 w-full h-1 bg-muted -translate-y-1/2 rounded-full hidden sm:block"></div>

      {/* Active Line */}
      <div
        className="absolute top-5 left-0 h-1 bg-primary -translate-y-1/2 rounded-full transition-all duration-300 hidden sm:block"
        style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
      ></div>

      <div className="relative flex justify-between">
        {STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div 
              key={step} 
              className={`flex flex-col items-center ${index === STEPS.length - 1 ? "translate-x-2" : ""}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 z-10 bg-background
                  ${isActive ? "border-primary text-primary" : ""}
                  ${isCompleted ? "bg-primary border-primary text-primary-foreground" : ""}
                  ${!isActive && !isCompleted ? "border-muted text-muted-foreground" : ""}
                `}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{stepNumber}</span>
                )}
              </div>
              <span
                className={`mt-2 text-sm text-center font-medium max-w-[120px] 
                  ${isActive || isCompleted ? "text-foreground" : "text-muted-foreground"}
                `}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Step1Profile({ user, data, onChange }: any) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Cleanup prev URLs
  React.useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  // Update object URLs when files change
  React.useEffect(() => {
    const urls = (data.businessLicenses || []).map((file: File) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  }, [data.businessLicenses]);

  const handleLicenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const allFiles = [...(data.businessLicenses || []), ...newFiles];
      onChange("businessLicenses", allFiles);
    }
  };

  const removeLicense = (idx: number) => {
    const newFiles = [...(data.businessLicenses || [])];
    newFiles.splice(idx, 1);
    onChange("businessLicenses", newFiles);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="flex items-center gap-2"><User className="w-4 h-4 text-muted-foreground" />Họ và Tên</Label>
          <Input
            id="fullName"
            value={user.fullName}
            readOnly
            className="bg-muted text-muted-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" />Địa chỉ Email</Label>
          <Input
            id="email"
            value={user.email}
            readOnly
            className="bg-muted text-muted-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" />Số Điện Thoại <span className="text-red-500">*</span></Label>
          <Input
            id="phone"
            placeholder="Nhập số điện thoại của bạn"
            value={data.phone}
            onChange={(e) => onChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} maxLength={10}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="taxCode" className="flex items-center gap-2"><Building2 className="w-4 h-4 text-muted-foreground" />Mã Số Thuế Doanh Nghiệp / Cá Nhân <span className="text-red-500">*</span></Label>
          <Input
            id="taxCode"
            placeholder="Nhập mã số thuế"
            value={data.taxCode}
            onChange={(e) => onChange("taxCode", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4 border rounded-lg p-5 bg-muted/20">
        <h3 className="font-semibold text-lg border-b pb-2 mb-2">
          Giấy Phép Kinh Doanh
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Tải lên bản scan hoặc hình ảnh Giấy phép kinh doanh của bạn để xác thực.
        </p>

        <div className="flex flex-col gap-4">
          <label className="border-2 border-dashed border-muted-foreground hover:border-primary transition-colors hover:bg-muted/30 cursor-pointer w-full h-32 flex flex-col items-center justify-center rounded-lg text-muted-foreground hover:text-primary space-y-2">
            <UploadCloud className="w-8 h-8" />
            <span className="text-sm font-medium text-center px-4">Nhấn để tải lên một hoặc nhiều file</span>
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              multiple
              onChange={handleLicenseChange}
            />
          </label>
          
          {(data.businessLicenses || []).length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
              {data.businessLicenses.map((file: File, index: number) => {
                const isImage = file.type.startsWith('image/');
                return (
                  <div key={index} className="relative group border rounded-lg overflow-hidden flex flex-col aspect-square bg-background shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-1 w-full bg-muted/30 flex items-center justify-center overflow-hidden">
                      {isImage && previewUrls[index] ? (
                        <Image
                          src={previewUrls[index]}
                          alt={`license-${index}`}
                          width={400}
                          height={400}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileText className="w-10 h-10 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="w-8 h-8 rounded-full shadow-lg"
                        onClick={(e) => { e.preventDefault(); removeLicense(index); }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="h-8 bg-background border-t px-2 flex items-center">
                      <span className="text-xs truncate w-full text-center" title={file.name}>
                        {file.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Step2Parking({ data, onChange }: any) {
  const handleFloorsChange = (val: string) => {
    onChange("floors", val);
    
    const newFloors = parseInt(val);
    if (!isNaN(newFloors) && newFloors > 0) {
      const newFloorSlots = [...data.floorSlots];
      if (newFloors > newFloorSlots.length) {
        // pad with empty strings for new inputs
        while (newFloorSlots.length < newFloors) {
          newFloorSlots.push("");
        }
      } else if (newFloors < newFloorSlots.length) {
        // truncate
        newFloorSlots.length = newFloors;
      }
      onChange("floorSlots", newFloorSlots);
    }
  };

  const handleSlotChange = (index: number, val: string) => {
    const newFloorSlots = [...data.floorSlots];
    newFloorSlots[index] = val;
    onChange("floorSlots", newFloorSlots);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const allFiles = [...data.images, ...newFiles];
      onChange("images", allFiles);
    }
  };

  const removeImage = (index: number) => {
    const newFiles = [...data.images];
    newFiles.splice(index, 1);
    onChange("images", newFiles);
    if (data.avatarIndex === index) {
      onChange("avatarIndex", 0);
    } else if (data.avatarIndex > index) {
      onChange("avatarIndex", data.avatarIndex - 1);
    }
  };

  const setAsAvatar = (index: number) => {
    onChange("avatarIndex", index);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-12 xl:gap-16 items-start">
        {/* Left Column: Form Inputs */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="parkingName" className="flex items-center gap-2"><CarFront className="w-4 h-4 text-muted-foreground" />Tên Bãi Đỗ Xe <span className="text-red-500">*</span></Label>
            <Input
              id="parkingName"
              placeholder="VD: Bãi đỗ xe trung tâm"
              value={data.parkingLotName}
              onChange={(e) => onChange("parkingLotName", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2"><LayoutList className="w-4 h-4 text-muted-foreground" />Mô Tả Bãi Đỗ <span className="text-red-500">*</span></Label>
            <Input
              id="description"
              placeholder="VD: Bãi đỗ xe rộng rãi, có mái che, an ninh 24/7..."
              value={data.description}
              onChange={(e) => onChange("description", e.target.value)}
            />
          </div>

          <div className="space-y-4 border rounded-lg p-5 bg-muted/20">
            <h3 className="font-semibold text-lg border-b pb-2 mb-2">
              Hình ảnh bãi đỗ
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Tải lên hình ảnh thực tế bãi đỗ từ thiết bị của bạn. Bạn có thể tải nhiều ảnh và chọn 1 ảnh làm ảnh đại diện (avatar).
            </p>

            <div className="flex flex-wrap gap-4 items-start">
              {data.images.map((file: File, idx: number) => {
                 const previewUrl = URL.createObjectURL(file);
                 const isAvatar = data.avatarIndex === idx;

                 return (
                   <div
                     key={`${file.name}-${idx}`}
                     className={`relative border rounded-lg overflow-hidden group w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 transition-all ${
                       isAvatar ? "ring-2 ring-primary border-primary shadow-md" : "border-muted"
                     }`}
                   >
                     <Image
                       src={previewUrl}
                       alt="preview"
                       fill
                       unoptimized
                       className="object-cover"
                       onLoad={() => URL.revokeObjectURL(previewUrl)}
                     />
                     
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-2 backdrop-blur-[1px]">
                       {!isAvatar && (
                         <Button
                           variant="secondary"
                           size="sm"
                           className="h-7 text-[10px] sm:text-xs scale-90"
                           onClick={(e) => {
                             e.preventDefault();
                             setAsAvatar(idx);
                           }}
                         >
                           Làm Avatar
                         </Button>
                       )}
                       <Button
                         variant="destructive"
                         size="icon"
                         className="h-6 w-6 sm:h-7 sm:w-7 rounded-full"
                         onClick={(e) => {
                           e.preventDefault();
                           removeImage(idx);
                         }}
                       >
                         <X className="w-3 h-3 sm:w-4 sm:h-4" />
                       </Button>
                     </div>
                     
                     {isAvatar && (
                       <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center shadow-lg">
                         <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-500" /> Avatar
                       </div>
                     )}
                   </div>
                 );
              })}

              <label className="border-2 border-dashed border-muted-foreground hover:border-primary transition-colors hover:bg-muted/30 cursor-pointer w-24 h-24 sm:w-32 sm:h-32 flex flex-col items-center justify-center rounded-lg text-muted-foreground hover:text-primary space-y-2">
                <UploadCloud className="w-6 h-6 sm:w-8 sm:h-8" />
                <span className="text-[10px] sm:text-xs font-medium text-center px-2">Tải ảnh lên</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          <div className="space-y-4 border rounded-lg p-5 bg-muted/20">
            <h3 className="font-semibold text-lg border-b pb-2">
              Cấu trúc Bãi Đỗ Xe
            </h3>
            <div className="space-y-2 sm:w-1/2">
              <Label htmlFor="floors" className="flex items-center gap-2"><Layers className="w-4 h-4 text-muted-foreground" />Số tầng / khu vực <span className="text-red-500">*</span></Label>
              <Input
                id="floors"
                type="number"
                min="1"
                placeholder="VD: 3"
                value={data.floors}
                onChange={(e) => handleFloorsChange(e.target.value)}
              />
            </div>

            {Number(data.floors) > 0 && (
              <div className="space-y-3 pt-4">
                <Label className="flex items-center gap-2">Cấu hình sức chứa theo tầng <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.from({ length: Number(data.floors) }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 bg-background p-2 rounded-md border text-sm"
                    >
                      <span className="font-medium whitespace-nowrap min-w-[60px]">
                        Tầng {index + 1}
                      </span>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Số chỗ đỗ"
                        className="h-8"
                        value={data.floorSlots[index] ?? ""}
                        onChange={(e) => handleSlotChange(index, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 border rounded-lg p-5 bg-muted/20">
            <h3 className="font-semibold text-lg border-b pb-2 mb-2">
              Địa chỉ bãi đỗ
            </h3>
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" />Địa chỉ (Sẽ tự động cập nhật bản đồ) <span className="text-red-500">*</span></Label>
              <Input
                id="address"
                placeholder="Nhập địa chỉ đầy đủ (VD: 254 Nguyễn Văn Linh, Đà Nẵng)"
                value={data.address}
                onChange={(e) => onChange("address", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Map */}
        <div className="flex flex-col h-full min-h-[400px] lg:min-h-[600px] lg:sticky lg:top-0">
          <div className="space-y-2 flex flex-col h-full bg-muted/10 p-5 rounded-lg border">
            <Label className="text-lg font-semibold flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" /> Vị trí trên bản đồ <span className="text-red-500">*</span></Label>
            <span className="text-sm text-muted-foreground block mb-4">
              Nhấp vào bản đồ để xác định vị trí chính xác của bãi đỗ xe hoặc nhập địa chỉ vào ô ở bên trái để tự động tìm đến vị trí tương đối.
            </span>
            <div className="flex-1 w-full rounded-md overflow-hidden border shadow-sm relative min-h-[300px]">
              <MapLocationPicker 
                location={data.location} 
                addressSearch={data.address}
                onChange={(loc) => onChange("location", loc)} 
                onAddressSelect={(address) => onChange("address", address)}
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Step3Review({ user, data, onChange }: any) {
  const [licenseUrls, setLicenseUrls] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  React.useEffect(() => {
    const lUrls = (data.businessLicenses || []).map((f: File) => URL.createObjectURL(f));
    const iUrls = (data.images || []).map((f: File) => URL.createObjectURL(f));
    
    setLicenseUrls(lUrls);
    setImageUrls(iUrls);

    return () => {
      lUrls.forEach((u: string) => URL.revokeObjectURL(u));
      iUrls.forEach((u: string) => URL.revokeObjectURL(u));
    };
  }, [data.businessLicenses, data.images]);

  const totalSlots = data.floorSlots.reduce(
    (acc: number, curr: number | string) => acc + (Number(curr) || 0),
    0,
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Phần Hồ Sơ Cá Nhân */}
        <div className="bg-background rounded-xl p-6 border shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold">1. Thông tin cá nhân</h3>
          </div>

          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-[1fr_2fr] gap-2 items-center">
              <span className="text-muted-foreground font-medium">Họ và Tên:</span>
              <span className="font-semibold text-foreground bg-muted/50 p-2 rounded-md">{user.fullName}</span>
            </div>
            <div className="grid grid-cols-[1fr_2fr] gap-2 items-center">
              <span className="text-muted-foreground font-medium">Email:</span>
              <span className="font-semibold text-foreground bg-muted/50 p-2 rounded-md">{user.email}</span>
            </div>
            <div className="grid grid-cols-[1fr_2fr] gap-2 items-center">
              <span className="text-muted-foreground font-medium">Số điện thoại:</span>
              <span className="font-semibold text-foreground bg-muted/50 p-2 rounded-md">{data.phone || "Chưa cung cấp"}</span>
            </div>
            <div className="grid grid-cols-[1fr_2fr] gap-2 items-center">
              <span className="text-muted-foreground font-medium">Mã Số Thuế:</span>
              <span className="font-semibold text-foreground bg-muted/50 p-2 rounded-md">{data.taxCode || "Chưa cung cấp"}</span>
            </div>

            <div className="pt-2">
              <span className="text-muted-foreground font-medium block mb-3">Giấy Phép Kinh Doanh / Căn cước:</span>
              {(data.businessLicenses || []).length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {data.businessLicenses.map((file: File, idx: number) => (
                    <div key={idx} className="border rounded-md aspect-video overflow-hidden bg-muted/20 relative group">
                      {file.type.startsWith('image/') && licenseUrls[idx] ? (
                        <Image src={licenseUrls[idx]} alt="license" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-xs text-muted-foreground">
                          <FileText className="w-8 h-8 mb-2" />
                          <span className="truncate w-full">{file.name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-amber-600 bg-amber-50 p-2 rounded-md block text-center">Chưa tải lên giấy tờ</span>
              )}
            </div>
          </div>
        </div>

        {/* Phần Bãi Đỗ Xe */}
        <div className="bg-background rounded-xl p-6 border shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold">2. Bãi đỗ xe</h3>
          </div>

          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-[1fr_2fr] gap-2 items-center">
              <span className="text-muted-foreground font-medium">Tên bãi:</span>
              <span className="font-semibold text-foreground bg-muted/50 p-2 rounded-md">{data.parkingLotName || "Chưa cung cấp"}</span>
            </div>
            
            <div className="grid grid-cols-[1fr_2fr] gap-2 items-start">
              <span className="text-muted-foreground font-medium mt-2">Mô tả:</span>
              <div className="font-medium text-foreground bg-muted/50 p-3 rounded-md line-clamp-3 min-h-[60px]">
                {data.description || "Chưa có mô tả"}
              </div>
            </div>

            <div className="grid grid-cols-[1fr_2fr] gap-2 items-start">
              <span className="text-muted-foreground font-medium mt-2">Địa chỉ:</span>
              <span className="font-semibold text-foreground bg-muted/50 p-2 rounded-md flex items-start gap-1">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                {data.address || "Chưa cung cấp"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-muted/30 p-4 rounded-lg border text-center">
                <div className="text-3xl font-bold text-primary mb-1">{data.floors || 0}</div>
                <div className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Tầng/Khu vực</div>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg border text-center">
                <div className="text-3xl font-bold text-primary mb-1">{totalSlots}</div>
                <div className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Tổng sức chứa</div>
              </div>
            </div>
            
            {Number(data.floors) > 0 && (
              <div className="bg-muted/20 p-3 rounded-md border flex flex-wrap gap-2">
                <span className="w-full text-muted-foreground mb-1 block">Chi tiết theo tầng:</span>
                {data.floorSlots.map((slot: any, idx: number) => (
                  <div key={idx} className="bg-background border rounded px-3 py-1 text-center">
                    <span className="text-muted-foreground text-xs block">Tầng {idx + 1}</span>
                    <span className="font-bold">{slot || 0}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Phần Hình ảnh bãi đỗ xe */}
      <div className="bg-background rounded-xl p-6 border shadow-sm space-y-4">
         <div className="flex items-center gap-3 border-b pb-4 mb-2">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold">3. Hình ảnh bãi đỗ</h3>
          </div>

          {data.images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {data.images.map((file: File, idx: number) => (
                <div key={idx} className={`relative border rounded-lg overflow-hidden aspect-video shadow-sm ${data.avatarIndex === idx ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                  {imageUrls[idx] ? (
                    <Image fill src={imageUrls[idx]} alt={`parking-${idx}`} className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted/50">
                      <FileText className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  {data.avatarIndex === idx && (
                    <div className="absolute top-1 left-1 bg-primary text-white text-[10px] px-2 py-0.5 rounded-sm font-bold shadow-sm">
                      Ảnh đại diện
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center p-8 bg-muted/20 rounded-lg border border-dashed">
                <span className="text-muted-foreground">Bạn chưa đăng tải hình ảnh nào cho bãi đỗ xe</span>
             </div>
          )}
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 mt-8">
        <label className="flex items-start space-x-3 cursor-pointer">
          <Checkbox
            id="terms"
            checked={data.agreedToTerms}
            onCheckedChange={(checked) => onChange("agreedToTerms", checked)}
            className="mt-1"
          />
          <div className="grid gap-1.5 leading-none">
            <span className="font-semibold text-foreground">
              Đồng ý với các điều khoản
            </span>
            <span className="text-sm text-muted-foreground mt-1">
              Tôi xác nhận các thông tin trên là chính xác và tôi đồng ý với Thỏa thuận đối tác quản lý bãi đỗ GoPark.
            </span>
          </div>
        </label>
      </div>
    </div>
  );
}



