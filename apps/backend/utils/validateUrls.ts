const GITHUB_USERNAME_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;
const LINKEDIN_USERNAME_REGEX = /^[a-zA-Z0-9À-ÖØ-öø-ÿ-]{3,100}$/;

export function normalizeUrl(raw: string): string {
  const url = new URL(raw);
  url.search = "";
  url.hash = "";
  url.pathname = url.pathname.replace(/\/+$/, "");
  url.hostname = url.hostname.toLowerCase();
  return url.toString();
}

export function extractGithubUsername(url: string): string | null {
  const { hostname, pathname } = new URL(url);
  if (hostname !== "github.com") return null;

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 1) return null;

  const username = segments[0];
  return GITHUB_USERNAME_REGEX.test(username) ? username : null;
}

export function extractLinkedinUsername(url: string): string | null {
  const { hostname, pathname } = new URL(url);
  if (!hostname.endsWith("linkedin.com")) return null;

  const segments = pathname.split("/").filter(Boolean);
  // expects /in/{username}
  if (segments.length !== 2 || segments[0] !== "in") return null;

  const username = segments[1];
  return LINKEDIN_USERNAME_REGEX.test(username) ? username : null;
}

export async function verifyGithubUser(username: string): Promise<boolean> {
  const response = await fetch(`https://api.github.com/users/${username}`, {
    headers: { "Accept": "application/vnd.github+json" },
  });
  return response.status === 200;
}
