export type Providers = {
  gemini: boolean;
  mistral: boolean;
};

async function checkGemini(key: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
      { cache: 'no-store' }
    );
    return res.ok;
  } catch {
    return false;
  }
}

async function checkOpenAICompatible(baseUrl: string, key: string): Promise<boolean> {
  try {
    const res = await fetch(baseUrl, {
      headers: { Authorization: `Bearer ${key}` },
      cache: 'no-store',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getProviders(): Promise<Providers> {
  const { GEMINI_API_KEY, MISTRAL_API_KEY } = process.env;

  const [gemini, mistral] = await Promise.all([
    GEMINI_API_KEY ? checkGemini(GEMINI_API_KEY) : false,
    MISTRAL_API_KEY ? checkOpenAICompatible('https://api.mistral.ai/v1/models', MISTRAL_API_KEY) : false,
  ]);

  return { gemini, mistral };
}

export function getDefaultModel(providers: Providers): string {
  if (providers.gemini) return 'gemini-2.5-flash';
  if (providers.mistral) return 'mistral:mistral-small-latest';
  return 'none';
}
