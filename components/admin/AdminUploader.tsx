"use client";

import { useMemo, useRef, useState } from "react";

const categories = [
  { label: "Hero Image", slug: "hero-image" },
  { label: "About Me", slug: "about-me" },
  { label: "Brand Identity", slug: "brand-identity" },
  { label: "Marketing Design", slug: "marketing-design" },
  { label: "Print & Editorial", slug: "print-editorial" },
  { label: "Digital & Motion", slug: "digital-motion" },
] as const;

type CategorySlug = (typeof categories)[number]["slug"];
type UploadStatus = "ready" | "uploading" | "done" | "error";

type UploadItem = {
  id: string;
  file: File;
  category: CategorySlug;
  progress: number;
  status: UploadStatus;
  url?: string;
  error?: string;
};

type AuthPayload = {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
};

type ImageKitUploadResponse = {
  url?: string;
  filePath?: string;
  name?: string;
  message?: string;
};

function createId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`;
}

function uploadToImageKit(
  item: UploadItem,
  auth: AuthPayload,
  onProgress: (progress: number) => void,
) {
  return new Promise<ImageKitUploadResponse>((resolve, reject) => {
    const request = new XMLHttpRequest();
    const body = new FormData();

    body.append("file", item.file);
    body.append("fileName", item.file.name);
    body.append("publicKey", auth.publicKey);
    body.append("signature", auth.signature);
    body.append("expire", String(auth.expire));
    body.append("token", auth.token);
    body.append("useUniqueFileName", "true");
    body.append("folder", `/portfolio/${item.category}`);
    body.append("tags", `portfolio,${item.category}`);

    request.open("POST", "https://upload.imagekit.io/api/v1/files/upload");

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    request.onerror = () => reject(new Error("Network error during upload."));

    request.onload = () => {
      let response: ImageKitUploadResponse = {};

      try {
        response = JSON.parse(request.responseText) as ImageKitUploadResponse;
      } catch {
        reject(new Error("ImageKit returned an unreadable response."));
        return;
      }

      if (request.status < 200 || request.status >= 300) {
        reject(new Error(response.message || "Image upload failed."));
        return;
      }

      resolve(response);
    };

    request.send(body);
  });
}

export function AdminUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [uploading, setUploading] = useState(false);

  const completedCount = useMemo(
    () => items.filter((item) => item.status === "done").length,
    [items],
  );

  const addFiles = (files: FileList | File[]) => {
    const images = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );

    setItems((current) => [
      ...current,
      ...images.map((file) => ({
        id: createId(file),
        file,
        category: "brand-identity" as CategorySlug,
        progress: 0,
        status: "ready" as UploadStatus,
      })),
    ]);
  };

  const patchItem = (id: string, patch: Partial<UploadItem>) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const fetchAuth = async () => {
    const response = await fetch("/api/imagekit-auth", {
      cache: "no-store",
    });

    const data = (await response.json()) as AuthPayload & { error?: string };

    if (!response.ok) {
      throw new Error(data.error || "Could not authorize upload.");
    }

    return data;
  };

  const uploadOne = async (item: UploadItem) => {
    patchItem(item.id, {
      status: "uploading",
      progress: 0,
      error: undefined,
      url: undefined,
    });

    try {
      const auth = await fetchAuth();
      const result = await uploadToImageKit(item, auth, (progress) => {
        patchItem(item.id, { progress });
      });

      if (!result.url) {
        throw new Error("Upload completed without a public URL.");
      }

      patchItem(item.id, {
        status: "done",
        progress: 100,
        url: result.url,
      });
    } catch (error) {
      patchItem(item.id, {
        status: "error",
        error: error instanceof Error ? error.message : "Upload failed.",
      });
      throw error;
    }
  };

  const uploadAll = async () => {
    const readyItems = items.filter(
      (item) => item.status === "ready" || item.status === "error",
    );

    if (readyItems.length === 0) {
      setGlobalError("Choose at least one image.");
      return;
    }

    setGlobalError("");
    setUploading(true);

    const queue = [...readyItems];
    const workers = Array.from({ length: Math.min(3, queue.length) }, async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (!item) break;

        try {
          await uploadOne(item);
        } catch {
          // Per-file error state is already shown in the queue.
        }
      }
    });

    await Promise.all(workers);
    setUploading(false);
  };

  return (
    <main className="admin-shell">
      <section className="admin-panel">
        <div className="admin-heading">
          <div>
            <p className="admin-eyebrow">Private portfolio uploader</p>
            <h1>Upload Tsegaye&apos;s work.</h1>
          </div>
          <div className="admin-heading-actions">
            <a href="/" className="admin-back">
              Back to portfolio ↗
            </a>
            <form action="/api/admin/logout" method="post">
              <button type="submit" className="admin-logout">
                Log out
              </button>
            </form>
          </div>
        </div>

        <div
          className={`admin-dropzone ${isDragging ? "is-dragging" : ""}`}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            addFiles(event.dataTransfer.files);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(event) => {
              if (event.target.files) addFiles(event.target.files);
              event.target.value = "";
            }}
          />
          <span className="admin-drop-mark">+</span>
          <strong>Drop many images here</strong>
          <p>PNG, JPG, WEBP and other browser-supported images.</p>
          <button type="button" onClick={() => inputRef.current?.click()}>
            Choose images
          </button>
        </div>

        {items.length > 0 && (
          <div className="admin-queue">
            <div className="admin-queue-header">
              <div>
                <strong>{items.length} image{items.length === 1 ? "" : "s"}</strong>
                <span>{completedCount} uploaded</span>
              </div>
              <button
                type="button"
                className="admin-clear"
                disabled={uploading}
                onClick={() => setItems([])}
              >
                Clear
              </button>
            </div>

            {items.map((item) => (
              <article className="admin-file-row" key={item.id}>
                <div className="admin-thumb">
                  <img
                    src={URL.createObjectURL(item.file)}
                    alt=""
                    onLoad={(event) => URL.revokeObjectURL(event.currentTarget.src)}
                  />
                </div>

                <div className="admin-file-info">
                  <strong>{item.file.name}</strong>
                  <span>{(item.file.size / 1024 / 1024).toFixed(1)} MB</span>
                  {item.status === "uploading" && (
                    <div className="admin-progress">
                      <span style={{ width: `${item.progress}%` }} />
                    </div>
                  )}
                  {item.error && <p className="admin-error">{item.error}</p>}
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noreferrer">
                      Open uploaded image ↗
                    </a>
                  )}
                </div>

                <label className="admin-category">
                  <span>Category</span>
                  <select
                    value={item.category}
                    disabled={item.status === "uploading"}
                    onChange={(event) =>
                      patchItem(item.id, {
                        category: event.target.value as CategorySlug,
                      })
                    }
                  >
                    {categories.map((category) => (
                      <option value={category.slug} key={category.slug}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className={`admin-status is-${item.status}`}>
                  {item.status === "ready" && "Ready"}
                  {item.status === "uploading" && `${item.progress}%`}
                  {item.status === "done" && "Uploaded"}
                  {item.status === "error" && "Retry"}
                </div>

                <button
                  type="button"
                  className="admin-remove"
                  disabled={item.status === "uploading"}
                  onClick={() =>
                    setItems((current) =>
                      current.filter((currentItem) => currentItem.id !== item.id),
                    )
                  }
                  aria-label={`Remove ${item.file.name}`}
                >
                  ×
                </button>
              </article>
            ))}

            {globalError && <p className="admin-global-error">{globalError}</p>}

            <button
              type="button"
              className="admin-upload-all"
              disabled={uploading}
              onClick={uploadAll}
            >
              {uploading ? "Uploading…" : "Upload all to ImageKit"}
              <span>↗</span>
            </button>
          </div>
        )}

        <div className="admin-folder-guide">
          {categories.map((category, index) => (
            <div key={category.slug}>
              <span>0{index + 1}</span>
              <strong>{category.label}</strong>
              <code>/portfolio/{category.slug}</code>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
