export type PaymentProvider = "yoco" | "ozow" | "payfast";

export interface CreatePaymentParams {
  orderId: string;
  amount: number; // in ZAR (e.g. 350.00)
  customerName: string;
  customerPhone: string;
  description: string;
  provider: PaymentProvider;
}

export interface PaymentResult {
  paymentUrl: string;
  /** Provider-level reference / link ID */
  paymentReference: string;
  provider: PaymentProvider;
  /**
   * Yoco only — the `order_id` returned by the Payment Links API.
   * Used to poll GET /v1/orders/{order_id} for payment status.
   */
  yocoOrderId?: string;
}

/** Possible states returned by GET /v1/orders/{order_id} */
export type YocoOrderState = "open" | "completed" | "cancelled";
