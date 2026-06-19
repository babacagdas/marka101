// src/features/diagnoses/data/sectorModules.ts
import type { SectorModule, SectorKey } from "../diagnosis-types";

function sc(id: string, label1: string, label2: string, label3: string, label4: string, label5: string) {
  return [
    { value: 1, label: label1 },
    { value: 2, label: label2 },
    { value: 3, label: label3 },
    { value: 4, label: label4 },
    { value: 5, label: label5 },
  ] as const;
}

const B2B_MODULE: SectorModule = {
  sector: "b2b_industrial",
  label:  "Üretim / Sanayi / İhracat",
  contextComment:
    "B2B ve sanayi markalarında güven mimarisi birincil satış aracıdır. " +
    "Görsel kimlik ikincil kalabilir; ancak kurumsal iletişim, referans " +
    "zinciri ve teknik yetkinliğin dijitalde görünürlüğü doğrudan satış " +
    "dönüşümünü etkiler.",
  criticalIndicators: [
    "Kurumsal iletişim dili",
    "Referans görünürlüğü",
    "Teknik yetkinlik kanıtı",
  ],
  questions: [
    {
      id: "SM-B01", layer: "sector", type: "scale", weight: 3,
      title: "Kurumsal İletişim Dili",
      text: "Hedef pazar dilinde profesyonel iletişim materyaliniz var mı?",
      tooltip: "Katalog, web sitesi ve sunumların pazar diline uygunluğu.",
      options: sc("SM-B01",
        "Hayır, yok",
        "Var ama yetersiz ya da eski tercüme",
        "Temel düzeyde var",
        "Güncel ve profesyonel",
        "Güncel, doğru tonlamalı ve iş geliştirmeye hazır"
      ),
    },
    {
      id: "SM-B02", layer: "sector", type: "scale", weight: 3,
      title: "Referans Görünürlüğü",
      text: "Çalıştığınız müşterileri dijitalde görünür biçimde paylaşıyor musunuz?",
      tooltip: "Müşteri logolarının ve tamamlanan işlerin görünürlük derecesi.",
      options: sc("SM-B02",
        "Hayır, dijitalde referans görünürlüğümüz yok",
        "Kısmen, sistematik değil",
        "Bazıları var",
        "Görünür ve erişilebilir",
        "Referans listesi veya logolar sistematik biçimde kullanılıyor"
      ),
    },
    {
      id: "SM-B03", layer: "sector", type: "scale", weight: 2,
      title: "Teknik Yetkinlik Kanıtı",
      text: "Tesis, ekipman veya üretim kapasitenizi gösteren görsel ve video içeriğiniz ne kadar güçlü?",
      tooltip: "Fabrika, üretim hattı veya mühendislik gücünün dijitaldeki görsel sunumu.",
      options: sc("SM-B03",
        "Hiç yok",
        "Yetersiz, amatör çekim",
        "Var ama etkileyici değil",
        "Güçlü ve güven veriyor",
        "Sektörde referans kalitesinde"
      ),
    },
  ],
};

const REALESTATE_MODULE: SectorModule = {
  sector: "realestate",
  label:  "Gayrimenkul / Mimari / İç Mimari",
  contextComment:
    "Gayrimenkul ve mimari markalarında portföy sunumu birincil " +
    "satış aracıdır. Projenin gerçek kalitesi ne olursa olsun, " +
    "dijitaldeki temsil kalitesi müşterinin ilk kararını belirler.",
  criticalIndicators: [
    "Portföy kalitesi",
    "Proje hikâyesi anlatımı",
    "Görsel üretim standardı",
  ],
  questions: [
    {
      id: "SM-R01", layer: "sector", type: "scale", weight: 3,
      title: "Portföy Kalitesi",
      text: "Portföyünüz tamamlanan projelerin gerçek kalitesini yansıtıyor mu?",
      tooltip: "Projelerin sunumu ve bitiş detaylarının dijitaldeki temsil kalitesi.",
      options: sc("SM-R01",
        "Çok geride kalıyor",
        "Yeterli değil",
        "Kısmen yansıtıyor",
        "Güçlü biçimde yansıtıyor",
        "Sektörde referans kalitesinde sunum"
      ),
    },
    {
      id: "SM-R02", layer: "sector", type: "scale", weight: 3,
      title: "Proje Hikayesi",
      text: 'Her projeyi "problem → süreç → sonuç" formatında anlatıyor musunuz?',
      tooltip: "Proje sayfalarının teknik ve hikayesel derinliği.",
      options: sc("SM-R02",
        "Hayır, sadece fotoğraf paylaşıyoruz",
        "Bazen, sistematik değil",
        "Kısmen, bazı projeler için",
        "Çoğu proje için yapıyoruz",
        "Evet, tüm projeler için düzenli ve sistematik biçimde"
      ),
    },
    {
      id: "SM-R03", layer: "sector", type: "scale", weight: 2,
      title: "Görsel Üretim Standardı",
      text: "Son 6 ayda profesyonel fotoğraf veya video çekimi yapıldı mı?",
      tooltip: "Güncel işlerin görsel sunum standartları.",
      options: sc("SM-R03",
        "Hayır, profesyonel çekim yok",
        "Kısmen, bazı projeler için",
        "Evet, ama tek seferlik",
        "Düzenli olarak yapıyoruz",
        "Evet, profesyonel ekiple sistematik biçimde"
      ),
    },
  ],
};

