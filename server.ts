import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { EV_MODELS, EVModel } from "./src/data/evModels";
import { ALL_BLOG_POSTS } from "./src/data/allBlogPosts";
import {
  resolveSeoForPath,
  STATIC_ROUTE_SEO,
  type ResolvedSeo,
  type SeoTabKey,
} from "./src/seo/seoConfig";
import {
  ADMIN_COOKIE_NAME,
  USER_COOKIE_NAME,
  clearAdminResetOtp,
  clearAuthCookie,
  createAdminResetOtp,
  createRateLimiter,
  escapeHtml,
  extractAuthToken,
  getAdminRecoveryEmail,
  hasStoredAdminPasscode,
  hashPassword,
  isValidEmail,
  maskEmail,
  requireAdminAuth,
  sanitizeText,
  securityHeadersMiddleware,
  setAuthCookie,
  signAuthToken,
  updateAdminPasscode,
  updateAdminRecoveryEmail,
  validateSafeImageUpload,
  verifyAdminPasscode,
  verifyAdminResetOtp,
  verifyAuthToken,
  verifyPassword,
} from "./src/server/security";

function getRequestOrigin(req: express.Request): string {
  if (process.env.APP_URL && process.env.APP_URL.trim()) {
    return process.env.APP_URL.trim().replace(/\/+$/, "");
  }
  const protoHeader = (req.headers["x-forwarded-proto"] as string | undefined)?.split(",")[0]?.trim();
  const hostHeader = (req.headers["x-forwarded-host"] as string | undefined)?.split(",")[0]?.trim() || req.get("host");
  const protocol = protoHeader || req.protocol || "https";
  return hostHeader ? `${protocol}://${hostHeader}` : "https://goinfoev.com";
}

function escapeHtmlAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function injectSeoIntoHtml(html: string, seo: ResolvedSeo): string {
  const safeTitle = escapeHtmlAttr(seo.title);
  const safeDesc = escapeHtmlAttr(seo.description);
  const safeKeywords = escapeHtmlAttr(seo.keywords);
  const safeRobots = escapeHtmlAttr(seo.robots);
  const safeCanonical = escapeHtmlAttr(seo.canonicalUrl);
  const safeOgImage = escapeHtmlAttr(seo.ogImageUrl);
  const safeOgType = escapeHtmlAttr(seo.ogType);

  let out = html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`)
    .replace(/<meta\s+name="description"[^>]*>/i, `<meta name="description" content="${safeDesc}" />`)
    .replace(/<meta\s+name="keywords"[^>]*>/i, `<meta name="keywords" content="${safeKeywords}" />`)
    .replace(/<meta\s+name="robots"[^>]*>/i, `<meta name="robots" content="${safeRobots}" />`)
    .replace(/<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${safeCanonical}" />`)
    .replace(/<meta\s+property="og:type"[^>]*>/i, `<meta property="og:type" content="${safeOgType}" />`)
    .replace(/<meta\s+property="og:title"[^>]*>/i, `<meta property="og:title" content="${safeTitle}" />`)
    .replace(/<meta\s+property="og:description"[^>]*>/i, `<meta property="og:description" content="${safeDesc}" />`)
    .replace(/<meta\s+property="og:url"[^>]*>/i, `<meta property="og:url" content="${safeCanonical}" />`)
    .replace(/<meta\s+property="og:image"[^>]*>/i, `<meta property="og:image" content="${safeOgImage}" />`)
    .replace(/<meta\s+name="twitter:title"[^>]*>/i, `<meta name="twitter:title" content="${safeTitle}" />`)
    .replace(/<meta\s+name="twitter:description"[^>]*>/i, `<meta name="twitter:description" content="${safeDesc}" />`)
    .replace(/<meta\s+name="twitter:image"[^>]*>/i, `<meta name="twitter:image" content="${safeOgImage}" />`);

  const jsonLdScripts = seo.jsonLd
    .map((schema) => `<script type="application/ld+json" data-seo-jsonld="true">${JSON.stringify(schema)}</script>`)
    .join("\n    ");

  if (/<script[^>]*data-seo-jsonld="true"[^>]*>[\s\S]*?<\/script>/i.test(out)) {
    out = out.replace(/<script[^>]*data-seo-jsonld="true"[^>]*>[\s\S]*?<\/script>/gi, jsonLdScripts);
  } else {
    out = out.replace(/<\/head>/i, `    ${jsonLdScripts}\n  </head>`);
  }

  return out;
}

// Lazy initialization of GoogleGenAI
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

interface InventoryItem {
  id: string;
  name: string;
  cat: string;
  price: number;
  qty: number;
  alert: number;
}

let inventory: InventoryItem[] = [
  { id: "inv-1", name: "Crown Fairy LFP Battery Pack 60.8V 30Ah", cat: "Batteries", price: 185000, qty: 8, alert: 3 },
  { id: "inv-2", name: "Crown Surge LFP Battery Pack 73.6V 40Ah", cat: "Batteries", price: 294400, qty: 12, alert: 5 },
  { id: "inv-3", name: "Yadea TTFAR Graphene Pack 72V 26Ah", cat: "Batteries", price: 165000, qty: 15, alert: 4 },
  { id: "inv-4", name: "Evee Phylion Lithium Battery 76.8V 32Ah", cat: "Batteries", price: 320000, qty: 4, alert: 3 },
  { id: "inv-5", name: "1500W BLDC Hub Motor Assembly", cat: "Motors", price: 45000, qty: 10, alert: 2 },
  { id: "inv-6", name: "3000W High Torque Brushless Motor", cat: "Motors", price: 78000, qty: 3, alert: 2 },
  { id: "inv-7", name: "72V 10A Fast Charger Module", cat: "Accessories", price: 18500, qty: 25, alert: 5 },
  { id: "inv-8", name: "Smart Bluetooth BMS Unit 24S", cat: "Accessories", price: 12000, qty: 18, alert: 5 }
];

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  receivedAt: string;
  deliveredTo: string[];
  status: "dispatched" | "logged";
}

