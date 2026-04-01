import { NextResponse } from 'next/server';
import React from 'react';
import { renderToStream } from '@react-pdf/renderer';
import CVPdfDocument from '../../../components/CVPdf';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { data, name, targetRole, labels, colorTheme } = body;
        
        // Ensure public/published directory exists
        const publishDir = path.join(process.cwd(), 'public', 'published');
        if (!fs.existsSync(publishDir)) {
            fs.mkdirSync(publishDir, { recursive: true });
        }
        
        // Generate a random ID to ensure unique filenames
        const id = Math.random().toString(36).substring(2, 9);
        const safeName = (name || 'CV').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-.]/g, '');
        const filename = `CV-${safeName}-${id}.pdf`;
        const filePath = path.join(publishDir, filename);
        
        const stream = await renderToStream(
            React.createElement(CVPdfDocument, {
                data: data,
                name,
                targetRole,
                labels: {
                    summary: 'Resumo',
                    experience: 'Experiência',
                    skills: 'Habilidades',
                    education: 'Educação',
                    languages: 'Idiomas',
                    certifications: 'Certificações',
                    references: 'Referências',
                    links: 'Links'
                },
                colorTheme
            }) as any
        );
        
        const writeStream = fs.createWriteStream(filePath);
        stream.pipe(writeStream);
        
        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
        
        return NextResponse.json({ success: true, url: `/cv/${filename}` });
    } catch (error: any) {
        console.error('Publish error:', error);
        return NextResponse.json({ error: 'Failed to publish CV' }, { status: 500 });
    }
}
