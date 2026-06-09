import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const months = [];
    const trends = [];

    // Get data for last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth();

      const monthName = date.toLocaleDateString("en-US", { month: "short" });
      months.push(monthName);

      // Get revenue for this month
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 1);

      const invoices = await prisma.invoice.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      });

      const expenses = await prisma.expense.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      });

      const revenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
      const expenseTotal = expenses.reduce((sum, exp) => sum + exp.amount, 0);

      trends.push({
        month: monthName,
        revenue: Math.round(revenue),
        expenses: Math.round(expenseTotal),
      });
    }

    return NextResponse.json({ trends });
  } catch (error) {
    console.error("Trends API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trend data" },
      { status: 500 }
    );
  }
}
