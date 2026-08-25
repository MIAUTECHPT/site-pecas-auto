"use client";

import { useState } from "react";

export default function GaleriaInterativa({ 
  images, 
  title 
}: { 
  images: { id?: number; url: string }[]; 
  title?: string 
}) {
  const [imagemAtiva, setImagemAtiva] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="flex h-96 w-full items-center justify-center rounded-3xl bg-zinc-100 text-6xl">
        🚘
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Imagem Principal em Destaque */}
      <div className="overflow-hidden rounded-3xl bg-zinc-100 shadow-sm transition-all duration-300">
        <img
          src={images[imagemAtiva].url}
          alt={title || "Salvado"}
          className="h-96 w-full object-cover transition-all duration-500"
        />
      </div>

      {/* Miniaturas clicáveis */}
      {images.length > 1 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((img, index) => (
            <button
              key={img.id || index}
              onClick={() => setImagemAtiva(index)}
              className={`overflow-hidden rounded-2xl bg-zinc-100 h-24 text-left transition-all duration-200 border-2 ${
                imagemAtiva === index ? "border-red-600 shadow-md scale-[1.02]" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={img.url}
                alt={`Miniatura ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}