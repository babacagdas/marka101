'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { PublicFormData, Diagnosis } from '../types'
import type { BrandContext, DiagnosisAnswerValue, DiagnosisOpenEnded, LearningIntelligence } from '../diagnosis-types'
import { calculateScores } from '../scoring'
import { calculateDiagnosisResult } from '../scoring/engine'

// ── getAllDiagnoses ───────────────────────────────────────────────

export async function getAllDiagnoses(): Promise<Diagnosis[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('diagnoses')
    .select('*')
    .order('submitted_at', { ascending: false })
  if (error) {
    console.error('[getAllDiagnoses]', error)
    return []
  }
  return (data ?? []) as Diagnosis[]
}

// ── getDiagnosisById ─────────────────────────────────────────────

export async function getDiagnosisById(id: string): Promise<Diagnosis | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('diagnoses')
    .select('*')
    .eq('id', id)
    .single()
  if (error) {
    console.error('[getDiagnosisById]', error)
    return null
  }
  return data as Diagnosis
}

// ── submitPublicDiagnosis — basit form (eski, compat) ───────────

export async function submitPublicDiagnosis(
  data: PublicFormData
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  const { error } = await supabase.from('diagnoses').insert({
    status:                 'new',
    source:                 'public_form',
    brand_name:             data.brand_name?.trim() ?? '',
    submitted_email:        data.contact_email?.trim() ?? '',
    submitted_phone:        data.contact_phone?.trim() ?? null,
    submitted_contact_name: data.contact_name?.trim() ?? '',
    submitted_at:           new Date().toISOString(),
    public_submission:      data,
  })

  if (error) {
    console.error('[submitPublicDiagnosis]', {
      message: error.message, code: error.code,
      details: error.details, hint: error.hint,
    })
    return { success: false, error: 'Kayıt sırasında bir hata oluştu.' }
  }

  revalidatePath('/studio/marka101')
  return { success: true }
}

// ── submitDiagnosisWithContact — DiagnosisWizard LeadFormScreen ──
// RLS anon_public_submit uyumlu: studio alanlarına dokunmaz.

interface ContactInfo {
  name:      string
  email:     string
  company:   string
  phone?:    string
  honeypot?: string
}

interface DiagnosisSessionArg {
  sessionId:       string
  context:         BrandContext
  answers:         Record<string, DiagnosisAnswerValue>
  openEnded:       DiagnosisOpenEnded
  scores: {
    brandHealth:         number
    sectorFit:           number
    salesReadiness:      number
    premiumPotential:    number
    leadQuality:         number
    leadSegment:         string
    brandType:           { key: string; label: string }
    weakestCategory:     { key: string; label: string; normalizedScore: number }
    strongestCategory:   { key: string; label: string; normalizedScore: number }
    categories:          Record<string, { normalizedScore: number; riskLevel: string }>
    riskLabels:          { active: boolean; primary: string | null }
    imbalanceAlert:      { active: boolean; maxGap: number }
    conflictSignals:     Array<{ id: string; label: string }>
    explainability?:     any
    treatmentIntelligence?: any
  }
  questionsServed: number
  completionRate:  number
  confidence:      string
}

export async function submitDiagnosisWithContact(
  contact: ContactInfo,
  session: DiagnosisSessionArg,
): Promise<{ success: boolean; diagnosisId?: string; error?: string }> {
  // Honeypot koruması
  if (contact.honeypot && contact.honeypot.trim().length > 0) {
    return { success: true, diagnosisId: 'blocked' }
  }

  if (!contact.name.trim() || !contact.email.trim() || !contact.company.trim()) {
    return { success: false, error: 'Zorunlu alanlar eksik.' }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
    return { success: false, error: 'Geçersiz e-posta adresi.' }
  }

  // Cevapları katmanlara ayır
  const CONTEXT_IDS  = new Set(['BG-01','BG-02','BG-03','BG-04','BG-05','BG-06','BG-07'])
  const CORE_PFXS    = ['MN-','PA-','ST-','DG-','KS-','FD-']
  const SECTOR_PFXS  = ['SM-']
  const TRIGGER_PFXS = ['TR-']

  const contextAnswers: Record<string, DiagnosisAnswerValue>  = {}
  const coreAnswers:    Record<string, DiagnosisAnswerValue>   = {}
  const sectorAnswers:  Record<string, DiagnosisAnswerValue>   = {}
  const triggerAnswers: Record<string, DiagnosisAnswerValue>   = {}

  for (const [id, val] of Object.entries(session.answers)) {
    if (CONTEXT_IDS.has(id))                         contextAnswers[id]  = val
    else if (CORE_PFXS.some(p => id.startsWith(p))) coreAnswers[id]     = val
    else if (SECTOR_PFXS.some(p => id.startsWith(p))) sectorAnswers[id] = val
    else if (TRIGGER_PFXS.some(p => id.startsWith(p))) triggerAnswers[id] = val
  }

  const publicSubmission = {
    brandContext:     session.context,
    contextAnswers,
    coreAnswers,
    sectorAnswers,
    triggerAnswers,
    openEndedAnswers: session.openEnded,
    brandBudget:      contextAnswers['BG-06'] as string | undefined,
    agencyStatus:     contextAnswers['BG-07'] as string | undefined,
    scores:           session.scores,
    questionsServed:  session.questionsServed,
    completionRate:   session.completionRate,
    confidence:       session.confidence,
    completedAt:      new Date().toISOString(),
  }

  const supabase = createClient()

  const { data, error } = await supabase
    .from('diagnoses')
    .insert({
      status:                 'new',
      source:                 'public_form',
      brand_name:             contact.company.trim(),
      submitted_email:        contact.email.trim().toLowerCase(),
      submitted_phone:        contact.phone?.trim() ?? null,
      submitted_contact_name: contact.name.trim(),
      submitted_at:           new Date().toISOString(),
      public_submission:      publicSubmission,
      // Studio alanları NULL — RLS anon_public_submit policy gereği
    })
    .select('id')
    .single()

  if (error) {
    console.error('[submitDiagnosisWithContact] Supabase hatası:', {
      message: error.message,
      code:    error.code,
      details: error.details,
      hint:    error.hint,
    })
    return { success: false, error: 'Kayıt sırasında bir hata oluştu.' }
  }

  revalidatePath('/studio/marka101')
  return { success: true, diagnosisId: (data as { id: string }).id }
}

