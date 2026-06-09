'use client';

import { useEffect, useState } from 'react';
import {
  Truck, Users, DollarSign, TrendingDown,
  FileText, Package2, Wrench, CheckCircle2, Clock, AlertTriangle
} from 'lucide-react';
import StatsCard from '@/components/shared/StatsCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { RevenueVsExpensesChart, DailyTripsChart, ExpensesPieChart, MonthlyRevenueChart } from './Charts';

interface DashboardStats {
  totalVehicles: number;
  activeVehicles: number;
  maintenanceVehicles: number;
  totalDrivers: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  activeContracts: number;
  activeContainers: number;
}

const recentActivities = [
  { id: 1, type: 'contract', text: 'تم إنشاء عقد جديد مع شركة النور للتجارة', time: 'منذ 15 دقيقة', icon: FileText, color: 'text-blue-500' },
  { id: 2, type: 'trip', text: 'انتهت رحلة الشاحنة رقم ٢٤١ - ميناء الملك عبدالله', time: 'منذ 32 دقيقة', icon: Truck, color: 'text-green-500' },
  { id: 3, type: 'maintenance', text: 'بدأت صيانة السيارة رقم ١١٧ في الورشة', time: 'منذ 1 ساعة', icon: Wrench, color: 'text-amber-500' },
  { id: 4, type: 'revenue', text: 'تم استلام دفعة ٢٥,٠٠٠ ريال من مجموعة الخليج', time: 'منذ 2 ساعة', icon: DollarSign, color: 'text-emerald-500' },
  { id: 5, type: 'driver', text: 'السائق أحمد محمد بدأ رحلة جديدة', time: 'منذ 3 ساعات', icon: Users, color: 'text-purple-500' },
];

const upcomingMaintenance = [
  { id: 1, vehicle: 'شاحنة رقم ١٢٣', type: 'صيانة دورية', date: '2024-01-15', cost: '2,500', status: 'SCHEDULED' },
  { id: 2, vehicle: 'سيارة رقم ٢٤١', type: 'تغيير زيت', date: '2024-01-18', cost: '450', status: 'SCHEDULED' },
  { id: 3, vehicle: 'شاحنة رقم ٠٩٨', type: 'إصلاح مكابح', date: '2024-01-20', cost: '1,800', status: 'SCHEDULED' },
];

const latestContracts = [
  { id: 1, contractNo: 'CNT-2024-001', client: 'شركة النور للتجارة', vehicle: 'شاحنة ١٢٣', value: '45,000', status: 'ACTIVE', endDate: '2024-03-15' },
  { id: 2, contractNo: 'CNT-2024-002', client: 'مجموعة الخليج', vehicle: 'شاحنة ٢٤١', value: '62,000', status: 'ACTIVE', endDate: '2024-04-01' },
  { id: 3, contractNo: 'CNT-2024-003', client: 'مؤسسة الأمانة', vehicle: 'شاحنة ٠٩٨', value: '28,500', status: 'PENDING', endDate: '2024-02-28' },
];

export default function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {
        // Use mock data if API not ready
      } finally {
        // Mock data fallback
        setStats({
          totalVehicles: 48,
          activeVehicles: 35,
          maintenanceVehicles: 6,
          totalDrivers: 42,
          monthlyRevenue: 285000,
          monthlyExpenses: 142000,
          activeContracts: 23,
          activeContainers: 87,
        });
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statsCards = [
    { title: 'إجمالي السيارات', value: stats?.totalVehicles ?? 0, icon: Truck, color: 'blue' as const, subtitle: 'الأسطول الكامل', trend: 4 },
    { title: 'السيارات النشطة', value: stats?.activeVehicles ?? 0, icon: CheckCircle2, color: 'green' as const, subtitle: 'تعمل الآن', trend: 8 },
    { title: 'السيارات في الصيانة', value: stats?.maintenanceVehicles ?? 0, icon: Wrench, color: 'orange' as const, subtitle: 'بالورشة', trend: -2 },
    { title: 'إجمالي السائقين', value: stats?.totalDrivers ?? 0, icon: Users, color: 'purple' as const, subtitle: 'المسجلون', trend: 5 },
    { title: 'إيرادات الشهر', value: `${((stats?.monthlyRevenue ?? 0) / 1000).toFixed(0)}k ر.س`, icon: DollarSign, color: 'green' as const, subtitle: 'يونيو 2024', trend: 12 },
    { title: 'المصروفات الشهرية', value: `${((stats?.monthlyExpenses ?? 0) / 1000).toFixed(0)}k ر.س`, icon: TrendingDown, color: 'red' as const, subtitle: 'يونيو 2024', trend: -3 },
    { title: 'العقود النشطة', value: stats?.activeContracts ?? 0, icon: FileText, color: 'blue' as const, subtitle: 'جارية حالياً', trend: 7 },
    { title: 'الحاويات العاملة', value: stats?.activeContainers ?? 0, icon: Package2, color: 'teal' as const, subtitle: 'في التشغيل', trend: 15 },
  ];

  return (
    <div className="space-y-6 page-enter">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <StatsCard
            key={card.title}
            loading={loading}
            {...card}
          />
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <RevenueVsExpensesChart />
        <DailyTripsChart />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <MonthlyRevenueChart />
        </div>
        <ExpensesPieChart />
      </div>

      {/* Bottom section: Activities + Maintenance + Contracts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activities */}
        <div className="bg-card border border-border rounded-2xl p-5 card-shadow">
          <h3 className="font-bold text-base mb-4 flex items-center gap-2">
            <Clock size={18} className="text-primary" />
            آخر الأنشطة
          </h3>
          <div className="space-y-3">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={15} className={activity.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug">{activity.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Maintenance */}
        <div className="bg-card border border-border rounded-2xl p-5 card-shadow">
          <h3 className="font-bold text-base mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            صيانات قادمة
          </h3>
          <div className="space-y-3">
            {upcomingMaintenance.map((item) => (
              <div key={item.id} className="p-3 bg-muted/40 rounded-xl border border-border/50">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold">{item.vehicle}</p>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-xs text-muted-foreground">{item.type}</p>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-muted-foreground">{item.date}</span>
                  <span className="font-semibold text-amber-600">{item.cost} ر.س</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Contracts */}
        <div className="bg-card border border-border rounded-2xl p-5 card-shadow">
          <h3 className="font-bold text-base mb-4 flex items-center gap-2">
            <FileText size={18} className="text-blue-500" />
            أحدث العقود
          </h3>
          <div className="space-y-3">
            {latestContracts.map((contract) => (
              <div key={contract.id} className="p-3 bg-muted/40 rounded-xl border border-border/50">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground font-mono">{contract.contractNo}</p>
                  <StatusBadge status={contract.status} />
                </div>
                <p className="text-sm font-bold">{contract.client}</p>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-muted-foreground">{contract.vehicle}</span>
                  <span className="font-bold text-green-600">{contract.value} ر.س</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
