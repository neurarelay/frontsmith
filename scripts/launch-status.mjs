import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { businessPath, businessRoot } from "./lib/paths.mjs";

const root = businessRoot();
const business = await readBusinessProfile();
const checks = [
  ["Business profile", path.join(root, "business.json")],
  ["Single-page website", path.join("website", "index.html")],
  ["Website styles", path.join("website", "styles.css")],
  ["Website interactions", path.join("website", "script.js")],
  ["Contact form function", path.join("api", "contact.js")],
  ["Integration settings", path.join(root, "settings", "integrations.md")],
  ["Customer desk", path.join(root, "customer-inquiries", "README.md")],
  ["Estimates folder", path.join(root, "estimates", "README.md")],
  ["Extensions folder", path.join(root, "extensions", "README.md")]
];

const results = [];
for (const [label, file] of checks) {
  results.push({ label, file, ready: await exists(file) });
}

const defaultPhones = new Set(["(000) 000-0000", "1-800-123-ACME"]);
const defaultEmails = new Set(["hello@example.com", "projects@acme.com"]);
const defaultWebsiteUrls = new Set(["https://acme.com"]);

const placeholders = [
  defaultPhones.has(business.contact.phone) ? "phone number" : null,
  defaultEmails.has(business.contact.email) ? "email address" : null,
  !business.websiteUrl || defaultWebsiteUrls.has(business.websiteUrl) ? "website URL" : null,
  business.contact.city === "Local" ? "city" : null,
  business.contact.state === "ST" ? "state" : null
].filter(Boolean);

const readyCount = results.filter((item) => item.ready).length;
const contactDelivery = contactDeliveryStatus();
const status = launchStatus({ business, results, readyCount, placeholders, contactDelivery });
const output = path.join(root, "launch", "launch-status.md");
await writeFile(output, status);

console.log(`Launch status written: ${output}`);
console.log(`Ready checks: ${readyCount}/${results.length}`);
if (placeholders.length > 0) {
  console.log(`Needs owner update: ${placeholders.join(", ")}`);
}
if (!contactDelivery.ready) {
  console.log(`Needs contact delivery setup: ${contactDelivery.message}`);
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function readBusinessProfile() {
  const profilePath = businessPath("business.json");
  try {
    return JSON.parse(await readFile(profilePath, "utf8"));
  } catch (error) {
    if (error && error.code === "ENOENT") {
      throw new Error(`No business workspace found at ${profilePath}. Run npm run bootstrap first.`);
    }
    throw error;
  }
}

function contactDeliveryStatus() {
  const mode = process.env.CONTACT_DELIVERY_MODE ?? "";
  const missing = [
    mode !== "resend" ? "CONTACT_DELIVERY_MODE=resend" : null,
    process.env.RESEND_API_KEY ? null : "RESEND_API_KEY",
    process.env.CONTACT_TO_EMAIL ? null : "CONTACT_TO_EMAIL",
    process.env.CONTACT_FROM_EMAIL ? null : "CONTACT_FROM_EMAIL"
  ].filter(Boolean);

  if (missing.length === 0) {
    return { ready: true, message: "Contact form email delivery is configured" };
  }

  return {
    ready: false,
    message: `Configure ${missing.join(", ")} before relying on form email`
  };
}

function launchStatus({ business, results, readyCount, placeholders, contactDelivery }) {
  const lines = results.map((item) => `- ${item.ready ? "Ready" : "Needs review"}: ${item.label}`);
  const contactLines =
    placeholders.length === 0
      ? ["- Contact details look customized"]
      : placeholders.map((item) => `- Replace default ${item}`);

  return `# Launch Status

Business: ${business.businessName}

## Readiness

${readyCount}/${results.length} checks are ready.

${lines.join("\n")}

## Owner Updates

${contactLines.join("\n")}

## Contact Delivery

- ${contactDelivery.ready ? "Ready" : "Needs review"}: ${contactDelivery.message}

## Live Action Boundary

The website can be reviewed locally. Deployment, domain connection, customer sends, calendar setup, and connected-mode enrollment require explicit owner approval.
`;
}
