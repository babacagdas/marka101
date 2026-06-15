// src/app/(studio)/layout.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { AgencyProvider, useAgency } from '@/features/diagnoses/components/studio/AgencyContext';


interface SubMenuItem {
  name: string;
  path: string;
  icon: string;
}

interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  items: SubMenuItem[];
}

function StudioTopHeader({ activeCategoryName }: { readonly activeCategoryName: string }) {
  const pathname = usePathname();
  const { leads, projects, tasks } = useAgency();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [userEmail, setUserEmail] = useState<string>('elena.creative@deep.com');
  const [userName, setUserName] = useState<string>('Elena Creative');

  useEffect(() => {
    const supabase = createClient();
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? '');
        const name = user.user_metadata?.display_name || user.user_metadata?.name || user.email || 'Ajans Paneli';
        setUserName(name);
      }
    }
    fetchUser();

    // Subscribe to auth updates to dynamically sync name
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserEmail(session.user.email ?? '');
        const name = session.user.user_metadata?.display_name || session.user.user_metadata?.name || session.user.email || 'Ajans Paneli';
        setUserName(name);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const initials = userName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'EC';

  const matches = useMemo(() => {
    if (!searchQuery.trim()) return { leads: [], projects: [], tasks: [] };
    const q = searchQuery.toLowerCase();
    return {
      leads: leads.filter(l => l.brandName.toLowerCase().includes(q)).slice(0, 3),
      projects: projects.filter(p => p.name.toLowerCase().includes(q)).slice(0, 3),
      tasks: tasks.filter(t => t.title.toLowerCase().includes(q)).slice(0, 3),
    };
  }, [searchQuery, leads, projects, tasks]);

  const hasMatches = matches.leads.length > 0 || matches.projects.length > 0 || matches.tasks.length > 0;

  return (
    <header className="flex flex-col sm:flex-row justify-between items-center py-4 px-2 mb-6 relative z-40 gap-4 no-print">
      {/* Header Greeting Info */}
      <div className="flex items-center gap-3 text-left">
        <div className="w-1.5 h-7 bg-gradient-to-b from-[#4f20c0] to-[#b5179e] rounded-full" />
        <div>
          <h2 className="text-sm sm:text-base font-black text-[#f6f5fa] leading-tight poppins-important tracking-wide">
            {pathname === '/studio/panel' ? `İyi Günler, ${userName.split(' ')[0]}` : activeCategoryName}
          </h2>
          <p className="text-[10px] text-[#928ca1] font-bold mt-0.5">
            {pathname === '/studio/panel' ? 'Haftalık ajans ve finansal güncellemelerinizi inceleyin.' : 'Deep Creative Yönetim Platformu'}
          </p>
        </div>
      </div>

      {/* Profile Action Icons & Badge Info */}
      <div className="flex items-center gap-4">
        {/* Search Input Container */}
        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded border border-white/10 relative">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px] text-[#8c869e] pl-1.5">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 250)}
              placeholder="Marka veya proje ara..."
              className="bg-transparent border-0 text-xs text-[#f1ecf9] w-28 focus:w-44 transition-all focus:ring-0 focus:outline-none placeholder-[#7d778f] py-0.5 font-bold"
            />
          </div>

          <button className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded transition-all text-[#8c869e] hover:text-[#f1ecf9] relative">
            <span className="material-symbols-outlined text-[18px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#b5179e] rounded-full ring-2 ring-[#06050b]" />
          </button>

          {/* Search Dropdown Panel */}
          {showSearchResults && searchQuery.trim() && (
            <div className="absolute top-12 right-0 w-64 bg-[#0e0b1a] border border-white/10 rounded-lg p-3.5 shadow-2xl text-xs space-y-3.5 z-50 text-left animate-fade-in-up">
              {hasMatches ? (
                <>
                  {/* Matching Brands */}
                  {matches.leads.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-[#8c869e] uppercase tracking-wider block">Markalar</span>
                      <div className="space-y-1">
                        {matches.leads.map(l => (
                          <Link
                            key={l.id}
                            href={`/studio/marka101/${l.id}`}
                            className="block p-1.5 rounded hover:bg-white/5 text-[#f1ecf9] font-bold truncate transition-all"
                          >
                            🏢 {l.brandName}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Projects */}
                  {matches.projects.length > 0 && (
                    <div className="space-y-1 pt-1.5 border-t border-white/5">
                      <span className="text-[9px] font-bold text-[#8c869e] uppercase tracking-wider block">Projeler</span>
                      <div className="space-y-1">
                        {matches.projects.map(p => (
                          <Link
                            key={p.id}
                            href="/studio/projeler"
                            className="block p-1.5 rounded hover:bg-white/5 text-[#f1ecf9] font-bold truncate transition-all"
                          >
                            📁 {p.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Tasks */}
                  {matches.tasks.length > 0 && (
                    <div className="space-y-1 pt-1.5 border-t border-white/5">
                      <span className="text-[9px] font-bold text-[#8c869e] uppercase tracking-wider block">Görevler</span>
                      <div className="space-y-1">
                        {matches.tasks.map(t => (
                          <Link
                            key={t.id}
                            href="/studio/gorevler"
                            className="block p-1.5 rounded hover:bg-white/5 text-[#f1ecf9] font-bold truncate transition-all"
                          >
                            ✓ {t.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-3 text-center text-[#8c869e] text-[10px]">
                  Eşleşen sonuç bulunamadı.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-4 w-[1px] bg-white/10" />

        <Link
          href="/studio/profil"
          className="flex items-center gap-3 hover:opacity-90 group transition-all cursor-pointer"
        >
          <div className="text-right hidden sm:block">
            <p className="text-xs sm:text-sm font-black text-[#f1ecf9] leading-tight poppins-important tracking-wide group-hover:text-white transition-colors">{userName}</p>
            <p className="text-[9px] font-bold text-[#8c869e] leading-tight mt-0.5">{userEmail}</p>
          </div>
          <div className="w-9 h-9 rounded bg-gradient-to-br from-[#4f20c0] to-[#b5179e] text-white flex items-center justify-center text-xs font-black ring-2 ring-white/10 shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
            {initials}
          </div>
        </Link>
      </div>
    </header>
  );
}

export default function StudioLayout({ children }: { readonly children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isGiris = pathname === '/studio/giris';
  const isPresentMode = pathname.endsWith('/present');

  // State to manage active category expansion in accordion
  const [activeCategory, setActiveCategory] = useState<string>('dashboard');

  // Optimized list: 21 features consolidated into 13 highly integrated pages
  const categories: MenuCategory[] = [
    {
      id: 'dashboard',
      name: 'Pano & Analitik',
      icon: 'dashboard',
      items: [
        { name: 'Dashboard', path: '/studio/panel', icon: 'monitoring' },
        { name: 'Finans & Bütçe', path: '/studio/finans', icon: 'payments' },
        { name: 'Raporlar & İçgörüler', path: '/studio/raporlar', icon: 'assessment' },
      ],
    },
    {
      id: 'crm',
      name: 'CRM & Satış',
      icon: 'handshake',
      items: [
        { name: 'Marka101', path: '/studio/marka101', icon: 'star' },
        { name: 'Potansiyeller (Pipeline)', path: '/studio/potansiyeller', icon: 'query_stats' },
        { name: 'Müşteriler', path: '/studio/musteriler', icon: 'group' },
        { name: 'Teklif Merkezi', path: '/studio/teklifler', icon: 'gavel' },
      ],
    },
    {
      id: 'workflow',
      name: 'İş Akışı & Operasyon',
      icon: 'account_tree',
      items: [
        { name: 'Projeler', path: '/studio/projeler', icon: 'folder_open' },
        { name: 'Görevler', path: '/studio/gorevler', icon: 'task_alt' },
        { name: 'Brief & Dokümanlar', path: '/studio/briefler', icon: 'description' },
        { name: 'Görsel Kütüphane', path: '/studio/gorsel-kutuphane', icon: 'photo_library' },
        { name: 'Takvim & Toplantı', path: '/studio/takvim', icon: 'calendar_month' },
      ],
    },
    {
      id: 'intelligence',
      name: 'Zeka & Bilgi',
      icon: 'psychology',
      items: [
        { name: 'AI Danışman', path: '/studio/ai-danisman', icon: 'smart_toy' },
        { name: 'Otomasyon & Bilgi', path: '/studio/otomasyonlar', icon: 'bolt' },
      ],
    },
    {
      id: 'admin',
      name: 'Yönetim & Sistem',
      icon: 'settings',
      items: [
        { name: 'Profilim', path: '/studio/profil', icon: 'account_circle' },
        { name: 'Freelancer & Tedarikçi', path: '/studio/freelancers', icon: 'engineering' },
        { name: 'Ekip & Yetki', path: '/studio/ekip', icon: 'badge' },
        { name: 'Ayarlar', path: '/studio/ayarlar', icon: 'settings_accessibility' },
      ],
    },
  ];

  // Auto-select category based on active path
  useEffect(() => {
    // Check if the current pathname maps to a sub-item
    const matchedCategory = categories.find((cat) =>
      cat.items.some((item) => pathname.startsWith(item.path))
    );
    if (matchedCategory) {
      setActiveCategory(matchedCategory.id);
    }
  }, [pathname]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/studio/giris');
    router.refresh();
  }

  if (isGiris || isPresentMode) {
    return <>{children}</>;
  }

  const activeCategoryData = categories.find((c) => c.id === activeCategory) ?? categories[0];

  return (
    <AgencyProvider>
      <div className="studio-root min-h-screen bg-[#06050b] text-[#c9c5d8] flex font-sans antialiased relative selection:bg-purple-500/20 selection:text-[#b5179e] overflow-x-hidden">
        
        {/* Soft background mesh glows */}
        <div className="absolute top-0 left-0 w-[50%] h-[40%] bg-gradient-to-br from-[#4f20c0]/12 to-transparent rounded-full blur-[130px] pointer-events-none z-0" />
        <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-gradient-to-tl from-[#b5179e]/8 to-transparent rounded-full blur-[130px] pointer-events-none z-0" />

        {/* ── Outer Layout Sidebar Panel (Single Accordion Sidebar) ── */}
        <div className="flex shrink-0 z-40 no-print sticky top-0 h-screen p-4 pr-0">
          
          {/* Main Sidebar Capsule */}
          <aside className="w-64 sidebar-capsule rounded-md flex flex-col py-6 justify-between gap-6 h-full">
            {/* Top: Logo & Branding */}
            <div className="flex flex-col items-center gap-4 w-full px-4 shrink-0">
              <Link 
                href="/studio/panel" 
                className="w-full flex items-center gap-3 hover:scale-[1.02] transition-all duration-300"
              >
                <img 
                  src="/studio-logo.png" 
                  alt="Deep Creative Monogram" 
                  className="w-10 h-10 object-contain shrink-0"
                />
                <div className="flex flex-col text-left">
                  <span className="text-sm font-black text-[#f6f5fa] tracking-wider uppercase leading-none poppins-important">Deep Creative</span>
                  <span className="text-[9px] text-[#8c869e] font-bold mt-1">STUDIO</span>
                </div>
              </Link>
              <div className="w-full h-[1px] bg-white/10" />
            </div>

            {/* Middle: Category Selector (Accordion) */}
            <nav className="flex flex-col gap-2 w-full px-3 flex-grow overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <div key={cat.id} className="flex flex-col w-full gap-1">
                    <button
                      onClick={() => {
                        setActiveCategory(isActive ? '' : cat.id);
                      }}
                      className={`w-full px-3.5 py-3 rounded flex items-center justify-between transition-all duration-300 relative group ${
                        isActive
                          ? 'bg-gradient-to-r from-[#4f20c0] to-[#b5179e] text-white shadow-[0_4px_15px_rgba(79,32,192,0.3)] font-bold'
                          : 'text-[#8c869e] hover:text-[#f1ecf9] hover:bg-white/5 font-semibold'
                      }`}
                      title={cat.name}
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="material-symbols-outlined text-[20px] shrink-0">{cat.icon}</span>
                        <span className="text-xs tracking-wide text-left">{cat.name}</span>
                      </div>
                      <span className={`material-symbols-outlined text-[16px] transition-transform duration-300 shrink-0 ${
                        isActive ? 'rotate-90 text-white' : 'text-[#8c869e] group-hover:text-[#f1ecf9]'
                      }`}>
                        chevron_right
                      </span>
                      {isActive && (
                        <span className="absolute left-0 w-1 h-6 bg-white rounded-r-full animate-pulse" />
                      )}
                    </button>

                    {/* Submenu items */}
                    {isActive && (
                      <div className="flex flex-col gap-1 pl-6 py-1 pr-1 transition-all duration-300 animate-fade-in-up">
                        {cat.items.map((item) => {
                          const isSubActive = pathname === item.path;
                          return (
                            <Link
                              key={item.path}
                              href={item.path}
                              className={`px-3 py-2 rounded text-[11px] font-bold flex items-center gap-2.5 transition-all duration-200 ${
                                isSubActive
                                  ? 'bg-[#4f20c0]/20 text-[#f1ecf9] border border-[#4f20c0]/30 shadow-[0_0_10px_rgba(79,32,192,0.15)]'
                                  : 'text-[#8c869e] hover:bg-white/5 hover:text-[#f1ecf9]'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[14px] shrink-0">{item.icon}</span>
                              <span>{item.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
 
            {/* Bottom: Logout */}
            <div className="flex flex-col items-center gap-4 w-full mt-auto px-3 shrink-0">
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="w-full px-3.5 py-3 rounded flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all duration-300 text-xs font-bold"
                title="Güvenli Çıkış"
              >
                <span className="material-symbols-outlined text-[20px] shrink-0">logout</span>
                <span>Güvenli Çıkış</span>
              </button>
            </div>
          </aside>
        </div>

        {/* ── Main Work Canvas Content Area ───────────────────────── */}
        <div className="flex-grow min-h-screen flex flex-col p-4 md:p-6 pl-4 z-10 relative overflow-hidden">
          
          <StudioTopHeader activeCategoryName={activeCategoryData.name} />

          {/* Page Body Wrapper Canvas */}
          <main className="flex-grow flex flex-col relative z-10 w-full">
            {children}
          </main>
        </div>
      </div>
    </AgencyProvider>
  );
}
