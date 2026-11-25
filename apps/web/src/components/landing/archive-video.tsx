'use client';

import { useEffect, useRef } from 'react';

/** Muted archival loop that only loads and plays while on screen. */
export function ArchiveVideo({ src, poster, label }: { src: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        video.currentTime ||= 30;
        void video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    });
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      aria-label={label}
      className="absolute inset-0 size-full object-cover grayscale"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
