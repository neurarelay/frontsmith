import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { renderWebsite } from "./lib/render-website.mjs";
import { businessRoot } from "./lib/paths.mjs";

const businessName = readArg("--business-name") ?? "Acme";
const reset = process.argv.includes("--reset");
const skipWebsite = process.argv.includes("--skip-website");
const target = businessRoot();

function readArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

function readList(name, fallback = []) {
  const value = readArg(name);
  if (!value) return fallback;
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function serviceFromName(name) {
  const defaultDescriptions = new Map([
    [
      "Kitchen Remodeling",
      "Layouts, cabinets, counters, lighting, fixtures, storage, and finishes planned around how the kitchen is used every day."
    ],
    [
      "Bathroom Remodeling",
      "Showers, vanities, tile, fixtures, lighting, ventilation, storage, and finish choices planned around comfort and durability."
    ],
    [
      "Living Spaces",
      "Family rooms, dining areas, entryways, built-ins, flooring, lighting, trim, and updates that make the home feel more connected."
    ]
  ]);

  return {
    name,
    description:
      defaultDescriptions.get(name) ??
      `Planning support for ${name.toLowerCase()} with scope guidance, practical options, and a clear path before work begins.`
  };
}

function createBusinessProfile() {
  const services = readList("--services", [
    "Kitchen Remodeling",
    "Bathroom Remodeling",
    "Living Spaces"
  ]).map(serviceFromName);

  return {
    businessName,
    businessType: readArg("--business-type") ?? "Local Service Business",
    brandTagline:
      readArg("--brand-tagline") ??
      "Crafted Home Remodeling",
    tagline:
      readArg("--tagline") ??
      "Remodeling made clear",
    summary:
      readArg("--summary") ??
      "Kitchens, baths, and living spaces",
    websiteUrl: normalizeWebsiteUrl(readArg("--website-url") ?? "https://acme.com"),
    serviceAreas: readList("--service-areas", ["Your City", "Nearby Communities", "Surrounding Service Area"]),
    services,
    media: {
      heroImage:
        readArg("--hero-image") ??
        "/assets/acme-hero-remodel.jpg",
      kitchenImage:
        readArg("--kitchen-image") ??
        "/assets/acme-kitchen-remodel.jpg",
      bathroomImage:
        readArg("--bathroom-image") ??
        "/assets/acme-bathroom-remodel.jpg",
      livingImage:
        readArg("--living-image") ??
        "/assets/acme-living-remodel.jpg",
      craftImage:
        readArg("--craft-image") ??
        "/assets/acme-craft-detail.jpg",
      faqImage:
        readArg("--faq-image") ??
        "/assets/acme-planning-faq.jpg",
      contactImage:
        readArg("--contact-image") ??
        "/assets/acme-contact-planning.jpg"
    },
    contact: {
      phone: readArg("--phone") ?? "1-800-123-ACME",
      email: readArg("--email") ?? "projects@acme.com",
      city: readArg("--city") ?? "Local",
      state: readArg("--state") ?? "ST"
    },
    brandVoice:
      readArg("--brand-voice") ??
      "Clear, practical, respectful, detail-oriented, and homeowner-friendly.",
    approvalPolicy: {
      ownerApprovalRequiredForLiveActions: true,
      liveActionsDefault: "disabled"
    }
  };
}

function normalizeWebsiteUrl(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "https://acme.com";
  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withProtocol.replace(/\/+$/, "");
}

if (reset) {
  await rm(target, { recursive: true, force: true });
}

const business = createBusinessProfile();

await mkdir(path.join(target, "activity"), { recursive: true });
await mkdir(path.join(target, "customer-inquiries"), { recursive: true });
await mkdir(path.join(target, "estimates"), { recursive: true });
await mkdir(path.join(target, "extensions"), { recursive: true });
await mkdir(path.join(target, "launch"), { recursive: true });
await mkdir(path.join(target, "settings"), { recursive: true });

await writeFile(
  path.join(target, "business.json"),
  `${JSON.stringify(business, null, 2)}\n`
);
await writeFile(
  path.join(target, "settings", "integrations.md"),
  integrationSettings()
);
await writeFile(
  path.join(target, "activity", "activity-log.md"),
  activityLog(business)
);
await writeFile(
  path.join(target, "launch", "launch-checklist.md"),
  launchChecklist(business)
);
await writeFile(
  path.join(target, "customer-inquiries", "README.md"),
  customerDeskReadme(business)
);
await writeFile(
  path.join(target, "estimates", "README.md"),
  estimatesReadme(business)
);
await writeFile(
  path.join(target, "extensions", "README.md"),
  extensionsReadme(business)
);

if (!skipWebsite) {
  await renderWebsite();
}

console.log(`Bootstrapped Frontsmith business workspace for ${business.businessName}`);
console.log(`Workspace root: ${target}`);
console.log(
  skipWebsite
    ? "Next: npm run update:website"
    : "Website ready: website/"
);

function integrationSettings() {
  return `# Integration Settings

Status: draft only

## Default v1.0 Integrations

- Vercel: deploy website after approval
- Resend: deliver contact form email after domain and environment setup
- Gmail: prepare customer replies and send only after approval
- Google Drive: store business assets and proposal files
- Google Calendar: schedule consultations
- Neura: govern consequential actions in connected client mode

No integration is live by default.
`;
}

function activityLog(profile) {
  return `# Activity Log

Business: ${profile.businessName}

## Created

- Bootstrapped local Frontsmith business workspace
- Created business profile
- Created integration settings
- Created launch checklist
- Updated website from business profile

## Safety

Live actions are disabled by default. Owner approval is required before deployment, outbound customer communication, provider updates, or public changes.
`;
}

function launchChecklist(profile) {
  return `# Launch Checklist

Business: ${profile.businessName}

## Ready

- Business profile created
- Default service list created
- Service area notes created
- Website folder updated
- Customer desk folder created
- Estimate and proposal folder created

## Needs Owner Review

- Confirm business name, website URL, phone, email, city, and state
- Confirm service names and descriptions
- Confirm service area notes for launch planning
- Replace placeholder content with approved business facts where needed
- Review website before deployment
- Confirm integration settings before any live connection

## Blocked Until Approval

- Vercel deployment
- Domain connection
- Gmail sends
- Calendar booking links
- Neura connected-mode enrollment
`;
}

function customerDeskReadme(profile) {
  return `# Customer Desk

Business: ${profile.businessName}

Use this folder for incoming inquiry notes, reply drafts, follow-up notes, and owner-approved customer communication records.

Frontsmith can help prepare replies, but it should not send customer messages without explicit owner approval.
`;
}

function estimatesReadme(profile) {
  return `# Estimates And Proposals

Business: ${profile.businessName}

Use this folder for scope notes, estimate preparation drafts, proposal outlines, assumptions, and owner review notes.

Frontsmith can help structure estimate material, but it should not create final pricing unless the owner provides pricing rules or approves the final estimate.
`;
}

function extensionsReadme(profile) {
  return `# Extensions

Business: ${profile.businessName}

Use this folder for owner-reviewed plans for new tools, skills, connectors, and workflows.

Frontsmith can help define an extension path, but it should not connect providers, schedule appointments, send messages, publish, upload files, export data, or execute connected actions without explicit owner approval.
`;
}
