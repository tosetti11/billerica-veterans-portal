"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

type Veteran = { id: string; firstName: string; lastName: string; email: string };

const caseTypes = [
  { value: "va_disability", label: "VA Disability Claim" },
  { value: "property_tax_abatement", label: "Property Tax Abatement" },
  { value: "pension", label: "Pension Benefits" },
  { value: "education", label: "Education Benefits" },
  { value: "healthcare", label: "Healthcare" },
  { value: "employment", label: "Employment Services" },
  { value: "housing", label: "Housing Assistance" },
  { value: "burial", label: "Burial Benefits" },
  { value: "other", label: "Other" },
];

export default function NewCasePage() {
  const router = useRouter();
  const [veterans, setVeterans] = useState<Veteran[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    veteranId: "",
    caseType: "va_disability",
    title: "",
    description: "",
    priority: "normal",
  });

  useEffect(() => {
    fetch("/api/admin/veterans")
      .then((r) => r.json())
      .then(setVeterans)
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/admin/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const newCase = await res.json();
      router.push(`/admin/cases/${newCase.id}`);
    } else {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/cases" className="p-2 rounded-lg hover:bg-gray-100 transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-foreground">Create New Case</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-border p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Veteran</label>
          <select
            value={form.veteranId}
            onChange={(e) => updateField("veteranId", e.target.value)}
            required
            className="w-full px-3 py-2.5 rounded-lg border border-border"
          >
            <option value="">Select a veteran...</option>
            {veterans.map((v) => (
              <option key={v.id} value={v.id}>
                {v.firstName} {v.lastName} ({v.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Case Type</label>
          <select
            value={form.caseType}
            onChange={(e) => updateField("caseType", e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-border"
          >
            {caseTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            required
            placeholder="Brief description of the case"
            className="w-full px-3 py-2.5 rounded-lg border border-border"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            required
            rows={4}
            placeholder="Detailed description of the veteran's needs and situation..."
            className="w-full px-3 py-2.5 rounded-lg border border-border resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select
            value={form.priority}
            onChange={(e) => updateField("priority", e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-border"
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <Link
            href="/admin/cases"
            className="flex-1 py-2.5 border border-border rounded-lg font-medium text-center hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-light transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {loading ? "Creating..." : "Create Case"}
          </button>
        </div>
      </form>
    </div>
  );
}
