// src/features/diagnoses/scoring.ts
import type { Diagnosis, RiskLevel } from './types';

export interface CalculatedScores {
  overall_health_score:     number;
  lead_quality_score:       number;
  sales_readiness_score:    number;
  premium_potential_score:  number;
  creative_potential_score: number;
  offer_potential_score:    number;
  risk_level:               RiskLevel;
}

export function calculateScores(internalAnalysis: Record<string, any>): CalculatedScores {
  // 9 adımın puanları (her biri 1-10 arası)
  const step1_avg = ((internalAnalysis.positioning_clarity ?? 5) + (internalAnalysis.target_audience_definition ?? 5)) / 2;
  const step2_avg = ((internalAnalysis.visual_premiumness ?? 5) + (internalAnalysis.price_justification ?? 5)) / 2;
  const step3_avg = ((internalAnalysis.emotional_connection ?? 5) + (internalAnalysis.copywriting_quality ?? 5)) / 2;
  const step4_avg = ((internalAnalysis.website_ux ?? 5) + (internalAnalysis.social_proof ?? 5)) / 2;
  const step5_avg = ((internalAnalysis.visual_consistency ?? 5) + (internalAnalysis.asset_quality ?? 5)) / 2;
  const step6_avg = ((internalAnalysis.offer_uniqueness ?? 5) + (internalAnalysis.value_communication ?? 5)) / 2;
  const step7_avg = ((internalAnalysis.market_demand ?? 5) + (internalAnalysis.competitive_advantage ?? 5)) / 2;
  const step8_avg = ((internalAnalysis.growth_readiness ?? 5) + (internalAnalysis.chemistry_fit ?? 5)) / 2;
  const step9_val = (internalAnalysis.overall_health ?? 5);

  // Genel Sağlık Skoru: 9 adımın ortalaması
  const overall = (step1_avg + step2_avg + step3_avg + step4_avg + step5_avg + step6_avg + step7_avg + step8_avg + step9_val) / 9;

  // Premium Potansiyeli
  const premium = (step2_avg + step7_avg) / 2;

  // Satış Hazırlığı
  const sales = (step4_avg + step6_avg) / 2;

  // Kreatif Potansiyel
  const creative = (step5_avg + step3_avg) / 2;

  // Teklif Gücü
  const offer = step6_avg;

  // Müşteri Kalitesi
  const leadQuality = (step8_avg + step9_val) / 2;

  // Risk Seviyesi belirleme
  let risk: RiskLevel = 'low';
  if (overall < 4) {
    risk = 'critical';
  } else if (overall < 6.5) {
    risk = 'high';
  } else if (overall < 8.5) {
    risk = 'medium';
  }

  // Virgülden sonra tek haneye yuvarlayalım
  const roundToOneDecimal = (num: number) => Math.round(num * 10) / 10;

  return {
    overall_health_score:     roundToOneDecimal(overall),
    lead_quality_score:       roundToOneDecimal(leadQuality),
    sales_readiness_score:    roundToOneDecimal(sales),
    premium_potential_score:  roundToOneDecimal(premium),
    creative_potential_score: roundToOneDecimal(creative),
    offer_potential_score:    roundToOneDecimal(offer),
    risk_level:               risk,
  };
}
