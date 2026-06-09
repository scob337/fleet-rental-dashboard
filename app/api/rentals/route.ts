import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const rentalSchema = z.object({
  customerId: z.string(),
  vehicleId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  dailyRate: z.number(),
  status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rentals = await prisma.rental.findMany({
      include: {
        customer: true,
        vehicle: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(rentals);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch rentals" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = rentalSchema.parse(body);

    const rental = await prisma.rental.create({
      data: validatedData as any,
      include: {
        customer: true,
        vehicle: true,
      },
    });

    return NextResponse.json(rental, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create rental" },
      { status: 500 }
    );
  }
}
