import { detectLanguage, translateToEnglish, translateFromEnglish } from "@/lib/ai/lelapa";
import { processMessage, extractBusinessSetup, MessageContext } from "@/lib/ai/claude";
import { runDevilsAdvocate } from "@/lib/ai/devil";
import {
  getBusinessByWhatsApp,
  upsertBusiness,
  getOrCreateCustomer,
  updateOrderStatus,
  savePaymentDetails,
  supabase,
} from "@/lib/db/supabase";
import type { Order } from "@/lib/db/supabase";
import { sendMessage } from "@/lib/whatsapp/client";
import { createPayment, checkYocoOrderStatus } from "@/lib/payments";

// In-memory store for onboarding conversations (use Redis/DB in production)
const onboardingState = new Map<
  string,
  { stage: "awaiting_name" | "awaiting_products" | "awaiting_hours" | "done"; transcript: string }
>();

export async function handleIncomingMessage(
  fromNumber: string,
  messageText: string
): Promise<void> {
  const lang = await detectLanguage(messageText);
  const englishText = await translateToEnglish(messageText, lang);

  // Check if this number belongs to a registered business owner
  const business = await getBusinessByWhatsApp(fromNumber);

  if (!business) {
    // Start or continue onboarding
    await handleOnboarding(fromNumber, englishText, lang);
    return;
  }

  // Otherwise, treat the sender as a customer of the business
  // (In a real deployment, incoming number would be matched to a business context)
  const customer = await getOrCreateCustomer(fromNumber, business.id);
  if (!customer) {
    await sendMessage(fromNumber, "Sorry, something went wrong. Please try again.");
    return;
  }

  const context: MessageContext = {
    businessName: business.name,
    products: business.products,
    hours: business.hours,
    language: lang,
  };

  // Check if the customer is asking about payment status
  const normalised = englishText.trim().toUpperCase();
  if (normalised === "PAID?" || normalised === "CHECK PAYMENT" || normalised === "PAYMENT STATUS") {
    // Look up the customer's most recent unpaid order for this business
    const customer = await getOrCreateCustomer(fromNumber, business.id);
    if (customer) {
      const { data: latestOrder } = await supabase
        .from("orders")
        .select("id")
        .eq("business_id", business.id)
        .eq("customer_id", customer.id)
        .eq("payment_status", "unpaid")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (latestOrder) {
        await checkAndConfirmPayment(fromNumber, (latestOrder as { id: string }).id, lang);
        return;
      }
    }
  }

  const englishReply = await processMessage(englishText, context);
  const localReply = await translateFromEnglish(englishReply, lang);
  await sendMessage(fromNumber, localReply);
}

async function handleOnboarding(
  fromNumber: string,
  englishText: string,
  lang: Parameters<typeof translateFromEnglish>[1]
): Promise<void> {
  const state = onboardingState.get(fromNumber) ?? {
    stage: "awaiting_name" as const,
    transcript: "",
  };

  state.transcript += `\nUser: ${englishText}`;

  switch (state.stage) {
    case "awaiting_name": {
      const reply = await translateFromEnglish(
        "Welcome to MoolaBiz! 🎉 I'll help you set up your WhatsApp business bot in just 3 steps.\n\nStep 1: What is the name of your business?",
        lang
      );
      await sendMessage(fromNumber, reply);
      state.stage = "awaiting_products";
      break;
    }
    case "awaiting_products": {
      const reply = await translateFromEnglish(
        `Great! Now, Step 2: List your products or services with prices.\nExample: "Braids R200, Relaxer R150, Washing R80"`,
        lang
      );
      await sendMessage(fromNumber, reply);
      state.stage = "awaiting_hours";
      break;
    }
    case "awaiting_hours": {
      const reply = await translateFromEnglish(
        "Perfect! Last step – what are your business hours?\nExample: Mon-Sat 8am-6pm",
        lang
      );
      await sendMessage(fromNumber, reply);
      state.stage = "done";
      break;
    }
    case "done": {
      // Extract structured data from the full transcript
      const extracted = await extractBusinessSetup(state.transcript);
      const profile = {
        whatsapp_number: fromNumber,
        name: extracted.businessName ?? "My Business",
        products: extracted.products ?? [],
        hours: extracted.hours ?? "Mon-Fri 9am-5pm",
        plan: "basic" as const,
      };
      await upsertBusiness(profile);
      onboardingState.delete(fromNumber);

      const reply = await translateFromEnglish(
        `✅ Your business bot is live!\n\nCustomers can now WhatsApp you and I'll handle their queries 24/7.\n\nReply "MENU" anytime to see options.`,
        lang
      );
      await sendMessage(fromNumber, reply);

      // Run devil's advocate in the background and send a follow-up
      runDevilsAdvocate(profile)
        .then(async (report) => {
          const topChallenge = report.challenges[0];
          const topBlindSpot = report.blindSpots[0];

          const followUp =
            `🤔 *Devil's Advocate Check*\n\n` +
            `I've done a quick stress-test of your setup. Here's what to think about:\n\n` +
            `⚠️ ${topChallenge?.issue ?? "Review your pricing strategy."}\n\n` +
            `💡 ${topBlindSpot ?? "Consider who your direct competitors are."}\n\n` +
            `❓ ${report.provokeQuestion}\n\n` +
            `Reply "FULL REVIEW" to get the complete analysis.`;

          const localFollowUp = await translateFromEnglish(followUp, lang);
          await sendMessage(fromNumber, localFollowUp);
        })
        .catch((err: unknown) => {
          console.error("[devil's advocate] follow-up message failed:", err);
        });

      return;
    }
  }

  onboardingState.set(fromNumber, state);
}

