# Workflow: Owner Brief

Use this workflow to summarize the current state of one local service business before the owner reviews lower-level work.

## Output

Create an Owner Brief that reads like a concise Codex response for the owner, not a raw script report.

It should include:

- executive summary;
- what changed;
- what is waiting;
- what is blocked;
- what needs approval;
- what the owner should do next;
- reviewable artifacts and file paths;
- safety boundary.

Use clean Frontsmith workspace paths such as `.frontsmith/business/activity/owner-brief.md`. Do not expose temporary local test paths in the owner-facing output.

The local command is:

```bash
npm run owner:brief
```

## Inputs

Read local Frontsmith records first:

- `.frontsmith/business/business.json`;
- `.frontsmith/business/activity/`;
- `.frontsmith/business/customer-inquiries/`;
- `.frontsmith/business/estimates/`;
- `.frontsmith/business/launch/`;
- `.frontsmith/business/settings/integrations.md`;
- `website/`.

## Safety

Keep the Owner Brief local. Do not send emails, publish the website, connect providers, or execute connected actions from this workflow.
