import Link from 'next/link'
import { PublicShell } from '@/features/diagnoses/components/public/PublicShell'

export const metadata = {
  title: 'Marka Teşhis Analizi — Deep Creative Marka101',
  description: 'Markanızın dijital algısını, premium algısını ve hikâye gücünü ölçün.',
}

function ArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M14 7l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function JourneyIcon({ type, active = false }: { type: 'brand' | 'data' | 'report'; active?: boolean }) {
  return (
    <span className={`journey-icon ${active ? 'journey-icon-active' : ''}`}>
      {type === 'brand' && (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 5.5h10a1.5 1.5 0 0 1 1.5 1.5v11A1.5 1.5 0 0 1 17 19.5H7A1.5 1.5 0 0 1 5.5 18V7A1.5 1.5 0 0 1 7 5.5Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9 5.5V4m6 1.5V4m-6 9 2 2 4-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {type === 'data' && (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5.5 7.5 12 4l6.5 3.5v9L12 20l-6.5-3.5v-9Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9 10h6m-6 3h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
      {type === 'report' && (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 5.5h10A1.5 1.5 0 0 1 18.5 7v11A1.5 1.5 0 0 1 17 19.5H7A1.5 1.5 0 0 1 5.5 18V7A1.5 1.5 0 0 1 7 5.5Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9 4v3m6-3v3m-6 6 2 2 4-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  )
}

const JOURNEY = [
  { 
    type: 'brand' as const, 
    title: '1. Temel Tanımlama', 
    text: 'Sektörünüz, hedef kitle ve ana vaadiniz gibi markanızın temel yapı taşlarını öğreniyoruz.' 
  },
  { 
    type: 'data' as const, 
    title: '2. Dijital Varlık Analizi', 
    text: 'Web siteniz ve sosyal medya kanallarınızdaki dijital izleri, algı unsurlarını inceliyoruz.' 
  },
  { 
    type: 'report' as const, 
    title: '3. Anında Rapor ve Skorlar', 
    text: 'Premium algı, marka netliği ve dijital güven gibi 5 boyutta detaylı skorumuzu ve tavsiyelerimizi sunuyoruz.' 
  },
]

export default function Marka101LandingPage() {
  return (
    <PublicShell hideFooter>
      <section className="marka-hero">
        <div className="marka-hero-copy">
          <h1>Markanızın<br />dijital algısını<br />ölçün<span>.</span></h1>
          <p className="marka-lead">Marka netliği, premium algı, hikaye gücü ve dijital güven skorunuzu 6–8 dakikalık analizle görün.</p>
          <Link href="/marka101/form" className="marka-primary-button">
            Analize Başla <ArrowIcon />
          </Link>
          <div className="marka-benefits">
            <div><span className="benefit-icon">✓</span><p><strong>Ücretsiz</strong><small>ön analiz</small></p></div>
            <div><span className="benefit-icon benefit-clock" /><p><strong>Yaklaşık</strong><small>6–8 dakika</small></p></div>
            <div><span className="benefit-bolt">ϟ</span><p><strong>Sonuç</strong><small>anında oluşur</small></p></div>
          </div>
        </div>

        {/* Replaced Stepper with the Premium Live Diagnostics Radar */}
        <div className="journey-card radar-dashboard-card">
          <div className="radar-dashboard-wrapper">
            
            {/* Top Badges */}
            <div className="radar-top-row">
              <div className="radar-badge-marka">
                <span className="badge-dot-purple"></span>
                MARKA ANALİZİ
              </div>
            </div>

            {/* SVG Connections & Travelling Glow Dots */}
            <svg className="radar-svg-connections" viewBox="0 0 740 560" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="purple-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7047ff" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor="#b5179e" stopOpacity="0.1"/>
                </linearGradient>
              </defs>

              {/* Concentric Target Circles */}
              <circle cx="370" cy="280" r="100" stroke="rgba(112, 71, 255, 0.05)" strokeWidth="1.2" />
              <circle cx="370" cy="280" r="180" stroke="rgba(112, 71, 255, 0.04)" strokeWidth="1.2" strokeDasharray="4 4" />
              <circle cx="370" cy="280" r="260" stroke="rgba(112, 71, 255, 0.03)" strokeWidth="1.2" />

              {/* Target Axis Lines */}
              <line x1="370" y1="20" x2="370" y2="540" stroke="rgba(112, 71, 255, 0.03)" strokeWidth="1.2" strokeDasharray="3 3" />
              <line x1="20" y1="280" x2="720" y2="280" stroke="rgba(112, 71, 255, 0.03)" strokeWidth="1.2" strokeDasharray="3 3" />

              {/* Connections */}
              <path id="path-algi" d="M 216 130 C 290 130, 290 280, 370 280" stroke="url(#purple-grad)" strokeWidth="1.5" strokeDasharray="3 3"/>
              <path id="path-konum" d="M 524 130 C 450 130, 450 280, 370 280" stroke="url(#purple-grad)" strokeWidth="1.5" strokeDasharray="3 3"/>
              <path id="path-guven" d="M 216 300 C 290 300, 290 280, 370 280" stroke="url(#purple-grad)" strokeWidth="1.5" strokeDasharray="3 3"/>
              <path id="path-hikaye" d="M 524 300 C 450 300, 450 280, 370 280" stroke="url(#purple-grad)" strokeWidth="1.5" strokeDasharray="3 3"/>
              <path id="path-icgoru" d="M 260 480 C 310 480, 310 280, 370 280" stroke="url(#purple-grad)" strokeWidth="1.5" strokeDasharray="3 3"/>
              <path id="path-sistem" d="M 480 480 C 430 480, 430 280, 370 280" stroke="url(#purple-grad)" strokeWidth="1.5" strokeDasharray="3 3"/>
            </svg>

            {/* Center Radar Graphic with official logo */}
            <div className="radar-center-graphics">
              <div className="radar-outer-glow" />
              <div className="radar-ring ring-3" />
              <div className="radar-ring ring-2" />
              <div className="radar-ring ring-1" />
              <div className="absolute z-10 flex items-center justify-center">
                <img src="/studio-logo.png" alt="Deep Logo" className="w-16 h-16 object-contain filter drop-shadow-[0_0_12px_rgba(112,71,255,0.3)]" />
              </div>
            </div>

            {/* Floating Diagnostic Cards */}
            
            {/* 1. Algı Card */}
            <div className="radar-card float-algi text-left">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="card-icon-wrapper bg-purple-50 text-[#7047ff]">
                    <span className="material-symbols-outlined text-[15px]">psychology</span>
                  </div>
                  <span className="card-title text-[13px] font-bold text-gray-900">Algı</span>
                </div>
                <span className="card-status-badge-inline text-[9px]">Güçlü</span>
              </div>
              <div className="mt-3">
                <div className="text-[24px] font-extrabold text-gray-900 leading-none">
                  78<span className="text-[12px] text-gray-400 font-medium ml-1">/100</span>
                </div>
                <div className="text-[9px] text-gray-400 font-bold mt-1">Pozitif algı seviyesi</div>
              </div>
              <div className="card-chart-area mt-2 mb-0">
                <svg className="w-full h-8" viewBox="0 0 120 30" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="alg-wave-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7047ff" stopOpacity="0.25"/>
                      <stop offset="100%" stopColor="#7047ff" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <path d="M 0 25 C 24 25, 36 10, 60 15 C 84 20, 96 5, 120 10 L 120 30 L 0 30 Z" fill="url(#alg-wave-grad)"/>
                  <path d="M 0 25 C 24 25, 36 10, 60 15 C 84 20, 96 5, 120 10" fill="none" stroke="#7047ff" strokeWidth="1.8"/>
                </svg>
              </div>
            </div>

            {/* 2. Konum Card (2D Quadrant Chart) */}
            <div className="radar-card float-konum text-left">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <div className="card-icon-wrapper bg-purple-50 text-[#7047ff]">
                  <span className="material-symbols-outlined text-[15px]">track_changes</span>
                </div>
                <span className="card-title text-[13px] font-bold text-gray-900">Konum</span>
              </div>
              <div className="relative w-full h-[62px] border border-gray-150 rounded-lg overflow-hidden bg-gray-50/50 flex mt-3 mb-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full h-[1px] bg-gray-250/70" /></div>
                <div className="absolute inset-0 flex justify-center"><div className="h-full w-[1px] bg-gray-250/70" /></div>
                <div className="absolute top-[25%] right-[25%] w-2.5 h-2.5 rounded-full bg-[#7047ff] shadow-[0_0_10px_rgba(112,71,255,0.7)] animate-pulse" />
              </div>
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-55">
                <span className="text-[9px] text-gray-400 font-bold">Pazar konumunuz</span>
                <span className="card-status-badge-inline text-[9px]">Avantajlı</span>
              </div>
            </div>

            {/* 3. Güven Card (Radial Progress Ring) */}
            <div className="radar-card float-guven text-left">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <div className="card-icon-wrapper bg-purple-50 text-[#7047ff]">
                  <span className="material-symbols-outlined text-[15px]">shield</span>
                </div>
                <span className="card-title text-[13px] font-bold text-gray-900">Güven</span>
              </div>
              <div className="relative w-[56px] h-[56px] mx-auto flex items-center justify-center mt-3 mb-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-gray-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-[#7047ff]" strokeWidth="3.2" strokeDasharray="82, 100" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-[13px] font-extrabold text-gray-900 leading-none">82</span>
                  <span className="text-[7px] text-gray-400 font-bold mt-0.5">/100</span>
                </div>
              </div>
              <div className="text-center text-[9px] text-gray-400 font-bold mb-2">Dijital güven skoru</div>
              <div className="flex justify-center border-t border-gray-50 pt-2">
                <span className="card-status-badge-inline text-[9px]">Yüksek</span>
              </div>
            </div>

            {/* 4. Hikaye Card (3 Progress Rows) */}
            <div className="radar-card float-hikaye text-left">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <div className="card-icon-wrapper bg-purple-50 text-[#7047ff]">
                  <span className="material-symbols-outlined text-[15px]">menu_book</span>
                </div>
                <span className="card-title text-[13px] font-bold text-gray-900">Hikaye</span>
              </div>
              <div className="space-y-2 mt-3 mb-2 text-[9px] font-bold text-gray-500">
                <div>
                  <div className="flex justify-between items-center mb-0.5"><span>Netlik</span><span className="text-gray-800">85</span></div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#7047ff]" style={{ width: '85%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-0.5"><span>Duygusal Etki</span><span className="text-gray-800">76</span></div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#7047ff]/70" style={{ width: '76%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-0.5"><span>Akılda Kalıcılık</span><span className="text-gray-800">81</span></div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#7047ff]" style={{ width: '81%' }} />
                  </div>
                </div>
              </div>
              <div className="flex justify-center border-t border-gray-50 pt-2 mt-2">
                <span className="card-status-badge-inline text-[9px]">Güçlü Hikaye</span>
              </div>
            </div>

            {/* 5. İçgörü Card (Bulb Insight Card) */}
            <div className="radar-card float-icgoru text-left">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <div className="card-icon-wrapper bg-purple-50 text-[#7047ff]">
                  <span className="material-symbols-outlined text-[15px]">lightbulb</span>
                </div>
                <span className="card-title text-[13px] font-bold text-gray-900">İçgörü</span>
              </div>
              <p className="text-[10px] text-gray-500 font-bold mt-3 leading-relaxed">
                Markanız premium algıda sektör ortalamasının üzerinde bir konumda.
              </p>
              <div className="mt-3">
                <Link href="/marka101/form" className="inline-flex items-center justify-center w-full px-3 py-1.5 text-[9px] font-black text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-100/50 transition-colors gap-1">
                  Detaylı Raporu Gör <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* 6. Sistem Card (Completion Rate) */}
            <div className="radar-card float-sistem-new text-left">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <div className="card-icon-wrapper bg-purple-50 text-[#7047ff]">
                  <span className="material-symbols-outlined text-[15px]">dns</span>
                </div>
                <span className="card-title text-[13px] font-bold text-gray-900">Sistem</span>
              </div>
              <div className="card-chart-area mt-2 mb-1">
                <svg className="w-full h-8" viewBox="0 0 120 30" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="sys-wave-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7047ff" stopOpacity="0.25"/>
                      <stop offset="100%" stopColor="#7047ff" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <path d="M 0 25 C 24 28, 36 10, 60 15 C 84 20, 96 5, 120 18 L 120 30 L 0 30 Z" fill="url(#sys-wave-grad)"/>
                  <path d="M 0 25 C 24 28, 36 10, 60 15 C 84 20, 96 5, 120 18" fill="none" stroke="#7047ff" strokeWidth="1.8"/>
                </svg>
              </div>
              <div className="flex justify-between items-center mt-2 border-t border-gray-100 pt-2 text-[9px] font-bold text-gray-400 uppercase">
                <span>Tarama Oranı</span>
                <span className="text-[13px] font-extrabold text-[#7047ff]">96%</span>
              </div>
            </div>

          </div>
        </div>
      </section>
    </PublicShell>
  )
}
