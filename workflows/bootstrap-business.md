# Workflow: Bootstrap Business

Use this workflow when an operator wants to create or reset a Frontsmith business workspace.

## Operator Prompt

```text
Bootstrap my remodeling business with Frontsmith.
```

## Codex Steps

1. Confirm the business type or use the default local service blueprint.
2. Create the local business workspace under `.frontsmith/business/`.
3. Create or update the business profile.
4. Update `website/` from the business profile.
5. Create launch and website review files.
6. Report the next owner review steps.

## Safety

Do not connect live integrations, deploy websites, send emails, or change provider settings during bootstrap unless the owner explicitly approves that action.
