// scripts/run-golden-tests.ts
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { calculateDiagnosisResult } from '../src/features/diagnoses/scoring/engine';
import type { BrandContext, DiagnosisAnswers, DiagnosisOpenEnded } from '../src/features/diagnoses/diagnosis-types';

interface TestScenario {
  name: string;
  description: string;
  context: BrandContext;
  answers: DiagnosisAnswers;
  openEnded: DiagnosisOpenEnded;
}

const scenarios: TestScenario[] = [
  {
    name: "1. Görünmez Uzman (Invisible Expert)",
    description: "Kaliteli hizmet veriyor ancak dijital görünürlüğü, web sitesi ve referans kanıtları bulunmuyor.",
    context: {
      sector: "general",
      businessModel: "b2b",
      brandStage: "growth",
      growthGoal: "more_customers", // Büyüme hedefi
      mainProblem: "low_awareness"  // Düşük görünürlük
    },
    answers: {
      "MN-C01": 5, // Konumlandırma Tanımı (Net)
      "MN-C02": "evet", // Fark farklılaşma kanıtı (Var)
      "MN-C03": 4, // Mesaj tutarlılığı
      "PA-C01": 4, // Görsel kalite
      "PA-C02": "evet", // Profesyonel tasarım
      "PA-C03": "hayır", // Fiyat itirazı sıklığı (Düşük)
      "ST-C01": 4, // Hikaye var
      "ST-C02": "evet", // Ses tonu kılavuzu var
      "DG-C01": 2, // Web sitesi izlenimi zayıf (Görünmezlik)
      "DG-C02": "hayır", // Sosyal kanıt/referans yok (Dijital kanıt eksik)
      "KS-C01": "hayır", // Marka kılavuzu yok
      "KS-C02": 2, // Bütünlük zayıf
      "SM-G01": 4,
      "SM-G02": "hayır",
      "SM-G03": 4,
      "FD-C01": "evet",
      "FD-C02": "evet",
      "FD-C03": "evet"
    },
    openEnded: {}
  },
  {
    name: "2. İllüzyonist Marka (Illusionist Brand)",
    description: "Görsel tasarımı son derece şık ve çekici fakat içi boş; konumlandırma, değer vaadi ve satış dönüşümü zayıf.",
    context: {
      sector: "general",
      businessModel: "b2c",
      brandStage: "startup",
      growthGoal: "more_customers",
      mainProblem: "cant_convert" // Dönüşüm problemi
    },
    answers: {
      "MN-C01": 2, // Konumlandırma belirsiz
      "MN-C02": "hayır", // USP yok
      "MN-C03": 2, // Tutarsız mesajlar
      "PA-C01": 5, // Görsel kalite mükemmel (İllüzyon!)
      "PA-C02": "evet",
      "PA-C03": "evet", // Yüksek fiyat itirazı (Çünkü değer yok)
      "ST-C01": 2, // Hikaye yok
      "ST-C02": "hayır",
      "DG-C01": 4, // Sitenin görünüşü güzel
      "DG-C02": "hayır", // Sosyal kanıt/referans eksik
      "KS-C01": "evet", // Kılavuz var
      "KS-C02": 4,
      "SM-G01": 2,
      "SM-G02": "hayır",
      "SM-G03": 2,
      "FD-C01": "evet",
      "FD-C02": "evet",
      "FD-C03": "evet"
    },
    openEnded: {}
  },
  {
    name: "3. Lead Var Satış Yok (Leads but No Sales)",
    description: "Trafik ve potansiyel müşteri talebi geliyor fakat web sitesi güven vermiyor ve fiyat itirazları yüzünden satış kapanmıyor.",
    context: {
      sector: "general",
      businessModel: "b2b",
      brandStage: "growth",
      growthGoal: "more_customers",
      mainProblem: "cant_convert"
    },
    answers: {
      "MN-C01": 4,
      "MN-C02": "evet",
      "MN-C03": 4,
      "PA-C01": 4,
      "PA-C02": "evet",
      "PA-C03": "evet", // Yoğun fiyat itirazı
      "ST-C01": 4,
      "ST-C02": "evet",
      "DG-C01": 2, // Sitenin izlenimi/güvenilirliği zayıf
      "DG-C02": "hayır", // Sosyal kanıt yok
      "KS-C01": "evet",
      "KS-C02": 4,
      "SM-G01": 4,
      "SM-G02": "hayır",
      "SM-G03": 2,
      "FD-C01": "evet",
      "FD-C02": "evet",
      "FD-C03": "evet"
    },
    openEnded: {}
  },
  {
    name: "4. Premium Olduğunu Düşünen Marka (Think Premium but No Evidence)",
    description: "Premium fiyatlar talep etmek ve üst segmente hizmet vermek istiyor ancak görsel kimlik kalitesi veya hikaye anlatımı yok.",
    context: {
      sector: "general",
      businessModel: "b2c",
      brandStage: "premium", // Premium segmente geçiyor
      growthGoal: "price_increase", // Fiyat artırmak istiyor
      mainProblem: "price_objection" // Aşırı fiyat itirazı
    },
    answers: {
      "MN-C01": 2, // Belirsiz
      "MN-C02": "hayır",
      "MN-C03": 2,
      "PA-C01": 2, // Görsel kimlik zayıf
      "PA-C02": "hayır", // Profesyonel güncelleme yok
      "PA-C03": "evet", // Fiyat itirazı yüksek
      "ST-C01": 2,
      "ST-C02": "hayır",
      "DG-C01": 2,
      "DG-C02": "hayır",
      "KS-C01": "hayır",
      "KS-C02": 2,
      "SM-G01": 2,
      "SM-G02": "hayır",
      "SM-G03": 2,
      "FD-C01": "evet",
      "FD-C02": "evet",
      "FD-C03": "evet"
    },
    openEnded: {}
  },
  {
    name: "5. İçerik Üretiyor Ama Kimse Umursamıyor (Produces Content but Nobody Cares)",
    description: "Sosyal medyada sürekli paylaşım ve şablon üretimi yapıyor ancak konumlandırma, marka hikayesi ve stratejik derinlik zayıf.",
    context: {
      sector: "general",
      businessModel: "b2c",
      brandStage: "growth",
      growthGoal: "brand_awareness", // Bilinirlik büyütmek istiyor
      mainProblem: "low_awareness"
    },
    answers: {
      "MN-C01": 2, // Belirsiz
      "MN-C02": "hayır",
      "MN-C03": 2,
      "PA-C01": 4, // Tasarım iyi
      "PA-C02": "evet",
      "PA-C03": "kısmen",
      "ST-C01": 2, // Hikaye yok (Ruhsuz içerik)
      "ST-C02": "hayır", // Ses profili yok
      "DG-C01": 4,
      "DG-C02": "evet",
      "KS-C01": "evet", // Şablonlar/Kılavuz var
      "KS-C02": 4,
      "SM-G01": 2,
      "SM-G02": "evet",
      "SM-G03": 4,
      "FD-C01": "evet",
      "FD-C02": "evet",
      "FD-C03": "evet"
    },
    openEnded: {}
  },
  {
    name: "6. Reklam Bağımlısı Marka (Ad Addict Brand)",
    description: "Markanın tüm satış ve büyüme sorunlarını sadece reklam bütçesini artırarak çözmeye çalışıyor; ancak marka temelleri ve dönüşüm altyapısı eksik.",
    context: {
      sector: "general",
      businessModel: "b2b",
      brandStage: "growth",
      growthGoal: "more_customers",
      mainProblem: "no_leads" // Müşteri bulamıyor, reklama yüklenmek istiyor
    },
    answers: {
      "MN-C01": 2, // Netlik yok
      "MN-C02": "hayır",
      "MN-C03": 2,
      "PA-C01": 3,
      "PA-C02": "hayır",
      "PA-C03": "evet", // Yoğun itiraz
      "ST-C01": 2,
      "ST-C02": "hayır",
      "DG-C01": 3, // Web sitesi ortalama
      "DG-C02": "hayır", // Sosyal kanıt yok (Reklam gelen trafiği ikna edemiyor)
      "KS-C01": "hayır",
      "KS-C02": 3,
      "SM-G01": 2,
      "SM-G02": "hayır",
      "SM-G03": 3,
      "FD-C01": "evet",
      "FD-C02": "evet",
      "FD-C03": "evet"
    },
    openEnded: {}
  },
  {
    name: "7. Takipçisi Var Güveni Yok (Followers but No Trust)",
    description: "Sosyal medyada yüksek kitleye sahip olmasına rağmen web sitesinde ve dijitalde hasta/müşteri referans yorumları eksik olduğundan güvensizlik yaşanıyor.",
    context: {
      sector: "health", // Sağlık sektörü
      businessModel: "b2c",
      brandStage: "growth",
      growthGoal: "more_customers",
      mainProblem: "cant_convert"
    },
    answers: {
      "MN-C01": 4,
      "MN-C02": "evet",
      "MN-C03": 4,
      "PA-C01": 4,
      "PA-C02": "evet",
      "PA-C03": "kısmen",
      "ST-C01": 4,
      "ST-C02": "evet",
      "DG-C01": 3,
      "DG-C02": "hayır", // Sosyal kanıt yok (Referans eksik)
      "KS-C01": "evet",
      "KS-C02": 4,
      "SM-H01": "evet",
      "SM-H02": "yok", // Google hasta yorumu yok! (Sektörel güven zayıf)
      "SM-H03": 4,
      "FD-C01": "evet",
      "FD-C02": "evet",
      "FD-C03": "evet"
    },
    openEnded: {}
  },
  {
    name: "8. Güveni Var Teklifi Yok (Trust but No Offer)",
    description: "Müşteriler markaya son derece güveniyor ve referanslar güçlü ancak rakiplerden ayrışan özgün bir teklif/değer vaadi bulunmuyor.",
    context: {
      sector: "general",
      businessModel: "b2b",
      brandStage: "growth",
      growthGoal: "more_customers",
      mainProblem: "cant_convert"
    },
    answers: {
      "MN-C01": 4,
      "MN-C02": "hayır", // Ayrışan değer vaadi / teklif yok!
      "MN-C03": 4,
      "PA-C01": 4,
      "PA-C02": "evet",
      "PA-C03": "evet", // Fiyat itirazı çok (Teklifin değeri meşrulaştırılamıyor)
      "ST-C01": 4,
      "ST-C02": "evet",
      "DG-C01": 4, // Siteden güven akıyor
      "DG-C02": "evet", // Sosyal kanıt mükemmel
      "KS-C01": "evet",
      "KS-C02": 4,
      "SM-G01": 2, // Hizmet farklılaşması zayıf
      "SM-G02": "evet",
      "SM-G03": 4,
      "FD-C01": "evet",
      "FD-C02": "evet",
      "FD-C03": "evet"
    },
    openEnded: {}
  },
  {
    name: "9. Kurucuya Bağımlı Marka (Founder Dependent Brand)",
    description: "Kurucunun kişisel performansı ve çevresiyle işler yürüyor; kurumsal marka kuralları, tasarım kılavuzları veya sistemleşmiş altyapı bulunmuyor.",
    context: {
      sector: "general",
      businessModel: "b2b",
      brandStage: "corporate", // Kurumsallaşıyor
      growthGoal: "systematize", // Süreçleri sistemleştirmek istiyor
      mainProblem: "no_referrals"
    },
    answers: {
      "MN-C01": 4,
      "MN-C02": "evet",
      "MN-C03": 4,
      "PA-C01": 4,
      "PA-C02": "evet",
      "PA-C03": "hayır",
      "ST-C01": 4,
      "ST-C02": "evet",
      "DG-C01": 4,
      "DG-C02": "evet",
      "KS-C01": "hayır", // Marka kılavuzu yok! (Kişiye bağımlılık)
      "KS-C02": 2, // Platformlar arası bütünlük zayıf (Çünkü sistem kuralları yok)
      "SM-G01": 4,
      "SM-G02": "evet",
      "SM-G03": 4,
      "FD-C01": "hayır",
      "FD-C02": "hayır",
      "FD-C03": "hayır"
    },
    openEnded: {
      "AUC-01": "Kurucumuzun yoğunluğundan ötürü içerik süreçleri tamamen aksıyor, ekipten bağımsız standart bir akış oturtamadık."
    }
  },
  {
    name: "10. Konumlandırma Krizi Yaşayan Marka (Positioning Crisis Brand)",
    description: "Marka kim olduğunu, kime hitap ettiğini ve rakiplerinden nasıl ayrıştığını hiçbir kanalda ifade edemiyor; tüm skorlar kritik seviyede.",
    context: {
      sector: "general",
      businessModel: "hybrid_b2c",
      brandStage: "repositioning", // Yeniden konumlanıyor
      growthGoal: "new_market",
      mainProblem: "no_differentiation"
    },
    answers: {
      "MN-C01": 1, // Konumlandırma hiç yok
      "MN-C02": "hayır",
      "MN-C03": 1,
      "PA-C01": 2,
      "PA-C02": "hayır",
      "PA-C03": "evet",
      "ST-C01": 1,
      "ST-C02": "hayır",
      "DG-C01": 1,
      "DG-C02": "hayır",
      "KS-C01": "hayır",
      "KS-C02": 1,
      "SM-G01": 1,
      "SM-G02": "hayır",
      "SM-G03": 1,
      "FD-C01": "evet",
      "FD-C02": "evet",
      "FD-C03": "evet"
    },
    openEnded: {
      "AUC-01": "Markamızı tamamen yeni bir sektöre taşımak istiyoruz ancak şu anki kimliğimiz buna uymuyor ve kafa karıştırıyor."
    }
  }
];

