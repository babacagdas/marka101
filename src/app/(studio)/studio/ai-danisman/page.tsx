// src/app/(studio)/studio/ai-danisman/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAgency } from '@/features/diagnoses/components/studio/AgencyContext';
import { createClient } from '@/lib/supabase/client';

interface Message {
  sender: 'ai' | 'user';
  text: string;
}

export default function AiDanismanPage() {
  const { leads, projects, tasks } = useAgency();

  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: 'Merhaba! Ben Deep Creative AI Danışmanı. Markanızın büyüme stratejisi, brief analizi veya pazarlama otomasyonları hakkında size nasıl yardımcı olabilirim?' }
  ]);
  const [input, setInput] = useState('');
  const [diagnoses, setDiagnoses] = useState<any[]>([]);
  const [selectedDiagnosisId, setSelectedDiagnosisId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch diagnoses to access metrics and scores directly
  useEffect(() => {
    async function loadDiagnoses() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('diagnoses')
          .select('*')
          .order('created_at', { ascending: false });
        if (data) {
          setDiagnoses(data);
        }
      } catch (err) {
        console.error('Error loading diagnoses in AI advisor:', err);
      }
    }
    loadDiagnoses();
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const selectedDiagnosis = diagnoses.find(d => d.id === selectedDiagnosisId);

  const getWeakMetrics = (diag: any) => {
    const list = [];
    if (diag.premium_potential_score !== null && diag.premium_potential_score < 6.0) {
      list.push({ name: 'Premium Algı', score: diag.premium_potential_score });
    }
    if (diag.creative_potential_score !== null && diag.creative_potential_score < 6.0) {
      list.push({ name: 'Kreatif Kapasite', score: diag.creative_potential_score });
    }
    if (diag.sales_readiness_score !== null && diag.sales_readiness_score < 6.0) {
      list.push({ name: 'Satış/UX', score: diag.sales_readiness_score });
    }
    if (diag.offer_potential_score !== null && diag.offer_potential_score < 6.0) {
      list.push({ name: 'Değer Vaadi', score: diag.offer_potential_score });
    }
    return list;
  };

  const getSectorLabel = (diag: any) => {
    const sub = diag.public_submission || {};
    const sector = sub.brandContext?.sector || sub.sector || 'general';
    const SECTOR_LABELS: Record<string, string> = {
      health: 'Sağlık & Güzellik',
      realestate: 'Gayrimenkul & Mimarlık',
      b2b_industrial: 'Sanayi & İhracat',
      general: 'Genel Hizmet',
    };
    return SECTOR_LABELS[sector] || 'Hizmet';
  };

  // Dynamic Prompt Content Generators
  const generateCampaignBrief = (diag: any) => {
    const brandName = diag.brand_name;
    const sub = diag.public_submission || {};
    const ctx = sub.brandContext || {};
    const bizModel = ctx.businessModel || 'b2c';
    const sectorText = getSectorLabel(diag);

    const weakList = getWeakMetrics(diag);
    const weakest = weakList.length > 0 ? weakList[0] : { name: 'Genel Gelişim', score: diag.overall_health_score ?? 5.0 };

    let campaignStrategy = '';
    if (weakest.name.includes('Premium')) {
      campaignStrategy = `* **Kreatif Odak:** High-end görsel estetik. Tüm dijital kreatiflerde "Midnight Velvet & Bronze Gold" gibi premium lüks tonları, şık kontrastlar ve modern Outfit tipografisi ön planda olacak.\n* **Değer İletişimi:** Fiyat odaklı basit indirim kampanyaları yerine, marka hikayesi ve hizmetin eşsiz el işçiliği/klinik titizliği ön plana çıkartılacak. Fiyat meşrulaştırma sağlanacak.`;
    } else if (weakest.name.includes('Kreatif')) {
      campaignStrategy = `* **Kreatif Odak:** Hareketli video formatları (Instagram Reels, TikTok) ve mikro-animasyonlar.\n* **Değer İletişimi:** Sürekli statik grafik paylaşımlar yerine, "Perde Arkası" (Behind the Scenes) içerikler, hareketli 3D tasarımlar ve dinamik kancalı video serileri hazırlanacak.`;
    } else if (weakest.name.includes('Satış')) {
      campaignStrategy = `* **Kreatif Odak:** Dönüşüm odaklı huni kurgusu ve kullanıcı deneyimi (UX).\n* **Değer İletişimi:** Müşterileri kafa karışıklığından kurtaracak 3 adımlı basit başvuru kurguları, net yönlendirme butonları (CTA: Teşhisi Hemen Başlat) ve anında randevu alma ekranları tasarlanacak.`;
    } else {
      campaignStrategy = `* **Kreatif Odak:** Eşsiz Değer Vaadi (USP) ve iddialı pazar konumlandırması.\n* **Değer İletişimi:** Jenerik olan "En iyi hizmet bizde" ifadeleri terk edilip, "Türkiye'nin İlk Veri Tabanlı Marka Analiz Stüdyosu" gibi benzersiz, ölçülebilir ve iddialı vaatler içeren reklam metinleri kullanılacak.`;
    }

    return `### 🎯 ${brandName} için Sosyal Medya Kampanya Briefi

**Sektör:** ${sectorText}  
**İş Modeli:** ${bizModel.toUpperCase()}  
**Kampanya İsmi:** ${brandName} Elevate 2026  
**Öncelikli Gelişim Hedefi:** **${weakest.name}** metrik alanını (${weakest.score.toFixed(1)}/10) güçlendirmek.

---

### 1. Kampanyanın Ana Hedefi (Objective)
Markanın sosyal platformlarındaki görsel tutarsızlıkları gidererek lüks algısını inşa etmek ve yüksek bütçeli nitelikli müşteri (Lead) formlarının dönüşüm oranını kısa vadede artırmak.

### 2. Alıcı Persona Profilleme (Target Audience)
* **Demografi:** İlgili sektörde premium kalitede hizmet arayan, fiyat odağı düşük ancak güven odağı maksimum seviyede olan karar vericiler.
* **Ana Engel (Pain Point):** Sektördeki jenerik, kalitesiz ve özensiz tasarımlı rakiplerden dolayı güven duyamama.

### 3. Kreatif Strateji ve Konsept
${campaignStrategy}

### 4. Örnek Reklam Kancaları (Copy Hooks)
* **Kanca 1 (Problem Odaklı):** "${brandName} olarak rakipleriniz jenerik vaatlerle kalabalık yaratırken, siz nasıl ayrışıyorsunuz? Premium konumlandırma gücüyle fark yaratma zamanı."
* **Kanca 2 (Çözüm Odaklı):** "Her detayı lüks ve işlevsellik çerçevesinde yeniden yapılandırdık. Sadece en iyiyi talep edenler için tasarlanmış yeni deneyimimizi inceleyin."

### 5. KPI & Başarı Ölçütleri
* Reklam tıklama oranında (CTR) **%30 artış**.
* Nitelikli form başvuru hacminde **%25 büyüme**.
* Instagram ve LinkedIn platformlarında marka etkileşim skorunda belirgin yükseliş.`;
  };

  const generateRoadmap = (diag: any) => {
    const brandName = diag.brand_name;
    const score = diag.overall_health_score ?? 5.0;
    const weakList = getWeakMetrics(diag);
    const weakest = weakList.length > 0 ? weakList[0] : { name: 'Genel Altyapı', score: score };

    return `### 🚀 90 Günlük Büyüme Yol Haritası: ${diag.brand_name}

**Mevcut Sağlık Skoru:** **${score.toFixed(1)} / 10**  
**Öncelikli Eylem Kulvarı:** ${weakest.name} (${weakest.score.toFixed(1)}/10)

---

### 📅 0 - 30 Gün: Konumlandırma ve Görsel Altyapı
* **Eylem 1:** Teşhis raporunda zayıf çıkan **${weakest.name}** kulvarında köklü tasarım revizyonlarının başlatılması.
* **Eylem 2:** Logo monogramının tüm sosyal medya, kurumsal yazışma ve dijital teklif kanallarında yayına alınması.
* **Eylem 3:** Web sitesinin Hero alanında pürüzsüz değer vaadinin (USP) ve net yönlendirme butonlarının entegre edilmesi.

### 📅 31 - 60 Gün: Güven Ağı ve Kreatif Kampanya Yayılımı
* **Eylem 1:** Hedef kitlenin en büyük problemlerine çözümler üreten 3 bölümlük yüksek kaliteli dikey video (Reels/Shorts) serisinin yayına alınması.
* **Eylem 2:** Mevcut portföy başarı hikayelerinin (Case Study) kurumsal ve şık bir dille web sitesine yerleştirilmesi.
* **Eylem 3:** Teklifler sekmesinde markaya özel e-imzalı dijital tekliflerin hazırlanıp müşteriye iletilmesi.

### 📅 61 - 90 Gün: Otomasyon ve Dönüşüm Ölçekleme
* **Eylem 1:** Dönüşüm oranı en yüksek kreatiflerin reklam bütçesinin artırılarak ölçeklenmesi.
* **Eylem 2:** CRM takip sistemi ile vadesi gelen veya bekleyen dijital tekliflere otomatik hatırlatıcı e-postaların kurulması.
* **Eylem 3:** 90. gün sonunda genel teşhis metriklerinin yeniden ölçülerek sağlık skorunun **7.5+** seviyesine ulaştığının tescil edilmesi.

> ⚠️ **KRİTİK NOT:** Yol haritasındaki takvim adımlarının aksamaması için tasarım, içerik ve yazılım ekiplerinin stüdyo paneli üzerinden haftalık senkronize görev atamalarını yapması gereklidir.`;
  };

  const generatePositioningStrategy = (diag: any) => {
    const brandName = diag.brand_name;
    const sub = diag.public_submission || {};
    const ctx = sub.brandContext || {};
    const problem = ctx.mainProblem || 'Jenerik pazar algısı ve rakipler arasından sıyrılamama.';

    return `### 💎 Kurumsal Konumlandırma Stratejisi: ${brandName}

**Ana Problem Tanımı:** "${problem}"

---

### 1. Eşsiz Değer Vaadi (USP)
Sıradan rakipler sadece teknik operasyonel hizmetler sunarken, **${brandName}** müşterilerine "Hassas Analiz Tabanlı, Lüks Hissiyatlı ve Ölçülebilir Büyüme Çözümleri" sunar.

### 2. Marka İletişim Tonu
* **Lüks ve Seçkin:** Sakin, aceleci olmayan, tutarlı ve net bir dil.
* **Yetkin ve Analitik:** İstatistikler, veriler ve başarı raporlarıyla konuşan profesyonel yaklaşım.
* **Şeffaf:** Süreçleri ve çıktıları netçe açıklayan, samimi ve dürüst iletişim tarzı.

### 3. Fiyat Algısı Yönetimi
* **Değer Odaklı Fiyatlandırma:** Fiyatı harcanan saat veya iş gücüyle değil, müşterinin işine katılan değer, prestij ve potansiyel ciro artışı üzerinden konumlandırma.
* **Premium Sunum:** Müşteriye iletilen tekliflerin her kaleminde şık açıklamalar ve net dijital e-imza onay mekanizması sunarak lüks deneyim sağlama.

### 4. Dijital Kanıt Stratejisi
* Web sitesinde ve sunumlarda uzman sertifikaları, vaka analizleri ve kurumsal logolarla zenginleştirilmiş referansların konumlandırılması ön planda tutulmalıdır.`;
  };

  const triggerAiAction = (actionType: 'brief' | 'roadmap' | 'positioning') => {
    if (!selectedDiagnosis) return;

    let promptText = '';
    let generatedResponse = '';

    if (actionType === 'brief') {
      promptText = `${selectedDiagnosis.brand_name} için Sosyal Medya Kampanya Briefi hazırlar mısın?`;
      generatedResponse = generateCampaignBrief(selectedDiagnosis);
    } else if (actionType === 'roadmap') {
      promptText = `${selectedDiagnosis.brand_name} için 90 Günlük Büyüme Yol Haritası (Roadmap) hazırlar mısın?`;
      generatedResponse = generateRoadmap(selectedDiagnosis);
    } else if (actionType === 'positioning') {
      promptText = `${selectedDiagnosis.brand_name} için Konumlandırma Stratejisi oluşturur musin?`;
      generatedResponse = generatePositioningStrategy(selectedDiagnosis);
    }

    setMessages(prev => [...prev, { sender: 'user', text: promptText }]);
    setIsGenerating(true);

    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'ai', text: generatedResponse }]);
      setIsGenerating(false);
    }, 1200);
  };

  const handleSelectDiagnosis = (id: string) => {
    setSelectedDiagnosisId(id);
    if (id) {
      const diag = diagnoses.find(d => d.id === id);
      if (diag) {
        setMessages(prev => [...prev, {
          sender: 'ai',
          text: `Seçilen Marka: **${diag.brand_name}**.\n\nMarkanın genel sağlık skoru **${diag.overall_health_score?.toFixed(1) || '0.0'}/10** olarak tespit edilmiştir. Sağ paneldeki Yapay Zeka Eylemlerini kullanarak markaya özel kampanya briefleri veya 90 günlük yol haritaları oluşturabilirsiniz.`
        }]);
      }
    }
  };

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    setMessages(prev => [...prev, { sender: 'user', text }]);
    if (!textToSend) setInput('');
    setIsGenerating(true);

    const query = text.toLowerCase();

    setTimeout(() => {
      let reply = '';

      if (selectedDiagnosis) {
        const brandName = selectedDiagnosis.brand_name;
        const score = selectedDiagnosis.overall_health_score ?? 5.0;
        const weakList = getWeakMetrics(selectedDiagnosis);
        const sector = getSectorLabel(selectedDiagnosis);

        if (query.includes('sağlık') || query.includes('durum') || query.includes('rapor') || query.includes('skor')) {
          reply = `### ${brandName} Sağlık Değerlendirmesi\n\n` +
                  `Markanızın genel teşhis puanı **${score.toFixed(1)}/10** seviyesindedir. Sektör ortalaması ve pazar kıyaslamalarına göre **${sector}** kulvarında gelişim potansiyeli yüksektir.\n\n` +
                  `**İyileştirilmesi Gereken Zayıf Noktalar:**\n` +
                  (weakList.length > 0 
                    ? weakList.map(m => `* **${m.name}:** ${m.score.toFixed(1)}/10 puan ile kritik seviyede.`).join('\n') 
                    : `* Belirgin bir kritik zayıf nokta bulunmamaktadır. Tüm alanlar dengelidir.`) + `\n\n` +
                  `Bu alanları optimize etmek için sağ paneldeki Yapay Zeka Eylemlerini kullanarak hızlıca yol haritası veya kampanya briefi üretebilirsiniz.`;
        }
        else if (query.includes('huni') || query.includes('satış') || query.includes('müşteri') || query.includes('teklif')) {
          const salesScore = selectedDiagnosis.sales_readiness_score ?? 5.0;
          const offerScore = selectedDiagnosis.offer_potential_score ?? 5.0;

          reply = `### ${brandName} Satış Dönüşümü ve Teklif Optimizasyonu\n\n` +
                  `* **Satışa Hazırlık Derecesi:** **${salesScore.toFixed(1)}/10**\n` +
                  `* **Teklif Gücü Derecesi:** **${offerScore.toFixed(1)}/10**\n\n` +
                  `**Yapay Zeka Tavsiyeleri:**\n` +
                  `1. **Kişiselleştirilmiş Teklifler:** Teklif Merkezi üzerinden hazırladığınız taslak tekliflere bu markanın zayıf yönlerini kurtaracak paketler ekleyin.\n` +
                  `2. **CTA Netleştirme:** Web sitesindeki ana iletişim butonlarını daha görünür ve net yapın.\n` +
                  `3. **Sosyal Kanıt (Social Proof):** Karar vericilerin güvenini kazanmak için referans logolarını ve iş sonuçlarını ön plana çıkarın.`;
        }
        else {
          reply = `"${text}" talebiniz, seçili olan **${brandName}** markasının verileriyle analiz edildi.\n\n` +
                  `Markanın **${sector}** sektöründeki **${selectedDiagnosis.public_submission?.brandContext?.businessModel?.toUpperCase() || 'B2C'}** iş modeli ve **${score.toFixed(1)}/10** genel sağlık skoru göz önüne alındığında; konumlandırma stratejisi veya 90 günlük yol haritası eylemlerini tetiklemeniz önerilir. Ek sorularınız varsa zayıf metrikler veya kampanya hedefleri üzerinden detaylandırabilirsiniz.`;
        }
      } else {
        if (query.includes('sağlık') || query.includes('rapor') || query.includes('durum')) {
          reply = `### Ajans Geneli Marka Sağlık Özeti\n\n` +
                  `Sistemdeki aktif marka teşhis başvuruları analiz edilmiştir. \n\n` +
                  `**Genel Bulgular:**\n` +
                  `* Markaların en çok zorlandığı alanlar genellikle **Kreatif Kapasite** ve **Premium Görsel Algı** olarak öne çıkıyor.\n` +
                  `* Müşterileri daha hızlı kazanmak için detaylı teşhis raporu sayfalarından PDF çıktı alıp sunumlarda kullanabilirsiniz.\n\n` +
                  `Spesifik bir marka hakkında strateji üretmek için sağ panelden marka seçebilirsiniz.`;
        }
        else if (query.includes('huni') || query.includes('optimizasyon') || query.includes('satış')) {
          reply = `### Genel Satış Hunisi (Pipeline) Tavsiyeleri\n\n` +
                  `Ajans boru hattındaki markaların dönüşüm hızını artırmak için:\n` +
                  `1. Müşterilerinizin durumunu stüdyoda "Won" (Kazanıldı) yaparak projelerini otomatik başlatın.\n` +
                  `2. Tekliflerin durumunu ve onay süreçlerini Teklif Merkezi'nden anlık olarak takip edin.\n` +
                  `3. Dijital teklif formlarını müşterilere iletip hızlı e-imza onayı alın.`;
        }
        else {
          reply = `"${text}" talebinizi stüdyo yapay zekası genel danışmanlık kapsamında değerlendirdi.\n\n` +
                  `Spesifik bir marka için detaylı sosyal medya kampanya briefi, büyüme yol haritası veya konumlandırma analizi almak isterseniz, lütfen sağ taraftaki panelden ilgili markayı seçin.`;
        }
      }

      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
      setIsGenerating(false);
    }, 1000);
  };

  // Styled Markdown Parser for Premium Experience
  const renderMessageText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let content = line;

      if (content.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-[#b5179e] font-black text-xs mt-3 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b5179e]" />
            {content.slice(4)}
          </h4>
        );
      }

      if (content.startsWith('> ')) {
        const alertText = content.slice(2);
        const isWarning = alertText.includes('⚠️') || alertText.includes('KRİTİK');
        return (
          <div key={idx} className={`my-3 p-3.5 rounded border text-[11px] font-bold leading-relaxed ${
            isWarning
              ? 'bg-red-500/10 border-red-500/20 text-red-200'
              : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-200'
          }`}>
            {alertText}
          </div>
        );
      }

      let isBullet = false;
      if (content.trim().startsWith('* ') || content.trim().startsWith('- ')) {
        isBullet = true;
        content = content.replace(/^[\s]*[\*\-]\s+/, '');
      }

      const parts = [];
      let remaining = content;
      const boldRegex = /\*\*([^*]+)\*\*/g;
      let match;
      let lastIndex = 0;

      while ((match = boldRegex.exec(remaining)) !== null) {
        const before = remaining.substring(lastIndex, match.index);
        if (before) parts.push(before);
        parts.push(<strong key={match.index} className="text-[#f6f5fa] font-extrabold">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      const after = remaining.substring(lastIndex);
      if (after) parts.push(after);

      const inlineContent = parts.length > 0 ? parts : content;

      if (isBullet) {
        return (
          <div key={idx} className="flex items-start gap-2 ml-3 my-1 text-[11px]">
            <span className="text-[#b5179e] mt-1.5 text-[6px]">●</span>
            <span className="flex-1">{inlineContent}</span>
          </div>
        );
      }

      if (content.trim() === '') {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="text-[11px] leading-relaxed mb-1.5 text-[#c9c5d8]">
          {inlineContent}
        </p>
      );
    });
  };

  return (
    <div className="w-full space-y-6 animate-fade-in-up pb-12 px-2 flex-grow flex flex-col min-h-[500px]">
      <div className="border-b border-white/5 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-[#f6f5fa] tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-[#b5179e]">smart_toy</span>
            Yapay Zeka Danışmanı
          </h1>
          <p className="text-xs text-[#928ca1] font-medium mt-1">Ajans performansı, marka teşhisleri ve pazarlama hunileri için yapay zeka destekli öneriler alın.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-grow items-stretch">
        {/* Chat area */}
        <div className="lg:col-span-3 glass-panel rounded-lg p-6 flex flex-col justify-between min-h-[520px] border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#b5179e]/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#4f20c0]/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 scrollbar-thin max-h-[420px]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                <div className={`flex items-start gap-2.5 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-[#4f20c0] to-[#b5179e] text-white shadow-md shadow-purple-500/20'
                      : 'bg-white/5 border border-white/10 text-[#f6f5fa]'
                  }`}>
                    {msg.sender === 'user' ? 'BEN' : <span className="material-symbols-outlined text-xs text-[#b5179e]">smart_toy</span>}
                  </div>

                  <div className={`p-4 rounded-xl text-xs font-medium leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-[#4f20c0] to-[#b5179e] text-white rounded-tr-none shadow-lg shadow-purple-500/10'
                      : 'glass-card border border-white/5 text-[#c9c5d8] rounded-tl-none'
                  }`}>
                    {msg.sender === 'user' ? msg.text : renderMessageText(msg.text)}
                  </div>
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex justify-start animate-pulse">
                <div className="flex items-start gap-2.5 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#f6f5fa]">
                    <span className="material-symbols-outlined text-xs text-[#b5179e] animate-spin">sync</span>
                  </div>
                  <div className="glass-card border border-white/5 text-[#928ca1] p-4 rounded-xl text-xs font-semibold rounded-tl-none flex items-center gap-2">
                    <span>Yapay Zeka Analiz Ediyor ve Strateji Geliştiriyor...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2 border-t border-white/5 pt-4">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={
                selectedDiagnosis
                  ? `${selectedDiagnosis.brand_name} için bir soru sorun...`
                  : "Sorunuzu yazın veya sağ panelden bir marka seçerek başlayın..."
              }
              className="flex-grow bg-[#0e0b1a]/70 border border-white/10 rounded-lg px-4 py-3 text-xs font-semibold text-[#f1ecf9] placeholder-[#7d778f] focus:outline-none focus:border-[#4f20c0] transition-all"
            />
            <button
              onClick={() => handleSend()}
              className="w-12 h-12 bg-gradient-to-br from-[#4f20c0] to-[#b5179e] text-white rounded-lg flex items-center justify-center hover:scale-[1.03] active:scale-[0.98] transition-all shadow-md shadow-purple-500/10"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </div>
        </div>

        {/* Info/Brand Intelligence panel */}
        <div className="space-y-6 lg:col-span-1 flex flex-col justify-start">
          <div className="glass-card rounded-lg p-5 border border-white/5 space-y-4">
            <h3 className="text-xs font-black text-[#f6f5fa] uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-3">
              <span className="material-symbols-outlined text-[#b5179e] text-sm">business</span>
              Marka Seçimi
            </h3>

            <div>
              <label className="text-[10px] text-[#928ca1] uppercase font-bold block mb-1.5">Aktif Teşhis Verisi</label>
              <select
                value={selectedDiagnosisId}
                onChange={e => handleSelectDiagnosis(e.target.value)}
                className="w-full text-xs font-bold p-2.5 rounded-lg border border-white/10 bg-[#0e0b1a]/70 text-[#f1ecf9] focus:outline-none focus:border-[#4f20c0]"
              >
                <option value="">-- Genel Danışmanlık --</option>
                {diagnoses.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.brand_name} ({d.overall_health_score?.toFixed(1) || '0.0'}/10)
                  </option>
                ))}
              </select>
            </div>

            {selectedDiagnosis ? (
              <div className="space-y-4 pt-2 animate-fade-in-up">
                {/* Overall Score Box */}
                <div className="flex items-center gap-4 bg-[#140e2d]/60 p-3.5 rounded-lg border border-white/5">
                  <div className="relative w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-[#4f20c0]/20 to-[#b5179e]/20 border border-white/10 shrink-0">
                    <span className="text-xs font-black text-[#f6f5fa]">{selectedDiagnosis.overall_health_score?.toFixed(1) || '0.0'}</span>
                    <div className="absolute inset-0.5 rounded-full border border-dashed border-[#b5179e]/40 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-[#928ca1]">Genel Sağlık Skoru</h4>
                    <p className="text-[9px] font-extrabold text-[#f6f5fa] mt-0.5 uppercase tracking-wide">
                      {selectedDiagnosis.overall_health_score >= 7.5 ? '✨ Premium Standart' : selectedDiagnosis.overall_health_score >= 5.5 ? '📈 Gelişim Fırsatı' : '⚠️ Kritik Durum'}
                    </p>
                  </div>
                </div>

                {/* Context Details */}
                <div className="space-y-2 text-[11px] font-bold text-[#c9c5d8]">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-[#928ca1]">Sektör:</span>
                    <span>{getSectorLabel(selectedDiagnosis)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-[#928ca1]">İş Modeli:</span>
                    <span className="uppercase">{selectedDiagnosis.public_submission?.brandContext?.businessModel || 'B2C'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-[#928ca1]">Bütçe:</span>
                    <span>{selectedDiagnosis.public_submission?.brandContext?.budget || selectedDiagnosis.public_submission?.monthly_budget_range || 'Belirtilmemiş'}</span>
                  </div>
                </div>

                {/* Weak metrics alert */}
                {getWeakMetrics(selectedDiagnosis).length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-black text-red-400/90 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">warning</span>
                      İyileştirilmesi Gerekenler
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {getWeakMetrics(selectedDiagnosis).map((m, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-red-500/10 text-red-300 border border-red-500/20 rounded text-[9px] font-extrabold tracking-tight uppercase">
                          {m.name}: {m.score.toFixed(1)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI actions */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <span className="text-[10px] uppercase font-bold text-[#b5179e] block mb-1">Yapay Zeka Eylemleri</span>

                  <button
                    onClick={() => triggerAiAction('brief')}
                    className="w-full text-left p-2.5 rounded-lg border border-white/5 bg-white/5 hover:bg-[#b5179e]/10 hover:border-[#b5179e]/30 text-[11px] text-[#f1ecf9] font-bold transition-all flex items-center justify-between"
                  >
                    <span>✦ Sosyal Medya Briefi Hazırla</span>
                    <span className="material-symbols-outlined text-[14px] text-[#928ca1]">arrow_forward</span>
                  </button>

                  <button
                    onClick={() => triggerAiAction('roadmap')}
                    className="w-full text-left p-2.5 rounded-lg border border-white/5 bg-white/5 hover:bg-[#4f20c0]/20 hover:border-[#4f20c0]/40 text-[11px] text-[#f1ecf9] font-bold transition-all flex items-center justify-between"
                  >
                    <span>✦ 90 Günlük Yol Haritası</span>
                    <span className="material-symbols-outlined text-[14px] text-[#928ca1]">arrow_forward</span>
                  </button>

                  <button
                    onClick={() => triggerAiAction('positioning')}
                    className="w-full text-left p-2.5 rounded-lg border border-white/5 bg-white/5 hover:bg-[#b5179e]/10 hover:border-[#b5179e]/30 text-[11px] text-[#f1ecf9] font-bold transition-all flex items-center justify-between"
                  >
                    <span>✦ Konumlandırma Stratejisi</span>
                    <span className="material-symbols-outlined text-[14px] text-[#928ca1]">arrow_forward</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#140e2d]/30 border border-white/5 p-4 rounded-lg text-center">
                <span className="material-symbols-outlined text-[36px] text-white/20 mb-2">smart_toy</span>
                <p className="text-[11px] text-[#928ca1] leading-relaxed">
                  Marka odaklı kampanya briefleri ve büyüme planları üretmek için listeden bir marka seçin.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
