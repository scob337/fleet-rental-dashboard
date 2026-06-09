'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, FileText, Eye, Pencil, Trash2, Download, Calendar } from 'lucide-react';
import DataTable, { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import PageHeader from '@/components/shared/PageHeader';
import Modal from '@/components/shared/Modal';
import StatsCard from '@/components/shared/StatsCard';

interface Contract {
  id: string;
  contractNumber: string;
  customer: string;
  vehicle: string;
  container?: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: string;
}

const mockContracts: Contract[] = [
  { id: '1', contractNumber: 'CNT-2024-001', customer: 'شركة النور للتجارة', vehicle: 'أ ب ج ١٢٣', container: 'CNT-40-001', startDate: '2024-01-01', endDate: '2024-03-31', totalAmount: 145000, status: 'ACTIVE' },
  { id: '2', contractNumber: 'CNT-2024-002', customer: 'مجموعة الخليج', vehicle: 'ي ك ل ٠١٢', container: 'CNT-20-005', startDate: '2024-01-10', endDate: '2024-04-10', totalAmount: 186000, status: 'ACTIVE' },
  { id: '3', contractNumber: 'CNT-2024-003', customer: 'مؤسسة الأمانة', vehicle: 'د ه و ٤٥٦', container: undefined, startDate: '2024-01-15', endDate: '2024-02-28', totalAmount: 55500, status: 'PENDING' },
  { id: '4', contractNumber: 'CNT-2023-089', customer: 'شركة الراشد', vehicle: 'م ن س ٣٤٥', container: 'CNT-40-012', startDate: '2023-10-01', endDate: '2023-12-31', totalAmount: 298000, status: 'COMPLETED' },
  { id: '5', contractNumber: 'CNT-2023-076', customer: 'مؤسسة المملكة', vehicle: 'ز ح ط ٧٨٩', container: 'CNT-20-003', startDate: '2023-09-15', endDate: '2023-11-15', totalAmount: 84000, status: 'CANCELLED' },
];

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Contract | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contracts');
      if (res.ok) {
        const data = await res.json();
        setContracts(data.contracts ?? data);
      } else setContracts(mockContracts);
    } catch { setContracts(mockContracts); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  const filtered = filterStatus ? contracts.filter((c) => c.status === filterStatus) : contracts;

  const active = contracts.filter((c) => c.status === 'ACTIVE').length;
  const completed = contracts.filter((c) => c.status === 'COMPLETED').length;
  const pending = contracts.filter((c) => c.status === 'PENDING').length;
  const totalValue = contracts.reduce((s, c) => s + c.totalAmount, 0);

  const columns: Column<Contract>[] = [
    { key: 'contractNumber', header: 'رقم العقد', sortable: true, render: (row) => (
      <span className="font-mono text-xs font-bold text-primary">{row.contractNumber}</span>
    )},
    { key: 'customer', header: 'العميل', sortable: true },
    { key: 'vehicle', header: 'السيارة' },
    { key: 'container', header: 'الحاوية', render: (row) => <span>{row.container ?? '–'}</span> },
    { key: 'startDate', header: 'تاريخ البداية', sortable: true },
    { key: 'endDate', header: 'تاريخ الانتهاء', sortable: true },
    { key: 'totalAmount', header: 'القيمة', sortable: true, render: (row) => (
      <span className="font-bold text-green-600 tabular-nums">{row.totalAmount.toLocaleString('ar-SA')} ر.س</span>
    )},
    { key: 'status', header: 'الحالة', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="إدارة العقود"
        subtitle="متابعة وإدارة عقود التأجير"
        breadcrumbs={['العملاء', 'العقود']}
        action={
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-colors">
              <Download size={15} /> تصدير PDF
            </button>
            <button onClick={() => { setSelected(null); setShowModal(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
              <Plus size={16} /> عقد جديد
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="العقود النشطة" value={active} icon={FileText} color="blue" />
        <StatsCard title="المكتملة" value={completed} icon={FileText} color="green" />
        <StatsCard title="المعلقة" value={pending} icon={Calendar} color="orange" />
        <StatsCard title="إجمالي القيمة" value={`${(totalValue/1000).toFixed(0)}k ر.س`} icon={FileText} color="purple" />
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { v: '', l: 'الكل' }, { v: 'ACTIVE', l: 'نشط' }, { v: 'COMPLETED', l: 'مكتمل' },
          { v: 'PENDING', l: 'معلق' }, { v: 'CANCELLED', l: 'ملغي' },
        ].map((s) => (
          <button key={s.v} onClick={() => setFilterStatus(s.v)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border
              ${filterStatus === s.v ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border hover:bg-secondary'}`}>
            {s.l}
          </button>
        ))}
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        loading={loading}
        searchPlaceholder="البحث برقم العقد أو العميل..."
        emptyTitle="لا توجد عقود"
        actions={(row) => (
          <div className="flex items-center justify-center gap-1">
            <a href={`/dashboard/contracts/${row.id}`} className="p-1.5 rounded-lg hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 transition-colors"><Eye size={15} /></a>
            <button onClick={() => { setSelected(row); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-amber-100 hover:text-amber-600 dark:hover:bg-amber-900/30 transition-colors"><Pencil size={15} /></button>
            <button onClick={() => setDeleteId(row.id)} className="p-1.5 rounded-lg hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 transition-colors"><Trash2 size={15} /></button>
          </div>
        )}
      />

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selected ? 'تعديل العقد' : 'إضافة عقد جديد'} size="lg"
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-border hover:bg-secondary text-sm font-medium transition-colors">إلغاء</button>
            <button onClick={() => setShowModal(false)} className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
              {selected ? 'حفظ التعديلات' : 'إنشاء العقد'}
            </button>
          </>
        }>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'العميل', ph: 'اسم العميل' },
            { label: 'السيارة', ph: 'رقم اللوحة' },
            { label: 'الحاوية', ph: 'كود الحاوية' },
            { label: 'القيمة الإجمالية (ر.س)', ph: '0.00' },
            { label: 'تاريخ البداية', ph: '', type: 'date' },
            { label: 'تاريخ الانتهاء', ph: '', type: 'date' },
          ].map((f) => (
            <div key={f.label}><label className="block text-sm font-semibold mb-1.5">{f.label}</label>
              <input type={f.type ?? 'text'} placeholder={f.ph}
                defaultValue={selected && f.label === 'العميل' ? selected.customer : ''}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          ))}
          <div><label className="block text-sm font-semibold mb-1.5">الحالة</label>
            <select defaultValue={selected?.status ?? 'ACTIVE'}
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="ACTIVE">نشط</option>
              <option value="PENDING">معلق</option>
              <option value="COMPLETED">مكتمل</option>
              <option value="CANCELLED">ملغي</option>
            </select>
          </div>
          <div className="sm:col-span-2"><label className="block text-sm font-semibold mb-1.5">ملاحظات</label>
            <textarea rows={2} placeholder="ملاحظات إضافية..."
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>
        </div>
      </Modal>

      {/* Delete */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="تأكيد حذف العقد" size="sm"
        footer={
          <>
            <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-xl border border-border hover:bg-secondary text-sm font-medium transition-colors">إلغاء</button>
            <button onClick={async () => { await fetch(`/api/contracts/${deleteId}`, { method: 'DELETE' }); setDeleteId(null); fetchContracts(); }}
              className="px-5 py-2 bg-destructive text-white rounded-xl text-sm font-semibold">حذف</button>
          </>
        }>
        <p className="text-muted-foreground text-sm">هل أنت متأكد من حذف هذا العقد نهائياً؟</p>
      </Modal>
    </div>
  );
}
