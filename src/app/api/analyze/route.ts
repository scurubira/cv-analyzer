import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import OpenAI from 'openai';

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

        // 3. Initialize OpenAI Client pointing to local vLLM Server
        const openai = new OpenAI({
            baseURL: 'http://llm:8000/v1',
            apiKey: 'sk-local', // required but ignored by vLLM
        });

        const targetOutputLanguage = language === 'en' ? 'English' : 'Brazilian Portuguese';

        const prompt = `
        You are an expert Tech Recruiter and CV Optimizer.
        Analyze the candidate's CV text and their career objective.
        Your task is to analyze their CV and suggest improvements to tailor it to their objective.
        
        The career objective is: ${objective}
        The target language for the output MUST BE: ${targetOutputLanguage}.
        
        CV TEXT:
        ${text}

        RETURN YOUR RESPONSE ONLY AS A STRICTLY VALID JSON OBJECT MATCHING EXACTLY THIS SCHEMA. 
        DO NOT INCLUDE ANY MARKDOWN FORMATTING OR EXTRA TEXT OUTSIDE THE JSON.
        {
          "summary": {
            "original": "The original summary extracted from the CV text.",
            "suggested": "A highly tailored and improved summary matching the target objective."
          },
          "experiences": [
            {
              "id": 1,
              "company": "Company Name",
              "title": "Job Title",
              "originalBullets": ["Original bullet 1", "Original bullet 2"],
              "suggestedBullets": ["Tailored bullet 1 highlighting impact", "Tailored bullet 2 focusing on objective"]
            }
          ],
          "skills": {
            "original": ["Skill 1", "Skill 2"],
            "suggested": ["Skill 1", "Skill 2", "Missing Skill relevant to objective"]
          }
        }
        `;

        const response = await openai.chat.completions.create({
            model: 'distil-labs/Distil-Rost-Resume-Llama-3.2-3B-Instruct',
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2, // Lower temperature for more deterministic JSON
        });

        const rawOutput = response.choices[0]?.message?.content || "";

        let insights;
        try {
            // Handle edge cases where the local model might wrap in markdown
            const cleanedJson = rawOutput.replace(/```json/g, "").replace(/```/g, "").trim();
            insights = JSON.parse(cleanedJson);
        } catch (e) {
            console.error("Failed to parse JSON from local model:", rawOutput);
            throw new Error("Invalid format from local AI model");
        }

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
