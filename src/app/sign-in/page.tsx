"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Turnstile } from "@marsidev/react-turnstile";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { PasswordValidation } from "@/components/password-validation";
import Link from "next/link";
import { signInSchema, type SignInData } from "@/schemas";

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    mode: "onChange" // Enable realtime validation
  });

  // Watch password field for realtime validation feedback
  const watchedPassword = watch("password", "");

  const onSubmit = async (data: SignInData) => {
    if (!turnstileToken) {
      setError("กรุณายืนยันว่าคุณไม่ใช่หุ่นยนต์");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        username: data.username,
        password: data.password,
        turnstileToken: turnstileToken,
        redirect: false
      });

      if (result?.error) {
        setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center py-12 px-4 min-h-[calc(100vh-140px)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            เข้าสู่ระบบ
          </h1>
          <p className="text-gray-400">
            เข้าสู่ระบบเพื่อจัดการการชำระเงินของคุณ
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
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  
                  
                  <PasswordValidation password={watchedPassword} />
                  
                  {errors.password && (
                    <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
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
                    กำลังเข้าสู่ระบบ...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    เข้าสู่ระบบ
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                ยังไม่มีบัญชี?{" "}
                <Link
                  href="/sign-up"
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  สมัครสมาชิก
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}