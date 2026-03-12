import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import CaseDetailClient from "./CaseDetailClient";

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const caseData = await prisma.case.findUnique({
    where: { id },
    include: {
      veteran: true,
      assignedTo: { select: { id: true, firstName: true, lastName: true } },
      notes: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { firstName: true, lastName: true, role: true } } },
      },
      documents: { orderBy: { uploadedAt: "desc" } },
      appointments: {
        orderBy: { date: "desc" },
        include: { veteran: { select: { firstName: true, lastName: true } } },
      },
      formSubmissions: {
        orderBy: { submittedAt: "desc" },
        include: { form: { select: { name: true } } },
      },
    },
  });

  if (!caseData) notFound();

  const admins = await prisma.user.findMany({
    where: { role: "admin" },
    select: { id: true, firstName: true, lastName: true },
  });

  return <CaseDetailClient caseData={JSON.parse(JSON.stringify(caseData))} admins={admins} />;
}
