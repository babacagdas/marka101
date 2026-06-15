// src/app/(studio)/studio/yetkilendirme/page.tsx
'use client';

export default function YetkilendirmePage() {
  return (
    <div className="w-full space-y-6 animate-fade-in-up pb-12 px-2 text-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-xl font-black text-gray-800 tracking-tight">Yetkilendirme</h1>
          <p className="text-xs text-gray-400 mt-1">Sistem yetki rolleri, kullanıcı grupları ve modül erişim izinleri yönetimi.</p>
        </div>
        <button className="bg-gradient-to-r from-[#4f20c0] to-[#b5179e] text-white font-extrabold text-xs px-4 py-2.5 rounded transition-all shadow-md hover:scale-[1.02]">
          Yeni Rol Oluştur
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="glass-card rounded-md p-6">
            <h3 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4f20c0]">admin_panel_settings</span>
              <span>Kullanıcı İzin Matrisi</span>
            </h3>

            <div className="space-y-3">
              {[
                { role: 'Administrator', users: 'Elena Creative', desc: 'Tüm modüllere tam erişim ve veri yazma/silme yetkisi.' },
                { role: 'Editor / Designer', users: 'Melis Şen', desc: 'Projeler, görevler ve brief merkezi düzenleme yetkisi.' },
                { role: 'Client Access', users: 'Selin Yılmaz, Can Değer', desc: 'Sadece kendi markalarının rapor ve sözleşmelerini görüntüleme yetkisi.' }
              ].map((matrix, idx) => (
                <div key={idx} className="p-4 bg-white/40 border border-white/60 rounded hover:bg-white/80 transition-all text-xs font-bold text-gray-700">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-black text-gray-850 text-sm">{matrix.role}</h4>
                    <span className="text-[10px] text-gray-400 font-semibold">{matrix.users}</span>
                  </div>
                  <p className="text-[10px] text-gray-455 leading-relaxed font-semibold mt-1">{matrix.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card rounded-md p-6 space-y-4">
          <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">Güvenlik Politikası</h3>
          <p className="text-xs font-bold text-gray-555 leading-relaxed">
            Erişim logları ve kullanıcı yetki değişiklikleri 90 gün boyunca veritabanında geriye dönük olarak saklanır.
          </p>
        </div>
      </div>
    </div>
  );
}
