const SLUG = 'flipbook-proof';
const DAY = 86_400_000;
let sandboxed = false;

type Verdict = { valid: boolean; checkedAt: number };

function storageKey(kind: 'token' | 'verdict'): string {
  const base = kind === 'token' ? `sb_license:${SLUG}` : `sb_license_verdict:${SLUG}`;
  return sandboxed ? `demo:${base}` : base;
}

export function configureLicenseStorage(useDemoNamespace: boolean): void {
  sandboxed = useDemoNamespace;
}

export function checkoutUrl(): string {
  return `https://api.sociobot.in/api/v1/products/${SLUG}/checkout`;
}

export function captureReturnedLicense(): void {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return;
  localStorage.setItem(storageKey('token'), token.trim());
  localStorage.removeItem(storageKey('verdict'));
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

export function storedToken(): string | null {
  return localStorage.getItem(storageKey('token'));
}

export function isOptimisticallyUnlocked(): boolean {
  if (!storedToken()) return false;
  try {
    const verdict = JSON.parse(localStorage.getItem(storageKey('verdict')) || 'null') as Verdict | null;
    return verdict?.valid === true;
  } catch {
    return false;
  }
}

export function storeLicense(token: string): void {
  localStorage.setItem(storageKey('token'), token.trim());
  localStorage.removeItem(storageKey('verdict'));
}

export function removeLicense(): void {
  localStorage.removeItem(storageKey('token'));
  localStorage.removeItem(storageKey('verdict'));
}

export async function verifyLicense(force = false): Promise<boolean> {
  const token = storedToken();
  if (!token) return false;
  try {
    const cached = JSON.parse(localStorage.getItem(storageKey('verdict')) || 'null') as Verdict | null;
    if (!force && cached && Date.now() - cached.checkedAt < DAY) return cached.valid;
  } catch { /* recheck malformed cache */ }

  const endpoint = `https://api.sociobot.in/api/v1/products/${SLUG}/verify?license=${encodeURIComponent(token)}`;
  try {
    const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('License service unavailable');
    const result = await response.json() as { valid?: boolean };
    const valid = result.valid === true;
    localStorage.setItem(storageKey('verdict'), JSON.stringify({ valid, checkedAt: Date.now() }));
    return valid;
  } catch {
    return isOptimisticallyUnlocked();
  }
}
