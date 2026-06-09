'use client';

import { useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface Vehicle {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
  status: string;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  driver?: { name: string } | null;
}

interface MapViewProps {
  vehicles: Vehicle[];
  loading: boolean;
}

const statusMeta: Record<string, { label: string; color: string }> = {
  AVAILABLE: { label: 'متاحة', color: '#16a34a' },
  RENTED: { label: 'نشطة', color: '#2563eb' },
  MAINTENANCE: { label: 'في الصيانة', color: '#ea580c' },
  DAMAGED: { label: 'معطلة', color: '#dc2626' },
  RETIRED: { label: 'متقاعدة', color: '#475569' },
};

const BASE_CENTER: [number, number] = [24.7136, 46.6753];

const getMockCoordinates = (location: string): [number, number] => {
  const hash = location.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const latOffset = ((hash % 120) - 60) / 1000;
  const lngOffset = ((hash % 160) - 80) / 1000;
  return [BASE_CENTER[0] + latOffset, BASE_CENTER[1] + lngOffset];
};

export default function MapView({ vehicles, loading }: MapViewProps) {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const locationGroups = useMemo(() => {
    const groups: Record<string, { location: string; vehicles: Vehicle[] }> = {};
    vehicles.forEach((vehicle) => {
      const location = vehicle.location?.trim() || 'غير محدد';
      if (!groups[location]) groups[location] = { location, vehicles: [] };
      groups[location].vehicles.push(vehicle);
    });
    return Object.values(groups).sort((a, b) => b.vehicles.length - a.vehicles.length);
  }, [vehicles]);

  const selectedGroup = locationGroups.find((group) => group.location === selectedLocation) || locationGroups[0] || null;

  const markers = useMemo(
    () => vehicles.map((vehicle) => {
      const coords: [number, number] = vehicle.latitude && vehicle.longitude
        ? [vehicle.latitude, vehicle.longitude]
        : getMockCoordinates(vehicle.location ?? 'غير محدد');
      return { ...vehicle, coords };
    }),
    [vehicles]
  );

  const groupMarkers = selectedGroup
    ? markers.filter((vehicle) => (vehicle.location?.trim() || 'غير محدد') === selectedGroup.location)
    : [];

  const route = groupMarkers.length > 1 ? groupMarkers.map((vehicle) => vehicle.coords) : [];
  const mapCenter = groupMarkers.length ? groupMarkers[0].coords : BASE_CENTER;
  const totalLocations = locationGroups.length;

  return (
    <div className="h-full w-full rounded-3xl overflow-hidden border border-border bg-card shadow-xl">
      <div className="h-full grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-4 p-5">
        <div className="relative rounded-3xl overflow-hidden border border-border bg-background shadow-xl">
          <div className="absolute right-5 top-5 z-20 flex flex-col gap-3">
            {['L', 'R', 'S'].map((label) => (
              <button
                key={label}
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card text-sm font-semibold text-foreground shadow-sm transition hover:bg-primary/10"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="absolute left-5 top-5 z-20 rounded-3xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur-sm">
            <p className="text-xs text-muted-foreground">fleet.track</p>
            <h3 className="mt-2 text-lg font-semibold text-foreground">المسار الحي</h3>
            <p className="mt-1 text-sm text-muted-foreground">الموقع الحالي والتسليم القادم</p>
          </div>

          <MapContainer center={mapCenter} zoom={10} scrollWheelZoom className="h-140 w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {!loading && markers.map((vehicle) => (
              <CircleMarker
                key={vehicle.id}
                center={vehicle.coords}
                radius={9}
                pathOptions={{ color: statusMeta[vehicle.status]?.color ?? '#94a3b8', fillColor: statusMeta[vehicle.status]?.color ?? '#94a3b8', fillOpacity: 1, weight: 2 }}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold">{vehicle.brand} {vehicle.model}</p>
                    <p>لوحة: {vehicle.plateNumber}</p>
                    <p>حالة: {statusMeta[vehicle.status]?.label ?? vehicle.status}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
            {route.length > 1 && (
              <Polyline positions={route} pathOptions={{ color: '#2563eb', weight: 4, dashArray: '8 6' }} />
            )}
          </MapContainer>

          <div className="absolute bottom-5 left-5 z-20 flex max-w-[320px] flex-col gap-3 rounded-3xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">المسار الحالي</p>
                <h4 className="text-base font-semibold text-foreground">{selectedGroup ? selectedGroup.location : 'لا يوجد مسار محدد'}</h4>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{selectedGroup ? `${selectedGroup.vehicles.length} مركبة` : 'بدون'}</span>
            </div>
            <div className="grid gap-2">
              <div className="rounded-3xl bg-background p-3 text-sm text-foreground">أبرز المسارات والنقاط الرئيسية محدثة تلقائياً.</div>
              <div className="rounded-3xl border border-border bg-background p-3 text-sm text-foreground">اضغط على أي نقطة لرؤية تفاصيل المركبة.</div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-xl overflow-y-auto">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">تفاصيل مجموعة الموقع</p>
              <h3 className="text-lg font-semibold text-foreground">{selectedGroup ? selectedGroup.location : 'اختر موقعاً من الخريطة'}</h3>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
              {selectedGroup ? `${selectedGroup.vehicles.length} مركبة` : '...'}
            </span>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-border bg-background p-4 text-sm text-foreground">
              <p className="font-semibold">نظرة عامة على المسار</p>
              <p className="mt-2 text-sm text-muted-foreground">الأسطول معروضة حسب الموقع وحالة المركبة.</p>
            </div>
            {selectedGroup ? (
              selectedGroup.vehicles.map((vehicle) => (
                <div key={vehicle.id} className="space-y-3 rounded-3xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{vehicle.brand} {vehicle.model}</p>
                      <p className="text-sm text-muted-foreground">{vehicle.plateNumber}</p>
                    </div>
                    <span className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white" style={{ backgroundColor: statusMeta[vehicle.status]?.color ?? '#94a3b8' }}>
                      {statusMeta[vehicle.status]?.label ?? vehicle.status}
                    </span>
                  </div>
                  <div className="grid gap-2 rounded-3xl bg-background p-3">
                    <p className="text-sm text-muted-foreground">سائق: {vehicle.driver?.name ?? 'غير مخصص'}</p>
                    <p className="text-sm text-muted-foreground">الموقع: {vehicle.location ?? 'غير محدد'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                اضغط على نقطة أو اختر موقعاً لعرض التفاصيل هنا.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
