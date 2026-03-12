import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

function generateCaseNumber() {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BVS-${year}-${random}`;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { veteranId, caseType, title, description, priority } = await req.json();

  if (!veteranId || !caseType || !title || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const newCase = await prisma.case.create({
    data: {
      caseNumber: generateCaseNumber(),
      veteranId,
      caseType,
      title,
      description,
      priority: priority || "normal",
      assignedToId: session.user.id,
    },
  });

  return NextResponse.json(newCase, { status: 201 });
}
