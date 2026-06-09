'use client';

import { BarChart3, Truck, Users, DollarSign, Calendar, Download } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { useCallback, useEffect, useMemo, useState } from 'react';

type ReportType = 'vehicles' | 'drivers';

type VehicleReportRow = {
  id: string;
  plateNumber: string;
  vehicleCode?: string;
  brand: string;
  model: string;
  driverName: string;
  driverCode?: string;
  dailyTrips: number;
  dailyRevenue: number;
  monthlyTrips: number;
  monthlyRevenue: number;
  rangeTrips: number;
  rangeRevenue: number;
};

type DriverReportRow = {
  id: string;
  name: string;
  licenseNumber: string;
  driverCode?: string;
  vehiclePlate: string;
  vehicleCode?: string;
  dailyTrips: number;
  dailyRevenue: number;
  monthlyTrips: number;
  monthlyRevenue: number;
  rangeTrips: number;
  rangeRevenue: number;
};

type ReportTotals = {
  entities: number;
  periodTrips: number;
  periodRevenue: number;
  dayTrips: number;
  dayRevenue: number;
  monthTrips: number;
  monthRevenue: number;
};

const quickRanges = [
  { key: 'today', label: 'اليوم' },
  { key: 'month', label: 'هذا الشهر' },
  { key: 'last30', label: 'آخر 30 يوم' },
];

function formatCurrency(value: number) {
  return `${value.toLocaleString('ar-SA')} ر.س`;
}

function buildDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('vehicles');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reportData, setReportData] = useState<VehicleReportRow[] | DriverReportRow[]>([]);
  const [totals, setTotals] = useState<ReportTotals | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestionList, setShowSuggestionList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyQuickRange = (key: string) => {
    const today = new Date();
    if (key === 'today') {
      setDateFrom(buildDateInputValue(today));
      setDateTo(buildDateInputValue(today));
    }
    if (key === 'month') {
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      setDateFrom(buildDateInputValue(first));
      setDateTo(buildDateInputValue(today));
    }
    if (key === 'last30') {
      const past = new Date(today);
      past.setDate(past.getDate() - 29);
      setDateFrom(buildDateInputValue(past));
      setDateTo(buildDateInputValue(today));
    }
  };

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const from = dateFrom || buildDateInputValue(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
      const to = dateTo || buildDateInputValue(new Date());
      const res = await fetch(`/api/reports/stats?type=${reportType}&from=${from}&to=${to}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل في تحميل بيانات التقرير');
      }
      setReportData(data.data || []);
      setTotals(data.totals || null);
    } catch (err) {
      console.error('Report load error:', err);
      setError(err instanceof Error ? err.message : 'فشل في تحميل التقرير');
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, reportType]);

  useEffect(() => {
    if (!dateFrom || !dateTo) {
      applyQuickRange('month');
      return;
    }
    fetchReport();
  }, [dateFrom, dateTo, reportType, fetchReport]);

  useEffect(() => {
    setSearchQuery('');
  }, [reportType, dateFrom, dateTo]);

  const activeHeading = reportType === 'vehicles' ? 'تقرير السيارات' : 'تقرير السائقين';
  const activeSubtitle = reportType === 'vehicles'
    ? 'اختر نطاقًا أو يومًا محددًا لعرض أداء السيارة والسائق المسؤولة عنها'
    : 'اختر نطاقًا أو يومًا محددًا لعرض أداء السائق ومركبته خلال اليوم';

  const searchSuggestions = useMemo(() => {
    const options = new Set<string>();
    reportData.forEach((row) => {
      if (reportType === 'vehicles') {
        const vehicleRow = row as VehicleReportRow;
        options.add(vehicleRow.plateNumber);
        options.add(`${vehicleRow.brand} ${vehicleRow.model}`);
        options.add(vehicleRow.driverName);
        if (vehicleRow.vehicleCode) options.add(vehicleRow.vehicleCode);
        if (vehicleRow.driverCode) options.add(vehicleRow.driverCode);
      } else {
        const driverRow = row as DriverReportRow;
        options.add(driverRow.name);
        options.add(driverRow.licenseNumber);
        options.add(driverRow.vehiclePlate);
        if (driverRow.driverCode) options.add(driverRow.driverCode);
        if (driverRow.vehicleCode) options.add(driverRow.vehicleCode);
      }
    });
    return Array.from(options).filter(Boolean).slice(0, 30);
  }, [reportData, reportType]);

  const filteredSuggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return searchSuggestions;
    return searchSuggestions.filter((suggestion) => suggestion.toLowerCase().includes(query));
  }, [searchSuggestions, searchQuery]);

  const filteredReportData = useMemo(() => {
    if (!searchQuery.trim()) return reportData;
    const query = searchQuery.trim().toLowerCase();
    return reportData.filter((row) => {
      return Object.values(row).some((value) =>
        String(value).toLowerCase().includes(query)
      );
    });
  }, [reportData, searchQuery]);

  const showSuggestionPanel = showSuggestionList && (searchQuery.trim() !== '' || searchSuggestions.length > 0);

  const reportTable = useMemo(() => {
    if (reportType === 'vehicles') {
      return (
        <table className="min-w-full text-right text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-3 text-xs text-muted-foreground">كود السيارة</th>
              <th className="p-3 text-xs text-muted-foreground">المركبة</th>
              <th className="p-3 text-xs text-muted-foreground">كود السائق</th>
              <th className="p-3 text-xs text-muted-foreground">السائق</th>
              <th className="p-3 text-xs text-muted-foreground">رحلات اليوم</th>
              <th className="p-3 text-xs text-muted-foreground">إيراد اليوم</th>
              <th className="p-3 text-xs text-muted-foreground">رحلات الشهر</th>
              <th className="p-3 text-xs text-muted-foreground">إيراد الشهر</th>
            </tr>
          </thead>
          <tbody>
            {(filteredReportData as VehicleReportRow[]).map((row) => (
              <tr key={row.id} className="border-b border-border/70 hover:bg-secondary/50 transition-colors">
                <td className="p-3 font-semibold">{row.vehicleCode ?? row.plateNumber}</td>
                <td className="p-3">{row.brand} {row.model}</td>
                <td className="p-3">{row.driverCode ?? '-'}</td>
                <td className="p-3">{row.driverName}</td>
                <td className="p-3">{row.dailyTrips}</td>
                <td className="p-3 text-green-600">{formatCurrency(row.dailyRevenue)}</td>
                <td className="p-3">{row.monthlyTrips}</td>
                <td className="p-3 text-green-600">{formatCurrency(row.monthlyRevenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return (
      <table className="min-w-full text-right text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="p-3 text-xs text-muted-foreground">كود السائق</th>
            <th className="p-3 text-xs text-muted-foreground">اسم السائق</th>
            <th className="p-3 text-xs text-muted-foreground">كود السيارة</th>
            <th className="p-3 text-xs text-muted-foreground">السيارة</th>
            <th className="p-3 text-xs text-muted-foreground">رحلات اليوم</th>
            <th className="p-3 text-xs text-muted-foreground">إيراد اليوم</th>
            <th className="p-3 text-xs text-muted-foreground">رحلات الشهر</th>
            <th className="p-3 text-xs text-muted-foreground">إيراد الشهر</th>
          </tr>
        </thead>
        <tbody>
          {(filteredReportData as DriverReportRow[]).map((row) => (
            <tr key={row.id} className="border-b border-border/70 hover:bg-secondary/50 transition-colors">
              <td className="p-3 font-semibold">{row.driverCode ?? row.licenseNumber}</td>
              <td className="p-3">{row.name}</td>
              <td className="p-3">{row.vehicleCode ?? row.vehiclePlate}</td>
              <td className="p-3">{row.vehiclePlate}</td>
              <td className="p-3">{row.dailyTrips}</td>
              <td className="p-3 text-green-600">{formatCurrency(row.dailyRevenue)}</td>
              <td className="p-3">{row.monthlyTrips}</td>
              <td className="p-3 text-green-600">{formatCurrency(row.monthlyRevenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }, [filteredReportData, reportType]);

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="مركز التقارير"
        subtitle="توليد تقارير تفصيلية للسيارات والسائقين"
        breadcrumbs={['الأسطول', 'التقارير']}
      />

      <div className="bg-card border border-border rounded-2xl p-5 card-shadow">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="font-bold text-lg">{activeHeading}</h3>
            <p className="text-sm text-muted-foreground mt-1">{activeSubtitle}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">من تاريخ</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-background border border-border rounded-xl px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">إلى تاريخ</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-background border border-border rounded-xl px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">نوع التقرير</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
                className="bg-background border border-border rounded-xl px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="vehicles">تقرير السيارات</option>
                <option value="drivers">تقرير السائقين</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-muted-foreground mb-1">بحث سريع</label>
            <div className="relative">
              <input
                type="search"
                placeholder="بحث بالكود أو اسم السيارة أو الموديل أو اسم السائق"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestionList(true)}
                onBlur={() => setTimeout(() => setShowSuggestionList(false), 150)}
                className="bg-background border border-border rounded-xl px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {showSuggestionPanel ? (
                <div className="absolute left-0 right-0 z-10 mt-1 max-h-56 overflow-auto rounded-2xl border border-border bg-card p-2 shadow-lg">
                  <div className="mb-2 text-xs font-semibold text-muted-foreground">اقتراحات البحث</div>
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.slice(0, 8).map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onMouseDown={() => setSearchQuery(suggestion)}
                        className="w-full text-start rounded-2xl px-3 py-2 text-sm text-foreground hover:bg-secondary"
                      >
                        {suggestion}
                      </button>
                    ))
                  ) : (
                    <div className="rounded-2xl bg-slate-50 p-3 text-sm text-muted-foreground">لا توجد اقتراحات لبحثك</div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {quickRanges.map((range) => (
            <button
              key={range.key}
              type="button"
              onClick={() => applyQuickRange(range.key)}
              className="rounded-full border border-border px-4 py-2 text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm text-muted-foreground">عدد العناصر</p>
          <p className="mt-3 text-2xl font-black">{totals?.entities ?? 0}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm text-muted-foreground">عدد الرحلات في المدة</p>
          <p className="mt-3 text-2xl font-black">{totals?.periodTrips ?? 0}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm text-muted-foreground">إيراد المدة</p>
          <p className="mt-3 text-2xl font-black text-green-600">{formatCurrency(totals?.periodRevenue ?? 0)}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm text-muted-foreground">رحلات اليوم</p>
          <p className="mt-3 text-2xl font-black">{totals?.dayTrips ?? 0}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 card-shadow">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="font-bold">نتائج التقرير</h3>
            <p className="text-sm text-muted-foreground">عرض التفاصيل اليومية والشهرية لكل عنصر.</p>
          </div>
          <button
            onClick={() => setError(null)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary transition-colors"
          >
            <Download size={16} /> تصدير
          </button>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-24 text-muted-foreground">جاري تحميل التقرير...</div>
          ) : reportData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
              <p>لا توجد بيانات رحلات في الفترة المحددة.</p>
              <p className="mt-2 text-sm text-muted-foreground/80">تأكد من وجود سجلات TripLog في قاعدة البيانات أو اختر نطاقًا آخر.</p>
            </div>
          ) : filteredReportData.length === 0 ? (
            <div className="flex items-center justify-center py-24 text-muted-foreground">لا توجد نتائج مطابقة لبحثك.</div>
          ) : (
            reportTable
          )}
        </div>
      </div>
    </div>
  );
}
