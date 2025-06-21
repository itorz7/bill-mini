export async function verifyTurnstile(
  token: string | undefined
): Promise<boolean> {
  if (!token) {
    return false;
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY!,
          response: token,
        }),
      }
    );

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return false;
  }
}
