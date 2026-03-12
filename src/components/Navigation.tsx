"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  X,
  Home,
  Shield,
  FileText,
  Calendar,
  Search,
  Upload,
  Phone,
  Flag,
  LogIn,
  LogOut,
  Settings,
  User,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/services", label: "Services", icon: Shield },
  { href: "/apply", label: "Apply Online", icon: FileText },
  { href: "/forms", label: "Forms", icon: FileText },
  { href: "/appointments", label: "Appointments", icon: Calendar },
  { href: "/status", label: "Track Status", icon: Search },
  { href: "/documents", label: "Documents", icon: Upload },
  { href: "/contact", label: "Contact", icon: Phone },
];

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  return (
    <>
      {/* Top bar */}
      <div className="bg-primary-dark text-white text-sm py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span>Town of Billerica, MA — Veterans Services Portal</span>
          <div className="hidden md:flex items-center gap-4">
            <a href="tel:978-671-0968" className="hover:text-accent transition">
              (978) 671-0968
            </a>
            <a
              href="mailto:vso@billerica.gov"
              className="hover:text-accent transition"
            >
              vso@billerica.gov
            </a>
            <span className="text-white/30">|</span>
            {session ? (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {session.user?.name}
                </span>
                {isAdmin && (
                  <Link href="/admin" className="hover:text-accent transition flex items-center gap-1">
                    <Settings className="w-3 h-3" /> Admin
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="hover:text-accent transition flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" /> Sign Out
                </button>
              </div>
            ) : (
              <Link href="/login" className="hover:text-accent transition flex items-center gap-1">
                <LogIn className="w-3 h-3" /> Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="bg-primary text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="bg-accent rounded-full p-2">
                <Flag className="w-6 h-6 text-primary-dark" />
              </div>
              <div>
                <div className="font-bold text-lg leading-tight">
                  Billerica Veterans
                </div>
                <div className="text-xs text-blue-200 leading-tight">
                  Service Portal
                </div>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-white/20 text-accent-light"
                        : "hover:bg-white/10 text-white/90 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition"
            >
              {mobileOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile nav */}
          {mobileOpen && (
            <div className="lg:hidden pb-4 fade-in">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-white/20 text-accent-light"
                        : "hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
              <div className="mt-3 pt-3 border-t border-white/20 px-4">
                <a
                  href="tel:978-671-0968"
                  className="block py-1 text-sm text-blue-200 hover:text-white"
                >
                  (978) 671-0968
                </a>
                <a
                  href="mailto:vso@billerica.gov"
                  className="block py-1 text-sm text-blue-200 hover:text-white"
                >
                  vso@billerica.gov
                </a>
                <div className="mt-2 pt-2 border-t border-white/20">
                  {session ? (
                    <>
                      <div className="py-1 text-sm text-blue-200 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {session.user?.name}
                      </div>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 py-2 text-sm text-blue-200 hover:text-white"
                        >
                          <Settings className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }); }}
                        className="flex items-center gap-2 py-2 text-sm text-blue-200 hover:text-white"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 py-2 text-sm text-accent hover:text-white font-medium"
                    >
                      <LogIn className="w-4 h-4" /> Sign In
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
