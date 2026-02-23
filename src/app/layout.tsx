import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CV Analyzer",
  description: "AI-powered CV analysis and resume builder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
