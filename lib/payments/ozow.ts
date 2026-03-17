import { createHash } from "crypto";
import axios from "axios";
import type { CreatePaymentParams, PaymentResult } from "./types";

const OZOW_API_URL = "https://api.ozow.com/postpaymentrequest";

function sha512Lower(input: string): string {
  return createHash("sha512").update(input).digest("hex").toLowerCase();
}

export async function createOzowPayment(
  params: CreatePaymentParams
): Promise<PaymentResult> {
  const siteCode = process.env.OZOW_SITE_CODE;
  const apiKey = process.env.OZOW_API_KEY;
  const privateKey = process.env.OZOW_PRIVATE_KEY;

  if (!siteCode || !apiKey || !privateKey) {
    throw new Error("Ozow env vars (OZOW_SITE_CODE, OZOW_API_KEY, OZOW_PRIVATE_KEY) are not configured.");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const countryCode = "ZA";
  const currencyCode = "ZAR";
  const amount = params.amount.toFixed(2);
  const transactionReference = params.orderId;
  const bankReference = params.orderId;
  const successUrl = `${appUrl}/payment/success?orderId=${params.orderId}`;
  const cancelUrl = `${appUrl}/payment/cancel?orderId=${params.orderId}`;
  const errorUrl = `${appUrl}/payment/error?orderId=${params.orderId}`;
  const notifyUrl = `${appUrl}/api/payments/webhook/ozow`;
  const isTest = "false";

  // HashCheck: SHA512 lowercase of concatenated fields + private key
  const hashInput =
    siteCode +
    countryCode +
    currencyCode +
    amount +
    transactionReference +
    bankReference +
    cancelUrl +
    errorUrl +
    successUrl +
    isTest +
    privateKey;

  const hashCheck = sha512Lower(hashInput);

  const { data } = await axios.post<{ url: string }>(
    OZOW_API_URL,
    {
      SiteCode: siteCode,
      CountryCode: countryCode,
      CurrencyCode: currencyCode,
      Amount: amount,
      TransactionReference: transactionReference,
      BankReference: bankReference,
      Customer: params.customerName,
      SuccessUrl: successUrl,
      CancelUrl: cancelUrl,
      ErrorUrl: errorUrl,
      NotifyUrl: notifyUrl,
      IsTest: false,
      HashCheck: hashCheck,
    },
    {
      headers: {
        ApiKey: apiKey,
        "Content-Type": "application/json",
      },
    }
  );

  return {
    paymentUrl: data.url,
    paymentReference: transactionReference,
    provider: "ozow",
  };
}

export function verifyOzowWebhook(params: Record<string, string>): boolean {
  const privateKey = process.env.OZOW_PRIVATE_KEY;
  const siteCode = process.env.OZOW_SITE_CODE;
  if (!privateKey || !siteCode) return false;

  const {
    SiteCode,
    TransactionId,
    TransactionReference,
    Amount,
    Status,
    Optional1,
    Optional2,
    Optional3,
    Optional4,
    Optional5,
    CurrencyCode,
    IsTest,
    StatusMessage,
    Hash,
  } = params;

  // Ozow webhook hash: SHA512 lowercase of concatenated fields + private key
  const hashInput =
    (SiteCode ?? "") +
    (TransactionId ?? "") +
    (TransactionReference ?? "") +
    (Amount ?? "") +
    (Status ?? "") +
    (Optional1 ?? "") +
    (Optional2 ?? "") +
    (Optional3 ?? "") +
    (Optional4 ?? "") +
    (Optional5 ?? "") +
    (CurrencyCode ?? "") +
    (IsTest ?? "") +
    (StatusMessage ?? "") +
    privateKey;

  const expected = sha512Lower(hashInput);
  return expected === (Hash ?? "").toLowerCase();
}
