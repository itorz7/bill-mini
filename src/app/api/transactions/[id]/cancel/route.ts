import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { transactions } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if transaction exists and belongs to user
    const existingTransaction = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.id, id),
          eq(transactions.userId, session.user.id)
        )
      )
      .limit(1);

    if (!existingTransaction.length) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    if (existingTransaction[0].status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only cancel pending transactions' },
        { status: 400 }
      );
    }

    // Update transaction status to cancelled
    const updatedTransaction = await db
      .update(transactions)
      .set({ 
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      })
      .where(eq(transactions.id, id))
      .returning();

    // TODO: Send Telegram notification

    return NextResponse.json({
      success: true,
      transaction: updatedTransaction[0]
    });
  } catch (error) {
    console.error('Error cancelling transaction:', error);
    return NextResponse.json(
      { error: 'Failed to cancel transaction' },
      { status: 500 }
    );
  }
}