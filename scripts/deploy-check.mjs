import { access, readFile } from "node:fs/promises";
import path from "node:path";

const ready = [];
const blockers = [];
const review = [];

const demoRoot = "demo";
const websiteRoot = "website";
const outputRoot = "dist/frontsmith-demo";
const requiredDemoFiles = ["index.html", "styles.css", "script.js", "robots.txt", "sitemap.xml", "llms.txt"];
const requiredWebsiteFiles = [
  "index.html",
  "styles.css",
  "script.js",
  "frontsmith-mark.svg",
  "favicon.svg",
  "favicon.png",
  "apple-touch-icon.png"
];
const requiredEnvKeys = ["RESEND_API_KEY", "CONTACT_TO_EMAIL", "CONTACT_FROM_EMAIL"];

await checkWebsiteFiles();
await checkVercelConfig();
await checkWebsiteMarkup();
await checkContactDelivery();

printReport();

if (blockers.length > 0) {
  process.exitCode = 1;
}

async function checkWebsiteFiles() {
  for (const file of requiredDemoFiles) {
    const fullPath = path.join(demoRoot, file);
    if (await exists(fullPath)) {
      pass(`Demo source present: ${fullPath}`);
    } else {
      block(`Missing demo source: ${fullPath}`);
    }
  }

  for (const file of requiredWebsiteFiles) {
    const fullPath = path.join(websiteRoot, file);
    if (await exists(fullPath)) {
      pass(`Website asset present: ${fullPath}`);
    } else {
      block(`Missing website asset: ${fullPath}`);
    }
  }

  for (const file of ["index.html", "styles.css", "script.js", "robots.txt", "sitemap.xml", "llms.txt", "frontsmith-mark.svg", "favicon.svg", "favicon.png", "apple-touch-icon.png", "website/index.html", "website/styles.css", "website/script.js"]) {
    const fullPath = path.join(outputRoot, file);
    if (await exists(fullPath)) {
      pass(`Demo build asset present: ${fullPath}`);
    } else {
      block(`Missing demo build asset: ${fullPath}`);
    }
  }

  if (await exists("api/contact.js")) {
    pass("Contact form function present: api/contact.js");
  } else {
    block("Missing contact form function: api/contact.js");
  }
}

async function checkVercelConfig() {
  let config;

  try {
    config = JSON.parse(await readFile("vercel.json", "utf8"));
    pass("vercel.json parses");
  } catch (error) {
    block(`vercel.json must parse as JSON: ${error.message}`);
    return;
  }

  expectEqual(config.framework, null, "Vercel framework preset is Other");
  expectEqual(config.buildCommand, "npm run build:demo", "Vercel build command prepares the demo instance");
  expectEqual(config.outputDirectory, outputRoot, "Vercel output directory is the demo build");
  expectEqual(config.cleanUrls, true, "Vercel clean URLs are enabled");
  expectEqual(config.trailingSlash, false, "Vercel trailing slashes are disabled");
  expectEqual(config.functions?.["api/contact.js"]?.maxDuration, 10, "Contact function max duration is set");
  expectEqual(config.redirects?.[0]?.source, "/", "Default Vercel host redirect covers root");
  expectEqual(config.redirects?.[0]?.has?.[0]?.type, "host", "Default Vercel root redirect uses host match");
  expectEqual(config.redirects?.[0]?.has?.[0]?.value, "frontsmith.vercel.app", "Default Vercel root redirect source host");
  expectEqual(
    config.redirects?.[0]?.destination,
    "https://frontsmith.neurapath.ai/",
    "Default Vercel host redirects root to canonical Frontsmith domain"
  );
  expectEqual(config.redirects?.[0]?.permanent, true, "Default Vercel root redirect is permanent");
  expectEqual(config.redirects?.[1]?.source, "/:path*", "Default Vercel host redirect covers non-root paths");
  expectEqual(config.redirects?.[1]?.has?.[0]?.type, "host", "Default Vercel path redirect uses host match");
  expectEqual(config.redirects?.[1]?.has?.[0]?.value, "frontsmith.vercel.app", "Default Vercel path redirect source host");
  expectEqual(
    config.redirects?.[1]?.destination,
    "https://frontsmith.neurapath.ai/:path*",
    "Default Vercel host redirects paths to canonical Frontsmith domain"
  );
  expectEqual(config.redirects?.[1]?.permanent, true, "Default Vercel path redirect is permanent");

  review.push("Confirm the frontsmith.neurapath.ai Vercel project, production domain, and Git integration before any live deployment");
}

