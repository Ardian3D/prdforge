"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiFetch } from "@/lib/api-client";
import { formatRelative } from "@/lib/format";

const fadeInUp = { hidden: { opacity: 0, y: 16 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.06 } }) };

interface FraudLog {
  id: string; deviceHash: string | null; ipAddress: string | null; ipSubnet: string | null;
  emailAttempted: string | null; action: "blocked" | "flagged" | "allowed"; reason: string | null; createdAt: string;
}
interface AuditResp { logs: FraudLog[]; total: number; actionCounts: Record<string, number> }

const ACTION_COLORS: Record<string, string> = {
  blocked: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
  flagged: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  allowed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
};
const ACTION_ICONS: Record<string, typeof Shield> = { blocked: XCircle, flagged: AlertTriangle, allowed: CheckCircle2 };

export default function AdminAuditPage() {
  const [data, setData] = React.useState<AuditResp | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try { setData(await apiFetch<AuditResp>("/api/admin/audit")); }
      catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  const counts = data?.actionCounts ?? { blocked: 0, flagged: 0, allowed: 0 };
  const total = data?.total ?? 0;
  const blockRate = total > 0 ? ((counts.blocked / total) * 100).toFixed(1) : "0";

  const STATS = [
    { label: "Total Checks", value: total.toLocaleString(), subtitle: "sepanjang waktu", icon: Shield, color: "text-blue-500", bg: "bg-blue-500/10", valueColor: "" },
    { label: "Blocked", value: String(counts.blocked), subtitle: `${blockRate}% block rate`, icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", valueColor: "text-red-600 dark:text-red-400" },
    { label: "Flagged", value: String(counts.flagged), subtitle: "perlu ditinjau", icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10", valueColor: "text-yellow-600 dark:text-yellow-400" },
  ];

  return (
    <motion.div initial="hidden" animate="visible" className="mx-auto w-full max-w-6xl space-y-6">
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-balance">Fraud & Audit Log</h1>
          <p className="text-sm text-muted-foreground mt-1">Device fingerprinting, IP tracking, dan anti-abuse monitoring.</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5 text-xs self-start"><div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />Live Monitoring</Badge>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 auto-rows-fr gap-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} variants={fadeInUp} custom={i + 1} className="h-full">
              <Card className="h-full flex flex-col border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="flex h-full flex-col p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                    <div className={`h-10 w-10 shrink-0 rounded-xl ${stat.bg} flex items-center justify-center`}><Icon className={`h-5 w-5 ${stat.color}`} /></div>
                  </div>
                  <div className={`text-3xl font-extrabold tabular-nums ${stat.valueColor}`}>{stat.value}</div>
                  <p className="mt-1.5 text-xs text-muted-foreground">{stat.subtitle}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <motion.div variants={fadeInUp} custom={4}>
        <Card className="border shadow-sm">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2"><Shield className="h-5 w-5 text-red-500" />Percobaan Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : !data || data.logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-16">Belum ada log fraud.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Device Hash</TableHead>
                    <TableHead className="font-semibold">IP / Subnet</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Action</TableHead>
                    <TableHead className="font-semibold">Reason</TableHead>
                    <TableHead className="font-semibold text-right">Waktu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.logs.map((log) => {
                    const ActionIcon = ACTION_ICONS[log.action];
                    return (
                      <TableRow key={log.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell><code className="text-[11px] bg-muted px-2 py-1 rounded-lg font-mono font-medium">{log.deviceHash ? `${log.deviceHash.slice(0, 12)}…` : "—"}</code></TableCell>
                        <TableCell><div className="text-xs"><p className="font-medium">{log.ipAddress ?? "—"}</p><p className="text-muted-foreground text-[10px]">{log.ipSubnet ?? ""}</p></div></TableCell>
                        <TableCell className="text-xs font-medium">{log.emailAttempted ?? "—"}</TableCell>
                        <TableCell><Badge variant="outline" className={`text-[11px] font-semibold gap-1 ${ACTION_COLORS[log.action]}`}><ActionIcon className="h-3 w-3" />{log.action}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[220px] truncate">{log.reason ?? "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground text-right tabular-nums"><span className="flex items-center gap-1 justify-end"><Clock className="h-3 w-3" />{formatRelative(log.createdAt)}</span></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
