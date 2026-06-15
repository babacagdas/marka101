// src/features/diagnoses/components/public/PublicFormShell.tsx
// Stitch wizard UI — form logic korunur, görsel yenilendi
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitPublicDiagnosis } from '@/features/diagnoses/lib/actions'
import type { PublicFormData } from '@/features/diagnoses/types'

const STEPS = [
  { number: 1, label: 'Temel Bilgiler',    phase: 'Bağlam' },
  { number: 2, label: 'Markanız Hakkında', phase: 'Bağlam' },
  { number: 3, label: 'Hedef Kitle',       phase: 'Marka Netliği' },
  { number: 4, label: 'Dijital Varlık',    phase: 'Dijital Güven' },
  { number: 5, label: 'Rakipler',          phase: 'Marka Netliği' },
  { number: 6, label: 'İletişim',          phase: 'Tamamla' },
] as const

const TOTAL_STEPS = STEPS.length

const INITIAL: PublicFormData = {
  brand_name:    '',
  contact_name:  '',
  contact_email: '',
}

// ── Ortak input class ────────────────────────────────────────────
const inputCls =
  'w-full h-14 px-6 bg-surface-container-low border-none rounded-xl ' +
  'focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all ' +
  'text-body-md outline-none placeholder:text-secondary/50'

const textareaCls =
  'w-full px-6 py-4 bg-surface-container-low border-none rounded-xl ' +
  'focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all ' +
  'text-body-md outline-none placeholder:text-secondary/50 resize-none'

const selectCls =
  'w-full h-14 px-6 bg-surface-container-low border-none rounded-xl ' +
  'focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all ' +
  'text-body-md outline-none'

// ── Toggle pill (Evet/Hayır) ─────────────────────────────────────
function TogglePill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'px-6 py-3 rounded-full text-label-lg transition-all ' +
        (active
          ? 'bg-primary text-on-primary shadow-primary-glow'
          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container')
      }
    >
      {children}
    </button>
  )
}

