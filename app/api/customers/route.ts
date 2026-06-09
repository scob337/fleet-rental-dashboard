import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const customerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(1),
  company: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLACKLISTED']).default('ACTIVE'),
});

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        _count: { select: { contracts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    // Map _count to contractsCount for the frontend
    const formatted = customers.map(c => ({
      ...c,
      contractsCount: c._count.contracts,
      totalRevenue: 0, // In a real app, calculate from invoices/payments
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = customerSchema.parse(body);

    const customer = await prisma.customer.create({
      data: validated,
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
