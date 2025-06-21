import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { transactions } from '@/lib/db';
import { eq, sql, and, gte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'daily';

    // Get basic stats
    const statsQuery = await db
      .select({
        totalTransactions: sql<number>`count(*)`,
        totalAmount: sql<number>`coalesce(sum(${transactions.amount}), 0)`,
        pendingCount: sql<number>`count(*) filter (where ${transactions.status} = 'pending')`,
        completedCount: sql<number>`count(*) filter (where ${transactions.status} = 'completed')`,
        cancelledCount: sql<number>`count(*) filter (where ${transactions.status} = 'cancelled')`,
        pendingAmount: sql<number>`coalesce(sum(${transactions.amount}) filter (where ${transactions.status} = 'pending'), 0)`,
        completedAmount: sql<number>`coalesce(sum(${transactions.amount}) filter (where ${transactions.status} = 'completed'), 0)`,
        cancelledAmount: sql<number>`coalesce(sum(${transactions.amount}) filter (where ${transactions.status} = 'cancelled'), 0)`,
      })
      .from(transactions)
      .where(eq(transactions.userId, userId));

    const stats = statsQuery[0];

    // Get monthly data for the last 6 months (Thailand timezone)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await db
      .select({
        month: sql<string>`to_char(${transactions.createdAt} AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok', 'Mon YYYY')`,
        pending: sql<number>`count(*) filter (where ${transactions.status} = 'pending')`,
        completed: sql<number>`count(*) filter (where ${transactions.status} = 'completed')`,
        cancelled: sql<number>`count(*) filter (where ${transactions.status} = 'cancelled')`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.createdAt, sixMonthsAgo.toISOString())
        )
      )
      .groupBy(sql`to_char(${transactions.createdAt} AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok', 'Mon YYYY')`)
      .orderBy(sql`min(${transactions.createdAt})`);

    // Get daily data for the last 14 days (Thailand timezone)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const dailyData = await db
      .select({
        day: sql<string>`to_char(${transactions.createdAt} AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok', 'DD/MM')`,
        pending: sql<number>`count(*) filter (where ${transactions.status} = 'pending')`,
        completed: sql<number>`count(*) filter (where ${transactions.status} = 'completed')`,
        cancelled: sql<number>`count(*) filter (where ${transactions.status} = 'cancelled')`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.createdAt, fourteenDaysAgo.toISOString())
        )
      )
      .groupBy(sql`to_char(${transactions.createdAt} AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok', 'DD/MM')`)
      .orderBy(sql`min(${transactions.createdAt})`);

    // Prepare status data for pie chart
    const statusData = [
      {
        name: 'รอดำเนินการ',
        value: Number(stats.pendingCount),
        color: '#F59E0B'
      },
      {
        name: 'สำเร็จ',
        value: Number(stats.completedCount),
        color: '#10B981'
      },
      {
        name: 'ยกเลิก',
        value: Number(stats.cancelledCount),
        color: '#EF4444'
      }
    ].filter(item => item.value > 0);

    return NextResponse.json({
      totalTransactions: Number(stats.totalTransactions),
      totalAmount: Number(stats.totalAmount),
      pendingCount: Number(stats.pendingCount),
      completedCount: Number(stats.completedCount),
      cancelledCount: Number(stats.cancelledCount),
      pendingAmount: Number(stats.pendingAmount),
      completedAmount: Number(stats.completedAmount),
      cancelledAmount: Number(stats.cancelledAmount),
      monthlyData: monthlyData.map(item => ({
        month: item.month,
        pending: Number(item.pending),
        completed: Number(item.completed),
        cancelled: Number(item.cancelled)
      })),
      dailyData: dailyData.map(item => ({
        day: item.day,
        pending: Number(item.pending),
        completed: Number(item.completed),
        cancelled: Number(item.cancelled)
      })),
      statusData
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}