# Workflow: Update Website

Use this workflow to update the website from the local business profile.

## Inputs

- business profile
- services
- contact details
- brand voice

## Website Files

```text
website/index.html
website/styles.css
website/script.js
website/frontsmith-mark.svg
```

## Operator Review

After update, Frontsmith should write a reviewable launch note and activity note:

```text
.frontsmith/business/launch/website-review.md
.frontsmith/business/activity/latest-website-update.md
```

The review output should include:

- executive summary;
- changed files;
- updated business-profile fields;
- source-to-website summary;
- local preview instructions;
- deployment blockers;
- artifacts;
- safety boundary.

Ask the owner to review:

- business name and contact information;
- service names and descriptions;
- calls to action;
- claims that should be softened or removed.

## Safety

Updating the website is local-only. It must not deploy, change DNS, configure providers, or rely on live contact delivery until the owner explicitly approves those actions.
