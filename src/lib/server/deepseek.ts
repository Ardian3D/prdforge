import { db } from "./db";
import { decrypt } from "./crypto";
import { ApiError } from "./http";
import { PRD_SECTIONS } from "@/lib/constants";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

export interface PrdSection {
  title: string;
  content: string; // markdown, boleh berisi blok ```mermaid
}

export interface GeneratedPrd {
  title: string;
  sections: PrdSection[];
}

interface ActiveConfig {
  apiKey: string;
  model: string;
}

/** Ambil konfigurasi DeepSeek aktif dari DB + dekripsi API key. */
export async function getActiveDeepseekConfig(): Promise<ActiveConfig> {
  const config = await db.apiConfig.findFirst({
    where: { provider: "deepseek" },
    orderBy: { updatedAt: "desc" },
  });
  if (!config || !config.isActive) {
    throw new ApiError(
      "Layanan AI belum aktif. Hubungi admin.",
      503,
      "AI_NOT_CONFIGURED"
    );
  }
  if (!config.apiKeyEncrypted) {
    throw new ApiError(
      "API key DeepSeek belum dikonfigurasi oleh admin.",
      503,
      "AI_NO_KEY"
    );
  }
  let apiKey: string;
  try {
    apiKey = decrypt(config.apiKeyEncrypted);
  } catch {
    throw new ApiError("Gagal membaca API key AI.", 500, "AI_DECRYPT_FAILED");
  }
  return { apiKey, model: config.model };
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function callDeepseek(
  messages: ChatMessage[],
  opts: { jsonMode?: boolean; maxTokens?: number } = {}
): Promise<string> {
  const { apiKey, model } = await getActiveDeepseekConfig();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000);
  try {
    const resp = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.5,
        max_tokens: opts.maxTokens ?? 8000,
        ...(opts.jsonMode
          ? { response_format: { type: "json_object" } }
          : {}),
      }),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      if (resp.status === 401) {
        throw new ApiError("API key AI ditolak.", 502, "AI_UNAUTHORIZED");
      }
      throw new ApiError(
        `Layanan AI error (${resp.status}). ${text.slice(0, 200)}`,
        502,
        "AI_UPSTREAM_ERROR"
      );
    }

    const data = (await resp.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new ApiError("Respons AI kosong.", 502, "AI_EMPTY");
    }
    return content;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    const aborted = err instanceof Error && err.name === "AbortError";
    throw new ApiError(
      aborted ? "AI timeout (90s)." : "Gagal menghubungi layanan AI.",
      504,
      "AI_TIMEOUT"
    );
  } finally {
    clearTimeout(timeout);
  }
}

// Bersihkan output JSON dari pembungkus code fence di AWAL/AKHIR saja.
// PENTING: jangan memakai regex yang bisa menangkap fence ```mermaid di DALAM
// string JSON (itu akan merusak parsing).
function extractJson(raw: string): string {
  let s = raw.trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?[ \t]*\r?\n?/, "");
    if (s.endsWith("```")) s = s.slice(0, -3);
  }
  return s.trim();
}

