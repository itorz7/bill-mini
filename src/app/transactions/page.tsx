"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { TransactionsList } from "@/components/transactions-list";
import { 
  Plus, 
  Search, 
  Smartphone, 
  CreditCard, 
  Loader2
} from "lucide-react";
import { createTransactionSchemaUI, type CreateTransactionDataUI } from "@/schemas";

interface Transaction {
  id: string;
  recipientNameTh: string | null;
  recipientNameEn: string | null;
  paymentType: string;
  target: string;
  amount: string;
  qrcode: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TransactionsPage() {
  const { data: session } = useSession();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { data: transactionsData, error, mutate } = useSWR<{ transactions: Transaction[] }>(
    '/api/transactions',
    fetcher,
    {
      refreshInterval: 10000, // Refresh every 10 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const transactions = transactionsData?.transactions || [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    reset,
    formState: { errors }
  } = useForm<CreateTransactionDataUI>({
    resolver: zodResolver(createTransactionSchemaUI),
    mode: 'onChange',
    defaultValues: {
      recipientNameTh: "",
      recipientNameEn: "",
      paymentType: 'MSISDN',
      target: '',
      amount: 10.00
    }
  });

  const paymentType = watch('paymentType');
  const amount = watch('amount');

  const handleCreateTransaction = async (data: CreateTransactionDataUI) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setShowCreateForm(false);
        reset();
        mutate();
      } else {
        console.error('Error creating transaction:', result.error);
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTargetChange = async (value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    setValue('target', cleanValue);
    await trigger('target');
  };

  const handleAmountChange = async (value: string) => {
    const numValue = parseFloat(value) || 0;
    setValue('amount', numValue);
    await trigger('amount');
  };

  const handleCancelTransaction = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/transactions/${transactionId}/cancel`, {
        method: 'POST'
      });
      
      if (response.ok) {
        mutate();
      }
    } catch (error) {
      console.error('Error cancelling transaction:', error);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.recipientNameTh?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.recipientNameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.target.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-black text-white p-6 pt-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Transactions
            </h1>
            <p className="text-gray-400 mt-1">
              จัดการรายการธุรกรรมและตรวจสอบสลิป
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateForm(true)}
            variant="gradient"
          >
            <Plus className="h-4 w-4 mr-2" />
            สร้างรายการใหม่
          </Button>
        </div>

        {/* Create Transaction Form */}
        {showCreateForm && (
          <Card className="mb-8 p-2 border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <GlowingEffect
              spread={40}
              glow={true}
              disabled={false}
              proximity={64}
              inactiveZone={0.01}
            />
            <div className="relative rounded-xl p-8 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-6">สร้างรายการธุรกรรมใหม่</h2>
              
              <form onSubmit={handleSubmit(handleCreateTransaction)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="recipientNameTh" className="text-white">
                      ชื่อ-นามสกุล ผู้รับเงิน (ไทย)
                    </Label>
                    <Input
                      id="recipientNameTh"
                      type="text"
                      {...register("recipientNameTh")}
                      className={`mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 ${
                        errors.recipientNameTh ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'
                      }`}
                      placeholder="กรอกชื่อ-นามสกุลผู้รับเงิน"
                    />
                    {errors.recipientNameTh && (
                      <p className="text-red-400 text-sm mt-1">{errors.recipientNameTh.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="recipientNameEn" className="text-white">
                      ชื่อ-นามสกุล ผู้รับเงิน (อังกฤษ)
                    </Label>
                    <Input
                      id="recipientNameEn"
                      type="text"
                      {...register("recipientNameEn")}
                      className={`mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 ${
                        errors.recipientNameEn ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'
                      }`}
                      placeholder="กรอกชื่อ-นามสกุลผู้รับเงิน (ภาษาอังกฤษ)"
                    />
                    {errors.recipientNameEn && (
                      <p className="text-red-400 text-sm mt-1">{errors.recipientNameEn.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div>
                    <Label className="text-white mb-3 block">
                      เลือกช่องทางการชำระ
                    </Label>
                    <RadioGroup
                      value={paymentType}
                      onValueChange={(value) => setValue('paymentType', value as 'MSISDN' | 'NATID')}
                      className="flex flex-row space-x-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="MSISDN" id="phone" />
                        <Label htmlFor="phone" className="flex items-center space-x-2 cursor-pointer">
                          <Smartphone className="h-4 w-4 text-blue-400" />
                          <span>เบอร์โทรศัพท์</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="NATID" id="national-id" />
                        <Label htmlFor="national-id" className="flex items-center space-x-2 cursor-pointer">
                          <CreditCard className="h-4 w-4 text-green-400" />
                          <span>บัตรประชาชน</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="target" className="text-white">
                      {paymentType === 'MSISDN' ? 'เบอร์โทรศัพท์' : 'เลขบัตรประชาชน'}
                    </Label>
                    <Input
                      id="target"
                      type="text"
                      value={watch('target')}
                      onChange={(e) => handleTargetChange(e.target.value)}
                      maxLength={paymentType === 'MSISDN' ? 10 : 13}
                      className={`mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 ${
                        errors.target ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'
                      }`}
                      placeholder={paymentType === 'MSISDN' ? '0812345678' : '1234567890123'}
                    />
                    {errors.target && (
                      <p className="text-red-400 text-sm mt-1">{errors.target.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="amount" className="text-white">
                      จำนวนเงิน (บาท) *
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="10.00"
                      step="0.01"
                      min="0.01"
                      max="10000000"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className={`mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 ${
                        errors.amount ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'
                      }`}
                    />
                    {errors.amount && (
                      <p className="text-red-400 text-sm mt-1">{errors.amount.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    variant="gradient"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        กำลังสร้าง...
                      </>
                    ) : (
                      'สร้างรายการ'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="border-gray-700 text-white hover:bg-gray-800"
                  >
                    ยกเลิก
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="ค้นหาด้วยชื่อหรือเบอร์โทร..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="pending">รอดำเนินการ</option>
            <option value="completed">สำเร็จ</option>
            <option value="cancelled">ยกเลิก</option>
          </select>
        </div>

        {/* Transactions List */}
        <TransactionsList
          transactions={filteredTransactions}
          onCancel={handleCancelTransaction}
        />
      </div>
    </div>
  );
}