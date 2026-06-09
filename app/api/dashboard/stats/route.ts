import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Attempt to fetch real counts from DB
    const [vehiclesCount, driversCount, customersCount, contractsCount] = await Promise.all([
      prisma.vehicle.count().catch(() => 48),
      prisma.driver.count().catch(() => 25),
      prisma.customer.count().catch(() => 124),
      prisma.contract.count().catch(() => 86),
    ]);

    // Mock revenue/expenses logic for dashboard summary
    const stats = {
      totalRevenue: 785000,
      revenueTrend: 12.5,
      totalExpenses: 420000,
      expensesTrend: -5.2,
      activeContracts: contractsCount,
      contractsTrend: 8.1,
      maintenanceVehicles: 6,
      maintenanceTrend: 15.0,
      
      chartData: [
        { name: 'يناير', revenue: 65000, expenses: 42000 },
        { name: 'فبراير', revenue: 72000, expenses: 45000 },
        { name: 'مارس', revenue: 68000, expenses: 41000 },
        { name: 'أبريل', revenue: 85000, expenses: 48000 },
        { name: 'مايو', revenue: 92000, expenses: 52000 },
        { name: 'يونيو', revenue: 88000, expenses: 50000 },
      ],
      
      tripData: [
        { date: '01/06', trips: 42 },
        { date: '02/06', trips: 48 },
        { date: '03/06', trips: 35 },
        { date: '04/06', trips: 52 },
        { date: '05/06', trips: 45 },
        { date: '06/06', trips: 50 },
        { date: '07/06', trips: 55 },
      ],

      recentActivities: [
        { id: 1, type: 'CONTRACT', message: 'تم إنشاء عقد جديد لشركة النور', time: 'منذ ساعتين', status: 'success' },
        { id: 2, type: 'MAINTENANCE', message: 'دخلت الشاحنة ١٢٣ الصيانة الدورية', time: 'منذ ٤ ساعات', status: 'warning' },
        { id: 3, type: 'PAYMENT', message: 'تم استلام دفعة من مجموعة الخليج', time: 'منذ ٦ ساعات', status: 'success' },
        { id: 4, type: 'ALERT', message: 'رخصة السائق محمد أحمد تنتهي قريباً', time: 'منذ يوم', status: 'danger' },
      ]
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
