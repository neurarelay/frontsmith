# Frontsmith Codex Instructions

## Product Boundary

Frontsmith is a standalone open-source product.

It is not a NeuraPath website section, hosted dashboard, or Neura-branded surface. Neura can be used behind the scenes for governed consequential action, but the product must stand on its own business value.

## v1.0 Direction

Frontsmith v1.0 is a Codex-native business front-office kit.

The primary operator interface is Codex plus repository files, workflows, scripts, website code, and local business records. The hosted evaluator path at `frontsmith.neurapath.ai` may use a Control Panel that shows the Codex-native journey, with the included website shown as the customer-facing site inside that journey.

The default use case is a local service business.

The default v1.0 capabilities are:

- Business Setup
- Owner Brief
- Website
- Customer Desk
- Estimates and Proposals
- Launch Plan
- Activity Log
- Settings and Integrations
- Extension Planning

Reviews, proof libraries, marketing, social posting, payments, invoices, and accounting are not default v1.0 capabilities. Treat them as later extensions.

The Owner Brief is the product name for the current-state summary module. Use it instead of `Business Pulse`, `Front Office Pulse`, or generic pulse language.

## Execution Rules

- Preserve standalone Frontsmith value before adding Neura-specific public language.
- Keep the first use case narrow: a local service business with service, inquiry, estimate, launch, and approval workflows.
- Keep the Owner Brief narrow: state, blockers, approvals, and next actions for one business.
- Treat "run the business" as too broad for v1.0. The promise is "run the digital front office."
- The committed and deployable business website belongs under `website/`.
- The hosted Frontsmith Control Panel belongs under `demo/` and builds into `dist/frontsmith-demo`.
- `.frontsmith/business/` is for private local business data, activity, drafts, and review notes only.
- Default to draft, preview, owner approval, and dry-run before any live action.
- No live credentials, customer messages, public posts, provider submissions, DNS changes, repo publication, or external actions without explicit owner approval.
- Use direct, decisive, high-standard language.
- Do not add planning documents when existing control docs already capture the decision.

## Neura Boundary

In connected client mode:

```text
Frontsmith action
  -> Neura Registry agent identity
  -> Neura Relay preflight
  -> owner approval when required
  -> execution adapter
  -> local activity record
```

The operator-facing language should be simple: nothing goes live without review and traceable approval.

## Masterpiece Standard

Every deliverable carrying the Frontsmith name must be:

- clear enough for a small business owner;
- credible enough for developers;
- useful before Neura enrollment;
- governed by Neura when connected client mode is enabled;
- scoped tightly enough for an operator to execute without operational sprawl.
