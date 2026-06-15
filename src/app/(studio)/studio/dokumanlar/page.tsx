// src/app/(studio)/studio/dokumanlar/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAgency } from '@/features/diagnoses/components/studio/AgencyContext';

interface DocumentRecord {
  id: string;
  title: string;
  file_url: string;
  category: 'contract' | 'brand_guide' | 'brief' | 'meeting_notes' | 'other';
  created_at: string;
}

export default function DokumanlarPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'contract' | 'brand_guide' | 'brief' | 'meeting_notes' | 'other'>('other');
  const [fileUrl, setFileUrl] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { clients, projects } = useAgency();

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          setDocuments(data);
        } else {
          // Seed initial documents if table is empty
          const seedDocs = [
            { title: 'Hizmet Sözleşmesi Şablonu', file_url: '#', category: 'contract' },
            { title: 'Natura Kozmetik Marka Kılavuzu', file_url: '#', category: 'brand_guide' },
            { title: 'Vera Mimarlık Toplantı Notları', file_url: '#', category: 'meeting_notes' },
            { title: 'Sosyal Medya Kreatif Brief', file_url: '#', category: 'brief' }
          ];
          const { data: inserted } = await supabase.from('documents').insert(seedDocs).select();
          if (inserted) {
            setDocuments(inserted);
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

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('documents')
        .insert({
          title: title.trim(),
          category: category,
          file_url: fileUrl.trim() || '/documents/mock_doc.pdf',
          client_id: selectedClientId || null,
          project_id: selectedProjectId || null,
        })
        .select()
        .single();

      if (data) {
        setDocuments((prev) => [data, ...prev]);
        setShowModal(false);
        // Reset form
        setTitle('');
        setCategory('other');
        setFileUrl('');
        setSelectedClientId('');
        setSelectedProjectId('');
      }
    } catch (err) {
      console.error('Error creating document:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryCount = (cat: string) => {
    return documents.filter((d) => d.category === cat).length;
  };

  const folderDetails = [
    { title: 'Hizmet Sözleşmeleri', cat: 'contract', color: 'bg-indigo-50 text-indigo-600' },
    { title: 'Marka Rehberleri', cat: 'brand_guide', color: 'bg-pink-50 text-pink-600' },
    { title: 'Toplantı Notları', cat: 'meeting_notes', color: 'bg-cyan-50 text-cyan-600' },
    { title: 'Kreatif Briefler', cat: 'brief', color: 'bg-emerald-50 text-emerald-600' },
    { title: 'Diğer Dokümanlar', cat: 'other', color: 'bg-amber-50 text-amber-600' }
  ];

  return (
    <div className="w-full space-y-6 animate-fade-in-up pb-12 px-2 text-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-xl font-black text-gray-800 tracking-tight">Dokümanlar</h1>
          <p className="text-xs text-gray-400 mt-1">Sözleşmeler, marka vizyon belgeleri ve ajans ortak paylaşımlı doküman arşivi.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-[#4f20c0] to-[#b5179e] text-white font-extrabold text-xs px-4 py-2.5 rounded-md transition-all shadow-md hover:scale-[1.02]"
        >
          Yeni Doküman Yükle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="glass-card rounded-md p-6">
            <h3 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4f20c0]">folder</span>
              <span>Doküman Arşivi</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {folderDetails.map((fld, idx) => (
                <div key={idx} className="p-4 bg-white/40 border border-white/60 hover:bg-white/80 transition-all rounded-md flex items-center gap-3 text-xs font-bold text-gray-700">
                  <div className={`w-10 h-10 rounded ${fld.color} flex items-center justify-center`}>
                    <span className="material-symbols-outlined text-[20px]">folder_open</span>
                  </div>
                  <div>
                    <h4 className="font-black text-gray-800 leading-tight">{fld.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">{getCategoryCount(fld.cat)} Dosya</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card rounded-md p-6 space-y-4">
          <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">Son Düzenlenenler</h3>
          <div className="space-y-2 text-xs font-bold text-gray-650">
            {isLoading ? (
              <p className="text-gray-400 animate-pulse">Yükleniyor...</p>
            ) : documents.length === 0 ? (
              <p className="text-gray-400">Dosya bulunmuyor.</p>
            ) : (
              documents.slice(0, 5).map((doc) => (
                <div key={doc.id} className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0">
                  <span className="truncate max-w-[170px]" title={doc.title}>• {doc.title}</span>
                  <span className="text-[8px] bg-purple-50 text-[#4f20c0] px-1.5 py-0.5 rounded-sm capitalize">{doc.category}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Document Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-150 rounded-md p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 text-gray-700 animate-scale-up">
            <div>
              <h3 className="text-base font-black text-gray-800">Yeni Doküman Kaydet</h3>
              <p className="text-[10px] text-gray-400 mt-1">Sözleşme, brief veya rehber gibi yeni bir dosya kartı tanımlayın.</p>
            </div>
            
            <form onSubmit={handleCreateDocument} className="space-y-4 text-xs font-bold">
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Doküman Adı *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Natura Tasarım Yol Haritası"
                  className="w-full bg-white border border-gray-200 rounded px-3.5 py-2.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#4f20c0] transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-white border border-gray-200 rounded px-3 py-2.5 text-xs text-gray-755 focus:outline-none cursor-pointer focus:border-[#4f20c0] transition-all"
                  >
                    <option value="contract">Hizmet Sözleşmesi</option>
                    <option value="brand_guide">Marka Rehberi</option>
                    <option value="meeting_notes">Toplantı Notları</option>
                    <option value="brief">Kreatif Brief</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Dosya URL (Link)</label>
                  <input
                    type="text"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full bg-white border border-gray-200 rounded px-3.5 py-2.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#4f20c0] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">İlgili Müşteri</label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded px-3 py-2.5 text-xs text-gray-755 focus:outline-none cursor-pointer focus:border-[#4f20c0] transition-all"
                  >
                    <option value="">Seçiniz</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">İlgili Proje</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded px-3 py-2.5 text-xs text-gray-755 focus:outline-none cursor-pointer focus:border-[#4f20c0] transition-all"
                  >
                    <option value="">Seçiniz</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-500 py-3 rounded transition-all"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 bg-gradient-to-r from-[#4f20c0] to-[#b5179e] hover:scale-[1.02] text-white py-3 rounded font-extrabold shadow-lg shadow-purple-500/10 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Kaydediliyor...' : 'Dosyayı Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
