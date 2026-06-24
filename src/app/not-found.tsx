"use client";

import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/language-context";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6"><FileQuestion className="h-8 w-8 text-muted-foreground" /></div>
        <h1 className="text-2xl font-bold mb-2">{t("notFound.title")}</h1>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">{t("notFound.desc")}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="outline" asChild><Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />{t("notFound.dashboard")}</Link></Button>
          <Button asChild><Link href="/">{t("notFound.home")}</Link></Button>
        </div>
      </div>
    </div>
  );
}