async function checkWebsiteMarkup() {
  let demoHtml;
  let demoScript;
  let html;
  let script;

  try {
    demoHtml = await readFile(path.join(demoRoot, "index.html"), "utf8");
    demoScript = await readFile(path.join(demoRoot, "script.js"), "utf8");
    html = await readFile(path.join(websiteRoot, "index.html"), "utf8");
    script = await readFile(path.join(websiteRoot, "script.js"), "utf8");
  } catch (error) {
    block(`Could not read website files: ${error.message}`);
    return;
  }

  if (/\{\{[a-zA-Z0-9]+\}\}/.test(`${demoHtml}\n${html}`)) {
    block("Website contains unresolved template tokens");
  } else {
    pass("Demo and website have no unresolved template tokens");
  }

  if (/\bhref=["'][^"']+\.html(?:[#?][^"']*)?["']/.test(`${demoHtml}\n${html}`)) {
    block("Demo and website navigation must not link to .html routes");
  } else {
    pass("Demo and website navigation use clean routes");
  }

  requireHtml(demoHtml, "<title", "Demo SEO title is present");
  requireHtml(demoHtml, 'name="description"', "Demo SEO description is present");
  requireHtml(demoHtml, 'rel="canonical"', "Demo canonical URL is present");
  requireHtml(demoHtml, 'href="/llms.txt"', "Demo exposes AI-readable llms.txt discovery");
  requireHtml(demoHtml, 'property="og:title"', "Demo Open Graph title is present");
  requireHtml(demoHtml, 'property="og:image"', "Demo Open Graph image is present");
  requireHtml(demoHtml, 'name="twitter:card"', "Demo Twitter card metadata is present");
  requireHtml(demoHtml, 'href="/favicon.svg"', "Demo SVG favicon is declared");
  requireHtml(demoHtml, 'href="/favicon.png"', "Demo PNG favicon fallback is declared");
  requireHtml(demoHtml, 'href="/apple-touch-icon.png"', "Demo Apple touch icon is declared");
  requireHtml(demoHtml, 'href="/website"', "Demo links to the sample website preview");
requireText(demoHtml, "Set up your front office in Codex", "Demo explains the Frontsmith control panel");
  requireHtml(demoHtml, "What Frontsmith Runs", "Demo opens with the front-office module list");
  requireHtml(demoHtml, "Customer Desk", "Demo opens with ongoing customer work");
  requireHtml(demoHtml, "https://github.com/neurarelay/frontsmith", "Demo includes the GitHub setup path");
  requireScript(demoScript, "data-nav-toggle", "Demo mobile navigation script is present");

  requireHtml(html, "<title", "SEO title is present");
  requireHtml(html, 'name="description"', "SEO description is present");
  requireHtml(html, 'name="robots"', "Robots metadata is present");
  requireHtml(html, 'rel="canonical"', "Canonical URL is present");
  requireHtml(html, 'property="og:title"', "Open Graph title is present");
  requireHtml(html, 'property="og:description"', "Open Graph description is present");
  requireHtml(html, 'property="og:url"', "Open Graph URL is present");
  requireHtml(html, 'property="og:image"', "Open Graph image is present");
  requireHtml(html, 'property="og:image:alt"', "Open Graph image alt text is present");
  requireHtml(html, 'name="twitter:card"', "Twitter card metadata is present");
  requireHtml(html, 'name="twitter:title"', "Twitter title is present");
  requireHtml(html, 'name="twitter:description"', "Twitter description is present");
  requireHtml(html, 'name="twitter:image"', "Twitter image is present");
  requireHtml(html, 'name="twitter:image:alt"', "Twitter image alt text is present");
  requireHtml(html, 'href="/favicon.svg"', "SVG favicon is declared");
  requireHtml(html, 'href="/favicon.png"', "PNG favicon fallback is declared");
  requireHtml(html, 'href="/apple-touch-icon.png"', "Apple touch icon is declared");
  requireHtml(html, 'data-intake-form', "Contact form marker is present");
  requireHtml(html, 'action="/api/contact"', "Contact form posts to /api/contact");
  requireHtml(html, 'data-fallback-action="mailto:', "Contact form has mailto fallback");
  requireHtml(html, 'data-intake-status', "Contact form status region is present");
  requireHtml(html, 'name="website"', "Contact form honeypot is present");
  requireHtml(html, 'data-contact-email', "Contact form email validation field is present");
  requireHtml(html, 'data-contact-phone', "Contact form phone validation field is present");
  requireScript(script, "fetch(intakeForm.action", "Contact form submits through the configured action");
  requireScript(script, "fallbackMailto", "Contact form has email fallback logic");
  requireScript(script, "validateIntakeForm", "Contact form client validation is present");

  await checkBuiltWebsitePreviewAssets();
  await checkBuiltAnalyticsInstrumentation();
  await checkRootAssetReferences(demoHtml);
  await checkRootAssetReferences(html);
  await checkImageReferences(demoHtml);
  await checkImageReferences(html);
}

