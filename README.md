# 📄 Benstech Resume AI Analyzer

An advanced, AI-powered Resume (CV) analyzer and builder. This tool allows users to upload their existing PDF resumes, specify their target job role, and leverage the power of multiple Large Language Models (LLMs) to automatically optimize, rewrite, and tailor their experience bullets. Finally, it generates a beautifully formatted, ATS-friendly PDF in multiple languages and color themes.

[![Donate with PayPal](https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif)](https://www.paypal.com/donate/?business=TNX4CKHL52SDW&no_recurring=0&item_name=Seu+apoio+acelera+codigo+aberto.+Doe+e+impulsione+inovacoes+que+beneficiam+milhoes+de+devs+e+transformam.+Muito+Obrigado!&currency_code=BRL)

---

## ✨ Features

- **📄 PDF Parsing:** Automatically extracts text from uploaded PDF resumes.
- **🤖 Multi-Model AI Support:** Choose between Google Gemini (Default), Groq (Llama 3/Mixtral), OpenRouter, and Mistral AI models to analyze your CV.
- **🎯 Smart Optimization:** Rewrites resume bullet points to perfectly match a target job description or objective.
- **🌍 Multi-Language Support:** Generates the final tailored PDF in English, Portuguese, Spanish, French, or German.
- **🎨 Custom Styling:** Choose from various color themes (Slate, Emerald, Violet, Rose, Amber) for the exported PDF.
- **📱 Modern UI:** A sleek, dark-mode, glassmorphism interface built with Tailwind CSS.
- **🐳 Dockerized:** Fully containerized for easy and consistent local development.

## 🚀 Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose (Recommended)
- Node.js 18+ (if running locally without Docker)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/cv-analyzer.git
   cd cv-analyzer
   ```

2. **Environment Variables:**
   Create a `.env.local` file in the root directory and add your preferred API keys. You only need the key for the provider you intend to use.
   ```env
   # Google Gemini (Default & Recommended)
   GEMINI_API_KEY=your_gemini_api_key_here

   # Groq (Blazing fast Llama models)
   GROQ_API_KEY=your_groq_api_key_here

   # OpenRouter (Access to various models)
   OPENROUTER_API_KEY=your_openrouter_api_key_here

   # Mistral AI
   MISTRAL_API_KEY=your_mistral_api_key_here
   ```

3. **Run with Docker (Recommended):**
   ```bash
   docker-compose up -d --build
   ```
   The application will be available at [http://localhost:8004](http://localhost:8004).

### Running Locally (Without Docker)

If you prefer to run it without Docker:

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run the development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **PDF Generation:** [@react-pdf/renderer](https://react-pdf.org/)
- **PDF Parsing:** [pdf-parse](https://www.npmjs.com/package/pdf-parse)
- **AI SDK:** [@google/genai](https://www.npmjs.com/package/@google/genai) and standard fetch APIs for other LLMs.

## ❤️ Support & Donate

If this project helped you land your dream job or accelerated your development workflow, please consider making a donation! Your support helps maintain the open-source code and funds future innovations.

[![Donate with PayPal](https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif)](https://www.paypal.com/donate/?business=TNX4CKHL52SDW&no_recurring=0&item_name=Seu+apoio+acelera+codigo+aberto.+Doe+e+impulsione+inovacoes+que+beneficiam+milhoes+de+devs+e+transformam.+Muito+Obrigado!&currency_code=BRL)

**Thank you!**

## 📄 License

This project is licensed under the MIT License.
