import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/appointments/slots?date=2026-03-15
// Returns available time slots for a specific date
export async function GET(req: NextRequest) {
  const dateStr = req.nextUrl.searchParams.get("date");
  if (!dateStr) {
    return NextResponse.json({ error: "date parameter required" }, { status: 400 });
  }

  const date = new Date(dateStr + "T00:00:00");
  const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ...

  // Get recurring slots for this day of week
  const recurringSlots = await prisma.appointmentSlot.findMany({
    where: { isRecurring: true, dayOfWeek, isBlocked: false },
    orderBy: { startTime: "asc" },
  });

  // Get one-off available slots for this specific date
  const oneOffSlots = await prisma.appointmentSlot.findMany({
    where: { isRecurring: false, specificDate: dateStr, isBlocked: false },
    orderBy: { startTime: "asc" },
  });

  // Get blocked slots for this specific date
  const blockedSlots = await prisma.appointmentSlot.findMany({
    where: { isRecurring: false, specificDate: dateStr, isBlocked: true },
  });

  // Get already-booked appointments for this date
  const bookedAppointments = await prisma.appointment.findMany({
    where: {
      date: dateStr,
      status: { in: ["scheduled", "confirmed"] },
    },
    select: { startTime: true, endTime: true },
  });

  // Combine recurring + one-off slots
  const allSlots = [
    ...recurringSlots.map((s) => ({ startTime: s.startTime, endTime: s.endTime })),
    ...oneOffSlots.map((s) => ({ startTime: s.startTime, endTime: s.endTime })),
  ];

  // Filter out blocked and booked times
  const blockedTimes = new Set(blockedSlots.map((s) => s.startTime));
  const bookedTimes = new Set(bookedAppointments.map((a) => a.startTime));

  const availableSlots = allSlots.filter(
    (s) => !blockedTimes.has(s.startTime) && !bookedTimes.has(s.startTime)
  );

  // Deduplicate
  const seen = new Set<string>();
  const unique = availableSlots.filter((s) => {
    const key = `${s.startTime}-${s.endTime}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return NextResponse.json({ date: dateStr, dayOfWeek, slots: unique });
}
