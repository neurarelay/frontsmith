# Contributing to Frontsmith

Frontsmith is a Codex-native front-office kit for local service businesses. Contributions should make the kit clearer, safer, easier to run, or more useful for the narrow v1.0 front-office promise.

## Product Boundary

Frontsmith is not a hosted SaaS dashboard, full CRM, accounting system, payment product, or generic connector marketplace.

The v1.0 surface is:

- local business setup;
- Owner Brief;
- Customer Desk;
- estimate and proposal preparation;
- website updates and preview;
- launch readiness;
- extension planning;
- owner approval before live action.

Keep new work inside that boundary unless an issue explicitly proposes a larger extension.

## Local Setup

Use Node.js 20 or newer.

```bash
npm install
npm run check
npm test
```

Useful workflow checks:

```bash
npm run bootstrap -- --business-name "Acme" --website-url "https://acme.com"
npm run owner:brief
npm run prepare:reply -- --name "Customer" --project "Kitchen Remodeling" --notes "Customer wants help planning the next step."
npm run prepare:estimate -- --project "Kitchen Remodeling" --scope "Cabinets, counters, lighting, and layout clarification."
npm run prepare:extension -- --capability "Consultation scheduling" --connector "Google Calendar" --goal "Prepare an owner-reviewed workflow for approved consultation requests."
npm run update:website
npm run launch:status
```

## Safety Rules

Do not add behavior that silently sends emails, publishes websites, changes DNS, contacts customers, schedules calendar events, submits provider updates, or runs live connected actions.

Consequential actions must stay draft, preview, dry-run, or approval-gated by default.

Do not commit local business records from `.frontsmith/business/`, live credentials, customer data, or provider secrets.

## Pull Requests

Before opening a pull request, run:

```bash
npm run check
npm run build:demo
npm test
```

If your change touches deployment readiness, also run:

```bash
CONTACT_DELIVERY_MODE=resend CONTACT_TO_EMAIL=projects@acme.com CONTACT_FROM_EMAIL="Acme <hello@acme.com>" RESEND_API_KEY=re_test_frontsmith npm run deploy:check
```

That command validates configuration shape only. It must not send email or deploy.