function runTests() {
  console.log("Golden Scenarios testleri başlatılıyor...");
  
  let report = `# Golden Scenario Testing Layer — Decision Quality Report

**Tarih:** ${new Date().toLocaleString('tr-TR')}  
**Amaç:** BIOS Karar Motorunun 10 farklı marka örüntüsü üzerindeki karar doğruluğunu, önceliklendirme matrisini ve sıralama çatışması uyarılarını doğrulamak.

---

`;

  scenarios.forEach((scenario, index) => {
    // Run core engine
    const result = calculateDiagnosisResult({
      context: scenario.context,
      answers: scenario.answers,
      openEnded: scenario.openEnded,
      questionsServed: 15
    });

    const exp = result.explainability;
    const treat = result.treatmentIntelligence;

    report += `## Senaryo ${scenario.name}
**Açıklama:** ${scenario.description}

### 📊 Karar Motoru Puanlama Özeti
* **Genel Sağlık Skoru:** ${result.brandHealth} / 100
* **Marka Aşaması / Tipi:** ${result.brandType.label} (Gelişim Aşaması: ${scenario.context.brandStage})
* **Sektörel Uyum / Satışa Hazırlık:** Uyum %${result.sectorFit} | Satışa Hazırlık %${result.salesReadiness}
* **Güven Seviyesi:** %${exp?.confidenceDetails.score ?? 0}
* **Güven Gerekçeleri:**
${exp?.confidenceDetails.reasons.map(r => `  * ${r}`).join('\n') || '  * Gerekçe hesaplanamadı.'}

### 🔍 Aktif Teşhis & Bulgular
* **Aktif Yapısal Teşhisler:** ${exp?.activeDiagnoses.map(d => `\`${d.label} (${d.key})\``).join(', ') || 'Yok'}
* **Aktif Sinyaller:** ${exp?.activeSignals.map(s => `\`${s.key}\``).join(', ') || 'Yok'}
* **Teşhis Bulguları (Findings):**
${exp?.activeDiagnoses.flatMap(d => d.findings).map(f => `  * ${f}`).join('\n') || '  * Bulgular listesi boş.'}

### 🚦 Müdahale ve Yol Haritası (Treatment Intelligence)
* **Birincil Müdahale Odak Noktası (Priority Focus):** \`${treat?.priorityDiagnosisKey || 'Belirlenmedi'}\`
* **Öncelik Aksiyon Sırası (Strategic Roadmap):**
${treat?.strategicRoadmap.map((item, idx) => `  ${idx + 1}. **${item.label}** (\`${item.diagnosisKey}\`)`).join('\n') || '  * Sıralama bulunamadı.'}

