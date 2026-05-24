import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { existsSync } from "node:fs";

const outputRoot = path.resolve("dist/frontsmith-demo");
const rootAssets = ["frontsmith-mark.svg", "favicon.svg", "favicon.png", "apple-touch-icon.png"];
const productAssets = [
  {
    source: "docs/assets/frontsmith-control-panel.png",
    target: "assets/frontsmith-control-panel.png"
  }
];

export async function buildDemo({ quiet = false } = {}) {
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });
  await cp("demo", outputRoot, { recursive: true });
  await cp("website", path.join(outputRoot, "website"), { recursive: true });
  await rewriteWebsitePreviewAssets();

  for (const asset of rootAssets) {
    await cp(path.join("website", asset), path.join(outputRoot, asset));
  }

  if (existsSync(path.join("website", "assets"))) {
    await cp(path.join("website", "assets"), path.join(outputRoot, "assets"), { recursive: true });
  }

  for (const asset of productAssets) {
    if (existsSync(asset.source)) {
      await mkdir(path.dirname(path.join(outputRoot, asset.target)), { recursive: true });
      await cp(asset.source, path.join(outputRoot, asset.target));
    }
  }

  if (!quiet) {
    console.log(`Frontsmith demo built: ${path.relative(process.cwd(), outputRoot)}`);
  }

  return outputRoot;
}

async function rewriteWebsitePreviewAssets() {
  const previewIndex = path.join(outputRoot, "website", "index.html");
  const html = await readFile(previewIndex, "utf8");
  const rewritten = html
    .replace('href="./styles.css"', 'href="/website/styles.css"')
    .replace('src="./script.js"', 'src="/website/script.js"');

  await writeFile(previewIndex, rewritten);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await buildDemo({ quiet: process.argv.includes("--quiet") });
}
