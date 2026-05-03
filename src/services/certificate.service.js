const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"]
});

const page = await browser.newPage();

console.log("🌐 Rendering HTML with Puppeteer...");

/* =========================
   🔥 LOAD HTML PROPERLY
========================= */
await page.setContent(html, {
  waitUntil: "domcontentloaded"
});

/* =========================
   🔥 FORCE IMAGE + FONT LOAD
========================= */
await page.evaluate(async () => {
  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  // Wait for all images
  const images = Array.from(document.images);

  await Promise.all(
    images.map(img => {
      if (img.complete && img.naturalHeight !== 0) return;

      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    })
  );

  // Wait for fonts (important for styling)
  if (document.fonts) {
    await document.fonts.ready;
  }

  // Extra safety delay (VERY IMPORTANT for Render)
  await delay(1200);
});

console.log("📄 Generating PDF...");

/* =========================
   📄 GENERATE PDF
========================= */
await page.pdf({
  path: filePath,
  format: "A4",
  landscape: true,
  printBackground: true
});

await browser.close();

console.log("📦 PDF generated:", filePath);