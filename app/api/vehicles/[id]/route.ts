import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const vehicleUpdateSchema = z.object({
  plateNumber: z.string().min(1).optional(),
  brand: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  year: z.number().int().min(1900).optional(),
  type: z.enum(['CAR', 'VAN', 'TRUCK', 'BUS', 'CONTAINER_TRUCK']).optional(),
  status: z.enum(['AVAILABLE', 'RENTED', 'MAINTENANCE', 'DAMAGED', 'RETIRED']).optional(),
  location: z.string().optional(),
  driverId: z.string().optional().nullable(),
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

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        driver: true,
        maintenances: true,
        tripLogs: true,
      },
    });

    if (!vehicle) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });

    return NextResponse.json(vehicle);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch vehicle' }, { status: 500 });
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
    const validated = vehicleUpdateSchema.parse(body);

    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: { driver: true },
    });

    if (!existingVehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (validated.plateNumber !== undefined) updateData.plateNumber = validated.plateNumber;
    if (validated.brand !== undefined) updateData.brand = validated.brand;
    if (validated.model !== undefined) updateData.model = validated.model;
    if (validated.year !== undefined) updateData.year = validated.year;
    if (validated.type !== undefined) updateData.type = validated.type;
    if (validated.status !== undefined) updateData.status = validated.status;
    if (validated.location !== undefined) updateData.location = validated.location;
    if (validated.dailyTrips !== undefined) updateData.dailyTrips = validated.dailyTrips;
    if (validated.monthlyRevenue !== undefined) updateData.monthlyRevenue = validated.monthlyRevenue;

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: updateData,
    });

    if (validated.driverId !== undefined) {
      if (existingVehicle.driver && existingVehicle.driver.id !== validated.driverId) {
        await prisma.driver.updateMany({
          where: { vehicleId: id },
          data: { vehicleId: null },
        });
      }

      if (validated.driverId) {
        await prisma.driver.update({
          where: { id: validated.driverId },
          data: { vehicleId: id },
        });
      }
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('PUT /api/vehicles/[id] error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
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

    await prisma.vehicle.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Vehicle deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete vehicle' }, { status: 500 });
  }
}
