"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  CreditCard, 
  Calendar, 
  User, 
  Phone, 
  IdCard,
  CheckCircle,
  XCircle,
  Clock,
  QrCode,
  AlertTriangle,
  ExternalLink
} from "lucide-react";

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

interface TransactionsListProps {
  transactions: Transaction[];
  onCancel: (transactionId: string) => void;
}

export function TransactionsList({ 
  transactions, 
  onCancel
}: TransactionsListProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [transactionToCancel, setTransactionToCancel] = useState<string | null>(null);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = transactions.slice(startIndex, endIndex);

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    if (num === 0) return "ไม่กำหนดจำนวนเงิน";
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <Badge className="bg-green-900/20 text-green-400 border-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            สำเร็จ
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-red-900/20 text-red-400 border-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            ยกเลิก
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-900/20 text-yellow-400 border-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            รอดำเนินการ
          </Badge>
        );
    }
  };

  const handleCancelClick = (transactionId: string) => {
    setTransactionToCancel(transactionId);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    if (transactionToCancel) {
      onCancel(transactionToCancel);
      setShowCancelModal(false);
      setTransactionToCancel(null);
    }
  };

  const handleCancelModalClose = () => {
    setShowCancelModal(false);
    setTransactionToCancel(null);
  };

  const handlePaymentClick = (transactionId: string) => {
    window.open(`/pay/${transactionId}`, '_blank');
  };

  if (transactions.length === 0) {
    return (
      <Card className="bg-gray-900/50 border-gray-800 p-8 text-center">
        <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">ยังไม่มีรายการธุรกรรม</h3>
        <p className="text-gray-400">เริ่มต้นสร้างรายการธุรกรรมแรกของคุณ</p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Card className="bg-gray-900/50 border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      ลูกค้า
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      ช่องทาง
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      จำนวนเงิน
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      สถานะ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      วันที่สร้าง
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {currentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-10 w-10 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-white">
                              {transaction.recipientNameTh || 'ไม่ระบุชื่อ'}
                            </div>
                            <div className="text-sm font-medium text-white">
                              {transaction.recipientNameEn || 'ไม่ระบุชื่อ'}
                            </div>
                            <div className="text-sm text-gray-400 flex items-center">
                              {transaction.paymentType === 'MSISDN' ? (
                                <Phone className="h-3 w-3 mr-1" />
                              ) : (
                                <IdCard className="h-3 w-3 mr-1" />
                              )}
                              {formatTarget(transaction.target, transaction.paymentType)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-300">
                          {transaction.paymentType === 'MSISDN' ? 'เบอร์โทรศัพท์' : 'บัตรประชาชน'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-green-400">
                          {formatAmount(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-400">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(transaction.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          {transaction.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handlePaymentClick(transaction.id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                จ่ายเงิน
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelClick(transaction.id)}
                                className="border-red-700 text-red-400 hover:bg-red-900/20"
                              >
                                ยกเลิก
                              </Button>
                            </>
                          )}
                          {transaction.status === 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePaymentClick(transaction.id)}
                              className="border-green-700 text-green-400 hover:bg-green-900/20"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              ดูรายการ
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {currentTransactions.map((transaction) => (
            <Card key={transaction.id} className="bg-gray-900/50 border-gray-800 p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="h-10 w-10 text-gray-400 mr-2" />
                    <div>
                      <div className="font-medium text-white">
                        {transaction.recipientNameTh || 'ไม่ระบุชื่อ'}
                      </div>
                      <div className="font-medium text-white">
                        {transaction.recipientNameEn || 'ไม่ระบุชื่อ'}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(transaction.status)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-400">
                    {transaction.paymentType === 'MSISDN' ? (
                      <Phone className="h-3 w-3 mr-1" />
                    ) : (
                      <IdCard className="h-3 w-3 mr-1" />
                    )}
                    {formatTarget(transaction.target, transaction.paymentType)}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-400">
                      {formatAmount(transaction.amount)}
                    </span>
                    <div className="flex items-center text-xs text-gray-400">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(transaction.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  {transaction.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handlePaymentClick(transaction.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        จ่ายเงิน
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelClick(transaction.id)}
                        className="border-red-700 text-red-400 hover:bg-red-900/20"
                      >
                        ยกเลิก
                      </Button>
                    </>
                  )}
                  {transaction.status === 'completed' && (
                    <Button
                      size="sm"
                      onClick={() => handlePaymentClick(transaction.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      ดูรายการ
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              ก่อนหน้า
            </Button>
            
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={
                    currentPage === page
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "border-gray-700 text-gray-300 hover:bg-gray-800"
                  }
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              ถัดไป
            </Button>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <Dialog open={showCancelModal} onOpenChange={handleCancelModalClose}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-400">
              <AlertTriangle className="h-5 w-5 mr-2" />
              ยืนยันการยกเลิก
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              คุณแน่ใจหรือไม่ที่ต้องการยกเลิกรายการธุรกรรมนี้? การดำเนินการนี้ไม่สามารถยกเลิกได้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelModalClose}
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              ไม่ยกเลิก
            </Button>
            <Button
              onClick={handleConfirmCancel}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              ยืนยันยกเลิก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}