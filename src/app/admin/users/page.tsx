"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Search, MoreHorizontal, Ban, ShieldCheck, Filter, Users, UserPlus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { apiFetch } from "@/lib/api-client";
import { formatDate } from "@/lib/format";

const fadeInUp = { hidden: { opacity: 0, y: 16 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.06 } }) };

interface AdminUser {
  id: string; email: string; name: string | null; role: string; tier: string;
  generationCount: number; revisionCount: number; isBanned: boolean; provider: string; createdAt: string;
}

const TIER_COLORS: Record<string, string> = {
  free: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  starter: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  pro: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  probundle: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export default function AdminUsersPage() {
  const [search, setSearch] = React.useState("");
  const [tierFilter, setTierFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ pageSize: "100" });
      if (search.trim()) qs.set("search", search.trim());
      if (tierFilter !== "all") qs.set("tier", tierFilter);
      const data = await apiFetch<{ users: AdminUser[]; total: number }>(`/api/admin/users?${qs}`);
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memuat user");
    } finally {
      setLoading(false);
    }
  }, [search, tierFilter]);

  React.useEffect(() => {
    const tmr = setTimeout(load, 300);
    return () => clearTimeout(tmr);
  }, [load]);

  const filtered = users.filter((u) =>
    statusFilter === "all" ? true : statusFilter === "banned" ? u.isBanned : !u.isBanned
  );

  async function toggleBan(user: AdminUser) {
    const banning = !user.isBanned;
    if (banning) {
      const reason = window.prompt(`Alasan ban untuk ${user.email}:`, "Pelanggaran ketentuan");
      if (reason === null) return;
      try {
        await apiFetch(`/api/admin/users/${user.id}/ban`, { method: "POST", body: JSON.stringify({ banned: true, reason }) });
        toast.success("User di-ban");
        load();
      } catch (err) { toast.error(err instanceof Error ? err.message : "Gagal"); }
    } else {
      try {
        await apiFetch(`/api/admin/users/${user.id}/ban`, { method: "POST", body: JSON.stringify({ banned: false }) });
        toast.success("Ban dicabut");
        load();
      } catch (err) { toast.error(err instanceof Error ? err.message : "Gagal"); }
    }
  }

  const bannedCount = users.filter((u) => u.isBanned).length;
  const STATS = [
    { label: "Total Users", value: String(total), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Ditemukan", value: String(filtered.length), icon: UserPlus, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Banned", value: String(bannedCount), icon: Ban, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  return (
    <motion.div initial="hidden" animate="visible" className="mx-auto w-full max-w-6xl space-y-6">
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-balance">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">{total} user terdaftar · {filtered.length} ditampilkan</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-3 auto-rows-fr gap-4">
        {STATS.map((stat, i) => (
          <motion.div key={stat.label} variants={fadeInUp} custom={i + 1} className="h-full">
            <Card className="h-full flex flex-col border shadow-sm bg-muted/5">
              <CardContent className="flex h-full flex-col p-4 items-center text-center justify-center">
                <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center mb-2`}><stat.icon className={`h-5 w-5 ${stat.color}`} /></div>
                <div className="text-xl font-extrabold tabular-nums">{stat.value}</div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div variants={fadeInUp} custom={4}>
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Cari email atau nama..." className="pl-10 rounded-xl" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <Select value={tierFilter} onValueChange={(v) => setTierFilter(v ?? "all")}>
                  <SelectTrigger className="w-[130px] rounded-xl"><Filter className="h-3.5 w-3.5 mr-1.5" />{tierFilter === "all" ? "Tier" : tierFilter}</SelectTrigger>
                  <SelectContent><SelectItem value="all">All Tiers</SelectItem><SelectItem value="free">Free</SelectItem><SelectItem value="starter">Starter</SelectItem><SelectItem value="pro">Pro</SelectItem><SelectItem value="probundle">Pro Bundle</SelectItem></SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
                  <SelectTrigger className="w-[140px] rounded-xl"><Filter className="h-3.5 w-3.5 mr-1.5" />{statusFilter === "all" ? "Status" : statusFilter}</SelectTrigger>
                  <SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="banned">Banned</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeInUp} custom={5}>
        <Card className="border shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">User</TableHead>
                    <TableHead className="font-semibold">Tier</TableHead>
                    <TableHead className="font-semibold">Kuota (gen/rev)</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">Daftar</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((user) => {
                    const initials = (user.name || user.email).slice(0, 2).toUpperCase();
                    return (
                      <TableRow key={user.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center shrink-0"><span className="text-[11px] font-bold text-muted-foreground">{initials}</span></div>
                            <div>
                              <p className="font-semibold text-sm flex items-center gap-1.5">{user.name || "—"}{user.role === "admin" && <Badge variant="secondary" className="text-[9px]">admin</Badge>}</p>
                              <p className="text-xs text-muted-foreground">{user.email} · <span className="font-medium">{user.provider}</span></p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="secondary" className={`text-[10px] font-semibold ${TIER_COLORS[user.tier]}`}>{user.tier}</Badge></TableCell>
                        <TableCell className="text-sm tabular-nums">{user.generationCount < 0 ? "∞" : user.generationCount} / {user.revisionCount < 0 ? "∞" : user.revisionCount}</TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                        <TableCell><Badge variant="secondary" className={`text-[10px] font-semibold ${user.isBanned ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>{user.isBanned ? "banned" : "active"}</Badge></TableCell>
                        <TableCell>
                          {user.role !== "admin" && (
                            <DropdownMenu>
                              <DropdownMenuTrigger><Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {user.isBanned ? (
                                  <DropdownMenuItem onClick={() => toggleBan(user)}><ShieldCheck className="h-4 w-4 mr-2" />Cabut Ban</DropdownMenuItem>
                                ) : (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive" onClick={() => toggleBan(user)}><Ban className="h-4 w-4 mr-2" />Ban User</DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
