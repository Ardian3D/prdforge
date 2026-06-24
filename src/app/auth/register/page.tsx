"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, Eye, EyeOff, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/lib/i18n/language-context";
import { useAuth } from "@/lib/auth/auth-context";

function RegisterForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const { register } = useAuth();
  const searchParams = useSearchParams();
  const preselectedTier = searchParams.get("tier") || "free";

  const [showPassword, setShowPassword] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({ name: name.trim() || undefined, email, password });
      toast.success("Akun berhasil dibuat!");
      const dest = preselectedTier !== "free" ? `/dashboard/billing?tier=${preselectedTier}` : "/dashboard";
      router.push(dest);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal mendaftar";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="border-2">
      <CardHeader className="text-center pb-6">
        <Link href="/" className="flex items-center justify-center gap-2 mb-4"><Sparkles className="h-6 w-6 text-primary" /><span className="font-bold text-xl">PRDForge</span></Link>
        <CardTitle className="text-2xl">{t("auth.register.title")}</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">{t("auth.register.subtitle")}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button variant="outline" className="w-full h-11" asChild>
          <a href="/api/auth/google">
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
            {t("auth.register.google")}
          </a>
        </Button>
        <div className="relative"><Separator /><span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">{t("auth.register.divider")}</span></div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
          <div className="space-y-2"><Label htmlFor="name">{t("auth.register.name")}</Label><Input id="name" type="text" placeholder="Your name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="email">{t("auth.register.email")}</Label><Input id="email" type="email" placeholder="you@email.com" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="password">{t("auth.register.password")}</Label>
            <div className="relative"><Input id="password" type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" required autoComplete="new-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
          </div>
          <div className="bg-primary/5 rounded-xl p-4">
            <div className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" /><div><p className="text-sm font-medium">{preselectedTier === "free" ? t("auth.register.tier.info") : `Tier ${preselectedTier}`}</p><p className="text-xs text-muted-foreground mt-1">{preselectedTier === "free" ? t("auth.register.tier.desc") : t("auth.register.tier.paid")}</p></div></div>
          </div>
          <Button type="submit" className="w-full h-11" disabled={submitting}>
            {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Memproses...</> : t("auth.register.submit")}
          </Button>
        </form>
        <p className="text-xs text-center text-muted-foreground leading-relaxed">{t("auth.register.terms")} <Link href="#" className="text-primary hover:underline">{t("auth.register.tos")}</Link> {t("auth.login.divider")} <Link href="#" className="text-primary hover:underline">{t("auth.register.privacy")}</Link>.</p>
        <p className="text-center text-sm text-muted-foreground">{t("auth.register.hasAccount")} <Link href="/auth/login" className="text-primary font-medium hover:underline">{t("auth.register.signIn")}</Link></p>
      </CardContent>
    </Card>
  );
}

export default function RegisterPage() {
  return <React.Suspense fallback={<Card className="border-2"><CardContent className="flex items-center justify-center py-20"><div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></CardContent></Card>}><RegisterForm /></React.Suspense>;
}
