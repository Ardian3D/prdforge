"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, FileText, MessageSquare, CreditCard, Settings, LogOut, Plus, ChevronLeft, Menu, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";

const TIER_LABEL: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  probundle: "Pro Bundle",
};

const SIDEBAR_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true, color: "text-blue-500" },
  { href: "/dashboard/prds", label: "PRD Saya", icon: FileText, color: "text-green-500" },
  { href: "/dashboard/chat", label: "Riwayat Chat", icon: MessageSquare, color: "text-amber-500" },
  { href: "/dashboard/billing", label: "Tagihan", icon: CreditCard, color: "text-purple-500" },
  { href: "/dashboard/settings", label: "Pengaturan", icon: Settings, color: "text-muted-foreground" },
];

interface DashboardSidebarProps { open: boolean; onClose: () => void; }

export function DashboardSidebar({ open, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const initial = displayName.charAt(0).toUpperCase();
  const tierLabel = TIER_LABEL[user?.tier ?? "free"] ?? "Free";

  async function handleLogout() {
    await logout();
    router.push("/auth/login");
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: 0 }}
        className={cn("fixed top-0 left-0 z-50 h-full w-64 bg-sidebar border-r flex flex-col lg:translate-x-0 lg:static lg:z-auto", open ? "translate-x-0" : "-translate-x-full")}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight">PRD<span className="text-primary">Forge</span></span>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden rounded-xl" onClick={onClose}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* New PRD */}
        <div className="px-4 pt-4 pb-2">
          <Button className="w-full gap-2 rounded-xl font-semibold shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary/85 transition-all" asChild>
            <Link href="/dashboard/new"><Plus className="h-4 w-4" />Generate PRD Baru</Link>
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {SIDEBAR_LINKS.map((link) => {
            const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href} onClick={onClose}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                )}
              >
                {/* Active indicator bar */}
                {isActive && <motion.div layoutId="sidebar-active" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full" />}
                <link.icon className={cn("h-4 w-4 transition-colors", isActive ? link.color : "text-muted-foreground group-hover:text-foreground")} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom profile */}
        <div className="p-4 border-t bg-muted/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-primary-foreground text-xs font-bold ring-2 ring-primary/10">{initial}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{displayName}</p>
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 flex items-center gap-0.5">
                  <Crown className="h-2.5 w-2.5" />{tierLabel}
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-destructive rounded-xl text-xs" onClick={handleLogout}>
            <LogOut className="h-3.5 w-3.5 mr-2" />Keluar
          </Button>
        </div>
      </motion.aside>
    </>
  );
}
