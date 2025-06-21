import { z } from "zod";

// Base auth schema for sign in (Thai messages)
export const signInSchema = z.object({
  username: z.string().min(3, "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร"),
  password: z
    .string()
    .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
    .regex(/[0-9]/, "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว"
    ),
});

export type SignInData = z.infer<typeof signInSchema>;


// Sign up schema with confirmPassword (Thai messages)
export const signUpSchema = z
  .object({
    username: z
      .string()
      .min(3, "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร")
      .max(50, "ชื่อผู้ใช้ต้องไม่เกิน 50 ตัวอักษร"),
    password: z
      .string()
      .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
      .regex(/[0-9]/, "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  })

export type SignUpData = z.infer<typeof signUpSchema>;

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "กรุณากรอกรหัสผ่านปัจจุบัน"),
    newPassword: z
      .string()
      .min(8, "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร")
      .regex(/[0-9]/, "รหัสผ่านใหม่ต้องมีตัวเลขอย่างน้อย 1 ตัว")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "รหัสผ่านใหม่ต้องมีอักขระพิเศษอย่างน้อย 1 ตัว"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "รหัสผ่านใหม่ไม่ตรงกัน",
    path: ["confirmPassword"],
  });

export type PasswordData = z.infer<typeof passwordSchema>;
