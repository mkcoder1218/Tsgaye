"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Could not connect to the login service.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="admin-login-shell">
      <section className="admin-login-card">
        <p className="admin-eyebrow">Private access</p>
        <h1>Portfolio admin.</h1>
        <p className="admin-login-copy">
          Sign in to upload and organize Tsegaye&apos;s portfolio images.
        </p>

        <form onSubmit={submit} className="admin-login-form">
          <label>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className="admin-global-error">{error}</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
            <span>↗</span>
          </button>
        </form>

        <a href="/" className="admin-login-back">
          ← Back to portfolio
        </a>
      </section>
    </main>
  );
}
