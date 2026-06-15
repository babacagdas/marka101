// src/app/(public)/teklif/[id]/PrintProposalButton.tsx
'use client';

export function PrintProposalButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-white font-extrabold rounded text-[10px] transition-all border border-white/10"
    >
      Yazdır / PDF İndir
    </button>
  );
}
