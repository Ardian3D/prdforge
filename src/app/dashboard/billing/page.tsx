"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CheckCircle2, Clock, ArrowRight, FileText, MessageSquare, Crown, Sparkles, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTranslation } from "@/lib/i18n/language-context";
import { useAuth } from "@/lib/auth/auth-context";
import { apiFetch } from "@/lib/api-client";
import { TIER_LABEL, formatRupiah, formatDate } from "@/lib/format";

const fadeInUp = { hidden: { opacity: 0, y: 16 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.06 } }) };

type PaidTier = "starter" | "pro" | "probundle";

const TIERS: { key: PaidTier; name: string; price: string; color: string; popular: boolean; features: string[] }[] = [
  { key: "starter", name: "Starter", price: "Rp 75.000", color: "from-blue-500/20 to-cyan-500/10", popular: false, features: ["5 PRD / bulan", "100x Chat Revisi", "Export Markdown", "AI Premium"] },
  { key: "pro", name: "Pro", price: "Rp 149.000", color: "from-purple-500/20 to-pink-500/10", popular: true, features: ["Unlimited PRD", "Unlimited Chat", "Export Markdown", "Priority Support"] },
  { key: "probundle", name: "Pro Bundle", price: "Rp 199.000", color: "from-amber-500/20 to-orange-500/10", popular: false, features: ["Semua fitur Pro", "AndaAI Pro Gratis", "Export Markdown", "Priority Support"] },
];

interface Payment {
  id: string; externalId: string | null; status: string; amount: number;
  tierPurchased: string; provider: string; createdAt: string;
}

