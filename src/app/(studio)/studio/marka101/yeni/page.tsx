// src/app/(studio)/studio/marka101/yeni/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createManualDiagnosis } from '@/features/diagnoses/lib/actions';

const SECTORS = [
  { value: 'health', label: 'Sağlık / Güzellik / Klinik' },
  { value: 'realestate', label: 'Gayrimenkul / Mimari / İç Mimari' },
  { value: 'b2b_industrial', label: 'Üretim / Sanayi / İhracat' },
  { value: 'general', label: 'Genel Hizmet' },
];

const BUSINESS_MODELS = [
  { value: 'b2b', label: 'B2B' },
  { value: 'b2c', label: 'B2C' },
  { value: 'hybrid', label: 'Karma (B2B+B2C)' },
];

const BRAND_STAGES = [
  { value: 'startup', label: 'Yeni Başlayan (0-2 Yıl)' },
  { value: 'growth', label: 'Büyüme Dönemi (2-5 Yıl)' },
  { value: 'corporate', label: 'Kurumsallaşan' },
  { value: 'premium', label: 'Premium Segmente Geçen' },
  { value: 'repositioning', label: 'Yeniden Konumlanan' },
];

export default function YeniMarkaPage() {
  const router = useRouter();
  const [brandName, setBrandName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [sector, setSector] = useState(SECTORS[0].value);
  const [businessModel, setBusinessModel] = useState(BUSINESS_MODELS[0].value);
  const [brandStage, setBrandStage] = useState(BRAND_STAGES[0].value);
  const [growthGoal, setGrowthGoal] = useState('');
  const [mainProblem, setMainProblem] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!brandName.trim() || !contactName.trim() || !contactEmail.trim()) {
      setError('Lütfen zorunlu alanları (Marka Adı, İletişim Kişisi, E-posta) doldurun.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await createManualDiagnosis({
        brandName: brandName.trim(),
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim().toLowerCase(),
        contactPhone: contactPhone.trim() || undefined,
        sector,
        businessModel,
        brandStage,
        growthGoal: growthGoal.trim(),
        mainProblem: mainProblem.trim(),
      });

      if (result.success && result.diagnosisId) {
        router.push(`/studio/marka101/${result.diagnosisId}`);
        router.refresh();
      } else {
        setError(result.error ?? 'Kayıt sırasında bir hata oluştu.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('Bir ağ veya sunucu hatası oluştu. Lütfen tekrar deneyin.');
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6 animate-fade-in-up pb-12 text-gray-700">
      <Link
        href="/studio/marka101"
        className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-1"
      >
        ← Başvurulara Dön
      </Link>

      <div className="glass-card rounded-md p-6 md:p-8 space-y-6 text-gray-700">
        <div>
          <span className="text-[10px] font-bold text-[#4f20c0] bg-purple-50 border border-purple-100/30 px-2.5 py-0.5 rounded-sm">
            Yeni Giriş
          </span>
          <h2 className="text-xl font-black text-gray-800 mt-2">Yeni Manuel Başvuru Ekle</h2>
          <p className="text-xs text-gray-400 mt-1">
            Form dolduramayan veya doğrudan ajansınıza başvuran markalar için manuel analiz kaydı oluşturun.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs font-semibold text-gray-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="brand-name-field" className="block text-gray-400 font-bold uppercase text-[9px] tracking-wider">
                Marka / Şirket Adı <span className="text-red-500">*</span>
              </label>
              <input
                id="brand-name-field"
                type="text"
                required
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                placeholder="Örn: Acme A.Ş."
                className="w-full bg-white border border-gray-200 rounded px-3.5 py-2.5 text-xs font-bold text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#4f20c0] transition-all"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="contact-name-field" className="block text-gray-400 font-bold uppercase text-[9px] tracking-wider">
                İletişim Kurulacak Kişi <span className="text-red-500">*</span>
              </label>
              <input
                id="contact-name-field"
                type="text"
                required
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                placeholder="Örn: Ahmet Yılmaz"
                className="w-full bg-white border border-gray-200 rounded px-3.5 py-2.5 text-xs font-bold text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#4f20c0] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="contact-email-field" className="block text-gray-400 font-bold uppercase text-[9px] tracking-wider">
                İletişim E-Postası <span className="text-red-500">*</span>
              </label>
              <input
                id="contact-email-field"
                type="email"
                required
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                placeholder="ahmet@acme.com"
                className="w-full bg-white border border-gray-200 rounded px-3.5 py-2.5 text-xs font-bold text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#4f20c0] transition-all"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="contact-phone-field" className="block text-gray-400 font-bold uppercase text-[9px] tracking-wider">
                Telefon / WhatsApp
              </label>
              <input
                id="contact-phone-field"
                type="tel"
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                placeholder="+90 5xx xxx xx xx"
                className="w-full bg-white border border-gray-200 rounded px-3.5 py-2.5 text-xs font-bold text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#4f20c0] transition-all"
              />
            </div>
          </div>

          <div className="h-px bg-gray-100 my-2" />

          <div>
            <h3 className="text-sm font-black text-gray-800 mb-3">Marka Bağlamı ve Sektör Bilgisi</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label htmlFor="sector-selection" className="block text-gray-400 font-bold uppercase text-[9px]">Sektör</label>
                <select
                  id="sector-selection"
                  value={sector}
                  onChange={e => setSector(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-3 py-2.5 text-xs font-bold text-gray-755 focus:outline-none cursor-pointer focus:border-[#4f20c0] transition-all"
                >
                  {SECTORS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="business-model-selection" className="block text-gray-400 font-bold uppercase text-[9px]">İş Modeli</label>
                <select
                  id="business-model-selection"
                  value={businessModel}
                  onChange={e => setBusinessModel(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-3 py-2.5 text-xs font-bold text-gray-755 focus:outline-none cursor-pointer focus:border-[#4f20c0] transition-all"
                >
                  {BUSINESS_MODELS.map(b => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="brand-stage-selection" className="block text-gray-400 font-bold uppercase text-[9px]">Marka Aşaması</label>
                <select
                  id="brand-stage-selection"
                  value={brandStage}
                  onChange={e => setBrandStage(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-3 py-2.5 text-xs font-bold text-gray-755 focus:outline-none cursor-pointer focus:border-[#4f20c0] transition-all"
                >
                  {BRAND_STAGES.map(bs => (
                    <option key={bs.value} value={bs.value}>{bs.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="growth-goal-field" className="block text-gray-400 font-bold uppercase text-[9px] tracking-wider">Büyüme Hedefi</label>
            <textarea
              id="growth-goal-field"
              rows={3}
              value={growthGoal}
              onChange={e => setGrowthGoal(e.target.value)}
              placeholder="Örn: Markayı premium segmente taşıyarak ortalama sipariş değerini %50 artırmak."
              className="w-full bg-white border border-gray-200 rounded px-3.5 py-2.5 text-xs font-bold text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#4f20c0] transition-all"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="main-problem-field" className="block text-gray-400 font-bold uppercase text-[9px] tracking-wider">Ana Problem</label>
            <textarea
              id="main-problem-field"
              rows={3}
              value={mainProblem}
              onChange={e => setMainProblem(e.target.value)}
              placeholder="Örn: Sosyal medyada çok içerik üretiyoruz ama web sitemize dönüş alamıyoruz, güven bağı kuramıyoruz."
              className="w-full bg-white border border-gray-200 rounded px-3.5 py-2.5 text-xs font-bold text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#4f20c0] transition-all"
            />
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-655 rounded-sm text-xs font-bold">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/studio/marka101"
              className="px-4 py-2 bg-white border border-gray-200 text-gray-500 hover:text-gray-800 font-bold rounded transition-all"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-gradient-to-r from-[#4f20c0] to-[#b5179e] hover:scale-[1.02] text-white font-bold rounded shadow-lg shadow-purple-500/10 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Kaydediliyor...' : 'Kaydet ve Analiz Başlat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
