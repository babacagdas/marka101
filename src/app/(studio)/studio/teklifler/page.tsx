// src/app/(studio)/studio/teklifler/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAgency } from '@/features/diagnoses/components/studio/AgencyContext';
import { createProposal, ProposalLineItem } from '@/features/diagnoses/lib/proposal-actions';

interface Proposal {
  id: string;
  title: string;
  description?: string;
  value: number;
  status: 'draft' | 'sent' | 'accepted' | 'declined';
  created_at: string;
}

export default function TekliflerPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [diagnoses, setDiagnoses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState(''); // Maps to potentials or diagnoses
  const [status, setStatus] = useState<'draft' | 'sent' | 'accepted' | 'declined'>('draft');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Structured Line Items
  const [items, setItems] = useState<ProposalLineItem[]>([
    { title: '', description: '', price: 0 }
  ]);

  // Copied indicator state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { leads, clients } = useAgency();

  // Load proposals and diagnoses
  useEffect(() => {
    async function initData() {
      try {
        const supabase = createClient();
        
        // Fetch proposals
        const { data: propData } = await supabase
          .from('proposals')
          .select('*')
          .order('created_at', { ascending: false });
        if (propData) setProposals(propData);

        // Fetch diagnoses to match scores
        const { data: diagData } = await supabase
          .from('diagnoses')
          .select('*');
        if (diagData) setDiagnoses(diagData);

      } catch (err) {
        console.error('Error fetching proposals:', err);
      } finally {
        setIsLoading(false);
      }
    }
    initData();
  }, []);

  const totalValue = items.reduce((sum, item) => sum + Number(item.price || 0), 0);

  const handleAddItem = () => {
    setItems([...items, { title: '', description: '', price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleUpdateItem = (index: number, field: keyof ProposalLineItem, value: any) => {
    setItems(
      items.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  // AI Recommendation Engine based on brand health scores
  const getAiRecommendations = () => {
    if (!selectedLeadId) return [];
    
    // Find the associated diagnosis
    const diag = diagnoses.find(d => d.id === selectedLeadId || d.brand_name === selectedLeadId);
    if (!diag) return [];

    const recommendations: ProposalLineItem[] = [];

    // Analyze scores and add recommendations
    if (diag.premium_potential_score !== null && diag.premium_potential_score < 6.0) {
      recommendations.push({
        title: 'Premium Görsel Algı ve Kimlik Tasarımı',
        description: `Marka Teşhisi'nde Premium Algı skoru düşük çıkmıştır (${diag.premium_potential_score.toFixed(1)}/10). Tipografi, renk paletleri ve kurumsal görsel dilin premium lige taşınması.`,
        price: 65000
      });
    }

    if (diag.creative_potential_score !== null && diag.creative_potential_score < 6.0) {
      recommendations.push({
        title: 'Kreatif Sosyal Medya ve İçerik Üretim Sistemi',
        description: `Kreatif Potansiyel skoru düşük çıkmıştır (${diag.creative_potential_score.toFixed(1)}/10). Tüm sosyal kanalların kurumsal standartta ölçeklenmesi için tasarım şablon kütüphanesi (Brand Kit) kurulumu.`,
        price: 40000
      });
    }

    if (diag.sales_readiness_score !== null && diag.sales_readiness_score < 6.0) {
      recommendations.push({
        title: 'Dönüşüm Odaklı Web Sitesi (UX & Tasarım) Revizyonu',
        description: `Satışa Hazırlık skoru düşük çıkmıştır (${diag.sales_readiness_score.toFixed(1)}/10). Web sitesi kullanıcı deneyiminin (UX) pürüzsüzleştirilmesi ve eylem çağrılarının (CTA) optimizasyonu.`,
        price: 55000
      });
    }

    if (diag.offer_potential_score !== null && diag.offer_potential_score < 6.0) {
      recommendations.push({
        title: 'Değer Vaadi ve Konumlandırma Stratejisi Danışmanlığı',
        description: `Teklif Gücü skoru düşük çıkmıştır (${diag.offer_potential_score.toFixed(1)}/10). Markanın hedef kitlesine sunduğu ana değer vaadinin (USP) netleştirilmesi ve pazar konumlandırma stratejisi.`,
        price: 35000
      });
    }

    return recommendations;
  };

  const handleApplyAiRecommendations = () => {
    const aiRecs = getAiRecommendations();
    if (aiRecs.length === 0) return;
    
    // Replace or append items
    if (items.length === 1 && items[0].title === '') {
      setItems(aiRecs);
    } else {
      setItems([...items, ...aiRecs]);
    }
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!title.trim()) {
      setError('Lütfen teklif başlığını girin.');
      return;
    }

    if (items.some(item => !item.title.trim() || !item.price)) {
      setError('Lütfen tüm teklif kalemlerinin başlık ve fiyat alanlarını doldurun.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Find client id or potential id
      const matchedClient = clients.find(c => c.id === selectedLeadId || c.companyName === selectedLeadId);
      const matchedLead = leads.find(l => l.id === selectedLeadId || l.brandName === selectedLeadId);

      const clientId = matchedClient ? matchedClient.id : null;
      const potentialId = matchedLead ? matchedLead.id : null;

      const result = await createProposal({
        title: title.trim(),
        clientId,
        potentialId,
        value: totalValue,
        status,
        items
      });

      if (result.success && result.data) {
        setProposals((prev) => [result.data, ...prev]);
        setShowModal(false);
        // Reset states
        setTitle('');
        setSelectedLeadId('');
        setStatus('draft');
        setItems([{ title: '', description: '', price: 0 }]);
      } else {
        setError(result.error ?? 'Teklif kaydedilemedi.');
      }
    } catch (err) {
      console.error(err);
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = (id: string) => {
    const link = `${window.location.origin}/teklif/${id}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Stats calculations for conversion funnel
  const stats = {
    draft: proposals.filter(p => p.status === 'draft').length,
    sent: proposals.filter(p => p.status === 'sent').length,
    accepted: proposals.filter(p => p.status === 'accepted').length,
    declined: proposals.filter(p => p.status === 'declined').length,
    totalVal: proposals.filter(p => p.status === 'accepted').reduce((s, p) => s + Number(p.value), 0)
  };

  const aiRecsCount = getAiRecommendations().length;

  return (
    <div className="w-full space-y-6 animate-fade-in-up pb-12 px-2 text-[#c9c5d8]">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Teklif Merkezi</h1>
          <p className="text-xs text-[#8c869e] mt-1">
            Müşterilere hazırlanan tekliflerin, dinamik fiyatlandırma kalemlerinin ve onay süreçlerinin yönetim paneli.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-[#4f20c0] to-[#b5179e] text-white font-extrabold text-xs px-5 py-2.5 rounded transition-all shadow-[0_4px_15px_rgba(79,32,192,0.3)] hover:scale-[1.02]"
        >
          Yeni Teklif Oluştur
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Proposals List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="glass-card rounded-md p-6 border border-white/5">
            <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ccbdff]">gavel</span>
              <span>Aktif Teklifler ({proposals.length})</span>
            </h3>
            
            <div className="space-y-3">
              {isLoading ? (
                <div className="p-8 text-xs font-bold text-[#8c869e] text-center animate-pulse">
                  Teklifler yükleniyor...
                </div>
              ) : proposals.length === 0 ? (
                <div className="p-12 text-xs font-bold text-[#8c869e] text-center border border-dashed border-white/10 rounded bg-white/5">
                  Hazırlanmış bir teklif bulunmuyor. Yeni teklif oluşturarak başlayabilirsiniz.
                </div>
              ) : (
                proposals.map((tek) => {
                  const statusColors = {
                    draft: 'bg-white/5 text-[#8c869e] border-white/10',
                    sent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                    accepted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    declined: 'bg-red-500/10 text-red-400 border-red-500/20',
                  };

                  const statusLabels = {
                    draft: 'Taslak',
                    sent: 'Gönderildi',
                    accepted: 'Onaylandı',
                    declined: 'Reddedildi'
                  };

                  return (
                    <div 
                      key={tek.id} 
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white/[0.02] border border-white/5 rounded hover:bg-white/[0.04] transition-all gap-4"
                    >
                      <div className="min-w-0 flex-grow">
                        <h4 className="font-black text-white text-xs truncate">{tek.title}</h4>
                        <p className="text-[10px] text-[#8c869e] mt-1">
                          ID: DC_PROP_{tek.id.slice(0, 6).toUpperCase()} • {new Date(tek.created_at).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-left sm:text-right shrink-0">
                          <p className="text-[#ccbdff] font-black text-xs">
                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(tek.value)}
                          </p>
                          <span className={`text-[8px] px-2 py-0.5 rounded-sm border mt-1 inline-block uppercase font-black ${statusColors[tek.status]}`}>
                            {statusLabels[tek.status]}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCopyLink(tek.id)}
                            className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] rounded border border-white/10 transition-all flex items-center gap-1"
                            title="Müşteri Dijital Teklif Linkini Kopyala"
                          >
                            <span className="material-symbols-outlined text-[12px]">link</span>
                            <span>{copiedId === tek.id ? 'Kopyalandı!' : 'Linki Kopyala'}</span>
                          </button>
                          <Link 
                            href={`/teklif/${tek.id}`}
                            target="_blank"
                            className="px-2.5 py-1.5 bg-[#4f20c0]/20 hover:bg-[#4f20c0]/35 text-[#f1ecf9] font-bold text-[10px] rounded border border-[#4f20c0]/30 transition-all flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[12px]">visibility</span>
                            <span>Görüntüle</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Conversion Funnel Stats */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-md p-6 border border-white/5 space-y-5">
            <h3 className="text-sm font-black text-white">Teklif Huni Özetleri</h3>
            
            <div className="grid grid-cols-2 gap-4 text-xs font-bold">
              <div className="bg-white/5 rounded border border-white/5 p-3 text-center">
                <span className="text-[9px] text-[#8c869e] uppercase block">Toplam Ciro</span>
                <span className="text-sm font-black text-emerald-400 mt-1 block">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(stats.totalVal)}
                </span>
              </div>
              <div className="bg-white/5 rounded border border-white/5 p-3 text-center">
                <span className="text-[9px] text-[#8c869e] uppercase block">Kabul Oranı</span>
                <span className="text-sm font-black text-[#ccbdff] mt-1 block">
                  {proposals.length > 0 ? `${Math.round((stats.accepted / proposals.length) * 100)}%` : '0%'}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-[#8c869e]">Onaylanan Teklifler</span>
                <span className="text-white">{stats.accepted}</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-400 rounded-full" 
                  style={{ width: `${proposals.length > 0 ? (stats.accepted / proposals.length) * 100 : 0}%` }} 
                />
              </div>

              <div className="flex justify-between items-center text-xs font-bold pt-1">
                <span className="text-[#8c869e]">Bekleyen / Gönderilen</span>
                <span className="text-white">{stats.sent}</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-400 rounded-full" 
                  style={{ width: `${proposals.length > 0 ? (stats.sent / proposals.length) * 100 : 0}%` }} 
                />
              </div>

              <div className="flex justify-between items-center text-xs font-bold pt-1">
                <span className="text-[#8c869e]">Taslak Durumunda</span>
                <span className="text-white">{stats.draft}</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-slate-500 rounded-full" 
                  style={{ width: `${proposals.length > 0 ? (stats.draft / proposals.length) * 100 : 0}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Proposal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0c0a18] border border-white/10 rounded-md p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-6 text-[#c9c5d8] max-h-[90vh] overflow-y-auto animate-scale-up">
            <div>
              <h3 className="text-base font-black text-white">Yeni Teklif Hazırla</h3>
              <p className="text-[10px] text-[#8c869e] mt-1">Kalem bazlı fiyat teklif kartı oluşturun ve AI önerilerinden yararlanın.</p>
            </div>
            
            <form onSubmit={handleCreateProposal} className="space-y-5 text-xs font-bold">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-sm font-semibold">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-[#8c869e] uppercase tracking-wider">Teklif Başlığı *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Örn: Web Tasarım ve Kurumsal Kimlik"
                    className="w-full bg-[#0e0b1a] border border-white/10 rounded px-3.5 py-2.5 text-xs text-white placeholder-[#7d778f] focus:outline-none focus:border-[#4f20c0] transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-[#8c869e] uppercase tracking-wider">İlgili Müşteri / Potansiyel</label>
                  <select
                    value={selectedLeadId}
                    onChange={(e) => setSelectedLeadId(e.target.value)}
                    className="w-full bg-[#0e0b1a] border border-white/10 rounded px-3 py-2.5 text-xs text-white focus:outline-none cursor-pointer focus:border-[#4f20c0] transition-all"
                  >
                    <option value="" className="bg-[#0e0b1a]">Seçiniz (Genel Teklif)</option>
                    
                    <optgroup label="Aktif Adaylar" className="bg-[#0e0b1a]">
                      {leads.map((l) => (
                        <option key={l.id} value={l.id} className="bg-[#0e0b1a]">
                          {l.brandName} (Aday)
                        </option>
                      ))}
                    </optgroup>

                    <optgroup label="Sözleşmeli Müşteriler" className="bg-[#0e0b1a]">
                      {clients.map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#0e0b1a]">
                          {c.companyName} (Müşteri)
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* AI Recommendation Alert */}
              {selectedLeadId && aiRecsCount > 0 && (
                <div className="bg-gradient-to-r from-[#4f20c0]/20 to-[#b5179e]/10 border border-[#4f20c0]/35 rounded p-4 flex justify-between items-center">
                  <div>
                    <h5 className="text-white text-xs font-black flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-purple-400">smart_toy</span>
                      <span>Stüdyo AI Çözüm Önerileri Hazır!</span>
                    </h5>
                    <p className="text-[10px] text-[#8c869e] mt-1">
                      Markanın Teşhis Raporu'ndaki zayıf skorlarına ({aiRecsCount} kategori) uygun eylemler tespit edildi.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyAiRecommendations}
                    className="px-3 py-1.5 bg-[#4f20c0] text-white hover:bg-[#6741d9] font-extrabold text-[10px] rounded border border-[#ccbdff]/20 transition-all shrink-0"
                  >
                    Önerileri Kalem Olarak Ekle
                  </button>
                </div>
              )}

              {/* Line Items Builder */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="block text-[9px] font-bold text-[#8c869e] uppercase tracking-wider">Teklif Kalemleri (Line Items)</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-purple-400 hover:text-white font-extrabold text-[10px] flex items-center gap-1 transition-colors"
                  >
                    + Kalem Ekle
                  </button>
                </div>

                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                  {items.map((item, index) => (
                    <div key={index} className="bg-white/5 border border-white/5 rounded p-3 flex flex-col gap-3 relative">
                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-8 space-y-1">
                          <input
                            type="text"
                            required
                            value={item.title}
                            onChange={(e) => handleUpdateItem(index, 'title', e.target.value)}
                            placeholder="Kalem/Hizmet Başlığı"
                            className="w-full bg-[#0e0b1a] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white placeholder-[#7d778f] focus:outline-none focus:border-[#4f20c0]"
                          />
                        </div>
                        <div className="col-span-4 space-y-1">
                          <input
                            type="number"
                            required
                            value={item.price || ''}
                            onChange={(e) => handleUpdateItem(index, 'price', parseFloat(e.target.value) || 0)}
                            placeholder="Tutar (TL)"
                            className="w-full bg-[#0e0b1a] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white placeholder-[#7d778f] focus:outline-none focus:border-[#4f20c0]"
                          />
                        </div>
                      </div>
                      <div>
                        <textarea
                          rows={1}
                          value={item.description}
                          onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                          placeholder="Hizmet/Teslimat detayları..."
                          className="w-full bg-[#0e0b1a] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white placeholder-[#7d778f] focus:outline-none focus:border-[#4f20c0]"
                        />
                      </div>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="absolute top-2.5 right-2.5 text-red-400 hover:text-red-300 material-symbols-outlined text-[14px]"
                          title="Kalemi Sil"
                        >
                          delete
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom calculations & submit */}
              <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-[#8c869e] uppercase block">Teklif Toplam Değeri</span>
                  <span className="text-base font-black text-emerald-400">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(totalValue)}
                  </span>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                  <div className="w-28">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-[#0e0b1a] border border-white/10 rounded px-3 py-2.5 text-xs text-white focus:outline-none cursor-pointer focus:border-[#4f20c0]"
                    >
                      <option value="draft">Taslak</option>
                      <option value="sent">Gönderildi</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-[#8c869e] hover:text-white rounded transition-all text-xs"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#4f20c0] to-[#b5179e] hover:scale-[1.02] text-white rounded font-extrabold shadow-lg shadow-purple-500/10 transition-all disabled:opacity-50 text-xs"
                  >
                    {isSubmitting ? 'Kaydediliyor...' : 'Teklifi Kaydet'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
