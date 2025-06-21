"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Turnstile } from "@marsidev/react-turnstile";
import { useDropzone } from "react-dropzone";
import { 
  Upload, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  FileImage,
  X,
  ArrowLeft
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

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) {
    throw new Error('Failed to fetch transaction');
  }
  return res.json();
});

export default function UploadSlipPage() {
  const params = useParams();
  const router = useRouter();
  
  const { data, error: fetchError, isLoading, mutate } = useSWR<{ transaction: Transaction }>(
    params.id ? `/api/pay/${params.id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const transaction = data?.transaction;
  
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showTurnstile, setShowTurnstile] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
    data?: unknown;
  } | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setShowTurnstile(true);
      }
    }
  });

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(num);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowTurnstile(false);
    setTurnstileToken('');
  };

  const handleVerifySlip = async () => {
    if (!selectedFile || !turnstileToken || !transaction) return;

    setVerifying(true);
    setError(null);
    setVerificationResult(null); // Reset previous result

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('transactionId', transaction.id);
      formData.append('turnstileToken', turnstileToken);

      const response = await fetch('/api/verify-slip', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      setVerificationResult(result);

      if (result.success) {
        mutate();
        router.push(`/pay/${transaction.id}`);
      }
      
      setVerificationResult(result);
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการตรวจสอบสลิป กรุณาลองใหม่อีกครั้ง');
      console.error('Error verifying slip:', error);
    } finally {
      setVerifying(false);
    }
  };

  const handleSelectNewFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowTurnstile(false);
    setTurnstileToken('');
    setVerificationResult(null);
    setError(null);
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

  if (fetchError || !transaction) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="bg-gray-900/50 border-gray-800 p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-gray-400 mb-4">
            {fetchError?.message || 'ไม่สามารถโหลดข้อมูลธุรกรรมได้'}
          </p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            กลับ
          </Button>
        </Card>
      </div>
    );
  }

  if (transaction.status === 'completed') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="bg-gray-900/50 border-gray-800 p-8 text-center max-w-md">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">ชำระเรียบร้อยแล้ว</h2>
          <p className="text-gray-400 mb-4">รายการธุรกรรมนี้ได้รับการยืนยันการชำระเงินแล้ว</p>
          <Button onClick={() => router.push(`/pay/${transaction.id}`)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            กลับหน้ารายการ
          </Button>
        </Card>
      </div>
    );
  }

  if (transaction.status === 'cancelled') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="bg-gray-900/50 border-gray-800 p-8 text-center max-w-md">
          <X className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">รายการถูกยกเลิก</h2>
          <p className="text-gray-400 mb-4">รายการธุรกรรมนี้ถูกยกเลิกแล้ว ไม่สามารถอัพโหลดสลิปได้</p>
          <Button onClick={() => router.push(`/pay/${transaction.id}`)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            กลับหน้ารายการ
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Button 
            onClick={() => router.push(`/pay/${transaction.id}`)}
            variant="ghost" 
            className="mb-4 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            กลับหน้าชำระเงิน
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            อัพโหลดสลิปโอนเงิน
          </h1>
          <p className="text-gray-300">
            รายการธุรกรรม #{transaction.id.slice(0, 8)} • {formatAmount(transaction.amount)}
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="p-2 border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <GlowingEffect
              spread={40}
              glow={true}
              disabled={false}
              proximity={64}
              inactiveZone={0.01}
            />
            <div className="relative rounded-xl p-8 border border-gray-700">
              
              {/* Error Message - แสดงข้างบน */}
              {error && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <p className="text-red-400">{error}</p>
                  </div>
                  {selectedFile && (
                    <Button
                      onClick={handleSelectNewFile}
                      size="sm"
                      variant="outline"
                      className="border-red-700 text-red-400 hover:bg-red-900/20"
                    >
                      เลือกรูปใหม่
                    </Button>
                  )}
                </div>
              )}

              {/* Verification Result - แสดงข้างบน */}
              {verificationResult && !verificationResult.success && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <div>
                      <p className="text-red-400 font-medium">
                        {verificationResult.message}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleSelectNewFile}
                    size="sm"
                    variant="outline"
                    className="border-red-700 text-red-400 hover:bg-red-900/20"
                  >
                    เลือกรูปใหม่
                  </Button>
                </div>
              )}

              {/* Success Result */}
              {verificationResult && verificationResult.success && (
                <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 flex items-center mb-6">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  <div>
                    <p className="text-green-400 font-medium">
                      {verificationResult.message}
                    </p>
                    <p className="text-green-300 text-sm mt-1">
                      รายการได้รับการยืนยันเรียบร้อยแล้ว
                    </p>
                  </div>
                </div>
              )}

              {/* File Upload */}
              {!selectedFile && (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-white font-medium mb-2">
                    {isDragActive ? 'วางไฟล์ที่นี่...' : 'เลือกไฟล์สลิปโอนเงิน'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    รองรับไฟล์ .png, .jpg, .jpeg เท่านั้น
                  </p>
                </div>
              )}

              {/* File Preview */}
              {selectedFile && previewUrl && !verificationResult?.success && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="relative inline-block">
                      <img
                        src={previewUrl}
                        alt="Slip preview"
                        className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg"
                      />
                      <Button
                        onClick={handleFileRemove}
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">
                      {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>

                  {/* Turnstile */}
                  {showTurnstile && !verificationResult && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <Label className="text-white font-medium">
                          ยืนยันตัวตนเพื่อดำเนินการต่อ
                        </Label>
                      </div>
                      <div className="flex justify-center">
                        <Turnstile
                          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                          onSuccess={setTurnstileToken}
                          onError={() => setTurnstileToken('')}
                        />
                      </div>
                    </div>
                  )}

                  {/* Verify Button */}
                  {turnstileToken && !verificationResult && (
                    <div className="text-center">
                      <Button
                        onClick={handleVerifySlip}
                        disabled={verifying}
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                      >
                        {verifying ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            กำลังตรวจสอบ...
                          </>
                        ) : (
                          'ตรวจสอบสลิป'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 