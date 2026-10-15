"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./AdminImageLibrary.module.css";

const categories = [
  { slug: "hero-image", label: "Hero Image" },
  { slug: "about-me", label: "About Me" },
  { slug: "brand-identity", label: "Brand Identity" },
  { slug: "marketing-design", label: "Marketing Design" },
  { slug: "print-editorial", label: "Print & Editorial" },
  { slug: "digital-motion", label: "Digital & Motion" },
];
type Image = { fileId: string; name: string; url: string; filePath: string; size?: number; createdAt?: string };
type Auth = { token: string; expire: number; signature: string; publicKey: string; error?: string };

export function AdminImageLibrary({ refreshKey }: { refreshKey: number }) {
  const [images, setImages] = useState<Image[]>([]);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const replaceInput = useRef<HTMLInputElement>(null);
  const replacing = useRef<Image | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/images", { cache: "no-store" });
      const data = (await response.json()) as { images?: Image[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Could not load images.");
      setImages(data.images ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load images.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load, refreshKey]);

  const visible = useMemo(() => images.filter((image) => {
    const matchCategory = category === "all" || image.filePath.startsWith(`/portfolio/${category}/`);
    return matchCategory && image.name.toLowerCase().includes(query.trim().toLowerCase());
  }), [category, images, query]);

  async function mutate(image: Image, method: "DELETE" | "PATCH", nextCategory?: string) {
    setBusy(image.fileId);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/images", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: image.fileId, filePath: image.filePath, category: nextCategory }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Image update failed.");
      setMessage(method === "DELETE" ? "Image deleted." : "Image category updated.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Image update failed.");
    } finally {
      setBusy(null);
    }
  }

  async function replace(file: File, image: Image) {
    if (!file.type.startsWith("image/")) { setError("Choose an image file."); return; }
    setBusy(image.fileId);
    setError("");
    setMessage("");
    try {
      const authResponse = await fetch("/api/imagekit-auth", { cache: "no-store" });
      const auth = (await authResponse.json()) as Auth;
      if (!authResponse.ok) throw new Error(auth.error || "Could not authorize upload.");
      const form = new FormData();
      form.append("file", file);
      form.append("fileName", image.name);
      form.append("publicKey", auth.publicKey);
      form.append("token", auth.token);
      form.append("expire", String(auth.expire));
      form.append("signature", auth.signature);
      form.append("folder", image.filePath.slice(0, image.filePath.lastIndexOf("/")));
      form.append("useUniqueFileName", "false");
      form.append("overwriteFile", "true");
      const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", { method: "POST", body: form });
      const data = (await response.json()) as { message?: string; url?: string };
      if (!response.ok || !data.url) throw new Error(data.message || "Replacement failed.");
      setMessage("Image replaced successfully.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Replacement failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section id="image-library" className={styles.library}>
      <div className={styles.heading}>
        <div><span className={styles.eyebrow}>03 / MEDIA LIBRARY</span><h2>Uploaded images <span className={styles.count}>{images.length}</span></h2><p>Browse everything stored in your portfolio. Replace, move or delete existing artwork.</p></div>
        <button className={styles.action} onClick={() => void load()} disabled={loading || !!busy} type="button">↻ Refresh</button>
      </div>
      <div className={styles.filters}>
        <select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="all">All categories</option>
          {categories.map((item) => <option key={item.slug} value={item.slug}>{item.label}</option>)}
        </select>
        <input aria-label="Search images" placeholder="Search by filename..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <span>{visible.length} shown</span>
      </div>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      {message && <p role="status" className={styles.success}>{message}</p>}
      {loading ? <p className={styles.empty}>Loading images from ImageKit…</p> : visible.length === 0 ? <p className={styles.empty}>No uploaded images match this filter.</p> : (
        <div className={styles.grid}>
          {visible.map((image) => {
            const currentCategory = categories.find((item) => image.filePath.startsWith(`/portfolio/${item.slug}/`))?.slug ?? "";
            const disabled = busy !== null;
            return <article className={styles.card} key={image.fileId}>
              <a href={image.url} target="_blank" rel="noreferrer" className={styles.preview} aria-label={`Open ${image.name}`}><img src={image.url} alt={image.name} loading="lazy" /></a>
              <div className={styles.details}>
                <strong title={image.name}>{image.name}</strong>
                <small>{image.size ? `${(image.size / 1024 / 1024).toFixed(2)} MB · ` : ""}{image.createdAt ? new Date(image.createdAt).toLocaleDateString() : ""}</small>
                <label>Category<select value={currentCategory} disabled={disabled} onChange={(event) => void mutate(image, "PATCH", event.target.value)}>{categories.map((item) => <option value={item.slug} key={item.slug}>{item.label}</option>)}</select></label>
                <div className={styles.buttons}>
                  <button type="button" disabled={disabled} onClick={() => { replacing.current = image; replaceInput.current?.click(); }}>{busy === image.fileId ? "Working…" : "Replace"}</button>
                  <button className={styles.danger} type="button" disabled={disabled} onClick={() => { if (window.confirm(`Permanently delete "${image.name}" from ImageKit? This cannot be undone.`)) void mutate(image, "DELETE"); }}>Delete</button>
                </div>
              </div>
            </article>;
          })}
        </div>
      )}
      <input ref={replaceInput} type="file" accept="image/*" hidden onChange={(event) => {
        const file = event.target.files?.[0];
        const target = replacing.current;
        event.target.value = "";
        if (file && target) void replace(file, target);
      }} />
    </section>
  );
}
