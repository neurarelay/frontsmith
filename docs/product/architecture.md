# Architecture

Frontsmith v1.0 has these layers.

```text
Codex Interface
  -> owner prompts, Frontsmith responses, workflow runbooks, and project instructions

Business Workspace
  -> local JSON, Markdown, assets, drafts, and review notes

Owner Brief
  -> current state, blockers, approvals, and next actions

Customer Desk
  -> ongoing inquiries, reply drafts, follow-ups, estimate paths, and approvals

Website
  -> committed launchable site under website/

Hosted Demo
  -> hosted Control Panel with the website preview under /website

Automation Scripts
  -> update website, reply drafts, estimate drafts, extension plans, launch checks

Adapters
  -> Vercel, Gmail, Google Drive, Calendar, Neura
```

The first public package should prove the kit model before adding heavier connected surfaces.

The current market pattern from small-business AI workflow bundles is useful validation, but Frontsmith stays narrower: Codex-native local records, ongoing front-office workflows, and owner approval for one local service business.

## Primary Interface

The primary Frontsmith interface is Codex chat operating against the repository.

The normal loop is:

```text
owner prompt
  -> local Frontsmith records and scripts
  -> formatted Codex response
  -> reviewable Markdown/JSON artifact
  -> owner approval
  -> file update, website update, draft export, or connected preflight
```

The hosted Control Panel should demonstrate this loop. It should not imply that Frontsmith is a traditional SaaS dashboard where the owner clicks through permanent panels to run the business.

## Default Data Location

Private business data is written under:

```text
.frontsmith/business/
```

This folder is gitignored so client-specific data and local operating history do not become part of the public repository by accident.

## Owner Brief

The Owner Brief is the current-state summary for the selected business.

It should answer:

- what changed;
- what is waiting;
- what is blocked;
- what needs approval;
- what the owner should do next.

The Owner Brief should read local Frontsmith records first: business profile, website review notes, customer inquiry drafts, estimate drafts, launch checklist, activity log, integration settings, and approval records. Connected-provider signals can enrich it later only after connected mode is approved.

The local command is:

```bash
npm run owner:brief
```

## Customer Desk

Customer Desk is the ongoing operations lane after setup.

It should answer:

- what new customer requests came in;
- what reply draft is ready;
- what follow-up is waiting;
- what estimate or proposal path should be prepared;
- what owner approval is needed before any customer-facing action.

The local commands are:

```bash
npm run prepare:reply
npm run prepare:estimate
```

These commands write reviewable files under `.frontsmith/business/`. They do not send customer messages or execute connected actions.

## Extension Planning

Frontsmith can prepare dry-run plans for new tools, skills, connectors, and workflows.

The local command is:

```bash
npm run prepare:extension
```

Extension plans are written under:

```text
.frontsmith/business/extensions/
```

The plan should define the capability, workflow boundary, skill boundary, connector boundary, implementation checklist, owner review items, and safety boundary before any live provider work is added.

## Website

The committed website lives in:

```text
website/
```

Bootstrap updates this single-page website from the local business profile. There is no second website folder in the operator path.

The website is a static HTML/CSS/JavaScript surface, not a Next.js application. Local preview is handled by `npm run preview:website`, which serves the same folder.

The website is the first customer-facing output of the workspace. It is not the whole product.

## Hosted Demo

The `frontsmith.neurapath.ai` deployment target opens to the hosted Control Panel shell in:

```text
demo/
```

`npm run build:demo` copies the Control Panel shell and the committed website into:

```text
dist/frontsmith-demo/
```

The root of that build explains the Frontsmith operator journey, including ongoing Customer Desk operations. The sample Acme website is available at `/website` as the customer-facing site inside the hosted Control Panel journey.

Design rule: the hosted surface can use a polished hero and navigation, but post-hero product sections preview the Codex-native operating experience: realistic prompts, formatted Frontsmith responses, generated artifacts, repo/file references, and approval states. Static dashboard cards are acceptable only when they clarify the workflow; they should not replace the chat-driven product model.

`npm run deploy:check` is the deployment readiness gate for this hosted Control Panel shape. It verifies the demo build, included website, clean URL behavior, SEO/social metadata, icons, local asset references, contact API wiring, and production contact-delivery environment variables without deploying or contacting providers.

## Contact Delivery

The public contact form posts to the server-side function at:

```text
api/contact.js
```

The browser handles validation and user feedback. The function handles provider delivery, server-side validation, basic burst throttling, honeypot filtering, and Resend submission.

The default model is bring-your-own-provider: each business deployment owns its Resend account, sending domain, API key, Vercel environment variables, and sender reputation. A NeuraPath-managed Resend account can support a managed service tier later, but shared delivery is not the default open-source architecture.

## Operator Tools

Frontsmith v1.0 includes local scripts for the core front-office loop:

```text
bootstrap business
review Owner Brief
update website
prepare customer reply draft
prepare estimate draft
prepare extension plan
check launch status
preview website locally
check deployment readiness
build and preview hosted Control Panel
```

These tools update `website/` and write private review files into `.frontsmith/business/`.

## Consequential Actions

Consequential actions include sending messages, publishing or deploying public pages, changing provider settings, or contacting customers.

Those actions follow:

```text
draft -> preview -> owner approval -> governed preflight -> execution -> activity record
```
