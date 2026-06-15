// src/app/(studio)/studio/marka101/[id]/rapor/PrintActionButton.tsx
'use client';

export function PrintActionButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-4 py-1.5 bg-gradient-to-r from-[#4f20c0] to-[#b5179e] text-white font-extrabold rounded text-xs hover:scale-[1.02] transition-all"
    >
      Yazdır / PDF Kaydet
    </button>
  );
}
