'use server';

import { notFound } from 'next/navigation';
import { ArrowLeft, Truck, Users, CalendarDays, DollarSign, List, MapPin } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';

function formatCurrency(value: number) {
  return `${value.toLocaleString('ar-SA')} ر.س`;
}

function formatDate(value: Date | null | undefined) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' }).format(value);
}

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      driver: true,
      tripLogs: {
        orderBy: { startDate: 'desc' },
        take: 5,
        include: { driver: true },
      },
    },
  });

  if (!vehicle) {
    notFound();
  }

  const today = new Date();
  const dayStart = new Date(today);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(today);
  dayEnd.setHours(23, 59, 59, 999);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  const [dailySummary, monthlySummary, totalSummary] = await Promise.all([
    prisma.tripLog.aggregate({
      where: {
        vehicleId: id,
        status: 'COMPLETED',
        startDate: { gte: dayStart, lte: dayEnd },
      },
      _count: { _all: true },
      _sum: { cost: true },
    }),
    prisma.tripLog.aggregate({
      where: {
        vehicleId: id,
        status: 'COMPLETED',
        startDate: { gte: monthStart, lt: monthEnd },
      },
      _count: { _all: true },
      _sum: { cost: true },
    }),
    prisma.tripLog.aggregate({
      where: {
        vehicleId: id,
        status: 'COMPLETED',
      },
      _count: { _all: true },
      _sum: { cost: true },
    }),
  ]);

  const dailyTrips = dailySummary._count._all;
  const dailyRevenue = dailySummary._sum.cost ?? 0;
  const monthlyTrips = monthlySummary._count._all;
  const monthlyRevenue = monthlySummary._sum.cost ?? 0;
  const totalTrips = totalSummary._count._all;
  const totalRevenue = totalSummary._sum.cost ?? 0;

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link href="/dashboard/vehicles" className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-foreground transition-colors">
            <ArrowLeft size={16} /> العودة إلى السيارات
          </Link>
          <h1 className="mt-4 text-3xl font-bold flex items-center gap-3">
            <Truck size={28} /> {vehicle.plateNumber}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{vehicle.brand} {vehicle.model} — {vehicle.type}</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-5 text-right">
          <p className="text-xs text-muted-foreground">الحالة الحالية</p>
          <p className="mt-2 text-lg font-semibold">{vehicle.status}</p>
          <p className="text-sm text-muted-foreground mt-2">الموقع: {vehicle.location ?? 'غير محدد'}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'رحلات اليوم', value: dailyTrips, icon: List, color: 'text-primary' },
          { label: 'إيراد اليوم', value: formatCurrency(dailyRevenue), icon: DollarSign, color: 'text-green-600' },
          { label: 'رحلات الشهر', value: monthlyTrips, icon: CalendarDays, color: 'text-blue-600' },
          { label: 'إيراد الشهر', value: formatCurrency(monthlyRevenue), icon: DollarSign, color: 'text-emerald-600' },
        ].map((item) => (
          <div key={item.label} className="rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.label}</p>
                <p className="mt-3 text-3xl font-black">{item.value}</p>
              </div>
              <div className={`rounded-2xl p-3 bg-slate-100 ${item.color} bg-opacity-10`}>
                <item.icon size={20} className={item.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl border border-border bg-card p-5">
          <h2 className="font-semibold text-lg mb-4">آخر الرحلات</h2>
          {vehicle.tripLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد رحلات مسجلة لهذه السيارة بعد.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-3 text-xs text-muted-foreground">السائق</th>
                    <th className="p-3 text-xs text-muted-foreground">من</th>
                    <th className="p-3 text-xs text-muted-foreground">إلى</th>
                    <th className="p-3 text-xs text-muted-foreground">التاريخ</th>
                    <th className="p-3 text-xs text-muted-foreground">التكلفة</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicle.tripLogs.map((trip) => (
                    <tr key={trip.id} className="border-b border-border/70 hover:bg-secondary/50 transition-colors">
                      <td className="p-3">{trip.driver?.name ?? 'غير محدد'}</td>
                      <td className="p-3">{trip.startLocation}</td>
                      <td className="p-3">{trip.endLocation}</td>
                      <td className="p-3">{formatDate(trip.startDate)}</td>
                      <td className="p-3 text-green-600">{formatCurrency(trip.cost ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-card p-5">
          <h2 className="font-semibold text-lg mb-4">تفاصيل السيارة</h2>
          <div className="space-y-3 text-sm text-slate-700">
            <div><span className="font-semibold">الموديل:</span> {vehicle.brand} {vehicle.model}</div>
            <div><span className="font-semibold">سنة الصنع:</span> {vehicle.year}</div>
            <div><span className="font-semibold">اللون:</span> {vehicle.color ?? 'غير محدد'}</div>
            <div><span className="font-semibold">الصيانة الأخيرة:</span> {formatDate(vehicle.purchaseDate)}</div>
            <div><span className="font-semibold">قيمة الشراء:</span> {vehicle.purchasePrice ? formatCurrency(vehicle.purchasePrice) : 'غير متوفر'}</div>
            <div><span className="font-semibold">اسم السائق المرتبط:</span> {vehicle.driver?.name ?? 'غير مرتبط'}</div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-5">
        <h2 className="font-semibold text-lg mb-4">ملخص الإيرادات الكلية</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-3xl border border-border p-4 bg-slate-50">
            <p className="text-xs text-muted-foreground">إجمالي الرحلات</p>
            <p className="mt-3 text-2xl font-black">{totalTrips}</p>
          </div>
          <div className="rounded-3xl border border-border p-4 bg-slate-50">
            <p className="text-xs text-muted-foreground">إجمالي الإيراد</p>
            <p className="mt-3 text-2xl font-black text-green-600">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="rounded-3xl border border-border p-4 bg-slate-50">
            <p className="text-xs text-muted-foreground">الموقع الحالي</p>
            <p className="mt-3 text-2xl font-black">{vehicle.location ?? '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
