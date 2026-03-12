"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Search,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  Briefcase,
  ClipboardList,
} from "lucide-react";

interface Submission {
  id: string;
  data: string; // JSON
  status: string;
  reviewNotes: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  form: {
    name: string;
    slug: string;
    serviceType: string;
    fields: string; // JSON
  };
  veteran: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  case: {
    id: string;
    caseNumber: string;
    status: string;
  } | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-800", icon: Clock },
  reviewed: { label: "Reviewed", color: "bg-yellow-100 text-yellow-800", icon: Eye },
  approved: { label: "Approved", color: "bg-green-100 text-green-800", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800", icon: XCircle },
};

const serviceTypeLabels: Record<string, string> = {
  va_disability: "VA Disability",
  property_tax_abatement: "Property Tax",
  pension: "Ch. 115 Benefits",
  burial: "Burial",
  general: "General",
};

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/submissions")
      .then((r) => r.json())
      .then((data) => {
        setSubmissions(data.submissions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string, reviewNotes?: string) => {
    const res = await fetch("/api/admin/submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, reviewNotes }),
    });
    if (res.ok) {
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status, reviewedAt: new Date().toISOString() } : s
        )
      );
    }
  };

  const filtered = submissions.filter((s) => {
    if (filterStatus && s.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      const veteranName = `${s.veteran.firstName} ${s.veteran.lastName}`.toLowerCase();
      return (
        veteranName.includes(q) ||
        s.form.name.toLowerCase().includes(q) ||
        s.case?.caseNumber.toLowerCase().includes(q) ||
        s.veteran.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Form Submissions</h1>
        <p className="text-gray-500 text-sm mt-1">
          Review veteran form submissions, view filled data, and manage status.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", count: submissions.length, color: "text-gray-900" },
          { label: "Needs Review", count: submissions.filter((s) => s.status === "submitted").length, color: "text-blue-700" },
          { label: "Approved", count: submissions.filter((s) => s.status === "approved").length, color: "text-green-700" },
          { label: "Rejected", count: submissions.filter((s) => s.status === "rejected").length, color: "text-red-700" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by veteran name, email, form, or case number..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="reviewed">Reviewed</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Submissions list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 py-12 text-center">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No submissions found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((sub) => {
            const isExpanded = expandedId === sub.id;
            const config = statusConfig[sub.status] || statusConfig.submitted;
            const StatusIcon = config.icon;
            const parsedData: Record<string, string> = JSON.parse(sub.data);
            const fields = JSON.parse(sub.form.fields) as { name: string; label: string; type: string }[];

            return (
              <div
                key={sub.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                {/* Header row */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                >
                  <div className="flex-1 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-800" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{sub.form.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <User className="w-3 h-3" />
                        {sub.veteran.firstName} {sub.veteran.lastName}
                        <span className="text-gray-300">|</span>
                        <Calendar className="w-3 h-3" />
                        {new Date(sub.submittedAt).toLocaleDateString()}
                        {sub.case && (
                          <>
                            <span className="text-gray-300">|</span>
                            <Briefcase className="w-3 h-3" />
                            {sub.case.caseNumber}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${config.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {config.label}
                  </span>

                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {serviceTypeLabels[sub.form.serviceType] || sub.form.serviceType}
                  </span>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Veteran info */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                          Veteran Information
                        </h4>
                        <div className="bg-white rounded border border-gray-200 p-3 space-y-1.5 text-sm">
                          <p>
                            <span className="font-medium text-gray-600">Name:</span>{" "}
                            {sub.veteran.firstName} {sub.veteran.lastName}
                          </p>
                          <p>
                            <span className="font-medium text-gray-600">Email:</span>{" "}
                            <a href={`mailto:${sub.veteran.email}`} className="text-blue-800">
                              {sub.veteran.email}
                            </a>
                          </p>
                          {sub.veteran.phone && (
                            <p>
                              <span className="font-medium text-gray-600">Phone:</span>{" "}
                              {sub.veteran.phone}
                            </p>
                          )}
                          {sub.case && (
                            <p>
                              <span className="font-medium text-gray-600">Case:</span>{" "}
                              <Link
                                href={`/admin/cases/${sub.case.id}`}
                                className="text-blue-800 underline"
                              >
                                {sub.case.caseNumber}
                              </Link>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                          Actions
                        </h4>
                        <div className="bg-white rounded border border-gray-200 p-3 space-y-2">
                          <div className="flex gap-2">
                            {sub.status === "submitted" && (
                              <>
                                <button
                                  onClick={() => updateStatus(sub.id, "reviewed")}
                                  className="flex-1 px-3 py-1.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded hover:bg-yellow-200 transition-colors"
                                >
                                  Mark Reviewed
                                </button>
                                <button
                                  onClick={() => updateStatus(sub.id, "approved")}
                                  className="flex-1 px-3 py-1.5 bg-green-100 text-green-800 text-xs font-medium rounded hover:bg-green-200 transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => updateStatus(sub.id, "rejected")}
                                  className="flex-1 px-3 py-1.5 bg-red-100 text-red-800 text-xs font-medium rounded hover:bg-red-200 transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {sub.status === "reviewed" && (
                              <>
                                <button
                                  onClick={() => updateStatus(sub.id, "approved")}
                                  className="flex-1 px-3 py-1.5 bg-green-100 text-green-800 text-xs font-medium rounded hover:bg-green-200 transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => updateStatus(sub.id, "rejected")}
                                  className="flex-1 px-3 py-1.5 bg-red-100 text-red-800 text-xs font-medium rounded hover:bg-red-200 transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {(sub.status === "approved" || sub.status === "rejected") && (
                              <button
                                onClick={() => updateStatus(sub.id, "submitted")}
                                className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded hover:bg-gray-200 transition-colors"
                              >
                                Reset to Submitted
                              </button>
                            )}
                          </div>
                          {sub.case && (
                            <Link
                              href={`/admin/cases/${sub.case.id}`}
                              className="block w-full text-center px-3 py-1.5 bg-blue-800 text-white text-xs font-medium rounded hover:bg-blue-900 transition-colors"
                            >
                              View Full Case
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Submitted data */}
                    <div className="mt-4">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        Submitted Data
                      </h4>
                      <div className="bg-white rounded border border-gray-200 overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 w-1/3">
                                Field
                              </th>
                              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500">
                                Value
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {fields.map((field) => (
                              <tr key={field.name} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-sm font-medium text-gray-600">
                                  {field.label}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900">
                                  {parsedData[field.name] || (
                                    <span className="text-gray-400 italic">Not provided</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Review notes */}
                    {sub.reviewNotes && (
                      <div className="mt-4">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                          Review Notes
                        </h4>
                        <div className="bg-white rounded border border-gray-200 p-3 text-sm text-gray-700">
                          {sub.reviewNotes}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
