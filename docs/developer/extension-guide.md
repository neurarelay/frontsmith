# Developer Extension Guide

Frontsmith is a kit with clear extension points.

## Extension Points

```text
blueprints/      business-type definitions
workflows/       Codex operating runbooks
scripts/         local automation
packages/core    shared domain model
packages/adapters provider integrations
packages/neura   governed-action integration
.frontsmith/     ignored local business workspace data
```

## Default Rule

Add business value before adding infrastructure.

If a feature does not help a local service business set up the front office, update the website, handle customers, prepare estimates, or launch cleanly, keep it out of the default package.

## Adapter Boundary

Adapters should prepare or execute external actions only after owner approval.

Examples:

- Vercel deployment adapter
- Resend contact delivery adapter
- Gmail draft/send adapter
- Google Drive asset adapter
- Google Calendar scheduling adapter
- Neura Relay preflight adapter

Dry-run behavior should exist before live execution.

## Extension Planning Workflow

Before adding a new live connector, tool, skill, or workflow, create a reviewable extension plan:

```bash
npm run prepare:extension -- --capability "Consultation scheduling" --connector "Google Calendar" --goal "Prepare an owner-reviewed workflow for approved consultation requests."
```

The plan is written under `.frontsmith/business/extensions/`. It should define the workflow boundary, skill boundary, connector boundary, owner review items, implementation checklist, and safety boundary before implementation moves into live behavior.

The default extension path must not send, publish, schedule, upload, export, or execute provider actions until the owner approves the exact live action.

## Local Testing Boundary

Regression tests should not erase `.frontsmith/business/`. Use `FRONTSMITH_BUSINESS_ROOT` when a test needs an isolated local business workspace.
