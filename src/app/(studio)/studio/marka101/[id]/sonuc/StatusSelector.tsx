// src/app/(studio)/studio/marka101/[id]/sonuc/StatusSelector.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateDiagnosisStatus } from '@/features/diagnoses/lib/actions';

interface StatusSelectorProps {
  readonly id: string;
  readonly currentStatus: string;
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Yeni Başvuru',
  in_review: 'İncelemede',
  analyzed: 'Analiz Edildi',
  completed: 'Tamamlandı',
  archived: 'Arşivlendi',
};

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  in_review: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
  analyzed: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
  completed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  archived: 'bg-gray-150 text-gray-500 border-gray-200',
};

export function StatusSelector({ id, currentStatus }: StatusSelectorProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStatusChange(newStatus: 'new' | 'in_review' | 'analyzed' | 'completed' | 'archived') {
    setIsLoading(true);
    setError(null);
    try {
      const result = await updateDiagnosisStatus(id, newStatus);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error ?? 'Durum güncellenemedi.');
      }
    } catch (err) {
      console.error(err);
      setError('Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="glass-card rounded-md p-5 shadow-sm space-y-4 no-print text-xs text-gray-700">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Marka Durumu</h4>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm font-bold border ${STATUS_COLORS[currentStatus] ?? 'bg-gray-150 text-gray-500'}`}>
          {STATUS_LABELS[currentStatus] ?? currentStatus}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={isLoading || currentStatus === 'completed'}
          onClick={() => void handleStatusChange('completed')}
          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded disabled:opacity-30 transition-all shadow-sm text-center"
        >
          Tamamla
        </button>

        <button
          type="button"
          disabled={isLoading || currentStatus === 'archived'}
          onClick={() => void handleStatusChange('archived')}
          className="px-3 py-2 border border-gray-200 bg-white text-gray-500 hover:text-gray-800 font-bold rounded disabled:opacity-30 transition-all text-center"
        >
          Arşivle
        </button>
      </div>

      {currentStatus !== 'analyzed' && currentStatus !== 'new' && (
        <button
          type="button"
          disabled={isLoading}
          onClick={() => void handleStatusChange('analyzed')}
          className="w-full text-center text-[10px] font-bold text-gray-400 hover:text-gray-600 pt-1 block"
        >
          Analiz Durumuna Geri Al
        </button>
      )}

      {error && (
        <p className="text-[10px] text-red-655 bg-red-50 border border-red-200 rounded-sm px-2.5 py-1.5 text-center font-bold">
          {error}
        </p>
      )}
    </div>
  );
}
