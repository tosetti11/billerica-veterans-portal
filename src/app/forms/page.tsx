"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  FileText,
  Shield,
  Home,
  DollarSign,
  Heart,
  ArrowRight,
  ClipboardList,
  CheckCircle,
  Clock,
  AlertCircle,
  LogIn,
} from "lucide-react";

interface FormTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  serviceType: string;
  isActive: boolean;
  version: number;
  _count: { submissions: number };
}

const serviceTypeIcons: Record<string, typeof FileText> = {
  va_disability: Shield,
  property_tax_abatement: Home,
  pension: DollarSign,
  burial: Heart,
};

const serviceTypeLabels: Record<string, string> = {
  va_disability: "VA Disability",
  property_tax_abatement: "Property Tax",
  pension: "Benefits",
  burial: "Burial",
};

const serviceTypeColors: Record<string, string> = {
  va_disability: "bg-blue-100 text-blue-800 border-blue-200",
  property_tax_abatement: "bg-emerald-100 text-emerald-800 border-emerald-200",
  pension: "bg-amber-100 text-amber-800 border-amber-200",
  burial: "bg-purple-100 text-purple-800 border-purple-200",
};

export default function FormsPage() {
  const { data: session, status } = useSession();
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/forms")
      .then((r) => r.json())
      .then((data) => {
        setTemplates(data.templates || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load forms");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <ClipboardList className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Veterans Service Forms</h1>
          </div>
          <p className="text-blue-200 text-lg max-w-2xl">
            Complete and submit forms online to begin your benefits application.
            Forms are reviewed by the Veterans Service Officer and attached to your case.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Login prompt */}
        {status !== "loading" && !session && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800">Sign in required to submit forms</p>
              <p className="text-amber-700 text-sm mt-1">
                You can browse the forms below, but you&apos;ll need to{" "}
                <Link href="/login" className="underline font-medium">
                  sign in
                </Link>{" "}
                or{" "}
                <Link href="/register" className="underline font-medium">
                  create an account
                </Link>{" "}
                to fill and submit them.
              </p>
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: "1", title: "Select a Form", desc: "Choose the form for the service you need", icon: ClipboardList },
              { step: "2", title: "Fill It Out", desc: "Complete all required fields online", icon: FileText },
              { step: "3", title: "Submit", desc: "Your submission creates or links to a case", icon: CheckCircle },
              { step: "4", title: "Review", desc: "The VSO reviews your submission and follows up", icon: Clock },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-800 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {/* Form cards */}
        {templates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No forms are currently available.</p>
            <p className="text-gray-400 text-sm mt-1">Check back later or contact the VSO office.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {templates.map((template) => {
              const Icon = serviceTypeIcons[template.serviceType] || FileText;
              const colorClass = serviceTypeColors[template.serviceType] || "bg-gray-100 text-gray-800 border-gray-200";
              const label = serviceTypeLabels[template.serviceType] || template.serviceType;

              return (
                <div
                  key={template.id}
                  className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-blue-800" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{template.name}</h3>
                          <span className={`inline-block text-xs px-2 py-0.5 rounded-full border mt-1 ${colorClass}`}>
                            {label}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">v{template.version}</span>
                    </div>

                    {template.description && (
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        {template.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      {session ? (
                        <Link
                          href={`/forms/${template.slug}`}
                          className="inline-flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900 transition-colors"
                        >
                          Fill Out Form
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      ) : (
                        <Link
                          href="/login"
                          className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                          <LogIn className="w-4 h-4" />
                          Sign In to Fill
                        </Link>
                      )}
                      <span className="text-xs text-gray-400">
                        {template._count.submissions} submission{template._count.submissions !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Additional info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">Need Help?</h3>
          <p className="text-blue-800 text-sm">
            If you need assistance completing any of these forms, you can{" "}
            <Link href="/appointments" className="underline font-medium">
              schedule an appointment
            </Link>{" "}
            with the Veterans Service Officer or{" "}
            <Link href="/contact" className="underline font-medium">
              send a message
            </Link>{" "}
            for guidance. The VSO can walk you through the process in person or over the phone.
          </p>
        </div>
      </div>
    </div>
  );
}
