function normalizeUrl(value: string) {
  const withProtocol = value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;
  return withProtocol.replace(/\/+$/, "");
}

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (configuredUrl) return normalizeUrl(configuredUrl);

  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
    || process.env.VERCEL_URL?.trim();
  if (vercelUrl) return normalizeUrl(vercelUrl);

  return "http://localhost:3000";
}

export function getAuthConfirmUrl() {
  const url = new URL("/auth/confirm", `${getSiteUrl()}/`);
  return url.toString();
}
