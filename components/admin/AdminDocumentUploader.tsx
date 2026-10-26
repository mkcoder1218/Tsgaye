"use client";

import { useState } from "react";

type DocumentKind = "cv" | "resume";
type UploadResult = { ok?: boolean; error?: string; fileName?: string; commitUrl?: string | null };

export function AdminDocumentUploader() {
  const [files, setFiles] = useState<Record<DocumentKind, File | null>>({ cv: null, resume: null });
  const [uploading, setUploading] = useState<DocumentKind | null>(null);
  const [messages, setMessages] = useState<Partial<Record<DocumentKind, { type: "success" | "error"; text: string }>>>({});

  const upload = async (kind: DocumentKind) => {
    const file = files[kind];
    if (!file) {
      setMessages((current) => ({ ...current, [kind]: { type: "error", text: "Choose a PDF file first." } }));
      return;
    }

    setUploading(kind);
    setMessages((current) => ({ ...current, [kind]: undefined }));
    try {
      const body = new FormData();
      body.append("kind", kind);
      body.append("file", file);
      const response = await fetch("/api/admin/documents", { method: "POST", body });
      const result = (await response.json()) as UploadResult;
      if (!response.ok) throw new Error(result.error || "Upload failed.");
      setMessages((current) => ({
        ...current,
        [kind]: {
          type: "success",
          text: `${result.fileName} saved to GitHub. Vercel will publish it after the deployment completes.`,
        },
      }));
      setFiles((current) => ({ ...current, [kind]: null }));
    } catch (error) {
      setMessages((current) => ({
        ...current,
        [kind]: { type: "error", text: error instanceof Error ? error.message : "Upload failed." },
      }));
    } finally {
      setUploading(null);
    }
  };

  const cards: Array<{ kind: DocumentKind; title: string; description: string; path: string }> = [
    { kind: "cv", title: "Curriculum Vitae", description: "Upload the PDF linked to the Download CV button on the homepage.", path: "/cv.pdf" },
    { kind: "resume", title: "Résumé", description: "Upload the PDF linked to the Download Resume button on the homepage.", path: "/resume.pdf" },
  ];

  return (
    <section className="admin-content-editor" id="document-uploader">
      <div className="admin-section-heading">
        <div><span>04 / DOCUMENTS</span><h2>CV & résumé downloads</h2></div>
        <p>Manage the PDF files visitors can download from your hero section.</p>
      </div>
      <div className="admin-content-grid">
        {cards.map(({ kind, title, description, path }) => (
          <section className="admin-content-card" key={kind}>
            <header><h3>{title}</h3><span>PDF</span></header>
            <p>{description}</p>
            <p><a href={path} target="_blank" rel="noreferrer">Current public file ↗</a></p>
            <label className="admin-content-field">
              <span>Select PDF (max 4 MB)</span>
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setFiles((current) => ({ ...current, [kind]: file }));
                  setMessages((current) => ({ ...current, [kind]: undefined }));
                }}
              />
            </label>
            {files[kind] && <p>{files[kind]?.name} · {((files[kind]?.size ?? 0) / 1024 / 1024).toFixed(2)} MB</p>}
            {messages[kind] && <p className={`admin-content-message is-${messages[kind]?.type}`} role="status">{messages[kind]?.text}</p>}
            <div className="admin-content-actions">
              <button type="button" disabled={uploading !== null} onClick={() => void upload(kind)}>
                {uploading === kind ? "Uploading…" : `Upload ${kind === "cv" ? "CV" : "résumé"} PDF`}
              </button>
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
