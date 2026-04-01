"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ padding: "2rem", textAlign: "center", fontFamily: "sans-serif" }}>
          <h2>Algo deu errado!</h2>
          <p>{error.message}</p>
          <button
            onClick={() => reset()}
            style={{ padding: "0.5rem 1rem", marginTop: "1rem" }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
