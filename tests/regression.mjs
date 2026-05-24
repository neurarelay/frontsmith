import { mkdtemp, readFile, rm, writeFile, access } from "node:fs/promises";
import { spawn } from "node:child_process";
import os from "node:os";
import path from "node:path";

const websiteRoot = "website";
const websiteFiles = ["index.html", "styles.css", "script.js", "frontsmith-mark.svg", "favicon.svg"];
const testPort = "4183";
const demoPort = "4184";
const testRoot = await mkdtemp(path.join(os.tmpdir(), "frontsmith-regression-"));
const root = path.join(testRoot, "business");
const testEnv = {
  ...process.env,
  FRONTSMITH_BUSINESS_ROOT: root,
  CONTACT_DELIVERY_MODE: "dry-run",
  CONTACT_TO_EMAIL: "projects@acme.com",
  CONTACT_FROM_EMAIL: "Acme <hello@acme.com>",
  CONTACT_SUBJECT_PREFIX: "Website project request",
  FRONTSMITH_TENANT_ID: "acme"
};
const deployCheckEnv = {
  ...testEnv,
  CONTACT_DELIVERY_MODE: "resend",
  RESEND_API_KEY: "re_test_frontsmith"
};
const originalWebsite = new Map();

for (const file of websiteFiles) {
  originalWebsite.set(file, await readFile(path.join(websiteRoot, file), "utf8"));
}

