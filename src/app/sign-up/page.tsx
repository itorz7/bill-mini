"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Turnstile } from "@marsidev/react-turnstile";
import { Eye, EyeOff, Loader2, UserPlus, Check, X } from "lucide-react";
import { PasswordValidation } from "@/components/password-validation";
import Link from "next/link";
import { signUpSchema, type SignUpData } from "@/schemas";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema)
  });

  const watchedPassword = watch("password", "");
  const watchedConfirmPassword = watch("confirmPassword", "");

  const passwordsMatch = watchedPassword && watchedConfirmPassword && watchedPassword === watchedConfirmPassword;
  const showPasswordMismatch = watchedConfirmPassword && watchedPassword !== watchedConfirmPassword;

  const onSubmit = async (data: SignUpData) => {
    if (!turnstileToken) {
      setError("กรุณายืนยันว่าคุณไม่ใช่หุ่นยนต์");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
          confirmPassword: data.confirmPassword,
          turnstileToken
        })
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess("สมัครสมาชิกสำเร็จ! กำลังนำไปหน้าเข้าสู่ระบบ...");
        setTimeout(() => {
          router.push("/sign-in");
        }, 2000);
      } else {
        setError(result.error || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center py-12 px-4 min-h-[calc(100vh-140px)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            สมัครสมาชิก
          </h1>
          <p className="text-gray-400">
            สร้างบัญชีเพื่อเริ่มใช้งานระบบ Payment Gateway
          </p>
        </div>

        <Card className="relative p-2 border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <GlowingEffect
            spread={40}
            glow={true}
            disabled={false}
            proximity={64}
            inactiveZone={0.01}
          />
          <div className="relative rounded-xl p-8 border border-gray-700">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-900/20 border border-green-800 rounded-lg p-3">
                  <p className="text-green-400 text-sm">{success}</p>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-white">
                    ชื่อผู้ใช้
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    {...register("username")}
                    className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                    placeholder="กรอกชื่อผู้ใช้"
                  />
                  {errors.username && (
                    <p className="text-red-400 text-sm mt-1">{errors.username.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password" className="text-white">
                    รหัสผ่าน
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 pr-10"
                      placeholder="กรอกรหัสผ่าน"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-white transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  <PasswordValidation password={watchedPassword} />
                  {errors.password && (
                    <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-white">
                    ยืนยันรหัสผ่าน
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      {...register("confirmPassword")}
                      className={`bg-gray-800 border-gray-700 text-white placeholder-gray-400 pr-16 transition-all duration-200 ${
                        watchedConfirmPassword ? (
                          passwordsMatch ? 'border-green-500/50 focus:border-green-500 shadow-green-500/20 shadow-sm' : 'border-red-500/50 focus:border-red-500 shadow-red-500/20 shadow-sm'
                        ) : ''
                      }`}
                      placeholder="กรอกรหัสผ่านอีกครั้ง"
                    />
                    <div className="absolute right-0 top-0 h-full flex items-center">
                      {watchedConfirmPassword && (
                        <div className="mr-2 transition-all duration-200">
                          {passwordsMatch ? (
                            <Check className="h-4 w-4 text-green-400" />
                          ) : (
                            <X className="h-4 w-4 text-red-400" />
                          )}
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="px-3 py-2 hover:bg-transparent text-gray-400 hover:text-white transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <PasswordValidation 
                    password={watchedPassword} 
                    confirmPassword={watchedConfirmPassword}
                    showConfirmValidation={true}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="flex justify-center">
                  <Turnstile
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                    onSuccess={setTurnstileToken}
                    onError={() => setError("การยืนยันล้มเหลว กรุณาลองใหม่")}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !turnstileToken}
                variant="gradient"
                className="w-full text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังสมัครสมาชิก...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    สมัครสมาชิก
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                มีบัญชีอยู่แล้ว?{" "}
                <Link
                  href="/sign-in"
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  เข้าสู่ระบบ
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}