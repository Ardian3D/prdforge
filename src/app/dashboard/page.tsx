"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, MessageSquare, Zap, Plus, ExternalLink, Clock, Crown, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n/language-context";
import { useAuth } from "@/lib/auth/auth-context";
import { apiFetch } from "@/lib/api-client";
import { TIER_LABEL, formatRelative } from "@/lib/format";

const fadeInUp = { hidden: { opacity: 0, y: 16 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.06 } }) };

interface PrdListItem { id: string; title: string; language: string; updatedAt: string }

function quotaText(remaining: number, unlimited: boolean) {
  return unlimited ? "∞" : String(remaining);
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user, usage } = useAuth();
  const [prds, setPrds] = React.useState<PrdListItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await apiFetch<{ prds: PrdListItem[] }>("/api/prd");
        if (active) setPrds(data.prds);
      } catch {
        /* ignore */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const gen = usage?.generation;
  const rev = usage?.revision;

  const STATS = [
    {
      label: t("dashboard.stats.prdLeft"),
      value: gen ? quotaText(gen.remaining, gen.unlimited) : "—",
      total: gen && !gen.unlimited ? `/${gen.quota}` : "",
      progress: gen && !gen.unlimited && gen.quota > 0 ? (gen.remaining / gen.quota) * 100 : 0,
      icon: Zap, color: "text-amber-500", bgColor: "bg-amber-500/10", barColor: "bg-amber-500",
      footer: TIER_LABEL[usage?.tier ?? "free"], footerLink: "/pricing", footerLabel: t("dashboard.stats.upgrade"),
    },
    {
      label: t("dashboard.stats.chatLeft"),
      value: rev ? quotaText(rev.remaining, rev.unlimited) : "—",
      total: rev && !rev.unlimited ? `/${rev.quota}` : "",
      progress: rev && !rev.unlimited && rev.quota > 0 ? (rev.remaining / rev.quota) * 100 : 0,
      icon: MessageSquare, color: "text-blue-500", bgColor: "bg-blue-500/10", barColor: "bg-blue-500",
      footer: t("dashboard.stats.remaining"),
    },
    {
      label: t("dashboard.stats.totalPrd"),
      value: String(prds.length), total: "", progress: 0,
      icon: FileText, color: "text-green-500", bgColor: "bg-green-500/10", barColor: "bg-green-500",
      footer: t("dashboard.stats.allTime"),
    },
  ];

  return (
    <motion.div initial="hidden" animate="visible" className="mx-auto w-full max-w-5xl space-y-8">
      <motion.div variants={fadeInUp}>
        <Card className="border-0 overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex-1">
                <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-balance">{t("dashboard.welcome")}, {displayName}! 👋</h1>
                <p className="text-muted-foreground text-sm max-w-lg mt-1">{prds.length > 0 ? <>Kamu sudah membuat <span className="font-semibold text-foreground">{prds.length} PRD</span>. Lanjutkan!</> : "Mulai buat PRD profesional pertamamu sekarang."}</p>
                <div className="flex items-center gap-3 mt-4">
                  <Button size="lg" className="gap-2 rounded-xl shadow-lg shadow-primary/25 font-semibold" asChild><Link href="/dashboard/new"><Plus className="h-4 w-4" />{t("dashboard.generateBtn")}</Link></Button>
                  <Button variant="outline" size="lg" className="gap-2 rounded-xl font-medium" asChild><Link href="/dashboard/billing"><Crown className="h-4 w-4" />{t("common.upgradeToPro")}</Link></Button>
                </div>
              </div>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="hidden sm:block shrink-0">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center shadow-xl"><Sparkles className="h-10 w-10 text-primary" /></div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 auto-rows-fr gap-4">
        {STATS.map((stat, i) => (
          <motion.div key={stat.label} variants={fadeInUp} custom={i + 1} className="h-full">
            <Card className="h-full flex flex-col border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between gap-3 mb-3"><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</span><div className={`h-10 w-10 shrink-0 rounded-xl ${stat.bgColor} flex items-center justify-center`}><stat.icon className={`h-5 w-5 ${stat.color}`} /></div></div>
                <div className="text-3xl font-extrabold tabular-nums mb-3">{stat.value}{stat.total && <span className="text-base font-normal text-muted-foreground">{stat.total}</span>}</div>
                {stat.progress > 0 && <div className="mb-3"><div className="h-1.5 w-full bg-muted rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${stat.progress}%` }} transition={{ duration: 1, delay: 0.5 + i * 0.1, ease: "easeOut" }} className={`h-full ${stat.barColor} rounded-full`} /></div></div>}
                <p className="mt-auto text-xs text-muted-foreground">{stat.footerLink ? <>{stat.footer} · <Link href={stat.footerLink} className="text-primary hover:underline font-semibold">{stat.footerLabel}</Link></> : stat.footer}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        <motion.div variants={fadeInUp} custom={4} className="h-full">
          <Card className="h-full flex flex-col border shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-purple-500/5 to-primary/5 ring-1 ring-primary/10">
            <CardContent className="flex h-full flex-col p-5">
              <div className="flex items-start justify-between gap-3 mb-3"><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("dashboard.stats.tier")}</span><div className="h-10 w-10 shrink-0 rounded-xl bg-purple-500/10 flex items-center justify-center"><Crown className="h-5 w-5 text-purple-500" /></div></div>
              <div className="text-lg font-extrabold mb-1">{TIER_LABEL[usage?.tier ?? "free"]}</div>
              <p className="text-xs text-muted-foreground mb-4">{usage?.canExport ? "Export aktif" : "Export ❌"}</p>
              <Button variant="outline" size="sm" className="w-full mt-auto rounded-xl font-semibold text-purple-600 border-purple-200 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-950" asChild><Link href="/dashboard/billing">{t("common.viewPricing")} <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link></Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={fadeInUp} custom={5}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{t("dashboard.prdList")}</h2>
          <Button variant="link" className="text-sm font-semibold" asChild><Link href="/dashboard/prds">{t("dashboard.viewAll")} <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link></Button>
        </div>
        <Card className="border shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
            ) : prds.length === 0 ? (
              <div className="text-center py-12 px-4">
                <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">Belum ada PRD. Buat yang pertama!</p>
                <Button asChild className="rounded-xl"><Link href="/dashboard/new"><Plus className="h-4 w-4 mr-1" />Generate PRD</Link></Button>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {prds.slice(0, 5).map((prd) => (
                  <li key={prd.id}>
                    <div className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-muted/30 transition-colors group">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors"><FileText className="h-4 w-4 text-primary" /></div>
                        <Link href={`/editor/${prd.id}`} className="font-semibold text-sm hover:text-primary transition-colors truncate">{prd.title}</Link>
                        <Badge variant="secondary" className="text-[10px] shrink-0">{prd.language === "id" ? "ID" : "EN"}</Badge>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 ml-auto"><Clock className="h-3 w-3" />{formatRelative(prd.updatedAt)}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl shrink-0" asChild><Link href={`/editor/${prd.id}`}><ExternalLink className="h-4 w-4" /></Link></Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