try {
  await run("npm", ["run", "check"]);
  await run("npm", ["run", "bootstrap"]);
  await assertExists(path.join(root, "business.json"));
  await assertExists(path.join(websiteRoot, "index.html"));
  await run("npm", ["run", "launch:status"]);

  await rm(testRoot, { recursive: true, force: true });

  await run("npm", [
    "run",
    "bootstrap",
    "--",
    "--business-name",
    "Acme",
    "--business-type",
    "Local Service Business",
    "--service-areas",
    "Primary Service Area,Nearby Communities,Surrounding Service Area",
    "--services",
    "Kitchen Remodeling,Bathroom Remodeling,Living Spaces",
    "--phone",
    "1-800-123-ACME",
    "--email",
    "projects@acme.com",
    "--website-url",
    "https://acme.com",
    "--city",
    "Local",
    "--state",
    "ST"
  ]);

  await assertExists(path.join(root, "business.json"));
  await assertExists(path.join(root, "customer-inquiries", "README.md"));
  await assertExists(path.join(root, "estimates", "README.md"));
  await assertExists(path.join(root, "extensions", "README.md"));
  await assertExists(path.join(root, "launch", "launch-checklist.md"));
  await assertExists(path.join(root, "launch", "website-review.md"));
  await assertExists(path.join(root, "settings", "integrations.md"));

  for (const file of websiteFiles) {
    await assertExists(path.join(websiteRoot, file));
  }

  const business = JSON.parse(await readFile(path.join(root, "business.json"), "utf8"));
  const vercelConfig = JSON.parse(await readFile("vercel.json", "utf8"));
  assertEqual(business.businessName, "Acme", "business name");
  assertEqual(business.contact.email, "projects@acme.com", "contact email");
  assertEqual(business.websiteUrl, "https://acme.com", "website URL");
  assertEqual(vercelConfig.outputDirectory, "dist/frontsmith-demo", "Vercel output directory");
  assertEqual(vercelConfig.framework, null, "Vercel framework");
  assertEqual(vercelConfig.buildCommand, "npm run build:demo", "Vercel build command");
  assertEqual(vercelConfig.functions["api/contact.js"].maxDuration, 10, "contact function duration");

  const homepage = await readFile(path.join(websiteRoot, "index.html"), "utf8");
  assertIncludes(homepage, "Acme", "homepage business name");
  assertIncludes(homepage, "Kitchen remodeling", "homepage kitchen service");
  assertIncludes(homepage, "Bathroom remodeling", "homepage bathroom service");
  assertIncludes(homepage, "Living spaces", "homepage living service");
  assertIncludes(homepage, "tel:18001232263", "vanity phone href");
  assertIncludes(homepage, "https://wa.me/18001232263", "vanity WhatsApp href");
  assertIncludes(homepage, "Message on WhatsApp", "WhatsApp action label");
  assertIncludes(homepage, 'rel="canonical"', "canonical metadata");
  assertIncludes(homepage, 'property="og:image"', "Open Graph image metadata");
  assertIncludes(homepage, 'name="twitter:card"', "Twitter card metadata");
  assertIncludes(homepage, 'name="twitter:image:alt"', "Twitter image alt metadata");
  assertIncludes(homepage, 'action="/api/contact"', "contact API form action");
  assertIncludes(homepage, 'data-fallback-action="mailto:projects@acme.com"', "contact mailto fallback");
  assertIncludes(homepage, 'data-intake-status', "contact status message");
  assertIncludes(homepage, "https://acme.com", "canonical URL");
  assertDoesNotInclude(homepage, ["Base", "ment"].join(""), "legacy extra service");
  assertDoesNotInclude(homepage, ".html", "extensionless website routes");
  assertNoTokens(homepage, "homepage");

  await run("npm", [
    "run",
    "prepare:reply",
    "--",
    "--name",
    "Jamie",
    "--project",
    "Kitchen Remodeling",
    "--notes",
    "Customer wants a better layout, new cabinets, and clearer next steps."
  ]);
  const replyDraftPath = path.join(root, "customer-inquiries", "kitchen-remodeling-reply-draft.md");
  await assertExists(replyDraftPath);
  const replyDraft = await readFile(replyDraftPath, "utf8");
  assertIncludes(replyDraft, "Customer Desk Reply Draft", "reply draft title");
  assertIncludes(replyDraft, "Status: Draft, needs owner review, not sent", "reply draft status");
  assertIncludes(replyDraft, "Executive Summary", "reply draft executive summary");
  assertIncludes(replyDraft, "Customer Context", "reply draft customer context");
  assertIncludes(replyDraft, "Follow-Up Tracking", "reply draft follow-up tracking");
  assertIncludes(replyDraft, "Needs Owner Review", "reply draft owner review");
  assertIncludes(replyDraft, "Send Checklist", "reply draft send checklist");
  assertIncludes(replyDraft, "Connector Handoff", "reply draft connector handoff");
  assertIncludes(replyDraft, "Artifacts", "reply draft artifacts");
  assertIncludes(
    replyDraft,
    ".frontsmith/business/customer-inquiries/kitchen-remodeling-reply-draft.md",
    "reply draft artifact path"
  );
  assertIncludes(replyDraft, "Safety Boundary", "reply draft safety boundary");
  assertIncludes(replyDraft, "Nothing has been sent", "reply draft send boundary");
  assertDoesNotInclude(replyDraft, testRoot, "reply draft temporary root path");

  await run("npm", [
    "run",
    "prepare:estimate",
    "--",
    "--project",
    "Kitchen Remodeling",
    "--scope",
    "Cabinet replacement, counter update, lighting review, and layout clarification."
  ]);
  const estimateDraftPath = path.join(root, "estimates", "kitchen-remodeling-estimate-draft.md");
  await assertExists(estimateDraftPath);
  const estimateDraft = await readFile(estimateDraftPath, "utf8");
  assertIncludes(estimateDraft, "Estimate Preparation Draft", "estimate draft title");
  assertIncludes(estimateDraft, "Status: Preparation draft, needs owner review, not sent", "estimate draft status");
  assertIncludes(estimateDraft, "Executive Summary", "estimate draft executive summary");
  assertIncludes(estimateDraft, "Scope Captured", "estimate draft scope captured");
  assertIncludes(estimateDraft, "- Cabinet replacement", "estimate draft scope item");
  assertIncludes(estimateDraft, "Missing Before Pricing", "estimate draft missing before pricing");
  assertIncludes(estimateDraft, "Owner Questions", "estimate draft owner questions");
  assertIncludes(estimateDraft, "Proposal Outline", "estimate draft proposal outline");
  assertIncludes(estimateDraft, "Pricing Rules", "estimate draft pricing rules");
  assertIncludes(estimateDraft, "Needs Owner Review", "estimate draft owner review");
  assertIncludes(estimateDraft, "Connector Handoff", "estimate draft connector handoff");
  assertIncludes(estimateDraft, "Artifacts", "estimate draft artifacts");
  assertIncludes(
    estimateDraft,
    ".frontsmith/business/estimates/kitchen-remodeling-estimate-draft.md",
    "estimate draft artifact path"
  );
  assertIncludes(
    estimateDraft,
    ".frontsmith/business/customer-inquiries/kitchen-remodeling-reply-draft.md",
    "estimate draft related reply path"
  );
  assertIncludes(estimateDraft, "Safety Boundary", "estimate draft safety boundary");
  assertIncludes(estimateDraft, "Nothing has been sent", "estimate draft send boundary");
  assertDoesNotInclude(estimateDraft, testRoot, "estimate draft temporary root path");

  await run("npm", [
    "run",
    "prepare:extension",
    "--",
    "--capability",
    "Consultation scheduling",
    "--connector",
    "Google Calendar",
    "--goal",
    "Prepare an owner-reviewed workflow for approved consultation requests."
  ]);
  const extensionPlanPath = path.join(root, "extensions", "consultation-scheduling-extension-plan.md");
  await assertExists(extensionPlanPath);
  const extensionPlan = await readFile(extensionPlanPath, "utf8");
  assertIncludes(extensionPlan, "Extension Plan", "extension plan title");
  assertIncludes(extensionPlan, "Status: Draft plan, needs owner review, not connected", "extension plan status");
  assertIncludes(extensionPlan, "Executive Summary", "extension plan executive summary");
  assertIncludes(extensionPlan, "Workflow Boundary", "extension plan workflow boundary");
  assertIncludes(extensionPlan, "Skill Boundary", "extension plan skill boundary");
  assertIncludes(extensionPlan, "Connector Boundary", "extension plan connector boundary");
  assertIncludes(extensionPlan, "Needs Owner Review", "extension plan owner review");
  assertIncludes(extensionPlan, "Implementation Checklist", "extension plan implementation checklist");
  assertIncludes(extensionPlan, ".frontsmith/business/extensions/consultation-scheduling-extension-plan.md", "extension plan artifact path");
  assertIncludes(extensionPlan, "Safety Boundary", "extension plan safety boundary");
  assertIncludes(extensionPlan, "does not connect providers", "extension plan live-action boundary");
  assertDoesNotInclude(extensionPlan, testRoot, "extension plan temporary root path");

  await run("npm", ["run", "launch:status"]);
  await assertExists(path.join(root, "launch", "launch-status.md"));

  await run("npm", ["run", "first-run:status"]);
  const firstRunReadiness = await readFile(path.join(root, "launch", "first-run-readiness.md"), "utf8");
  assertIncludes(firstRunReadiness, "First-Run Readiness", "first-run readiness title");
  assertIncludes(firstRunReadiness, "Business Profile Review", "first-run business profile review");
  assertIncludes(firstRunReadiness, "Needs Owner Input", "first-run owner input section");
  assertIncludes(firstRunReadiness, "Owner Approval Boundary", "first-run approval boundary");
  assertIncludes(firstRunReadiness, "Safety Boundary", "first-run safety boundary");
  assertIncludes(firstRunReadiness, ".frontsmith/business/launch/first-run-readiness.md", "first-run artifact path");
  assertIncludes(firstRunReadiness, "does not send emails", "first-run send boundary");
  assertDoesNotInclude(firstRunReadiness, testRoot, "first-run temporary root path");

  await run("npm", ["run", "owner:brief"]);
  await assertExists(path.join(root, "activity", "owner-brief.md"));
  const ownerBrief = await readFile(path.join(root, "activity", "owner-brief.md"), "utf8");
  assertIncludes(ownerBrief, "Owner Brief", "owner brief title");
  assertIncludes(ownerBrief, "Executive Summary", "owner brief executive summary");
  assertIncludes(ownerBrief, "Changed", "owner brief changed section");
  assertIncludes(ownerBrief, "Waiting", "owner brief waiting section");
  assertIncludes(ownerBrief, "Blocked", "owner brief blocked section");
  assertIncludes(ownerBrief, "Needs Approval", "owner brief approval section");
  assertIncludes(ownerBrief, "Next Actions", "owner brief next actions");
  assertIncludes(ownerBrief, "Artifacts", "owner brief artifacts");
  assertIncludes(ownerBrief, ".frontsmith/business/customer-inquiries/kitchen-remodeling-reply-draft.md", "owner brief reply artifact path");
  assertIncludes(ownerBrief, ".frontsmith/business/estimates/kitchen-remodeling-estimate-draft.md", "owner brief estimate artifact path");
  assertIncludes(ownerBrief, "Safety Boundary", "owner brief safety boundary");
  assertDoesNotInclude(ownerBrief, testRoot, "owner brief temporary root path");

  await run("npm", ["run", "update:website"]);
  const websiteReview = await readFile(path.join(root, "launch", "website-review.md"), "utf8");
  const websiteActivity = await readFile(path.join(root, "activity", "latest-website-update.md"), "utf8");
  assertIncludes(websiteReview, "Website Review", "website review title");
  assertIncludes(websiteReview, "Status: Preview, needs owner review, not deployed", "website review status");
  assertIncludes(websiteReview, "Executive Summary", "website review executive summary");
  assertIncludes(websiteReview, "Changed Files", "website review changed files");
  assertIncludes(websiteReview, "Updated From Business Profile", "website review business profile");
  assertIncludes(websiteReview, "Source To Website Summary", "website review source summary");
  assertIncludes(websiteReview, "Owner Review", "website review owner review");
  assertIncludes(websiteReview, "Local Preview", "website review local preview");
  assertIncludes(websiteReview, "Deployment Blockers", "website review blockers");
  assertIncludes(websiteReview, "Artifacts", "website review artifacts");
  assertIncludes(websiteReview, ".frontsmith/business/launch/website-review.md", "website review artifact path");
  assertIncludes(websiteReview, ".frontsmith/business/activity/latest-website-update.md", "website review activity path");
  assertIncludes(websiteReview, "Safety Boundary", "website review safety boundary");
  assertDoesNotInclude(websiteReview, testRoot, "website review temporary root path");
  assertIncludes(websiteActivity, "Latest Website Update", "website activity title");
  assertIncludes(websiteActivity, "Status: Local update, needs owner review", "website activity status");
  assertIncludes(websiteActivity, "Executive Summary", "website activity executive summary");
  assertIncludes(websiteActivity, "Changed Files", "website activity changed files");
  assertIncludes(websiteActivity, "Before Deployment", "website activity deployment review");
  assertIncludes(websiteActivity, "Artifacts", "website activity artifacts");
  assertIncludes(websiteActivity, "Safety Boundary", "website activity safety boundary");
  assertDoesNotInclude(websiteActivity, testRoot, "website activity temporary root path");
  await run("npm", ["run", "check"]);
  await run("npm", ["run", "deploy:check"], deployCheckEnv);
  await assertExists(path.join("dist", "frontsmith-demo", "index.html"));
  await assertExists(path.join("dist", "frontsmith-demo", "website", "index.html"));

  const demoHomepage = await readFile(path.join("dist", "frontsmith-demo", "index.html"), "utf8");
  assertTextIncludes(demoHomepage, "Set up, run, and extend your front office in Codex", "demo hero");
  assertIncludes(demoHomepage, "What Frontsmith Runs", "demo module list");
  assertIncludes(demoHomepage, "Customer Desk", "demo customer desk");
  assertIncludes(demoHomepage, 'href="/website"', "demo website preview link");
  assertIncludes(demoHomepage, "https://github.com/neurarelay/frontsmith", "demo GitHub setup path");

  const builtWebsite = await readFile(path.join("dist", "frontsmith-demo", "website", "index.html"), "utf8");
  assertIncludes(builtWebsite, 'href="/website/styles.css"', "built website stylesheet path");
  assertIncludes(builtWebsite, 'src="/website/script.js"', "built website script path");
  assertDoesNotInclude(builtWebsite, 'href="./styles.css"', "built website relative stylesheet path");

  const demoPreview = spawn("node", ["scripts/preview-demo.mjs", "--port", demoPort, "--quiet"], {
    env: testEnv,
    stdio: ["ignore", "pipe", "pipe"]
  });

  try {
    await waitForPreview(demoPreview, "Frontsmith demo preview");
    for (const route of ["/", "/website", "/styles.css", "/script.js", "/frontsmith-mark.svg", "/website/styles.css"]) {
      const response = await fetch(`http://127.0.0.1:${demoPort}${route}`);
      if (!response.ok) {
        throw new Error(`Demo preview route failed: ${route} returned ${response.status}`);
      }
    }
  } finally {
    await stopPreview(demoPreview);
  }

  const preview = spawn("node", ["scripts/preview-website.mjs", "--port", testPort], {
    env: testEnv,
    stdio: ["ignore", "pipe", "pipe"]
  });

  try {
    await waitForPreview(preview, "Frontsmith website preview");
    for (const route of ["/", "/styles.css", "/script.js", "/frontsmith-mark.svg", "/favicon.svg", "/favicon.png", "/apple-touch-icon.png"]) {
      const response = await fetch(`http://127.0.0.1:${testPort}${route}`);
      if (!response.ok) {
        throw new Error(`Preview route failed: ${route} returned ${response.status}`);
      }
      if (route.endsWith(".png") && response.headers.get("content-type") !== "image/png") {
        throw new Error(`Preview route served wrong PNG type: ${route}`);
      }
    }

    const invalidContact = await fetch(`http://127.0.0.1:${testPort}/api/contact`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "No contact" })
    });
    assertEqual(invalidContact.status, 400, "invalid contact request status");

    const validContact = await fetch(`http://127.0.0.1:${testPort}/api/contact`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Jamie",
        email: "jamie@example.com",
        phone: "",
        preferred_contact: "Email",
        project_type: "Kitchen remodeling",
        project_notes: "We want to review cabinets, counters, and lighting."
      })
    });
    const validContactBody = await validContact.json();
    assertEqual(validContact.status, 200, "valid contact request status");
    assertEqual(validContactBody.ok, true, "valid contact request result");
    assertEqual(validContactBody.id, "dry-run", "valid contact dry-run id");
  } finally {
    await stopPreview(preview);
  }

  console.log("Frontsmith regression tests passed.");
} finally {
  await restoreWebsite();
  await rm(testRoot, { recursive: true, force: true });
}

