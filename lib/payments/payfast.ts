import { createHash } from "crypto";
import type { CreatePaymentParams, PaymentResult } from "./types";

const PAYFAST_LIVE_URL = "https://www.payfast.co.za/eng/process";
const PAYFAST_SANDBOX_URL = "https://sandbox.payfast.co.za/eng/process";

function md5(input: string): string {
  return createHash("md5").update(input).digest("hex");
}

function buildSignature(params: Record<string, string>, passphrase?: string): string {
  // Sort keys alphabetically, exclude 'signature'
  const sorted = Object.keys(params)
    .filter((k) => k !== "signature")
    .sort()
    .map((k) => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, "+")}`)
    .join("&");

  const stringToHash = passphrase
    ? `${sorted}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`
    : sorted;

  return md5(stringToHash);
}

export async function createPayFastPayment(
  params: CreatePaymentParams
): Promise<PaymentResult> {
  const merchantId = process.env.PAYFAST_MERCHANT_ID;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
  const passphrase = process.env.PAYFAST_PASSPHRASE;
  const isSandbox = process.env.PAYFAST_SANDBOX === "true";

  if (!merchantId || !merchantKey) {
    throw new Error("PAYFAST_MERCHANT_ID and PAYFAST_MERCHANT_KEY are not configured.");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const baseUrl = isSandbox ? PAYFAST_SANDBOX_URL : PAYFAST_LIVE_URL;

  const paymentParams: Record<string, string> = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: `${appUrl}/payment/success?orderId=${params.orderId}`,
    cancel_url: `${appUrl}/payment/cancel?orderId=${params.orderId}`,
    notify_url: `${appUrl}/api/payments/webhook/payfast`,
    m_payment_id: params.orderId,
    amount: params.amount.toFixed(2),
    item_name: params.description,
  };

  const signature = buildSignature(paymentParams, passphrase);
  paymentParams.signature = signature;

  const queryString = Object.keys(paymentParams)
    .map((k) => `${k}=${encodeURIComponent(paymentParams[k])}`)
    .join("&");

  const paymentUrl = `${baseUrl}?${queryString}`;

  return {
    paymentUrl,
    paymentReference: params.orderId,
    provider: "payfast",
  };
}

export function verifyPayFastWebhook(params: Record<string, string>): boolean {
  const passphrase = process.env.PAYFAST_PASSPHRASE;
  const receivedSignature = params.signature;
  if (!receivedSignature) return false;

  const paramsWithoutSignature = { ...params };
  delete paramsWithoutSignature.signature;

  const expected = buildSignature(paramsWithoutSignature, passphrase);
  return expected === receivedSignature;
}
