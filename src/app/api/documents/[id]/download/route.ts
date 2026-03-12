import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { readFile } from "fs/promises";
import path from "path";

// GET /api/documents/[id]/download - Download a document
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Must be logged in" }, { status: 401 });
  }

  const { id } = await params;

  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Veterans can only download their own documents; admins can download any
  if (session.user.role !== "admin" && doc.veteranId !== session.user.id) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  try {
    const filePath = path.join(process.cwd(), doc.filePath);
    const fileBuffer = await readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": doc.fileType,
        "Content-Disposition": `attachment; filename="${doc.fileName}"`,
        "Content-Length": String(fileBuffer.length),
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
  }
}
