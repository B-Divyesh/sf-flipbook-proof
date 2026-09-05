import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

function projectJson(count: number, name = `imported-${count}-page-study`): string {
  const now = new Date().toISOString();
  return JSON.stringify({
    version: 1,
    product: 'flipbook-proof',
    settings: {
      name, createdAt: now, updatedAt: now, sourceDuration: 2, start: 0, end: 2, count,
      crop: { x: 0, y: 0, width: 100, height: 100 }, onionMode: 'previous', onionOpacity: 24,
      pageSize: 'A4', bindingSide: 'left', pageOrder: 'forward',
    },
    frames: Array.from({ length: count }, () => pixel),
  });
}

async function importProject(page: Page, count: number, name?: string): Promise<void> {
  await page.locator('#importProject').setInputFiles({
    name: `${name ?? 'project'}.flipbook-proof.json`,
    mimeType: 'application/json',
    buffer: Buffer.from(projectJson(count, name)),
  });
  await expect(page.locator('.frame-thumb')).toHaveCount(count);
}

test('loads a clear, accessible first screen without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle('Flipbook Proof — make printable trace sheets');
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Turn video into printable flipbook trace sheets' })).toBeVisible();
  await expect(page.getByText(/For illustrators and teachers/)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  expect(errors).toEqual([]);
});

test('legal and not-found pages have route titles and landmarks', async ({ page }) => {
  for (const [path, title] of [['/privacy/', 'Privacy — Flipbook Proof'], ['/terms/', 'Terms — Flipbook Proof'], ['/404.html', 'Page not found — Flipbook Proof']] as const) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  }
});

test('keyboard controls use visible buttons and persistent links meet the touch target', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('link', { name: 'Skip to main content' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  await expect(page.locator('#videoFile')).toHaveAttribute('tabindex', '-1');
  await expect(page.locator('#importProject')).toHaveAttribute('tabindex', '-1');
  await expect(page.getByRole('button', { name: 'Import project' })).toBeVisible();
  const shortTargets = await page.locator('.site-header a, footer a').evaluateAll((items) => items
    .filter((item) => getComputedStyle(item).display !== 'none')
    .map((item) => ({ text: item.textContent?.trim(), height: item.getBoundingClientRect().height }))
    .filter((item) => item.height > 0 && item.height < 44));
  expect(shortTargets).toEqual([]);
});

test('@claim:sample-sandbox opens realistic sample data and keeps it separate', async ({ page }) => {
  await page.goto('/demo');
  await expect(page).toHaveTitle('Demo — Flipbook Proof');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('.frame-thumb')).toHaveCount(12);
  await expect(page.locator('#frameCaption')).toHaveText('Frame 1 of 12');
  await expect(page.locator('#proofCanvas')).toHaveAttribute('aria-label', /Frame 1 of 12/);
  const databases = await page.evaluate(async () => (await indexedDB.databases()).map((database) => database.name));
  expect(databases).toContain('demo:flipbook-proof');
  expect(databases).not.toContain('flipbook-proof');
  await page.locator('#onionOpacity').fill('41');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#onionOpacity')).toHaveValue('24');
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.locator('#proofPanel')).toBeHidden();
});

test('@claim:print-proof builds a contact sheet and ordered trace pages', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('.frame-thumb')).toHaveCount(12);
  await page.locator('input[name="bindingSide"][value="right"]').check();
  await page.locator('input[name="pageOrder"][value="reverse"]').check();
  await page.evaluate(() => { window.print = () => document.body.setAttribute('data-print-invoked', 'yes'); });
  await page.getByRole('button', { name: 'Print proof / save PDF' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-print-invoked', 'yes');
  await expect(page.locator('#printRoot')).toHaveAttribute('data-binding', 'right');
  await expect(page.locator('#printRoot .contact-page')).toHaveCount(1);
  await expect(page.locator('#printRoot .trace-page')).toHaveCount(12);
  await expect(page.locator('.trace-page .print-page-number strong').first()).toHaveText('12');
  await expect(page.locator('.trace-page .print-page-number strong').last()).toHaveText('01');
  await page.emulateMedia({ media: 'print' });
  const margin = await page.locator('.binding-margin').first().evaluate((element) => {
    const style = getComputedStyle(element);
    return { width: Number.parseFloat(style.width), left: style.left, right: style.right };
  });
  expect(margin.width).toBeGreaterThan(82);
  expect(margin.width).toBeLessThan(84);
  expect(Number.parseFloat(margin.left)).toBeGreaterThan(700);
  expect(Number.parseFloat(margin.right)).toBe(0);
});

