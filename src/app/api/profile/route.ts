import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { validateEasySlipApiKey, validateTelegramBotToken } from "@/lib/validators";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await db
      .select({
        username: users.username,
        telegramToken: users.telegramToken,
        telegramChatId: users.telegramChatId,
        easyslipApiKey: users.easyslipApiKey,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user.length) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: user[0]
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { telegramToken, telegramChatId, easyslipApiKey, currentPassword, newPassword } = body;

    // Get current values from database to check if changed
    const currentUser = await db
      .select({
        telegramToken: users.telegramToken,
        easyslipApiKey: users.easyslipApiKey,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser.length) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลผู้ใช้" },
        { status: 404 }
      );
    }

    const current = currentUser[0];

    // Validate EasySlip API key if changed
    if (easyslipApiKey && easyslipApiKey !== current.easyslipApiKey) {
      const validation = await validateEasySlipApiKey(easyslipApiKey);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }
    }

    // Validate Telegram bot token if changed
    if (telegramToken && telegramToken !== current.telegramToken) {
      const validation = await validateTelegramBotToken(telegramToken);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }
    }

    // If password change is requested, verify current password
    if (newPassword && currentPassword) {
      const user = await db
        .select({ password: users.password })
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1);

      if (!user.length) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user[0].password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      
      await db
        .update(users)
        .set({
          password: hashedNewPassword,
          telegramToken: telegramToken || null,
          telegramChatId: telegramChatId || null,
          easyslipApiKey: easyslipApiKey || null,
          updatedAt: new Date().toISOString()
        })
        .where(eq(users.id, session.user.id));
    } else {
      // Update only API keys
      await db
        .update(users)
        .set({
          telegramToken: telegramToken || null,
          telegramChatId: telegramChatId || null,
          easyslipApiKey: easyslipApiKey || null,
          updatedAt: new Date().toISOString()
        })
        .where(eq(users.id, session.user.id));
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully"
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}