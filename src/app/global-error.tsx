"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.25rem",
          textAlign: "center",
          padding: "2rem",
          fontFamily: "system-ui, sans-serif",
          background: "#faf6ef",
          color: "#1f1a14",
        }}
      >
        <p style={{ fontSize: "0.875rem", fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase", color: "#a67c2e" }}>
          Error
        </p>
        <h1 style={{ maxWidth: "32rem", fontSize: "1.875rem", fontWeight: 600 }}>Something went wrong</h1>
        <p style={{ maxWidth: "28rem", opacity: 0.75 }}>
          We hit an unexpected error loading the site. Please try again.
        </p>
        <button
          onClick={reset}
          style={{
            borderRadius: "9999px",
            background: "#d4af37",
            padding: "0.75rem 1.5rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#1f1a14",
            border: "none",
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
