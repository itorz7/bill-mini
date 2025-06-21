"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { ProfileHeader } from "@/components/profile-header";
import { PasswordChangeForm } from "@/components/password-change-form";
import { APISettingsForm } from "@/components/api-settings-form";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [validationResults, setValidationResults] = useState<{
    telegram?: { success: boolean; message: string };
    easyslip?: { success: boolean; message: string };
  }>({});
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [userInfo, setUserInfo] = useState<{
    createdAt?: string;
    updatedAt?: string;
  }>({});
  const [dashboardStats, setDashboardStats] = useState<{
    totalTransactions: number;
    totalAmount: number;
    completedCount: number;
    successRate: number;
  }>({
    totalTransactions: 0,
    totalAmount: 0,
    completedCount: 0,
    successRate: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const {
    data: profileData,
    error: profileError,
    mutate: mutateProfile,
  } = useSWR("/api/profile", fetcher);

  const { data: statsData, error: statsError } = useSWR(
    "/api/dashboard/stats",
    fetcher
  );

  useEffect(() => {
    if (profileData?.success) {
      setUserInfo({
        createdAt: profileData.profile.createdAt,
        updatedAt: profileData.profile.updatedAt,
      });
    }
  }, [profileData]);

  useEffect(() => {
    if (statsData) {
      const successRate =
        statsData.totalTransactions > 0
          ? Math.round(
              (statsData.completedCount / statsData.totalTransactions) * 100
            )
          : 0;
      setDashboardStats({
        totalTransactions: statsData.totalTransactions,
        totalAmount: statsData.totalAmount,
        completedCount: statsData.completedCount,
        successRate,
      });
    }
  }, [statsData]);

  const handleProfileSubmit = async (data: {
    telegramToken?: string;
    telegramChatId?: string;
    easyslipApiKey?: string;
  }) => {
    setIsLoading(true);
    setMessage(null);
    setValidationResults({});

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "บันทึกข้อมูลสำเร็จ" });
        
        const newValidationResults: typeof validationResults = {};
        if (data.telegramToken) {
          newValidationResults.telegram = { success: true, message: "Telegram Bot Token ใช้งานได้" };
        }
        if (data.easyslipApiKey) {
          newValidationResults.easyslip = { success: true, message: "EasySlip API Key ใช้งานได้" };
        }
        setValidationResults(newValidationResults);
        
        mutateProfile();
      } else {
        setMessage({ type: "error", text: result.error || "เกิดข้อผิดพลาด" });
        
        const errorMessage = result.error || "เกิดข้อผิดพลาด";
        const newValidationResults: typeof validationResults = {};
        
        if (errorMessage.includes("API Key") || errorMessage.includes("EasySlip")) {
          newValidationResults.easyslip = { success: false, message: errorMessage };
        }
        if (errorMessage.includes("Bot Token") || errorMessage.includes("Telegram")) {
          newValidationResults.telegram = { success: false, message: errorMessage };
        }
        
        setValidationResults(newValidationResults);
      }
    } catch (error) {
      setMessage({ type: "error", text: "เกิดข้อผิดพลาดในการเชื่อมต่อ" });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    setIsPasswordLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "เปลี่ยนรหัสผ่านสำเร็จ" });
        mutateProfile();
      } else {
        setMessage({ type: "error", text: result.error || "เกิดข้อผิดพลาด" });
      }
    } catch (error: unknown) {
      setMessage({ type: "error", text: "เกิดข้อผิดพลาดในการเชื่อมต่อ" });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const profileDefaultValues = useMemo(() => ({
    telegramToken: profileData?.profile?.telegramToken || "",
    telegramChatId: profileData?.profile?.telegramChatId || "",
    easyslipApiKey: profileData?.profile?.easyslipApiKey || "",
  }), [profileData]);

  return (
    <div className=" bg-black text-white p-6 pt-2">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Profile Settings
          </h1>
          <p className="text-gray-400 mt-1">
            จัดการการตั้งค่าบัญชีและ API keys ของคุณ
          </p>
        </div>

        {/* Profile Header */}
        <ProfileHeader
          username={session?.user?.username}
          userInfo={userInfo}
          dashboardStats={dashboardStats}
        />

        {/* Settings Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Password Change Form */}
          <PasswordChangeForm
            onSubmit={handlePasswordSubmit}
            isLoading={isPasswordLoading}
            message={message}
            onMutate={mutateProfile}
          />

          {/* API Settings Form */}
          <APISettingsForm
            onSubmit={handleProfileSubmit}
            isLoading={isLoading}
            defaultValues={profileDefaultValues}
            message={message}
            validationResults={validationResults}
          />
        </div>
      </div>
    </div>
  );
}
