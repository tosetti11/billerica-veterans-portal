"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  Upload, FileText, Loader2, AlertCircle, CheckCircle, Trash2, File, Image, FileSpreadsheet
} from "lucide-react";

type DocRecord = {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  category: string;
  description: string | null;
  uploadedAt: string;
  case: { caseNumber: string; title: string } | null;
};

type CaseOption = { id: string; caseNumber: string; title: string };

const categories = [
  { value: "dd214", label: "DD-214 (Discharge Papers)" },
  { value: "va_rating", label: "VA Rating Decision" },
  { value: "medical", label: "Medical Records" },
  { value: "financial", label: "Financial Documents" },
  { value: "identification", label: "ID / Personal Documents" },
  { value: "property", label: "Property Documents" },
  { value: "correspondence", label: "Correspondence" },
  { value: "other", label: "Other" },
];

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function FileIcon({ type }: { type: string }) {
  if (type.startsWith("image/")) return <Image className="w-5 h-5 text-purple-500" />;
  if (type.includes("spreadsheet") || type.includes("csv")) return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
  if (type.includes("pdf")) return <FileText className="w-5 h-5 text-red-500" />;
  return <File className="w-5 h-5 text-blue-500" />;
}

export default function DocumentsPage() {
  const { data: session, status: authStatus } = useSession();
  const [documents, setDocuments] = useState<DocRecord[]>([]);
  const [cases, setCases] = useState<CaseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("other");
  const [caseId, setCaseId] = useState("");
  const [description, setDescription] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    Promise.all([
      fetch("/api/documents").then((r) => r.json()),
      fetch("/api/cases").then((r) => r.json()),
    ]).then(([docData, caseData]) => {
      setDocuments(docData.documents || []);
      setCases((caseData.cases || []).map((c: CaseOption) => ({ id: c.id, caseNumber: c.caseNumber, title: c.title })));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [authStatus]);

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) { setError("Please select a file"); return; }

    setUploading(true);
    setError("");
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    if (caseId) formData.append("caseId", caseId);
    if (description) formData.append("description", description);

    try {
      const res = await fetch("/api/documents", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }
      const data = await res.json();
      setDocuments((prev) => [{ ...data.document, case: null }, ...prev]);
      setUploadSuccess(true);
      setShowUpload(false);
      setCategory("other");
      setCaseId("");
      setDescription("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

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
          <p className="text-amber-700 mb-6">Log in to upload and manage your documents.</p>
          <a href="/login" className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary-light transition font-medium text-sm">
            Log In / Register
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="bg-gradient-to-r from-primary to-primary-light text-white py-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-6 h-6 text-accent" />
            <span className="text-accent font-medium">Document Center</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">My Documents</h1>
          <p className="text-blue-100">Upload and manage documents for your benefit requests.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {uploadSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-4 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Document uploaded successfully!
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {/* Upload button */}
        <div className="flex justify-end mb-6">
          <button onClick={() => setShowUpload(!showUpload)}
            className="bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-light transition text-sm font-medium flex items-center gap-2">
            <Upload className="w-4 h-4" /> Upload Document
          </button>
        </div>

        {/* Upload form */}
        {showUpload && (
          <div className="bg-white rounded-xl shadow-sm border border-border p-6 mb-6">
            <h3 className="font-semibold text-primary mb-4">Upload a Document</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">File *</label>
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.xls,.xlsx,.csv,.txt"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
                <p className="text-xs text-muted mt-1">Max 10MB. PDF, DOC, images, spreadsheets.</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm">
                  {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Link to Case (optional)</label>
                <select value={caseId} onChange={(e) => setCaseId(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm">
                  <option value="">No specific case</option>
                  {cases.map((c) => <option key={c.id} value={c.id}>{c.caseNumber} - {c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (optional)</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm" placeholder="Brief description" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowUpload(false)} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleUpload} disabled={uploading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        )}

        {/* Documents list */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-border">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-500 mb-2">No Documents</h3>
            <p className="text-muted mb-4">Upload your DD-214, VA rating letter, or other benefit documents.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border divide-y divide-border">
            {documents.map((doc) => (
              <div key={doc.id} className="p-4 flex items-center gap-4">
                <FileIcon type={doc.fileType} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{doc.fileName}</p>
                  <div className="flex items-center gap-3 text-xs text-muted mt-0.5">
                    <span>{formatSize(doc.fileSize)}</span>
                    <span>{categories.find((c) => c.value === doc.category)?.label || doc.category}</span>
                    <span>{formatDate(doc.uploadedAt)}</span>
                  </div>
                  {doc.case && (
                    <p className="text-xs text-primary mt-0.5">Linked to: {doc.case.caseNumber}</p>
                  )}
                  {doc.description && (
                    <p className="text-xs text-muted mt-0.5">{doc.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Commonly Needed Documents</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                <li>DD-214 (Certificate of Release for all active duty periods)</li>
                <li>VA Disability Rating Decision Letter</li>
                <li>Current year property tax bill (for tax abatements)</li>
                <li>Income verification (for means-tested benefits)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
