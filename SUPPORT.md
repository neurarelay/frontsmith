# Support

Frontsmith is an open-source kit. The fastest support path is to open a focused GitHub issue with the command you ran, what you expected, what happened, and the relevant terminal output.

## Good Issues

Use issues for:

- first-run feedback from a fresh clone;
- agency or operator adoption feedback;
- setup problems;
- workflow command failures;
- documentation gaps;
- website preview issues;
- launch-readiness check failures;
- product gaps inside the v1.0 front-office scope.

## Not Support

Do not include private customer data, live credentials, API keys, provider account details, or real contact-form submissions in a public issue.

Frontsmith does not provide live business operations, legal advice, accounting advice, payment processing, or production deployment services by default.

## Useful Checks

Before filing an issue, run:

```bash
npm run check
npm test
```

If the issue is about the hosted Control Panel or website build, also run:

```bash
npm run build:demo
```
