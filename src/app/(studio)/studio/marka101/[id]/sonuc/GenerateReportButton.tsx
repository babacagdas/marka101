// src/app/(studio)/studio/marka101/[id]/sonuc/GenerateReportButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateClaudeReport } from '@/features/diagnoses/lib/actions';

interface GenerateReportButtonProps {
  readonly id: string;
}

export function GenerateReportButton({ id }: GenerateReportButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setIsLoading(true);
    setError(null);

    try {
      const result = await generateClaudeReport(id);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error ?? 'Rapor üretilemedi.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('Bir hata oluştu.');
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={isLoading}
        onClick={handleGenerate}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#4f20c0] to-[#b5179e] hover:scale-[1.02] text-white px-5 py-3 rounded text-xs font-bold transition-all shadow-lg shadow-purple-500/10 disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
        <span>{isLoading ? 'Rapor Hazırlanıyor...' : 'Claude Strateji Raporu Üret'}</span>
      </button>
      {error && (
        <p className="text-xs text-red-655 bg-red-50 px-3 py-1.5 rounded-sm border border-red-100 w-fit font-bold">
          {error}
        </p>
      )}
    </div>
  );
}
