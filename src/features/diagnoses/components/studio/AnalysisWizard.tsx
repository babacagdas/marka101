// src/features/diagnoses/components/studio/AnalysisWizard.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Diagnosis } from '../../types';
import { saveAnalysisProgress, saveInternalAnalysis } from '../../lib/actions';

interface AnalysisWizardProps {
  readonly diagnosis: Diagnosis;
}

const WIZARD_STEPS = [
  {
    step: 1,
    title: "Marka Netliği & Konumlandırma",
    description: "Markanın pazardaki duruşunu, hedef kitle netliğini ve konumlandırma gücünü analiz edin.",
    fields: [
      { key: 'positioning_clarity', label: 'Konumlandırma Netliği (1-10)', tooltip: 'Markanın ne sattığı ve ne vaat ettiği ilk bakışta net mi?' },
      { key: 'target_audience_definition', label: 'Hedef Kitle Tanımı (1-10)', tooltip: 'Hedef kitle segmentasyonu ve müşteri profili doğru tanımlanmış mı?' }
    ]
  },
  {
    step: 2,
    title: "Premium Algı & Tasarım Kalitesi",
    description: "Markanın premium potansiyelini ve görsel kalitesini değerlendirin.",
    fields: [
      { key: 'visual_premiumness', label: 'Görsel Premium Algı (1-10)', tooltip: 'Tipografi, renkler ve genel görsel kimlik premium hissettiriyor mu?' },
      { key: 'price_justification', label: 'Fiyat Algısı Meşruiyeti (1-10)', tooltip: 'Mevcut görsel kimlik ve vaat, yüksek fiyatları meşrulaştırıyor mu?' }
    ]
  },
  {
    step: 3,
    title: "Hikaye Anlatımı & İletişim Tonu",
    description: "Markanın anlatı gücünü, ses tonunu ve kurduğu duygusal bağı puanlayın.",
    fields: [
      { key: 'emotional_connection', label: 'Duygusal Bağ ve Hikaye Gücü (1-10)', tooltip: 'Marka hikayesi müşteriyle güçlü bir duygusal bağ kurabiliyor mu?' },
      { key: 'copywriting_quality', label: 'Metin Yazarlığı Kalitesi (1-10)', tooltip: 'Web sitesi ve sosyal medyadaki metinler profesyonel ve etkileyici mi?' }
    ]
  },
  {
    step: 4,
    title: "Dijital Varlık & Güven",
    description: "Web sitesi deneyimini, sosyal kanıtları ve dijital güven öğelerini inceleyin.",
    fields: [
      { key: 'website_ux', label: 'Web Sitesi Deneyimi & UX (1-10)', tooltip: 'Site hızı, mobil uyumluluk ve kullanıcı deneyimi üst seviyede mi?' },
      { key: 'social_proof', label: 'Sosyal Kanıtların Yeterliliği (1-10)', tooltip: 'Müşteri yorumları, vaka çalışmaları ve referanslar ikna edici mi?' }
    ]
  },
  {
    step: 5,
    title: "Kreatif Sistem & Tutarlılık",
    description: "Tüm platformlardaki görsel tutarlılığı ve kreatif materyal kalitesini ölçün.",
    fields: [
      { key: 'visual_consistency', label: 'Görsel Tutarlılık (1-10)', tooltip: 'Sosyal medya, web sitesi ve reklamlar arasında görsel bir bütünlük var mı?' },
      { key: 'asset_quality', label: 'Kreatif Materyallerin Kalitesi (1-10)', tooltip: 'Fotoğraf, video ve grafiklerin kalitesi markanın seviyesine uygun mu?' }
    ]
  },
  {
    step: 6,
    title: "Teklif & Değer Önerisi",
    description: "Sunulan ürün/hizmet teklifinin gücünü ve pazardaki değer algısını puanlayın.",
    fields: [
      { key: 'offer_uniqueness', label: 'Teklifin Eşsizliği (1-10)', tooltip: 'Teklif rakiplerden belirgin bir şekilde ayrışıyor mu (USP)?' },
      { key: 'value_communication', label: 'Değer İletişimi (1-10)', tooltip: 'Hizmet veya ürünün değeri müşteriye doğru ve açık bir şekilde aktarılıyor mu?' }
    ]
  },
  {
    step: 7,
    title: "Pazar & Rekabet Gücü",
    description: "Markanın pazar talebini ve rekabetçi avantajını analiz edin.",
    fields: [
      { key: 'market_demand', label: 'Pazar Talebi ve Potansiyel (1-10)', tooltip: 'Sektörün büyüme hızı ve markaya olan pazar talebi ne seviyede?' },
      { key: 'competitive_advantage', label: 'Rakiplere Karşı Avantaj (1-10)', tooltip: 'Markanın rakiplerine kıyasla sürdürülebilir bir avantajı var mı?' }
    ]
  },
  {
    step: 8,
    title: "Ajans - Marka Kimyası",
    description: "Markanın büyümeye hazır olma durumunu ve iş birliği potansiyelini değerlendirin.",
    fields: [
      { key: 'growth_readiness', label: 'Büyümeye Hazırlık (1-10)', tooltip: 'Marka yönetimi büyümek ve değişmek için gerekli bütçe ve vizyona sahip mi?' },
      { key: 'chemistry_fit', label: 'İletişim ve Kimya Uyumu (1-10)', tooltip: 'Müşterinin yönetim tarzı ve beklentileri ajansınızla ne kadar uyumlu?' }
    ]
  },
  {
    step: 9,
    title: "Genel Değerlendirme & Sonuç",
    description: "Marka için genel teşhis kararınızı verin ve nihai notlarınızı ekleyin.",
    fields: [
      { key: 'overall_health', label: 'Genel Sağlık & Hazırlık Puanı (1-10)', tooltip: 'Markanın genel olarak ajans desteğiyle sıçrama yapmaya hazır olma seviyesi.' }
    ]
  }
];

