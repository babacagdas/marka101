// src/app/(studio)/studio/ayarlar/page.tsx
'use client';

export default function AyarlarPage() {
  return (
    <div className="w-full space-y-6 animate-fade-in-up pb-12 px-2 text-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-xl font-black text-gray-800 tracking-tight">Ayarlar</h1>
          <p className="text-xs text-gray-400 mt-1">Ajans profili, API entegrasyon anahtarları ve genel sistem yapılandırması.</p>
        </div>
        <button className="bg-gradient-to-r from-[#4f20c0] to-[#b5179e] text-white font-extrabold text-xs px-4 py-2.5 rounded transition-all shadow-md hover:scale-[1.02]">
          Değişiklikleri Kaydet
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="glass-card rounded-md p-6 space-y-4">
            <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4f20c0]">settings</span>
              <span>Genel Yapılandırma</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="agency-title" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Ajans Başlığı</label>
                <input
                  id="agency-title"
                  type="text"
                  defaultValue="Deep Creative Agency"
                  className="w-full bg-white border border-gray-150 rounded px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#4f20c0]"
                />
              </div>
              <div>
                <label htmlFor="currency-select" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Para Birimi</label>
                <select
                  id="currency-select"
                  className="w-full bg-white border border-gray-150 rounded px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#4f20c0] cursor-pointer"
                >
                  <option>TRY (₺)</option>
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-md p-6 space-y-4">
          <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">Destek & Yardım</h3>
          <p className="text-xs font-bold text-gray-555 leading-relaxed">
            Sistem sürümü: v1.0.4. Herhangi bir hata veya güncelleme talebi durumunda sistem yöneticisiyle iletişime geçebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}
