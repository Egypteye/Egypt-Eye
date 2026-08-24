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
          background: "#f9f4e8",
          color: "#1c2740",
        }}
      >
        <p style={{ fontSize: "0.875rem", fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase", color: "#5b6e23" }}>
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
            background: "#d7e6a6",
            padding: "0.75rem 1.5rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#1c2740",
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
