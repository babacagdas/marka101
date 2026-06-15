// src/features/diagnoses/components/public/PreScorePreview.tsx
// Stitch pre-score screen skeleton — Patch 03'te gerçek skorlarla dolacak

interface CategoryScore {
  icon: string
  title: string
  score: number
  desc: string
}

interface PreScorePreviewProps {
  /** Genel skor (0–100, default: 0 = gizli) */
  overallScore?: number
  categories?: CategoryScore[]
}

const DEFAULT_CATEGORIES: CategoryScore[] = [
  { icon: 'lightbulb',    title: 'Marka Netliği',      score: 0, desc: 'Mesajınızın hedef kitle tarafından anlaşılma oranı.' },
  { icon: 'diamond',      title: 'Premium Algı',        score: 0, desc: 'Görsel dilinizin yüksek kalite sinyalleri.' },
  { icon: 'auto_stories', title: 'Storytelling Gücü',   score: 0, desc: 'Anlatınızda duygusal bağ kurma potansiyeli.' },
  { icon: 'verified_user', title: 'Dijital Güven',      score: 0, desc: 'Kullanıcı deneyimi ve teknik altyapı güveni.' },
  { icon: 'grid_view',    title: 'Kreatif Sistem',      score: 0, desc: 'Tasarım tutarlılığı ve bütünsel vizyon.' },
]

export function PreScorePreview({
  overallScore = 0,
  categories = DEFAULT_CATEGORIES,
}: PreScorePreviewProps) {
  // SVG ring için hesaplama (r=45, çevre = 2π×45 ≈ 282.7)
  const circumference = 282.7
  const offset = overallScore > 0
    ? circumference - (overallScore / 100) * circumference
    : circumference // tam boş (skor henüz yok)

  const isBlurred = overallScore === 0

  return (
    <div className="space-y-stack-md">
      {/* ── Skor halkası ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-center gap-gutter">
        <div className="w-full md:w-1/2">
          <h2 className="text-headline-lg md:text-display-md font-bold mb-stack-sm">
            Marka Sağlığı Ön Skoru
          </h2>
          <p className="text-body-lg text-secondary max-w-xl">
            Dijital varlıklarınız ve kurumsal kimliğinizin derinlemesine analizi
            sonucunda elde edilen ilk projeksiyon.
          </p>
        </div>

        <div className="w-full md:w-1/2 flex justify-center relative py-stack-md">
          <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl opacity-30" />
          <div
            className={`relative w-64 h-64 md:w-80 md:h-80 glass-panel rounded-full premium-shadow
                        flex flex-col items-center justify-center p-8 text-center
                        ${isBlurred ? 'opacity-40' : ''}`}
          >
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="transparent" stroke="#f1f3f5" strokeWidth="6" />
              <circle
                className="score-ring"
                cx="50" cy="50" r="45"
                fill="transparent"
                stroke="#6741d9"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            </svg>
            <span className="text-display-lg font-bold text-primary leading-none">
              {overallScore > 0 ? overallScore : '—'}
            </span>
            <span className="text-headline-md text-secondary">/ 100</span>
            <p className="text-label-md mt-3 text-on-surface-variant uppercase tracking-widest">
              {overallScore > 0 ? 'Marka Potansiyeli' : 'Hesaplanıyor...'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Kategori bento ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {categories.slice(0, 3).map((cat) => (
          <div
            key={cat.title}
            className={`glass-panel p-8 rounded-lg premium-shadow transition-transform hover:-translate-y-1
                        ${isBlurred ? 'opacity-50 blur-sm select-none' : ''}`}
          >
            <div className="flex justify-between items-start mb-6">
              <span className={`material-symbols-outlined bg-primary/10 p-3 rounded-full text-primary text-2xl`}>
                {cat.icon}
              </span>
              <span className="text-headline-md font-bold text-primary">
                {cat.score > 0 ? cat.score : '—'}
              </span>
            </div>
            <h3 className="text-headline-md font-bold mb-2">{cat.title}</h3>
            <p className="text-body-md text-secondary mb-6">{cat.desc}</p>
            <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-1000"
                style={{ width: `${cat.score}%` }}
              />
            </div>
          </div>
        ))}
        {/* Diğer kategoriler için placeholder */}
        {categories.slice(3).map((cat) => (
          <div
            key={cat.title}
            className={`glass-panel p-8 rounded-lg premium-shadow md:col-span-${
              categories.slice(3).length === 2 ? '1' : '3'
            } transition-transform hover:-translate-y-1
                        ${isBlurred ? 'opacity-50 blur-sm select-none' : ''}`}
          >
            <div className="flex justify-between items-start mb-6">
              <span className="material-symbols-outlined bg-primary/10 p-3 rounded-full text-primary text-2xl">
                {cat.icon}
              </span>
              <span className="text-headline-md font-bold text-primary">
                {cat.score > 0 ? cat.score : '—'}
              </span>
            </div>
            <h3 className="text-headline-md font-bold mb-2">{cat.title}</h3>
            <p className="text-body-md text-secondary mb-6">{cat.desc}</p>
            <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-1000"
                style={{ width: `${cat.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
