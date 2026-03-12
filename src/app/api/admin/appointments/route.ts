import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appointments = await prisma.appointment.findMany({
    orderBy: [{ date: "desc" }, { startTime: "asc" }],
    include: {
      veteran: { select: { firstName: true, lastName: true, email: true } },
    },
  });

  return NextResponse.json(appointments);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status, notes } = await req.json();

  if (!id || !status) {
    return NextResponse.json({ error: "ID and status required" }, { status: 400 });
  }

  const appointment = await prisma.appointment.update({
    where: { id },
    data: {
      status,
      ...(notes !== undefined && { notes }),
    },
  });

  return NextResponse.json(appointment);
}
