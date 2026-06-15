// src/app/(public)/marka101/form/page.tsx
import { PublicShell } from '@/features/diagnoses/components/public/PublicShell'
import { DiagnosisWizard } from '@/features/diagnoses/components/public/DiagnosisWizard'

export const metadata = { title: 'Marka Analiz Formu — Deep Creative Marka101' }

export default function Marka101FormPage() {
  return (
    <PublicShell>
      <DiagnosisWizard />
    </PublicShell>
  )
}
