# Launch Scenarios

This document maps the public Frontsmith promise to runnable repo workflows. If a capability is claimed in the README or hosted Control Panel, it must have a local command, reviewable output, and regression coverage.

## Launch Gate

Frontsmith is acceptable for public GitHub release only when these checks pass:

## Connected-Action Receipt

Scenario: the owner wants to review a proposed live action before any provider adapter runs.

Command:

```bash
npm run prepare:connected-action -- --action-type "email" --title "Send consultation follow-up" --target "Customer follow-up" --evidence "Owner-provided customer notes"
```

Expected output:

- local Markdown receipt under `.frontsmith/business/connected-actions/`;
- local JSON receipt under `.frontsmith/business/connected-actions/`;
- proposed action ref;
- Neura Registry and Relay placeholder refs;
- approval gate;
- blocked adapters;
- no live provider action.

Safety: this scenario must not send email, publish a website, change DNS, create calendar events, upload files, export data, configure providers, or execute connected actions.

```bash
npm run check
npm run build:demo
CONTACT_DELIVERY_MODE=resend CONTACT_TO_EMAIL=projects@acme.com CONTACT_FROM_EMAIL="Acme <hello@acme.com>" RESEND_API_KEY=re_test_frontsmith npm run deploy:check
npm test
git diff --check
```

These commands must not send email, publish a website, change DNS, connect providers, upload files, schedule calendar events, or change repository visibility.

## Required Scenarios

| Scenario | User intent | Command | Reviewable output | Test coverage |
| --- | --- | --- | --- | --- |
| Business Setup | Create the local business workspace | `npm run bootstrap` | `.frontsmith/business/business.json`, launch checklist, integration settings, website update | `tests/regression.mjs` |
| Owner Brief | See what changed, what is waiting, what is blocked, and what needs approval | `npm run owner:brief` | `.frontsmith/business/activity/owner-brief.md` | `tests/regression.mjs` |
| Customer Desk | Prepare an owner-reviewed customer reply and follow-up state | `npm run prepare:reply` | `.frontsmith/business/customer-inquiries/*-reply-draft.md` | `tests/regression.mjs` |
| Estimates and Proposals | Prepare scope, missing information, questions, and proposal outline | `npm run prepare:estimate` | `.frontsmith/business/estimates/*-estimate-draft.md` | `tests/regression.mjs` |
| Website Update | Update the committed website from the business profile | `npm run update:website` | `website/index.html`, website review note, latest website update note | `tests/regression.mjs` |
| Extension Planning | Plan a new tool, skill, connector, or workflow before live behavior | `npm run prepare:extension` | `.frontsmith/business/extensions/*-extension-plan.md` | `tests/regression.mjs` |
| Launch Status | Summarize readiness and owner blockers | `npm run launch:status` | `.frontsmith/business/launch/launch-status.md` | `tests/regression.mjs` |
| Website Preview | Serve the included website locally | `npm run preview:website` | Local HTTP preview of `website/` | `tests/regression.mjs` |
| Contact Form Dry Run | Validate the deployed contact route without sending email | `CONTACT_DELIVERY_MODE=dry-run npm run preview:website` | `/api/contact` accepts valid dry-run submissions | `tests/regression.mjs` |
| Hosted Control Panel Build | Build the evaluator Control Panel with `/website` included | `npm run build:demo` | `dist/frontsmith-demo/` | `tests/regression.mjs` |
| Deployment Readiness | Verify deployment shape and contact environment without deploying | `npm run deploy:check` | CLI readiness report | `tests/regression.mjs` |
| Repo Contract | Ensure the package, docs, scripts, workflows, and blueprint match the public promise | `npm run test:launch` | CLI launch-readiness pass | `tests/launch-readiness.mjs` |

## Claims Covered

- Set up one local service business.
- Keep private business data under `.frontsmith/business/`.
- Keep the launchable website under `website/`.
- Review an Owner Brief before lower-level work.
- Prepare ongoing Customer Desk replies and follow-up state.
- Prepare estimate and proposal drafts without inventing pricing.
- Update and preview the included website.
- Validate contact delivery without exposing provider secrets.
- Keep live sends, publishing, provider setup, uploads, scheduling, exports, and connected actions approval-gated.
- Plan extensions for tools, skills, connectors, and workflows before adding live behavior.
- Build the hosted Frontsmith Control Panel with the Acme website available at `/website`.

## Explicit Non-Goals For v1.0

Frontsmith v1.0 does not include automatic sends, automatic deployment, DNS changes, payment collection, invoices, accounting, social posting, a generic connector marketplace, or a full CRM. Those belong behind extension boundaries after the core front-office kit is stable.
