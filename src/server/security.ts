import crypto from "crypto";
import fs from "fs";
import path from "path";
import type express from "express";

export const ADMIN_COOKIE_NAME = "goinfoev_admin_token";
export const USER_COOKIE_NAME = "goinfoev_user_token";

const ADMIN_AUTH_FILE = path.join(process.cwd(), "admin_auth.json");

interface AdminAuthStore {
  passcodeHash?: string;
  recoveryEmail?: string;
  updatedAt?: string;
}

function readAdminAuthStore(): AdminAuthStore {
  try {
    if (fs.existsSync(ADMIN_AUTH_FILE)) {
      const raw = fs.readFileSync(ADMIN_AUTH_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return parsed as AdminAuthStore;
      }
    }
  } catch (err) {
    console.warn("[Security] Could not read admin_auth.json:", err);
  }
  return {};
}

function writeAdminAuthStore(store: AdminAuthStore): void {
  fs.writeFileSync(ADMIN_AUTH_FILE, JSON.stringify(store, null, 2), "utf-8");
}

// Ephemeral fallback secret generated once per runtime if SESSION_SECRET is unset
const EPHEMERAL_SECRET = crypto.randomBytes(32).toString("hex");

function getSigningSecret(): string {
  const configured = process.env.SESSION_SECRET?.trim();
  if (configured && configured.length >= 16) {
    return configured;
  }
  return EPHEMERAL_SECRET;
}

export function getConfiguredAdminPasscode(): string {
  const envPass = process.env.ADMIN_PASSCODE?.trim();
  if (envPass && envPass.length >= 4) {
    return envPass;
  }
  return "123456";
}

export function hasStoredAdminPasscode(): boolean {
  const store = readAdminAuthStore();
  return Boolean(store.passcodeHash && store.passcodeHash.startsWith("scrypt:"));
}

