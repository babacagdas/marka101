import type { CategoryKey, SectorKey, TriggerQuestionDef } from "../diagnosis-types";

export const CORE_TRIGGERS: Readonly<Record<CategoryKey, TriggerQuestionDef>> = {
  brandClarity: {
    triggerType: "core", forCategory: "brandClarity",
    condition: { target: "brandClarity", threshold: 50, operator: "lte", targetType: "category_normalized" },
    contributesToScore: false,
    question: {
      id: "TR-MN", layer: "trigger", type: "multiSelect", weight: 1, maxSelect: 2,
      contributesToScore: false,
      title: "Rekabet Engeli",
      text: "Bir müşteri neden sizi değil rakibinizi tercih eder? En çok geçerli olan 2 seçeneği işaretleyin.",
      tooltip: "Görüşme öncesi farklılaşma analizi için kullanılır.",
      options: [
        { value: "price",     label: "Rakip daha ucuz" },
        { value: "awareness", label: "Rakip daha iyi biliniyor" },
        { value: "trust",     label: "Rakip daha güvenilir görünüyor" },
        { value: "no_diff",   label: "Aralarında fark göremiyorlar" },
        { value: "unknown",   label: "Bilmiyorum" },
      ],
    },
  },

  premiumPerception: {
    triggerType: "core", forCategory: "premiumPerception",
    condition: { target: "premiumPerception", threshold: 45, operator: "lte", targetType: "category_normalized" },
    contributesToScore: true, scoreCategory: "premiumPerception",
    question: {
      id: "TR-PA", layer: "trigger", type: "singleSelect", weight: 2,
      contributesToScore: true, scoreCategory: "premiumPerception",
      title: "Son Tasarım Güncelleme",
      text: "Görsel kimliğinizi en son ne zaman ve nasıl güncellediniz?",
      tooltip: "Bu cevap görsel algı skoru kalibrasyonunda kullanılır.",
      options: [
        { value: "recent_agency", score: 5, label: "Son 1 yıl içinde, profesyonel ajansla" },
        { value: "older_agency",  score: 4, label: "1–3 yıl önce, profesyonel ajansla" },
        { value: "old",           score: 2, label: "3+ yıl önce" },
        { value: "internal",      score: 2, label: "İç kaynakla yapıldı" },
        { value: "never",         score: 1, label: "Hiç profesyonel güncelleme yapılmadı" },
      ],
    },
  },

  storytelling: {
    triggerType: "core", forCategory: "storytelling",
    condition: { target: "storytelling", threshold: 50, operator: "lte", targetType: "category_normalized" },
    contributesToScore: true, scoreCategory: "storytelling",
    question: {
      id: "TR-ST", layer: "trigger", type: "scale", weight: 2,
      contributesToScore: true, scoreCategory: "storytelling",
      title: "Özgün Hikaye Potansiyeli",
      text: "Markanızın veya kurucusunun müşterilerin ilgisini çekebilecek özgün bir hikayesi var mı?",
      tooltip: "Marka anlatısının özgünlüğü ve dikkat çekiciliği.",
      options: [
        { value: 1, label: "Hayır, standart bir hikaye" },
        { value: 2, label: "Zayıf, çok genel" },
        { value: 3, label: "Kısmen, bazı özgün unsurlar var" },
        { value: 4, label: "Güçlü, ilgi çekici unsurlar mevcut" },
        { value: 5, label: "Çok güçlü, belirgin ve özgün bir hikaye var" },
      ],
    },
  },

  digitalTrust: {
    triggerType: "core", forCategory: "digitalTrust",
    condition: { target: "digitalTrust", threshold: 45, operator: "lte", targetType: "category_normalized" },
    contributesToScore: false,
    question: {
      id: "TR-DG", layer: "trigger", type: "url", weight: 1,
      contributesToScore: false, optional: true,
      title: "Web Sitesi URL",
      text: "Web sitenizin adresini paylaşmak ister misiniz?",
      tooltip: "İsteğe bağlıdır; analizi kolaylaştırır.",
      options: [],
    },
  },

  creativeSystem: {
    triggerType: "core", forCategory: "creativeSystem",
    condition: { target: "creativeSystem", threshold: 50, operator: "lte", targetType: "category_normalized" },
    contributesToScore: false,
    question: {
      id: "TR-KS", layer: "trigger", type: "singleSelect", weight: 1,
      contributesToScore: false,
      title: "İçerik Üretim Darboğazı",
      text: "İçerik üretiminizde en büyük darboğaz nerede?",
      tooltip: "Bu cevap kreatif strateji önerisini özelleştirir.",
      options: [
        { value: "no_strategy",   label: "Ne üreteceğimizi bilmiyoruz" },
        { value: "low_quality",   label: "Üretiyoruz ama kalitesiz çıkıyor" },
        { value: "inconsistent",  label: "Üretiyoruz ama tutarsız görünüyor" },
        { value: "no_time",       label: "Zaman ve kaynak yetersizliği" },
        { value: "agency_issues", label: "Ajans veya freelancer ile sorun yaşıyoruz" },
      ],
    },
  },
};

export const SECTOR_TRIGGERS: Readonly<Record<SectorKey, TriggerQuestionDef>> = {} as any;

export const CORE_TRIGGER_THRESHOLDS: Readonly<Record<CategoryKey, number>> = {
  brandClarity: 50, premiumPerception: 45, storytelling: 50,
  digitalTrust: 45, creativeSystem: 50,
};

export interface SectorTriggerCondition {
  readonly questionId: string;
  readonly threshold:  number;
}

export const SECTOR_TRIGGER_CONDITIONS: Readonly<Record<SectorKey, SectorTriggerCondition>> = {} as any;
