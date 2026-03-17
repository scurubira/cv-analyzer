import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

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

async function callOpenAICompatible(
    baseUrl: string,
    apiKey: string,
    modelName: string,
    prompt: string,
    extraHeaders: Record<string, string> = {}
): Promise<string> {
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
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(\`API error (\${res.status}): \${errText}\`);
    }

    const data = await res.json();
    return data.choices[0]?.message?.content ?? '';
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { objective, language, experienceListItem, model } = body;
        const modelParam = model || 'gemini-2.0-flash';

        if (!objective || !experienceListItem) {
            return NextResponse.json({ error: 'Objective and experience data are required' }, { status: 400 });
        }

        const { title, company, period, originalBullets, suggestedBullets } = experienceListItem;

        const prompt = buildRegeneratePrompt(objective, language || 'pt', title, company, period || '', originalBullets, suggestedBullets);

        let insightsText: string;

        // ── GROQ ───────────────────────────────────────────────────────────────────
        if (modelParam.startsWith('groq:')) {
            const modelName = modelParam.replace('groq:', '');
            const apiKey = process.env.GROQ_API_KEY;
            if (!apiKey) return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
            insightsText = await callOpenAICompatible('https://api.groq.com/openai/v1/chat/completions', apiKey, modelName, prompt);
        } else if (modelParam.startsWith('openrouter:')) {
            const modelName = modelParam.replace('openrouter:', '');
            const apiKey = process.env.OPENROUTER_API_KEY;
            if (!apiKey) return NextResponse.json({ error: 'OPENROUTER_API_KEY not configured' }, { status: 500 });
            insightsText = await callOpenAICompatible('https://openrouter.ai/api/v1/chat/completions', apiKey, modelName, prompt, { 'HTTP-Referer': 'https://cv-analyzer.app', 'X-Title': 'CV Analyzer' });
        } else if (modelParam.startsWith('mistral:')) {
            const modelName = modelParam.replace('mistral:', '');
            const apiKey = process.env.MISTRAL_API_KEY;
            if (!apiKey) return NextResponse.json({ error: 'MISTRAL_API_KEY not configured' }, { status: 500 });
            insightsText = await callOpenAICompatible('https://api.mistral.ai/v1/chat/completions', apiKey, modelName, prompt);
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

    } catch (error) {
        console.error('Error regenerating block:', error);
        return NextResponse.json({ error: 'Failed to regenerate block' }, { status: 500 });
    }
}
