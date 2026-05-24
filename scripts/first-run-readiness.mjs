import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { businessPath, businessRoot } from "./lib/paths.mjs";

const root = businessRoot();
const business = await readBusinessProfile();
const findings = buildFindings(business);
const output = businessPath("launch", "first-run-readiness.md");

await writeFile(output, renderReadiness({ business, findings }));

console.log(`First-run readiness written: ${output}`);
console.log(`Customized fields: ${findings.customized.length}`);
if (findings.needsOwnerInput.length > 0) {
  console.log(`Needs owner input: ${findings.needsOwnerInput.map((item) => item.label).join(", ")}`);
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

function buildFindings(profile) {
  const checks = [
    field("Business name", profile.businessName, ["Acme", ""]),
    field("Business type", profile.businessType, ["Local Service Business", ""]),
    field("Website URL", profile.websiteUrl, ["https://acme.com", ""]),
    field("Phone", profile.contact?.phone, ["1-800-123-ACME", "(000) 000-0000", ""]),
    field("Email", profile.contact?.email, ["projects@acme.com", "hello@example.com", ""]),
    field("City", profile.contact?.city, ["Local", ""]),
    field("State", profile.contact?.state, ["ST", ""]),
    field("Service areas", (profile.serviceAreas ?? []).join(", "), ["Your City, Nearby Communities, Surrounding Service Area", ""]),
    field("Services", (profile.services ?? []).map((service) => service.name).join(", "), ["Kitchen Remodeling, Bathroom Remodeling, Living Spaces", ""]),
    field("Brand voice", profile.brandVoice, ["Clear, practical, respectful, detail-oriented, and homeowner-friendly.", ""])
  ];

  return {
    customized: checks.filter((item) => item.state === "customized"),
    needsOwnerInput: checks.filter((item) => item.state !== "customized"),
    checks
  };
}

function field(label, value, placeholders) {
  const normalized = String(value ?? "").trim();
  const placeholderSet = new Set(placeholders.map((item) => item.toLowerCase()));
  const state = normalized && !placeholderSet.has(normalized.toLowerCase()) ? "customized" : "needs owner input";

  return {
    label,
    value: normalized || "not provided",
    state
  };
}

function renderReadiness({ business: profile, findings }) {
  const approvalItems = [
    "Approve business name, contact details, city/state, service areas, and services before public use.",
    "Approve website copy, images, metadata, and contact form behavior before deployment.",
    "Approve customer replies before sending.",
    "Approve estimate assumptions and pricing rules before proposal use.",
    "Approve provider setup before email, calendar, storage, deployment, or connected-mode actions."
  ];

  return `# First-Run Readiness

Business: ${profile.businessName}
Updated: ${new Date().toISOString()}

## Executive Summary

Frontsmith has a local business workspace and website source. ${findings.needsOwnerInput.length === 0 ? "All required first-run business profile fields look customized." : `${findings.needsOwnerInput.length} first-run ${findings.needsOwnerInput.length === 1 ? "field still needs" : "fields still need"} owner input before launch.`} No customer message, website deployment, provider connection, DNS change, or connected action has run.

## Business Profile Review

| Field | State | Current value |
| --- | --- | --- |
${findings.checks.map((item) => `| ${item.label} | ${item.state} | ${escapeTable(item.value)} |`).join("\n")}

## Generated Workspace

- Business profile: \`${displayPath(businessPath("business.json"))}\`
- Launch checklist: \`${displayPath(businessPath("launch", "launch-checklist.md"))}\`
- First-run readiness: \`${displayPath(output)}\`
- Owner Brief target: \`${displayPath(businessPath("activity", "owner-brief.md"))}\`
- Website review target: \`${displayPath(businessPath("launch", "website-review.md"))}\`
- Customer Desk folder: \`${displayPath(businessPath("customer-inquiries"))}\`
- Estimates folder: \`${displayPath(businessPath("estimates"))}\`
- Extensions folder: \`${displayPath(businessPath("extensions"))}\`
- Website source: \`website/\`

## Needs Owner Input

${findings.needsOwnerInput.length > 0 ? findings.needsOwnerInput.map((item) => `- ${item.label}: replace \`${item.value}\``).join("\n") : "- None"}

## Next Commands

1. Run \`npm run owner:brief\` to generate the current-state Owner Brief.
2. Run \`npm run update:website\` after business profile changes.
3. Run \`npm run launch:status\` to refresh launch readiness.
4. Run \`npm run deploy:check\` only when production contact-delivery environment variables are approved or safe placeholders are intentionally supplied.

## Owner Approval Boundary

${approvalItems.map((item) => `- ${item}`).join("\n")}

## Safety Boundary

This first-run readiness file is local-only. It does not send emails, publish the website, change DNS, connect providers, upload files, schedule appointments, enroll connected mode, or execute external actions.
`;
}

function displayPath(file) {
  const normalizedFile = path.normalize(file);
  const normalizedRoot = path.normalize(root);
  const relativeToBusiness = path.relative(normalizedRoot, normalizedFile);

  if (relativeToBusiness && !relativeToBusiness.startsWith("..") && !path.isAbsolute(relativeToBusiness)) {
    return toPosix(path.join(".frontsmith", "business", relativeToBusiness));
  }

  const relativeToProject = path.relative(process.cwd(), normalizedFile) || normalizedFile;
  return toPosix(relativeToProject);
}

function escapeTable(value) {
  return String(value).replaceAll("|", "\\|");
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}