let contactInquiries: ContactInquiry[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  if (!process.env.ADMIN_PASSCODE || !process.env.SESSION_SECRET) {
    console.warn("[Security] ADMIN_PASSCODE or SESSION_SECRET env var not set; set strong secrets in production environment.");
  }

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(securityHeadersMiddleware);

  app.use(express.json({ limit: "8mb" }));
  app.use(express.urlencoded({ limit: "8mb", extended: true }));

  const generalApiLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 180,
    keyPrefix: "api-global",
  });
  const adminLoginLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 8,
    keyPrefix: "admin-login",
    message: "Too many failed admin login attempts. Please try again in 15 minutes.",
  });
  const adminRecoveryLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    keyPrefix: "admin-recovery",
    message: "Too many recovery email requests. Please wait 15 minutes before trying again.",
  });
  const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 25,
    keyPrefix: "user-auth",
    message: "Too many authentication requests. Please wait before trying again.",
  });
  const contactLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    keyPrefix: "contact",
    message: "Too many contact inquiries sent. Please try again later.",
  });
  const botLimiter = createRateLimiter({
    windowMs: 10 * 60 * 1000,
    max: 40,
    keyPrefix: "bot",
    message: "Chat rate limit reached. Please wait a few minutes.",
  });

  app.use("/api", generalApiLimiter);

  // Ensure public uploads directory exists & serve safely
  const publicUploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(publicUploadsDir)) {
    fs.mkdirSync(publicUploadsDir, { recursive: true });
  }
  app.use(
    "/uploads",
    (req, res, next) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Content-Security-Policy", "default-src 'none'");
      next();
    },
    express.static(publicUploadsDir, { dotfiles: "deny" })
  );
  app.use("/assets", express.static(path.join(process.cwd(), "public", "assets"), { dotfiles: "deny" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Admin Session Authentication
  app.post("/api/admin/login", adminLoginLimiter, (req, res) => {
    const passcode = typeof req.body?.passcode === "string" ? req.body.passcode : "";
    if (!verifyAdminPasscode(passcode)) {
      return res.status(401).json({ error: "Invalid admin security passcode." });
    }
    const maxAgeMs = 12 * 60 * 60 * 1000;
    const expiresAt = Date.now() + maxAgeMs;
    const token = signAuthToken({ role: "admin", sub: "admin", exp: expiresAt });
    setAuthCookie(res, req, ADMIN_COOKIE_NAME, token, maxAgeMs);
    return res.json({ success: true, token, expiresAt });
  });

  app.get("/api/admin/session", (req, res) => {
    const passcodeConfigured = hasStoredAdminPasscode();
    const token = extractAuthToken(req, ADMIN_COOKIE_NAME);
    const verified = verifyAuthToken(token);

    if (verified && verified.role === "admin") {
      return res.json({ authenticated: true, passcodeConfigured });
    }

    // First-time access: if admin has not selected a passcode inside the portal yet, auto-issue session
    if (!passcodeConfigured) {
      const maxAgeMs = 12 * 60 * 60 * 1000;
      const expiresAt = Date.now() + maxAgeMs;
      const newToken = signAuthToken({ role: "admin", sub: "admin", exp: expiresAt });
      setAuthCookie(res, req, ADMIN_COOKIE_NAME, newToken, maxAgeMs);
      return res.json({
        authenticated: true,
        token: newToken,
        expiresAt,
        passcodeConfigured: false,
      });
    }

    res.json({ authenticated: false, passcodeConfigured: true });
  });

  app.post("/api/admin/logout", (req, res) => {
    clearAuthCookie(res, req, ADMIN_COOKIE_NAME);
    res.json({ success: true });
  });

  // Helper to configure Nodemailer transporter from SMTP_* or Gmail App Password env vars
  function getMailTransportConfig(): {
    configured: boolean;
    fromUser: string;
    transporter: nodemailer.Transporter | null;
  } {
    const gmailUser = process.env.GMAIL_USER?.trim();
    const gmailAppPass = process.env.GMAIL_APP_PASSWORD?.trim();
    const smtpHost = process.env.SMTP_HOST?.trim();
    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpPass = process.env.SMTP_PASS?.trim();

    if (smtpHost && smtpUser && smtpPass) {
      return {
        configured: true,
        fromUser: smtpUser,
        transporter: nodemailer.createTransport({
          host: smtpHost,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === "true",
          auth: { user: smtpUser, pass: smtpPass },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
        }),
      };
    }

    const user = gmailUser || smtpUser || "";
    const rawPass = gmailAppPass || smtpPass || "";
    const pass = gmailAppPass ? rawPass.replace(/\s+/g, "") : rawPass;
    if (user && pass) {
      return {
        configured: true,
        fromUser: user,
        transporter: nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: { user, pass },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
        }),
      };
    }

    return { configured: false, fromUser: "", transporter: null };
  }

  // Public-safe Admin Recovery Status (exposes masked email only, never full email or secrets)
  app.get("/api/admin/recovery-status", (req, res) => {
    const recoveryEmail = getAdminRecoveryEmail();
    const mailConfig = getMailTransportConfig();
    res.json({
      maskedEmail: maskEmail(recoveryEmail),
      smtpConfigured: mailConfig.configured,
    });
  });

  // Step 1: Send 6-Digit Forgot Passcode OTP strictly to registered Admin Gmail
  app.post("/api/admin/forgot-passcode", adminRecoveryLimiter, async (req, res) => {
    const recoveryEmail = getAdminRecoveryEmail();
    const masked = maskEmail(recoveryEmail);
    const confirmEmail = sanitizeText(req.body?.email, 254).toLowerCase();

    if (confirmEmail && confirmEmail !== recoveryEmail.toLowerCase()) {
      return res.status(400).json({
        error: `Entered email does not match the registered Admin recovery Gmail (${masked}).`,
      });
    }

    const mailConfig = getMailTransportConfig();
    if (!mailConfig.configured || !mailConfig.transporter) {
      return res.status(503).json({
        code: "SMTP_NOT_CONFIGURED",
        maskedEmail: masked,
        error:
          "Gmail email dispatch is not configured on the server yet. Add GMAIL_USER and GMAIL_APP_PASSWORD (or SMTP_HOST/SMTP_USER/SMTP_PASS) in your environment Secrets.",
      });
    }

    const otpResult = createAdminResetOtp();
    if ("error" in otpResult) {
      return res.status(429).json({
        error: otpResult.error,
        retryAfterSeconds: otpResult.retryAfterSeconds,
      });
    }

    const origin = getRequestOrigin(req);
    const clientIp = req.ip || req.socket.remoteAddress || "Unknown";

    try {
      await mailConfig.transporter.sendMail({
        from: `"goinfoEV Security" <${mailConfig.fromUser}>`,
        to: recoveryEmail,
        subject: `[goinfoEV] Admin Passcode Recovery Code: ${otpResult.code}`,
        text: `goinfoEV Admin Control Portal — Passcode Reset Request

Your 6-digit one-time recovery code is: ${otpResult.code}

This code expires in ${otpResult.expiresInMinutes} minutes and can only be used once.
Portal URL: ${origin}/admin
Requested From IP: ${clientIp}
Timestamp: ${new Date().toISOString()}

If you did not request this reset, ignore this email — your Admin Passcode has not been changed.`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff;">
            <div style="border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px;">
              <h2 style="margin: 0; color: #0f172a; font-size: 20px;">goinfo<span style="color: #2563eb;">EV</span> Admin Security</h2>
              <p style="margin: 4px 0 0; color: #64748b; font-size: 12px;">Admin Control Portal Passcode Recovery</p>
            </div>
            <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-top: 0;">
              A passcode reset was requested for the <strong>goinfoEV Admin Control Portal</strong>. Use the 6-digit verification code below to set a new Admin Passcode:
            </p>
            <div style="background: #f1f5f9; border: 1px dashed #2563eb; border-radius: 12px; padding: 18px; text-align: center; margin: 20px 0;">
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700; margin-bottom: 6px;">One-Time Recovery Code</div>
              <div style="font-family: monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #0f172a;">${escapeHtml(otpResult.code)}</div>
            </div>
            <p style="color: #475569; font-size: 13px; line-height: 1.5;">
              • Valid for <strong>${otpResult.expiresInMinutes} minutes</strong> (single use only).<br/>
              • Request IP: <code>${escapeHtml(clientIp)}</code>
            </p>
            <p style="color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 14px; margin-bottom: 0;">
              If you did not request this code, safely ignore this email. Your existing passcode remains unchanged.
            </p>
          </div>
        `,
      });

      return res.json({
        success: true,
        maskedEmail: masked,
        expiresInMinutes: otpResult.expiresInMinutes,
        message: `6-digit recovery code sent to ${masked}. Check your Gmail inbox (and Spam folder).`,
      });
    } catch (err: any) {
      clearAdminResetOtp();
      console.error("[Security] Failed to send Admin recovery email:", err?.message || err);
      return res.status(500).json({
        error: "Could not send recovery email via Gmail SMTP. Please verify your SMTP / Gmail App Password credentials.",
      });
    }
  });

  // Step 2: Verify 6-digit OTP and set a new scrypt-hashed Admin Passcode + issue fresh Admin session
  app.post("/api/admin/reset-passcode", adminLoginLimiter, (req, res) => {
    const code = typeof req.body?.code === "string" ? req.body.code : "";
    const newPasscode = typeof req.body?.newPasscode === "string" ? req.body.newPasscode.trim() : "";

    if (newPasscode.length < 4 || newPasscode.length > 128) {
      return res.status(400).json({
        error: "New Admin Passcode must be at least 4 characters long.",
      });
    }

    const check = verifyAdminResetOtp(code);
    if (!check.valid) {
      return res.status(401).json({ error: check.error || "Invalid recovery code." });
    }

    try {
      updateAdminPasscode(newPasscode);
    } catch (err: any) {
      return res.status(400).json({ error: err?.message || "Failed to update passcode." });
    }

    const maxAgeMs = 12 * 60 * 60 * 1000;
    const expiresAt = Date.now() + maxAgeMs;
    const token = signAuthToken({ role: "admin", sub: "admin", exp: expiresAt });
    setAuthCookie(res, req, ADMIN_COOKIE_NAME, token, maxAgeMs);

    return res.json({
      success: true,
      token,
      expiresAt,
      message: "Admin Passcode reset successfully. You are now signed in.",
    });
  });

  // Authenticated Admin: View & update Admin Passcode & Recovery Gmail
  app.get("/api/admin/security-settings", requireAdminAuth, (req, res) => {
    const mailConfig = getMailTransportConfig();
    res.json({
      recoveryEmail: getAdminRecoveryEmail(),
      smtpConfigured: mailConfig.configured,
      hasCustomPasscode: hasStoredAdminPasscode(),
    });
  });

  app.post("/api/admin/change-passcode", requireAdminAuth, (req, res) => {
    const currentPasscode = typeof req.body?.currentPasscode === "string" ? req.body.currentPasscode : "";
    const newPasscode = typeof req.body?.newPasscode === "string" ? req.body.newPasscode.trim() : "";
    const recoveryEmail = typeof req.body?.recoveryEmail === "string" ? req.body.recoveryEmail.trim() : "";

    // Only require currentPasscode if a custom passcode was already set previously
    if (hasStoredAdminPasscode() && !verifyAdminPasscode(currentPasscode)) {
      return res.status(401).json({ error: "Current Admin Passcode is incorrect." });
    }

    try {
      if (newPasscode) {
        updateAdminPasscode(newPasscode);
      }
      let savedEmail = getAdminRecoveryEmail();
      if (recoveryEmail) {
        savedEmail = updateAdminRecoveryEmail(recoveryEmail);
      }
      return res.json({
        success: true,
        recoveryEmail: savedEmail,
        hasCustomPasscode: hasStoredAdminPasscode(),
        message: newPasscode
          ? "Admin Passcode saved! Next time you lock or sign in, this passcode will be required."
          : "Admin recovery email updated successfully.",
      });
    } catch (err: any) {
      return res.status(400).json({ error: err?.message || "Failed to update admin security settings." });
    }
  });

  // Pakistani EV AI Assistant Chatbot API (Powered by Gemini with smart local knowledge fallback)
  app.post("/api/bot/chat", botLimiter, async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message || typeof message !== "string" || message.trim() === "") {
        return res.status(400).json({ error: "Message is required" });
      }
      if (message.length > 1500) {
        return res.status(400).json({ error: "Message exceeds maximum length of 1500 characters" });
      }

      const userText = message.trim();
      const client = getGeminiClient();

      // Dynamic dataset summary for full catalog grounding
      const modelSummaryText = EV_MODELS.map(m => 
        `- ${m.brand} ${m.model} ${m.variant ? `(${m.variant})` : ''}: Price PKR ${m.price ? m.price.toLocaleString('en-PK') : 'N/A'}, Battery: ${m.batteryLabel} (${m.batteryWh}Wh, ${m.chemistry.toUpperCase()}), Motor: ${m.motor}, Range: ${m.rangeMin}-${m.rangeMax} km, Top Speed: ${m.topSpeed}, Charge Time: ${m.chargeTime}`
      ).slice(0, 80).join('\n');

      // System instructions providing rich Pakistani EV ecosystem grounding
      const systemInstruction = `You are "PakEV Assistant", the official smart AI consultant on goinfoEV - Pakistan's premier Electric Vehicle analytics & advisory platform.
You assist Pakistani consumers, daily commuters, and delivery riders (Foodpanda, Bykea, Yango, Indrive) with expert advice based on the exact live website dataset below.

WEBSITE LIVE EV DATABASE (${EV_MODELS.length} Models Available):
${modelSummaryText}

KEY ECOSYSTEM FACTS & PRICING IN PAKISTAN:
1. TOP EV BIKE BRANDS IN DATABASE:
   - Crown Electric: Rizz (PKR 145,000), Spark Lithium (PKR 195,000), Fairy Lithium (PKR 235,000), Firefly (PKR 245,000), Flash (PKR 299,000), Champion Standard/Pro (PKR 285,000 - 345,000), Raftaar Standard/Pro (PKR 309,900 - 365,000), X200 (PKR 325,000), Ezee 3-Wheeler Trike & Utility, Rick E Rickshaw.
   - MS Jaguar: Miso (PKR 158,000), Bolt (PKR 174,000), M1 (PKR 204,000), Legacy (PKR 245,000), E-70 (PKR 265,000), E-70 Supreme (PKR 275,000), E-125 Flagship (PKR 370,000).
   - Vlektra: Retro (PKR 279,000), Velocity 180 (PKR 339,000, 180 km range), Velocity 180 SE (PKR 399,000), Bolt Streetfighter (PKR 549,000), Bolt Dark (PKR 599,000), 1969 Retro Café Racer (PKR 619,000).
   - OKLA: ORA (PKR 199,000), ORBIT (PKR 225,000), ONYX (PKR 189,000), OKT Lithium Pro (PKR 298,000), OMO (PKR 299,000), OMIGO (PKR 299,000), OKG Streetfighter (PKR 449,000), OMAX Maxi (PKR 599,000), OVEGA Superbike (7kW mid-drive, 200km range, PKR 799,000).
   - REVOO: A04 (PKR 100,000), A09 (PKR 145,000), A11 (PKR 167,000/205,000), A12 (PKR 180,000/239,000), Y04 Portable (PKR 119,000), Y06 City (PKR 151,000), C35 Young/Comfort/GT Flagship (PKR 235,000 - 399,000), B12 Delivery (PKR 350,000), E52 Heavy Cruiser (PKR 405,000).
   - Jolta Electric: JE-125L Flagship (PKR 329,900), JE-100L SE Apex (PKR 274,900), JE-70L SE Bolt (PKR 264,900), JE-100L Thunder (PKR 249,900), JE-70L Fury (PKR 239,900), JE-100G Fox (PKR 185,900), JE-70G Wolf (PKR 170,900), Mecha Scooty (PKR 271,900), Zeno Pro, Sparrow (PKR 120,900).
   - YJ Future: Azadi C1 (PKR 189,000/219,000), Indus Cargo Loader (PKR 95,000), Zippy E1 (PKR 130,000), S7 (PKR 159,000), Twister (PKR 167,000/205,000), Cruise Z1 Maxi (PKR 199,000), Cruise Z9 Flagship Maxi (PKR 229,000/269,000), Cruise X7 (PKR 249,000), Mini EV 3-Wheeler Cabin (PKR 385,000), Mini EV Pro 4-Door (PKR 485,000).
   - Jinpeng, Yadea, Metro, United Auto Industries.

2. BATTERY COMPARISONS FOR PAKISTAN CLIMATE:
   - LFP (Lithium Iron Phosphate): 3000-4000 cycles (7-10 years). Safest in 45°C+ Pakistan summer.
   - Graphene (TTFAR): 800-1200 cycles (2.5-4 years). Affordable replacement.
   - NMC Lithium: 1500-2000 cycles, lightweight, high performance.

3. CHARGING COSTS & CALCULATIONS:
   - Tariff: Average PKR 45 to 65 per unit.
   - Units per full charge: 2.0 to 3.5 units. Total cost per charge: PKR 90 to 180 (for 80-110 km!).
   - Cost per km: PKR 1.1 to 1.6 / km (Petrol 70cc costs ~PKR 7.00/km @ Rs 280/L).

4. COMMUNICATION STYLE:
   - Respond in clear, helpful, accurate English or Roman Urdu matching the user's input.
   - Include relevant data (prices, specs, range) from the dataset.
   - Add exact action tokens on a new line when helpful:
     [ACTION:range], [ACTION:charging], [ACTION:savings], [ACTION:dealerships], [ACTION:battery], [ACTION:solar], [ACTION:rider], [ACTION:products], [ACTION:comparison], [ACTION:contact]`;

      let botReply = "";

      if (client) {
        try {
          // Format conversation history for Gemini
          const contents: any[] = [];
          if (Array.isArray(history)) {
            history.slice(-8).forEach((h: any) => {
              if (h && typeof h === "object" && h.role && h.content) {
                contents.push({
                  role: h.role === "user" ? "user" : "model",
                  parts: [{ text: String(h.content).slice(0, 1500) }],
                });
              }
            });
          }
          contents.push({
            role: "user",
            parts: [{ text: userText }],
          });

          const geminiResponse = await client.models.generateContent({
            model: "gemini-3.8-flash",
            contents,
            config: {
              systemInstruction,
            },
          });

          botReply = geminiResponse.text || "";
        } catch (geminiError: any) {
          console.warn("Gemini API call warning, falling back to expert knowledge base:", geminiError?.message || geminiError);
        }
      }

      // If Gemini response is empty or client not configured, use rich local knowledge engine
      if (!botReply || botReply.trim() === "") {
        botReply = generateLocalPakEVResponse(userText);
      }

      // Parse action tags to send as structured quick actions
      const actionMatches = botReply.match(/\[ACTION:([a-z]+)\]/g) || [];
      const suggestedActions = Array.from(
        new Set(
          actionMatches.map((m) => m.replace("[ACTION:", "").replace("]", ""))
        )
      );

      // Clean response text
      const cleanReply = botReply.replace(/\[ACTION:[a-z]+\]/g, "").trim();

      res.status(200).json({
        reply: cleanReply,
        actions: suggestedActions,
        provider: client ? "gemini-3.8-flash" : "pakev-knowledge-base",
      });
    } catch (err: any) {
      console.error("Error in /api/bot/chat:", err);
      res.status(500).json({
        error: "Sorry, could not process query right now.",
        reply: "Sorry, the assistant service could not be reached right now. Please try again or reach out through our contact form.",
        actions: ["contact", "products"],
      });
    }
  });

  // Local knowledge helper for fallback (Dynamic EV_MODELS lookup)
  function generateLocalPakEVResponse(query: string): string {
    const q = query.toLowerCase().trim();

    // 1. Check for specific brand match in EV_MODELS
    const matchedModels = EV_MODELS.filter(m => 
      q.includes(m.brand.toLowerCase()) || 
      q.includes(m.model.toLowerCase()) ||
      (m.variant && q.includes(m.variant.toLowerCase()))
    );

    if (matchedModels.length > 0) {
      const topMatches = matchedModels.slice(0, 5);
      const listText = topMatches.map(m => 
        `• **${m.brand} ${m.model}** ${m.variant ? `(${m.variant})` : ''}\n  - **Price:** ${m.price ? `PKR ${m.price.toLocaleString('en-PK')}` : 'Contact Showroom'}\n  - **Battery:** ${m.batteryLabel} (${m.chemistry.toUpperCase()})\n  - **Range:** ${m.rangeMin}-${m.rangeMax} km | **Top Speed:** ${m.topSpeed}\n  - **Motor:** ${m.motor}`
      ).join('\n\n');

      return `⚡ **Website Dataset Details for "${query}":**\n\n${listText}\n\n💡 *Tip:* You can use our simulator tools to calculate exact monthly charging bill and petrol savings for these models!\n\n[ACTION:products]\n[ACTION:range]\n[ACTION:charging]`;
    }

    // 2. Specific Query Intent Checks
    if (q.includes("range") || q.includes("km") || q.includes("kitne km") || q.includes("kitni chal")) {
      return `⚡ **Pakistan EV Bike Range Highlights:**\n\n- **Longest Commuter:** Vlektra Velocity 180 (180 km certified range, PKR 339,000)\n- **High Performance:** Vlektra Bolt & 1969 Retro (150 km range, 105 km/h, PKR 549,000 - 619,000)\n- **Crown Raftaar Pro LFP:** 140 - 160 km range (PKR 365,000)\n- **MS Jaguar E-125 Flagship:** 150 - 170 km range (PKR 370,000)\n- **Jinpeng Thrill:** 140 - 160 km range (75 km/h, PKR 549,000)\n- **OKLA OVEGA Superbike:** 200 - 215 km range (7kW mid-drive, PKR 799,000)\n\n[ACTION:range]\n[ACTION:products]`;
    }

    if (q.includes("cost") || q.includes("unit") || q.includes("charging") || q.includes("bill") || q.includes("kharcha") || q.includes("bijli")) {
      return `💰 **EV Charging & Electricity Cost in Pakistan:**\n\n- **Units per Full Charge:** Typically **2.0 to 3.5 units (kWh)** for 80-120 km range.\n- **Current Tariff Rate:** Rs. 45 - 65 per unit (K-Electric / LESCO / IESCO / FESCO).\n- **Cost per Full Charge:** Just **Rs. 90 to Rs. 180**!\n- **Cost Per Kilometer:** ~**Rs. 1.20 to Rs. 1.50 per km** (vs Petrol 70cc ~Rs. 7.00/km @ Rs 280/L).\n\n[ACTION:charging]\n[ACTION:savings]`;
    }

    if (q.includes("bachat") || q.includes("saving") || q.includes("petrol") || q.includes("comparison") || q.includes("muqabla")) {
      return `📊 **Monthly Petrol vs EV Savings:**\n\n- **Petrol 70cc Bike (1,500 km/mo):** ~Rs. 10,500 Petrol + Rs. 1,500 Oil = **Rs. 12,000/month**.\n- **EV Bike (1,500 km/mo):** ~Rs. 2,000 Electricity + Rs. 0 Oil = **Rs. 2,000/month**.\n- **Monthly Savings:** **Rs. 10,000+ per month**!\n- **Yearly Savings:** **Rs. 120,000+ per year**!\n\n[ACTION:savings]\n[ACTION:comparison]`;
    }

    if (q.includes("battery") || q.includes("lfp") || q.includes("graphene") || q.includes("life") || q.includes("lithium")) {
      return `🔋 **Battery Tech Comparison for Pakistan Climate:**\n\n- **Lithium LFP (LiFePO4):** 3,000 - 4,000 cycles (7 to 10 years life). Zero thermal runaway risk in 45°C+ summer heat. Featured in Crown, MS Jaguar, Vlektra, Revoo & Okla LFP models.\n- **TTFAR Graphene:** 800 - 1,200 cycles (2.5 to 4 years). Budget-friendly replacement.\n- **NMC / Ternary Lithium:** Lightweight, high acceleration.\n\n[ACTION:battery]`;
    }

    if (q.includes("sasti") || q.includes("cheapest") || q.includes("budget") || q.includes("price") || q.includes("rate") || q.includes("qeemat") || q.includes("qemat")) {
      return `🏷️ **Latest EV Bike Prices in Pakistan (Budget to Premium):**\n\n- **Under Rs. 150,000:** Revoo A04 (PKR 100k), YJ Future Indus Cargo (PKR 95k), Metro Wonder Bike (PKR 95k), Revoo Y04 (PKR 119k), Crown Rizz (PKR 145k), Revoo A09 (PKR 145k).\n- **Rs. 150,000 - 250,000:** MS Jaguar Miso (PKR 158k), MS Jaguar Bolt (PKR 174k), Jolta JE-70G Wolf (PKR 170.9k), Crown Spark (PKR 195k), Yadea Ruibin (PKR 209k), YJ Future Azadi (PKR 189k-219k).\n- **Rs. 250,000 - 400,000:** MS Jaguar E-70 (PKR 265k), Crown Raftaar (PKR 309.9k), Vlektra Retro (PKR 279k), Vlektra Velocity 180 (PKR 339k), MS Jaguar E-125 (PKR 370k).\n- **Over Rs. 400,000:** Vlektra Bolt (PKR 549k), Jinpeng Thrill (PKR 549k), OKLA OVEGA (PKR 799k).\n\n[ACTION:products]\n[ACTION:comparison]`;
    }

    if (q.includes("karachi") || q.includes("lahore") || q.includes("islamabad") || q.includes("showroom") || q.includes("dealership") || q.includes("shop")) {
      return `📍 **Showroom & Dealership Hubs in Pakistan:**\n\n- **Karachi:** Akbar Road Saddar, Clifton Block 4, DHA Phase 6, Main Rashid Minhas Road.\n- **Lahore:** McLeod Road 2-Wheeler Market, Main Boulevard Gulberg, DHA Phase 5.\n- **Islamabad / Rawalpindi:** Murree Road & Blue Area.\n\n[ACTION:dealerships]`;
    }

    // Default response using complete website dataset context
    return `Hello! I am the **goinfoEV AI Assistant** ⚡. I can answer any question about our website's EV dataset (${EV_MODELS.length} EV models from Crown, MS Jaguar, Vlektra, OKLA, REVOO, Jolta, YJ Future, Yadea, Metro, Jinpeng, and United):\n\n- 🛵 **Model specs, prices, battery types & top speeds**\n- 💰 **Monthly petrol vs EV savings comparisons**\n- ⚡ **K-Electric, LESCO & IESCO charging bill calculations**\n- 🔋 **LFP vs Graphene battery health & summer heat safety**\n- 📍 **Showroom locations in Karachi, Lahore, and Islamabad**\n\nWhat would you like to know? You can ask in English or Roman Urdu!\n\n[ACTION:products]\n[ACTION:savings]`;
  }

  // Contact Form Submission API - Sends to BOTH configured emails
  app.post("/api/contact", contactLimiter, async (req, res) => {
    try {
      const cleanName = sanitizeText(req.body?.name, 100);
      const cleanEmail = sanitizeText(req.body?.email, 254);
      const cleanPhone = sanitizeText(req.body?.phone, 40);
      const cleanSubject = sanitizeText(req.body?.subject, 140) || "General EV Inquiry";
      const cleanMessage = sanitizeText(req.body?.message, 3000);

      if (!cleanName || !cleanEmail || !cleanMessage) {
        return res.status(400).json({ error: "Name, email and message are required fields." });
      }
      if (!isValidEmail(cleanEmail)) {
        return res.status(400).json({ error: "Please provide a valid email address." });
      }

      const primaryEmail = process.env.CONTACT_PRIMARY_EMAIL || "Hamdan7394@gmail.com";
      const secondaryEmail = process.env.CONTACT_SECONDARY_EMAIL || "info@orinexai.com";
      const recipients = [primaryEmail, secondaryEmail];

      const ticketId = `EV-PK-${Math.floor(100000 + Math.random() * 900000)}`;
      const inquiry: ContactInquiry = {
        id: ticketId,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone || "Not provided",
        subject: cleanSubject,
        message: cleanMessage,
        receivedAt: new Date().toISOString(),
        deliveredTo: recipients,
        status: "logged"
      };

      contactInquiries.unshift(inquiry);

      // Persist to local JSON file for safe recordkeeping
      try {
        const inquiriesFilePath = path.join(process.cwd(), "inquiries.json");
        fs.writeFileSync(inquiriesFilePath, JSON.stringify(contactInquiries.slice(0, 200), null, 2));
      } catch (fileErr) {
        console.warn("Could not write inquiries.json:", fileErr);
      }

      let emailDispatched = false;
      let dispatchMessage = `Inquiry recorded for dispatch to ${primaryEmail} & ${secondaryEmail}.`;

      // If SMTP or Gmail App Password credentials exist, send real email directly via Nodemailer
      const contactMailConfig = getMailTransportConfig();
      if (contactMailConfig.configured && contactMailConfig.transporter) {
        try {
          const transporter = contactMailConfig.transporter;

          const safeHtmlName = escapeHtml(cleanName);
          const safeHtmlEmail = escapeHtml(cleanEmail);
          const safeHtmlPhone = escapeHtml(cleanPhone || "Not provided");
          const safeHtmlSubject = escapeHtml(cleanSubject);
          const safeHtmlMessage = escapeHtml(cleanMessage).replace(/\n/g, "<br/>");

          await transporter.sendMail({
            from: `"goinfoEV Contact" <${contactMailConfig.fromUser}>`,
            to: primaryEmail,
            cc: secondaryEmail,
            replyTo: cleanEmail,
            subject: `[goinfoEV Inquiry #${ticketId}] ${cleanSubject}`,
            text: `New Inquiry Received on goinfoEV Platform:

Ticket ID: #${ticketId}
Sender: ${cleanName}
Sender Email: ${cleanEmail}
Phone: ${cleanPhone || 'Not provided'}
Subject: ${cleanSubject}

Message:
${cleanMessage}

--------------------------------------------------
Delivered to:
1. ${primaryEmail}
2. ${secondaryEmail}
Timestamp: ${new Date().toLocaleString()}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
                <div style="display: flex; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px;">
                  <h2 style="color: #0f172a; margin: 0; font-size: 22px;">goinfo<span style="color: #2563eb;">EV</span> Inquiry</h2>
                  <span style="margin-left: auto; background-color: #eff6ff; color: #1d4ed8; font-weight: bold; font-size: 11px; padding: 4px 10px; border-radius: 9999px;">
                    #${ticketId}
                  </span>
                </div>

                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                      <td style="padding: 6px 0; color: #64748b; width: 100px;"><strong>Name:</strong></td>
                      <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${safeHtmlName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #64748b;"><strong>Email:</strong></td>
                      <td style="padding: 6px 0; color: #2563eb;"><a href="mailto:${safeHtmlEmail}" style="color: #2563eb; text-decoration: none;">${safeHtmlEmail}</a></td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #64748b;"><strong>Phone:</strong></td>
                      <td style="padding: 6px 0; color: #0f172a;">${safeHtmlPhone}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #64748b;"><strong>Subject:</strong></td>
                      <td style="padding: 6px 0; color: #0f172a;">${safeHtmlSubject}</td>
                    </tr>
                  </table>
                </div>

                <div style="margin-bottom: 24px;">
                  <h4 style="margin: 0 0 8px 0; color: #334155; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Message Details:</h4>
                  <div style="background-color: #ffffff; border-left: 4px solid #2563eb; padding: 14px 16px; font-size: 14px; line-height: 1.6; color: #1e293b; background: #fafafa; border-radius: 4px;">
                    ${safeHtmlMessage}
                  </div>
                </div>

                <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; font-size: 12px; color: #64748b;">
                  <p style="margin: 0 0 4px 0;">
                    ✓ Dispatched simultaneously to both:
                  </p>
                  <ul style="margin: 4px 0 0 16px; padding: 0;">
                    <li><strong>${escapeHtml(primaryEmail)}</strong> (Primary)</li>
                    <li><strong>${escapeHtml(secondaryEmail)}</strong> (Secondary / Tech Partner)</li>
                  </ul>
                </div>
              </div>
            `
          });
          emailDispatched = true;
          inquiry.status = "dispatched";
          dispatchMessage = `Email successfully dispatched via SMTP to both ${primaryEmail} and ${secondaryEmail}.`;
        } catch (mailErr: any) {
          console.warn("SMTP email dispatch error:", mailErr?.message || mailErr);
          dispatchMessage = `Inquiry logged in database and prepared for dual delivery to ${primaryEmail} & ${secondaryEmail}.`;
        }
      }

      // Generate pre-filled direct mailto string (To primary, CC secondary)
      const mailtoUrl = `mailto:${primaryEmail}?cc=${secondaryEmail}&subject=${encodeURIComponent(
        `[goinfoEV Inquiry #${ticketId}] ${cleanSubject || 'EV Inquiry'}`
      )}&body=${encodeURIComponent(
        `Hi Hamdan & Team,\n\nName: ${cleanName}\nPhone: ${cleanPhone || 'Not provided'}\nEmail: ${cleanEmail}\nReference: #${ticketId}\n\nMessage:\n${cleanMessage}\n\n---\nSent via goinfoEV Pakistan Contact Portal`
      )}`;

      res.status(200).json({
        success: true,
        ticketId,
        recipients,
        emailDispatched,
        message: dispatchMessage,
        mailtoUrl,
        inquiry
      });
    } catch (err: any) {
      console.error("Error in /api/contact:", err);
      res.status(500).json({ error: "Failed to process inquiry. Please try again or reach out directly on WhatsApp." });
    }
  });

  // Get Inquiries (Admin only)
  app.get("/api/contact/inquiries", requireAdminAuth, (req, res) => {
    res.json({
      count: contactInquiries.length,
      inquiries: contactInquiries
    });
  });

  // Inventory API (Admin only)
  app.get("/api/inventory", requireAdminAuth, (req, res) => {
    res.json(inventory);
  });

  app.post("/api/inventory", requireAdminAuth, (req, res) => {
    const { name, cat, price, qty, alert } = req.body;
    const newItem: InventoryItem = {
      id: "inv-" + Date.now(),
      name: sanitizeText(name, 120) || "New Product",
      cat: sanitizeText(cat, 60) || "General",
      price: Number(price) || 0,
      qty: Number(qty) || 0,
      alert: Number(alert) || 5
    };
    inventory.unshift(newItem);
    res.status(201).json(newItem);
  });

  app.put("/api/inventory/:id", requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const index = inventory.findIndex(item => item.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Item not found" });
    }
    const existing = inventory[index];
    inventory[index] = {
      ...existing,
      name: req.body.name !== undefined ? sanitizeText(req.body.name, 120) : existing.name,
      cat: req.body.cat !== undefined ? sanitizeText(req.body.cat, 60) : existing.cat,
      price: req.body.price !== undefined ? Number(req.body.price) : existing.price,
      qty: req.body.qty !== undefined ? Number(req.body.qty) : existing.qty,
      alert: req.body.alert !== undefined ? Number(req.body.alert) : existing.alert
    };
    res.json(inventory[index]);
  });

  app.delete("/api/inventory/:id", requireAdminAuth, (req, res) => {
    const { id } = req.params;
    inventory = inventory.filter(item => item.id !== id);
    res.json({ success: true, id });
  });

  // ==========================================
  // SUBSCRIPTIONS & CALCULATOR ACCESS CONTROL
  // ==========================================
  interface UsageLogItem {
    toolName: string;
    timestamp: string;
  }

  interface SubscriptionRecord {
    id: string;
    name: string;
    identifier: string; // phone or email
    authType: "phone" | "email";
    password?: string;
    status: "free" | "pending" | "approved" | "disallowed";
    plan?: "monthly" | "annual";
    planName?: string;
    amount?: number;
    paymentMethod?: "easypaisa" | "jazzcash" | "bank";
    trxId?: string;
    notes?: string;
    freeUsesCount: number; // 0 to 7
    usageLogs?: UsageLogItem[];
    createdAt: string;
    updatedAt: string;
    approvedAt?: string;
    disallowedAt?: string;
    disallowedReason?: string;
  }

  interface PaymentConfigRecord {
    easypaisa: {
      title: string;
      number: string;
      instructions: string;
      enabled: boolean;
    };
    jazzcash: {
      title: string;
      number: string;
      instructions: string;
      enabled: boolean;
    };
    bank: {
      bankName: string;
      title: string;
      accountNumber: string;
      iban: string;
      instructions: string;
      enabled: boolean;
    };
    pricing: {
      monthlyPKR: number;
      annualPKR: number;
      maxFreeUses: number;
    };
    supportPhone: string;
    supportWhatsApp: string;
  }

  const subscriptionsFile = path.join(process.cwd(), "subscriptions.json");
  const paymentConfigFile = path.join(process.cwd(), "payment-config.json");

  // Default Payment Configuration (Can be changed dynamically by Admin)
  let paymentConfig: PaymentConfigRecord = {
    easypaisa: {
      title: "goinfoEV / Hamdan Mirza",
      number: "0300-7394000",
      instructions: "Send exact amount via EasyPaisa App or USSD code *786# and paste TRX ID here.",
      enabled: true
    },
    jazzcash: {
      title: "goinfoEV / Hamdan Mirza",
      number: "0300-7394000",
      instructions: "Send via JazzCash App or *786# mobile account, then copy the 12-digit TID.",
      enabled: true
    },
    bank: {
      bankName: "Meezan Bank Ltd. (Raast Supported)",
      title: "goinfoEV Pakistan",
      accountNumber: "0102-0109283741",
      iban: "PK64MEZN0000123456789012",
      instructions: "Transfer to Meezan Bank or send via Raast ID with instant confirmation.",
      enabled: true
    },
    pricing: {
      monthlyPKR: 499,
      annualPKR: 2499,
      maxFreeUses: 7
    },
    supportPhone: "0300-7394000",
    supportWhatsApp: "0300-7394000"
  };

  // Load payment configuration from disk if present
  try {
    if (fs.existsSync(paymentConfigFile)) {
      const data = fs.readFileSync(paymentConfigFile, "utf-8");
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === "object") {
        paymentConfig = { ...paymentConfig, ...parsed };
      }
    } else {
      fs.writeFileSync(paymentConfigFile, JSON.stringify(paymentConfig, null, 2));
    }
  } catch (err) {
    console.warn("Could not read/write payment-config.json:", err);
  }

  function savePaymentConfig() {
    try {
      fs.writeFileSync(paymentConfigFile, JSON.stringify(paymentConfig, null, 2));
    } catch (err) {
      console.error("Failed to save payment-config.json:", err);
    }
  }


  // Initial seed subscriptions
  let subscriptions: SubscriptionRecord[] = [
    {
      id: "sub-101",
      name: "Tariq Mehmood",
      identifier: "0300-5544332",
      authType: "phone",
      status: "approved",
      plan: "monthly",
      planName: "Monthly Unlimited Pro",
      amount: 499,
      paymentMethod: "easypaisa",
      trxId: "EP-98241034",
      notes: "Paid via EasyPaisa - Rider in Lahore",
      freeUsesCount: 7,
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 46).toISOString(),
      approvedAt: new Date(Date.now() - 3600000 * 46).toISOString()
    },
    {
      id: "sub-102",
      name: "Zeeshan Ali (Bykea Rider)",
      identifier: "zeeshan.rider@gmail.com",
      authType: "email",
      status: "pending",
      plan: "annual",
      planName: "Annual Full Suite Pro",
      amount: 2499,
      paymentMethod: "jazzcash",
      trxId: "JC-74198205",
      notes: "Transferred via JazzCash mobile app",
      freeUsesCount: 7,
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 6).toISOString()
    },
    {
      id: "sub-103",
      name: "Bilal Ahmed",
      identifier: "0321-9876543",
      authType: "phone",
      status: "pending",
      plan: "monthly",
      planName: "Monthly Unlimited Pro",
      amount: 499,
      paymentMethod: "bank",
      trxId: "MEZN-44910283",
      notes: "Meezan Bank Raast transfer",
      freeUsesCount: 7,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: "sub-104",
      name: "Usman Farooq",
      identifier: "0345-1234567",
      authType: "phone",
      status: "disallowed",
      plan: "monthly",
      planName: "Monthly Unlimited Pro",
      amount: 499,
      paymentMethod: "easypaisa",
      trxId: "EP-00000000",
      notes: "Duplicate or invalid transaction",
      disallowedReason: "TRX ID not found in bank statement",
      freeUsesCount: 7,
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 50).toISOString(),
      disallowedAt: new Date(Date.now() - 3600000 * 50).toISOString()
    }
  ];

  // Load subscriptions from disk if present
  try {
    if (fs.existsSync(subscriptionsFile)) {
      const data = fs.readFileSync(subscriptionsFile, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        subscriptions = parsed;
      }
    } else {
      fs.writeFileSync(subscriptionsFile, JSON.stringify(subscriptions, null, 2));
    }
  } catch (err) {
    console.warn("Could not read/write subscriptions.json:", err);
  }

  function saveSubscriptions() {
    try {
      fs.writeFileSync(subscriptionsFile, JSON.stringify(subscriptions, null, 2));
    } catch (err) {
      console.error("Failed to save subscriptions.json:", err);
    }
  }

  function sanitizeSubscriptionRecord(u: SubscriptionRecord) {
    const { password: _pwd, ...safeRecord } = u;
    return safeRecord;
  }

  function hasValidUserOrAdminAccess(req: express.Request, targetUser: SubscriptionRecord): boolean {
    const adminToken = extractAuthToken(req, ADMIN_COOKIE_NAME);
    const adminVerified = verifyAuthToken(adminToken);
    if (adminVerified?.role === "admin") return true;

    const userToken = extractAuthToken(req, USER_COOKIE_NAME);
    const userVerified = verifyAuthToken(userToken);
    if (
      userVerified?.role === "user" &&
      (userVerified.sub.toLowerCase() === targetUser.identifier.toLowerCase().trim() ||
        userVerified.sub === targetUser.id)
    ) {
      return true;
    }
    return false;
  }

  // 1. Get User Subscription Status & Usage Logs (Authenticated user or Admin only)
  app.get("/api/subscriptions/user/:identifier", (req, res) => {
    const rawId = req.params.identifier.toLowerCase().trim();
    const user = subscriptions.find(
      s => s.identifier.toLowerCase().trim() === rawId || s.id === rawId
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!hasValidUserOrAdminAccess(req, user)) {
      return res.status(401).json({ error: "Authentication required to view account details." });
    }
    res.json(sanitizeSubscriptionRecord(user));
  });

  // 1b. Public & Admin Endpoint: Get Payment Methods Config
  app.get("/api/payment-config", (req, res) => {
    res.json(paymentConfig);
  });

  // 1c. ADMIN: Update Payment Methods & Pricing Config
  app.put("/api/admin/payment-config", requireAdminAuth, (req, res) => {
    try {
      const newConfig = req.body;
      if (!newConfig || typeof newConfig !== "object") {
        return res.status(400).json({ error: "Invalid payment config payload" });
      }
      paymentConfig = {
        ...paymentConfig,
        ...newConfig,
        pricing: {
          ...paymentConfig.pricing,
          ...(newConfig.pricing || {})
        }
      };
      savePaymentConfig();
      res.json({ success: true, message: "Payment settings updated successfully", paymentConfig });
    } catch (err: any) {
      console.error("Failed to update payment config:", err);
      res.status(500).json({ error: "Failed to update payment configuration" });
    }
  });

  // 2. User Sign-in / Registration (Phone Only — Phone, Name, and Password Required)
  app.post("/api/subscriptions/auth", authLimiter, (req, res) => {
    try {
      const { name, identifier, password } = req.body;
      const rawPhone = sanitizeText(identifier, 40);
      if (!rawPhone) {
        return res.status(400).json({ error: "Pakistani mobile phone number is required." });
      }
      if (rawPhone.includes("@")) {
        return res.status(400).json({ error: "Email sign-in is disabled. Please use your mobile phone number." });
      }

      const digitsOnly = rawPhone.replace(/\D/g, "");
      if (digitsOnly.length < 10 || digitsOnly.length > 15) {
        return res.status(400).json({ error: "Please enter a valid mobile phone number (e.g. 03001234567)." });
      }

      // Normalize Pakistani mobile numbers (e.g. 0300-1234567 -> 03001234567)
      const cleanIdentifier = digitsOnly.startsWith("92") && digitsOnly.length === 12
        ? "0" + digitsOnly.slice(2)
        : digitsOnly;

      const providedName = sanitizeText(name, 80);
      const cleanName = providedName && providedName.length >= 2
        ? providedName
        : `EV Member (${cleanIdentifier.slice(-4)})`;

      const cleanPassword = typeof password === "string" ? password.trim() : "";
      if (!cleanPassword || cleanPassword.length < 4) {
        return res.status(400).json({ error: "Password is required (at least 4 characters)." });
      }

      let existing = subscriptions.find(
        s => s.identifier.replace(/\D/g, "") === cleanIdentifier || s.identifier.toLowerCase().trim() === rawPhone.toLowerCase()
      );

      if (existing) {
        // Verify password if account has a password set
        if (existing.password) {
          if (!verifyPassword(cleanPassword, existing.password)) {
            return res.status(401).json({ error: "Incorrect password for this phone number." });
          }
          // Migrate legacy plaintext password to scrypt hash automatically
          if (!existing.password.startsWith("scrypt:")) {
            existing.password = hashPassword(cleanPassword);
            saveSubscriptions();
          }
        } else {
          existing.password = hashPassword(cleanPassword);
          saveSubscriptions();
        }

        existing.authType = "phone";
        existing.identifier = cleanIdentifier;
        if (providedName && providedName.length >= 2 && existing.name !== providedName) {
          existing.name = providedName;
        }
        existing.updatedAt = new Date().toISOString();
        saveSubscriptions();

        const maxAgeMs = 30 * 24 * 60 * 60 * 1000;
        const token = signAuthToken({
          role: "user",
          sub: existing.identifier,
          exp: Date.now() + maxAgeMs,
        });
        setAuthCookie(res, req, USER_COOKIE_NAME, token, maxAgeMs);

        return res.json({
          message: "Signed in successfully",
          isNew: false,
          token,
          user: sanitizeSubscriptionRecord(existing),
        });
      }

      // Create new user with hashed password and 0 initial free uses
      const newUser: SubscriptionRecord = {
        id: "sub-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
        name: cleanName,
        identifier: cleanIdentifier,
        authType: "phone",
        password: hashPassword(cleanPassword),
        status: "free",
        freeUsesCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      subscriptions.unshift(newUser);
      saveSubscriptions();

      const maxAgeMs = 30 * 24 * 60 * 60 * 1000;
      const token = signAuthToken({
        role: "user",
        sub: newUser.identifier,
        exp: Date.now() + maxAgeMs,
      });
      setAuthCookie(res, req, USER_COOKIE_NAME, token, maxAgeMs);

      res.status(201).json({
        message: "Account created successfully",
        isNew: true,
        token,
        user: sanitizeSubscriptionRecord(newUser),
      });
    } catch (err: any) {
      console.error("Error in /api/subscriptions/auth:", err);
      res.status(500).json({ error: "Authentication failed. Please try again." });
    }
  });

  // 3. User Submits Subscription Request (Payment details)
  app.post("/api/subscriptions/request", authLimiter, (req, res) => {
    try {
      const cleanIdentifier = sanitizeText(req.body?.identifier, 160);
      const cleanTrxId = sanitizeText(req.body?.trxId, 80);
      const cleanName = sanitizeText(req.body?.name, 80);
      const cleanNotes = sanitizeText(req.body?.notes, 400);
      const { plan, paymentMethod } = req.body;

      if (!cleanIdentifier || !cleanTrxId) {
        return res.status(400).json({ error: "Identifier (phone/email) and Transaction ID are required." });
      }

      let user = subscriptions.find(
        s => s.identifier.toLowerCase().trim() === cleanIdentifier.toLowerCase()
      );

      if (user && !hasValidUserOrAdminAccess(req, user)) {
        return res.status(401).json({ error: "Please sign in to submit payment verification for this account." });
      }

      const planType = plan === "annual" ? "annual" : "monthly";
      const amount = planType === "annual" ? 2499 : 499;
      const planName = planType === "annual" ? "Annual Full Suite Pro" : "Monthly Unlimited Pro";
      const safeMethod = paymentMethod === "jazzcash" || paymentMethod === "bank" ? paymentMethod : "easypaisa";

      if (!user) {
        // Create user if not already signed up
        user = {
          id: "sub-" + Date.now(),
          name: cleanName || (cleanIdentifier.includes("@") ? cleanIdentifier.split("@")[0] : "EV User"),
          identifier: cleanIdentifier,
          authType: cleanIdentifier.includes("@") ? "email" : "phone",
          status: "pending",
          plan: planType,
          planName,
          amount,
          paymentMethod: safeMethod,
          trxId: cleanTrxId,
          notes: cleanNotes || undefined,
          freeUsesCount: 7,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        subscriptions.unshift(user);
      } else {
        // Update existing user with pending subscription request
        user.name = cleanName || user.name;
        user.status = "pending";
        user.plan = planType;
        user.planName = planName;
        user.amount = amount;
        user.paymentMethod = safeMethod;
        user.trxId = cleanTrxId;
        user.notes = cleanNotes || user.notes;
        user.updatedAt = new Date().toISOString();
      }

      saveSubscriptions();

      const maxAgeMs = 30 * 24 * 60 * 60 * 1000;
      const token = signAuthToken({
        role: "user",
        sub: user.identifier,
        exp: Date.now() + maxAgeMs,
      });
      setAuthCookie(res, req, USER_COOKIE_NAME, token, maxAgeMs);

      res.status(200).json({
        success: true,
        message: "Subscription request submitted successfully! Admin will verify and activate your account.",
        token,
        user: sanitizeSubscriptionRecord(user),
      });
    } catch (err: any) {
      console.error("Error in /api/subscriptions/request:", err);
      res.status(500).json({ error: "Failed to submit subscription request." });
    }
  });

  // 4. Track Calculator Usage
  app.post("/api/subscriptions/usage", (req, res) => {
    try {
      const { identifier, toolName } = req.body;
      const MAX_FREE = paymentConfig.pricing?.maxFreeUses || 7;

      if (!identifier) {
        return res.json({ freeUsesCount: 1, remaining: 6, isLocked: false, status: "free" });
      }

      const cleanId = String(identifier).trim().toLowerCase();
      const user = subscriptions.find(s => s.identifier.toLowerCase().trim() === cleanId);

      if (user) {
        if (!hasValidUserOrAdminAccess(req, user)) {
          return res.status(401).json({ error: "Session verification required." });
        }
        if (!user.usageLogs) {
          user.usageLogs = [];
        }
        if (toolName) {
          user.usageLogs.unshift({
            toolName: sanitizeText(toolName, 100),
            timestamp: new Date().toISOString()
          });
          if (user.usageLogs.length > 50) {
            user.usageLogs = user.usageLogs.slice(0, 50);
          }
        }

        if (user.status === "approved") {
          user.updatedAt = new Date().toISOString();
          saveSubscriptions();
          return res.json({
            status: "approved",
            isLocked: false,
            freeUsesCount: user.freeUsesCount,
            remaining: 9999,
            hasUnlimited: true,
            user: sanitizeSubscriptionRecord(user),
          });
        }

        // Increment free use if under limit
        if (user.freeUsesCount < MAX_FREE) {
          user.freeUsesCount += 1;
          user.updatedAt = new Date().toISOString();
          saveSubscriptions();
        }

        const isLocked = user.freeUsesCount >= MAX_FREE;
        return res.json({
          status: user.status,
          freeUsesCount: user.freeUsesCount,
          remaining: Math.max(0, MAX_FREE - user.freeUsesCount),
          isLocked,
          hasUnlimited: false,
          user: sanitizeSubscriptionRecord(user),
        });
      }

      res.json({ status: "free", freeUsesCount: 1, remaining: 6, isLocked: false });
    } catch (err) {
      res.status(500).json({ error: "Could not track usage" });
    }
  });

  // 5. ADMIN: List all subscriptions & metrics
  app.get("/api/admin/subscriptions", requireAdminAuth, (req, res) => {
    const totalUsers = subscriptions.length;
    const pendingCount = subscriptions.filter(s => s.status === "pending").length;
    const approvedCount = subscriptions.filter(s => s.status === "approved").length;
    const disallowedCount = subscriptions.filter(s => s.status === "disallowed").length;
    const totalRevenuePKR = subscriptions
      .filter(s => s.status === "approved")
      .reduce((sum, s) => sum + (s.amount || 0), 0);

    res.json({
      stats: {
        totalUsers,
        totalRequests: subscriptions.filter(s => s.trxId).length,
        pendingCount,
        approvedCount,
        disallowedCount,
        totalRevenuePKR
      },
      subscriptions: subscriptions.map(sanitizeSubscriptionRecord)
    });
  });

  // 6. ADMIN: Allow (Approve) or Disallow (Reject) User
  app.post("/api/admin/subscriptions/:id/status", requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!["approved", "disallowed", "pending", "free"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const index = subscriptions.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Subscription record not found" });
    }

    const item = subscriptions[index];
    item.status = status;
    item.updatedAt = new Date().toISOString();

    if (status === "approved") {
      item.approvedAt = new Date().toISOString();
      item.disallowedReason = undefined;
    } else if (status === "disallowed") {
      item.disallowedAt = new Date().toISOString();
      item.disallowedReason = sanitizeText(reason, 250) || "Subscription disallowed by Admin";
    }

    saveSubscriptions();
    res.json({ success: true, message: `User status changed to ${status}`, user: sanitizeSubscriptionRecord(item) });
  });

  // 7. ADMIN: Reset Free Uses (Give 7 more free uses)
  app.post("/api/admin/subscriptions/:id/reset-free", requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const user = subscriptions.find(s => s.id === id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.freeUsesCount = 0;
    user.updatedAt = new Date().toISOString();
    saveSubscriptions();
    res.json({ success: true, message: "Free calculator uses reset to 7", user: sanitizeSubscriptionRecord(user) });
  });

  // 8. ADMIN: Delete record
  app.delete("/api/admin/subscriptions/:id", requireAdminAuth, (req, res) => {
    const { id } = req.params;
    subscriptions = subscriptions.filter(s => s.id !== id);
    saveSubscriptions();
    res.json({ success: true, message: "Subscription deleted successfully" });
  });

  // 9. ADMIN: Manually add new subscriber / user
  app.post("/api/admin/subscriptions/manual", requireAdminAuth, (req, res) => {
    const cleanId = sanitizeText(req.body?.identifier, 160);
    if (!cleanId) {
      return res.status(400).json({ error: "Phone number or email is required." });
    }

    const { name, plan, status, paymentMethod, trxId, notes } = req.body;
    const planType = plan === "annual" ? "annual" : "monthly";
    const amount = planType === "annual" ? 2499 : 499;

    const newSub: SubscriptionRecord = {
      id: "sub-" + Date.now(),
      name: sanitizeText(name, 80) || "Direct Subscriber",
      identifier: cleanId,
      authType: cleanId.includes("@") ? "email" : "phone",
      status: status || "approved",
      plan: planType,
      planName: planType === "annual" ? "Annual Full Suite Pro" : "Monthly Unlimited Pro",
      amount,
      paymentMethod: paymentMethod || "bank",
      trxId: sanitizeText(trxId, 80) || `ADMIN-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: sanitizeText(notes, 300) || "Added directly via Admin Dashboard",
      freeUsesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      approvedAt: status === "approved" ? new Date().toISOString() : undefined
    };

    subscriptions.unshift(newSub);
    saveSubscriptions();

    res.status(201).json({ success: true, user: sanitizeSubscriptionRecord(newSub) });
  });

  // ==========================================
  // DYNAMIC EV CATALOG & FLEET APIS
  // ==========================================
  const catalogFile = path.join(process.cwd(), "custom_catalog.json");
  let liveCatalog: EVModel[] = [...EV_MODELS];

  try {
    if (fs.existsSync(catalogFile)) {
      const data = fs.readFileSync(catalogFile, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        liveCatalog = parsed;
        console.log(`[Catalog] Loaded ${liveCatalog.length} models from custom_catalog.json`);
      }
    }
  } catch (err) {
    console.warn("[Catalog] Could not load custom_catalog.json, using default EV_MODELS:", err);
  }

  // 1. Get all current catalog models
  app.get("/api/catalog/models", (req, res) => {
    res.json({ success: true, count: liveCatalog.length, models: liveCatalog });
  });

  // 1b. Update individual catalog model (Admin only)
  app.put("/api/catalog/models/:id", requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;
    if (!updatedData || typeof updatedData !== "object") {
      return res.status(400).json({ error: "Invalid model payload" });
    }

    const index = liveCatalog.findIndex(m => m.id === id);
    if (index === -1) {
      return res.status(404).json({ error: `Model with id '${id}' not found` });
    }

    // Merge changes
    liveCatalog[index] = {
      ...liveCatalog[index],
      ...updatedData,
      id // preserve original id identifier
    };

    try {
      fs.writeFileSync(catalogFile, JSON.stringify(liveCatalog, null, 2), "utf-8");
      console.log(`[Catalog] Updated product '${id}' (${liveCatalog[index].brand} ${liveCatalog[index].model}) in custom_catalog.json`);
    } catch (e) {
      console.error("[Catalog] Failed to write custom_catalog.json:", e);
    }

    res.json({ success: true, model: liveCatalog[index] });
  });

  // 1c. Delete individual catalog model (Admin only)
  app.delete("/api/catalog/models/:id", requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const targetId = String(id).trim();
    const prevCount = liveCatalog.length;
    liveCatalog = liveCatalog.filter(m => String(m?.id || '').trim() !== targetId);
    
    try {
      fs.writeFileSync(catalogFile, JSON.stringify(liveCatalog, null, 2), "utf-8");
      console.log(`[Catalog] Deleted product '${targetId}'. Count: ${prevCount} -> ${liveCatalog.length}`);
    } catch (e) {
      console.error("[Catalog] Failed to write custom_catalog.json:", e);
    }

    res.json({ success: true, count: liveCatalog.length, models: liveCatalog });
  });

  // 1d. Delete entire brand fleet (Admin only)
  app.delete("/api/catalog/brands/:brand", requireAdminAuth, (req, res) => {
    const { brand } = req.params;
    const targetBrand = decodeURIComponent(String(brand)).toLowerCase().trim();
    const prevCount = liveCatalog.length;
    liveCatalog = liveCatalog.filter(m => (m?.brand || '').toLowerCase().trim() !== targetBrand);
    const removedCount = prevCount - liveCatalog.length;

    try {
      fs.writeFileSync(catalogFile, JSON.stringify(liveCatalog, null, 2), "utf-8");
      console.log(`[Catalog] Deleted brand fleet '${brand}' (${removedCount} models removed). Count: ${liveCatalog.length}`);
    } catch (e) {
      console.error("[Catalog] Failed to write custom_catalog.json:", e);
    }

    res.json({ success: true, removedCount, count: liveCatalog.length, models: liveCatalog });
  });

  // 1c. Direct Image File Upload API (Admin only, raster formats & magic-byte verified)
  app.post("/api/catalog/upload-image", requireAdminAuth, (req, res) => {
    try {
      const { dataUrl, filename } = req.body;
      if (!dataUrl || typeof dataUrl !== "string") {
        return res.status(400).json({ error: "dataUrl is required (base64 string)" });
      }

      const validation = validateSafeImageUpload(dataUrl);
      if (!validation.valid || !validation.buffer || !validation.ext) {
        return res.status(400).json({ error: validation.error || "Invalid image file." });
      }

      const basePrefix = filename
        ? path.basename(String(filename)).replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase().slice(0, 30) || "ev-model"
        : "ev-model";
      const uniqueFilename = `${basePrefix}-${Date.now()}.${validation.ext}`;
      const destPath = path.join(publicUploadsDir, uniqueFilename);

      fs.writeFileSync(destPath, validation.buffer);
      console.log(`[Catalog] Uploaded and saved image to ${destPath}`);

      const publicUrl = `/uploads/${uniqueFilename}`;
      res.json({ success: true, url: publicUrl, filename: uniqueFilename });
    } catch (err: any) {
      console.error("[Catalog] Image upload error:", err);
      res.status(500).json({ error: `Failed to upload image: ${err?.message || 'Server error'}` });
    }
  });

  // 2. Admin save full catalog models list
  app.post("/api/admin/catalog/save", requireAdminAuth, (req, res) => {
    const { models } = req.body;
    if (!Array.isArray(models)) {
      return res.status(400).json({ error: "models must be an array" });
    }
    liveCatalog = models;
    try {
      fs.writeFileSync(catalogFile, JSON.stringify(liveCatalog, null, 2), "utf-8");
      console.log(`[Catalog] Saved ${liveCatalog.length} models to custom_catalog.json`);
    } catch (e) {
      console.error("[Catalog] Failed to write custom_catalog.json:", e);
    }
    res.json({ success: true, count: liveCatalog.length, models: liveCatalog });
  });

  // 3. Admin reset catalog to baseline
  app.post("/api/admin/catalog/reset", requireAdminAuth, (req, res) => {
    liveCatalog = [...EV_MODELS];
    try {
      if (fs.existsSync(catalogFile)) {
        fs.unlinkSync(catalogFile);
      }
      console.log(`[Catalog] Reset to factory baseline (${liveCatalog.length} models)`);
    } catch (e) {
      console.error("[Catalog] Failed to unlink custom_catalog.json:", e);
    }
    res.json({ success: true, count: liveCatalog.length, models: liveCatalog });
  });

  // Serve static data.json if requested specifically
  app.get("/data.json", (req, res) => {
    const dataPath = path.join(process.cwd(), "public", "data.json");
    if (fs.existsSync(dataPath)) {
      res.sendFile(dataPath);
    } else {
      res.status(404).json({ error: "data.json not found" });
    }
  });

  // SEO: Dynamic robots.txt
  app.get("/robots.txt", (req, res) => {
    const origin = getRequestOrigin(req);
    const robotsTxt = [
      "User-agent: *",
      "Allow: /",
      "Disallow: /admin",
      "Disallow: /user-dashboard",
      "Disallow: /api/",
      "",
      `Sitemap: ${origin}/sitemap.xml`,
    ].join("\n");
    res.type("text/plain").send(robotsTxt);
  });

  // SEO: Dynamic sitemap.xml covering tools, guides, 40+ blogs & 150+ EV models
  app.get("/sitemap.xml", (req, res) => {
    const origin = getRequestOrigin(req);
    const today = new Date().toISOString().split("T")[0];

    const publicTabKeys: SeoTabKey[] = [
      "home",
      "products",
      "comparison",
      "savings",
      "range",
      "charging",
      "solar",
      "battery",
      "rider",
      "charging-stations",
      "blogs",
      "content",
      "about",
      "contact",
    ];

    const urlEntries: { loc: string; changefreq: string; priority: string }[] = [];

    for (const key of publicTabKeys) {
      const cfg = STATIC_ROUTE_SEO[key];
      const priority =
        key === "home"
          ? "1.0"
          : ["products", "savings", "range", "charging", "solar", "blogs"].includes(key)
          ? "0.9"
          : "0.8";
      urlEntries.push({
        loc: `${origin}${cfg.canonicalPath}`,
        changefreq: key === "home" || key === "products" || key === "blogs" ? "weekly" : "monthly",
        priority,
      });
    }

    for (const model of liveCatalog) {
      urlEntries.push({
        loc: `${origin}/ev/${encodeURIComponent(model.id)}`,
        changefreq: "monthly",
        priority: "0.75",
      });
    }

    for (const post of ALL_BLOG_POSTS) {
      urlEntries.push({
        loc: `${origin}/blogs/${encodeURIComponent(post.id)}`,
        changefreq: "monthly",
        priority: "0.75",
      });
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    res.type("application/xml").send(xml);
  });

  // Never let unmatched /api/* routes fall through to SPA HTML
  app.all("/api/*", (_req, res) => {
    res.status(404).json({ error: "API endpoint not found." });
  });

  // Vite development middleware or production static handling
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    // Inject dynamic route-level SEO tags for HTML navigation requests in dev
    app.use(async (req, res, next) => {
      const isHtmlNav =
        req.method === "GET" &&
        !req.path.includes(".") &&
        !req.path.startsWith("/api") &&
        !req.path.startsWith("/@") &&
        !req.path.startsWith("/src") &&
        !req.path.startsWith("/node_modules") &&
        (req.headers.accept || "").includes("text/html");

      if (!isHtmlNav) {
        return next();
      }

      try {
        const indexPath = path.resolve(process.cwd(), "index.html");
        const rawHtml = fs.readFileSync(indexPath, "utf-8");
        const transformed = await vite.transformIndexHtml(req.originalUrl, rawHtml);
        const origin = getRequestOrigin(req);
        const resolvedSeo = resolveSeoForPath(req.path, req.url.split("?")[1] || "", origin, liveCatalog, ALL_BLOG_POSTS);
        const htmlWithSeo = injectSeoIntoHtml(transformed, resolvedSeo);
        return res.status(200).set({ "Content-Type": "text/html" }).end(htmlWithSeo);
      } catch (err) {
        return next(err);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, { index: false }));
    app.get("*", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      try {
        const rawHtml = fs.readFileSync(indexPath, "utf-8");
        const origin = getRequestOrigin(req);
        const resolvedSeo = resolveSeoForPath(req.path, req.url.split("?")[1] || "", origin, liveCatalog, ALL_BLOG_POSTS);
        const htmlWithSeo = injectSeoIntoHtml(rawHtml, resolvedSeo);
        res.status(200).set({ "Content-Type": "text/html" }).send(htmlWithSeo);
      } catch {
        res.sendFile(indexPath);
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
