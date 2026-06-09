import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

function parseDate(value: string | null, fallback: Date) {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

function normalizeDateStart(date: Date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  normalized.setMinutes(0, 0, 0, 0);
  return normalized;
}

function normalizeDateEnd(date: Date) {
  const normalized = new Date(date);
  normalized.setHours(23, 59, 59, 999);
  return normalized;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get('type') === 'drivers' ? 'drivers' : 'vehicles';

    const today = new Date();
    const defaultFrom = new Date(today.getFullYear(), today.getMonth(), 1);
    const defaultTo = today;

    const from = parseDate(url.searchParams.get('from'), defaultFrom);
    const to = parseDate(url.searchParams.get('to'), defaultTo);
    const rangeStart = normalizeDateStart(from);
    const rangeEnd = normalizeDateEnd(to);

    const dayStart = normalizeDateStart(to);
    const dayEnd = normalizeDateEnd(to);
    const monthStart = new Date(to.getFullYear(), to.getMonth(), 1);
    const monthEnd = new Date(to.getFullYear(), to.getMonth() + 1, 1);

    const logs = await prisma.tripLog.findMany({
      where: {
        startDate: {
          gte: rangeStart,
          lte: rangeEnd,
        },
        status: 'COMPLETED',
      },
      include: {
        vehicle: true,
        driver: true,
      },
      orderBy: { startDate: 'desc' },
    });

    const grouping = new Map<string, any>();

    const totals = {
      entities: 0,
      periodTrips: 0,
      periodRevenue: 0,
      dayTrips: 0,
      dayRevenue: 0,
      monthTrips: 0,
      monthRevenue: 0,
    };

    for (const log of logs) {
      const groupKey = type === 'drivers'
        ? `${log.driverId}-${log.vehicleId}`
        : `${log.vehicleId}-${log.driverId}`;
      if (!log.driverId || !log.vehicleId) continue;

      const group = grouping.get(groupKey) ?? {
        id: groupKey,
        vehicleId: log.vehicleId,
        driverId: log.driverId,
        plateNumber: log.vehicle?.plateNumber ?? 'غير متوفر',
        vehicleCode: log.vehicle?.plateNumber ?? 'غير متوفر',
        brand: log.vehicle?.brand ?? '',
        model: log.vehicle?.model ?? '',
        driverName: log.driver?.name ?? 'غير متوفر',
        driverCode: log.driver?.licenseNumber ?? 'غير متوفر',
        licenseNumber: log.driver?.licenseNumber ?? '',
        vehiclePlate: log.vehicle?.plateNumber ?? 'غير متوفر',
        dailyTrips: 0,
        dailyRevenue: 0,
        monthlyTrips: 0,
        monthlyRevenue: 0,
        rangeTrips: 0,
        rangeRevenue: 0,
      };

      const amount = log.cost ?? 0;
      const startDate = log.startDate;
      const isToday = startDate >= dayStart && startDate <= dayEnd;
      const isMonth = startDate >= monthStart && startDate < monthEnd;

      group.rangeTrips += 1;
      group.rangeRevenue += amount;

      if (isToday) {
        group.dailyTrips += 1;
        group.dailyRevenue += amount;
        totals.dayTrips += 1;
        totals.dayRevenue += amount;
      }

      if (isMonth) {
        group.monthlyTrips += 1;
        group.monthlyRevenue += amount;
        totals.monthTrips += 1;
        totals.monthRevenue += amount;
      }

      totals.periodTrips += 1;
      totals.periodRevenue += amount;

      grouping.set(groupKey, group);
    }

    const data = Array.from(grouping.values()).map((row) => ({
      ...row,
      dailyRevenue: Number(row.dailyRevenue.toFixed(2)),
      monthlyRevenue: Number(row.monthlyRevenue.toFixed(2)),
      rangeRevenue: Number(row.rangeRevenue.toFixed(2)),
    }));

    totals.entities = data.length;

    return NextResponse.json({
      type,
      range: { from: rangeStart.toISOString(), to: rangeEnd.toISOString() },
      data,
      totals,
    });
  } catch (error) {
    console.error('Reports stats API error:', error);
    return NextResponse.json({ error: 'Failed to generate report data' }, { status: 500 });
  }
}
