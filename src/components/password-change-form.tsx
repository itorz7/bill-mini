"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { PasswordValidation } from "@/components/password-validation";
import {
  Key,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import { passwordSchema, type PasswordData } from "@/schemas";

interface PasswordChangeFormProps {
  onSubmit: (data: PasswordData) => Promise<void>;
  isLoading: boolean;
  message?: {
    type: "success" | "error";
    text: string;
  } | null;
  onMutate?: () => void;
}

export function PasswordChangeForm({ 
  onSubmit, 
  isLoading, 
  message, 
  onMutate 
}: PasswordChangeFormProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordForm = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
  });

  const watchedNewPassword = passwordForm.watch("newPassword", "");
  const watchedConfirmPassword = passwordForm.watch("confirmPassword", "");

  const passwordsMatch =
    watchedNewPassword &&
    watchedConfirmPassword &&
    watchedNewPassword === watchedConfirmPassword;
  const showPasswordMismatch =
    watchedConfirmPassword && watchedNewPassword !== watchedConfirmPassword;

  const handleSubmit = async (data: PasswordData) => {
    await onSubmit(data);
    if (message?.type === "success") {
      passwordForm.reset();
      onMutate?.();
    }
  };

  return (
    <Card className="xl:col-span-1 p-2 border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <GlowingEffect
        spread={40}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
      />
      <div className="relative rounded-xl p-6 border border-gray-700">
        <div className="flex items-center mb-6">
          <Key className="h-5 w-5 text-purple-400 mr-2" />
          <h2 className="text-xl font-semibold text-white">
            เปลี่ยนรหัสผ่าน
          </h2>
        </div>

        {message && message.text.includes("รหัสผ่าน") && (
          <div
            className={`mb-4 p-3 rounded-lg border flex items-center ${
              message.type === "success"
                ? "bg-green-900/20 border-green-800 text-green-400"
                : "bg-red-900/20 border-red-800 text-red-400"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-3 w-3 mr-2" />
            ) : (
              <AlertCircle className="h-3 w-3 mr-2" />
            )}
            <span className="text-xs">{message.text}</span>
          </div>
        )}

        <form
          onSubmit={passwordForm.handleSubmit(handleSubmit)}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="currentPassword" className="text-white">
              รหัสผ่านปัจจุบัน
            </Label>
            <div className="relative mt-1">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                {...passwordForm.register("currentPassword")}
                className="bg-gray-800 border-gray-700 text-white pr-10"
                placeholder="กรอกรหัสผ่านปัจจุบัน"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-white transition-colors"
                onClick={() =>
                  setShowCurrentPassword(!showCurrentPassword)
                }
                aria-label={
                  showCurrentPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"
                }
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {passwordForm.formState.errors.currentPassword && (
              <p className="text-red-400 text-sm mt-1">
                {passwordForm.formState.errors.currentPassword.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="newPassword" className="text-white">
              รหัสผ่านใหม่
            </Label>
            <div className="relative mt-1">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                {...passwordForm.register("newPassword")}
                className="bg-gray-800 border-gray-700 text-white pr-10"
                placeholder="กรอกรหัสผ่านใหม่"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-white transition-colors"
                onClick={() => setShowNewPassword(!showNewPassword)}
                aria-label={
                  showNewPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"
                }
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <PasswordValidation password={watchedNewPassword} />

            {passwordForm.formState.errors.newPassword && (
              <p className="text-red-400 text-sm mt-1">
                {passwordForm.formState.errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-white">
              ยืนยันรหัสผ่านใหม่
            </Label>
            <div className="relative mt-1">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                {...passwordForm.register("confirmPassword")}
                className={`bg-gray-800 border-gray-700 text-white pr-16 transition-all duration-200 ${
                  watchedConfirmPassword
                    ? passwordsMatch
                      ? "border-green-500/50 focus:border-green-500 shadow-green-500/20 shadow-sm"
                      : "border-red-500/50 focus:border-red-500 shadow-red-500/20 shadow-sm"
                    : ""
                }`}
                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
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
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  aria-label={
                    showConfirmPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            {passwordsMatch && (
              <div className="flex items-center mt-2 text-green-400 text-sm">
                <Check className="h-3 w-3 mr-1" />
                รหัสผ่านตรงกัน
              </div>
            )}
            {showPasswordMismatch && (
              <div className="flex items-center mt-2 text-red-400 text-sm">
                <X className="h-3 w-3 mr-1" />
                รหัสผ่านไม่ตรงกัน
              </div>
            )}
            {passwordForm.formState.errors.confirmPassword && (
              <p className="text-red-400 text-sm mt-1">
                {passwordForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            variant="gradient"
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังเปลี่ยนรหัสผ่าน...
              </>
            ) : (
              <>
                <Key className="mr-2 h-4 w-4" />
                เปลี่ยนรหัสผ่าน
              </>
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
} 