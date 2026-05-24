import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { businessPath, businessRoot } from "./paths.mjs";

const websiteRoot = "website";
const websiteFiles = ["index.html"];

export async function renderWebsite() {
  const root = businessRoot();
  const profilePath = businessPath("business.json");
  const business = JSON.parse(await readRequiredFile(profilePath, missingInstanceMessage(profilePath)));
  const activityDir = path.join(root, "activity");
  const launchDir = path.join(root, "launch");
  const replacements = buildReplacements(business);

  await mkdir(websiteRoot, { recursive: true });
  await mkdir(activityDir, { recursive: true });
  await mkdir(launchDir, { recursive: true });

  await updateWebsiteFiles(replacements);

  const reviewPath = path.join(launchDir, "website-review.md");
  const activityPath = path.join(activityDir, "latest-website-update.md");

  await writeFile(reviewPath, websiteReview(business, { root }));
  await writeFile(activityPath, latestWebsiteUpdate(business, { root }));

  return {
    business,
    websiteDir: websiteRoot,
    reviewPath,
    activityPath,
    reviewDisplayPath: businessDisplayPath(root, "launch", "website-review.md"),
    activityDisplayPath: businessDisplayPath(root, "activity", "latest-website-update.md")
  };
}

async function readRequiredFile(file, message = null) {
  try {
    return await readFile(file, "utf8");
  } catch (error) {
    if (error && error.code === "ENOENT") {
      throw new Error(message ?? `Required file not found: ${file}`);
    }
    throw error;
  }
}

function missingInstanceMessage(profilePath) {
  return `No business workspace found at ${profilePath}. Run npm run bootstrap first.`;
}

function buildReplacements(business) {
  const websiteUrl = canonicalWebsiteUrl(business.websiteUrl ?? "https://acme.com");
  const socialImage = absoluteUrl(websiteUrl, business.media?.socialImage ?? business.media?.heroImage ?? defaultImages.hero);
  const brandInitials = business.businessName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

  return {
    seoTitle: escapeHtml(`${business.businessName} | Kitchen, Bath, and Living Space Remodeling`),
    seoDescription: escapeHtml(seoDescription(business)),
    canonicalUrl: escapeHtml(websiteUrl),
    ogTitle: escapeHtml(`${business.businessName} | ${displayLine(business.tagline)}`),
    ogImage: escapeHtml(socialImage),
    ogImageAlt: escapeHtml(`${business.businessName} finished remodeling interior preview`),
    businessName: escapeHtml(business.businessName),
    businessType: escapeHtml(business.businessType),
    brandTagline: escapeHtml(displayLine(business.brandTagline ?? "Crafted Home Remodeling")),
    tagline: escapeHtml(displayLine(business.tagline)),
    summary: escapeHtml(displayLine(business.summary)),
    brandInitials: escapeHtml(brandInitials),
    phone: escapeHtml(business.contact.phone),
    phoneTel: escapeHtml(`tel:${phoneHref(business.contact.phone)}`),
    whatsappHref: escapeHtml(whatsappHref(business.contact.phone)),
    email: escapeHtml(business.contact.email),
    emailMailto: escapeHtml(`mailto:${business.contact.email}`),
    city: escapeHtml(business.contact.city),
    state: escapeHtml(business.contact.state),
    cityState: escapeHtml(`${business.contact.city}, ${business.contact.state}`),
    heroImage: escapeHtml(business.media?.heroImage ?? defaultImages.hero),
    kitchenImage: escapeHtml(business.media?.kitchenImage ?? defaultImages.kitchen),
    bathroomImage: escapeHtml(business.media?.bathroomImage ?? defaultImages.bathroom),
    livingImage: escapeHtml(business.media?.livingImage ?? defaultImages.living),
    craftImage: escapeHtml(business.media?.craftImage ?? defaultImages.craft),
    faqImage: escapeHtml(business.media?.faqImage ?? defaultImages.faq),
    contactImage: escapeHtml(business.media?.contactImage ?? defaultImages.contact),
    servicesTitle: escapeHtml(`Services | ${business.businessName}`),
    servicesDescription: escapeHtml(
      `Kitchen, bathroom, and living space remodeling services from ${business.businessName}`
    ),
    contactTitle: escapeHtml(`Contact | ${business.businessName}`),
    contactDescription: escapeHtml(`Contact ${business.businessName} to discuss a remodeling project`),
    decisionIntro: escapeHtml(
      "Start with the room, goal, constraints, timing, and clean next step"
    ),
    frontOfficePromise: escapeHtml(
      `${business.businessName} helps homeowners turn early remodeling ideas into clear project requests with the right room, goals, photos, timeline, and contact path organized from the start.`
    ),
    serviceAreaIntro: escapeHtml(
      "Share the project location so availability, travel time, site visits, and scheduling can be reviewed before the next step is confirmed."
    ),
    homepageContactText: escapeHtml(
      "Start with your room, timeline, photos, and best contact path"
    ),
    contactCta: escapeHtml(`Contact ${business.businessName}`),
    servicesIntro: escapeHtml(
      "Choose the room path first"
    ),
    servicesContactText: escapeHtml(
      "Send the basic project details and review the cleanest path forward"
    ),
    contactIntro: escapeHtml(
      "Share details for the first call"
    ),
    projectTypeDefault: escapeHtml(displayServiceName(business.services[0]?.name ?? "Kitchen Remodeling")),
    serviceCards: serviceCards(business.services),
    serviceRows: serviceRows(business.services),
    serviceOptions: serviceOptions(business.services),
    serviceAreaPills: serviceAreaPills(business.serviceAreas),
    serviceAreaList: serviceAreaList(business.serviceAreas),
    currentYear: String(new Date().getFullYear())
  };
}

