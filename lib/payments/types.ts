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
  paymentReference: string;
  provider: PaymentProvider;
}
