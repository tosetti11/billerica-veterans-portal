import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  ChevronRight,
} from "lucide-react";

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  pending_documents: "bg-orange-100 text-orange-700",
  under_review: "bg-purple-100 text-purple-700",
  approved: "bg-green-100 text-green-700",
  denied: "bg-red-100 text-red-700",
  closed: "bg-gray-100 text-gray-700",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  normal: "bg-blue-50 text-blue-600",
  high: "bg-orange-100 text-orange-600",
  urgent: "bg-red-100 text-red-700",
};

const caseTypeLabels: Record<string, string> = {
  va_disability: "VA Disability Claim",
  property_tax_abatement: "Property Tax Abatement",
  pension: "Pension Benefits",
  education: "Education Benefits",
  healthcare: "Healthcare",
  employment: "Employment Services",
  housing: "Housing Assistance",
  burial: "Burial Benefits",
  other: "Other",
};

export default async function AdminCases({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string; type?: string; q?: string }>;
}) {
  const params = await searchParams;

  const where: Record<string, unknown> = {};
  if (params.status) where.status = params.status;
  if (params.priority) where.priority = params.priority;
  if (params.type) where.caseType = params.type;
  if (params.q) {
    where.OR = [
      { title: { contains: params.q } },
      { caseNumber: { contains: params.q } },
      { veteran: { firstName: { contains: params.q } } },
      { veteran: { lastName: { contains: params.q } } },
    ];
  }

  const cases = await prisma.case.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      veteran: { select: { firstName: true, lastName: true, email: true } },
      assignedTo: { select: { firstName: true, lastName: true } },
      _count: { select: { notes: true, documents: true } },
    },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Case Management</h1>
          <p className="text-muted mt-1">{cases.length} case{cases.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/admin/cases/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-light transition"
        >
          <Plus className="w-4 h-4" /> New Case
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-border p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <Filter className="w-4 h-4 text-muted" />
          <form className="flex flex-wrap gap-3 items-center flex-1" method="GET">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                name="q"
                type="text"
                placeholder="Search cases..."
                defaultValue={params.q || ""}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-border text-sm"
              />
            </div>
            <select name="status" defaultValue={params.status || ""} className="px-3 py-2 rounded-lg border border-border text-sm">
              <option value="">All Statuses</option>
              {Object.entries(statusColors).map(([key]) => (
                <option key={key} value={key}>{key.replace(/_/g, " ")}</option>
              ))}
            </select>
            <select name="priority" defaultValue={params.priority || ""} className="px-3 py-2 rounded-lg border border-border text-sm">
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <select name="type" defaultValue={params.type || ""} className="px-3 py-2 rounded-lg border border-border text-sm">
              <option value="">All Types</option>
              {Object.entries(caseTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition">
              Filter
            </button>
          </form>
        </div>
      </div>

      {/* Cases list */}
      <div className="bg-white rounded-xl shadow-sm border border-border">
        <div className="divide-y divide-border">
          {cases.length === 0 ? (
            <div className="p-12 text-center text-muted">
              <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No cases found</p>
            </div>
          ) : (
            cases.map((c) => (
              <Link
                key={c.id}
                href={`/admin/cases/${c.id}`}
                className="block p-5 hover:bg-gray-50 transition group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-xs text-muted">{c.caseNumber}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[c.status]}`}>
                        {c.status.replace(/_/g, " ")}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[c.priority]}`}>
                        {c.priority}
                      </span>
                    </div>
                    <h3 className="font-medium text-foreground truncate">{c.title}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted">
                      <span>{c.veteran.firstName} {c.veteran.lastName}</span>
                      <span>{caseTypeLabels[c.caseType] || c.caseType}</span>
                      <span>{c._count.notes} notes</span>
                      <span>{c._count.documents} docs</span>
                      {c.assignedTo && (
                        <span>Assigned: {c.assignedTo.firstName} {c.assignedTo.lastName}</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted group-hover:text-primary transition" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
