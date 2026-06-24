// PRDForge — Application Constants

export const APP_NAME = "PRDForge";
export const APP_DESCRIPTION =
  "AI-powered PRD generator — create professional 19-section Product Requirement Documents with diagrams in 60 seconds.";
export const APP_URL = "https://prdforge.com";

export const PRD_SECTIONS = [
  "Executive Summary",
  "Problem Statement",
  "Product Vision & OKRs",
  "Target Users & Personas",
  "User Stories",
  "User Flow & Journey",
  "Feature List (MoSCoW)",
  "System Architecture",
  "Use Case Diagram",
  "Data Model (ERD)",
  "Tech Stack Recommendation",
  "API Design",
  "Non-Functional Requirements",
  "Pricing & Plans",
  "Milestones & Roadmap",
  "Success Metrics / KPIs",
  "Risks & Mitigations",
  "Open Questions",
  "Appendices",
] as const;

export const TIERS = {
  free: {
    name: "Free",
    price: "Rp 0",
    priceMonthly: 0,
    description: "Untuk siapa saja yang ingin mencoba.",
    features: [
      "3x Generate PRD (seumur hidup)",
      "3x AI Chat Revisi",
      "AI Model Standard",
      "Community Support",
    ],
    limitations: ["Export ❌", "Prioritas support ❌"],
    cta: "Coba Gratis",
    highlighted: false,
  },
  starter: {
    name: "Starter",
    price: "Rp 75.000",
    priceMonthly: 75000,
    description:
      "Untuk individu yang baru mulai membangun produk dan ingin merancang ide dengan lebih cepat.",
    features: [
      "AI Model Premium",
      "5 PRD / bulan",
      "100x AI Chat Revisi / bulan",
      "Export Download Markdown",
      "Standard Support",
    ],
    limitations: [],
    cta: "Mulai Sekarang",
    highlighted: false,
    targetUsers: "Mahasiswa, Indie hacker, Solo founder, Freelancer",
  },
  pro: {
    name: "Pro",
    price: "Rp 149.000",
    priceMonthly: 149000,
    description:
      "Untuk founder dan builder yang membutuhkan kebebasan penuh dalam membuat dan mengembangkan produk.",
    features: [
      "AI Model Premium",
      "Unlimited Generate PRD",
      "Unlimited AI Chat Revisi",
      "Export Download Markdown",
      "Prioritas Support (Tim Raf Dev)",
    ],
    limitations: [],
    cta: "Upgrade ke Pro",
    highlighted: true,
    targetUsers: "Startup founder, Product Manager, Developer, Agency",
  },
  probundle: {
    name: "Pro Bundle",
    price: "Rp 199.000",
    priceMonthly: 199000,
    description:
      "Paket terbaik untuk founder serius — semua fitur Pro + bonus akses ke AndaAI Pro.",
    features: [
      "Semua fitur Pro",
      "Unlimited Generate PRD",
      "Unlimited AI Chat Revisi",
      "Export Download Markdown",
      "Prioritas Support (Tim Raf Dev)",
      "Bonus: Akses AndaAI Pro (Gratis)",
    ],
    limitations: [],
    cta: "Dapatkan Semua Akses 🚀",
    highlighted: false,
    targetUsers: "Founder serius yang ingin produktivitas maksimal",
  },
} as const;

export const NAV_LINKS = [
  { href: "/#features", labelKey: "nav.features" as const },
  { href: "/#how-it-works", labelKey: "nav.howItWorks" as const },
  { href: "/pricing", labelKey: "nav.pricing" as const },
  { href: "/#demo", labelKey: "nav.demo" as const },
] as const;

export const FOOTER_LINKS = {
  product: [
    { href: "/#features", label: "Fitur" },
    { href: "/pricing", label: "Harga" },
    { href: "/#demo", label: "Demo" },
    { href: "/#how-it-works", label: "Cara Kerja" },
  ],
  resources: [
    { href: "#", label: "Dokumentasi" },
    { href: "#", label: "Blog" },
    { href: "#", label: "Template PRD" },
    { href: "#", label: "API Reference" },
  ],
  company: [
    { href: "#", label: "Tentang Kami" },
    { href: "#", label: "Ardian3D" },
    { href: "#", label: "Kontak" },
    { href: "#", label: "Privacy Policy" },
  ],
} as const;