test('@claim:project-transfer exports and imports a complete project', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('.frame-thumb')).toHaveCount(12);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export project' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('classroom-pendulum-study.flipbook-proof.json');
  const stream = await download.createReadStream();
  let exported = '';
  for await (const chunk of stream) exported += chunk.toString();
  const payload = JSON.parse(exported) as { product: string; frames: string[] };
  expect(payload.product).toBe('flipbook-proof');
  expect(payload.frames).toHaveLength(12);
  expect(payload.frames.every((frame) => frame.startsWith('data:image/'))).toBe(true);
  await importProject(page, 3, 'moved-project');
  await expect(page.locator('#status')).toContainText('Imported 3 frames');
  await page.reload();
  await expect(page.locator('.frame-thumb')).toHaveCount(3);
});

test('@claim:local-only-video processes a local clip without third-party requests', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/');
  await page.locator('#videoFile').setInputFiles(new URL('../fixtures/motion.webm', import.meta.url).pathname);
  await expect(page.locator('#workspace')).toBeVisible();
  await page.locator('input[name="frameCount"][value="12"]').check();
  await page.getByRole('button', { name: 'Extract 12 frames' }).click();
  await expect(page.locator('.frame-thumb')).toHaveCount(12, { timeout: 30_000 });
  const external = requests.filter((url) => {
    const parsed = new URL(url);
    return parsed.origin !== 'http://127.0.0.1:4173';
  });
  expect(external).toEqual([]);
});

test('@claim:offline-reload keeps the sample proof available offline', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto('http://127.0.0.1:4173/demo');
    await expect(page.locator('.frame-thumb')).toHaveCount(12);
    await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, null, { timeout: 15_000 }).catch(async () => {
      await page.reload();
      await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
    });
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Offline · local tools ready')).toBeVisible();
    await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
    await expect(page.locator('.frame-thumb')).toHaveCount(12);
  } finally {
    await context.close();
  }
});

test('@claim:project-persistence keeps proof settings after reload', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('.frame-thumb')).toHaveCount(12);
  await page.locator('#onionOpacity').fill('37');
  await page.locator('input[name="bindingSide"][value="right"]').check();
  await page.locator('input[name="pageOrder"][value="reverse"]').check();
  await expect.poll(() => page.evaluate(async () => {
    const request = indexedDB.open('demo:flipbook-proof');
    return await new Promise<number>((resolve) => { request.onsuccess = () => {
      const get = request.result.transaction('projects').objectStore('projects').get('current');
      get.onsuccess = () => resolve(get.result?.settings?.onionOpacity ?? 0);
    }; });
  })).toBe(37);
  await page.reload();
  await expect(page.locator('.frame-thumb')).toHaveCount(12);
  await expect(page.locator('#onionOpacity')).toHaveValue('37');
  await expect(page.locator('input[name="bindingSide"][value="right"]')).toBeChecked();
  await expect(page.locator('input[name="pageOrder"][value="reverse"]')).toBeChecked();
});

