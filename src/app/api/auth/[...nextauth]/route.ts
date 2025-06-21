import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { verifyTurnstile } from "@/lib/turnstile";
import { signInSchema } from "@/schemas";

// ถ้าใครรู้วิธีการทำ NextAuth ต่อกับ Turnstile ช่วยบอกด้วยค้าบบ
// ถ้าใครรู้วิธีการทำ NextAuth ต่อกับ Turnstile ช่วยบอกด้วยค้าบบ
// ถ้าใครรู้วิธีการทำ NextAuth ต่อกับ Turnstile ช่วยบอกด้วยค้าบบ
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handler = async (...args: any[]) => {
  const request = args[0] as NextRequest;

  if (
    request.method === "POST" &&
    request.url.includes("/api/auth/callback/credentials")
  ) {
    // Clone the request to avoid mutating the original request
    const clonedRequest = request.clone();
    const body = await clonedRequest.formData();
    try {
      const validatedData = signInSchema.safeParse({
        username: body.get("username"),
        password: body.get("password"),
      });

      if (!validatedData.success) {
        return NextResponse.json(
          { error: "Invalid input data", details: validatedData.error.errors },
          { status: 400 }
        );
      }

      const turnstileValid = await verifyTurnstile(
        body.get("turnstileToken") as string
      );
      if (!turnstileValid) {
        return NextResponse.json(
          { error: "Invalid Turnstile verification" },
          { status: 400 }
        );
      }

      return NextAuth(authOptions)(...args);
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }

  // Else
  return NextAuth(authOptions)(...args);
};

export { handler as GET, handler as POST };
