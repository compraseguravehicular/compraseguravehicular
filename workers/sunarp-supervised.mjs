import { mkdir, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { chromium } from "playwright";

const rawPlate = process.argv[2] ?? "5075cd";
const compactPlate = rawPlate.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
const plate =
  /^\d{4}[A-Z]{2}$/.test(compactPlate)
    ? `${compactPlate.slice(0, 4)}-${compactPlate.slice(4)}`
    : /^[A-Z]{3}\d{3}$/.test(compactPlate)
      ? `${compactPlate.slice(0, 3)}-${compactPlate.slice(3)}`
      : compactPlate;
const artifactsDir = new URL("../artifacts/operator/", import.meta.url);
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const baseName = `sunarp-${plate}-${timestamp}`;

async function waitForEnter(message) {
  const rl = createInterface({ input, output });
  await rl.question(message);
  rl.close();
}

async function tryFillPlate(page) {
  const candidates = [
    'input[placeholder*="placa" i]',
    'input[name*="placa" i]',
    'input[id*="placa" i]',
    'input[type="text"]',
    "input:not([type])"
  ];

  for (const selector of candidates) {
    const locator = page.locator(selector);
    const count = await locator.count();

    for (let index = 0; index < count; index += 1) {
      const inputLocator = locator.nth(index);
      if (await inputLocator.isVisible().catch(() => false)) {
        await inputLocator.fill(plate).catch(() => undefined);
        const value = await inputLocator.inputValue().catch(() => "");
        if (value) {
          return true;
        }
      }
    }
  }

  return false;
}

await mkdir(artifactsDir, { recursive: true });

const browser = await chromium.launch({
  headless: false,
  slowMo: 80
});
const page = await browser.newPage({
  viewport: { width: 1366, height: 900 }
});

console.log(`\nCompra Segura Vehicular - SUNARP supervisado`);
console.log(`Placa: ${plate}`);
console.log(`Abriendo fuente oficial...\n`);

await page.goto("https://consultavehicular.sunarp.gob.pe/", {
  waitUntil: "domcontentloaded",
  timeout: 60000
});

const filled = await tryFillPlate(page);
if (filled) {
  console.log("Placa cargada en el formulario si el campo estuvo disponible.");
} else {
  console.log("No encontre un campo estable. Copia la placa y pegala en el navegador abierto.");
}

await waitForEnter(
  "\nResuelve la verificacion oficial y deja visible el resultado. Luego presiona Enter aqui para capturar evidencia..."
);

const bodyText = await page.locator("body").innerText({ timeout: 10000 }).catch(() => "");
const html = await page.content();
const screenshotPath = new URL(`${baseName}.png`, artifactsDir);
const textPath = new URL(`${baseName}.txt`, artifactsDir);
const htmlPath = new URL(`${baseName}.html`, artifactsDir);

await page.screenshot({ path: screenshotPath, fullPage: true });
await writeFile(textPath, bodyText, "utf8");
await writeFile(htmlPath, html, "utf8");

console.log("\nEvidencia guardada:");
console.log(`Texto: ${textPath.pathname}`);
console.log(`HTML: ${htmlPath.pathname}`);
console.log(`Captura: ${screenshotPath.pathname}`);
console.log("\nPega el contenido del TXT en /operador para que el copiloto lo analice.");

await browser.close();
