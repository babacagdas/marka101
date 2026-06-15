// src/app/(studio)/studio/freelancers/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Freelancer {
  id: string;
  record_type: string;
  name: string;
  expertise?: string;
  title_role?: string;
  email?: string;
  phone?: string;
  status: string; // 'active', 'passive'
  note?: string;
  iban?: string;
  tax_no?: string;
  company_type?: string;
  website?: string;
  social_link?: string;
  portfolio_link?: string;
  contract_link?: string;
  default_payment_method?: string;
  average_project_fee?: number;
  currency?: string;
  is_favorite: boolean;
  created_at?: string;
  updated_at?: string;
}

const RECORD_TYPES = [
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'supplier', label: 'Tedarikçi' },
  { value: 'platform_software', label: 'Platform / Yazılım' },
  { value: 'production', label: 'Prodüksiyon' },
  { value: 'team_support', label: 'Ekip Destek' },
  { value: 'other', label: 'Diğer' },
];

const EXPERTISE_OPTIONS: Record<string, string[]> = {
  freelancer: [
    'UI/UX Tasarım',
    'Grafik Tasarım',
    'Sosyal Medya Yönetimi',
    'Metin Yazarlığı',
    'Video Kurgu & Edit',
    'Motion Graphic',
    'Front-End Yazılım',
    'Back-End Yazılım',
    'Full-Stack Yazılım',
    'Mobile App Geliştirme',
    'SEO Uzmanlığı',
    'İllüstrasyon',
    'Çeviri / Çevirmen',
    'Diğer'
  ],
  supplier: [
    'Matbaa / Dijital Baskı',
    'Promosyon Ürünleri',
    'Sunucu / Hosting Sağlayıcı',
    'Donanım / Ofis Ekipmanları',
    'Catering / Yemek Organizasyon',
    'Kurye / Lojistik',
    'Kırtasiye & Ofis Malzemeleri',
    'Diğer'
  ],
  platform_software: [
    'Bulut Sunucu / Cloud Service',
    'CRM Yazılımı / Hizmeti',
    'Proje Yönetim Aracı',
    'Tasarım Yazılımı / Lisansı',
    'E-Posta Servisi (SMTP / Bülten)',
    'Pazarlama Otomasyonu',
    'E-Ticaret Altyapısı',
    'Analitik & Raporlama Aracı',
    'Yapay Zeka Servisleri / API',
    'Diğer'
  ],
  production: [
    'Video Çekimi',
    'Fotoğraf Çekimi',
    'Stüdyo Kiralama',
    'Kast Ajansı',
    'Seslendirme & Dublaj',
    'Müzik Stüdyosu / Ses Miks',
    'Drone Çekimi',
    'Post-Prodüksiyon',
    'Diğer'
  ],
  team_support: [
    'Proje Koordinatörlüğü',
    'Sanal Asistanlık',
    'Moderatörlük / Topluluk Yönetimi',
    'Müşteri İlişkileri Temsilcisi',
    'Teknik Destek Uzmanı',
    'Veri Girişi Elemanı',
    'Diğer'
  ],
  other: [
    'Genel Danışmanlık',
    'Hukuk Hizmetleri',
    'Muhasebe & Mali Müşavirlik',
    'Eğitim / Koçluk',
    'Diğer'
  ]
};

const COMPANY_TYPES = [
  { value: 'individual', label: 'Bireysel (Şirket Yok)' },
  { value: 'sole_proprietorship', label: 'Şahıs Şirketi' },
  { value: 'limited', label: 'Limited Şirket' },
  { value: 'joint_stock', label: 'Anonim Şirket' },
  { value: 'other', label: 'Diğer' },
];

const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Banka Havalesi / EFT' },
  { value: 'credit_card', label: 'Kredi Kartı' },
  { value: 'papara', label: 'Papara' },
  { value: 'crypto', label: 'Kripto Para' },
  { value: 'other', label: 'Diğer' },
];

