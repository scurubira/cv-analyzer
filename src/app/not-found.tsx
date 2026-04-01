"use client";

import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ padding: "4rem", textAlign: "center", fontFamily: "sans-serif" }}>
      <h2>Página não encontrada</h2>
      <p>A página que você está procurando não existe.</p>
      <Link
        href="/"
        style={{
          display: "inline-block",
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#2563EB",
          color: "white",
          textDecoration: "none",
          borderRadius: "0.375rem"
        }}
      >
        Voltar ao início
      </Link>
    </div>
  );
}