function langLabel(language: "id" | "en"): string {
  return language === "id" ? "Bahasa Indonesia" : "English";
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const DIAGRAM_SECTIONS = new Set([
  "User Flow & Journey",
  "System Architecture",
  "Use Case Diagram",
  "Data Model (ERD)",
]);

// Aturan diagram premium (dark theme, ala dokumentasi produk startup AI).
// Disimpan terpisah agar mudah dirawat. Backtick di-escape (\`) karena ini
// template literal. classDef palette dirancang untuk latar gelap.
const diagramRules = `- For the diagram section, embed EXACTLY ONE Mermaid diagram inside a \`\`\`mermaid fence. It must look like a polished, modern product-doc diagram on a DARK background. Follow these STRICT rules so it ALWAYS parses:
  - If the section is the data model / ERD, use \`erDiagram\` with clear entities, typed attributes (with PK/FK), and relationships. (No classDef/shapes needed — it inherits the dark theme.)
  - For ALL OTHER diagram sections, use \`flowchart LR\` (preferred, less vertical) or \`flowchart TD\`, with 6-12 nodes, and apply ALL of the following:
    - EVERY node label MUST be wrapped in double quotes AND begin with ONE relevant emoji icon, e.g. A["🎤 Speech to Text"]. Inside labels do NOT use these characters: ( ) : ; / and no markdown.
    - Use VARIED node shapes by role:
      - Start/End -> stadium: S(["🚀 Mulai"])
      - Process / user action -> rectangle: P["📱 Aksi"]
      - Decision -> diamond: D{"🔀 Pilihan"}
      - AI / processing -> hexagon: AIx{{"🧠 AI Engine"}}
      - Database / storage -> cylinder: DBx[("🗄 Database")]
    - Group related nodes into titled subgraphs, e.g. subgraph G1["🤖 AI Services"] ... end
    - Connect with simple arrows --> and optionally a SHORT quoted edge label: A -->|"valid"| B
    - Give EACH node a category class via \`class <id1>,<id2> <cat>\` and append this EXACT palette block verbatim at the very end of the diagram:
      classDef user fill:#13335c,stroke:#3b82f6,color:#dbeafe,stroke-width:1.5px;
      classDef ai fill:#2e1065,stroke:#8b5cf6,color:#ede9fe,stroke-width:1.5px;
      classDef db fill:#0a3d2e,stroke:#10b981,color:#d1fae5,stroke-width:1.5px;
      classDef feedback fill:#5c2c0a,stroke:#f97316,color:#ffedd5,stroke-width:1.5px;
      classDef auth fill:#4a1535,stroke:#ec4899,color:#fce7f3,stroke-width:1.5px;
      classDef se fill:#3b1f6e,stroke:#a78bfa,color:#f5f3ff,stroke-width:2px;
      Category meaning: user=user actions/UI, ai=AI or processing, db=database/storage, feedback=scores/results, auth=login/security, se=start/end nodes.
    - No comments, no <br>, no inline HTML. Output valid Mermaid only.
`;


// Generate satu batch berisi beberapa section (dengan retry untuk reasoning
// model yang sesekali mengembalikan content kosong / JSON tak lengkap).
async function generateBatch(
  description: string,
  language: "id" | "en",
  productName: string | undefined,
  titles: string[],
  includeTitle: boolean
): Promise<{ title?: string; sections: PrdSection[] }> {
  const titleList = titles.map((t) => `- ${t}`).join("\n");
  const hasDiagram = titles.some((t) => DIAGRAM_SECTIONS.has(t));

  const system = `You are an expert Senior Product Manager writing a professional PRD in ${langLabel(language)}.
Return STRICT JSON only (no prose outside JSON), shape:
{${includeTitle ? '\n  "title": string,' : ""}
  "sections": [{ "title": string, "content": string }]
}
Rules:
- Produce EXACTLY these section(s), using these EXACT titles, in this order:
${titleList}
- "content" is GitHub-flavored Markdown (use tables/lists where useful), concise but concrete (about 100-180 words per section).
${hasDiagram ? diagramRules : ""}- Write in ${langLabel(language)}. Be specific to the product. Avoid \"TBD\". Do not include chain-of-thought; output only the final JSON.`;

  const user = `Product name: ${productName || "(derive a suitable concise name)"}
Product description:
"""
${description}
"""
Return STRICT JSON now for the listed section(s).`;

  const messages = [
    { role: "system" as const, content: system },
    { role: "user" as const, content: user },
  ];

  let lastErr: unknown;
  // 2 percobaan: reasoning model kadang menghabiskan token untuk "berpikir"
  // sehingga content kosong / JSON terpotong — retry biasanya berhasil.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await callDeepseek(messages, { jsonMode: true, maxTokens: 16000 });
      const parsed = JSON.parse(extractJson(raw)) as {
        title?: string;
        sections?: PrdSection[];
      };
      const sections = Array.isArray(parsed.sections) ? parsed.sections : [];
      if (sections.length === 0) throw new Error("no sections");
      return { title: parsed.title, sections };
    } catch (err) {
      lastErr = err;
    }
  }
  console.error("[generateBatch] gagal:", titles.join(", "), lastErr);
  throw new ApiError(
    "AI gagal menghasilkan sebagian PRD. Coba generate lagi.",
    502,
    "AI_PARSE_ERROR"
  );
}

