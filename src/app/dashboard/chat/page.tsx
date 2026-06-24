"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageSquare, Clock, ExternalLink, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n/language-context";
import { DEMO_PRID, DEMO_PRD } from "@/lib/mock-prd";

const fadeInUp = { hidden: { opacity: 0, y: 16 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.06 } }) };

const MOCK_CHATS = [
  { id: "chat-1", prdId: DEMO_PRID, prdTitle: DEMO_PRD.title, lastMessage: "Add 1 persona for enterprise users", messages: 4, updatedAt: "30m ago" },
  { id: "chat-2", prdId: "prd-002", prdTitle: "FinTrack — Personal Finance Manager", lastMessage: "Revise architecture section — switch to microservices", messages: 7, updatedAt: "1h ago" },
  { id: "chat-3", prdId: "prd-003", prdTitle: "EduConnect — Online Learning Platform", lastMessage: "Add use case for certification", messages: 3, updatedAt: "2h ago" },
];

export default function ChatHistoryPage() {
  const { t } = useTranslation();

  return (
    <motion.div initial="hidden" animate="visible" className="mx-auto w-full max-w-4xl space-y-6">
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-extrabold tracking-tight text-balance">{t("chat.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("chat.subtitle")}</p>
      </motion.div>
      <motion.div variants={fadeInUp} custom={1} className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder={t("chat.search")} className="pl-10 rounded-xl" />
      </motion.div>
      <Card className="border shadow-sm">
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {MOCK_CHATS.map((chat, i) => (
              <motion.li key={chat.id} variants={fadeInUp} custom={i + 2}>
                <Link href={`/editor/${chat.prdId}`} className="block px-5 py-4 hover:bg-muted/30 transition-colors group">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors"><MessageSquare className="h-5 w-5 text-primary" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 mb-1"><p className="font-semibold text-sm truncate">{chat.prdTitle}</p><span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1"><Clock className="h-3 w-3" />{chat.updatedAt}</span></div>
                      <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                      <Badge variant="secondary" className="mt-2 text-[10px]">{chat.messages} {t("chat.messages")}</Badge>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 mt-1" />
                  </div>
                </Link>
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}