const defaultImages = {
  hero: "/assets/acme-hero-remodel.jpg",
  kitchen: "/assets/acme-kitchen-remodel.jpg",
  bathroom: "/assets/acme-bathroom-remodel.jpg",
  living: "/assets/acme-living-remodel.jpg",
  craft: "/assets/acme-craft-detail.jpg",
  faq: "/assets/acme-planning-faq.jpg",
  contact: "/assets/acme-contact-planning.jpg"
};

const phoneKeypad = {
  A: "2",
  B: "2",
  C: "2",
  D: "3",
  E: "3",
  F: "3",
  G: "4",
  H: "4",
  I: "4",
  J: "5",
  K: "5",
  L: "5",
  M: "6",
  N: "6",
  O: "6",
  P: "7",
  Q: "7",
  R: "7",
  S: "7",
  T: "8",
  U: "8",
  V: "8",
  W: "9",
  X: "9",
  Y: "9",
  Z: "9"
};

function phoneHref(phone) {
  let href = "";
  for (const char of String(phone).toUpperCase()) {
    if (/\d/.test(char)) href += char;
    if (char === "+" && href.length === 0) href += char;
    if (phoneKeypad[char]) href += phoneKeypad[char];
  }
  return href;
}

function whatsappHref(phone) {
  const digits = phoneHref(phone).replace(/^\+/, "");
  return digits ? `https://wa.me/${digits}` : "#contact";
}

function canonicalWebsiteUrl(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "https://acme.com";
  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withProtocol.replace(/\/+$/, "");
}

function absoluteUrl(base, value) {
  const raw = String(value ?? "").trim();
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/")) return `${base}${raw}`;
  return `${base}/${raw.replace(/^\/+/, "")}`;
}

function seoDescription(business) {
  return `${displayLine(business.summary)} from ${business.businessName} with clear scope, practical guidance, project photos, timeline, and contact options from the start`;
}

function updateWebsiteFile(content, replacements) {
  return replaceMarkedContent(replaceMarkedAttributes(content, replacements), "text", replacements)
    .replace(replacePattern("html"), (match, open, tag, key, inner, close) => {
      return `${open}${replacementFor(replacements, key)}${close}`;
    });
}

function replaceMarkedContent(content, type, replacements) {
  return content.replace(replacePattern(type), (match, open, tag, key, inner, close) => {
    return `${open}${replacementFor(replacements, key)}${close}`;
  });
}

function replacePattern(type) {
  return new RegExp(
    `(<([a-zA-Z0-9-]+)\\b(?=[^>]*\\bdata-frontsmith-${type}="([^"]+)")[^>]*>)([\\s\\S]*?)(<\\/\\2>)`,
    "g"
  );
}

