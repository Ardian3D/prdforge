"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Send, Sparkles, Bot, User, PanelRightClose, Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n/language-context";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface ChatMessage { id: string; role: "user" | "assistant"; content: string; timestamp: string }
interface Section { title: string; content: string }

interface ChatPanelProps {
  prdId?: string;
  onSectionsUpdated?: (sections: Section[]) => void;
  remainingRevisions?: number | null; // null = unlimited
}

export function ChatPanel({ prdId, onSectionsUpdated, remainingRevisions }: ChatPanelProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(true);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const [remaining, setRemaining] = React.useState<number | null>(
    remainingRevisions ?? null
  );
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const greeting = t("chat.panel.greeting");
  const exhausted = remaining !== null && remaining <= 0;
  const lowQuota = remaining !== null && remaining > 0 && remaining <= 1;

  React.useEffect(() => {
    setRemaining(remainingRevisions ?? null);
  }, [remainingRevisions]);

  // Muat riwayat chat (atau tampilkan greeting).
  React.useEffect(() => {
    let active = true;
    if (!prdId) {
      setMessages([{ id: "greet", role: "assistant", content: greeting, timestamp: "" }]);
      return;
    }
    (async () => {
      try {
        const data = await apiFetch<{ messages: { id: string; role: "user" | "assistant"; content: string; createdAt: string }[] }>(`/api/prd/${prdId}/chat`);
        if (!active) return;
        if (data.messages.length === 0) {
          setMessages([{ id: "greet", role: "assistant", content: greeting, timestamp: "" }]);
        } else {
          setMessages(
            data.messages.map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              timestamp: new Date(m.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
            }))
          );
        }
      } catch {
        if (active) setMessages([{ id: "greet", role: "assistant", content: greeting, timestamp: "" }]);
      }
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prdId]);

  React.useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isTyping) return;
    if (exhausted) {
      toast.error("Kuota revisi chat kamu sudah habis. Upgrade untuk lanjut.");
      return;
    }
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content: text, timestamp: "" }]);
    setInput("");
    setIsTyping(true);

    if (!prdId) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { id: `${Date.now()}a`, role: "assistant", content: t("chat.panel.response"), timestamp: "" }]);
        setIsTyping(false);
      }, 1200);
      return;
    }

    try {
      const data = await apiFetch<{ reply: string; sections: Section[] }>(`/api/prd/${prdId}/chat`, {
        method: "POST",
        body: JSON.stringify({ message: text }),
      });
      setMessages((prev) => [...prev, { id: `${Date.now()}a`, role: "assistant", content: data.reply, timestamp: "" }]);
      onSectionsUpdated?.(data.sections);
      setRemaining((r) => {
        if (r === null) return r;
        const next = Math.max(0, r - 1);
        if (next === 0) toast.warning("Itu revisi terakhir kamu. Kuota chat sekarang habis.");
        return next;
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal merevisi";
      // Jika kuota habis di server, kunci input.
      if (/kuota|quota|habis/i.test(msg)) {
        setRemaining(0);
        toast.error(msg);
      } else {
        setMessages((prev) => [...prev, { id: `${Date.now()}e`, role: "assistant", content: `⚠️ ${msg}` }] as ChatMessage[]);
      }
    } finally {
      setIsTyping(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  if (!isOpen) {
    return <Button variant="outline" size="icon" className="fixed bottom-6 right-6 h-12 w-12 rounded-2xl shadow-xl z-10" onClick={() => setIsOpen(true)}><Sparkles className="h-5 w-5 text-primary" /></Button>;
  }

  return (
    <motion.div initial={{ x: 300 }} animate={{ x: 0 }} className="flex flex-col h-full border-l bg-card shadow-lg w-80 lg:w-96 shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b glass shrink-0">
        <div className="flex items-center gap-2"><div className="h-7 w-7 rounded-xl bg-primary/10 flex items-center justify-center"><Sparkles className="h-3.5 w-3.5 text-primary" /></div><span className="font-bold text-sm">{t("chat.panel.title")}</span></div>
        <div className="flex items-center gap-1">
          <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0", exhausted ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : lowQuota ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "")}>{remaining === null ? "∞" : `${remaining}`} {t("chat.panel.left")}</Badge>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-xl" onClick={() => setIsOpen(false)}><PanelRightClose className="h-4 w-4" /></Button>
        </div>
      </div>
      <ScrollArea className="flex-1 px-4 py-4">
        <AnimatePresence>
          <div className="space-y-4">
            {messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={cn("flex gap-2.5", msg.role === "user" ? "justify-end" : "")}>
                {msg.role === "assistant" && <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0"><Bot className="h-3.5 w-3.5 text-primary" /></div>}
                <div className={cn("rounded-2xl px-4 py-3 text-sm max-w-[85%] shadow-sm", msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md")}>
                  <p className="whitespace-pre-wrap text-xs leading-relaxed">{msg.content}</p>
                  {msg.timestamp && <span className={cn("text-[10px] mt-2 block opacity-60", msg.role === "user" ? "text-primary-foreground" : "text-muted-foreground")}>{msg.timestamp}</span>}
                </div>
                {msg.role === "user" && <div className="h-7 w-7 rounded-xl bg-primary flex items-center justify-center shrink-0"><User className="h-3.5 w-3.5 text-primary-foreground" /></div>}
              </motion.div>
            ))}
            {isTyping && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5"><div className="h-7 w-7 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"><Bot className="h-3.5 w-3.5 text-primary" /></div><div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3"><div className="flex gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce" /><div className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce [animation-delay:0.15s]" /><div className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce [animation-delay:0.3s]" /></div></div></motion.div>}
            <div ref={messagesEndRef} />
          </div>
        </AnimatePresence>
      </ScrollArea>
      {exhausted ? (
        <div className="p-4 border-t shrink-0 bg-gradient-to-br from-amber-500/10 to-primary/5">
          <div className="rounded-2xl border border-amber-500/30 bg-card p-4 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15">
              <Lock className="h-5 w-5 text-amber-500" />
            </div>
            <p className="text-sm font-semibold mb-1">Kuota revisi habis</p>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Kamu sudah memakai semua jatah revisi chat. Upgrade paket untuk merevisi PRD tanpa batas.
            </p>
            <Button size="sm" className="w-full rounded-xl font-semibold gap-1.5 shadow-lg shadow-primary/25" asChild>
              <Link href="/dashboard/billing"><Crown className="h-4 w-4" />Upgrade Sekarang</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 border-t shrink-0 bg-muted/10">
          {lowQuota && (
            <p className="mb-2 text-[11px] text-amber-600 dark:text-amber-400 font-medium text-center">
              ⚠️ Tinggal {remaining} revisi tersisa.
            </p>
          )}
          <div className="flex gap-2">
            <Textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={t("chat.panel.placeholder")} className="min-h-[56px] text-sm resize-none rounded-2xl" rows={2} />
            <Button size="icon" className="h-[56px] w-[56px] shrink-0 rounded-2xl shadow-lg shadow-primary/20" onClick={handleSend} disabled={!input.trim() || isTyping}><Send className="h-5 w-5" /></Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">{t("chat.panel.hint")}</p>
        </div>
      )}
    </motion.div>
  );
}
