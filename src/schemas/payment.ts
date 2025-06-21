import { z } from "zod";

export const paymentSchema = z.object({
  paymentType: z.enum(['MSISDN', 'NATID']),
  target: z.string()
    .min(10, "เบอร์โทรศัพท์ต้องมี 10 หลัก หรือ เลขบัตรประชาชนต้องมี 13 หลัก")
    .max(13, "เบอร์โทรศัพท์ต้องมี 10 หลัก หรือ เลขบัตรประชาชนต้องมี 13 หลัก")
    .regex(/^\d+$/, "กรุณากรอกเฉพาะตัวเลข"),
  amount: z.number().min(0.01, "จำนวนเงินต้องมากกว่า 0").max(10000000, "จำนวนเงินต้องไม่เกิน 10,000,000")
});

export type PaymentData = z.infer<typeof paymentSchema>;

export const generateQrSchema = z.object({
  paymentType: z.enum(['MSISDN', 'NATID']),
  target: z.string()
    .min(10, "Phone number must be 10 digits or National ID must be 13 digits")
    .max(13, "Phone number must be 10 digits or National ID must be 13 digits")
    .regex(/^\d+$/, "Only numbers allowed"),
  amount: z.number().min(0.01, "Amount must be greater than 0").max(10000000)
});

export type GenerateQrData = z.infer<typeof generateQrSchema>;