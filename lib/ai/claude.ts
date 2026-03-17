import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface MessageContext {
  businessName?: string;
  products?: Array<{ name: string; price: number }>;
  hours?: string;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
  language?: string;
}

export async function processMessage(
  message: string,
  context: MessageContext
): Promise<string> {
  const systemPrompt = `You are a helpful WhatsApp business assistant for ${
    context.businessName ?? "a local business"
  }.

Business details:
- Products/Services: ${JSON.stringify(context.products ?? [])}
- Operating hours: ${context.hours ?? "Not specified"}

Your job:
1. Answer customer questions about products, prices, and availability.
2. Help customers place orders by collecting their order details.
3. Confirm appointments or bookings when relevant.
4. Share payment details when an order is confirmed.
5. Be friendly, concise, and helpful – responses must be short enough for WhatsApp.

Always reply in the same language the customer used. Keep replies under 300 characters where possible.`;

  const messages: Anthropic.MessageParam[] = [
    ...(context.conversationHistory ?? []).map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  const response = await client.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 512,
    system: systemPrompt,
    messages,
  });

  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}

export async function extractBusinessSetup(
  conversation: string
): Promise<{
  businessName?: string;
  products?: Array<{ name: string; price: number }>;
  hours?: string;
}> {
  const response = await client.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 1024,
    system:
      "You extract structured business information from a WhatsApp onboarding conversation. " +
      "Return ONLY valid JSON matching the shape: " +
      '{ "businessName": string, "products": [{"name": string, "price": number}], "hours": string }. ' +
      "If a field cannot be determined, omit it.",
    messages: [{ role: "user", content: conversation }],
  });

  const block = response.content[0];
  if (block.type !== "text") return {};

  try {
    return JSON.parse(block.text) as {
      businessName?: string;
      products?: Array<{ name: string; price: number }>;
      hours?: string;
    };
  } catch {
    return {};
  }
}
