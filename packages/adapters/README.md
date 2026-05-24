# Adapters

Adapters connect Frontsmith to external services.

Default v1.0 adapter targets:

- Vercel for website deployment
- Resend for contact form delivery
- Gmail for customer reply drafts and approved sends
- Google Drive for assets and documents
- Google Calendar for appointments

Adapters must support dry-run behavior before live execution. They should prepare connection and action steps by default, then execute only after explicit owner approval.
