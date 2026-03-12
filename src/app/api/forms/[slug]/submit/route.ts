import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// POST /api/forms/[slug]/submit - Submit a filled form (requires login)
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Must be logged in" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await req.json();
  const { data, caseId } = body;

  const template = await prisma.formTemplate.findFirst({
    where: { slug, isActive: true },
  });

  if (!template) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  // If no caseId provided, create a new case for this form submission
  let linkedCaseId = caseId;
  if (!linkedCaseId) {
    const caseNumber = `BVS-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newCase = await prisma.case.create({
      data: {
        caseNumber,
        veteranId: session.user.id,
        caseType: template.serviceType,
        title: `${template.name} - Form Submission`,
        description: `Auto-created case from ${template.name} form submission.`,
        status: "open",
        priority: "normal",
      },
    });
    linkedCaseId = newCase.id;
  }

  const submission = await prisma.formSubmission.create({
    data: {
      formId: template.id,
      veteranId: session.user.id,
      caseId: linkedCaseId,
      data: JSON.stringify(data),
      status: "submitted",
    },
  });

  return NextResponse.json({ submission, caseId: linkedCaseId }, { status: 201 });
}
