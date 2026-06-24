"use client";

import * as React from "react";
import { en, id, type TranslationKey } from "./translations";

export type Language = "en" | "id";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = React.createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => en[key] || key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Language>("en");

  // Load saved language preference
  React.useEffect(() => {
    const saved = localStorage.getItem("prdforge-lang") as Language | null;
    if (saved === "en" || saved === "id") {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("prdforge-lang", newLang);
  };

  const t = React.useCallback(
    (key: TranslationKey): string => {
      const translations = lang === "id" ? id : en;
      return translations[key] || en[key] || key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return React.useContext(LanguageContext);
}
