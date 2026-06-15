import type { CategoryKey } from "../diagnosis-types";

export interface CategoryMetadata {
  readonly key: CategoryKey;
  readonly label: string;
  readonly shortLabel: string;
  readonly description: string;
  readonly weight: number;
  readonly colorHint: string;
  readonly lowScoreMeaning: string;
  readonly highScoreMeaning: string;
}

export const CATEGORIES: Readonly<Record<CategoryKey, CategoryMetadata>> = {
  brandClarity: {
    key: "brandClarity", label: "Marka Netliği", shortLabel: "Netlik",
    description: "Markanın kim olduğunu, kime hitap ettiğini ve rakiplerinden nasıl ayrıştığını ölçer.",
    weight: 0.25, colorHint: "violet",
    lowScoreMeaning: "Konumlandırma belirsiz; iletişim kararları sezgiye dayanıyor.",
    highScoreMeaning: "Güçlü konumlandırma zemini; tüm iletişim bu zemine oturuyor.",
  },
  premiumPerception: {
    key: "premiumPerception", label: "Premium Algı", shortLabel: "Algı",
    description: "Görsel kimlik kalitesini, fiyat-değer uyumunu ve ilk izlenim gücünü ölçer.",
    weight: 0.25, colorHint: "purple",
    lowScoreMeaning: "Görsel kimlik hedeflenen algıyı taşıyamıyor; fiyat savunulamazlığı riski yüksek.",
    highScoreMeaning: "Görsel ve tonal sistem premium konumlandırmayı destekliyor.",
  },
  storytelling: {
    key: "storytelling", label: "Storytelling Gücü", shortLabel: "Hikâye",
    description: "Marka sesinin, hikâye sisteminin ve duygusal bağ kurma kapasitesinin gücünü ölçer.",
    weight: 0.20, colorHint: "indigo",
    lowScoreMeaning: "Marka yalnızca fonksiyonel bir hizmet sunuyor; duygusal bağ kurulamamıyor.",
    highScoreMeaning: "Güçlü hikâye sistemi fiyat ötesinde tercih sebebi yaratıyor.",
  },
  digitalTrust: {
    key: "digitalTrust", label: "Dijital Güven ve Satış Etkisi", shortLabel: "Dijital",
    description: "Web varlığının, sosyal kanıtın ve dijital temas noktalarının güven ve dönüşüm etkisini ölçer.",
    weight: 0.20, colorHint: "blue",
    lowScoreMeaning: "Dijital kanallar güven yerine şüphe yaratıyor; dönüşüm bu noktada kırılıyor.",
    highScoreMeaning: "Dijital varlık satış sürecini aktif olarak destekliyor.",
  },
  creativeSystem: {
    key: "creativeSystem", label: "Kreatif Sistem ve Tutarlılık", shortLabel: "Sistem",
    description: "Görsel üretim sürecinin sistematikliğini, kılavuz varlığını ve platform tutarlılığını ölçer.",
    weight: 0.10, colorHint: "cyan",
    lowScoreMeaning: "Sistem kişilere bağımlı; büyümede tutarsızlık ve kırılganlık riski var.",
    highScoreMeaning: "Sistematik yapı ölçeklenebilir ve tutarlı üretimi destekliyor.",
  },
};

export const CATEGORY_ORDER: readonly CategoryKey[] = [
  "brandClarity", "premiumPerception", "storytelling", "digitalTrust", "creativeSystem",
];

export const CATEGORY_WEIGHTS: Readonly<Record<CategoryKey, number>> = {
  brandClarity: 0.25, premiumPerception: 0.25,
  storytelling: 0.20, digitalTrust: 0.20, creativeSystem: 0.10,
};
