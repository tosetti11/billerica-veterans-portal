import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Briefcase,
  FileText,
  Users,
  MessageSquare,
  Settings,
  Flag,
  ArrowLeft,
  ClipboardList,
} from "lucide-react";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/cases", label: "Cases", icon: Briefcase },
  { href: "/admin/appointments", label: "Appointments", icon: Calendar },
  { href: "/admin/forms", label: "Form Templates", icon: FileText },
  { href: "/admin/submissions", label: "Submissions", icon: ClipboardList },
  { href: "/admin/veterans", label: "Veterans", icon: Users },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user?.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-[calc(100vh-120px)]">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-dark text-white shrink-0 hidden md:block">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="bg-accent rounded-full p-1.5">
              <Flag className="w-4 h-4 text-primary-dark" />
            </div>
            <div>
              <div className="font-bold text-sm">VSO Admin Panel</div>
              <div className="text-xs text-blue-200">{session.user?.name}</div>
            </div>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {adminNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-white/10 transition text-white/80 hover:text-white"
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 mt-auto border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portal
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 bg-gray-50 overflow-auto">
        {children}
      </div>
    </div>
  );
}
