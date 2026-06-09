'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, User, Phone, Mail, FileText, DollarSign, Pencil, Trash2, Eye } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import PageHeader from '@/components/shared/PageHeader';
import Modal from '@/components/shared/Modal';
import StatsCard from '@/components/shared/StatsCard';
import EmptyState from '@/components/shared/EmptyState';
import DataTable, { Column } from '@/components/shared/DataTable';

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  status: string;
  contractsCount: number;
  totalRevenue: number;
  city?: string;
}

const mockCustomers: Customer[] = [
  { id: '1', name: 'محمد عبدالله الشهري', phone: '0501234567', email: 'mohammed@alnourtrade.com', company: 'شركة النور للتجارة', status: 'ACTIVE', contractsCount: 5, totalRevenue: 185000, city: 'جدة' },
  { id: '2', name: 'فيصل عبدالرحمن القحطاني', phone: '0557890123', email: 'faisal@gulfgroup.sa', company: 'مجموعة الخليج', status: 'ACTIVE', contractsCount: 3, totalRevenue: 124000, city: 'الرياض' },
  { id: '3', name: 'خالد سعد الغامدي', phone: '0535678901', email: undefined, company: 'مؤسسة الأمانة', status: 'ACTIVE', contractsCount: 2, totalRevenue: 46500, city: 'الدمام' },
  { id: '4', name: 'سلطان محمد الدوسري', phone: '0501122334', email: 'sultan@rashid.com', company: 'شركة الراشد', status: 'INACTIVE', contractsCount: 7, totalRevenue: 298000, city: 'جدة' },
  { id: '5', name: 'عبدالعزيز يوسف العتيبي', phone: '0565544332', email: undefined, company: 'مؤسسة المملكة', status: 'ACTIVE', contractsCount: 1, totalRevenue: 28000, city: 'مكة المكرمة' },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [view, setView] = useState<'cards' | 'table'>('cards');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/customers');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers ?? data);
      } else setCustomers(mockCustomers);
    } catch { setCustomers(mockCustomers); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const totalRevenue = customers.reduce((s, c) => s + c.totalRevenue, 0);
  const activeCount = customers.filter((c) => c.status === 'ACTIVE').length;
  const totalContracts = customers.reduce((s, c) => s + c.contractsCount, 0);

  const columns: Column<Customer>[] = [
    { key: 'name', header: 'اسم العميل', sortable: true },
    { key: 'company', header: 'الشركة' },
    { key: 'phone', header: 'رقم الهاتف' },
    { key: 'city', header: 'المدينة' },
    { key: 'contractsCount', header: 'عدد العقود', sortable: true, render: (row) => <span className="font-bold">{row.contractsCount}</span> },
    { key: 'totalRevenue', header: 'إجمالي الإيرادات', sortable: true, render: (row) => (
      <span className="font-bold text-green-600">{row.totalRevenue.toLocaleString('ar-SA')} ر.س</span>
    )},
    { key: 'status', header: 'الحالة', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="قاعدة العملاء"
        subtitle="إدارة بيانات وسجلات العملاء"
        breadcrumbs={['العملاء', 'قاعدة العملاء']}
        action={
          <div className="flex gap-2">
            <div className="flex border border-border rounded-xl overflow-hidden">
              {(['cards', 'table'] as const).map((v) => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3 py-2 text-sm font-medium transition-colors
                    ${view === v ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}>
                  {v === 'cards' ? 'بطاقات' : 'جدول'}
                </button>
              ))}
            </div>
            <button onClick={() => { setSelected(null); setShowModal(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
              <Plus size={16} /> إضافة عميل
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="إجمالي العملاء" value={customers.length} icon={User} color="blue" />
        <StatsCard title="العملاء النشطون" value={activeCount} icon={User} color="green" />
        <StatsCard title="إجمالي العقود" value={totalContracts} icon={FileText} color="purple" />
        <StatsCard title="إجمالي الإيرادات" value={`${(totalRevenue/1000).toFixed(0)}k ر.س`} icon={DollarSign} color="teal" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => <div key={i} className="h-52 skeleton rounded-2xl" />)}
        </div>
      ) : view === 'table' ? (
        <DataTable data={customers} columns={columns} searchPlaceholder="البحث بالاسم أو الشركة..." emptyTitle="لا يوجد عملاء"
          actions={(row) => (
            <div className="flex items-center justify-center gap-1">
              <a href={`/dashboard/customers/${row.id}`} className="p-1.5 rounded-lg hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 transition-colors"><Eye size={15} /></a>
              <button onClick={() => { setSelected(row); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-amber-100 hover:text-amber-600 dark:hover:bg-amber-900/30 transition-colors"><Pencil size={15} /></button>
              <button onClick={() => setDeleteId(row.id)} className="p-1.5 rounded-lg hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 transition-colors"><Trash2 size={15} /></button>
            </div>
          )}
        />
      ) : customers.length === 0 ? (
        <EmptyState title="لا يوجد عملاء" description="ابدأ بإضافة أول عميل" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((c) => (
            <div key={c.id} className="bg-card border border-border rounded-2xl p-5 card-shadow hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 gradient-primary rounded-xl flex items-center justify-center text-white font-black">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold leading-tight">{c.name}</p>
                    {c.company && <p className="text-xs text-muted-foreground">{c.company}</p>}
                  </div>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <div className="space-y-1.5 text-sm mb-4">
                {c.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone size={13} />{c.phone}</div>}
                {c.email && <div className="flex items-center gap-2 text-muted-foreground"><Mail size={13} />{c.email}</div>}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="text-center">
                  <p className="text-lg font-black text-primary">{c.contractsCount}</p>
                  <p className="text-xs text-muted-foreground">العقود</p>
                </div>
                <div className="text-center">
                  <p className="text-base font-black text-green-600">{(c.totalRevenue/1000).toFixed(0)}k ر.س</p>
                  <p className="text-xs text-muted-foreground">إجمالي الإيرادات</p>
                </div>
                <div className="flex gap-1">
                  <a href={`/dashboard/customers/${c.id}`} className="p-2 rounded-lg hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 transition-colors"><Eye size={14} /></a>
                  <button onClick={() => { setSelected(c); setShowModal(true); }} className="p-2 rounded-lg hover:bg-amber-100 hover:text-amber-600 dark:hover:bg-amber-900/30 transition-colors"><Pencil size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selected ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'} size="md"
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-border hover:bg-secondary text-sm font-medium transition-colors">إلغاء</button>
            <button onClick={() => setShowModal(false)} className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
              {selected ? 'حفظ' : 'إضافة'}
            </button>
          </>
        }>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'اسم العميل', k: 'name', ph: 'الاسم الكامل' },
            { label: 'رقم الهاتف', k: 'phone', ph: '0501234567' },
            { label: 'البريد الإلكتروني', k: 'email', ph: 'email@domain.com' },
            { label: 'الشركة', k: 'company', ph: 'اسم الشركة' },
            { label: 'المدينة', k: 'city', ph: 'جدة' },
          ].map((f) => (
            <div key={f.k}><label className="block text-sm font-semibold mb-1.5">{f.label}</label>
              <input type="text" defaultValue={selected ? String(selected[f.k as keyof Customer] ?? '') : ''} placeholder={f.ph}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          ))}
          <div><label className="block text-sm font-semibold mb-1.5">الحالة</label>
            <select defaultValue={selected?.status ?? 'ACTIVE'}
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="ACTIVE">نشط</option>
              <option value="INACTIVE">غير نشط</option>
              <option value="BLACKLISTED">محظور</option>
            </select>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="تأكيد الحذف" size="sm"
        footer={
          <>
            <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-xl border border-border hover:bg-secondary text-sm font-medium transition-colors">إلغاء</button>
            <button onClick={async () => { await fetch(`/api/customers/${deleteId}`, { method: 'DELETE' }); setDeleteId(null); fetchCustomers(); }}
              className="px-5 py-2 bg-destructive text-white rounded-xl text-sm font-semibold">حذف</button>
          </>
        }>
        <p className="text-muted-foreground text-sm">هل أنت متأكد من حذف هذا العميل؟</p>
      </Modal>
    </div>
  );
}
