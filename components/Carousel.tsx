"use client";

import React, { useCallback, useRef, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

export function Carousel({ children }: { children: React.ReactNode }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ dragFree: true, slidesToScroll: 1 });
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollDirection = useRef<number>(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  // Efeito para detetar a posição do rato e animar o scroll contínuo
  useEffect(() => {
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !emblaApi) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left; // Posição X relativa ao carrossel
      const width = rect.width;

      const threshold = 100; // Zona de ativação em pixels nas bermas

      if (x < threshold) {
        // Encostado à esquerda: quanto mais perto da borda, mais rápido anda
        scrollDirection.current = -((threshold - x) / threshold) * 8;
      } else if (x > width - threshold) {
        // Encostado à direita
        scrollDirection.current = ((x - (width - threshold)) / threshold) * 8;
      } else {
        scrollDirection.current = 0;
      }
    };

    const handleMouseLeave = () => {
      scrollDirection.current = 0;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    const animate = () => {
      if (scrollDirection.current !== 0 && emblaApi) {
        emblaApi.scrollBy(scrollDirection.current, false);
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [emblaApi]);

  return (
    <div className="relative" ref={containerRef}>
      <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
        <div className="flex gap-6">
          {children}
        </div>
      </div>
      
      {/* Setas de navegação mantidas */}
      <button onClick={scrollPrev} className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white p-2 shadow-lg border border-zinc-200">⬅️</button>
      <button onClick={scrollNext} className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white p-2 shadow-lg border border-zinc-200">➡️</button>
    </div>
  );
}