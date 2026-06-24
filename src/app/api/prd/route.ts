import { type NextRequest } from "next/server";
import { withAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ok } from "@/lib/server/http";

// GET /api/prd — daftar PRD milik user (tanpa konten penuh).
export const GET = withAuth(async (req: NextRequest, _ctx, { user }) => {
  const { searchParams } = new URL(req.url);
  const includeArchived = searchParams.get("archived") === "true";

  const prds = await db.prd.findMany({
    where: { userId: user.id, ...(includeArchived ? {} : { isArchived: false }) },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      language: true,
      version: true,
      isArchived: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return ok({ prds, total: prds.length });
});
