import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const maintenanceSchema = z.object({
  vehicleId: z.string(),
  type: z.string(),
  description: z.string(),
  cost: z.number(),
  scheduledDate: z.string(),
  completedDate: z.string().optional(),
  status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED"]),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const maintenance = await prisma.maintenanceRecord.findMany({
      include: {
        vehicle: true,
      },
      orderBy: { scheduledDate: "desc" },
    });

    return NextResponse.json(maintenance);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch maintenance records" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role === "OPERATOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = maintenanceSchema.parse(body);

    const record = await prisma.maintenanceRecord.create({
      data: validatedData as any,
      include: {
        vehicle: true,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create maintenance record" },
      { status: 500 }
    );
  }
}
