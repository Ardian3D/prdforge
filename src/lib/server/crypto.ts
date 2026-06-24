import crypto from "node:crypto";
import { env } from "./env";

// AES-256-GCM untuk menyimpan API key DeepSeek (NFR PRD section 15).
// Format penyimpanan: base64(iv).base64(authTag).base64(ciphertext)

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12; // GCM standard

function getKey(): Buffer {
  const hex = env.encryptionKey;
  const key = Buffer.from(hex, "hex");
  if (key.length !== 32) {
    throw new Error(
      "ENCRYPTION_KEY harus 32 byte (64 karakter hex). Generate: openssl rand -hex 32"
    );
  }
  return key;
}

export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${authTag.toString("base64")}.${encrypted.toString("base64")}`;
}

export function decrypt(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(".");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Format ciphertext tidak valid");
  }
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(tagB64, "base64");
  const data = Buffer.from(dataB64, "base64");
  const decipher = crypto.createDecipheriv(ALGO, getKey(), iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString("utf8");
}

// Untuk ditampilkan di UI admin: mask API key.
export function maskSecret(secret: string): string {
  if (secret.length <= 8) return "••••••••";
  return `${secret.slice(0, 4)}${"•".repeat(Math.max(4, secret.length - 8))}${secret.slice(-4)}`;
}
