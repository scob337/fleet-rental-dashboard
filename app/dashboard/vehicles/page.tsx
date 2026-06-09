'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { Plus, Eye, Pencil, Trash2, MapPin, Phone, Truck } from 'lucide-react';
import DataTable, { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import PageHeader from '@/components/shared/PageHeader';
import Modal from '@/components/shared/Modal';
import StatsCard from '@/components/shared/StatsCard';

interface Vehicle {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  type: string;
  status: string;
  location?: string;
  driver?: { id: string; name: string } | null;
  dailyTrips?: number;
  monthlyRevenue?: number;
  lastMaintenance?: string;
  monthlyMaintenanceCost?: number;
  monthlyExpenses?: number;
}

const mockVehicles: Vehicle[] = [
  { id: '1', plateNumber: 'أ ب ج ١٢٣', brand: 'مرسيدس', model: 'أكتروس', year: 2022, type: 'CONTAINER_TRUCK', status: 'RENTED', location: 'ميناء جدة', driver: { id: '1', name: 'محمد أحمد' }, dailyTrips: 3, lastMaintenance: '2024-01-01', monthlyMaintenanceCost: 2500, monthlyExpenses: 15000, monthlyRevenue: 42000 },
  { id: '2', plateNumber: 'د ه و ٤٥٦', brand: 'فولفو', model: 'FH16', year: 2021, type: 'TRUCK', status: 'AVAILABLE', location: 'المستودع الرئيسي', driver: null, dailyTrips: 0, lastMaintenance: '2024-01-05', monthlyMaintenanceCost: 1800, monthlyExpenses: 0, monthlyRevenue: 0 },
  { id: '3', plateNumber: 'ز ح ط ٧٨٩', brand: 'مان', model: 'TGX', year: 2023, type: 'CONTAINER_TRUCK', status: 'MAINTENANCE', location: 'ورشة الصيانة', driver: { id: '3', name: 'علي حسن' }, dailyTrips: 0, lastMaintenance: '2024-01-10', monthlyMaintenanceCost: 5200, monthlyExpenses: 5200, monthlyRevenue: 0 },
  { id: '4', plateNumber: 'ي ك ل ٠١٢', brand: 'سكانيا', model: 'R500', year: 2022, type: 'TRUCK', status: 'RENTED', location: 'الرياض', driver: { id: '4', name: 'فهد العتيبي' }, dailyTrips: 4, lastMaintenance: '2023-12-20', monthlyMaintenanceCost: 1200, monthlyExpenses: 18000, monthlyRevenue: 55000 },
  { id: '5', plateNumber: 'م ن س ٣٤٥', brand: 'إيفيكو', model: 'ستراليس', year: 2020, type: 'VAN', status: 'DAMAGED', location: 'المستودع', driver: null, dailyTrips: 0, lastMaintenance: '2023-11-15', monthlyMaintenanceCost: 8500, monthlyExpenses: 8500, monthlyRevenue: 0 },
];

const typeLabels: Record<string, string> = {
  CAR: 'سيارة', VAN: 'فان', TRUCK: 'شاحنة', BUS: 'حافلة', CONTAINER_TRUCK: 'شاحنة حاويات',
};

interface DriverOption {
  id: string;
  name: string;
  status?: string;
}

interface VehiclePayload {
  plateNumber: string;
  brand: string;
  model: string;
  year?: number;
  type: string;
  status: string;
  location?: string;
  driverId?: string | null;
  dailyTrips?: number;
  monthlyRevenue?: number;
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [formKey, setFormKey] = useState(0);

  const fetchDrivers = useCallback(async () => {
    try {
      const res = await fetch('/api/drivers');
      if (res.ok) {
        const data = await res.json();
        setDrivers(data.drivers ?? data);
      }
    } catch (error) {
      console.error('Failed to fetch drivers', error);
    }
  }, []);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vehicles');
      if (res.ok) {
        const data = await res.json();
        setVehicles(data.vehicles ?? data);
      } else {
        setVehicles(mockVehicles);
      }
    } catch {
      setVehicles(mockVehicles);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
    fetchVehicles();
  }, [fetchDrivers, fetchVehicles]);

  const openVehicleModal = (vehicle: Vehicle | null) => {
    setSelectedVehicle(vehicle);
    setFormKey((prev) => prev + 1);
    setSaveError(null);
    setSaveLoading(false);
    setShowModal(true);
  };

  const handleSaveVehicle = async (data: VehiclePayload) => {
    setSaveLoading(true);
    setSaveError(null);

    try {
      const method = selectedVehicle ? 'PUT' : 'POST';
      const url = selectedVehicle ? `/api/vehicles/${selectedVehicle.id}` : '/api/vehicles';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Vehicle save error:', errorData);
        const message = typeof errorData.error === 'string'
          ? errorData.error
          : Array.isArray(errorData.error)
            ? errorData.error.map((err: any) => err.message).join(', ')
            : 'حدث خطأ أثناء حفظ السيارة';
        setSaveError(message);
        return;
      }

      setShowModal(false);
      setSaveError(null);
      await fetchVehicles();
    } catch (error) {
      console.error('Failed to save vehicle', error);
      setSaveError('تعذر حفظ السيارة. حاول مرة أخرى.');
    } finally {
      setSaveLoading(false);
    }
  };

  const filtered = filterStatus
    ? vehicles.filter((v) => v.status === filterStatus)
    : vehicles;

  const stats = {
    total: vehicles.length,
    active: vehicles.filter((v) => v.status === 'RENTED').length,
    maintenance: vehicles.filter((v) => v.status === 'MAINTENANCE').length,
    available: vehicles.filter((v) => v.status === 'AVAILABLE').length,
  };

  const columns: Column<Vehicle>[] = [
    {
      key: 'plateNumber',
      header: 'رقم السيارة',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Truck size={14} className="text-primary" />
          </div>
          <span className="font-bold text-sm">{row.plateNumber}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'نوع السيارة',
      render: (row) => <span className="text-sm">{typeLabels[row.type] ?? row.type} — {row.brand} {row.model}</span>,
    },
    {
      key: 'driver',
      header: 'السائق الحالي',
      render: (row) => row.driver
        ? <span className="text-sm font-medium">{row.driver.name}</span>
        : <span className="text-xs text-muted-foreground">غير مخصص</span>,
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'dailyTrips',
      header: 'رحلات اليوم',
      render: (row) => <span className="font-semibold text-primary">{row.dailyTrips ?? 0}</span>,
    },
    {
      key: 'monthlyRevenue',
      header: 'الإيراد الشهري',
      render: (row) => (
        <span className="font-semibold text-green-600">
          {(row.monthlyRevenue ?? 0).toLocaleString('ar-SA')} ر.س
        </span>
      ),
    },
    {
      key: 'location',
      header: 'الموقع الحالي',
      render: (row) => (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin size={12} /> {row.location ?? '-'}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="إدارة السيارات"
        subtitle="إدارة أسطول المركبات والشاحنات"
        breadcrumbs={['الأسطول', 'السيارات']}
        action={
          <button
            onClick={() => openVehicleModal(null)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            <Plus size={16} />
            إضافة سيارة
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="إجمالي السيارات" value={stats.total} icon={Truck} color="blue" />
        <StatsCard title="السيارات النشطة" value={stats.active} icon={Truck} color="green" />
        <StatsCard title="في الصيانة" value={stats.maintenance} icon={Truck} color="orange" />
        <StatsCard title="المتاحة" value={stats.available} icon={Truck} color="purple" />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        {['', 'RENTED', 'AVAILABLE', 'MAINTENANCE', 'DAMAGED'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border
              ${filterStatus === s
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-foreground border-border hover:bg-secondary'}`}
          >
            {s === '' ? 'الكل' : s === 'RENTED' ? 'نشطة' : s === 'AVAILABLE' ? 'متاحة' : s === 'MAINTENANCE' ? 'في الصيانة' : 'معطلة'}
          </button>
        ))}
      </div>

      {/* Table */}
      <DataTable
        data={filtered}
        columns={columns}
        loading={loading}
        searchPlaceholder="البحث برقم السيارة أو السائق..."
        emptyTitle="لا توجد سيارات"
        emptyDescription="لم يتم العثور على سيارات بهذا الفلتر"
        actions={(row) => (
          <div className="flex items-center justify-center gap-1">
            <a
              href={`/dashboard/vehicles/${row.id}`}
              className="p-1.5 rounded-lg hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 transition-colors"
              title="عرض"
            >
              <Eye size={15} />
            </a>
            <button
              onClick={() => openVehicleModal(row)}
              className="p-1.5 rounded-lg hover:bg-amber-100 hover:text-amber-600 dark:hover:bg-amber-900/30 transition-colors"
              title="تعديل"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => setDeleteId(row.id)}
              className="p-1.5 rounded-lg hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 transition-colors"
              title="حذف"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSaveError(null);
          setSaveLoading(false);
        }}
        title={selectedVehicle ? 'تعديل بيانات السيارة' : 'إضافة سيارة جديدة'}
        size="lg"
        footer={
          <>
            <button
              onClick={() => {
                setShowModal(false);
                setSaveError(null);
              }}
              className="px-4 py-2 rounded-xl border border-border hover:bg-secondary text-sm font-medium transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              form="vehicle-form"
              disabled={saveLoading}
              className={`px-5 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 transition-colors ${saveLoading ? 'bg-primary/50 text-primary-foreground cursor-not-allowed' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
            >
              {saveLoading ? 'جاري الحفظ...' : selectedVehicle ? 'حفظ التعديلات' : 'إضافة السيارة'}
            </button>
          </>
        }
      >
        {saveError ? (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {saveError}
          </div>
        ) : null}

        <VehicleForm
          key={formKey}
          vehicle={selectedVehicle}
          drivers={drivers}
          onSave={handleSaveVehicle}
        />
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="تأكيد الحذف"
        size="sm"
        footer={
          <>
            <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-xl border border-border hover:bg-secondary text-sm font-medium transition-colors">إلغاء</button>
            <button
              onClick={async () => {
                if (deleteId) {
                  await fetch(`/api/vehicles/${deleteId}`, { method: 'DELETE' });
                  setDeleteId(null);
                  fetchVehicles();
                }
              }}
              className="px-5 py-2 bg-destructive text-white rounded-xl text-sm font-semibold hover:bg-destructive/90 transition-colors"
            >
              حذف نهائياً
            </button>
          </>
        }
      >
        <p className="text-muted-foreground text-sm">هل أنت متأكد من حذف هذه السيارة؟ لا يمكن التراجع عن هذا الإجراء.</p>
      </Modal>
    </div>
  );
}

function VehicleForm({
  vehicle,
  drivers,
  onSave,
}: {
  vehicle: Vehicle | null;
  drivers: DriverOption[];
  onSave: (payload: VehiclePayload) => Promise<void>;
}) {
  const defaultDriverId = vehicle?.driver?.id ?? '';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const yearValue = String(formData.get('year') ?? '').trim();
    const dailyTripsValue = String(formData.get('dailyTrips') ?? '').trim();
    const monthlyRevenueValue = String(formData.get('monthlyRevenue') ?? '').trim();

    const payload: VehiclePayload = {
      plateNumber: String(formData.get('plateNumber') ?? '').trim(),
      brand: String(formData.get('brand') ?? '').trim(),
      model: String(formData.get('model') ?? '').trim(),
      type: String(formData.get('type') ?? 'TRUCK'),
      status: String(formData.get('status') ?? 'AVAILABLE'),
      location: String(formData.get('location') ?? '').trim() || undefined,
      driverId: String(formData.get('driverId') ?? '').trim() || null,
    };

    if (yearValue !== '') {
      payload.year = Number(yearValue);
    }
    if (dailyTripsValue !== '') {
      payload.dailyTrips = Number(dailyTripsValue);
    }
    if (monthlyRevenueValue !== '') {
      payload.monthlyRevenue = Number(monthlyRevenueValue);
    }

    await onSave(payload);
  };

  return (
    <form id="vehicle-form" onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[
        { label: 'رقم اللوحة', name: 'plateNumber', placeholder: 'أ ب ج ١٢٣', defaultValue: vehicle?.plateNumber ?? '' },
        { label: 'الماركة', name: 'brand', placeholder: 'مرسيدس', defaultValue: vehicle?.brand ?? '' },
        { label: 'الموديل', name: 'model', placeholder: 'أكتروس', defaultValue: vehicle?.model ?? '' },
        { label: 'سنة الصنع', name: 'year', placeholder: '2022', defaultValue: vehicle?.year ? String(vehicle.year) : '' },
      ].map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-semibold mb-1.5">{field.label}</label>
          <input
            name={field.name}
            type={field.name === 'year' ? 'number' : 'text'}
            defaultValue={field.defaultValue}
            placeholder={field.placeholder}
            className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            min={field.name === 'year' ? 1900 : undefined}
          />
        </div>
      ))}

      <div>
        <label className="block text-sm font-semibold mb-1.5">نوع المركبة</label>
        <select
          name="type"
          defaultValue={vehicle?.type ?? 'TRUCK'}
          className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
        >
          {Object.entries(typeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5">الحالة</label>
        <select
          name="status"
          defaultValue={vehicle?.status ?? 'AVAILABLE'}
          className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
        >
          <option value="AVAILABLE">متاحة</option>
          <option value="RENTED">نشطة</option>
          <option value="MAINTENANCE">في الصيانة</option>
          <option value="DAMAGED">معطلة</option>
          <option value="RETIRED">متقاعدة</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5">سائق السيارة</label>
        <select
          name="driverId"
          defaultValue={defaultDriverId}
          className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
        >
          <option value="">غير مخصص</option>
          {drivers.map((driver) => (
            <option key={driver.id} value={driver.id}>{driver.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5">عدد الرحلات اليوم</label>
        <input
          name="dailyTrips"
          type="number"
          step="1"
          min="0"
          defaultValue={vehicle?.dailyTrips ?? 0}
          className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5">الإيراد الشهري</label>
        <input
          name="monthlyRevenue"
          type="number"
          step="100"
          min="0"
          defaultValue={vehicle?.monthlyRevenue ?? 0}
          className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          placeholder="42000"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold mb-1.5">الموقع الحالي</label>
        <input
          name="location"
          type="text"
          defaultValue={vehicle?.location ?? ''}
          placeholder="ميناء جدة"
          className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
        />
      </div>
    </form>
  );
}
