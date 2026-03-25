"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Code2,
  Gauge,
  Lightbulb,
  Palette,
  Rocket,
  Sparkles,
  Star,
  Trophy,
  User,
  Video,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type GalleryPhoto = {
  src: string;
  alt: string;
  title?: string;
  description?: string;
  tags?: string[];
  aspect?: "square" | "portrait" | "landscape";
  mediaType?: "image" | "video";
  poster?: string;
  profileName?: string;
  profileIcon?:
    | "user"
    | "video"
    | "sparkles"
    | "palette"
    | "camera"
    | "clapperboard"
    | "rocket"
    | "star"
    | "lightbulb"
    | "trophy"
    | "code2"
    | "gauge";
};

const aspectClass: Record<NonNullable<GalleryPhoto["aspect"]>, string> = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  landscape: "aspect-[16/10]",
};

function normalizeTag(tag: string) {
  return tag.trim();
}

function ProfileIcon({ icon }: { icon?: GalleryPhoto["profileIcon"] }) {
  const className = "h-4 w-4";
  switch (icon) {
    case "video":
      return <Video className={className} />;
    case "sparkles":
      return <Sparkles className={className} />;
    case "palette":
      return <Palette className={className} />;
    case "camera":
      return <Camera className={className} />;
    case "clapperboard":
      return <Clapperboard className={className} />;
    case "rocket":
      return <Rocket className={className} />;
    case "star":
      return <Star className={className} />;
    case "lightbulb":
      return <Lightbulb className={className} />;
    case "trophy":
      return <Trophy className={className} />;
    case "code2":
      return <Code2 className={className} />;
    case "gauge":
      return <Gauge className={className} />;
    case "user":
    default:
      return <User className={className} />;
  }
}

