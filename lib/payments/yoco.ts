import { createHmac } from "crypto";
import axios from "axios";
import type { CreatePaymentParams, PaymentResult } from "./types";

const YOCO_API_URL = "https://payments.yoco.com/api/checkouts";

export async function createYocoPayment(
  params: CreatePaymentParams
): Promise<PaymentResult> {
  const secretKey = process.env.YOCO_SECRET_KEY;
  if (!secretKey) throw new Error("YOCO_SECRET_KEY is not configured.");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const amountCents = Math.round(params.amount * 100);

  const { data } = await axios.post<{ id: string; redirectUrl: string }>(
    YOCO_API_URL,
    {
      amount: amountCents,
      currency: "ZAR",
      successUrl: `${appUrl}/payment/success?orderId=${params.orderId}`,
      cancelUrl: `${appUrl}/payment/cancel?orderId=${params.orderId}`,
      metadata: { orderId: params.orderId },
    },
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  return {
    paymentUrl: data.redirectUrl,
    paymentReference: data.id,
    provider: "yoco",
  };
}

export function verifyYocoWebhook(body: string, signature: string): boolean {
  const secret = process.env.YOCO_WEBHOOK_SECRET;
  if (!secret) return false;

  const expected = createHmac("sha256", secret).update(body).digest("hex");
  return expected === signature;
}
