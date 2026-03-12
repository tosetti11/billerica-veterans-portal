import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// POST /api/appointments/book - Book an appointment (requires login)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Must be logged in" }, { status: 401 });
  }

  const body = await req.json();
  const { date, startTime, endTime, appointmentType, notes } = body;

  if (!date || !startTime || !endTime || !appointmentType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify the slot is still available
  const existing = await prisma.appointment.findFirst({
    where: {
      date,
      startTime,
      status: { in: ["scheduled", "confirmed"] },
    },
  });

  if (existing) {
    return NextResponse.json({ error: "This time slot is no longer available" }, { status: 409 });
  }

  // Check for blocked slots
  const blocked = await prisma.appointmentSlot.findFirst({
    where: {
      specificDate: date,
      startTime,
      isBlocked: true,
    },
  });

  if (blocked) {
    return NextResponse.json({ error: "This time slot is blocked" }, { status: 409 });
  }

  const appointment = await prisma.appointment.create({
    data: {
      veteranId: session.user.id,
      date,
      startTime,
      endTime,
      appointmentType,
      veteranNotes: notes || null,
      status: "scheduled",
    },
  });

  return NextResponse.json({ appointment }, { status: 201 });
}

// GET /api/appointments/book - Get user's own appointments
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Must be logged in" }, { status: 401 });
  }

  const appointments = await prisma.appointment.findMany({
    where: { veteranId: session.user.id },
    include: { case: { select: { caseNumber: true, title: true } } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ appointments });
}