async function run(command, args, env = testEnv) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, { env, stdio: "inherit" });
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code}`));
      }
    });
    child.on("error", reject);
  });
}

async function restoreWebsite() {
  for (const [file, content] of originalWebsite.entries()) {
    await writeFile(path.join(websiteRoot, file), content);
  }
}

async function assertExists(file) {
  try {
    await access(file);
  } catch {
    throw new Error(`Expected file to exist: ${file}`);
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`Expected ${label} to be ${expected}, received ${actual}`);
  }
}

function assertIncludes(content, expected, label) {
  if (!content.includes(expected)) {
    throw new Error(`Expected ${label} to include ${expected}`);
  }
}

function assertTextIncludes(content, expected, label) {
  assertIncludes(content.replace(/&nbsp;/g, " "), expected, label);
}

function assertDoesNotInclude(content, expected, label) {
  if (content.includes(expected)) {
    throw new Error(`Expected ${label} not to include ${expected}`);
  }
}

function assertNoTokens(content, label) {
  if (/\{\{[a-zA-Z0-9]+\}\}/.test(content)) {
    throw new Error(`Unresolved website token found in ${label}`);
  }
}

async function waitForPreview(child, readyText) {
  let output = "";
  child.stdout.on("data", (chunk) => {
    output += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    output += chunk.toString();
  });

  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    if (output.includes(readyText)) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Preview server did not start. Output: ${output}`);
}

async function stopPreview(child) {
  if (child.exitCode !== null) return;
  await new Promise((resolve) => {
    child.once("close", resolve);
    child.kill("SIGTERM");
    setTimeout(resolve, 1000);
  });
}
