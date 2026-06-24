"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation, type Language } from "@/lib/i18n/language-context";

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
];

export function LanguageSwitcher() {
  const { lang, setLang } = useTranslation();

  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl relative"
          aria-label="Switch language"
        >
          <Globe className="h-4 w-4" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        {LANGUAGES.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setLang(language.code)}
            className={`flex items-center gap-3 cursor-pointer ${
              lang === language.code
                ? "bg-primary/10 text-primary font-semibold"
                : ""
            }`}
          >
            <span className="text-base">{language.flag}</span>
            <span>{language.label}</span>
            {lang === language.code && (
              <motion.div
                layoutId="lang-check"
                className="ml-auto h-2 w-2 rounded-full bg-primary"
              />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
