import path from "node:path";

export const defaultBusinessRoot = path.join(".frontsmith", "business");

export function businessRoot() {
  const configuredRoot = process.env.FRONTSMITH_BUSINESS_ROOT?.trim();
  return configuredRoot ? path.normalize(configuredRoot) : defaultBusinessRoot;
}

export function businessPath(...segments) {
  return path.join(businessRoot(), ...segments);
}
