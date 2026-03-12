import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/forms/[slug] - Get a specific form template by slug
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const template = await prisma.formTemplate.findFirst({
    where: { slug, isActive: true },
  });

  if (!template) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  return NextResponse.json({ template: { ...template, fields: JSON.parse(template.fields) } });
}

// PUT /api/forms/[slug] - Update a form template (admin only)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { slug } = await params;
  const body = await req.json();

  const template = await prisma.formTemplate.findFirst({ where: { slug } });
  if (!template) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  const updated = await prisma.formTemplate.update({
    where: { id: template.id },
    data: {
      name: body.name ?? template.name,
      description: body.description ?? template.description,
      fields: body.fields ? JSON.stringify(body.fields) : template.fields,
      isActive: body.isActive ?? template.isActive,
      version: { increment: 1 },
    },
  });

  return NextResponse.json({ template: updated });
}
