"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { User, Globe, Shield, Save, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/lib/i18n/language-context";

const fadeInUp = { hidden: { opacity: 0, y: 16 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.06 } }) };

export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <motion.div initial="hidden" animate="visible" className="mx-auto w-full max-w-2xl space-y-6">
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-extrabold tracking-tight text-balance">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("settings.subtitle")}</p>
      </motion.div>

      <motion.div variants={fadeInUp} custom={1}>
        <Card className="border shadow-sm">
          <CardHeader className="border-b pb-4"><CardTitle className="text-lg font-bold flex items-center gap-2"><User className="h-5 w-5" />{t("settings.profile")}</CardTitle><CardDescription>{t("settings.profile.desc")}</CardDescription></CardHeader>
          <CardContent className="space-y-4 pt-5">
            <div className="flex items-center gap-4 mb-2">
              <div className="relative shrink-0"><div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-xl font-bold">U</div><Button variant="secondary" size="icon" className="h-7 w-7 rounded-lg absolute -bottom-1 -right-1 shadow"><Camera className="h-3.5 w-3.5" /></Button></div>
              <div><p className="font-semibold">User Name</p><p className="text-sm text-muted-foreground">user@email.com</p></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t("settings.profile.name")}</Label><Input defaultValue="User Name" className="rounded-xl" /></div>
              <div className="space-y-2"><Label>{t("settings.profile.email")}</Label><Input defaultValue="user@email.com" disabled className="rounded-xl" /></div>
            </div>
            <Button className="rounded-xl font-semibold"><Save className="h-4 w-4 mr-2" />{t("settings.profile.save")}</Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeInUp} custom={2}>
        <Card className="border shadow-sm">
          <CardHeader className="border-b pb-4"><CardTitle className="text-lg font-bold flex items-center gap-2"><Globe className="h-5 w-5" />{t("settings.preferences")}</CardTitle></CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              <li className="flex items-center justify-between gap-4 px-5 py-4"><div><p className="font-medium text-sm">{t("settings.prefs.language")}</p><p className="text-xs text-muted-foreground">{t("settings.prefs.language.desc")}</p></div><Select defaultValue="id"><SelectTrigger className="w-[140px] rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="id">🇮🇩 Indonesia</SelectItem><SelectItem value="en">🇬🇧 English</SelectItem></SelectContent></Select></li>
              <li className="flex items-center justify-between gap-4 px-5 py-4"><div><p className="font-medium text-sm">{t("settings.prefs.notifications")}</p><p className="text-xs text-muted-foreground">{t("settings.prefs.notifications.desc")}</p></div><Switch defaultChecked /></li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeInUp} custom={3}>
        <Card className="border shadow-sm">
          <CardHeader className="border-b pb-4"><CardTitle className="text-lg font-bold flex items-center gap-2"><Shield className="h-5 w-5" />{t("settings.security")}</CardTitle></CardHeader>
          <CardContent className="space-y-4 pt-5">
            <div className="space-y-2"><Label>{t("settings.security.newPassword")}</Label><Input type="password" placeholder="••••••••" className="rounded-xl" /></div>
            <div className="space-y-2"><Label>{t("settings.security.confirm")}</Label><Input type="password" placeholder="••••••••" className="rounded-xl" /></div>
            <Button variant="outline" className="rounded-xl font-semibold">{t("settings.security.change")}</Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
