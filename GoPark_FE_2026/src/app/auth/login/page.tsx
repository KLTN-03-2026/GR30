"use client";

import { Suspense, useState, useEffect } from "react";
import { Mail, Lock, LogIn, Globe, Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRememberLogin } from "@/hooks/useRememberLogin";
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
import { useAuthStore } from "@/stores/auth.store";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 10 },
  },
};

function LoginFormParams({
  setMessage,
}: {
  setMessage: (msg: string) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("success") === "1") {
      setMessage(
        "✅ Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.",
      );
    }
  }, [searchParams, setMessage]);

  return null;
}

/**
 * Trang Đăng nhập
 * Cho phép người dùng đăng nhập bằng email và mật khẩu
 * Xử lý lưu thông tin đăng nhập (remember me)
 * Hiển thị thông báo thành công và chuyển hướng
 */
function LoginPageContent() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const router = useRouter();
  const { login } = useAuthStore();

  const {
    rememberedData,
    isRememberEnabled,
    saveLogin,
    clearLogin,
    toggleRemember,
    hasRemembered,
  } = useRememberLogin();

  useEffect(() => {
    if (rememberedData) {
      setFormData({
        email: rememberedData.email,
        password: rememberedData.password,
      });
    }
  }, [rememberedData]);

  /**
   * Xử lý sự kiện thay đổi input
   * Cập nhật state formData khi người dùng nhập liệu
   * @param e - Sự kiện thay đổi input
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  /**
   * Xử lý sự kiện checkbox "Ghi nhớ đăng nhập"
   * Bật/tắt tính năng ghi nhớ và xóa dữ liệu nếu tắt
   * @param e - Sự kiện thay đổi checkbox
   */
  const handleRememberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    toggleRemember(isChecked);

    if (!isChecked && hasRemembered) {
      setFormData({ email: "", password: "" });
    }
  };

  /**
   * Xử lý sự kiện submit form đăng nhập
   * Gọi API đăng nhập, lưu token và điều hướng người dùng
   * @param e - Sự kiện submit form
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { email, password } = formData;

    if (!email.trim() || !password.trim()) {
      setMessage("❌ Vui lòng nhập đầy đủ email và mật khẩu");
      setLoading(false);
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await apiClient<any>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!res || !res.data || !res.data.accessToken) {
        throw new Error(res?.message || "Đăng nhập thất bại");
      }

      const { accessToken, refreshToken, user } = res.data;
      const frontendUser = {
        id: user.id || "",
        email: user.email || "",
        status: user.status || "ACTIVE",
        roles: user.roles || [user.role || "USER"],
        role: (user.role || user.roles?.[0] || "USER").toUpperCase(),
        profile: user.profile ? {
          id: user.profile.id,
          name: user.profile.name || "N/A",
          phone: user.profile.phone || null,
          gender: user.profile.gender || null,
          image: user.profile.image || null
        } : null
      };

      login(frontendUser, accessToken, refreshToken);

      setMessage("✅ Đăng nhập thành công!");
      setShowSuccessDialog(true);

      if (isRememberEnabled) {
        saveLogin(email, password);
      } else {
        clearLogin();
      }

      setTimeout(() => {
        setShowSuccessDialog(false);
        const role = frontendUser.role.toLowerCase();
        if (role === "admin") {
          router.push("/admin");
        } else if (role === "owner") {
          router.push("/owner");
        } else {
          router.push("/");
        }
      }, 1500);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setMessage(`❌ ${error.message || "Có lỗi xảy ra khi đăng nhập"}`);
      console.error("Login error:", error);
    }

    setLoading(false);
  };

  return (
    <AuthWrapper align="right">
      <Suspense fallback={null}>
        <LoginFormParams setMessage={setMessage} />
      </Suspense>
      <div className="flex flex-col items-center justify-center p-4 w-full">
        <AnimatePresence>
          {showSuccessDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white dark:bg-stone-900 p-8 rounded-2xl shadow-xl max-w-sm w-full text-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5 }}
                    className="h-full bg-blue-500"
                  />
                </div>

                <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-stone-200 mb-2">
                  Đăng nhập thành công
                </h3>
                <p className="text-slate-500 dark:text-stone-400 mb-4 text-sm">
                  Chào mừng bạn quay trở lại với GoPark
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-125"
        >
          <Card className="border border-white/60 dark:border-stone-700/50 bg-white/70 dark:bg-stone-900/80 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden">
            <CardHeader className="space-y-1 text-center pb-4 pt-6 px-16">
              <motion.div
                variants={itemVariants}
                className="mx-auto w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-2"
              >
                <LogIn className="w-5 h-5 text-blue-600" />
              </motion.div>
              <motion.div variants={itemVariants}>
                <CardTitle className="text-xl font-bold text-slate-800 dark:text-stone-200">
                  Đăng nhập
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-stone-400 font-medium text-xs mt-1">
                  Chào mừng bạn quay trở lại
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent className="px-16 pb-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div variants={itemVariants} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="email"
                      className="text-slate-600 dark:text-stone-300 font-semibold text-xs"
                    >
                      Email
                    </Label>
                    <div className="relative group">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-stone-500 group-focus-within:text-blue-500 transition-colors">
                        <Mail className="w-4 h-4" />
                      </span>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        required
                        onChange={handleChange}
                        value={formData.email}
                        className="pl-9 h-10 bg-slate-50 dark:bg-stone-800/50 dark:bg-stone-800/50 border-slate-200 dark:border-stone-700 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="password"
                        className="text-slate-600 dark:text-stone-300 font-semibold text-xs"
                      >
                        Mật khẩu
                      </Label>
                      <Link
                        href="/auth/reset"
                        tabIndex={-1}
                        className="text-[10px] font-medium text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Quên mật khẩu?
                      </Link>
                    </div>
                    <div className="relative group">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-stone-500 group-focus-within:text-blue-500 transition-colors">
                        <Lock className="w-4 h-4" />
                      </span>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        onChange={handleChange}
                        value={formData.password}
                        className="pl-9 h-10 bg-slate-50 dark:bg-stone-800/50 dark:bg-stone-800/50 border-slate-200 dark:border-stone-700 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg text-sm transition-all"
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex items-center gap-2"
                >
                  <input
                    type="checkbox"
                    id="remember"
                    checked={isRememberEnabled}
                    onChange={handleRememberChange}
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-stone-600 text-blue-600 focus:ring-blue-500"
                  />
                  <Label
                    htmlFor="remember"
                    className="cursor-pointer select-none text-xs font-medium text-slate-600 dark:text-stone-300"
                  >
                    Ghi nhớ đăng nhập
                    {hasRemembered && (
                      <span className="ml-1 text-emerald-600 font-bold">
                        (Đã lưu)
                      </span>
                    )}
                  </Label>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2 pt-1">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        "Đăng nhập"
                      )}
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-10 rounded-lg border-slate-200 dark:border-stone-700 text-slate-600 dark:text-stone-300 hover:bg-slate-50 dark:bg-stone-800 hover:text-slate-900 dark:text-white font-medium text-sm"
                    >
                      <Globe className="w-3.5 h-3.5 mr-2 text-rose-500" />
                      Đăng nhập bằng Google
                    </Button>
                  </motion.div>
                </motion.div>

                {message && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className={`p-2.5 rounded-lg text-xs text-center font-medium ${
                      message.includes("✅")
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : "bg-rose-50 text-rose-600 border border-rose-100"
                    }`}
                  >
                    {message}
                  </motion.div>
                )}

                <motion.div
                  variants={itemVariants}
                  className="mt-4 text-center text-xs"
                >
                  <span className="text-slate-500 dark:text-stone-400">Chưa có tài khoản? </span>
                  <Link
                    href="/auth/register"
                    className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Đăng ký ngay
                  </Link>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AuthWrapper>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
