import { withAuth } from "@/lib/server/auth";
import { ApiError } from "@/lib/server/http";
import { getOwnedPrd, prdToMarkdown, type PrdContent } from "@/lib/server/prd";
import { getTierConfig } from "@/lib/server/tiers";
import type { PrdSection } from "@/lib/server/deepseek";

// GET /api/prd/{id}/export/markdown — unduh .md (US-08, hanya paid tier).
export const GET = withAuth(async (_req, ctx, { user }) => {
  const { id } = await ctx.params;

  if (!getTierConfig(user.tier).canExport) {
    throw new ApiError(
      "Export hanya tersedia untuk paket berbayar.",
      403,
      "EXPORT_NOT_ALLOWED"
    );
  }

  const prd = await getOwnedPrd(id, user.id);
  const content = prd.content as unknown as PrdContent;
  const sections: PrdSection[] = content?.sections ?? [];
  const markdown = prdToMarkdown(prd.title, sections);

  const filename = `${prd.title.replace(/[^a-z0-9]+/gi, "-").slice(0, 60) || "prd"}.md`;

  return new Response(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
});
