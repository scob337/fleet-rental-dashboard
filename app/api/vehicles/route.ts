import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const vehicleSchema = z.object({
  plateNumber: z.string().min(1),
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  type: z.enum(['CAR', 'VAN', 'TRUCK', 'BUS', 'CONTAINER_TRUCK']),
  status: z.enum(['AVAILABLE', 'RENTED', 'MAINTENANCE', 'DAMAGED', 'RETIRED']).default('AVAILABLE'),
  location: z.string().optional(),
  driverId: z.string().optional().nullable(),
  dailyTrips: z.number().int().min(0).optional(),
  monthlyRevenue: z.number().min(0).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vehicles = await prisma.vehicle.findMany({
      include: {
        driver: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(vehicles);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = vehicleSchema.parse(body);
    const userId = (session.user as any)?.id || (await prisma.user.findFirst())?.id;

    if (!userId) {
      return NextResponse.json({ error: 'No user available to associate vehicle' }, { status: 500 });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        plateNumber: validated.plateNumber,
        brand: validated.brand,
        model: validated.model,
        year: validated.year,
        type: validated.type,
        status: validated.status,
        location: validated.location,
        dailyTrips: validated.dailyTrips,
        monthlyRevenue: validated.monthlyRevenue,
        userId,
      },
    });

    if (validated.driverId) {
      await prisma.driver.update({
        where: { id: validated.driverId },
        data: { vehicleId: vehicle.id },
      });
    }

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
