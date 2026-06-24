"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { NAV_LINKS } from "@/lib/constants";
import { useTranslation } from "@/lib/i18n/language-context";
import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const pathname = usePathname();
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    window.location.href = "/";
  }

  const isAuthPage = pathname.startsWith("/auth");
  const isDashboard = pathname.startsWith("/dashboard");
  const isEditor = pathname.startsWith("/editor");
  const isAdmin = pathname.startsWith("/admin");

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Route aplikasi punya chrome sendiri (sidebar/top bar/editor header) —
  // jangan tampilkan navbar marketing di sana.
  if (isDashboard || isEditor || isAdmin) return null;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "glass shadow-sm"
          : "bg-transparent border-b border-transparent",
        (isDashboard || isEditor) && "bg-background border-b"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <Image
            src="/logo.png"
            alt="PRDForge Logo"
            width={130}
            height={130}
            className="rounded-lg transition-transform duration-300 group-hover:scale-110 mt-5"
          />
        </Link>

        {/* Desktop Nav */}
        {!isDashboard && !isEditor && (
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
              >
                {t(link.labelKey as "nav.features" | "nav.howItWorks" | "nav.pricing" | "nav.demo")}
              </Link>
            ))}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
          {!isDashboard && !isEditor && (
            <>
              <div className="hidden md:flex items-center gap-2">
                {user ? (
                  <>
                    <Button variant="ghost" className="font-medium gap-2" asChild>
                      <Link href={user.role === "admin" ? "/admin" : "/dashboard"}>
                        <LayoutDashboard className="h-4 w-4" />
                        {user.role === "admin" ? "Admin" : "Dashboard"}
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="font-medium"
                      onClick={handleLogout}
                      aria-label="Keluar"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="font-medium" asChild>
                      <Link href="/auth/login">{t("nav.login")}</Link>
                    </Button>
                    <Button className="font-medium shadow-glow hover:scale-[1.03] transition-transform" asChild>
                      <Link href="/auth/register">{t("nav.register")}</Link>
                    </Button>
                  </>
                )}
              </div>
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && !isDashboard && !isEditor && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t glass overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium py-3 px-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                >
                  {t(link.labelKey)}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 mt-2 border-t">
                {user ? (
                  <>
                    <Button variant="outline" asChild className="w-full">
                      <Link href={user.role === "admin" ? "/admin" : "/dashboard"}>{user.role === "admin" ? "Admin" : "Dashboard"}</Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-destructive" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />Keluar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/auth/login">{t("nav.login")}</Link>
                    </Button>
                    <Button asChild className="w-full shadow-lg shadow-primary/25">
                      <Link href="/auth/register">{t("nav.register")}</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
