// src/app/(studio)/studio/briefler/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface DocumentItem {
  id: string;
  title: string;
  category: 'contract' | 'brand_guide' | 'brief' | 'meeting_notes' | 'other';
  file_url?: string;
  created_at: string;
}

export default function BrieflerPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'all' | DocumentItem['category']>('all');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .order('created_at', { ascending: false });
        if (data) {
          setDocuments(data);
          if (data.length > 0) {
            setSelectedDocId(data[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching documents:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDocuments();
  }, []);

  const categoryConfig = {
    all: { label: 'Tüm Belgeler' },
    contract: { label: 'Sözleşmeler' },
    brand_guide: { label: 'Marka Kılavuzları' },
    brief: { label: 'Briefler' },
    meeting_notes: { label: 'Toplantı Notları' },
    other: { label: 'Diğer' },
  } as const;

  const filteredDocs = documents.filter(
    (d) => activeCategory === 'all' || d.category === activeCategory
  );

  const activeDoc = documents.find((d) => d.id === selectedDocId) ?? null;

  return (
    <div className="w-full space-y-6 animate-fade-in-up pb-12 text-gray-700 px-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-xl font-black text-gray-800 tracking-tight">Doküman & Brief Merkezi</h1>
          <p className="text-xs text-gray-400 mt-1">
            Müşterilerinizden gelen brief istek formları, sözleşmeler ve marka kılavuzları arşivi.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card rounded-md p-2 flex flex-wrap gap-2 justify-start no-print">
        {(Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>).map((key) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`px-4 py-2 rounded text-xs font-bold transition-all border ${
              activeCategory === key
                ? 'bg-gradient-to-r from-[#4f20c0] to-[#b5179e] text-white border-transparent shadow-sm'
                : 'bg-white/40 border-white/60 text-gray-500 hover:text-gray-800'
            }`}
          >
            {categoryConfig[key].label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Briefs List */}
        <div className="lg:col-span-1 space-y-4">
          {isLoading ? (
            <div className="p-8 text-xs font-bold text-gray-400 text-center animate-pulse">
              Dokümanlar yükleniyor...
            </div>
          ) : filteredDocs.length === 0 ? (
            <p className="text-center py-12 text-xs text-gray-400 font-bold bg-white/20 border border-dashed border-gray-200 rounded-md">
              Bu kategoride doküman bulunmamaktadır.
            </p>
          ) : (
            filteredDocs.map((doc) => {
              const isActive = doc.id === selectedDocId;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`p-4 rounded-md border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white border-[#4f20c0] shadow-md shadow-purple-500/5'
                      : 'bg-white/40 border-white/60 hover:bg-white/80'
                  }`}
                >
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">
                    {categoryConfig[doc.category]?.label ?? doc.category}
                  </span>
                  <h3 className="font-extrabold text-gray-850 text-xs mt-1 truncate">{doc.title}</h3>
                  <span className="text-[8px] text-gray-400 block mt-2 text-right">
                    Eklenme: {new Date(doc.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Brief Viewer Panel */}
        <div className="lg:col-span-2 space-y-4">
          {activeDoc ? (
            <div className="glass-card rounded-md p-6 md:p-8 space-y-6">
              <div>
                <span className="text-[8px] font-extrabold text-[#4f20c0] border border-[#4f20c0]/20 bg-[#4f20c0]/5 px-2 py-0.5 rounded-sm uppercase tracking-widest">
                  {categoryConfig[activeDoc.category]?.label ?? activeDoc.category}
                </span>
                <h2 className="text-lg font-black text-gray-800 mt-3 leading-snug">{activeDoc.title}</h2>
              </div>

              {activeDoc.file_url && (
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                    Dosya Bağlantısı
                  </span>
                  <a
                    href={activeDoc.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#4f20c0] font-black bg-white/60 hover:bg-white border border-white/80 rounded px-4 py-3 leading-relaxed block truncate"
                  >
                    {activeDoc.file_url}
                  </a>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 no-print">
                <button className="px-4 py-2 border border-white/60 bg-white/40 hover:bg-white/80 text-gray-500 hover:text-gray-800 font-bold rounded text-xs transition-all">
                  Şablonu İndir
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-[#4f20c0] to-[#b5179e] text-white font-bold rounded text-xs hover:scale-[1.02] transition-all shadow-md">
                  Yazdır / Paylaş
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white/20 border border-dashed border-gray-200 rounded-md p-8 text-center text-gray-400 font-bold text-xs">
              Detayları görüntülemek için bir doküman seçin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