// ── createManualDiagnosis — manuel marka ekleme ─────────────────

export interface ManualDiagnosisInput {
  brandName:     string
  contactName:   string
  contactEmail:  string
  contactPhone?: string
  sector:        string
  businessModel: string
  brandStage:    string
  growthGoal:    string
  mainProblem:   string
}

export async function createManualDiagnosis(
  input: ManualDiagnosisInput
): Promise<{ success: boolean; diagnosisId?: string; error?: string }> {
  if (!input.brandName.trim() || !input.contactName.trim() || !input.contactEmail.trim()) {
    return { success: false, error: 'Zorunlu alanlar eksik.' }
  }

  const publicSubmission = {
    brandContext: {
      sector:        input.sector,
      businessModel: input.businessModel,
      brandStage:    input.brandStage,
      growthGoal:    input.growthGoal.trim(),
      mainProblem:   input.mainProblem.trim(),
    },
    contextAnswers:   {},
    coreAnswers:      {},
    sectorAnswers:    {},
    triggerAnswers:   {},
    openEndedAnswers: {},
    scores:           null,
    questionsServed:  0,
    completionRate:   0,
    confidence:       'low',
    completedAt:      new Date().toISOString(),
  }

  const supabase = createClient()

  const { data, error } = await supabase
    .from('diagnoses')
    .insert({
      status:                 'new',
      source:                 'manual',
      brand_name:             input.brandName.trim(),
      submitted_email:        input.contactEmail.trim().toLowerCase(),
      submitted_phone:        input.contactPhone?.trim() ?? null,
      submitted_contact_name: input.contactName.trim(),
      submitted_at:           new Date().toISOString(),
      public_submission:      publicSubmission,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[createManualDiagnosis] Supabase hatası:', error)
    return { success: false, error: 'Kayıt sırasında bir hata oluştu.' }
  }

  revalidatePath('/studio/marka101')
  return { success: true, diagnosisId: (data as { id: string }).id }
}

// ── saveAnalysisProgress — sihirbaz ilerlemesini kaydet ─────────

export async function saveAnalysisProgress(
  id: string,
  currentStep: number,
  completedSteps: number[],
  internalAnalysis: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  const { error } = await supabase
    .from('diagnoses')
    .update({
      analysis_current_step: currentStep,
      analysis_completed_steps: completedSteps,
      internal_analysis: internalAnalysis,
      status: 'in_review',
    })
    .eq('id', id)

  if (error) {
    console.error('[saveAnalysisProgress] Supabase hatası:', error)
    return { success: false, error: 'İlerleme kaydedilemedi.' }
  }

  revalidatePath(`/studio/marka101/${id}`)
  revalidatePath(`/studio/marka101/${id}/analiz`)
  return { success: true }
}

// ── saveInternalAnalysis — analizi tamamla ve skorları hesapla ──

export async function saveInternalAnalysis(
  id: string,
  internalAnalysis: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  const scores = calculateScores(internalAnalysis)
  const supabase = createClient()

  const { error } = await supabase
    .from('diagnoses')
    .update({
      internal_analysis: internalAnalysis,
      scores_detail: scores,
      overall_health_score: scores.overall_health_score,
      lead_quality_score: scores.lead_quality_score,
      sales_readiness_score: scores.sales_readiness_score,
      premium_potential_score: scores.premium_potential_score,
      creative_potential_score: scores.creative_potential_score,
      offer_potential_score: scores.offer_potential_score,
      risk_level: scores.risk_level,
      status: 'analyzed',
      analysis_current_step: 9,
      analysis_completed_steps: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    })
    .eq('id', id)

  if (error) {
    console.error('[saveInternalAnalysis] Supabase hatası:', error)
    return { success: false, error: 'Değerlendirme tamamlanamadı.' }
  }

  revalidatePath(`/studio/marka101/${id}`)
  revalidatePath(`/studio/marka101/${id}/sonuc`)
  revalidatePath('/studio/marka101')
  return { success: true }
}

// ── recalculateDiagnosis — eski/yeni verileri motorla yeniden hesapla ──

export async function recalculateDiagnosis(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  const { data: d, error: fetchErr } = await supabase
    .from('diagnoses')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchErr || !d) {
    return { success: false, error: 'Marka verileri bulunamadı.' }
  }

  const diagnosis = d as Diagnosis
  let sub = diagnosis.public_submission as any
  if (!sub) {
    return { success: false, error: 'Değerlendirme verisi bulunmuyor.' }
  }

  try {
    const allAnswers = {
      ...(sub.contextAnswers || {}),
      ...(sub.coreAnswers || {}),
      ...(sub.sectorAnswers || {}),
      ...(sub.triggerAnswers || {}),
    }

    const newScores = calculateDiagnosisResult({
      context: sub.brandContext || {
        sector: sub.sector || 'general',
        businessModel: sub.businessModel || 'b2c',
        brandStage: sub.brandStage || 'growth',
        growthGoal: sub.growthGoal || '',
        mainProblem: sub.mainProblem || ''
      },
      answers: allAnswers,
      openEnded: sub.openEndedAnswers || {},
      questionsServed: sub.questionsServed || 15,
      customerProfile: sub.customerProfile,
      postsRegularly: sub.postsRegularly,
      socialMediaActive: sub.socialMediaActive,
    })

    sub = {
      ...sub,
      scores: {
        ...sub.scores,
        brandHealth:      newScores.brandHealth,
        sectorFit:        newScores.sectorFit,
        salesReadiness:   newScores.salesReadiness,
        premiumPotential: newScores.premiumPotential,
        leadQuality:      newScores.leadQuality,
        leadSegment:      newScores.leadSegment,
        brandType:        { key: newScores.brandType.key, label: newScores.brandType.label },
        weakestCategory:  { key: newScores.weakestCategory.key, label: newScores.weakestCategory.label, normalizedScore: newScores.weakestCategory.normalizedScore },
        strongestCategory:{ key: newScores.strongestCategory.key, label: newScores.strongestCategory.label, normalizedScore: newScores.strongestCategory.normalizedScore },
        categories:       Object.fromEntries(
          Object.entries(newScores.categories).map(([k,v]) => [k, { normalizedScore: v.normalizedScore, riskLevel: v.riskLevel }])
        ),
        riskLabels:       { active: newScores.riskLabels.active, primary: newScores.riskLabels.primary },
        imbalanceAlert:   { active: newScores.imbalanceAlert.active, maxGap: newScores.imbalanceAlert.maxGap },
        conflictSignals:  newScores.conflictSignals.map(c => ({ id: c.id, label: c.label })),
        explainability:   newScores.explainability,
        treatmentIntelligence: newScores.treatmentIntelligence,
      }
    }

    const { error: updateErr } = await supabase
      .from('diagnoses')
      .update({
        public_submission: sub,
        overall_health_score: newScores.brandHealth / 10,
        lead_quality_score: newScores.leadQuality / 10,
        sales_readiness_score: newScores.salesReadiness / 10,
        premium_potential_score: newScores.premiumPotential / 10,
        creative_potential_score: newScores.creativePartnershipFit / 10,
        offer_potential_score: newScores.premiumPotential / 10,
        risk_level: newScores.weakestCategory ? (newScores.brandHealth < 40 ? 'critical' : newScores.brandHealth < 65 ? 'high' : newScores.brandHealth < 85 ? 'medium' : 'low') : diagnosis.risk_level
      })
      .eq('id', id)

    if (updateErr) {
      console.error('[recalculateDiagnosis] Güncelleme hatası:', updateErr)
      return { success: false, error: 'Skorlar güncellenemedi.' }
    }

    revalidatePath(`/studio/marka101/${id}`)
    revalidatePath(`/studio/marka101/${id}/sonuc`)
    revalidatePath('/studio/marka101')
    return { success: true }
  } catch (err: any) {
    console.error('[recalculateDiagnosis] Hesaplama hatası:', err)
    return { success: false, error: err.message }
  }
}

