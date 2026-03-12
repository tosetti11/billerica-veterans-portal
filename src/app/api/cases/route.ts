import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/cases - Get logged-in veteran's cases
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Must be logged in" }, { status: 401 });
  }

  const cases = await prisma.case.findMany({
    where: { veteranId: session.user.id },
    include: {
      assignedTo: { select: { firstName: true, lastName: true } },
      notes: {
        where: { isInternal: false }, // only non-internal notes visible to veteran
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { firstName: true, lastName: true, role: true } },
        },
      },
      appointments: { orderBy: { date: "desc" }, take: 3 },
      _count: { select: { documents: true, formSubmissions: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ cases });
}
