// src/app/(public)/teklif/[id]/ProposalClientSignForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { acceptProposal } from '@/features/diagnoses/lib/proposal-actions';

interface ProposalClientSignFormProps {
  readonly id: string;
}

export function ProposalClientSignForm({ id }: ProposalClientSignFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Lütfen imza yerine geçecek adınızı ve soyadınızı girin.');
      return;
    }

    if (!acceptedTerms) {
      setError('Lütfen iş koşullarını kabul ettiğinizi onaylayın.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await acceptProposal(id, name.trim());
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        setError(result.error ?? 'Teklif onaylanırken bir hata oluştu.');
      }
    } catch (err) {
      console.error(err);
      setError('Sistemsel bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-4 space-y-2 animate-scale-up">
        <div className="inline-flex w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-250 items-center justify-center animate-bounce">
          <span className="material-symbols-outlined text-[20px]">done</span>
        </div>
        <h4 className="text-xs font-black text-emerald-700">Tebrikler! Teklif Başarıyla İmzalandı</h4>
        <p className="text-[9px] text-stone-500 font-semibold mt-1">İş birliğimiz resmileşti. Detaylar güncelleniyor...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-stone-700">
      <div className="space-y-1">
        <label htmlFor="client-sign-name" className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider">
          Adınız Soyadınız (Dijital İmza) *
        </label>
        <input
          id="client-sign-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Örn: Ahmet Yılmaz"
          className="w-full bg-white border border-stone-200 rounded px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#4f20c0] transition-all"
        />
      </div>

      <div className="flex items-start gap-2.5">
        <input
          id="client-sign-terms"
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded text-[#4f20c0] border-stone-300 focus:ring-[#4f20c0]"
        />
        <label htmlFor="client-sign-terms" className="text-[10px] text-stone-500 font-semibold leading-relaxed select-none cursor-pointer">
          Teklif koşullarını, deliverables listesini ve Deep Creative iş şartlarını okudum, dijital olarak onaylıyorum.
        </label>
      </div>

      {error && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 text-[10px] font-bold rounded-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-[#4f20c0] to-[#b5179e] hover:scale-[1.02] text-white py-2.5 rounded font-extrabold shadow-md shadow-purple-500/10 hover:shadow-purple-500/20 transition-all disabled:opacity-50 text-xs"
      >
        {isSubmitting ? 'Onaylanıyor...' : 'Teklifi Kabul Et ve İmzala'}
      </button>
    </form>
  );
}
