"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Eye,
  EyeOff,
  Edit,
  ClipboardList,
  BarChart3,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface FormTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  serviceType: string;
  isActive: boolean;
  version: number;
  createdAt: string;
  _count: { submissions: number };
}

const serviceTypeLabels: Record<string, string> = {
  va_disability: "VA Disability",
  property_tax_abatement: "Property Tax Abatement",
  pension: "Benefits / Pension",
  burial: "Burial",
  general: "General",
};

export default function AdminFormsPage() {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = () => {
    fetch("/api/forms")
      .then((r) => r.json())
      .then((data) => {
        setTemplates(data.templates || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchTemplates(); }, []);

  const toggleActive = async (slug: string, isActive: boolean) => {
    await fetch(`/api/forms/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    fetchTemplates();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Form Templates</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage fillable forms that veterans can submit online.
          </p>
        </div>
        <Link
          href="/admin/forms/new"
          className="inline-flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Template
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <ClipboardList className="w-4 h-4" />
            Total Templates
          </div>
          <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            Active
          </div>
          <p className="text-2xl font-bold text-green-700">
            {templates.filter((t) => t.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            Total Submissions
          </div>
          <p className="text-2xl font-bold text-blue-800">
            {templates.reduce((sum, t) => sum + t._count.submissions, 0)}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Template
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Service Type
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Status
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Submissions
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Version
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {templates.map((template) => (
              <tr key={template.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-800" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{template.name}</p>
                      <p className="text-xs text-gray-400">{template.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {serviceTypeLabels[template.serviceType] || template.serviceType}
                </td>
                <td className="px-4 py-3 text-center">
                  {template.isActive ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      <XCircle className="w-3 h-3" /> Inactive
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-600">
                  {template._count.submissions}
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-400">
                  v{template.version}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/forms/${template.id}`}
                      className="p-1.5 text-gray-400 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => toggleActive(template.slug, template.isActive)}
                      className={`p-1.5 rounded transition-colors ${
                        template.isActive
                          ? "text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                          : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                      }`}
                      title={template.isActive ? "Deactivate" : "Activate"}
                    >
                      {template.isActive ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <Link
                      href={`/forms/${template.slug}`}
                      target="_blank"
                      className="p-1.5 text-gray-400 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      title="Preview Form"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
