const https = require("https");
const fs = require("fs");

const products = [
  "https://yjfuture.pk/product/yj-future-azadi-c1/",
  "https://yjfuture.pk/product/yj-future-indus/",
  "https://yjfuture.pk/product/zippy-e1/",
  "https://yjfuture.pk/product/yj-future-s7/",
  "https://yjfuture.pk/product/yj-future-twister/",
  "https://yjfuture.pk/product/yj-future-azadi-pro/",
  "https://yjfuture.pk/product/yj-future-cruise-z1/",
  "https://yjfuture.pk/product/yj-future-eco/",
  "https://yjfuture.pk/product/cruise-z9/",
  "https://yjfuture.pk/product/yj-future-mini-ev/",
  "https://yjfuture.pk/product/yj-future-mini-ev-pro/",
  "https://yjfuture.pk/product/yj-future-cruise-x7/",
  "https://yjfuture.pk/product/yj-future-azadi/"
];

async function fetchPage(url) {
  return new Promise((resolve) => {
    https.get(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve({ url, data }));
    }).on("error", (e) => resolve({ url, data: "" }));
  });
}

async function run() {
  const results = [];
  for (const url of products) {
    const slug = url.split("/product/")[1].replace(/\//g, "");
    console.log("Fetching", slug, "...");
    const { data } = await fetchPage(url);
    fs.writeFileSync(`yj_${slug}.html`, data);
    console.log("Saved", `yj_${slug}.html`, data.length, "bytes");
  }
}

run();
