import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/forms - Get active form templates (public) or all (admin)
export async function GET() {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  const templates = await prisma.formTemplate.findMany({
    where: isAdmin ? {} : { isActive: true },
    orderBy: { serviceType: "asc" },
    include: {
      _count: { select: { submissions: true } },
    },
  });

  return NextResponse.json({ templates });
}

// POST /api/forms - Create a form template (admin only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await req.json();
  const { name, slug, description, serviceType, fields, isActive } = body;

  if (!name || !slug || !serviceType || !fields) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const template = await prisma.formTemplate.create({
    data: {
      name,
      slug,
      description: description || null,
      serviceType,
      fields: JSON.stringify(fields),
      isActive: isActive ?? true,
    },
  });

  return NextResponse.json({ template }, { status: 201 });
}
