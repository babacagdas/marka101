import type { DiagnosisQuestion } from "../diagnosis-types";

export const CONTEXT_QUESTIONS: readonly DiagnosisQuestion[] = [
  {
    id: "BG-01", layer: "context", type: "singleSelect", weight: 1,
    title: "Sektör", text: "Markanız hangi alanda faaliyet gösteriyor?",
    tooltip: "Hizmet verdiğiniz veya faaliyet gösterdiğiniz ana alanı seçin. Analiziniz bu sektöre göre özelleştirilir.",
    options: [
      { value: "health",         label: "Sağlık / Güzellik / Klinik",       sectorKey: "health" },
      { value: "realestate",     label: "Gayrimenkul / Mimari / İç Mimari", sectorKey: "realestate" },
      { value: "b2b_industrial", label: "Üretim / Sanayi / İhracat",        sectorKey: "b2b_industrial" },
      { value: "tech_saas",      label: "Teknoloji / SaaS / Yazılım",       sectorKey: "general" },
      { value: "education",      label: "Eğitim / Danışmanlık",             sectorKey: "general" },
      { value: "fashion_retail", label: "Moda / Lifestyle / Perakende",     sectorKey: "general" },
      { value: "restaurant_hospitality", label: "Restoran / Otel / Mekan",  sectorKey: "general" },
      { value: "other",          label: "Diğer",                            sectorKey: "general" },
    ],
  },
  {
    id: "BG-02", layer: "context", type: "singleSelect", weight: 1,
    title: "İş Modeli", text: "Müşterileriniz kim?",
    tooltip: "Satış yaptığınız birincil kitleyi belirleyin.",
    options: [
      { value: "b2c",        label: "Bireysel tüketiciye satıyoruz (B2C)" },
      { value: "b2b",        label: "Şirketlere ve kurumlara satıyoruz (B2B)" },
      { value: "hybrid_b2c", label: "İkisine de satıyoruz — bireysel ağırlıklı" },
      { value: "hybrid_b2b", label: "İkisine de satıyoruz — kurumsal ağırlıklı" },
    ],
  },
  {
    id: "BG-03", layer: "context", type: "singleSelect", weight: 1,
    title: "Marka Aşaması", text: "Markanız şu an hangi aşamada?",
    tooltip: "Markanızın gelişim ve pazar olgunluk seviyesi.",
    options: [
      { value: "startup",       label: "Yeni kurulduk, kimliğimizi inşa ediyoruz (0–2 yıl)" },
      { value: "growth",        label: "Büyüyoruz, sistemimizi oturtmaya çalışıyoruz" },
      { value: "corporate",     label: "Köklendik, algımızı bir üst seviyeye taşımak istiyoruz" },
      { value: "premium",       label: "Premium segmente geçmek istiyoruz" },
      { value: "repositioning", label: "Yeniden yapılanıyoruz, eski kimliği bırakıyoruz" },
    ],
  },
  {
    id: "BG-04", layer: "context", type: "singleSelect", weight: 1,
    title: "Ana Büyüme Hedefi", text: "Önümüzdeki 12 ayda en öncelikli hedefiniz ne?",
    tooltip: "Rapordaki stratejik öneriler bu hedefe göre kalibre edilir.",
    options: [
      { value: "more_customers",  label: "Daha fazla müşteri ve lead kazanmak" },
      { value: "upsell",          label: "Mevcut müşterilere daha fazla satmak" },
      { value: "price_increase",  label: "Fiyatı ve marjı artırmak" },
      { value: "new_market",      label: "Yeni bir pazara veya segmente girmek" },
      { value: "brand_awareness", label: "Marka bilinirliğini büyütmek" },
      { value: "systematize",     label: "Operasyonu sistematize etmek" },
    ],
  },
  {
    id: "BG-05", layer: "context", type: "singleSelect", weight: 1,
    title: "En Büyük Ticari Problem", text: "Şu an markayla en doğrudan bağlantılı ticari probleminiz hangisi?",
    tooltip: "Dürüst bir değerlendirme en doğru yol haritasını üretir.",
    options: [
      { value: "price_objection",    label: "Fiyat itirazı çok fazla, fiyatımızı savunamıyoruz" },
      { value: "no_leads",           label: "Potansiyel müşteri bulamıyoruz" },
      { value: "cant_convert",       label: "Buluyoruz ama ikna edemiyoruz, kapanma oranı düşük" },
      { value: "no_referrals",       label: "Mevcut müşteriler bizi başkalarına önermiyor" },
      { value: "no_differentiation", label: "Rakiplerden ayrışamıyoruz, bizi karşılaştırıyorlar" },
      { value: "low_awareness",      label: "Bilinirliğimiz çok düşük, kimse tanımıyor" },
    ],
  },
  {
    id: "BG-06", layer: "context", type: "singleSelect", weight: 1,
    title: "Aylık Pazarlama Bütçesi", text: "Pazarlama ve marka için aylık ortalama ne kadar harcıyorsunuz?",
    tooltip: "Harcamalarınızın genel finansal ölçeği.",
    options: [
      { value: "no_budget",          label: "Düzenli bir bütçemiz yok" },
      { value: "under_5k",           label: "5.000₺ ve altı" },
      { value: "5k_15k",             label: "5.000 – 15.000₺" },
      { value: "15k_50k",            label: "15.000 – 50.000₺" },
      { value: "over_50k",           label: "50.000₺ üzeri" },
      { value: "private",            label: "Belirtmek istemiyorum" },
    ],
  },
  {
    id: "BG-07", layer: "context", type: "singleSelect", weight: 1,
    title: "Ajans veya Freelancer Durumu", text: "Şu an bir ajans veya freelancer ile çalışıyor musunuz?",
    tooltip: "Mevcut pazarlama ve kreatif üretim operasyon yapınız.",
    options: [
      { value: "no_support",       label: "Hayır, ilk kez profesyonel destek arıyoruz" },
      { value: "actively_working", label: "Evet, aktif çalışıyoruz" },
      { value: "worked_before",    label: "Çalıştık, devam etmedik" },
      { value: "in_house",         label: "İçeride ekibimiz var" },
    ],
  },
] as const;