// ── generateClaudeReport — Claude AI çıktısı üret ───────────────

export async function generateClaudeReport(
  id: string
): Promise<{ success: boolean; error?: string }> {
  // Veritabanındaki eski/yeni kaydı yeni mantığa göre güncelle
  await recalculateDiagnosis(id)

  const supabase = createClient()

  // Fetch current diagnosis
  const { data: d, error: fetchErr } = await supabase
    .from('diagnoses')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchErr || !d) {
    console.error('[generateClaudeReport] Veri çekme hatası:', fetchErr)
    return { success: false, error: 'Marka verileri bulunamadı.' }
  }

  const diagnosis = d as Diagnosis
  const sub = (diagnosis.public_submission ?? {}) as any
  const ctx = (sub.brandContext ?? {}) as any
  const internal = (diagnosis.internal_analysis ?? {}) as any
  
  const overall = diagnosis.overall_health_score ?? 5.0
  const premium = diagnosis.premium_potential_score ?? 5.0
  const sales = diagnosis.sales_readiness_score ?? 5.0
  const creative = diagnosis.creative_potential_score ?? 5.0
  const offer = diagnosis.offer_potential_score ?? 5.0
  const leadQuality = diagnosis.lead_quality_score ?? 5.0

  const sector = ctx.sector ?? 'general'
  const businessModel = ctx.businessModel ?? 'b2c'
  const brandStage = ctx.brandStage ?? 'growth'
  const growthGoal = ctx.growthGoal ? ctx.growthGoal.trim() : ''
  const mainProblem = ctx.mainProblem ? ctx.mainProblem.trim() : ''

  const SECTOR_LABELS: Record<string, string> = {
    health: 'Sağlık / Güzellik / Klinik',
    realestate: 'Gayrimenkul / Mimari / İç Mimari',
    b2b_industrial: 'Üretim / Sanayi / İhracat',
    general: 'Genel Hizmet',
  }

  const BIZ_LABELS: Record<string, string> = {
    b2b: 'B2B',
    b2c: 'B2C',
    hybrid: 'Karma (B2B+B2C)',
  }

  const STAGE_LABELS: Record<string, string> = {
    startup: 'Yeni Başlayan (0-2 Yıl)',
    growth: 'Büyüme Dönemi (2-5 Yıl)',
    corporate: 'Kurumsallaşan',
    premium: 'Premium Segmente Taşınan',
    repositioning: 'Yeniden Konumlanan',
  }

  // Sektöre özel tavsiyeler
  let sectorAdvice = ''
  if (sector === 'health') {
    sectorAdvice = `### 🩺 Sağlık Sektörüne Özel Güven ve Konumlandırma Stratejisi
* **Hassasiyet Odaklı Konumlandırma:** Sağlık ve güzellik sektöründe en önemli unsur tıbbi güvenilirlik ve samimi hasta iletişimidir. Görsel kimlikte abartılı renkler yerine klinik temizliği temsil eden soft tonlar ve kaliteli tipografi tercih edilmelidir.
* **Yasal Uyum ve Dijital Kanıt:** Doktor veya klinik profilinde hasta başarı hikayeleri ve uzmanlık sertifikaları yasal sınırlar dahilinde ön plana çıkarılmalıdır.
* **Tavsiye:** Web sitesinin mobil randevu alma hızı artırılmalı ve kullanıcı deneyimi (UX) pürüzsüzleştirilmelidir.`
  } else if (sector === 'realestate') {
    sectorAdvice = `### 🏢 Gayrimenkul & Mimarlık Sektörüne Özel Görsel Strateji
* **Premium Sunum:** Yüksek bütçeli varlık satışlarında görsel kalite her şeydir. Profesyonel 3D modellemeler, kaliteli geniş açı çekimler ve tutarlı renk tonları lüks algısını oluşturur.
* **Teklif Ayrışması (USP):** Rakiplerden ayrışmak için sadece portföy listelemek yerine "Kişiselleştirilmiş Yatırım Danışmanlığı" veya "Premium Yaşam Tasarımı" gibi katma değerli teklifler oluşturulmalıdır.
* **Tavsiye:** Sosyal medyada konut projelerini anlatan yüksek kaliteli dikey videolar (Reels/Shorts) ile mimari detayları gösteren içerik serileri hazırlanmalıdır.`
  } else if (sector === 'b2b_industrial') {
    sectorAdvice = `### ⚙️ B2B & Endüstriyel Sektörlere Özel İhracat ve Güven Stratejisi
* **Küresel Güven Yapısı:** Sanayi ve ihracat odaklı firmaların en büyük eksiği yabancı dildeki teknik yetersizlikler ve eski web siteleridir. Profesyonel çok dilli teknik dökümantasyon ve yetkinlik rozetleri sitenin en görünür yerinde olmalıdır.
* **LinkedIn Otoritesi:** B2B pazarlamada karar vericilere ulaşmak için LinkedIn platformunda sektörel bilgi liderliği (thought leadership) içerikleri üretilmelidir.
* **Tavsiye:** Kurumsal katalog ve üretim tesisi tanıtım videosu premium seviyeye çıkartılmalı, web sitesindeki referanslar kurumsal logolarla listelenmelidir.`
  } else {
    sectorAdvice = `### 💼 Genel Hizmet Sektörüne Özel Konumlandırma
* **Net Değer Vaadi:** Hizmetinizin ne işe yaradığı, kimin için olduğu ve hangi problemi çözdüğü ilk 3 saniyede anlaşılmalıdır. Karışık ve teknik dilden kaçınılmalıdır.
* **Dönüşüm Odaklı Tasarım:** Web sitenizde potansiyel müşterilerin sizinle kolayca iletişime geçebileceği net çağrı butonları (CTA) bulunmalıdır.
* **Tavsiye:** Müşteri başarı hikayeleri ve vaka çalışmaları (case studies) ile dijital güven unsurları güçlendirilmelidir.`
  }

  // Marka aşamasına özel tavsiyeler
  let stageAdvice = ''
  if (brandStage === 'startup') {
    stageAdvice = `* **Hız ve Temel Güven (Startup):** Yeni başlayan markanın en büyük önceliği hızlı pazar testi ve güven inşasıdır. Görsel kimlik sade tutulmalı, vaat ise net ve kanıtlanabilir olmalıdır. Bütçe kreatif sistemlere dağıtılmadan önce satış getirecek kanallara odaklanılmalıdır.`
  } else if (brandStage === 'growth') {
    stageAdvice = `* **Sistemleşme ve Ölçekleme (Büyüme):** Büyüme aşamasındaki markalar için kreatif tasarımların bir kurala bağlanması (Brand Styleguide) kritiktir. Tutarsız paylaşımlar marka algısını zedeler. Reklam kreatiflerinin kalitesi artırılmalıdır.`
  } else if (brandStage === 'corporate') {
    stageAdvice = `* **Hiyerarşik Tasarım ve İletişim (Kurumsallaşma):** Markanın kurumsal kimlik yönergelerine tam uyum sağlanmalıdır. Çoklu departman yapısında kreatif üretimler standardize edilmelidir.`
  } else if (brandStage === 'premium') {
    stageAdvice = `* **Fiyat Meşrulaştırma (Premium):** Premium segmente geçişte görsel kimlik, tipografi ve web sitesi tasarımı üst seviye bir lüks algısı sunmalıdır. Fiyatı haklı çıkaracak zengin hikaye anlatımı (storytelling) ön planda olmalıdır.`
  } else if (brandStage === 'repositioning') {
    stageAdvice = `* **Yeniden Konumlandırma Yönetimi:** Eski algıyı yıkmak ve yeni hedef kitleyi ikna etmek için web sitesi ve tüm sosyal medya kanalları eş zamanlı güncellenmelidir. Değişimin nedeni müşterilere şeffafça aktarılmalıdır.`
  }

  // Skor değerlendirmesi
  let scoreVerdict = ''
  if (overall < 4.0) {
    scoreVerdict = `> ⚠️ **KRİTİK UYARI:** Markanın genel sağlık skoru **${overall.toFixed(1)}/10** ile kritik düzeydedir. Mevcut konumlandırma ve dijital varlık, pazarın ve potansiyel alıcıların beklentilerini karşılamamaktadır. Acil revizyon gerekmektedir.`
  } else if (overall < 6.5) {
    scoreVerdict = `> 📈 **GELİŞİM FIRSATI:** Genel sağlık skoru **${overall.toFixed(1)}/10** seviyesindedir. Markanın temelleri iyi olmakla birlikte, özellikle görsel tutarlılık, teklif netliği ve dijital güven öğelerinde ciddi optimizasyon alanları bulunmaktadır.`
  } else {
    scoreVerdict = `> ✨ **PREMİUM STANDART:** Genel sağlık skoru **${overall.toFixed(1)}/10** ile pazar ortalamasının üzerindedir. Markanın mevcut algısı güçlüdür; konumlandırmadaki ufak optimizasyonlar ve kreatif sistemlerin standardizasyonuyla premium lige rahatlıkla geçebilir.`
  }

  // Active diagnoses formatting
  const activeDiagnosesList = sub?.scores?.explainability?.activeDiagnoses || [];
  let activeDiagnosesMarkdown = '';
  if (activeDiagnosesList.length > 0) {
    activeDiagnosesMarkdown = activeDiagnosesList
      .map((diag: any) => {
        const severityStr = diag.severity ? ` **[Derece: ${diag.severity.toUpperCase()}]**` : '';
        const findingsStr = diag.findings && diag.findings.length > 0
          ? `\n   * **Bulgular:**\n` + diag.findings.map((f: string) => `     * ${f}`).join('\n')
          : '';
        return `* **${diag.label}** (${diag.key})${severityStr}${findingsStr}`;
      })
      .join('\n\n');
  } else {
    activeDiagnosesMarkdown = '* Belirgin bir yapısal sendrom teşhis edilmedi.';
  }

  // Contradiction signals formatting
  const conflictSignalsList = sub?.scores?.conflictSignals || [];
  let conflictSignalsMarkdown = '';
  if (conflictSignalsList.length > 0) {
    conflictSignalsMarkdown = conflictSignalsList
      .map((c: any) => `* **${c.label}** (${c.id}): ${c.description}`)
      .join('\n');
  } else {
    conflictSignalsMarkdown = '* Herhangi bir çelişkili yanıt tespit edilmedi (Cevaplar tutarlı).';
  }

  // Wrong sequence warnings formatting
  const wrongSequenceWarningsList = sub?.scores?.treatmentIntelligence?.wrongSequenceWarnings || [];
  let wrongSequenceMarkdown = '';
  if (wrongSequenceWarningsList.length > 0) {
    wrongSequenceMarkdown = wrongSequenceWarningsList
      .map((w: any) => {
        return `> ⚠️ **Kritik Sıralama Engeli: ${w.title}** (${w.key})\n` +
               `> * **Mesaj:** ${w.warningMessage}\n` +
               `> * **Engellenen Hamle:** ${w.targetAction}\n` +
               `> * **Bloke Eden Teşhisler:** ${w.blockers.join(', ')}`;
      })
      .join('\n\n');
  } else {
    wrongSequenceMarkdown = '* Kritik bir sıralama engeli tespit edilmedi.';
  }

  // Roadmap & Action plan formatting
  const strategicRoadmapList = sub?.scores?.treatmentIntelligence?.strategicRoadmap || [];
  const priorityMetricsMap = sub?.scores?.treatmentIntelligence?.priorityMetrics || {};
  const treatmentPlansList = sub?.scores?.treatmentIntelligence?.treatmentPlans || [];

  let roadmapMarkdown = '';
  if (strategicRoadmapList.length > 0) {
    roadmapMarkdown = strategicRoadmapList
      .map((item: any, idx: number) => {
        const metrics = priorityMetricsMap[item.diagnosisKey];
        const metricsStr = metrics
          ? ` (Etki: ${metrics.impactScore}, Aciliyet: ${metrics.urgencyScore}, Hazırlık: ${metrics.readinessScore} | Öncelik Skoru: ${metrics.totalPriority})`
          : '';
        
        const plan = treatmentPlansList.find((p: any) => p.diagnosisKey === item.diagnosisKey);
        let stepsStr = '';
        if (plan && plan.steps && plan.steps.length > 0) {
          stepsStr = '\n' + plan.steps.map((s: any) => `   * **Adım ${s.stepNumber} - ${s.title}:** ${s.description}`).join('\n');
        }

        return `${idx + 1}. **${item.label}** (${item.diagnosisKey})${metricsStr}${stepsStr}`;
      })
      .join('\n\n');
  } else {
    roadmapMarkdown = `1. **Web sitesi ana sayfasındaki değer vaadinin sadeleştirilmesi.**\n2. **Kreatif şablon standardizasyonu.**\n3. **Sosyal kanıt entegrasyonu.**`;
  }

  const markdownReport = `
# 🎯 ${diagnosis.brand_name} Strateji ve Teşhis Raporu

**Tarih:** ${new Date().toLocaleDateString('tr-TR')}  
**Genel Sağlık Skoru:** **${overall.toFixed(1)} / 10**  
**Değerlendiren:** Deep Creative Studio AI

---

## 1. Yönetici Özeti (Executive Summary)

Bu rapor, **${diagnosis.brand_name}** için toplanan bilgiler, markanın beyanları ve ajansımızın iç analiz puanları harmanlanarak oluşturulmuştur. 

Markanın sektörü: **${SECTOR_LABELS[sector] ?? sector}**  
İş Modeli: **${BIZ_LABELS[businessModel] ?? businessModel}**  
Mevcut Aşama: **${STAGE_LABELS[brandStage] ?? brandStage}**  

${scoreVerdict}

---

## 2. Detaylı Metrik Analizleri

### 💎 A. Premium Algı ve Fiyat Meşruiyeti (Skor: ${premium.toFixed(1)}/10)
- **Ajans Notu:** ${internal.step_2_notes || 'Görsel kalite ve fiyat algısı değerlendirilmiştir.'}
- **Analiz:** Fiyat meşruiyeti skoru **${premium.toFixed(1)}/10**. ${premium < 6 ? 'Müşterilerinizin yüksek fiyatları ödemeye ikna olması için görsel tasarımlarınızı daha modern, sade ve premium bir çizgiye çekmelisiniz.' : 'Görsel kalite fiyatlandırmayı destekliyor, ancak ambalaj ve web sitesinde daha seçkin dokunuşlar yapılabilir.'}

### 📋 B. Konumlandırma ve Marka Netliği (Skor: ${(((internal.positioning_clarity ?? 5) + (internal.target_audience_definition ?? 5)) / 2).toFixed(1)}/10)
- **Ajans Notu:** ${internal.step_1_notes || 'Marka konumlandırması ve hedef kitle tanımları analiz edilmiştir.'}
- **Analiz:** Hedef kitlenin en net acı noktasına (pain point) odaklanan bir değer vaadi oluşturulmalı.

### ✍️ C. İletişim ve Storytelling (Skor: ${creative.toFixed(1)}/10)
- **Ajans Notu:** ${internal.step_3_notes || 'Hikaye anlatımı ve metin kalitesi değerlendirilmiştir.'}
- **Analiz:** Sosyal mecralarda ve web sitesinde kuru bir dilden ziyade duygusal bağ kuran hikayeler ön planda olmalıdır.

### 🌐 D. Dijital Varlık ve Güven Öğeleri (Skor: ${sales.toFixed(1)}/10)
- **Ajans Notu:** ${internal.step_4_notes || 'UX deneyimi ve güven veren sosyal kanıtlar incelenmiştir.'}
- **Analiz:** Güven eksikliğini gidermek için müşteri logoları, sertifikalar ve başarı hikayeleri siteye yerleştirilmelidir.

### 🎨 E. Kreatif Sistem ve Tutarlılık (Skor: ${(((internal.visual_consistency ?? 5) + (internal.asset_quality ?? 5)) / 2).toFixed(1)}/10)
- **Ajans Notu:** ${internal.step_5_notes || 'Kreatif tutarlılık ve materyal kalitesi puanlanmıştır.'}

---

## 3. Hedefler & Sorunlar Üzerine Analiz

${mainProblem ? `### 🔴 Belirtilen Ana Problem:
> *"${mainProblem}"*

