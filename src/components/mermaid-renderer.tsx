"use client";

import * as React from "react";
import mermaid from "mermaid";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

let mermaidInitialized = false;

function initMermaid() {
  if (mermaidInitialized) return;
  mermaid.initialize({
    startOnLoad: false,
    // Tema dark glassmorphism — menyatu dengan dark mode website, terlihat
    // seperti dokumentasi produk startup AI (bukan diagram default Mermaid).
    theme: "base",
    securityLevel: "loose",
    // Cegah Mermaid menyuntik grafik error "bom" ke DOM saat parse gagal.
    suppressErrorRendering: true,
    fontFamily:
      '"Open Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif',
    themeVariables: {
      darkMode: true,
      fontFamily:
        '"Open Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif',
      fontSize: "16px",
      background: "#16161f",
      // Node default — kartu gelap glass dengan border violet & teks terang.
      // (Node yang diberi classDef kategori akan menimpa warna ini.)
      primaryColor: "#241a3d",
      primaryBorderColor: "#7c3aed",
      primaryTextColor: "#ece8ff",
      mainBkg: "#241a3d",
      nodeBorder: "#7c3aed",
      nodeTextColor: "#ece8ff",
      // Garis & label edge
      lineColor: "#a78bfa",
      edgeLabelBackground: "#1e1e2e",
      labelBackground: "#1e1e2e",
      // Aksen sekunder/tersier
      secondaryColor: "#3a1530",
      secondaryBorderColor: "#ec4899",
      secondaryTextColor: "#fce7f3",
      tertiaryColor: "#13243f",
      tertiaryBorderColor: "#3b82f6",
      tertiaryTextColor: "#dbeafe",
      // Subgraph / cluster — glass gelap, border violet transparan
      clusterBkg: "#1b1b27",
      clusterBorder: "#7c3aed66",
      titleColor: "#c4b5fd",
      // Catatan / note (gold)
      noteBkgColor: "#3a2e10",
      noteBorderColor: "#d8b24a",
      noteTextColor: "#fdf6e3",
      // Sequence diagram
      actorBkg: "#241a3d",
      actorBorder: "#7c3aed",
      actorTextColor: "#ece8ff",
      signalColor: "#a78bfa",
      signalTextColor: "#ece8ff",
      labelBoxBkgColor: "#241a3d",
      labelBoxBorderColor: "#7c3aed",
      loopTextColor: "#ece8ff",
      // ER & state
      attributeBackgroundColorOdd: "#1b1b27",
      attributeBackgroundColorEven: "#241a3d",
    },
    flowchart: {
      curve: "basis",
      htmlLabels: true,
      padding: 24,
      nodeSpacing: 70,
      rankSpacing: 85,
      wrappingWidth: 240,
      // useMaxWidth:false -> Mermaid memakai ukuran natural (px); CSS w-full
      // + h-auto lalu men-scale SVG mengisi lebar kartu (vektor tetap tajam),
      // sehingga diagram tidak tampil mungil di kolom lebar.
      useMaxWidth: false,
    },
    sequence: { useMaxWidth: true, actorMargin: 70, mirrorActors: false },
    er: { useMaxWidth: true },
  });
  mermaidInitialized = true;
}

// Hapus HANYA elemen sementara milik render dengan id ini.
// PENTING: jangan memakai selector global (mis. semua [id^="mermaid-"]),
// karena di halaman dengan banyak diagram, setiap render berjalan paralel.
// Selector global akan menghapus node temporary milik diagram LAIN yang
// masih dalam proses render → render-nya gagal → komponen salah mengira
// sintaks tidak valid, padahal diagram sebenarnya benar.
function cleanupOrphans(id: string) {
  if (typeof document === "undefined") return;
  // Mermaid v11 memakai id `${id}` (output) dan `d${id}` (container sandbox).
  document.getElementById(id)?.remove();
  document.getElementById(`d${id}`)?.remove();
}

interface MermaidRendererProps {
  code: string;
  className?: string;
}

export function MermaidRenderer({ code, className }: MermaidRendererProps) {
  const [svg, setSvg] = React.useState<string>("");
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    initMermaid();
    let cancelled = false;
    const id = `mermaid-${Math.random().toString(36).slice(2, 10)}`;

    (async () => {
      try {
        // Render langsung; suppressErrorRendering mencegah artefak bom,
        // dan promise tetap reject bila sintaks salah → ditangkap catch.
        const { svg: out } = await mermaid.render(id, code.trim());
        if (!cancelled) {
          setSvg(out);
          setError(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setSvg("");
        }
      } finally {
        cleanupOrphans(id);
      }
    })();

    return () => {
      cancelled = true;
      cleanupOrphans(id);
    };
  }, [code]);

  if (error) {
    return (
      <div className={cn("rounded-2xl ring-1 ring-border bg-muted/30 overflow-hidden", className)}>
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/60 bg-muted/40">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-xs font-medium text-muted-foreground">Diagram (kode mentah — sintaks belum valid)</span>
        </div>
        <pre className="text-xs text-muted-foreground/90 whitespace-pre-wrap p-4 overflow-x-auto font-mono leading-relaxed">{code.trim()}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className={cn("rounded-2xl p-10 flex items-center justify-center bg-muted/20 ring-1 ring-border", className)}>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          Merender diagram...
        </div>
      </div>
    );
  }

  // Dark glass card dengan glow violet — menyatu dengan dark mode website.
  // Diagram dirender pada ukuran natural (teks selalu sebesar fontSize tema,
  // tidak menyusut). Diagram kecil dipusatkan; yang lebar bisa di-scroll
  // horizontal — menjaga keterbacaan & ukuran konsisten antar diagram.
  return (
    <div
      className={cn(
        "mermaid-wrapper relative w-full overflow-x-auto rounded-2xl p-5 sm:p-8 ring-1 ring-violet-500/25 shadow-premium",
        "[&_svg]:max-w-none [&_svg]:h-auto [&_svg]:mx-auto [&_svg]:block",
        className
      )}
      style={{
        background:
          "radial-gradient(130% 130% at 0% 0%, #1e1b2e 0%, #181622 55%, #131019 100%)",
        boxShadow:
          "0 0 0 1px rgba(124,58,237,0.18), 0 18px 50px -18px rgba(124,58,237,0.45), inset 0 1px 0 0 rgba(255,255,255,0.04)",
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
