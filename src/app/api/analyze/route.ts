import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';

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

        // TODO: Send to OpenAI / Gemini
        // For now, returning Mock Data to design the incredible UI

        // Simulating API latency
        await new Promise(resolve => setTimeout(resolve, 2500));

        const mockInsightsEn = {
            summary: {
                original: "Passionate developer looking for opportunities in the tech industry.",
                suggested: "Results-driven Software Engineer with 5+ years of experience specializing in React and Next.js, looking to leverage my expertise in scalable architectures at a forward-thinking Fintech company."
            },
            experiences: [
                {
                    id: 1,
                    company: "Tech Solutions Inc.",
                    title: "Frontend Developer",
                    originalBullets: [
                        "Built web applications using React.",
                        "Fixed bugs and improved performance."
                    ],
                    suggestedBullets: [
                        "Architected and deployed responsive web applications using React and Next.js, decreasing load times by 40%.",
                        "Spearheaded the migration to a modern tech stack, resolving over 50+ critical bugs and improving overall system stability."
                    ]
                },
                {
                    id: 2,
                    company: "Creative Agency",
                    title: "Web Intern",
                    originalBullets: [
                        "Helped in making websites.",
                        "Worked with the design team."
                    ],
                    suggestedBullets: [
                        "Collaborated cross-functionally with UI/UX designers to implement pixel-perfect user interfaces, boosting user engagement by 15%.",
                        "Assisted in developing component libraries utilized across 3+ client projects."
                    ]
                }
            ],
            skills: {
                original: ["JavaScript", "HTML", "CSS"],
                suggested: ["TypeScript", "React.js", "Next.js", "State Management", "Performance Optimization"]
            }
        };

        const mockInsightsPt = {
            summary: {
                original: "Desenvolvedor apaixonado em busca de oportunidades na indústria de tecnologia.",
                suggested: "Engenheiro de Software orientado a resultados com mais de 5 anos de experiência focado em React e Next.js, buscando aplicar minha expertise em arquiteturas escaláveis em uma empresa inovadora do setor Fintech."
            },
            experiences: [
                {
                    id: 1,
                    company: "Tech Solutions Inc.",
                    title: "Desenvolvedor Frontend",
                    originalBullets: [
                        "Construiu aplicações web usando React.",
                        "Corrigiu bugs e melhorou a performance."
                    ],
                    suggestedBullets: [
                        "Projetou e idealizou aplicações web responsivas usando React e Next.js, reduzindo o tempo de carregamento em 40%.",
                        "Liderou a migração para uma stack tecnológica moderna, resolvendo mais de 50 bugs críticos e aprimorando a estabilidade geral do sistema."
                    ]
                },
                {
                    id: 2,
                    company: "Creative Agency",
                    title: "Estagiário Web",
                    originalBullets: [
                        "Ajudou na criação de sites.",
                        "Trabalhou com a equipe de design."
                    ],
                    suggestedBullets: [
                        "Colaborou de forma multifuncional com designers UI/UX para implementar interfaces de usuário pixel-perfect, aumentando o engajamento do usuário em 15%.",
                        "Auxiliou no desenvolvimento de bibliotecas de componentes utilizadas em mais de 3 projetos de clientes."
                    ]
                }
            ],
            skills: {
                original: ["JavaScript", "HTML", "CSS"],
                suggested: ["TypeScript", "React.js", "Next.js", "Gerenciamento de Estado", "Otimização de Performance"]
            }
        };

        return NextResponse.json({
            success: true,
            originalTextLength: text.length,
            insights: language === 'en' ? mockInsightsEn : mockInsightsPt
        });

    } catch (error) {
        console.error('Error processing CV:', error);
        return NextResponse.json({ error: 'Failed to process CV' }, { status: 500 });
    }
}
