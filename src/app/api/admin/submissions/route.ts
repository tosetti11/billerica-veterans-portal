import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/admin/submissions - Get all form submissions (admin only)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const formId = searchParams.get("formId");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (formId) where.formId = formId;

  const submissions = await prisma.formSubmission.findMany({
    where,
    include: {
      form: { select: { name: true, slug: true, serviceType: true, fields: true } },
      veteran: { select: { firstName: true, lastName: true, email: true, phone: true } },
      case: { select: { id: true, caseNumber: true, status: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json({ submissions });
}

// PATCH /api/admin/submissions - Update submission status (admin only)
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await req.json();
  const { id, status, reviewNotes } = body;

  if (!id || !status) {
    return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
  }

  const updated = await prisma.formSubmission.update({
    where: { id },
    data: {
      status,
      reviewNotes: reviewNotes || undefined,
      reviewedAt: ["reviewed", "approved", "rejected"].includes(status) ? new Date() : undefined,
    },
  });

  return NextResponse.json({ submission: updated });
}
