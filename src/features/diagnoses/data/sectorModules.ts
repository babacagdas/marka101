// src/features/diagnoses/data/sectorModules.ts
import type { SectorModule, SectorKey } from "../diagnosis-types";

function ev(evet: string, kipsmen: string, hayir: string) {
  return [
    { value: "evet",   label: evet },
    { value: "kısmen", label: kipsmen },
    { value: "hayır",  label: hayir },
  ] as const;
}

function sc(l1: string, l2: string, l3: string, l4: string, l5: string) {
  return [
    { value: 1, label: l1 }, { value: 2, label: l2 }, { value: 3, label: l3 },
    { value: 4, label: l4 }, { value: 5, label: l5 },
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
      id: "SM-B01", layer: "sector", type: "evidence", weight: 3,
      title: "Kurumsal İletişim Dili",
      text: "İngilizce veya hedef pazar dilinde profesyonel iletişim materyaliniz — web, katalog, sunum — var mı?",
      tooltip: "Sadece \"İngilizce var\" değil; güncel, doğru tonlamalı ve iş geliştirmeye hazır materyaller.",
      options: ev("Evet; güncel, profesyonel ve doğru dilde","Var ama yetersiz ya da eski tercüme","Hayır; yok"),
    },
    {
      id: "SM-B02", layer: "sector", type: "evidence", weight: 3,
      title: "Referans Görünürlüğü",
      text: "Çalıştığınız müşteri veya projeleri dijitalde — web, LinkedIn vb. — görünür biçimde paylaşıyor musunuz?",
      tooltip: "Referans listesi veya logo duvarı bile güçlü bir güven sinyalidir.",
      options: ev("Evet; referans listesi veya logolar görünür","Kısmen; bazıları var, sistematik değil","Hayır; dijitalde referans görünürlüğümüz yok"),
    },
    {
      id: "SM-B03", layer: "sector", type: "scale", weight: 2,
      title: "Teknik Yetkinlik Kanıtı",
      text: "Tesis, ekipman veya üretim kapasitenizi gösteren görsel / video içeriğiniz ne kadar güçlü?",
      tooltip: "Potansiyel bir uluslararası alıcı bu içerikleri görünce kapasitenize güvenir mi?",
      options: sc("Hiç yok","Yetersiz, amatör çekim","Var ama etkileyici değil","Güçlü ve güven veriyor","Sektörde referans kalitesinde"),
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
      text: "Portföyünüz — web, sosyal medya — tamamlanan projelerin gerçek kalitesini yansıtıyor mu?",
      tooltip: "Projenin kendi kalitesi değil, sunumun kalitesi sorgulanıyor.",
      options: sc("Çok geride kalıyor","Yeterli değil","Kısmen yansıtıyor","Güçlü biçimde yansıtıyor","Sektörde referans kalitesinde sunum"),
    },
    {
      id: "SM-R02", layer: "sector", type: "evidence", weight: 3,
      title: "Proje Hikâyesi",
      text: 'Her projeyi "problem → süreç → sonuç" formatında bir hikâye olarak anlatıyor musunuz?',
      tooltip: "Sadece fotoğraf değil; neden yapıldı, nasıl yapıldı, ne elde edildi anlatımı.",
      options: ev("Evet; düzenli ve sistematik biçimde","Bazen; sistematik değil","Hayır; sadece fotoğraf paylaşıyoruz"),
    },
    {
      id: "SM-R03", layer: "sector", type: "evidence", weight: 2,
      title: "Görsel Üretim Standardı",
      text: "Son 6 ayda profesyonel fotoğraf veya video çekimi gerçekleşti mi?",
      tooltip: "Kurgulanmış ve markayla uyumlu içerik gerekiyor.",
      options: ev("Evet; profesyonel ekiple yapıldı","Kısmen; bazı projeler için","Hayır; profesyonel çekim yok"),
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
      id: "SM-H01", layer: "sector", type: "evidence", weight: 3,
      title: "Uzmanlık Görünürlüğü",
      text: "Ekibinizin nitelikleri veya uzmanlığı dijitalde görünür ve güven verici biçimde sunuluyor mu?",
      tooltip: "Sertifikalar, diploma, yayınlar, medya görünürlüğü veya eğitim geçmişi gibi unsurlar.",
      options: ev("Evet; profil, sertifika ve içerik açıkça görünür","Kısmen; bazı bilgiler var ama yetersiz","Hayır; uzmanlık dijitalde görünmüyor"),
    },
    {
      id: "SM-H02", layer: "sector", type: "evidence", weight: 3,
      title: "Müşteri Kanıtı",
      text: "Google, sosyal medya veya web sitenizde görünür ve aktif yönetilen müşteri yorumları / referansları var mı?",
      tooltip: "Var olması yetmez; düzenli, güncel ve yanıtlanan yorumlar çok daha güçlü sinyal üretir.",
      options: ev("Evet; düzenli, güncel ve yönetiliyor","Var ama sistematik değil","Yok ya da neredeyse yok"),
    },
    {
      id: "SM-H03", layer: "sector", type: "scale", weight: 2,
      title: "Randevu / İletişim Akıcılığı",
      text: "Dijital kanallardan randevu veya iletişim süreci ne kadar kolay ve güven verici?",
      tooltip: "Bir potansiyel müşteri sitenize girince randevu almak için ne kadar süre harcaması gerekiyor?",
      options: sc("Çok zor ya da belirsiz","Yeterli değil","Yeterli ama optimize değil","Akıcı ve güven veriyor","Çok akıcı, endişe giderici düzeyde"),
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
      text: "Rakiplerinizden farklı olduğunuzu müşterilere ne kadar net ve ikna edici biçimde anlatabiliyorsunuz?",
      tooltip: "Rakibiniz de aynı şeyi söylüyor mu? Söylüyorsa gerçek farklılaşma henüz kurulmamış.",
      options: sc("Net bir fark anlatamıyoruz","Genel bir cevabımız var","Tutarlı ama güçlü ve özgün değil","Güçlü ve anlaşılır bir fark var","Test edilmiş, satışa bağlı bir farklılaşma argümanımız var"),
    },
    {
      id: "SM-G02", layer: "sector", type: "evidence", weight: 3,
      title: "Dijital Sosyal Kanıt",
      text: "Müşteri referansları, vaka çalışmaları veya sonuç örnekleri dijitalde görünür mü?",
      tooltip: '"İyi iş yapıyoruz" iddiasını dijitalde somut olarak gösterebiliyor musunuz?',
      options: ev("Evet; erişilebilir, güncel ve güçlü","Var ama görünür değil ya da zayıf","Hayır; yok"),
    },
    {
      id: "SM-G03", layer: "sector", type: "scale", weight: 2,
      title: "Süreç Güveni",
      text: "Müşteriler çalışma sürecinizin nasıl işlediğini önceden anlayabiliyor mu?",
      tooltip: "Süreç netliği belirsizlik kaygısını azaltır; bu da satış döngüsünü kısaltır.",
      options: sc("Süreç tamamen belirsiz","Genel bilgi var ama yeterli değil","Kısmen anlatılıyor","Net ve güven veriyor","Çok net, endişe giderici düzeyde"),
    },
  ],
};

export const SECTOR_MODULES: Readonly<Record<SectorKey, SectorModule>> = {
  health:         HEALTH_MODULE,
  realestate:     REALESTATE_MODULE,
  b2b_industrial: B2B_MODULE,
  general:        GENERAL_MODULE,
};
