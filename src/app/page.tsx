"use client";

import Link from "next/link";
import {
  Shield,
  FileText,
  Calendar,
  Search,
  Upload,
  Phone,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Users,
  Heart,
  Award,
  Star,
} from "lucide-react";

const quickActions = [
  {
    title: "Apply for Benefits",
    description: "Submit applications for Chapter 115, tax abatements, and more",
    href: "/apply",
    icon: FileText,
    color: "bg-blue-500",
  },
  {
    title: "Schedule Appointment",
    description: "Book a meeting with our Veterans Service Officers",
    href: "/appointments",
    icon: Calendar,
    color: "bg-green-500",
  },
  {
    title: "Track Application",
    description: "Check the status of your submitted applications",
    href: "/status",
    icon: Search,
    color: "bg-purple-500",
  },
  {
    title: "Upload Documents",
    description: "Submit required documents for your applications",
    href: "/documents",
    icon: Upload,
    color: "bg-orange-500",
  },
];

const announcements = [
  {
    type: "info",
    title: "Intent to File Reminder",
    message:
      "Call 1-800-827-1000 to submit an intent to file, which locks in benefits sooner. Valid for one year.",
  },
  {
    type: "success",
    title: "Welcome Home Bonus",
    message:
      "Massachusetts veterans may be eligible for Welcome Home Bonuses. Apply through our office.",
  },
  {
    type: "warning",
    title: "Appointment Required",
    message:
      "Please call or schedule online before visiting. Walk-ins may experience longer wait times.",
  },
];

const stats = [
  { label: "Veterans Served", value: "2,400+", icon: Users },
  { label: "Benefits Processed", value: "850+", icon: Award },
  { label: "Families Helped", value: "1,200+", icon: Heart },
  { label: "Years of Service", value: "75+", icon: Star },
];

export default function HomePage() {
  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary-light to-primary-dark text-white">
        <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-5" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-accent/20 text-accent px-3 py-1 rounded-full text-sm font-medium">
                Town of Billerica, MA
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Veterans Services
              <span className="block text-accent">Online Portal</span>
            </h1>
            <p className="text-lg text-blue-100 mb-8 leading-relaxed max-w-2xl">
              Your one-stop digital hub for all veteran benefits and services.
              Apply for benefits, schedule appointments, submit documents, and
              track your applications — all online.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/apply"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-primary-dark font-bold px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                Apply for Benefits <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-lg transition-all border border-white/20"
              >
                View All Services <Shield className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <Icon className="w-8 h-8 text-accent mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-bold text-primary">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-primary mb-8">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group bg-white rounded-xl shadow-sm border border-border p-6 hover:shadow-md hover:border-primary/20 transition-all"
              >
                <div
                  className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg text-primary mb-2">
                  {action.title}
                </h3>
                <p className="text-sm text-muted">{action.description}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary-light group-hover:text-primary transition">
                  Get Started <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Announcements & Office Info */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Announcements */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-primary mb-6">
              Important Announcements
            </h2>
            <div className="space-y-4">
              {announcements.map((ann, i) => (
                <div
                  key={i}
                  className={`border rounded-lg p-4 ${
                    ann.type === "info"
                      ? "bg-blue-50 border-blue-200"
                      : ann.type === "success"
                      ? "bg-green-50 border-green-200"
                      : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {ann.type === "info" ? (
                      <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                    ) : ann.type === "success" ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {ann.title}
                      </h4>
                      <p className="text-sm text-muted mt-1">{ann.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Office Info */}
          <div>
            <h2 className="text-2xl font-bold text-primary mb-6">
              Office Information
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-border p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-primary flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Office Hours
                  </h4>
                  <div className="mt-2 text-sm space-y-1 text-muted">
                    <div className="flex justify-between">
                      <span>Monday</span>
                      <span className="font-medium text-foreground">8:00 AM - 6:30 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tue - Thu</span>
                      <span className="font-medium text-foreground">8:30 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Friday</span>
                      <span className="font-medium text-foreground">8:00 AM - 12:30 PM</span>
                    </div>
                  </div>
                </div>
                <hr className="border-border" />
                <div>
                  <h4 className="font-semibold text-primary flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Contact
                  </h4>
                  <div className="mt-2 text-sm space-y-1">
                    <p className="text-muted">
                      Phone:{" "}
                      <a href="tel:978-671-0968" className="text-primary-light hover:underline">(978) 671-0968</a>
                    </p>
                    <p className="text-muted">Fax: (978) 670-5547</p>
                    <p className="text-muted">
                      Email:{" "}
                      <a href="mailto:vso@billerica.gov" className="text-primary-light hover:underline">vso@billerica.gov</a>
                    </p>
                  </div>
                </div>
                <hr className="border-border" />
                <Link
                  href="/appointments"
                  className="block text-center bg-primary text-white py-2.5 rounded-lg hover:bg-primary-light transition font-medium text-sm"
                >
                  Schedule an Appointment
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
