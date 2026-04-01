import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Resend } from 'resend';

// Initialize Resend - you will need to add RESEND_API_KEY to your .env.local
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // We should only process .pdf files
  if (!filename.endsWith('.pdf')) {
    return new NextResponse('Not found', { status: 404 });
  }

  const publishDir = path.join(process.cwd(), 'public', 'published');
  const filePath = path.join(publishDir, filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return new NextResponse('CV not found', { status: 404 });
  }

  // Get recipient email from environment variable, default to a sensible placeholder
  const recipientEmail = process.env.NOTIFICATION_EMAIL || 'seu-email@exemplo.com';

  // Attempt to send email notification (non-blocking)
  if (process.env.RESEND_API_KEY) {
    // Send email asynchronously so we don't delay the PDF loading
    resend.emails.send({
      from: 'CV Tracker <onboarding@resend.dev>', // Default resend testing email
      to: [recipientEmail],
      subject: `Alerta: Seu CV foi acessado!`,
      html: `
        <h2>Alguém está visualizando o seu CV!</h2>
        <p>O arquivo <strong>${filename}</strong> acabou de ser aberto no navegador.</p>
        <p>Acesse <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cv/${filename}">este link</a> para visualizar.</p>
        <p><small>Data do acesso: ${new Date().toLocaleString('pt-BR')}</small></p>
      `
    }).catch(error => {
      console.error('Failed to send Resend email notification:', error);
    });
  } else {
    console.warn('RESEND_API_KEY is not set. Real email notification skipped.');
  }

  try {
    // Read and serve the PDF static file
    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        // Optional: you can force inline display
        'Content-Disposition': `inline; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error('Error serving PDF:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
