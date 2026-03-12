"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  GripVertical,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface FormField {
  name: string;
  label: string;
  type: "text" | "textarea" | "date" | "number" | "select";
  required: boolean;
  options?: string[];
  maxLength?: number;
}

interface FormTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  serviceType: string;
  fields: string; // JSON string
  isActive: boolean;
  version: number;
}

const serviceTypes = [
  { value: "va_disability", label: "VA Disability" },
  { value: "property_tax_abatement", label: "Property Tax Abatement" },
  { value: "pension", label: "Benefits / Pension" },
  { value: "burial", label: "Burial" },
  { value: "general", label: "General" },
];

const fieldTypes = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Text Area" },
  { value: "date", label: "Date" },
  { value: "number", label: "Number" },
  { value: "select", label: "Dropdown" },
];

export default function AdminFormEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === "new";

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [serviceType, setServiceType] = useState("general");
  const [isActive, setIsActive] = useState(true);
  const [fields, setFields] = useState<FormField[]>([]);

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isNew) return;
    // Load existing template - need to get by ID via the list endpoint
    fetch("/api/forms")
      .then((r) => r.json())
      .then((data) => {
        const tpl = (data.templates as FormTemplate[]).find((t) => t.id === id);
        if (tpl) {
          setName(tpl.name);
          setSlug(tpl.slug);
          setDescription(tpl.description || "");
          setServiceType(tpl.serviceType);
          setIsActive(tpl.isActive);
          setFields(JSON.parse(tpl.fields));
        } else {
          setError("Template not found");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load template");
        setLoading(false);
      });
  }, [id, isNew]);

  const autoSlug = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const addField = () => {
    setFields((prev) => [
      ...prev,
      {
        name: `field_${Date.now()}`,
        label: "",
        type: "text",
        required: false,
      },
    ]);
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    setFields((prev) =>
      prev.map((f, i) => {
        if (i !== index) return f;
        const updated = { ...f, ...updates };
        // Auto-generate name from label
        if (updates.label !== undefined) {
          updated.name = updates.label
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, "")
            .replace(/\s+/g, "_")
            .replace(/_+/g, "_")
            .replace(/^_|_$/g, "");
        }
        return updated;
      })
    );
  };

  const removeField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const moveField = (from: number, direction: "up" | "down") => {
    const to = direction === "up" ? from - 1 : from + 1;
    if (to < 0 || to >= fields.length) return;
    setFields((prev) => {
      const next = [...prev];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(false);

    if (!name.trim() || !slug.trim() || fields.length === 0) {
      setError("Name, slug, and at least one field are required.");
      return;
    }

    // Validate fields
    for (const field of fields) {
      if (!field.label.trim()) {
        setError("All fields must have a label.");
        return;
      }
      if (field.type === "select" && (!field.options || field.options.length === 0)) {
        setError(`Dropdown field "${field.label}" needs at least one option.`);
        return;
      }
    }

    setSaving(true);

    try {
      if (isNew) {
        const res = await fetch("/api/forms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            slug,
            description: description || null,
            serviceType,
            fields,
            isActive,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to create template");
        }
        setSuccess(true);
        setTimeout(() => router.push("/admin/forms"), 1500);
      } else {
        const res = await fetch(`/api/forms/${slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            description: description || null,
            fields,
            isActive,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to update template");
        }
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
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
        <div className="flex items-center gap-3">
          <Link
            href="/admin/forms"
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isNew ? "New Form Template" : "Edit Form Template"}
            </h1>
            <p className="text-gray-500 text-sm">
              {isNew ? "Create a new fillable form." : `Editing: ${name}`}
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-blue-800 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-900 disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isNew ? "Create Template" : "Save Changes"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <p className="text-sm text-green-700">
            {isNew ? "Template created! Redirecting..." : "Changes saved successfully."}
          </p>
        </div>
      )}

      {/* Template Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Template Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (isNew) setSlug(autoSlug(e.target.value));
              }}
              placeholder="e.g., VA Disability Claim Intake"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug * {!isNew && <span className="text-gray-400">(read-only)</span>}
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => isNew && setSlug(autoSlug(e.target.value))}
              readOnly={!isNew}
              className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !isNew ? "bg-gray-50" : ""
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {serviceTypes.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-4 pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Active (visible to veterans)</span>
            </label>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief description of this form and its purpose"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">
            Form Fields ({fields.length})
          </h2>
          <button
            onClick={addField}
            className="inline-flex items-center gap-1 text-sm text-blue-800 hover:text-blue-900 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Field
          </button>
        </div>

        {fields.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p>No fields yet. Click &quot;Add Field&quot; to start building the form.</p>
          </div>
        )}

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-white transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-1 pt-1">
                  <button
                    onClick={() => moveField(index, "up")}
                    disabled={index === 0}
                    className="text-gray-300 hover:text-gray-600 disabled:opacity-30"
                    title="Move up"
                  >
                    <GripVertical className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 grid md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Label *</label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(index, { label: e.target.value })}
                      placeholder="Field label"
                      className="w-full rounded border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {field.name && (
                      <p className="text-xs text-gray-400 mt-0.5">name: {field.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                    <select
                      value={field.type}
                      onChange={(e) =>
                        updateField(index, { type: e.target.value as FormField["type"] })
                      }
                      className="w-full rounded border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {fieldTypes.map((ft) => (
                        <option key={ft.value} value={ft.value}>
                          {ft.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end gap-3">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(index, { required: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-xs text-gray-600">Required</span>
                    </label>
                    <button
                      onClick={() => removeField(index)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Remove field"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Dropdown options */}
              {field.type === "select" && (
                <div className="mt-3 ml-7">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Options (one per line)
                  </label>
                  <textarea
                    value={(field.options || []).join("\n")}
                    onChange={(e) =>
                      updateField(index, {
                        options: e.target.value.split("\n").filter((o) => o.trim()),
                      })
                    }
                    rows={3}
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                    className="w-full rounded border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              )}

              {/* Max length for text fields */}
              {field.type === "text" && (
                <div className="mt-2 ml-7">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Max Length (optional)
                  </label>
                  <input
                    type="number"
                    value={field.maxLength || ""}
                    onChange={(e) =>
                      updateField(index, {
                        maxLength: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    placeholder="No limit"
                    className="w-32 rounded border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {fields.length > 0 && (
          <button
            onClick={addField}
            className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-800 transition-colors flex items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Another Field
          </button>
        )}
      </div>
    </div>
  );
}
