import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface BusinessProfile {
  name: string;
  products: Array<{ name: string; price: number }>;
  hours: string;
  whatsapp_number: string;
}

export interface DevilsAdvocateChallenge {
  category: string;
  issue: string;
  severity: "low" | "medium" | "high";
  suggestion: string;
}

export interface DevilsAdvocateReport {
  overallRisk: "low" | "medium" | "high";
  challenges: DevilsAdvocateChallenge[];
  blindSpots: string[];
  provokeQuestion: string;
  verdict: string;
}

const SYSTEM_PROMPT = `You are a brutally honest business mentor for informal traders in Africa. 
Your job is to stress-test their business setup and expose weaknesses before they cost real money.

You are NOT here to be nice. You are here to be RIGHT. Think like a sharp investor who has seen 
hundreds of small businesses fail. Identify pricing risks, market saturation, cash flow traps, 
operational blind spots, and strategic weaknesses. Ask the one question that cuts to the core.

Return ONLY valid JSON matching this exact shape:
{
  "overallRisk": "low" | "medium" | "high",
  "challenges": [
    {
      "category": string,
      "issue": string,
      "severity": "low" | "medium" | "high",
      "suggestion": string
    }
  ],
  "blindSpots": string[],
  "provokeQuestion": string,
  "verdict": string
}

Rules:
- challenges: 3–6 items covering pricing, market, differentiation, hours, product mix, cash flow
- blindSpots: 3–5 things the trader has NOT considered (seasonality, upsells, competitor moves, etc.)
- provokeQuestion: ONE hard-hitting question that challenges their biggest assumption
- verdict: exactly 2 sentences — honest, direct, no sugar-coating
- Do not add any text outside the JSON object`;

export async function runDevilsAdvocate(
  business: BusinessProfile
): Promise<DevilsAdvocateReport> {
  const prompt = `Analyse this business setup:

Business name: ${business.name}
WhatsApp: ${business.whatsapp_number}
Hours: ${business.hours}
Products/Services: ${JSON.stringify(business.products, null, 2)}

Be the devil's advocate. What could go wrong? What are they not thinking about?`;

  const response = await client.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  const block = response.content[0];
  if (block.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  try {
    return JSON.parse(block.text) as DevilsAdvocateReport;
  } catch {
    throw new Error(`Failed to parse Devil's Advocate report: ${block.text}`);
  }
}
