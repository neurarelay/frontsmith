import { renderWebsite } from "./lib/render-website.mjs";

const result = await renderWebsite();

console.log(`Updated website for ${result.business.businessName}`);
console.log(`Website: ${result.websiteDir}`);
console.log(`Review: ${result.reviewDisplayPath}`);
console.log(`Activity: ${result.activityDisplayPath}`);
