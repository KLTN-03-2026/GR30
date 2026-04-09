"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { OwnerProfileType } from "@/types/owner";
import { updateOwnerProfile, changePassword } from "@/services/ownerService";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Phone, Mail, MapPin, Camera, Lock, Edit3, Save, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface OwnerProfileProps {
  profile: OwnerProfileType | null;
  onViewParkingLots: () => void;
}

type EditMode = "none" | "profile" | "password" | "avatar";

export default function OwnerProfile({
  profile,
  onViewParkingLots,
}: OwnerProfileProps) {
  const [editMode, setEditMode] = useState<EditMode>("none");
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    phone: profile?.phone || "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const queryClient = useQueryClient();

  // ─── Mutation: Update Profile ───────────────────────────────────────────────
  const updateProfileMutation = useMutation({
    mutationFn: (data: { name: string; phone: string }) =>
      updateOwnerProfile(user!.id, { name: data.name, phone: data.phone }),
    onSuccess: (updated) => {
      // Cập nhật lại auth store để UI phản ánh ngay
      updateUser({
        profile: {
          ...(user?.profile ?? { id: 0, gender: null, image: null }),
          name: updated.name,
          phone: updated.phone,
        },
      });
      queryClient.invalidateQueries({ queryKey: ["ownerProfile", user?.id] });
      toast.success("Cập nhật thông tin thành công!");
      setEditMode("none");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Cập nhật thất bại. Vui lòng thử lại.");
    },
  });

  // ─── Mutation: Change Password ───────────────────────────────────────────────
  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setEditMode("none");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Đổi mật khẩu thất bại. Vui lòng thử lại.");
    },
  });

  if (!profile) {
    return (
      <Card className="w-full flex items-center justify-center p-12 border-none shadow-none bg-transparent">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium">
            Đang tải hồ sơ...
          </p>
        </div>
      </Card>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Tên không được để trống.");
      return;
    }
    updateProfileMutation.mutate({ name: formData.name, phone: formData.phone });
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin mật khẩu.");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  const avatarSrc = profile.image || undefined;
  const avatarFallback = profile.name?.charAt(0)?.toUpperCase() || "O";

  const renderContent = () => {
    switch (editMode) {
      case "profile":
        return (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Họ và tên</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nhập tên của bạn"
                  disabled={updateProfileMutation.isPending}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Nhập số điện thoại"
                  disabled={updateProfileMutation.isPending}
                />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input value={profile.email} disabled className="bg-muted/50 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Email không thể thay đổi.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditMode("none")}
                disabled={updateProfileMutation.isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Lưu thay đổi
              </Button>
            </div>
          </form>
        );

      case "password":
        return (
          <form onSubmit={handleSavePassword} className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  disabled={changePasswordMutation.isPending}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-password">Mật khẩu mới</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  disabled={changePasswordMutation.isPending}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  disabled={changePasswordMutation.isPending}
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditMode("none")}
                disabled={changePasswordMutation.isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={changePasswordMutation.isPending}>
                {changePasswordMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Đổi mật khẩu
              </Button>
            </div>
          </form>
        );

      case "avatar":
        return (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-6 py-4">
              <Avatar className="w-32 h-32 border-4 border-indigo-50 shadow-sm">
                <AvatarImage src={avatarSrc} alt={profile.name} />
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
              <div className="w-full max-w-sm">
                <Label
                  htmlFor="avatar-upload"
                  className="mb-2 block text-center"
                >
                  Tải ảnh đại diện mới
                </Label>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="cursor-pointer"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditMode("none")}
              >
                Hủy
              </Button>
              <Button onClick={() => setEditMode("none")}>
                <Save className="w-4 h-4 mr-2" />
                Lưu ảnh
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="flex-shrink-0">
              <Avatar className="w-32 h-32 border-4 border-indigo-50 shadow-sm">
                <AvatarImage src={avatarSrc} alt={profile.name} />
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 text-center md:text-left w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {profile.name}
                  </h2>
                  <div className="flex flex-col gap-1.5 mt-2">
                    <p className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground text-sm">
                      <Mail className="w-4 h-4" />
                      {profile.email}
                    </p>
                    {profile.phone && (
                      <p className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground text-sm">
                        <Phone className="w-4 h-4" />
                        {profile.phone}
                      </p>
                    )}
                    <p className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground text-sm">
                      <MapPin className="w-4 h-4" />
                      Tổng số bãi đỗ:{" "}
                      <span className="font-semibold text-foreground">
                        {profile.totalLots}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-4">
                <Button
                  onClick={() => {
                    setFormData({ name: profile.name, phone: profile.phone || "" });
                    setEditMode("profile");
                  }}
                  variant="default"
                  size="sm"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Button>
                <Button
                  onClick={() => setEditMode("password")}
                  variant="outline"
                  size="sm"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Đổi mật khẩu
                </Button>
                <Button
                  onClick={() => setEditMode("avatar")}
                  variant="outline"
                  size="sm"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Đổi ảnh đại diện
                </Button>
                <Separator
                  orientation="vertical"
                  className="h-8 mx-1 hidden md:block"
                />
                <Button
                  onClick={onViewParkingLots}
                  variant="secondary"
                  size="sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Xem bãi đỗ xe
                </Button>
              </div>
            </div>
          </div>
        );
    }
  };

  const getTitle = () => {
    switch (editMode) {
      case "profile": return "Chỉnh sửa thông tin";
      case "password": return "Đổi mật khẩu";
      case "avatar": return "Đổi ảnh đại diện";
      default: return "Thông tin tài khoản";
    }
  };

  const getDescription = () => {
    switch (editMode) {
      case "profile": return "Cập nhật tên và số điện thoại của bạn.";
      case "password": return "Chọn mật khẩu mạnh để bảo vệ tài khoản.";
      case "avatar": return "Tải ảnh đại diện chuyên nghiệp cho hồ sơ.";
      default: return "Quản lý thông tin cá nhân của bạn.";
    }
  };

  return (
    <Card className="overflow-hidden border-border bg-card shadow-sm transition-all hover:shadow-md">
      <CardHeader className="pb-4">
        <CardTitle>{getTitle()}</CardTitle>
        <CardDescription>{getDescription()}</CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-8">{renderContent()}</CardContent>
    </Card>
  );
}