async function checkBuiltWebsitePreviewAssets() {
  let builtWebsiteHtml;

  try {
    builtWebsiteHtml = await readFile(path.join(outputRoot, "website", "index.html"), "utf8");
  } catch (error) {
    block(`Could not read built website preview: ${error.message}`);
    return;
  }

  requireHtml(builtWebsiteHtml, 'href="/website/styles.css"', "Built website preview loads scoped stylesheet");
  requireHtml(builtWebsiteHtml, 'src="/website/script.js"', "Built website preview loads scoped script");
  requireHtml(
    builtWebsiteHtml,
    'href="https://frontsmith.neurapath.ai/website"',
    "Built website preview uses Frontsmith preview canonical"
  );
  requireHtml(
    builtWebsiteHtml,
    'content="https://frontsmith.neurapath.ai/website"',
    "Built website preview uses Frontsmith preview Open Graph URL"
  );

  if (builtWebsiteHtml.includes('href="./styles.css"') || builtWebsiteHtml.includes('src="./script.js"')) {
    block("Built website preview must not load root demo assets through relative paths");
  } else {
    pass("Built website preview avoids clean-URL relative asset leakage");
  }
}

async function checkBuiltAnalyticsInstrumentation() {
  const analyticsScript = 'src="/_vercel/insights/script.js"';
  const analyticsQueue = "window.va = window.va || function";

  for (const file of ["index.html", "website/index.html"]) {
    let html;

    try {
      html = await readFile(path.join(outputRoot, file), "utf8");
    } catch (error) {
      block(`Could not read built analytics target: ${error.message}`);
      continue;
    }

    requireHtml(html, analyticsQueue, `Built ${file} initializes Vercel analytics queue`);
    requireHtml(html, analyticsScript, `Built ${file} loads Vercel analytics script`);
  }
}

