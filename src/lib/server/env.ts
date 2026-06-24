// Server-side environment variables — diakses lazy agar build tidak crash
// ketika sebuah variabel belum di-set.

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

export const env = {
  get databaseUrl() {
    return required("DATABASE_URL");
  },
  get jwtSecret() {
    return required("JWT_SECRET");
  },
  get jwtExpiresIn(): number {
    return Number(optional("JWT_EXPIRES_IN", "604800"));
  },
  get encryptionKey() {
    return required("ENCRYPTION_KEY");
  },
  get adminEmail() {
    return optional("ADMIN_EMAIL", "admin@prdforge.com");
  },
  get adminPassword() {
    return optional("ADMIN_PASSWORD", "ChangeMe123!");
  },
  get adminName() {
    return optional("ADMIN_NAME", "Master Admin");
  },
  get midtransServerKey() {
    return optional("MIDTRANS_SERVER_KEY");
  },
  get midtransClientKey() {
    return optional("MIDTRANS_CLIENT_KEY") || optional("NEXT_PUBLIC_MIDTRANS_CLIENT_KEY");
  },
  get midtransIsProduction() {
    return optional("MIDTRANS_IS_PRODUCTION", "false") === "true";
  },
  get appUrl() {
    return optional("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
  },
  // ---- Google OAuth ----
  get googleClientId() {
    return optional("GOOGLE_CLIENT_ID");
  },
  get googleClientSecret() {
    return optional("GOOGLE_CLIENT_SECRET");
  },
  get googleRedirectUri() {
    return (
      optional("GOOGLE_REDIRECT_URI") ||
      `${this.appUrl}/api/auth/google/callback`
    );
  },
  get googleConfigured() {
    return Boolean(this.googleClientId && this.googleClientSecret);
  },
};
