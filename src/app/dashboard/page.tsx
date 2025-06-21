"use client";

import { useSession } from "next-auth/react";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { 
  Clock, 
  CheckCircle, 
  XCircle,
  BarChart3,
  RefreshCw
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardStats {
  totalTransactions: number;
  totalAmount: number;
  pendingCount: number;
  completedCount: number;
  cancelledCount: number;
  pendingAmount: number;
  completedAmount: number;
  cancelledAmount: number;
  monthlyData: Array<{
    month: string;
    pending: number;
    completed: number;
    cancelled: number;
  }>;
  dailyData: Array<{
    day: string;
    pending: number;
    completed: number;
    cancelled: number;
  }>;
  statusData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const { data: session } = useSession();
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'monthly'>('daily');
  
  const { data: stats, error, isLoading, mutate } = useSWR<DashboardStats>(
    `/api/dashboard/stats?period=${chartPeriod}`,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  if (isLoading) {
    return (
      <div className=" bg-black flex items-center justify-center">
        <div className="flex items-center space-x-2 text-white">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>กำลังโหลดข้อมูล...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className=" bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-gray-400 mb-4">ไม่สามารถโหลดข้อมูลได้</p>
          <Button onClick={() => mutate()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            ลองใหม่
          </Button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount);
  };

  return (
    <div className=" bg-gradient-to-br from-black via-gray-900 to-black text-white p-6 pt-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-400 mt-1">
              ยินดีต้อนรับ, {session?.user?.username}
            </p>
          </div>
          <Button 
            onClick={() => mutate()}
            variant="outline"
            className="border-gray-700 text-white hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            รีเฟรช
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Amount KPIs */}
          <Card className="relative p-2 border-gray-800 bg-gray-900/50 backdrop-blur-sm hover:bg-gray-900/70 transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs">ยอดเงินจ่ายแล้ว</p>
                  <p className="text-lg font-bold text-green-400">
                    {formatCurrency(stats?.completedAmount || 0)}
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="relative p-2 border-gray-800 bg-gray-900/50 backdrop-blur-sm hover:bg-gray-900/70 transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-amber-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs">ยอดเงินรอชำระ</p>
                  <p className="text-lg font-bold text-yellow-400">
                    {formatCurrency(stats?.pendingAmount || 0)}
                  </p>
                </div>
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </Card>

          <Card className="relative p-2 border-gray-800 bg-gray-900/50 backdrop-blur-sm hover:bg-gray-900/70 transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-pink-500/10 to-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs">ยอดเงินยกเลิก</p>
                  <p className="text-lg font-bold text-red-400">
                    {formatCurrency(stats?.cancelledAmount || 0)}
                  </p>
                </div>
                <XCircle className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </Card>

          {/* Count KPIs */}
          <Card className="relative p-2 border-gray-800 bg-gray-900/50 backdrop-blur-sm hover:bg-gray-900/70 transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-lime-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs">จำนวนจ่ายแล้ว</p>
                  <p className="text-xl font-bold text-green-400">
                    {stats?.completedCount || 0}
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="relative p-2 border-gray-800 bg-gray-900/50 backdrop-blur-sm hover:bg-gray-900/70 transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-amber-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs">จำนวนรอชำระ</p>
                  <p className="text-xl font-bold text-yellow-400">
                    {stats?.pendingCount || 0}
                  </p>
                </div>
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </Card>

          <Card className="relative p-2 border-gray-800 bg-gray-900/50 backdrop-blur-sm hover:bg-gray-900/70 transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-pink-500/10 to-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs">จำนวนยกเลิก</p>
                  <p className="text-xl font-bold text-red-400">
                    {stats?.cancelledCount || 0}
                  </p>
                </div>
                <XCircle className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <Card className="relative p-2 border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-lg" />
            <div className="relative p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 text-blue-400 mr-2" />
                  <h3 className="text-lg font-semibold text-white">
                    สถิติ{chartPeriod === 'monthly' ? 'รายเดือน' : 'รายวัน'}
                  </h3>
                </div>
                <Select value={chartPeriod} onValueChange={(value: 'daily' | 'monthly') => setChartPeriod(value)}>
                  <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="monthly" className="text-white hover:bg-gray-700">รายเดือน</SelectItem>
                    <SelectItem value="daily" className="text-white hover:bg-gray-700">รายวัน</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartPeriod === 'monthly' ? (stats?.monthlyData || []) : (stats?.dailyData || [])}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey={chartPeriod === 'monthly' ? 'month' : 'day'} stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#FFFFFF'
                    }} 
                  />
                  <Bar dataKey="pending" fill="#F59E0B" name="รอดำเนินการ" />
                  <Bar dataKey="completed" fill="#10B981" name="สำเร็จ" />
                  <Bar dataKey="cancelled" fill="#EF4444" name="ยกเลิก" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Pie Chart */}
          <Card className="relative p-2 border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-rose-500/5 rounded-lg" />
            <div className="relative p-4">
              <div className="flex items-center mb-4">
                <BarChart3 className="h-5 w-5 text-purple-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">สัดส่วนสถานะ</h3>
              </div>
              {stats?.statusData && stats.statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value, percent }) => 
                        `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                      }
                      labelLine={false}
                    >
                      {stats.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [value, name]}
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#FFFFFF'
                      }}
                      labelStyle={{ color: '#FFFFFF' }}
                      itemStyle={{ color: '#FFFFFF' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>ไม่มีข้อมูลแสดง</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}