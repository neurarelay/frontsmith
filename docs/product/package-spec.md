# Frontsmith v1.0 Package Spec

## Default Package

Frontsmith v1.0 ships as a Codex-native kit for one local service business.

Default capabilities:

1. Business Setup
2. Owner Brief
3. Website
4. Customer Desk
5. Ongoing Customer Communication
6. Estimates and Proposals
7. Launch Plan
8. Activity Log
9. Settings and Integrations
10. Extension Planning

## Required First-Run Experience

The repository should be useful within minutes:

```text
clone or download repo
open folder in Codex
ask Codex to set up the business workspace
prepare customer reply and follow-up drafts
review Owner Brief
website is updated
prepare estimate and proposal draft
preview website
review launch next steps
prepare extension plans without turning on live connectors
```

Terminal commands are implementation details. They remain available for developers, but Codex should be able to run them for an operator.

## First-Run Output

The first run should create:

- a local business workspace;
- an Owner Brief summarizing state, blockers, approvals, and next actions;
- an updated single-page website from the committed `website/` code;
- a website review note;
- customer inquiry records, reply drafts, and follow-up notes;
- estimate and proposal drafts tied back to customer context;
- a launch checklist;
- an activity log;
- integration settings with all live actions disabled.
- Customer Desk and estimate folders with review-first tooling.
- an extension planning folder and command for tools, skills, connectors, and workflows.
- a contact form delivery path that can run in dry-run locally and send through Resend after environment setup.
- a deployment readiness check that validates the website, Vercel static-site configuration, metadata, icons, assets, and contact-delivery environment shape without deploying.
- a hosted Control Panel shell that explains the operator journey and includes the sample customer-facing website.

The Owner Brief command is:

```bash
npm run owner:brief
```

The recurring Customer Desk commands are:

```bash
npm run prepare:reply
npm run prepare:estimate
```

The extension planning command is:

```bash
npm run prepare:extension
```

## Website Requirement

The default website must exist as real committed code in:

```text
website/
```

Scripts may update business-specific content in the website, but the website should be inspectable and customizable as website code from the beginning.

The default website should be complete enough for a local service business to launch after replacing local identity, contact details, core services, branding, and images. The default public website is a single-page site with anchored sections, not separate thin service and contact pages.

The contact form must have a real server-side path for deployment. Front-end JavaScript can validate and show status, but email delivery belongs in `/api/contact` with provider secrets in Vercel environment variables.

The website package must include a preflight command that can report deployment blockers without deploying, changing DNS, connecting providers, or sending email.

The Frontsmith hosted target must open as a Control Panel first. It must not make the website look like the whole product. The page should make ongoing Customer Desk operations visible before presenting the website as the first customer-facing output.

## Extension Requirement

The default kit must make extension work safe before it becomes live automation.

Frontsmith should be able to prepare an owner-reviewed extension plan for a new tool, skill, connector, or workflow. The plan must name the capability, workflow boundary, skill boundary, connector boundary, owner review items, implementation checklist, and safety boundary.

Extension planning must stay local-only. It must not connect providers, schedule appointments, send messages, publish, upload files, export data, or execute connected actions.

## Connected-Action Receipt Requirement

Frontsmith should be able to prepare a dry-run connected-action receipt before any proposed live email, publishing, file, calendar, or provider action.

The receipt must name the proposed action, target, evidence, approval gate, Neura Registry reference placeholder, Neura Relay Action Card reference placeholder, Decision Receipt state, trace reference, blocked adapters, and generated Markdown/JSON artifacts.

Connected-action receipts must stay local-only. They must not connect providers, schedule appointments, send messages, publish, upload files, export data, or execute connected actions.

## Relay Proof Map

The practical Relay proof map lives at `docs/product/relay-proof-map.md`.

It connects Frontsmith workflows to the authority-before-action question without claiming that Frontsmith runs Relay by default. Customer Desk replies, estimate preparation, website updates, launch status, extension planning, and connected-action receipts should remain owner-reviewed before any live action.

## Default Exclusions

These are excluded from the v1.0 default surface:

- broad 31-skill small-business bundle
- generic app connector marketplace
- reviews and proof library
- marketing calendar
- Instagram and Facebook
- payments
- invoices
- accounting
- invoice chasing
- hiring packet automation
- full CRM
- project management

They can become extensions after the core kit is solid.
