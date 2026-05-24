# Workflow: Deploy Website

Use this workflow only after the website has been reviewed and approved.

## Preconditions

- website updated;
- owner reviewed business facts;
- owner approved public claims;
- contact delivery mode selected;
- Resend domain and Vercel environment variables configured if the form should send email;
- `npm run deploy:check` passes with production contact-delivery environment variables;
- domain and Vercel target confirmed;
- connected-mode decision made if governed consequential actions are enabled.

## Default Behavior

Prepare deployment steps and run dry checks first.

Do not deploy, change DNS, or connect a live provider without explicit owner approval.

## Readiness Gate

Run:

```bash
npm run deploy:check
```

The command checks the hosted demo build, included `website/` files, required icons, clean URLs, OpenGraph and Twitter metadata, local asset references, Vercel static-site configuration, `/api/contact` wiring, and required production Resend variables.

If it reports blockers, fix those before preparing a deployment. Passing the check means the code and configuration shape are ready for deployment review; it does not mean the demo or website has been deployed.

## Vercel Static Site Shape

- Frontsmith's included website is static, not Next.js.
- The hosted demo target builds into `dist/frontsmith-demo`.
- The included website remains in `website/` and is copied into the demo build at `/website/`.
- `vercel.json` sets the framework preset to Other and the output directory to `dist/frontsmith-demo`.
- Local testing uses `npm run preview:website`.
- Hosted demo testing uses `npm run preview:demo`.
- Vercel deployment remains a live external action and requires explicit owner approval.

## Contact Form Delivery

The website posts contact requests to `/api/contact`.

Production delivery uses business-owned Resend credentials by default:

```text
CONTACT_DELIVERY_MODE=resend
CONTACT_TO_EMAIL=projects@acme.com
CONTACT_FROM_EMAIL="Acme <hello@acme.com>"
CONTACT_SUBJECT_PREFIX=Website project request
FRONTSMITH_TENANT_ID=acme
RESEND_API_KEY=re_xxxxxxxxx
```

Use `CONTACT_DELIVERY_MODE=dry-run` only for local verification. If the function is missing or not configured, the website falls back to a prefilled email draft.