/**
 * Generates a payment link for a confirmed order and sends it to the customer
 * via WhatsApp. Call this after an order is created and confirmed.
 *
 * The Yoco `order_id` is persisted so that `checkAndConfirmPayment` can poll
 * the Orders API later to confirm payment status.
 */
export async function sendPaymentLink(
  customerPhone: string,
  orderId: string,
  amount: number,
  description: string,
  provider: "yoco" | "ozow" | "payfast",
  language: string
): Promise<void> {
  const result = await createPayment({
    orderId,
    amount,
    customerName: "",
    customerPhone,
    description,
    provider,
  });

  // Persist the payment details (incl. Yoco order_id for status polling)
  await savePaymentDetails(
    orderId,
    result.provider,
    result.paymentUrl,
    result.paymentReference,
    result.yocoOrderId
  );

  const lang = language as Parameters<typeof translateFromEnglish>[1];
  const message = await translateFromEnglish(
    `💳 To complete your order, please pay here: ${result.paymentUrl}`,
    lang
  );
  await sendMessage(customerPhone, message);
}

/**
 * Checks whether a Yoco payment has been completed and notifies the customer.
 *
 * For Yoco: polls GET /v1/orders/{yoco_order_id} for state "completed".
 * For Ozow / PayFast: payment is confirmed via webhook — no polling needed.
 *
 * Intended usage: call this when the customer sends "PAID?" or "CHECK PAYMENT"
 * in the WhatsApp conversation, or from a periodic cron job.
 */
export async function checkAndConfirmPayment(
  customerPhone: string,
  orderId: string,
  language: string
): Promise<void> {
  const lang = language as Parameters<typeof translateFromEnglish>[1];

  const { data: orderData } = await supabase
    .from("orders")
    .select("payment_status, payment_provider, yoco_order_id")
    .eq("id", orderId)
    .single();

  if (!orderData) {
    await sendMessage(
      customerPhone,
      await translateFromEnglish("❌ Order not found. Please contact the business.", lang)
    );
    return;
  }

  const order = orderData as Pick<Order, "payment_status" | "payment_provider" | "yoco_order_id">;

  // Already confirmed (e.g. via webhook)
  if (order.payment_status === "paid") {
    const msg = await translateFromEnglish(
      "✅ Your payment has been received! Your order is confirmed. We'll be in touch shortly.",
      lang
    );
    await sendMessage(customerPhone, msg);
    return;
  }

  // For Yoco: poll the Orders API
  if (order.payment_provider === "yoco" && order.yoco_order_id) {
    const state = await checkYocoOrderStatus(order.yoco_order_id);

    if (state === "completed") {
      await updateOrderStatus(orderId, "confirmed", "paid");
      const msg = await translateFromEnglish(
        "✅ Payment confirmed! Your order is confirmed. We'll be in touch shortly.",
        lang
      );
      await sendMessage(customerPhone, msg);
      return;
    }

    if (state === "cancelled") {
      const msg = await translateFromEnglish(
        "❌ Your payment was cancelled. Please try again or contact the business.",
        lang
      );
      await sendMessage(customerPhone, msg);
      return;
    }

    // Still "open"
    const msg = await translateFromEnglish(
      "⏳ We haven't received your payment yet. Please complete the payment using the link we sent.",
      lang
    );
    await sendMessage(customerPhone, msg);
    return;
  }

  // Ozow / PayFast are confirmed via webhook — just report current status
  const msg = await translateFromEnglish(
    "⏳ Payment not yet received. If you've already paid, please wait a moment and try again.",
    lang
  );
  await sendMessage(customerPhone, msg);
}
