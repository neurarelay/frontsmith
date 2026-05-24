# Workflow: Prepare Connected-Action Receipt

Use this workflow when the operator wants to review a proposed live action before any provider adapter is allowed to run.

## Output

Create a local connected-action receipt that gives the owner a clear review surface.

It should include:

- proposed action type, title, target, and evidence;
- local action ref;
- Neura Registry ref placeholder;
- Neura Relay Action Card ref placeholder;
- Neura Relay Decision Receipt state;
- trace ref;
- required approval checks;
- blocked adapter list;
- generated `.frontsmith/business/connected-actions/...` artifact paths;
- safety boundary.

The local command is:

```bash
npm run prepare:connected-action -- --action-type "email" --title "Send consultation follow-up" --target "Customer follow-up" --evidence "Owner-provided customer notes"
```

## Safety

Do not send email, publish a website, change DNS, create calendar events, upload files, export data, configure providers, or execute a connected action from this workflow.

The receipt is a dry-run review artifact. Live behavior can be added only after the owner approves the exact action, connector, payload, target, account, and connected-mode Neura Relay preflight.
