# Frontsmith Developer Guide

Frontsmith is intended to become a public open-source kit. Developer work should improve the Codex-native business kit, not turn it into a generic SaaS dashboard.

## Product Rules

- Keep the default use case focused on local service businesses.
- Keep the v1.0 default capabilities essential.
- Put nonessential capabilities behind extension boundaries.
- Keep operator-facing language clear for a small business owner.
- Keep developer-facing architecture explicit and easy to extend.
- Do not add live external actions without owner approval and a governed action path.

## Developer Areas

- Business blueprints
- Website updates
- Customer reply workflows
- Estimate and proposal workflows
- Extension planning workflows
- Integration adapters
- Neura connected-mode support
- Documentation and onboarding

## Before Opening A Pull Request

Run:

```bash
npm run check
npm test
```

Include a short explanation of the operator value, the files changed, and any safety boundary affected.
