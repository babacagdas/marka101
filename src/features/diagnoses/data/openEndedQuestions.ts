// src/features/diagnoses/data/openEndedQuestions.ts
import type { DiagnosisQuestion } from "../diagnosis-types";

export const OPEN_ENDED_QUESTIONS: readonly DiagnosisQuestion[] = [
  {
    id: "AUC-01", layer: "openEnded", type: "openEnded", weight: 1, optional: true,
    title: "Şu Anki En Büyük Zorluk",
    text: "Markanızın şu an iletişim, algı veya görünürlük açısından yaşadığı en büyük zorluğu kendi cümlelerinizle anlatır mısınız?",
    tooltip: 'İstediğiniz kadar kısa ya da uzun yazabilirsiniz. Burada "doğru cevap" yok.',
    options: [],
  },
  {
    id: "AUC-02", layer: "openEnded", type: "openEnded", weight: 1, optional: true,
    title: "Bir Yıl Sonra",
    text: "Bir yıl sonra markanızın müşterileriniz ve sektörünüz tarafından nasıl algılanmasını istiyorsunuz?",
    tooltip: "Bu sorunun amacı net bir yön görmek; hedefiniz henüz tam net değilse hissettiğiniz algıyı yazabilirsiniz.",
    options: [],
  },
] as const;
