// src/features/diagnoses/components/public/DiagnosisProgress.tsx

interface DiagnosisProgressProps {
  current: number;
  total:   number;
  label:   string;
}

export function DiagnosisProgress({ current, total, label }: DiagnosisProgressProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-label-lg text-primary uppercase tracking-widest">
          {label}
        </span>
        <span className="text-label-md text-secondary tabular-nums">
          {current}&thinsp;/&thinsp;{total}
        </span>
      </div>
      <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-full bg-primary-container rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
