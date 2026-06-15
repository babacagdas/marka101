// src/app/page.tsx → /marka101 redirect
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/marka101');
}
