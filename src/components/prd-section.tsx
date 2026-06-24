"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MermaidRenderer } from "@/components/mermaid-renderer";
import { cn } from "@/lib/utils";

interface PrdSectionProps { title: string; content: string; sectionIndex: number; onSave?: (newContent: string) => void; }

export function PrdSection({ title, content, sectionIndex, onSave }: PrdSectionProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState(content);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => { if (isEditing && textareaRef.current) textareaRef.current.focus(); }, [isEditing]);
  React.useEffect(() => { if (!isEditing) setEditContent(content); }, [content, isEditing]);

  const handleSave = () => { onSave?.(editContent); setIsEditing(false); };
  const handleCancel = () => { setEditContent(content); setIsEditing(false); };

  const renderContent = () => {
    if (isEditing) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <Textarea ref={textareaRef} value={editContent} onChange={(e) => setEditContent(e.target.value)} className="min-h-[260px] font-mono text-[0.8rem] leading-relaxed rounded-xl bg-muted/30 focus-visible:ring-primary/30" />
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleSave} className="gap-1.5 rounded-xl shadow-sm shadow-primary/20"><Check className="h-3.5 w-3.5" />Simpan</Button>
            <Button size="sm" variant="ghost" onClick={handleCancel} className="gap-1.5 rounded-xl"><X className="h-3.5 w-3.5" />Batal</Button>
            <span className="ml-auto text-[11px] text-muted-foreground">Markdown + Mermaid didukung</span>
          </div>
        </motion.div>
      );
    }

    const parts = content.split(/(```mermaid[\s\S]*?```)/g);
    return parts.map((part, i) => {
      const mermaidMatch = part.match(/```mermaid\n?([\s\S]*?)```/);
      if (mermaidMatch) {
        return (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="my-5">
            <MermaidRenderer code={mermaidMatch[1].trim()} />
          </motion.div>
        );
      }
      return (
        <div key={i} className="prose prose-sm dark:prose-invert max-w-none
          prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground
          prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-base prose-h3:mt-5 prose-h3:mb-2
          prose-p:leading-relaxed prose-p:text-[0.9rem] prose-p:text-foreground/85
          prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline
          prose-strong:text-foreground prose-strong:font-semibold
          prose-code:text-xs prose-code:bg-primary/10 prose-code:text-primary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-medium prose-code:before:content-[''] prose-code:after:content-['']
          prose-pre:bg-muted prose-pre:text-xs prose-pre:rounded-xl prose-pre:ring-1 prose-pre:ring-border
          prose-ul:my-3 prose-ol:my-3 prose-li:text-[0.9rem] prose-li:leading-relaxed prose-li:marker:text-primary
          prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:not-italic
          prose-hr:border-border
          [&_table]:w-full [&_table]:border-collapse [&_table]:rounded-xl [&_table]:overflow-hidden [&_table]:ring-1 [&_table]:ring-border [&_table]:my-4 [&_table]:text-sm
          [&_thead]:bg-muted/60
          [&_th]:px-3.5 [&_th]:py-2.5 [&_th]:text-left [&_th]:font-semibold [&_th]:text-foreground [&_th]:border-b [&_th]:border-border
          [&_td]:px-3.5 [&_td]:py-2.5 [&_td]:border-b [&_td]:border-border/60 [&_td]:align-top
          [&_tbody_tr:last-child_td]:border-b-0 [&_tbody_tr:hover]:bg-muted/30 [&_tbody_tr]:transition-colors
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{part || " "}</ReactMarkdown>
        </div>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: Math.min(sectionIndex * 0.015, 0.2) }}
      className={cn(
        "group relative scroll-mt-20 rounded-2xl border bg-card transition-all duration-300",
        isEditing
          ? "border-primary/40 ring-2 ring-primary/15 shadow-premium"
          : "border-border/60 hover:border-primary/30 hover:shadow-premium"
      )}
    >
      <div className="flex items-center justify-between gap-3 px-5 sm:px-6 pt-5 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-chart-3 text-[11px] font-bold text-primary-foreground shadow-sm shadow-primary/30 tabular-nums">
            {sectionIndex}
          </span>
          <h3 className="font-display text-base sm:text-lg font-semibold tracking-tight truncate">{title}</h3>
        </div>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 rounded-lg text-xs text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all shrink-0"
            onClick={() => { setEditContent(content); setIsEditing(true); }}
          >
            <Pencil className="h-3.5 w-3.5" />Edit
          </Button>
        )}
      </div>
      <div className="h-px bg-gradient-to-r from-border via-border/40 to-transparent mx-5 sm:mx-6 mb-4" />
      <div className="px-5 sm:px-6 pb-6">{renderContent()}</div>
    </motion.div>
  );
}
