"use client";

import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { QrCodeGenerator } from "@/components/qr-generator";
import { Loader2, CheckCircle, XCircle, Clock, ArrowRight } from "lucide-react";

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

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) {
    throw new Error('Failed to fetch transaction');
  }
  return res.json();
});

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  
  const { data, error, isLoading } = useSWR<{ transaction: Transaction }>(
    params.id ? `/api/pay/${params.id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const transaction = data?.transaction;

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(num);
  };

  const formatTarget = (target: string, type: string) => {
    if (type === 'MSISDN') {
      return target.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    } else {
      return target.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, '$1-$2-$3-$4-$5');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <div className="flex items-center text-green-400">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>ชำระเรียบร้อยแล้ว</span>
          </div>
        );
      case 'cancelled':
        return (
          <div className="flex items-center text-red-400">
            <XCircle className="h-5 w-5 mr-2" />
            <span>รายการถูกยกเลิก</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-yellow-400">
            <Clock className="h-5 w-5 mr-2" />
            <span>รอการชำระเงิน</span>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <span className="text-lg">กำลังโหลด...</span>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="bg-gray-900/50 border-gray-800 p-8 text-center max-w-md">
          <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">ไม่พบรายการธุรกรรม</h2>
          <p className="text-gray-400">
            {error?.message || 'รายการที่คุณต้องการไม่พบในระบบ'}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            ชำระเงินผ่าน PromptPay
          </h1>
          <p className="text-gray-300">
            รายการธุรกรรม #{transaction.id.slice(0, 8)}
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="p-2 border-gray-800 bg-gray-900/50 backdrop-blur-sm mb-6">
            <GlowingEffect
              spread={40}
              glow={true}
              disabled={false}
              proximity={64}
              inactiveZone={0.01}
            />
            <div className="relative rounded-xl p-8 border border-gray-700">
              {/* Status */}
              <div className="text-center mb-6">
                {getStatusBadge(transaction.status)}
              </div>

              {/* Transaction Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div>
                    <span className="text-gray-400 text-sm">ผู้รับเงิน:</span>
                    <p className="text-white font-medium">
                      {transaction.recipientNameTh || 'ไม่ระบุ'}
                    </p>
                    {transaction.recipientNameEn && (
                      <p className="text-gray-300 text-sm">{transaction.recipientNameEn}</p>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">
                      {transaction.paymentType === 'MSISDN' ? 'เบอร์โทรศัพท์:' : 'เลขบัตรประชาชน:'}
                    </span>
                    <p className="text-white font-medium">
                      {formatTarget(transaction.target, transaction.paymentType)}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-gray-400 text-sm">จำนวนเงิน:</span>
                    <p className="text-green-400 font-bold text-2xl">
                      {formatAmount(transaction.amount)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">วันที่สร้าง:</span>
                    <p className="text-white">
                      {new Date(transaction.createdAt).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              {transaction.status === 'pending' && (
                <div className="text-center">
                  <QrCodeGenerator
                    payload={transaction.qrcode}
                    amount={parseFloat(transaction.amount)}
                    paymentType={transaction.paymentType as 'MSISDN' | 'NATID'}
                    target={transaction.target}
                    showResetButton={false}
                  />
                  
                  <div className="mt-6">
                    <Button
                      onClick={() => router.push(`/pay/${transaction.id}/upload`)}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                    >
                      ชำระเงินเรียบร้อย
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {transaction.status === 'completed' && (
                <div className="text-center">
                  <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <p className="text-green-400 text-lg font-semibold">รายการนี้ชำระเรียบร้อยแล้ว</p>
                </div>
              )}

              {transaction.status === 'cancelled' && (
                <div className="text-center">
                  <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                  <p className="text-red-400 text-lg font-semibold">รายการนี้ถูกยกเลิกแล้ว</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 