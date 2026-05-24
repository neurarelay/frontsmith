# Workflow: Prepare Customer Reply

Use this workflow when a customer inquiry needs an owner-reviewed response.

## Output

Create a Customer Desk reply draft that reads like a concise Codex response and gives the owner a clear review surface.

It should include:

- acknowledges the request;
- summarizes the customer's need;
- asks only necessary clarifying questions;
- proposes a practical next step;
- tracks the follow-up state;
- includes a send checklist;
- shows the optional connector handoff after approval;
- points to the generated `.frontsmith/business/customer-inquiries/...` artifact;
- avoids making commitments the owner has not approved.

The local command is:

```bash
npm run prepare:reply -- --name "Customer Name" --project "Kitchen Remodeling" --notes "Customer notes"
```

## Safety

Do not send the email automatically. Prepare the draft for owner review.

The draft must stay local-only until the owner explicitly approves a send. Gmail, Google Drive, and Google Calendar are connector handoff options after approval, not automatic actions.
