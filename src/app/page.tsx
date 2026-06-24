"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowRight, CheckCircle2, FileText, MessageSquare, Sparkles, Zap, Shield, Globe, Layers, Star, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TIERS } from "@/lib/constants";
import { useTranslation } from "@/lib/i18n/language-context";
import { DEMO_PRD } from "@/lib/mock-prd";
import { HeroShowcase } from "@/components/hero-showcase";
import { BrandLogos } from "@/components/brand-logos";

const fadeInUp = { hidden: { opacity: 0, y: 30 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.1, 0.25, 1] as const } }) };
const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } } };

// Bar progres scroll tipis di paling atas — memberi orientasi & kesan modern.
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return (
    <motion.div
      style={{ scaleX }}
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-primary via-chart-3 to-gold"
    />
  );
}

function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return <motion.section id={id} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeIn} className={className}>{children}</motion.section>;
}

function SectionHeader({ badgeKey, titleKey, subtitleKey }: { badgeKey: string; titleKey: string; subtitleKey?: string }) {
  const { t } = useTranslation();
  return (
    <motion.div variants={fadeInUp} className="text-center max-w-2xl mx-auto mb-16">
      <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase">{t(badgeKey as never)}</Badge>
      <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">{t(titleKey as never)}</h2>
      {subtitleKey && <p className="text-muted-foreground text-lg leading-relaxed">{t(subtitleKey as never)}</p>}
    </motion.div>
  );
}

const FEATURES = [
  { icon: Zap, titleKey: "features.ai.title", descKey: "features.ai.desc", color: "from-amber-500/20 to-orange-500/10", iconColor: "text-amber-500" },
  { icon: FileText, titleKey: "features.editor.title", descKey: "features.editor.desc", color: "from-blue-500/20 to-cyan-500/10", iconColor: "text-blue-500" },
  { icon: Layers, titleKey: "features.mermaid.title", descKey: "features.mermaid.desc", color: "from-purple-500/20 to-pink-500/10", iconColor: "text-purple-500" },
  { icon: MessageSquare, titleKey: "features.chat.title", descKey: "features.chat.desc", color: "from-green-500/20 to-emerald-500/10", iconColor: "text-green-500" },
  { icon: Shield, titleKey: "features.antiabuse.title", descKey: "features.antiabuse.desc", color: "from-red-500/20 to-rose-500/10", iconColor: "text-red-500" },
  { icon: Globe, titleKey: "features.export.title", descKey: "features.export.desc", color: "from-indigo-500/20 to-violet-500/10", iconColor: "text-indigo-500" },
];