**Çözüm Önerisi:** ${overall < 6.5 ? 'Bu problemi çözmek için öncelikle markanın dijital güven ve UX puanlarını yükseltmesi gerekiyor. Dönüşüm oranlarını artırmak için web sitesindeki karışık anlatı temizlenmeli.' : 'Mevcut konumlandırma güçlü olmakla birlikte, bu problemin çözümü kreatif sistemlerin standardizasyonundan geçmektedir.'}` : ''}

${growthGoal ? `### 🎯 Belirtilen Büyüme Hedefi:
> *"${growthGoal}"*

**Stratejik Yaklaşım:** Bu hedefe ulaşabilmek adına markanın **Satış Hazırlığı Skoru (${sales.toFixed(1)}/10)** ve **Teklif Gücü Skoru (${offer.toFixed(1)}/10)** seviyelerini yükseltmesi kritik önem taşımaktadır.` : ''}

---

## 4. Sistem Teşhis & Tespit Bulguları (Diagnostic Layer)

Aşağıdaki aktif yapısal teşhisler ve severity (risk derecesi) düzeyleri markanın verilerinden otomatik olarak hesaplanmıştır:

${activeDiagnosesMarkdown}

---

## 5. Cevap Tutarlılığı ve Çelişkiler (Contradiction Engine)

Marka sahibi tarafından verilen yanıtlar arasındaki tutarsızlıklar ve çelişkili sinyaller:

${conflictSignalsMarkdown}

---

## 6. Kritik Sıralama Engelleri (Wrong Sequence Logic)

Stratejik büyüme planında sırayı atlamaktan kaynaklanabilecek ve bütçe israfına sebep olabilecek engeller:

${wrongSequenceMarkdown}

---

## 7. Stratejik Yol Haritası ve Eylem Planı (Treatment Protocols)

Etki, aciliyet ve uygulanabilirlik derecelerine göre optimize edilmiş aksiyon öncelik sıralaması:

${roadmapMarkdown}

---

## 8. Sektörel & Aşamalı Tavsiyeler

${sectorAdvice}

### 📈 Marka Aşamasına Göre Eylem Planı
${stageAdvice}
  `.trim()

  const systemOutput = {
    markdownReport,
    generatedAt: new Date().toISOString(),
  }

  const { error: updateErr } = await supabase
    .from('diagnoses')
    .update({
      system_output: systemOutput,
      status: 'completed',
    })
    .eq('id', id)

  if (updateErr) {
    console.error('[generateClaudeReport] Güncelleme hatası:', updateErr)
    return { success: false, error: 'AI raporu kaydedilemedi.' }
  }

  revalidatePath(`/studio/marka101/${id}`)
  revalidatePath(`/studio/marka101/${id}/sonuc`)
  revalidatePath('/studio/marka101')
  return { success: true }
}

