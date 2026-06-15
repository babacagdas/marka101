// src/features/diagnoses/components/public/LoadingScreen.tsx
"use client";
import { useState, useEffect } from "react";

const MSGS = [
  "Yanıtlarınız marka sisteminizin örüntüsüne dönüştürülüyor.",
  "Marka netliği ve dijital güven sinyalleri analiz ediliyor.",
  "Sektörel kritik göstergeler değerlendiriliyor.",
  "Öncelikli müdahale alanı belirleniyor.",
  "Ön skor ekranı hazırlanıyor.",
] as const;

export function LoadingScreen() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx(p => (p + 1) % MSGS.length), 1200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 flex flex-col items-center text-center">
      <div className="loader-ring mb-stack-sm" style={{ width: 72, height: 72, position: 'relative' }}>
        <div/><div/><div/><div/>
      </div>
      <h2 className="text-headline-md font-bold text-on-background mb-4">
        Dijital güven sinyalleri okunuyor...
      </h2>
      <p className="text-body-md text-secondary max-w-md mb-8 opacity-80">
        Lütfen bekleyin, markanızın verileri algoritmalarımızla işleniyor.
      </p>
      <div className="progress-line w-52 mb-8" />
      <span key={idx} className="text-label-lg uppercase tracking-widest text-primary animate-fade-up">
        {MSGS[idx]}
      </span>
    </div>
  );
}
