import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { businessPath, businessRoot } from "./lib/paths.mjs";

const root = businessRoot();
const business = await readBusinessProfile();
const actionType = readArg("--action-type") ?? "email";
const title = readArg("--title") ?? "Send consultation follow-up";
const target = readArg("--target") ?? "Customer follow-up";
const evidence = readArg("--evidence") ?? "Owner-provided customer notes";
const outputDir = businessPath("connected-actions");
const slug = slugify(`${actionType}-${title}`);
const markdownFile = path.join(outputDir, `${slug}-receipt.md`);
const jsonFile = path.join(outputDir, `${slug}-receipt.json`);
const record = connectedActionRecord({ actionType, title, target, evidence });

await mkdir(outputDir, { recursive: true });
await writeFile(jsonFile, `${JSON.stringify(record, null, 2)}\n`);
await writeFile(markdownFile, renderReceipt({ record, markdownFile, jsonFile }));

console.log(`Prepared connected-action receipt: ${markdownFile}`);
console.log("Mode: dry-run only");
console.log("Execution: blocked until owner approval and connected-mode preflight");

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

function connectedActionRecord({ actionType, title, target, evidence }) {
  const normalizedActionType = slugify(actionType);
  const normalizedTitle = slugify(title);
  const refBase = `${normalizedActionType}-${normalizedTitle}`;

  return {
    schema: "frontsmith.connected_action_receipt.v0.1",
    mode: "dry_run",
    business: {
      name: business.businessName,
      workspace: ".frontsmith/business"
    },
    proposed_action: {
      action_ref: `frontsmith-action-${refBase}`,
      type: actionType,
      title,
      target,
      evidence,
      requested_by: "owner_or_operator",
      execution_default: "blocked"
    },
    authority_refs: {
      neura_registry_ref: `registry-ref-pending-${refBase}`,
      neura_relay_action_card_ref: `relay-action-card-pending-${refBase}`,
      neura_relay_decision_receipt_ref: "pending_until_connected_mode_preflight",
      trace_ref: `frontsmith-trace-${refBase}`
    },
    approval_gate: {
      owner_approval_required: true,
      approval_status: "not_approved",
      required_before_execution: [
        "owner approval of the exact action",
        "confirmed target and payload",
        "confirmed connector and account",
        "connected-mode Neura Relay preflight when enabled",
        "receipt review before adapter execution"
      ]
    },
    adapter_boundary: {
      live_adapter_enabled: false,
      blocked_adapters: ["email", "publish", "file", "calendar", "provider_setup"],
      reason: "Frontsmith records the proposed connected action locally before any live provider action is allowed."
    },
    created_at: new Date().toISOString()
  };
}

function renderReceipt({ record, markdownFile, jsonFile }) {
  return `# Connected-Action Receipt

Business: ${record.business.name}
Status: Dry run, needs owner review, not executed
Generated: ${record.created_at}

## Executive Summary

Frontsmith prepared a local receipt-style record for a proposed connected action. No provider adapter ran. No email was sent, website was published, file was uploaded, calendar event was created, provider was configured, or external action was executed.

## Proposed Action

- Action ref: \`${record.proposed_action.action_ref}\`
- Type: ${record.proposed_action.type}
- Title: ${record.proposed_action.title}
- Target: ${record.proposed_action.target}
- Evidence: ${record.proposed_action.evidence}
- Execution default: ${record.proposed_action.execution_default}

## Neura References

- Registry ref: \`${record.authority_refs.neura_registry_ref}\`
- Relay Action Card ref: \`${record.authority_refs.neura_relay_action_card_ref}\`
- Relay Decision Receipt ref: \`${record.authority_refs.neura_relay_decision_receipt_ref}\`
- Trace ref: \`${record.authority_refs.trace_ref}\`

These refs are local placeholders until connected client mode is approved and a real Neura Relay preflight is run.

## Approval Gate

- Owner approval required: ${record.approval_gate.owner_approval_required ? "yes" : "no"}
- Approval status: ${record.approval_gate.approval_status}

Required before execution:

${record.approval_gate.required_before_execution.map((item) => `- ${item}`).join("\n")}

## Adapter Boundary

- Live adapter enabled: ${record.adapter_boundary.live_adapter_enabled ? "yes" : "no"}
- Blocked adapters: ${record.adapter_boundary.blocked_adapters.join(", ")}
- Reason: ${record.adapter_boundary.reason}

## Artifacts

- Markdown receipt: \`${displayPath(markdownFile)}\`
- JSON receipt: \`${displayPath(jsonFile)}\`
- Business profile: \`${displayPath(businessPath("business.json"))}\`

## Safety Boundary

This connected-action receipt is local-only. It does not send email, publish the website, change DNS, create calendar events, upload files, export data, configure providers, or execute connected actions.
`;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
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
