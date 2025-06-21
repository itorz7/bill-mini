import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { transactions, users } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { sendTelegramPhoto, formatSlipVerifiedMessage } from "@/lib/telegram";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkAccount, checkName } from "@/lib/bank";

type ResponseEasySlip = {
  status: number;
  data: {
    payload: string;
    transRef: string;
    date: string;
    countryCode: string;
    amount: {
      amount: number;
      local: {
        amount?: number;
        currency?: string;
      };
    };
    fee?: number;
    ref1?: string;
    ref2?: string;
    ref3?: string;
    sender: {
      bank: {
        id: string;
        name?: string;
        short?: string;
      };
      account: {
        name: {
          th?: string;
          en?: string;
        };
        bank?: {
          type: "BANKAC" | "TOKEN" | "DUMMY";
          account: string;
        };
        proxy?: {
          type: "NATID" | "MSISDN" | "EWALLETID" | "EMAIL" | "BILLERID";
          account: string;
        };
      };
    };
    receiver: {
      bank: {
        id: string;
        name?: string;
        short?: string;
      };
      account: {
        name: {
          th?: string;
          en?: string;
        };
        bank?: {
          type: "BANKAC" | "TOKEN" | "DUMMY";
          account: string;
        };
        proxy?: {
          type: "NATID" | "MSISDN" | "EWALLETID" | "EMAIL" | "BILLERID";
          account: string;
        };
      };
      merchantId?: string;
    };
  };
};

