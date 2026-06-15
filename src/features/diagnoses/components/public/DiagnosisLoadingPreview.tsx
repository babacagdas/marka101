// src/features/diagnoses/components/public/DiagnosisLoadingPreview.tsx
// Stitch loading screen skeleton — Patch 03'te akışa bağlanacak

const LOADING_MESSAGES = [
  'Sektör trendleri inceleniyor',
  'Rakip analizi optimize ediliyor',
  'Görsel kimlik puanlanıyor',
  'Stratejik rapor hazırlanıyor',
] as const

interface DiagnosisLoadingPreviewProps {
  /** Gösterilecek mesaj index'i (default: 0) */
  messageIndex?: number
}

export function DiagnosisLoadingPreview({
  messageIndex = 0,
}: DiagnosisLoadingPreviewProps) {
  const message = LOADING_MESSAGES[messageIndex % LOADING_MESSAGES.length]

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-margin-mobile relative overflow-hidden">
      {/* Arka plan blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-tertiary/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center animate-fade-up">
        {/* Spinner */}
        <div className="mb-stack-sm">
          <div className="loader-ring">
            <div /><div /><div /><div />
          </div>
        </div>

        {/* Başlık */}
        <h2 className="text-headline-lg font-bold text-on-surface mb-4 tracking-tight">
          Dijital güven sinyalleri okunuyor...
        </h2>

        {/* Alt metin */}
        <p className="text-body-lg text-secondary max-w-lg mb-8 opacity-80">
          Lütfen bekleyin, markanızın verileri algoritmalarımızla işleniyor.
        </p>

        {/* İlerleme çizgisi */}
        <div className="progress-line w-52 mb-12" />

        {/* Döngüsel mesaj */}
        <span className="text-label-lg uppercase tracking-widest text-primary">
          {message}
        </span>
      </div>
    </div>
  )
}
