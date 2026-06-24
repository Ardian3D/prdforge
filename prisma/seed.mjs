// Seed: membuat admin (Master) + placeholder ApiConfig DeepSeek.
// Dijalankan via `npm run db:seed` (Prisma memuat .env otomatis).
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@prdforge.com";
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const name = process.env.ADMIN_NAME || "Master Admin";

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await db.user.upsert({
    where: { email },
    update: { role: "admin" },
    create: {
      email,
      name,
      passwordHash,
      provider: "email",
      role: "admin",
      tier: "pro",
      generationCount: -1,
      revisionCount: -1,
    },
  });

  await db.apiConfig.upsert({
    where: { provider: "deepseek" },
    update: {},
    create: { provider: "deepseek", model: "deepseek-v4-pro", isActive: true },
  });

  console.log(`✓ Admin siap: ${admin.email} (role=${admin.role})`);
  console.log("✓ ApiConfig DeepSeek placeholder dibuat");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
