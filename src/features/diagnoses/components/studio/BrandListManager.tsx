// src/features/diagnoses/components/studio/BrandListManager.tsx
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Diagnosis, DiagnosisStatus } from '../../types';
import { updateDiagnosisStatus } from '../../lib/actions';

interface BrandListManagerProps {
  readonly diagnoses: Diagnosis[];
}

const SECTOR_LABELS: Record<string, string> = {
  health: 'Sağlık / Klinik',
  realestate: 'Gayrimenkul / Mimari',
  b2b_industrial: 'B2B / Sanayi',
  general: 'Genel Hizmet',
};

const STATUS_TEXTS: Record<DiagnosisStatus, string> = {
  new: 'Yeni Başvuru',
  in_review: 'İncelemede',
  analyzed: 'Analiz Edildi',
  output_ready: 'Rapor Hazır',
  completed: 'Tamamlandı',
  archived: 'Arşivlendi',
};

const STATUS_COLOR_CLASSES: Record<DiagnosisStatus, string> = {
  new: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  in_review: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  analyzed: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  output_ready: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  archived: 'bg-gray-800 text-gray-400 border-gray-700',
};

export function BrandListManager({ diagnoses }: BrandListManagerProps) {
  const [localDiagnoses, setLocalDiagnoses] = useState<Diagnosis[]>(diagnoses);
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  // Database Status Update Handler
  const handleStatusChange = async (id: string, nextStatus: DiagnosisStatus) => {
    setLocalDiagnoses(prev =>
      prev.map(d => (d.id === id ? { ...d, status: nextStatus } : d))
    );
    try {
      await updateDiagnosisStatus(id, nextStatus);
    } catch (err) {
      console.error('[handleStatusChange] Error:', err);
    }
  };

  // Filter diagnoses
  const filteredDiagnoses = useMemo(() => {
    return localDiagnoses.filter(d => {
      // Tab filter
      const isArchived = d.status === 'archived';
      if (activeTab === 'active' && isArchived) return false;
      if (activeTab === 'archived' && !isArchived) return false;

      // Search filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const brandMatch = d.brand_name?.toLowerCase().includes(query);
        const contactMatch = d.submitted_contact_name?.toLowerCase().includes(query);
        const emailMatch = d.submitted_email?.toLowerCase().includes(query);
        if (!brandMatch && !contactMatch && !emailMatch) return false;
      }

      // Sector filter
      if (selectedSector !== 'all') {
        const sub = d.public_submission as any;
        const sector = sub?.brandContext?.sector ?? d.public_submission?.sector;
        if (sector !== selectedSector) return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && activeTab === 'active') {
        if (d.status !== selectedStatus) return false;
      }

      return true;
    });
  }, [localDiagnoses, search, selectedSector, selectedStatus, activeTab]);

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="glass-card glass-card-hover rounded-md p-4 flex flex-col md:flex-row gap-4 items-center justify-between no-print border border-white/5">
        {/* Tab triggers */}
        <div className="flex bg-[#0a0814] p-1 rounded border border-white/5 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${
              activeTab === 'active'
                ? 'bg-gradient-to-r from-[#4f20c0] to-[#b5179e] text-white shadow-sm'
                : 'text-[#8c869e] hover:text-[#f1ecf9]'
            }`}
          >
            Aktif Başvurular ({localDiagnoses.filter(d => d.status !== 'archived').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('archived')}
            className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${
              activeTab === 'archived'
                ? 'bg-gradient-to-r from-[#4f20c0] to-[#b5179e] text-white shadow-sm'
                : 'text-[#8c869e] hover:text-[#f1ecf9]'
            }`}
          >
            Arşivlenmiş ({localDiagnoses.filter(d => d.status === 'archived').length})
          </button>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <input
            type="text"
            placeholder="Marka, ad veya e-posta ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-[#0e0b1a] border border-white/10 text-white rounded px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#4f20c0]/35 placeholder-[#7d778f] w-full md:w-48"
          />

          <select
            value={selectedSector}
            onChange={e => setSelectedSector(e.target.value)}
            className="border border-white/10 rounded px-3 py-2 text-xs font-bold text-[#c9c5d8] bg-[#0e0b1a] focus:outline-none cursor-pointer hover:border-[#4f20c0] transition-all"
          >
            <option value="all" className="bg-[#0e0b1a]">Tüm Sektörler</option>
            <option value="health" className="bg-[#0e0b1a]">Sağlık / Klinik</option>
            <option value="realestate" className="bg-[#0e0b1a]">Gayrimenkul / Mimari</option>
            <option value="b2b_industrial" className="bg-[#0e0b1a]">B2B / Sanayi</option>
            <option value="general" className="bg-[#0e0b1a]">Genel Hizmet</option>
          </select>

          {activeTab === 'active' && (
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="border border-white/10 rounded px-3 py-2 text-xs font-bold text-[#c9c5d8] bg-[#0e0b1a] focus:outline-none cursor-pointer hover:border-[#4f20c0] transition-all"
            >
              <option value="all" className="bg-[#0e0b1a]">Tüm Durumlar</option>
              <option value="new" className="bg-[#0e0b1a]">Yeni Başvuru</option>
              <option value="in_review" className="bg-[#0e0b1a]">İncelemede</option>
              <option value="analyzed" className="bg-[#0e0b1a]">Analiz Edildi</option>
              <option value="output_ready" className="bg-[#0e0b1a]">Rapor Hazır</option>
              <option value="completed" className="bg-[#0e0b1a]">Tamamlandı</option>
            </select>
          )}
        </div>
      </div>

      {/* Main Table List */}
      <div className="glass-card rounded-md overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0c0a17] border-b border-white/5 text-[10px] font-extrabold text-[#8c869e] uppercase tracking-wider">
                <th className="p-4 pl-6">Brand ID</th>
                <th className="p-4">Marka Adı</th>
                <th className="p-4">Kişi / İrtibat</th>
                <th className="p-4">Sektör</th>
                <th className="p-4">Skor</th>
                <th className="p-4">Yönetim Durumu</th>
                <th className="p-4 text-right pr-6">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-semibold text-[#c9c5d8]">
              {filteredDiagnoses.map(item => {
                const sub = item.public_submission as any;
                const sector = sub?.brandContext?.sector || item.public_submission?.sector || 'general';
                return (
                  <tr key={item.id} className="hover:bg-white/[0.04] transition-colors">
                    <td className="p-4 pl-6 font-bold text-[#7d778f]">
                      {`DC_${item.id.slice(0, 5).toUpperCase()}`}
                    </td>
                    <td className="p-4">
                      <Link href={`/studio/marka101/${item.id}`} className="font-extrabold text-white hover:text-[#b5179e] transition-colors">
                        {item.brand_name}
                      </Link>
                      <span className="text-[10px] text-[#7d778f] block mt-0.5">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString('tr-TR') : ''}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="block text-gray-200 text-xs truncate max-w-[150px]">{item.submitted_contact_name || '-'}</span>
                      <span className="text-[10px] text-[#7d778f] block truncate max-w-[150px]">{item.submitted_email}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold text-[#8c869e] bg-[#0c0a17] border border-white/10 px-2 py-0.5 rounded-sm">
                        {SECTOR_LABELS[sector] ?? 'Genel'}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-[#ccbdff] shadow-[0_0_8px_rgba(79,32,192,0.15)]">
                      {item.overall_health_score !== null ? `Skor: ${item.overall_health_score.toFixed(1)}` : 'Skorsuz'}
                    </td>
                    <td className="p-4">
                      <select
                        value={item.status}
                        onChange={e => void handleStatusChange(item.id, e.target.value as DiagnosisStatus)}
                        className={`text-[10px] font-extrabold border px-2 py-1 rounded bg-[#0e0b1a] focus:outline-none cursor-pointer ${STATUS_COLOR_CLASSES[item.status]}`}
                      >
                        <option value="new" className="bg-[#0e0b1a]">Yeni Başvuru</option>
                        <option value="in_review" className="bg-[#0e0b1a]">İncelemede</option>
                        <option value="analyzed" className="bg-[#0e0b1a]">Analiz Edildi</option>
                        <option value="output_ready" className="bg-[#0e0b1a]">Rapor Hazır</option>
                        <option value="completed" className="bg-[#0e0b1a]">Tamamlandı</option>
                        <option value="archived" className="bg-[#0e0b1a]">Arşivlendi</option>
                      </select>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2.5">
                        <Link
                          href={`/studio/marka101/${item.id}`}
                          className="bg-[#0e0b1a] hover:bg-white/5 text-white font-bold px-3 py-1.5 rounded border border-white/10 transition-all text-xs"
                        >
                          Detay
                        </Link>
                        {item.overall_health_score !== null ? (
                          <Link
                            href={`/studio/marka101/${item.id}/sonuc`}
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-450 border border-emerald-500/20 font-bold px-3 py-1.5 rounded transition-all text-xs"
                          >
                            Sonuçlar
                          </Link>
                        ) : (
                          <Link
                            href={`/studio/marka101/${item.id}/analiz`}
                            className="bg-gradient-to-r from-[#4f20c0] to-[#b5179e] hover:scale-[1.02] text-white font-bold px-3 py-1.5 rounded transition-all shadow-md shadow-[#4f20c0]/20 text-xs"
                          >
                            Analiz Yap
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredDiagnoses.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-[#8c869e] font-bold">
                    Aranan kriterlere uygun başvuru bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
