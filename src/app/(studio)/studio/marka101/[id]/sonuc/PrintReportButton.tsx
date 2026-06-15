// src/app/(studio)/studio/marka101/[id]/sonuc/PrintReportButton.tsx
'use client';

interface PrintReportButtonProps {
  readonly id: string;
}

export function PrintReportButton({ id }: PrintReportButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.open(`/studio/marka101/${id}/rapor`, '_blank')}
      className="no-print inline-flex items-center gap-2 border border-white/10 bg-white/5 hover:bg-white/10 text-[#f1ecf9] hover:text-white px-4 py-2.5 rounded text-xs font-bold transition-all shadow-sm hover:border-[#4f20c0]/30"
    >
      <svg
        className="w-4 h-4 text-[#8c869e]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
        />
      </svg>
      <span>Yazdır / PDF Raporu</span>
    </button>
  );
}

