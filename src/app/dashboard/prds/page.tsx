"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { FileText, Clock, MoreHorizontal, Trash2, Pencil, Download, Search, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/lib/i18n/language-context";
import { useAuth } from "@/lib/auth/auth-context";
import { apiFetch } from "@/lib/api-client";
import { formatRelative } from "@/lib/format";

const fadeInUp = { hidden: { opacity: 0, y: 16 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.06 } }) };

interface PrdItem { id: string; title: string; language: string; updatedAt: string; isArchived: boolean }

export default function PrdsPage() {
  const { t } = useTranslation();
  const { usage } = useAuth();
  const [search, setSearch] = React.useState("");
  const [prds, setPrds] = React.useState<PrdItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await apiFetch<{ prds: PrdItem[] }>("/api/prd?archived=true");
        if (active) setPrds(data.prds);
      } catch {
        /* ignore */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const filtered = prds.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  async function handleRename(prd: PrdItem) {
    const next = window.prompt("Judul baru:", prd.title);
    if (!next || next.trim() === prd.title) return;
    try {
      await apiFetch(`/api/prd/${prd.id}`, { method: "PATCH", body: JSON.stringify({ title: next.trim() }) });
      setPrds((prev) => prev.map((p) => (p.id === prd.id ? { ...p, title: next.trim() } : p)));
      toast.success("PRD diganti nama");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengganti nama");
    }
  }

  async function handleDelete(prd: PrdItem) {
    if (!window.confirm(`Hapus "${prd.title}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      await apiFetch(`/api/prd/${prd.id}`, { method: "DELETE" });
      setPrds((prev) => prev.filter((p) => p.id !== prd.id));
      toast.success("PRD dihapus");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus");
    }
  }

  function handleDownload(prd: PrdItem) {
    if (!usage?.canExport) {
      toast.error("Export hanya untuk paket berbayar.");
      return;
    }
    window.open(`/api/prd/${prd.id}/export/markdown`, "_blank");
  }

  return (
    <motion.div initial="hidden" animate="visible" className="mx-auto w-full max-w-5xl space-y-6">
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-balance">{t("dashboard.allPrds")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{prds.length} {t("dashboard.prdsStored")}</p>
        </div>
        <Button size="lg" className="gap-2 rounded-xl shadow-lg shadow-primary/25 font-semibold" asChild><Link href="/dashboard/new"><Plus className="h-4 w-4" />{t("dashboard.generateBtn")}</Link></Button>
      </motion.div>

      <motion.div variants={fadeInUp} custom={1}>
        <div className="relative max-w-md"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder={t("dashboard.searchPrd")} className="pl-10 rounded-xl" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 auto-rows-fr gap-4">
          {filtered.map((prd, i) => (
            <motion.div key={prd.id} variants={fadeInUp} custom={i + 2} className="h-full">
              <Card className="h-full flex flex-col border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <CardContent className="flex h-full flex-col p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><FileText className="h-5 w-5 text-primary" /></div>
                      <div className="min-w-0">
                        <Link href={`/editor/${prd.id}`} className="font-semibold text-sm hover:text-primary transition-colors line-clamp-1 text-balance">{prd.title}</Link>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[10px]">{prd.language === "id" ? "ID" : "EN"}</Badge>
                          {prd.isArchived && <Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">Arsip</Badge>}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger><Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl shrink-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRename(prd)}><Pencil className="h-4 w-4 mr-2" />{t("dashboard.rename")}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(prd)}><Download className="h-4 w-4 mr-2" />{t("dashboard.download")}</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(prd)}><Trash2 className="h-4 w-4 mr-2" />{t("dashboard.delete")}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-auto">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatRelative(prd.updatedAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <motion.div variants={fadeInUp} className="text-center py-16">
          <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground mb-4">{prds.length === 0 ? "Belum ada PRD." : t("dashboard.noResults")}</p>
          {prds.length === 0 && <Button asChild className="rounded-xl"><Link href="/dashboard/new"><Plus className="h-4 w-4 mr-1" />Generate PRD</Link></Button>}
        </motion.div>
      )}
    </motion.div>
  );
}
