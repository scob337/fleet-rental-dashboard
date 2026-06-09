import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const driverSchema = z.object({
  name: z.string().min(1),
  licenseNumber: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional(),
  licenseClass: z.string().optional(),
  licenseExpiry: z.string().optional(),
  experience: z.number().int().min(0).optional(),
  status: z.enum(['ACTIVE', 'ON_TRIP', 'ON_LEAVE', 'TERMINATED']).default('ACTIVE'),
  vehicleId: z.string().optional(),
  dailyTrips: z.number().int().min(0).optional(),
  monthlyRevenue: z.number().min(0).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const drivers = await prisma.driver.findMany({
      include: {
        vehicle: { select: { plateNumber: true, brand: true, model: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(drivers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch drivers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = driverSchema.parse(body);

    const driver = await prisma.driver.create({
      data: {
        ...validated,
        licenseExpiry: validated.licenseExpiry ? new Date(validated.licenseExpiry) : undefined,
      },
    });

    return NextResponse.json(driver, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