const HEALTH_MODULE: SectorModule = {
  sector: "health",
  label:  "Sağlık / Güzellik / Klinik",
  contextComment:
    "Sağlık ve estetik markalarında güven, tercih edilmenin birincil " +
    "sebebidir. Hizmet kalitesi ne kadar yüksek olursa olsun, dijital " +
    "güven sistemi bunu taşıyamazsa karar fiyata devrilir.",
  criticalIndicators: [
    "Uzmanlık görünürlüğü",
    "Müşteri kanıt sistemi",
    "Randevu / iletişim akıcılığı",
  ],
  questions: [
    {
      id: "SM-H01", layer: "sector", type: "scale", weight: 3,
      title: "Uzmanlık Görünürlüğü",
      text: "Ekibinizin nitelikleri veya uzmanlığı dijitalde görünür ve güven verici biçimde sunuluyor mu?",
      tooltip: "Hekim veya estetiysenlerin sertifika, diploma ve deneyimlerinin sunumu.",
      options: sc("SM-H01",
        "Hayır, uzmanlık dijitalde hiç görüniyor",
        "Kısmen var ama yetersiz",
        "Temel bilgiler var",
        "Güçlü biçimde sunuluyor",
        "Sertifika, yayın, medya görünürlüğü ile kapsamlı sunuluyor"
      ),
    },
    {
      id: "SM-H02", layer: "sector", type: "scale", weight: 3,
      title: "Müşteri Kanıtı",
      text: "Görünür ve aktif yönetilen müşteri yorumları veya referansları var mı?",
      tooltip: "Sosyal mecralarda ve web sitenizdeki hasta/müşteri deneyimleri.",
      options: sc("SM-H02",
        "Yok ya da neredeyse yok",
        "Var ama sistematik değil",
        "Makul sayıda var",
        "Güncel ve yönetiliyor",
        "Düzenli, yanıtlanan ve sürekli güncellenen bir kanıt sistemi var"
      ),
    },
    {
      id: "SM-H03", layer: "sector", type: "scale", weight: 2,
      title: "Randevu ve İletişim Akıcılığı",
      text: "Dijital kanallardan randevu veya iletişim süreci ne kadar kolay ve güven verici?",
      tooltip: "Ziyaretçilerin randevu formları veya WhatsApp üzerinden iletişim hızı ve akıcılığı.",
      options: sc("SM-H03",
        "Çok zor ya da belirsiz",
        "Yeterli değil",
        "Yeterli ama optimize değil",
        "Akıcı ve güven veriyor",
        "Çok akıcı, endişe giderici düzeyde"
      ),
    },
  ],
};

const GENERAL_MODULE: SectorModule = {
  sector: "general",
  label:  "Genel Hizmet Sektörü",
  contextComment:
    "Hizmet sektöründe farklılaşma netliği ve dijital güven sistemi " +
    "birbirini tamamlayan iki kritik faktördür. Rakipten özgün biçimde " +
    "ayrışmak ve bu ayrışmayı dijitalde kanıtlamak, fiyat " +
    "savunulabilirliğinin temelini oluşturur.",
  criticalIndicators: [
    "Farklılaşma netliği",
    "Dijital sosyal kanıt",
    "Süreç güveni",
  ],
  questions: [
    {
      id: "SM-G01", layer: "sector", type: "scale", weight: 3,
      title: "Hizmet Farklılaşması",
      text: "Rakiplerinizden farklı olduğunuzu müşterilere ne kadar net anlatabiliyorsunuz?",
      tooltip: "Konumlandırmanızın müşteriye sunduğunuz özgün değer vaadi.",
      options: sc("SM-G01",
        "Net bir fark anlatamıyoruz",
        "Genel bir cevabımız var",
        "Tutarlı ama güçlü ve özgün değil",
        "Güçlü ve anlaşılır bir fark var",
        "Test edilmiş, satışa bağlı bir farklılaşma argümanımız var"
      ),
    },
    {
      id: "SM-G02", layer: "sector", type: "scale", weight: 3,
      title: "Dijital Sosyal Kanıt",
      text: "Müşteri referansları, vaka çalışmaları veya sonuç örnekleri dijitalde görünür mü?",
      tooltip: "Web sitesinde veya sosyal medyada vaka çalışmaları ve referansların güncelliği.",
      options: sc("SM-G02",
        "Hayır, yok",
        "Var ama görünür değil ya da zayıf",
        "Birkaç tane var",
        "Görünür ve güçlü",
        "Erişilebilir, güncel ve aktif kullanılıyor"
      ),
    },
    {
      id: "SM-G03", layer: "sector", type: "scale", weight: 2,
      title: "Süreç Güveni",
      text: "Müşteriler çalışma sürecinizin nasıl işlediğini önceden anlayabiliyor mu?",
      tooltip: "Hizmet teslim ve proje adımlarının şeffaflığı.",
      options: sc("SM-G03",
        "Süreç tamamen belirsiz",
        "Genel bilgi var ama yeterli değil",
        "Kısmen anlatılıyor",
        "Net ve güven veriyor",
        "Çok net, endişe giderici düzeyde"
      ),
    },
  ],
};

export const SECTOR_MODULES: Readonly<Record<SectorKey, SectorModule>> = {
  health:         HEALTH_MODULE,
  realestate:     REALESTATE_MODULE,
  b2b_industrial: B2B_MODULE,
  general:        GENERAL_MODULE,
};
