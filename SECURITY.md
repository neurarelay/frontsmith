# Security Policy

## Supported Version

Frontsmith v1.0 is the current supported public release.

## Reporting Security Issues

Please report security issues through GitHub private vulnerability reporting when available, or open a minimal issue that avoids exposing secrets, customer data, or exploit details.

Do not post API keys, customer records, business data, contact-form submissions, or provider credentials in a public issue.

## Security Boundary

Frontsmith prepares drafts, previews, plans, and local files by default.

It must not silently send emails, publish websites, change DNS, contact customers, submit provider updates, schedule calendar events, or execute connected provider actions. Those actions require explicit owner approval, and connected client mode should route consequential actions through the Neura authority rail before execution.

`.frontsmith/business/` is gitignored and should remain local. Treat it as private business memory, not public project content.

