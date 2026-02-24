"use client";

import { useState, useRef, useMemo } from "react";
import { UploadCloud, FileText, ArrowRight, Sparkles, Check, X, RefreshCw, FileDown, Globe } from "lucide-react";
import dynamic from "next/dynamic";
import { dictionaries, Language } from "../i18n/dictionaries";

const PDFExportButton = dynamic(
  () => import("../components/PDFExportButton"),
  {
    ssr: false,
    loading: () => <button className="btn-success mb-4" style={{ width: "100%", padding: "1.25rem", fontSize: "1.1rem" }} disabled>Loading PDF Engine...</button>,
  }
);

type InsightData = {
  summary: { original: string, suggested: string };
  experiences: {
    id: number;
    company: string;
    title: string;
    originalBullets: string[];
    suggestedBullets: string[];
  }[];
  skills: { original: string[], suggested: string[] };
};

export default function Home() {
  const [phase, setPhase] = useState<'upload' | 'analyzing' | 'review' | 'export'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [objective, setObjective] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [selections, setSelections] = useState<{
    summary: 'accepted' | 'declined' | null;
    experiences: Record<number, 'accepted' | 'declined' | null>;
  }>({ summary: null, experiences: {} });
  const [lang, setLang] = useState<Language>('pt');

  // Output configuration state
  const [cvLang, setCvLang] = useState<Language>('pt');
  const [filename, setFilename] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = dictionaries[lang].app;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      } else {
        alert(t.errorUpload);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !objective) return;

    setPhase('analyzing');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('objective', objective);
      formData.append('language', cvLang); // use cvLang instead of UI lang

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Analysis failed');

      const data = await res.json();
      setInsights(data.insights);
      setSelections({ summary: null, experiences: {} });
      setPhase('review');
    } catch (error) {
      console.error(error);
      alert(t.errorAnalyze);
      setPhase('upload');
    }
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'pt' : 'en');
  };

  const handleSelectSummary = (status: 'accepted' | 'declined') => {
    setSelections(prev => ({ ...prev, summary: status }));
  };

  const handleSelectExperience = (id: number, status: 'accepted' | 'declined') => {
    setSelections(prev => ({
      ...prev,
      experiences: { ...prev.experiences, [id]: status }
    }));
  };

  const exportData = useMemo(() => {
    if (!insights) return null;
    return {
      ...insights,
      summary: {
        ...insights.summary,
        suggested: selections.summary === 'declined' ? insights.summary.original : insights.summary.suggested
      },
      experiences: insights.experiences.map(exp => ({
        ...exp,
        suggestedBullets: selections.experiences[exp.id] === 'declined' ? exp.originalBullets : exp.suggestedBullets
      }))
    };
  }, [insights, selections]);

  return (
    <main className="container relative">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--glass-glow)] transition-all text-sm font-medium"
        >
          <Globe size={16} />
          {lang === 'en' ? 'PT-BR' : 'EN'}
        </button>
      </div>

      {/* Header */}
      <div className={`text-center mt-8 mb-8 animate-slide-up ${phase !== 'upload' ? 'header-shrink' : ''}`} style={{ animationDelay: "0.1s" }}>
        <h1 style={{ fontSize: phase === 'upload' ? "3.5rem" : "2.5rem", transition: "all 0.5s ease" }}>
          {t.title} <br />
          <span className="text-gradient hover-glow">{t.subtitle}</span>
        </h1>
        {phase === 'upload' && (
          <p className="subtitle" style={{ maxWidth: "600px", margin: "1rem auto" }}>
            {t.description}
          </p>
        )}
      </div>

      {/* Upload Phase */}
      {phase === 'upload' && (
        <div className="glass-panel animate-slide-up" style={{ maxWidth: "800px", margin: "0 auto", animationDelay: "0.2s" }}>
          <div className="input-group">
            <label className="input-label">{t.step1}</label>
            <div
              className={`file-upload-zone ${isDragging ? "drag-active" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                className="hidden-input"
                ref={fileInputRef}
                accept="application/pdf"
                onChange={handleFileChange}
              />

              {file ? (
                <div className="flex items-center justify-center gap-4">
                  <FileText size={48} className="file-icon" style={{ animation: "none", color: "var(--success)" }} />
                  <div style={{ textAlign: "left" }}>
                    <h3 style={{ marginBottom: "0.2rem" }}>{file.name}</h3>
                    <p className="subtitle" style={{ fontSize: "0.9rem" }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              ) : (
                <>
                  <UploadCloud size={48} className="file-icon" />
                  <h3>{t.dragDrop}</h3>
                  <p className="subtitle" style={{ fontSize: "0.95rem" }}>{t.browse}</p>
                </>
              )}
            </div>
          </div>

          <div className="input-group mt-8">
            <label className="input-label">{t.step2}</label>
            <textarea
              className="textarea-input"
              placeholder={t.objectivePlaceholder}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
            />
          </div>

          <div className="input-group mt-8">
            <label className="input-label">{t.step3}</label>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs text-[var(--glass-border)] mb-1 block">{t.cvLangLabel}</label>
                <select
                  className="textarea-input"
                  style={{ minHeight: 'auto', padding: '0.8rem' }}
                  value={cvLang}
                  onChange={(e) => setCvLang(e.target.value as Language)}
                >
                  <option value="pt">Português (Brasil)</option>
                  <option value="en">English (US)</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-[var(--glass-border)] mb-1 block">{t.filenameLabel}</label>
                <input
                  type="text"
                  className="textarea-input"
                  style={{ minHeight: 'auto', padding: '0.8rem' }}
                  placeholder={dictionaries[cvLang].pdf.filename}
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              className="btn-primary"
              disabled={!file || !objective.trim()}
              onClick={handleAnalyze}
              style={{ width: "100%", padding: "1.25rem" }}
            >
              <Sparkles size={20} />
              {t.analyzeBtn}
              <ArrowRight size={20} style={{ marginLeft: "auto" }} />
            </button>
          </div>
        </div>
      )}

      {/* Analyzing Phase */}
      {phase === 'analyzing' && (
        <div className="text-center animate-slide-up" style={{ marginTop: "10vh" }}>
          <div className="radar-spinner"></div>
          <h2 className="mt-8 text-gradient">{t.scanning}</h2>
          <p className="subtitle">{t.matching} &apos;{objective}&apos;</p>
        </div>
      )}

      {/* Review Phase */}
      {phase === 'review' && insights && (
        <div className="animate-slide-up" style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div className="glass-panel mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-gradient" size={24} />
              <h2>{t.summary}</h2>
            </div>
            <div className="diff-view">
              <div className="diff-original">
                <span className="badge badge-error">{t.current}</span>
                <p>{insights.summary.original}</p>
              </div>
              <div className="diff-suggested mt-4">
                <span className="badge badge-success">{t.suggestion}</span>
                <p>{insights.summary.suggested}</p>
              </div>
            </div>
            <div className="action-bar mt-4 flex gap-4">
              <button
                className={`btn-outline flex-1 ${selections.summary === 'declined' ? 'opacity-50' : ''}`}
                style={selections.summary === 'declined' ? { borderColor: 'var(--error)', color: 'var(--error)' } : {}}
                onClick={() => handleSelectSummary('declined')}
              >
                <X size={16} /> {t.decline}
              </button>
              <button
                className={`btn-success flex-1 ${selections.summary === 'accepted' ? 'opacity-50' : ''}`}
                style={selections.summary === 'accepted' ? { transform: 'scale(0.98)' } : {}}
                onClick={() => handleSelectSummary('accepted')}
              >
                <Check size={16} /> {selections.summary === 'accepted' ? 'Accepted' : t.accept}
              </button>
            </div>
          </div>

          {insights.experiences.map((exp, idx) => (
            <div key={exp.id} className="glass-panel mb-8" style={{ animationDelay: `${idx * 0.1}s` }}>
              <h3 className="mb-2">{exp.title}</h3>
              <p className="subtitle mb-4 text-gradient">{exp.company}</p>

              <div className="diff-view">
                <div className="diff-suggested mt-4">
                  <span className="badge badge-success">{t.tailored}</span>
                  <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
                    {exp.suggestedBullets.map((bullet, i) => (
                      <li key={i} style={{ marginBottom: "0.5rem", lineHeight: "1.5" }}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="action-bar mt-4 flex gap-4">
                <button
                  className={`btn-outline flex-1 ${selections.experiences[exp.id] === 'declined' ? 'opacity-50' : ''}`}
                  style={selections.experiences[exp.id] === 'declined' ? { borderColor: 'var(--error)', color: 'var(--error)' } : {}}
                  onClick={() => handleSelectExperience(exp.id, 'declined')}
                >
                  <X size={16} /> {t.decline}
                </button>
                <button
                  className={`btn-success flex-1 ${selections.experiences[exp.id] === 'accepted' ? 'opacity-50' : ''}`}
                  style={selections.experiences[exp.id] === 'accepted' ? { transform: 'scale(0.98)' } : {}}
                  onClick={() => handleSelectExperience(exp.id, 'accepted')}
                >
                  <Check size={16} /> {selections.experiences[exp.id] === 'accepted' ? 'Accepted' : t.applyToCv}
                </button>
              </div>
            </div>
          ))}

          <div className="text-center mt-8 mb-8 pt-8" style={{ borderTop: "1px solid var(--glass-border)" }}>
            <button className="btn-primary" onClick={() => setPhase('export')} style={{ padding: "1.2rem 3rem", fontSize: "1.1rem" }}>
              <FileDown size={24} />
              {t.generateBtn}
            </button>
          </div>
        </div>
      )}

      {/* Export Phase */}
      {phase === 'export' && insights && (
        <div className="glass-panel text-center animate-slide-up" style={{ maxWidth: "600px", margin: "10vh auto" }}>
          <FileDown size={64} className="text-gradient mx-auto mb-4" />
          <h2 className="mb-4">{t.cvReady}</h2>
          <p className="subtitle mb-8">{t.compiledMsg}</p>

          <PDFExportButton
            insights={exportData}
            objective={objective}
            lang={cvLang}
            customFilename={filename || dictionaries[cvLang].pdf.filename}
          />

          <button className="btn-outline" onClick={() => setPhase('review')} style={{ width: "100%" }}>
            {t.backToReview}
          </button>
        </div>
      )}
    </main>
  );
}

