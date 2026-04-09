"use client";

import { useState, Suspense } from "react";
import { Lock, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { AuthWrapper } from "@/components/features/auth/AuthWrapper";
import { apiClient } from "@/lib/api";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setMessage("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (password.length < 6) {
      setMessage("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (!token || !email) {
      setMessage("Link đổi mật khẩu không hợp lệ hoặc đã hết hạn.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await apiClient(`/auth/reset-password/confirm?token=${token}&email=${email}`, {
        method: "POST",
        body: JSON.stringify({ newPassword: password }),
      });
      setSuccess(true);
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Đổi mật khẩu thất bại. Token có thể đã hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="border border-white/60 dark:border-stone-700/50 bg-white/70 dark:bg-stone-900/80 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden">
        <CardHeader className="space-y-1 text-center pb-4 pt-8 px-8">
          <motion.div className="mx-auto w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-2">
            <Lock className="w-6 h-6 text-blue-600" />
          </motion.div>
          <CardTitle className="text-2xl font-bold text-slate-800 dark:text-stone-200">
            Tạo mật khẩu mới
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-stone-400 font-medium text-sm mt-1">
            Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6"
              >
                <div className="flex justify-center text-green-500 mb-4">
                  <CheckCircle2 className="w-16 h-16" />
                </div>
                <p className="text-xl font-bold text-slate-800 dark:text-stone-200">Điểm trí hoàn tất!</p>
                <p className="text-sm text-slate-600 dark:text-stone-300 font-medium">
                  Mật khẩu của bạn đã được thay đổi thành công. Bạn có thể sử dụng mật khẩu mới để đăng nhập.
                </p>
                <Button 
                  onClick={() => router.push("/auth/login")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-10"
                >
                  Đăng nhập ngay
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                  {message && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs text-center font-medium">
                      {message}
                    </div>
                  )}
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-slate-600 dark:text-stone-300 font-semibold text-xs">
                        Mật khẩu mới
                      </Label>
                      <div className="relative group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-stone-500 group-focus-within:text-blue-500 transition-colors">
                          <Lock className="w-4 h-4" />
                        </span>
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-9 h-10 bg-slate-50 dark:bg-stone-800/50 dark:bg-stone-800/50 border-slate-200 dark:border-stone-700 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg text-sm transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword" className="text-slate-600 dark:text-stone-300 font-semibold text-xs">
                        Xác nhận mật khẩu
                      </Label>
                      <div className="relative group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-stone-500 group-focus-within:text-blue-500 transition-colors">
                          <Lock className="w-4 h-4" />
                        </span>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-9 h-10 bg-slate-50 dark:bg-stone-800/50 dark:bg-stone-800/50 border-slate-200 dark:border-stone-700 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg text-sm transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm shadow-blue-200 flex items-center justify-center gap-2 transition-all mt-4"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Cập nhật mật khẩu
                  </Button>
                </form>
                <div className="mt-6 text-center">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-stone-400 hover:text-slate-800 dark:text-stone-200 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại đăng nhập
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthWrapper align="right">
      <Suspense fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>
    </AuthWrapper>
  );
}
