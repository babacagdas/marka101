import type { DiagnosisQuestion } from "../diagnosis-types";

function sc(id: string, label1: string, label2: string, label3: string, label4: string, label5: string) {
  return [
    { value: 1, label: label1 },
    { value: 2, label: label2 },
    { value: 3, label: label3 },
    { value: 4, label: label4 },
    { value: 5, label: label5 },
  ] as const;
}

export const CORE_QUESTIONS: readonly DiagnosisQuestion[] = [
  // ── MARKA NETLİĞİ ──────────────────────────────────────────
  {
    id: "MN-C01", layer: "core", category: "brandClarity", type: "scale", weight: 3,
    title: "Konumlandırma Tanımı",
    text: "Markanızın ne yaptığını, kime hitap ettiğini ve rakiplerinden nasıl ayrıştığını — bu üçünü birden tek cümlede anlatabilir misiniz?",
    tooltip: "Yazılı konumlandırma belgenizin varlığı ve ekip içerisindeki tutarlılığı.",
    options: sc("MN-C01",
      "Hayır, bunu hiç oturtamadık",
      "Kafamda şekilleniyor ama net söyleyemiyorum",
      "Söyleyebiliyorum ama ekibimiz farklı şeyler söylüyor",
      "Tutarlı bir cevabımız var, ama yazılı değil",
      "Yazılı, ekiple paylaşılmış ve aktif kullandığımız bir tanımımız var"
    )
  },
  {
    id: "MN-C02", layer: "core", category: "brandClarity", type: "scale", weight: 3,
    title: "Farklılaşma Kanıtı",
    text: '"Neden sizi seçmeliyim?" sorusuna ekibiniz ne kadar net ve tutarlı yanıt verebiliyor?',
    tooltip: "Sektördeki diğer alternatiflerden sizi ayıran somut ve özgün nedenler.",
    options: sc("MN-C02",
      "Net bir yanıt yok, herkes farklı şey söylüyor",
      "Genel bir cevabımız var ama güçlü ve özgün değil",
      "İyi bir cevabımız var ama rakibimiz de aynısını söyleyebilir",
      "Güçlü ve tutarlı bir farklılaşma argümanımız var",
      "Test edilmiş, müşteride karşılık bulan özgün bir argümanımız var"
    )
  },
  {
    id: "MN-C03", layer: "core", category: "brandClarity", type: "scale", weight: 2,
    title: "Mesaj Tutarlılığı",
    text: "Web sitenizi, sosyal medyanızı ve son yaptığınız satış görüşmesini aynı anda düşünün. Aynı marka dili mi konuşuyor?",
    tooltip: "Kanallar arası ton ve mesaj bütünlüğü.",
    options: sc("MN-C03",
      "Her kanal sanki farklı bir markaya ait gibi",
      "Tutarsızlık belirgin, fark edilebiliyor",
      "Çoğunlukla benzer ama zaman zaman kopukluk var",
      "Genel olarak tutarlı, küçük sapmalar oluyor",
      "Tüm kanallarda bütünleşik ve tanınabilir bir mesaj var"
    )
  },

  // ── PREMİUM ALGI ───────────────────────────────────────────
  {
    id: "PA-C01", layer: "core", category: "premiumPerception", type: "scale", weight: 3,
    title: "Görsel Kimlik Kalitesi",
    text: "Bir potansiyel müşteri sizi ilk kez görsel olarak gördüğünde — web sitesi, sosyal medya veya kartvizit — ne tepki verdiğini düşünüyorsunuz?",
    tooltip: "Görsel kimliğinizin ilk izlenim ve kalite algısı gücü.",
    options: sc("PA-C01",
      "\"Bu kim?\" deyip geçiyor olabilir, dikkat çekmiyoruz",
      "Fark ediyor ama etkilenmiyor",
      "Yeterli buluyor ama öne çıkmıyoruz",
      "Güven veriyor ve ilgi çekiyor",
      "\"Bu ciddi bir marka\" izlenimi yaratıyor"
    )
  },
  {
    id: "PA-C02", layer: "core", category: "premiumPerception", type: "scale", weight: 3,
    title: "Profesyonel Tasarım Kanıtı",
    text: "Görsel kimliğiniz son 3 yıl içinde profesyonel bir ekip tarafından tasarlandı veya güncellendi mi?",
    tooltip: "Marka kimliğinde uzman dokunuşunun güncelliği.",
    options: sc("PA-C02",
      "Hayır, hiç profesyonel dokunuş almadı",
      "Çok eski, 5+ yıl önce yapıldı",
      "3–5 yıl önce yapıldı",
      "Son 1–3 yılda kısmen güncellendi",
      "Son 1 yıl içinde sistematik ve kapsamlı bir çalışma yapıldı"
    )
  },
  {
    id: "PA-C03", layer: "core", category: "premiumPerception", type: "scale", weight: 2,
    reverseScored: true,
    title: "Fiyat İtirazı Sıklığı",
    text: "Satış görüşmelerinde fiyatla ilgili itiraz veya olumsuz geri bildirim ne sıklıkla alıyorsunuz?",
    tooltip: "Bu soru ters puanlıdır; itirazların azlığı yüksek algı gücünü gösterir.",
    options: sc("PA-C03",
      "Neredeyse her görüşmede fiyat sorgulanıyor",
      "Sık alıyoruz, rahatsız edici boyutta",
      "Zaman zaman alıyoruz",
      "Nadiren alıyoruz",
      "Fiyat, sunduğumuz değerin karşılığı olarak kabul görüyor"
    )
  },

  // ── STORYTELLING GÜCÜ ──────────────────────────────────────
  {
    id: "ST-C01", layer: "core", category: "storytelling", type: "scale", weight: 3,
    title: "Müşteri Ne Söylüyor",
    text: "Bir müşteriniz sizi başka birine önerirken sizin hakkınızda ne söylüyor?",
    tooltip: "Müşterilerinizin kulaktan kulağa aktardığı hikaye ve farkınız.",
    options: sc("ST-C01",
      "Bilmiyoruz, hiç sormadık",
      "\"İyi iş yapıyorlar\" gibi genel şeyler söylüyor",
      "Hizmetimizi tarif ediyor ama neden bizi seçtiklerini değil",
      "Farkımızı hissettiren bir şeyler söylüyor",
      "Başkalarından bizi ayıran özgün bir şey söylüyor — bunu biliyoruz"
    )
  },
  {
    id: "ST-C02", layer: "core", category: "storytelling", type: "scale", weight: 1,
    title: "Marka Sesi Tutarlılığı",
    text: "Farklı kişiler markanız adına içerik ürettiğinde — sosyal medya, e-posta, teklif — aynı tonu mu yakalıyor?",
    tooltip: "Marka tonunun belgelenmiş olması ve ekip tarafından tutarlı uygulanması.",
    options: sc("ST-C02",
      "Her içerik farklı biri tarafından yazılmış gibi hissettiriyor",
      "Benzerlik var ama tutarsızlık belirgin",
      "Çoğunlukla benzer, zaman zaman kayıyor",
      "Tutarlı, ama yazılı bir kılavuz yok",
      "Ses kılavuzumuz var ve aktif kullanılıyor"
    )
  },

  // ── DİJİTAL GÜVEN VE SATIŞ ETKİSİ ─────────────────────────
  {
    id: "DG-C01", layer: "core", category: "digitalTrust", type: "scale", weight: 3,
    title: "Rakiple Kıyasla Web Sitesi",
    text: "Sektörünüzdeki güçlü bir rakibinizin web sitesiyle kendinizi kıyasladığınızda ne görüyorsunuz?",
    tooltip: "Web sitenizin rakiplere kıyasla güven ve prestij düzeyi.",
    options: sc("DG-C01",
      "Rakip çok daha güçlü görünüyor, fark büyük",
      "Rakip daha iyi ama fark kapatılabilir",
      "Benzer düzeydeyiz",
      "Bizim sitemiz daha güçlü",
      "Sektörümüzde referans sayılabilecek düzeyde olduğumuzu düşünüyoruz"
    )
  },
  {
    id: "DG-C02", layer: "core", category: "digitalTrust", type: "scale", weight: 3,
    title: "Sosyal Kanıt Görünürlüğü",
    text: "Müşteri referanslarınız, yorumlarınız veya vaka çalışmalarınız dijitalde ne kadar aktif?",
    tooltip: "Memnun müşterilerinizin başarılarının dijital temas noktalarında sunumu.",
    options: sc("DG-C02",
      "Hiç yok",
      "Var ama bulmak zor, öne çıkmıyor",
      "Birkaç tane var, sistematik değil",
      "Görünür ve güncel",
      "Aktif yönetiliyor, sürekli ekleniyor"
    )
  },
  {
    id: "DG-EK1", layer: "core", category: "digitalTrust", type: "scale", weight: 2,
    title: "Dijital Kanallardan Gelen Lead",
    text: "Son 3 ayda dijital varlığınız üzerinden — web, sosyal medya, e-posta — kaç potansiyel müşteri talebi aldınız?",
    tooltip: "Dijital kanalların ticari talep üretme performansı. Takip edilmiyorsa 1 puan alır.",
    options: sc("DG-EK1",
      "Hiç almadık",
      "1–5 arası",
      "5–20 arası",
      "20'den fazla",
      "Takip etmiyoruz"
    )
  },

  // ── KREATİF SİSTEM VE TUTARLILIK ───────────────────────────
  {
    id: "KS-C01", layer: "core", category: "creativeSystem", type: "scale", weight: 3,
    title: "Marka Kılavuzu",
    text: "Markanız için hazırlanmış bir marka kılavuzu — brand guidelines — var mı?",
    tooltip: "Görsel ve tonal standartların belirlendiği rehber doküman.",
    options: sc("KS-C01",
      "Hayır, hiç yok",
      "Var ama eksik ya da güncelliğini yitirmiş",
      "Temel düzeyde var",
      "Kapsamlı var ama aktif kullanılmıyor",
      "Kapsamlı, güncel ve ekip tarafından aktif kullanılıyor"
    )
  },
  {
    id: "KS-C02", layer: "core", category: "creativeSystem", type: "scale", weight: 2,
    title: "Platform Kimlik Bütünlüğü",
    text: "Instagram'ınızı, LinkedIn'inizi ve web sitenizi aynı anda açın. Üçü de aynı markayı anlatıyor mu?",
    tooltip: "Farklı platformlar arası görsel ve içerik bütünlüğü.",
    options: sc("KS-C02",
      "Her platform sanki farklı bir markaya ait gibi",
      "Benzerlik var ama bütünlük hissedilmiyor",
      "Belirli bir benzerlik var ama sistem bütünlüğü yok",
      "Büyük ölçüde bütünleşik, ince sapmalar var",
      "Tüm platformlar güçlü ve bütünleşik bir kimlik sistemi oluşturuyor"
    )
  },
] as const;

export function getCoreQuestionsByCategory(category: import("../diagnosis-types").CategoryKey): readonly DiagnosisQuestion[] {
  return CORE_QUESTIONS.filter(q => q.category === category);
}