// ── Adım 1: Temel Bilgiler ────────────────────────────────────────
function Step1({ d, u }: { d: PublicFormData; u: (f: Partial<PublicFormData>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-label-lg text-on-surface-variant mb-2">
          Marka / Firma Adı <span className="text-error">*</span>
        </label>
        <input
          type="text"
          value={d.brand_name}
          onChange={(e) => u({ brand_name: e.target.value })}
          placeholder="örn. SNC Mimarlık"
          className={inputCls}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-label-lg text-on-surface-variant mb-2">Sektör</label>
          <input
            type="text"
            value={d.sector ?? ''}
            onChange={(e) => u({ sector: e.target.value })}
            placeholder="örn. Mimarlık, Gıda, Yazılım"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-label-lg text-on-surface-variant mb-2">Şehir</label>
          <input
            type="text"
            value={d.city ?? ''}
            onChange={(e) => u({ city: e.target.value })}
            placeholder="örn. İstanbul"
            className={inputCls}
          />
        </div>
      </div>
      <div>
        <label className="block text-label-lg text-on-surface-variant mb-2">Web Sitesi</label>
        <input
          type="url"
          value={d.website_url ?? ''}
          onChange={(e) => u({ website_url: e.target.value })}
          placeholder="https://markaniz.com"
          className={inputCls}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-label-lg text-on-surface-variant mb-2">Instagram</label>
          <input
            type="url"
            value={d.instagram_url ?? ''}
            onChange={(e) => u({ instagram_url: e.target.value })}
            placeholder="https://instagram.com/..."
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-label-lg text-on-surface-variant mb-2">LinkedIn</label>
          <input
            type="url"
            value={d.linkedin_url ?? ''}
            onChange={(e) => u({ linkedin_url: e.target.value })}
            placeholder="https://linkedin.com/..."
            className={inputCls}
          />
        </div>
      </div>
    </div>
  )
}

// ── Adım 2: Marka Hakkında ────────────────────────────────────────
function Step2({ d, u }: { d: PublicFormData; u: (f: Partial<PublicFormData>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-label-lg text-on-surface-variant mb-2">
          Ne satıyorsunuz / ne yapıyorsunuz?
        </label>
        <textarea
          value={d.what_they_sell ?? ''}
          onChange={(e) => u({ what_they_sell: e.target.value })}
          rows={3}
          placeholder="Ürün veya hizmetlerinizi kısaca açıklayın..."
          className={textareaCls}
        />
      </div>
      <div>
        <label className="block text-label-lg text-on-surface-variant mb-2">
          Müşterinize verdiğiniz ana söz nedir?
        </label>
        <textarea
          value={d.main_promise ?? ''}
          onChange={(e) => u({ main_promise: e.target.value })}
          rows={2}
          placeholder="örn. Zamanında teslimat garantisi"
          className={textareaCls}
        />
      </div>
      <div>
        <label className="block text-label-lg text-on-surface-variant mb-2">
          Kendinizi kısaca nasıl tanımlarsınız?
        </label>
        <textarea
          value={d.self_description ?? ''}
          onChange={(e) => u({ self_description: e.target.value })}
          rows={2}
          placeholder="Markanızın kısa tanımı..."
          className={textareaCls}
        />
      </div>
    </div>
  )
}

// ── Adım 3: Hedef Kitle ───────────────────────────────────────────
function Step3({ d, u }: { d: PublicFormData; u: (f: Partial<PublicFormData>) => void }) {
  const options = [
    { value: 'b2b',  label: 'Şirketlere (B2B)' },
    { value: 'b2c',  label: 'Bireysel müşteri (B2C)' },
    { value: 'both', label: 'Her ikisine' },
  ] as const

  return (
    <div className="space-y-6">
      <div>
        <p className="text-label-lg text-on-surface-variant mb-3">Kime satıyorsunuz?</p>
        <div className="flex flex-col sm:flex-row gap-3">
          {options.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => u({ sells_to: value })}
              className={
                'flex-1 py-4 px-6 text-label-lg rounded-xl border transition-all ' +
                (d.sells_to === value
                  ? 'bg-primary text-on-primary border-primary shadow-primary-glow'
                  : 'bg-surface-container-low border-surface-container text-on-surface-variant hover:border-primary/40')
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-label-lg text-on-surface-variant mb-2">
          Müşteriniz genellikle kim?
        </label>
        <textarea
          value={d.customer_profile ?? ''}
          onChange={(e) => u({ customer_profile: e.target.value })}
          rows={2}
          placeholder="örn. 30-45 yaş arası profesyoneller..."
          className={textareaCls}
        />
      </div>
      <div>
        <label className="block text-label-lg text-on-surface-variant mb-2">
          Satın almadan önce en çok neye dikkat eder?
        </label>
        <textarea
          value={d.customer_purchase_consideration ?? ''}
          onChange={(e) => u({ customer_purchase_consideration: e.target.value })}
          rows={2}
          placeholder="örn. Referanslar, fiyat, hız..."
          className={textareaCls}
        />
      </div>
    </div>
  )
}

// ── Adım 4: Dijital Varlık ────────────────────────────────────────
function Step4({ d, u }: { d: PublicFormData; u: (f: Partial<PublicFormData>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-label-lg text-on-surface-variant mb-3">Web siteniz var mı?</p>
        <div className="flex gap-3">
          <TogglePill active={d.has_website === true}  onClick={() => u({ has_website: true })}>Evet</TogglePill>
          <TogglePill active={d.has_website === false} onClick={() => u({ has_website: false })}>Hayır</TogglePill>
        </div>
      </div>
      {d.has_website && (
        <div>
          <p className="text-label-lg text-on-surface-variant mb-3">Site güncel mi?</p>
          <div className="flex gap-3 flex-wrap">
            {(['yes', 'no', 'unknown'] as const).map((v) => (
              <TogglePill key={v} active={d.website_up_to_date === v} onClick={() => u({ website_up_to_date: v })}>
                {v === 'yes' ? 'Evet' : v === 'no' ? 'Hayır' : 'Bilmiyorum'}
              </TogglePill>
            ))}
          </div>
        </div>
      )}
      <div>
        <p className="text-label-lg text-on-surface-variant mb-3">Sosyal medyanız aktif mi?</p>
        <div className="flex gap-3">
          <TogglePill active={d.social_media_active === true}  onClick={() => u({ social_media_active: true })}>Evet</TogglePill>
          <TogglePill active={d.social_media_active === false} onClick={() => u({ social_media_active: false })}>Hayır</TogglePill>
        </div>
      </div>
      <div>
        <p className="text-label-lg text-on-surface-variant mb-3">Düzenli içerik paylaşıyor musunuz?</p>
        <div className="flex gap-3">
          <TogglePill active={d.posts_regularly === true}  onClick={() => u({ posts_regularly: true })}>Evet</TogglePill>
          <TogglePill active={d.posts_regularly === false} onClick={() => u({ posts_regularly: false })}>Hayır</TogglePill>
        </div>
      </div>
    </div>
  )
}

// ── Adım 5: Rakipler ─────────────────────────────────────────────
function Step5({ d, u }: { d: PublicFormData; u: (f: Partial<PublicFormData>) => void }) {
  const competitors = d.competitors ?? []

  function add(name: string) {
    const t = name.trim()
    if (!t || competitors.includes(t)) return
    u({ competitors: [...competitors, t] })
  }

  function remove(name: string) {
    u({ competitors: competitors.filter((c) => c !== name) })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 bg-surface-container-low/60 rounded-xl">
        <span className="material-symbols-outlined text-secondary text-xl mt-0.5">info</span>
        <p className="text-label-md text-secondary italic">
          Bu alan opsiyoneldir. Rakip olarak gördüğünüz markalar varsa yazın.
        </p>
      </div>
      <div className="flex gap-3">
        <input
          type="text"
          id="competitor-input"
          placeholder="Rakip marka adı veya sitesi"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add((e.target as HTMLInputElement).value)
              ;(e.target as HTMLInputElement).value = ''
            }
          }}
          className={`${inputCls} flex-1`}
        />
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById('competitor-input') as HTMLInputElement | null
            if (el) { add(el.value); el.value = '' }
          }}
          className="px-6 py-3 bg-surface-container text-on-surface-variant rounded-xl text-label-lg hover:bg-surface-container-high transition-colors"
        >
          Ekle
        </button>
      </div>
      {competitors.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {competitors.map((c) => (
            <span
              key={c}
              className="flex items-center gap-1.5 bg-primary-fixed text-on-primary-fixed text-label-md px-4 py-2 rounded-full"
            >
              {c}
              <button
                type="button"
                onClick={() => remove(c)}
                className="text-on-primary-fixed/50 hover:text-on-primary-fixed transition-colors"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Adım 6: Beklentiler + İletişim ──────────────────────────────
const EXPECTATION_OPTS = [
  'Marka kimliği ve tasarım',
  'Web sitesi / landing page',
  'Sosyal medya yönetimi',
  'İçerik üretimi',
  'Reklam yönetimi (Meta / Google)',
  'Strateji ve danışmanlık',
]
const GOAL_OPTS = [
  'Daha fazla müşteri kazanmak',
  'Marka bilinirliğini artırmak',
  'Dijital varlığı güçlendirmek',
  'Satışları artırmak',
  'Rakiplerden ayrışmak',
]
const BUDGET_OPTS = [
  '5.000 ₺ ve altı',
  '5.000 – 15.000 ₺',
  '15.000 – 30.000 ₺',
  '30.000 ₺ ve üzeri',
  'Belirtmek istemiyorum',
]

function Step6({ d, u }: { d: PublicFormData; u: (f: Partial<PublicFormData>) => void }) {
  const expectations = d.expectations ?? []

  function toggle(v: string) {
    if (expectations.includes(v)) {
      u({ expectations: expectations.filter((e) => e !== v) })
    } else {
      u({ expectations: [...expectations, v] })
    }
  }

  return (
    <div className="space-y-6">
      {/* Beklentiler */}
      <div>
        <p className="text-label-lg text-on-surface-variant mb-3">Ajansımızdan beklentileriniz</p>
        <div className="flex flex-wrap gap-2">
          {EXPECTATION_OPTS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={
                'px-4 py-2 text-label-md rounded-full border transition-all ' +
                (expectations.includes(opt)
                  ? 'bg-primary text-on-primary border-primary'
                  : 'border-surface-container text-on-surface-variant hover:border-primary/40')
              }
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
      {/* Hedef */}
      <div>
        <label className="block text-label-lg text-on-surface-variant mb-2">Öncelikli hedefiniz</label>
        <select
          value={d.primary_goal ?? ''}
          onChange={(e) => u({ primary_goal: e.target.value })}
          className={selectCls}
        >
          <option value="">Seçin</option>
          {GOAL_OPTS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      {/* Bütçe */}
      <div>
        <label className="block text-label-lg text-on-surface-variant mb-2">
          Aylık pazarlama bütçeniz{' '}
          <span className="text-secondary opacity-60 font-normal">(opsiyonel)</span>
        </label>
        <select
          value={d.monthly_budget_range ?? ''}
          onChange={(e) => u({ monthly_budget_range: e.target.value })}
          className={selectCls}
        >
          <option value="">Belirtmek istemiyorum</option>
          {BUDGET_OPTS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      {/* İletişim */}
      <div className="pt-4 border-t border-surface-container space-y-5">
        <p className="text-label-lg font-bold text-on-background">İletişim Bilgileri</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-label-lg text-on-surface-variant mb-2">
              Adınız <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={d.contact_name}
              onChange={(e) => u({ contact_name: e.target.value })}
              placeholder="Ad Soyad"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-label-lg text-on-surface-variant mb-2">Telefon</label>
            <input
              type="tel"
              value={d.contact_phone ?? ''}
              onChange={(e) => u({ contact_phone: e.target.value })}
              placeholder="05XX XXX XX XX"
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <label className="block text-label-lg text-on-surface-variant mb-2">
            E-posta <span className="text-error">*</span>
          </label>
          <input
            type="email"
            value={d.contact_email}
            onChange={(e) => u({ contact_email: e.target.value })}
            placeholder="kurumsal@eposta.com"
            className={inputCls}
          />
        </div>
        {/* Gizlilik notu */}
        <div className="flex items-start gap-3 p-4 bg-surface-container-low/50 rounded-xl">
          <span className="material-symbols-outlined text-secondary text-xl mt-0.5">lock</span>
          <p className="text-label-md text-secondary leading-relaxed">
            Bilgileriniz yalnızca marka ön analizi ve iletişim için kullanılacaktır.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Ana Form Shell ────────────────────────────────────────────────
export function PublicFormShell() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<PublicFormData>(INITIAL)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update(fields: Partial<PublicFormData>) {
    setData((prev) => ({ ...prev, ...fields }))
  }

  function validate(): string | null {
    if (step === 1 && !data.brand_name.trim()) return 'Marka adı zorunludur.'
    if (step === 6) {
      if (!data.contact_name.trim())  return 'Adınız zorunludur.'
      if (!data.contact_email.trim()) return 'E-posta zorunludur.'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact_email)) return 'Geçerli bir e-posta girin.'
    }
    return null
  }

  function handleNext() {
    const err = validate()
    if (err) { setError(err); return }
    setError(null)
    setStep((s) => s + 1)
  }

  function handlePrev() {
    setError(null)
    setStep((s) => s - 1)
  }

  async function handleSubmit() {
    const err = validate()
    if (err) { setError(err); return }
    setError(null)
    setIsSubmitting(true)
    try {
      const result = await submitPublicDiagnosis(data)
      if (result.success) {
        router.push('/marka101/tesekkurler')
      } else {
        setError(result.error ?? 'Bir hata oluştu. Lütfen tekrar deneyin.')
      }
    } catch {
      setError('Gönderim sırasında bir hata oluştu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLast       = step === TOTAL_STEPS
  const current      = STEPS[step - 1]
  const progressPct  = Math.round((step / TOTAL_STEPS) * 100)

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* ── Wizard Kartı ─────────────────────────────────────── */}
      <div className="bg-surface-container-lowest rounded-lg premium-shadow border border-surface-container p-8 md:p-12">

        {/* Progress header */}
        <div className="mb-stack-sm">
          <div className="flex justify-between items-end mb-3">
            <span className="text-label-lg uppercase tracking-widest text-primary">
              {current.phase}
            </span>
            <span className="text-label-md text-secondary">
              Adım {step} / {TOTAL_STEPS}
            </span>
          </div>
          <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-container rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Adım başlığı */}
        <div className="mb-stack-sm">
          <h2 className="text-headline-md text-on-surface font-bold">{current.label}</h2>
        </div>

        {/* Adım içeriği */}
        <div className="mb-stack-sm">
          {step === 1 && <Step1 d={data} u={update} />}
          {step === 2 && <Step2 d={data} u={update} />}
          {step === 3 && <Step3 d={data} u={update} />}
          {step === 4 && <Step4 d={data} u={update} />}
          {step === 5 && <Step5 d={data} u={update} />}
          {step === 6 && <Step6 d={data} u={update} />}
        </div>

        {/* Hata */}
        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-error-container/40 rounded-xl">
            <span className="material-symbols-outlined text-error text-xl">error</span>
            <p className="text-label-md text-error">{error}</p>
          </div>
        )}

        {/* Navigasyon */}
        <div className="flex items-center justify-between pt-6 border-t border-surface-container-high">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 rounded-full border border-primary text-primary text-label-lg hover:bg-primary-fixed transition-colors disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Geri
            </button>
          ) : (
            <span />
          )}

          {isLast ? (
            <button
              type="button"
              onClick={() => { void handleSubmit() }}
              disabled={isSubmitting}
              className="flex items-center gap-2 min-w-[180px] justify-center
                         px-8 py-3 rounded-full bg-primary text-on-primary text-label-lg
                         hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all shadow-primary-glow"
            >
              {isSubmitting ? 'Gönderiliyor...' : 'Analizi Gönder'}
              {!isSubmitting && (
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 min-w-[160px] justify-center
                         px-8 py-3 rounded-full bg-primary-container text-on-primary text-label-lg
                         hover:opacity-90 transition-all"
            >
              Devam Et
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
