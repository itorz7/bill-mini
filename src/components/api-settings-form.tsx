"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import {
  Settings,
  MessageSquare,
  Key,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  HelpCircle,
} from "lucide-react";
import { profileSchema, type ProfileData } from "@/schemas";

interface APISettingsFormProps {
  onSubmit: (data: ProfileData) => Promise<void>;
  isLoading: boolean;
  defaultValues: ProfileData;
  message?: {
    type: "success" | "error";
    text: string;
  } | null;
  validationResults: {
    telegram?: { success: boolean; message: string };
    easyslip?: { success: boolean; message: string };
  };
}

export function APISettingsForm({
  onSubmit,
  isLoading,
  defaultValues,
  message,
  validationResults,
}: APISettingsFormProps) {
  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  // Reset form when defaultValues change (when API data arrives)
  useEffect(() => {
    if (defaultValues) {
      profileForm.reset(defaultValues);
    }
  }, [defaultValues, profileForm]);

  return (
    <Card className="xl:col-span-2 p-2 border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <GlowingEffect
        spread={40}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
      />
      <div className="relative rounded-xl p-6 border border-gray-700">
        <div className="flex items-center mb-6">
          <Settings className="h-5 w-5 text-blue-400 mr-2" />
          <h2 className="text-xl font-semibold text-white">API Settings</h2>
        </div>

        {message && !message.text.includes("รหัสผ่าน") && (
          <div
            className={`mb-6 p-4 rounded-lg border flex items-center ${
              message.type === "success"
                ? "bg-green-900/20 border-green-800 text-green-400"
                : "bg-red-900/20 border-red-800 text-red-400"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4 mr-2" />
            ) : (
              <AlertCircle className="h-4 w-4 mr-2" />
            )}
            {message.text}
          </div>
        )}

        <form
          onSubmit={profileForm.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* Telegram Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">
              การตั้งค่า Telegram
            </h3>

            {/* Telegram Token */}
            <div>
              <Label
                htmlFor="telegramToken"
                className="text-white flex items-center"
              >
                <MessageSquare className="h-4 w-4 mr-2 text-blue-400" />
                Telegram Bot Token
              </Label>
              <div className="mt-2 space-y-2">
                <div className="relative">
                  <Input
                    id="telegramToken"
                    type="text"
                    {...profileForm.register("telegramToken")}
                    className="bg-gray-800 border-gray-700 text-white pr-20"
                    placeholder="กรอก Telegram Bot Token"
                  />
                </div>
                {validationResults.telegram && (
                  <div
                    className={`flex items-center text-sm ${
                      validationResults.telegram.success
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {validationResults.telegram.success ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <AlertCircle className="h-3 w-3 mr-1" />
                    )}
                    {validationResults.telegram.message}
                  </div>
                )}
              </div>
            </div>

            {/* Telegram Chat ID */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Label
                  htmlFor="telegramChatId"
                  className="text-white flex items-center"
                >
                  <MessageSquare className="h-4 w-4 mr-2 text-purple-400" />
                  Telegram Chat ID
                </Label>
                <div className="group relative">
                  <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-80 p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                    <h4 className="text-xs font-semibold text-white mb-2">
                      วิธีหา Chat ID:
                    </h4>
                    <div className="text-xs text-gray-300 space-y-1">
                      <p>
                        <strong>สำหรับคนเดียว:</strong>
                      </p>
                      <p>
                        1. แอดเพื่อน{" "}
                        <a
                          href="https://t.me/MissRose_bot"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          @MissRose_bot
                        </a>
                      </p>
                      <p>
                        2. พิมพ์{" "}
                        <code className="bg-gray-700 px-1 rounded">/id</code>
                      </p>
                      <p>
                        <strong>สำหรับกลุ่ม:</strong>
                      </p>
                      <p>1. เชิญบอท Rose เข้ากลุ่ม</p>
                      <p>
                        2. พิมพ์{" "}
                        <code className="bg-gray-700 px-1 rounded">/id</code>{" "}
                        ในกลุ่ม
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <Input
                id="telegramChatId"
                type="text"
                {...profileForm.register("telegramChatId")}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="เช่น 123456789 หรือ -1001234567890"
              />
              <p className="text-xs text-gray-400 mt-1">
                Chat ID สำหรับส่งการแจ้งเตือน (ใช้ Rose Bot เพื่อหา ID)
              </p>
            </div>
          </div>

          {/* EasySlip Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">
              การตั้งค่า EasySlip
            </h3>

            {/* EasySlip API Key */}
            <div>
              <Label
                htmlFor="easyslipApiKey"
                className="text-white flex items-center"
              >
                <Key className="h-4 w-4 mr-2 text-green-400" />
                EasySlip API Key
              </Label>
              <div className="mt-2 space-y-2">
                <div className="relative">
                  <Input
                    id="easyslipApiKey"
                    type="text"
                    {...profileForm.register("easyslipApiKey")}
                    className="bg-gray-800 border-gray-700 text-white pr-20"
                    placeholder="กรอก EasySlip API Key"
                  />
                </div>
                {validationResults.easyslip && (
                  <div
                    className={`flex items-center text-sm ${
                      validationResults.easyslip.success
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {validationResults.easyslip.success ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <AlertCircle className="h-3 w-3 mr-1" />
                    )}
                    {validationResults.easyslip.message}
                  </div>
                )}
              </div>
            </div>
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
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                บันทึกการตั้งค่า
              </>
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
} 