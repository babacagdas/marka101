// src/features/diagnoses/components/public/QuestionCard.tsx
// Beyaz Stitch UI — tüm soru tiplerini destekler.
import { useState } from "react";
import type { DiagnosisQuestion, DiagnosisAnswerValue } from "../../diagnosis-types";

interface QuestionCardProps {
  question:  DiagnosisQuestion;
  value:     DiagnosisAnswerValue | undefined;
  onChange:  (value: DiagnosisAnswerValue) => void;
  onNext:    () => void;
  onBack:    () => void;
  canGoBack: boolean;
  isLast:    boolean;
}

function isAnswered(q: DiagnosisQuestion, v: DiagnosisAnswerValue | undefined): boolean {
  if (q.optional) return true;
  if (v === undefined) return false;
  if (typeof v === "number")  return v >= 1 && v <= 5;
  if (typeof v === "string")  return v.trim().length > 0;
  if (Array.isArray(v))       return v.length > 0;
  return false;
}

function toStr(v: DiagnosisAnswerValue | undefined): string {
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  return "";
}
function toArr(v: DiagnosisAnswerValue | undefined): string[] {
  return Array.isArray(v) ? (v as string[]) : [];
}

// ── Seçenek bileşenleri ──────────────────────────────────────────

function OptionBtn({ label, isSelected, onClick, prefix }: {
  label: string; isSelected: boolean; onClick: () => void; prefix?: string;
}) {
  return (
    <button type="button" onClick={onClick}
      className={[
        "w-full text-left px-5 py-4 rounded-xl border transition-all duration-150",
        "flex items-start gap-3 group",
        isSelected
          ? "border-primary/40 bg-primary/5 text-primary"
          : "border-surface-container bg-surface-container-low text-on-surface-variant",
        "hover:border-primary/30 hover:bg-surface-container active:scale-[0.99]",
      ].join(" ")}
    >
      {prefix !== undefined && (
        <span className={[
          "shrink-0 w-7 h-7 rounded-full border text-xs font-semibold",
          "flex items-center justify-center mt-0.5 transition-colors",
          isSelected ? "border-primary text-primary" : "border-outline text-outline group-hover:border-primary/50",
        ].join(" ")}>{prefix}</span>
      )}
      <span className="leading-snug text-sm md:text-base">{label}</span>
      {isSelected && (
        <span className="material-symbols-outlined ml-auto text-primary text-xl shrink-0"
          style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
      )}
    </button>
  );
}

function ScaleOpts({ q, value, onChange }: { q: DiagnosisQuestion; value: DiagnosisAnswerValue | undefined; onChange: (v: DiagnosisAnswerValue) => void }) {
  return (
    <div className="flex flex-col gap-2">
      {(q.options ?? []).map((opt, i) => (
        <OptionBtn key={i} label={opt.label} isSelected={value === opt.value as number}
          prefix={String(opt.value)} onClick={() => { const n = opt.value as number; onChange(n as unknown as DiagnosisAnswerValue); }} />
      ))}
    </div>
  );
}

const EV_ICONS: Record<string, string> = { evet: "✓", kısmen: "◐", hayır: "✕" };

