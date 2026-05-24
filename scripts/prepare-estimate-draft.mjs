import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { businessPath, businessRoot } from "./lib/paths.mjs";

const projectType = readArg("--project") ?? "Remodeling Project";
const scope = readArg("--scope") ?? "Project scope needs owner review before pricing.";
const root = businessRoot();
const business = await readBusinessProfile();
const outputDir = path.join(root, "estimates");
const file = path.join(outputDir, `${slugify(projectType)}-estimate-draft.md`);
const relatedReplyFile = path.join(root, "customer-inquiries", `${slugify(projectType)}-reply-draft.md`);
const hasRelatedReply = await exists(relatedReplyFile);

await mkdir(outputDir, { recursive: true });
await writeFile(
  file,
  estimateDraft({
    business,
    projectType,
    scope,
    file,
    relatedReplyFile: hasRelatedReply ? relatedReplyFile : null
  })
);

console.log(`Prepared estimate draft: ${file}`);

function readArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
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

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

function estimateDraft({ business, projectType, scope, file, relatedReplyFile }) {
  return `# Estimate Preparation Draft

Business: ${business.businessName}
Project: ${projectType}
Status: Preparation draft, needs owner review, not sent
Generated: ${new Date().toISOString()}

## Executive Summary

An estimate preparation draft is ready for owner review. It organizes the known ${projectType.toLowerCase()} scope, names what is still missing before pricing, and prepares proposal language without creating a final price. Nothing has been sent.

## Scope Captured

${markdownList(scopeItems(scope))}

## Working Assumptions

- Final scope must be confirmed before pricing
- Existing conditions may affect cost, timing, and materials
- Pricing rules or owner-approved ranges are required before proposal delivery
- Owner approval is required before any estimate or proposal is sent

## Missing Before Pricing

- Site photos or site visit notes
- Approximate dimensions
- Material and finish expectations
- Timing requirements
- Budget comfort range

## Owner Questions

- Is this scope accurate enough to prepare a customer-facing confirmation?
- Should the next step be a phone consultation, site visit, or more intake questions?
- Are there approved pricing rules, ranges, exclusions, or minimum project thresholds?
- Should any services, materials, or timeline promises be excluded from the proposal?

## Proposal Outline

1. Project summary
2. Confirmed scope
3. Assumptions and exclusions
4. Materials and finish decisions still needed
5. Timeline and scheduling notes
6. Price or range only after owner-approved pricing rules
7. Next step for customer approval

## Pricing Rules

Not provided yet. Do not add a final price, range, deposit, or schedule commitment until the owner provides pricing rules or approves the estimate material.

## Recommended Next Step

Send a scope confirmation message or schedule a consultation before issuing a priced proposal.

## Needs Owner Review

- Confirm the scope is accurate
- Add pricing rules or ranges only when approved
- Confirm exclusions and assumptions
- Confirm the next customer-facing step
- Approve the final estimate or proposal before sending

## Connector Handoff

- Google Drive: collect photos, measurements, inspiration, and project files when approved
- Google Calendar: schedule a consultation or site visit when approved
- Gmail: send estimate or proposal material only after owner approval
- Future pricing skill: apply local pricing rules only after the owner provides them

## Artifacts

- Estimate draft: \`${displayPath(file)}\`
- Related reply draft: ${relatedReplyFile ? `\`${displayPath(relatedReplyFile)}\`` : "not available yet"}
- Business profile: \`${displayPath(businessPath("business.json"))}\`

## Safety Boundary

This estimate preparation draft is local-only. It does not send a proposal, quote a price, schedule a visit, upload files, or execute connected actions.
`;
}

function scopeItems(value) {
  const items = value
    .split(/[;\n,]+/)
    .map((item) => sentenceCase(item.trim().replace(/^and\s+/i, "").replace(/\.$/, "")))
    .filter(Boolean);

  return items.length > 0 ? items : [value.trim()];
}

function sentenceCase(value) {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;
}

function markdownList(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function displayPath(targetFile) {
  const normalizedFile = path.normalize(targetFile);
  const normalizedRoot = path.normalize(root);
  const relativeToBusiness = path.relative(normalizedRoot, normalizedFile);

  if (relativeToBusiness && !relativeToBusiness.startsWith("..") && !path.isAbsolute(relativeToBusiness)) {
    return toPosix(path.join(".frontsmith", "business", relativeToBusiness));
  }

  const relativeToProject = path.relative(process.cwd(), normalizedFile) || normalizedFile;
  return toPosix(relativeToProject);
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}
