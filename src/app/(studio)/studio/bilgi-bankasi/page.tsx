// src/app/(studio)/studio/bilgi-bankasi/page.tsx
'use client';

import { useState } from 'react';

interface KnowledgeDoc {
  id: string;
  title: string;
  category: 'onboarding' | 'design' | 'guides' | 'contracts';
  updatedAt: string;
  summary: string;
  content: string;
}

export default function BilgiBankasiPage() {
  const [docs] = useState<KnowledgeDoc[]>([
    {
      id: 'doc1',
      title: 'Müşteri Onboarding (Karşılama) Kılavuzu',
      category: 'onboarding',
      updatedAt: '03.01.2026',
      summary: 'Ajans bünyesine yeni katılan markalar için süreç takvimi, iletişim kuralları ve ilk toplanması gereken evraklar listesi.',
      content: 'Yeni müşteri başladığında ilk 3 gün içinde Kick-off toplantısı yapılmalıdır. Marka briefi eksiksiz alınmalı ve Jira üzerinde proje tahtası oluşturulmalıdır.',
    },
    {
      id: 'doc2',
      title: 'Deep Creative Sosyal Medya Tasarım Standartları',
      category: 'design',
      updatedAt: '20.02.2026',
      summary: 'Instagram ve LinkedIn paylaşımları için şablon kuralları, font boyutları, logo güvenli alanları ve renk kontrast limitleri.',
      content: 'Tüm dikey paylaşımlarda Montserrat fontu kullanılmalı, logo sağ üst veya alt merkeze yerleştirilmelidir. Arka plan rengi olarak koyu lacivert veya mor tercih edilmelidir.',
    },
    {
      id: 'doc3',
      title: 'Marka101 Teşhis Algoritması ve Claude Prompting Kılavuzu',
      category: 'guides',
      updatedAt: '12.05.2026',
      summary: 'Markaların form yanıtlarına göre hazırlanan AI analiz raporlarında kullanılan prompt yapısı ve puanlama kriterleri.',
      content: 'Claude API çağrılarında marka ses tonuna göre analiz yapılmalıdır. 0-10 arası verilen puanlar mutlaka benchmark tablosundaki verilere dayandırılmalıdır.',
    },
    {
      id: 'doc4',
      title: 'Fikir ve Sanat Eserleri Kanunu Uyumlu Tasarım Sözleşmesi',
      category: 'contracts',
      updatedAt: '05.03.2026',
      summary: 'Kreatif tasarımlar, logo lisansları ve marka tescilleri için standart hukuki sözleşme taslakları.',
      content: 'Üretilen tüm kreatif taslakların telif hakları sözleşmede aksi belirtilmedikçe ödeme tamamlandıktan sonra müşteriye devredilir.',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string>('doc1');

  const filteredDocs = docs.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeDoc = docs.find((d) => d.id === selectedDocId) ?? docs[0];

  const categoryLabels = {
    onboarding: 'Onboarding Kılavuzu',
    design: 'Tasarım Standartları',
    guides: 'Yöntem & Rehber',
    contracts: 'Sözleşme Taslağı',
  };

  return (
    <div className="w-full space-y-6 animate-fade-in-up pb-12 text-gray-700 px-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-xl font-black text-gray-800 tracking-tight">Bilgi Bankası (Knowledge Base)</h1>
          <p className="text-xs text-gray-400 mt-1">
            Ajans içi standartlar, tasarım yönergeleri, şablon sözleşmeler ve teknik dökümanlar.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="glass-card rounded-md p-4 flex items-center justify-between no-print">
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Kılavuz, şablon veya döküman ara..."
            className="w-full bg-white border border-gray-200 text-gray-700 rounded px-10 py-3 text-xs font-semibold focus:outline-none placeholder-gray-400"
          />
          <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-gray-400">search</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List of Docs */}
        <div className="lg:col-span-1 space-y-4">
          {filteredDocs.map((doc) => {
            const isActive = doc.id === selectedDocId;
            return (
              <div
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`p-4 rounded-md border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-purple-50/50 border-[#4f20c0] shadow-[0_8px_20px_rgba(79,32,192,0.08)]'
                    : 'glass-card glass-card-hover'
                }`}
              >
                <span className="text-[8px] font-bold text-gray-455 uppercase tracking-wider block">
                  {categoryLabels[doc.category]}
                </span>
                <h3 className="font-black text-gray-800 text-xs mt-1 leading-snug">{doc.title}</h3>
                <p className="text-[10px] text-gray-400 mt-2 line-clamp-2 leading-relaxed font-semibold">
                  {doc.summary}
                </p>
              </div>
            );
          })}
          {filteredDocs.length === 0 && (
            <p className="text-center py-12 text-xs text-gray-450 font-bold bg-white/20 border border-dashed border-gray-200 rounded">
              Aranan kriterlere uygun döküman bulunamadı.
            </p>
          )}
        </div>

        {/* Right Reader Panel */}
        <div className="lg:col-span-2 space-y-4">
          {activeDoc ? (
            <div className="glass-card rounded-md p-6 md:p-8 space-y-6">
              <div>
                <span className="text-[8px] font-bold text-[#4f20c0] border border-purple-100/30 bg-purple-50 px-2 py-0.5 rounded-sm uppercase tracking-widest">
                  {categoryLabels[activeDoc.category]}
                </span>
                <h2 className="text-base font-black text-gray-800 mt-3 leading-snug">{activeDoc.title}</h2>
                <p className="text-[10px] text-gray-400 mt-1.5 font-bold uppercase tracking-wider">
                  Son Güncelleme: {activeDoc.updatedAt} • Elena Creative
                </p>
              </div>

              <div className="space-y-4 pt-2 border-t border-gray-100">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Özet</span>
                  <p className="text-xs text-gray-655 font-semibold leading-relaxed bg-white/40 p-4 rounded border border-gray-100">
                    {activeDoc.summary}
                  </p>
                </div>

                <div className="space-y-1 pt-2">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Döküman İçeriği</span>
                  <p className="text-xs text-gray-700 font-semibold bg-white border border-gray-150 rounded px-4 py-4 leading-relaxed whitespace-pre-wrap">
                    {activeDoc.content}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 no-print">
                <button className="px-4 py-2 border border-gray-200 bg-white text-gray-500 hover:text-gray-800 font-bold rounded text-xs transition-all">
                  Şablon Dokümanı İndir
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white/20 border border-dashed border-gray-200 rounded p-8 text-center text-gray-400 font-bold text-xs">
              Bilgi bankası içeriğini okumak için bir liste öğesi seçin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