function EvidenceOpts({ q, value, onChange }: { q: DiagnosisQuestion; value: DiagnosisAnswerValue | undefined; onChange: (v: DiagnosisAnswerValue) => void }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {(q.options ?? []).map((opt, i) => {
        const sv = opt.value as string;
        const sel = value === sv;
        return (
          <button key={i} type="button" onClick={() => onChange(sv)}
            className={[
              "w-full text-center px-4 py-4 rounded-xl border transition-all",
              "flex flex-col items-center gap-2",
              sel ? "border-primary/40 bg-primary/5 text-primary" : "border-surface-container bg-surface-container-low text-on-surface-variant",
              "hover:border-primary/30 active:scale-[0.99]",
            ].join(" ")}
          >
            <span className="text-lg">{EV_ICONS[sv] ?? ""}</span>
            <span className="text-sm leading-snug">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function SingleOpts({ q, value, onChange }: { q: DiagnosisQuestion; value: DiagnosisAnswerValue | undefined; onChange: (v: DiagnosisAnswerValue) => void }) {
  return (
    <div className="flex flex-col gap-2">
      {(q.options ?? []).map((opt, i) => {
        const sv = String(opt.value);
        return (
          <OptionBtn key={i} label={opt.label} isSelected={toStr(value) === sv} onClick={() => onChange(sv)} />
        );
      })}
    </div>
  );
}

function MultiOpts({ q, value, onChange }: { q: DiagnosisQuestion; value: DiagnosisAnswerValue | undefined; onChange: (v: DiagnosisAnswerValue) => void }) {
  const sel = toArr(value);
  const max = q.maxSelect ?? Infinity;
  const atMax = sel.length >= max;
  function toggle(v: string) {
    const idx = sel.indexOf(v);
    if (idx >= 0) onChange(sel.filter(x => x !== v));
    else if (sel.length < max) onChange([...sel, v]);
  }
  return (
    <div className="flex flex-col gap-2">
      {q.maxSelect !== undefined && (
        <p className="text-label-md text-secondary mb-1">
          En fazla {q.maxSelect} seçim{sel.length > 0 && <span className="text-primary ml-1">({sel.length}/{q.maxSelect})</span>}
        </p>
      )}
      {(q.options ?? []).map((opt, i) => {
        const sv = String(opt.value);
        const isSel = sel.includes(sv);
        const disabled = atMax && !isSel;
        return (
          <button key={i} type="button" disabled={disabled} onClick={() => toggle(sv)}
            className={[
              "w-full text-left px-5 py-4 rounded-xl border transition-all flex items-center gap-3",
              isSel ? "border-primary/40 bg-primary/5 text-primary" : "border-surface-container bg-surface-container-low text-on-surface-variant",
              disabled ? "opacity-40 cursor-not-allowed" : "hover:border-primary/30 active:scale-[0.99]",
            ].join(" ")}
          >
            <span className={[
              "shrink-0 w-4 h-4 rounded border flex items-center justify-center",
              isSel ? "border-primary bg-primary" : "border-outline",
            ].join(" ")}>
              {isSel && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </span>
            <span className="text-sm leading-snug">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function UrlInp({ value, onChange }: { value: DiagnosisAnswerValue | undefined; onChange: (v: DiagnosisAnswerValue) => void }) {
  return (
    <input type="url" inputMode="url" value={toStr(value)} onChange={e => onChange(e.target.value)}
      placeholder="https://"
      className="w-full px-5 py-4 rounded-xl border border-surface-container bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-colors" />
  );
}

function OEInp({ value, onChange }: { value: DiagnosisAnswerValue | undefined; onChange: (v: DiagnosisAnswerValue) => void }) {
  return (
    <textarea value={toStr(value)} onChange={e => onChange(e.target.value)} rows={4}
      placeholder="Cevabınızı yazın..."
      className="w-full px-5 py-4 rounded-xl border border-surface-container bg-surface-container-low text-on-surface text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-colors" />
  );
}

export function QuestionCard({ question, value, onChange, onNext, onBack, canGoBack, isLast }: QuestionCardProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const canAdvance = isAnswered(question, value);

  const renderOpts = () => {
    switch (question.type) {
      case "scale":       return <ScaleOpts   q={question} value={value} onChange={onChange} />;
      case "evidence":    return <EvidenceOpts q={question} value={value} onChange={onChange} />;
      case "singleSelect":return <SingleOpts   q={question} value={value} onChange={onChange} />;
      case "multiSelect": return <MultiOpts    q={question} value={value} onChange={onChange} />;
      case "url":         return <UrlInp value={value} onChange={onChange} />;
      case "openEnded":   return <OEInp value={value} onChange={onChange} />;
      default: return null;
    }
  };

  const showNext = question.type === "multiSelect" || question.type === "url" || question.type === "openEnded";

  return (
    <div className="w-full max-w-2xl mx-auto bg-surface-container-lowest rounded-lg premium-shadow border border-surface-container p-8 md:p-10 flex flex-col gap-6">
      {question.title && (
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-surface-container" />
          <span className="text-label-lg text-primary tracking-widest uppercase whitespace-nowrap">{question.title}</span>
          <span className="h-px flex-1 bg-surface-container" />
        </div>
      )}

      <h2 className="text-headline-md font-bold text-on-background leading-snug">{question.text}</h2>

      {question.tooltip && (
        <div>
          <button type="button" onClick={() => setTooltipOpen(o => !o)}
            className="text-label-md text-primary hover:text-primary-container transition-colors underline underline-offset-2">
            {tooltipOpen ? "İpucunu gizle" : "İpucu göster"}
          </button>
          {tooltipOpen && (
            <p className="mt-2 text-body-md text-secondary leading-relaxed bg-surface-container-low rounded-xl px-4 py-3">
              {question.tooltip}
            </p>
          )}
        </div>
      )}

      <div>{renderOpts()}</div>

      {showNext && (
        <div className="flex items-center gap-3 pt-2 border-t border-surface-container">
          {canGoBack && (
            <button type="button" onClick={onBack}
              className="flex items-center gap-2 px-6 py-3 rounded-full border border-primary text-primary text-label-lg hover:bg-primary-fixed transition-colors">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>Geri
            </button>
          )}
          <button type="button" onClick={onNext} disabled={!canAdvance}
            className={["flex-1 min-w-[140px] py-3 rounded-full text-label-lg transition-all flex items-center justify-center gap-2",
              canAdvance ? "bg-primary text-on-primary hover:opacity-90 shadow-primary-glow" : "bg-surface-container text-outline cursor-not-allowed"].join(" ")}>
            {isLast ? "Devam" : "Devam Et"}
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      )}

      {!showNext && canGoBack && (
        <button type="button" onClick={onBack}
          className="self-start text-label-md text-secondary hover:text-on-surface transition-colors">
          ← Geri
        </button>
      )}

      {question.optional && (
        <button type="button" onClick={onNext}
          className="self-end text-label-md text-secondary hover:text-on-surface transition-colors">
          Şimdi geçiyorum →
        </button>
      )}
    </div>
  );
}
