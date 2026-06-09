'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Wrench, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import DataTable, { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import PageHeader from '@/components/shared/PageHeader';
import Modal from '@/components/shared/Modal';
import StatsCard from '@/components/shared/StatsCard';

interface Maintenance {
  id: string;
  vehicle: string;
  type: string;
  description: string;
  cost: number;
  startDate: string;
  endDate?: string;
  status: string;
  nextDue?: string;
}

const mockMaintenance: Maintenance[] = [
  { id: '1', vehicle: 'أ ب ج ١٢٣', type: 'صيانة دورية', description: 'تغيير زيت وفلاتر', cost: 2500, startDate: '2024-01-10', endDate: '2024-01-11', status: 'COMPLETED', nextDue: '2024-04-10' },
  { id: '2', vehicle: 'ز ح ط ٧٨٩', type: 'إصلاح', description: 'إصلاح نظام الفرامل والإطارات', cost: 8500, startDate: '2024-01-12', status: 'IN_PROGRESS', nextDue: undefined },
  { id: '3', vehicle: 'م ن س ٣٤٥', type: 'طارئة', description: 'تلف في المحرك - إصلاح كامل', cost: 22000, startDate: '2023-12-20', endDate: '2024-01-05', status: 'COMPLETED', nextDue: undefined },
  { id: '4', vehicle: 'د ه و ٤٥٦', type: 'صيانة دورية', description: 'فحص شامل قبل موسم الصيف', cost: 1800, startDate: '2024-01-18', status: 'SCHEDULED', nextDue: '2024-07-18' },
  { id: '5', vehicle: 'ي ك ل ٠١٢', type: 'صيانة دورية', description: 'تغيير زيت وفحص إطارات', cost: 1200, startDate: '2024-01-20', status: 'SCHEDULED', nextDue: '2024-04-20' },
];

const typeMap: Record<string, string> = { 'صيانة دورية': 'مجدولة', 'إصلاح': 'إصلاح', 'طارئة': 'طارئة' };

export default function MaintenancePage() {
  const [records, setRecords] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/maintenance');
      if (res.ok) {
        const data = await res.json();
        setRecords(data.maintenances ?? data);
      } else setRecords(mockMaintenance);
    } catch { setRecords(mockMaintenance); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = filterStatus ? records.filter((r) => r.status === filterStatus) : records;
  const totalCost = records.filter((r) => r.status === 'COMPLETED').reduce((s, r) => s + r.cost, 0);
  const inProgress = records.filter((r) => r.status === 'IN_PROGRESS').length;
  const completed = records.filter((r) => r.status === 'COMPLETED').length;
  const scheduled = records.filter((r) => r.status === 'SCHEDULED').length;

  // Upcoming reminders
  const upcoming = records.filter((r) => r.status === 'SCHEDULED').slice(0, 3);

  const columns: Column<Maintenance>[] = [
    { key: 'vehicle', header: 'السيارة', sortable: true },
    { key: 'type', header: 'نوع الصيانة' },
    { key: 'description', header: 'الوصف' },
    { key: 'cost', header: 'التكلفة', sortable: true, render: (row) => (
      <span className="font-bold text-amber-600 tabular-nums">{row.cost.toLocaleString('ar-SA')} ر.س</span>
    )},
    { key: 'startDate', header: 'تاريخ البداية', sortable: true },
    { key: 'endDate', header: 'تاريخ الانتهاء', render: (row) => <span>{row.endDate ?? '–'}</span> },
    { key: 'status', header: 'الحالة', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="الصيانة"
        subtitle="إدارة ومتابعة صيانة الأسطول"
        breadcrumbs={['المالية', 'الصيانة']}
        action={
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            <Plus size={16} /> إضافة صيانة
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="سيارات بالصيانة" value={inProgress} icon={Wrench} color="orange" />
        <StatsCard title="تكلفة الصيانة" value={`${(totalCost/1000).toFixed(0)}k ر.س`} icon={Wrench} color="red" />
        <StatsCard title="صيانات مكتملة" value={completed} icon={CheckCircle} color="green" />
        <StatsCard title="صيانات مجدولة" value={scheduled} icon={Clock} color="blue" />
      </div>

      {/* Reminder Banner */}
      {upcoming.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-amber-600" />
            <h3 className="font-bold text-amber-800 dark:text-amber-400">تنبيهات الصيانة القادمة</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {upcoming.map((item) => (
              <div key={item.id} className="bg-white dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 rounded-xl px-4 py-2.5 text-sm">
                <span className="font-bold">{item.vehicle}</span>
                <span className="text-muted-foreground mx-2">–</span>
                <span>{item.type}</span>
                <span className="text-amber-700 dark:text-amber-400 mr-2 font-semibold"> {item.startDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { v: '', l: 'الكل' }, { v: 'SCHEDULED', l: 'مجدولة' },
          { v: 'IN_PROGRESS', l: 'جارية' }, { v: 'COMPLETED', l: 'مكتملة' }
        ].map((s) => (
          <button key={s.v} onClick={() => setFilterStatus(s.v)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border
              ${filterStatus === s.v ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border hover:bg-secondary'}`}>
            {s.l}
          </button>
        ))}
      </div>

      <DataTable data={filtered} columns={columns} loading={loading} searchPlaceholder="البحث في سجلات الصيانة..." emptyTitle="لا توجد سجلات صيانة" />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="إضافة سجل صيانة" size="md"
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-border hover:bg-secondary text-sm font-medium transition-colors">إلغاء</button>
            <button onClick={() => setShowModal(false)} className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">حفظ</button>
          </>
        }>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'السيارة', ph: 'رقم اللوحة' }, { label: 'التكلفة (ر.س)', ph: '0.00' },
            { label: 'تاريخ البداية', ph: '', type: 'date' }, { label: 'تاريخ الانتهاء', ph: '', type: 'date' },
          ].map((f) => (
            <div key={f.label}><label className="block text-sm font-semibold mb-1.5">{f.label}</label>
              <input type={f.type ?? 'text'} placeholder={f.ph}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          ))}
          <div><label className="block text-sm font-semibold mb-1.5">نوع الصيانة</label>
            <select className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              {['صيانة دورية','إصلاح','طارئة'].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-semibold mb-1.5">الحالة</label>
            <select className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="SCHEDULED">مجدولة</option>
              <option value="IN_PROGRESS">جارية</option>
              <option value="COMPLETED">مكتملة</option>
            </select>
          </div>
          <div className="sm:col-span-2"><label className="block text-sm font-semibold mb-1.5">الوصف</label>
            <textarea rows={2} placeholder="تفاصيل أعمال الصيانة..."
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
