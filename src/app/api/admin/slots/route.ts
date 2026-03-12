import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slots = await prisma.appointmentSlot.findMany({
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return NextResponse.json(slots);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();

  const slot = await prisma.appointmentSlot.create({
    data: {
      dayOfWeek: data.dayOfWeek,
      specificDate: data.specificDate,
      startTime: data.startTime,
      endTime: data.endTime,
      isRecurring: data.isRecurring ?? true,
      isBlocked: data.isBlocked ?? false,
      blockReason: data.blockReason,
    },
  });

  return NextResponse.json(slot, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  await prisma.appointmentSlot.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