test('@claim:free-page-limit blocks 60-page printing but keeps inspection and export', async ({ page }) => {
  await page.goto('/demo');
  await importProject(page, 24);
  await page.evaluate(() => { window.print = () => document.body.setAttribute('data-print-invoked', 'yes'); });
  await page.getByRole('button', { name: 'Print proof / save PDF' }).click();
  await expect(page.locator('#printRoot .print-page')).toHaveCount(25);
  await expect(page.locator('body')).toHaveAttribute('data-print-invoked', 'yes');
  await page.evaluate(() => document.body.removeAttribute('data-print-invoked'));
  await importProject(page, 60);
  await expect(page.locator('#printGateMessage')).toContainText('inspect and export all 60 frames for free');
  await page.locator('#filmstrip').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#frameCaption')).toHaveText('Frame 2 of 60');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export project' }).click();
  await downloadPromise;
  await page.getByRole('button', { name: 'Buy Plus to print 60 pages' }).click();
  await expect(page.locator('#printRoot .print-page')).toHaveCount(0);
  await expect(page.locator('body')).not.toHaveAttribute('data-print-invoked', 'yes');
  await expect(page.getByRole('link', { name: 'Buy Plus once · $12' })).toBeFocused();
  await expect(page.locator('.license-card details')).toHaveAttribute('open', '');
});

test('@claim:plus-page-counts allows a verified license to print 60 pages', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/flipbook-proof/verify**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null }),
  }));
  await page.goto('/demo?license=recorded-valid-token');
  await expect(page.locator('#licenseState')).toHaveText('Plus unlocked · up to 60 pages');
  await importProject(page, 60);
  await expect(page.getByRole('button', { name: 'Print proof / save PDF' })).toBeVisible();
  await page.evaluate(() => { window.print = () => document.body.setAttribute('data-print-invoked', 'yes'); });
  await page.getByRole('button', { name: 'Print proof / save PDF' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-print-invoked', 'yes');
  await expect(page.locator('#printRoot .print-page')).toHaveCount(61);
});

test('@claim:video-limits rejects invalid input and recovers with a valid short clip', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('.frame-thumb')).toHaveCount(12);
  await page.locator('#importProject').setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{broken') });
  await expect(page.locator('#status')).toContainText('could not be imported');
  await expect(page.locator('.frame-thumb')).toHaveCount(12);
  await page.locator('#videoFile').setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('not video') });
  await expect(page.locator('#status')).toContainText('does not look like a video');
  await page.locator('#videoFile').setInputFiles(new URL('../fixtures/motion.webm', import.meta.url).pathname);
  await expect(page.locator('#workspace')).toBeVisible();
  await page.locator('#sourceVideo').evaluate((element) => {
    Object.defineProperty(element, 'duration', { configurable: true, value: 60.11 });
    element.dispatchEvent(new Event('loadedmetadata'));
  });
  await expect(page.locator('#status')).toContainText(/safe limit is (30|60) seconds/);
  await page.reload();
  await page.locator('#videoFile').setInputFiles(new URL('../fixtures/motion.webm', import.meta.url).pathname);
  await expect(page.locator('#workspace')).toBeVisible();
});

test('mobile layout, text zoom, focus, and reduced motion remain usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/demo');
  await expect(page.locator('.frame-thumb')).toHaveCount(12);
  await page.locator('html').evaluate((element) => { element.style.fontSize = '200%'; });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
  await expect(page.getByRole('button', { name: 'Print proof / save PDF' })).toBeVisible();
  const transitionSeconds = await page.getByRole('button', { name: 'Print proof / save PDF' }).evaluate((element) => {
    const value = getComputedStyle(element).transitionDuration;
    return value.endsWith('ms') ? Number.parseFloat(value) / 1000 : Number.parseFloat(value);
  });
  expect(transitionSeconds).toBeLessThan(0.001);
  await page.getByRole('button', { name: 'Next frame' }).focus();
  await expect(page.getByRole('button', { name: 'Next frame' })).toBeFocused();
});

test('an invalid returned license stays locked', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/flipbook-proof/verify**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ valid: false, reason: 'invalid', expires_at: null }),
  }));
  await page.goto('/demo?license=recorded-invalid-token');
  await expect(page.locator('#licenseState')).toHaveText('License no longer active');
  await importProject(page, 60);
  await expect(page.getByRole('button', { name: 'Buy Plus to print 60 pages' })).toBeVisible();
});
