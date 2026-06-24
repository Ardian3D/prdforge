"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, Key, BarChart3, Shield, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const ADMIN_LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true, color: "text-blue-500" },
  { href: "/admin/users", label: "Users", icon: Users, color: "text-green-500" },
  { href: "/admin/api-keys", label: "API Keys", icon: Key, color: "text-amber-500" },
  { href: "/admin/stats", label: "Statistics", icon: BarChart3, color: "text-purple-500" },
  { href: "/admin/audit", label: "Fraud Log", icon: Shield, color: "text-red-500" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-sidebar border-r shadow-sm shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b bg-gradient-to-r from-destructive/5 to-transparent">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-destructive to-red-500 flex items-center justify-center shadow-lg shadow-destructive/20">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm">Admin Panel</span>
            <p className="text-[10px] text-muted-foreground leading-tight">Master Access</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {ADMIN_LINKS.map((link) => {
            const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-destructive/10 text-destructive font-semibold"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                )}
              >
                {isActive && <motion.div layoutId="admin-nav-active" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-destructive rounded-full" />}
                <link.icon className={cn("h-4 w-4 transition-colors", isActive ? link.color : "text-muted-foreground group-hover:text-foreground")} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t bg-muted/10 space-y-2">
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground rounded-xl text-xs" asChild>
            <Link href="/dashboard"><ArrowLeft className="h-3.5 w-3.5 mr-2" />Back to Dashboard</Link>
          </Button>
          <ThemeToggle />
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b flex items-center justify-between px-6 shrink-0 bg-background/80 backdrop-blur-sm">
          <div className="lg:hidden flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Shield className="h-3.5 w-3.5 text-destructive" />
            </div>
            <span className="font-bold text-sm">Admin</span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              System Online
            </div>
            <div className="h-8 w-8 rounded-xl bg-destructive/10 flex items-center justify-center ring-2 ring-destructive/20">
              <Shield className="h-4 w-4 text-destructive" />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
