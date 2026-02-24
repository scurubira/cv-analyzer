import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const objective = formData.get('objective') as string | null;
    const language = formData.get('language') as string || 'pt';

    if (!file || !objective) {
      return NextResponse.json({ error: 'File and objective are required' }, { status: 400 });
    }

    // 1. Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Parse PDF Text
    const pdfData = await pdfParse(buffer);
    const text = pdfData.text;

    // 3. Initialize Gemini Client
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not defined in the environment.");
      return NextResponse.json({ error: 'Server configuration error: Missing API Key' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const targetOutputLanguage = language === 'en' ? 'English' : 'Brazilian Portuguese';

    const prompt = `
        You are an expert Tech Recruiter and CV Optimizer.
        I will provide you with a candidate's parsed CV text and their career objective.
        Your task is to analyze their CV and suggest improvements to tailor it to their objective.
        
        CRITICAL CONSTRAINT: The resulting CV MUST be extremely concise and punchy. Aim for brevity. 
        It needs to comfortably fit within 1 to 2 pages maximum. 
        - Remove fluffy or subjective language.
        - Combine repetitive bullet points.
        - Be direct and focus only on the most impactful achievements.
        
        The career objective is: ${objective}
        The target language for the output MUST BE: ${targetOutputLanguage}.
        
        CV TEXT:
        ${text}
        
        Return the result strictly adhering to the JSON schema requested.
        `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            summary: {
              type: "OBJECT",
              properties: {
                original: { type: "STRING" },
                suggested: { type: "STRING" }
              }
            },
            experiences: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  id: { type: "INTEGER" },
                  company: { type: "STRING" },
                  title: { type: "STRING" },
                  originalBullets: {
                    type: "ARRAY",
                    items: { type: "STRING" }
                  },
                  suggestedBullets: {
                    type: "ARRAY",
                    items: { type: "STRING" }
                  }
                }
              }
            },
            skills: {
              type: "OBJECT",
              properties: {
                original: {
                  type: "ARRAY",
                  items: { type: "STRING" }
                },
                suggested: {
                  type: "ARRAY",
                  items: { type: "STRING" }
                }
              }
            }
          },
          required: ["summary", "experiences", "skills"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Empty response from Gemini");
    }

    const insights = JSON.parse(response.text);

    return NextResponse.json({
      success: true,
      originalTextLength: text.length,
      insights: insights
    });

  } catch (error) {
    console.error('Error processing CV:', error);
    return NextResponse.json({ error: 'Failed to process CV' }, { status: 500 });
  }
}
