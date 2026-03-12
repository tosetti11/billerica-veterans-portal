import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// GET /api/documents - Get user's documents
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Must be logged in" }, { status: 401 });
  }

  const documents = await prisma.document.findMany({
    where: { veteranId: session.user.id },
    include: {
      case: { select: { caseNumber: true, title: true } },
    },
    orderBy: { uploadedAt: "desc" },
  });

  return NextResponse.json({ documents });
}

// POST /api/documents - Upload a document
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Must be logged in" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const caseId = formData.get("caseId") as string | null;
  const category = (formData.get("category") as string) || "other";
  const description = formData.get("description") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  // Create uploads directory
  const uploadsDir = path.join(process.cwd(), "uploads", session.user.id);
  await mkdir(uploadsDir, { recursive: true });

  // Save file
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${timestamp}_${safeName}`;
  const filePath = path.join(uploadsDir, fileName);

  const bytes = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(bytes));

  // Create document record
  const document = await prisma.document.create({
    data: {
      veteranId: session.user.id,
      caseId: caseId || null,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      filePath: `uploads/${session.user.id}/${fileName}`,
      category,
      description: description || null,
    },
  });

  return NextResponse.json({ document }, { status: 201 });
}
