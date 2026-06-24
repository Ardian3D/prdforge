"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, HelpCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TIERS } from "@/lib/constants";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }),
};

const COMPARISON_ROWS = [
  { feature: "Generate PRD", free: "3x (seumur hidup)", starter: "5x / bulan", pro: "Unlimited", probundle: "Unlimited" },
  { feature: "AI Chat Revisi", free: "3x", starter: "100x / bulan", pro: "Unlimited", probundle: "Unlimited" },
  { feature: "AI Model", free: "Standard", starter: "Premium", pro: "Premium", probundle: "Premium" },
  { feature: "Export Markdown", free: "❌", starter: "✅", pro: "✅", probundle: "✅" },
  { feature: "Mermaid Diagrams", free: "✅", starter: "✅", pro: "✅", probundle: "✅" },
  { feature: "Inline Editor", free: "✅", starter: "✅", pro: "✅", probundle: "✅" },
  { feature: "Support", free: "Community", starter: "Standard", pro: "Prioritas", probundle: "Prioritas" },
  { feature: "AndaAI Pro", free: "❌", starter: "❌", pro: "❌", probundle: "✅ (Gratis)" },
];

const FAQS = [
  { q: "Apa yang terjadi setelah free tier saya habis?", a: "Kamu tetap bisa login dan melihat semua PRD yang sudah dibuat. Untuk generate PRD baru, kamu perlu upgrade ke paket Starter, Pro, atau Pro Bundle." },
  { q: "Apakah ada kontrak tahunan?", a: "Tidak ada. Semua paket bersifat bulanan dan kamu bisa cancel kapan saja. Tidak ada penalti atau biaya tersembunyi." },
  { q: "Apa beda AI Model Standard vs Premium?", a: "Standard menggunakan model AI yang lebih cepat tapi output lebih generik. Premium menggunakan model DeepSeek yang lebih advanced — output PRD lebih detail, akurat, dan kontekstual." },
  { q: "Apakah data PRD saya aman?", a: "Ya. PRD kamu disimpan terenkripsi di database. Hanya kamu yang bisa melihat PRD kamu. Kami tidak pernah menggunakan data kamu untuk training AI." },
  { q: "Bisa ganti paket di tengah bulan?", a: "Bisa. Kalau upgrade, kamu langsung dapat akses penuh. Selisih biaya dihitung pro-rata. Kalau downgrade, berlaku mulai bulan berikutnya." },
  { q: "Apa itu AndaAI Pro yang ada di Pro Bundle?", a: "AndaAI Pro adalah AI companion product dari Ardian3D yang membantu produktivitas harian — dari writing, research, hingga coding. Di Pro Bundle, kamu dapat akses gratis (biasanya Rp 99.000/bulan)." },
];

export default function PricingPage() {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-4 text-center relative"
        >
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />Harga Transparan
          </Badge>
          <h1 className="font-display text-4xl md:text-6xl font-semibold tracking-tight mb-4">
            Pilih paket yang tepat buat kamu
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Mulai gratis, upgrade kapan aja. Semua paket include AI-powered PRD generation dengan diagram Mermaid.
          </p>
        </motion.div>
      </section>

      {/* Tier Cards */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr gap-6 max-w-6xl mx-auto"
          >
            {Object.entries(TIERS).map(([key, tier], i) => (
              <motion.div key={key} variants={fadeInUp} custom={i}>
                <Card
                  className={`relative flex flex-col border-0 shadow-lg h-full overflow-hidden ${
                    tier.highlighted ? "ring-2 ring-primary shadow-xl shadow-primary/20 lg:scale-[1.05]" : "hover:shadow-xl"
                  } transition-all`}
                >
                  {tier.highlighted && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary to-accent" />
                  )}
                  {tier.highlighted && (
                    <Badge className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground font-semibold shadow-lg">
                      Paling Populer ✨
                    </Badge>
                  )}
                  <CardHeader className="text-center pb-2 pt-8">
                    <CardTitle className="text-xl font-bold">{tier.name}</CardTitle>
                    {"targetUsers" in tier && (
                      <p className="text-xs text-muted-foreground mt-2 px-2">{(tier as any).targetUsers}</p>
                    )}
                    <div className="mt-4">
                      <span className="text-5xl font-extrabold">{tier.price}</span>
                      {tier.priceMonthly > 0 && <span className="text-sm text-muted-foreground">/bulan</span>}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col p-6">
                    <p className="text-xs text-muted-foreground mb-6 text-center leading-relaxed">{tier.description}</p>
                    <ul className="space-y-3 mb-8 flex-1">
                      {tier.features.map((f, j) => (
                        <motion.li
                          key={f}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * j }}
                          viewport={{ once: true }}
                          className="flex items-start gap-3 text-sm"
                        >
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>{f}</span>
                        </motion.li>
                      ))}
                      {tier.limitations.map((l) => (
                        <li key={l} className="flex items-start gap-3 text-sm text-muted-foreground/60">
                          <span className="h-4 w-4 shrink-0 text-center">—</span><span>{l}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={tier.highlighted ? "default" : "outline"}
                      size="lg"
                      className={`w-full mt-auto rounded-xl font-semibold ${tier.highlighted ? "shadow-lg shadow-primary/25" : ""}`}
                      asChild
                    >
                      <Link href={key === "free" ? "/auth/register" : `/auth/register?tier=${key}`}>{tier.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 md:py-24 bg-muted/10">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl font-semibold text-center mb-12">Perbandingan Fitur Lengkap</h2>
            <div className="max-w-4xl mx-auto overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px] font-semibold">Fitur</TableHead>
                    <TableHead className="text-center font-semibold">Free</TableHead>
                    <TableHead className="text-center font-semibold">Starter</TableHead>
                    <TableHead className="text-center bg-primary/5 font-semibold">Pro</TableHead>
                    <TableHead className="text-center font-semibold">Pro Bundle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {COMPARISON_ROWS.map((row) => (
                    <TableRow key={row.feature} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{row.feature}</TableCell>
                      <TableCell className="text-center text-sm">{row.free}</TableCell>
                      <TableCell className="text-center text-sm">{row.starter}</TableCell>
                      <TableCell className="text-center text-sm bg-primary/5 font-semibold">{row.pro}</TableCell>
                      <TableCell className="text-center text-sm">{row.probundle}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5"><HelpCircle className="h-3.5 w-3.5 mr-1.5" />FAQ</Badge>
            <h2 className="font-display text-3xl font-semibold">Pertanyaan yang Sering Diajukan</h2>
          </motion.div>
          <Accordion className="space-y-2">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <AccordionItem value={`faq-${i}`} className="border rounded-xl px-4">
                  <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">{faq.a}</AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="container mx-auto px-4 text-center max-w-2xl relative z-10">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4">Masih ragu? Coba gratis dulu.</h2>
          <p className="text-white/70 text-lg mb-8">Generate PRD pertama kamu dalam 60 detik. Gak perlu kartu kredit.</p>
          <Button size="lg" variant="secondary" className="font-bold rounded-xl shadow-2xl hover:scale-105 transition-transform" asChild>
            <Link href="/auth/register">Mulai Gratis <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
