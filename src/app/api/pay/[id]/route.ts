import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { transactions } from "@/lib/db";
import { eq } from "drizzle-orm";

// GET /api/pay/[id] - Get transaction details for payment (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // https://nextjs.org/docs/messages/sync-dynamic-apis
  
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Transaction ID is required" },
      { status: 400 }
    );
  }

  try {
    const transaction = await db
      .select({
        id: transactions.id,
        recipientNameTh: transactions.recipientNameTh,
        recipientNameEn: transactions.recipientNameEn,
        paymentType: transactions.paymentType,
        target: transactions.target,
        amount: transactions.amount,
        qrcode: transactions.qrcode,
        status: transactions.status,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,
      })
      .from(transactions)
      .where(eq(transactions.id, id))
      .limit(1);

    if (!transaction.length) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      transaction: transaction[0],
    });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 }
    );
  }
}
