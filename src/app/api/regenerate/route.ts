import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

async function callOpenAICompatible(
    baseUrl: string,
    apiKey: string,
    modelName: string,
    prompt: string,
    extraHeaders: Record<string, string> = {}
): Promise<string> {
    try {
        const res = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                ...extraHeaders,
            },
            body: JSON.stringify({
                model: modelName,
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' },
                temperature: 0.7, // Slightly higher temperature for regeneration to get more variety
            }),
            signal: new AbortController().signal, // Manual timeout handling
        });

        if (!res.ok) {
            const errText = await res.text();
            const errJson = (() => { try { return JSON.parse(errText); } catch { return null; } })();
            const message = errJson?.error?.message ?? errText;
            if (res.status === 429) throw new Error(`Quota exceeded: ${message}`);
            throw new Error(`API error (${res.status}): ${message}`);
        }

        const data = await res.json();
        return data.choices[0]?.message?.content ?? '';
    } catch (error: any) {
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - please try again');
        }
        throw error;
    }
}

function buildRegeneratePrompt(objective: string, language: string, title: string, company: string, period: string, originalBullets: string[], currentSuggestedBullets: string[]): string {
    const languageMap: Record<string, string> = {
        'en': 'English',
        'pt': 'Brazilian Portuguese',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German'
    };
    const targetOutputLanguage = languageMap[language] || 'English';

    return `
    You are an expert Tech Recruiter and CV Optimizer.
    The user wants to RE-GENERATE the bullet points for ONE specific job experience on their CV.
    
    CRITICAL TRANSLATION CONSTRAINT:
    You MUST output the new bullet points in ${targetOutputLanguage}.
    
    CRITICAL CONTENT CONSTRAINT:
    - Keep bullet points concise and impactful.
    - Focus heavily on achieving the candidate's specific objective. Give a different angle or highlight different metrics compared to the "Current Suggested Bullets" to give the user a fresh option.
    - Remove fluffy or subjective language.
    - Be direct and focus only on the most impactful achievements.
    
    Candidate Objective: ${objective}
    
    Job Details:
    Title: ${title}
    Company: ${company}
    Period: ${period}
    Original CV Bullets (Raw text):
    ${originalBullets.join('\n- ')}
    
    Current Suggested Bullets (The ones the user wants an alternative for):
    ${currentSuggestedBullets.join('\n- ')}
    
    Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure containing the newly rewritten bullets:
    {
      "suggestedBullets": ["string"]
    }
  `;
}


export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { objective, language, experienceListItem, model } = body;
        const modelParam = model || 'gemini-2.5-flash';

        if (!objective || !experienceListItem) {
            return NextResponse.json({ error: 'Objective and experience data are required' }, { status: 400 });
        }

        const { title, company, period, originalBullets, suggestedBullets } = experienceListItem;

        const prompt = buildRegeneratePrompt(objective, language || 'pt', title, company, period || '', originalBullets, suggestedBullets);

        let insightsText: string;

        // Call Gemini API or Mistral API
        if (modelParam.startsWith('mistral:')) {
            const modelName = modelParam.replace('mistral:', '');
            const apiKey = process.env.MISTRAL_API_KEY;
            if (!apiKey) return NextResponse.json({ error: 'MISTRAL_API_KEY not configured' }, { status: 500 });

            insightsText = await callOpenAICompatible(
                'https://api.mistral.ai/v1/chat/completions',
                apiKey,
                modelName,
                prompt
            );
        } else {
            // GEMINI (default)
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });

            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: modelParam,
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: 'OBJECT',
                        properties: {
                            suggestedBullets: { type: 'ARRAY', items: { type: 'STRING' } }
                        },
                        required: ['suggestedBullets'],
                    },
                },
            });

            if (!response.text) throw new Error('Empty response from Gemini');
            insightsText = response.text;
        }

        const data = JSON.parse(insightsText);
        return NextResponse.json({ success: true, suggestedBullets: data.suggestedBullets });

    } catch (error: any) {
        console.error('Error regenerating block:', error);
        let message: string = error?.message || 'Failed to regenerate block';
        if (
          error?.status === 429 ||
          message.includes('RESOURCE_EXHAUSTED') ||
          message.toLowerCase().includes('quota')
        ) {
          message = `Quota exceeded: ${message}`;
        }
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
