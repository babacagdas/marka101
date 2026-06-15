// src/features/diagnoses/components/public/LeadFormScreen.tsx
"use client";
import { useState, useId } from "react";
import type { BrandContext, DiagnosisAnswerValue, DiagnosisOpenEnded, DiagnosisScores } from "../../diagnosis-types";
// Doğrudan actions import — barrel yok (server query karışma riski önlenir)
import { submitDiagnosisWithContact } from "@/features/diagnoses/lib/actions";

function genSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
}

interface FormErrors { name?: string; email?: string; company?: string }

function validate(name: string, email: string, company: string): FormErrors {
  const e: FormErrors = {};
  if (name.trim().length < 2) e.name = "En az 2 karakter girin.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Geçerli bir e-posta adresi girin.";
  if (company.trim().length === 0) e.company = "Bu alan zorunludur.";
  return e;
}

interface LeadFormScreenProps {
  context:         BrandContext;
  answers:         Readonly<Record<string, DiagnosisAnswerValue>>;
  openEnded:       DiagnosisOpenEnded;
  scores:          DiagnosisScores;
  questionsServed: number;
  onSuccess:       (diagnosisId: string) => void;
  onBack:          () => void;
}

const inputCls = "w-full h-14 px-6 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-body-md outline-none placeholder:text-secondary/40";

export function LeadFormScreen({
  context, answers, openEnded, scores, questionsServed, onSuccess, onBack,
}: LeadFormScreenProps) {
  const uid = useId();
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [company,  setCompany]  = useState("");
  const [phone,    setPhone]    = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setApiError(null);
    const fe = validate(name, email, company);
    if (Object.keys(fe).length > 0) { setErrors(fe); return; }
    setErrors({});
    setLoading(true);

    try {
      const result = await submitDiagnosisWithContact(
        {
          name:     name.trim(),
          email:    email.trim().toLowerCase(),
          company:  company.trim(),
          phone:    phone.trim() || undefined,
          honeypot: honeypot || undefined,
        },
        {
          sessionId:       genSessionId(),
          context,
          answers:         { ...answers },
          openEnded,
          scores: {
            brandHealth:      scores.brandHealth,
            sectorFit:        scores.sectorFit,
            salesReadiness:   scores.salesReadiness,
            premiumPotential: scores.premiumPotential,
            leadQuality:      scores.leadQuality,
            leadSegment:      scores.leadSegment,
            brandType:        { key: scores.brandType.key, label: scores.brandType.label },
            weakestCategory:  { key: scores.weakestCategory.key, label: scores.weakestCategory.label, normalizedScore: scores.weakestCategory.normalizedScore },
            strongestCategory:{ key: scores.strongestCategory.key, label: scores.strongestCategory.label, normalizedScore: scores.strongestCategory.normalizedScore },
            categories:       Object.fromEntries(
              Object.entries(scores.categories).map(([k,v]) => [k, { normalizedScore: v.normalizedScore, riskLevel: v.riskLevel }])
            ),
            riskLabels:       { active: scores.riskLabels.active, primary: scores.riskLabels.primary },
            imbalanceAlert:   { active: scores.imbalanceAlert.active, maxGap: scores.imbalanceAlert.maxGap },
            conflictSignals:  scores.conflictSignals.map(c => ({ id: c.id, label: c.label })),
            explainability:   scores.explainability,
            treatmentIntelligence: scores.treatmentIntelligence,
          },
          questionsServed,
          completionRate: 100,
          confidence: scores.confidence,
        }
      );

      if (result.success && result.diagnosisId) {
        onSuccess(result.diagnosisId);
      } else {
        setApiError(result.error ?? "Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } catch {
      setApiError("Gönderim sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  function Field({ id, label, type="text", value, onChange, placeholder, error, optional, autoComplete }: {
    id: string; label: string; type?: string; value: string; onChange: (v: string) => void;
    placeholder: string; error?: string; optional?: boolean; autoComplete?: string;
  }) {
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${uid}-${id}`} className="text-label-lg text-on-surface-variant flex items-center gap-1.5">
          {label}
          {optional && <span className="text-secondary opacity-60 font-normal">(opsiyonel)</span>}
        </label>
        <input id={`${uid}-${id}`} type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} autoComplete={autoComplete}
          className={[inputCls, error ? "ring-2 ring-error/40" : ""].join(" ")} />
        {error && <p className="text-label-md text-error">{error}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-surface-container-lowest rounded-lg premium-shadow border border-surface-container p-8 md:p-12">
        <span className="text-label-lg text-primary uppercase tracking-widest block mb-4">Deep Brand Diagnosis</span>
        <h1 className="text-headline-lg font-bold text-on-background mb-3">Detaylı Ön Analizi Gör</h1>
        <p className="text-body-md text-secondary mb-8 leading-relaxed">
          Ön skorunuz hazır. Kategori detayları, risk haritası ve ilk önerilen adımı görmek için bilgilerinizi bırakın.
        </p>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          {/* Honeypot */}
          <input type="text" value={honeypot} onChange={e => setHoneypot(e.target.value)}
            tabIndex={-1} aria-hidden="true" autoComplete="off" className="sr-only" />

          <Field id="name"    label="Ad Soyad"       value={name}    onChange={setName}    placeholder="Adınız Soyadınız"    error={errors.name}    autoComplete="name" />
          <Field id="email"   label="E-posta"         type="email" value={email}   onChange={setEmail}   placeholder="isim@sirket.com"     error={errors.email}   autoComplete="email" />
          <Field id="company" label="Şirket / Marka"  value={company} onChange={setCompany} placeholder="Marka veya şirket adı" error={errors.company} autoComplete="organization" />
          <Field id="phone"   label="Telefon / WhatsApp" type="tel" value={phone} onChange={setPhone} placeholder="+90 5xx xxx xx xx" optional={true} autoComplete="tel" />

          {apiError && (
            <div className="flex items-center gap-3 p-4 bg-error-container/40 rounded-xl border border-error/20">
              <span className="material-symbols-outlined text-error text-xl">error</span>
              <p className="text-label-md text-error leading-relaxed">{apiError}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className={["w-full h-14 rounded-full text-label-lg font-semibold transition-all flex items-center justify-center gap-2",
              loading ? "bg-surface-container text-outline cursor-not-allowed" : "bg-primary text-on-primary hover:opacity-90 shadow-primary-glow"].join(" ")}>
            {loading ? "Gönderiliyor…" : "Detaylı Ön Analizi Aç"}
            {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
          </button>
        </form>

        <div className="mt-6 flex items-start gap-3 p-4 bg-surface-container-low/50 rounded-xl">
          <span className="material-symbols-outlined text-secondary text-xl mt-0.5">lock</span>
          <p className="text-label-md text-secondary leading-relaxed">
            Bu bilgiler yalnızca analiz sonucunuz ve Deep Creative değerlendirmesi için kullanılır.
          </p>
        </div>

        <button type="button" onClick={onBack} disabled={loading}
          className="mt-4 text-label-md text-secondary hover:text-on-surface transition-colors self-center block w-full text-center">
          ← Geri
        </button>
      </div>
    </div>
  );
}
