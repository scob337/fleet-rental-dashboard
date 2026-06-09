'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, DollarSign, TrendingUp, Download, Filter } from 'lucide-react';
import DataTable, { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import PageHeader from '@/components/shared/PageHeader';
import Modal from '@/components/shared/Modal';
import StatsCard from '@/components/shared/StatsCard';

interface Revenue {
  id: string;
  date: string;
  customer: string;
  description: string;
  amount: number;
  paymentMethod: string;
  status: string;
}

const mockRevenue: Revenue[] = [
  { id: '1', date: '2024-01-15', customer: 'شركة النور للتجارة', description: 'إيجار حاويات شهر يناير', amount: 45000, paymentMethod: 'تحويل بنكي', status: 'RECEIVED' },
  { id: '2', date: '2024-01-12', customer: 'مجموعة الخليج', description: 'إيجار شاحنات - ميناء جدة', amount: 62000, paymentMethod: 'شيك', status: 'RECEIVED' },
  { id: '3', date: '2024-01-10', customer: 'مؤسسة الأمانة', description: 'نقل بضائع - الرياض', amount: 18500, paymentMethod: 'نقداً', status: 'PARTIAL' },
  { id: '4', date: '2024-01-08', customer: 'شركة الراشد', description: 'إيجار حاويات ٤٠قدم', amount: 32000, paymentMethod: 'تحويل بنكي', status: 'PENDING' },
  { id: '5', date: '2024-01-05', customer: 'مجموعة المملكة', description: 'خدمات نقل وتوزيع', amount: 28000, paymentMethod: 'شيك', status: 'RECEIVED' },
];

const paymentMethods = ['الكل', 'نقداً', 'شيك', 'تحويل بنكي', 'بطاقة'];

export default function RevenuePage() {
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMethod, setFilterMethod] = useState('الكل');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchRevenue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/revenue');
      if (res.ok) {
        const data = await res.json();
        setRevenues(data.revenues ?? data);
      } else setRevenues(mockRevenue);
    } catch { setRevenues(mockRevenue); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRevenue(); }, [fetchRevenue]);

  const filtered = revenues.filter((r) => {
    if (filterStatus && r.status !== filterStatus) return false;
    if (filterMethod !== 'الكل' && r.paymentMethod !== filterMethod) return false;
    return true;
  });

  const totalMonth   = revenues.reduce((s, r) => s + r.amount, 0);
  const collected    = revenues.filter((r) => r.status === 'RECEIVED').reduce((s, r) => s + r.amount, 0);
  const pending      = revenues.filter((r) => r.status === 'PENDING').reduce((s, r) => s + r.amount, 0);
  const yearRevenue  = totalMonth * 12;

  const columns: Column<Revenue>[] = [
    { key: 'date', header: 'التاريخ', sortable: true },
    { key: 'customer', header: 'العميل', sortable: true },
    { key: 'description', header: 'بيان الإيراد' },
    {
      key: 'amount',
      header: 'المبلغ',
      sortable: true,
      render: (row) => (
        <span className={`font-bold tabular-nums ${row.status === 'RECEIVED' ? 'text-green-600' : row.status === 'PENDING' ? 'text-amber-600' : 'text-blue-600'}`}>
          {row.amount.toLocaleString('ar-SA')} ر.س
        </span>
      ),
    },
    { key: 'paymentMethod', header: 'طريقة الدفع' },
    { key: 'status', header: 'الحالة', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="الإيرادات"
        subtitle="تتبع ومتابعة الإيرادات والتحصيلات"
        breadcrumbs={['المالية', 'الإيرادات']}
        action={
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-colors">
              <Download size={15} /> تصدير Excel
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              <Plus size={16} /> إضافة إيراد
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="إيراد الشهر" value={`${(totalMonth/1000).toFixed(0)}k ر.س`} icon={DollarSign} color="green" trend={12} />
        <StatsCard title="التحصيل الفعلي" value={`${(collected/1000).toFixed(0)}k ر.س`} icon={TrendingUp} color="blue" trend={8} />
        <StatsCard title="مستحقات معلقة" value={`${(pending/1000).toFixed(0)}k ر.س`} icon={DollarSign} color="orange" trend={-5} />
        <StatsCard title="إيراد السنة" value={`${(yearRevenue/1000).toFixed(0)}k ر.س`} icon={TrendingUp} color="purple" trend={15} />
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl p-4 card-shadow flex flex-wrap items-center gap-3">
        <Filter size={16} className="text-muted-foreground" />
        <div className="flex gap-2 flex-wrap">
          {['', 'RECEIVED', 'PENDING', 'PARTIAL'].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border
                ${filterStatus === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border hover:bg-secondary'}`}>
              {s === '' ? 'الكل' : s === 'RECEIVED' ? 'محصّل' : s === 'PENDING' ? 'معلق' : 'جزئي'}
            </button>
          ))}
        </div>
        <div className="w-px h-5 bg-border mx-1" />
        <select value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)}
          className="bg-background border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring">
          {paymentMethods.map((m) => <option key={m}>{m}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="bg-background border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
          <span className="text-xs text-muted-foreground">–</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="bg-background border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>

      <DataTable data={filtered} columns={columns} loading={loading} searchPlaceholder="البحث بالعميل أو البيان..." emptyTitle="لا توجد إيرادات" />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="إضافة إيراد جديد" size="md"
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-border hover:bg-secondary text-sm font-medium transition-colors">إلغاء</button>
            <button onClick={() => setShowModal(false)} className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">حفظ</button>
          </>
        }>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'العميل', ph: 'اسم العميل' }, { label: 'المبلغ', ph: '0.00' },
            { label: 'التاريخ', ph: '', type: 'date' }, { label: 'بيان الإيراد', ph: 'وصف الإيراد' },
          ].map((f) => (
            <div key={f.label}>
              <label className="block text-sm font-semibold mb-1.5">{f.label}</label>
              <input type={f.type ?? 'text'} placeholder={f.ph}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow" />
            </div>
          ))}
          <div><label className="block text-sm font-semibold mb-1.5">طريقة الدفع</label>
            <select className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              {['نقداً','شيك','تحويل بنكي','بطاقة'].map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-semibold mb-1.5">الحالة</label>
            <select className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="RECEIVED">محصّل</option>
              <option value="PENDING">معلق</option>
              <option value="PARTIAL">جزئي</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
