"use client";

import { useState } from "react";

type ImageUploadProps = {
  label?: string;
  value: string;
  onChange: (url: string) => void;
};

export function ImageUpload({ label = "Image", value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to upload image");
      }

      onChange(data.url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span>{label}</span>
        {value && (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] text-indigo-400 underline"
          >
            Open current
          </a>
        )}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-xs text-slate-200 file:mr-2 file:rounded-full file:border-0 file:bg-slate-800 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-slate-100 hover:file:bg-slate-700"
        />
        {uploading && (
          <span className="text-[10px] text-slate-400">Uploading…</span>
        )}
      </div>
      {value && (
        <div className="mt-1 overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Quiz" className="h-32 w-full object-cover" />
        </div>
      )}
      {error && <p className="text-[10px] text-red-400">{error}</p>}
    </div>
  );
}