export function AnalysisWizard({ diagnosis }: AnalysisWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(diagnosis.analysis_current_step || 1);
  const [completedSteps, setCompletedSteps] = useState<number[]>(diagnosis.analysis_completed_steps || []);
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    WIZARD_STEPS.forEach(s => {
      s.fields.forEach(f => {
        initial[f.key] = diagnosis.internal_analysis?.[f.key] ?? 5;
      });
      initial[`step_${s.step}_notes`] = diagnosis.internal_analysis?.[`step_${s.step}_notes`] ?? '';
    });
    return initial;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stepDef = WIZARD_STEPS.find(s => s.step === currentStep)!;
  const isLastStep = currentStep === WIZARD_STEPS.length;

  function handleSliderChange(key: string, value: number) {
    setFormData(prev => ({ ...prev, [key]: value }));
  }

  function handleNotesChange(value: string) {
    setFormData(prev => ({ ...prev, [`step_${currentStep}_notes`]: value }));
  }

  async function handleNext() {
    setIsLoading(true);
    setError(null);

    const nextCompleted = Array.from(new Set([...completedSteps, currentStep]));
    const nextStep = currentStep + 1;

    try {
      const result = await saveAnalysisProgress(
        diagnosis.id,
        nextStep,
        nextCompleted,
        formData
      );

      if (result.success) {
        setCompletedSteps(nextCompleted);
        setCurrentStep(nextStep);
        setIsLoading(false);
      } else {
        setError(result.error ?? 'İlerleme kaydedilemedi.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      setIsLoading(false);
    }
  }

  async function handleBack() {
    if (currentStep === 1) return;
    setCurrentStep(prev => prev - 1);
    setError(null);
  }

  async function handleSubmit() {
    setIsLoading(true);
    setError(null);

    try {
      const result = await saveInternalAnalysis(diagnosis.id, formData);

      if (result.success) {
        router.push(`/studio/marka101/${diagnosis.id}/sonuc`);
        router.refresh();
      } else {
        setError(result.error ?? 'Değerlendirme tamamlanamadı.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      setIsLoading(false);
    }
  }

  return (
    <div className="glass-card rounded-md p-6 md:p-8 space-y-6 text-[#c9c5d8]">
      {/* Step Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-[10px] font-bold text-[#8c869e] uppercase tracking-wider">
          <span>{stepDef.title}</span>
          <span className="text-[#ccbdff] font-black">Adım {currentStep} / {WIZARD_STEPS.length}</span>
        </div>
        <div className="w-full h-1.5 bg-[#0a0814] rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-[#4f20c0] to-[#b5179e] rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / WIZARD_STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <h2 className="text-base font-black text-white leading-tight">{stepDef.title}</h2>
          <p className="text-xs text-[#8c869e] mt-1">{stepDef.description}</p>
        </div>

        {/* Sliders */}
        <div className="space-y-4">
          {stepDef.fields.map(f => {
            const val = formData[f.key];
            return (
              <div key={f.key} className="space-y-2 bg-[#0e0b1a]/50 border border-white/10 rounded-md p-4 md:p-5 shadow-inner">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <label className="text-xs font-black text-white block">{f.label}</label>
                    <span className="text-[10px] text-[#8c869e] font-semibold mt-0.5 block">{f.tooltip}</span>
                  </div>
                  <span className="text-sm font-black text-purple-300 w-10 text-right tabular-nums">★ {val}</span>
                </div>
                <div className="pt-2 flex items-center gap-3">
                  <span className="text-[10px] font-bold text-[#8c869e]">1</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={val}
                    onChange={e => handleSliderChange(f.key, parseInt(e.target.value))}
                    className="flex-grow accent-[#4f20c0] h-1.5 bg-white/10 rounded appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] font-bold text-[#8c869e]">10</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-xs font-black text-white block">Değerlendirme Notları</label>
          <span className="text-[10px] text-[#8c869e] font-semibold block">Bu adımdaki bulgularınız ve tavsiyeleriniz</span>
          <textarea
            rows={3}
            value={formData[`step_${currentStep}_notes`] || ''}
            onChange={e => handleNotesChange(e.target.value)}
            placeholder={`${stepDef.title} hakkında ajans notlarınızı buraya yazın...`}
            className="w-full bg-[#0e0b1a]/85 border border-white/10 rounded px-4 py-3 text-xs font-semibold text-white focus:outline-none focus:border-[#4f20c0] placeholder-[#7d778f] leading-relaxed"
          />
        </div>

        {error && (
          <div className="p-3.5 bg-red-950/20 border border-red-900/30 text-red-400 text-xs font-bold rounded-sm">
            {error}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <button
            type="button"
            disabled={currentStep === 1 || isLoading}
            onClick={handleBack}
            className="px-4 py-2 border border-white/10 bg-[#0e0b1a] text-[#8c869e] hover:text-white font-bold text-xs rounded disabled:opacity-30 transition-all cursor-pointer"
          >
            ← Geri
          </button>
          
          {isLastStep ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleSubmit}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded disabled:opacity-50 transition-all cursor-pointer"
            >
              {isLoading ? 'Değerlendiriliyor...' : 'Değerlendirmeyi Tamamla ve Kaydet'}
            </button>
          ) : (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleNext}
              className="px-5 py-2.5 bg-gradient-to-r from-[#4f20c0] to-[#b5179e] hover:scale-[1.02] text-white font-bold text-xs rounded disabled:opacity-50 transition-all shadow-md shadow-purple-500/10 cursor-pointer"
            >
              {isLoading ? 'Kaydediliyor...' : 'Kaydet ve İlerle →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
