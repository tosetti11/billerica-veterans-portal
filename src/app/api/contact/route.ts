import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  const { name, email, phone, subject, message } = await req.json();

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const contactMessage = await prisma.contactMessage.create({
    data: {
      name,
      email,
      phone: phone || null,
      subject,
      message,
      userId: session?.user?.id || null,
    },
  });

  return NextResponse.json(contactMessage, { status: 201 });
}
