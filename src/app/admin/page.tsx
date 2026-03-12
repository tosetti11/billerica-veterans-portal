import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  Briefcase,
  Calendar,
  Users,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";

export default async function AdminDashboard() {
  const [
    totalCases,
    openCases,
    urgentCases,
    todayAppointments,
    totalVeterans,
    unreadMessages,
    recentCases,
    upcomingAppointments,
  ] = await Promise.all([
    prisma.case.count(),
    prisma.case.count({ where: { status: { in: ["open", "in_progress", "pending_documents", "under_review"] } } }),
    prisma.case.count({ where: { priority: "urgent" } }),
    prisma.appointment.count({
      where: {
        date: new Date().toISOString().split("T")[0],
        status: { in: ["scheduled", "confirmed"] },
      },
    }),
    prisma.user.count({ where: { role: "veteran" } }),
    prisma.contactMessage.count({ where: { status: "unread" } }),
    prisma.case.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { veteran: true },
    }),
    prisma.appointment.findMany({
      where: {
        date: { gte: new Date().toISOString().split("T")[0] },
        status: { in: ["scheduled", "confirmed"] },
      },
      take: 5,
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      include: { veteran: true },
    }),
  ]);

  const stats = [
    { label: "Open Cases", value: openCases, icon: Briefcase, color: "bg-blue-500", href: "/admin/cases" },
    { label: "Today's Appointments", value: todayAppointments, icon: Calendar, color: "bg-green-500", href: "/admin/appointments" },
    { label: "Urgent Cases", value: urgentCases, icon: AlertTriangle, color: "bg-red-500", href: "/admin/cases?priority=urgent" },
    { label: "Registered Veterans", value: totalVeterans, icon: Users, color: "bg-purple-500", href: "/admin/veterans" },
    { label: "Total Cases", value: totalCases, icon: TrendingUp, color: "bg-indigo-500", href: "/admin/cases" },
    { label: "Unread Messages", value: unreadMessages, icon: MessageSquare, color: "bg-yellow-500", href: "/admin/messages" },
  ];

  const statusColors: Record<string, string> = {
    open: "bg-blue-100 text-blue-700",
    in_progress: "bg-yellow-100 text-yellow-700",
    pending_documents: "bg-orange-100 text-orange-700",
    under_review: "bg-purple-100 text-purple-700",
    approved: "bg-green-100 text-green-700",
    denied: "bg-red-100 text-red-700",
    closed: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted mt-1">Veterans Service Officer administration panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-xl p-5 shadow-sm border border-border hover:shadow-md transition group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-xl text-white group-hover:scale-110 transition`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cases */}
        <div className="bg-white rounded-xl shadow-sm border border-border">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Recent Cases
            </h2>
            <Link href="/admin/cases" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentCases.length === 0 ? (
              <div className="p-8 text-center text-muted">No cases yet</div>
            ) : (
              recentCases.map((c) => (
                <Link
                  key={c.id}
                  href={`/admin/cases/${c.id}`}
                  className="block p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-foreground">{c.title}</p>
                      <p className="text-xs text-muted mt-0.5">
                        {c.caseNumber} — {c.veteran.firstName} {c.veteran.lastName}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[c.status] || "bg-gray-100 text-gray-700"}`}>
                      {c.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-border">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" /> Upcoming Appointments
            </h2>
            <Link href="/admin/appointments" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {upcomingAppointments.length === 0 ? (
              <div className="p-8 text-center text-muted">No upcoming appointments</div>
            ) : (
              upcomingAppointments.map((apt) => (
                <div key={apt.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        {apt.veteran.firstName} {apt.veteran.lastName}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {apt.appointmentType.replace(/_/g, " ")} — {apt.date} at {apt.startTime}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="w-3 h-3" />
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
