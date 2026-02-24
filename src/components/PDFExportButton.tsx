"use client";

import React, { useMemo } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { CVPdfDocument } from './CVPdf';
import { dictionaries, Language } from '../i18n/dictionaries';

export default function PDFExportButton({ insights, objective, lang }: { insights: any, objective: string, lang: Language }) {
    const t = dictionaries[lang].pdf;
    const tApp = dictionaries[lang].app;

    const document = useMemo(() => (
        <CVPdfDocument data={insights} name="Applicant Name" targetRole={objective} labels={t} />
    ), [insights, objective, t]);

    return (
        <PDFDownloadLink
            document={document}
            fileName={t.filename}
            style={{ textDecoration: 'none', display: 'block' }}
        >
            {({ blob, url, loading, error }: any) => {
                if (error) {
                    console.error("PDF Generation Error:", error);
                }
                return (
                    <div
                        className={`btn-success mb-4 flex items-center justify-center ${loading ? 'opacity-50' : ''}`}
                        style={{ width: "100%", padding: "1.25rem", fontSize: "1.1rem", cursor: loading ? 'not-allowed' : 'pointer', pointerEvents: loading ? 'none' : 'auto' }}
                    >
                        {loading ? tApp.generatingPdf : tApp.downloadPdf}
                    </div>
                );
            }}
        </PDFDownloadLink>
    );
}
