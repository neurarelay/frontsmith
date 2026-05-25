# Frontsmith Relay Proof Map

Status: local proof map for reviewers and operators  
Boundary: no live provider action, no customer send, no deployment, no connected-mode execution

Frontsmith is a practical proof case for approval-before-action workflows. It shows how a local service business can use Codex to prepare useful front-office work while keeping consequential action behind owner review.

This map connects Frontsmith workflows to the Neura Relay authority question:

```text
Can the workflow prove authority before the action executes?
```

## Proof Pattern

```text
Frontsmith draft or prep artifact
  -> owner review
  -> connected-action receipt if live action is proposed
  -> optional Neura Relay preflight in connected client mode
  -> developer-owned execution or restraint
```

Frontsmith does not execute downstream actions by default. It prepares reviewable files and receipts first.

## Workflow Map

| Frontsmith workflow | Proposed consequential action | Current proof artifact | Relay authority opportunity | Execution boundary |
| --- | --- | --- | --- | --- |
| Customer Desk reply | Send a customer email or follow-up | `.frontsmith/business/customer-desk/...` reply draft | `external_email_send` | Owner must approve exact message, recipient, and send mode |
| Estimate preparation | Send estimate/proposal material | `.frontsmith/business/estimates/...` draft | `external_email_send`, `customer_data_export` | Owner must approve scope, price assumptions, files, and delivery |
| Website update | Publish changed business website content | `website/` diff and preview | `production_deploy` | Owner must approve content and deployment target |
| Launch status | Deploy site, configure domain, connect providers | `.frontsmith/business/launch/...` status artifact | `production_deploy`, `permission_change` | Owner must approve provider, account, domain, and deployment |
| Extension planning | Add email, calendar, storage, publishing, or Neura integration | `.frontsmith/business/extensions/...` plan | `permission_change`, `workflow_close`, `persistent_memory_write` | Owner must approve capability, connector, data fields, and policy |
| Connected-action receipt | Prepare a live action for email, calendar, file, publishing, provider setup, or export | `.frontsmith/business/connected-actions/...` Markdown and JSON receipt | Action-specific Relay preflight | Adapter execution remains blocked until owner approval and connected-mode preflight |

## Relay-Compatible Receipt Fields

Frontsmith connected-action receipts already make the following fields explicit enough for a Relay preflight handoff:

- proposed action type;
- target;
- evidence;
- approval gate;
- owner approval status;
- blocked adapters;
- Neura Registry reference placeholder;
- Neura Relay Action Card reference placeholder;
- Relay Decision Receipt state;
- trace reference;
- Markdown and JSON artifact paths.

## What This Proves

Frontsmith proves the practical need for pre-action authority in a real small-business workflow:

- useful AI work can happen before live execution;
- the owner can review the exact proposed action;
- the system can record a receipt-shaped artifact before an adapter runs;
- live connected actions remain blocked by default;
- Relay can be introduced as the governed preflight layer when connected mode is enabled.

## What This Does Not Claim

This map does not claim:

- Frontsmith runs Neura Relay by default;
- Frontsmith sends emails, publishes websites, uploads files, changes DNS, creates calendar events, configures providers, exports data, or executes live connected actions;
- any provider has approved, endorsed, integrated, listed, or partnered with Frontsmith or Neura;
- placeholder refs are production Relay receipts.

## Operator Check

Use the connected-action receipt command to generate the proof artifact locally:

```bash
npm run prepare:connected-action -- --action-type "email" --title "Send consultation follow-up" --target "Customer follow-up" --evidence "Owner-provided customer notes"
```

Then review:

```text
.frontsmith/business/connected-actions/
```

The generated receipt should show the proposed action, approval gate, Neura reference placeholders, blocked adapters, and no-live-action boundary before any provider adapter can run.
