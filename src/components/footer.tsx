"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FOOTER_LINKS, APP_NAME } from "@/lib/constants";
import { useTranslation } from "@/lib/i18n/language-context";

const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }) };

export function Footer() {
  const { t } = useTranslation();
  const pathname = usePathname();

  // Footer marketing tidak ditampilkan di route aplikasi (punya chrome sendiri).
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/editor") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth")
  ) {
    return null;
  }

  return (
    <footer className="border-t bg-muted/10">
      <div className="container mx-auto px-4 py-16">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <motion.div variants={fadeInUp} custom={0} className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-1">
              <Image src="/logo.png" alt="PRDForge Logo" width={100} height={100} className="rounded-lg" />
              <span className="font-bold text-xl">PRD<span className="text-primary">Forge</span></span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">{t("footer.tagline")} <span className="font-semibold text-foreground">Ardian3D</span>.</p>
          </motion.div>
          {([["product", t("footer.product")], ["resources", t("footer.resources")], ["company", t("footer.company")]] as const).map(([key, label], i) => (
            <motion.div key={key} variants={fadeInUp} custom={i + 1}>
              <h3 className="font-bold text-sm mb-4 uppercase tracking-wider text-foreground">{label}</h3>
              <ul className="space-y-3">
                {FOOTER_LINKS[key as "product" | "resources" | "company"].map((link) => (
                  <li key={link.label}><Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link.label}</Link></li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} {APP_NAME} {t("footer.copyright")}</p>
          <p className="text-xs text-muted-foreground">{t("footer.powered")} <span className="font-semibold">DeepSeek AI</span></p>
        </motion.div>
      </div>
    </footer>
  );
}
