export type { PaymentProvider, CreatePaymentParams, PaymentResult } from "./types";

import { createYocoPayment } from "./yoco";
import { createOzowPayment } from "./ozow";
import { createPayFastPayment } from "./payfast";
import type { CreatePaymentParams, PaymentResult } from "./types";

export async function createPayment(
  params: CreatePaymentParams
): Promise<PaymentResult> {
  switch (params.provider) {
    case "yoco":
      return createYocoPayment(params);
    case "ozow":
      return createOzowPayment(params);
    case "payfast":
      return createPayFastPayment(params);
    default: {
      const exhaustive: never = params.provider;
      throw new Error(`Unknown payment provider: ${exhaustive}`);
    }
  }
}
