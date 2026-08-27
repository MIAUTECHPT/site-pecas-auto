"use client";

import { useState } from "react";

interface ImageProps {
  id: number;
  url: string;
  alt?: string | null;
}

export default function GaleriaInterativa({ 
  images, 
  name 
}: { 
  images: ImageProps[]; 
  name: string 
}) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const activeImage = images[selectedImageIndex] || images[0];

  return (
    <div>
      <div className="flex min-h-[420px] items-center justify-center overflow-hidden rounded-3xl bg-zinc-200">
        {activeImage ? (
          <img
            src={activeImage.url}
            alt={name}
            className="h-full max-h-[520px] w-full object-contain transition-all duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-zinc-400">
            <div className="text-8xl">🚗</div>
            <p className="mt-4 text-sm font-medium">
              Sem imagem disponível
            </p>
          </div>
        )}
      </div>

      {/* MINIATURAS CLICÁVEIS */}
      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {images.map((imagem, index) => (
            <button
              key={imagem.id}
              onClick={() => setSelectedImageIndex(index)}
              className={`overflow-hidden rounded-xl border-2 bg-white transition ${
                selectedImageIndex === index ? "border-red-600 scale-[1.02]" : "border-zinc-200 opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={imagem.url}
                alt={`${name} - foto ${index + 1}`}
                className="h-24 w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}