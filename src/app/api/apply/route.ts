import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const serviceTypeToCaseType: Record<string, string> = {
  ch115: "pension",
  tax: "property_tax_abatement",
  disability: "va_disability",
  bonus: "other",
  burial: "burial",
  plates: "other",
  annuity: "pension",
  records: "other",
};

function generateCaseNumber() {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BVS-${year}-${random}`;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Must be logged in to apply" }, { status: 401 });
  }

  const body = await req.json();
  const { service, serviceName, firstName, lastName, email, phone, address, city, state, zip, branch, serviceStart, serviceEnd, dischargeType } = body;

  // Update veteran profile with submitted info
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      phone: phone || undefined,
      address: address || undefined,
      city: city || undefined,
      state: state || undefined,
      zip: zip || undefined,
      branch: branch || undefined,
      serviceStart: serviceStart || undefined,
      serviceEnd: serviceEnd || undefined,
      dischargeStatus: dischargeType || undefined,
    },
  });

  // Create the case
  const caseNumber = generateCaseNumber();
  const caseType = serviceTypeToCaseType[service] || "other";

  const newCase = await prisma.case.create({
    data: {
      caseNumber,
      veteranId: session.user.id,
      caseType,
      title: `${serviceName} - ${firstName} ${lastName}`,
      description: `Service requested: ${serviceName}\nApplicant: ${firstName} ${lastName}\nEmail: ${email}\nPhone: ${phone || "N/A"}\nAddress: ${address}, ${city}, ${state} ${zip}\nBranch: ${branch || "N/A"}\nService: ${serviceStart || "N/A"} to ${serviceEnd || "N/A"}\nDischarge: ${dischargeType || "N/A"}`,
      status: "open",
      priority: "normal",
    },
  });

  return NextResponse.json({ caseNumber: newCase.caseNumber, id: newCase.id }, { status: 201 });
}
