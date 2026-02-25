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

const DonateButton = () => (
  <div className="mt-8 flex justify-center">
    <form action="https://www.paypal.com/donate" method="post" target="_top">
      <input type="hidden" name="business" value="TNX4CKHL52SDW" />
      <input type="hidden" name="no_recurring" value="0" />
      <input type="hidden" name="item_name" value="Seu apoio acelera código aberto. Doe e impulsione inovações que beneficiam milhões de devs e transformam. Muito Obrigado !" />
      <input type="hidden" name="currency_code" value="BRL" />
      <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
      <img alt="" src="https://www.paypal.com/en_BR/i/scr/pixel.gif" width="1" height="1" />
    </form>
  </div>
);

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
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
  const [filename, setFilename] = useState("");
  const [colorTheme, setColorTheme] = useState('slate');
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [editableTitles, setEditableTitles] = useState<string[]>([]);
  const [newTitleInput, setNewTitleInput] = useState('');
  const [socialNetworks, setSocialNetworks] = useState({ github: '', portfolio: '', twitter: '', instagram: '', linkedin: '' });
  const [showSocialCard, setShowSocialCard] = useState(true);

  const THEMES_PREVIEW = [
    { id: 'slate', color: '#1E293B', ring: '#38BDF8' },
    { id: 'emerald', color: '#064E3B', ring: '#34D399' },
    { id: 'violet', color: '#4C1D95', ring: '#A78BFA' },
    { id: 'rose', color: '#881337', ring: '#FB7185' },
    { id: 'amber', color: '#78350F', ring: '#FBBF24' },
  ];

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
      formData.append('language', cvLang);
      formData.append('model', selectedModel);

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Analysis failed');

      const data = await res.json();
      setInsights(data.insights);
      setSelections({ summary: null, experiences: {} });
      setEditableTitles(data.insights.targetTitles || []);
      setSelectedTitle(null);
      setCustomTitle('');
      setNewTitleInput('');
      setShowSocialCard(true);
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
    const finalTitle = customTitle.trim() || selectedTitle || editableTitles[0] || '';
    return {
      ...insights,
      selectedTitle: finalTitle,
      socialNetworks: {
        github: socialNetworks.github || undefined,
        portfolio: socialNetworks.portfolio || undefined,
        twitter: socialNetworks.twitter || undefined,
        instagram: socialNetworks.instagram || undefined,
        linkedin: socialNetworks.linkedin || undefined,
      },
      summary: {
        ...insights.summary,
        suggested: selections.summary === 'declined' ? insights.summary.original : insights.summary.suggested
      },
      experiences: insights.experiences.map(exp => ({
        ...exp,
        suggestedBullets: selections.experiences[exp.id] === 'declined' ? exp.originalBullets : exp.suggestedBullets
      }))
    };
  }, [insights, selections, selectedTitle, customTitle, socialNetworks, editableTitles]);

  return (
    <main className="container relative">
      <div className="absolute top-4 right-4 z-10 flex gap-2 items-center">
        {([
          {
            code: 'pt', label: 'Português', flag: (
              <svg width="40" height="28" viewBox="0 0 40 28"><rect width="40" height="28" fill="#009b3a" /><polygon points="20,3 37,14 20,25 3,14" fill="#fedf00" /><circle cx="20" cy="14" r="6.5" fill="#002776" /><path d="M14,15 Q20,11 26,16" stroke="white" strokeWidth="1" fill="none" /></svg>
            )
          },
          {
            code: 'en', label: 'English', flag: (
              <svg width="40" height="28" viewBox="0 0 40 28"><rect width="40" height="28" fill="#fff" /><rect width="40" height="2.15" y="0" fill="#B22234" /><rect width="40" height="2.15" y="4.3" fill="#B22234" /><rect width="40" height="2.15" y="8.6" fill="#B22234" /><rect width="40" height="2.15" y="12.9" fill="#B22234" /><rect width="40" height="2.15" y="17.2" fill="#B22234" /><rect width="40" height="2.15" y="21.5" fill="#B22234" /><rect width="40" height="2.15" y="25.8" fill="#B22234" /><rect width="18" height="15.05" fill="#3C3B6E" /><path d="M3,2h.1M9,2h.1M15,2h.1 M6,4.5h.1M12,4.5h.1 M3,7h.1M9,7h.1M15,7h.1 M6,9.5h.1M12,9.5h.1 M3,12h.1M9,12h.1M15,12h.1" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>
            )
          },
          {
            code: 'es', label: 'Español', flag: (
              <svg width="40" height="28" viewBox="0 0 40 28"><rect width="40" height="28" fill="#AA151B" /><rect y="7" width="40" height="14" fill="#F1BF00" /></svg>
            )
          },
          {
            code: 'fr', label: 'Français', flag: (
              <svg width="40" height="28" viewBox="0 0 40 28"><rect width="40" height="28" fill="#ED2939" /><rect width="27" height="28" fill="#fff" /><rect width="13" height="28" fill="#002395" /></svg>
            )
          },
          {
            code: 'de', label: 'Deutsch', flag: (
              <svg width="40" height="28" viewBox="0 0 40 28"><rect width="40" height="28" fill="#FFCE00" /><rect width="40" height="19" fill="#DD0000" /><rect width="40" height="9" fill="#000" /></svg>
            )
          },
        ] as const).map(({ code, label, flag }) => (
          <button
            key={code}
            onClick={() => setLang(code)}
            title={label}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              opacity: lang === code ? 1 : 0.3,
              transition: 'opacity 0.2s ease',
              display: 'flex',
              filter: lang === code ? 'drop-shadow(0 0 4px rgba(255,255,255,0.4))' : 'none',
            }}
          >
            {flag}
          </button>
        ))}
      </div>


      {/* Header */}
      <div className={`text-center mt-8 mb-8 animate-slide-up ${phase !== 'upload' ? 'header-shrink' : ''}`} style={{ animationDelay: "0.1s" }}>
        <h1 style={{ fontSize: phase === 'upload' ? "3.5rem" : "2.5rem", transition: "all 0.5s ease" }}>
          {t.title} <br /><span className="text-gradient hover-glow">{t.subtitle}</span>
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
                  <option value="es">Español (ES)</option>
                  <option value="fr">Français (FR)</option>
                  <option value="de">Deutsch (DE)</option>
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
              <div className="flex-1">
                <label className="text-xs text-[var(--glass-border)] mb-1 block">🤖 Modelo IA</label>
                <select
                  className="textarea-input"
                  style={{ minHeight: 'auto', padding: '0.8rem' }}
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                >
                  <optgroup label="✨ Google Gemini">
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash ⚡ (recomendado)</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (preview)</option>
                  </optgroup>
                  <optgroup label="🦙 Groq (gratuito + rápido)">
                    <option value="groq:llama-3.3-70b-versatile">Llama 3.3 70B</option>
                    <option value="groq:llama-3.1-8b-instant">Llama 3.1 8B (rápido)</option>
                    <option value="groq:mixtral-8x7b-32768">Mixtral 8x7B</option>
                    <option value="groq:gemma2-9b-it">Gemma 2 9B</option>
                  </optgroup>
                  <optgroup label="🔀 OpenRouter (vários modelos)">
                    <option value="openrouter:meta-llama/llama-3.1-8b-instruct:free">Llama 3.1 8B (grátis)</option>
                    <option value="openrouter:mistralai/mistral-7b-instruct:free">Mistral 7B (grátis)</option>
                    <option value="openrouter:google/gemma-3-12b-it:free">Gemma 3 12B (grátis)</option>
                    <option value="openrouter:anthropic/claude-3-haiku">Claude 3 Haiku</option>
                    <option value="openrouter:openai/gpt-4o-mini">GPT-4o Mini</option>
                  </optgroup>
                  <optgroup label="🇫🇷 Mistral AI">
                    <option value="mistral:mistral-small-latest">Mistral Small</option>
                    <option value="mistral:open-mistral-nemo">Mistral Nemo (grátis)</option>
                  </optgroup>
                  <optgroup label="⚙️ Sem IA">
                    <option value="none">Sem IA (só extração do PDF)</option>
                  </optgroup>
                </select>
              </div>
            </div>

            <div className="mt-8">
              <label className="text-xl font-bold text-white mb-6 block text-center">{t.colorLabel}</label>
              <div className="flex flex-wrap justify-center gap-8">
                {THEMES_PREVIEW.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => setColorTheme(theme.id)}
                    className={`rounded-full flex items-center justify-center w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] transition-all duration-300 ${colorTheme === theme.id ? 'scale-110 shadow-[0_0_25px_rgba(255,255,255,0.4)] ring-8 ring-offset-8 ring-offset-[#0f172a]' : 'hover:scale-110 shadow-xl'}`}
                    style={{
                      backgroundColor: theme.color,
                      ...(colorTheme === theme.id ? { borderColor: theme.ring, ringColor: theme.ring } : {})
                    }}
                    title={theme.id}
                  >
                    <span className="text-sm font-bold" style={{ color: theme.color }}>
                      xxx
                    </span>
                  </button>

                ))}
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
            <DonateButton />
          </div>
        </div>
      )
      }

      {/* Analyzing Phase */}
      {
        phase === 'analyzing' && (
          <div className="text-center animate-slide-up" style={{ marginTop: "10vh" }}>
            <div className="radar-spinner"></div>
            <h2 className="mt-8 text-gradient">{t.scanning}</h2>
            <p className="subtitle">{t.matching} &apos;{objective}&apos;</p>
          </div>
        )
      }

      {/* Review Phase */}
      {
        phase === 'review' && insights && (
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

            {/* Job Title Editor Card */}
            <div className="glass-panel mb-6" style={{ border: '1px solid var(--accent)', borderRadius: '1.2rem', padding: '1.5rem' }}>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="text-gradient" size={18} />
                <h3 style={{ margin: 0, fontSize: '1rem' }}>{t.titleLabel}</h3>
              </div>
              <p className="subtitle mb-4" style={{ fontSize: '0.8rem' }}>{t.titleSuggestion}</p>

              {/* Pill selector */}
              <div className="flex flex-wrap gap-2 mb-4">
                {editableTitles.map((title: string, i: number) => (
                  <div
                    key={i}
                    onClick={() => setSelectedTitle(title)}
                    className="flex items-center gap-1 cursor-pointer transition-all"
                    style={{
                      padding: '0.45rem 1rem',
                      borderRadius: '999px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      border: '1.5px solid',
                      borderColor: (selectedTitle === title || (!selectedTitle && i === 0)) ? 'var(--accent)' : 'var(--glass-border)',
                      background: (selectedTitle === title || (!selectedTitle && i === 0)) ? 'var(--accent)' : 'transparent',
                      color: (selectedTitle === title || (!selectedTitle && i === 0)) ? '#000' : 'var(--text-secondary)',
                      boxShadow: (selectedTitle === title || (!selectedTitle && i === 0)) ? '0 0 12px var(--accent)40' : 'none',
                    }}
                  >
                    {(selectedTitle === title || (!selectedTitle && i === 0)) && <span style={{ marginRight: 4 }}>✓</span>}
                    <span>{title}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditableTitles(prev => { const next = prev.filter((_, idx) => idx !== i); if (selectedTitle === title) setSelectedTitle(next[0] || null); return next; }); }}
                      style={{ marginLeft: 6, opacity: 0.5, fontSize: '0.7rem', lineHeight: 1 }}
                    >✕</button>
                  </div>
                ))}
              </div>

              {/* Add custom */}
              <div className="flex gap-2">
                <input
                  type="text"
                  className="glass-input flex-1"
                  style={{ fontSize: '0.85rem', padding: '0.6rem 0.9rem' }}
                  placeholder={t.titleCustom}
                  value={newTitleInput}
                  onChange={(e) => setNewTitleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newTitleInput.trim()) {
                      setEditableTitles(prev => [...prev, newTitleInput.trim()]);
                      setSelectedTitle(newTitleInput.trim());
                      setNewTitleInput('');
                    }
                  }}
                />
                <button
                  className="btn-outline"
                  style={{ fontSize: '0.82rem', padding: '0.6rem 1rem', borderRadius: '0.6rem' }}
                  onClick={() => {
                    if (newTitleInput.trim()) {
                      setEditableTitles(prev => [...prev, newTitleInput.trim()]);
                      setSelectedTitle(newTitleInput.trim());
                      setNewTitleInput('');
                    }
                  }}
                >+ Add</button>
              </div>
            </div>

            {/* Social Networks Card */}
            {showSocialCard && (
              <div className="glass-panel mb-6" style={{ border: '1px solid var(--glass-border)', borderRadius: '1.2rem', padding: '1.5rem' }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Globe size={18} className="text-gradient" />
                    <h3 style={{ margin: 0, fontSize: '1rem' }}>{t.socialNetworksTitle}</h3>
                  </div>
                  <button className="btn-outline text-sm px-3 py-1" style={{ borderRadius: '999px', fontSize: '0.75rem' }} onClick={() => setShowSocialCard(false)}>{t.skip}</button>
                </div>
                <p className="subtitle mb-5" style={{ fontSize: '0.8rem' }}>{t.socialNetworksSubtitle}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {([
                    { key: 'linkedin', icon: '💼', label: 'LinkedIn', placeholder: 'linkedin.com/in/username' },
                    { key: 'github', icon: '🐙', label: 'GitHub', placeholder: 'github.com/username' },
                    { key: 'portfolio', icon: '🌐', label: 'Portfolio', placeholder: 'yoursite.com' },
                    { key: 'twitter', icon: '🐦', label: 'Twitter / X', placeholder: '@handle' },
                    { key: 'instagram', icon: '📸', label: 'Instagram', placeholder: '@handle' },
                  ] as const).map(({ key, icon, label, placeholder }) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', padding: '0.6rem 1rem', border: '1px solid var(--glass-border)' }}>
                      <span style={{ fontSize: '1.1rem', width: 24, textAlign: 'center' }}>{icon}</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', width: 80, flexShrink: 0 }}>{label}</span>
                      <input
                        type="text"
                        style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                        placeholder={placeholder}
                        value={socialNetworks[key]}
                        onChange={(e) => setSocialNetworks(p => ({ ...p, [key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center mt-8 mb-8 pt-8" style={{ borderTop: "1px solid var(--glass-border)" }}>
              <button className="btn-primary" onClick={() => setPhase('export')} style={{ padding: "1.2rem 3rem", fontSize: "1.1rem" }}>
                <FileDown size={24} />
                {t.generateBtn}
              </button>
            </div>
          </div>
        )
      }

      {/* Export Phase */}
      {
        phase === 'export' && insights && (
          <div className="glass-panel text-center animate-slide-up" style={{ maxWidth: "600px", margin: "10vh auto" }}>
            <FileDown size={64} className="text-gradient mx-auto mb-4" />
            <h2 className="mb-4">{t.cvReady}</h2>
            <p className="subtitle mb-8">{t.compiledMsg}</p>

            <PDFExportButton
              insights={exportData}
              objective={objective}
              lang={cvLang}
              customFilename={filename || dictionaries[cvLang].pdf.filename}
              colorTheme={colorTheme}
            />

            <button className="btn-outline" onClick={() => setPhase('review')} style={{ width: "100%" }}>
              {t.backToReview}
            </button>

            <DonateButton />
          </div>
        )
      }

      {/* Footer */}
      <footer className="w-full text-center py-6 mt-8 border-t border-[var(--glass-border)] text-[var(--glass-text)]">
        <p className="text-sm">
          powered by <a href="http://www.benstech.com.br" target="_blank" rel="noopener noreferrer" className="font-semibold tracking-wide text-[var(--accent)] hover:opacity-80 transition-opacity">Benstech</a>
        </p>
      </footer>
    </main >
  );
}

