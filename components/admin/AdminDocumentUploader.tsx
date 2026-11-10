"use client";

import { useEffect, useState } from "react";
import type { DocumentLinks } from "@/lib/livePortfolio";

type DocumentKind = keyof DocumentLinks;
type Message = { type: "success" | "error"; text: string };

function fullLink(value: string): boolean {
  try {
    const parsed = new URL(value.trim());
    return (parsed.protocol === "https:" || parsed.protocol === "http:") && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}
const cards: Array<{ kind: DocumentKind; title: string; description: string }> = [
  { kind: "cv", title: "Curriculum Vitae", description: "Paste the public download link for the Download CV button." },
  { kind: "resume", title: "Résumé", description: "Paste the public download link for the Download Resume button." },
];

export function AdminDocumentUploader() {
  const [links, setLinks] = useState<DocumentLinks>({ cv: "", resume: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<DocumentKind | null>(null);
  const [messages, setMessages] = useState<Partial<Record<DocumentKind, Message>>>({});

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/documents", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const data = await response.json() as DocumentLinks & { error?: string };
        if (!response.ok) throw new Error(data.error || "Unable to load download links.");
        setLinks({ cv: fullLink(data.cv || "") ? data.cv : "", resume: fullLink(data.resume || "") ? data.resume : "" });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const text = error instanceof Error ? error.message : "Unable to load download links.";
        setMessages({ cv: { type: "error", text }, resume: { type: "error", text } });
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const save = async (kind: DocumentKind) => {
    setSaving(kind);
    setMessages((current) => ({ ...current, [kind]: undefined }));
    try {
      if (!fullLink(links[kind])) throw new Error("Paste a complete URL starting with https:// or http://.");
      const url = new URL(links[kind].trim());
      const response = await fetch("/api/admin/documents", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, url: url.toString() }),
      });
      const result = await response.json() as { error?: string; links?: DocumentLinks };
      if (!response.ok) throw new Error(result.error || "Could not save the link.");
      if (result.links) setLinks(result.links);
      setMessages((current) => ({
        ...current, [kind]: { type: "success", text: "Saved. Refresh the public page to use the new link." },
      }));
    } catch (error) {
      setMessages((current) => ({
        ...current, [kind]: { type: "error", text: error instanceof Error ? error.message : "Save failed." },
      }));
    } finally { setSaving(null); }
  };

  return (
    <section className="admin-content-editor" id="document-uploader">
      <div className="admin-section-heading">
        <div><span>04 / DOCUMENTS</span><h2>CV & résumé downloads</h2></div>
        <p>Manage the external download links used by your hero buttons.</p>
      </div>
      <div className="admin-content-grid">
        {cards.map(({ kind, title, description }) => (
          <section className="admin-content-card" key={kind}>
            <header><h3>{title}</h3><span>LINK</span></header>
            <p>{description}</p>
            <label className="admin-content-field">
              <span>Public download URL</span>
              <input type="url" placeholder="https://drive.google.com/file/d/your-file-id/view"
                value={links[kind]} disabled={loading || saving !== null}
                onChange={(event) => {
                  setLinks((current) => ({ ...current, [kind]: event.target.value }));
                  setMessages((current) => ({ ...current, [kind]: undefined }));
                }} />
            </label>
            {fullLink(links[kind]) && <p><a href={links[kind]} target="_blank" rel="noopener noreferrer">Preview link ↗</a></p>}
            {!loading && !fullLink(links[kind]) && <p>Paste the full public URL, including https://, to enable this download.</p>}
            {messages[kind] && <p className={`admin-content-message is-${messages[kind]?.type}`} role="status">{messages[kind]?.text}</p>}
            <div className="admin-content-actions">
              <button type="button" disabled={loading || saving !== null || !fullLink(links[kind])} onClick={() => void save(kind)}>
                {saving === kind ? "Saving…" : `Save ${kind === "cv" ? "CV" : "résumé"} link`}
              </button>
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
