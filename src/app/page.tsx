"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { QrCodeGenerator } from "@/components/qr-generator";
import { PaymentForm } from "@/components/payment-form";
import { paymentSchema, type PaymentData } from "@/schemas";

export default function Home() {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [qrcode, setqrcode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: PaymentData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        const result = await response.json();
        setqrcode(result.payload);
        setPaymentData(data);
      }
    } catch (error) {
      console.error('Error generating QR:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPaymentData(null);
    setqrcode('');
  };

  return (
    <div className="bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            PromptPay Generator
          </h1>
          <p className="text-xl text-gray-300">
            สร้าง QR Code สำหรับรับเงินผ่าน PromptPay
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="p-2 border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <GlowingEffect
              spread={40}
              glow={true}
              disabled={false}
              proximity={64}
              inactiveZone={0.01}
            />
            <div className="relative rounded-xl p-8 border border-gray-700">
              {!paymentData ? (
                <PaymentForm onSubmit={handleSubmit} isLoading={isLoading} />
              ) : (
                <QrCodeGenerator
                  payload={qrcode}
                  amount={paymentData.amount}
                  paymentType={paymentData.paymentType}
                  target={paymentData.target}
                  onReset={handleReset}
                />
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