const TESTIMONIALS = [
  { name: "Raka P.", roleKey: "Solo Founder @ TechStart", textKey: "PRDForge ngebantu banget buat validasi ide ke investor. Biasanya seminggu nulis PRD, sekarang 5 menit jadi. Diagram-nya bikin presentasi keliatan pro." },
  { name: "Bu Dina K.", roleKey: "Product Manager @ Telco", textKey: "10 tim minta format PRD beda-beda. Sekarang semua tim pakai PRDForge, format konsisten, revisi gampang. Hemat 4 jam per PRD." },
  { name: "Dimas A.", roleKey: "Freelance Developer", textKey: "Client gue impressed banget sama output PRD-nya. Padahal gue cuma ngetik deskripsi doang. Worth it banget buat freelancer." },
];

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col overflow-x-hidden">
      <ScrollProgress />
      {/* HERO */}
      <section className="relative flex flex-col items-center overflow-hidden bg-[oklch(0.15_0.022_285)] text-white">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-1/4 left-1/2 h-[700px] w-[1100px] -translate-x-1/2 rounded-full bg-primary/25 blur-[150px]" />
          <div className="absolute top-[8%] left-[10%] h-72 w-72 rounded-full bg-fuchsia-500/20 blur-[120px]" />
          <div className="absolute top-[18%] right-[8%] h-64 w-64 rounded-full bg-sky-500/15 blur-[120px]" />
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(oklch(0.7 0.05 285) 1px, transparent 1px), linear-gradient(90deg, oklch(0.7 0.05 285) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage: "radial-gradient(ellipse 75% 55% at 50% 0%, #000 35%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(ellipse 75% 55% at 50% 0%, #000 35%, transparent 100%)",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-background" />
        </div>

        <div className="container mx-auto px-4 pt-28 pb-24 md:pt-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur">
                <Sparkles className="h-4 w-4 text-primary" />{t("hero.badge")}
              </span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05] text-white">
              {t("hero.title.part1")} <span className="gradient-text italic">{t("hero.title.highlight")}</span><br />{t("hero.title.part2")}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mt-6 text-lg sm:text-xl text-white/65 leading-relaxed max-w-2xl mx-auto">{t("hero.subtitle")}</motion.p>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="text-base px-9 h-14 font-semibold rounded-xl bg-gradient-to-r from-primary to-fuchsia-600 hover:to-fuchsia-500 text-white shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all" asChild><Link href="/auth/register">{t("hero.cta.free")} <ArrowRight className="ml-2 h-5 w-5" /></Link></Button>
              <Button variant="outline" size="lg" className="text-base px-8 h-14 rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white" asChild><Link href="#demo"><Play className="mr-2 h-4 w-4 fill-current" />{t("hero.cta.demo")}</Link></Button>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }} className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/60">
              {["hero.trust.item1", "hero.trust.item2", "hero.trust.item3"].map((k) => (
                <span key={k} className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" />{t(k as never)}</span>
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55 }} className="mt-12">
              {(() => { const parts = t("trust.title").split("500+"); return (
                <p className="text-sm text-white/55">{parts[0]}<span className="font-bold text-primary">500+</span>{parts[1]}</p>
              ); })()}
              <BrandLogos className="mt-6" />
            </motion.div>
          </div>

          <HeroShowcase />
        </div>
      </section>

      {/* FEATURES */}
      <Section id="features" className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <SectionHeader badgeKey="features.badge" titleKey="features.title" subtitleKey="features.subtitle" />
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={f.titleKey} variants={fadeInUp} custom={i} className="h-full">
                <Card className="card-shine h-full flex flex-col group relative overflow-hidden border shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-premium hover:border-primary/30">
                  <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <CardHeader className="relative">
                    <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 ring-1 ring-foreground/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}><f.icon className={`h-6 w-6 ${f.iconColor}`} /></div>
                    <CardTitle className="text-lg font-semibold">{t(f.titleKey as never)}</CardTitle>
                  </CardHeader>
                  <CardContent className="relative"><p className="text-sm text-muted-foreground leading-relaxed">{t(f.descKey as never)}</p></CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* HOW IT WORKS */}
      <Section id="how-it-works" className="py-24 md:py-32 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <SectionHeader badgeKey="how.badge" titleKey="how.title" subtitleKey="how.subtitle" />
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[{ step: "01", titleKey: "how.step1.title", descKey: "how.step1.desc", icon: FileText }, { step: "02", titleKey: "how.step2.title", descKey: "how.step2.desc", icon: Sparkles }, { step: "03", titleKey: "how.step3.title", descKey: "how.step3.desc", icon: CheckCircle2 }].map((item, i) => (
              <motion.div key={item.step} variants={fadeInUp} custom={i} whileHover={{ y: -5 }} className="relative">
                {i < 2 && <div className="hidden md:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 bg-gradient-to-r from-primary/30 to-primary/10" />}
                <Card className="relative border-0 shadow-lg text-center overflow-hidden group hover:shadow-xl transition-shadow">
                  <CardContent className="p-8">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"><item.icon className="h-7 w-7 text-primary" /></div>
                    <div className="text-xs font-extrabold text-primary/40 mb-3 tracking-widest">{item.step}</div>
                    <h3 className="font-bold text-lg mb-3">{t(item.titleKey as never)}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t(item.descKey as never)}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* DEMO */}
      <Section id="demo" className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <SectionHeader badgeKey="demo.badge" titleKey="demo.title" subtitleKey="demo.subtitle" />
          <motion.div variants={scaleIn} className="max-w-4xl mx-auto">
            <Card className="overflow-hidden border-0 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b px-6 py-5">
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"><FileText className="h-4 w-4 text-primary" /></div>
                  <div><p className="text-xs text-muted-foreground">Demo PRD</p><p className="font-semibold truncate">{DEMO_PRD.title}</p></div>
                </div>
              </CardHeader>
              <CardContent className="p-6 md:p-8 max-h-[500px] overflow-y-auto">
                <h3 className="text-xl font-bold mb-2">{DEMO_PRD.title}</h3>
                <p className="text-sm text-muted-foreground mb-6">{DEMO_PRD.description}</p>
                <Separator className="mb-6" />
                {DEMO_PRD.sections.slice(0, 6).map((section, i) => (
                  <motion.div key={i} variants={fadeInUp} custom={i} className="mb-6">
                    <h4 className="font-semibold text-base mb-2">{i + 1}. {section.title}</h4>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 rounded-xl p-5 max-h-48 overflow-y-auto font-mono text-xs leading-relaxed">{section.content.slice(0, 500)}{section.content.length > 500 ? "..." : ""}</div>
                  </motion.div>
                ))}
                <p className="text-center text-sm text-muted-foreground mt-4 font-medium">{t("demo.more")}</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={fadeInUp} className="text-center mt-10">
            <Button size="lg" className="rounded-xl shadow-xl shadow-primary/30 font-semibold" asChild><Link href="/auth/register">{t("demo.cta")} <ArrowRight className="ml-2 h-5 w-5" /></Link></Button>
          </motion.div>
        </div>
      </Section>

      {/* PRICING */}
      <Section className="py-24 md:py-32 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4">
          <SectionHeader badgeKey="pricing.badge" titleKey="pricing.title" subtitleKey="pricing.subtitle" />
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr gap-6 max-w-6xl mx-auto">
            {Object.entries(TIERS).map(([key, tier], i) => (
              <motion.div key={key} variants={fadeInUp} custom={i} className="h-full">
                <Card className={`card-shine h-full flex flex-col border overflow-hidden transition-all duration-500 ${tier.highlighted ? "ring-2 ring-primary shadow-premium scale-[1.02] lg:scale-105" : "shadow-sm hover:shadow-premium hover:-translate-y-1.5 hover:border-primary/30"}`}>
                  {tier.highlighted && <div className="h-1 bg-gradient-to-r from-primary via-chart-3 to-gold" />}
                  {tier.highlighted && <Badge className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground font-semibold shadow-lg">{t("pricing.popular")}</Badge>}
                  <CardHeader className="text-center pb-2 pt-8"><CardTitle className="text-xl font-bold">{tier.name}</CardTitle>
                    <div className="mt-4"><span className="text-4xl font-extrabold">{tier.price}</span>{tier.priceMonthly > 0 && <span className="text-sm text-muted-foreground">{t("pricing.monthly")}</span>}</div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col p-6">
                    <ul className="space-y-3 mb-8 flex-1">
                      {tier.features.map((f, j) => (
                        <motion.li key={f} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * j }} viewport={{ once: true }} className="flex items-start gap-3 text-sm"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /><span>{f}</span></motion.li>
                      ))}
                      {tier.limitations.map((l) => <li key={l} className="flex items-start gap-3 text-sm text-muted-foreground/60"><span className="h-4 w-4 shrink-0 text-center">—</span><span>{l}</span></li>)}
                    </ul>
                    <Button variant={tier.highlighted ? "default" : "outline"} size="lg" className={`w-full mt-auto rounded-xl font-semibold ${tier.highlighted ? "shadow-lg shadow-primary/25" : ""}`} asChild><Link href={key === "free" ? "/auth/register" : `/auth/register?tier=${key}`}>{tier.cta}</Link></Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          <motion.div variants={fadeInUp} className="text-center mt-12">
            <Button variant="link" className="font-semibold" asChild><Link href="/pricing">{t("pricing.compare.link")} <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
          </motion.div>
        </div>
      </Section>

      {/* TESTIMONIALS */}
      <Section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <SectionHeader badgeKey="testimonials.badge" titleKey="testimonials.title" />
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 auto-rows-fr gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((tItem, i) => (
              <motion.div key={tItem.name} variants={fadeInUp} custom={i} className="h-full">
                <Card className="h-full flex flex-col border shadow-sm hover:shadow-md transition-shadow"><CardContent className="p-7">
                  <div className="flex gap-1 mb-4">{[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>
                  <p className="text-sm leading-relaxed mb-5 italic">&ldquo;{tItem.textKey}&rdquo;</p>
                  <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center font-bold text-sm">{tItem.name[0]}</div><div><p className="font-semibold text-sm">{tItem.name}</p><p className="text-xs text-muted-foreground">{tItem.roleKey}</p></div></div>
                </CardContent></Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* CTA */}
      <Section className="py-24 md:py-32 relative overflow-hidden grain">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-chart-3/90 to-chart-2" />
        <div className="absolute -top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-white/10 blur-[120px]" />
        <motion.div variants={fadeInUp} className="container mx-auto px-4 text-center relative z-10">
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-white mb-6 tracking-tight">{t("cta.title")}</h2>
          <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">{t("cta.subtitle")}</p>
          <Button size="lg" variant="secondary" className="text-base px-12 h-14 font-bold rounded-xl shadow-2xl hover:scale-105 transition-transform" asChild><Link href="/auth/register">{t("cta.button")} <ArrowRight className="ml-2 h-5 w-5" /></Link></Button>
        </motion.div>
      </Section>
    </div>
  );
}
