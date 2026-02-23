"use client";

import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { CVPdfDocument } from './CVPdf';

export default function PDFExportButton({ insights, objective }: { insights: any, objective: string }) {
    return (
        <PDFDownloadLink
            document={<CVPdfDocument data={insights} name="Applicant Name" targetRole={objective} />}
            fileName="Enhanced_CV.pdf"
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
                        {loading ? 'Generating PDF...' : 'Download PDF'}
                    </button>
                );
            }}
        </PDFDownloadLink>
    );
}
