import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const customerUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(1).optional(),
  company: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLACKLISTED']).optional(),
});

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        contracts: { take: 5, orderBy: { createdAt: 'desc' } },
        invoices: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

    return NextResponse.json(customer);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const validated = customerUpdateSchema.parse(body);

    const customer = await prisma.customer.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json(customer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await prisma.customer.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Customer deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}