// ── updateDiagnosisStatus ──────────────────────────────────────────

export async function updateDiagnosisStatus(
  id: string,
  status: 'new' | 'in_review' | 'analyzed' | 'output_ready' | 'completed' | 'archived'
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  const { error } = await supabase
    .from('diagnoses')
    .update({ status })
    .eq('id', id)

  if (error) {
    console.error('[updateDiagnosisStatus] Supabase hatası:', error)
    return { success: false, error: 'Durum güncellenemedi.' }
  }

  revalidatePath(`/studio/marka101/${id}`)
  revalidatePath(`/studio/marka101/${id}/sonuc`)
  revalidatePath('/studio/marka101')
  return { success: true }
}

export async function saveLearningIntelligence(
  id: string,
  data: LearningIntelligence
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  
  // Try updating the learning_intelligence column directly
  const { error: directErr } = await supabase
    .from('diagnoses')
    .update({ learning_intelligence: data })
    .eq('id', id)
    
  if (directErr) {
    console.warn('[saveLearningIntelligence] Direct column update failed, falling back to internal_analysis:', directErr.message)
    
    // Fetch current internal_analysis
    const { data: d, error: fetchErr } = await supabase
      .from('diagnoses')
      .select('internal_analysis')
      .eq('id', id)
      .single()
      
    if (fetchErr || !d) {
      console.error('[saveLearningIntelligence] Fetch fallback failed:', fetchErr)
      return { success: false, error: 'Öğrenme bilgileri güncellenemedi.' }
    }
    
    const currentAnalysis = (d.internal_analysis ?? {}) as Record<string, any>
    const updatedAnalysis = {
      ...currentAnalysis,
      learning_intelligence: data
    }
    
    const { error: fallbackErr } = await supabase
      .from('diagnoses')
      .update({ internal_analysis: updatedAnalysis })
      .eq('id', id)
      
    if (fallbackErr) {
      console.error('[saveLearningIntelligence] Fallback update failed:', fallbackErr)
      return { success: false, error: 'Öğrenme bilgileri kaydedilemedi.' }
    }
  }
  
  revalidatePath(`/studio/marka101/${id}`)
  revalidatePath(`/studio/marka101/${id}/sonuc`)
  revalidatePath('/studio/marka101')
  revalidatePath('/studio/icgoru-merkezi')
  return { success: true }
}

