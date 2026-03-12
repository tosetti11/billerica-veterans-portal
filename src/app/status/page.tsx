"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Search, Clock, CheckCircle, AlertCircle, FileText, Calendar,
  ArrowRight, XCircle, Loader2, MessageSquare, ChevronDown, ChevronUp
} from "lucide-react";

type CaseNote = {
  id: string;
  content: string;
  createdAt: string;
  author: { firstName: string; lastName: string; role: string };
};

type CaseData = {
  id: string;
  caseNumber: string;
  caseType: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  assignedTo: { firstName: string; lastName: string } | null;
  notes: CaseNote[];
  appointments: { id: string; date: string; startTime: string; endTime: string; status: string; appointmentType: string }[];
  _count: { documents: number; formSubmissions: number };
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  open: { label: "Open", color: "bg-blue-100 text-blue-800", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  pending_documents: { label: "Pending Documents", color: "bg-orange-100 text-orange-800", icon: FileText },
  under_review: { label: "Under Review", color: "bg-purple-100 text-purple-800", icon: Search },
  approved: { label: "Approved", color: "bg-green-100 text-green-800", icon: CheckCircle },
  denied: { label: "Denied", color: "bg-red-100 text-red-800", icon: XCircle },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-800", icon: CheckCircle },
};

const typeLabels: Record<string, string> = {
  va_disability: "VA Disability Claim",
  property_tax_abatement: "Property Tax Abatement",
  pension: "Pension",
  education: "Education Benefits",
  healthcare: "Healthcare",
  employment: "Employment Assistance",
  housing: "Housing Assistance",
  burial: "Burial Benefits",
  other: "Other",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(time24: string) {
  const [h, m] = time24.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

function CaseCard({ c }: { c: CaseData }) {
  const [expanded, setExpanded] = useState(false);
  const status = statusConfig[c.status] || statusConfig.open;
  const StatusIcon = status.icon;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="font-mono text-xs text-muted">{c.caseNumber}</span>
            <h3 className="font-semibold text-primary mt-0.5">{c.title}</h3>
          </div>
          <span className={`${status.color} px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
            <StatusIcon className="w-3 h-3" /> {status.label}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
          <div>
            <span className="text-muted text-xs">Type</span>
            <p className="font-medium">{typeLabels[c.caseType] || c.caseType}</p>
          </div>
          <div>
            <span className="text-muted text-xs">Submitted</span>
            <p className="font-medium">{formatDate(c.createdAt)}</p>
          </div>
          <div>
            <span className="text-muted text-xs">Assigned To</span>
            <p className="font-medium">{c.assignedTo ? `${c.assignedTo.firstName} ${c.assignedTo.lastName}` : "Unassigned"}</p>
          </div>
          <div>
            <span className="text-muted text-xs">Last Updated</span>
            <p className="font-medium">{formatDate(c.updatedAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {c._count.documents} docs</span>
          <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {c.notes.length} notes</span>
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {c.appointments.length} appts</span>
        </div>
      </div>

      <button onClick={() => setExpanded(!expanded)}
        className="w-full border-t border-border px-5 py-2.5 text-sm text-primary font-medium flex items-center justify-center gap-1 hover:bg-gray-50 transition">
        {expanded ? <><ChevronUp className="w-4 h-4" /> Less Details</> : <><ChevronDown className="w-4 h-4" /> More Details</>}
      </button>

      {expanded && (
        <div className="border-t border-border px-5 py-4 bg-gray-50 space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-1">Description</h4>
            <p className="text-sm text-muted">{c.description}</p>
          </div>

          {c.notes.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Notes & Updates</h4>
              <div className="space-y-2">
                {c.notes.map((note) => (
                  <div key={note.id} className="bg-white rounded-lg p-3 border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-primary">{note.author.firstName} {note.author.lastName}</span>
                      <span className="text-xs text-muted">{formatDate(note.createdAt)}</span>
                    </div>
                    <p className="text-sm">{note.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {c.appointments.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Related Appointments</h4>
              <div className="space-y-1">
                {c.appointments.map((apt) => (
                  <div key={apt.id} className="bg-white rounded-lg p-2 border border-border text-sm flex items-center justify-between">
                    <span>{formatDate(apt.date)} at {formatTime(apt.startTime)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${apt.status === "completed" ? "bg-green-100 text-green-700" : apt.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function StatusPage() {
  const { data: session, status: authStatus } = useSession();
  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    fetch("/api/cases")
      .then((r) => r.json())
      .then((data) => {
        setCases(data.cases || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [authStatus]);

  if (authStatus === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="fade-in max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-amber-800 mb-2">Login Required</h2>
          <p className="text-amber-700 mb-6">Log in to view your case status and applications.</p>
          <a href="/login" className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary-light transition font-medium text-sm">
            Log In / Register
          </a>
        </div>
      </div>
    );
  }

  const filteredCases = filter === "all" ? cases : cases.filter((c) => c.status === filter);

  return (
    <div className="fade-in">
      <div className="bg-gradient-to-r from-primary to-primary-light text-white py-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-6 h-6 text-accent" />
            <span className="text-accent font-medium">Case Status</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">My Cases & Applications</h1>
          <p className="text-blue-100">Track the status of your benefit requests and appointments.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-500 mb-2">No Cases Yet</h3>
            <p className="text-muted mb-6">You haven&apos;t submitted any benefit requests yet.</p>
            <a href="/apply" className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary-light transition font-medium text-sm inline-flex items-center gap-2">
              <ArrowRight className="w-4 h-4" /> Apply for Benefits
            </a>
          </div>
        ) : (
          <>
            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { value: "all", label: `All (${cases.length})` },
                { value: "open", label: "Open" },
                { value: "in_progress", label: "In Progress" },
                { value: "pending_documents", label: "Pending Docs" },
                { value: "under_review", label: "Under Review" },
                { value: "approved", label: "Approved" },
                { value: "denied", label: "Denied" },
                { value: "closed", label: "Closed" },
              ].filter((f) => f.value === "all" || cases.some((c) => c.status === f.value)).map((f) => (
                <button key={f.value} onClick={() => setFilter(f.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${filter === f.value ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {f.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredCases.map((c) => (
                <CaseCard key={c.id} c={c} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