async function verifySlipWithEasySlip(file: File, userApiKey: string) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      "https://developer.easyslip.com/api/v1/verify",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userApiKey}`,
        },
        body: formData,
      }
    );

    const result = await response.json();
    return result as ResponseEasySlip;
  } catch (error) {
    console.error("EasySlip API error:", error);
    throw new Error("Failed to verify slip with EasySlip API");
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const transactionId = formData.get("transactionId") as string;
    const turnstileToken = formData.get("turnstileToken") as string;

    if (!file || !transactionId || !turnstileToken) {
      return NextResponse.json(
        { message: "กรุณากรอกข้อมูลให้ครบถ้วน", success: false },
        { status: 400 }
      );
    }

    // Verify Turnstile
    const turnstileValid = await verifyTurnstile(turnstileToken);
    if (!turnstileValid) {
      return NextResponse.json(
        { message: "การยืนยันตัวตนล้มเหลว", success: false },
        { status: 400 }
      );
    }

    // Get transaction with user info
    const transactionResult = await db
      .select({
        transaction: transactions,
        user: users,
      })
      .from(transactions)
      .innerJoin(users, eq(transactions.userId, users.id))
      .where(eq(transactions.id, transactionId))
      .limit(1);

    if (!transactionResult.length) {
      return NextResponse.json(
        { message: "ไม่พบรายการธุรกรรม", success: false },
        { status: 404 }
      );
    }

    const { transaction, user } = transactionResult[0];

    if (!user.easyslipApiKey) {
      return NextResponse.json(
        { message: "ไม่พบ API key สำหรับตรวจสอบสลิป", success: false },
        { status: 400 }
      );
    }

    if (transaction.status !== "pending") {
      return NextResponse.json(
        { message: "รายการธุรกรรมไม่อยู่ในสถานะรอดำเนินการ", success: false },
        { status: 400 }
      );
    }

    // Verify slip with EasySlip API
    const slipData = await verifySlipWithEasySlip(file, user.easyslipApiKey);

    if (slipData.status === 400 || slipData.status === 401) {
      return NextResponse.json(
        { message: "API Key ไม่ถูกต้อง โปรดติดต่อ ผู้ออกบิล", success: false },
        { status: 400 }
      );
    }

    // Check if this QR payload was already used in other transactions
    if (slipData.status === 200 && slipData.data?.payload) {
      const existingTransaction = await db
        .select()
        .from(transactions)
        .where(
          and(
            eq(transactions.recipientQrcode, slipData.data.payload),
            eq(transactions.status, "completed")
          )
        )
        .limit(1);

      if (existingTransaction.length) {
        return NextResponse.json(
          { message: "สลิปนี้ถูกใช้ไปแล้ว กรุณาใช้สลิปใหม่", success: false },
          { status: 400 }
        );
      }
    }

    // Validate slip data
    const isValid = slipData.status === 200 && slipData.data?.amount?.amount;

    if (isValid) {
      const slipAmount = slipData.data.amount.amount;
      const expectedAmount = parseFloat(transaction.amount);

      if (expectedAmount > 0 && Math.abs(slipAmount - expectedAmount) > 0.01) {
        return NextResponse.json({
          success: false,
          message: `จำนวนเงินไม่ตรงกัน คาดหวัง: ${expectedAmount} บาท แต่ได้รับ: ${slipAmount} บาท`,
        });
      }

      if (
        slipData.data.receiver.account.proxy?.type !== transaction.paymentType
      ) {
        return NextResponse.json({
          success: false,
          message:
            "ชนิดบัญชีไม่ตรงกัน คาดหวัง: " +
            transaction.paymentType +
            " แต่ได้รับ: " +
            slipData.data.receiver.account.proxy?.type,
        });
      }

      // Validate Account
      const isAccountValid = checkAccount(
        slipData.data.receiver.account.proxy.account,
        transaction.target
      );

      if (!isAccountValid) {
        return NextResponse.json({
          success: false,
          message:
            "บัญชีไม่ตรงกัน คาดหวัง: " +
            transaction.target +
            " แต่ได้รับ: " +
            slipData.data.receiver.account.proxy.account,
        });
      }

      if (
        !slipData.data.receiver.account.name.th ||
        !slipData.data.receiver.account.name.en
      ) {
        return NextResponse.json({
          success: false,
          message:
            "ชื่อไม่ตรงกัน คาดหวัง: " +
            transaction.target +
            " แต่ได้รับ: " +
            slipData.data.receiver.account.name.th,
        });
      }

      // Validate Name
      const isNameValid = checkName(
        slipData.data.receiver.account.name.th ||
          slipData.data.receiver.account.name.en,
        [transaction.recipientNameTh, transaction.recipientNameEn]
      );

      if (!isNameValid) {
        return NextResponse.json({
          success: false,
          message:
            "ชื่อไม่ตรงกัน คาดหวัง: " +
            transaction.target +
            " แต่ได้รับ: " +
            slipData.data.receiver.account.name.th,
        });
      }
    }

    // Update transaction status if valid
    if (!isValid) {
      return NextResponse.json({
        success: false,
        message: "การตรวจสอบสลิปล้มเหลว กรุณาตรวจสอบสลิปและลองใหม่",
      });
    }

    await db
      .update(transactions)
      .set({
        recipientQrcode: slipData.data.payload,
        status: "completed",
        updatedAt: new Date().toISOString(),
        data: slipData.data,
      })
      .where(eq(transactions.id, transactionId));

    // Send Telegram notification with slip photo
    try {
      if (user.telegramToken && user.telegramChatId) {
        const botToken = user.telegramToken;
        const chatId = user.telegramChatId;
        const caption = formatSlipVerifiedMessage(transaction);

        await sendTelegramPhoto({
          botToken,
          chatId,
          photo: file,
          caption,
        });
      }
    } catch (error) {
      console.error("Failed to send Telegram notification:", error);
      // Don't fail the API if Telegram notification fails
    }

    return NextResponse.json({
      success: true,
      message: "ตรวจสอบสลิปสำเร็จ รายการได้รับการยืนยันแล้ว",
    });
  } catch (error) {
    console.error("Error verifying slip:");
    console.log(error);
    return NextResponse.json(
      {
        error: "เกิดข้อผิดพลาดในการตรวจสอบสลิป",
        message: "เกิดข้อผิดพลาดในการตรวจสอบสลิป",
      },
      { status: 500 }
    );
  }
}
