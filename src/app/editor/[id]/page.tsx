"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Download, ChevronRight, FileText, Clock, Globe, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PrdSection as PrdSectionView } from "@/components/prd-section";
import { ChatPanel } from "@/components/chat-panel";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/lib/auth/auth-context";

interface Section { title: string; content: string }
interface PrdData {
  id: string;
  title: string;
  descriptionInput: string;
  sections: Section[];
  language: "id" | "en";
  createdAt: string;
}

export default function EditorPage() {
  const params = useParams();
  const prdId = params.id as string;
  const { usage } = useAuth();

  const [prd, setPrd] = React.useState<PrdData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await apiFetch<PrdData>(`/api/prd/${prdId}`);
        if (active) setPrd(data);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Gagal memuat PRD");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [prdId]);

  async function handleSectionSave(title: string, newContent: string) {
    try {
      await apiFetch(`/api/prd/${prdId}/section`, {
        method: "PATCH",
        body: JSON.stringify({ title, content: newContent }),
      });
      setPrd((prev) =>
        prev
          ? { ...prev, sections: prev.sections.map((s) => (s.title === title ? { ...s, content: newContent } : s)) }
          : prev
      );
      toast.success("Section tersimpan");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
    }
  }

  function handleSectionsUpdated(sections: Section[]) {
    setPrd((prev) => (prev ? { ...prev, sections } : prev));
  }

  function handleDownload() {
    if (!usage?.canExport) {
      toast.error("Export hanya untuk paket berbayar. Upgrade dulu ya.");
      return;
    }
    window.open(`/api/prd/${prdId}/export/markdown`, "_blank");
  }

  if (loading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !prd) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-muted-foreground">{error ?? "PRD tidak ditemukan"}</p>
        <Button asChild variant="outline"><Link href="/dashboard">Kembali ke Dashboard</Link></Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-background">
        <header className="h-14 border-b flex items-center justify-between px-4 shrink-0 glass">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" className="rounded-xl" asChild>
              <Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold truncate">{prd.title}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">{prd.language === "id" ? "ID" : "EN"}</Badge>
              <Badge variant="secondary" className="text-[10px] flex items-center gap-1"><Sparkles className="h-3 w-3" />AI Generated</Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="gap-1 text-xs rounded-xl" onClick={handleDownload}>
              <Download className="h-3.5 w-3.5" /><span className="hidden sm:inline">Download .md</span>
              {!usage?.canExport && <Badge variant="secondary" className="text-[9px] ml-1 hidden sm:inline">Pro</Badge>}
            </Button>
          </div>
        </header>

        <ScrollArea className="flex-1 min-h-0">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link href="/dashboard" className="hover:text-foreground transition-colors font-medium">Dashboard</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-semibold truncate">{prd.title}</span>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-card to-chart-3/10 p-6 sm:p-8 mb-8 grain shadow-premium">
              <div className="aurora-blob bg-primary -top-20 -right-10" style={{ width: 260, height: 260 }} />
              <div className="relative">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary mb-4">
                  <Sparkles className="h-3 w-3" />Product Requirement Document
                </span>
                <h1 className="font-display text-2xl md:text-4xl font-semibold tracking-tight leading-tight mb-3">{prd.title}</h1>
                <p className="text-muted-foreground leading-relaxed text-sm max-w-2xl mb-5">{prd.descriptionInput}</p>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-background/60 backdrop-blur px-3 py-1.5 text-xs font-medium ring-1 ring-border"><Clock className="h-3.5 w-3.5 text-primary" />{new Date(prd.createdAt).toLocaleDateString("id-ID")}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-background/60 backdrop-blur px-3 py-1.5 text-xs font-medium ring-1 ring-border"><Globe className="h-3.5 w-3.5 text-primary" />{prd.language === "id" ? "Bahasa Indonesia" : "English"}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-background/60 backdrop-blur px-3 py-1.5 text-xs font-medium ring-1 ring-border"><FileText className="h-3.5 w-3.5 text-primary" />{prd.sections.length} section</span>
                </div>
              </div>
            </div>

            <div className="space-y-5 pb-12">
              {prd.sections.map((section, i) => (
                <PrdSectionView
                  key={`${section.title}-${i}`}
                  title={section.title}
                  content={section.content}
                  sectionIndex={i + 1}
                  onSave={(newContent) => handleSectionSave(section.title, newContent)}
                />
              ))}
            </div>
          </motion.div>
        </ScrollArea>
      </div>

      <ChatPanel
        prdId={prd.id}
        onSectionsUpdated={handleSectionsUpdated}
        remainingRevisions={usage?.revision.unlimited ? null : usage?.revision.remaining ?? null}
      />
    </div>
  );
}
