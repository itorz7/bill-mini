import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { db } from '@/lib/db';
import { transactions, users } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import { anyId } from 'promptparse/generate';
import { sendTelegramNotification, formatNewTransactionMessage } from '@/lib/telegram';
import { createTransactionSchema } from '@/schemas';

// GET /api/transactions - Get user's transactions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, session.user.id))
      .orderBy(desc(transactions.createdAt));

    return NextResponse.json({ 
      success: true, 
      transactions: userTransactions 
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Create new transaction
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createTransactionSchema.parse(body);

    // Generate QR payload with proper type casting
    const payloadData = {
      type: validatedData.paymentType as 'MSISDN' | 'NATID',
      target: validatedData.target,
      amount: validatedData.amount
    };

    const qrcode = anyId(payloadData);

    // Create transaction
    const newTransaction = await db
      .insert(transactions)
      .values({
        userId: session.user.id,
        recipientNameTh: validatedData.recipientNameTh,
        recipientNameEn: validatedData.recipientNameEn,
        paymentType: validatedData.paymentType,
        target: validatedData.target,
        amount: validatedData.amount.toString(),
        qrcode,
        status: 'pending'
      })
      .returning();

    // Send Telegram notification
    try {
      const user = await db
        .select({ 
          telegramToken: users.telegramToken,
          telegramChatId: users.telegramChatId
        })
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1);

      if (user.length && user[0].telegramToken && user[0].telegramChatId) {
        const botToken = user[0].telegramToken;
        const chatId = user[0].telegramChatId;
        const message = formatNewTransactionMessage(newTransaction[0]);
        
        await sendTelegramNotification({
          botToken,
          chatId,
          message
        });
      }
    } catch (error) {
      console.error('Failed to send Telegram notification:', error);
      // Don't fail the API if Telegram notification fails
    }

    return NextResponse.json({
      success: true,
      transaction: newTransaction[0]
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid input data',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}