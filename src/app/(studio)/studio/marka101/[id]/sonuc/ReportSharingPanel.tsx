// src/app/(studio)/studio/marka101/[id]/sonuc/ReportSharingPanel.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateReportLockStatus } from '@/features/diagnoses/lib/actions';

interface ReportSharingPanelProps {
  readonly id: string;
  readonly initialIsLocked: boolean;
}

export function ReportSharingPanel({ id, initialIsLocked }: ReportSharingPanelProps) {
  const router = useRouter();
  const [isLocked, setIsLocked] = useState(initialIsLocked);
  const [isUpdating, setIsUpdating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPublicLink = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/marka101/sonuc/${id}`;
    }
    return `/marka101/sonuc/${id}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getPublicLink());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleToggleLock = async () => {
    setIsUpdating(true);
    setError(null);
    try {
      const nextLocked = !isLocked;
      const res = await updateReportLockStatus(id, nextLocked);
      if (res.success) {
        setIsLocked(nextLocked);
        router.refresh();
      } else {
        setError(res.error ?? 'Kilit durumu güncellenemedi.');
      }
    } catch (err) {
      console.error(err);
      setError('Bir hata oluştu.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="glass-card rounded-md p-5 shadow-sm space-y-4 no-print text-xs text-gray-700">
      
      {/* Title */}
      <div>
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Müşteri Paylaşım & Sunum</h4>
        <p className="text-[10px] text-gray-500 mt-0.5">Raporu müşteriye sunun veya kilitli link ile satılabilir hale getirin.</p>
      </div>

      <hr className="border-gray-100" />

      {/* Presentation Mode Link */}
      <div>
        <Link
          href={`/studio/marka101/${id}/present`}
          className="w-full px-3 py-2.5 bg-gradient-to-r from-[#4f20c0] to-[#b5179e] hover:opacity-90 text-white font-bold rounded flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-purple-500/10 text-center"
        >
          <span className="material-symbols-outlined text-[16px]">play_circle</span>
          Sunum Modunu Başlat
        </Link>
      </div>

      <hr className="border-gray-100" />

      {/* Lock status toggle */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-700">Müşteri Paylaşım Kilidi</span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm font-bold text-[10px] border ${
            isLocked 
              ? 'bg-red-500/10 text-red-600 border-red-500/20' 
              : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
          }`}>
            <span className="material-symbols-outlined text-[12px]">{isLocked ? 'lock' : 'lock_open'}</span>
            {isLocked ? 'Kilitli' : 'Kilit Yok'}
          </span>
        </div>

        <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
          {isLocked 
            ? 'Kilitli olduğunda, müşteri detaylı analiz raporunu göremez; sadece özet puanları ve premium danışmanlık paketi ödeme duvarını görür.'
            : 'Rapor herkese açık. Müşteri paylaştığınız linke tıklayarak tüm yol haritasını, bulguları ve eylem planını görebilir.'
          }
        </p>

        <button
          type="button"
          disabled={isUpdating}
          onClick={handleToggleLock}
          className={`w-full py-2 font-bold rounded text-xs transition-all border text-center flex items-center justify-center gap-1.5 ${
            isLocked
              ? 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
              : 'bg-red-50/50 hover:bg-red-50 border-red-200 text-red-655'
          }`}
        >
          {isUpdating ? (
            <span className="animate-spin h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <>
              <span className="material-symbols-outlined text-[14px]">{isLocked ? 'lock_open' : 'lock'}</span>
              {isLocked ? 'Kilidi Kaldır (Herkese Aç)' : 'Raporu Kilitle (Ödeme Duvarı)'}
            </>
          )}
        </button>
      </div>

      <hr className="border-gray-100" />

      {/* Copy link section */}
      <div className="space-y-2">
        <span className="font-bold text-gray-700 block">Müşteri Paylaşım Linki</span>
        <div className="flex gap-1.5">
          <input
            type="text"
            readOnly
            value={getPublicLink()}
            className="flex-grow bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-[11px] text-gray-500 font-mono outline-none"
          />
          <button
            type="button"
            onClick={handleCopyLink}
            className={`px-3 py-1.5 rounded font-bold transition-all text-xs border ${
              copied
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
            }`}
          >
            {copied ? 'Kopyalandı!' : 'Kopyala'}
          </button>
        </div>
        
        <a
          href={`/marka101/sonuc/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-bold text-[#4f20c0] hover:text-[#3f199b] inline-flex items-center gap-0.5"
        >
          Müşteri Görünümünü Test Et
          <span className="material-symbols-outlined text-[12px]">open_in_new</span>
        </a>
      </div>

      {error && (
        <p className="text-[10px] text-red-655 bg-red-50 border border-red-200 rounded-sm px-2.5 py-1.5 text-center font-bold">
          {error}
        </p>
      )}
    </div>
  );
}
