import { z } from "zod";

export const profileSchema = z.object({
  telegramToken: z.string().optional(),
  telegramChatId: z.string().optional(),
  easyslipApiKey: z.string().optional(),
});

export type ProfileData = z.infer<typeof profileSchema>;