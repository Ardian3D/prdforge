"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Sparkles, LayoutDashboard, FileText, LayoutTemplate, Bot, Users, Settings,
  Plus, Share2, ChevronDown, Star, Clock, CheckCircle2, Layers, FileDown, Network, Copy,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/language-context";

/* ---------- Floating feature card ---------- */
function FloatingCard({
  icon: Icon, title, desc, className = "", delay = 0,
}: {
  icon: React.ElementType; title: string; desc: string; className?: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 12 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={`w-56 rounded-2xl border border-white/10 bg-[oklch(0.2_0.025_285)]/80 p-4 shadow-xl backdrop-blur-md ${className}`}
    >
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 ring-1 ring-primary/30">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-white/55">{desc}</p>
    </motion.div>
  );
}

/* ---------- Mock app: sidebar nav item ---------- */
function NavItem({ icon: Icon, label, active = false }: { icon: React.ElementType; label: string; active?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium ${
        active ? "bg-white/8 text-white" : "text-white/55"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
  );
}

/* ---------- Mock app: flow node ---------- */
function FlowNode({ label, tone = "default" }: { label: string; tone?: "default" | "start" | "accent" }) {
  const tones = {
    default: "bg-white/8 text-white/80 border-white/10",
    start: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
    accent: "bg-primary/25 text-primary-foreground border-primary/40",
  } as const;
  return (
    <div className={`rounded-md border px-3 py-1.5 text-center text-[11px] font-medium ${tones[tone]}`}>{label}</div>
  );
}

function Connector() {
  return <div className="mx-auto h-3 w-px bg-white/15" />;
}

export function HeroShowcase() {
  const { t } = useTranslation();

  return (
    <div className="relative mx-auto mt-16 w-full max-w-5xl px-4">
      {/* Floating cards — desktop only (absolute), terhubung garis putus-putus */}
      <div className="pointer-events-none absolute inset-0 hidden xl:block">
        {/* connector lines */}
        <div className="absolute left-[8.5rem] top-[8.5rem] h-px w-10 border-t border-dashed border-white/25" />
        <div className="absolute left-[8.5rem] top-[17rem] h-px w-10 border-t border-dashed border-white/25" />
        <div className="absolute right-[8.5rem] top-[8.5rem] h-px w-10 border-t border-dashed border-white/25" />
        <div className="absolute right-[8.5rem] top-[17rem] h-px w-10 border-t border-dashed border-white/25" />
      </div>
      <div className="pointer-events-none absolute -left-8 top-24 z-20 hidden xl:block">
        <FloatingCard icon={Sparkles} title={t("showcase.card.ai.title")} desc={t("showcase.card.ai.desc")} delay={0.1} />
      </div>
      <div className="pointer-events-none absolute -left-8 top-[16rem] z-20 hidden xl:block">
        <FloatingCard icon={Layers} title={t("showcase.card.sections.title")} desc={t("showcase.card.sections.desc")} delay={0.2} />
      </div>
      <div className="pointer-events-none absolute -right-8 top-24 z-20 hidden xl:block">
        <FloatingCard icon={Network} title={t("showcase.card.diagrams.title")} desc={t("showcase.card.diagrams.desc")} delay={0.15} />
      </div>
      <div className="pointer-events-none absolute -right-8 top-[16rem] z-20 hidden xl:block">
        <FloatingCard icon={FileDown} title={t("showcase.card.export.title")} desc={t("showcase.card.export.desc")} delay={0.25} />
      </div>

      {/* Main product mockup */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.17_0.022_285)] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)]"
      >
        <div className="flex">
          {/* Sidebar */}
          <aside className="hidden w-52 shrink-0 flex-col border-r border-white/8 bg-[oklch(0.15_0.02_285)] p-3 md:flex">
            <div className="mb-4 flex items-center gap-2 px-2 pt-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-white">PRDForge</span>
            </div>
            <button className="mb-4 flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground">
              <Plus className="h-3.5 w-3.5" /> New PRD
            </button>
            <nav className="flex flex-col gap-0.5">
              <NavItem icon={LayoutDashboard} label="Dashboard" active />
              <NavItem icon={FileText} label="My PRDs" />
              <NavItem icon={LayoutTemplate} label="Templates" />
              <NavItem icon={Bot} label="AI Assistant" />
              <NavItem icon={Users} label="Team" />
              <NavItem icon={Settings} label="Settings" />
            </nav>
            <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs font-semibold text-white">Pro Plan</p>
              <p className="mb-2 text-[10px] text-white/45">Unlimited PRDs</p>
              <button className="w-full rounded-md bg-primary/25 py-1.5 text-[11px] font-semibold text-primary-foreground ring-1 ring-primary/40">Upgrade</button>
            </div>
          </aside>

          {/* Main panel */}
          <div className="min-w-0 flex-1 p-5">
            {/* header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">FinTrack – Personal Finance App</h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" /> Completed
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-white/45">
                  <Clock className="h-3 w-3" /> Generated in 58 seconds
                </p>
              </div>
              <div className="hidden items-center gap-2 sm:flex">
                <button className="flex items-center gap-1 rounded-lg border border-white/12 px-3 py-1.5 text-[11px] font-medium text-white/70">
                  <Share2 className="h-3 w-3" /> Share
                </button>
                <button className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground">
                  Export <ChevronDown className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* tabs */}
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-b border-white/8 pb-2 text-[11px]">
              <span className="border-b-2 border-primary pb-1.5 font-semibold text-white">1. Overview</span>
              {["2. Goals", "3. Users", "4. Features", "5. User Flow", "6. System Design", "…", "19. Appendix"].map((t2) => (
                <span key={t2} className="pb-1.5 text-white/45">{t2}</span>
              ))}
            </div>

            {/* content grid */}
            <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-2">
              {/* left: doc */}
              <div>
                <h4 className="text-[13px] font-bold text-white">1. Product Overview</h4>
                <p className="mt-2 text-[11px] leading-relaxed text-white/55">
                  FinTrack is a personal finance management app that helps users track expenses,
                  set budgets, and achieve financial goals through intuitive insights and smart automation.
                </p>
                <h5 className="mt-4 text-[12px] font-semibold text-white">1.1 Product Purpose</h5>
                <ul className="mt-2 space-y-1.5">
                  {["Help users take control of their finances", "Provide clear insights into spending habits", "Enable smarter budgeting and savings"].map((li) => (
                    <li key={li} className="flex items-start gap-2 text-[11px] text-white/60">
                      <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-primary" /> {li}
                    </li>
                  ))}
                </ul>
              </div>

              {/* right: diagrams */}
              <div className="space-y-3">
                <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                  <p className="mb-3 text-[11px] font-semibold text-white/80">User Flow Diagram</p>
                  <div className="mx-auto max-w-[15rem]">
                    <FlowNode label="Start" tone="start" />
                    <Connector />
                    <FlowNode label="Onboarding" />
                    <Connector />
                    <FlowNode label="Dashboard" />
                    <Connector />
                    <div className="grid grid-cols-3 gap-2">
                      <FlowNode label="Add Expense" />
                      <FlowNode label="Set Budget" />
                      <FlowNode label="View Reports" />
                    </div>
                    <Connector />
                    <FlowNode label="Financial Goals" tone="accent" />
                  </div>
                </div>
                <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-white/80">System Architecture (Mermaid)</p>
                    <span className="flex items-center gap-1 text-[10px] text-white/40"><Copy className="h-3 w-3" /> Copy</span>
                  </div>
                  <pre className="overflow-x-auto rounded-lg bg-black/40 p-3 text-[10px] leading-relaxed">
                    <code>
                      <span className="text-violet-300">graph</span> <span className="text-sky-300">TD</span>{"\n"}
                      {"  "}<span className="text-emerald-300">A[Mobile App]</span> <span className="text-white/50">--&gt;</span> <span className="text-emerald-300">B[API Gateway]</span>
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial bar */}
        <div className="flex flex-col items-center gap-4 border-t border-white/8 bg-[oklch(0.15_0.02_285)] px-5 py-4 md:flex-row md:gap-6">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {["from-violet-400 to-fuchsia-400", "from-sky-400 to-cyan-400", "from-amber-400 to-orange-400", "from-emerald-400 to-teal-400", "from-rose-400 to-pink-400", "from-indigo-400 to-blue-400"].map((g, i) => (
                <div key={i} className={`h-8 w-8 rounded-full bg-gradient-to-br ring-2 ring-[oklch(0.15_0.02_285)] ${g}`} />
              ))}
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                <span className="ml-1 text-sm font-bold text-white">4.9/5</span>
              </div>
              <p className="text-[11px] text-white/50">{t("showcase.builders")}</p>
            </div>
          </div>
          <div className="md:border-l md:border-white/10 md:pl-6">
            <p className="text-[12px] italic leading-relaxed text-white/70">&ldquo;{t("showcase.testimonial.quote")}&rdquo;</p>
            <p className="mt-1 text-[11px] text-white/45">
              <span className="font-semibold text-white/70">– {t("showcase.testimonial.author")}</span>, {t("showcase.testimonial.role")}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
