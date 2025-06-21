import { NextRequest, NextResponse } from 'next/server';
import { anyId } from 'promptparse/generate';
import { z } from 'zod';
import { generateQrSchema } from '@/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = generateQrSchema.parse(body);

    const payloadData = {
      type: validatedData.paymentType as 'MSISDN' | 'NATID',
      target: validatedData.target,
      amount: validatedData.amount
    };

    const payload = anyId(payloadData);

    return NextResponse.json({ 
      success: true, 
      payload,
      data: validatedData 
    });
  } catch (error) {
    console.error('Error generating QR:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid input data',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate QR code' 
      },
      { status: 500 }
    );
  }
}