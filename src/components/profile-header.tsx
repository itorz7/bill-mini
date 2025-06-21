"use client";

import { Card } from "@/components/ui/card";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
  username?: string;
  userInfo: {
    createdAt?: string;
    updatedAt?: string;
  };
  dashboardStats: {
    totalTransactions: number;
    totalAmount: number;
    completedCount: number;
    successRate: number;
  };
}

export function ProfileHeader({ username, userInfo, dashboardStats }: ProfileHeaderProps) {
  return (
    <Card className="mb-8 p-2 border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden">
      <GlowingEffect
        spread={40}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
      />
      <div className="relative rounded-xl p-6 border border-gray-700">
        {/* Profile Header */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">
              {username}
            </h3>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">
                  ออนไลน์
                </span>
              </div>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400 text-sm">Standard Member</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {dashboardStats.completedCount}
            </div>
            <div className="text-xs text-gray-400">ธุรกรรมสำเร็จ</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {dashboardStats.totalTransactions}
            </div>
            <div className="text-xs text-gray-400">ธุรกรรมทั้งหมด</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              ฿{dashboardStats.totalAmount.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">ยอดรวม</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-orange-400 mb-1">
              {dashboardStats.successRate}%
            </div>
            <div className="text-xs text-gray-400">อัตราสำเร็จ</div>
          </div>
        </div>

        {/* Account Details */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wider">
            รายละเอียดบัญชี
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">ชื่อผู้ใช้</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-blue-400 hover:text-blue-300"
                >
                  แก้ไข
                </Button>
              </div>
              <p className="text-white font-medium">
                {username}
              </p>
            </div>

            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">ประเภทบัญชี</span>
                <div className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                  Standard
                </div>
              </div>
              <p className="text-white font-medium">ส่วนบุคคล</p>
            </div>

            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">วันที่สมัคร</span>
              </div>
              <p className="text-white font-medium">
                {userInfo.createdAt
                  ? new Date(userInfo.createdAt).toLocaleDateString(
                      "th-TH",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )
                  : "ไม่ระบุ"}
              </p>
            </div>

            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">
                  เข้าใช้ครั้งล่าสุด
                </span>
              </div>
              <p className="text-white font-medium">
                {userInfo.updatedAt
                  ? new Date(userInfo.updatedAt).toLocaleDateString(
                      "th-TH",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )
                  : "ไม่ระบุ"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
} 