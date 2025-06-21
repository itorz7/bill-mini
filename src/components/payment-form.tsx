"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Smartphone, CreditCard, Loader2 } from "lucide-react";
import { paymentSchema, type PaymentData } from "@/schemas";

interface PaymentFormProps {
  onSubmit: (data: PaymentData) => Promise<void>;
  isLoading: boolean;
}

export function PaymentForm({ onSubmit, isLoading }: PaymentFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors }
  } = useForm<PaymentData>({
    resolver: zodResolver(paymentSchema),
    mode: 'onChange',
    defaultValues: {
      paymentType: 'MSISDN',
      target: '',
      amount: 10.00
    }
  });

  const paymentType = watch('paymentType');
  const target = watch('target');
  const amount = watch('amount');

  const handleTargetChange = async (value: string) => {
    // Remove non-numeric characters
    const cleanValue = value.replace(/[^0-9]/g, '');
    setValue('target', cleanValue);
    await trigger('target');
  };

  const handleAmountChange = async (value: string) => {
    const numValue = parseFloat(value) || 0;
    setValue('amount', numValue);
    await trigger('amount');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium text-white mb-3 block">
            เลือกช่องทางการชำระ
          </Label>
          <RadioGroup
            value={paymentType}
            onValueChange={(value) => setValue('paymentType', value as 'MSISDN' | 'NATID')}
            className="flex flex-col space-y-3"
          >
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors">
              <RadioGroupItem value="MSISDN" id="phone" />
              <Label htmlFor="phone" className="flex items-center space-x-2 cursor-pointer">
                <Smartphone className="h-4 w-4 text-blue-400" />
                <span>เบอร์โทรศัพท์</span>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors">
              <RadioGroupItem value="NATID" id="national-id" />
              <Label htmlFor="national-id" className="flex items-center space-x-2 cursor-pointer">
                <CreditCard className="h-4 w-4 text-green-400" />
                <span>บัตรประชาชน</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="target" className="text-base font-medium text-white mb-2 block">
            {paymentType === 'MSISDN' ? 'เบอร์โทรศัพท์' : 'เลขบัตรประชาชน'}
          </Label>
          <Input
            id="target"
            type="text"
            placeholder={paymentType === 'MSISDN' ? '0812345678' : '1234567890123'}
            value={target}
            onChange={(e) => handleTargetChange(e.target.value)}
            maxLength={paymentType === 'MSISDN' ? 10 : 13}
            className={`bg-gray-800 border-gray-700 text-white placeholder-gray-400 ${
              errors.target ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'
            }`}
          />
          {errors.target && (
            <p className="text-red-400 text-sm mt-1">{errors.target.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="amount" className="text-base font-medium text-white mb-2 block">
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
            className={`bg-gray-800 border-gray-700 text-white placeholder-gray-400 ${
              errors.amount ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'
            }`}
          />
          {errors.amount && (
            <p className="text-red-400 text-sm mt-1">{errors.amount.message}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        variant="gradient"
        className="w-full text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            กำลังสร้าง QR Code...
          </>
        ) : (
          'สร้าง QR Code'
        )}
      </Button>
    </form>
  );
}