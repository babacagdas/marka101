// src/app/(public)/teklif/[id]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProposalById } from '@/features/diagnoses/lib/proposal-actions';
import { ProposalClientSignForm } from './ProposalClientSignForm';
import { PrintProposalButton } from './PrintProposalButton';


interface Props { readonly params: { readonly id: string } }

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props) {
  const result = await getProposalById(params.id);
  return { title: result.success && result.data ? `${result.data.title} — Teklif` : 'Hizmet Teklifi' };
}

export default async function PublicProposalPage({ params }: Props) {
  const result = await getProposalById(params.id);
  if (!result.success || !result.data) {
    notFound();
  }

  const proposal = result.data;
  const clientInfo = result.client;

  // Parse structured items
  let items: any[] = [];
  let signature: { name: string; signedAt: string } | null = null;

  try {
    if (proposal.description) {
      const parsed = JSON.parse(proposal.description);
      items = parsed.items || [];
      signature = parsed.signature || null;
    }
  } catch (e) {
    // Fallback if not JSON format
    items = [
      {
        title: proposal.title,
        description: proposal.description || 'Hizmet detayları',
        price: Number(proposal.value)
      }
    ];
  }

  // Fallback due date
  const createdDate = new Date(proposal.created_at);
  const dueDate = new Date(createdDate.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days later

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#2d2a25] py-10 px-4 sm:px-8 md:py-16 relative">
      
      {/* Client print header - hidden on print */}
      <div className="no-print bg-[#16141a] text-white rounded-md p-4 mb-8 flex justify-between items-center max-w-3xl mx-auto shadow-md border border-white/5">
        <div>
          <h4 className="text-xs font-bold">Deep Creative Hizmet Teklifi</h4>
          <p className="text-[10px] text-stone-400 mt-0.5">Teklif detaylarını inceleyebilir, indirebilir ve dijital olarak imzalayabilirsiniz.</p>
        </div>
        <div className="flex gap-2">
          <PrintProposalButton />
        </div>
      </div>

      {/* Main Document Body */}
      <div className="max-w-3xl mx-auto bg-white border border-stone-200/60 p-8 sm:p-12 md:p-16 shadow-md print:shadow-none print:border-0 print:p-0 min-h-[297mm] flex flex-col justify-between">
        
        {/* Top Section: Logo and Title */}
        <div className="space-y-8">
          <div className="flex justify-between items-start border-b-2 border-stone-900 pb-6">
            <div className="flex items-center gap-2">
              <img src="/studio-logo.png" alt="Logo" className="w-9 h-9 object-contain" />
              <div className="text-left">
                <span className="font-black text-sm tracking-wider text-stone-950 block leading-tight">DEEP CREATIVE</span>
                <span className="text-[8px] font-bold text-stone-400 block tracking-widest uppercase">Digital Branding Studio</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-extrabold tracking-widest text-[#4f20c0] bg-purple-50 border border-purple-100/50 px-2.5 py-0.5 rounded-full uppercase">
                Hizmet Teklifi
              </span>
              <span className="text-[9px] text-stone-400 font-bold block mt-2">
                REF: DC_PROP_{proposal.id.slice(0, 6).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Client Metadata block */}
          <div className="grid grid-cols-2 gap-8 bg-stone-50/70 border border-stone-100 rounded-md p-5 text-xs text-stone-700">
            <div className="space-y-2">
              <div>
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Teklif Alıcısı (Müşteri)</span>
                <span className="font-black text-stone-900 mt-0.5 block">{clientInfo?.name || proposal.title}</span>
              </div>
              {clientInfo?.contact && clientInfo.contact !== clientInfo.name && (
                <div>
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">İlgili Temsilci</span>
                  <span className="font-semibold text-stone-700 mt-0.5 block">{clientInfo.contact}</span>
                </div>
              )}
            </div>
            <div className="space-y-2 border-l border-stone-200/80 pl-8">
              <div>
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Teklif Tarihi</span>
                <span className="font-bold text-stone-800 mt-0.5 block">
                  {createdDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Son Geçerlilik</span>
                <span className="font-bold text-stone-800 mt-0.5 block">
                  {dueDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Service Items Table */}
          <div className="space-y-4 pt-4">
            <h3 className="text-xs font-black text-stone-900 uppercase tracking-widest border-b border-stone-200 pb-1.5">
              Hizmet Kalemleri & Fiyatlandırma
            </h3>
            
            <div className="border border-stone-200 rounded overflow-hidden">
              <table className="w-full border-collapse text-left text-xs text-stone-700">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                    <th className="p-3 pl-4">Hizmet / Deliverable</th>
                    <th className="p-3 text-right pr-4">Tutar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {items.map((item, idx) => (
                    <tr key={idx} className="align-top">
                      <td className="p-4 pl-4 space-y-1">
                        <span className="font-bold text-stone-900 block">{item.title}</span>
                        <span className="text-[10px] text-stone-500 font-medium leading-relaxed block">
                          {item.description}
                        </span>
                      </td>
                      <td className="p-4 text-right pr-4 font-bold text-stone-900 tabular-nums">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(item.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Value Block */}
            <div className="flex justify-end pt-3">
              <div className="bg-stone-50 border border-stone-200 rounded-md px-6 py-4 text-right space-y-1 min-w-[200px]">
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Toplam Bütçe</span>
                <span className="text-lg font-black text-[#4f20c0] block">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(proposal.value)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Terms & Signature Form */}
        <div className="mt-12 pt-8 border-t-2 border-stone-900 space-y-8">
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Koşullar & İş Birlikleri</h4>
            <ul className="list-disc ml-4 text-[10px] text-stone-500 leading-relaxed font-semibold space-y-1">
              <li>Teklif onayını takiben bütçenin %50'si ön ödeme (avans) olarak tahsil edilir, kalan bütçe iş tesliminde faturalandırılır.</li>
              <li>Tasarım ve geliştirme süreçlerindeki revizyon hakları her kalem için maksimum 3 adet ile sınırlandırılmıştır.</li>
              <li>Deep Creative, iş teslimi sonrasında 30 gün boyunca ücretsiz teknik bakım desteği sağlamayı taahhüt eder.</li>
            </ul>
          </div>

          {/* Interactive Signature Area */}
          <div className="bg-stone-50 border border-stone-200/80 rounded-md p-6 max-w-lg mx-auto">
            {proposal.status === 'accepted' && signature ? (
              <div className="text-center py-4 space-y-3">
                <div className="inline-flex w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200 items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-emerald-700">Bu Teklif Dijital Olarak İmzalanmış ve Onaylanmıştır</h4>
                  <div className="text-[10px] text-stone-500 mt-2 font-bold space-y-1 bg-white border border-stone-150 rounded p-3 italic max-w-[250px] mx-auto">
                    <p>İmzalayan: {signature.name}</p>
                    <p>Tarih: {new Date(signature.signedAt).toLocaleString('tr-TR')}</p>
                  </div>
                </div>
              </div>
            ) : (
              <ProposalClientSignForm id={proposal.id} />
            )}
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
          main, .flex-grow {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
        }
      ` }} />

    </div>
  );
}
