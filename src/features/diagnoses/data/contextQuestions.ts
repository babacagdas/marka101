import type { DiagnosisQuestion } from "../diagnosis-types";

export const CONTEXT_QUESTIONS: readonly DiagnosisQuestion[] = [
  {
    id: "BG-01", layer: "context", type: "singleSelect", weight: 1,
    title: "Sektör", text: "Markanız hangi alanda faaliyet gösteriyor?",
    tooltip: "En yakın olanı seçin. Bu seçim analizi sektörünüze göre kişiselleştirir.",
    options: [
      { value: "health",         label: "Sağlık / Güzellik / Klinik",       sectorKey: "health" },
      { value: "realestate",     label: "Gayrimenkul / Mimari / İç Mimari", sectorKey: "realestate" },
      { value: "b2b_industrial", label: "Üretim / Sanayi / İhracat",        sectorKey: "b2b_industrial" },
      { value: "general",        label: "Teknoloji / SaaS / Yazılım",       sectorKey: "general" },
      { value: "general",        label: "Eğitim / Danışmanlık",             sectorKey: "general" },
      { value: "general",        label: "Moda / Lifestyle / Perakende",     sectorKey: "general" },
      { value: "general",        label: "Restoran / Otel / Mekan",          sectorKey: "general" },
      { value: "general",        label: "Diğer",                            sectorKey: "general" },
    ],
  },
  {
    id: "BG-02", layer: "context", type: "singleSelect", weight: 1,
    title: "İş Modeli", text: "Müşterileriniz kim?",
    tooltip: "B2B'de güven ve referans; B2C'de görsel ve duygusal faktörler öne çıkar.",
    options: [
      { value: "b2c",    label: "Bireysel müşteriler (B2C)" },
      { value: "b2b",    label: "Kurumsal müşteriler (B2B)" },
      { value: "hybrid", label: "Her ikisi de (Karma)" },
    ],
  },
  {
    id: "BG-03", layer: "context", type: "singleSelect", weight: 1,
    title: "Marka Aşaması", text: "Markanız şu an hangi aşamada?",
    tooltip: "Bu seçim rapor yorumunu kalibre eder.",
    options: [
      { value: "startup",       label: "Yeni başlıyoruz (0–2 yıl)" },
      { value: "growth",        label: "Büyüme dönemindeyiz (2–5 yıl)" },
      { value: "corporate",     label: "Kurumsal hale geliyoruz" },
      { value: "premium",       label: "Premium segmente taşınmak istiyoruz" },
      { value: "repositioning", label: "Yeniden konumlanıyoruz" },
    ],
  },
  {
    id: "BG-04", layer: "context", type: "singleSelect", weight: 1,
    title: "Ana Büyüme Hedefi", text: "Önümüzdeki 12 ayda en öncelikli hedefiniz ne?",
    tooltip: "Rapordaki öneriler bu seçime göre kişiselleştirilir.",
    options: [
      { value: "more_customers",  label: "Daha fazla müşteri / lead kazanmak" },
      { value: "upsell",          label: "Mevcut müşterilere daha fazla satmak" },
      { value: "price_increase",  label: "Fiyatı / marjı artırmak" },
      { value: "new_market",      label: "Yeni pazara / segmente girmek" },
      { value: "brand_awareness", label: "Marka bilinirliğini büyütmek" },
      { value: "systematize",     label: "Operasyonu sistematize etmek" },
    ],
  },
  {
    id: "BG-05", layer: "context", type: "singleSelect", weight: 1,
    title: "En Büyük Ticari Problem",
    text: "Şu an markayla en doğrudan bağlantılı ticari probleminiz hangisi?",
    tooltip: "Dürüst cevap en faydalı olanıdır.",
    options: [
      { value: "price_objection",    label: "Fiyat itirazı çok fazla" },
      { value: "no_leads",           label: "Potansiyel müşteri bulamıyoruz" },
      { value: "cant_convert",       label: "Buluyoruz ama ikna edemiyoruz" },
      { value: "no_referrals",       label: "Mevcut müşteriler bizi önermiyormu" },
      { value: "no_differentiation", label: "Rakipten ayrışamıyoruz" },
      { value: "low_awareness",      label: "Bilinirliğimiz çok düşük" },
    ],
  },
] as const;
