"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Loader2, CheckCircle2, FileText, Globe, Search, Lightbulb, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";

const SUGGESTIONS = [
  "Marketplace B2B untuk supplier bahan baku restoran",
  "Mobile app personal finance manager dengan AI budgeting",
  "Platform online learning dengan fitur live streaming dan sertifikasi",
  "SaaS HR management untuk UMKM dengan payroll & attendance",
  "Aplikasi food delivery dengan fitur meal prep subscription",
];

const GENERATE_STEPS = [
  { label: "Menganalisis deskripsi produk...", icon: Search },
  { label: "Menyusun 19-section PRD...", icon: FileText },
  { label: "Membuat diagram Mermaid...", icon: Wand2 },
  { label: "Memformat output final...", icon: Sparkles },
];

export default function NewPrdPage() {
  const router = useRouter();
  const [productName, setProductName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [language, setLanguage] = React.useState("id");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isDone, setIsDone] = React.useState(false);

  const charCount = description.length;
  const isValid = productName.trim().length > 0 && description.trim().length >= 20;

  const handleGenerate = async () => {
    if (!isValid || isGenerating) return;
    setIsGenerating(true);
    setCurrentStep(0);
    const stepInterval = setInterval(
      () => setCurrentStep((prev) => (prev < GENERATE_STEPS.length - 1 ? prev + 1 : prev)),
      1500
    );
    try {
      const data = await apiFetch<{ id: string }>("/api/prd/generate", {
        method: "POST",
        body: JSON.stringify({ productName: productName.trim(), description: description.trim(), language }),
      });
      clearInterval(stepInterval);
      setCurrentStep(GENERATE_STEPS.length);
      setIsGenerating(false);
      setIsDone(true);
      setTimeout(() => router.push(`/editor/${data.id}`), 1200);
    } catch (err) {
      clearInterval(stepInterval);
      setIsGenerating(false);
      setCurrentStep(0);
      toast.error(err instanceof Error ? err.message : "Gagal generate PRD");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" className="rounded-xl" asChild>
          <Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-balance">Generate PRD Baru</h1>
          <p className="text-sm text-muted-foreground">Deskripsikan produk kamu dan AI DeepSeek akan menghasilkan PRD 19-section profesional.</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isDone ? (
          <motion.div key="form" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
            <Card className="border shadow-lg overflow-hidden">
              {/* Banner */}
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 px-6 py-4 border-b flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                  <Wand2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">AI PRD Generator</p>
                  <p className="text-xs text-muted-foreground">Powered by DeepSeek v4 Pro · ~60 detik</p>
                </div>
              </div>

              <CardContent className="space-y-5 p-6">
                <div className="space-y-2">
                  <Label htmlFor="product-name" className="font-semibold text-sm">Nama Produk</Label>
                  <Input id="product-name" placeholder="Contoh: FoodFlow — B2B Marketplace" value={productName} onChange={(e) => setProductName(e.target.value)} disabled={isGenerating} className="rounded-xl h-11" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description" className="font-semibold text-sm">Deskripsi Produk</Label>
                    <span className={`text-xs font-semibold tabular-nums ${charCount > 500 ? "text-destructive" : "text-muted-foreground"}`}>{charCount}/500</span>
                  </div>
                  <Textarea id="description" placeholder="Deskripsikan produk kamu — apa yang dilakukan, target user, fitur utama, dan masalah yang diselesaikan. Makin detail, makin akurat PRD-nya." className="min-h-[160px] rounded-xl resize-none" value={description} onChange={(e) => setDescription(e.target.value)} disabled={isGenerating} maxLength={500} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-semibold text-sm flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" />Bahasa Output</Label>
                    <Select value={language} onValueChange={(value) => setLanguage(value ?? "id")} disabled={isGenerating}>
                      <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="id">🇮🇩 Bahasa Indonesia</SelectItem><SelectItem value="en">🇬🇧 English</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Suggestions */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2.5 flex items-center gap-1.5 font-semibold"><Lightbulb className="h-3.5 w-3.5" />Butuh inspirasi?</Label>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <Badge key={s} variant="secondary" className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors rounded-lg px-3 py-1.5 text-xs" onClick={() => { if (!isGenerating) setDescription(s); }}>{s}</Badge>
                    ))}
                  </div>
                </div>

                <Button size="lg" className="w-full h-12 gap-2 rounded-xl font-bold shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all bg-gradient-to-r from-primary to-primary/90" onClick={handleGenerate} disabled={!isValid || isGenerating}>
                  {isGenerating ? (<><Loader2 className="h-5 w-5 animate-spin" />AI sedang generate PRD...</>) : (<><Sparkles className="h-5 w-5" />Generate PRD Sekarang</>)}
                </Button>

                <AnimatePresence>
                  {isGenerating && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0 }} className="space-y-3 pt-5 border-t">
                      <p className="text-sm font-bold text-center flex items-center justify-center gap-2"><Sparkles className="h-4 w-4 text-primary" />AI sedang bekerja...</p>
                      <div className="space-y-2">
                        {GENERATE_STEPS.map((step, i) => {
                          const Icon = step.icon;
                          const done = i < currentStep;
                          const active = i === currentStep;
                          return (
                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: done || active ? 1 : 0.35, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-3 text-sm">
                              <div className={`h-7 w-7 rounded-full flex items-center justify-center transition-all ${done ? "bg-green-500 text-white shadow-md shadow-green-500/30" : active ? "bg-primary text-primary-foreground animate-pulse shadow-md shadow-primary/30" : "bg-muted text-muted-foreground"}`}>
                                {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
                              </div>
                              <span className={done ? "text-green-600 dark:text-green-400 font-medium" : active ? "text-foreground font-semibold" : "text-muted-foreground"}>{step.label}</span>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="border-0 shadow-2xl ring-2 ring-primary/20 overflow-hidden">
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }} className="h-24 w-24 rounded-3xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-8 shadow-2xl shadow-green-500/30">
                    <CheckCircle2 className="h-12 w-12 text-white" />
                  </motion.div>
                  <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-2xl font-extrabold mb-2">PRD Berhasil Digenerate! 🎉</motion.h2>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-sm text-muted-foreground mb-1">19 section lengkap + 4 diagram Mermaid siap diedit</motion.p>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-xs text-muted-foreground mb-8 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin text-primary" />Mengalihkan ke editor...</motion.p>
                </CardContent>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
