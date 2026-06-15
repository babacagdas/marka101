// src/app/(studio)/studio/page.tsx → /studio/marka101 redirect
import { redirect } from 'next/navigation';

export default function StudioRootPage() {
  redirect('/studio/marka101');
}