async function checkRootAssetReferences(html) {
  const rootRefs = [
    ...html.matchAll(/\b(?:href|src|content)=["'](\/[^"'?#]+)(?:[?#][^"']*)?["']/g)
  ].map((match) => match[1]);

  for (const ref of rootRefs) {
    if (ref.startsWith("/api/")) continue;

    const file = path.join(outputRoot, ref.slice(1));
    if (await exists(file)) {
      pass(`Root asset resolves: ${ref}`);
    } else {
      block(`Root asset does not resolve inside website/: ${ref}`);
    }
  }
}

async function checkImageReferences(html) {
  const imageRefs = [
    ...html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/g),
    ...html.matchAll(/<meta\b[^>]*\b(?:property|name)=["'](?:og:image|twitter:image)["'][^>]*\bcontent=["']([^"']+)["'][^>]*>/g)
  ].map((match) => match[1]);

  for (const ref of imageRefs) {
    if (/^https?:\/\//i.test(ref)) {
      pass(`Image reference is absolute: ${trimUrl(ref)}`);
      continue;
    }

    if (!ref.startsWith("/")) {
      block(`Image reference must be absolute or root-relative: ${ref}`);
      continue;
    }

    const file = path.join(outputRoot, ref.replace(/[?#].*$/, "").slice(1));
    if (await exists(file)) {
      pass(`Image reference resolves locally: ${ref}`);
    } else {
      block(`Image reference does not resolve inside website/: ${ref}`);
    }
  }
}

async function checkContactDelivery() {
  let envExample;

  try {
    envExample = await readFile(".env.example", "utf8");
    pass(".env.example is present");
  } catch (error) {
    block(`Missing .env.example: ${error.message}`);
    return;
  }

  for (const key of ["CONTACT_DELIVERY_MODE", "CONTACT_TO_EMAIL", "CONTACT_FROM_EMAIL", "CONTACT_SUBJECT_PREFIX", "FRONTSMITH_TENANT_ID", "RESEND_API_KEY"]) {
    if (envExample.includes(`${key}=`)) {
      pass(`Documented environment variable: ${key}`);
    } else {
      block(`.env.example must document ${key}`);
    }
  }

  const missing = [
    process.env.CONTACT_DELIVERY_MODE === "resend" ? null : "CONTACT_DELIVERY_MODE=resend",
    ...requiredEnvKeys.filter((key) => !process.env[key])
  ].filter(Boolean);

  if (missing.length > 0) {
    block(`Contact delivery is not production-ready. Configure ${missing.join(", ")}`);
    return;
  }

  if (!emailLike(process.env.CONTACT_TO_EMAIL)) {
    block("CONTACT_TO_EMAIL must be an email address");
  } else {
    pass("CONTACT_TO_EMAIL looks valid");
  }

  if (!emailLike(process.env.CONTACT_FROM_EMAIL)) {
    block("CONTACT_FROM_EMAIL must include a sender email address");
  } else {
    pass("CONTACT_FROM_EMAIL looks valid");
  }

  if (process.env.RESEND_API_KEY === "re_xxxxxxxxx") {
    block("RESEND_API_KEY still uses the example placeholder");
  } else {
    pass("RESEND_API_KEY is present and not the example placeholder");
  }

  pass("Contact delivery mode is set to resend");
  review.push("Send one approved test submission after Vercel environment variables are configured");
}

function requireHtml(html, token, label) {
  if (html.includes(token)) {
    pass(label);
  } else {
    block(label);
  }
}

function requireText(html, token, label) {
  const text = html.replace(/&nbsp;/g, " ");

  requireHtml(text, token, label);
}

function requireScript(script, token, label) {
  if (script.includes(token)) {
    pass(label);
  } else {
    block(label);
  }
}

function expectEqual(actual, expected, label) {
  if (actual === expected) {
    pass(label);
  } else {
    block(`${label}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

function emailLike(value) {
  return /[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+/.test(String(value ?? ""));
}

function trimUrl(value) {
  return value.length > 80 ? `${value.slice(0, 77)}...` : value;
}

function pass(message) {
  ready.push(message);
}

function block(message) {
  blockers.push(message);
}

function printReport() {
  console.log("Frontsmith deploy readiness check");
  console.log("");
  console.log("Ready");
  for (const item of ready) console.log(`- ${item}`);

  if (blockers.length > 0) {
    console.log("");
    console.log("Blockers");
    for (const item of blockers) console.log(`- ${item}`);
  }

  if (review.length > 0) {
    console.log("");
    console.log("Review before deployment");
    for (const item of review) console.log(`- ${item}`);
  }

  console.log("");
  console.log("No deployment, DNS change, provider change, or email send was performed.");
}
