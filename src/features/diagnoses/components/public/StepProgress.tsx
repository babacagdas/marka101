// src/features/diagnoses/components/public/StepProgress.tsx
'use client';

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  labels: readonly { number: number; label: string }[];
}

export function StepProgress({ currentStep, totalSteps, labels }: StepProgressProps) {
  const pct = Math.round((currentStep / totalSteps) * 100);
  const currentLabel = labels.find((s) => s.number === currentStep)?.label ?? '';

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{currentLabel}</span>
        <span className="text-xs text-gray-400">{currentStep} / {totalSteps}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gray-900 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