export function verifyAdminPasscode(input: string): boolean {
  if (typeof input !== "string" || !input.trim()) return false;
  const trimmed = input.trim();
  const store = readAdminAuthStore();
  if (store.passcodeHash && store.passcodeHash.startsWith("scrypt:")) {
    return verifyPassword(trimmed, store.passcodeHash);
  }
  const expected = getConfiguredAdminPasscode();
  const a = crypto.createHash("sha256").update(trimmed).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

export function updateAdminPasscode(newPasscode: string): void {
  const trimmed = newPasscode.trim();
  if (trimmed.length < 6 || trimmed.length > 128) {
    throw new Error("Admin passcode must be between 6 and 128 characters.");
  }
  const store = readAdminAuthStore();
  store.passcodeHash = hashPassword(trimmed);
  store.updatedAt = new Date().toISOString();
  writeAdminAuthStore(store);
}

export function getAdminRecoveryEmail(): string {
  const store = readAdminAuthStore();
  if (store.recoveryEmail && isValidEmail(store.recoveryEmail)) {
    return store.recoveryEmail;
  }
  const envEmail = process.env.ADMIN_EMAIL?.trim() || process.env.CONTACT_PRIMARY_EMAIL?.trim();
  if (envEmail && isValidEmail(envEmail)) {
    return envEmail;
  }
  return "Hamdan7394@gmail.com";
}

export function updateAdminRecoveryEmail(email: string): string {
  const clean = sanitizeText(email, 254);
  if (!isValidEmail(clean)) {
    throw new Error("Please enter a valid recovery email address.");
  }
  const store = readAdminAuthStore();
  store.recoveryEmail = clean;
  store.updatedAt = new Date().toISOString();
  writeAdminAuthStore(store);
  return clean;
}

export function maskEmail(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return "***";
  const [local, domain] = parts;
  if (local.length <= 2) return `${local[0] || "*"}***@${domain}`;
  if (local.length <= 4) return `${local.slice(0, 1)}***${local.slice(-1)}@${domain}`;
  return `${local.slice(0, 2)}${"*".repeat(Math.min(6, local.length - 4))}${local.slice(-2)}@${domain}`;
}

interface AdminResetOtpState {
  otpHash: string;
  expiresAt: number;
  attempts: number;
  cooldownUntil: number;
}

let activeAdminResetOtp: AdminResetOtpState | null = null;

export function createAdminResetOtp():
  | { ok: true; code: string; expiresInMinutes: number }
  | { ok: false; retryAfterSeconds: number; error: string } {
  const now = Date.now();
  if (activeAdminResetOtp && now < activeAdminResetOtp.cooldownUntil) {
    const retryAfterSeconds = Math.max(1, Math.ceil((activeAdminResetOtp.cooldownUntil - now) / 1000));
    return {
      ok: false,
      retryAfterSeconds,
      error: `Please wait ${retryAfterSeconds}s before requesting another recovery code.`,
    };
  }
  const code = String(crypto.randomInt(100000, 1000000));
  const otpHash = crypto.createHash("sha256").update(code).digest("hex");
  const ttlMs = 10 * 60 * 1000;
  activeAdminResetOtp = {
    otpHash,
    expiresAt: now + ttlMs,
    attempts: 0,
    cooldownUntil: now + 45 * 1000,
  };
  return { ok: true, code, expiresInMinutes: 10 };
}

export function clearAdminResetOtp(): void {
  activeAdminResetOtp = null;
}

export function verifyAdminResetOtp(code: string): { valid: boolean; error?: string } {
  if (!activeAdminResetOtp) {
    return { valid: false, error: "No active recovery code. Please request a new code first." };
  }
  const now = Date.now();
  if (now > activeAdminResetOtp.expiresAt) {
    activeAdminResetOtp = null;
    return { valid: false, error: "Recovery code has expired. Please request a new code." };
  }
  const cleanCode = String(code ?? "").replace(/\s+/g, "");
  if (!/^\d{6}$/.test(cleanCode)) {
    return { valid: false, error: "Please enter the valid 6-digit code sent to your Gmail." };
  }
  activeAdminResetOtp.attempts += 1;
  if (activeAdminResetOtp.attempts > 5) {
    activeAdminResetOtp = null;
    return { valid: false, error: "Too many incorrect codes. Please request a new recovery code." };
  }

  const providedHash = crypto.createHash("sha256").update(cleanCode).digest();
  const expectedHash = Buffer.from(activeAdminResetOtp.otpHash, "hex");
  if (providedHash.length !== expectedHash.length || !crypto.timingSafeEqual(providedHash, expectedHash)) {
    return { valid: false, error: "Incorrect recovery code. Please check your Gmail and try again." };
  }

  // One-time use: invalidate immediately upon match
  activeAdminResetOtp = null;
  return { valid: true };
}

export interface SignedTokenPayload {
  role: "admin" | "user";
  sub: string;
  exp: number;
}

export function signAuthToken(payload: SignedTokenPayload): string {
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = crypto
    .createHmac("sha256", getSigningSecret())
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifyAuthToken(token: string | undefined | null): SignedTokenPayload | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encoded, providedSig] = parts;
  if (!encoded || !providedSig) return null;

  const expectedSig = crypto
    .createHmac("sha256", getSigningSecret())
    .update(encoded)
    .digest("base64url");

  const a = Buffer.from(providedSig, "utf8");
  const b = Buffer.from(expectedSig, "utf8");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SignedTokenPayload;
    if (!parsed || typeof parsed.exp !== "number" || Date.now() >= parsed.exp) {
      return null;
    }
    if (parsed.role !== "admin" && parsed.role !== "user") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function parseCookieHeader(cookieHeader: string | undefined): Record<string, string> {
  const map: Record<string, string> = {};
  if (!cookieHeader) return map;
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx <= 0) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    try {
      map[key] = decodeURIComponent(val);
    } catch {
      map[key] = val;
    }
  }
  return map;
}

export function extractAuthToken(req: express.Request, cookieName: string): string | null {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === "string" && authHeader.toLowerCase().startsWith("bearer ")) {
    const bearer = authHeader.slice(7).trim();
    if (bearer) return bearer;
  }
  const cookies = parseCookieHeader(req.headers.cookie);
  return cookies[cookieName] || null;
}

export function setAuthCookie(
  res: express.Response,
  req: express.Request,
  name: string,
  token: string,
  maxAgeMs: number
) {
  const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https";
  const attrs = [
    `${name}=${encodeURIComponent(token)}`,
    "Path=/",
    `Max-Age=${Math.floor(maxAgeMs / 1000)}`,
    "HttpOnly",
    isHttps ? "SameSite=None" : "SameSite=Lax",
  ];
  if (isHttps) {
    attrs.push("Secure");
  }
  res.append("Set-Cookie", attrs.join("; "));
}

export function clearAuthCookie(res: express.Response, req: express.Request, name: string) {
  const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https";
  const attrs = [
    `${name}=`,
    "Path=/",
    "Max-Age=0",
    "HttpOnly",
    isHttps ? "SameSite=None" : "SameSite=Lax",
  ];
  if (isHttps) {
    attrs.push("Secure");
  }
  res.append("Set-Cookie", attrs.join("; "));
}

