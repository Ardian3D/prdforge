import type { Metadata } from "next";
import { Open_Sans, Geist_Mono, Fraunces } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { AuthProvider } from "@/lib/auth/auth-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PRDForge — AI-Powered PRD Generator",
    template: "%s | PRDForge",
  },
  description:
    "Generate professional 19-section Product Requirement Documents with AI and Mermaid diagrams in 60 seconds. Built for product managers, founders, and developers.",
  keywords: [
    "PRD generator",
    "AI PRD",
    "product requirement document",
    "Mermaid diagrams",
    "product management",
  ],
  authors: [{ name: "Ardian3D" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "PRDForge",
    title: "PRDForge — AI-Powered PRD Generator",
    description:
      "Generate professional 19-section Product Requirement Documents with AI and Mermaid diagrams in 60 seconds.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${openSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <AuthProvider>
              <TooltipProvider>
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
                <Toaster richColors position="top-center" />
              </TooltipProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
