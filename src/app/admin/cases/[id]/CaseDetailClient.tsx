"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit3,
  MessageSquare,
  FileText,
  Calendar,
  Clock,
  User,
  Send,
  Lock,
} from "lucide-react";

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
  closedAt: string | null;
  veteranId: string;
  assignedToId: string | null;
  veteran: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  assignedTo: { id: string; firstName: string; lastName: string } | null;
  notes: {
    id: string;
    content: string;
    isInternal: boolean;
    createdAt: string;
    author: { firstName: string; lastName: string; role: string };
  }[];
  documents: {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    category: string;
    uploadedAt: string;
  }[];
  appointments: {
    id: string;
    date: string;
    startTime: string;
    appointmentType: string;
    status: string;
  }[];
  formSubmissions: {
    id: string;
    status: string;
    submittedAt: string;
    form: { name: string };
  }[];
};

type Admin = { id: string; firstName: string; lastName: string };

const statusOptions = [
  "open",
  "in_progress",
  "pending_documents",
  "under_review",
  "approved",
  "denied",
  "closed",
];

const priorityOptions = ["low", "normal", "high", "urgent"];

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  pending_documents: "bg-orange-100 text-orange-700",
  under_review: "bg-purple-100 text-purple-700",
  approved: "bg-green-100 text-green-700",
  denied: "bg-red-100 text-red-700",
  closed: "bg-gray-100 text-gray-700",
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

export default function CaseDetailClient({
  caseData,
  admins,
}: {
  caseData: CaseData;
  admins: Admin[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState(caseData.status);
  const [priority, setPriority] = useState(caseData.priority);
  const [assignedToId, setAssignedToId] = useState(caseData.assignedToId || "");
  const [noteContent, setNoteContent] = useState("");
  const [noteInternal, setNoteInternal] = useState(false);
  const [saving, setSaving] = useState(false);

  const updateCase = async (data: Record<string, unknown>) => {
    setSaving(true);
    await fetch(`/api/admin/cases/${caseData.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    router.refresh();
  };

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    await fetch(`/api/admin/cases/${caseData.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: noteContent, isInternal: noteInternal }),
    });
    setNoteContent("");
    setNoteInternal(false);
    router.refresh();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/cases" className="p-2 rounded-lg hover:bg-gray-100 transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">{caseData.title}</h1>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[caseData.status]}`}>
              {caseData.status.replace(/_/g, " ")}
            </span>
          </div>
          <p className="text-sm text-muted mt-0.5">
            {caseData.caseNumber} — {caseTypeLabels[caseData.caseType] || caseData.caseType}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-5">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Description
            </h2>
            <p className="text-sm text-muted whitespace-pre-wrap">{caseData.description}</p>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl shadow-sm border border-border">
            <div className="p-5 border-b border-border">
              <h2 className="font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Notes ({caseData.notes.length})
              </h2>
            </div>

            {/* Add note form */}
            <form onSubmit={addNote} className="p-4 border-b border-border bg-gray-50">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Add a note..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noteInternal}
                    onChange={(e) => setNoteInternal(e.target.checked)}
                    className="rounded"
                  />
                  <Lock className="w-3 h-3" />
                  Internal only (not visible to veteran)
                </label>
                <button
                  type="submit"
                  disabled={!noteContent.trim()}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition disabled:opacity-50"
                >
                  <Send className="w-3 h-3" /> Add Note
                </button>
              </div>
            </form>

            <div className="divide-y divide-border max-h-96 overflow-y-auto">
              {caseData.notes.length === 0 ? (
                <div className="p-8 text-center text-muted text-sm">No notes yet</div>
              ) : (
                caseData.notes.map((note) => (
                  <div key={note.id} className={`p-4 ${note.isInternal ? "bg-yellow-50/50" : ""}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {note.author.firstName} {note.author.lastName}
                      </span>
                      {note.isInternal && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Internal
                        </span>
                      )}
                      <span className="text-xs text-muted">
                        {new Date(note.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted whitespace-pre-wrap">{note.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl shadow-sm border border-border">
            <div className="p-5 border-b border-border">
              <h2 className="font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4" /> Documents ({caseData.documents.length})
              </h2>
            </div>
            <div className="divide-y divide-border">
              {caseData.documents.length === 0 ? (
                <div className="p-8 text-center text-muted text-sm">No documents attached</div>
              ) : (
                caseData.documents.map((doc) => (
                  <div key={doc.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{doc.fileName}</p>
                      <p className="text-xs text-muted">
                        {doc.category} — {(doc.fileSize / 1024).toFixed(1)} KB — {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Case Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Edit3 className="w-4 h-4" /> Case Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    updateCase({ status: e.target.value });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => {
                    setPriority(e.target.value);
                    updateCase({ priority: e.target.value });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm"
                >
                  {priorityOptions.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">Assigned To</label>
                <select
                  value={assignedToId}
                  onChange={(e) => {
                    setAssignedToId(e.target.value);
                    updateCase({ assignedToId: e.target.value || null });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm"
                >
                  <option value="">Unassigned</option>
                  {admins.map((a) => (
                    <option key={a.id} value={a.id}>{a.firstName} {a.lastName}</option>
                  ))}
                </select>
              </div>

              {saving && <p className="text-xs text-muted">Saving...</p>}
            </div>
          </div>

          {/* Veteran Info */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-5">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <User className="w-4 h-4" /> Veteran Info
            </h2>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted">Name:</span> {caseData.veteran.firstName} {caseData.veteran.lastName}</p>
              <p><span className="text-muted">Email:</span> {caseData.veteran.email}</p>
              {caseData.veteran.phone && <p><span className="text-muted">Phone:</span> {caseData.veteran.phone}</p>}
            </div>
          </div>

          {/* Appointments */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-5">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Appointments ({caseData.appointments.length})
            </h2>
            {caseData.appointments.length === 0 ? (
              <p className="text-sm text-muted">No appointments linked</p>
            ) : (
              <div className="space-y-2">
                {caseData.appointments.map((apt) => (
                  <div key={apt.id} className="text-sm p-2 bg-gray-50 rounded-lg">
                    <p className="font-medium">{apt.date} at {apt.startTime}</p>
                    <p className="text-xs text-muted">{apt.appointmentType.replace(/_/g, " ")} — {apt.status}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-5">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Timeline
            </h2>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted">Created:</span> {new Date(caseData.createdAt).toLocaleDateString()}</p>
              <p><span className="text-muted">Updated:</span> {new Date(caseData.updatedAt).toLocaleDateString()}</p>
              {caseData.closedAt && (
                <p><span className="text-muted">Closed:</span> {new Date(caseData.closedAt).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
