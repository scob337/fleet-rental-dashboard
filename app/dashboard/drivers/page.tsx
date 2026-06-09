'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { Plus, Phone, MessageCircle, User, Pencil, Trash2, Eye } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import PageHeader from '@/components/shared/PageHeader';
import Modal from '@/components/shared/Modal';
import StatsCard from '@/components/shared/StatsCard';
import EmptyState from '@/components/shared/EmptyState';

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  phone?: string;
  status: string;
  vehicle?: { plateNumber: string; brand: string; model: string } | null;
  dailyTrips?: number;
  monthlyRevenue?: number;
}

const mockDrivers: Driver[] = [
  { id: '1', name: 'محمد أحمد العمري', licenseNumber: 'SA-1234567', phone: '0501234567', status: 'ON_TRIP', vehicle: { plateNumber: 'أ ب ج ١٢٣', brand: 'مرسيدس', model: 'أكتروس' }, dailyTrips: 3, monthlyRevenue: 42000 },
  { id: '2', name: 'فهد عبدالله العتيبي', licenseNumber: 'SA-7654321', phone: '0557654321', status: 'ACTIVE', vehicle: { plateNumber: 'ي ك ل ٠١٢', brand: 'سكانيا', model: 'R500' }, dailyTrips: 0, monthlyRevenue: 55000 },
  { id: '3', name: 'علي حسن القحطاني', licenseNumber: 'SA-9988776', phone: '0539988776', status: 'ON_LEAVE', vehicle: null, dailyTrips: 0, monthlyRevenue: 0 },
  { id: '4', name: 'خالد محمد الدوسري', licenseNumber: 'SA-1122334', phone: '0561122334', status: 'ACTIVE', vehicle: null, dailyTrips: 0, monthlyRevenue: 0 },
  { id: '5', name: 'سالم يحيى الغامدي', licenseNumber: 'SA-5566778', phone: '0545566778', status: 'TERMINATED', vehicle: null, dailyTrips: 0, monthlyRevenue: 0 },
];

const statusColor: Record<string, string> = {
  ACTIVE: 'border-green-500/30 bg-green-500/5',
  ON_TRIP: 'border-blue-500/30 bg-blue-500/5',
  ON_LEAVE: 'border-amber-500/30 bg-amber-500/5',
  TERMINATED: 'border-red-500/30 bg-red-500/5',
};

