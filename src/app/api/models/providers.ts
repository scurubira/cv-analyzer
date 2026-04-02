export type Providers = {
  gemini: boolean;
  mistral: boolean;
};


export async function getProviders(): Promise<Providers> {
  const { GEMINI_API_KEY, MISTRAL_API_KEY } = process.env;

  return {
    gemini: !!GEMINI_API_KEY,
    mistral: !!MISTRAL_API_KEY,
  };
}

export function getDefaultModel(providers: Providers): string {
  if (providers.gemini) return 'gemini-2.5-flash';
  if (providers.mistral) return 'mistral:mistral-small-latest';
  return 'none';
}
