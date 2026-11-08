const fs = require("fs");

const slugs = [
  "yj-future-azadi-c1",
  "yj-future-indus",
  "zippy-e1",
  "yj-future-s7",
  "yj-future-twister",
  "yj-future-azadi-pro",
  "yj-future-cruise-z1",
  "yj-future-eco",
  "cruise-z9",
  "yj-future-mini-ev",
  "yj-future-mini-ev-pro",
  "yj-future-cruise-x7",
  "yj-future-azadi"
];

const results = [];

for (const slug of slugs) {
  const filename = `yj_${slug}.html`;
  if (!fs.existsSync(filename)) continue;
  const html = fs.readFileSync(filename, "utf8");

  // Title
  const titleMatch = html.match(/<h1[^>]*class="[^"]*product_title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i) ||
                     html.match(/<title>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").replace(/– YJ Future.*|\| YJ Future.*/i, "").trim() : slug;

  // Price
  const priceMatches = [...html.matchAll(/(?:₨|PKR|Rs\.?)\s*([0-9,]+)/gi)].map(m => m[1].replace(/,/g, ""));
  // Also look for woocommerce-Price-amount
  const wooPrices = [...html.matchAll(/class="woocommerce-Price-amount amount">[\s\S]*?<bdi>([\s\S]*?)<\/bdi>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, "").replace(/[^0-9]/g, ""));
  
  // Images
  const ogImg = (html.match(/property="og:image"\s+content="([^"]+)"/i) || [])[1];
  const prodImgs = [...html.matchAll(/<img[^>]+src="(https:\/\/[^"]*yjfuture\.pk\/wp-content\/uploads\/[0-9]{4}\/[0-9]{2}\/[^"]+\.(?:png|jpg|jpeg|webp))"/gi)]
    .map(m => m[1])
    .filter(u => !u.includes("logo") && !u.includes("cropped-") && !u.includes("shop-bnner") && !u.includes("banner") && !u.includes("-150x") && !u.includes("-300x"));
  
  // Clean text
  const cleanHtml = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
                        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
                        .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, " ");
  
  // Look for tables or spec attributes
  const tableRows = [...cleanHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map(r => {
    return [...r[1].matchAll(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi)]
      .map(c => c[1].replace(/<[^>]+>/g, "").trim()).join(" : ");
  }).filter(r => r.length > 0);

  // Look for description paragraphs or list items
  const descChunk = (cleanHtml.match(/<div[^>]*class="[^"]*(?:woocommerce-product-details__short-description|woocommerce-Tabs-panel--description|product-short-description)[^"]*"[^>]*>([\s\S]*?)<\/div>/i) || [])[1] || "";
  const descText = descChunk.replace(/<[^>]+>/g, "\n").split("\n").map(s => s.trim()).filter(s => s.length > 0);

  results.push({
    slug,
    title,
    prices: [...new Set(wooPrices.length > 0 ? wooPrices : priceMatches)],
    ogImg,
    images: [...new Set([ogImg, ...prodImgs].filter(Boolean))],
    tableRows: tableRows.slice(0, 20),
    descText: descText.slice(0, 15)
  });
}

console.log(JSON.stringify(results, null, 2));