function DriverCard({ driver, onEdit, onDelete }: { driver: Driver; onEdit: () => void; onDelete: () => void }) {
  const whatsappUrl = `https://wa.me/966${driver.phone?.replace(/^0/, '') ?? ''}`;
  return (
    <div className={`bg-card border-2 ${statusColor[driver.status] ?? 'border-border'} rounded-2xl p-5 card-shadow
      hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg">
            {driver.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-base leading-tight">{driver.name}</p>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{driver.licenseNumber}</p>
          </div>
        </div>
        <StatusBadge status={driver.status} />
      </div>

      {/* Vehicle */}
      <div className="bg-muted/50 rounded-xl p-3 mb-4">
        {driver.vehicle ? (
          <>
            <p className="text-xs text-muted-foreground mb-0.5">السيارة المرتبطة</p>
            <p className="text-sm font-bold">{driver.vehicle.brand} {driver.vehicle.model}</p>
            <p className="text-xs text-primary font-mono">{driver.vehicle.plateNumber}</p>
          </>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-1">لا توجد سيارة مخصصة</p>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm mb-4">
        <div className="text-center">
          <p className="text-lg font-black text-primary">{driver.dailyTrips ?? 0}</p>
          <p className="text-xs text-muted-foreground">رحلات اليوم</p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center">
          <p className="text-lg font-black text-green-600">{((driver.monthlyRevenue ?? 0) / 1000).toFixed(0)}k</p>
          <p className="text-xs text-muted-foreground">إيراد الشهر</p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="flex gap-1">
          <a href={`/dashboard/drivers/${driver.id}`} className="p-2 rounded-lg hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 transition-colors"><Eye size={14} /></a>
          <button onClick={onEdit} className="p-2 rounded-lg hover:bg-amber-100 hover:text-amber-600 dark:hover:bg-amber-900/30 transition-colors"><Pencil size={14} /></button>
          <button onClick={onDelete} className="p-2 rounded-lg hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 transition-colors"><Trash2 size={14} /></button>
        </div>
      </div>

      {/* WhatsApp button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-green-500/20"
      >
        <MessageCircle size={16} />
        تواصل عبر واتساب
      </a>
    </div>
  );
}

interface DriverPayload {
  name: string;
  licenseNumber: string;
  phone: string;
  status: string;
  dailyTrips?: number;
  monthlyRevenue?: number;
}

interface DriverFormProps {
  driver: Driver | null;
  onSave: (payload: DriverPayload) => void;
}

function DriverForm({ driver, onSave }: DriverFormProps) {
  const [name, setName] = useState(driver?.name ?? '');
  const [licenseNumber, setLicenseNumber] = useState(driver?.licenseNumber ?? '');
  const [phone, setPhone] = useState(driver?.phone ?? '');
  const [status, setStatus] = useState(driver?.status ?? 'ACTIVE');
  const [dailyTrips, setDailyTrips] = useState(driver?.dailyTrips ?? 0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(driver?.monthlyRevenue ?? 0);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave({ name, licenseNumber, phone, status, dailyTrips, monthlyRevenue });
  };

  return (
    <form id="driver-form" onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700">
          <span>اسم السائق</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            placeholder="اكتب اسم السائق"
            required
          />
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>رقم الرخصة</span>
          <input
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            placeholder="SA-1234567"
            required
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700">
          <span>رقم الجوال</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            placeholder="0501234567"
          />
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>حالة السائق</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
          >
            <option value="ACTIVE">متاح</option>
            <option value="ON_TRIP">في رحلة</option>
            <option value="ON_LEAVE">في إجازة</option>
            <option value="TERMINATED">موقوف</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700">
          <span>عدد الرحلات اليوم</span>
          <input
            type="number"
            min="0"
            value={dailyTrips}
            onChange={(e) => setDailyTrips(Number(e.target.value))}
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>الإيراد الشهري</span>
          <input
            type="number"
            min="0"
            step="100"
            value={monthlyRevenue}
            onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </label>
      </div>

      <div className="rounded-3xl border border-border bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-medium">{driver ? 'تعديل بيانات السائق الحالي' : 'أضف سائق جديد وسيكون جاهزًا للاستخدام'}</p>
      </div>
    </form>
  );
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [formKey, setFormKey] = useState(0);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/drivers');
      if (res.ok) {
        const data = await res.json();
        setDrivers(data.drivers ?? data);
      } else {
        setDrivers(mockDrivers);
      }
    } catch {
      setDrivers(mockDrivers);
    } finally {
      setLoading(false);
    }
  }, []);

  const openDriverModal = (driver: Driver | null) => {
    setSelectedDriver(driver);
    setFormKey((prev) => prev + 1);
    setShowModal(true);
  };

  const handleSaveDriver = async (payload: DriverPayload) => {
    try {
      const url = selectedDriver ? `/api/drivers/${selectedDriver.id}` : '/api/drivers';
      const method = selectedDriver ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Driver save failed', errorData);
        return;
      }

      setShowModal(false);
      fetchDrivers();
    } catch (error) {
      console.error('Failed to save driver', error);
    }
  };

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

  const filtered = filterStatus ? drivers.filter((d) => d.status === filterStatus) : drivers;

  const stats = {
    total: drivers.length,
    active: drivers.filter((d) => d.status === 'ACTIVE').length,
    onTrip: drivers.filter((d) => d.status === 'ON_TRIP').length,
    onLeave: drivers.filter((d) => d.status === 'ON_LEAVE').length,
  };

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="إدارة السائقين"
        subtitle="إدارة بيانات السائقين ومتابعة أدائهم"
        breadcrumbs={['الأسطول', 'السائقون']}
        action={
          <button
            onClick={() => openDriverModal(null)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            <Plus size={16} />
            إضافة سائق
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="إجمالي السائقين" value={stats.total} icon={User} color="blue" />
        <StatsCard title="متاحون" value={stats.active} icon={User} color="green" />
        <StatsCard title="في رحلة" value={stats.onTrip} icon={User} color="purple" />
        <StatsCard title="في إجازة" value={stats.onLeave} icon={User} color="orange" />
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {[
          { v: '', l: 'الكل' }, { v: 'ACTIVE', l: 'متاح' }, { v: 'ON_TRIP', l: 'في رحلة' },
          { v: 'ON_LEAVE', l: 'إجازة' }, { v: 'TERMINATED', l: 'موقوف' }
        ].map((s) => (
          <button
            key={s.v}
            onClick={() => setFilterStatus(s.v)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border
              ${filterStatus === s.v ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border hover:bg-secondary'}`}
          >
            {s.l}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="h-64 skeleton rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="لا يوجد سائقون" description="لا يوجد سائقون بهذا الفلتر" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((driver) => (
            <DriverCard
              key={driver.id}
              driver={driver}
              onEdit={() => openDriverModal(driver)}
              onDelete={() => setDeleteId(driver.id)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedDriver ? 'تعديل بيانات السائق' : 'إضافة سائق جديد'}
        size="md"
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-border hover:bg-secondary text-sm font-medium transition-colors">إلغاء</button>
            <button type="submit" form="driver-form" className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
              {selectedDriver ? 'حفظ التعديلات' : 'إضافة السائق'}
            </button>
          </>
        }
      >
        <DriverForm
          key={formKey}
          driver={selectedDriver}
          onSave={handleSaveDriver}
        />
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="تأكيد الحذف" size="sm"
        footer={
          <>
            <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-xl border border-border hover:bg-secondary text-sm font-medium transition-colors">إلغاء</button>
            <button onClick={async () => { if (deleteId) { await fetch(`/api/drivers/${deleteId}`, { method: 'DELETE' }); setDeleteId(null); fetchDrivers(); } }}
              className="px-5 py-2 bg-destructive text-white rounded-xl text-sm font-semibold hover:bg-destructive/90 transition-colors">حذف نهائياً</button>
          </>
        }>
        <p className="text-muted-foreground text-sm">هل أنت متأكد من حذف هذا السائق؟ لا يمكن التراجع عن هذا الإجراء.</p>
      </Modal>
    </div>
  );
}