export async function updateReportLockStatus(
  id: string,
  isLocked: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  
  // Fetch current internal_analysis
  const { data: d, error: fetchErr } = await supabase
    .from('diagnoses')
    .select('internal_analysis')
    .eq('id', id)
    .single()
    
  if (fetchErr || !d) {
    console.error('[updateReportLockStatus] Fetch failed:', fetchErr)
    return { success: false, error: 'Marka verisi bulunamadı.' }
  }
  
  const currentAnalysis = (d.internal_analysis ?? {}) as Record<string, any>
  const updatedAnalysis = {
    ...currentAnalysis,
    is_locked: isLocked
  }
  
  const { error: updateErr } = await supabase
    .from('diagnoses')
    .update({ internal_analysis: updatedAnalysis })
    .eq('id', id)
    
  if (updateErr) {
    console.error('[updateReportLockStatus] Update failed:', updateErr)
    return { success: false, error: 'Kilit durumu güncellenemedi.' }
  }
  
  revalidatePath(`/studio/marka101/${id}`)
  revalidatePath(`/studio/marka101/${id}/sonuc`)
  revalidatePath(`/marka101/sonuc/${id}`)
  return { success: true }
}

// ── deleteDiagnosis ───────────────────────────────────────────────

export async function deleteDiagnosis(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  // 1. Fetch diagnosis details (brand name) first
  const { data: diagnosis, error: fetchError } = await supabase
    .from('diagnoses')
    .select('brand_name')
    .eq('id', id)
    .single()

  if (fetchError || !diagnosis) {
    console.error('[deleteDiagnosis] Fetch error:', fetchError)
    return { success: false, error: 'Marka bulunamadı.' }
  }

  const brandName = diagnosis.brand_name;

  try {
    // 2. Delete from potentials and get their IDs to delete proposals
    const { data: potentials, error: potFetchError } = await supabase
      .from('potentials')
      .select('id')
      .eq('diagnosis_id', id)

    if (!potFetchError && potentials && potentials.length > 0) {
      const potentialIds = potentials.map(p => p.id);
      
      // Delete proposals linked to these potentials
      await supabase
        .from('proposals')
        .delete()
        .in('potential_id', potentialIds)

      // Delete potentials themselves
      await supabase
        .from('potentials')
        .delete()
        .in('id', potentialIds)
    }

    // 3. Find and delete client records matching the brand name
    const { data: clients, error: clientFetchError } = await supabase
      .from('clients')
      .select('id')
      .eq('company_name', brandName)

    if (!clientFetchError && clients && clients.length > 0) {
      const clientIds = clients.map(c => c.id);

      // Fetch projects for these clients to delete tasks later
      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, name')
        .in('client_id', clientIds)

      const projectNames = projectsData?.map(p => p.name) || [];

      // Delete tasks associated with these projects or matching the brand name
      if (projectNames.length > 0) {
        await supabase
          .from('tasks')
          .delete()
          .in('project_name', projectNames)
      }
      await supabase
        .from('tasks')
        .delete()
        .ilike('project_name', `%${brandName}%`)

      // Delete visual library records associated with these clients
      await supabase
        .from('visual_library')
        .delete()
        .in('client_id', clientIds)

      // Delete finances associated with these clients
      await supabase
        .from('finances')
        .delete()
        .in('client_id', clientIds)

      // Delete documents associated with these clients
      await supabase
        .from('documents')
        .delete()
        .in('client_id', clientIds)

      // Delete meetings associated with these clients
      await supabase
        .from('meetings')
        .delete()
        .in('client_id', clientIds)

      // Delete projects associated with these clients or client_name
      await supabase
        .from('projects')
        .delete()
        .in('client_id', clientIds)

      await supabase
        .from('projects')
        .delete()
        .eq('client_name', brandName)

      // Delete clients
      await supabase
        .from('clients')
        .delete()
        .in('id', clientIds)
    }

    // 4. Finally delete the diagnosis record itself
    const { error: deleteError } = await supabase
      .from('diagnoses')
      .delete()
      .eq('id', id)

    if (deleteError) {
      throw deleteError
    }

    // Revalidate all affected cache paths
    revalidatePath('/studio/marka101')
    revalidatePath('/studio/potansiyeller')
    revalidatePath('/studio/musteriler')
    revalidatePath('/studio/projeler')
    revalidatePath('/studio/gorevler')
    revalidatePath('/studio/teklifler')
    revalidatePath('/studio/finans')
    revalidatePath('/studio/gorsel-kutuphane')

    return { success: true }
  } catch (err: any) {
    console.error('[deleteDiagnosis] Cascade delete error:', err)
    return { success: false, error: err.message || 'Marka silinirken zincirleme hata oluştu.' }
  }
}





