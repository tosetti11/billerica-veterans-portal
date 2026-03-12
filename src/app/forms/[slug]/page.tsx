"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  CheckCircle,
  AlertCircle,
  FileText,
  Loader2,
  Info,
} from "lucide-react";

interface FormField {
  name: string;
  label: string;
  type: "text" | "textarea" | "date" | "number" | "select";
  required: boolean;
  options?: string[];
  maxLength?: number;
  placeholder?: string;
}

interface FormTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  serviceType: string;
  fields: FormField[];
  version: number;
}

export default function FormFillPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { data: session, status: sessionStatus } = useSession();

  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`/api/forms/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Form not found");
        return r.json();
      })
      .then((data) => {
        setTemplate(data.template);
        // Initialize form data with empty values
        const initial: Record<string, string> = {};
        for (const field of data.template.fields) {
          initial[field.name] = "";
        }
        setFormData(initial);
        setLoading(false);
      })
      .catch(() => {
        setError("Form not found or no longer available.");
        setLoading(false);
      });
  }, [slug]);

  // Redirect if not logged in
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push(`/login?callbackUrl=/forms/${slug}`);
    }
  }, [sessionStatus, router, slug]);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error on change
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    if (!template) return false;
    const errors: Record<string, string> = {};
    for (const field of template.fields) {
      const value = formData[field.name]?.trim() || "";
      if (field.required && !value) {
        errors[field.name] = `${field.label} is required`;
      }
      if (field.maxLength && value.length > field.maxLength) {
        errors[field.name] = `Maximum ${field.maxLength} characters`;
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/forms/${slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formData }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit form");
      }

      const result = await res.json();
      setCaseId(result.caseId);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const completedCount = template
    ? template.fields.filter((f) => (formData[f.name]?.trim() || "").length > 0).length
    : 0;
  const totalFields = template?.fields.length || 0;
  const requiredCount = template
    ? template.fields.filter((f) => f.required).length
    : 0;
  const completedRequired = template
    ? template.fields.filter((f) => f.required && (formData[f.name]?.trim() || "").length > 0).length
    : 0;

  if (loading || sessionStatus === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800" />
      </div>
    );
  }

  if (error && !template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Form Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/forms"
            className="inline-flex items-center gap-2 text-blue-800 hover:text-blue-900 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Forms
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center max-w-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Submitted Successfully</h2>
          <p className="text-gray-600 mb-2">
            Your <strong>{template?.name}</strong> has been submitted and a case has been created.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            The Veterans Service Officer will review your submission and follow up with you.
            You can track the status of your case in the portal.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/status"
              className="inline-flex items-center justify-center gap-2 bg-blue-800 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-900 transition-colors"
            >
              View My Cases
            </Link>
            <Link
              href="/forms"
              className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Submit Another Form
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link
            href="/forms"
            className="inline-flex items-center gap-1 text-blue-200 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Forms
          </Link>
          <div className="flex items-center gap-3">
            <FileText className="w-7 h-7" />
            <h1 className="text-2xl font-bold">{template?.name}</h1>
          </div>
          {template?.description && (
            <p className="text-blue-200 mt-2 max-w-2xl">{template.description}</p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Progress sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Progress</h3>

              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Completed</span>
                  <span>{completedCount}/{totalFields}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-800 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${totalFields > 0 ? (completedCount / totalFields) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>
                  <span className="font-medium text-gray-700">{completedRequired}</span> of{" "}
                  <span className="font-medium text-gray-700">{requiredCount}</span> required fields
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-500">
                    Fields marked with <span className="text-red-500 font-bold">*</span> are required.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {template?.fields.map((field, idx) => (
                <div
                  key={field.name}
                  className="bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-300 transition-colors"
                >
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  {field.type === "text" && (
                    <input
                      id={field.name}
                      type="text"
                      value={formData[field.name] || ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      maxLength={field.maxLength}
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                      className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors[field.name]
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                  )}

                  {field.type === "number" && (
                    <input
                      id={field.name}
                      type="number"
                      value={formData[field.name] || ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                      className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors[field.name]
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                  )}

                  {field.type === "date" && (
                    <input
                      id={field.name}
                      type="date"
                      value={formData[field.name] || ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors[field.name]
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                  )}

                  {field.type === "select" && (
                    <select
                      id={field.name}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors[field.name]
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select {field.label.toLowerCase()}</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}

                  {field.type === "textarea" && (
                    <textarea
                      id={field.name}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      rows={4}
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                      className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y ${
                        validationErrors[field.name]
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                  )}

                  {validationErrors[field.name] && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors[field.name]}
                    </p>
                  )}

                  {field.maxLength && (
                    <p className="mt-1 text-xs text-gray-400 text-right">
                      {(formData[field.name] || "").length}/{field.maxLength}
                    </p>
                  )}
                </div>
              ))}

              {/* Submit */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-start gap-3 mb-4">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    By submitting this form, a case will be created and assigned to the Veterans
                    Service Officer for review. You will be able to track its progress in the{" "}
                    <Link href="/status" className="text-blue-800 underline font-medium">
                      Case Status
                    </Link>{" "}
                    section.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit Form
                      </>
                    )}
                  </button>
                  <Link
                    href="/forms"
                    className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