export function requireAdminAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const token = extractAuthToken(req, ADMIN_COOKIE_NAME);
  const verified = verifyAuthToken(token);
  if (!verified || verified.role !== "admin") {
    return res.status(401).json({
      error: "Admin authentication required. Please sign in to the Admin Portal.",
    });
  }
  next();
}

// Per-user scrypt password hashing
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  if (!password || !stored) return false;
  if (stored.startsWith("scrypt:")) {
    const parts = stored.split(":");
    if (parts.length !== 3) return false;
    const [, salt, hexHash] = parts;
    const derived = crypto.scryptSync(password, salt, 64);
    const storedBuf = Buffer.from(hexHash, "hex");
    if (derived.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(derived, storedBuf);
  }
  // Legacy plaintext compatibility comparison using constant-time digest
  const a = crypto.createHash("sha256").update(password).digest();
  const b = crypto.createHash("sha256").update(stored).digest();
  return crypto.timingSafeEqual(a, b);
}

// Sliding-window in-memory rate limiter
interface RateBucket {
  count: number;
  resetAt: number;
}

export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  keyPrefix: string;
  message?: string;
}) {
  const buckets = new Map<string, RateBucket>();

  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const now = Date.now();
    // Opportunistic cleanup to keep map bounded
    if (buckets.size > 5000) {
      for (const [k, v] of buckets.entries()) {
        if (now > v.resetAt) buckets.delete(k);
      }
    }

    const clientIp = req.ip || req.socket.remoteAddress || "unknown";
    const key = `${options.keyPrefix}:${clientIp}`;
    const existing = buckets.get(key);

    if (!existing || now > existing.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      res.setHeader("X-RateLimit-Limit", String(options.max));
      res.setHeader("X-RateLimit-Remaining", String(options.max - 1));
      return next();
    }

    existing.count += 1;
    const remaining = Math.max(0, options.max - existing.count);
    res.setHeader("X-RateLimit-Limit", String(options.max));
    res.setHeader("X-RateLimit-Remaining", String(remaining));

    if (existing.count > options.max) {
      const retryAfterSec = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
      res.setHeader("Retry-After", String(retryAfterSec));
      return res.status(429).json({
        error: options.message || "Too many requests. Please wait a moment and try again.",
        retryAfterSeconds: retryAfterSec,
      });
    }

    return next();
  };
}

// Global security headers middleware (iframe-compatible for AI Studio preview)
export function securityHeadersMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), payment=(), usb=()");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader(
    "Content-Security-Policy",
    "object-src 'none'; base-uri 'self'; frame-ancestors 'self' https://aistudio.google.com https://*.google.com https://*.googleusercontent.com;"
  );

  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
}

export function escapeHtml(str: unknown): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function sanitizeText(val: unknown, maxLen: number): string {
  return String(val ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLen);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}

export function validateSafeImageUpload(dataUrl: string): {
  valid: boolean;
  ext?: string;
  buffer?: Buffer;
  error?: string;
} {
  // Only allow safe raster formats (SVG blocked to prevent stored XSS)
  const matches = dataUrl.match(/^data:image\/(png|jpeg|jpg|webp|gif);base64,([A-Za-z0-9+/=]+)$/i);
  if (!matches) {
    return {
      valid: false,
      error: "Only PNG, JPG, WEBP, and GIF images are allowed.",
    };
  }

  const subType = matches[1].toLowerCase();
  const buffer = Buffer.from(matches[2], "base64");
  const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
  if (buffer.length === 0 || buffer.length > MAX_BYTES) {
    return {
      valid: false,
      error: "Image size must be under 5 MB.",
    };
  }

  // Magic-byte signature check
  const isPng =
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47;
  const isJpg =
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff;
  const isGif =
    buffer.length >= 6 &&
    buffer.subarray(0, 4).toString("ascii") === "GIF8";
  const isWebp =
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP";

  if (subType === "png" && !isPng) {
    return { valid: false, error: "Invalid PNG file signature." };
  }
  if ((subType === "jpg" || subType === "jpeg") && !isJpg) {
    return { valid: false, error: "Invalid JPEG file signature." };
  }
  if (subType === "gif" && !isGif) {
    return { valid: false, error: "Invalid GIF file signature." };
  }
  if (subType === "webp" && !isWebp) {
    return { valid: false, error: "Invalid WEBP file signature." };
  }

  const ext = subType === "jpeg" ? "jpg" : subType;
  return { valid: true, ext, buffer };
}
