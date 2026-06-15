'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAgency } from '@/features/diagnoses/components/studio/AgencyContext';

interface FinanceRecord {
  id: string;
  title: string;
  type: 'income' | 'expense';
  amount: number;
  status: string;
  created_at: string;
  due_date?: string;
  transaction_date?: string;
  payment_type?: string;
  category_type?: string;
  relation_type?: string;
  payment_method?: string;
  invoice_status?: string;
  vat_rate?: number;
  invoice_no?: string;
  is_recurring?: boolean;
  notes?: string;
  client_id?: string | null;
  project_id?: string | null;
  freelancer_id?: string | null;
}

interface Freelancer {
  id: string;
  name: string;
  record_type: string;
  expertise?: string;
}

export default function FinansPage() {
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Drawer States
  const [isIncomeDrawerOpen, setIsIncomeDrawerOpen] = useState(false);
  const [isExpenseDrawerOpen, setIsExpenseDrawerOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinanceRecord | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formStatus, setFormStatus] = useState('');
  const [formTransactionDate, setFormTransactionDate] = useState('');
  const [formPaymentType, setFormPaymentType] = useState('single');
  const [formCategoryType, setFormCategoryType] = useState('general');
  const [formRelationType, setFormRelationType] = useState('general');
  const [formClientId, setFormClientId] = useState('');
  const [formProjectId, setFormProjectId] = useState('');
  const [formFreelancerId, setFormFreelancerId] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState('bank_transfer');
  const [formInvoiceStatus, setFormInvoiceStatus] = useState('unknown');
  const [formVatRate, setFormVatRate] = useState(0);
  const [formInvoiceNo, setFormInvoiceNo] = useState('');
  const [formIsRecurring, setFormIsRecurring] = useState(false);
  const [formNotes, setFormNotes] = useState('');

  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);

  // Tax Reserve Overrides
  const [allocatedReserve, setAllocatedReserve] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { clients, projects } = useAgency();
  const supabase = createClient();

  useEffect(() => {
    fetchFinances();
    fetchFreelancers();
  }, []);

  async function fetchFinances() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('finances')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (err) {
      console.error('Error fetching finances:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchFreelancers() {
    try {
      const { data, error } = await supabase
        .from('freelancers')
        .select('id, name, record_type, expertise')
        .order('name');
      if (error) throw error;
      setFreelancers(data || []);
    } catch (err) {
      console.error('Error fetching freelancers:', err);
    }
  }

  // Toast Notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Helper: check if date is in current calendar month
  const isCurrentMonth = (dateStr?: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  // Calculate Metrics
  const incomesThisMonth = records
    .filter((r) => r.type === 'income' && r.status === 'paid' && isCurrentMonth(r.transaction_date || r.due_date || r.created_at));
  const totalIncomeThisMonth = incomesThisMonth.reduce((acc, curr) => acc + Number(curr.amount), 0);

  const expensesThisMonth = records
    .filter((r) => r.type === 'expense' && r.status === 'paid' && isCurrentMonth(r.transaction_date || r.due_date || r.created_at));
  const totalExpenseThisMonth = expensesThisMonth.reduce((acc, curr) => acc + Number(curr.amount), 0);

  const netThisMonth = totalIncomeThisMonth - totalExpenseThisMonth;

  const pendingIncome = records
    .filter((r) => r.type === 'income' && (r.status === 'pending' || r.status === 'overdue'))
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const pendingExpense = records
    .filter((r) => r.type === 'expense' && (r.status === 'pending' || r.status === 'planlandı'))
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  // KDV & Tax Reserve Calculation
  const totalVatReserve = records.reduce((acc, r) => {
    if (r.type === 'income' && r.status === 'paid') {
      const rate = Number(r.vat_rate || 0);
      return acc + (Number(r.amount) * (rate / 100));
    }
    return acc;
  }, 0);

  const finalTaxReserve = totalVatReserve + allocatedReserve;
  const isVatMissing = records.filter(r => r.type === 'income' && r.status === 'paid').length > 0 && totalVatReserve === 0;

  // Health Score Logic (Circular gauge)
  const healthScore = Math.max(
    0,
    Math.min(
      100,
      100 - 
      (records.filter(r => r.status === 'overdue').length * 10) - 
      (netThisMonth < 0 ? 15 : 0)
    )
  );

  // Form Handlers
  const handleOpenAddIncome = () => {
    setEditingRecord(null);
    setFormTitle('');
    setFormAmount('');
    setFormStatus('pending');
    setFormTransactionDate(new Date().toISOString().split('T')[0]);
    setFormPaymentType('single');
    setFormCategoryType('project_fee');
    setFormRelationType('brand');
    setFormClientId('');
    setFormProjectId('');
    setFormFreelancerId('');
    setFormNotes('');
    setIsIncomeDrawerOpen(true);
  };

  const handleOpenAddExpense = () => {
    setEditingRecord(null);
    setFormTitle('');
    setFormAmount('');
    setFormStatus('planlandı');
    setFormTransactionDate(new Date().toISOString().split('T')[0]);
    setFormPaymentType('single');
    setFormCategoryType('software');
    setFormRelationType('general');
    setFormClientId('');
    setFormProjectId('');
    setFormFreelancerId('');
    setFormPaymentMethod('bank_transfer');
    setFormInvoiceStatus('unknown');
    setFormVatRate(0);
    setFormInvoiceNo('');
    setFormIsRecurring(false);
    setFormNotes('');
    setIsExpenseDrawerOpen(true);
  };

  const handleOpenEdit = (rec: FinanceRecord) => {
    setEditingRecord(rec);
    setFormTitle(rec.title);
    setFormAmount(rec.amount.toString());
    setFormStatus(rec.status);
    setFormTransactionDate(rec.transaction_date || rec.created_at.split('T')[0]);
    setFormPaymentType(rec.payment_type || 'single');
    setFormCategoryType(rec.category_type || 'general');
    setFormRelationType(rec.relation_type || 'general');
    setFormClientId(rec.client_id || '');
    setFormProjectId(rec.project_id || '');
    setFormFreelancerId(rec.freelancer_id || '');
    setFormPaymentMethod(rec.payment_method || 'bank_transfer');
    setFormInvoiceStatus(rec.invoice_status || 'unknown');
    setFormVatRate(rec.vat_rate || 0);
    setFormInvoiceNo(rec.invoice_no || '');
    setFormIsRecurring(rec.is_recurring || false);
    setFormNotes(rec.notes || '');

    if (rec.type === 'income') {
      setIsIncomeDrawerOpen(true);
    } else {
      setIsExpenseDrawerOpen(true);
    }
  };

  const handleSave = async (e: React.FormEvent, type: 'income' | 'expense') => {
    e.preventDefault();
    if (!formTitle.trim() || !formAmount.trim()) return;

    const recordData = {
      title: formTitle.trim(),
      type: type,
      amount: parseFloat(formAmount) || 0.0,
      status: formStatus,
      transaction_date: formTransactionDate || new Date().toISOString().split('T')[0],
      due_date: formTransactionDate || new Date().toISOString().split('T')[0],
      payment_type: formPaymentType,
      category_type: formCategoryType,
      relation_type: formRelationType,
      client_id: type === 'income' ? (formClientId || null) : (formRelationType === 'project' ? (formClientId || null) : null),
      project_id: type === 'income' ? (formProjectId || null) : (formRelationType === 'project' ? (formProjectId || null) : null),
      freelancer_id: type === 'expense' && formRelationType === 'freelancer' ? (formFreelancerId || null) : null,
      payment_method: type === 'expense' ? formPaymentMethod : 'bank_transfer',
      invoice_status: type === 'expense' ? formInvoiceStatus : 'unknown',
      vat_rate: type === 'expense' ? formVatRate : 0,
      invoice_no: type === 'expense' ? formInvoiceNo : '',
      is_recurring: type === 'expense' ? formIsRecurring : false,
      notes: formNotes,
    };

    try {
      if (editingRecord) {
        const { error } = await supabase
          .from('finances')
          .update(recordData)
          .eq('id', editingRecord.id);
        if (error) throw error;
        showToast(`"${formTitle.trim()}" başarıyla güncellendi.`);
      } else {
        const { error } = await supabase
          .from('finances')
          .insert(recordData);
        if (error) throw error;
        showToast(`"${formTitle.trim()}" işlemi eklendi.`);
      }
      setIsIncomeDrawerOpen(false);
      setIsExpenseDrawerOpen(false);
      fetchFinances();
    } catch (err) {
      console.error('Error saving finance record:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu finans işlemini silmek istediğinize emin misiniz?')) return;
    try {
      const { error } = await supabase
        .from('finances')
        .delete()
        .eq('id', id);
      if (error) throw error;
      showToast('Kayıt silindi.');
      fetchFinances();
    } catch (err) {
      console.error('Error deleting finance record:', err);
    }
  };

  const handleAllocateReserve = () => {
    const twentyPercent = totalIncomeThisMonth * 0.2;
    setAllocatedReserve(twentyPercent);
    showToast(`%20 oranında (${formatCurrency(twentyPercent)}) KDV/Vergi Rezervi ayrıldı.`);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);
  };

  const expenseRecords = records.filter(r => r.type === 'expense');
  const incomeRecords = records.filter(r => r.type === 'income');

  const totalExpenseSum = expenseRecords.reduce((acc, r) => acc + Number(r.amount), 0);
  const totalIncomeSum = incomeRecords.reduce((acc, r) => acc + Number(r.amount), 0);

  return (
    <div className="w-full space-y-6 animate-fade-in-up pb-12 px-2 text-[#c9c5d8] relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 bg-[#0e0b20] border border-[#b5179e]/30 px-5 py-4 rounded-lg shadow-2xl text-xs font-bold text-[#f6f5fa] z-50 flex items-center gap-3 animate-fade-in-up">
          <span className="material-symbols-outlined text-[#b5179e] animate-pulse">notifications_active</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5 text-left">
        <div>
          <h1 className="text-xl font-black text-[#f6f5fa] tracking-tight">Finans</h1>
          <p className="text-xs text-[#928ca1] mt-1 font-medium">Gelir, gider, tahsilat, ödeme ve marka bazlı finans sağlığını takip et.</p>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 text-left">
        <div className="glass-card rounded-md p-4 flex flex-col justify-center border border-white/5">
          <span className="text-[9px] font-bold text-[#928ca1] uppercase tracking-wider">BU AY GELİR</span>
          <span className="text-lg font-black text-emerald-400 mt-2">{formatCurrency(totalIncomeThisMonth)}</span>
        </div>
        <div className="glass-card rounded-md p-4 flex flex-col justify-center border border-white/5">
          <span className="text-[9px] font-bold text-[#928ca1] uppercase tracking-wider">BU AY GİDER</span>
          <span className="text-lg font-black text-red-400 mt-2">{formatCurrency(totalExpenseThisMonth)}</span>
        </div>
        <div className="glass-card rounded-md p-4 flex flex-col justify-center border border-white/5">
          <span className="text-[9px] font-bold text-[#928ca1] uppercase tracking-wider">NET DURUM</span>
          <span className={`text-lg font-black mt-2 ${netThisMonth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(netThisMonth)}
          </span>
        </div>
        <div className="glass-card rounded-md p-4 flex flex-col justify-center border border-white/5">
          <span className="text-[9px] font-bold text-[#928ca1] uppercase tracking-wider">BEKLEYEN GELİR</span>
          <span className="text-lg font-black text-amber-500 mt-2">{formatCurrency(pendingIncome)}</span>
        </div>
        <div className="glass-card rounded-md p-4 flex flex-col justify-center border border-white/5">
          <span className="text-[9px] font-bold text-[#928ca1] uppercase tracking-wider">BEKLEYEN GİDER</span>
          <span className="text-lg font-black text-purple-400 mt-2">{formatCurrency(pendingExpense)}</span>
        </div>
        <div className="glass-card rounded-md p-4 flex flex-col justify-center border border-white/5">
          <span className="text-[9px] font-bold text-[#928ca1] uppercase tracking-wider">VERGİ / KDV RZV.</span>
          <span className="text-lg font-black text-[#b5179e] mt-2">{formatCurrency(finalTaxReserve)}</span>
        </div>
      </div>

      {/* Split Transaction Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
        {/* Expenses (Giderler) */}
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white/5 p-3 rounded border border-white/10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-red-400 text-[18px]">arrow_downward</span>
              <span className="text-xs font-black text-[#f6f5fa] uppercase tracking-wider">
                Giderler <span className="text-[10px] text-[#8c869e] font-bold">({expenseRecords.length} kayıt - -{formatCurrency(totalExpenseSum)})</span>
              </span>
            </div>
            <button
              onClick={handleOpenAddExpense}
              className="px-3 py-1.5 rounded text-[10px] font-bold bg-[#0e0b1a]/80 border border-white/10 hover:bg-white/5 text-[#f1ecf9] transition-all flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[12px]">add</span>
              Gider Ekle
            </button>
          </div>

          <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-[#8c869e] font-bold">Yükleniyor...</div>
            ) : expenseRecords.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#8c869e] font-bold glass-card rounded-md border border-white/5">
                Kayıtlı gider bulunmamaktadır.
              </div>
            ) : (
              expenseRecords.map((vis) => {
                const linkedFreelancer = freelancers.find(f => f.id === vis.freelancer_id);
                const linkedProj = projects.find(p => p.id === vis.project_id);
                return (
                  <div key={vis.id} className="glass-card rounded-md p-4 flex items-center justify-between border border-white/5 hover:border-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-red-950/20 border border-red-900/30 flex items-center justify-center text-red-400 shrink-0">
                        <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#f1ecf9] line-clamp-1">{vis.title}</h4>
                        <p className="text-[9px] text-[#8c869e] font-semibold mt-0.5 uppercase tracking-wider">
                          {vis.category_type || 'Genel kayıt'}
                          {linkedFreelancer && ` • ${linkedFreelancer.name}`}
                          {linkedProj && ` • ${linkedProj.name}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-right shrink-0">
                      <div>
                        <span className="font-black text-xs text-red-400">-{formatCurrency(vis.amount)}</span>
                        <span className={`block text-[8px] font-bold uppercase mt-0.5 ${
                          vis.status === 'paid' ? 'text-emerald-400' : 'text-amber-500'
                        }`}>
                          {vis.status === 'paid' ? 'ÖDENDİ' : 'PLANLANDI'}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleOpenEdit(vis)} className="w-6 h-6 hover:bg-white/5 rounded text-[#8c869e] hover:text-[#f1ecf9] flex items-center justify-center transition-all">
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                        </button>
                        <button onClick={() => handleDelete(vis.id)} className="w-6 h-6 hover:bg-white/5 rounded text-red-400 hover:text-red-300 flex items-center justify-center transition-all">
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Incomes (Gelirler) */}
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white/5 p-3 rounded border border-white/10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-[18px]">arrow_upward</span>
              <span className="text-xs font-black text-[#f6f5fa] uppercase tracking-wider">
                Gelirler <span className="text-[10px] text-[#8c869e] font-bold">({incomeRecords.length} kayıt - {formatCurrency(totalIncomeSum)})</span>
              </span>
            </div>
            <button
              onClick={handleOpenAddIncome}
              className="px-3 py-1.5 rounded text-[10px] font-bold bg-[#0e0b1a]/80 border border-white/10 hover:bg-white/5 text-[#f1ecf9] transition-all flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[12px]">add</span>
              Gelir Ekle
            </button>
          </div>

          <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-[#8c869e] font-bold">Yükleniyor...</div>
            ) : incomeRecords.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#8c869e] font-bold glass-card rounded-md border border-white/5">
                Kayıtlı gelir bulunmamaktadır.
              </div>
            ) : (
              incomeRecords.map((vis) => (
                <div key={vis.id} className="glass-card rounded-md p-4 flex items-center justify-between border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-emerald-950/20 border border-emerald-900/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#f1ecf9] line-clamp-1">{vis.title}</h4>
                      <p className="text-[9px] text-[#8c869e] font-semibold mt-0.5 uppercase tracking-wider">
                        {vis.category_type || 'Genel kayıt'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right shrink-0">
                    <div>
                      <span className="font-black text-xs text-emerald-400">+{formatCurrency(vis.amount)}</span>
                      <span className={`block text-[8px] font-bold uppercase mt-0.5 ${
                        vis.status === 'paid' ? 'text-emerald-400' : 'text-amber-500'
                      }`}>
                        {vis.status === 'paid' ? 'TAHSİL EDİLDİ' : 'BEKLİYOR'}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleOpenEdit(vis)} className="w-6 h-6 hover:bg-white/5 rounded text-[#8c869e] hover:text-[#f1ecf9] flex items-center justify-center transition-all">
                        <span className="material-symbols-outlined text-[14px]">edit</span>
                      </button>
                      <button onClick={() => handleDelete(vis.id)} className="w-6 h-6 hover:bg-white/5 rounded text-red-400 hover:text-red-300 flex items-center justify-center transition-all">
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Critical Warnings Alert */}
      <div className="text-left space-y-3">
        <span className="text-[10px] font-bold text-[#8c869e] uppercase tracking-wider">CRITICAL ALERTS (KRİTİK UYARILAR)</span>
        {isVatMissing ? (
          <div className="glass-card border border-amber-500/20 bg-amber-500/5 rounded-md p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-amber-950/20 border border-amber-900/30 flex items-center justify-center text-amber-500 shrink-0">
                <span className="material-symbols-outlined text-[18px]">warning</span>
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#f1ecf9]">Vergi Rezervi</h4>
                <p className="text-[10px] text-[#8c869e] font-semibold mt-0.5">KDV verisi girilmemiş. Faturalı kayıt ekle veya otomatik vergi rezervi ayır.</p>
              </div>
            </div>
            <button
              onClick={handleAllocateReserve}
              className="px-4 py-2 rounded text-xs font-bold bg-[#4f20c0] hover:bg-[#4f20c0]/85 text-white transition-all shadow-[0_4px_10px_rgba(79,32,192,0.2)] shrink-0"
            >
              Rezerv Ayır
            </button>
          </div>
        ) : (
          <div className="glass-card border border-white/5 rounded-md p-4 text-center text-xs text-[#8c869e] font-bold">
            Kritik uyarı yok — durum normal.
          </div>
        )}
      </div>

      {/* Charts and Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Cash balance */}
        <div className="lg:col-span-2 glass-card rounded-md p-5 border border-white/5 space-y-4 text-left">
          <div>
            <h3 className="text-xs font-black uppercase text-[#f6f5fa] tracking-wider">Haftalık Nakit Dengesi</h3>
            <p className="text-[10px] text-[#8c869e] font-medium mt-0.5">Günlük nakit akışı ve gelir-gider projeksiyonu</p>
          </div>
          <div className="flex justify-between items-end h-32 pt-4 px-2">
            {['PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT', 'PAZ'].map((day, idx) => {
              const heights = [45, 60, 50, 75, 90, 30, 20];
              const height = heights[idx];
              return (
                <div key={day} className="flex flex-col items-center gap-2 flex-grow">
                  <div className="w-8 bg-white/5 border border-white/10 rounded-md relative h-24 overflow-hidden flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-[#4f20c0] to-[#b5179e] rounded-b-sm transition-all duration-500"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-[#8c869e] uppercase">{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Studio Health Score Gauge */}
        <div className="glass-card rounded-md p-5 border border-white/5 space-y-4 text-center">
          <div className="text-left">
            <h3 className="text-xs font-black uppercase text-[#f6f5fa] tracking-wider">Stüdyo Sağlık Skoru</h3>
            <p className="text-[10px] text-[#8c869e] font-medium mt-0.5">Finansal duruma göre genel sağlık analizi</p>
          </div>

          <div className="relative w-32 h-32 flex items-center justify-center mx-auto">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="48"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="48"
                stroke={healthScore >= 90 ? '#10b981' : healthScore >= 70 ? '#f59e0b' : '#ef4444'}
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={2 * Math.PI * 48 * (1 - healthScore / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-black text-[#f6f5fa]">{healthScore}</span>
              <span className="text-[8px] font-bold text-[#8c869e] uppercase tracking-wider mt-0.5">
                {healthScore >= 90 ? 'SAĞLIKLI' : healthScore >= 70 ? 'DENGELİ' : 'RİSKLİ'}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-[#8c869e] font-semibold">
            {healthScore >= 90 ? 'Finans durumu son derece sağlıklı.' : 'Finansal durumu iyileştirmek için bekleyen faturaları kontrol edin.'}
          </p>
        </div>
      </div>

      {/* ── Income (Gelir) Add/Edit Drawer ── */}
      {isIncomeDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end no-print">
          <div onClick={() => setIsIncomeDrawerOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all" />
          <div className="w-full max-w-md bg-[#0e0b1a] border-l border-white/10 h-full p-6 flex flex-col justify-between relative z-10 shadow-2xl animate-fade-in-up text-left overflow-y-auto">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <h2 className="text-sm font-black tracking-wider text-[#f6f5fa] uppercase flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-emerald-400">arrow_upward</span>
                  {editingRecord ? 'Gelir Kaydını Düzenle' : 'Gelir Ekle'}
                </h2>
                <button onClick={() => setIsIncomeDrawerOpen(false)} className="w-6 h-6 rounded-full hover:bg-white/5 flex items-center justify-center text-[#8c869e] hover:text-[#f1ecf9] transition-all">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <form onSubmit={(e) => handleSave(e, 'income')} className="space-y-4 text-xs font-bold text-[#f1ecf9]">
                <div className="space-y-1">
                  <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">Başlık *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn. SNC Mimarlık İlk Ödeme"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full p-2.5 rounded bg-[#06050b] border border-white/10 text-xs font-semibold focus:outline-none focus:border-[#4f20c0]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">Tutar *</label>
                    <input
                      type="number"
                      required
                      placeholder="0"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      className="w-full p-2.5 rounded bg-[#06050b] border border-white/10 text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">Durum</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full p-2.5 rounded bg-[#06050b] border border-white/10 text-xs font-semibold focus:outline-none text-[#f1ecf9]"
                    >
                      <option value="pending">Bekliyor</option>
                      <option value="paid">Tahsil Edildi</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">İşlem Tarihi</label>
                    <input
                      type="date"
                      value={formTransactionDate}
                      onChange={(e) => setFormTransactionDate(e.target.value)}
                      className="w-full p-2 text-xs font-semibold rounded bg-[#06050b] border border-white/10 focus:outline-none text-[#f1ecf9]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">Taksit / Ödeme Tipi</label>
                    <select
                      value={formPaymentType}
                      onChange={(e) => setFormPaymentType(e.target.value)}
                      className="w-full p-2.5 rounded bg-[#06050b] border border-white/10 text-xs font-semibold focus:outline-none text-[#f1ecf9]"
                    >
                      <option value="single">Tek Seferlik</option>
                      <option value="installment">Taksitli</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">Gelir Tipi</label>
                  <select
                    value={formCategoryType}
                    onChange={(e) => setFormCategoryType(e.target.value)}
                    className="w-full p-2.5 rounded bg-[#06050b] border border-white/10 text-xs font-semibold focus:outline-none text-[#f1ecf9]"
                  >
                    <option value="project_fee">Proje Bedeli</option>
                    <option value="consulting">Danışmanlık</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">Bağlantı Tipi</label>
                  <select
                    value={formRelationType}
                    onChange={(e) => setFormRelationType(e.target.value)}
                    className="w-full p-2.5 rounded bg-[#06050b] border border-white/10 text-xs font-semibold focus:outline-none text-[#f1ecf9]"
                  >
                    <option value="brand">Marka</option>
                    <option value="general">Genel Gelir</option>
                  </select>
                </div>

                {formRelationType === 'brand' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">Marka</label>
                      <select
                        value={formClientId}
                        onChange={(e) => setFormClientId(e.target.value)}
                        className="w-full p-2.5 rounded bg-[#06050b] border border-white/10 text-xs font-semibold focus:outline-none text-[#f1ecf9]"
                      >
                        <option value="">-- Seçiniz --</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.companyName}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">İlgili İş</label>
                      <select
                        value={formProjectId}
                        onChange={(e) => setFormProjectId(e.target.value)}
                        className="w-full p-2.5 rounded bg-[#06050b] border border-white/10 text-xs font-semibold focus:outline-none text-[#f1ecf9]"
                      >
                        <option value="">Genel</option>
                        {projects.filter(p => p.clientName === clients.find(c => c.id === formClientId)?.companyName).map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">Not</label>
                  <textarea
                    rows={3}
                    placeholder="Ek bilgi..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full p-2.5 rounded bg-[#06050b] border border-white/10 text-xs font-semibold focus:outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <button type="button" onClick={() => setIsIncomeDrawerOpen(false)} className="flex-grow py-2.5 border border-white/10 rounded font-bold text-[#8c869e] hover:text-[#f1ecf9] text-center">
                    Vazgeç
                  </button>
                  <button type="submit" className="flex-grow py-2.5 rounded bg-gradient-to-r from-[#4f20c0] to-[#b5179e] text-white font-bold text-center border-0 hover:shadow-lg transition-all">
                    Kaydet
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Expense (Gider) Add/Edit Drawer ── */}
      {isExpenseDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end no-print">
          <div onClick={() => setIsExpenseDrawerOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all" />
          <div className="w-full max-w-md bg-[#0e0b1a] border-l border-white/10 h-full p-6 flex flex-col justify-between relative z-10 shadow-2xl animate-fade-in-up text-left overflow-y-auto">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <h2 className="text-sm font-black tracking-wider text-[#f6f5fa] uppercase flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-red-400">arrow_downward</span>
                  {editingRecord ? 'Gider Kaydını Düzenle' : 'Gider Ekle'}
                </h2>
                <button onClick={() => setIsExpenseDrawerOpen(false)} className="w-6 h-6 rounded-full hover:bg-white/5 flex items-center justify-center text-[#8c869e] hover:text-[#f1ecf9] transition-all">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <form onSubmit={(e) => handleSave(e, 'expense')} className="space-y-4 text-xs font-bold text-[#f1ecf9]">
                <div className="space-y-1">
                  <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">Başlık *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn. Adobe CC Aboneliği"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full p-2.5 rounded bg-[#06050b] border border-white/10 text-xs font-semibold focus:outline-none focus:border-[#4f20c0]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">Tutar *</label>
                    <input
                      type="number"
                      required
                      placeholder="0"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      className="w-full p-2.5 rounded bg-[#06050b] border border-white/10 text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">Durum</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full p-2.5 rounded bg-[#06050b] border border-white/10 text-xs font-semibold focus:outline-none text-[#f1ecf9]"
                    >
                      <option value="planlandı">Planlandı</option>
                      <option value="paid">Ödendi</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">İşlem Tarihi</label>
                    <input
                      type="date"
                      value={formTransactionDate}
                      onChange={(e) => setFormTransactionDate(e.target.value)}
                      className="w-full p-2 text-xs font-semibold rounded bg-[#06050b] border border-white/10 focus:outline-none text-[#f1ecf9]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">Taksit / Ödeme Tipi</label>
                    <select
                      value={formPaymentType}
                      onChange={(e) => setFormPaymentType(e.target.value)}
                      className="w-full p-2.5 rounded bg-[#06050b] border border-white/10 text-xs font-semibold focus:outline-none text-[#f1ecf9]"
                    >
                      <option value="single">Tek Seferlik</option>
                      <option value="recurring">Tekrarlayan (Aylık/Yıllık)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">Gider Tipi</label>
                    <select
                      value={formCategoryType}
                      onChange={(e) => setFormCategoryType(e.target.value)}
                      className="w-full p-2.5 rounded bg-[#06050b] border border-white/10 text-xs font-semibold focus:outline-none text-[#f1ecf9]"
                    >
                      <option value="software">Yazılım/SaaS</option>
                      <option value="freelancer">Freelancer Ödemesi</option>
                      <option value="office">Ofis Giderleri</option>
                      <option value="tax">Vergi / Harç</option>
                      <option value="other">Diğer</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">Bağlantı Tipi</label>
                    <select
                      value={formRelationType}
                      onChange={(e) => {
                        setFormRelationType(e.target.value);
                        setFormClientId('');
                        setFormProjectId('');
                        setFormFreelancerId('');
                      }}
                      className="w-full p-2.5 rounded bg-[#06050b] border border-white/10 text-xs font-semibold focus:outline-none text-[#f1ecf9]"
                    >
                      <option value="general">Genel Gider</option>
                      <option value="freelancer">Freelancer/Tedarikçi</option>
                      <option value="project">Proje Gideri</option>
                    </select>
                  </div>

                  {formRelationType === 'freelancer' && (
                    <div className="space-y-1 animate-fade-in-up">
                      <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">Freelancer / Tedarikçi *</label>
                      <select
                        value={formFreelancerId}
                        onChange={(e) => setFormFreelancerId(e.target.value)}
                        className="w-full p-2.5 rounded bg-[#06050b] border border-white/10 text-xs font-semibold focus:outline-none text-[#f1ecf9]"
                        required={formRelationType === 'freelancer'}
                      >
                        <option value="">-- Seçiniz --</option>
                        {freelancers.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name} ({f.expertise || f.record_type})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formRelationType === 'project' && (
                    <div className="grid grid-cols-2 gap-4 animate-fade-in-up">
                      <div className="space-y-1">
                        <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">Marka *</label>
                        <select
                          value={formClientId}
                          onChange={(e) => {
                            setFormClientId(e.target.value);
                            setFormProjectId('');
                          }}
                          className="w-full p-2.5 rounded bg-[#06050b] border border-white/10 text-xs font-semibold focus:outline-none text-[#f1ecf9]"
                          required={formRelationType === 'project'}
                        >
                          <option value="">-- Seçiniz --</option>
                          {clients.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.companyName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">Proje</label>
                        <select
                          value={formProjectId}
                          onChange={(e) => setFormProjectId(e.target.value)}
                          className="w-full p-2.5 rounded bg-[#06050b] border border-white/10 text-xs font-semibold focus:outline-none text-[#f1ecf9]"
                        >
                          <option value="">Genel (Projesiz)</option>
                          {projects
                            .filter((p) => p.clientName === clients.find((c) => c.id === formClientId)?.companyName)
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">Ödeme Yöntemi</label>
                    <select
                      value={formPaymentMethod}
                      onChange={(e) => setFormPaymentMethod(e.target.value)}
                      className="w-full p-2.5 rounded bg-[#06050b] border border-white/10 text-xs font-semibold focus:outline-none text-[#f1ecf9]"
                    >
                      <option value="bank_transfer">Banka Havalesi / EFT</option>
                      <option value="credit_card">Kredi Kartı</option>
                      <option value="cash">Nakit</option>
                      <option value="other">Diğer</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">Fatura Durumu</label>
                    <select
                      value={formInvoiceStatus}
                      onChange={(e) => setFormInvoiceStatus(e.target.value)}
                      className="w-full p-2.5 rounded bg-[#06050b] border border-white/10 text-xs font-semibold focus:outline-none text-[#f1ecf9]"
                    >
                      <option value="unknown">Bilinmiyor</option>
                      <option value="invoiced">Faturalı</option>
                      <option value="without_invoice">Faturasız</option>
                    </select>
                  </div>
                </div>

                {formInvoiceStatus === 'invoiced' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">KDV Oranı</label>
                      <select
                        value={formVatRate}
                        onChange={(e) => setFormVatRate(Number(e.target.value))}
                        className="w-full p-2.5 rounded bg-[#06050b] border border-white/10 text-xs font-semibold focus:outline-none text-[#f1ecf9]"
                      >
                        <option value={0}>%0</option>
                        <option value={1}>%1</option>
                        <option value={10}>%10</option>
                        <option value={20}>%20</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">Belge / Fatura No</label>
                      <input
                        type="text"
                        placeholder="Örn. INV-2026-001"
                        value={formInvoiceNo}
                        onChange={(e) => setFormInvoiceNo(e.target.value)}
                        className="w-full p-2.5 rounded bg-[#06050b] border border-white/10 text-xs font-semibold focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="py-1">
                  <label className="flex items-center gap-3.5 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={formIsRecurring}
                      onChange={(e) => setFormIsRecurring(e.target.checked)}
                      className="w-4 h-4 rounded bg-[#06050b] border-white/10 text-[#4f20c0] focus:ring-[#4f20c0] cursor-pointer"
                    />
                    <div>
                      <span className="text-[#f1ecf9]">Tekrarlayan Kayıt</span>
                      <p className="text-[9px] text-[#8c869e] font-normal mt-0.5">Her ay otomatik gider planı olarak yansıtılmasını sağlar.</p>
                    </div>
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#8c869e] uppercase tracking-wider block">Not</label>
                  <textarea
                    rows={3}
                    placeholder="Ek bilgi..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full p-2.5 rounded bg-[#06050b] border border-white/10 text-xs font-semibold focus:outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <button type="button" onClick={() => setIsExpenseDrawerOpen(false)} className="flex-grow py-2.5 border border-white/10 rounded font-bold text-[#8c869e] hover:text-[#f1ecf9] text-center">
                    Vazgeç
                  </button>
                  <button type="submit" className="flex-grow py-2.5 rounded bg-gradient-to-r from-[#4f20c0] to-[#b5179e] text-white font-bold text-center border-0 hover:shadow-lg transition-all">
                    Kaydet
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
