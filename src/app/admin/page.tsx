"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, FileText, TrendingUp, Shield, Key, ArrowRight, Activity, Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api-client";
import { formatRelative } from "@/lib/format";

const fadeInUp = { hidden: { opacity: 0, y: 16 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.06 } }) };

interface Stats {
  totalUsers: number; newUsers30: number; paidUsers: number; conversionRate: number;
  totalPrds: number; prdsLast30: number; bannedUsers: number; revenue: number;
  fraudBlocked: number; fraudBlockRate: number;
}
interface RecentUser { id: string; email: string; name: string | null; tier: string; isBanned: boolean; createdAt: string }
interface ApiCfg { configured: boolean; model: string; isActive?: boolean; maskedKey?: string | null }

const TIER_COLORS: Record<string, string> = {
  free: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  starter: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  pro: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  probundle: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
};

export default function AdminOverview() {
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [recent, setRecent] = React.useState<RecentUser[]>([]);
  const [apiCfg, setApiCfg] = React.useState<ApiCfg | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const [s, u, a] = await Promise.all([
          apiFetch<Stats>("/api/admin/stats"),
          apiFetch<{ users: RecentUser[] }>("/api/admin/users?pageSize=5"),
          apiFetch<ApiCfg>("/api/admin/apikey").catch(() => null),
        ]);
        setStats(s); setRecent(u.users); setApiCfg(a);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const STAT_CARDS = stats ? [
    { label: "Total Users", value: stats.totalUsers.toLocaleString(), sub: `+${stats.newUsers30} (30 hari)`, icon: Users, color: "text-blue-500", bgColor: "bg-blue-500/10" },
    { label: "Total PRDs", value: stats.totalPrds.toLocaleString(), sub: `+${stats.prdsLast30} (30 hari)`, icon: FileText, color: "text-green-500", bgColor: "bg-green-500/10" },
    { label: "Paid Users", value: stats.paidUsers.toLocaleString(), sub: `konversi ${stats.conversionRate}%`, icon: TrendingUp, color: "text-purple-500", bgColor: "bg-purple-500/10" },
    { label: "Blocked / Fraud", value: stats.fraudBlocked.toLocaleString(), sub: `block rate ${stats.fraudBlockRate}%`, icon: Shield, color: "text-red-500", bgColor: "bg-red-500/10" },
  ] : [];

  const API_STATUS = [
    { label: "DeepSeek API", value: apiCfg?.configured && apiCfg?.isActive ? "Connected" : "Belum diset", color: apiCfg?.configured && apiCfg?.isActive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400" },
    { label: "Model", value: apiCfg?.model ?? "—" },
    { label: "API Key", value: apiCfg?.maskedKey ?? "—" },
    { label: "Encryption", value: "AES-256-GCM", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  ];

  if (loading) {
    return <div className="flex items-center justify-center py-32"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <motion.div initial="hidden" animate="visible" className="mx-auto w-full max-w-6xl space-y-8">
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-balance">Admin Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor aktivitas platform dan kelola resource.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-xl"><Activity className="h-3.5 w-3.5 text-green-500" />Data real-time</div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr gap-4">
        {STAT_CARDS.map((stat, i) => (
          <motion.div key={stat.label} variants={fadeInUp} custom={i + 1} className="h-full">
            <Card className="h-full flex flex-col border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                  <div className={`h-10 w-10 shrink-0 rounded-xl ${stat.bgColor} flex items-center justify-center`}><stat.icon className={`h-5 w-5 ${stat.color}`} /></div>
                </div>
                <div className="text-3xl font-extrabold tabular-nums">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1.5">{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 auto-rows-fr gap-6">
        <motion.div variants={fadeInUp} custom={5} className="h-full">
          <Card className="flex h-full flex-col border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2"><Key className="h-5 w-5 text-amber-500" />API Status</CardTitle>
              <Link href="/admin/api-keys" className="text-xs text-primary hover:underline font-semibold flex items-center gap-1">Kelola <ArrowRight className="h-3 w-3" /></Link>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ul className="divide-y divide-border">
                {API_STATUS.map((item) => (
                  <li key={item.label} className="flex items-center justify-between gap-3 px-6 py-3">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    {item.color ? <Badge variant="secondary" className={`text-[11px] ${item.color}`}>{item.value}</Badge> : <span className="text-sm font-medium tabular-nums">{item.value}</span>}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp} custom={6} className="h-full">
          <Card className="flex h-full flex-col border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2"><Users className="h-5 w-5 text-blue-500" />Sign-up Terbaru</CardTitle>
              <Link href="/admin/users" className="text-xs text-primary hover:underline font-semibold flex items-center gap-1">Lihat semua <ArrowRight className="h-3 w-3" /></Link>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              {recent.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">Belum ada user.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {recent.map((user) => (
                    <li key={user.id} className="flex items-center justify-between gap-3 px-6 py-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center shrink-0"><span className="text-[10px] font-bold text-muted-foreground">{(user.name || user.email).slice(0, 2).toUpperCase()}</span></div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2"><p className="text-sm font-medium truncate">{user.email}</p><Badge variant="secondary" className={`text-[10px] ${TIER_COLORS[user.tier]}`}>{user.tier}</Badge></div>
                          <p className="text-[11px] text-muted-foreground mt-0.5"><Clock className="h-2.5 w-2.5 inline" /> {formatRelative(user.createdAt)}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className={`text-[10px] shrink-0 ${user.isBanned ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"}`}>{user.isBanned ? "banned" : "active"}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