export default function PhotosGallerySection({
  title = "Fotoğraf Galerisi",
  description = "Projelerden seçtiğimiz kareler. Görselin üstüne tıkla ve detaylı incele.",
  photos,
  className,
  layout = "default",
}: {
  title?: string;
  description?: string;
  photos: GalleryPhoto[];
  className?: string;
  layout?: "default" | "instagram";
}) {
  const tags = useMemo(() => {
    const set = new Set<string>();
    for (const photo of photos) {
      for (const tag of photo.tags ?? []) set.add(normalizeTag(tag));
    }
    return ["Tümü", ...Array.from(set)];
  }, [photos]);

  const tagCounts = useMemo(() => {
    const map = new Map<string, number>();
    map.set("Tümü", photos.length);
    for (const photo of photos) {
      for (const tag of photo.tags ?? []) {
        const normalized = normalizeTag(tag);
        map.set(normalized, (map.get(normalized) ?? 0) + 1);
      }
    }
    return map;
  }, [photos]);

  const showFilters = tags.length > 1;

  const [activeTag, setActiveTag] = useState<string>("Tümü");

  const filtered = useMemo(() => {
    if (activeTag === "Tümü") return photos;
    return photos.filter((p) => (p.tags ?? []).some((t) => normalizeTag(t) === activeTag));
  }, [activeTag, photos]);

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const activePhoto = openIndex === null ? null : filtered[openIndex];

  const modalVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoMuted, setIsVideoMuted] = useState(true);

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

  useEffect(() => {
    // Reset video mute state when opening a new item.
    setIsVideoMuted(true);
    if (activePhoto?.mediaType === "video" && modalVideoRef.current) {
      modalVideoRef.current.muted = true;
    }
  }, [activePhoto?.src, activePhoto?.mediaType]);

  const toggleModalVideoMute = () => {
    const el = modalVideoRef.current;
    if (!el) return;

    setIsVideoMuted((prev) => {
      const next = !prev;
      el.muted = next;
      if (!next) el.volume = 1;
      void el.play().catch(() => {
        // Autoplay/unmute policies can block play; ignore.
      });
      return next;
    });
  };

  const renderFilterChip = (tag: string) => {
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
  };

  const renderSidebarFilterItem = (tag: string) => {
    const isActive = activeTag === tag;
    const count = tagCounts.get(tag) ?? 0;

    return (
      <button
        key={tag}
        type="button"
        onClick={() => setActiveTag(tag)}
        className={cn(
          "group flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition",
          isActive
            ? "bg-orange-500 text-white"
            : "bg-white text-neutral-800 hover:bg-neutral-50",
        )}
      >
        <span className={cn("min-w-0 truncate", isActive ? "font-semibold" : "font-medium")}>
          {tag}
        </span>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-xs",
            isActive
              ? "bg-white/15 text-white"
              : "bg-neutral-100 text-neutral-700 group-hover:bg-neutral-200",
          )}
        >
          {count}
        </span>
      </button>
    );
  };

  return (
    <section className={cn("relative py-16", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">{title}</h2>
          <p className="max-w-2xl text-sm text-neutral-600">{description}</p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:mt-8 lg:grid-cols-[240px_1fr]">
          {showFilters && (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
                  <div className="px-1 pb-2 text-sm font-semibold text-neutral-900">
                    Filtreler
                  </div>
                  <div className="space-y-1">{tags.map(renderSidebarFilterItem)}</div>
                </div>
              </div>
            </aside>
          )}

          <div>
            {showFilters && (
              <div className="flex flex-wrap gap-2 lg:hidden">{tags.map(renderFilterChip)}</div>
            )}

            {filtered.length > 0 ? (
              <div
                className={cn(
                  "mt-6 grid lg:mt-0",
                  layout === "instagram"
                    ? "grid-cols-3 gap-1 sm:gap-2 lg:grid-cols-3"
                    : "grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3",
                )}
              >
                {filtered.map((photo, index) => (
                  <button
                    key={`${photo.src}-${index}`}
                    type="button"
                    onClick={() => setOpenIndex(index)}
                    className={cn(
                      "group relative w-full overflow-hidden border border-neutral-200 bg-white",
                      layout === "instagram" ? "rounded-lg shadow-none" : "rounded-2xl shadow-sm",
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
                  {photo.mediaType === "video" ? (
                    <video
                      className="h-full w-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      poster={photo.poster}
                    >
                      <source src={photo.src} />
                    </video>
                  ) : (
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                      className="object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  )}
                  {layout === "instagram" && (
                    <div className="pointer-events-none absolute left-0 top-0 p-2">
                      <div className="inline-flex max-w-[calc(100%-1rem)] items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 text-xs text-white/95 backdrop-blur">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-white/5">
                          <ProfileIcon icon={photo.profileIcon} />
                        </span>
                        <span className="min-w-0 truncate font-semibold">
                          {photo.profileName ?? "Ajans 99"}
                        </span>
                      </div>
                    </div>
                  )}

                  <div
                    className={cn(
                      "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0 transition",
                      layout === "instagram" ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                    )}
                  />

                  {(photo.title || photo.description) && (
                    <div
                      className={cn(
                        "pointer-events-none absolute bottom-0 left-0 right-0 p-3 text-left transition",
                        layout === "instagram" ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                      )}
                    >
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
              <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 bg-white/60 p-10 text-center lg:mt-0">
                <div className="text-sm font-semibold text-neutral-900">Henüz görsel eklenmedi</div>
                <div className="mt-1 text-sm text-neutral-600">
                  Bu bölüme yeni proje görselleri eklendiğinde burada listelenecek.
                </div>
              </div>
            )}
          </div>
        </div>
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
              <div className="flex min-w-0 items-center gap-3">
                <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80">
                  <ProfileIcon icon={activePhoto.profileIcon} />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">
                    {activePhoto.title ?? activePhoto.alt}
                  </div>
                  {activePhoto.profileName && (
                    <div className="mt-0.5 line-clamp-1 text-xs text-white/70">
                      {activePhoto.profileName}
                    </div>
                  )}
                  {activePhoto.description && (
                    <div className="mt-0.5 line-clamp-1 text-xs text-white/70">
                      {activePhoto.description}
                    </div>
                  )}
                </div>
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
              <div className="relative h-[70vh] w-full bg-black">
                {activePhoto.mediaType === "video" ? (
                  <div className="relative h-full w-full" onClick={toggleModalVideoMute}>
                    <video
                      ref={modalVideoRef}
                      className="h-full w-full object-contain"
                      autoPlay
                      loop
                      muted={isVideoMuted}
                      playsInline
                      poster={activePhoto.poster}
                    >
                      <source src={activePhoto.src} />
                    </video>

                    <div className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-xs text-white/90 backdrop-blur">
                      {isVideoMuted ? (
                        <>
                          <VolumeX className="h-4 w-4" />
                          <span>Ses kapalı</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-4 w-4" />
                          <span>Ses açık</span>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <Image
                    src={activePhoto.src}
                    alt={activePhoto.alt}
                    fill
                    sizes="(min-width: 1024px) 70vw, 95vw"
                    className="object-contain"
                    priority
                  />
                )}
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
