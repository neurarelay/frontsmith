import { access, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { businessPath, businessRoot } from "./lib/paths.mjs";

const root = businessRoot();
const business = await readBusinessProfile();
const activityDir = path.join(root, "activity");
const output = path.join(activityDir, "owner-brief.md");

await mkdir(activityDir, { recursive: true });
await writeFile(output, await ownerBrief());

console.log(`Prepared Owner Brief: ${output}`);

async function ownerBrief() {
  const [
    websiteReady,
    websiteReview,
    launchStatus,
    integrationSettings,
    replyDrafts,
    estimateDrafts
  ] = await Promise.all([
    exists(path.join("website", "index.html")),
    readOptional(businessPath("launch", "website-review.md")),
    readOptional(businessPath("launch", "launch-status.md")),
    readOptional(businessPath("settings", "integrations.md")),
    listMarkdownFiles(businessPath("customer-inquiries")),
    listMarkdownFiles(businessPath("estimates"))
  ]);

  const hasLaunchStatus = Boolean(launchStatus);
  const hasIntegrationSettings = Boolean(integrationSettings);
  const replyCount = replyDrafts.length;
  const estimateCount = estimateDrafts.length;

  const summary = [
    websiteReady ? "the website is ready for owner review" : "the website needs to be restored or updated",
    `${replyCount} customer reply ${replyCount === 1 ? "draft is" : "drafts are"} waiting`,
    `${estimateCount} estimate ${estimateCount === 1 ? "draft is" : "drafts are"} waiting`,
    hasLaunchStatus ? "launch status is current" : "launch status needs refresh",
    "live actions still need approval"
  ];

  const changed = [
    `Business profile loaded for ${business.businessName}`,
    websiteReady ? "Website source is present at `website/index.html`" : "Website source is missing",
    websiteReview ? `Website review is available at \`${displayPath(businessPath("launch", "website-review.md"))}\`` : null,
    hasLaunchStatus ? `Launch status is available at \`${displayPath(businessPath("launch", "launch-status.md"))}\`` : null,
    replyCount > 0 ? `${replyCount} customer reply ${replyCount === 1 ? "draft is" : "drafts are"} ready for review` : null,
    estimateCount > 0 ? `${estimateCount} estimate ${estimateCount === 1 ? "draft is" : "drafts are"} ready for review` : null
  ].filter(Boolean);

  const waiting = [
    websiteReady ? "Review the included website before deployment" : "Restore or update the included website",
    replyCount > 0
      ? `${replyCount} customer reply ${replyCount === 1 ? "draft needs" : "drafts need"} owner review`
      : "No customer reply drafts waiting",
    estimateCount > 0
      ? `${estimateCount} estimate ${estimateCount === 1 ? "draft needs" : "drafts need"} owner review`
      : "No estimate drafts waiting"
  ];

  const blockers = [
    hasLaunchStatus ? null : "Run `npm run launch:status` to refresh launch readiness",
    hasIntegrationSettings ? null : "Review integration settings before connected actions",
    "Live sends, deployment, provider changes, and connected mode remain blocked until owner approval"
  ].filter(Boolean);

  const approvals = [
    "Approve website copy and contact details before deployment",
    replyCount > 0
      ? `Approve customer reply before sending: \`${displayPath(replyDrafts[0])}\``
      : "Approve the next customer reply before sending",
    estimateCount > 0
      ? `Approve estimate assumptions before sending proposal material: \`${displayPath(estimateDrafts[0])}\``
      : "Approve estimate assumptions before sending proposal material",
    "Approve provider setup before enabling connected mode"
  ];

  const nextActions = [
    "Review the included website at `/website` or through `npm run preview:website`",
    replyCount > 0
      ? `Review the customer reply draft: \`${displayPath(replyDrafts[0])}\``
      : "Prepare a customer reply draft when the next inquiry arrives",
    estimateCount > 0
      ? `Review the estimate draft: \`${displayPath(estimateDrafts[0])}\``
      : "Prepare an estimate draft when scope notes are ready"
  ];

  const artifacts = [
    ["Business profile", businessPath("business.json")],
    ["Website review", websiteReview ? businessPath("launch", "website-review.md") : null],
    ["Launch status", hasLaunchStatus ? businessPath("launch", "launch-status.md") : null],
    ["Integration settings", hasIntegrationSettings ? businessPath("settings", "integrations.md") : null],
    ["Reply draft", replyDrafts[0] ?? null],
    ["Estimate draft", estimateDrafts[0] ?? null]
  ];

  return `# Owner Brief

Business: ${business.businessName}
Updated: ${new Date().toISOString()}

## Executive Summary

${business.businessName} is ready for owner review: ${sentenceList(summary)}. No live customer-facing action has been taken.

## Changed

${markdownList(changed)}

## Waiting

${markdownList(waiting)}

## Blocked

${markdownList(blockers)}

## Needs Approval

${markdownList(approvals)}

## Next Actions

${numberedList(nextActions)}

## Artifacts

${artifacts.map(([label, file]) => `- ${label}: ${file ? `\`${displayPath(file)}\`` : "not available yet"}`).join("\n")}

## Safety Boundary

This Owner Brief is local-only. It does not send emails, publish the website, change DNS, connect providers, or execute connected actions.
`;
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

async function readOptional(file) {
  try {
    return await readFile(file, "utf8");
  } catch {
    return "";
  }
}

async function listMarkdownFiles(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md") && entry.name !== "README.md")
      .map((entry) => path.join(dir, entry.name))
      .sort();
  } catch {
    return [];
  }
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

function sentenceList(items) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

function markdownList(items) {
  return items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : "- None";
}

function numberedList(items) {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}
