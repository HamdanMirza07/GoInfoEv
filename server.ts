import express from "express";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { EV_MODELS, EVModel } from "./src/data/evModels";

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

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Ensure public uploads directory exists
  const publicUploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(publicUploadsDir)) {
    fs.mkdirSync(publicUploadsDir, { recursive: true });
  }
  app.use("/uploads", express.static(publicUploadsDir));
  app.use("/assets", express.static(path.join(process.cwd(), "public", "assets")));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Pakistani EV AI Assistant Chatbot API (Powered by Gemini with smart local knowledge fallback)
  app.post("/api/bot/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message || typeof message !== "string" || message.trim() === "") {
        return res.status(400).json({ error: "Message is required" });
      }

      const userText = message.trim();
      const client = getGeminiClient();

      // System instructions providing rich Pakistani EV ecosystem grounding
      const systemInstruction = `You are "PakEV Assistant", the official smart AI consultant on goinfoEV - Pakistan's premier Electric Vehicle analytics & advisory platform.
You assist Pakistani consumers, daily commuters, and delivery riders (Foodpanda, Bykea, Yango, Indrive) with expert advice.

KEY ECOSYSTEM FACTS & PRICING IN PAKISTAN:
1. TOP EV BIKE BRANDS & MODELS:
   - Crown Electric (Official Scraped Fleet): Rizz (600-800W, 51.2V 20Ah LFP, 50-70 km, PKR 145,000), Spark Lithium (800-1200W, 64V 30Ah LFP, 50-70 km, PKR 195,000), Fairy Lithium (1000-1500W, 73.6V 30Ah LFP, 60-70 km, PKR 220,000), Firefly Tough Guard (1200-1800W, 73.6V 30Ah LFP, 70-90 km, 3-4h charge, PKR 235,000), Flash (1500-2200W, 73.6V 40Ah 3kW LFP, 100-120 km, PKR 285,000), Champion Standard (1500-2200W, 73.6V 40Ah LFP, 100-120 km, PKR 285,000) & Champion Pro (73.6V 60Ah 4.4kW LFP, 160-180 km, PKR 335,000), Knight Rider (Sports style, 1500-2200W, 73.6V 40Ah, 100-120 km, PKR 295,000), X200 Lithium Pro (2000-3000W, 76.8V 40Ah LFP, 100-120 km, PKR 315,000), Raftaar Standard (3000-4000W, 73.6V 40Ah 3kW LFP, 100-110 km, 85-90 km/h, Metal Safety Frame, Square LED, CBS, PKR 309,900), Raftaar Pro (3000-4000W, 73.6V 60Ah 4.4kW LFP, 140-160 km, 85-90 km/h, Metal Safety Frame, Square LED, CBS, PKR 345,000), Ezee 3-Wheeler Trike (800-1200W, 73.6V 30Ah LFP, NFC, reverse mode, PKR 269,000), Ezee XL Utility 3-Wheeler (800-1000W, 73.6V 40Ah LFP, front/rear cargo baskets, PKR 385,000), Rick E Mini Electric Rickshaw (800-1000W, 73.6V 40Ah LFP, wiper windscreen, 200kg load, PKR 489,900).
   - Jinpeng (Official Lithium Fleet): Thrill (2000W, 72V 52Ah Lithium, 75 km/h, 140-160 km range, Dual Disk, PKR 549,000), Cruise (1500W, 72V 42Ah Lithium, 65 km/h, 120-130 km range, Dual Disk, PKR 279,900), Rush (1200W, 72V 42Ah Lithium, 55 km/h, 130-140 km range, Dual Disk, PKR 259,900), Swift (1200W, 72V 42Ah Lithium, 55 km/h, 130-140 km range, Dual Disk, PKR 249,900), Reliance (800W, 72V 26Ah Lithium, 45 km/h, 80-90 km range, PKR 239,900), Sprint (1000W, 72V 30Ah Lithium, 55 km/h, 100-110 km range, PKR 229,900), Ride (1000W, 72V 30Ah Lithium, 50 km/h, 110-120 km range, Dual Disk, PKR 219,900), Eco (800W, 72V 26Ah Lithium, 45 km/h, 80-90 km range, PKR 189,900), Thunder (1800W, 65 km/h, 60-65 km, PKR 389,900), Thunder 2.0 Pro (1800W, 72V 42Ah Lithium, 65 km/h, 100-110 km, PKR 419,900). All with 30-month official battery warranty.
   - Yadea (Official yadea.com.pk Fleet): M3 (1200W, 60V 23Ah Graphene, PKR 174,000), Ruibin S (2000W peak, 72V 25Ah Graphene, PKR 193,000), GT30 (1000W, 60V 23Ah Graphene, PKR 194,000), Ruibin (GTR 5.0, 72V 26Ah Graphene, 90-100 km, PKR 209,000), T5 (2100W peak, 57 km/h, PKR 253,500), M3H LFP (2200W, 60V 30Ah LFP, 110 km eco, PKR 255,000), Ruibin L LFP (2000W, 72V 30Ah LFP, PKR 270,000), G5 (2400W peak, 72V 26Ah Graphene, PKR 280,000), T5L LFP (2700W peak, 72V 30Ah LFP, 4-yr warranty, PKR 305,000), Epoc-H (3200W, 72V 38Ah Graphene, 70 km/h, PKR 355,000), Velax LFP (3200W, 72V 30Ah LFP, 14" wheels, PKR 444,000), GT70 Flagship LFP (2000W, 72V 50Ah LFP, 110-170 km, PKR 479,000), Keeness Superbike (11kW mid-motor, 72V 64Ah Ternary Lithium, 100 km/h, PKR 1,400,000).
   - Evee: C1 Air (100-110 km, 72V 30Ah Lithium, PKR ~300,000), Nisa (step-through for women/students, PKR ~175,000), Gen-Z (PKR ~195,000).
   - MS Jaguar (Official 2026 Lineup): Miso (800-1000W, 60V 28Ah Graphene, 70 km, PKR 158,000), Bolt (1000-1200W, 80-100 km, NFC, PKR 174,000), M1 (1200-1500W, 90-100 km, Cruise Control, PKR 204,000), Miso 3-W Trike (800-1000W, 72V 32Ah, 80 km, PKR 228,000), Legacy (3200-3800W, 72V 42Ah Graphene, 115 km, RGB lights, PKR 245,000), E-70 (1500W, 72V 30Ah LFP, 90-100 km, 5-yr warranty, 3500 cycles, 2.5h fast charge, PKR 265,000), E-70 Supreme (1500W, tablet meter, open-spring suspension, PKR 275,000), E-125 Flagship (2000W, 72V 50Ah LFP, 150-170 km, 5-yr warranty, PKR 370,000). All maintenance-free locally engineered EVs.
   - Metro (Official metroev.pk Fleet): X8 Foldable Scooter (36V 10.4Ah Detachable Lithium, 35-45 km, PKR 85,000), Step-Thru (48V 20Ah, PKR 129,000 - 169,000), Wonder Bike (48V 20Ah Nano Carbon, 50-65 km, PKR 95,000), Super Bike (60V 20Ah Nano Carbon, 65-80 km, PKR 110,000 - 144,000), Dabang (NCF 72V 24Ah PKR 190,000 / LFP 76.8V 30Ah PKR 265,000, NFC & Cruise Control), T9 Sport (NCF 72V 27Ah PKR 184,000 / LFP 76.8V 30Ah PKR 265,000), Thrill Pro (72V 24Ah NCF, PKR 189,000), T9 Pro (72V 32Ah Graphene, PKR 245,000 - 265,000), Metrix (NCF 72V 38Ah PKR 229,000 / LFP 76.8V 45Ah PKR 335,000), E8S Mountain Climber (72V 38Ah NCF High-Torque, PKR 265,000 - 284,000), M6 Empower (NCF 72V 38Ah PKR 250,000 / Portable LFP 73.6V 30Ah PKR 274,000), Premium (73.6V 30Ah LFP, PKR 295,000), Premium Plus (76.8V 40Ah LFP, PKR 335,000), Miku Super Sports Naked (3000W mid-motor, 72V 40Ah Double Lithium NCM, 80 km/h, App + Fingerprint, PKR 550,000).
   - United Auto Industries: Electric Bullet (2000W Motor Power, Lithium 72V 30Ah, 90-95 km/h, 80-90 km range, 4-5h charge, PKR 285,000), Electric Smart, Revolt, Electric Sharp.
   - Vlektra (Official vlektra.com Fleet): Retro (1500W hub, 100 Nm, 72V 24Ah LFP 10-yr life, 70 km/h, 80-100 km, 2.5h fast charge, PKR 279,000), Velocity 180 (Pakistan's longest range commuter, 1500W, 72V 36Ah LFP 3000 cycles, 70 km/h, 180 km certified range, 3h fast charge, PKR 339,000), Velocity 180 SE (2000W BLDC, 120 Nm, 85 km/h, 72V 36Ah LFP, 180 km range, Dual Discs, PKR 399,000), Bolt (Pakistan's fastest electric streetfighter, 3000W BLDC, 120 Nm, 105 km/h, 72V 38Ah LFP, 150 km, USD inverted forks, sound module, Dual Discs, PKR 549,000), Bolt Dark (Stealth Dark edition with integrated tank storage, 3000W, 105 km/h, 150 km range, PKR 599,000), 1969 Retro (Handcrafted bespoke café racer, 3000W, 120 Nm, 0-60 km/h in 4.0s, 105 km/h, 72V 36Ah LFP, 150 km range, PKR 619,000). All models feature 3-year replacement battery warranty and 2-year motor warranty.
   - OKLA (Official okla.com.pk Fleet): ORA (600W hub, 48V 30Ah LFP, 40 km/h, 70-88 km, PKR 199,000), ORBIT (1000W hub, 72V 20Ah, 45 km/h, 80-110 km, PKR 225,000), ONYX (1200W hub, 72V 32Ah Graphene, 45 km/h, 90-100 km, 4-5h charge, PKR 189,000), OKT Lithium Pro (1000W hub, 72V 30Ah LFP, 50 km/h, 80-110 km, 3-yr battery warranty, PKR 298,000), OKT Econo (1200W hub, 70V 32Ah Graphene, 45 km/h, 75-85 km, PKR 202,000), OMO (2000W high-torque hub, 72V 30Ah Lithium, 60 km/h, 90-100 km, Dual Disc, PKR 299,000), OMIGO (1500W, 74V 28Ah Lithium, 80 km/h, 100-120 km, 3h fast charge, step-through, PKR 299,000), OKG (4000W naked streetfighter, 74V 28Ah Lithium, 80 km/h, 60-80 km, Dual Disc, PKR 449,000), OMAX (3000W maxi-scooter, 72V 40Ah Lithium, 85 km/h, 80-100 km, touring shield, PKR 599,000), OVA (3000W touring, 72V 40Ah Lithium, 80 km/h, 85-100 km, PKR 489,000), OVEGA (7000W mid-drive superbike, 72V 80Ah ultra-capacity lithium 5.76kWh, 120 km/h, 200-215 km range, PKR 799,000).
   - REVOO (Official revoo-ev.com.pk Fleet): A04 (350W, 48V 12Ah Graphene, 35-40 km, PKR 100,000), A09 (500-1000W, 48V 26Ah Graphene, 65-80 km, PKR 145,000), A11 (1000-1500W, 60V 26Ah Graphene PKR 167,000 / 60.8V 30Ah LFP 3-yr warranty PKR 205,000, 75-90 km), A12 (1000-1800W, front disc, 72V 26Ah Graphene PKR 180,000 / 73.6V 30Ah LFP PKR 239,000, 80-100 km), Y04 Portable Lithium (350-700W, 48V 12Ah removable lithium, 40-45 km, 40kg weight, indoor charging, PKR 119,000), Y06 City (350-700W, 48V 20Ah, 50-60 km, PKR 151,000), C35 Young (1200-2400W, 72V 35Ah Graphene PKR 235,000 / 73.6V 30Ah LFP PKR 269,000, 80-115 km), C35 Comfort (1800-2400W, 72V 35Ah Graphene, dual disc, 80-110 km, PKR 279,000), C35 GT Flagship (3000-4500W, 73.6V 50Ah 3.68kWh LFP, 75 km/h, 100-135 km, dual disc, PKR 399,000), B12 Delivery (1800-3600W, 73.6V 50Ah LFP, 1.5h super-fast charging, 90-120 km, PKR 350,000 - 395,000), E52 Heavy Cruiser (3000-4800W, 96V 35Ah high-voltage graphene, 75 km/h, 70-110 km, CBS disc brakes, PKR 405,000).
   - Jolta Electric (Official 15-Model Fleet): JE-125L Flagship (2000W, 60V 50Ah LFP, 80 km/h, 100-120 km, Dual Disc, PKR 329,900), JE-100L SE Apex (1500W, 60V 50Ah LFP, 110-120 km, PKR 274,900), JE-70L SE Bolt (1500W, 60V 50Ah LFP, 110-120 km, PKR 264,900), JE-100L Thunder (1500W, 60V 30Ah LFP, 70-90 km, PKR 249,900), JE-70L Fury (1500W, 60V 30Ah LFP, 70-80 km, PKR 239,900), JE-100G Fox (1500W, 60V 26Ah Graphene, PKR 185,900), JE-70G Wolf (1500W, 60V 26Ah Graphene, PKR 170,900), Mecha Scooty (2000W, 72V 36Ah Graphene, 70 km/h, PKR 271,900), Zeno Pro (1200W, 72V 36Ah, PKR 221,900), Zeno (PKR 205,900), Neo Pro (PKR 189,900), Neo (PKR 179,900), Storm Pro (PKR 182,900), Storm (PKR 169,900), Sparrow (500W, 48V 26Ah Graphene, 25-35 km, PKR 120,900).
   - YJ Future (Official yjfuture.pk Fleet): Azadi C1 (1000-1200W, 76.8V 30Ah LFP/Graphene, 70-90 km, multi-mode meter, PKR 189,000 / 219,000), Indus Cargo Loader (600-800W, 48V 20Ah, 50kg rack, 0.5 unit/charge, PKR 95,000), Zippy E1 (600W, 48V 20Ah, 35-40 km/h, 40-50 km, PKR 130,000), S7 (1000-1200W, 60V 32Ah, 45-50 km/h, 70-90 km, 18-mo warranty, PKR 159,000), Twister (1000W, 60V 32Ah Chilwee Graphene PKR 167,000 / 73.6V 30Ah LFP PKR 205,000, front disc, 70-90 km), Azadi Pro (1000W, 60V 32Ah Graphene PKR 184,000 / LFP PKR 219,000, 70-90 km), Cruise Z1 Maxi Scooty (1200-1500W, 72V 32Ah Chilwee Graphene, 55-60 km/h, 70-100 km, Dual Discs, PKR 199,000), ECO Urban (650W, 60V 23Ah Graphene, CAE steel frame, PKR 230,000), Cruise Z9 Flagship Maxi (1500W, 72V 36Ah Graphene PKR 229,000 / LFP PKR 269,000, Dual Discs, 90-110 km), Cruise X7 (1500W, 76.8V 30Ah LiFePO4, 60 km/h, 70-90 km, Dual Discs, PKR 249,000), Azadi Standard (1000W, 60V 26Ah Graphene, 70-80 km, PKR 165,000), Mini EV 3-Wheeler Cabin (1000W, 60V 32Ah Graphene, 50-60 km, PKR 385,000), Mini EV Pro 4-Door (1000W, 72V 32Ah Graphene, Solar roof charging, PKR 485,000).

2. BATTERY COMPARISONS FOR PAKISTAN CLIMATE:
   - LFP (Lithium Iron Phosphate): 3000-4000 cycles (7-10 years). Safest in 45°C+ Pakistan summer, zero thermal runaway risk. Best investment.
   - Graphene (TTFAR): 800-1200 cycles (2.5-4 years). Affordable replacement (PKR 65k-95k) vs LFP (PKR 180k-290k).
   - NMC Lithium: 1500-2000 cycles, lightweight, high performance.
   - Lead-Acid: 300-500 cycles (1-1.5 years). Heavy, outdated, avoid if budget permits.

3. CHARGING COSTS & CALCULATIONS (K-Electric, LESCO, IESCO, FESCO):
   - Battery size: Typically 1.8 to 2.9 kWh.
   - Tariff: Average PKR 45 to 65 per unit.
   - Units per full charge: 2.0 to 3.5 units.
   - Cost per full charge: PKR 90 to 180 (for 80-110 km!).
   - Cost per km: PKR 1.1 to 1.6 / km.
   - Petrol comparison: Petrol 70cc @ PKR 280/L (40 km/L) costs PKR 7.00 / km.
   - Monthly commuter saving (1,500 km): PKR 8,000 - 10,000+.
   - Delivery rider saving (3,000 km): PKR 18,000 - 25,000+ per month!

4. DEALERSHIPS & LOCATIONS:
   - Karachi: Akbar Road (Saddar hub), Clifton, DHA, Rashid Minhas Rd.
   - Lahore: McLeod Road (major 2-wheeler hub), Gulberg, DHA Phase 5.
   - Islamabad / Rawalpindi: Murree Road, Blue Area.
   - Also present in Faisalabad, Multan, Gujranwala, Sialkot, Peshawar.

5. COMMUNICATION STYLE:
   - Reply in clear, professional English.
   - Keep answers clear, friendly, encouraging, and informative with bullet points and numbers.
   - When relevant to the user's question, mention one of our built-in interactive tools using one of these exact action tokens on a new line:
     [ACTION:range] (to check real-world km range)
     [ACTION:charging] (to calculate exact electricity units & K-Electric/LESCO bill)
     [ACTION:savings] (to compare petrol vs EV monthly savings)
     [ACTION:dealerships] (to find verified showroom locations & maps in Karachi, Lahore, etc.)
     [ACTION:battery] (to check battery health & LFP vs Graphene lifespan)
     [ACTION:solar] (to calculate solar charging setup)
     [ACTION:rider] (for Bykea/Foodpanda delivery rider profit calculator)
     [ACTION:products] (to view full model catalog and prices)
     [ACTION:comparison] (to compare 2-3 bikes side by side)
     [ACTION:contact] (to send direct inquiry to Hamdan & team)
   - Do not hallucinate fake phone numbers. Direct user inquiries to goinfoEV contact portal or Hamdan7394@gmail.com / info@orinexai.com.`;

      let botReply = "";

      if (client) {
        try {
          // Format conversation history for Gemini
          const contents: any[] = [];
          if (Array.isArray(history)) {
            history.slice(-8).forEach((h: any) => {
              if (h.role && h.content) {
                contents.push({
                  role: h.role === "user" ? "user" : "model",
                  parts: [{ text: String(h.content) }],
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
              temperature: 0.7,
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

  // Local knowledge helper for fallback
  function generateLocalPakEVResponse(query: string): string {
    const q = query.toLowerCase();

    if (q.includes("range") || q.includes("kitne km") || q.includes("kitni chal") || q.includes("km chalegi") || q.includes("masafat")) {
      return `⚡ **Pakistan EV Bike Range Overview:**\n\n- **Crown Raftaar / Falcon:** 100 - 110 km per single charge (73.6V 40Ah LFP).\n- **Yadea T9 / E8S Pro:** 95 - 115 km (72V 26Ah-38Ah Graphene TTFAR).\n- **Evee C1 Air:** 100 - 110 km (72V 30Ah Lithium).\n- **MS Jaguar E-70 / E-125:** 80 - 110 km.\n- **OKLA ORA / OKT:** 75 - 110 km.\n\n💡 *Tip:* Real-world range depends on rider weight, speed mode, and tyre pressure.\n\n[ACTION:range]\n[ACTION:products]`;
    }

    if (q.includes("cost") || q.includes("unit") || q.includes("charging") || q.includes("bill") || q.includes("k-electric") || q.includes("lesco") || q.includes("kharcha")) {
      return `💰 **Charging Cost & Electricity Calculation in Pakistan:**\n\n1. **Units per Full Charge:** Typically **2.2 to 3.2 units (kWh)** for a full 0 to 100% recharge.\n2. **Current Electricity Tariff:** Rs. 45 - 65 per unit (K-Electric / LESCO / IESCO).\n3. **Total Cost per Charge:** Just **Rs. 100 to Rs. 180**!\n4. **Cost Per Kilometer:** ~**Rs. 1.20 to Rs. 1.50 per km** (compared to Petrol 70cc which costs ~Rs. 7.00/km @ Rs. 280/L).\n\n[ACTION:charging]\n[ACTION:savings]`;
    }

    if (q.includes("bachat") || q.includes("saving") || q.includes("petrol") || q.includes("comparison") || q.includes("muqabla")) {
      return `📊 **Petrol vs EV Savings Breakdown:**\n\n- **Petrol 70cc (1500 km/month):** ~Rs. 10,500 Petrol + Rs. 1,500 Engine Oil = **Rs. 12,000/month**.\n- **EV Bike (1500 km/month):** Only ~Rs. 1,800 to Rs. 2,200 Electricity + Rs. 0 Oil = **Rs. 2,200/month**.\n- **Monthly Net Saving:** ~**Rs. 9,800 to Rs. 10,000+**!\n- **Annual Saving:** Over **Rs. 120,000/- every year**!\n\n[ACTION:savings]\n[ACTION:comparison]`;
    }

    if (q.includes("battery") || q.includes("lfp") || q.includes("graphene") || q.includes("life") || q.includes("lithium")) {
      return `🔋 **Battery Comparison (LFP vs Graphene vs Lead Acid):**\n\n1. **Lithium LFP (Crown Raftaar, Surge):**\n   - **Lifespan:** 3,000+ cycles (7 to 10 years).\n   - **Heat Safety:** Safest chemistry for Pakistan's 45°C+ summer.\n\n2. **TTFAR Graphene (Yadea T9, E8S Pro):**\n   - **Lifespan:** 800 - 1,200 cycles (2.5 to 4 years).\n   - **Cost:** Affordable replacement compared to LFP.\n\n3. **Lead-Acid (Old technology):**\n   - **Lifespan:** 300 - 500 cycles (1 to 1.5 years).\n   - Not recommended for long-term daily commuters.\n\n[ACTION:battery]`;
    }

    if (q.includes("rider") || q.includes("foodpanda") || q.includes("bykea") || q.includes("yango") || q.includes("indrive") || q.includes("delivery")) {
      return `🛵 **Special Advice for Delivery Riders (Bykea / Foodpanda / Yango):**\n\n- Daily running: 80 - 120 km.\n- Daily Petrol expense on CD70: ~Rs. 700 - 900.\n- Daily EV charging expense: ~Rs. 110 - 150.\n- **Daily Savings:** ~Rs. 600 - 750.\n- **Monthly Profit Increase:** **Rs. 18,000 to Rs. 23,000+** extra in your pocket!\n\n⭐ *Recommended bikes for riders:* Crown Raftaar (40Ah LFP) or Yadea T9 Graphene.\n\n[ACTION:rider]\n[ACTION:range]`;
    }

    if (q.includes("karachi") || q.includes("lahore") || q.includes("islamabad") || q.includes("dealership") || q.includes("showroom") || q.includes("kahan") || q.includes("address") || q.includes("shop")) {
      return `📍 **EV Showrooms & Dealerships in Pakistan:**\n\n- **Karachi:** Akbar Road (Saddar EV Hub), Clifton, DHA Phase 6, Main Rashid Minhas Road.\n- **Lahore:** McLeod Road 2-Wheeler Market, Main Boulevard Gulberg, DHA Phase 5.\n- **Islamabad / Rawalpindi:** Murree Road & Blue Area.\n- **Faisalabad & Multan:** Jhang Road, Katchery Road.\n\nUse our interactive map tool to find exact addresses, phone numbers, and Google Maps directions!\n\n[ACTION:dealerships]`;
    }

    if (q.includes("price") || q.includes("qemat") || q.includes("qeemat") || q.includes("rate") || q.includes("sasti") || q.includes("best bike")) {
      return `🏷️ **Latest EV Bike Prices in Pakistan (2025-2026):**\n\n- **Budget Entry (PKR 175k - 219k):** Jinpeng Eco (PKR 189k), Jinpeng Ride (PKR 219k), Crown Rizz, Evee Nisa, MS Jaguar E-70.\n- **Mid-Range Workhorses (PKR 229k - 279k):** Jinpeng Sprint (PKR 229k), Reliance (PKR 239k), Swift (PKR 249k), Rush (PKR 259k), Cruise (PKR 279k), Crown Spark, Crown Fairy, Yadea T9.\n- **Premium Long Range (PKR 285k - 549k):** Jinpeng Thrill (75 km/h, 160km, PKR 549k), Crown Raftaar LFP (3kW), Crown Champion Pro, Evee C1 Air.\n\n[ACTION:products]\n[ACTION:comparison]`;
    }

    if (q.includes("solar") || q.includes("dhoop") || q.includes("free charging")) {
      return `☀️ **Solar Charging for EV Bikes:**\n\n- An EV bike needs only ~2.5 kWh per day.\n- Just **2 standard solar panels (550W each)** with a small inverter or DC solar charger can power your bike for **100% FREE** with Rs. 0 electricity bill!\n\n[ACTION:solar]`;
    }

    // Default friendly Pakistani EV response
    return `Hello! I am the **goinfoEV AI Assistant** ⚡. I can help you with all questions regarding Electric Vehicles in Pakistan:\n\n1. **EV Bike Prices & Range (Crown, Yadea, Evee, etc.)**\n2. **Monthly Petrol Savings (Save PKR 10,000 - 25,000+/mo)**\n3. **K-Electric / LESCO / IESCO Charging Costs**\n4. **Battery Technology: LFP vs Graphene Lifespan**\n5. **Verified Showrooms & Dealerships in Karachi, Lahore, and Islamabad**\n6. **Commercial Delivery Rider ROI (Bykea, Foodpanda, Yango)**\n\nFeel free to ask any question!\n\n[ACTION:products]\n[ACTION:savings]`;
  }

  // Contact Form Submission API - Sends to BOTH configured emails
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, phone, subject, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ error: "Name, email and message are required fields." });
      }

      const primaryEmail = process.env.CONTACT_PRIMARY_EMAIL || "Hamdan7394@gmail.com";
      const secondaryEmail = process.env.CONTACT_SECONDARY_EMAIL || "info@orinexai.com";
      const recipients = [primaryEmail, secondaryEmail];

      const ticketId = `EV-PK-${Math.floor(100000 + Math.random() * 900000)}`;
      const inquiry: ContactInquiry = {
        id: ticketId,
        name: String(name).trim(),
        email: String(email).trim(),
        phone: phone ? String(phone).trim() : "Not provided",
        subject: subject ? String(subject).trim() : "General EV Inquiry",
        message: String(message).trim(),
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

      // If SMTP credentials exist, send real email directly via Nodemailer
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === "true",
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          await transporter.sendMail({
            from: `"${name} via goinfoEV" <${process.env.SMTP_USER}>`,
            to: primaryEmail,
            cc: secondaryEmail,
            replyTo: email,
            subject: `[goinfoEV Inquiry #${ticketId}] ${subject || "EV Inquiry"}`,
            text: `New Inquiry Received on goinfoEV Platform:

Ticket ID: #${ticketId}
Sender: ${name}
Sender Email: ${email}
Phone: ${phone || 'Not provided'}
Subject: ${subject || 'General EV Inquiry'}

Message:
${message}

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
                      <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #64748b;"><strong>Email:</strong></td>
                      <td style="padding: 6px 0; color: #2563eb;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #64748b;"><strong>Phone:</strong></td>
                      <td style="padding: 6px 0; color: #0f172a;">${phone || 'Not provided'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #64748b;"><strong>Subject:</strong></td>
                      <td style="padding: 6px 0; color: #0f172a;">${subject || 'General EV Inquiry'}</td>
                    </tr>
                  </table>
                </div>

                <div style="margin-bottom: 24px;">
                  <h4 style="margin: 0 0 8px 0; color: #334155; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Message Details:</h4>
                  <div style="background-color: #ffffff; border-left: 4px solid #2563eb; padding: 14px 16px; font-size: 14px; line-height: 1.6; color: #1e293b; background: #fafafa; border-radius: 4px;">
                    ${message.replace(/\n/g, '<br/>')}
                  </div>
                </div>

                <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; font-size: 12px; color: #64748b;">
                  <p style="margin: 0 0 4px 0;">
                    ✓ Dispatched simultaneously to both:
                  </p>
                  <ul style="margin: 4px 0 0 16px; padding: 0;">
                    <li><strong>${primaryEmail}</strong> (Primary)</li>
                    <li><strong>${secondaryEmail}</strong> (Secondary / Tech Partner)</li>
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
        `[goinfoEV Inquiry #${ticketId}] ${subject || 'EV Inquiry'}`
      )}&body=${encodeURIComponent(
        `Hi Hamdan & Team,\n\nName: ${name}\nPhone: ${phone || 'Not provided'}\nEmail: ${email}\nReference: #${ticketId}\n\nMessage:\n${message}\n\n---\nSent via goinfoEV Pakistan Contact Portal`
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

  // Get Inquiries (for verification)
  app.get("/api/contact/inquiries", (req, res) => {
    res.json({
      count: contactInquiries.length,
      inquiries: contactInquiries
    });
  });

  // Inventory API
  app.get("/api/inventory", (req, res) => {
    res.json(inventory);
  });

  app.post("/api/inventory", (req, res) => {
    const { name, cat, price, qty, alert } = req.body;
    const newItem: InventoryItem = {
      id: "inv-" + Date.now(),
      name: name || "New Product",
      cat: cat || "General",
      price: Number(price) || 0,
      qty: Number(qty) || 0,
      alert: Number(alert) || 5
    };
    inventory.unshift(newItem);
    res.status(201).json(newItem);
  });

  app.put("/api/inventory/:id", (req, res) => {
    const { id } = req.params;
    const index = inventory.findIndex(item => item.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Item not found" });
    }
    const existing = inventory[index];
    inventory[index] = {
      ...existing,
      ...req.body,
      price: req.body.price !== undefined ? Number(req.body.price) : existing.price,
      qty: req.body.qty !== undefined ? Number(req.body.qty) : existing.qty,
      alert: req.body.alert !== undefined ? Number(req.body.alert) : existing.alert
    };
    res.json(inventory[index]);
  });

  app.delete("/api/inventory/:id", (req, res) => {
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

  // 1. Get User Subscription Status & Usage Logs
  app.get("/api/subscriptions/user/:identifier", (req, res) => {
    const rawId = req.params.identifier.toLowerCase().trim();
    const user = subscriptions.find(
      s => s.identifier.toLowerCase().trim() === rawId || s.id === rawId
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({
      id: user.id,
      name: user.name,
      identifier: user.identifier,
      authType: user.authType,
      status: user.status,
      plan: user.plan,
      planName: user.planName,
      amount: user.amount,
      trxId: user.trxId,
      freeUsesCount: user.freeUsesCount,
      usageLogs: user.usageLogs || [],
      paymentMethod: user.paymentMethod,
      notes: user.notes,
      approvedAt: user.approvedAt,
      disallowedReason: user.disallowedReason,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  });

  // 1b. Public & Admin Endpoint: Get Payment Methods Config
  app.get("/api/payment-config", (req, res) => {
    res.json(paymentConfig);
  });

  // 1c. ADMIN: Update Payment Methods & Pricing Config
  app.put("/api/admin/payment-config", (req, res) => {
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

  // 2. User Sign-in / Registration (Phone or Email)
  app.post("/api/subscriptions/auth", (req, res) => {
    try {
      const { name, identifier, authType, password } = req.body;
      if (!identifier || typeof identifier !== "string" || !identifier.trim()) {
        return res.status(400).json({ error: "Phone number or email is required." });
      }

      const cleanIdentifier = identifier.trim();
      const detectedAuthType = authType || (cleanIdentifier.includes("@") ? "email" : "phone");
      const cleanName = name ? name.trim() : (detectedAuthType === "email" ? cleanIdentifier.split("@")[0] : "EV User");

      let existing = subscriptions.find(
        s => s.identifier.toLowerCase().trim() === cleanIdentifier.toLowerCase()
      );

      if (existing) {
        // User already exists, update name if provided
        if (name && name.trim() && existing.name !== cleanName) {
          existing.name = cleanName;
          existing.updatedAt = new Date().toISOString();
          saveSubscriptions();
        }
        return res.json({
          message: "Signed in successfully",
          isNew: false,
          user: existing
        });
      }

      // Create new user with 0 initial free uses used (they get 7 free uses)
      const newUser: SubscriptionRecord = {
        id: "sub-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
        name: cleanName,
        identifier: cleanIdentifier,
        authType: detectedAuthType,
        password: password || undefined,
        status: "free",
        freeUsesCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      subscriptions.unshift(newUser);
      saveSubscriptions();

      res.status(201).json({
        message: "Account created successfully",
        isNew: true,
        user: newUser
      });
    } catch (err: any) {
      console.error("Error in /api/subscriptions/auth:", err);
      res.status(500).json({ error: "Authentication failed. Please try again." });
    }
  });

  // 3. User Submits Subscription Request (Payment details)
  app.post("/api/subscriptions/request", (req, res) => {
    try {
      const { identifier, name, plan, paymentMethod, trxId, notes } = req.body;
      if (!identifier || !trxId) {
        return res.status(400).json({ error: "Identifier (phone/email) and Transaction ID are required." });
      }

      const cleanIdentifier = identifier.trim();
      let user = subscriptions.find(
        s => s.identifier.toLowerCase().trim() === cleanIdentifier.toLowerCase()
      );

      const planType = plan === "annual" ? "annual" : "monthly";
      const amount = planType === "annual" ? 2499 : 499;
      const planName = planType === "annual" ? "Annual Full Suite Pro" : "Monthly Unlimited Pro";

      if (!user) {
        // Create user if not already signed up
        user = {
          id: "sub-" + Date.now(),
          name: name ? name.trim() : (cleanIdentifier.includes("@") ? cleanIdentifier.split("@")[0] : "EV User"),
          identifier: cleanIdentifier,
          authType: cleanIdentifier.includes("@") ? "email" : "phone",
          status: "pending",
          plan: planType,
          planName,
          amount,
          paymentMethod: paymentMethod || "easypaisa",
          trxId: String(trxId).trim(),
          notes: notes ? String(notes).trim() : undefined,
          freeUsesCount: 7,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        subscriptions.unshift(user);
      } else {
        // Update existing user with pending subscription request
        user.name = name ? name.trim() : user.name;
        user.status = "pending";
        user.plan = planType;
        user.planName = planName;
        user.amount = amount;
        user.paymentMethod = paymentMethod || "easypaisa";
        user.trxId = String(trxId).trim();
        user.notes = notes ? String(notes).trim() : user.notes;
        user.updatedAt = new Date().toISOString();
      }

      saveSubscriptions();

      res.status(200).json({
        success: true,
        message: "Subscription request submitted successfully! Admin will verify and activate your account.",
        user
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
        if (!user.usageLogs) {
          user.usageLogs = [];
        }
        if (toolName) {
          user.usageLogs.unshift({
            toolName: String(toolName),
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
            user
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
          user
        });
      }

      res.json({ status: "free", freeUsesCount: 1, remaining: 6, isLocked: false });
    } catch (err) {
      res.status(500).json({ error: "Could not track usage" });
    }
  });

  // 5. ADMIN: List all subscriptions & metrics
  app.get("/api/admin/subscriptions", (req, res) => {
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
      subscriptions
    });
  });

  // 6. ADMIN: Allow (Approve) or Disallow (Reject) User
  app.post("/api/admin/subscriptions/:id/status", (req, res) => {
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
      item.disallowedReason = reason || "Subscription disallowed by Admin";
    }

    saveSubscriptions();
    res.json({ success: true, message: `User status changed to ${status}`, user: item });
  });

  // 7. ADMIN: Reset Free Uses (Give 7 more free uses)
  app.post("/api/admin/subscriptions/:id/reset-free", (req, res) => {
    const { id } = req.params;
    const user = subscriptions.find(s => s.id === id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.freeUsesCount = 0;
    user.updatedAt = new Date().toISOString();
    saveSubscriptions();
    res.json({ success: true, message: "Free calculator uses reset to 7", user });
  });

  // 8. ADMIN: Delete record
  app.delete("/api/admin/subscriptions/:id", (req, res) => {
    const { id } = req.params;
    subscriptions = subscriptions.filter(s => s.id !== id);
    saveSubscriptions();
    res.json({ success: true, message: "Subscription deleted successfully" });
  });

  // 9. ADMIN: Manually add new subscriber / user
  app.post("/api/admin/subscriptions/manual", (req, res) => {
    const { name, identifier, plan, status, paymentMethod, trxId, notes } = req.body;
    if (!identifier) {
      return res.status(400).json({ error: "Phone number or email is required." });
    }

    const cleanId = String(identifier).trim();
    const planType = plan === "annual" ? "annual" : "monthly";
    const amount = planType === "annual" ? 2499 : 499;

    const newSub: SubscriptionRecord = {
      id: "sub-" + Date.now(),
      name: name ? String(name).trim() : "Direct Subscriber",
      identifier: cleanId,
      authType: cleanId.includes("@") ? "email" : "phone",
      status: status || "approved",
      plan: planType,
      planName: planType === "annual" ? "Annual Full Suite Pro" : "Monthly Unlimited Pro",
      amount,
      paymentMethod: paymentMethod || "bank",
      trxId: trxId ? String(trxId).trim() : `ADMIN-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: notes ? String(notes).trim() : "Added directly via Admin Dashboard",
      freeUsesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      approvedAt: status === "approved" ? new Date().toISOString() : undefined
    };

    subscriptions.unshift(newSub);
    saveSubscriptions();

    res.status(201).json({ success: true, user: newSub });
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

  // 1b. Update individual catalog model
  app.put("/api/catalog/models/:id", (req, res) => {
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

  // 1c. Delete individual catalog model
  app.delete("/api/catalog/models/:id", (req, res) => {
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

  // 1d. Delete entire brand fleet
  app.delete("/api/catalog/brands/:brand", (req, res) => {
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

  // 1c. Direct Image File Upload API (saves to /public/uploads and returns accessible URL)
  app.post("/api/catalog/upload-image", (req, res) => {
    try {
      const { dataUrl, filename } = req.body;
      if (!dataUrl || typeof dataUrl !== "string") {
        return res.status(400).json({ error: "dataUrl is required (base64 string)" });
      }

      // Format: data:image/png;base64,iVBORw0KGgo...
      const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: "Invalid base64 image data URL format" });
      }

      let subType = matches[1].toLowerCase();
      const base64Content = matches[2];
      const buffer = Buffer.from(base64Content, "base64");

      let ext = "png";
      if (subType === "jpeg" || subType === "jpg") ext = "jpg";
      else if (subType === "webp") ext = "webp";
      else if (subType === "svg+xml" || subType === "svg") ext = "svg";
      else if (subType === "gif") ext = "gif";

      const basePrefix = filename
        ? String(filename).replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase().slice(0, 30)
        : "ev-model";
      const uniqueFilename = `${basePrefix}-${Date.now()}.${ext}`;
      const destPath = path.join(publicUploadsDir, uniqueFilename);

      fs.writeFileSync(destPath, buffer);
      console.log(`[Catalog] Uploaded and saved image to ${destPath}`);

      const publicUrl = `/uploads/${uniqueFilename}`;
      res.json({ success: true, url: publicUrl, filename: uniqueFilename });
    } catch (err: any) {
      console.error("[Catalog] Image upload error:", err);
      res.status(500).json({ error: `Failed to upload image: ${err?.message || 'Server error'}` });
    }
  });

  // 2. Admin save full catalog models list
  app.post("/api/admin/catalog/save", (req, res) => {
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
  app.post("/api/admin/catalog/reset", (req, res) => {
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

  // Vite development middleware or production static handling
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
