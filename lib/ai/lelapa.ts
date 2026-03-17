import axios from "axios";

const BASE_URL = "https://vulavula.lelapa.ai/api/v1";
const OPENAI_COMPAT_BASE_URL = process.env.OPENAI_COMPAT_BASE_URL?.replace(/\/+$/, "");
const OPENAI_COMPAT_API_KEY = process.env.OPENAI_COMPAT_API_KEY;
const OPENAI_COMPAT_MODEL = process.env.OPENAI_COMPAT_MODEL ?? "gpt-4o-mini";
const LANGUAGE_AI_PROVIDER = process.env.LANGUAGE_AI_PROVIDER ?? "lelapa";

const headers = () => ({
  "X-CLIENT-TOKEN": process.env.LELAPA_API_KEY ?? "",
  "Content-Type": "application/json",
});

const openAICompatHeaders = () => ({
  Authorization: `Bearer ${OPENAI_COMPAT_API_KEY ?? ""}`,
  "Content-Type": "application/json",
});

export type SupportedLanguage =
  | "eng_Latn"
  | "zul_Latn"
  | "xho_Latn"
  | "afr_Latn"
  | "sot_Latn";

const DISPLAY_NAMES: Record<SupportedLanguage, string> = {
  eng_Latn: "English",
  zul_Latn: "Zulu",
  xho_Latn: "Xhosa",
  afr_Latn: "Afrikaans",
  sot_Latn: "Sesotho",
};

function isOpenAICompatConfigured(): boolean {
  return Boolean(OPENAI_COMPAT_BASE_URL && OPENAI_COMPAT_API_KEY);
}

async function callOpenAICompatible(prompt: string): Promise<string | null> {
  if (!isOpenAICompatConfigured()) return null;

  try {
    const { data } = await axios.post(
      `${OPENAI_COMPAT_BASE_URL}/chat/completions`,
      {
        model: OPENAI_COMPAT_MODEL,
        temperature: 0,
        messages: [{ role: "user", content: prompt }],
      },
      { headers: openAICompatHeaders() }
    );

    return data?.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

export async function detectLanguage(text: string): Promise<SupportedLanguage> {
  if (LANGUAGE_AI_PROVIDER !== "lelapa") {
    const prompt = `Detect the language code of this message. Return only one of these codes: eng_Latn, zul_Latn, xho_Latn, afr_Latn, sot_Latn.\n\nMessage: ${text}`;
    const response = (await callOpenAICompatible(prompt))?.trim() as SupportedLanguage | undefined;
    return response && response in DISPLAY_NAMES ? response : "eng_Latn";
  }

  try {
    const { data } = await axios.post(
      `${BASE_URL}/classify/language`,
      { text },
      { headers: headers() }
    );
    const detected = data?.language_code as SupportedLanguage | undefined;
    return detected && detected in DISPLAY_NAMES ? detected : "eng_Latn";
  } catch {
    return "eng_Latn";
  }
}

export async function translateToEnglish(
  text: string,
  sourceLang: SupportedLanguage
): Promise<string> {
  if (sourceLang === "eng_Latn") return text;
  if (LANGUAGE_AI_PROVIDER !== "lelapa") {
    const prompt = `Translate the following text to English. Return only the translated text.\n\n${text}`;
    return (await callOpenAICompatible(prompt)) ?? text;
  }

  try {
    const { data } = await axios.post(
      `${BASE_URL}/translate`,
      {
        input_text: text,
        source_lang: sourceLang,
        target_lang: "eng_Latn",
      },
      { headers: headers() }
    );
    return (data?.translation as string) || text;
  } catch {
    return text;
  }
}

export async function translateFromEnglish(
  text: string,
  targetLang: SupportedLanguage
): Promise<string> {
  if (targetLang === "eng_Latn") return text;
  if (LANGUAGE_AI_PROVIDER !== "lelapa") {
    const languageName = DISPLAY_NAMES[targetLang];
    const prompt = `Translate the following text to ${languageName}. Return only the translated text.\n\n${text}`;
    return (await callOpenAICompatible(prompt)) ?? text;
  }

  try {
    const { data } = await axios.post(
      `${BASE_URL}/translate`,
      {
        input_text: text,
        source_lang: "eng_Latn",
        target_lang: targetLang,
      },
      { headers: headers() }
    );
    return (data?.translation as string) || text;
  } catch {
    return text;
  }
}

export function getDisplayName(lang: SupportedLanguage): string {
  return DISPLAY_NAMES[lang];
}
