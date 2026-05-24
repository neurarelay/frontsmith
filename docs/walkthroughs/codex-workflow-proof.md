# Codex Workflow Walkthrough Proof

This proof shows the real Frontsmith operating loop inside Codex. It is a static walkthrough for reviewers and operators; it does not expose private business records, credentials, or live customer data.

## 1. Owner Brief

Owner prompt:

```text
Run today's Owner Brief for Acme.
```

Local command:

```bash
npm run owner:brief
```

Expected Frontsmith response:

- summarizes current business state;
- points to waiting customer reply drafts;
- points to waiting estimate drafts;
- shows launch status and integration blockers;
- names the next owner decisions.

Generated files:

- `.frontsmith/business/activity/owner-brief.md`
- `.frontsmith/business/launch/launch-status.md`
- `.frontsmith/business/settings/integrations.md`

Approval boundary:

- local-only summary;
- no email sent;
- no website deployed;
- no provider connected;
- no connected action executed.

## 2. Customer Desk Reply Draft

Owner prompt:

```text
Prepare a reply for Jamie's kitchen remodeling request. The customer wants a better layout, new cabinets, and clearer next steps.
```

Local command:

```bash
npm run prepare:reply -- --name "Jamie" --project "Kitchen Remodeling" --notes "Customer wants a better layout, new cabinets, and clearer next steps."
```

Expected Frontsmith response:

- prepares a customer-ready reply draft;
- summarizes customer context;
- lists follow-up tracking items;
- identifies send checklist items;
- names the exact approval needed before sending.

Generated files:

- `.frontsmith/business/customer-inquiries/kitchen-remodeling-reply-draft.md`

Approval boundary:

- draft only;
- nothing sent to the customer;
- no Gmail, CRM, or provider action runs.

## 3. Estimate Preparation

Owner prompt:

```text
Draft the estimate path for the kitchen remodeling request and show what still needs owner approval.
```

Local command:

```bash
npm run prepare:estimate -- --project "Kitchen Remodeling" --scope "Cabinet replacement, counter update, lighting review, and layout clarification."
```

Expected Frontsmith response:

- prepares estimate assumptions;
- lists captured scope;
- lists missing pricing inputs;
- prepares proposal outline;
- links the related customer reply draft.

Generated files:

- `.frontsmith/business/estimates/kitchen-remodeling-estimate-draft.md`

Approval boundary:

- estimate preparation only;
- no final price is created unless owner rules are provided;
- no proposal is sent.

## 4. Website Update And Preview

Owner prompt:

```text
Update the website from the current business profile and show me the changed files.
```

Local command:

```bash
npm run update:website
npm run preview:website
```

Expected Frontsmith response:

- updates `website/` from the business profile;
- writes a website review artifact;
- names changed files;
- gives a local preview path.

Generated files:

- `website/index.html`
- `website/styles.css`
- `website/script.js`
- `.frontsmith/business/launch/website-review.md`
- `.frontsmith/business/activity/latest-website-update.md`

Preview links:

- local website preview: `http://127.0.0.1:4183/`
- hosted Frontsmith demo: `https://frontsmith.neurapath.ai/`
- hosted sample website path: `https://frontsmith.neurapath.ai/website`

Approval boundary:

- local preview only;
- no deployment;
- no DNS change;
- no production contact-form test send.

## 5. Extension Planning And Connected-Action Receipt

Owner prompt:

```text
Prepare an extension plan for consultation scheduling, then prepare a dry-run connected-action receipt for the proposed calendar action.
```

Local commands:

```bash
npm run prepare:extension -- --capability "Consultation scheduling" --connector "Google Calendar" --goal "Prepare an owner-reviewed workflow for approved consultation requests."
npm run prepare:connected-action -- --action-type "calendar" --title "Create consultation hold" --target "Approved consultation request" --evidence "Owner-approved scheduling notes"
```

Expected Frontsmith response:

- creates an extension plan before implementation;
- creates a dry-run connected-action receipt;
- records Neura Registry and Relay placeholder refs;
- lists blocked adapters;
- names approval requirements before connected mode.

Generated files:

- `.frontsmith/business/extensions/consultation-scheduling-extension-plan.md`
- `.frontsmith/business/connected-actions/calendar-create-consultation-hold-receipt.md`
- `.frontsmith/business/connected-actions/calendar-create-consultation-hold-receipt.json`

Approval boundary:

- no Google Calendar action;
- no provider setup;
- no email, file upload, publishing, export, or external action;
- connected-mode Neura Relay preflight remains pending until the owner approves it.

## Verification Commands

```bash
npm run check
npm run build:demo
npm test
```

These commands verify the repo contract, hosted demo build, workflow scripts, regression proof, and local-only approval boundaries.
