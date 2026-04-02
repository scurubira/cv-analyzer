export type Providers = {
  gemini: boolean;
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

export async function getProviders(): Promise<Providers> {
  const { GEMINI_API_KEY } = process.env;

  const gemini = GEMINI_API_KEY ? await checkGemini(GEMINI_API_KEY) : false;

  return { gemini };
}

export function getDefaultModel(providers: Providers): string {
  if (providers.gemini) return 'gemini-2.5-flash';
  return 'none';
}
