"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Camera, Loader2 } from "lucide-react";
import { ocrService } from "@/services/ocr.service";
import { toast } from "sonner";
import { parkingService } from "@/services/parking.service";
import { useCustomerStore } from "@/stores/customer.store";

export function FormAddCustomer() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vehicleImages, setVehicleImages] = useState<File[]>([]);
  const [plateImage, setPlateImage] = useState<File | null>(null);

  const lotId = useCustomerStore((state) => state.lotId);

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error("Vui lòng nhập tên khách hàng");
    if (!phone.trim()) return toast.error("Vui lòng nhập số điện thoại");
    if (!licensePlate.trim()) return toast.error("Vui lòng nhập biển số xe");
    if (!lotId) return toast.error("Vui lòng chọn bãi đỗ xe trước khi đăng ký");

    setIsSubmitting(true);
    try {
      const payload = {
        name,
        phoneNumber: phone,
        licensePlate,
      };

      const res = await parkingService.walkInCheckIn(lotId, payload);

      const bookingId = res.data?.bookingId || "N/A";
      toast.success(`Đăng ký thành công! Mã Booking: ${bookingId}`);

      // Reset form
      setName("");
      setPhone("");
      setLicensePlate("");
      setVehicleImages([]);
      setPlateImage(null);
    } catch (error: unknown) {
      console.error(error);
      const errorMessage =
        (error as any)?.response?.data?.message ||
        (error as Error)?.message ||
        "Có lỗi xảy ra khi lưu dữ liệu";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMultipleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setVehicleImages([...vehicleImages, ...Array.from(e.target.files)]);
  };

  const handleOcrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPlateImage(file);
    setIsOcrLoading(true);

    const promise = ocrService.recognizeLicensePlate(file).then((result) => {
      setLicensePlate(result);
      return result;
    }).finally(() => {
      setIsOcrLoading(false);
      // Giữ cho input file có thể upload lại cùng 1 file
      e.target.value = "";
    });

    toast.promise(promise, {
      loading: "Đang nhận diện biển số...",
      success: "Nhận diện biển số thành công!",
      error: (err) =>
        err instanceof Error ? err.message : "Nhận diện biển số thất bại",
    });
  };

  return (
    <div className="grid gap-6 py-6 px-4 md:px-6 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground scrollbar-track-secondary">
      {/* Tên */}
      <div className="grid gap-2">
        <Label className="text-sm font-medium">Tên khách hàng</Label>
        <Input
          placeholder="Nhập tên khách hàng"
          className="h-10"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* SĐT */}
      <div className="grid gap-2">
        <Label className="text-sm font-medium">Số điện thoại</Label>
        <Input
          placeholder="Nhập số điện thoại"
          className="h-10"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      {/* Biển số (Editable Input) */}
      <div className="grid gap-2">
        <Label className="text-sm font-medium">Biển số xe</Label>
        <Input
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value)}
          placeholder={
            isOcrLoading ? "Đang nhận diện..." : "Nhập hoặc quét biển số"
          }
          className="h-10 uppercase font-bold"
          disabled={isOcrLoading}
        />
      </div>

      {/* Upload section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Upload biển số */}
        <div className="grid gap-2">
          <Label className="text-sm font-medium">Ảnh biển số</Label>

          <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition relative overflow-hidden">
            {isOcrLoading ? (
              <div className="absolute inset-0 bg-background/50 flex flex-col items-center justify-center z-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-xs mt-2 font-medium">Đang xử lý...</p>
              </div>
            ) : null}

            <Upload className="w-6 h-6 mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground text-center px-2">
              Upload hoặc chụp ảnh biển số để tự động nhập
            </p>

            <Input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleOcrUpload}
              disabled={isOcrLoading}
            />

            {/* Nút chụp (Dành cho mobile) */}
            <div className="mt-2 flex items-center gap-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-8 px-3 rounded-md text-xs font-medium transition-colors">
              <Camera className="w-4 h-4" />
              <span>Chụp ảnh</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleOcrUpload}
                disabled={isOcrLoading}
              />
            </div>
          </label>

          {/* Preview Ảnh Biển Số */}
          {plateImage && (
            <div className="mt-2">
              <img
                src={URL.createObjectURL(plateImage)}
                alt="License Plate Preview"
                className="w-full h-32 object-cover rounded-md border"
                onLoad={(e) =>
                  URL.revokeObjectURL((e.target as HTMLImageElement).src)
                }
              />
            </div>
          )}
        </div>

        {/* Upload ảnh xe */}
        <div className="grid gap-2">
          <Label className="text-sm font-medium">Ảnh xe</Label>

          <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition relative">
            <Upload className="w-6 h-6 mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground text-center px-2">
              Upload hoặc chụp nhiều ảnh xe
            </p>

            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={handleMultipleImages}
              className="hidden"
            />

            <div className="mt-2 flex items-center gap-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-8 px-3 rounded-md text-xs font-medium transition-colors">
              <Camera className="w-4 h-4" />
              <span>Chụp ảnh</span>
              <input
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleMultipleImages}
              />
            </div>
          </label>

          {/* Preview ảnh */}
          {vehicleImages.length > 0 && (
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-2 mt-2 pb-2 scrollbar-thin scrollbar-thumb-muted-foreground scrollbar-track-secondary">
              {vehicleImages.map((file, index) => {
                const url = URL.createObjectURL(file);
                return (
                  <img
                    key={index}
                    src={url}
                    alt="vehicle"
                    className="w-20 h-20 object-cover rounded-md border shrink-0 snap-start"
                    onLoad={() => URL.revokeObjectURL(url)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Submit */}
      <Button
        className="w-full h-10 mt-2 text-base font-semibold"
        disabled={isOcrLoading || isSubmitting}
        onClick={handleSubmit}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Đang xử lý...
          </>
        ) : (
          "Thêm khách hàng"
        )}
      </Button>
    </div>
  );
}
