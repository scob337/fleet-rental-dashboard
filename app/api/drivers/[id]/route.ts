import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const driverUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  licenseNumber: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  email: z.string().email().optional(),
  licenseClass: z.string().optional(),
  licenseExpiry: z.string().optional(),
  experience: z.number().int().min(0).optional(),
  status: z.enum(['ACTIVE', 'ON_TRIP', 'ON_LEAVE', 'TERMINATED']).optional(),
  vehicleId: z.string().optional().nullable(),
  dailyTrips: z.number().int().min(0).optional(),
  monthlyRevenue: z.number().min(0).optional(),
});

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        vehicle: true,
        tripLogs: { take: 5, orderBy: { startDate: 'desc' } },
      },
    });

    if (!driver) return NextResponse.json({ error: 'Driver not found' }, { status: 404 });

    return NextResponse.json(driver);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch driver' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = driverUpdateSchema.parse(body);

    const driver = await prisma.driver.update({
      where: { id },
      data: {
        ...validated,
        licenseExpiry: validated.licenseExpiry ? new Date(validated.licenseExpiry) : undefined,
      },
    });

    return NextResponse.json(driver);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.driver.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Driver deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete driver' }, { status: 500 });
  }
}
