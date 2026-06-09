'use client';

import { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import PageHeader from '@/components/shared/PageHeader';
import StatsCard from '@/components/shared/StatsCard';
import { Truck, Package2, Search, Filter } from 'lucide-react';

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse rounded-2xl flex items-center justify-center">جاري تحميل الخريطة...</div>,
});

interface VehicleSummary {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
  status: string;
  location?: string | null;
  driver?: { name: string } | null;
}

const statusOptions = [
  { value: 'RENTED', label: 'نشطة' },
  { value: 'AVAILABLE', label: 'متاحة' },
  { value: 'MAINTENANCE', label: 'في الصيانة' },
  { value: 'DAMAGED', label: 'معطلة' },
  { value: 'RETIRED', label: 'متقاعدة' },
];

export default function SiteMapPage() {
  const [vehicles, setVehicles] = useState<VehicleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeStatuses, setActiveStatuses] = useState<string[]>(['RENTED', 'AVAILABLE', 'MAINTENANCE', 'DAMAGED', 'RETIRED']);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const res = await fetch('/api/vehicles');
        if (res.ok) {
          const data = await res.json();
          setVehicles(data.vehicles ?? data);
        }
      } catch (error) {
        console.error('Failed to load vehicles for map', error);
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, []);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchesStatus = activeStatuses.includes(vehicle.status);
      const searchText = `${vehicle.plateNumber} ${vehicle.location ?? ''} ${vehicle.brand} ${vehicle.model}`.toLowerCase();
      const matchesQuery = query.trim() === '' || searchText.includes(query.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [vehicles, activeStatuses, query]);

  const summary = useMemo(
    () => ({
      total: filteredVehicles.length,
      active: filteredVehicles.filter((item) => item.status === 'RENTED').length,
      maintenance: filteredVehicles.filter((item) => item.status === 'MAINTENANCE').length,
      available: filteredVehicles.filter((item) => item.status === 'AVAILABLE').length,
    }),
    [filteredVehicles]
  );

  const toggleStatus = (status: string) => {
    setActiveStatuses((current) =>
      current.includes(status) ? current.filter((item) => item !== status) : [...current, status]
    );
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6 page-enter">
      <PageHeader
        title="خريطة الموقع"
        subtitle="عرض تفاعلي لمواقع الأسطول وحالة المركبات"
        breadcrumbs={['الأسطول', 'خريطة الموقع']}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="المركبات المعروضة" value={loading ? '...' : summary.total} icon={Truck} color="blue" />
        <StatsCard title="نشطة" value={loading ? '...' : summary.active} icon={Truck} color="green" />
        <StatsCard title="في الصيانة" value={loading ? '...' : summary.maintenance} icon={Truck} color="orange" />
        <StatsCard title="متاحة" value={loading ? '...' : summary.available} icon={Package2} color="purple" />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        <div className="w-full lg:w-80 space-y-4 overflow-y-auto pr-1">
          <div className="bg-card border border-border rounded-3xl p-5 shadow-xl shadow-slate-900/5 dark:shadow-slate-950/20">
            <div className="flex items-center gap-3 mb-4">
              <Search size={18} className="text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">بحث سريع</p>
                <p className="text-xs text-muted-foreground">ابحث برقم اللوحة أو الموقع أو الموديل</p>
              </div>
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="اكتب هنا..."
              className="w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>

          <div className="bg-card border border-border rounded-3xl p-5 shadow-xl shadow-slate-900/5 dark:shadow-slate-950/20">
            <div className="flex items-center gap-3 mb-4">
              <Filter size={18} className="text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">فلترة الحالة</p>
                <p className="text-xs text-muted-foreground">اختر الحالات التي تريد عرضها في اللوحة</p>
              </div>
            </div>
            <div className="space-y-3">
              {statusOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center justify-between gap-3 rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground transition hover:border-slate-300"
                >
                  <span>{option.label}</span>
                  <input
                    type="checkbox"
                    checked={activeStatuses.includes(option.value)}
                    onChange={() => toggleStatus(option.value)}
                    className="h-4 w-4 rounded border border-border text-primary focus:ring-primary"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl p-5 shadow-xl shadow-slate-900/5 dark:shadow-slate-950/20">
            <h3 className="text-sm font-semibold text-foreground mb-4">مفتاح الحالة</h3>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 text-sm text-foreground">
                <span className="w-3 h-3 rounded-full bg-primary" />
                نشطة
              </div>
              <div className="flex items-center gap-3 text-sm text-foreground">
                <span className="w-3 h-3 rounded-full bg-success" />
                متاحة
              </div>
              <div className="flex items-center gap-3 text-sm text-foreground">
                <span className="w-3 h-3 rounded-full bg-warning" />
                في الصيانة
              </div>
              <div className="flex items-center gap-3 text-sm text-foreground">
                <span className="w-3 h-3 rounded-full bg-destructive" />
                معطلة
              </div>
              <div className="flex items-center gap-3 text-sm text-foreground">
                <span className="w-3 h-3 rounded-full bg-muted" />
                غير محددة
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-130 relative">
          <MapView vehicles={filteredVehicles} loading={loading} />
        </div>
      </div>
    </div>
  );
}
