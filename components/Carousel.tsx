"use client";

import React, { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

export function Carousel({ children }: { children: React.ReactNode }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ dragFree: true, slidesToScroll: 1 });

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {children}
        </div>
      </div>
      
      {/* Setas de navegação */}
      <button onClick={scrollPrev} className="absolute -left-4 top-1/2 rounded-full bg-white p-2 shadow-lg border border-zinc-200">⬅️</button>
      <button onClick={scrollNext} className="absolute -right-4 top-1/2 rounded-full bg-white p-2 shadow-lg border border-zinc-200">➡️</button>
    </div>
  );
}