import { detectLanguage, translateToEnglish, translateFromEnglish } from "@/lib/ai/lelapa";
import { processMessage, extractBusinessSetup, MessageContext } from "@/lib/ai/claude";
import { runDevilsAdvocate } from "@/lib/ai/devil";
import {
  getBusinessByWhatsApp,
  upsertBusiness,
  getOrCreateCustomer,
} from "@/lib/db/supabase";
import { sendMessage } from "@/lib/whatsapp/client";

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
