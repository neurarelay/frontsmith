import { access, readFile } from "node:fs/promises";

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const config = JSON.parse(await readFile("frontsmith.config.json", "utf8"));
const blueprint = JSON.parse(await readFile("blueprints/local-service/blueprint.json", "utf8"));
const readme = await readFile("README.md", "utf8");
const operatorGuide = await readFile("docs/operator/start-here.md", "utf8");
const packageSpec = await readFile("docs/product/package-spec.md", "utf8");
const architecture = await readFile("docs/product/architecture.md", "utf8");
const launchScenarios = await readFile("docs/product/launch-scenarios.md", "utf8");
const extensionGuide = await readFile("docs/developer/extension-guide.md", "utf8");

const requiredCapabilities = [
  "business-setup",
  "owner-brief",
  "website",
  "customer-desk",
  "ongoing-customer-communication",
  "estimates-proposals",
  "launch-plan",
  "activity-log",
  "settings-integrations",
  "extension-planning",
  "connected-action-receipts"
];

const requiredScripts = {
  check: "node scripts/check.mjs",
  bootstrap: "node scripts/bootstrap.mjs",
  "owner:brief": "node scripts/prepare-owner-brief.mjs",
  "prepare:reply": "node scripts/prepare-customer-reply.mjs",
  "prepare:estimate": "node scripts/prepare-estimate-draft.mjs",
  "prepare:extension": "node scripts/prepare-extension-plan.mjs",
  "prepare:connected-action": "node scripts/prepare-connected-action-receipt.mjs",
  "first-run:status": "node scripts/first-run-readiness.mjs",
  "update:website": "node scripts/update-website.mjs",
  "launch:status": "node scripts/launch-status.mjs",
  "build:demo": "node scripts/build-demo.mjs",
  "preview:demo": "node scripts/preview-demo.mjs",
  "preview:website": "node scripts/preview-website.mjs",
  "deploy:check": "node scripts/build-demo.mjs --quiet && node scripts/deploy-check.mjs",
  test: "npm run test:launch && npm run test:regression",
  "test:launch": "node tests/launch-readiness.mjs",
  "test:regression": "node tests/regression.mjs"
};

const requiredFiles = [
  "scripts/prepare-extension-plan.mjs",
  "scripts/prepare-connected-action-receipt.mjs",
  "workflows/prepare-extension-plan.md",
  "workflows/prepare-connected-action.md",
  "docs/product/launch-scenarios.md",
  "docs/developer/extension-guide.md",
  "tests/regression.mjs",
  "docs/assets/frontsmith-control-panel.png",
  "docs/assets/frontsmith-acme-website.png"
];

const requiredScenarioLabels = [
  "Business Setup",
  "Owner Brief",
  "Customer Desk",
  "Estimates and Proposals",
  "Website Update",
  "Extension Planning",
  "Launch Status",
  "Website Preview",
  "Contact Form Dry Run",
  "Hosted Control Panel Build",
  "Deployment Readiness",
  "Repo Contract"
];

for (const file of requiredFiles) {
  await assertExists(file);
}

assertEqual(packageJson.private ?? false, false, "package metadata is ready for public GitHub release");
assertEqual(packageJson.license, "MIT", "package license");
assertIncludes(packageJson.repository?.url ?? "", "github.com/neurarelay/frontsmith", "repository URL");
assertIncludes(packageJson.homepage ?? "", "frontsmith.neurapath.ai", "homepage URL");

for (const [script, command] of Object.entries(requiredScripts)) {
  assertEqual(packageJson.scripts?.[script], command, `npm script ${script}`);
}

assertEqual(config.primaryInterface, "codex", "primary interface");
assertEqual(config.deployableOutput, "website", "deployable output");
assertEqual(config.safety?.liveActionsDefault, "disabled", "live actions default");
assertEqual(config.safety?.ownerApprovalRequired, true, "owner approval required");

for (const capability of requiredCapabilities) {
  assertIncludes(config.defaultCapabilities, capability, `config capability ${capability}`);
  assertIncludes(blueprint.capabilities, capability, `blueprint capability ${capability}`);
}

for (const scenario of requiredScenarioLabels) {
  assertIncludes(launchScenarios, scenario, `launch scenario ${scenario}`);
}

for (const command of [
  "npm run bootstrap",
  "npm run owner:brief",
  "npm run prepare:reply",
  "npm run prepare:estimate",
  "npm run prepare:extension",
  "npm run prepare:connected-action",
  "npm run first-run:status",
  "npm run update:website",
  "npm run launch:status",
  "npm run deploy:check",
  "npm test"
]) {
  assertIncludes(readme, command, `README command ${command}`);
}

assertIncludes(readme, "docs/assets/frontsmith-control-panel.png", "README Control Panel screenshot");
assertIncludes(readme, "docs/assets/frontsmith-acme-website.png", "README Acme website screenshot");

for (const doc of [
  ["README", readme],
  ["Operator guide", operatorGuide],
  ["Package spec", packageSpec],
  ["Architecture", architecture],
  ["Extension guide", extensionGuide],
  ["Launch scenarios", launchScenarios]
]) {
  assertSafetyBoundary(doc[1], doc[0]);
}

assertIncludes(operatorGuide, "Prepare an extension plan", "operator extension prompt");
assertIncludes(operatorGuide, "first-run-readiness.md", "operator first-run readiness output");
assertIncludes(packageSpec, "Extension Requirement", "package extension requirement");
assertIncludes(packageSpec, "Connected-Action Receipt Requirement", "package connected-action receipt requirement");
assertIncludes(architecture, ".frontsmith/business/extensions/", "architecture extension folder");
assertIncludes(extensionGuide, "Extension Planning Workflow", "developer extension workflow");
assertIncludes(extensionGuide, "Connected-Action Receipt Workflow", "developer connected-action workflow");
assertIncludes(launchScenarios, "must not send email, publish a website, change DNS, connect providers", "launch gate safety");
assertIncludes(launchScenarios, "Connected-Action Receipt", "connected-action launch scenario");

console.log("Frontsmith launch-readiness contract passed.");

async function assertExists(file) {
  try {
    await access(file);
  } catch {
    throw new Error(`Expected file to exist: ${file}`);
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`Expected ${label} to be ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
}

function assertIncludes(value, expected, label) {
  const matches = Array.isArray(value)
    ? value.includes(expected)
    : String(value ?? "").includes(expected);

  if (!matches) {
    throw new Error(`Expected ${label} to include ${expected}`);
  }
}

function assertSafetyBoundary(content, label) {
  const normalized = String(content).toLowerCase();
  for (const token of ["approval", "send", "publish"]) {
    if (!normalized.includes(token)) {
      throw new Error(`${label} must document ${token} safety boundary`);
    }
  }
}
