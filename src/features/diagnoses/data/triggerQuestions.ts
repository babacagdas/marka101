// src/features/diagnoses/data/triggerQuestions.ts
import type { CategoryKey, SectorKey, TriggerQuestionDef } from "../diagnosis-types";

export const CORE_TRIGGERS: Readonly<Record<CategoryKey, TriggerQuestionDef>> = {

  brandClarity: {
    triggerType: "core", forCategory: "brandClarity",
    condition: { target: "brandClarity", threshold: 50, operator: "lte", targetType: "category_normalized" },
    contributesToScore: false,
    question: {
      id: "TR-MN", layer: "trigger", type: "multiSelect", weight: 1,
      maxSelect: 2, contributesToScore: false,
      title: "Rekabet Engeli",
      text: "Bir müşteri neden sizi değil rakibinizi tercih eder? En çok geçerli olan 2 seçeneği işaretleyin.",
      tooltip: "Bu sorunun cevabı görüşme brifinginde farklılaşma boşluğu analizi için kullanılır.",
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
      text: "Görsel kimliğinizi en son ne zaman ve kim tarafından güncelledi?",
      tooltip: "Sistem bu cevabı görsel kimlik skoru kalibrasyonunda kullanır.",
      options: [
        { value: "recent_agency", score: 5, label: "Son 1 yıl içinde, profesyonel ajans" },
        { value: "older_agency",  score: 4, label: "1–3 yıl önce, profesyonel ajans" },
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
      title: "Özgün Hikâye Potansiyeli",
      text: "Markanızın veya kurucusunun müşterilerin ilgisini çekebilecek özgün bir hikâyesi var mı?",
      tooltip: "Bir gazeteci bu hikâyeyi yazabilir miydi?",
      options: [
        { value: 1, label: "Hayır; standart bir hikâye" },
        { value: 2, label: "Zayıf; çok genel" },
        { value: 3, label: "Kısmen; bazı özgün unsurlar var" },
        { value: 4, label: "Güçlü; ilgi çekici unsurlar mevcut" },
        { value: 5, label: "Çok güçlü; belirgin ve özgün bir hikâye var" },
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
      tooltip: "İsteğe bağlıdır. URL paylaşımı analizin doğruluğunu artırır.",
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
      tooltip: "Bu cevap görüşme öncesi brifinge gider; müdahale önerisini kişiselleştirir.",
      options: [
        { value: "no_strategy",   label: "Ne üreteceğimizi bilmiyoruz" },
        { value: "low_quality",   label: "Üretiyoruz ama kalitesiz çıkıyor" },
        { value: "inconsistent",  label: "Üretiyoruz ama tutarsız görünüyor" },
        { value: "no_time",       label: "Zaman ve kaynak yetersizliği" },
        { value: "agency_issues", label: "Ajans / freelancer ile sorun yaşıyoruz" },
      ],
    },
  },
};

export const SECTOR_TRIGGERS: Readonly<Record<SectorKey, TriggerQuestionDef>> = {

  health: {
    triggerType: "sector", forSector: "health",
    condition: { target: "SM-H02", threshold: 3, operator: "lte", targetType: "answer_value" },
    contributesToScore: false,
    question: {
      id: "TR-HL", layer: "trigger", type: "singleSelect", weight: 1,
      contributesToScore: false,
      title: "Yorum / Referans Talebi",
      text: "Memnun müşterilerinizden yorum veya referans istiyor musunuz?",
      tooltip: "Bu cevap, sosyal kanıt sistemi kurulumuna yönelik müdahale önerisini şekillendirir.",
      options: [
        { value: "systematic", label: "Evet; sistematik biçimde" },
        { value: "sometimes",  label: "Zaman zaman" },
        { value: "rarely",     label: "Nadiren" },
        { value: "no_wrong",   label: "Hayır; sormak doğru gelmiyor" },
        { value: "no_howto",   label: "İstiyoruz ama nasıl yapacağımızı bilmiyoruz" },
      ],
    },
  },

  realestate: {
    triggerType: "sector", forSector: "realestate",
    condition: { target: "SM-R01", threshold: 3, operator: "lte", targetType: "answer_value" },
    contributesToScore: false,
    question: {
      id: "TR-RE", layer: "trigger", type: "evidence", weight: 1,
      contributesToScore: false,
      title: "Profesyonel Fotoğrafçı",
      text: "Portföy fotoğraflarınız için profesyonel fotoğrafçıyla çalışıyor musunuz?",
      tooltip: "Akıllı telefon çekimi ile profesyonel fotoğraf arasındaki fark önemlidir.",
      options: [
        { value: "evet",   label: "Evet; düzenli olarak" },
        { value: "kısmen", label: "Bazı projeler için" },
        { value: "hayır",  label: "Hayır; profesyonel çekim yok" },
      ],
    },
  },

  b2b_industrial: {
    triggerType: "sector", forSector: "b2b_industrial",
    condition: { target: "SM-B02", threshold: 3, operator: "lte", targetType: "answer_value" },
    contributesToScore: false,
    question: {
      id: "TR-B2B", layer: "trigger", type: "singleSelect", weight: 1,
      contributesToScore: false,
      title: "Referans Paylaşım Engeli",
      text: "Referans müşterilerinizi dijitalde paylaşmanın önünde bir engel var mı?",
      tooltip: "Bu cevap referans sistemi kurulumuna yönelik önerileri kişiselleştirir.",
      options: [
        { value: "nda",       label: "Gizlilik / NDA" },
        { value: "not_asked", label: "Henüz sormadık" },
        { value: "reluctant", label: "Müşteriler isteksiz" },
        { value: "no_system", label: "Sistemimiz yok" },
        { value: "active",    label: "Engel yok; aktif kullanıyoruz" },
      ],
    },
  },

  general: {
    triggerType: "sector", forSector: "general",
    condition: { target: "SM-G01", threshold: 3, operator: "lte", targetType: "answer_value" },
    contributesToScore: false,
    question: {
      id: "TR-GN", layer: "trigger", type: "evidence", weight: 1,
      contributesToScore: false,
      title: "Farklılaşma Kanıtı",
      text: "Rakiplerinizden farklı olduğunuzu gösteren somut bir kanıtınız var mı? (Metodoloji, sonuç, belge, ödül vb.)",
      tooltip: '"Biz daha iyiyiz" iddiasını destekleyen somut, gösterilebilir bir unsur.',
      options: [
        { value: "evet",   label: "Evet; somut kanıt var ve kullanılıyor" },
        { value: "kısmen", label: "Var ama aktif kullanılmıyor" },
        { value: "hayır",  label: "Hayır; somut kanıt yok" },
      ],
    },
  },
};

export const CORE_TRIGGER_THRESHOLDS: Readonly<Record<CategoryKey, number>> = {
  brandClarity: 50, premiumPerception: 45, storytelling: 50,
  digitalTrust: 45, creativeSystem: 50,
};

export interface SectorTriggerCondition {
  readonly questionId: string;
  readonly threshold:  number;
}

export const SECTOR_TRIGGER_CONDITIONS: Readonly<Record<SectorKey, SectorTriggerCondition>> = {
  health:         { questionId: "SM-H02", threshold: 3 },
  realestate:     { questionId: "SM-R01", threshold: 3 },
  b2b_industrial: { questionId: "SM-B02", threshold: 3 },
  general:        { questionId: "SM-G01", threshold: 3 },
};
