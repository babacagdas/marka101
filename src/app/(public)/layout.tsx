// src/app/(public)/layout.tsx
// Public taraf — auth yok, minimal layout
export default function PublicLayout({ children }: { readonly children: React.ReactNode }) {
  return <>{children}</>;
}
