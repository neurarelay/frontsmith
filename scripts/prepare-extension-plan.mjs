import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { businessPath, businessRoot } from "./lib/paths.mjs";

const capability = readArg("--capability") ?? "Consultation scheduling";
const goal =
  readArg("--goal") ??
  "Prepare an owner-reviewed workflow for approved consultation requests.";
const connector = readArg("--connector") ?? "Google Calendar";
const root = businessRoot();
const business = await readBusinessProfile();
const outputDir = path.join(root, "extensions");
const file = path.join(outputDir, `${slugify(capability)}-extension-plan.md`);

await mkdir(outputDir, { recursive: true });
await writeFile(file, extensionPlan({ business, capability, goal, connector, file }));

console.log(`Prepared extension plan: ${file}`);

function readArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
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

function extensionPlan({ business, capability, goal, connector, file }) {
  const workflowSlug = slugify(capability);

  return `# Extension Plan

Business: ${business.businessName}
Capability: ${capability}
Status: Draft plan, needs owner review, not connected
Generated: ${new Date().toISOString()}

## Executive Summary

An extension plan is ready for owner review. It defines the workflow, skill boundary, connector boundary, approval checks, and files needed before ${capability.toLowerCase()} becomes part of the front office. No connector has been run.

## Requested Capability

- Capability: ${capability}
- Goal: ${goal}
- Connector target: ${connector}
- Default mode: dry-run and owner review first

## Workflow Boundary

- Create or update \`workflows/${workflowSlug}.md\` before adding live behavior
- Keep business-specific notes under \`.frontsmith/business/extensions/\`
- Record proposed actions in the activity log before any provider action
- Require owner approval before customer sends, publishing, scheduling, exports, uploads, or provider setup

## Skill Boundary

- Skill input: approved business profile, customer context, and owner-provided rules
- Skill output: reviewable Markdown, checklist, or draft action plan
- Skill must not invent pricing, schedule commitments, legal claims, or customer promises
- Skill must point to generated files and the exact approval needed

## Connector Boundary

- ${connector}: prepare the action path only after owner approval
- Gmail: draft or send only after owner approval
- Google Drive: store files only after owner approval
- Neura: run governed preflight before consequential connected action when connected mode is enabled

## Needs Owner Review

- Confirm ${capability.toLowerCase()} belongs in the default business workflow
- Confirm the connector, data fields, and approval rules
- Confirm what counts as a live action
- Confirm rollback or undo expectations before execution

## Implementation Checklist

- Add workflow runbook
- Add or update local script
- Add regression coverage
- Add dry-run output before live connector behavior
- Update README/operator docs only after the workflow is real

## Artifacts

- Extension plan: \`${displayPath(file)}\`
- Business profile: \`${displayPath(businessPath("business.json"))}\`

## Safety Boundary

This extension plan is local-only. It does not connect providers, send messages, publish, schedule, upload files, export data, or execute connected actions.
`;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
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
