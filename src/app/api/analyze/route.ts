import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import { GoogleGenAI } from '@google/genai';

// ─── Shared JSON prompt (no schema enforcement for non-Gemini providers) ───────
function buildPrompt(objective: string, language: string, text: string): string {
  const targetOutputLanguage = language === 'en' ? 'English' : 'Brazilian Portuguese';
  return `
    You are an expert Tech Recruiter and CV Optimizer.
    I will provide you with a candidate's parsed CV text and their career objective.
    Your task is to analyze their CV and suggest improvements to tailor it to their objective.
    
    CRITICAL CONSTRAINT: The resulting CV MUST be extremely concise and punchy. Aim for brevity. 
    It needs to comfortably fit within 1 to 2 pages maximum. 
    - Remove fluffy or subjective language.
    - Combine repetitive bullet points.
    - Be direct and focus only on the most impactful achievements.
    - Extract contact information (email, phone, location/address, LinkedIn) into the contact field.
    - Extract any known languages spoken by the applicant and their proficiency level (Native, Fluent, Advanced, Intermediate, Basic) and return them in the languages array as objects with 'language' and 'level' fields.
    - For each experience entry, include the period/dates (e.g. 'Jan 2020 – Mar 2023') in the 'period' field if available.
    - Extract education/academic history and return them in the education array.
    - Extract continuous education, courses, and certifications and return them in the certifications array.
    - Extract professional references (name, title, company, contact) and return them in the references array. If no references are found, return an empty array.
    - Suggest 1-3 prominent job titles that the applicant is highly qualified for based strictly on their CV experience. Return these in the targetTitles array.
    
    The career objective is: ${objective}
    The target language for the output MUST BE: ${targetOutputLanguage}.
    
    CV TEXT:
    ${text}
    
    Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
    {
      "name": "string",
      "targetTitles": ["string"],
      "summary": { "original": "string", "suggested": "string" },
      "contact": { "email": "string", "phone": "string", "location": "string", "linkedin": "string" },
      "experiences": [{ "id": 1, "company": "string", "title": "string", "period": "string", "originalBullets": ["string"], "suggestedBullets": ["string"] }],
      "skills": { "original": ["string"], "suggested": ["string"] },
      "education": [{ "degree": "string", "institution": "string", "year": "string" }],
      "languages": [{ "language": "string", "level": "string" }],
      "certifications": ["string"],
      "references": [{ "name": "string", "title": "string", "company": "string", "contact": "string" }]
    }
  `;
}

// ─── OpenAI-compatible call (Groq, OpenRouter, Mistral all share this format) ──
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
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content ?? '';
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const objective = formData.get('objective') as string | null;
    const language = formData.get('language') as string || 'pt';
    const modelParam = formData.get('model') as string || 'gemini-2.0-flash';

    if (!file || !objective) {
      return NextResponse.json({ error: 'File and objective are required' }, { status: 400 });
    }

    // 1. Parse PDF
    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfData = await pdfParse(buffer);
    const text = pdfData.text;

    // 2. No-AI mode
    if (modelParam === 'none') {
      return NextResponse.json({
        success: true,
        originalTextLength: text.length,
        insights: {
          name: '', targetTitles: [],
          summary: { original: text.slice(0, 800), suggested: '' },
          contact: {}, experiences: [],
          skills: { original: [], suggested: [] },
          education: [], languages: [], certifications: [], references: [],
        },
      });
    }

    const prompt = buildPrompt(objective, language, text);

    // 3. Determine provider and call the right API
    let insightsText: string;

    // ── GROQ ───────────────────────────────────────────────────────────────────
    if (modelParam.startsWith('groq:')) {
      const modelName = modelParam.replace('groq:', '');
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });

      insightsText = await callOpenAICompatible(
        'https://api.groq.com/openai/v1/chat/completions',
        apiKey,
        modelName,
        prompt
      );

      // ── OPENROUTER ─────────────────────────────────────────────────────────────
    } else if (modelParam.startsWith('openrouter:')) {
      const modelName = modelParam.replace('openrouter:', '');
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) return NextResponse.json({ error: 'OPENROUTER_API_KEY not configured' }, { status: 500 });

      insightsText = await callOpenAICompatible(
        'https://openrouter.ai/api/v1/chat/completions',
        apiKey,
        modelName,
        prompt,
        { 'HTTP-Referer': 'https://cv-analyzer.app', 'X-Title': 'CV Analyzer' }
      );

      // ── MISTRAL ────────────────────────────────────────────────────────────────
    } else if (modelParam.startsWith('mistral:')) {
      const modelName = modelParam.replace('mistral:', '');
      const apiKey = process.env.MISTRAL_API_KEY;
      if (!apiKey) return NextResponse.json({ error: 'MISTRAL_API_KEY not configured' }, { status: 500 });

      insightsText = await callOpenAICompatible(
        'https://api.mistral.ai/v1/chat/completions',
        apiKey,
        modelName,
        prompt
      );

      // ── GEMINI (default) ───────────────────────────────────────────────────────
    } else {
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
              name: { type: 'STRING' },
              targetTitles: { type: 'ARRAY', items: { type: 'STRING' } },
              summary: { type: 'OBJECT', properties: { original: { type: 'STRING' }, suggested: { type: 'STRING' } } },
              contact: { type: 'OBJECT', properties: { email: { type: 'STRING' }, phone: { type: 'STRING' }, location: { type: 'STRING' }, linkedin: { type: 'STRING' } } },
              experiences: { type: 'ARRAY', items: { type: 'OBJECT', properties: { id: { type: 'INTEGER' }, company: { type: 'STRING' }, title: { type: 'STRING' }, period: { type: 'STRING' }, originalBullets: { type: 'ARRAY', items: { type: 'STRING' } }, suggestedBullets: { type: 'ARRAY', items: { type: 'STRING' } } } } },
              skills: { type: 'OBJECT', properties: { original: { type: 'ARRAY', items: { type: 'STRING' } }, suggested: { type: 'ARRAY', items: { type: 'STRING' } } } },
              education: { type: 'ARRAY', items: { type: 'OBJECT', properties: { degree: { type: 'STRING' }, institution: { type: 'STRING' }, year: { type: 'STRING' } } } },
              languages: { type: 'ARRAY', items: { type: 'OBJECT', properties: { language: { type: 'STRING' }, level: { type: 'STRING' } } } },
              certifications: { type: 'ARRAY', items: { type: 'STRING' } },
              references: { type: 'ARRAY', items: { type: 'OBJECT', properties: { name: { type: 'STRING' }, title: { type: 'STRING' }, company: { type: 'STRING' }, contact: { type: 'STRING' } } } },
            },
            required: ['summary', 'experiences', 'skills'],
          },
        },
      });

      if (!response.text) throw new Error('Empty response from Gemini');
      insightsText = response.text;
    }

    const insights = JSON.parse(insightsText);
    return NextResponse.json({ success: true, originalTextLength: text.length, insights });

  } catch (error) {
    console.error('Error processing CV:', error);
    return NextResponse.json({ error: 'Failed to process CV' }, { status: 500 });
  }
}
