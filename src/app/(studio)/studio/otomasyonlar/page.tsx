// src/app/(studio)/studio/otomasyonlar/page.tsx
'use client';

export default function OtomasyonlarPage() {
  return (
    <div className="w-full space-y-6 animate-fade-in-up pb-12 px-2 text-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-xl font-black text-gray-800 tracking-tight">Otomasyonlar</h1>
          <p className="text-xs text-gray-400 mt-1">E-posta bildirimleri, otomatik durum geçişleri ve sistem entegrasyon kuralları.</p>
        </div>
        <button className="bg-gradient-to-r from-[#4f20c0] to-[#b5179e] text-white font-extrabold text-xs px-4 py-2.5 rounded transition-all shadow-md hover:scale-[1.02]">
          Yeni Otomasyon Kuralı Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="glass-card rounded-md p-6">
            <h3 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4f20c0]">bolt</span>
              <span>Aktif Kurallar</span>
            </h3>

            <div className="space-y-3">
              {[
                { title: 'Yeni Başvuru Bildirimi', desc: 'Yeni bir Marka101 formu geldiğinde Slack kanalına mesaj gönder.', active: true },
                { title: 'Teklif Hatırlatıcı', desc: 'Teklif gönderilen ve 3 gün yanıt alınamayan müşterilere otomatik e-posta gönder.', active: true },
                { title: 'Proje Kapanış Anketi', desc: 'Proje tamamlandığında müşteriye otomatik NPS memnuniyet anketi ilet.', active: false }
              ].map((oto, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-white/40 border border-white/60 rounded hover:bg-white/80 transition-all text-xs font-bold text-gray-700">
                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className="font-black text-gray-800">{oto.title}</h4>
                    <p className="text-[10px] text-gray-450 mt-0.5 leading-relaxed">{oto.desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-sm text-[9px] font-black border ${oto.active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                      {oto.active ? 'Aktif' : 'Pasif'}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <span className="material-symbols-outlined text-[18px]">settings</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card rounded-md p-6 space-y-4">
          <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">Tetikleme Sayısı</h3>
          <p className="text-xs font-bold text-gray-550 leading-relaxed">
            Bu ay toplam 142 otomasyon kuralı tetiklendi ve manuel iş yükünde yaklaşık 8 saat tasarruf sağlandı.
          </p>
        </div>
      </div>
    </div>
  );
}
