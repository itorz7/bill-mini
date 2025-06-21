import { z } from "zod";

export const createTransactionSchema = z.object({
  recipientNameTh: z.string().min(1, "ชื่อผู้รับเงิน (ไทย) จำเป็น"),
  recipientNameEn: z.string().min(1, "ชื่อผู้รับเงิน (อังกฤษ) จำเป็น"),
  paymentType: z.enum(['MSISDN', 'NATID']),
  target: z.string()
    .min(10, "เบอร์โทรศัพท์ต้องมี 10 หลัก หรือ เลขบัตรประชาชนต้องมี 13 หลัก")
    .max(13, "เบอร์โทรศัพท์ต้องมี 10 หลัก หรือ เลขบัตรประชาชนต้องมี 13 หลัก")
    .regex(/^\d+$/, "กรุณากรอกเฉพาะตัวเลข"),
  amount: z.number().min(0.01, "จำนวนเงินต้องมากกว่า 0").max(10000000)
});

export type CreateTransactionData = z.infer<typeof createTransactionSchema>;

// Alternative schema with more flexible validation for UI
export const createTransactionSchemaUI = z.object({
  recipientNameTh: z.string().min(1, "กรุณากรอกชื่อ-นามสกุลผู้รับเงิน"),
  recipientNameEn: z.string().min(1, "กรุณากรอกชื่อ-นามสกุลผู้รับเงิน (ภาษาอังกฤษ)"),
  paymentType: z.enum(['MSISDN', 'NATID']),
  target: z.string()
    .min(1, "กรุณากรอกข้อมูล")
    .refine((val) => {
      if (!val) return false;
      const cleanVal = val.replace(/[^0-9]/g, '');
      return /^\d+$/.test(cleanVal);
    }, "กรุณากรอกเฉพาะตัวเลข")
    .refine((val) => {
      const cleanVal = val.replace(/[^0-9]/g, '');
      return cleanVal.length === 10 || cleanVal.length === 13;
    }, "เบอร์โทรศัพท์ต้องมี 10 หลัก หรือ เลขบัตรประชาชนต้องมี 13 หลัก"),
  amount: z.number().min(0.01, "จำนวนเงินต้องมากกว่า 0").max(10000000, "จำนวนเงินต้องไม่เกิน 10,000,000")
});

export type CreateTransactionDataUI = z.infer<typeof createTransactionSchemaUI>;