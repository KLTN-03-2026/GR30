"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AuthWrapper } from "@/components/features/auth/AuthWrapper";
import { apiClient } from "@/lib/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Đang xác thực thông tin tài khoản của bạn...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Không tìm thấy mã xác thực. Vui lòng kiểm tra lại đường dẫn.");
      return;
    }

    const verify = async () => {
      try {
        await apiClient(`/auth/verify-email?token=${token}`, { method: "GET" });
        setStatus("success");
        setMessage("Tài khoản của bạn đã được kích hoạt thành công!");
      } catch (error: any) {
        setStatus("error");
        // Often errors come wrapped or as string
        setMessage(error?.response?.data?.message || error?.message || "Xác thực thất bại hoặc link đã hết hạn.");
      }
    };

    verify();
  }, [token]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="border border-white/60 bg-white/70 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden">
        <CardHeader className="space-y-1 text-center pb-4 pt-8 px-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              status === 'loading' ? 'bg-blue-50 text-blue-500' :
              status === 'success' ? 'bg-green-50 text-green-500' :
              'bg-red-50 text-red-500'
            }`}
          >
            {status === 'loading' && <Loader2 className="w-8 h-8 animate-spin" />}
            {status === 'success' && <Check className="w-8 h-8" />}
            {status === 'error' && <X className="w-8 h-8" />}
          </motion.div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            Kích hoạt tài khoản
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium text-sm mt-2">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8 text-center pt-2">
          {status !== "loading" && (
             <Button 
                onClick={() => router.push("/auth/login")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-10 mt-2"
             >
               Quay lại Đăng nhập
             </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthWrapper align="right">
      <Suspense fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </AuthWrapper>
  );
}
