# Frontsmith Activation Sprint

Frontsmith v1.0 is public. The next goal is not more private polish. The next goal is real use, feedback, and contribution signal from developers, agencies, and local-service operators.

## Who This Is For

- Developers who want to test a Codex-native business workflow repo.
- Agencies that build or maintain websites and front-office workflows for local service businesses.
- Operators who want a practical AI-assisted front-office workspace before connecting live accounts.

## The 10 Minute Test

Run the public repo locally:

```bash
git clone https://github.com/neurarelay/frontsmith.git
cd frontsmith
npm install
npm run check
npm run bootstrap -- --business-name "Acme" --website-url "https://acme.com"
npm run first-run:status
npm run owner:brief
```

Then test the approval boundary:

```bash
npm run prepare:connected-action -- --action-type "email" --title "Send consultation follow-up" --target "Customer follow-up" --evidence "Owner-provided customer notes"
```

Frontsmith should prepare reviewable files. It should not send an email, publish a site, change DNS, contact a customer, or run a live provider action.

## What Feedback Helps Most

Open a GitHub issue and include:

- what you tried;
- which commands passed or failed;
- what was confusing;
- whether the Owner Brief, Customer Desk, estimates, website update, or connected-action receipt would help a real local-service business;
- the one improvement that would make you more likely to use or contribute to Frontsmith.

Do not include live credentials, private customer data, API keys, provider account details, or real business records.

## Contribution Lanes

Good first contributions:

- clarify the first-run path;
- improve an operator-facing workflow doc;
- improve a generated Markdown artifact;
- make the approval-before-action boundary easier to understand;
- add focused tests for a workflow command;
- improve the agency handoff path without adding live integrations by default.

Avoid broad platform work for now. Frontsmith v1.0 is intentionally narrow: one repo, one local service business, one launchable website, front-office workflows, and explicit approval before live action.

## Sprint Targets

The activation sprint is successful when it creates:

- first-run feedback from real users;
- public GitHub issues or comments;
- forks or contribution interest;
- agency/operator objections we can turn into product requirements;
- clear evidence of where the first-run path loses people.

The point is learning from use, not announcing for its own sake.
