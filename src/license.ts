const SLUG = 'flipbook-proof';
const TOKEN_KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `sb_license_verdict:${SLUG}`;
const DAY = 86_400_000;

type Verdict = { valid: boolean; checkedAt: number };

export function checkoutUrl(): string {
  return `https://api.sociobot.in/api/v1/products/${SLUG}/checkout`;
}

export function captureReturnedLicense(): void {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token.trim());
  localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: true, checkedAt: 0 }));
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

export function storedToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function isOptimisticallyUnlocked(): boolean {
  if (!storedToken()) return false;
  try {
    const verdict = JSON.parse(localStorage.getItem(VERDICT_KEY) || 'null') as Verdict | null;
    return verdict?.valid !== false;
  } catch {
    return true;
  }
}

export function storeLicense(token: string): void {
  localStorage.setItem(TOKEN_KEY, token.trim());
  localStorage.removeItem(VERDICT_KEY);
}

export function removeLicense(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(VERDICT_KEY);
}

export async function verifyLicense(force = false): Promise<boolean> {
  const token = storedToken();
  if (!token) return false;
  try {
    const cached = JSON.parse(localStorage.getItem(VERDICT_KEY) || 'null') as Verdict | null;
    if (!force && cached && Date.now() - cached.checkedAt < DAY) return cached.valid;
  } catch { /* recheck malformed cache */ }

  const endpoint = `https://api.sociobot.in/api/v1/products/${SLUG}/verify?license=${encodeURIComponent(token)}`;
  try {
    const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('License service unavailable');
    const result = await response.json() as { valid?: boolean };
    const valid = result.valid === true;
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid, checkedAt: Date.now() }));
    return valid;
  } catch {
    return isOptimisticallyUnlocked();
  }
}
