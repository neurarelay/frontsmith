# Operator Start Here

Frontsmith is designed to be opened in Codex.

Start with one plain instruction:

```text
Bootstrap my remodeling business with Frontsmith.
```

Codex should guide the setup, run local scripts when needed, prepare the Owner Brief, update the website, and keep the ongoing Customer Desk, replies, follow-ups, estimates, and approvals ready for owner review.

You operate Frontsmith through prompts and reviewable outputs, not through a separate SaaS dashboard. Codex is the working surface; `.frontsmith/business/` and `website/` are the source-of-truth files.

Example operating loop:

```text
Run today's Owner Brief for Acme.
Prepare a reply for Jamie's kitchen request.
Draft the estimate path and show what still needs owner approval.
Update the website services and show me the changed files.
Prepare an extension plan for consultation scheduling.
```

Each run should return a clear formatted response, point to the generated files, and stop before sending, publishing, or connecting live providers unless the owner explicitly approves that action.

## First Run

For your business, give Codex the basic facts:

```text
Set up Frontsmith for Acme.
Service areas for launch planning: Primary Service Area, Nearby Communities, Surrounding Service Area.
Services: kitchen remodeling, bathroom remodeling, living spaces.
Phone: 1-800-123-ACME.
Email: projects@acme.com.
Prepare the Owner Brief, update the website, and show me what needs review.
Prepare the first customer reply and estimate path if there is an open request.
```

Codex should create the local business workspace, prepare the Owner Brief, update `website/`, create reviewable Customer Desk and estimate files when needed, and point you to the review files.

Then run the first-run readiness check:

```bash
npm run first-run:status
```

The check writes:

```text
.frontsmith/business/launch/first-run-readiness.md
```

Use it to see which fields still look like Acme defaults, which business profile fields are customized, which workspace files exist, and which actions still need owner approval before launch.

## What You Can Do In v1.0

- Set up the business profile.
- Review first-run readiness for a real business replacing Acme defaults.
- Review the Owner Brief.
- Run ongoing customer communication through Customer Desk.
- Update the included local service business website.
- Customize services, website URL, contact information, brand voice, and launch-planning notes.
- Prepare customer reply drafts.
- Prepare estimate and proposal drafts.
- Track follow-ups and next customer steps.
- Prepare extension plans for tools, skills, connectors, and new workflows.
- Review launch readiness.
- Preview the website locally.
- Run the deployment readiness check.
- Prepare Vercel deployment after the website is explicitly approved.

## Owner Brief

The Owner Brief is the current-state summary for the business.

It should show:

- what changed since the last review;
- what customer requests need attention;
- what estimate or proposal drafts are waiting;
- what website or launch items are blocked;
- what action needs owner approval;
- what to do next.

The Owner Brief can be prepared from local Frontsmith records before any live app connection is configured.

## Customer Desk

Customer Desk is the ongoing front-office communication lane.

It should keep together:

- new inquiries and project notes;
- reply drafts;
- follow-up notes;
- estimate and proposal next steps;
- owner approval state;
- activity history.

Customer Desk is not a one-time setup step. It is the recurring operating loop after the website is live.

## Local Output

Frontsmith writes private local business data under:

```text
.frontsmith/business/
```

Important files:

```text
business.json
launch/launch-checklist.md
launch/website-review.md
activity/activity-log.md
activity/owner-brief.md
activity/latest-website-update.md
settings/integrations.md
customer-inquiries/
estimates/
extensions/
```

## Website Code

The launchable website code lives in:

```text
website/
```

Bootstrap updates that single-page website from your business profile. You can ask Codex to change sections, copy, styles, website URL, search metadata, contact details, or service content.

This is a static website, not a Next.js application. Images currently come from the business profile's media URLs. To use local approved images, place them under `website/assets/` and update the business profile media fields to `/assets/...` paths.

The hosted Frontsmith demo is separate from the business website. It opens as a Control Panel and includes the Acme website at `/website`.

## Contact Form

The contact form is wired for real deployed delivery through `/api/contact`.

For production, configure the business-owned Resend account and Vercel environment variables:

```text
CONTACT_DELIVERY_MODE=resend
CONTACT_TO_EMAIL=projects@acme.com
CONTACT_FROM_EMAIL="Acme <hello@acme.com>"
CONTACT_SUBJECT_PREFIX=Website project request
FRONTSMITH_TENANT_ID=acme
RESEND_API_KEY=re_xxxxxxxxx
```

The form validates email or phone before sending. If email delivery is not configured yet, the website opens a prefilled email draft as a fallback instead of dropping the request.

## Deployment Readiness

Before any live deployment, ask Codex to run:

```bash
npm run deploy:check
```

This is a readiness gate. It checks `website/`, `vercel.json`, icons, search and social metadata, clean in-page routes, contact form API wiring, and production contact-delivery environment variables. It does not deploy, connect DNS, send email, or change provider settings.

For the hosted Control Panel target, Codex can also run:

```bash
npm run preview:demo
```

## Daily Front-Office Commands

Codex can run these tools for you:

```bash
npm run prepare:reply -- --name "Customer Name" --project "Kitchen Remodeling" --notes "Customer notes"
npm run prepare:estimate -- --project "Kitchen Remodeling" --scope "Scope notes"
npm run prepare:extension -- --capability "Consultation scheduling" --connector "Google Calendar" --goal "Prepare an owner-reviewed workflow for approved consultation requests."
npm run first-run:status
npm run owner:brief
npm run launch:status
npm run deploy:check
```

The tools write reviewable Markdown into the local business workspace. They do not send messages, publish pages, or execute live provider actions.

Deployment, email, calendar, storage, and publishing integrations stay off until the owner approves the specific live action.

## What Frontsmith Does Not Do By Default

Frontsmith v1.0 does not automatically send emails, publish websites, change DNS, post on social media, collect payments, or create invoices.

Those actions require explicit approval and, in connected client mode, governed preflight through Neura.
