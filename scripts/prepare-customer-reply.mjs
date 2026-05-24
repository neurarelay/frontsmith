import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { businessPath, businessRoot } from "./lib/paths.mjs";

const inquiryName = readArg("--name") ?? "New Homeowner";
const projectType = readArg("--project") ?? "Remodeling Project";
const notes = readArg("--notes") ?? "Homeowner asked for help planning the project scope and next step.";
const root = businessRoot();
const business = await readBusinessProfile();
const outputDir = path.join(root, "customer-inquiries");
const file = path.join(outputDir, `${slugify(projectType)}-reply-draft.md`);

await mkdir(outputDir, { recursive: true });
await writeFile(file, replyDraft({ business, inquiryName, projectType, notes, file }));

console.log(`Prepared customer reply draft: ${file}`);

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

function replyDraft({ business, inquiryName, projectType, notes, file }) {
  return `# Customer Desk Reply Draft

Business: ${business.businessName}
Customer: ${inquiryName}
Project: ${projectType}
Status: Draft, needs owner review, not sent
Generated: ${new Date().toISOString()}

## Executive Summary

A reply draft is ready for owner review. It acknowledges ${inquiryName}'s ${projectType.toLowerCase()} request, asks for the minimum context needed to choose the right next step, and avoids pricing, scheduling promises, or live commitments. Nothing has been sent.

## Customer Context

- Customer: ${inquiryName}
- Project: ${projectType}
- Incoming notes: ${notes}
- Business voice: ${business.brandVoice ?? "Clear, practical, respectful, and owner-approved"}

## Draft Reply

Hi ${inquiryName},

Thank you for reaching out to ${business.businessName}. We can help you think through the ${projectType.toLowerCase()} scope and identify the right next step before anything is scheduled.

To prepare a useful first conversation, please send any photos you have, the rooms or areas involved, your timing goals, and any must-have outcomes or constraints. Once we have that context, we can recommend whether the next step should be a phone consultation, site visit, or estimate preparation.

Best,
${business.businessName}

## Follow-Up Tracking

- Current state: Initial reply draft prepared
- Suggested next step: Ask for photos, affected areas, timing goals, and must-have outcomes
- Follow-up trigger: Customer sends added project context or owner approves a consultation path
- Related estimate path: Prepare an estimate draft only after scope details are clear enough for owner review

## Needs Owner Review

- Confirm the customer's name and project type
- Confirm the incoming notes are represented accurately
- Add approved scheduling details if the next step should be a consultation
- Confirm the final message before sending

## Send Checklist

- Confirm recipient and preferred channel
- Remove any claim, price, date, or promise the owner has not approved
- Add approved scheduling link, phone number, or availability only when ready
- Send only after explicit owner approval

## Connector Handoff

- Gmail: draft or send handoff only after owner approval
- Google Drive: collect customer photos and project files when approved
- Google Calendar: offer scheduling only after the consultation path is approved

## Artifacts

- Reply draft: \`${displayPath(file)}\`
- Business profile: \`${displayPath(businessPath("business.json"))}\`

## Safety Boundary

This Customer Desk draft is local-only. It does not send email, text the customer, create a calendar booking, upload files, or execute connected actions.
`;
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
