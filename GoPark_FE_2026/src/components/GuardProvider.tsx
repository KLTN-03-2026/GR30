"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";

// Các trang PUBLIC không cần đăng nhập
const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/verify-email",
  "/auth/reset-password",
  "/auth/reset",
  "/auth/become-owner"
];

export function GuardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();

  // Tránh lỗi Hydration bằng cách đợi mount xong mới check client-side
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Đợi Zustand rehydrate từ localStorage
    useAuthStore.persist.onFinishHydration(() => {
      setIsMounted(true);
    });
    // Fallback if already hydrated
    if (useAuthStore.persist.hasHydrated()) {
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Kiểm tra xem URL hiện tại có nằm trong danh sách PUBLIC không
    const isPublicRoute = pathname === "/" || PUBLIC_ROUTES.some((route) => route !== "/" && pathname.startsWith(route));

    // 1. Chưa đăng nhập & truy cập trang PRIVATE -> đá về Login
    if (!isPublicRoute && !isAuthenticated) {
      toast.error("Bạn phải đăng nhập trước khi truy cập trang này! (Debug: Not Authenticated)");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthorized(false);
      router.replace("/auth/login");
      return;
    }

    // 2. Đã đăng nhập
    if (isAuthenticated) {
      const role = user?.role?.toLowerCase() || "user";

      // 2a. Nếu truy cập lại trang Login/Register -> tự chuyển hướng theo Role
      if (pathname === "/auth/login" || pathname === "/auth/register") {
        if (role === "admin") {
          router.replace("/admin");
        } else if (role === "owner") {
          router.replace("/owner");
        } else {
          router.replace("/");
        }
        return;
      }

      // 2b. Kiểm tra phân quyền ROLE truy cập dựa trên pathname:
      
      // -- Trang dành riêng cho ADMIN
      if (pathname.startsWith("/admin") && role !== "admin") {
        toast.error(`Bạn không có quyền truy cập trang Quản trị! (Role: ${role})`);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsAuthorized(false);
        router.replace(role === "owner" ? "/owner" : "/");
        return;
      }
      
      // -- Trang dành riêng cho OWNER
      if (pathname.startsWith("/owner") && role !== "owner" && role !== "admin") {
        toast.error(`Xin lỗi, trang này chỉ dành cho Chủ Bãi (Owner)! (Role: ${role})`);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsAuthorized(false);
        router.replace(role === "admin" ? "/admin" : "/");
        return;
      }

      // -- Trang CHỦ (hoặc route user): Chuyển hướng ADMIN/OWNER về dashboard riêng nếu họ vào "/"
      if (pathname === "/") {
        if (role === "admin") {
          router.replace("/admin");
          return;
        } else if (role === "owner") {
          router.replace("/owner");
          return;
        }
      }
    }

    // Nếu pass qua được thì cho phép render giao diện
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAuthorized(true);

  }, [pathname, isAuthenticated, user, isMounted, router]);

  // Trong lúc SSR (server hook) hoặc client đang check quyền thì ẩn frame để không bị "nháy" lộ trang web
  if (!isMounted) {
    return null;
  }

  // Chặn render nội dung phía trong nếu chưa có quyền xác thực xong (trừ khi đang ở các trang cấp quyền Public)
  const isPublicRouteOuter = pathname === "/" || PUBLIC_ROUTES.some((route) => route !== "/" && pathname.startsWith(route));
  if (!isAuthorized && !isPublicRouteOuter) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-muted-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
