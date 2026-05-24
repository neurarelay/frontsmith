# Workflow: Prepare Estimate Draft

Use this workflow to turn inquiry notes into an estimate or proposal preparation draft.

## Output

Create an estimate preparation draft that reads like a concise Codex response and gives the owner a clear review surface.

It should include:

- scope summary;
- assumptions;
- missing information before pricing;
- owner questions;
- recommended next step;
- proposal outline;
- optional pricing-rule slot without inventing pricing;
- connector handoff options after approval;
- generated `.frontsmith/business/estimates/...` artifact path;
- related Customer Desk reply draft when available.

The local command is:

```bash
npm run prepare:estimate -- --project "Kitchen Remodeling" --scope "Scope notes"
```

## Safety

Do not produce a final price unless the owner provides pricing rules or approves the estimate.

The draft must stay local-only until the owner explicitly approves customer delivery. Google Drive, Google Calendar, Gmail, and future pricing skills are connector handoff options after approval, not automatic actions.
