"use client";

import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { CVPdfDocument } from './CVPdf';
import { dictionaries, Language } from '../i18n/dictionaries';

export default function PDFExportButton({ insights, objective, lang }: { insights: any, objective: string, lang: Language }) {
    const t = dictionaries[lang].pdf;
    const tApp = dictionaries[lang].app;

    return (
        <PDFDownloadLink
            document={<CVPdfDocument data={insights} name="Applicant Name" targetRole={objective} labels={t} />}
            fileName={t.filename}
            style={{ textDecoration: 'none', display: 'block' }}
        >
            {({ blob, url, loading, error }: any) => {
                if (error) {
                    console.error("PDF Generation Error:", error);
                }
                return (
                    <button
                        className="btn-success mb-4"
                        style={{ width: "100%", padding: "1.25rem", fontSize: "1.1rem" }}
                        disabled={loading}
                    >
                        {loading ? tApp.generatingPdf : tApp.downloadPdf}
                    </button>
                );
            }}
        </PDFDownloadLink>
    );
}
