'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, TrendingDown, Fuel, Settings, Download } from 'lucide-react';
import DataTable, { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import PageHeader from '@/components/shared/PageHeader';
import Modal from '@/components/shared/Modal';
import StatsCard from '@/components/shared/StatsCard';
import { ExpensesPieChart } from '@/components/dashboard/Charts';

interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  vehicle: string;
  amount: number;
  status: string;
}

const mockExpenses: Expense[] = [
  { id: '1', date: '2024-01-15', description: 'تعبئة وقود - شاحنة ١٢٣', category: 'وقود', vehicle: 'أ ب ج ١٢٣', amount: 3500, status: 'RECEIVED' },
  { id: '2', date: '2024-01-14', description: 'راتب محمد أحمد', category: 'رواتب', vehicle: '-', amount: 8000, status: 'RECEIVED' },
  { id: '3', date: '2024-01-12', description: 'صيانة شاحنة ٢٤١', category: 'صيانة', vehicle: 'ي ك ل ٠١٢', amount: 4200, status: 'RECEIVED' },
  { id: '4', date: '2024-01-10', description: 'تأمين السيارات – الربع الأول', category: 'تشغيل', vehicle: 'الكل', amount: 15000, status: 'PENDING' },
  { id: '5', date: '2024-01-08', description: 'غسيل وتنظيف أسطول', category: 'أخرى', vehicle: 'الكل', amount: 900, status: 'RECEIVED' },
];

const categoryLabels: Record<string, string> = {
  'وقود': 'وقود', 'رواتب': 'رواتب', 'صيانة': 'صيانة', 'تشغيل': 'تشغيل', 'أخرى': 'أخرى'
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterCat, setFilterCat] = useState('');

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/expenses');
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.expenses ?? data);
      } else setExpenses(mockExpenses);
    } catch { setExpenses(mockExpenses); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const filtered = filterCat ? expenses.filter((e) => e.category === filterCat) : expenses;

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const fuelTotal = expenses.filter((e) => e.category === 'وقود').reduce((s, e) => s + e.amount, 0);
  const opsTotal = expenses.filter((e) => e.category === 'تشغيل').reduce((s, e) => s + e.amount, 0);
  const otherTotal = expenses.filter((e) => !['وقود','تشغيل'].includes(e.category)).reduce((s, e) => s + e.amount, 0);

  const columns: Column<Expense>[] = [
    { key: 'date', header: 'التاريخ', sortable: true },
    { key: 'description', header: 'البيان' },
    { key: 'category', header: 'نوع المصروف', render: (row) => (
      <span className="px-2 py-0.5 bg-muted rounded-full text-xs font-medium">{row.category}</span>
    )},
    { key: 'vehicle', header: 'السيارة' },
    { key: 'amount', header: 'المبلغ', sortable: true, render: (row) => (
      <span className="font-bold text-red-600 tabular-nums">{row.amount.toLocaleString('ar-SA')} ر.س</span>
    )},
    { key: 'status', header: 'الحالة', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="المصروفات"
        subtitle="تتبع ومراقبة مصروفات الأسطول"
        breadcrumbs={['المالية', 'المصروفات']}
        action={
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-colors">
              <Download size={15} /> تصدير
            </button>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
              <Plus size={16} /> إضافة مصروف
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="مصروفات الشهر" value={`${(total/1000).toFixed(0)}k ر.س`} icon={TrendingDown} color="red" trend={-3} />
        <StatsCard title="مصروفات الوقود" value={`${(fuelTotal/1000).toFixed(0)}k ر.س`} icon={Fuel} color="orange" trend={5} />
        <StatsCard title="مصروفات التشغيل" value={`${(opsTotal/1000).toFixed(0)}k ر.س`} icon={Settings} color="blue" trend={-1} />
        <StatsCard title="مصروفات أخرى" value={`${(otherTotal/1000).toFixed(0)}k ر.س`} icon={TrendingDown} color="purple" trend={8} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            {['', ...Object.keys(categoryLabels)].map((cat) => (
              <button key={cat} onClick={() => setFilterCat(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border
                  ${filterCat === cat ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border hover:bg-secondary'}`}>
                {cat === '' ? 'الكل' : cat}
              </button>
            ))}
          </div>
          <DataTable data={filtered} columns={columns} loading={loading} searchPlaceholder="البحث في المصروفات..." emptyTitle="لا توجد مصروفات" />
        </div>
        <ExpensesPieChart />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="إضافة مصروف جديد" size="md"
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-border hover:bg-secondary text-sm font-medium transition-colors">إلغاء</button>
            <button onClick={() => setShowModal(false)} className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">حفظ</button>
          </>
        }>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'البيان', ph: 'وصف المصروف' }, { label: 'المبلغ', ph: '0.00' },
            { label: 'التاريخ', ph: '', type: 'date' },
          ].map((f) => (
            <div key={f.label}>
              <label className="block text-sm font-semibold mb-1.5">{f.label}</label>
              <input type={f.type ?? 'text'} placeholder={f.ph}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          ))}
          <div><label className="block text-sm font-semibold mb-1.5">نوع المصروف</label>
            <select className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              {['وقود','رواتب','صيانة','تشغيل','أخرى'].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-semibold mb-1.5">السيارة</label>
            <input type="text" placeholder="رقم لوحة السيارة"
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
