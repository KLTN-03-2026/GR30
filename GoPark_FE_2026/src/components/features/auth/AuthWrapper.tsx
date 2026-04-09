"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { Button } from "@/components/ui/button";

interface AuthWrapperProps {
  children: React.ReactNode;
  align?: "left" | "right";
}

/**
 * Wrapper cho các trang xác thực (Login/Register)
 * Hiển thị nội dung form và nút quay lại trang chủ
 * Hỗ trợ căn chỉnh layout trái/phải để phù hợp với thiết kế
 * @param children - Nội dung bên trong wrapper
 * @param align - Căn chỉnh vị trí của content ("left" hoặc "right")
 */
export function AuthWrapper({ children, align = "right" }: AuthWrapperProps) {
  const router = useRouter();

  return (
    <div className="relative min-h-screen w-full overflow-hidden pointer-events-none">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20 pointer-events-auto">
        <Button
          className="rounded-full p-2 bg-white/50 backdrop-blur-sm border border-white/60 hover:bg-white text-slate-600 hover:text-slate-900 transition-all shadow-sm"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="sr-only">Back to Home</span>
        </Button>
      </div>

      {/* Content */}
      <div 
        className={`relative z-10 w-full min-h-screen flex items-center px-4 md:px-20 pointer-events-none ${
          align === "right" ? "justify-end" : "justify-start"
        }`}
      >
        <motion.div 
          initial={{ opacity: 0, x: align === "right" ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: align === "right" ? 50 : -50 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md pointer-events-auto"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
