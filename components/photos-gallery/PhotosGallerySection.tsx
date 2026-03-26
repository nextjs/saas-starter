"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { cn } from "@/lib/utils";

export type GalleryPhoto = {
  src: string;
  alt: string;
  title?: string;
  description?: string;
  tags?: string[];
  aspect?: "square" | "portrait" | "landscape";
};

const aspectClass: Record<NonNullable<GalleryPhoto["aspect"]>, string> = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  landscape: "aspect-[16/10]",
};

function normalizeTag(tag: string) {
  return tag.trim();
}

export default function PhotosGallerySection({
  title = "Fotoğraf Galerisi",
  description = "Projelerden seçtiğimiz kareler. Görselin üstüne tıkla ve detaylı incele.",
  photos,
  className,
}: {
  title?: string;
  description?: string;
  photos: GalleryPhoto[];
  className?: string;
}) {
  const tags = useMemo(() => {
    const set = new Set<string>();
    for (const photo of photos) {
      for (const tag of photo.tags ?? []) set.add(normalizeTag(tag));
    }
    return ["Tümü", ...Array.from(set)];
  }, [photos]);

  const showFilters = tags.length > 1;

  const [activeTag, setActiveTag] = useState<string>("Tümü");

  const filtered = useMemo(() => {
    if (activeTag === "Tümü") return photos;
    return photos.filter((p) => (p.tags ?? []).some((t) => normalizeTag(t) === activeTag));
  }, [activeTag, photos]);

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const activePhoto = openIndex === null ? null : filtered[openIndex];

  const close = () => setOpenIndex(null);

  const goPrev = () => {
    if (openIndex === null) return;
    setOpenIndex((idx) => {
      if (idx === null) return null;
      return (idx - 1 + filtered.length) % filtered.length;
    });
  };

  const goNext = () => {
    if (openIndex === null) return;
    setOpenIndex((idx) => {
      if (idx === null) return null;
      return (idx + 1) % filtered.length;
    });
  };

  useEffect(() => {
    if (openIndex === null) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIndex, filtered.length]);

  useEffect(() => {
    // If the filter changes while modal is open, close it to avoid index mismatch.
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTag]);

  return (
    <section className={cn("relative py-16", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">{title}</h2>
          <p className="max-w-2xl text-sm text-neutral-600">{description}</p>
        </div>

        {showFilters && (
          <div className="mt-6 flex flex-wrap gap-2">
            {tags.map((tag) => {
              const isActive = activeTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(tag)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    isActive
                      ? "border-orange-500 bg-orange-500 text-white"
                      : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400",
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        )}

        {filtered.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {filtered.map((photo, index) => (
              <button
                key={`${photo.src}-${index}`}
                type="button"
                onClick={() => setOpenIndex(index)}
                className={cn(
                  "group relative w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm",
                  "focus:outline-none focus:ring-2 focus:ring-orange-500/50",
                )}
                aria-label={photo.title ? `Fotoğrafı aç: ${photo.title}` : "Fotoğrafı aç"}
              >
                <div
                  className={cn(
                    "relative w-full",
                    aspectClass[photo.aspect ?? "portrait"],
                  )}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-0 transition group-hover:opacity-100" />
                  {(photo.title || photo.description) && (
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-3 text-left opacity-0 transition group-hover:opacity-100">
                      {photo.title && (
                        <div className="text-sm font-semibold text-white">{photo.title}</div>
                      )}
                      {photo.description && (
                        <div className="mt-0.5 line-clamp-2 text-xs text-white/90">
                          {photo.description}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-white/60 p-10 text-center">
            <div className="text-sm font-semibold text-neutral-900">Henüz görsel eklenmedi</div>
            <div className="mt-1 text-sm text-neutral-600">
              Bu bölüme yeni proje görselleri eklendiğinde burada listelenecek.
            </div>
          </div>
        )}
      </div>

      {activePhoto && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Fotoğraf görüntüleyici"
          onClick={close}
        >
          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white">
                  {activePhoto.title ?? activePhoto.alt}
                </div>
                {activePhoto.description && (
                  <div className="mt-0.5 line-clamp-1 text-xs text-white/70">
                    {activePhoto.description}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={close}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/80 transition hover:bg-white/10 hover:text-white"
                aria-label="Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative">
              <div className="relative h-[70vh] w-full">
                <Image
                  src={activePhoto.src}
                  alt={activePhoto.alt}
                  fill
                  sizes="(min-width: 1024px) 70vw, 95vw"
                  className="object-contain"
                  priority
                />
              </div>

              {filtered.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/90 backdrop-blur transition hover:bg-black/50"
                    aria-label="Önceki"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/90 backdrop-blur transition hover:bg-black/50"
                    aria-label="Sonraki"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-white/10 px-4 py-3 text-xs text-white/60">
              <div>
                {openIndex !== null ? `${openIndex + 1} / ${filtered.length}` : null}
              </div>
              <div className="hidden sm:block">ESC: kapat • ←/→: gezin</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
