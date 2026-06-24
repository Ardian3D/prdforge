"use client";

import * as React from "react";
import { TrendingUp, Users, FileText, DollarSign, Activity, Crown, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiFetch } from "@/lib/api-client";
import { formatRupiah, TIER_LABEL } from "@/lib/format";

interface Stats {
  totalUsers: number; newUsers30: number; paidUsers: number; conversionRate: number;
  tierCounts: Record<string, number>;
  totalPrds: number; prdsLast30: number; bannedUsers: number; revenue: number;
  successPaymentCount: number; fraudBlocked: number; fraudBlockRate: number;
}

export default function AdminStatsPage() {
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try { setStats(await apiFetch<Stats>("/api/admin/stats")); }
      catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!stats) return <p className="text-center py-32 text-muted-foreground">Gagal memuat statistik.</p>;

  const KPI = [
    { label: "Total Revenue", value: formatRupiah(stats.revenue), sub: `${stats.successPaymentCount} transaksi sukses`, icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Konversi", value: `${stats.conversionRate}%`, sub: `${stats.paidUsers} paid users`, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Avg PRD/User", value: stats.totalUsers > 0 ? (stats.totalPrds / stats.totalUsers).toFixed(1) : "0", sub: "lifetime", icon: FileText, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "User Baru (30d)", value: String(stats.newUsers30), sub: `${stats.totalUsers} total`, icon: Activity, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  const QUICK = [
    { label: "Total Users", value: stats.totalUsers.toLocaleString(), icon: Users },
    { label: "Total PRDs", value: stats.totalPrds.toLocaleString(), icon: FileText },
    { label: "Total Revenue", value: formatRupiah(stats.revenue), icon: DollarSign },
    { label: "Fraud Blocked", value: String(stats.fraudBlocked), icon: TrendingUp },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-balance">Platform Statistics</h1>
        <p className="text-sm text-muted-foreground mt-1">Metrik penggunaan & pertumbuhan platform.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-fr gap-4">
        {KPI.map((stat) => (
          <Card key={stat.label} className="h-full flex flex-col border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="flex h-full flex-col p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                <div className={`h-10 w-10 shrink-0 rounded-xl ${stat.bg} flex items-center justify-center`}><stat.icon className={`h-5 w-5 ${stat.color}`} /></div>
              </div>
              <div className="text-2xl font-extrabold tabular-nums">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1.5">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 auto-rows-fr gap-4">
        {QUICK.map((stat) => (
          <Card key={stat.label} className="h-full flex flex-col border shadow-sm bg-muted/5">
            <CardContent className="flex h-full flex-col p-4 items-center text-center justify-center">
              <stat.icon className="h-5 w-5 text-muted-foreground mb-2" />
              <div className="text-xl font-extrabold tabular-nums">{stat.value}</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="border-b pb-3"><CardTitle className="text-lg font-bold flex items-center gap-2"><Crown className="h-5 w-5 text-amber-500" />Distribusi Tier</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Tier</TableHead>
                <TableHead className="text-right font-semibold">Jumlah User</TableHead>
                <TableHead className="text-right font-semibold">Persentase</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(["free", "starter", "pro", "probundle"] as const).map((tier) => {
                const count = stats.tierCounts[tier] ?? 0;
                const pct = stats.totalUsers > 0 ? ((count / stats.totalUsers) * 100).toFixed(1) : "0";
                return (
                  <TableRow key={tier} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-semibold text-sm">{TIER_LABEL[tier]}</TableCell>
                    <TableCell className="text-right text-sm tabular-nums">{count}</TableCell>
                    <TableCell className="text-right text-sm tabular-nums">{pct}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
