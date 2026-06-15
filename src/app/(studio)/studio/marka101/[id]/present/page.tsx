// src/app/(studio)/studio/marka101/[id]/present/page.tsx
import { notFound } from 'next/navigation';
import { getDiagnosisById } from '@/features/diagnoses';
import { PresentationMode } from '@/features/diagnoses/components/studio/PresentationMode';

interface Props {
  readonly params: { readonly id: string };
}

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sunum Modu — Studio' };

export default async function BrandPresentationPage({ params }: Props) {
  const diagnosis = await getDiagnosisById(params.id);
  if (!diagnosis) notFound();

  return <PresentationMode diagnosis={diagnosis} />;
}
