'use client';

import { useState, useEffect } from 'react';
import { useAgency } from '@/features/diagnoses/components/studio/AgencyContext';
import { createClient } from '@/lib/supabase/client';

interface VisualRecord {
  id: string;
  client_id: string | null;
  project_id: string | null;
  title: string;
  drive_link: string;
  visual_type: string;
  service_type: string;
  status: string;
  is_publish_candidate: boolean;
  is_client_visible: boolean;
  notes: string;
  created_at: string;
}

export default function GorselKutuphanePage() {
  const { clients, projects } = useAgency();
  const [visuals, setVisuals] = useState<VisualRecord[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null); // null = brand list, 'genel' = Genel Arşiv, UUID = Brand Detail
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingVisual, setEditingVisual] = useState<VisualRecord | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Form Fields
  const [formBrandId, setFormBrandId] = useState<string>('');
  const [formProjectId, setFormProjectId] = useState<string>('');
  const [formTitle, setFormTitle] = useState('');
  const [formDriveLink, setFormDriveLink] = useState('');
  const [formVisualType, setFormVisualType] = useState('logo');
  const [formServiceType, setFormServiceType] = useState('general');
  const [formStatus, setFormStatus] = useState('draft');
  const [formIsPublishCandidate, setFormIsPublishCandidate] = useState(false);
  const [formIsClientVisible, setFormIsClientVisible] = useState(false);
  const [formNotes, setFormNotes] = useState('');

  const supabase = createClient();

  useEffect(() => {
    fetchVisuals();
  }, []);

  async function fetchVisuals() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('visual_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVisuals(data || []);
    } catch (err) {
      console.error('Error fetching visual library:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // Open drawer for adding
  const handleOpenAdd = () => {
    setEditingVisual(null);
    setFormBrandId(selectedBrandId && selectedBrandId !== 'genel' ? selectedBrandId : '');
    setFormProjectId('');
    setFormTitle('');
    setFormDriveLink('');
    setFormVisualType('logo');
    setFormServiceType('general');
    setFormStatus('draft');
    setFormIsPublishCandidate(false);
    setFormIsClientVisible(false);
    setFormNotes('');
    setIsDrawerOpen(true);
  };

  // Open drawer for editing
  const handleOpenEdit = (vis: VisualRecord) => {
    setEditingVisual(vis);
    setFormBrandId(vis.client_id || '');
    setFormProjectId(vis.project_id || '');
    setFormTitle(vis.title);
    setFormDriveLink(vis.drive_link);
    setFormVisualType(vis.visual_type);
    setFormServiceType(vis.service_type);
    setFormStatus(vis.status);
    setFormIsPublishCandidate(vis.is_publish_candidate);
    setFormIsClientVisible(vis.is_client_visible);
    setFormNotes(vis.notes || '');
    setIsDrawerOpen(true);
  };

  // Save Record
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDriveLink.trim()) return;

    const recordData = {
      client_id: formBrandId === '' ? null : formBrandId,
      project_id: formProjectId === '' ? null : formProjectId,
      title: formTitle,
      drive_link: formDriveLink,
      visual_type: formVisualType,
      service_type: formServiceType,
      status: formStatus,
      is_publish_candidate: formIsPublishCandidate,
      is_client_visible: formIsClientVisible,
      notes: formNotes,
    };

    try {
      if (editingVisual) {
        const { error } = await supabase
          .from('visual_library')
          .update(recordData)
          .eq('id', editingVisual.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('visual_library')
          .insert(recordData);
        if (error) throw error;
      }
      setIsDrawerOpen(false);
      fetchVisuals();
    } catch (err) {
      console.error('Error saving visual record:', err);
    }
  };

  // Delete Record
  const handleDelete = async (id: string) => {
    if (!confirm('Bu görsel kaydını silmek istediğinize emin misiniz?')) return;
    try {
      const { error } = await supabase
        .from('visual_library')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchVisuals();
    } catch (err) {
      console.error('Error deleting visual record:', err);
    }
  };

  // Filtered visuals based on selected view
  const getBrandVisuals = (brandId: string | null) => {
    return visuals.filter((v) => v.client_id === brandId);
  };

  // Filter records in detail view based on filter tabs
  const getFilteredVisuals = () => {
    const currentBrandId = selectedBrandId === 'genel' ? null : selectedBrandId;
    let list = getBrandVisuals(currentBrandId);

    if (activeFilter === 'all') return list;
    if (activeFilter === 'publish_candidate') return list.filter(v => v.is_publish_candidate);
    if (activeFilter === 'client_visible') return list.filter(v => v.is_client_visible);
    return list.filter((v) => v.visual_type === activeFilter);
  };

  const getBrandStats = (brandId: string | null) => {
    const list = getBrandVisuals(brandId);
    return {
      total: list.length,
      publishCandidate: list.filter(v => v.is_publish_candidate).length,
      clientVisible: list.filter(v => v.is_client_visible).length
    };
  };

  // Filter clients by search query
  const filteredClients = clients.filter(c => 
    c.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const visualTypes = [
    { key: 'logo', label: 'Logo' },
    { key: 'social_media', label: 'Sosyal Medya' },
    { key: 'website', label: 'Website' },
    { key: 'advertisement', label: 'Reklam' },
    { key: 'photo', label: 'Fotoğraf' },
    { key: 'video', label: 'Video' },
    { key: 'presentation', label: 'Sunum' },
    { key: 'other', label: 'Diğer' },
  ];

  const filterTabs = [
    { key: 'all', label: 'Tümü' },
    ...visualTypes,
    { key: 'publish_candidate', label: 'Yayına Aday' },
    { key: 'client_visible', label: 'Müşteriye Açık' },
  ];

  const statusLabels: Record<string, { label: string; color: string }> = {
    draft: { label: 'TASLAK', color: 'text-gray-400 bg-gray-900 border-gray-800' },
    in_progress: { label: 'SÜREÇTE', color: 'text-amber-500 bg-amber-950/20 border-amber-900/30' },
    review: { label: 'GÖZDEN GEÇİRME', color: 'text-purple-400 bg-purple-950/20 border-purple-900/30' },
    completed: { label: 'TAMAMLANDI', color: 'text-emerald-500 bg-emerald-950/20 border-emerald-900/30' },
  };

  // Drawer Render helper function
  function renderDrawer() {
    if (!isDrawerOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex justify-end no-print">
        {/* Backdrop overlay */}
        <div 
          onClick={() => setIsDrawerOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all animate-fade-in"
        />

        {/* Drawer container */}
        <div className="w-full max-w-md bg-[#0e0b1a] border-l border-white/10 h-full p-6 flex flex-col justify-between relative z-10 shadow-2xl animate-fade-in-up text-left overflow-y-auto">
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <h2 className="text-sm font-black tracking-wider text-[#f6f5fa] uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">photo_library</span>
                {editingVisual ? 'Görsel Kaydı Düzenle' : 'Yeni Görsel Kayıt'}
              </h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-6 h-6 rounded-full hover:bg-white/5 flex items-center justify-center text-[#8c869e] hover:text-[#f1ecf9] transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-bold text-[#f1ecf9]">
              
              {/* Brand Select */}
              <div className="space-y-1">
                <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">Marka</label>
                <select
                  value={formBrandId}
                  onChange={(e) => {
                    setFormBrandId(e.target.value);
                    setFormProjectId('');
                  }}
                  className="w-full p-2.5 rounded bg-[#06050b] border border-white/10 text-xs font-semibold focus:outline-none focus:border-[#4f20c0] text-[#f1ecf9]"
                >
                  <option value="">-- Genel Arşiv (Markasız) --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.companyName}</option>
                  ))}
                </select>
              </div>

              {/* Project Select */}
              {formBrandId && (
                <div className="space-y-1">
                  <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">İlgili İş / Proje</label>
                  <select
                    value={formProjectId}
                    onChange={(e) => setFormProjectId(e.target.value)}
                    className="w-full p-2.5 rounded bg-[#06050b] border border-white/10 text-xs font-semibold focus:outline-none focus:border-[#4f20c0] text-[#f1ecf9]"
                  >
                    <option value="">Genel (Projesiz)</option>
                    {projects
                      .filter((p) => p.clientName === clients.find((c) => c.id === formBrandId)?.companyName)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Title Input */}
              <div className="space-y-1">
                <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">Başlık</label>
                <input
                  type="text"
                  required
                  placeholder="Örn. 2024 Lansman Ana Görsel"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-2.5 rounded bg-[#06050b] border border-white/10 text-xs font-semibold focus:outline-none focus:border-[#4f20c0]"
                />
              </div>

              {/* Drive Link Input */}
              <div className="space-y-1">
                <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">Drive Linki</label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/file/d/..."
                  value={formDriveLink}
                  onChange={(e) => setFormDriveLink(e.target.value)}
                  className="w-full p-2.5 rounded bg-[#06050b] border border-white/10 text-xs font-semibold focus:outline-none focus:border-[#4f20c0]"
                />
              </div>

              {/* Visual Type and Service Type Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">Görsel Türü</label>
                  <select
                    value={formVisualType}
                    onChange={(e) => setFormVisualType(e.target.value)}
                    className="w-full p-2.5 rounded bg-[#06050b] border border-white/10 text-xs font-semibold focus:outline-none focus:border-[#4f20c0] text-[#f1ecf9]"
                  >
                    {visualTypes.map(t => (
                      <option key={t.key} value={t.key}>{t.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">İş / Hizmet Türü</label>
                  <select
                    value={formServiceType}
                    onChange={(e) => setFormServiceType(e.target.value)}
                    className="w-full p-2.5 rounded bg-[#06050b] border border-white/10 text-xs font-semibold focus:outline-none focus:border-[#4f20c0] text-[#f1ecf9]"
                  >
                    <option value="general">Genel</option>
                    <option value="branding">Kurumsal Kimlik</option>
                    <option value="campaign">Kampanya</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>
              </div>

              {/* Status Select */}
              <div className="space-y-1">
                <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">Durum</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full p-2.5 rounded bg-[#06050b] border border-white/10 text-xs font-semibold focus:outline-none focus:border-[#4f20c0] text-[#f1ecf9]"
                >
                  <option value="draft">Taslak</option>
                  <option value="in_progress">Süreçte</option>
                  <option value="review">Gözden Geçirme</option>
                  <option value="completed">Tamamlandı</option>
                </select>
              </div>

              {/* Checkboxes for publish / client visible */}
              <div className="py-2 space-y-3 border-t border-b border-white/5 mt-4">
                <label className="flex items-center gap-3 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={formIsPublishCandidate}
                    onChange={(e) => setFormIsPublishCandidate(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#06050b] border-white/10 text-[#4f20c0] focus:ring-[#4f20c0] focus:ring-offset-0 focus:outline-none cursor-pointer"
                  />
                  <div>
                    <span className="text-[#f1ecf9]">Yayına Aday</span>
                    <p className="text-[10px] text-[#8c869e] font-normal mt-0.5">Yayın takvimine alınabilecek tasarımlar için işaretleyin.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={formIsClientVisible}
                    onChange={(e) => setFormIsClientVisible(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#06050b] border-white/10 text-[#4f20c0] focus:ring-[#4f20c0] focus:ring-offset-0 focus:outline-none cursor-pointer"
                  />
                  <div>
                    <span className="text-[#f1ecf9]">Müşteriye Açık</span>
                    <p className="text-[10px] text-[#8c869e] font-normal mt-0.5">Müşteri paneli veya paylaşılan raporlarda görünmesini sağlar.</p>
                  </div>
                </label>
              </div>

              {/* Notes Input */}
              <div className="space-y-1">
                <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">Notlar</label>
                <textarea
                  rows={3}
                  placeholder="Ek açıklama veya not..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-2.5 rounded bg-[#06050b] border border-white/10 text-xs font-semibold focus:outline-none focus:border-[#4f20c0] resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex-1 py-2.5 border border-white/10 rounded font-bold text-[#8c869e] hover:text-[#f1ecf9] hover:bg-white/5 transition-all text-center"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded bg-gradient-to-r from-[#4f20c0] to-[#b5179e] text-white font-bold text-center border-0 hover:shadow-lg hover:shadow-purple-500/15 transition-all"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // If inside a brand detail view
  if (selectedBrandId !== null) {
    const isGenel = selectedBrandId === 'genel';
    const currentBrandName = isGenel ? 'Genel Arşiv' : clients.find(c => c.id === selectedBrandId)?.companyName || 'Bilinmeyen Marka';
    const stats = getBrandStats(isGenel ? null : selectedBrandId);
    const displayedVisuals = getFilteredVisuals();

    return (
      <div className="w-full space-y-6 animate-fade-in-up pb-12 text-[#c9c5d8] px-2 relative">
        {/* Detail Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5 text-left">
          <div className="text-left">
            <div className="flex items-center gap-2 text-xs text-[#8c869e] font-bold">
              <button onClick={() => setSelectedBrandId(null)} className="hover:text-[#f1ecf9] transition-all">Görsel Kütüphane</button>
              <span>&gt;</span>
              <span className="text-[#f1ecf9]">{currentBrandName}</span>
            </div>
            <h1 className="text-xl font-black text-[#f6f5fa] tracking-tight mt-1">{currentBrandName}</h1>
            <p className="text-xs text-[#8c869e] mt-1">
              Bu markaya bağlı Drive görsel kayıtları, iş türleri ve yayın adayları.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSelectedBrandId(null)}
              className="px-4 py-2 border border-white/10 rounded text-xs font-bold hover:bg-white/5 transition-all text-[#f1ecf9] flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Geri
            </button>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded text-xs font-bold bg-gradient-to-r from-[#4f20c0] to-[#b5179e] text-white border-0 hover:shadow-lg hover:shadow-purple-500/10 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Yeni Görsel Kayıt
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card rounded-md p-4 flex flex-col justify-center text-left">
            <span className="text-[10px] font-bold text-[#8c869e] uppercase tracking-wider">Kayıt Sayısı</span>
            <span className="text-lg font-black text-[#f1ecf9] mt-1">{stats.total} Kayıt</span>
          </div>
          <div className="glass-card rounded-md p-4 flex flex-col justify-center text-left">
            <span className="text-[10px] font-bold text-[#8c869e] uppercase tracking-wider">Yayına Aday</span>
            <span className="text-lg font-black text-amber-500 mt-1">{stats.publishCandidate} Yayına Aday</span>
          </div>
          <div className="glass-card rounded-md p-4 flex flex-col justify-center text-left">
            <span className="text-[10px] font-bold text-[#8c869e] uppercase tracking-wider">Müşteriye Açık</span>
            <span className="text-lg font-black text-emerald-500 mt-1">{stats.clientVisible} Müşteriye Açık</span>
          </div>
        </div>

        {/* Filters and List */}
        <div className="space-y-4">
          {/* Tabs */}
          <div className="glass-card rounded-md p-2 flex flex-wrap gap-2 justify-start no-print">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all border ${
                  activeFilter === tab.key
                    ? 'bg-gradient-to-r from-[#4f20c0] to-[#b5179e] text-white border-transparent shadow-[0_4px_10px_rgba(79,32,192,0.2)]'
                    : 'bg-[#0e0b1a]/40 border-white/5 text-[#8c869e] hover:text-[#f1ecf9] hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Record Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayedVisuals.map((vis) => {
              const status = statusLabels[vis.status] || statusLabels.draft;
              return (
                <div key={vis.id} className="glass-card rounded-md p-5 flex flex-col justify-between space-y-4 text-left border border-white/5 relative group">
                  
                  {/* Top Header Card */}
                  <div>
                    <div className="flex justify-between items-start gap-3">
                      <div className="w-10 h-10 bg-white/5 border border-white/10 rounded flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px] text-[#8c869e]">
                          {vis.visual_type === 'video' ? 'movie' : vis.visual_type === 'presentation' ? 'presentation' : 'image'}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold border shrink-0 ${status.color}`}>
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-3">
                      <h3 className="font-bold text-[#f1ecf9] text-sm leading-snug line-clamp-1">{vis.title}</h3>
                      <p className="text-[10px] text-[#8c869e] font-semibold mt-1 uppercase tracking-wider">
                        {visualTypes.find(t => t.key === vis.visual_type)?.label || vis.visual_type}
                        {projects.find(p => p.id === vis.project_id) && ` • ${projects.find(p => p.id === vis.project_id)?.name}`}
                      </p>
                    </div>

                    {vis.notes && (
                      <p className="text-[10px] text-[#8c869e] mt-2 line-clamp-2 leading-relaxed bg-[#06050b]/40 p-2 border border-white/5 rounded">
                        {vis.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions & Drive Link */}
                  <div className="pt-3 border-t border-white/5 flex justify-between items-center text-xs">
                    <span className="text-[9px] text-[#8c869e] font-bold">
                      {new Date(vis.created_at).toLocaleDateString('tr-TR')}
                    </span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleOpenEdit(vis)}
                        className="w-7 h-7 rounded hover:bg-white/5 flex items-center justify-center text-[#8c869e] hover:text-[#f1ecf9] transition-all"
                        title="Düzenle"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(vis.id)}
                        className="w-7 h-7 rounded hover:bg-white/5 flex items-center justify-center text-red-400 hover:text-red-300 transition-all"
                        title="Sil"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                      <a 
                        href={vis.drive_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded font-bold text-[10px] text-[#f1ecf9] flex items-center gap-1 transition-all"
                      >
                        <span className="material-symbols-outlined text-[12px]">link</span>
                        Drive
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}

            {displayedVisuals.length === 0 && (
              <div className="col-span-full py-16 text-center text-xs text-[#8c869e] font-bold glass-card rounded-md">
                Bu filtrede kayıtlı görsel bulunmamaktadır.
              </div>
            )}
          </div>
        </div>

        {/* Form Drawer (Modal Overlay) */}
        {renderDrawer()}
      </div>
    );
  }

  // Brand list page
  return (
    <div className="w-full space-y-6 animate-fade-in-up pb-12 text-[#c9c5d8] px-2 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5 text-left">
        <div className="text-left">
          <h1 className="text-xl font-black text-[#f6f5fa] tracking-tight">Görsel Kütüphane</h1>
          <p className="text-xs text-[#8c869e] mt-1">
            Marka bazlı görsel işleri Drive bağlantılarıyla düzenleyin. Dosyalar sistemde şişme yapmaz.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded border border-white/10 relative shrink-0">
            <span className="material-symbols-outlined text-[18px] text-[#8c869e] pl-1.5">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Marka ara..."
              className="bg-transparent border-0 text-xs text-[#f1ecf9] w-32 focus:w-44 transition-all focus:ring-0 focus:outline-none placeholder-[#7d778f] py-0.5 font-bold"
            />
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded text-xs font-bold bg-gradient-to-r from-[#4f20c0] to-[#b5179e] text-white border-0 hover:shadow-lg hover:shadow-purple-500/10 transition-all flex items-center gap-1.5 shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Yeni Görsel Kayıt
          </button>
        </div>
      </div>

      {/* Brand Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Map brand card clients */}
        {filteredClients.map((client) => {
          const stats = getBrandStats(client.id);
          return (
            <div
              key={client.id}
              onClick={() => setSelectedBrandId(client.id)}
              className="glass-card glass-card-hover rounded-md p-6 flex flex-col justify-between space-y-6 text-left cursor-pointer border border-white/5"
            >
              <div>
                <div className="flex justify-between items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#4f20c0]/20 to-[#b5179e]/20 text-[#f1ecf9] border border-white/10 rounded flex items-center justify-center font-black text-sm shrink-0">
                    {client.logoText || client.companyName.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="px-2 py-0.5 rounded-sm text-[8px] font-black bg-emerald-950/20 text-emerald-400 border border-emerald-900/30">
                    AKTİF MARKA
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="font-black text-[#f6f5fa] text-base leading-snug">{client.companyName}</h3>
                  <span className="text-[10px] text-[#8c869e] font-bold tracking-wider mt-1 block uppercase truncate">
                    {client.domain || 'Kurumsal Portföy'}
                  </span>
                </div>
              </div>

              {/* Records count indicator */}
              <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs font-bold">
                <span className="text-[#8c869e]">{stats.total} Kayıt</span>
                <span className="text-[#b5179e] hover:text-[#f1ecf9] transition-all flex items-center gap-0.5">
                  İncele <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                </span>
              </div>
            </div>
          );
        })}

        {/* Genel Arşiv Card */}
        {searchQuery === '' && (
          <div
            onClick={() => setSelectedBrandId('genel')}
            className="glass-card glass-card-hover rounded-md p-6 flex flex-col justify-between space-y-6 text-left cursor-pointer border border-white/5"
          >
            <div>
              <div className="flex justify-between items-start gap-4">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded flex items-center justify-center text-[#8c869e] shrink-0">
                  <span className="material-symbols-outlined text-[24px]">folder_special</span>
                </div>
                <span className="px-2 py-0.5 rounded-sm text-[8px] font-black bg-gray-900 text-gray-400 border border-gray-800">
                  GENEL
                </span>
              </div>

              <div className="mt-4">
                <h3 className="font-black text-[#f6f5fa] text-base leading-snug">Genel Arşiv</h3>
                <span className="text-[10px] text-[#8c869e] font-bold tracking-wider mt-1 block uppercase">
                  Markasız / Genel Tasarımlar
                </span>
              </div>
            </div>

            {/* Records count indicator */}
            <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs font-bold">
              <span className="text-[#8c869e]">{getBrandStats(null).total} Kayıt</span>
              <span className="text-[#b5179e] hover:text-[#f1ecf9] transition-all flex items-center gap-0.5">
                İncele <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Form Drawer (Modal Overlay) */}
      {renderDrawer()}
    </div>
  );
}
