"use client";
import { useState } from "react";
import { Search, Clock, CheckCircle, AlertCircle, FileText, Calendar, ArrowRight, XCircle, Loader2 } from "lucide-react";

const demoApplications = [
  {
    id: "BVS-M2X8KP-A3FQ",
    service: "Chapter 115 Financial Assistance",
    submitted: "2026-02-15",
    status: "in-review",
    statusLabel: "Under Review",
    updates: [
      { date: "2026-02-15", text: "Application submitted online", status: "complete" },
      { date: "2026-02-17", text: "Application received and logged", status: "complete" },
      { date: "2026-02-20", text: "Documents verified by staff", status: "complete" },
      { date: "2026-02-25", text: "Under review by Veterans Service Officer", status: "current" },
      { date: "", text: "Final determination", status: "pending" },
      { date: "", text: "Notification sent to applicant", status: "pending" },
    ],
  },
  {
    id: "BVS-K9P4TN-B7WE",
    service: "Property Tax Abatement",
    submitted: "2026-01-20",
    status: "approved",
    statusLabel: "Approved",
    updates: [
      { date: "2026-01-20", text: "Application submitted online", status: "complete" },
      { date: "2026-01-22", text: "Application received and logged", status: "complete" },
      { date: "2026-01-28", text: "Documents verified", status: "complete" },
      { date: "2026-02-05", text: "Reviewed by VSO Donnie Jarvis", status: "complete" },
      { date: "2026-02-10", text: "Approved - Forwarded to Tax Assessor", status: "complete" },
      { date: "2026-02-12", text: "Notification sent to applicant", status: "complete" },
    ],
  },
  {
    id: "APT-R5M2KN-C8XP",
    service: "Appointment - VA Disability Claims",
    submitted: "2026-03-05",
    status: "scheduled",
    statusLabel: "Scheduled",
    updates: [
      { date: "2026-03-05", text: "Appointment request submitted", status: "complete" },
      { date: "2026-03-05", text: "Appointment confirmed for March 15, 2026 at 10:00 AM", status: "complete" },
      { date: "", text: "Appointment date: March 15, 2026", status: "pending" },
    ],
  },
];

export default function StatusPage() {
  const [trackingId, setTrackingId] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [results, setResults] = useState<typeof demoApplications>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = () => {
    setSearching(true);
    setTimeout(() => {
      if (trackingId.trim() === "") {
        setResults(demoApplications);
      } else {
        const found = demoApplications.filter((a) =>
          a.id.toLowerCase().includes(trackingId.toLowerCase())
        );
        setResults(found);
      }
      setSearchPerformed(true);
      setSearching(false);
    }, 800);
  };

  const statusColors: Record<string, string> = {
    "in-review": "bg-blue-100 text-blue-700 border-blue-200",
    approved: "bg-green-100 text-green-700 border-green-200",
    denied: "bg-red-100 text-red-700 border-red-200",
    scheduled: "bg-purple-100 text-purple-700 border-purple-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
  };

  return (
    <div className="fade-in">
      <div className="bg-gradient-to-r from-primary to-primary-light text-white py-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-6 h-6 text-accent" />
            <span className="text-accent font-medium">Application Tracker</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Track Your Application</h1>
          <p className="text-blue-100">Enter your confirmation number to check the status of your application or appointment.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Box */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Enter confirmation number (e.g., BVS-M2X8KP-A3FQ) or leave blank for demo"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-light transition font-medium text-sm disabled:opacity-50 flex items-center gap-2"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </div>
          <p className="text-xs text-muted mt-2">
            Tip: Leave the search blank and click Search to see demo applications
          </p>
        </div>

        {/* Results */}
        {searchPerformed && (
          <div className="mt-8 space-y-6">
            {results.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
                <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-2">No Applications Found</h3>
                <p className="text-sm text-muted mb-4">No applications match that confirmation number.</p>
                <p className="text-sm text-muted">
                  If you believe this is an error, please contact us at{" "}
                  <a href="tel:978-671-0968" className="text-primary-light underline">(978) 671-0968</a>
                </p>
              </div>
            ) : (
              results.map((app) => (
                <div key={app.id} className="bg-white rounded-xl shadow-sm border border-border overflow-hidden slide-in">
                  {/* Header */}
                  <div className="p-6 border-b border-border">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs text-muted mb-1">Confirmation Number</p>
                        <p className="font-bold text-lg font-mono text-primary">{app.id}</p>
                        <p className="text-sm text-muted mt-1">{app.service}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[app.status] || ""}`}>
                          {app.statusLabel}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-3 text-xs text-muted">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Submitted: {app.submitted}</span>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="p-6">
                    <h4 className="font-semibold text-primary mb-4">Progress Timeline</h4>
                    <div className="space-y-4">
                      {app.updates.map((update, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                              update.status === "complete" ? "bg-green-100" :
                              update.status === "current" ? "bg-blue-100 ring-4 ring-blue-50" :
                              "bg-gray-100"
                            }`}>
                              {update.status === "complete" ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : update.status === "current" ? (
                                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                              ) : (
                                <Clock className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            {i < app.updates.length - 1 && (
                              <div className={`w-0.5 flex-1 mt-1 ${update.status === "complete" ? "bg-green-200" : "bg-gray-200"}`} />
                            )}
                          </div>
                          <div className="pb-4">
                            <p className={`text-sm font-medium ${update.status === "pending" ? "text-muted" : "text-foreground"}`}>
                              {update.text}
                            </p>
                            {update.date && (
                              <p className="text-xs text-muted mt-0.5">{update.date}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
