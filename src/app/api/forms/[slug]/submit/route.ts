import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateFilledPDF } from "@/lib/pdf-generator";
import { notifyVSONewSubmission, notifyVeteranSubmissionConfirmation } from "@/lib/email";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  options?: string[];
}

// POST /api/forms/[slug]/submit - Submit a filled form (requires login)
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Must be logged in" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await req.json();
  const { data, caseId } = body;

  // Get the template
  const template = await prisma.formTemplate.findFirst({
    where: { slug, isActive: true },
  });

  if (!template) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  // Get the veteran's info
  const veteran = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { firstName: true, lastName: true, email: true },
  });

  if (!veteran) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const veteranName = `${veteran.firstName} ${veteran.lastName}`;
  const submittedAt = new Date();

  // If no caseId provided, create a new case for this form submission
  let linkedCaseId = caseId;
  let caseNumber: string;

  if (!linkedCaseId) {
    caseNumber = `BVS-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
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
  } else {
    const existingCase = await prisma.case.findUnique({ where: { id: linkedCaseId } });
    caseNumber = existingCase?.caseNumber || "UNKNOWN";
  }

  // Create the form submission record
  const submission = await prisma.formSubmission.create({
    data: {
      formId: template.id,
      veteranId: session.user.id,
      caseId: linkedCaseId,
      data: JSON.stringify(data),
      status: "submitted",
    },
  });

  // ─── Generate PDF ────────────────────────────────────────
  let pdfBuffer: Uint8Array | undefined;
  try {
    const fields: FormField[] = JSON.parse(template.fields);
    pdfBuffer = await generateFilledPDF(
      template.name,
      template.serviceType,
      fields,
      data,
      veteranName,
      caseNumber,
      submittedAt
    );

    // Save PDF to disk and create Document record
    const uploadsDir = path.join(process.cwd(), "uploads", session.user.id);
    await mkdir(uploadsDir, { recursive: true });

    const pdfFilename = `${caseNumber}-${slug}.pdf`;
    const pdfPath = path.join(uploadsDir, pdfFilename);
    await writeFile(pdfPath, pdfBuffer);

    await prisma.document.create({
      data: {
        veteranId: session.user.id,
        caseId: linkedCaseId,
        fileName: pdfFilename,
        fileSize: pdfBuffer.length,
        fileType: "application/pdf",
        filePath: `/uploads/${session.user.id}/${pdfFilename}`,
        category: "form_submission",
        description: `Generated PDF: ${template.name}`,
      },
    });

    // Add a case note about the submission
    await prisma.caseNote.create({
      data: {
        caseId: linkedCaseId,
        authorId: session.user.id,
        content: `Form submitted: ${template.name}. A filled PDF has been generated and attached to this case.`,
        isInternal: false,
      },
    });

    console.log(`[Forms] PDF generated: ${pdfFilename} (${pdfBuffer.length} bytes)`);
  } catch (err) {
    console.error("[Forms] PDF generation failed:", err);
    // Don't fail the submission if PDF generation fails — the data is still saved
  }

  // ─── Send Email Notifications ────────────────────────────
  try {
    // Notify the VSO
    await notifyVSONewSubmission({
      veteranName,
      veteranEmail: veteran.email,
      formName: template.name,
      caseNumber,
      caseId: linkedCaseId,
      serviceType: template.serviceType,
      submittedAt,
      pdfBuffer,
    });

    // Send confirmation to the veteran
    await notifyVeteranSubmissionConfirmation({
      veteranName,
      veteranEmail: veteran.email,
      formName: template.name,
      caseNumber,
      pdfBuffer,
    });
  } catch (err) {
    console.error("[Forms] Email notification failed:", err);
    // Don't fail the submission if email fails
  }

  return NextResponse.json(
    {
      submission,
      caseId: linkedCaseId,
      caseNumber,
      pdfGenerated: !!pdfBuffer,
    },
    { status: 201 }
  );
}
