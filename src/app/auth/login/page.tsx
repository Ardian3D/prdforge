"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n/language-context";
import { useAuth } from "@/lib/auth/auth-context";

function LoginForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const redirect = searchParams.get("redirect") || "/dashboard";
  const oauthError = searchParams.get("error");

  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (oauthError) {
      const map: Record<string, string> = {
        google_not_configured: "Login Google belum dikonfigurasi.",
        google_state_mismatch: "Sesi Google tidak valid. Coba lagi.",
        user_banned: "Akun Anda diblokir.",
      };
      toast.error(map[oauthError] ?? "Login Google gagal. Coba lagi.");
    }
  }, [oauthError]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      toast.success("Berhasil masuk!");
      // Admin diarahkan ke panel admin.
      router.push(user.role === "admin" ? "/admin" : redirect);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal masuk";
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
        <CardTitle className="text-2xl">{t("auth.login.title")}</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">{t("auth.login.subtitle")}</p>
        {registered === "true" && <Badge variant="secondary" className="mt-3 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">{t("auth.login.registered")}</Badge>}
      </CardHeader>
      <CardContent className="space-y-4">
        <Button variant="outline" className="w-full h-11" asChild>
          <a href={`/api/auth/google?redirect=${encodeURIComponent(redirect)}`}>
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
            {t("auth.login.google")}
          </a>
        </Button>
        <div className="relative"><Separator /><span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">{t("auth.login.divider")}</span></div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
          <div className="space-y-2"><Label htmlFor="email">{t("auth.login.email")}</Label><Input id="email" type="email" placeholder="you@email.com" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="space-y-2">
            <div className="flex items-center justify-between"><Label htmlFor="password">{t("auth.login.password")}</Label><Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">{t("auth.login.forgot")}</Link></div>
            <div className="relative"><Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
          </div>
          <Button type="submit" className="w-full h-11" disabled={submitting}>
            {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Memproses...</> : t("auth.login.submit")}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">{t("auth.login.noAccount")} <Link href="/auth/register" className="text-primary font-medium hover:underline">{t("auth.login.signUp")}</Link></p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return <React.Suspense fallback={<Card className="border-2"><CardContent className="flex items-center justify-center py-20"><div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></CardContent></Card>}><LoginForm /></React.Suspense>;
}
