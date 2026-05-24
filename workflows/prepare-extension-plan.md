# Workflow: Prepare Extension Plan

Use this workflow when the operator wants to add a tool, skill, connector, or new front-office workflow without turning on live behavior too early.

## Output

Create an extension plan that reads like a concise Codex response and gives the owner a clear review surface.

It should include:

- requested capability;
- workflow boundary;
- skill boundary;
- connector boundary;
- owner review items;
- implementation checklist;
- generated `.frontsmith/business/extensions/...` artifact path;
- safety boundary.

The local command is:

```bash
npm run prepare:extension -- --capability "Consultation scheduling" --connector "Google Calendar" --goal "Prepare an owner-reviewed workflow for approved consultation requests."
```

## Safety

Do not connect a provider, send a message, publish, schedule, upload, export, or execute a connected action from this workflow.

The extension plan is a dry-run planning artifact. Live connector behavior can be added only after the owner approves the workflow, data fields, action boundary, and review gate.