const CURRENCIES = [
  { value: 'TRY', label: 'TRY' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
];

export default function FreelancersPage() {
  const [partners, setPartners] = useState<Freelancer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Relational Database States
  const [finances, setFinances] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [visuals, setVisuals] = useState<any[]>([]);

  // Form States (New / Edit)
  const [showFormModal, setShowFormModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Field values
  const [recordType, setRecordType] = useState('freelancer');
  const [name, setName] = useState('');
  const [expertise, setExpertise] = useState(EXPERTISE_OPTIONS.freelancer[0]);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('active');
  const [note, setNote] = useState('');
  
  // Advanced fields
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [iban, setIban] = useState('');
  const [taxNo, setTaxNo] = useState('');
  const [companyType, setCompanyType] = useState('individual');
  const [website, setWebsite] = useState('');
  const [socialLink, setSocialLink] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [contractLink, setContractLink] = useState('');
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState('bank_transfer');
  const [averageProjectFee, setAverageProjectFee] = useState<number>(0);
  const [currency, setCurrency] = useState('TRY');
  const [isFavorite, setIsFavorite] = useState(false);

  // Detail Panel State
  const [selectedPartner, setSelectedPartner] = useState<Freelancer | null>(null);
  const [detailTab, setDetailTab] = useState<'info' | 'payments' | 'jobs' | 'brands' | 'notes'>('info');

  const [activeTab, setActiveTab] = useState<string>('all'); // 'all', 'freelancer', 'supplier', 'platform', 'production', 'active', 'passive', 'risky', 'favorite'
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load partners list and related databases
  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        
        const [
          { data: freelancersData, error: freelancersError },
          { data: financesData },
          { data: projectsData },
          { data: clientsData },
          { data: tasksData },
          { data: visualsData }
        ] = await Promise.all([
          supabase.from('freelancers').select('*').order('created_at', { ascending: false }),
          supabase.from('finances').select('*').order('created_at', { ascending: false }),
          supabase.from('projects').select('*').order('created_at', { ascending: false }),
          supabase.from('clients').select('*').order('created_at', { ascending: false }),
          supabase.from('tasks').select('*').order('created_at', { ascending: false }),
          supabase.from('visual_library').select('*').order('created_at', { ascending: false })
        ]);

        if (freelancersError) throw freelancersError;
        
        if (freelancersData) setPartners(freelancersData);
        if (financesData) setFinances(financesData);
        if (projectsData) setProjects(projectsData);
        if (clientsData) setClients(clientsData);
        if (tasksData) setTasks(tasksData);
        if (visualsData) setVisuals(visualsData);

      } catch (err) {
        console.error('Error fetching freelancers page data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Filtered partners based on search and active tab
  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      // Search term
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (p.expertise && p.expertise.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      // Tab filter
      switch (activeTab) {
        case 'freelancer':
          return p.record_type === 'freelancer';
        case 'supplier':
          return p.record_type === 'supplier';
        case 'platform':
          return p.record_type === 'platform_software';
        case 'production':
          return p.record_type === 'production';
        case 'active':
          return p.status === 'active';
        case 'passive':
          return p.status === 'passive';
        case 'favorite':
          return p.is_favorite;
        default:
          return true;
      }
    });
  }, [partners, activeTab, searchTerm]);

  // Stats
  const stats = useMemo(() => {
    const active = partners.filter((p) => p.status === 'active').length;
    const favorite = partners.filter((p) => p.is_favorite).length;
    
    // Group categories to find the most frequent
    const counts: Record<string, number> = {};
    let maxCat = 'Yok';
    let maxCount = 0;
    partners.forEach((p) => {
      const typeLabel = RECORD_TYPES.find((t) => t.value === p.record_type)?.label || 'Diğer';
      counts[typeLabel] = (counts[typeLabel] || 0) + 1;
      if (counts[typeLabel] > maxCount) {
        maxCount = counts[typeLabel];
        maxCat = typeLabel;
      }
    });

    const overduePaymentsSum = finances
      .filter((f) => f.type === 'expense' && f.status === 'overdue')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    return {
      active,
      favorite,
      mostFrequentType: maxCat,
      overduePaymentsSum
    };
  }, [partners, finances]);

  const currentOptions = useMemo(() => {
    const opts = [...(EXPERTISE_OPTIONS[recordType] || EXPERTISE_OPTIONS.other || [])];
    if (expertise && !opts.includes(expertise)) {
      opts.unshift(expertise);
    }
    return opts;
  }, [recordType, expertise]);

  // Handle Create/Update Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      record_type: recordType,
      name: name.trim(),
      expertise: expertise.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      status,
      note: note.trim() || null,
      iban: iban.trim() || null,
      tax_no: taxNo.trim() || null,
      company_type: companyType,
      website: website.trim() || null,
      social_link: socialLink.trim() || null,
      portfolio_link: portfolioLink.trim() || null,
      contract_link: contractLink.trim() || null,
      default_payment_method: defaultPaymentMethod,
      average_project_fee: averageProjectFee || 0.00,
      currency,
      is_favorite: isFavorite,
    };

    try {
      const supabase = createClient();

      if (editId) {
        // Edit record
        const { data, error } = await supabase
          .from('freelancers')
          .update(payload)
          .eq('id', editId)
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setPartners((prev) => prev.map((item) => (item.id === editId ? data : item)));
          if (selectedPartner?.id === editId) {
            setSelectedPartner(data);
          }
          setShowFormModal(false);
        }
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('freelancers')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setPartners((prev) => [data, ...prev]);
          setShowFormModal(false);
        }
      }
    } catch (err: any) {
      console.error('Database submit error:', err);
      setErrorMsg(err.message || 'Kayıt işlemi sırasında hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Form for editing
  const handleEditClick = (partner: Freelancer) => {
    setEditId(partner.id);
    setRecordType(partner.record_type);
    setName(partner.name);
    setExpertise(partner.expertise || '');
    setEmail(partner.email || '');
    setPhone(partner.phone || '');
    setStatus(partner.status);
    setNote(partner.note || '');
    
    setIban(partner.iban || '');
    setTaxNo(partner.tax_no || '');
    setCompanyType(partner.company_type || 'individual');
    setWebsite(partner.website || '');
    setSocialLink(partner.social_link || '');
    setPortfolioLink(partner.portfolio_link || '');
    setContractLink(partner.contract_link || '');
    setDefaultPaymentMethod(partner.default_payment_method || 'bank_transfer');
    setAverageProjectFee(partner.average_project_fee || 0);
    setCurrency(partner.currency || 'TRY');
    setIsFavorite(partner.is_favorite);

    setShowAdvanced(true);
    setShowFormModal(true);
  };

  // Toggle favorite status directly from the card
  const toggleFavorite = async (id: string, currentVal: boolean) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('freelancers')
        .update({ is_favorite: !currentVal })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setPartners((prev) => prev.map((item) => (item.id === id ? data : item)));
        if (selectedPartner?.id === id) {
          setSelectedPartner(data);
        }
      }
    } catch (err) {
      console.error('Error updating favorite:', err);
    }
  };

  // Delete partner
  const handleDelete = async (id: string) => {
    if (!confirm('Bu kaydı tamamen silmek istediğinizden emin misiniz?')) return;
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('freelancers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPartners((prev) => prev.filter((p) => p.id !== id));
      if (selectedPartner?.id === id) {
        setSelectedPartner(null);
      }
    } catch (err) {
      console.error('Error deleting partner:', err);
    }
  };

  // Reset form fields for creating new
  const openCreateModal = () => {
    setEditId(null);
    setRecordType('freelancer');
    setName('');
    setExpertise(EXPERTISE_OPTIONS.freelancer[0]);
    setEmail('');
    setPhone('');
    setStatus('active');
    setNote('');
    
    setIban('');
    setTaxNo('');
    setCompanyType('individual');
    setWebsite('');
    setSocialLink('');
    setPortfolioLink('');
    setContractLink('');
    setDefaultPaymentMethod('bank_transfer');
    setAverageProjectFee(0);
    setCurrency('TRY');
    setIsFavorite(false);

    setShowAdvanced(false);
    setShowFormModal(true);
  };

  // Computed relational values for the selected freelancer
  const partnerFinances = useMemo(() => {
    if (!selectedPartner) return [];
    return finances.filter((f) => f.freelancer_id === selectedPartner.id);
  }, [selectedPartner, finances]);

  const paymentsSummary = useMemo(() => {
    const paid = partnerFinances
      .filter((f) => f.status === 'paid')
      .reduce((sum, f) => sum + Number(f.amount), 0);
    const pending = partnerFinances
      .filter((f) => f.status === 'pending' || f.status === 'planlandı')
      .reduce((sum, f) => sum + Number(f.amount), 0);
    const overdue = partnerFinances
      .filter((f) => f.status === 'overdue')
      .reduce((sum, f) => sum + Number(f.amount), 0);
    return { paid, pending, overdue };
  }, [partnerFinances]);

  const partnerTasks = useMemo(() => {
    if (!selectedPartner) return [];
    return tasks.filter((t) => t.assignee && t.assignee.name === selectedPartner.name);
  }, [selectedPartner, tasks]);

  const partnerVisuals = useMemo(() => {
    if (!selectedPartner) return [];
    
    // Find all projects the partner has worked on (either via assigned tasks or linked expenses)
    const taskProjectNames = partnerTasks.map((t) => t.projectName);
    const financeProjectIds = partnerFinances.map((f) => f.project_id).filter(Boolean);
    const financeProjectNames = projects.filter((p) => financeProjectIds.includes(p.id)).map((p) => p.name);
    
    const allProjectNames = Array.from(new Set([...taskProjectNames, ...financeProjectNames]));
    const partnerProjectIds = projects.filter((p) => allProjectNames.includes(p.name)).map((p) => p.id);
    
    return visuals.filter((v) => v.project_id && partnerProjectIds.includes(v.project_id));
  }, [selectedPartner, partnerTasks, partnerFinances, projects, visuals]);

  const partnerBrands = useMemo(() => {
    if (!selectedPartner) return [];
    
    // Find unique client IDs from finances
    const clientIdsFromFinances = partnerFinances.map((f) => f.client_id).filter(Boolean);
    
    // Find client IDs of the projects the partner worked on
    const taskProjectNames = partnerTasks.map((t) => t.projectName);
    const clientIdsFromProjects = projects
      .filter((p) => taskProjectNames.includes(p.name))
      .map((p) => p.client_id)
      .filter(Boolean);
      
    const uniqueClientIds = Array.from(new Set([...clientIdsFromFinances, ...clientIdsFromProjects]));
    return clients.filter((c) => uniqueClientIds.includes(c.id));
  }, [selectedPartner, partnerFinances, partnerTasks, projects, clients]);

  return (
    <div className="w-full space-y-6 pb-12 px-2 text-[#c9c5d8]">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5 animate-fade-in-up">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Freelancer & Tedarikçiler</h1>
          <p className="text-xs text-[#8c869e] mt-1">
            Dış kaynakları, ödeme durumlarını ve teslim alınan işleri takip et.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-gradient-to-r from-[#4f20c0] to-[#b5179e] text-white font-extrabold text-xs px-5 py-2.5 rounded transition-all shadow-[0_4px_15px_rgba(79,32,192,0.3)] hover:scale-[1.02]"
        >
          + Yeni Kayıt
        </button>
      </div>

      {/* Stats panels */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
        <div className="glass-card rounded p-4 flex flex-col justify-between">
          <span className="text-[10px] text-[#8c869e] uppercase font-bold tracking-wider">Aktif Dış Kaynak</span>
          <span className="text-xl font-black text-white mt-1.5 block">{stats.active}</span>
        </div>
        <div className="glass-card rounded p-4 flex flex-col justify-between">
          <span className="text-[10px] text-[#8c869e] uppercase font-bold tracking-wider">Favori İş Ortakları</span>
          <span className="text-xl font-black text-[#b5179e] mt-1.5 block">{stats.favorite}</span>
        </div>
        <div className="glass-card rounded p-4 flex flex-col justify-between">
          <span className="text-[10px] text-[#8c869e] uppercase font-bold tracking-wider">En Yoğun Kategori</span>
          <span className="text-xl font-black text-purple-400 mt-1.5 block">{stats.mostFrequentType}</span>
        </div>
        <div className="glass-card rounded p-4 flex flex-col justify-between">
          <span className="text-[10px] text-[#8c869e] uppercase font-bold tracking-wider">Geciken Ödeme</span>
          <span className="text-xl font-black text-red-400 mt-1.5 block">
            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(stats.overduePaymentsSum)}
          </span>
        </div>
      </div>

      {/* Filter tabs and search bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white/[0.02] border border-white/5 p-3 rounded-md animate-fade-in-up">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5 w-full lg:w-auto">
          {[
            { value: 'all', label: 'Tümü' },
            { value: 'freelancer', label: 'Freelancer' },
            { value: 'supplier', label: 'Tedarikçi' },
            { value: 'platform', label: 'Platform / Yazılım' },
            { value: 'production', label: 'Prodüksiyon' },
            { value: 'active', label: 'Aktif' },
            { value: 'passive', label: 'Pasif' },
            { value: 'favorite', label: 'Favori' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 py-1.5 rounded-sm text-[10px] font-extrabold uppercase border tracking-wider transition-all duration-200 ${
                activeTab === tab.value
                  ? 'bg-[#4f20c0]/20 text-[#f1ecf9] border-[#4f20c0]/40'
                  : 'bg-transparent text-[#8c869e] border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full lg:w-64 relative">
          <span className="material-symbols-outlined text-[16px] text-[#8c869e] absolute left-2.5 top-2">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="İsim, rol veya uzmanlık ara..."
            className="w-full bg-[#0e0b1a] border border-white/10 rounded-sm pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#7d778f] focus:outline-none focus:border-[#4f20c0] font-bold"
          />
        </div>
      </div>

      {/* Main content grid */}
      <div className="w-full animate-fade-in-up">
        {/* Partners list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full p-12 text-xs font-bold text-[#8c869e] text-center animate-pulse">
              Dış kaynaklar yükleniyor...
            </div>
          ) : filteredPartners.length === 0 ? (
            <div className="col-span-full p-12 text-xs font-bold text-[#8c869e] text-center border border-dashed border-white/10 rounded bg-white/5">
              Arama kriterlerine uygun iş ortağı bulunamadı.
            </div>
          ) : (
            filteredPartners.map((item) => {
              const partnerTypeLabel = RECORD_TYPES.find((t) => t.value === item.record_type)?.label || 'Bilinmeyen';
              const isPartnerActive = item.status === 'active';
              const nameInitials = item.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

              // Calculate relational stats
              const partnerFinancesList = finances.filter((f) => f.freelancer_id === item.id);
              const totalPaidToPartner = partnerFinancesList
                .filter((f) => f.status === 'paid')
                .reduce((sum, f) => sum + Number(f.amount), 0);
              
              const partnerTasksList = tasks.filter((t) => t.assignee && t.assignee.name === item.name);
              const activeTasksCount = partnerTasksList.filter((t) => t.status !== 'done').length;

              const brandIds = Array.from(new Set([
                ...partnerFinancesList.map(f => f.client_id).filter(Boolean),
                ...projects.filter(p => partnerTasksList.map(t => t.projectName).includes(p.name)).map(p => p.client_id).filter(Boolean)
              ]));
              const brandsCount = brandIds.length;

              return (
                <div
                  key={item.id}
                  className="glass-card rounded-xl p-5 relative border border-white/5 hover:border-[#4f20c0]/40 hover:shadow-[0_8px_30px_rgba(79,32,192,0.15)] transition-all duration-300 hover:-translate-y-1 bg-white/[0.02] flex flex-col justify-between"
                >
                  {/* Top bar (Favorite & Type tag) */}
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[9px] font-black uppercase text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-sm">
                      {partnerTypeLabel}
                    </span>
                    
                    <button
                      onClick={() => toggleFavorite(item.id, item.is_favorite)}
                      className="text-[#8c869e] hover:text-yellow-400 transition-colors"
                      title="Favori Ekle/Çıkar"
                    >
                      <span className={`material-symbols-outlined text-[18px] ${item.is_favorite ? 'text-yellow-400 fill-yellow-400 font-filled' : ''}`}>
                        star
                      </span>
                    </button>
                  </div>

                  {/* Profile info snippet */}
                  <div className="flex items-center gap-3.5 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#4f20c0] to-[#b5179e] text-white flex items-center justify-center font-black text-xs shrink-0 select-none shadow-[0_4px_12px_rgba(79,32,192,0.25)]">
                      {nameInitials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-white text-xs truncate">{item.name}</h3>
                      <p className="text-[10px] text-purple-300 mt-0.5 truncate font-bold">
                        {item.expertise || 'Uzmanlık Belirtilmemiş'}
                      </p>
                    </div>
                  </div>

                  {/* Platform links shown openly if it is platform_software */}
                  {item.record_type === 'platform_software' && (
                    <div className="mb-4 bg-white/[0.03] border border-white/5 p-3 rounded space-y-2 text-[10px]">
                      <span className="text-[8px] text-[#8c869e] uppercase block font-bold tracking-wider">Açık Hesap / İnceleme Linkleri:</span>
                      <div className="flex flex-col gap-1.5 font-semibold">
                        {item.website ? (
                          <a
                            href={item.website.startsWith('http') ? item.website : `https://${item.website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-purple-400 hover:text-purple-350 hover:underline flex items-center gap-1.5 truncate"
                          >
                            <span className="material-symbols-outlined text-[12px] shrink-0">language</span>
                            <span className="truncate">{item.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
                          </a>
                        ) : (
                          <span className="text-white/20 flex items-center gap-1.5 select-none">
                            <span className="material-symbols-outlined text-[12px] shrink-0">language</span>
                            <span className="italic">Web sitesi yok</span>
                          </span>
                        )}
                        {item.portfolio_link ? (
                          <a
                            href={item.portfolio_link.startsWith('http') ? item.portfolio_link : `https://${item.portfolio_link}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-purple-400 hover:text-purple-350 hover:underline flex items-center gap-1.5 truncate"
                          >
                            <span className="material-symbols-outlined text-[12px] shrink-0">folder_shared</span>
                            <span className="truncate">{item.portfolio_link.replace(/^https?:\/\/(www\.)?/, '')}</span>
                          </a>
                        ) : (
                          <span className="text-white/20 flex items-center gap-1.5 select-none">
                            <span className="material-symbols-outlined text-[12px] shrink-0">folder_shared</span>
                            <span className="italic">Portfolyo yok</span>
                          </span>
                        )}
                        {item.social_link ? (
                          <a
                            href={item.social_link.startsWith('http') ? item.social_link : `https://${item.social_link}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-purple-400 hover:text-purple-350 hover:underline flex items-center gap-1.5 truncate"
                          >
                            <span className="material-symbols-outlined text-[12px] shrink-0">account_circle</span>
                            <span className="truncate">{item.social_link.replace(/^https?:\/\/(www\.)?/, '')}</span>
                          </a>
                        ) : (
                          <span className="text-white/20 flex items-center gap-1.5 select-none">
                            <span className="material-symbols-outlined text-[12px] shrink-0">account_circle</span>
                            <span className="italic">Sosyal hesap yok</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Relational Stats Bar */}
                  <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded bg-white/[0.02] border border-white/5 text-[9px] font-bold text-[#8c869e] mb-4 text-left">
                    <div className="flex flex-col">
                      <span className="text-[7.5px] uppercase tracking-wider font-semibold text-[#8c869e]">Ödeme</span>
                      <span className="text-white mt-0.5">
                        {totalPaidToPartner > 0 
                          ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: item.currency || 'TRY', maximumFractionDigits: 0 }).format(totalPaidToPartner)
                          : '₺0'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[7.5px] uppercase tracking-wider font-semibold text-[#8c869e]">Görev</span>
                      <span className="text-white mt-0.5">{activeTasksCount} Aktif</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[7.5px] uppercase tracking-wider font-semibold text-[#8c869e]">Marka</span>
                      <span className="text-white mt-0.5">{brandsCount} Katkı</span>
                    </div>
                  </div>

                  {/* Status tag */}
                  <div className="mb-4 text-left">
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-sm border uppercase ${
                      isPartnerActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-white/5 text-[#8c869e] border-white/10'
                    }`}>
                      {isPartnerActive ? 'AKTİF' : 'PASİF'}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="h-[1px] bg-white/5 my-3.5" />

                  {/* Card actions */}
                  <div className="flex justify-between items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedPartner(item);
                        setDetailTab('info');
                      }}
                      className="px-3 py-1.5 bg-[#4f20c0]/20 hover:bg-[#4f20c0]/35 text-[#f1ecf9] font-bold text-[10px] rounded border border-[#4f20c0]/30 transition-all flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[13px]">visibility</span>
                      <span>Profili Aç</span>
                    </button>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="p-1.5 bg-white/5 hover:bg-white/10 text-[#8c869e] hover:text-white rounded border border-white/10 transition-all"
                        title="Düzenle"
                      >
                        <span className="material-symbols-outlined text-[13px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 bg-red-950/20 hover:bg-red-900/30 text-red-400 hover:text-red-300 rounded border border-red-900/30 transition-all"
                        title="Sil"
                      >
                        <span className="material-symbols-outlined text-[13px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Detail Modal Dialog (Centered & Blurred Backdrop) */}
      {selectedPartner && (
        <div 
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999] p-4 animate-fade-in transition-all duration-300"
          style={{ backdropFilter: 'blur(80px)', WebkitBackdropFilter: 'blur(80px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedPartner(null); }}
        >
          <div className="bg-[#0c0a18]/95 border border-white/10 w-full max-w-2xl rounded-xl shadow-[0_15px_50px_rgba(0,0,0,0.8)] p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto animate-fade-in-up text-[#c9c5d8] backdrop-blur-2xl relative">
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded bg-gradient-to-br from-[#4f20c0] to-[#b5179e] text-white flex items-center justify-center font-black text-sm select-none">
                  {selectedPartner.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-base font-black text-white">{selectedPartner.name}</h2>
                  <p className="text-xs text-purple-300 mt-1 font-bold">
                    {selectedPartner.expertise || 'İş Ortağı'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPartner(null)}
                className="text-[#8c869e] hover:text-white material-symbols-outlined text-[20px]"
                title="Paneli Kapat"
              >
                close
              </button>
            </div>

            {/* Status & Type Details */}
            <div className="flex flex-wrap gap-2 text-[9px] font-black uppercase">
              <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-sm">
                {RECORD_TYPES.find((t) => t.value === selectedPartner.record_type)?.label || 'Diğer'}
              </span>
              <span className={`px-2.5 py-1 rounded-sm border ${
                selectedPartner.status === 'active'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-white/5 text-[#8c869e] border-white/10'
              }`}>
                {selectedPartner.status === 'active' ? 'AKTİF PROFİL' : 'PASİF PROFİL'}
              </span>
              {selectedPartner.is_favorite && (
                <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2.5 py-1 rounded-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-[10px] fill-yellow-500">star</span>
                  <span>FAVORİ</span>
                </span>
              )}
            </div>

            {/* Profile navigation tabs */}
            <div className="flex border-b border-white/5">
              {[
                { value: 'info', label: 'Genel Bilgiler' },
                { value: 'payments', label: 'Ödemeler' },
                { value: 'jobs', label: 'Teslim Alınan İşler' },
                { value: 'brands', label: 'Bağlı Markalar' },
                { value: 'notes', label: 'Notlar' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setDetailTab(tab.value as any)}
                  className={`px-3 py-2 text-[10px] font-extrabold uppercase border-b-2 tracking-wider transition-all ${
                    detailTab === tab.value
                      ? 'border-purple-500 text-white'
                      : 'border-transparent text-[#8c869e] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content area */}
            <div className="text-xs font-bold text-[#c9c5d8] space-y-4">
              {detailTab === 'info' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] text-[#8c869e] uppercase block">E-Posta</span>
                    <span className="text-white break-all">{selectedPartner.email || 'Belirtilmemiş'}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-[#8c869e] uppercase block">Telefon</span>
                    <span className="text-white">{selectedPartner.phone || 'Belirtilmemiş'}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-[#8c869e] uppercase block">Freelancer Uzmanlığı</span>
                    <span className="text-white">{selectedPartner.expertise || 'Belirtilmemiş'}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-[#8c869e] uppercase block">Şirket Türü</span>
                    <span className="text-white">
                      {COMPANY_TYPES.find((c) => c.value === selectedPartner.company_type)?.label || 'Bireysel'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-[#8c869e] uppercase block">Vergi No</span>
                    <span className="text-white">{selectedPartner.tax_no || 'Belirtilmemiş'}</span>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <span className="text-[9px] text-[#8c869e] uppercase block">IBAN</span>
                    <span className="text-white font-mono break-all bg-white/5 px-2 py-1 rounded border border-white/5 block mt-0.5">
                      {selectedPartner.iban || 'Belirtilmemiş'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-[#8c869e] uppercase block">Web Sitesi</span>
                    {selectedPartner.website ? (
                      <a href={selectedPartner.website} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline flex items-center gap-1">
                        {selectedPartner.website} <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                      </a>
                    ) : 'Belirtilmemiş'}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-[#8c869e] uppercase block">Sosyal Link (LinkedIn/Instagram)</span>
                    {selectedPartner.social_link ? (
                      <a href={selectedPartner.social_link} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline flex items-center gap-1">
                        {selectedPartner.social_link} <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                      </a>
                    ) : 'Belirtilmemiş'}
                  </div>
                  <div className="space-y-1 col-span-2">
                    <span className="text-[9px] text-[#8c869e] uppercase block">Portfolyo / Drive Linki</span>
                    {selectedPartner.portfolio_link ? (
                      <a href={selectedPartner.portfolio_link} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline flex items-center gap-1 truncate block">
                        {selectedPartner.portfolio_link} <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                      </a>
                    ) : 'Belirtilmemiş'}
                  </div>
                  <div className="space-y-1 col-span-2">
                    <span className="text-[9px] text-[#8c869e] uppercase block">Sözleşme Dosya Linki</span>
                    {selectedPartner.contract_link ? (
                      <a href={selectedPartner.contract_link} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline flex items-center gap-1 truncate block">
                        {selectedPartner.contract_link} <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                      </a>
                    ) : 'Yüklenmemiş'}
                  </div>
                </div>
              )}

              {detailTab === 'payments' && (
                <div className="space-y-4 text-left">
                  {/* Summary row */}
                  <div className="grid grid-cols-3 gap-3 bg-white/5 border border-white/5 p-3 rounded-md">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-[#8c869e] uppercase font-bold">Ödenen</span>
                      <span className="text-xs font-black text-emerald-400 mt-1">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: selectedPartner.currency || 'TRY', maximumFractionDigits: 0 }).format(paymentsSummary.paid)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-[#8c869e] uppercase font-bold">Planlanan</span>
                      <span className="text-xs font-black text-amber-500 mt-1">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: selectedPartner.currency || 'TRY', maximumFractionDigits: 0 }).format(paymentsSummary.pending)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-[#8c869e] uppercase font-bold">Geciken</span>
                      <span className="text-xs font-black text-red-400 mt-1">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: selectedPartner.currency || 'TRY', maximumFractionDigits: 0 }).format(paymentsSummary.overdue)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-white/5 border border-white/5 p-3 rounded-md">
                    <div className="space-y-1">
                      <span className="text-[9px] text-[#8c869e] uppercase block">Ort. Proje Ücreti</span>
                      <span className="text-white text-xs font-black">
                        {selectedPartner.average_project_fee 
                          ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: selectedPartner.currency || 'TRY', maximumFractionDigits: 0 }).format(selectedPartner.average_project_fee)
                          : 'Belirtilmemiş'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-[#8c869e] uppercase block">Ödeme Yöntemi</span>
                      <span className="text-white text-xs">
                        {PAYMENT_METHODS.find((p) => p.value === selectedPartner.default_payment_method)?.label || 'Banka Transferi'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] text-[#8c869e] uppercase block tracking-wider font-bold">Ödeme Geçmişi ({partnerFinances.length})</span>
                    {partnerFinances.length === 0 ? (
                      <div className="p-4 text-center text-[#8c869e] text-[10px] border border-dashed border-white/10 rounded bg-white/5">
                        Henüz bu iş ortağı için bir ödeme kaydı bulunmamaktadır.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                        {partnerFinances.map((fin) => (
                          <div key={fin.id} className="bg-white/5 border border-white/5 rounded p-3 flex justify-between items-center text-xs">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-white font-bold">{fin.title}</span>
                              <span className="text-[9px] text-[#8c869e]">
                                {fin.transaction_date || fin.due_date || new Date(fin.created_at).toLocaleDateString('tr-TR')}
                              </span>
                            </div>
                            <div className="text-right flex flex-col gap-0.5 shrink-0">
                              <span className="font-black text-white">
                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: selectedPartner.currency || 'TRY', maximumFractionDigits: 0 }).format(fin.amount)}
                              </span>
                              <span className={`text-[8px] font-black uppercase ${
                                fin.status === 'paid' ? 'text-emerald-400' : fin.status === 'overdue' ? 'text-red-400' : 'text-amber-500'
                              }`}>
                                {fin.status === 'paid' ? 'ÖDENDİ' : fin.status === 'overdue' ? 'GECİKTİ' : 'PLANLANDI'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {detailTab === 'jobs' && (
                <div className="space-y-4 text-left">
                  {/* Assigned Tasks */}
                  <div className="space-y-2">
                    <span className="text-[9px] text-[#8c869e] uppercase block tracking-wider font-bold">Atanan Görevler ({partnerTasks.length})</span>
                    {partnerTasks.length === 0 ? (
                      <div className="p-4 text-center text-[#8c869e] text-[10px] border border-dashed border-white/10 rounded bg-white/5">
                        Bu iş ortağına atanmış görev bulunmamaktadır.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                        {partnerTasks.map((task) => (
                          <div key={task.id} className="bg-white/5 border border-white/5 rounded p-2.5 flex justify-between items-center text-xs">
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className={`font-bold truncate ${task.status === 'done' ? 'line-through text-white/40' : 'text-white'}`}>
                                {task.title}
                              </span>
                              <span className="text-[9px] text-[#8c869e] truncate">
                                Proje: {task.projectName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`px-1.5 py-0.5 rounded-sm text-[8px] font-black border ${
                                task.priority === 'high' ? 'text-red-400 border-red-900/30 bg-red-950/20' : task.priority === 'medium' ? 'text-amber-500 border-amber-900/30 bg-amber-950/20' : 'text-gray-400 border-white/5'
                              }`}>
                                {task.priority === 'high' ? 'YÜKSEK' : task.priority === 'medium' ? 'ORTA' : 'DÜŞÜK'}
                              </span>
                              <span className={`text-[8px] font-black uppercase ${
                                task.status === 'done' ? 'text-emerald-400' : 'text-amber-500'
                              }`}>
                                {task.status === 'done' ? 'TAMAMLANDI' : 'YAPILACAK'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Visual Assets */}
                  <div className="space-y-2">
                    <span className="text-[9px] text-[#8c869e] uppercase block tracking-wider font-bold">Üretilen Görsel Assetler ({partnerVisuals.length})</span>
                    {partnerVisuals.length === 0 ? (
                      <div className="p-4 text-center text-[#8c869e] text-[10px] border border-dashed border-white/10 rounded bg-white/5">
                        Bu iş ortağının projelerine bağlı görsel asset bulunmamaktadır.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                        {partnerVisuals.map((vis) => (
                          <div key={vis.id} className="bg-white/5 border border-white/5 rounded p-2.5 flex justify-between items-center text-xs">
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="text-white font-bold truncate">{vis.title}</span>
                              <span className="text-[9px] text-[#8c869e] uppercase tracking-wider">
                                {vis.visual_type}
                              </span>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <a 
                                href={vis.drive_link} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="px-2.5 py-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded font-bold text-[9px] text-[#f1ecf9] flex items-center gap-1 transition-all"
                              >
                                <span className="material-symbols-outlined text-[10px]">link</span>
                                Drive
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {detailTab === 'brands' && (
                <div className="space-y-3 text-left">
                  <span className="text-[9px] text-[#8c869e] uppercase block tracking-wider font-bold">Katkı Sağlanan Markalar ({partnerBrands.length})</span>
                  {partnerBrands.length === 0 ? (
                    <div className="p-4 text-center text-[#8c869e] text-[10px] border border-dashed border-white/10 rounded bg-white/5">
                      Henüz bu iş ortağının katkı sağladığı bir marka bulunmamaktadır.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {partnerBrands.map((brand) => (
                        <div key={brand.id} className="bg-white/5 border border-white/5 rounded-md p-3 flex items-center gap-3">
                          <div className="w-9 h-9 rounded bg-white/5 text-purple-300 border border-white/10 flex items-center justify-center font-black text-xs shrink-0 select-none">
                            {brand.logoText || brand.companyName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-white text-xs truncate leading-snug">{brand.companyName}</h4>
                            <span className="text-[8px] text-[#8c869e] font-semibold mt-0.5 block truncate uppercase">
                              {brand.domain || 'Kurumsal Portföy'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {detailTab === 'notes' && (
                <div className="space-y-3">
                  <span className="text-[9px] text-[#8c869e] uppercase block">Kayıtlı Profil Notu</span>
                  <div className="p-4 bg-white/5 border border-white/5 rounded-sm text-white text-xs leading-relaxed italic whitespace-pre-wrap">
                    {selectedPartner.note || 'Bu iş ortağı için herhangi bir özel not yazılmamış.'}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions inside detail drawer */}
            <div className="border-t border-white/5 pt-4 flex gap-3">
              <button
                onClick={() => handleEditClick(selectedPartner)}
                className="w-1/2 bg-[#4f20c0] hover:bg-[#6741d9] text-white py-2.5 rounded font-extrabold shadow-lg shadow-purple-500/10 transition-all text-xs text-center"
              >
                Bilgileri Düzenle
              </button>
              <button
                onClick={() => handleDelete(selectedPartner.id)}
                className="w-1/2 bg-red-950/20 hover:bg-red-900/30 text-red-400 hover:text-red-300 py-2.5 rounded font-bold border border-red-900/30 transition-all text-xs"
              >
                Profili Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* "Yeni Kayıt" & Edit Modal Dialog (Centered & Blurred Backdrop) */}
      {showFormModal && (
        <div 
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999] p-4 animate-fade-in transition-all duration-300"
          style={{ backdropFilter: 'blur(80px)', WebkitBackdropFilter: 'blur(80px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowFormModal(false); }}
        >
          <div className="bg-[#0c0a18]/95 border border-white/10 w-full max-w-2xl rounded-xl shadow-[0_15px_50px_rgba(0,0,0,0.8)] p-6 md:p-8 flex flex-col justify-between overflow-y-auto animate-fade-in-up text-[#c9c5d8] max-h-[90vh] backdrop-blur-2xl relative">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-base font-black text-white">{editId ? 'Kaydı Düzenle' : 'Yeni Kayıt'}</h3>
                  <p className="text-[10px] text-[#8c869e] mt-1">Freelancer veya Tedarikçi profili oluşturun.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="text-[#8c869e] hover:text-white material-symbols-outlined text-[20px]"
                >
                  close
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
                {errorMsg && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-sm font-semibold">
                    {errorMsg}
                  </div>
                )}

                {/* Record Type Select Grid */}
                <div className="space-y-2">
                  <label className="block text-[9px] font-bold text-[#8c869e] uppercase tracking-wider">KAYIT TİPİ *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {RECORD_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => {
                          setRecordType(type.value);
                          const opts = EXPERTISE_OPTIONS[type.value] || EXPERTISE_OPTIONS.other;
                          setExpertise(opts[0] || '');
                        }}
                        className={`px-2 py-2 rounded-sm border text-[10px] font-extrabold text-center transition-all ${
                          recordType === type.value
                            ? 'bg-[#4f20c0]/20 text-[#f1ecf9] border-[#4f20c0]/50 shadow-[0_0_10px_rgba(79,32,192,0.2)]'
                            : 'bg-transparent text-[#8c869e] border-white/10 hover:border-white/20'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2">
                    <label className="block text-[9px] font-bold text-[#8c869e] uppercase tracking-wider">AD SOYAD / FİRMA ADI *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Örn. Ali Tasarım veya XYZ Ltd."
                      className="w-full bg-[#0e0b1a] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4f20c0]"
                    />
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="block text-[9px] font-bold text-[#8c869e] uppercase tracking-wider">FREELANCER UZMANLIĞI</label>
                    <select
                      value={expertise}
                      onChange={(e) => setExpertise(e.target.value)}
                      className="w-full bg-[#0e0b1a] border border-[#3e3a50] rounded px-3 py-2 text-xs text-white focus:outline-none cursor-pointer focus:border-[#4f20c0]"
                    >
                      {currentOptions.map((opt) => (
                        <option key={opt} value={opt} className="bg-[#0e0b1a]">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-[#8c869e] uppercase tracking-wider">E-POSTA</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      className="w-full bg-[#0e0b1a] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4f20c0]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-[#8c869e] uppercase tracking-wider">TELEFON</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+90 555 123 4567"
                      className="w-full bg-[#0e0b1a] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4f20c0]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-[#8c869e] uppercase tracking-wider">DURUM</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-[#0e0b1a] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none cursor-pointer focus:border-[#4f20c0]"
                    >
                      <option value="active" className="bg-[#0e0b1a]">Aktif</option>
                      <option value="passive" className="bg-[#0e0b1a]">Pasif</option>
                    </select>
                  </div>

                  {/* Switch for status rendering */}
                  <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 px-3.5 rounded">
                    <span className="text-[9px] font-bold text-[#8c869e] uppercase">Aktif Profil</span>
                    <button
                      type="button"
                      onClick={() => setStatus(status === 'active' ? 'passive' : 'active')}
                      className={`w-9 h-5 rounded-full relative transition-colors ${
                        status === 'active' ? 'bg-[#b5179e]' : 'bg-white/10'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all ${
                        status === 'active' ? 'right-0.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="block text-[9px] font-bold text-[#8c869e] uppercase tracking-wider">NOT</label>
                    <textarea
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Ek bilgi..."
                      className="w-full bg-[#0e0b1a] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4f20c0]"
                    />
                  </div>
                </div>

                {/* Collapsible advanced section */}
                <div className="border-t border-white/5 pt-3.5">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-purple-400 hover:text-white font-extrabold text-[10px] flex items-center gap-1.5"
                  >
                    <span>{showAdvanced ? 'Gelişmiş Alanları Gizle' : 'Gelişmiş Alanları Göster — IBAN - Vergi - Portfolyo - Ücret'}</span>
                    <span className="material-symbols-outlined text-[14px]">
                      {showAdvanced ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>

                  {showAdvanced && (
                    <div className="grid grid-cols-2 gap-4 mt-3 animate-fade-in-up">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-[#8c869e] uppercase tracking-wider">IBAN</label>
                        <input
                          type="text"
                          value={iban}
                          onChange={(e) => setIban(e.target.value)}
                          placeholder="TR..."
                          className="w-full bg-[#0e0b1a] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4f20c0]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-[#8c869e] uppercase tracking-wider">VERGİ NO</label>
                        <input
                          type="text"
                          value={taxNo}
                          onChange={(e) => setTaxNo(e.target.value)}
                          placeholder="1234567890"
                          className="w-full bg-[#0e0b1a] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4f20c0]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-[#8c869e] uppercase tracking-wider">ŞİRKET TİPİ</label>
                        <select
                          value={companyType}
                          onChange={(e) => setCompanyType(e.target.value)}
                          className="w-full bg-[#0e0b1a] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none cursor-pointer focus:border-[#4f20c0]"
                        >
                          {COMPANY_TYPES.map((c) => (
                            <option key={c.value} value={c.value} className="bg-[#0e0b1a]">{c.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-[#8c869e] uppercase tracking-wider">WEBSITE</label>
                        <input
                          type="text"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-[#0e0b1a] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4f20c0]"
                        />
                      </div>

                      <div className="space-y-1 col-span-2">
                        <label className="block text-[9px] font-bold text-[#8c869e] uppercase tracking-wider">SOSYAL LINK</label>
                        <input
                          type="text"
                          value={socialLink}
                          onChange={(e) => setSocialLink(e.target.value)}
                          placeholder="LinkedIn, Instagram vb."
                          className="w-full bg-[#0e0b1a] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4f20c0]"
                        />
                      </div>

                      <div className="space-y-1 col-span-2">
                        <label className="block text-[9px] font-bold text-[#8c869e] uppercase tracking-wider">PORTFOLYO / DRIVE LINKI</label>
                        <input
                          type="text"
                          value={portfolioLink}
                          onChange={(e) => setPortfolioLink(e.target.value)}
                          placeholder="Drive, Behance, Dribbble vb."
                          className="w-full bg-[#0e0b1a] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4f20c0]"
                        />
                      </div>

                      <div className="space-y-1 col-span-2">
                        <label className="block text-[9px] font-bold text-[#8c869e] uppercase tracking-wider">SÖZLEŞME DOSYA LINKI</label>
                        <input
                          type="text"
                          value={contractLink}
                          onChange={(e) => setContractLink(e.target.value)}
                          placeholder="İmzalı sözleşme PDF Drive linki"
                          className="w-full bg-[#0e0b1a] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4f20c0]"
                        />
                      </div>

                      <div className="space-y-1 col-span-2">
                        <label className="block text-[9px] font-bold text-[#8c869e] uppercase tracking-wider">VARSAYILAN ÖDEME YÖNTEMİ</label>
                        <select
                          value={defaultPaymentMethod}
                          onChange={(e) => setDefaultPaymentMethod(e.target.value)}
                          className="w-full bg-[#0e0b1a] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none cursor-pointer focus:border-[#4f20c0]"
                        >
                          {PAYMENT_METHODS.map((p) => (
                            <option key={p.value} value={p.value} className="bg-[#0e0b1a]">{p.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-[#8c869e] uppercase tracking-wider">ORT. PROJE ÜCRETİ</label>
                        <input
                          type="number"
                          value={averageProjectFee || ''}
                          onChange={(e) => setAverageProjectFee(parseFloat(e.target.value) || 0)}
                          placeholder="Tutar"
                          className="w-full bg-[#0e0b1a] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4f20c0]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-[#8c869e] uppercase tracking-wider">PARA BİRİMİ</label>
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="w-full bg-[#0e0b1a] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none cursor-pointer focus:border-[#4f20c0]"
                        >
                          {CURRENCIES.map((c) => (
                            <option key={c.value} value={c.value} className="bg-[#0e0b1a]">{c.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2 flex items-center gap-2 pt-1.5">
                        <input
                          type="checkbox"
                          id="isFavorite"
                          checked={isFavorite}
                          onChange={(e) => setIsFavorite(e.target.checked)}
                          className="w-4 h-4 bg-[#0e0b1a] border border-white/10 rounded focus:ring-0 text-[#b5179e]"
                        />
                        <label htmlFor="isFavorite" className="text-white text-xs select-none cursor-pointer">
                          ★ Favorilere ekle
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer buttons */}
                <div className="flex gap-3 pt-6 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="w-1/2 bg-white/5 border border-white/10 hover:bg-white/10 text-[#8c869e] hover:text-white py-3 rounded transition-all text-xs"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-1/2 bg-gradient-to-r from-[#4f20c0] to-[#b5179e] hover:scale-[1.02] text-white py-3 rounded font-extrabold shadow-lg shadow-purple-500/10 transition-all disabled:opacity-50 text-xs"
                  >
                    {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