/**
 * Generate PRD 19-section. Dibagi menjadi beberapa batch yang dijalankan
 * PARALEL agar tidak melebihi batas token output (reasoning model) & lebih cepat.
 */
export async function generatePrd(
  description: string,
  language: "id" | "en",
  productName?: string
): Promise<GeneratedPrd> {
  const batches = chunk([...PRD_SECTIONS], 2);

  const results = await Promise.all(
    batches.map((titles, i) =>
      generateBatch(description, language, productName, titles, i === 0)
    )
  );

  // Gabungkan semua section lalu urutkan sesuai urutan kanonik PRD_SECTIONS.
  const collected: PrdSection[] = [];
  for (const r of results) collected.push(...r.sections);

  const byTitle = new Map(collected.map((s) => [s.title.trim().toLowerCase(), s]));
  const ordered: PrdSection[] = PRD_SECTIONS.map((title) => {
    const found = byTitle.get(title.toLowerCase());
    return found
      ? { title, content: found.content }
      : { title, content: "_Bagian ini gagal dihasilkan. Coba revisi via chat._" };
  });

  if (ordered.every((s) => s.content.startsWith("_Bagian ini gagal"))) {
    throw new ApiError("AI tidak menghasilkan section.", 502, "AI_NO_SECTIONS");
  }

  const title =
    productName?.trim() ||
    results.find((r) => r.title)?.title ||
    "Untitled PRD";

  return { title, sections: ordered };
}

export interface RevisionResult {
  reply: string;
  sections: PrdSection[]; // hanya section yang diubah
}

/** Revisi PRD via chat. Mengembalikan reply + section yang diperbarui. */
export async function reviseSection(
  currentSections: PrdSection[],
  instruction: string,
  language: "id" | "en"
): Promise<RevisionResult> {
  const system = `You are an expert Product Manager editing an existing PRD in ${langLabel(language)}.
The user will give a revision instruction. Return STRICT JSON only:
{
  "reply": string,  // short confirmation in ${langLabel(language)} of what you changed
  "sections": [{ "title": string, "content": string }]  // ONLY the sections you modified, with EXACT existing titles
}
Rules:
- "content" is GitHub-flavored Markdown; keep Mermaid in \`\`\`mermaid fences valid.
- Only include sections that actually changed. Use the exact existing section titles.
- Write in ${langLabel(language)}.`;

  const context = currentSections
    .map((s) => `## ${s.title}\n${s.content}`)
    .join("\n\n");

  const user = `Current PRD sections:
"""
${context.slice(0, 24000)}
"""

Revision instruction: ${instruction}

Return STRICT JSON now.`;

  const raw = await callDeepseek(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { jsonMode: true, maxTokens: 8000 }
  );

  let parsed: RevisionResult;
  try {
    parsed = JSON.parse(extractJson(raw)) as RevisionResult;
  } catch {
    throw new ApiError(
      "AI mengembalikan format tidak valid. Coba lagi.",
      502,
      "AI_PARSE_ERROR"
    );
  }
  return {
    reply: parsed.reply || "Section diperbarui.",
    sections: Array.isArray(parsed.sections) ? parsed.sections : [],
  };
}

// Ekstrak blok mermaid dari sections → array {section, code}.
export function extractMermaid(
  sections: PrdSection[]
): { section: string; code: string }[] {
  const out: { section: string; code: string }[] = [];
  const re = /```mermaid\s*([\s\S]*?)```/g;
  for (const s of sections) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(s.content)) !== null) {
      out.push({ section: s.title, code: m[1].trim() });
    }
  }
  return out;
}
