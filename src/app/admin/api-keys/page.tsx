"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Key, Plus, CheckCircle2, XCircle, Zap, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiFetch } from "@/lib/api-client";
import { formatRelative } from "@/lib/format";

const fadeInUp = { hidden: { opacity: 0, y: 16 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.06 } }) };

interface ApiKeyConfig {
  configured: boolean;
  provider: string;
  model: string;
  isActive?: boolean;
  maskedKey?: string | null;
  updatedAt?: string;
}

export default function AdminApiKeysPage() {
  const [config, setConfig] = React.useState<ApiKeyConfig | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [model, setModel] = React.useState("deepseek-chat");
  const [apiKey, setApiKey] = React.useState("");
  const [testing, setTesting] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [testResult, setTestResult] = React.useState<{ ok: boolean; msg: string } | null>(null);

  const load = React.useCallback(async () => {
    try {
      const data = await apiFetch<ApiKeyConfig>("/api/admin/apikey");
      setConfig(data);
      if (data.model) setModel(data.model);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const data = await apiFetch<{ status: string; latencyMs?: number; message?: string }>(
        "/api/admin/apikey/test",
        { method: "POST" }
      );
      if (data.status === "ok") {
        setTestResult({ ok: true, msg: `Connected — ${data.latencyMs}ms` });
      } else {
        setTestResult({ ok: false, msg: data.message ?? "Connection failed" });
      }
    } catch (err) {
      setTestResult({ ok: false, msg: err instanceof Error ? err.message : "Gagal test" });
    } finally {
      setTesting(false);
    }
  }

  async function handleSave() {
    if (apiKey.trim().length < 8) { toast.error("API key terlalu pendek"); return; }
    setSaving(true);
    try {
      await apiFetch("/api/admin/apikey", {
        method: "POST",
        body: JSON.stringify({ provider: "deepseek", apiKey: apiKey.trim(), model, isActive: true }),
      });
      toast.success("API key tersimpan (terenkripsi)");
      setApiKey("");
      setShowAddForm(false);
      setTestResult(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div initial="hidden" animate="visible" className="mx-auto w-full max-w-4xl space-y-6">
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-balance">API Key Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola API key DeepSeek. Disimpan terenkripsi AES-256-GCM.</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} disabled={showAddForm} className="gap-2 rounded-xl font-semibold shadow-lg shadow-primary/25">
          <Plus className="h-4 w-4" />{config?.configured ? "Perbarui Key" : "Tambah API Key"}
        </Button>
      </motion.div>

      <motion.div variants={fadeInUp} custom={1} className="grid grid-cols-1 sm:grid-cols-3 auto-rows-fr gap-4">
        {[
          { label: "DeepSeek API", status: config?.configured && config?.isActive ? "Connected" : "Belum diset", active: !!(config?.configured && config?.isActive) },
          { label: "Model", status: config?.model ?? "—", active: true },
          { label: "Encryption", status: "AES-256-GCM", active: true },
        ].map((item) => (
          <Card key={item.label} className="h-full flex flex-col border shadow-sm">
            <CardContent className="flex h-full flex-col p-5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{item.label}</span>
              <div className="flex items-center gap-2.5 mt-auto">
                <div className={`h-2.5 w-2.5 rounded-full ${item.active ? "bg-green-500 animate-pulse" : "bg-muted-foreground/40"}`} />
                <span className="font-bold text-lg">{item.status}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <Card className="border shadow-md ring-1 ring-primary/10">
              <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2"><Plus className="h-5 w-5 text-primary" />Set API Key DeepSeek</CardTitle>
                <CardDescription>Key dienkripsi sebelum disimpan ke database.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-5">
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="deepseek-chat" className="rounded-xl font-mono" />
                  <p className="text-[10px] text-muted-foreground">Contoh: deepseek-chat atau deepseek-reasoner.</p>
                </div>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-xxxxxxxxxxxxxxxx" autoComplete="off" className="rounded-xl font-mono" />
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3" />Dienkripsi AES-256-GCM.</p>
                </div>
                <Separator />
                <div className="flex flex-wrap items-center gap-3">
                  <Button onClick={handleSave} disabled={saving || apiKey.trim().length < 8} className="rounded-xl font-semibold shadow-lg shadow-primary/25">
                    {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Menyimpan...</> : "Simpan API Key"}
                  </Button>
                  <Button onClick={handleTest} disabled={testing || !config?.configured} variant="outline" className="rounded-xl font-semibold">
                    {testing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Testing...</> : <><Zap className="h-4 w-4 mr-2" />Test Koneksi</>}
                  </Button>
                  {testResult && (
                    <Badge className={testResult.ok ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs"}>
                      {testResult.ok ? <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> : <XCircle className="h-3.5 w-3.5 mr-1" />}{testResult.msg}
                    </Badge>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">Test koneksi memakai key yang sudah tersimpan. Simpan dulu sebelum test.</p>
                <div className="flex justify-end">
                  <Button variant="ghost" className="rounded-xl" onClick={() => { setShowAddForm(false); setTestResult(null); }}>Tutup</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : config?.configured ? (
        <motion.div variants={fadeInUp} custom={2}>
          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-lg"><Key className="h-6 w-6 text-primary" /></div>
                <div>
                  <div className="flex items-center gap-2"><span className="font-bold text-lg capitalize">{config.provider}</span>
                    <Badge className={config.isActive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 font-semibold" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 font-semibold"}>{config.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Model: {config.model}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div className="bg-muted/30 rounded-xl p-3"><span className="text-xs text-muted-foreground block mb-1">API Key</span><code className="text-xs font-mono font-semibold">{config.maskedKey ?? "••••"}</code></div>
                <div className="bg-muted/30 rounded-xl p-3"><span className="text-xs text-muted-foreground block mb-1">Terakhir diperbarui</span><p className="font-medium">{config.updatedAt ? formatRelative(config.updatedAt) : "—"}</p></div>
                <div className="bg-muted/30 rounded-xl p-3"><span className="text-xs text-muted-foreground block mb-1">Status</span><p className="font-medium">{config.isActive ? "Aktif" : "Nonaktif"}</p></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={fadeInUp} custom={2}>
          <Card className="border-dashed border-2 shadow-none">
            <CardContent className="py-12 text-center">
              <Key className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">Belum ada API key DeepSeek. Tambahkan agar fitur generate PRD aktif.</p>
              <Button onClick={() => setShowAddForm(true)} className="rounded-xl"><Plus className="h-4 w-4 mr-1" />Tambah API Key</Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