### 🛠️ Öncelikli Müdahale Reçetesi (Top Priority Prescriptions)
${(() => {
  const topPlan = treat?.treatmentPlans.find(p => p.diagnosisKey === treat?.priorityDiagnosisKey);
  if (!topPlan) return '  * Müdahale planı bulunamadı.';
  return `**Protokol Adı: ${topPlan.title}**\n` + 
    topPlan.steps.map(step => `  * **Adım ${step.stepNumber}: ${step.title}** — ${step.description}`).join('\n');
})()}

### ⚠️ Yanlış Sıralama Uyarıları (Wrong Sequence Warnings)
${treat?.wrongSequenceWarnings && treat.wrongSequenceWarnings.length > 0 ? 
  treat.wrongSequenceWarnings.map(w => `> **[!WARNING] ${w.title} (Hamle: ${w.targetAction})**  \n> ${w.warningMessage}  \n> *Bloke Eden Teşhisler:* ${w.blockers.map(b => `\`${b}\``).join(', ')}`).join('\n\n')
  : '  * Yanlış sıralama uyarısı tetiklenmedi.'}

### 💬 Keşif/Görüşme Soruları (Meeting Intelligence)
${treat?.meetingQuestions && treat.meetingQuestions.length > 0 ?
  treat.meetingQuestions.map(mq => `  * **[MQ]** “${mq.questionText}” *(Amaç: ${mq.objective})*`).join('\n')
  : '  * Soru listesi boş.'}

---

`;
  });

  const artifactDir = path.resolve(os.homedir(), '.gemini/antigravity-ide/brain/8d6df209-e2bc-4012-9b54-6f180cb3e4c8');
  
  // Create folders if they don't exist
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  const outputPath = path.join(artifactDir, 'golden_scenario_results.md');
  fs.writeFileSync(outputPath, report);
  console.log(`Test sonuç raporu başarıyla kaydedildi: ${outputPath}`);
}

runTests();