const STATUS_BADGE: Record<string, string> = {
  success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  refunded: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

export default function BillingPage() {
  const { t } = useTranslation();
  const { usage, refresh } = useAuth();
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [loadingPay, setLoadingPay] = React.useState(true);
  const [upgrading, setUpgrading] = React.useState<PaidTier | null>(null);

  const loadPayments = React.useCallback(async () => {
    try {
      const data = await apiFetch<{ payments: Payment[] }>("/api/payments");
      setPayments(data.payments);
    } catch {
      /* ignore */
    } finally {
      setLoadingPay(false);
    }
  }, []);

  React.useEffect(() => { loadPayments(); }, [loadPayments]);

  // Konfirmasi pembayaran saat customer kembali dari Midtrans (finishUrl berisi
  // ?order=...). Penting untuk dev lokal: webhook Midtrans tidak bisa menjangkau
  // localhost, jadi status dikonfirmasi langsung ke Midtrans lewat endpoint ini.
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const order = params.get("order");
    if (!order) return;
    let cancelled = false;
    const toastId = toast.loading("Mengonfirmasi status pembayaran…");
    (async () => {
      try {
        const data = await apiFetch<{ status: string; tier: string; upgraded: boolean }>(
          `/api/payment/status?order=${encodeURIComponent(order)}`
        );
        if (cancelled) return;
        if (data.status === "success") {
          toast.success(`Pembayaran berhasil — paket ${TIER_LABEL[data.tier] ?? data.tier} aktif!`, { id: toastId });
          await refresh();
        } else if (data.status === "pending") {
          toast.info("Pembayaran masih diproses. Status akan diperbarui setelah dikonfirmasi.", { id: toastId });
        } else if (data.status === "failed") {
          toast.error("Pembayaran gagal atau dibatalkan.", { id: toastId });
        } else {
          toast.dismiss(toastId);
        }
        await loadPayments();
      } catch (err) {
        if (!cancelled) toast.error(err instanceof Error ? err.message : "Gagal mengonfirmasi pembayaran", { id: toastId });
      } finally {
        if (!cancelled) {
          // Bersihkan query param agar tidak diproses ulang saat reload.
          const url = new URL(window.location.href);
          url.searchParams.delete("order");
          url.searchParams.delete("simulate");
          window.history.replaceState({}, "", url.pathname + url.search);
        }
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentTier = usage?.tier ?? "free";
  const gen = usage?.generation;
  const rev = usage?.revision;
  const daysLeft = usage?.resetAt
    ? Math.max(0, Math.ceil((new Date(usage.resetAt).getTime() - Date.now()) / 86400000))
    : null;

  async function handleUpgrade(tier: PaidTier) {
    setUpgrading(tier);
    try {
      const data = await apiFetch<{ orderId: string; redirectUrl: string; gateway: string }>(
        "/api/payment/create",
        { method: "POST", body: JSON.stringify({ tier }) }
      );
      if (data.gateway === "midtrans") {
        window.location.href = data.redirectUrl;
        return;
      }
      // Mode simulasi (dev): tandai pembayaran berhasil via webhook.
      const confirmSim = window.confirm(
        `Mode simulasi pembayaran (gateway belum dikonfigurasi).\nTandai order ${data.orderId} sebagai BERHASIL & upgrade ke ${TIER_LABEL[tier]}?`
      );
      if (!confirmSim) { setUpgrading(null); return; }
      await apiFetch("/api/payment/webhook", {
        method: "POST",
        body: JSON.stringify({ order_id: data.orderId, simulate_status: "success" }),
      });
      await refresh();
      await loadPayments();
      toast.success(`Berhasil upgrade ke ${TIER_LABEL[tier]}!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memproses pembayaran");
    } finally {
      setUpgrading(null);
    }
  }

  return (
    <motion.div initial="hidden" animate="visible" className="mx-auto w-full max-w-5xl space-y-8">
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="font-display text-2xl font-semibold tracking-tight text-balance">{t("billing.title")}</h1><p className="text-sm text-muted-foreground mt-1">{t("billing.subtitle")}</p></div>
      </motion.div>

      {/* Current plan */}
      <motion.div variants={fadeInUp} custom={1}>
        <Card className="border-0 overflow-hidden bg-gradient-to-r from-amber-500/10 via-primary/5 to-transparent">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-br from-amber-400/30 to-amber-500/20 flex items-center justify-center shadow-lg"><Crown className="h-8 w-8 text-amber-500" /></div>
                <div>
                  <div className="flex items-center gap-2 mb-1"><h2 className="font-extrabold text-xl">{TIER_LABEL[currentTier]}</h2><Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 font-semibold">{t("billing.active")}</Badge></div>
                  <p className="text-sm text-muted-foreground">
                    {gen?.unlimited ? "Unlimited PRD" : `${gen?.quota ?? 0} PRD`} · {rev?.unlimited ? "Unlimited Chat" : `${rev?.quota ?? 0} Chat`} · {usage?.canExport ? "Export aktif" : "Tanpa export"}
                  </p>
                  {usage?.resetAt && <div className="flex items-center gap-3 mt-3"><div className="flex items-center gap-1.5 text-xs"><div className="h-2 w-2 rounded-full bg-green-500" /><span className="text-muted-foreground">{t("billing.quotaReset")} <span className="font-semibold text-foreground">{formatDate(usage.resetAt)}</span></span></div></div>}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Button variant="outline" className="rounded-xl font-semibold" asChild><Link href="/pricing">{t("billing.comparePlans")}</Link></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Usage */}
      <div className="grid grid-cols-1 sm:grid-cols-3 auto-rows-fr gap-4">
        {[
          { label: t("billing.usage.prd"), q: gen, icon: FileText, color: "text-blue-500", bgColor: "bg-blue-500/10", barColor: "bg-blue-500" },
          { label: t("billing.usage.chat"), q: rev, icon: MessageSquare, color: "text-green-500", bgColor: "bg-green-500/10", barColor: "bg-green-500" },
        ].map((stat, i) => {
          const used = stat.q && !stat.q.unlimited ? stat.q.quota - stat.q.remaining : 0;
          const progress = stat.q && !stat.q.unlimited && stat.q.quota > 0 ? (used / stat.q.quota) * 100 : 0;
          return (
            <motion.div key={stat.label} variants={fadeInUp} custom={i + 2} className="h-full">
              <Card className="h-full flex flex-col border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="flex h-full flex-col p-5">
                  <div className="flex items-start justify-between gap-3 mb-3"><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</span><div className={`h-10 w-10 shrink-0 rounded-xl ${stat.bgColor} flex items-center justify-center`}><stat.icon className={`h-5 w-5 ${stat.color}`} /></div></div>
                  {stat.q?.unlimited ? (
                    <div className="text-3xl font-extrabold">∞</div>
                  ) : (
                    <><div className="text-3xl font-extrabold tabular-nums">{used}<span className="text-base font-normal text-muted-foreground">/{stat.q?.quota ?? 0}</span></div><div className="mt-3 h-1.5 w-full bg-muted rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, delay: 0.4 + i * 0.1 }} className={`h-full ${stat.barColor} rounded-full`} /></div></>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">{stat.q?.unlimited ? "Tanpa batas" : `${stat.q?.remaining ?? 0} tersisa`}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
        <motion.div variants={fadeInUp} custom={4} className="h-full">
          <Card className="h-full flex flex-col border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="flex h-full flex-col p-5">
              <div className="flex items-start justify-between gap-3 mb-3"><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("billing.usage.daysLeft")}</span><div className="h-10 w-10 shrink-0 rounded-xl bg-purple-500/10 flex items-center justify-center"><Clock className="h-5 w-5 text-purple-500" /></div></div>
              <p className="text-2xl font-extrabold">{daysLeft === null ? "—" : `${daysLeft} hari`}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("billing.usage.untilReset")}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Upgrade */}
      <motion.div variants={fadeInUp} custom={3}>
        <h2 className="text-lg font-bold mb-4">{t("billing.upgrade.title")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-fr gap-4">
          {TIERS.map((tier, i) => {
            const isCurrent = tier.key === currentTier;
            return (
              <motion.div key={tier.name} variants={fadeInUp} custom={4 + i} className="h-full">
                <Card className={`h-full flex flex-col border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${tier.popular ? "ring-2 ring-primary shadow-md" : ""}`}>
                  {tier.popular && <div className="h-1 bg-gradient-to-r from-primary via-chart-3 to-gold" />}
                  <CardContent className={`flex h-full flex-col p-5 bg-gradient-to-br ${tier.color}`}>
                    <div className="flex items-center justify-between mb-3"><span className="font-bold text-lg">{tier.name}</span>{tier.popular && <Badge className="bg-primary text-primary-foreground text-[10px] font-semibold">{t("billing.upgrade.popular")}</Badge>}</div>
                    <div className="text-2xl font-extrabold mb-4">{tier.price}<span className="text-sm font-normal text-muted-foreground">/bln</span></div>
                    <ul className="space-y-2 mb-6 flex-1">{tier.features.map((f) => <li key={f} className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />{f}</li>)}</ul>
                    <Button
                      variant={tier.popular ? "default" : "outline"}
                      size="sm"
                      className={`w-full rounded-xl font-semibold ${tier.popular ? "shadow-lg shadow-primary/25" : ""}`}
                      disabled={isCurrent || upgrading !== null}
                      onClick={() => handleUpgrade(tier.key)}
                    >
                      {isCurrent ? "Paket Aktif" : upgrading === tier.key ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Memproses...</> : <>{t("billing.upgrade.select")} {tier.name} <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></>}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* History */}
      <motion.div variants={fadeInUp} custom={7}>
        <Card className="border shadow-sm">
          <CardHeader className="border-b pb-3"><CardTitle className="text-lg font-bold">{t("billing.history.title")}</CardTitle></CardHeader>
          <CardContent className="p-0">
            {loadingPay ? (
              <div className="flex items-center justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
            ) : payments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">Belum ada transaksi.</p>
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead className="font-semibold">{t("billing.history.invoice")}</TableHead><TableHead className="font-semibold">{t("billing.history.date")}</TableHead><TableHead className="font-semibold">{t("billing.history.tier")}</TableHead><TableHead className="font-semibold text-right">{t("billing.history.amount")}</TableHead><TableHead className="font-semibold text-center">{t("billing.history.status")}</TableHead></TableRow></TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="font-medium text-xs">{p.externalId ?? p.id.slice(0, 8)}</TableCell>
                      <TableCell className="text-sm">{formatDate(p.createdAt)}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-[10px]">{TIER_LABEL[p.tierPurchased]}</Badge></TableCell>
                      <TableCell className="text-sm text-right font-semibold tabular-nums">{formatRupiah(p.amount)}</TableCell>
                      <TableCell className="text-center"><Badge variant="secondary" className={`text-[10px] ${STATUS_BADGE[p.status] ?? ""}`}>{p.status === "success" ? <CheckCircle2 className="h-3 w-3 mr-1" /> : p.status === "failed" ? <XCircle className="h-3 w-3 mr-1" /> : null}{p.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
