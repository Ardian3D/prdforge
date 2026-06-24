-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('email', 'google');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('free', 'starter', 'pro', 'probundle');

-- CreateEnum
CREATE TYPE "PrdLanguage" AS ENUM ('id', 'en');

-- CreateEnum
CREATE TYPE "ChatRole" AS ENUM ('user', 'assistant');

-- CreateEnum
CREATE TYPE "FraudAction" AS ENUM ('blocked', 'flagged', 'allowed');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'success', 'failed', 'refunded');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password_hash" TEXT,
    "provider" "AuthProvider" NOT NULL DEFAULT 'email',
    "google_id" TEXT,
    "role" "Role" NOT NULL DEFAULT 'user',
    "tier" "Tier" NOT NULL DEFAULT 'free',
    "generation_count" INTEGER NOT NULL DEFAULT 3,
    "revision_count" INTEGER NOT NULL DEFAULT 3,
    "device_fingerprint_hash" TEXT,
    "last_ip" TEXT,
    "last_ip_subnet" TEXT,
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "ban_reason" TEXT,
    "tier_expires_at" TIMESTAMP(3),
    "usage_reset_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prd" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description_input" TEXT NOT NULL,
    "content" JSONB NOT NULL DEFAULT '{}',
    "mermaid_diagrams" JSONB NOT NULL DEFAULT '[]',
    "language" "PrdLanguage" NOT NULL DEFAULT 'id',
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prd_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prd_version" (
    "id" UUID NOT NULL,
    "prd_id" UUID NOT NULL,
    "version_number" INTEGER NOT NULL,
    "content_snapshot" JSONB NOT NULL,
    "change_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prd_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_message" (
    "id" UUID NOT NULL,
    "prd_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "ChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "target_section" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fraud_log" (
    "id" UUID NOT NULL,
    "device_hash" TEXT,
    "ip_address" TEXT,
    "ip_subnet" TEXT,
    "email_attempted" TEXT,
    "action" "FraudAction" NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fraud_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "external_id" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "amount" DECIMAL(12,2) NOT NULL,
    "tier_purchased" "Tier" NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'midtrans',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_config" (
    "id" UUID NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'deepseek',
    "api_key_encrypted" TEXT,
    "model" TEXT NOT NULL DEFAULT 'deepseek-v4-pro',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE INDEX "users_device_fingerprint_hash_idx" ON "users"("device_fingerprint_hash");

-- CreateIndex
CREATE INDEX "users_tier_idx" ON "users"("tier");

-- CreateIndex
CREATE INDEX "prd_user_id_idx" ON "prd"("user_id");

-- CreateIndex
CREATE INDEX "prd_version_prd_id_idx" ON "prd_version"("prd_id");

-- CreateIndex
CREATE INDEX "chat_message_prd_id_idx" ON "chat_message"("prd_id");

-- CreateIndex
CREATE INDEX "fraud_log_device_hash_idx" ON "fraud_log"("device_hash");

-- CreateIndex
CREATE INDEX "fraud_log_ip_subnet_idx" ON "fraud_log"("ip_subnet");

-- CreateIndex
CREATE UNIQUE INDEX "payment_external_id_key" ON "payment"("external_id");

-- CreateIndex
CREATE INDEX "payment_user_id_idx" ON "payment"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "api_config_provider_key" ON "api_config"("provider");

-- AddForeignKey
ALTER TABLE "prd" ADD CONSTRAINT "prd_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prd_version" ADD CONSTRAINT "prd_version_prd_id_fkey" FOREIGN KEY ("prd_id") REFERENCES "prd"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_prd_id_fkey" FOREIGN KEY ("prd_id") REFERENCES "prd"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