function replaceMarkedAttributes(content, replacements) {
  return content.replace(/<[^>]+data-frontsmith-attrs="([^"]+)"[^>]*>/g, (tag, spec) => {
    return spec.split(",").reduce((updatedTag, instruction) => {
      const [attribute, key] = instruction.split(":").map((part) => part.trim());
      if (!attribute || !key) {
        throw new Error(`Invalid website attribute instruction: ${instruction}`);
      }
      return setAttribute(updatedTag, attribute, replacementFor(replacements, key));
    }, tag);
  });
}

function setAttribute(tag, attribute, value) {
  const pattern = new RegExp(`\\s${escapeRegExp(attribute)}="[^"]*"`);
  if (pattern.test(tag)) {
    return tag.replace(pattern, ` ${attribute}="${value}"`);
  }
  return tag.replace(/\/?>$/, (ending) => ` ${attribute}="${value}"${ending}`);
}

function replacementFor(replacements, key) {
  if (!(key in replacements)) {
    throw new Error(`Missing website replacement: ${key}`);
  }
  return replacements[key];
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function assertNoLegacyTokens(content, file) {
  if (/\{\{[a-zA-Z0-9]+\}\}/.test(content)) {
    throw new Error(`Legacy website token found in ${file}`);
  }
}

function assertHasMarkers(content, file) {
  if (!content.includes("data-frontsmith-")) {
    throw new Error(`Website file is missing Frontsmith update markers: ${file}`);
  }
}

async function readWebsiteFile(file) {
  const content = await readRequiredFile(path.join(websiteRoot, file));
  assertNoLegacyTokens(content, file);
  assertHasMarkers(content, file);
  return content;
}

async function writeWebsiteFile(file, content) {
  assertNoLegacyTokens(content, file);
  await writeFile(path.join(websiteRoot, file), content);
}

async function updateWebsiteFiles(replacements) {
  for (const file of websiteFiles) {
    const current = await readWebsiteFile(file);
    await writeWebsiteFile(file, updateWebsiteFile(current, replacements));
  }
}

function serviceCards(services) {
  const cards = services
    .map(
      (service, index) => `<article class="service-card">
            <img src="${escapeHtml(imageForService(service.name))}" alt="${escapeHtml(imageAltForService(service.name))}" />
            <div>
              <span class="item-index">${String(index + 1).padStart(2, "0")}</span>
              <h3>${escapeHtml(displayServiceName(service.name))}</h3>
              <p>${escapeHtml(service.description)}</p>
            </div>
          </article>`
    )
    .join("\n          ");
  return `\n          ${cards}\n        `;
}

function imageForService(name) {
  const normalized = String(name).toLowerCase();
  if (normalized.includes("kitchen")) return defaultImages.kitchen;
  if (normalized.includes("bath")) return defaultImages.bathroom;
  if (normalized.includes("living")) return defaultImages.living;
  return defaultImages.hero;
}

function imageAltForService(name) {
  const normalized = String(name).toLowerCase();
  if (normalized.includes("kitchen")) return "Finished kitchen remodel with bright cabinetry and counters";
  if (normalized.includes("bath")) return "Finished bathroom remodel with clean tile and fixtures";
  if (normalized.includes("living")) return "Finished living room remodel with built-in storage and soft seating";
  return "Finished remodeled living space with warm neutral materials";
}

function displayServiceName(name) {
  return String(name)
    .replace(/\bRemodeling\b/g, "remodeling")
    .replace(/\bSpaces\b/g, "spaces");
}

function serviceRows(services) {
  const rows = services
    .map(
      (service) => `<li>
            <strong>${escapeHtml(service.name)}</strong>
            <span>${escapeHtml(service.description)}</span>
          </li>`
    )
    .join("\n          ");
  return `\n          ${rows}\n        `;
}

function serviceOptions(services) {
  const serviceNames = services.map((service) => displayServiceName(service.name));
  const options = [...serviceNames, "Other"]
    .filter((name, index, names) => names.indexOf(name) === index)
    .map((service, index) => {
      const name = escapeHtml(service);
      return `<button class="custom-select-option" type="button" role="option" data-value="${name}" aria-selected="${index === 0 ? "true" : "false"}">${name}</button>`;
    })
    .join("\n                  ");
  return `\n              ${options}\n            `;
}

function serviceAreaPills(serviceAreas) {
  const pills = serviceAreas.map((area) => `<span>${escapeHtml(area)}</span>`).join("\n          ");
  return `\n          ${pills}\n        `;
}

function serviceAreaList(serviceAreas) {
  const areas = serviceAreas.map((area) => `<li>${escapeHtml(area)}</li>`).join("\n          ");
  return `\n          ${areas}\n        `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function displayLine(value) {
  return String(value).trim().replace(/[.!?]+$/g, "");
}

function websiteReview(profile, { root }) {
  return `# Website Review

Business: ${profile.businessName}
Status: Preview, needs owner review, not deployed
Updated: ${new Date().toISOString()}

## Executive Summary

The committed website was refreshed from the local business profile for ${profile.businessName}. Review the public copy, contact paths, services, service areas, search/social metadata, and contact delivery setup before deployment. No website has been deployed.

## Changed Files

- website/index.html
- ${businessDisplayPath(root, "launch", "website-review.md")}
- ${businessDisplayPath(root, "activity", "latest-website-update.md")}

## Updated From Business Profile

- Business name: ${profile.businessName}
- Website URL: ${canonicalWebsiteUrl(profile.websiteUrl)}
- Phone: ${profile.contact.phone}
- Email: ${profile.contact.email}
- Service areas: ${profile.serviceAreas.join(", ")}
- Services: ${profile.services.map((service) => service.name).join(", ")}
- Brand voice: ${profile.brandVoice}

## Source To Website Summary

- Source profile: ${businessDisplayPath(root, "business.json")}
- Public website source: website/index.html
- Launch review: ${businessDisplayPath(root, "launch", "website-review.md")}
- Activity record: ${businessDisplayPath(root, "activity", "latest-website-update.md")}

## Owner Review

- Confirm the business name, website URL, phone, email, city, and state
- Confirm service names, descriptions, and service area notes
- Confirm homepage promise, calls to action, and contact path
- Confirm no public claim overstates the business
- Confirm photos are approved for public use
- Confirm contact delivery environment variables before relying on form email

## Local Preview

1. Run \`npm run preview:website\`
2. Open the local preview URL
3. Review \`/website\` inside the hosted Control Panel build when checking the full evaluator journey

## Deployment Blockers

- Owner approval is required before deployment
- Vercel project and domain settings must be confirmed before publishing
- Resend/contact delivery environment variables must be configured before relying on form email
- DNS and provider changes remain blocked until explicitly approved

## Artifacts

- Website source: website/index.html
- Website styles: website/styles.css
- Website script: website/script.js
- Contact function: api/contact.js
- Review note: ${businessDisplayPath(root, "launch", "website-review.md")}
- Activity note: ${businessDisplayPath(root, "activity", "latest-website-update.md")}

## Safety Boundary

This website update is local-only. It does not deploy the website, change DNS, connect providers, configure Resend, or send customer messages.
`;
}

function latestWebsiteUpdate(profile, { root }) {
  return `# Latest Website Update

Business: ${profile.businessName}
Status: Local update, needs owner review
Updated: ${new Date().toISOString()}

## Executive Summary

Updated the committed website from the local business profile and wrote the launch review note. The website is ready for local preview, not deployment.

## Changed Files

- website/index.html
- ${businessDisplayPath(root, "launch", "website-review.md")}
- ${businessDisplayPath(root, "activity", "latest-website-update.md")}

## Updated

- Business identity and contact path
- Services and service area content
- Homepage copy and calls to action
- SEO, canonical, Open Graph, and Twitter metadata
- Contact form wiring remains pointed at api/contact.js

## Before Deployment

- Preview locally with \`npm run preview:website\`
- Run \`npm run deploy:check\`
- Review ${businessDisplayPath(root, "launch", "website-review.md")}
- Approve deployment, DNS, and contact delivery setup explicitly

## Artifacts

- Website source: website/index.html
- Review note: ${businessDisplayPath(root, "launch", "website-review.md")}
- Activity note: ${businessDisplayPath(root, "activity", "latest-website-update.md")}

## Safety Boundary

This update did not deploy, change DNS, configure contact delivery, or send customer messages.
`;
}

function businessDisplayPath(root, ...segments) {
  return toPosix(path.join(".frontsmith", "business", ...segments));
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}
