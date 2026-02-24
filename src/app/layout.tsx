import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Benstech | Resume AI Analyzer",
  description: "AI-powered CV analysis and resume builder by Benstech",
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
